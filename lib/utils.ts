// lib/utils.ts
import { interviewCovers, mappings } from "@/constants";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const techIconBaseURL = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons";

export const normalizeTechName = (tech: string) => {
  if (!tech) return "tech";

  const key = tech
    .toLowerCase()
    .replace(/\.js$/, "")
    .replace(/\s+/g, "");

  return mappings[key] ?? key;
};

const checkIconExists = async (url: string) => {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok;
  } catch {
    return false;
  }
};

export const getTechLogos = async (techArray: string[]) => {
  if (!Array.isArray(techArray)) return [];

  const logoURLs = techArray.map((tech) => {
    const normalized = normalizeTechName(tech);
    return {
      tech,
      url: `${techIconBaseURL}/${normalized}/${normalized}-original.svg`,
    };
  });

  const results = await Promise.all(
    logoURLs.map(async ({ tech, url }) => ({
      tech,
      url: (await checkIconExists(url)) ? url : "/tech.svg",
    }))
  );

  return results;
};

export const getRandomInterviewCover = () => {
  const availableCovers = [
    "/covers/adobe.png",
    "/covers/amazon.png",
    "/covers/facebook.png",
    "/covers/hostinger.png",
    "/covers/pinterest.png",
    "/covers/quora.png",
    "/covers/reddit.png",
    "/covers/telegram.png",
    "/covers/tiktok.png",
    "/covers/yahoo.png"
  ];

  if (availableCovers.length === 0) {
    return "/covers/adobe.png";
  }

  const randomIndex = Math.floor(Math.random() * availableCovers.length);
  return availableCovers[randomIndex];
};

export const getTechIconUrl = (tech: string): string => {
  const normalized = normalizeTechName(tech);

  const specialIcons: Record<string, string> = {
    'sql': '/icons/sql.svg',
    'r': '/icons/r.svg',
    'postgresql': '/icons/sql.svg',
  };

  const lowerTech = tech.toLowerCase();
  if (specialIcons[lowerTech]) {
    return specialIcons[lowerTech];
  }

  if (mappings[normalized]) {
    return `${techIconBaseURL}/${normalized}/${normalized}-original.svg`;
  }

  return "/icons/default.svg";
};

// Format currency in KES
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

// ========== Gross Margin Calculator Using Farmer's Actual Data ==========
export interface GrossMarginInput {
  crop: string;
  cropAcres: number;
  actualYield: number;
  yieldUnit: string;
  pricePerUnit: number;
  seedRate: number;
  seedCost: number;
  plantingFertilizerCost: number;
  plantingFertilizerQuantity: number;
  topdressingFertilizerCost: number;
  topdressingFertilizerQuantity: number;
  potassiumFertilizerCost: number;
  potassiumFertilizerQuantity: number;
  ploughingCost: number;
  plantingLabourCost: number;
  weedingCost: number;
  harvestingCost: number;
  transportCostPerBag: number;
  bagCost: number;
}

export interface GrossMarginOutput {
  crop: string;
  bags: number;
  pricePerBag: number;
  revenue: number;
  seedCost: number;
  fertilizerCost: number;
  labourCost: number;
  transportCost: number;
  bagCost: number;
  totalCosts: number;
  grossMargin: number;
  roi: number;
  costPerBag: number;
}

export function calculateGrossMarginFromFarmerData(input: GrossMarginInput): GrossMarginOutput {
  // Convert yield to 90kg bags (standard for grains)
  let totalBags = input.actualYield;

  if (input.yieldUnit === "kg" && input.actualYield) {
    totalBags = input.actualYield / 90; // Convert kg to 90kg bags
  } else if (input.yieldUnit === "tonnes") {
    totalBags = input.actualYield * 11.11; // 1 tonne = 11.11 bags of 90kg
  } else if (input.yieldUnit === "50kg bags") {
    totalBags = input.actualYield; // Keep as is
  } else if (input.yieldUnit === "90kg bags") {
    totalBags = input.actualYield; // Keep as is
  }

  // Calculate revenue
  const revenue = totalBags * input.pricePerUnit;

  // Calculate seed cost
  const seedCostTotal = input.seedRate * input.seedCost;

  // Calculate fertilizer costs (convert kg to bags)
  const plantingFertBags = input.plantingFertilizerQuantity / 50;
  const plantingFertTotal = plantingFertBags * input.plantingFertilizerCost;

  const topdressingFertBags = input.topdressingFertilizerQuantity / 50;
  const topdressingFertTotal = topdressingFertBags * input.topdressingFertilizerCost;

  const potassiumFertBags = input.potassiumFertilizerQuantity / 50;
  const potassiumFertTotal = potassiumFertBags * input.potassiumFertilizerCost;

  const fertilizerTotal = plantingFertTotal + topdressingFertTotal + potassiumFertTotal;

  // Calculate labour costs
  const labourTotal = input.ploughingCost + input.plantingLabourCost +
                     input.weedingCost + input.harvestingCost;

  // Calculate transport and bag costs
  const transportTotal = totalBags * input.transportCostPerBag;
  const bagsTotal = totalBags * input.bagCost;

  // Total costs
  const totalCosts = seedCostTotal + fertilizerTotal + labourTotal + transportTotal + bagsTotal;

  // Gross margin
  const grossMargin = revenue - totalCosts;

  // ROI (Return on Investment) as percentage
  const roi = totalCosts > 0 ? (grossMargin / totalCosts) * 100 : 0;

  // Cost per bag
  const costPerBag = totalBags > 0 ? totalCosts / totalBags : 0;

  return {
    crop: input.crop,
    bags: totalBags,
    pricePerBag: input.pricePerUnit,
    revenue,
    seedCost: seedCostTotal,
    fertilizerCost: fertilizerTotal,
    labourCost: labourTotal,
    transportCost: transportTotal,
    bagCost: bagsTotal,
    totalCosts,
    grossMargin,
    roi,
    costPerBag
  };
}

// Legacy function (keep for backward compatibility)
export const calculateGrossMargin = (
  crop: string,
  managementLevel: 'low' | 'medium' | 'high',
  bags: number,
  pricePerBag: number,
  seedCost: number,
  fertilizerCost: number,
  labourCost: number,
  transportCost: number,
  bagCost: number
) => {
  const grossOutput = bags * pricePerBag;
  const totalCost = seedCost + fertilizerCost + labourCost + transportCost + bagCost;
  const grossMargin = grossOutput - totalCost;

  return {
    crop,
    managementLevel,
    bags,
    pricePerBag,
    grossOutput,
    seedCost,
    fertilizerCost,
    labourCost,
    transportCost,
    bagCost,
    totalCost,
    grossMargin
  };
};

// Calculate ROI percentage
export const calculateROI = (investment: number, returns: number): number => {
  if (investment === 0) return 0;
  return ((returns - investment) / investment) * 100;
};

// Get crop recommendation based on gross margin
export const getTopCropsByProfit = (crops: any[]): any[] => {
  return [...crops].sort((a, b) => b.grossMargin - a.grossMargin);
};