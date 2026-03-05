// lib/fertilizers/plantingFertilizers.ts
// Complete database of planting fertilizers from Kenyan suppliers

export interface Fertilizer {
  id: string;
  brand: string;
  company: string;
  type: "planting" | "topdressing";
  npk: string;
  nutrients: {
    n: number;  // Nitrogen %
    p: number;  // Phosphorus %
    k: number;  // Potassium %
    s?: number; // Sulphur %
    ca?: number; // Calcium %
    mg?: number; // Magnesium %
    zn?: number; // Zinc %
    b?: number;  // Boron %
    mn?: number; // Manganese %
    cu?: number; // Copper %
    fe?: number; // Iron %
    mo?: number; // Molybdenum %
    te?: boolean; // Trace elements present
  };
  crops: string[];
  description?: string;
  packageSizes?: string[];
  pricePer50kg?: number;
}

export const plantingFertilizers: Fertilizer[] = [
  // ========== COMMON BASE FERTILIZERS ==========
  {
    id: "dap",
    brand: "DAP",
    company: "Various",
    type: "planting",
    npk: "18-46-0",
    nutrients: { n: 18, p: 46, k: 0 },
    crops: ["maize", "beans", "soya beans", "sunflower", "cotton", "sugarcane", "potatoes", "tomatoes", "onions", "all crops"],
    description: "Diammonium Phosphate - most common planting fertilizer",
    packageSizes: ["50kg bag (Ksh 3,300)", "50kg bag (Ksh 3,500)", "50kg bag (Ksh 3,800)"],
    pricePer50kg: 3500
  },
  {
    id: "tsp",
    brand: "TSP",
    company: "Various",
    type: "planting",
    npk: "0-46-0",
    nutrients: { n: 0, p: 46, k: 0 },
    crops: ["maize", "beans", "groundnuts", "cassava", "bananas", "coffee"],
    description: "Triple Super Phosphate - pure phosphorus",
    packageSizes: ["50kg bag (Ksh 3,200)", "50kg bag (Ksh 3,400)"],
    pricePer50kg: 3300
  },
  {
    id: "ssp",
    brand: "SSP",
    company: "Various",
    type: "planting",
    npk: "0-20-0",
    nutrients: { n: 0, p: 20, k: 0, s: 12 },
    crops: ["maize", "beans", "groundnuts", "all crops"],
    description: "Single Super Phosphate - phosphorus with sulphur",
    packageSizes: ["50kg bag (Ksh 2,800)", "50kg bag (Ksh 3,000)"],
    pricePer50kg: 2900
  },
  {
    id: "npk_2323",
    brand: "NPK 23-23-0",
    company: "Various",
    type: "planting",
    npk: "23-23-0",
    nutrients: { n: 23, p: 23, k: 0 },
    crops: ["maize", "cereals"],
    description: "Balanced NP fertilizer",
    packageSizes: ["50kg bag (Ksh 3,000)", "50kg bag (Ksh 3,200)"],
    pricePer50kg: 3100
  },
  {
    id: "npk_2020",
    brand: "NPK 20-20-0",
    company: "Various",
    type: "planting",
    npk: "20-20-0",
    nutrients: { n: 20, p: 20, k: 0 },
    crops: ["maize", "sorghum", "cereals"],
    description: "Balanced NP fertilizer",
    packageSizes: ["50kg bag (Ksh 2,900)", "50kg bag (Ksh 3,100)"],
    pricePer50kg: 3000
  },

  // ========== YARA FERTILIZERS ==========
  {
    id: "yara_power",
    brand: "Yara Mila Power",
    company: "Yara Fertilizers",
    type: "planting",
    npk: "13-24-12",
    nutrients: { n: 13, p: 24, k: 12, mg: 2, s: 4.5, zn: 0.02 },
    crops: ["cereals", "vegetables", "maize", "wheat"],
    description: "Complete planting fertilizer with magnesium and zinc",
    packageSizes: ["50kg bag (Ksh 3,800)", "50kg bag (Ksh 4,000)"],
    pricePer50kg: 3900
  },
  {
    id: "yara_microp_planting",
    brand: "MiCrop + Planting",
    company: "Yara Fertilizers",
    type: "planting",
    npk: "11-28-4.5",
    nutrients: { n: 11, p: 28, k: 4.5, ca: 6, mg: 2, s: 7, zn: 0.1 },
    crops: ["cereals", "vegetables", "maize"],
    description: "High phosphorus for root development",
    packageSizes: ["50kg bag (Ksh 3,600)", "50kg bag (Ksh 3,800)"],
    pricePer50kg: 3700
  },

  // ========== ELGON KENYA ==========
  {
    id: "elgon_thabiti_2323",
    brand: "Thabiti Super 23-23-0",
    company: "Elgon Kenya",
    type: "planting",
    npk: "23-23-0",
    nutrients: { n: 23, p: 23, k: 0, s: 3, ca: 4, zn: 0.5 },
    crops: ["horticulture", "general", "cereals"],
    description: "Balanced NP for general use",
    packageSizes: ["50kg bag (Ksh 3,200)", "50kg bag (Ksh 3,400)"],
    pricePer50kg: 3300
  },
  {
    id: "elgon_thabiti_1730",
    brand: "Thabiti Planting Cereal",
    company: "Elgon Kenya",
    type: "planting",
    npk: "17-30-6",
    nutrients: { n: 17, p: 30, k: 6, s: 3.5, ca: 2, zn: 0.4 },
    crops: ["cereals", "maize"],
    description: "High phosphorus for cereal planting",
    packageSizes: ["50kg bag (Ksh 3,500)", "50kg bag (Ksh 3,700)"],
    pricePer50kg: 3600
  },
  {
    id: "elgon_thabiti_1326_potato",
    brand: "Thabiti Planting Potato",
    company: "Elgon Kenya",
    type: "planting",
    npk: "13-26-13",
    nutrients: { n: 13, p: 26, k: 13, s: 3, ca: 2, mg: 1, zn: 0.2, b: 0.1, mn: 0.2 },
    crops: ["potatoes", "tubers"],
    description: "Specialized for potato crops",
    packageSizes: ["50kg bag (Ksh 3,600)", "50kg bag (Ksh 3,800)"],
    pricePer50kg: 3700
  },

  // ========== ETG FERTILIZERS ==========
  {
    id: "etg_kynopanda",
    brand: "KynoPanda Power",
    company: "ETG",
    type: "planting",
    npk: "10-25-10",
    nutrients: { n: 10, p: 25, k: 10, s: 7, zn: 0.5, ca: 4.5, mg: 1.3 },
    crops: ["cereals", "pulses", "horticulture"],
    description: "Complete with sulphur and micronutrients",
    packageSizes: ["50kg bag (Ksh 3,400)", "50kg bag (Ksh 3,600)"],
    pricePer50kg: 3500
  },
  {
    id: "etg_kynomaizeic",
    brand: "KynoMaizeic",
    company: "ETG",
    type: "planting",
    npk: "16-29-2",
    nutrients: { n: 16, p: 29, k: 2, s: 5.7, ca: 3.9 },
    crops: ["cereals", "pulses", "horticulture", "maize"],
    description: "Specialized for maize",
    packageSizes: ["50kg bag (Ksh 3,500)", "50kg bag (Ksh 3,700)"],
    pricePer50kg: 3600
  },

  // ========== OCP FERTILIZERS ==========
  {
    id: "ocp_npsb",
    brand: "OCP NPSB",
    company: "OCP",
    type: "planting",
    npk: "18.9-37.7-0",
    nutrients: { n: 18.9, p: 37.7, k: 0, s: 6.9, b: 0.1 },
    crops: ["cereals", "horticulture", "sugarcane", "legumes", "potatoes"],
    description: "High phosphorus with sulphur and boron",
    packageSizes: ["50kg bag (Ksh 3,600)", "50kg bag (Ksh 3,800)"],
    pricePer50kg: 3700
  },
  {
    id: "ocp_tsp",
    brand: "OCP TSP",
    company: "OCP",
    type: "planting",
    npk: "0-46-0",
    nutrients: { n: 0, p: 46, k: 0 },
    crops: ["rice", "legumes", "sugarcane", "coffee", "fruit trees"],
    description: "Triple Super Phosphate - pure phosphorus",
    packageSizes: ["50kg bag (Ksh 3,200)", "50kg bag (Ksh 3,400)"],
    pricePer50kg: 3300
  }
];

// Helper function to get fertilizers by crop
export function getPlantingFertilizersByCrop(crop: string): Fertilizer[] {
  return plantingFertilizers.filter(f =>
    f.crops.includes(crop.toLowerCase()) ||
    f.crops.includes("all crops") ||
    f.crops.includes("general") ||
    f.crops.includes("cereals") && ["maize", "sorghum", "finger millet"].includes(crop.toLowerCase()) ||
    f.crops.includes("legumes") && ["beans", "soya beans", "cowpeas", "groundnuts"].includes(crop.toLowerCase()) ||
    f.crops.includes("vegetables") && ["tomatoes", "kales", "cabbages", "onions"].includes(crop.toLowerCase())
  );
}

// Helper function to get fertilizer by ID
export function getPlantingFertilizerById(id: string): Fertilizer | undefined {
  return plantingFertilizers.find(f => f.id === id);
}