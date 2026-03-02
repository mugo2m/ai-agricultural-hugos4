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
}

export const plantingFertilizers: Fertilizer[] = [
  // ========== YARA FERTILIZERS ==========
  {
    id: "yara_power",
    brand: "Yara Mila Power",
    company: "Yara Fertilizers",
    type: "planting",
    npk: "13-24-12",
    nutrients: { n: 13, p: 24, k: 12, mg: 2, s: 4.5, zn: 0.02 },
    crops: ["cereals", "vegetables", "maize", "wheat"],
    description: "Complete planting fertilizer with magnesium and zinc"
  },
  {
    id: "yara_microp_planting",
    brand: "MiCrop + Planting",
    company: "Yara Fertilizers",
    type: "planting",
    npk: "11-28-4.5",
    nutrients: { n: 11, p: 28, k: 4.5, ca: 6, mg: 2, s: 7, zn: 0.1 },
    crops: ["cereals", "vegetables", "maize"],
    description: "High phosphorus for root development"
  },
  {
    id: "yara_microp_core",
    brand: "MiCrop Planting Core",
    company: "Yara Fertilizers",
    type: "planting",
    npk: "17-29-6",
    nutrients: { n: 17, p: 29, k: 6, s: 6, zn: 0.1 },
    crops: ["cereals", "vegetables", "maize"],
    description: "Balanced NPK with sulphur and zinc"
  },
  {
    id: "yara_chapa_meli",
    brand: "Chapa Meli",
    company: "Yara Fertilizers",
    type: "planting",
    npk: "19-24-0",
    nutrients: { n: 19, p: 24, k: 0, s: 11 },
    crops: ["cereals", "vegetables", "maize"],
    description: "Nitrogen-phosphorus with high sulphur"
  },
  {
    id: "yara_chapa_meli_zn",
    brand: "Chapa Meli Planting",
    company: "Yara Fertilizers",
    type: "planting",
    npk: "19-24-0",
    nutrients: { n: 19, p: 24, k: 0, s: 11, zn: 0.1 },
    crops: ["cereals", "vegetables", "maize"],
    description: "With zinc for better growth"
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
    description: "Balanced NP for general use"
  },
  {
    id: "elgon_thabiti_1730",
    brand: "Thabiti Planting Cereal",
    company: "Elgon Kenya",
    type: "planting",
    npk: "17-30-6",
    nutrients: { n: 17, p: 30, k: 6, s: 3.5, ca: 2, zn: 0.4 },
    crops: ["cereals", "maize"],
    description: "High phosphorus for cereal planting"
  },
  {
    id: "elgon_thabiti_1125_hort",
    brand: "Thabiti Planting Horticulture",
    company: "Elgon Kenya",
    type: "planting",
    npk: "11-25-6",
    nutrients: { n: 11, p: 25, k: 6, s: 4, ca: 6, mg: 0.3, zn: 0.3, b: 0.2 },
    crops: ["maize", "cereals", "horticulture"],
    description: "Complete with micronutrients"
  },
  {
    id: "elgon_102610",
    brand: "Thabiti 10-26-10",
    company: "Elgon Kenya",
    type: "planting",
    npk: "10-26-10",
    nutrients: { n: 10, p: 26, k: 10, ca: 10, mg: 4, s: 5 },
    crops: ["maize", "cereals"],
    description: "Balanced NPK with calcium and magnesium"
  },
  {
    id: "elgon_thabiti_1324",
    brand: "Thabiti Planting General",
    company: "Elgon Kenya",
    type: "planting",
    npk: "13-24-12",
    nutrients: { n: 13, p: 24, k: 12, s: 4, mg: 1, zn: 0.1 },
    crops: ["cereals", "general"],
    description: "General purpose planting fertilizer"
  },
  {
    id: "elgon_thabiti_1225_hort_special",
    brand: "Thabiti Planting Horticulture Special",
    company: "Elgon Kenya",
    type: "planting",
    npk: "12-25-12",
    nutrients: { n: 12, p: 25, k: 12, s: 3, ca: 4, zn: 0.2, b: 0.1, mn: 0.2 },
    crops: ["horticulture", "vegetables"],
    description: "Specialized for horticultural crops"
  },
  {
    id: "elgon_thabiti_1326_potato",
    brand: "Thabiti Planting Potato",
    company: "Elgon Kenya",
    type: "planting",
    npk: "13-26-13",
    nutrients: { n: 13, p: 26, k: 13, s: 3, ca: 2, mg: 1, zn: 0.2, b: 0.1, mn: 0.2 },
    crops: ["potatoes", "tubers"],
    description: "Specialized for potato crops"
  },

  // ========== MEA FERTILIZERS ==========
  {
    id: "mea_2323",
    brand: "MEA NPK 23-23-5",
    company: "MEA FERTILIZERS",
    type: "planting",
    npk: "23-23-5",
    nutrients: { n: 23, p: 23, k: 5, s: 2, ca: 0, zn: 0.2 },
    crops: ["maize", "cereals"],
    description: "Balanced NP with potassium"
  },
  {
    id: "mea_102610",
    brand: "MEA NPK 10-26-10",
    company: "MEA FERTILIZERS",
    type: "planting",
    npk: "10-26-10",
    nutrients: { n: 10, p: 26, k: 10, ca: 9 },
    crops: ["maize", "cereals"],
    description: "High phosphorus with calcium"
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
    description: "Complete with sulphur and micronutrients"
  },
  {
    id: "etg_kynopanda_plus",
    brand: "KynoPanda Plus",
    company: "ETG",
    type: "planting",
    npk: "12-46-0",
    nutrients: { n: 12, p: 46, k: 0, s: 5, zn: 0.5 },
    crops: ["cereals", "maize"],
    description: "High phosphorus for strong roots"
  },
  {
    id: "etg_kynonafaka",
    brand: "KynoNafaka",
    company: "ETG",
    type: "planting",
    npk: "18-38-0",
    nutrients: { n: 18, p: 38, k: 0, s: 5, ca: 2.3, mg: 0.2 },
    crops: ["cereals", "pulses", "horticulture"],
    description: "High phosphorus cereal fertilizer"
  },
  {
    id: "etg_kynomaizeic",
    brand: "KynoMaizeic",
    company: "ETG",
    type: "planting",
    npk: "16-29-2",
    nutrients: { n: 16, p: 29, k: 2, s: 5.7, ca: 3.9 },
    crops: ["cereals", "pulses", "horticulture", "maize"],
    description: "Specialized for maize"
  },
  {
    id: "etg_kynoch_2323",
    brand: "Kynoch NPK 23-23-0+",
    company: "ETG",
    type: "planting",
    npk: "23-23-0",
    nutrients: { n: 23, p: 23, k: 0, ca: 4, mg: 3 },
    crops: ["cereals", "pulses", "horticulture"],
    description: "Balanced NP with calcium and magnesium"
  },
  {
    id: "etg_1923",
    brand: "ETG NPK 19-23-0",
    company: "ETG",
    type: "planting",
    npk: "19-23-0",
    nutrients: { n: 19, p: 23, k: 0, s: 6, ca: 3.3, mg: 1.8 },
    crops: ["cereals", "pulses", "horticulture"],
    description: "NP with sulphur"
  },
  {
    id: "etg_2222",
    brand: "ETG NPK 22-22-0",
    company: "ETG",
    type: "planting",
    npk: "22-22-0",
    nutrients: { n: 22, p: 22, k: 0, s: 6, b: 0.1, ca: 2, mg: 1 },
    crops: ["cereals", "pulses", "horticulture"],
    description: "Balanced NP with boron"
  },
  {
    id: "etg_1625",
    brand: "ETG NPK 16-25-0",
    company: "ETG",
    type: "planting",
    npk: "16-25-0",
    nutrients: { n: 16, p: 25, k: 0, s: 7, b: 0.1, ca: 3.7, mg: 2 },
    crops: ["cereals", "pulses", "horticulture"],
    description: "NP with sulphur and boron"
  },
  {
    id: "etg_1323",
    brand: "ETG NPK 13-23-0",
    company: "ETG",
    type: "planting",
    npk: "13-23-0",
    nutrients: { n: 13, p: 23, k: 0, s: 4.8, zn: 0.34, b: 0.1, ca: 6, mg: 3.6 },
    crops: ["cereals", "pulses", "horticulture"],
    description: "NP with zinc and boron"
  },

  // ========== FANISI FERTILIZERS ==========
  {
    id: "fanisi_132610",
    brand: "FANISI NPK 13-26-10",
    company: "FANISI",
    type: "planting",
    npk: "13-26-10",
    nutrients: { n: 13, p: 26, k: 10, ca: 0, mg: 0, s: 0, zn: 0, cu: 0, b: 0, mn: 0, te: true },
    crops: ["maize", "cereals"],
    description: "With trace elements"
  },
  {
    id: "fanisi_142713",
    brand: "FANISI NPK 14-27-13",
    company: "FANISI",
    type: "planting",
    npk: "14-27-13",
    nutrients: { n: 14, p: 27, k: 13, ca: 0, mg: 0, s: 0, zn: 0, cu: 0, b: 0, mn: 0, te: true },
    crops: ["potatoes", "tubers"],
    description: "For potatoes with trace elements"
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
    description: "High phosphorus with sulphur and boron"
  },
  {
    id: "ocp_tsp",
    brand: "OCP TSP",
    company: "OCP",
    type: "planting",
    npk: "0-46-0",
    nutrients: { n: 0, p: 46, k: 0 },
    crops: ["rice", "legumes", "sugarcane", "pyrethrum", "coffee", "fruit trees"],
    description: "Triple Super Phosphate - pure phosphorus"
  },

  // ========== FOMI FERTILIZERS ==========
  {
    id: "fomi_otesha",
    brand: "FOMI OTESHA",
    company: "FOMI FERTILIZERS",
    type: "planting",
    npk: "9-29-4",
    nutrients: { n: 9, p: 29, k: 4, ca: 13, mg: 2 },
    crops: ["all crops"],
    description: "High phosphorus with calcium and magnesium"
  },

  // ========== UNIFERT KENYA ==========
  {
    id: "unifert_uniplanting_2220",
    brand: "UNIPLANTING 22-20+TE",
    company: "UNIFERT KENYA",
    type: "planting",
    npk: "22-20-0",
    nutrients: { n: 22, p: 20, k: 0, te: true },
    crops: ["many crops", "cereals"],
    description: "NP with trace elements"
  },
  {
    id: "unifert_uniplanting_1729",
    brand: "UNIPLANTING 17-29-6",
    company: "UNIFERT KENYA",
    type: "planting",
    npk: "17-29-6",
    nutrients: { n: 17, p: 29, k: 6, s: 5, ca: 2, mg: 1 },
    crops: ["all crops"],
    description: "Balanced NPK with sulphur"
  },
  {
    id: "unifert_1029",
    brand: "UNIPLANTING 10-29-6",
    company: "UNIFERT KENYA",
    type: "planting",
    npk: "10-29-6",
    nutrients: { n: 10, p: 29, k: 6 },
    crops: ["all crops"],
    description: "High phosphorus planting fertilizer"
  },

  // ========== LACHLAN FERTILIZERS ==========
  {
    id: "lachlan_1350",
    brand: "LACHLAN NP 1-35-0",
    company: "LACHLAN",
    type: "planting",
    npk: "1-35-0",
    nutrients: { n: 1, p: 35, k: 0, ca: 25, s: 5 },
    crops: ["wide range"],
    description: "High phosphorus with calcium"
  },
  {
    id: "lachlan_1250",
    brand: "LACHLAN NP 1-25-0",
    company: "LACHLAN",
    type: "planting",
    npk: "1-25-0",
    nutrients: { n: 1, p: 25, k: 0, ca: 20, mg: 3, s: 10, zn: 1, cu: 0, b: 0, te: true },
    crops: ["wide range"],
    description: "With micronutrients"
  },
  {
    id: "lachlan_1025",
    brand: "LACHLAN NP 10-25-0",
    company: "LACHLAN",
    type: "planting",
    npk: "10-25-0",
    nutrients: { n: 10, p: 25, k: 0, ca: 25, s: 6, mg: 2, zn: 0.1, cu: 0.05 },
    crops: ["acid tolerant crops"],
    description: "For acidic soils"
  },
  {
    id: "lachlan_134013",
    brand: "LACHLAN NPK 13-40-13",
    company: "LACHLAN",
    type: "planting",
    npk: "13-40-13",
    nutrients: { n: 13, p: 40, k: 13 },
    crops: ["wide range"],
    description: "Very high phosphorus"
  },

  // ========== EVERRIS/ICL FERTILIZERS ==========
  {
    id: "everris_agromaster_universal",
    brand: "AGROMASTER UNIVERSAL",
    company: "EVERRIS/ICL",
    type: "planting",
    npk: "20-30-2",
    nutrients: { n: 20, p: 30, k: 2, ca: 2.6, mg: 1, s: 7.3, b: 0.15, zn: 1 },
    crops: ["all crops"],
    description: "Complete with micronutrients"
  },
  {
    id: "everris_agromaster_energy",
    brand: "AGROMASTER ENERGY",
    company: "EVERRIS/ICL",
    type: "planting",
    npk: "15-24-10",
    nutrients: { n: 15, p: 24, k: 10, ca: 3.4, mg: 1.2, s: 9.8, b: 0.15, zn: 1 },
    crops: ["all crops"],
    description: "Balanced with potassium"
  },

  // ========== KPLUS FERTILIZERS ==========
  {
    id: "kplus_korn_kali",
    brand: "Korn-Kali",
    company: "KPLUS",
    type: "planting",
    npk: "0-0-40",
    nutrients: { n: 0, p: 0, k: 40, mg: 6, s: 5, na: 3, b: 0.25 },
    crops: ["all crops"],
    description: "Potassium with magnesium and sulphur"
  },
  {
    id: "kplus_kali_planting",
    brand: "KALI Planting",
    company: "KPLUS",
    type: "planting",
    npk: "15-31-10",
    nutrients: { n: 15, p: 31, k: 10, mg: 1.5, s: 1.3 },
    crops: ["all crops"],
    description: "Balanced NPK for planting"
  },
  {
    id: "kplus_patentkali",
    brand: "Patentkali",
    company: "KPLUS",
    type: "planting",
    npk: "0-0-30",
    nutrients: { n: 0, p: 0, k: 30, mg: 10, s: 17 },
    crops: ["all crops"],
    description: "Potassium with magnesium and sulphur"
  },

  // ========== MAISHA MINERALS ==========
  {
    id: "maisha_mavuno_102610",
    brand: "MAVUNO NPK 10-26-10",
    company: "MAISHA MINERALS",
    type: "planting",
    npk: "10-26-10",
    nutrients: { n: 10, p: 26, k: 10, s: 0, ca: 0, mg: 0 },
    crops: ["all crops"],
    description: "Balanced NPK"
  },
  {
    id: "maisha_mavuno_12340",
    brand: "MAVUNO NPK 12-34-0",
    company: "MAISHA MINERALS",
    type: "planting",
    npk: "12-34-0",
    nutrients: { n: 12, p: 34, k: 0 },
    crops: ["wheat", "barley"],
    description: "High phosphorus for wheat and barley"
  },
  {
    id: "maisha_mavuno_12307",
    brand: "MAVUNO NPK 12-30-7",
    company: "MAISHA MINERALS",
    type: "planting",
    npk: "12-30-7",
    nutrients: { n: 12, p: 30, k: 7 },
    crops: ["sugar", "sugarcane"],
    description: "For sugarcane"
  },

  // ========== COMMON BASE FERTILIZERS ==========
  {
    id: "dap",
    brand: "DAP",
    company: "Various",
    type: "planting",
    npk: "18-46-0",
    nutrients: { n: 18, p: 46, k: 0 },
    crops: ["all crops"],
    description: "Diammonium Phosphate - most common planting fertilizer"
  },
  {
    id: "npk_2323",
    brand: "NPK 23-23-0",
    company: "Various",
    type: "planting",
    npk: "23-23-0",
    nutrients: { n: 23, p: 23, k: 0 },
    crops: ["cereals", "maize"],
    description: "Balanced NP fertilizer"
  }
];

// Helper function to get fertilizers by crop
export function getPlantingFertilizersByCrop(crop: string): Fertilizer[] {
  return plantingFertilizers.filter(f =>
    f.crops.includes(crop.toLowerCase()) ||
    f.crops.includes("all crops") ||
    f.crops.includes("wide range")
  );
}

// Helper function to get fertilizer by ID
export function getPlantingFertilizerById(id: string): Fertilizer | undefined {
  return plantingFertilizers.find(f => f.id === id);
}