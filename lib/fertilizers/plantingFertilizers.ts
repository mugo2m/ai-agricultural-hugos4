// lib/fertilizers/plantingFertilizers.ts
// Complete database of planting fertilizers from Kenyan suppliers
// UPDATED: Added crop-specific recommendations for all 47 crops

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
  applicationRate?: string; // Recommended rate per acre
  timing?: string; // When to apply
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
    crops: [
      "maize", "beans", "soya beans", "sunflower", "cotton", "sugarcane",
      "potatoes", "tomatoes", "onions", "rice", "mangoes", "avocados",
      "coffee", "chillies", "capsicums", "yams", "taro", "okra",
      "pigeonpeas", "french beans", "cowpeas", "green grams",
      "all crops", "cereals", "legumes", "vegetables", "fruits"
    ],
    description: "Diammonium Phosphate - most common planting fertilizer for root development",
    packageSizes: ["50kg bag (Ksh 3,300)", "50kg bag (Ksh 3,500)", "50kg bag (Ksh 3,800)"],
    pricePer50kg: 3500,
    applicationRate: "50-100 kg/acre depending on crop",
    timing: "At planting, banded 5cm from seed"
  },

  {
    id: "tsp",
    brand: "TSP",
    company: "Various",
    type: "planting",
    npk: "0-46-0",
    nutrients: { n: 0, p: 46, k: 0 },
    crops: [
      "beans", "groundnuts", "cassava", "bananas", "coffee", "tea",
      "bambaranuts", "pigeonpeas", "soya beans", "cowpeas",
      "legumes", "tubers", "fruits"
    ],
    description: "Triple Super Phosphate - pure phosphorus for legumes and root crops",
    packageSizes: ["50kg bag (Ksh 3,200)", "50kg bag (Ksh 3,400)"],
    pricePer50kg: 3300,
    applicationRate: "50-200 kg/acre",
    timing: "At planting, incorporate into soil"
  },

  {
    id: "ssp",
    brand: "SSP",
    company: "Various",
    type: "planting",
    npk: "0-20-0",
    nutrients: { n: 0, p: 20, k: 0, s: 12 },
    crops: [
      "maize", "beans", "groundnuts", "sugarcane", "coffee", "tea",
      "bambaranuts", "pigeonpeas", "all crops"
    ],
    description: "Single Super Phosphate - phosphorus with sulphur for soil improvement",
    packageSizes: ["50kg bag (Ksh 2,800)", "50kg bag (Ksh 3,000)"],
    pricePer50kg: 2900,
    applicationRate: "100-200 kg/acre",
    timing: "At planting or before planting"
  },

  {
    id: "npk_2323",
    brand: "NPK 23-23-0",
    company: "Various",
    type: "planting",
    npk: "23-23-0",
    nutrients: { n: 23, p: 23, k: 0 },
    crops: ["maize", "sorghum", "finger millet", "wheat", "barley", "cereals"],
    description: "Balanced NP fertilizer for cereals",
    packageSizes: ["50kg bag (Ksh 3,000)", "50kg bag (Ksh 3,200)"],
    pricePer50kg: 3100,
    applicationRate: "50-100 kg/acre",
    timing: "At planting"
  },

  {
    id: "npk_2020",
    brand: "NPK 20-20-0",
    company: "Various",
    type: "planting",
    npk: "20-20-0",
    nutrients: { n: 20, p: 20, k: 0 },
    crops: ["maize", "sorghum", "wheat", "barley", "cereals"],
    description: "Balanced NP fertilizer",
    packageSizes: ["50kg bag (Ksh 2,900)", "50kg bag (Ksh 3,100)"],
    pricePer50kg: 3000,
    applicationRate: "50-100 kg/acre",
    timing: "At planting"
  },

  {
    id: "npk_171717",
    brand: "NPK 17-17-17",
    company: "Various",
    type: "planting",
    npk: "17-17-17",
    nutrients: { n: 17, p: 17, k: 17 },
    crops: [
      "tomatoes", "capsicums", "chillies", "cabbages", "kales", "spinach",
      "macadamia", "coffee", "cocoa", "bananas", "pineapples", "watermelons",
      "fruits", "vegetables", "horticulture"
    ],
    description: "Balanced NPK for horticultural crops",
    packageSizes: ["50kg bag (Ksh 3,500)", "50kg bag (Ksh 3,800)"],
    pricePer50kg: 3600,
    applicationRate: "50-150 kg/acre",
    timing: "At planting for annuals, at start of rains for perennials"
  },

  {
    id: "npk_202020",
    brand: "NPK 20-20-20",
    company: "Various",
    type: "planting",
    npk: "20-20-20",
    nutrients: { n: 20, p: 20, k: 20 },
    crops: [
      "watermelons", "tomatoes", "peppers", "vegetables", "fruits",
      "horticulture", "pineapples"
    ],
    description: "Water-soluble complete fertilizer for high-value crops",
    packageSizes: ["25kg bag (Ksh 2,500)", "50kg bag (Ksh 4,800)"],
    pricePer50kg: 4800,
    applicationRate: "20-50 kg/acre through fertigation",
    timing: "Split applications during growing season"
  },

  {
    id: "npk_2555",
    brand: "NPK 25-5-5",
    company: "Various",
    type: "planting",
    npk: "25-5-5",
    nutrients: { n: 25, p: 5, k: 5 },
    crops: ["tea", "coffee", "pyrethrum"],
    description: "High nitrogen for tea and coffee",
    packageSizes: ["50kg bag (Ksh 3,200)", "50kg bag (Ksh 3,500)"],
    pricePer50kg: 3400,
    applicationRate: "100-200 kg/acre annually",
    timing: "Split applications during rainy seasons"
  },

  {
    id: "npk_201010",
    brand: "NPK 20-10-10",
    company: "Various",
    type: "planting",
    npk: "20-10-10",
    nutrients: { n: 20, p: 10, k: 10 },
    crops: ["cocoa", "bananas", "pineapples", "mangoes", "citrus"],
    description: "Balanced for fruit trees",
    packageSizes: ["50kg bag (Ksh 3,400)", "50kg bag (Ksh 3,600)"],
    pricePer50kg: 3500,
    applicationRate: "100-300 g per tree",
    timing: "At start of rainy seasons"
  },

  {
    id: "npk_151515",
    brand: "Compound 15-15-15",
    company: "Various",
    type: "planting",
    npk: "15-15-15",
    nutrients: { n: 15, p: 15, k: 15, s: 2.5 },
    crops: [
      "pineapples", "vegetables", "fruits", "ornamentals",
      "general purpose", "all crops"
    ],
    description: "All-purpose compound fertilizer",
    packageSizes: ["50kg bag (Ksh 3,200)", "50kg bag (Ksh 3,400)"],
    pricePer50kg: 3300,
    applicationRate: "50-150 kg/acre",
    timing: "At planting or early growth"
  },

  // ========== YARA FERTILIZERS ==========
  {
    id: "yara_power",
    brand: "Yara Mila Power",
    company: "Yara Fertilizers",
    type: "planting",
    npk: "13-24-12",
    nutrients: { n: 13, p: 24, k: 12, mg: 2, s: 4.5, zn: 0.02 },
    crops: [
      "maize", "wheat", "barley", "sorghum", "cereals",
      "tomatoes", "vegetables", "potatoes"
    ],
    description: "Complete planting fertilizer with magnesium and zinc",
    packageSizes: ["50kg bag (Ksh 3,800)", "50kg bag (Ksh 4,000)"],
    pricePer50kg: 3900,
    applicationRate: "50-100 kg/acre",
    timing: "At planting"
  },

  {
    id: "yara_microp_planting",
    brand: "MiCrop + Planting",
    company: "Yara Fertilizers",
    type: "planting",
    npk: "11-28-4.5",
    nutrients: { n: 11, p: 28, k: 4.5, ca: 6, mg: 2, s: 7, zn: 0.1 },
    crops: ["maize", "wheat", "barley", "cereals", "potatoes", "root crops"],
    description: "High phosphorus for root development",
    packageSizes: ["50kg bag (Ksh 3,600)", "50kg bag (Ksh 3,800)"],
    pricePer50kg: 3700,
    applicationRate: "50-75 kg/acre",
    timing: "At planting"
  },

  {
    id: "yara_npk_12_24_12",
    brand: "Yara NPK 12-24-12",
    company: "Yara Fertilizers",
    type: "planting",
    npk: "12-24-12",
    nutrients: { n: 12, p: 24, k: 12, s: 4, mg: 1.2 },
    crops: ["cereals", "vegetables", "potatoes", "horticulture"],
    description: "Balanced NPK for general use",
    packageSizes: ["50kg bag (Ksh 3,500)", "50kg bag (Ksh 3,700)"],
    pricePer50kg: 3600,
    applicationRate: "50-100 kg/acre",
    timing: "At planting"
  },

  // ========== ELGON KENYA ==========
  {
    id: "elgon_thabiti_2323",
    brand: "Thabiti Super 23-23-0",
    company: "Elgon Kenya",
    type: "planting",
    npk: "23-23-0",
    nutrients: { n: 23, p: 23, k: 0, s: 3, ca: 4, zn: 0.5 },
    crops: ["maize", "wheat", "barley", "sorghum", "cereals", "general"],
    description: "Balanced NP for cereals with sulphur and zinc",
    packageSizes: ["50kg bag (Ksh 3,200)", "50kg bag (Ksh 3,400)"],
    pricePer50kg: 3300,
    applicationRate: "50-100 kg/acre",
    timing: "At planting"
  },

  {
    id: "elgon_thabiti_1730",
    brand: "Thabiti Planting Cereal",
    company: "Elgon Kenya",
    type: "planting",
    npk: "17-30-6",
    nutrients: { n: 17, p: 30, k: 6, s: 3.5, ca: 2, zn: 0.4 },
    crops: ["maize", "sorghum", "millet", "wheat", "cereals"],
    description: "High phosphorus for cereal planting",
    packageSizes: ["50kg bag (Ksh 3,500)", "50kg bag (Ksh 3,700)"],
    pricePer50kg: 3600,
    applicationRate: "50-75 kg/acre",
    timing: "At planting"
  },

  {
    id: "elgon_thabiti_1326_potato",
    brand: "Thabiti Planting Potato",
    company: "Elgon Kenya",
    type: "planting",
    npk: "13-26-13",
    nutrients: { n: 13, p: 26, k: 13, s: 3, ca: 2, mg: 1, zn: 0.2, b: 0.1, mn: 0.2 },
    crops: ["potatoes", "yams", "taro", "cassava", "sweet potatoes", "tubers"],
    description: "Specialized for potato and tuber crops with complete micronutrients",
    packageSizes: ["50kg bag (Ksh 3,600)", "50kg bag (Ksh 3,800)"],
    pricePer50kg: 3700,
    applicationRate: "200-300 kg/acre",
    timing: "At planting, banded near seed tubers"
  },

  {
    id: "elgon_thabiti_hort",
    brand: "Thabiti Hort Special",
    company: "Elgon Kenya",
    type: "planting",
    npk: "12-24-12",
    nutrients: { n: 12, p: 24, k: 12, s: 3, ca: 2, mg: 1.5, zn: 0.3, b: 0.1 },
    crops: [
      "tomatoes", "capsicums", "chillies", "onions", "cabbages", "kales",
      "spinach", "okra", "french beans", "garden peas", "vegetables"
    ],
    description: "Complete fertilizer for horticultural crops",
    packageSizes: ["50kg bag (Ksh 3,500)", "50kg bag (Ksh 3,700)"],
    pricePer50kg: 3600,
    applicationRate: "50-150 kg/acre",
    timing: "At transplanting or planting"
  },

  {
    id: "elgon_thabiti_fruit",
    brand: "Thabiti Fruit Special",
    company: "Elgon Kenya",
    type: "planting",
    npk: "10-20-20",
    nutrients: { n: 10, p: 20, k: 20, s: 2.5, mg: 1.5, zn: 0.3, b: 0.2 },
    crops: [
      "bananas", "oranges", "mangoes", "avocados", "pineapples", "pawpaws",
      "passion fruit", "citrus", "watermelons", "macadamia", "fruits"
    ],
    description: "High potassium for fruit development",
    packageSizes: ["50kg bag (Ksh 3,800)", "50kg bag (Ksh 4,000)"],
    pricePer50kg: 3900,
    applicationRate: "200-500g per tree",
    timing: "At planting and annually during rainy seasons"
  },

  // ========== ETG FERTILIZERS ==========
  {
    id: "etg_kynopanda",
    brand: "KynoPanda Power",
    company: "ETG",
    type: "planting",
    npk: "10-25-10",
    nutrients: { n: 10, p: 25, k: 10, s: 7, zn: 0.5, ca: 4.5, mg: 1.3 },
    crops: ["maize", "beans", "wheat", "cereals", "pulses", "horticulture"],
    description: "Complete with sulphur and micronutrients",
    packageSizes: ["50kg bag (Ksh 3,400)", "50kg bag (Ksh 3,600)"],
    pricePer50kg: 3500,
    applicationRate: "50-100 kg/acre",
    timing: "At planting"
  },

  {
    id: "etg_kynomaizeic",
    brand: "KynoMaizeic",
    company: "ETG",
    type: "planting",
    npk: "16-29-2",
    nutrients: { n: 16, p: 29, k: 2, s: 5.7, ca: 3.9 },
    crops: ["maize", "sorghum", "millet", "wheat", "cereals"],
    description: "Specialized for maize with high phosphorus",
    packageSizes: ["50kg bag (Ksh 3,500)", "50kg bag (Ksh 3,700)"],
    pricePer50kg: 3600,
    applicationRate: "50-75 kg/acre",
    timing: "At planting"
  },

  {
    id: "etg_kynovegetable",
    brand: "KynoVegetable",
    company: "ETG",
    type: "planting",
    npk: "15-15-15",
    nutrients: { n: 15, p: 15, k: 15, s: 3, zn: 0.2, b: 0.1 },
    crops: [
      "tomatoes", "onions", "cabbages", "kales", "capsicums", "chillies",
      "spinach", "okra", "french beans", "vegetables"
    ],
    description: "Balanced NPK for vegetables",
    packageSizes: ["50kg bag (Ksh 3,300)", "50kg bag (Ksh 3,500)"],
    pricePer50kg: 3400,
    applicationRate: "50-150 kg/acre",
    timing: "At planting or transplanting"
  },

  {
    id: "etg_kynofruit",
    brand: "KynoFruit",
    company: "ETG",
    type: "planting",
    npk: "12-12-17",
    nutrients: { n: 12, p: 12, k: 17, s: 2, mg: 1.5, zn: 0.2 },
    crops: [
      "bananas", "mangoes", "avocados", "oranges", "pineapples",
      "watermelons", "passion fruit", "fruits"
    ],
    description: "High potassium for fruit crops",
    packageSizes: ["50kg bag (Ksh 3,600)", "50kg bag (Ksh 3,800)"],
    pricePer50kg: 3700,
    applicationRate: "200-400g per tree",
    timing: "At planting and during fruit development"
  },

  // ========== OCP FERTILIZERS ==========
  {
    id: "ocp_npsb",
    brand: "OCP NPSB",
    company: "OCP",
    type: "planting",
    npk: "18.9-37.7-0",
    nutrients: { n: 18.9, p: 37.7, k: 0, s: 6.9, b: 0.1 },
    crops: [
      "maize", "wheat", "barley", "sugarcane", "coffee", "tea",
      "potatoes", "cassava", "vegetables", "cereals", "horticulture"
    ],
    description: "High phosphorus with sulphur and boron",
    packageSizes: ["50kg bag (Ksh 3,600)", "50kg bag (Ksh 3,800)"],
    pricePer50kg: 3700,
    applicationRate: "50-100 kg/acre",
    timing: "At planting"
  },

  {
    id: "ocp_npk_121212",
    brand: "OCP NPK 12-12-12",
    company: "OCP",
    type: "planting",
    npk: "12-12-12",
    nutrients: { n: 12, p: 12, k: 12, s: 3, b: 0.1, zn: 0.1 },
    crops: ["cereals", "vegetables", "fruits", "legumes", "general", "all crops"],
    description: "Balanced NPK with micronutrients",
    packageSizes: ["50kg bag (Ksh 3,200)", "50kg bag (Ksh 3,400)"],
    pricePer50kg: 3300,
    applicationRate: "50-150 kg/acre",
    timing: "At planting or early growth"
  },

  {
    id: "ocp_tsp",
    brand: "OCP TSP",
    company: "OCP",
    type: "planting",
    npk: "0-46-0",
    nutrients: { n: 0, p: 46, k: 0 },
    crops: [
      "rice", "legumes", "sugarcane", "coffee", "tea", "fruit trees",
      "bambaranuts", "pigeonpeas", "groundnuts", "beans"
    ],
    description: "Triple Super Phosphate - pure phosphorus",
    packageSizes: ["50kg bag (Ksh 3,200)", "50kg bag (Ksh 3,400)"],
    pricePer50kg: 3300,
    applicationRate: "50-200 kg/acre",
    timing: "At planting, incorporated into soil"
  },

  {
    id: "ocp_kieserite",
    brand: "OCP Kieserite",
    company: "OCP",
    type: "planting",
    npk: "0-0-0",
    nutrients: { mg: 25, s: 20 },
    crops: ["tea", "coffee", "potatoes", "vegetables", "fruits"],
    description: "Magnesium and sulphur supplement",
    packageSizes: ["50kg bag (Ksh 2,200)", "50kg bag (Ksh 2,400)"],
    pricePer50kg: 2300,
    applicationRate: "25-50 kg/acre",
    timing: "At planting or as topdressing"
  },

  // ========== CROP-SPECIFIC SPECIALTY FERTILIZERS ==========

  // Rice
  {
    id: "mea_rice_planting",
    brand: "MEA Rice Special",
    company: "MEA Fertilizers",
    type: "planting",
    npk: "16-20-0",
    nutrients: { n: 16, p: 20, k: 0, s: 4, zn: 1 },
    crops: ["rice"],
    description: "Specialized for rice with zinc for wetland conditions",
    packageSizes: ["50kg bag (Ksh 3,400)", "50kg bag (Ksh 3,600)"],
    pricePer50kg: 3500,
    applicationRate: "50-75 kg/acre",
    timing: "At transplanting or seeding"
  },

  // Pineapple
  {
    id: "mea_pineapple",
    brand: "MEA Pineapple Special",
    company: "MEA Fertilizers",
    type: "planting",
    npk: "10-20-20",
    nutrients: { n: 10, p: 20, k: 20, mg: 2, zn: 0.5, fe: 0.2 },
    crops: ["pineapples"],
    description: "High potassium for pineapple fruit development",
    packageSizes: ["50kg bag (Ksh 4,000)", "50kg bag (Ksh 4,200)"],
    pricePer50kg: 4100,
    applicationRate: "300 kg/acre",
    timing: "At planting and 6 months after planting"
  },

  // Tea
  {
    id: "mea_tea_planting",
    brand: "MEA Tea Planting",
    company: "MEA Fertilizers",
    type: "planting",
    npk: "20-5-5",
    nutrients: { n: 20, p: 5, k: 5, s: 3, mg: 1 },
    crops: ["tea"],
    description: "High nitrogen for young tea plants",
    packageSizes: ["50kg bag (Ksh 3,200)", "50kg bag (Ksh 3,400)"],
    pricePer50kg: 3300,
    applicationRate: "100 g per plant",
    timing: "At planting and during rains"
  },

  // Coffee
  {
    id: "mea_coffee_planting",
    brand: "MEA Coffee Planting",
    company: "MEA Fertilizers",
    type: "planting",
    npk: "17-17-17",
    nutrients: { n: 17, p: 17, k: 17, s: 2, zn: 0.3, b: 0.1 },
    crops: ["coffee"],
    description: "Balanced NPK for coffee establishment",
    packageSizes: ["50kg bag (Ksh 3,600)", "50kg bag (Ksh 3,800)"],
    pricePer50kg: 3700,
    applicationRate: "150-200 g per tree",
    timing: "At planting and annually"
  },

  // Macadamia
  {
    id: "mea_macadamia",
    brand: "MEA Macadamia Special",
    company: "MEA Fertilizers",
    type: "planting",
    npk: "10-20-15",
    nutrients: { n: 10, p: 20, k: 15, s: 2, mg: 1.5, zn: 0.3, b: 0.2 },
    crops: ["macadamia"],
    description: "Complete nutrition for macadamia trees",
    packageSizes: ["50kg bag (Ksh 4,200)", "50kg bag (Ksh 4,500)"],
    pricePer50kg: 4300,
    applicationRate: "200-500g per tree",
    timing: "At planting and twice yearly"
  },

  // Cocoa
  {
    id: "mea_cocoa",
    brand: "MEA Cocoa Special",
    company: "MEA Fertilizers",
    type: "planting",
    npk: "15-15-15",
    nutrients: { n: 15, p: 15, k: 15, mg: 2, zn: 0.2, cu: 0.1 },
    crops: ["cocoa"],
    description: "Balanced nutrition for cocoa",
    packageSizes: ["50kg bag (Ksh 3,800)", "50kg bag (Ksh 4,000)"],
    pricePer50kg: 3900,
    applicationRate: "150-200g per tree",
    timing: "At planting and during rains"
  },

  // Watermelon
  {
    id: "mea_watermelon",
    brand: "MEA Watermelon Special",
    company: "MEA Fertilizers",
    type: "planting",
    npk: "12-24-12",
    nutrients: { n: 12, p: 24, k: 12, mg: 1, zn: 0.2, b: 0.1 },
    crops: ["watermelons"],
    description: "High phosphorus for watermelon root development",
    packageSizes: ["50kg bag (Ksh 3,800)", "50kg bag (Ksh 4,000)"],
    pricePer50kg: 3900,
    applicationRate: "50-100 kg/acre",
    timing: "At planting"
  },

  // Yams
  {
    id: "mea_yams",
    brand: "MEA Yams Special",
    company: "MEA Fertilizers",
    type: "planting",
    npk: "10-20-20",
    nutrients: { n: 10, p: 20, k: 20, mg: 1.5, zn: 0.3 },
    crops: ["yams", "taro"],
    description: "High potassium for tuber development",
    packageSizes: ["50kg bag (Ksh 3,600)", "50kg bag (Ksh 3,800)"],
    pricePer50kg: 3700,
    applicationRate: "50-75 g per hole",
    timing: "At planting"
  },

  // Okra
  {
    id: "mea_okra",
    brand: "MEA Okra Special",
    company: "MEA Fertilizers",
    type: "planting",
    npk: "15-15-15",
    nutrients: { n: 15, p: 15, k: 15, zn: 0.2 },
    crops: ["okra", "french beans", "garden peas"],
    description: "Balanced NPK for pod development",
    packageSizes: ["50kg bag (Ksh 3,400)", "50kg bag (Ksh 3,600)"],
    pricePer50kg: 3500,
    applicationRate: "50-75 kg/acre",
    timing: "At planting"
  },

  // Chillies
  {
    id: "mea_chillies",
    brand: "MEA Chillies Special",
    company: "MEA Fertilizers",
    type: "planting",
    npk: "12-12-17",
    nutrients: { n: 12, p: 12, k: 17, mg: 1.5, zn: 0.2, b: 0.1 },
    crops: ["chillies", "capsicums"],
    description: "High potassium for fruit quality",
    packageSizes: ["50kg bag (Ksh 3,800)", "50kg bag (Ksh 4,000)"],
    pricePer50kg: 3900,
    applicationRate: "50-100 kg/acre",
    timing: "At transplanting"
  },

  // Carrots
  {
    id: "mea_carrots",
    brand: "MEA Carrots Special",
    company: "MEA Fertilizers",
    type: "planting",
    npk: "10-20-20",
    nutrients: { n: 10, p: 20, k: 20, b: 0.2 },
    crops: ["carrots"],
    description: "High potassium for root development",
    packageSizes: ["50kg bag (Ksh 3,500)", "50kg bag (Ksh 3,700)"],
    pricePer50kg: 3600,
    applicationRate: "50-75 kg/acre",
    timing: "At planting"
  }
];

// Helper function to get fertilizers by crop
export function getPlantingFertilizersByCrop(crop: string): Fertilizer[] {
  const lowerCrop = crop.toLowerCase();

  return plantingFertilizers.filter(f => {
    // Direct match
    if (f.crops.includes(lowerCrop)) return true;

    // Category matches
    if (f.crops.includes("all crops")) return true;
    if (f.crops.includes("general")) return true;

    // Cereals
    const cereals = ["maize", "sorghum", "finger millet", "wheat", "barley", "rice"];
    if (cereals.includes(lowerCrop) && f.crops.includes("cereals")) return true;

    // Legumes
    const legumes = ["beans", "soya beans", "cowpeas", "green grams", "groundnuts", "pigeonpeas", "bambaranuts"];
    if (legumes.includes(lowerCrop) && f.crops.includes("legumes")) return true;

    // Vegetables
    const vegetables = ["tomatoes", "kales", "cabbages", "onions", "capsicums", "chillies", "spinach", "okra", "french beans", "garden peas", "carrots"];
    if (vegetables.includes(lowerCrop) && f.crops.includes("vegetables")) return true;

    // Fruits
    const fruits = ["bananas", "oranges", "mangoes", "avocados", "pineapples", "pawpaws", "passion fruit", "citrus", "watermelons"];
    if (fruits.includes(lowerCrop) && f.crops.includes("fruits")) return true;

    // Tubers
    const tubers = ["potatoes", "sweet potatoes", "cassava", "yams", "taro"];
    if (tubers.includes(lowerCrop) && f.crops.includes("tubers")) return true;

    // Horticulture
    const horticulture = [...vegetables, ...fruits];
    if (horticulture.includes(lowerCrop) && f.crops.includes("horticulture")) return true;

    return false;
  });
}

// Helper function to get fertilizer by ID
export function getPlantingFertilizerById(id: string): Fertilizer | undefined {
  return plantingFertilizers.find(f => f.id === id);
}

// Helper function to get recommended fertilizers for specific crop and soil type
export function getRecommendedPlantingFertilizers(
  crop: string,
  soilTest?: { p: number; k: number; ph: number }
): Fertilizer[] {
  const allForCrop = getPlantingFertilizersByCrop(crop);

  if (!soilTest) return allForCrop;

  // Sort by suitability based on soil test
  return allForCrop.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    // Phosphorus rating
    if (soilTest.p < 15) {
      // Low P - prefer high P fertilizers
      if (a.nutrients.p > 40) scoreA += 10;
      if (b.nutrients.p > 40) scoreB += 10;
    } else if (soilTest.p > 30) {
      // High P - avoid extra P
      if (a.nutrients.p < 20) scoreA += 5;
      if (b.nutrients.p < 20) scoreB += 5;
    }

    // Potassium rating
    if (soilTest.k < 100) {
      // Low K - prefer fertilizers with K
      if (a.nutrients.k > 10) scoreA += 5;
      if (b.nutrients.k > 10) scoreB += 5;
    }

    // pH consideration
    if (soilTest.ph < 5.5) {
      // Acidic soil - prefer fertilizers with calcium
      if (a.nutrients.ca && a.nutrients.ca > 5) scoreA += 3;
      if (b.nutrients.ca && b.nutrients.ca > 5) scoreB += 3;
    }

    return scoreB - scoreA; // Higher score first
  });
}