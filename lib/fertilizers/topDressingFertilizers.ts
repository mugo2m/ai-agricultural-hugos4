// lib/fertilizers/topDressingFertilizers.ts
// Complete database of top dressing fertilizers from Kenyan suppliers

import { Fertilizer } from './plantingFertilizers';

export const topDressingFertilizers: Fertilizer[] = [
  // ========== YARA TOP DRESSING ==========
  {
    id: "yara_microp_topdressing",
    brand: "MiCrop + Topdressing",
    company: "YARA",
    type: "topdressing",
    npk: "34-0-3",
    nutrients: { n: 34, p: 0, k: 3, ca: 4, mg: 1, s: 4, zn: 0.1 },
    crops: ["cereals", "sugarcane", "maize"],
    description: "High nitrogen with potassium and micronutrients"
  },
  {
    id: "yara_microp_topdress_core",
    brand: "MiCrop Topdress Core",
    company: "YARA",
    type: "topdressing",
    npk: "40-0-0",
    nutrients: { n: 40, p: 0, k: 0, s: 6, zn: 0.1 },
    crops: ["cereals", "sugarcane", "maize"],
    description: "High nitrogen with sulphur and zinc"
  },
  {
    id: "yara_vera_amidas",
    brand: "Yara Vera Amidas",
    company: "YARA",
    type: "topdressing",
    npk: "40-0-0",
    nutrients: { n: 40, p: 0, k: 0, s: 6 },
    crops: ["cereals", "sugarcane", "maize"],
    description: "High nitrogen with sulphur"
  },
  {
    id: "yara_bela_sulfan",
    brand: "Yara Bela Sulfan",
    company: "YARA",
    type: "topdressing",
    npk: "24-0-0",
    nutrients: { n: 24, p: 0, k: 0, s: 6 },
    crops: ["cereals", "vegetables"],
    description: "Nitrogen with sulphur"
  },
  {
    id: "yara_chapa_meli_top",
    brand: "Chapa Meli Topdressing",
    company: "YARA",
    type: "topdressing",
    npk: "26-0-0",
    nutrients: { n: 26, p: 0, k: 0, s: 19 },
    crops: ["cereals", "sugarcane"],
    description: "Nitrogen with high sulphur"
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
    description: "High nitrogen for cereals"
  },
  {
    id: "elgon_thabiti_top_potato",
    brand: "Thabiti Top Dressing Potato",
    company: "ELGON",
    type: "topdressing",
    npk: "24-0-24",
    nutrients: { n: 24, p: 0, k: 24, s: 4, ca: 1, mg: 0.2, zn: 0.1, b: 0.1, mn: 0.1 },
    crops: ["potatoes"],
    description: "Balanced NK for potatoes"
  },
  {
    id: "elgon_thabiti_top_rice",
    brand: "Thabiti Top Dressing Rice",
    company: "ELGON",
    type: "topdressing",
    npk: "30-1-11",
    nutrients: { n: 30, p: 1, k: 11, s: 4, ca: 2.5, mg: 1 },
    crops: ["rice"],
    description: "For rice with potassium"
  },
  {
    id: "elgon_thabiti_top_sugar",
    brand: "Thabiti Top Dressing Sugar Cane",
    company: "ELGON",
    type: "topdressing",
    npk: "26-0-20",
    nutrients: { n: 26, p: 0, k: 20, s: 2, ca: 2, zn: 0.5 },
    crops: ["sugarcane"],
    description: "High nitrogen and potassium for sugarcane"
  },
  {
    id: "elgon_thabiti_top_general_26",
    brand: "Thabiti Top Dressing General 26-0-2",
    company: "ELGON",
    type: "topdressing",
    npk: "26-0-2",
    nutrients: { n: 26, p: 0, k: 2 },
    crops: ["general"],
    description: "General purpose top dressing"
  },
  {
    id: "elgon_thabiti_top_general_40",
    brand: "Thabiti Top Dressing General 40-0-2",
    company: "ELGON",
    type: "topdressing",
    npk: "40-0-2",
    nutrients: { n: 40, p: 0, k: 2 },
    crops: ["general"],
    description: "High nitrogen general purpose"
  },

  // ========== MEA TOP DRESSING ==========
  {
    id: "mea_2607",
    brand: "MEA NPK 26-0-0+7S",
    company: "MEA",
    type: "topdressing",
    npk: "26-0-0",
    nutrients: { n: 26, p: 0, k: 0, s: 7 },
    crops: ["cereals", "maize"],
    description: "Nitrogen with sulphur"
  },
  {
    id: "mea_231010",
    brand: "MEA NPK 23-10-10",
    company: "MEA",
    type: "topdressing",
    npk: "23-10-10",
    nutrients: { n: 23, p: 10, k: 10 },
    crops: ["rice"],
    description: "Balanced NPK for rice"
  },
  {
    id: "mea_242310",
    brand: "MEA NPK 24-23-10",
    company: "MEA",
    type: "topdressing",
    npk: "24-23-10",
    nutrients: { n: 24, p: 23, k: 10 },
    crops: ["maize"],
    description: "High NPK for maize"
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
    description: "Nitrogen and potassium with boron"
  },
  {
    id: "etg_kynokuza",
    brand: "KynoKuza",
    company: "ETG",
    type: "topdressing",
    npk: "20-4-20",
    nutrients: { n: 20, p: 4, k: 20, s: 4, b: 0.3, ca: 2, mg: 1 },
    crops: ["all crops"],
    description: "Balanced NK with phosphorus"
  },
  {
    id: "etg_kynoplus_s",
    brand: "KynoPlus S",
    company: "ETG",
    type: "topdressing",
    npk: "40-0-0",
    nutrients: { n: 40, p: 0, k: 0, s: 6 },
    crops: ["cereals", "tubers"],
    description: "High nitrogen with sulphur"
  },
  {
    id: "etg_falcon_urea",
    brand: "Falcon Urea",
    company: "ETG",
    type: "topdressing",
    npk: "46-0-0",
    nutrients: { n: 46, p: 0, k: 0 },
    crops: ["cereals", "all crops"],
    description: "Pure urea - highest nitrogen content"
  },

  // ========== SUPPLIES & SERVICES ==========
  {
    id: "ss_can",
    brand: "CAN 26%N",
    company: "SUPPLIES & SERVICES",
    type: "topdressing",
    npk: "26-0-0",
    nutrients: { n: 26, p: 0, k: 0, ca: 8 }, // CAN contains calcium
    crops: ["all crops"],
    description: "Calcium Ammonium Nitrate"
  },
  {
    id: "ss_urea",
    brand: "UREA 46%N",
    company: "SUPPLIES & SERVICES",
    type: "topdressing",
    npk: "46-0-0",
    nutrients: { n: 46, p: 0, k: 0 },
    crops: ["all crops"],
    description: "Urea - highest nitrogen content"
  },
  {
    id: "ss_as",
    brand: "AS 21%N",
    company: "SUPPLIES & SERVICES",
    type: "topdressing",
    npk: "21-0-0",
    nutrients: { n: 21, p: 0, k: 0, s: 23 }, // AS provides 23% S
    crops: ["all crops"],
    description: "Ammonium Sulphate - nitrogen with sulphur"
  },

  // ========== FANISI TOP DRESSING ==========
  {
    id: "fanisi_2600",
    brand: "FANISI NPK 26-0-0",
    company: "FANISI",
    type: "topdressing",
    npk: "26-0-0",
    nutrients: { n: 26, p: 0, k: 0, te: true },
    crops: ["maize"],
    description: "Nitrogen with trace elements"
  },
  {
    id: "fanisi_30310",
    brand: "FANISI NPK 30-3-10",
    company: "FANISI",
    type: "topdressing",
    npk: "30-3-10",
    nutrients: { n: 30, p: 3, k: 10, te: true },
    crops: ["sugarcane"],
    description: "For sugarcane with trace elements"
  },
  {
    id: "fanisi_201020",
    brand: "FANISI NPK 20-10-20",
    company: "FANISI",
    type: "topdressing",
    npk: "20-10-20",
    nutrients: { n: 20, p: 10, k: 20, te: true },
    crops: ["rice"],
    description: "Balanced NPK for rice"
  },

  // ========== FOMI TOP DRESSING ==========
  {
    id: "fomi_kuzia",
    brand: "FOMI KUZIA",
    company: "FOMI",
    type: "topdressing",
    npk: "21-0-8",
    nutrients: { n: 21, p: 0, k: 8, ca: 4, mg: 2 },
    crops: ["all crops"],
    description: "Nitrogen and potassium with calcium"
  },

  // ========== UNIFERT TOP DRESSING ==========
  {
    id: "unifert_unitopdress",
    brand: "UNITOPDRESS",
    company: "UNIFERT",
    type: "topdressing",
    npk: "40-0-0",
    nutrients: { n: 40, p: 0, k: 0, s: 6 },
    crops: ["all crops"],
    description: "High nitrogen with sulphur"
  },
  {
    id: "unifert_uniurea",
    brand: "UNIUREA",
    company: "UNIFERT",
    type: "topdressing",
    npk: "46-0-0",
    nutrients: { n: 46, p: 0, k: 0 },
    crops: ["all crops"],
    description: "Urea"
  },
  {
    id: "unifert_uni23",
    brand: "UNI23",
    company: "UNIFERT",
    type: "topdressing",
    npk: "23-23-0",
    nutrients: { n: 23, p: 23, k: 0 },
    crops: ["cereals"],
    description: "NP for top dressing"
  },

  // ========== EVERRIS/ICL TOP DRESSING ==========
  {
    id: "everris_agromaster_vuma",
    brand: "AGROMASTER VUMA",
    company: "EVERRIS/ICL",
    type: "topdressing",
    npk: "24-6-12",
    nutrients: { n: 24, p: 6, k: 12, ca: 3.6, mg: 1.3, s: 10.6, b: 0.15, zn: 1 },
    crops: ["all crops"],
    description: "Complete top dressing with micronutrients"
  },
  {
    id: "everris_agromaster_topplus",
    brand: "AGROMASTER TOPPLUS",
    company: "EVERRIS/ICL",
    type: "topdressing",
    npk: "30-0-8",
    nutrients: { n: 30, p: 0, k: 8, ca: 4, mg: 1.5, s: 12, b: 0.1, zn: 0.1 },
    crops: ["all crops"],
    description: "High nitrogen with potassium and sulphur"
  },

  // ========== KPLUS TOP DRESSING ==========
  {
    id: "kplus_kali_topdressing",
    brand: "KALI Topdressing",
    company: "KPLUS",
    type: "topdressing",
    npk: "30-0-13",
    nutrients: { n: 30, p: 0, k: 13, mg: 2, s: 1.7 },
    crops: ["all crops"],
    description: "Nitrogen and potassium"
  },
  {
    id: "kplus_korn_kali_top",
    brand: "Korn-Kali",
    company: "KPLUS",
    type: "topdressing",
    npk: "0-0-40",
    nutrients: { n: 0, p: 0, k: 40, mg: 6, s: 5, na: 3, b: 0.25 },
    crops: ["all crops"],
    description: "Potassium with magnesium and sulphur"
  },
  {
    id: "kplus_patentkali_top",
    brand: "Patentkali",
    company: "KPLUS",
    type: "topdressing",
    npk: "0-0-30",
    nutrients: { n: 0, p: 0, k: 30, mg: 10, s: 17 },
    crops: ["all crops"],
    description: "Potassium with magnesium and sulphur"
  },

  // ========== INTERAGRO ==========
  {
    id: "interagro_can",
    brand: "CAN 26% N",
    company: "INTERAGRO",
    type: "topdressing",
    npk: "26-0-0",
    nutrients: { n: 26, p: 0, k: 0, ca: 8 },
    crops: ["all crops"],
    description: "Calcium Ammonium Nitrate"
  },
  {
    id: "interagro_urea",
    brand: "UREA 46% N",
    company: "INTERAGRO",
    type: "topdressing",
    npk: "46-0-0",
    nutrients: { n: 46, p: 0, k: 0 },
    crops: ["all crops"],
    description: "Urea"
  },
  {
    id: "interagro_sa",
    brand: "SA 21% N",
    company: "INTERAGRO",
    type: "topdressing",
    npk: "21-0-0",
    nutrients: { n: 21, p: 0, k: 0, s: 23 },
    crops: ["all crops"],
    description: "Ammonium Sulphate"
  },

  // ========== MAISHA MINERAL TOP DRESSING ==========
  {
    id: "maisha_mavuno_2600",
    brand: "MAVUNO NPK 26-0-0",
    company: "MAISHA MINERAL",
    type: "topdressing",
    npk: "26-0-0",
    nutrients: { n: 26, p: 0, k: 0 },
    crops: ["all crops"],
    description: "Nitrogen top dressing"
  },
  {
    id: "maisha_mavuno_urea",
    brand: "MAVUNO Urea",
    company: "MAISHA MINERAL",
    type: "topdressing",
    npk: "46-0-0",
    nutrients: { n: 46, p: 0, k: 0 },
    crops: ["all crops"],
    description: "Urea"
  },
  {
    id: "maisha_mavuno_2620",
    brand: "MAVUNO NPK 26-0-20",
    company: "MAISHA MINERAL",
    type: "topdressing",
    npk: "26-0-20",
    nutrients: { n: 26, p: 0, k: 20 },
    crops: ["sugar", "sugarcane"],
    description: "For sugarcane"
  }
];

// Helper function to get top dressing fertilizers by crop
export function getTopDressingFertilizersByCrop(crop: string): Fertilizer[] {
  return topDressingFertilizers.filter(f =>
    f.crops.includes(crop.toLowerCase()) ||
    f.crops.includes("all crops") ||
    f.crops.includes("general")
  );
}

// Helper function to get top dressing fertilizer by ID
export function getTopDressingFertilizerById(id: string): Fertilizer | undefined {
  return topDressingFertilizers.find(f => f.id === id);
}