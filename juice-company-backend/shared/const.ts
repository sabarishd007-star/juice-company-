export const EMISSION_CATEGORIES = [
  "electricity",
  "travel",
  "food",
  "cloud"
] as const;

export type EmissionCategory = typeof EMISSION_CATEGORIES[number];

export const SUPPORTED_UNITS: Record<EmissionCategory, string[]> = {
  electricity: ["kwh"],
  travel: ["km"],
  food: ["day"],
  cloud: ["kwh"],
};

export const DEFAULT_PAGE_SIZE = 50;
