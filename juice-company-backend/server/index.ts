import "dotenv/config";
import express, { type Request, type Response } from "express";
import cors from "cors";
import { registerCarbonRoutes } from "./routes";

const app = express();
const PORT = process.env.CARBON_PORT || process.env.PORT || 5001;
const clientOrigin = process.env.CLIENT_ORIGIN || "*";

// -- Middleware ----------------------------------------------
app.use(cors({ origin: clientOrigin }));
app.use(express.json());

// -- Health Check --------------------------------------------
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "healthy",
    service: "carbon-footprint-api",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// -- Carbon Footprint API Routes -----------------------------
registerCarbonRoutes(app);

// -- Start Server --------------------------------------------
app.listen(PORT, () => {
  console.log(`?? Carbon Footprint API running on http://localhost:${PORT}`);
  console.log(`   POST   /api/carbon/log        — Log a new emission entry`);
  console.log(`   GET    /api/carbon/logs        — Get all logs for a user`);
  console.log(`   GET    /api/carbon/summary     — Get aggregated CO2 summary`);
  console.log(`   DELETE /api/carbon/log/:id     — Delete a log entry`);
  console.log(`   GET    /api/carbon/factors     — List all emission factors`);
});
