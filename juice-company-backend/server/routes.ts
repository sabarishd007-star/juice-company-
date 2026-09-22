import type { Express, Request, Response } from "express";
import { db } from "./db";
import { carbonLogs, insertCarbonLogSchema } from "../shared/schema";
import { calculateEmissions, getEmissionFactors } from "./services/carbonCalculator";
import { eq, desc } from "drizzle-orm";

export function registerCarbonRoutes(app: Express) {

  // -- 1. Calculate & Save a Carbon Footprint Log -----------------------------
  app.post("/api/carbon/log", async (req: Request, res: Response) => {
    try {
      const parsed = insertCarbonLogSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.format() });
      }

      const { category, activityValue, unit, userId } = parsed.data;
      // Build the lookup key: e.g. "electricity_kwh", "car_gasoline_km"
      const key = `${category}_${unit.toLowerCase()}`;

      const emissions = calculateEmissions(key, activityValue);

      const [newLog] = await db
        .insert(carbonLogs)
        .values({
          userId: userId ?? 1,
          category,
          activityValue,
          unit,
          carbonEmissionsKg: emissions,
        })
        .returning();

      return res.status(201).json(newLog);
    } catch (err: any) {
      return res.status(500).json({ message: err.message || "Internal server error" });
    }
  });

  // -- 2. Retrieve All Logs for a User ----------------------------------------
  app.get("/api/carbon/logs", async (req: Request, res: Response) => {
    try {
      const userId = Number(req.query.userId) || 1;
      const logs = await db
        .select()
        .from(carbonLogs)
        .where(eq(carbonLogs.userId, userId))
        .orderBy(desc(carbonLogs.createdAt));
      return res.json(logs);
    } catch (err: any) {
      return res.status(500).json({ message: err.message || "Internal server error" });
    }
  });

  // -- 3. Get Footprint Summary Metrics ---------------------------------------
  app.get("/api/carbon/summary", async (req: Request, res: Response) => {
    try {
      const userId = Number(req.query.userId) || 1;
      const logs = await db
        .select()
        .from(carbonLogs)
        .where(eq(carbonLogs.userId, userId));

      const totalEmissions = logs.reduce((sum, log) => sum + log.carbonEmissionsKg, 0);

      const byCategory = logs.reduce((acc, log) => {
        acc[log.category] = Number(((acc[log.category] || 0) + log.carbonEmissionsKg).toFixed(2));
        return acc;
      }, {} as Record<string, number>);

      // Percentage breakdown per category
      const percentageByCategory = Object.entries(byCategory).reduce((acc, [cat, val]) => {
        acc[cat] = totalEmissions > 0
          ? Number(((val / totalEmissions) * 100).toFixed(1))
          : 0;
        return acc;
      }, {} as Record<string, number>);

      return res.json({
        totalEmissionsKg: Number(totalEmissions.toFixed(2)),
        breakdownByCategory: byCategory,
        percentageByCategory,
        totalEntries: logs.length,
        generatedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || "Internal server error" });
    }
  });

  // -- 4. Delete a Specific Log Entry -----------------------------------------
  app.delete("/api/carbon/log/:id", async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) return res.status(400).json({ message: "Invalid log ID" });

      const [deleted] = await db
        .delete(carbonLogs)
        .where(eq(carbonLogs.id, id))
        .returning();

      if (!deleted) return res.status(404).json({ message: "Log not found" });
      return res.json({ message: "Log deleted", deleted });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || "Internal server error" });
    }
  });

  // -- 5. List Supported Emission Factors -------------------------------------
  app.get("/api/carbon/factors", (_req: Request, res: Response) => {
    return res.json(getEmissionFactors());
  });
}
