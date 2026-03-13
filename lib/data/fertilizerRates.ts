// lib/data/fertilizerRates.ts
// Based on Bungoma Farm Management Guidelines 2017
// UPDATED: Added 15 new crops (Rice, Mangoes, Pineapples, Watermelons, Carrots, Chillies, Spinach, Pigeon Peas, Bambara Nuts, Yams, Taro, Okra, Tea, Macadamia, Cocoa)

export const fertilizerRates = {
  // ========== EXISTING CROPS ==========

  maize: {
    planting: [
      { name: "DAP", rate: 150, unit: "kg/ha", provides: { n: 27, p: 69 } },
      { name: "20:20:0", rate: 300, unit: "kg/ha", provides: { n: 60, p: 60 } },
      { name: "23:23:0", rate: 250, unit: "kg/ha", provides: { n: 57.5, p: 57.5 } }
    ],
    topdressing: [
      { name: "CAN", rate: 300, unit: "kg/ha", provides: { n: 81 } },
      { name: "UREA", rate: 150, unit: "kg/ha", provides: { n: 69 } }
    ]
  },

  beans: {
    planting: [
      { name: "DAP", rate: 250, unit: "kg/ha", provides: { n: 45, p: 115 } }
    ],
    topdressing: []
  },

  "finger millet": {
    planting: [
      { name: "DAP", rate: 50, unit: "kg/ha", provides: { n: 9, p: 23 } }
    ],
    topdressing: [
      { name: "CAN", rate: 100, unit: "kg/ha", provides: { n: 27 } }
    ]
  },

  sorghum: {
    planting: [
      { name: "DAP", rate: 50, unit: "kg/ha", provides: { n: 9, p: 23 } },
      { name: "NPK 20:20:0", rate: 180, unit: "kg/ha", provides: { n: 36, p: 36 } }
    ],
    topdressing: [
      { name: "CAN", rate: 100, unit: "kg/ha", provides: { n: 27 } }
    ]
  },

  "soya beans": {
    planting: [
      { name: "DAP", rate: 100, unit: "kg/ha", provides: { n: 18, p: 46 } }
    ],
    topdressing: []
  },

  sunflower: {
    planting: [
      { name: "DAP", rate: 100, unit: "kg/ha", provides: { n: 18, p: 46 } }
    ],
    topdressing: []
  },

  cotton: {
    planting: [
      { name: "DAP", rate: 150, unit: "kg/ha", provides: { n: 27, p: 69 } }
    ],
    topdressing: []
  },

  groundnuts: {
    planting: [
      { name: "TSP", rate: 200, unit: "kg/ha", provides: { p: 92 } }
    ],
    topdressing: []
  },

  sugarcane: {
    planting: [
      { name: "DAP", rate: 100, unit: "kg/ha", provides: { n: 18, p: 46 } }
    ],
    topdressing: [
      { name: "UREA", rate: 100, unit: "kg/ha", provides: { n: 46 } }
    ]
  },

  coffee: {
    planting: [
      { name: "DAP", rate: 100, unit: "kg/ha", provides: { n: 18, p: 46 } },
      { name: "NPK 17:17:17", rate: 150, unit: "kg/ha", provides: { n: 25.5, p: 25.5, k: 25.5 } }
    ],
    topdressing: [
      { name: "CAN", rate: 150, unit: "kg/ha", provides: { n: 40.5 } }
    ]
  },

  tobacco: {
    planting: [
      { name: "NPK 6:18:20+4HGB+0.1B", rate: 500, unit: "kg/ha", provides: { n: 30, p: 90, k: 100 } }
    ],
    topdressing: []
  },

  potatoes: {
    planting: [
      { name: "DAP", rate: 500, unit: "kg/ha", provides: { n: 90, p: 230 } }
    ],
    topdressing: [
      { name: "CAN", rate: 300, unit: "kg/ha", provides: { n: 81 } }
    ]
  },

  tomatoes: {
    planting: [
      { name: "DAP", rate: 200, unit: "kg/ha", provides: { n: 36, p: 92 } }
    ],
    topdressing: [
      { name: "CAN", rate: 100, unit: "kg/ha", provides: { n: 27 } },
      { name: "CAN (at flowering)", rate: 200, unit: "kg/ha", provides: { n: 54 } }
    ]
  },

  kales: {
    planting: [
      { name: "TSP/DSP", rate: 200, unit: "kg/ha", provides: { p: 92 } }
    ],
    topdressing: [
      { name: "CAN", rate: 100, unit: "kg/ha", provides: { n: 27 } },
      { name: "CAN (4-6 weeks)", rate: 200, unit: "kg/ha", provides: { n: 54 } }
    ]
  },

  cabbages: {
    planting: [
      { name: "DAP/TSP", rate: 200, unit: "kg/ha", provides: { p: 92 } }
    ],
    topdressing: [
      { name: "CAN", rate: 100, unit: "kg/ha", provides: { n: 27 } },
      { name: "CAN (4-6 weeks)", rate: 200, unit: "kg/ha", provides: { n: 54 } }
    ]
  },

  onions: {
    planting: [
      { name: "DAP", rate: 200, unit: "kg/ha", provides: { n: 36, p: 92 } }
    ],
    topdressing: [
      { name: "CAN", rate: 300, unit: "kg/ha", provides: { n: 81 } }
    ]
  },

  carrots: {
    planting: [],
    topdressing: [
      { name: "CAN", rate: 200, unit: "kg/ha", provides: { n: 54 } }
    ]
  },

  bananas: {
    planting: [
      { name: "TSP", rate: 100, unit: "g/hole", provides: { p: 46 } }
    ],
    topdressing: [
      { name: "CAN", rate: 125, unit: "g/stool/year", provides: { n: 33.75 } }
    ]
  },

  oranges: {
    planting: [
      { name: "TSP", rate: 1, unit: "bag", provides: { p: 46 } }
    ],
    topdressing: [
      { name: "DAP", rate: 1, unit: "bag", provides: { n: 18, p: 46 } },
      { name: "CAN", rate: 1, unit: "bag", provides: { n: 27 } }
    ]
  },

  pineapples: {
    planting: [
      { name: "Compound fertilizer", rate: 300, unit: "kg/ha", provides: { n: 45, p: 45, k: 45 } }
    ],
    topdressing: [
      { name: "CAN", rate: 300, unit: "kg/ha", provides: { n: 81 } }
    ]
  },

  passion: {
    planting: [
      { name: "DAP", rate: 175, unit: "g/hole", provides: { n: 31.5, p: 80.5 } }
    ],
    topdressing: [
      { name: "CAN", rate: 120, unit: "g/plant", provides: { n: 32.4 } }
    ]
  },

  // ========== NEW CROPS ADDED ==========

  rice: {
    planting: [
      { name: "DAP", rate: 100, unit: "kg/ha", provides: { n: 18, p: 46 } },
      { name: "NPK 20:20:0", rate: 200, unit: "kg/ha", provides: { n: 40, p: 40 } }
    ],
    topdressing: [
      { name: "UREA", rate: 150, unit: "kg/ha", provides: { n: 69 } },
      { name: "UREA (at tillering)", rate: 100, unit: "kg/ha", provides: { n: 46 } }
    ]
  },

  mangoes: {
    planting: [
      { name: "DAP", rate: 250, unit: "g/hole", provides: { n: 45, p: 115 } },
      { name: "Farmyard manure", rate: 20, unit: "kg/hole", provides: { n: 20, p: 10, k: 20 } }
    ],
    topdressing: [
      { name: "CAN", rate: 500, unit: "g/tree/year", provides: { n: 135 } },
      { name: "NPK 17:17:17", rate: 1, unit: "kg/tree/year", provides: { n: 170, p: 170, k: 170 } }
    ]
  },

  watermelons: {
    planting: [
      { name: "DAP", rate: 100, unit: "kg/ha", provides: { n: 18, p: 46 } },
      { name: "NPK 20:20:20", rate: 200, unit: "kg/ha", provides: { n: 40, p: 40, k: 40 } }
    ],
    topdressing: [
      { name: "CAN", rate: 100, unit: "kg/ha", provides: { n: 27 } },
      { name: "NPK at flowering", rate: 150, unit: "kg/ha", provides: { n: 30, p: 30, k: 30 } }
    ]
  },

  spinach: {
    planting: [
      { name: "DAP", rate: 150, unit: "kg/ha", provides: { n: 27, p: 69 } },
      { name: "Compost", rate: 10, unit: "tons/ha", provides: { n: 50, p: 20, k: 50 } }
    ],
    topdressing: [
      { name: "CAN", rate: 100, unit: "kg/ha", provides: { n: 27 } },
      { name: "CAN after each harvest", rate: 50, unit: "kg/ha", provides: { n: 13.5 } }
    ]
  },

  pigeonpeas: {
    planting: [
      { name: "DAP", rate: 100, unit: "kg/ha", provides: { n: 18, p: 46 } }
    ],
    topdressing: []
  },

  bambaranuts: {
    planting: [
      { name: "TSP", rate: 150, unit: "kg/ha", provides: { p: 69 } },
      { name: "Farmyard manure", rate: 5, unit: "tons/ha", provides: { n: 25, p: 10, k: 25 } }
    ],
    topdressing: []
  },

  yams: {
    planting: [
      { name: "DAP", rate: 100, unit: "g/hole", provides: { n: 18, p: 46 } },
      { name: "Farmyard manure", rate: 3, unit: "kg/hole", provides: { n: 3, p: 1.5, k: 3 } }
    ],
    topdressing: [
      { name: "CAN", rate: 50, unit: "g/hole", provides: { n: 13.5 } },
      { name: "NPK 15:15:15", rate: 100, unit: "g/hole", provides: { n: 15, p: 15, k: 15 } }
    ]
  },

  taro: {
    planting: [
      { name: "DAP", rate: 100, unit: "g/hole", provides: { n: 18, p: 46 } },
      { name: "Farmyard manure", rate: 2, unit: "kg/hole", provides: { n: 2, p: 1, k: 2 } }
    ],
    topdressing: [
      { name: "CAN", rate: 50, unit: "g/hole", provides: { n: 13.5 } }
    ]
  },

  okra: {
    planting: [
      { name: "DAP", rate: 150, unit: "kg/ha", provides: { n: 27, p: 69 } }
    ],
    topdressing: [
      { name: "CAN", rate: 100, unit: "kg/ha", provides: { n: 27 } },
      { name: "CAN (after each harvest)", rate: 50, unit: "kg/ha", provides: { n: 13.5 } }
    ]
  },

  tea: {
    planting: [
      { name: "TSP", rate: 100, unit: "g/hole", provides: { p: 46 } },
      { name: "NPK 25:5:5", rate: 100, unit: "g/hole", provides: { n: 25, p: 5, k: 5 } }
    ],
    topdressing: [
      { name: "NPK 25:5:5", rate: 200, unit: "g/tree/year", provides: { n: 50, p: 10, k: 10 } },
      { name: "UREA", rate: 100, unit: "g/tree/year", provides: { n: 46 } }
    ]
  },

  macadamia: {
    planting: [
      { name: "DAP", rate: 250, unit: "g/hole", provides: { n: 45, p: 115 } },
      { name: "Farmyard manure", rate: 20, unit: "kg/hole", provides: { n: 20, p: 10, k: 20 } }
    ],
    topdressing: [
      { name: "NPK 17:17:17", rate: 1, unit: "kg/tree/year", provides: { n: 170, p: 170, k: 170 } },
      { name: "CAN", rate: 500, unit: "g/tree/year", provides: { n: 135 } }
    ]
  },

  cocoa: {
    planting: [
      { name: "DAP", rate: 100, unit: "g/hole", provides: { n: 18, p: 46 } },
      { name: "Farmyard manure", rate: 5, unit: "kg/hole", provides: { n: 5, p: 2.5, k: 5 } }
    ],
    topdressing: [
      { name: "NPK 20:10:10", rate: 200, unit: "g/tree/year", provides: { n: 40, p: 20, k: 20 } },
      { name: "UREA", rate: 100, unit: "g/tree/year", provides: { n: 46 } }
    ]
  }
};

// Helper function to get fertilizer rates for a crop
export function getFertilizerRates(crop: string) {
  const normalizedCrop = crop.toLowerCase().trim();
  return fertilizerRates[normalizedCrop as keyof typeof fertilizerRates] || null;
}

// Helper function to convert rates to per acre (from per hectare)
export function convertToPerAcre(rateKgHa: number): number {
  return rateKgHa / 2.471; // 1 hectare = 2.471 acres
}

// Helper function to calculate fertilizer needed for specific farm size
export function calculateFertilizerNeeded(
  crop: string,
  farmSizeAcres: number,
  fertilizerType: "planting" | "topdressing"
): Array<{ name: string; amountKg: number; provides: any }> {
  const rates = getFertilizerRates(crop);
  if (!rates) return [];

  const fertilizerList = rates[fertilizerType] || [];

  return fertilizerList.map(fert => ({
    name: fert.name,
    amountKg: Math.round((fert.rate / 2.471) * farmSizeAcres), // Convert ha to acres and scale by farm size
    provides: fert.provides
  }));
}

// Helper function to get total nutrient recommendation
export function getTotalNutrientRecommendation(crop: string, farmSizeAcres: number) {
  const rates = getFertilizerRates(crop);
  if (!rates) return null;

  let totalN = 0;
  let totalP = 0;
  let totalK = 0;

  // Sum up planting fertilizers
  rates.planting?.forEach(fert => {
    const amountPerAcre = fert.rate / 2.471;
    totalN += (fert.provides.n || 0) * (amountPerAcre / fert.rate);
    totalP += (fert.provides.p || 0) * (amountPerAcre / fert.rate);
    totalK += (fert.provides.k || 0) * (amountPerAcre / fert.rate);
  });

  // Sum up topdressing fertilizers
  rates.topdressing?.forEach(fert => {
    const amountPerAcre = fert.rate / 2.471;
    totalN += (fert.provides.n || 0) * (amountPerAcre / fert.rate);
    totalP += (fert.provides.p || 0) * (amountPerAcre / fert.rate);
    totalK += (fert.provides.k || 0) * (amountPerAcre / fert.rate);
  });

  // Scale by farm size
  return {
    n: Math.round(totalN * farmSizeAcres),
    p: Math.round(totalP * farmSizeAcres),
    k: Math.round(totalK * farmSizeAcres)
  };
}