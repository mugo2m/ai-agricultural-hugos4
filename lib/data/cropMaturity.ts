// lib/data/cropMaturity.ts
// Crop maturity periods by location (months to harvest)

export interface MaturityInfo {
  min: number;      // Minimum months to harvest
  max: number;      // Maximum months to harvest
  typical: number;  // Typical months to harvest
  notes?: string;
}

export const cropMaturity: Record<string, Record<string, MaturityInfo>> = {
  // ========== CEREALS & GRAINS ==========
  maize: {
    default: { min: 3, max: 5, typical: 4 },
    kenya: { min: 3, max: 6, typical: 4 },
    uganda: { min: 3, max: 5, typical: 4 },
    tanzania: { min: 3, max: 5, typical: 4 },
    nigeria: { min: 3, max: 5, typical: 4 },
    south_africa: { min: 3, max: 5, typical: 4 }
  },
  rice: {
    default: { min: 3, max: 6, typical: 4 },
    kenya: { min: 3, max: 5, typical: 4 },
    tanzania: { min: 3, max: 5, typical: 4 },
    nigeria: { min: 3, max: 5, typical: 4 },
    egypt: { min: 4, max: 6, typical: 5 },
    spain: { min: 4, max: 6, typical: 5 }
  },
  beans: {
    default: { min: 2, max: 4, typical: 3 }
  },
  sorghum: {
    default: { min: 3, max: 5, typical: 4 }
  },
  finger_millet: {
    default: { min: 3, max: 4, typical: 3.5 }
  },

  // ========== ROOTS & TUBERS ==========
  cassava: {
    default: { min: 8, max: 12, typical: 10 },
    nigeria: { min: 8, max: 12, typical: 10 },
    ghana: { min: 8, max: 12, typical: 10 },
    kenya: { min: 8, max: 12, typical: 10 }
  },
  potatoes: {
    default: { min: 3, max: 4, typical: 3.5 },
    kenya: { min: 3, max: 4, typical: 3.5 }
  },
  sweet_potatoes: {
    default: { min: 3, max: 5, typical: 4 }
  },
  yams: {
    default: { min: 7, max: 12, typical: 9 },
    nigeria: { min: 7, max: 12, typical: 9 },
    ghana: { min: 7, max: 12, typical: 9 }
  },
  taro: {
    default: { min: 6, max: 12, typical: 8 }
  },

  // ========== VEGETABLES ==========
  tomatoes: {
    default: { min: 2, max: 4, typical: 3 }
  },
  onions: {
    default: { min: 3, max: 4, typical: 3.5 }
  },
  cabbages: {
    default: { min: 2, max: 4, typical: 3 }
  },
  kales: {
    default: { min: 2, max: 3, typical: 2.5 }
  },
  spinach: {
    default: { min: 1.5, max: 2.5, typical: 2 }
  },
  carrots: {
    default: { min: 2, max: 3, typical: 2.5 }
  },
  chillies: {
    default: { min: 2, max: 4, typical: 3 }
  },
  okra: {
    default: { min: 2, max: 3, typical: 2.5 }
  },
  capsicums: {
    default: { min: 2, max: 4, typical: 3 }
  },

  // ========== FRUITS ==========
  bananas: {
    default: { min: 9, max: 12, typical: 10 },
    uganda: { min: 9, max: 12, typical: 10 },
    kenya: { min: 9, max: 12, typical: 10 }
  },
  mangoes: {
    default: { min: 36, max: 60, typical: 48 } // 3-5 years
  },
  avocados: {
    default: { min: 36, max: 48, typical: 42 } // 3-4 years
  },
  oranges: {
    default: { min: 24, max: 36, typical: 30 } // 2-3 years
  },
  pineapples: {
    default: { min: 18, max: 24, typical: 21 } // 18-24 months
  },
  watermelons: {
    default: { min: 2, max: 3, typical: 2.5 }
  },

  // ========== CASH CROPS ==========
  coffee: {
    default: { min: 36, max: 48, typical: 42 }, // 3-4 years
    kenya: { min: 36, max: 48, typical: 42 },
    ethiopia: { min: 36, max: 48, typical: 42 },
    colombia: { min: 36, max: 48, typical: 42 }
  },
  tea: {
    default: { min: 36, max: 48, typical: 42 }, // 3-4 years
    kenya: { min: 36, max: 48, typical: 42 },
    india: { min: 36, max: 48, typical: 42 }
  },
  cocoa: {
    default: { min: 36, max: 60, typical: 48 }, // 3-5 years
    ghana: { min: 36, max: 60, typical: 48 },
    cote_divoire: { min: 36, max: 60, typical: 48 }
  },
  sugarcane: {
    default: { min: 12, max: 18, typical: 15 }, // 12-18 months
    kenya: { min: 12, max: 18, typical: 15 },
    brazil: { min: 12, max: 18, typical: 15 }
  },
  cotton: {
    default: { min: 4, max: 6, typical: 5 }
  },
  tobacco: {
    default: { min: 3, max: 4, typical: 3.5 }
  },

  // ========== NUTS ==========
  groundnuts: {
    default: { min: 3, max: 4, typical: 3.5 }
  },
  macadamia: {
    default: { min: 48, max: 60, typical: 54 } // 4-5 years
  },

  // ========== LEGUMES ==========
  soya_beans: {
    default: { min: 3, max: 4, typical: 3.5 }
  },
  cowpeas: {
    default: { min: 2, max: 3, typical: 2.5 }
  },
  green_grams: {
    default: { min: 2, max: 3, typical: 2.5 }
  },
  pigeonpeas: {
    default: { min: 4, max: 9, typical: 6 }
  },
  bambaranuts: {
    default: { min: 3, max: 4, typical: 3.5 }
  },
  french_beans: {
    default: { min: 2, max: 3, typical: 2.5 }
  },
  garden_peas: {
    default: { min: 2, max: 3, typical: 2.5 }
  },

  // ========== OIL CROPS ==========
  sunflower: {
    default: { min: 3, max: 4, typical: 3.5 }
  },
  simsim: {
    default: { min: 3, max: 4, typical: 3.5 }
  }
};

export function getCropMaturityPeriod(
  crop: string,
  country: string = 'default',
  region?: string
): number {
  const cropKey = crop.toLowerCase().replace(/\s+/g, '_');
  const cropData = cropMaturity[cropKey];

  if (!cropData) return 4; // Default 4 months

  // Try country-specific data
  const countryData = cropData[country.toLowerCase()];
  if (countryData) return countryData.typical;

  // Fallback to default
  return cropData.default?.typical || 4;
}

export function getCropMaturityRange(
  crop: string,
  country: string = 'default'
): { min: number; max: number; typical: number } {
  const cropKey = crop.toLowerCase().replace(/\s+/g, '_');
  const cropData = cropMaturity[cropKey];

  if (!cropData) return { min: 3, max: 5, typical: 4 };

  // Try country-specific data
  const countryData = cropData[country.toLowerCase()];
  if (countryData) return countryData;

  // Fallback to default
  return cropData.default || { min: 3, max: 5, typical: 4 };
}