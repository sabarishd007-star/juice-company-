import { pgTable, serial, text, doublePrecision, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const carbonLogs = pgTable("carbon_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  category: text("category").notNull(),        // 'electricity' | 'travel' | 'food' | 'cloud'
  activityValue: doublePrecision("activity_value").notNull(), // e.g., 100 kWh, 50 km
  unit: text("unit").notNull(),                // 'kWh', 'km', 'kg'
  carbonEmissionsKg: doublePrecision("carbon_emissions_kg").notNull(), // Calculated CO2e in Kg
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCarbonLogSchema = createInsertSchema(carbonLogs).omit({
  id: true,
  carbonEmissionsKg: true,
  createdAt: true,
});

export type CarbonLog = typeof carbonLogs.$inferSelect;
export type InsertCarbonLog = z.infer<typeof insertCarbonLogSchema>;
