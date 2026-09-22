// CO2e emission factors in kg CO2e per unit
// Sources: EPA Emission Factors for Greenhouse Gas Inventories + GHG Protocol
const EMISSION_FACTORS: Record<string, number> = {
  // Electricity (kg CO2 per kWh) — US average grid intensity
  "electricity_kwh": 0.85,
  // Transportation (kg CO2 per km)
  "car_gasoline_km": 0.192,
  "car_electric_km": 0.053,
  "flight_km": 0.255,
  "bus_km": 0.089,
  // Diet (kg CO2 per day serving)
  "meat_heavy_day": 7.19,
  "vegan_day": 2.89,
  // Cloud Infrastructure (kg CO2 per kWh of compute)
  "cloud_kwh": 0.42,
};

export function calculateEmissions(categoryKey: string, value: number): number {
  const factor = EMISSION_FACTORS[categoryKey];
  if (!factor) {
    throw new Error(`Unknown activity category: ${categoryKey}`);
  }
  return Number((value * factor).toFixed(2));
}

export function getEmissionFactors(): Record<string, number> {
  return { ...EMISSION_FACTORS };
}
