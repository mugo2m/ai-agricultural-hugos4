// lib/data/plantingDates.ts
// Based on Bungoma Farm Management Guidelines 2017
// UPDATED: Added 15 new crops (Rice, Mangoes, Pineapples, Watermelons, Carrots, Chillies, Spinach, Pigeon Peas, Bambara Nuts, Yams, Taro, Okra, Tea, Macadamia, Cocoa)
// UPDATED: Expanded regional data for East Africa

export const plantingDates = {
  // ========== EXISTING CROPS ==========

  maize: {
    regions: {
      "Bungoma": { earliest: "15th February", latest: "15th May", optimal: "March-April" },
      "Kiambu": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Nakuru": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Uasin Gishu": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Trans Nzoia": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Kakamega": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Machakos": { earliest: "15th October", latest: "15th December", optimal: "October-November" },
      "Kitui": { earliest: "15th October", latest: "15th December", optimal: "October-November" },
      "Makueni": { earliest: "15th October", latest: "15th December", optimal: "October-November" },
      "Meru": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Embu": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
    },
    default: { earliest: "15th March", latest: "15th May", optimal: "March-April" }
  },

  beans: {
    regions: {
      "Bungoma": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Machakos": { earliest: "15th October", latest: "15th December", optimal: "October-November" },
      "Kitui": { earliest: "15th October", latest: "15th December", optimal: "October-November" },
    },
    default: { earliest: "15th March", latest: "15th May", optimal: "March-April" }
  },

  "finger millet": {
    regions: {
      "Bungoma": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Kisumu": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Siaya": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
    },
    default: { earliest: "15th March", latest: "15th May", optimal: "March-April" }
  },

  sorghum: {
    regions: {
      "Bungoma": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Machakos": { earliest: "15th October", latest: "15th December", optimal: "October-November" },
      "Kitui": { earliest: "15th October", latest: "15th December", optimal: "October-November" },
    },
    default: { earliest: "15th March", latest: "15th May", optimal: "March-April" }
  },

  "soya beans": {
    regions: {
      "Bungoma": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
    },
    default: { earliest: "15th March", latest: "15th May", optimal: "March-April" }
  },

  sunflower: {
    regions: {
      "Bungoma": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
    },
    default: { earliest: "15th March", latest: "15th May", optimal: "March-April" }
  },

  cotton: {
    regions: {
      "Bungoma": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Meru": { earliest: "15th October", latest: "15th December", optimal: "October-November" },
    },
    default: { earliest: "15th March", latest: "15th May", optimal: "March-April" }
  },

  groundnuts: {
    regions: {
      "Bungoma": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Machakos": { earliest: "15th October", latest: "15th December", optimal: "October-November" },
    },
    default: { earliest: "15th March", latest: "15th May", optimal: "March-April" }
  },

  sugarcane: {
    regions: {
      "Bungoma": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Kakamega": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Migori": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
    },
    default: { earliest: "15th March", latest: "15th May", optimal: "March-April" }
  },

  tobacco: {
    regions: {
      "Bungoma": { earliest: "15th November", latest: "31st August", optimal: "November-December" },
      "Migori": { earliest: "15th November", latest: "31st August", optimal: "November-December" },
    },
    default: { earliest: "15th November", latest: "31st August", optimal: "November-December" }
  },

  coffee: {
    regions: {
      "Bungoma": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Kiambu": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Muranga": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Kirinyaga": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Nyeri": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Embu": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
    },
    default: { earliest: "15th March", latest: "15th May", optimal: "March-April" }
  },

  "irish potatoes": {
    regions: {
      "Bungoma": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Nakuru": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Meru": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Nyandarua": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
    },
    default: { earliest: "15th March", latest: "15th May", optimal: "March-April" }
  },

  tomatoes: {
    regions: {
      "Bungoma": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Kiambu": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Kirinyaga": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
    },
    default: { earliest: "15th March", latest: "15th May", optimal: "March-April" }
  },

  cassava: {
    regions: {
      "Bungoma": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Kakamega": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Kilifi": { earliest: "15th October", latest: "15th December", optimal: "October-November" },
    },
    default: { earliest: "15th March", latest: "15th May", optimal: "March-April" }
  },

  "sweet potatoes": {
    regions: {
      "Bungoma": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Machakos": { earliest: "15th October", latest: "15th December", optimal: "October-November" },
    },
    default: { earliest: "15th March", latest: "15th May", optimal: "March-April" }
  },

  kales: {
    regions: {
      "Bungoma": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Kiambu": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
    },
    default: { earliest: "15th March", latest: "15th May", optimal: "March-April" }
  },

  cabbages: {
    regions: {
      "Bungoma": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Kiambu": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
    },
    default: { earliest: "15th March", latest: "15th May", optimal: "March-April" }
  },

  onions: {
    regions: {
      "Bungoma": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Kajiado": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
    },
    default: { earliest: "15th March", latest: "15th May", optimal: "March-April" }
  },

  bananas: {
    regions: {
      "Bungoma": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Meru": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Muranga": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
    },
    default: { earliest: "15th March", latest: "15th May", optimal: "March-April" }
  },

  oranges: {
    regions: {
      "Bungoma": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Makueni": { earliest: "15th October", latest: "15th December", optimal: "October-November" },
    },
    default: { earliest: "15th March", latest: "15th May", optimal: "March-April" }
  },

  pineapples: {
    regions: {
      "Bungoma": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Kiambu": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Muranga": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
    },
    default: { earliest: "15th March", latest: "15th May", optimal: "March-April" }
  },

  avocados: {
    regions: {
      "Bungoma": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Muranga": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Kiambu": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
    },
    default: { earliest: "15th March", latest: "15th May", optimal: "March-April" }
  },

  pawpaws: {
    regions: {
      "Bungoma": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Machakos": { earliest: "15th October", latest: "15th December", optimal: "October-November" },
    },
    default: { earliest: "15th March", latest: "15th May", optimal: "March-April" }
  },

  "passion fruit": {
    regions: {
      "Bungoma": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Kiambu": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
    },
    default: { earliest: "15th March", latest: "15th May", optimal: "March-April" }
  },

  capsicums: {
    regions: {
      "Bungoma": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Kiambu": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
    },
    default: { earliest: "15th March", latest: "15th May", optimal: "March-April" }
  },

  "french beans": {
    regions: {
      "Bungoma": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Kiambu": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
    },
    default: { earliest: "15th March", latest: "15th May", optimal: "March-April" }
  },

  cowpeas: {
    regions: {
      "Bungoma": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Machakos": { earliest: "15th October", latest: "15th December", optimal: "October-November" },
    },
    default: { earliest: "15th March", latest: "15th May", optimal: "March-April" }
  },

  "green grams": {
    regions: {
      "Bungoma": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Machakos": { earliest: "15th October", latest: "15th December", optimal: "October-November" },
    },
    default: { earliest: "15th March", latest: "15th May", optimal: "March-April" }
  },

  // ========== NEW CROPS ADDED ==========

  rice: {
    regions: {
      "Bungoma": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Kisumu": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Siaya": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Homa Bay": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Migori": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Kirinyaga": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Mwea": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
    },
    default: { earliest: "15th March", latest: "15th May", optimal: "March-April" }
  },

  mangoes: {
    regions: {
      "Bungoma": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Makueni": { earliest: "15th October", latest: "15th December", optimal: "October-November" },
      "Machakos": { earliest: "15th October", latest: "15th December", optimal: "October-November" },
      "Kitui": { earliest: "15th October", latest: "15th December", optimal: "October-November" },
      "Meru": { earliest: "15th October", latest: "15th December", optimal: "October-November" },
      "Kilifi": { earliest: "15th October", latest: "15th December", optimal: "October-November" },
      "Kwale": { earliest: "15th October", latest: "15th December", optimal: "October-November" },
    },
    default: { earliest: "15th March", latest: "15th May", optimal: "March-April" }
  },

  watermelons: {
    regions: {
      "Bungoma": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Makueni": { earliest: "15th August", latest: "15th October", optimal: "August-September" },
      "Machakos": { earliest: "15th August", latest: "15th October", optimal: "August-September" },
      "Kitui": { earliest: "15th August", latest: "15th October", optimal: "August-September" },
      "Kajiado": { earliest: "15th August", latest: "15th October", optimal: "August-September" },
    },
    default: { earliest: "15th March", latest: "15th May", optimal: "March-April" }
  },

  carrots: {
    regions: {
      "Bungoma": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Kiambu": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Nyandarua": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Nakuru": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Meru": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
    },
    default: { earliest: "15th March", latest: "15th May", optimal: "March-April" }
  },

  chillies: {
    regions: {
      "Bungoma": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Kiambu": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Machakos": { earliest: "15th August", latest: "15th October", optimal: "August-September" },
    },
    default: { earliest: "15th March", latest: "15th May", optimal: "March-April" }
  },

  spinach: {
    regions: {
      "Bungoma": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Kiambu": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Nakuru": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
    },
    default: { earliest: "15th March", latest: "15th May", optimal: "March-April" }
  },

  pigeonpeas: {
    regions: {
      "Bungoma": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Machakos": { earliest: "15th October", latest: "15th December", optimal: "October-November" },
      "Kitui": { earliest: "15th October", latest: "15th December", optimal: "October-November" },
      "Makueni": { earliest: "15th October", latest: "15th December", optimal: "October-November" },
    },
    default: { earliest: "15th March", latest: "15th May", optimal: "March-April" }
  },

  bambaranuts: {
    regions: {
      "Bungoma": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Machakos": { earliest: "15th October", latest: "15th December", optimal: "October-November" },
      "Kitui": { earliest: "15th October", latest: "15th December", optimal: "October-November" },
    },
    default: { earliest: "15th March", latest: "15th May", optimal: "March-April" }
  },

  yams: {
    regions: {
      "Bungoma": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Kakamega": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Vihiga": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
    },
    default: { earliest: "15th March", latest: "15th May", optimal: "March-April" }
  },

  taro: {
    regions: {
      "Bungoma": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Kakamega": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Vihiga": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Kisumu": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
    },
    default: { earliest: "15th March", latest: "15th May", optimal: "March-April" }
  },

  okra: {
    regions: {
      "Bungoma": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Kiambu": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Machakos": { earliest: "15th August", latest: "15th October", optimal: "August-September" },
    },
    default: { earliest: "15th March", latest: "15th May", optimal: "March-April" }
  },

  tea: {
    regions: {
      "Bungoma": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Kiambu": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Muranga": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Kirinyaga": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Nyeri": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Kericho": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Bomet": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
    },
    default: { earliest: "15th March", latest: "15th May", optimal: "March-April" }
  },

  macadamia: {
    regions: {
      "Bungoma": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Muranga": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Kiambu": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Nyeri": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Embu": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Meru": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
    },
    default: { earliest: "15th March", latest: "15th May", optimal: "March-April" }
  },

  cocoa: {
    regions: {
      "Bungoma": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Kakamega": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Vihiga": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
    },
    default: { earliest: "15th March", latest: "15th May", optimal: "March-April" }
  }
};

export function getPlantingAdvice(crop: string, county: string, plantingDate: string): string {
  const cropData = plantingDates[crop as keyof typeof plantingDates] || plantingDates.maize;
  const regionData = cropData.regions?.[county as keyof typeof cropData.regions] || cropData.default;

  const date = new Date(plantingDate);
  const month = date.getMonth() + 1;

  // Parse optimal months from string (e.g., "March-April" or "October-November")
  const optimalRange = regionData.optimal.split('-');
  const optimalMonths: number[] = [];

  // Convert month names to numbers
  const monthMap: Record<string, number> = {
    "January": 1, "February": 2, "March": 3, "April": 4, "May": 5, "June": 6,
    "July": 7, "August": 8, "September": 9, "October": 10, "November": 11, "December": 12
  };

  optimalRange.forEach(monthName => {
    const trimmed = monthName.trim();
    if (monthMap[trimmed]) {
      optimalMonths.push(monthMap[trimmed]);
    }
  });

  // Check if planting month is in optimal range
  if (optimalMonths.includes(month)) {
    return "optimal";
  }

  // Check if planting month is within earliest-latest range
  const earliestMatch = regionData.earliest.match(/(\d+)(?:st|nd|rd|th)?\s+(\w+)/);
  const latestMatch = regionData.latest.match(/(\d+)(?:st|nd|rd|th)?\s+(\w+)/);

  if (earliestMatch && latestMatch) {
    const earliestMonth = monthMap[earliestMatch[2]];
    const latestMonth = monthMap[latestMatch[2]];

    // Handle ranges that cross year boundary (e.g., November-August)
    if (latestMonth < earliestMonth) {
      // Cross-year range (e.g., Nov to Aug)
      if (month >= earliestMonth || month <= latestMonth) {
        return "acceptable";
      }
    } else {
      // Normal range (e.g., March to May)
      if (month >= earliestMonth && month <= latestMonth) {
        return "acceptable";
      }
    }
  }

  return "late";
}

// Helper function to get planting advice in a more readable format
export function getPlantingAdviceText(crop: string, county: string, plantingDate: string): string {
  const advice = getPlantingAdvice(crop, county, plantingDate);

  switch(advice) {
    case "optimal":
      return "✅ Optimal planting time - Perfect conditions for this crop!";
    case "acceptable":
      return "⚠️ Acceptable planting time - May have slightly reduced yields";
    case "late":
      return "❌ Late planting - Consider waiting for next season or use short-season varieties";
    default:
      return "Planting advice not available for this combination";
  }
}