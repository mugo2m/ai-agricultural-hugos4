// lib/data/spacing.ts
// Crop spacing recommendations with display labels for dropdown
// UPDATED: Added 15 new crops (Rice, Mangoes, Pineapples, Watermelons, Carrots, Chillies, Spinach, Pigeon Peas, Bambara Nuts, Yams, Taro, Okra, Tea, Macadamia, Cocoa)

export interface SpacingOption {
  label: string;           // What farmer sees in dropdown
  rowCm: number;           // Row spacing in centimeters
  plantCm: number;         // Plant spacing in centimeters
  seedsPerHole: number;    // Seeds per planting hole
  plantsPerAcre: number;   // Calculated plants per acre
  description?: string;    // Optional additional info
}

// Helper function to calculate plants per acre
function calculatePlantsPerAcre(rowCm: number, plantCm: number, seedsPerHole: number): number {
  const rowM = rowCm / 100;
  const plantM = plantCm / 100;
  const areaPerPlant = rowM * plantM;
  // 1 acre = 4046.86 square meters
  return Math.floor(4046.86 / areaPerPlant) * seedsPerHole;
}

// Main spacing database with structured options for dropdown
export const cropSpacingOptions: Record<string, SpacingOption[]> = {
  // ========== EXISTING CROPS ==========

  maize: [
    {
      label: "75cm x 25cm (1 seed/hole) - High density",
      rowCm: 75,
      plantCm: 25,
      seedsPerHole: 1,
      plantsPerAcre: calculatePlantsPerAcre(75, 25, 1),
      description: "Recommended for high fertility soils"
    },
    {
      label: "75cm x 30cm (1 seed/hole) - Standard density",
      rowCm: 75,
      plantCm: 30,
      seedsPerHole: 1,
      plantsPerAcre: calculatePlantsPerAcre(75, 30, 1),
      description: "Most common spacing for maize"
    },
    {
      label: "75cm x 50cm (2 seeds/hole) - Low density",
      rowCm: 75,
      plantCm: 50,
      seedsPerHole: 2,
      plantsPerAcre: calculatePlantsPerAcre(75, 50, 2),
      description: "For intercropping or low fertility"
    },
    {
      label: "90cm x 30cm (1 seed/hole) - Wide rows",
      rowCm: 90,
      plantCm: 30,
      seedsPerHole: 1,
      plantsPerAcre: calculatePlantsPerAcre(90, 30, 1),
      description: "For mechanized farming"
    }
  ],

  beans: [
    {
      label: "50cm x 10cm (2 seeds/hole) - Pure stand",
      rowCm: 50,
      plantCm: 10,
      seedsPerHole: 2,
      plantsPerAcre: calculatePlantsPerAcre(50, 10, 2),
      description: "For pure stand beans"
    },
    {
      label: "50cm x 15cm (2 seeds/hole) - Intercrop with maize",
      rowCm: 50,
      plantCm: 15,
      seedsPerHole: 2,
      plantsPerAcre: calculatePlantsPerAcre(50, 15, 2),
      description: "When planting between maize rows"
    }
  ],

  "finger millet": [
    {
      label: "30cm x 15cm (drilled and thinned)",
      rowCm: 30,
      plantCm: 15,
      seedsPerHole: 1,
      plantsPerAcre: calculatePlantsPerAcre(30, 15, 1),
      description: "Drill and thin to 15cm spacing"
    }
  ],

  sorghum: [
    {
      label: "60cm x 15cm (drilled and thinned)",
      rowCm: 60,
      plantCm: 15,
      seedsPerHole: 1,
      plantsPerAcre: calculatePlantsPerAcre(60, 15, 1),
      description: "Standard spacing for sorghum"
    }
  ],

  "soya beans": [
    {
      label: "45cm x 10cm (3 seeds/hole, thin to 1)",
      rowCm: 45,
      plantCm: 10,
      seedsPerHole: 3,
      plantsPerAcre: calculatePlantsPerAcre(45, 10, 3),
      description: "Plant 3 seeds, thin to 1 plant"
    }
  ],

  sunflower: [
    {
      label: "75cm x 30cm (2 seeds/hole, thin to 1)",
      rowCm: 75,
      plantCm: 30,
      seedsPerHole: 2,
      plantsPerAcre: calculatePlantsPerAcre(75, 30, 2),
      description: "Plant 2 seeds, thin to 1 plant"
    }
  ],

  cotton: [
    {
      label: "90cm x 30cm (5-6 seeds/hole, thin to 2)",
      rowCm: 90,
      plantCm: 30,
      seedsPerHole: 6,
      plantsPerAcre: calculatePlantsPerAcre(90, 30, 6),
      description: "Plant 5-6 seeds, thin to 2 plants"
    }
  ],

  groundnuts: [
    {
      label: "45cm x 10cm (bunch type)",
      rowCm: 45,
      plantCm: 10,
      seedsPerHole: 1,
      plantsPerAcre: calculatePlantsPerAcre(45, 10, 1),
      description: "For bunch type varieties"
    },
    {
      label: "60cm x 10cm (spreader type)",
      rowCm: 60,
      plantCm: 10,
      seedsPerHole: 1,
      plantsPerAcre: calculatePlantsPerAcre(60, 10, 1),
      description: "For spreading type varieties"
    }
  ],

  sugarcane: [
    {
      label: "1.5m x 0.5m (setts)",
      rowCm: 150,
      plantCm: 50,
      seedsPerHole: 1,
      plantsPerAcre: calculatePlantsPerAcre(150, 50, 1),
      description: "Plant cane setts at this spacing"
    }
  ],

  coffee: [
    {
      label: "2.75m x 2.75m (SL28, SL34)",
      rowCm: 275,
      plantCm: 275,
      seedsPerHole: 1,
      plantsPerAcre: calculatePlantsPerAcre(275, 275, 1),
      description: "For traditional coffee varieties"
    },
    {
      label: "2m x 2m (Ruiru 11)",
      rowCm: 200,
      plantCm: 200,
      seedsPerHole: 1,
      plantsPerAcre: calculatePlantsPerAcre(200, 200, 1),
      description: "For Ruiru 11 and compact varieties"
    }
  ],

  cassava: [
    {
      label: "1m x 1m",
      rowCm: 100,
      plantCm: 100,
      seedsPerHole: 1,
      plantsPerAcre: calculatePlantsPerAcre(100, 100, 1),
      description: "Standard cassava spacing"
    }
  ],

  "sweet potatoes": [
    {
      label: "90cm x 30cm on ridges",
      rowCm: 90,
      plantCm: 30,
      seedsPerHole: 1,
      plantsPerAcre: calculatePlantsPerAcre(90, 30, 1),
      description: "Plant vines on ridges"
    }
  ],

  "irish potatoes": [
    {
      label: "75cm x 30cm",
      rowCm: 75,
      plantCm: 30,
      seedsPerHole: 1,
      plantsPerAcre: calculatePlantsPerAcre(75, 30, 1),
      description: "Standard potato spacing"
    }
  ],

  tomatoes: [
    {
      label: "60cm x 45cm (determinate varieties)",
      rowCm: 60,
      plantCm: 45,
      seedsPerHole: 1,
      plantsPerAcre: calculatePlantsPerAcre(60, 45, 1),
      description: "For bush/determinate tomatoes"
    },
    {
      label: "90cm x 60cm (indeterminate with staking)",
      rowCm: 90,
      plantCm: 60,
      seedsPerHole: 1,
      plantsPerAcre: calculatePlantsPerAcre(90, 60, 1),
      description: "For staked indeterminate varieties"
    }
  ],

  kales: [
    {
      label: "60cm x 60cm",
      rowCm: 60,
      plantCm: 60,
      seedsPerHole: 1,
      plantsPerAcre: calculatePlantsPerAcre(60, 60, 1),
      description: "Standard kale spacing"
    }
  ],

  cabbages: [
    {
      label: "60cm x 45cm (medium heads)",
      rowCm: 60,
      plantCm: 45,
      seedsPerHole: 1,
      plantsPerAcre: calculatePlantsPerAcre(60, 45, 1),
      description: "For medium-sized cabbage heads"
    },
    {
      label: "75cm x 60cm (large heads)",
      rowCm: 75,
      plantCm: 60,
      seedsPerHole: 1,
      plantsPerAcre: calculatePlantsPerAcre(75, 60, 1),
      description: "For large cabbage varieties"
    }
  ],

  onions: [
    {
      label: "30cm x 10cm (transplanted)",
      rowCm: 30,
      plantCm: 10,
      seedsPerHole: 1,
      plantsPerAcre: calculatePlantsPerAcre(30, 10, 1),
      description: "Transplant seedlings at this spacing"
    }
  ],

  bananas: [
    {
      label: "3m x 3m (short varieties)",
      rowCm: 300,
      plantCm: 300,
      seedsPerHole: 1,
      plantsPerAcre: calculatePlantsPerAcre(300, 300, 1),
      description: "For dwarf and short varieties"
    },
    {
      label: "4m x 4m (tall varieties)",
      rowCm: 400,
      plantCm: 400,
      seedsPerHole: 1,
      plantsPerAcre: calculatePlantsPerAcre(400, 400, 1),
      description: "For tall banana varieties"
    }
  ],

  oranges: [
    {
      label: "4.5m x 4.5m",
      rowCm: 450,
      plantCm: 450,
      seedsPerHole: 1,
      plantsPerAcre: calculatePlantsPerAcre(450, 450, 1),
      description: "Standard citrus spacing"
    }
  ],

  avocados: [
    {
      label: "5m x 5m",
      rowCm: 500,
      plantCm: 500,
      seedsPerHole: 1,
      plantsPerAcre: calculatePlantsPerAcre(500, 500, 1),
      description: "Standard avocado spacing"
    }
  ],

  pawpaws: [
    {
      label: "2.5m x 2.5m",
      rowCm: 250,
      plantCm: 250,
      seedsPerHole: 1,
      plantsPerAcre: calculatePlantsPerAcre(250, 250, 1),
      description: "Standard pawpaw spacing"
    }
  ],

  "passion fruit": [
    {
      label: "2m x 3m (trellised)",
      rowCm: 200,
      plantCm: 300,
      seedsPerHole: 1,
      plantsPerAcre: calculatePlantsPerAcre(200, 300, 1),
      description: "For trellised passion fruit"
    }
  ],

  capsicums: [
    {
      label: "60cm x 45cm",
      rowCm: 60,
      plantCm: 45,
      seedsPerHole: 1,
      plantsPerAcre: calculatePlantsPerAcre(60, 45, 1),
      description: "Standard capsicum spacing"
    }
  ],

  "french beans": [
    {
      label: "45cm x 10cm",
      rowCm: 45,
      plantCm: 10,
      seedsPerHole: 1,
      plantsPerAcre: calculatePlantsPerAcre(45, 10, 1),
      description: "High density for French beans"
    }
  ],

  cowpeas: [
    {
      label: "45cm x 15cm",
      rowCm: 45,
      plantCm: 15,
      seedsPerHole: 2,
      plantsPerAcre: calculatePlantsPerAcre(45, 15, 2),
      description: "Standard cowpea spacing"
    }
  ],

  "green grams": [
    {
      label: "45cm x 10cm",
      rowCm: 45,
      plantCm: 10,
      seedsPerHole: 1,
      plantsPerAcre: calculatePlantsPerAcre(45, 10, 1),
      description: "Standard green gram spacing"
    }
  ],

  // ========== NEW CROPS ADDED ==========

  rice: [
    {
      label: "20cm x 20cm (transplanted) - High density",
      rowCm: 20,
      plantCm: 20,
      seedsPerHole: 3,
      plantsPerAcre: calculatePlantsPerAcre(20, 20, 3),
      description: "Transplant 3 seedlings per hill"
    },
    {
      label: "25cm x 25cm (transplanted) - Standard",
      rowCm: 25,
      plantCm: 25,
      seedsPerHole: 3,
      plantsPerAcre: calculatePlantsPerAcre(25, 25, 3),
      description: "Standard spacing for transplanted rice"
    },
    {
      label: "20cm rows (direct seeded) - Drilled",
      rowCm: 20,
      plantCm: 5,
      seedsPerHole: 1,
      plantsPerAcre: calculatePlantsPerAcre(20, 5, 1),
      description: "For direct seeded rice, drill in rows"
    }
  ],

  mangoes: [
    {
      label: "8m x 8m - Standard spacing",
      rowCm: 800,
      plantCm: 800,
      seedsPerHole: 1,
      plantsPerAcre: calculatePlantsPerAcre(800, 800, 1),
      description: "68 trees per acre - for vigorous varieties"
    },
    {
      label: "10m x 10m - Wide spacing",
      rowCm: 1000,
      plantCm: 1000,
      seedsPerHole: 1,
      plantsPerAcre: calculatePlantsPerAcre(1000, 1000, 1),
      description: "40 trees per acre - for very large varieties"
    },
    {
      label: "5m x 5m - High density planting",
      rowCm: 500,
      plantCm: 500,
      seedsPerHole: 1,
      plantsPerAcre: calculatePlantsPerAcre(500, 500, 1),
      description: "174 trees per acre - for dwarf varieties"
    }
  ],

  pineapples: [
    {
      label: "30cm x 60cm (double rows) - High density",
      rowCm: 30,
      plantCm: 60,
      seedsPerHole: 1,
      plantsPerAcre: calculatePlantsPerAcre(30, 60, 1),
      description: "Double row planting, 30cm between plants"
    },
    {
      label: "45cm x 45cm (single rows) - Standard",
      rowCm: 45,
      plantCm: 45,
      seedsPerHole: 1,
      plantsPerAcre: calculatePlantsPerAcre(45, 45, 1),
      description: "Single row planting"
    },
    {
      label: "60cm x 30cm (bed planting) - On raised beds",
      rowCm: 60,
      plantCm: 30,
      seedsPerHole: 1,
      plantsPerAcre: calculatePlantsPerAcre(60, 30, 1),
      description: "Plant on raised beds for better drainage"
    }
  ],

  watermelons: [
    {
      label: "2m x 1m (trailing) - Standard",
      rowCm: 200,
      plantCm: 100,
      seedsPerHole: 1,
      plantsPerAcre: calculatePlantsPerAcre(200, 100, 1),
      description: "2,000 plants per acre - allow vines to spread"
    },
    {
      label: "2.5m x 1m (large varieties) - Wide spacing",
      rowCm: 250,
      plantCm: 100,
      seedsPerHole: 1,
      plantsPerAcre: calculatePlantsPerAcre(250, 100, 1),
      description: "1,600 plants per acre - for vigorous varieties"
    },
    {
      label: "1.5m x 0.5m (bush varieties) - Compact",
      rowCm: 150,
      plantCm: 50,
      seedsPerHole: 1,
      plantsPerAcre: calculatePlantsPerAcre(150, 50, 1),
      description: "5,300 plants per acre - for bush-type varieties"
    }
  ],

  carrots: [
    {
      label: "30cm rows x 5cm between plants - Standard",
      rowCm: 30,
      plantCm: 5,
      seedsPerHole: 1,
      plantsPerAcre: calculatePlantsPerAcre(30, 5, 1),
      description: "Thin to 5cm spacing, 100,000 plants per acre"
    },
    {
      label: "30cm rows x 8cm between plants - Wide spacing",
      rowCm: 30,
      plantCm: 8,
      seedsPerHole: 1,
      plantsPerAcre: calculatePlantsPerAcre(30, 8, 1),
      description: "For larger carrots, 67,000 plants per acre"
    },
    {
      label: "Broadcast seeding - Drilled",
      rowCm: 20,
      plantCm: 5,
      seedsPerHole: 1,
      plantsPerAcre: calculatePlantsPerAcre(20, 5, 1),
      description: "Broadcast and thin to 5cm spacing"
    }
  ],

  chillies: [
    {
      label: "60cm x 45cm - Standard spacing",
      rowCm: 60,
      plantCm: 45,
      seedsPerHole: 1,
      plantsPerAcre: calculatePlantsPerAcre(60, 45, 1),
      description: "12,000 plants per acre - for most varieties"
    },
    {
      label: "75cm x 60cm - Wide spacing",
      rowCm: 75,
      plantCm: 60,
      seedsPerHole: 1,
      plantsPerAcre: calculatePlantsPerAcre(75, 60, 1),
      description: "6,700 plants per acre - for vigorous varieties"
    },
    {
      label: "45cm x 30cm - High density",
      rowCm: 45,
      plantCm: 30,
      seedsPerHole: 1,
      plantsPerAcre: calculatePlantsPerAcre(45, 30, 1),
      description: "24,000 plants per acre - for small varieties"
    }
  ],

  spinach: [
    {
      label: "30cm rows x 15cm between plants - Standard",
      rowCm: 30,
      plantCm: 15,
      seedsPerHole: 1,
      plantsPerAcre: calculatePlantsPerAcre(30, 15, 1),
      description: "45,000 plants per acre - for cut-and-come-again"
    },
    {
      label: "30cm rows x 10cm between plants - High density",
      rowCm: 30,
      plantCm: 10,
      seedsPerHole: 1,
      plantsPerAcre: calculatePlantsPerAcre(30, 10, 1),
      description: "67,000 plants per acre - for baby leaf production"
    },
    {
      label: "20cm rows x 20cm between plants - Square planting",
      rowCm: 20,
      plantCm: 20,
      seedsPerHole: 1,
      plantsPerAcre: calculatePlantsPerAcre(20, 20, 1),
      description: "67,000 plants per acre - uniform spacing"
    }
  ],

  pigeonpeas: [
    {
      label: "75cm x 30cm (short duration) - Standard",
      rowCm: 75,
      plantCm: 30,
      seedsPerHole: 2,
      plantsPerAcre: calculatePlantsPerAcre(75, 30, 2),
      description: "Plant 2 seeds, thin to 1, 15,000 plants per acre"
    },
    {
      label: "100cm x 50cm (long duration) - Wide spacing",
      rowCm: 100,
      plantCm: 50,
      seedsPerHole: 2,
      plantsPerAcre: calculatePlantsPerAcre(100, 50, 2),
      description: "5,000 plants per acre - for perennial types"
    },
    {
      label: "150cm x 50cm (intercrop with maize) - Intercropping",
      rowCm: 150,
      plantCm: 50,
      seedsPerHole: 2,
      plantsPerAcre: calculatePlantsPerAcre(150, 50, 2),
      description: "For planting with maize, 2,600 plants per acre"
    }
  ],

  bambaranuts: [
    {
      label: "45cm x 20cm (bunch type) - Standard",
      rowCm: 45,
      plantCm: 20,
      seedsPerHole: 2,
      plantsPerAcre: calculatePlantsPerAcre(45, 20, 2),
      description: "Plant 2 seeds per hole, 35,000 plants per acre"
    },
    {
      label: "60cm x 30cm (spreader type) - Wide spacing",
      rowCm: 60,
      plantCm: 30,
      seedsPerHole: 2,
      plantsPerAcre: calculatePlantsPerAcre(60, 30, 2),
      description: "For spreading varieties, 15,000 plants per acre"
    },
    {
      label: "50cm x 15cm (high density) - Dense planting",
      rowCm: 50,
      plantCm: 15,
      seedsPerHole: 2,
      plantsPerAcre: calculatePlantsPerAcre(50, 15, 2),
      description: "43,000 plants per acre - maximum yield"
    }
  ],

  yams: [
    {
      label: "1m x 1m - Standard spacing",
      rowCm: 100,
      plantCm: 100,
      seedsPerHole: 1,
      plantsPerAcre: calculatePlantsPerAcre(100, 100, 1),
      description: "4,000 plants per acre - for most varieties"
    },
    {
      label: "1.5m x 1m - Wide spacing",
      rowCm: 150,
      plantCm: 100,
      seedsPerHole: 1,
      plantsPerAcre: calculatePlantsPerAcre(150, 100, 1),
      description: "2,600 plants per acre - for vigorous varieties"
    },
    {
      label: "2m x 1m - Extra wide (with staking)",
      rowCm: 200,
      plantCm: 100,
      seedsPerHole: 1,
      plantsPerAcre: calculatePlantsPerAcre(200, 100, 1),
      description: "2,000 plants per acre - when staking individually"
    }
  ],

  taro: [
    {
      label: "60cm x 45cm - Standard spacing",
      rowCm: 60,
      plantCm: 45,
      seedsPerHole: 1,
      plantsPerAcre: calculatePlantsPerAcre(60, 45, 1),
      description: "12,000 plants per acre - for dryland cultivation"
    },
    {
      label: "75cm x 60cm - Wide spacing",
      rowCm: 75,
      plantCm: 60,
      seedsPerHole: 1,
      plantsPerAcre: calculatePlantsPerAcre(75, 60, 1),
      description: "6,700 plants per acre - for vigorous varieties"
    },
    {
      label: "45cm x 30cm - High density",
      rowCm: 45,
      plantCm: 30,
      seedsPerHole: 1,
      plantsPerAcre: calculatePlantsPerAcre(45, 30, 1),
      description: "24,000 plants per acre - for small corm production"
    }
  ],

  okra: [
    {
      label: "60cm x 30cm - Standard spacing",
      rowCm: 60,
      plantCm: 30,
      seedsPerHole: 2,
      plantsPerAcre: calculatePlantsPerAcre(60, 30, 2),
      description: "Plant 2 seeds, thin to 1, 18,000 plants per acre"
    },
    {
      label: "75cm x 45cm - Wide spacing",
      rowCm: 75,
      plantCm: 45,
      seedsPerHole: 2,
      plantsPerAcre: calculatePlantsPerAcre(75, 45, 2),
      description: "8,000 plants per acre - for vigorous varieties"
    },
    {
      label: "45cm x 20cm - High density",
      rowCm: 45,
      plantCm: 20,
      seedsPerHole: 2,
      plantsPerAcre: calculatePlantsPerAcre(45, 20, 2),
      description: "36,000 plants per acre - for early harvest"
    }
  ],

  tea: [
    {
      label: "1.2m x 0.75m (high density) - Clonal tea",
      rowCm: 120,
      plantCm: 75,
      seedsPerHole: 1,
      plantsPerAcre: calculatePlantsPerAcre(120, 75, 1),
      description: "4,500 plants per acre - for high yield"
    },
    {
      label: "1.5m x 0.75m (standard) - Seedling tea",
      rowCm: 150,
      plantCm: 75,
      seedsPerHole: 1,
      plantsPerAcre: calculatePlantsPerAcre(150, 75, 1),
      description: "3,600 plants per acre - traditional spacing"
    },
    {
      label: "1.2m x 1.2m (square planting) - Wide spacing",
      rowCm: 120,
      plantCm: 120,
      seedsPerHole: 1,
      plantsPerAcre: calculatePlantsPerAcre(120, 120, 1),
      description: "2,800 plants per acre - for mechanical harvesting"
    }
  ],

  macadamia: [
    {
      label: "8m x 8m - Standard spacing",
      rowCm: 800,
      plantCm: 800,
      seedsPerHole: 1,
      plantsPerAcre: calculatePlantsPerAcre(800, 800, 1),
      description: "68 trees per acre - for most varieties"
    },
    {
      label: "10m x 8m - Wide spacing",
      rowCm: 1000,
      plantCm: 800,
      seedsPerHole: 1,
      plantsPerAcre: calculatePlantsPerAcre(1000, 800, 1),
      description: "50 trees per acre - for vigorous varieties"
    },
    {
      label: "6m x 6m (high density) - Dense planting",
      rowCm: 600,
      plantCm: 600,
      seedsPerHole: 1,
      plantsPerAcre: calculatePlantsPerAcre(600, 600, 1),
      description: "120 trees per acre - for dwarf varieties"
    }
  ],

  cocoa: [
    {
      label: "3m x 3m - Standard spacing",
      rowCm: 300,
      plantCm: 300,
      seedsPerHole: 2,
      plantsPerAcre: calculatePlantsPerAcre(300, 300, 2),
      description: "Plant 2 seeds, thin to 1, 484 trees per acre"
    },
    {
      label: "3.5m x 3.5m - Wide spacing",
      rowCm: 350,
      plantCm: 350,
      seedsPerHole: 2,
      plantsPerAcre: calculatePlantsPerAcre(350, 350, 2),
      description: "356 trees per acre - for vigorous varieties"
    },
    {
      label: "2.5m x 2.5m (high density) - Dense planting",
      rowCm: 250,
      plantCm: 250,
      seedsPerHole: 2,
      plantsPerAcre: calculatePlantsPerAcre(250, 250, 2),
      description: "696 trees per acre - for early bearing"
    }
  ]
};

// Helper function to get spacing options for a crop
export function getSpacingOptions(crop: string): SpacingOption[] {
  const normalizedCrop = crop.toLowerCase().trim();
  return cropSpacingOptions[normalizedCrop] || [];
}

// Helper function to get crop by label
export function getSpacingByLabel(crop: string, label: string): SpacingOption | undefined {
  const options = getSpacingOptions(crop);
  return options.find(opt => opt.label === label);
}

// Legacy export for backward compatibility
export const cropSpacing = cropSpacingOptions;