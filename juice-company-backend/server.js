require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { WebSocketServer, WebSocket } = require('ws');

const authRoutes = require('./routes/authRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const endpointRoutes = require('./routes/endpointRoutes');
const db = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;
const clientOrigin = process.env.CLIENT_ORIGIN || '*';

// ── Middleware ─────────────────────────────────────────────
app.use(cors({ origin: clientOrigin }));
app.use(express.json());

// ── REST Routes ────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/endpoints', endpointRoutes);

// ── Health Check ───────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', uptime: process.uptime() });
});

// ── HTTP + WebSocket Server ────────────────────────────────
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

// Track connected clients
const clients = new Set();

// Broadcast helper — sends to all connected clients
function broadcast(payload) {
  const message = JSON.stringify(payload);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

// ── Alert Thresholds ───────────────────────────────────────
const THRESHOLDS = {
  latencyWarning:  25,   // ms — warn
  latencyCritical: 40,   // ms — critical
  cpuWarning:      70,   // % — warn
  cpuCritical:     85,   // % — critical
  rpsMin:          500,  // req/s — warn if drops below
};

// Track last alert times to avoid spamming (cooldown: 10 s)
const lastAlert = {};
function canAlert(key) {
  const now = Date.now();
  if (!lastAlert[key] || now - lastAlert[key] > 10000) {
    lastAlert[key] = now;
    return true;
  }
  return false;
}

// ── Telemetry Generator ────────────────────────────────────
function generateTelemetry() {
  return {
    timestamp:        new Date().toISOString(),
    reqPerSec:        Math.floor(400 + Math.random() * 800),
    avgLatencyMs:     parseFloat((10 + Math.random() * 40).toFixed(1)),
    activeConnections:Math.floor(1100 + Math.random() * 300),
    cpuUsagePercent:  parseFloat((20 + Math.random() * 70).toFixed(1)),
  };
}

// ── Check telemetry and build alert list ───────────────────
function checkAlerts(data) {
  const alerts = [];

  if (data.avgLatencyMs >= THRESHOLDS.latencyCritical && canAlert('latency-critical')) {
    alerts.push({
      type: 'error',
      title: '🔴 Critical Latency Spike',
      message: `P99 latency is ${data.avgLatencyMs} ms — far above the 40 ms threshold!`,
    });
  } else if (data.avgLatencyMs >= THRESHOLDS.latencyWarning && canAlert('latency-warn')) {
    alerts.push({
      type: 'warning',
      title: '⚠️ Latency Warning',
      message: `P99 latency hit ${data.avgLatencyMs} ms — approaching SLA limit (25 ms).`,
    });
  }

  if (data.cpuUsagePercent >= THRESHOLDS.cpuCritical && canAlert('cpu-critical')) {
    alerts.push({
      type: 'error',
      title: '🔴 CPU Critical',
      message: `CPU at ${data.cpuUsagePercent}% — auto-scale triggered!`,
    });
  } else if (data.cpuUsagePercent >= THRESHOLDS.cpuWarning && canAlert('cpu-warn')) {
    alerts.push({
      type: 'warning',
      title: '⚠️ High CPU Usage',
      message: `CPU usage is ${data.cpuUsagePercent}% — approaching limit.`,
    });
  }

  if (data.reqPerSec < THRESHOLDS.rpsMin && canAlert('rps-low')) {
    alerts.push({
      type: 'warning',
      title: '⚠️ Request Rate Drop',
      message: `Only ${data.reqPerSec} req/s — traffic dropped below minimum threshold.`,
    });
  }

  return alerts;
}

// ── Check inventory for low-stock alerts ──────────────────
function checkInventoryAlerts() {
  db.all('SELECT name, stock, capacity FROM inventory', [], (err, rows) => {
    if (err || !rows) return;
    rows.forEach(row => {
      const pct = row.stock / row.capacity;
      if (pct < 0.15 && canAlert(`stock-${row.name}`)) {
        broadcast({
          type: 'alert',
          alert: {
            type: 'warning',
            title: '📦 Low Stock Alert',
            message: `${row.name} is critically low (${row.stock} / ${row.capacity} units).`,
          }
        });
      }
    });
  });
}

// ── WebSocket Connection Handler ───────────────────────────
wss.on('connection', (ws, req) => {
  clients.add(ws);
  console.log(`[WS] Client connected. Total: ${clients.size}`);

  // Send welcome/init ping
  ws.send(JSON.stringify({ type: 'connected', message: 'WebSocket stream established.' }));

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw);
      // Support client ping for latency measurement
      if (msg.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong', ts: msg.ts }));
      }
    } catch (_) {}
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log(`[WS] Client disconnected. Total: ${clients.size}`);
  });

  ws.on('error', (err) => {
    console.error('[WS] Error:', err.message);
    clients.delete(ws);
  });
});

// ── Telemetry Broadcast Loop (every 2 s) ──────────────────
setInterval(() => {
  if (clients.size === 0) return;

  const data = generateTelemetry();
  const alerts = checkAlerts(data);

  // Broadcast telemetry frame
  broadcast({ type: 'telemetry', data });

  // Broadcast any triggered alerts
  alerts.forEach(alert => broadcast({ type: 'alert', alert }));

}, 2000);

// ── Inventory check every 30 s ────────────────────────────
setInterval(checkInventoryAlerts, 30000);

// ── Start ──────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`🚀 Juice Company Backend running on http://localhost:${PORT}`);
  console.log(`🔌 WebSocket server active at ws://localhost:${PORT}/ws`);
});
