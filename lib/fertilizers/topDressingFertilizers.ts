// lib/fertilizers/topDressingFertilizers.ts
// Complete database of top dressing fertilizers from Kenyan suppliers

import { Fertilizer } from './plantingFertilizers';

export const topDressingFertilizers: Fertilizer[] = [
  // ========== COMMON TOP DRESSING ==========
  {
    id: "ss_can",
    brand: "CAN 27%N",
    company: "Various",
    type: "topdressing",
    npk: "27-0-0",
    nutrients: { n: 27, p: 0, k: 0, ca: 8 },
    crops: ["all crops"],
    description: "Calcium Ammonium Nitrate - most common top dressing",
    packageSizes: ["50kg bag (Ksh 2,500)", "50kg bag (Ksh 2,600)", "50kg bag (Ksh 2,700)"],
    pricePer50kg: 2600
  },
  {
    id: "ss_urea",
    brand: "UREA 46%N",
    company: "Various",
    type: "topdressing",
    npk: "46-0-0",
    nutrients: { n: 46, p: 0, k: 0 },
    crops: ["all crops"],
    description: "Urea - highest nitrogen content",
    packageSizes: ["50kg bag (Ksh 2,800)", "50kg bag (Ksh 2,900)", "50kg bag (Ksh 3,000)"],
    pricePer50kg: 2900
  },
  {
    id: "ss_as",
    brand: "AS 21%N",
    company: "Various",
    type: "topdressing",
    npk: "21-0-0",
    nutrients: { n: 21, p: 0, k: 0, s: 23 },
    crops: ["all crops"],
    description: "Ammonium Sulphate - nitrogen with sulphur",
    packageSizes: ["50kg bag (Ksh 2,200)", "50kg bag (Ksh 2,300)", "50kg bag (Ksh 2,400)"],
    pricePer50kg: 2300
  },

  // ========== YARA TOP DRESSING ==========
  {
    id: "yara_microp_topdressing",
    brand: "MiCrop + Topdressing",
    company: "YARA",
    type: "topdressing",
    npk: "34-0-3",
    nutrients: { n: 34, p: 0, k: 3, ca: 4, mg: 1, s: 4, zn: 0.1 },
    crops: ["cereals", "sugarcane", "maize"],
    description: "High nitrogen with potassium and micronutrients",
    packageSizes: ["50kg bag (Ksh 3,000)", "50kg bag (Ksh 3,200)"],
    pricePer50kg: 3100
  },
  {
    id: "yara_bela_sulfan",
    brand: "Yara Bela Sulfan",
    company: "YARA",
    type: "topdressing",
    npk: "24-0-0",
    nutrients: { n: 24, p: 0, k: 0, s: 6 },
    crops: ["cereals", "vegetables"],
    description: "Nitrogen with sulphur",
    packageSizes: ["50kg bag (Ksh 2,800)", "50kg bag (Ksh 3,000)"],
    pricePer50kg: 2900
  },

  // ========== ELGON TOP DRESSING ==========
  {
    id: "elgon_thabiti_top_40",
    brand: "Thabiti Top Dressing Cereal",
    company: "ELGON",
    type: "topdressing",
    npk: "40-0-0",
    nutrients: { n: 40, p: 0, k: 0, s: 6.5 },
    crops: ["cereals", "maize"],
    description: "High nitrogen for cereals",
    packageSizes: ["50kg bag (Ksh 2,900)", "50kg bag (Ksh 3,100)"],
    pricePer50kg: 3000
  },
  {
    id: "elgon_thabiti_top_potato",
    brand: "Thabiti Top Dressing Potato",
    company: "ELGON",
    type: "topdressing",
    npk: "24-0-24",
    nutrients: { n: 24, p: 0, k: 24, s: 4, ca: 1, mg: 0.2, zn: 0.1, b: 0.1, mn: 0.1 },
    crops: ["potatoes"],
    description: "Balanced NK for potatoes",
    packageSizes: ["50kg bag (Ksh 3,200)", "50kg bag (Ksh 3,400)"],
    pricePer50kg: 3300
  },
  {
    id: "elgon_thabiti_top_sugar",
    brand: "Thabiti Top Dressing Sugar Cane",
    company: "ELGON",
    type: "topdressing",
    npk: "26-0-20",
    nutrients: { n: 26, p: 0, k: 20, s: 2, ca: 2, zn: 0.5 },
    crops: ["sugarcane"],
    description: "High nitrogen and potassium for sugarcane",
    packageSizes: ["50kg bag (Ksh 3,100)", "50kg bag (Ksh 3,300)"],
    pricePer50kg: 3200
  },

  // ========== ETG TOP DRESSING ==========
  {
    id: "etg_kynogrowmax",
    brand: "KynoGrowMax",
    company: "ETG",
    type: "topdressing",
    npk: "30-0-10",
    nutrients: { n: 30, p: 0, k: 10, s: 4, b: 0.3, ca: 2, mg: 1 },
    crops: ["cereals", "grasses"],
    description: "Nitrogen and potassium with boron",
    packageSizes: ["50kg bag (Ksh 3,000)", "50kg bag (Ksh 3,200)"],
    pricePer50kg: 3100
  },
  {
    id: "etg_falcon_urea",
    brand: "Falcon Urea",
    company: "ETG",
    type: "topdressing",
    npk: "46-0-0",
    nutrients: { n: 46, p: 0, k: 0 },
    crops: ["cereals", "all crops"],
    description: "Pure urea - highest nitrogen content",
    packageSizes: ["50kg bag (Ksh 2,850)", "50kg bag (Ksh 2,950)"],
    pricePer50kg: 2900
  },

  // ========== POTASSIUM FERTILIZERS ==========
  {
    id: "mop",
    brand: "MOP",
    company: "Various",
    type: "topdressing",
    npk: "0-0-60",
    nutrients: { n: 0, p: 0, k: 60 },
    crops: ["all crops"],
    description: "Muriate of Potash - high potassium",
    packageSizes: ["50kg bag (Ksh 2,800)", "50kg bag (Ksh 2,900)"],
    pricePer50kg: 2850
  },
  {
    id: "sop",
    brand: "SOP",
    company: "Various",
    type: "topdressing",
    npk: "0-0-50",
    nutrients: { n: 0, p: 0, k: 50, s: 18 },
    crops: ["all crops"],
    description: "Sulphate of Potash - potassium with sulphur",
    packageSizes: ["50kg bag (Ksh 3,200)", "50kg bag (Ksh 3,400)"],
    pricePer50kg: 3300
  },
  {
    id: "kplus_korn_kali",
    brand: "Korn-Kali",
    company: "KPLUS",
    type: "topdressing",
    npk: "0-0-40",
    nutrients: { n: 0, p: 0, k: 40, mg: 6, s: 5, na: 3, b: 0.25 },
    crops: ["all crops"],
    description: "Potassium with magnesium and sulphur",
    packageSizes: ["50kg bag (Ksh 2,900)", "50kg bag (Ksh 3,100)"],
    pricePer50kg: 3000
  }
];

// Helper function to get top dressing fertilizers by crop
export function getTopDressingFertilizersByCrop(crop: string): Fertilizer[] {
  return topDressingFertilizers.filter(f =>
    f.crops.includes(crop.toLowerCase()) ||
    f.crops.includes("all crops") ||
    f.crops.includes("general") ||
    f.crops.includes("cereals") && ["maize", "sorghum", "finger millet", "wheat"].includes(crop.toLowerCase())
  );
}

// Helper function to get top dressing fertilizer by ID
export function getTopDressingFertilizerById(id: string): Fertilizer | undefined {
  return topDressingFertilizers.find(f => f.id === id);
}