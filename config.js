/**
 * config.js — Central backend URL configuration
 *
 * HOW TO USE AFTER DEPLOYING TO RENDER:
 *   1. Replace RENDER_BACKEND_URL with your actual Render URL
 *      e.g. 'https://juice-company-backend.onrender.com'
 *   2. Push the change to GitHub — Vercel will auto-redeploy the frontend.
 */

const RENDER_BACKEND_URL = 'https://juice-company.onrender.com';

// Auto-detect: use Render backend in production, localhost in development
const BACKEND_BASE =
  RENDER_BACKEND_URL ||
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : '');  // Will be overridden once RENDER_BACKEND_URL is set

const API_BASE = `${BACKEND_BASE}/api/v1`;
const WS_URL   = BACKEND_BASE
  ? BACKEND_BASE.replace(/^http/, 'ws') + '/ws'
  : `ws://${window.location.hostname}:5000/ws`;
