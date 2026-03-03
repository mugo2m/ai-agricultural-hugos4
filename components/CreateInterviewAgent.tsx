"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { VoiceToggle } from "@/components/VoiceToggle";
import {
  Sparkles,
  Sprout,
  MapPin,
  Droplets,
  Sun,
  Leaf,
  Wheat,
  Flower2,
  Loader2,
  Mic,
  Send,
  CheckCircle,
  ArrowRight,
  Zap,
  Heart,
  Volume2,
  ChevronDown,
  DollarSign,
  TrendingUp,
  Package,
  Tractor,
  Calendar,
  Droplet,
  Thermometer,
  Cloud,
  Home,
  Phone,
  Users,
  Shield,
  AlertCircle,
  Beaker,
  FlaskConical,
  Scale,
  Gauge
} from "lucide-react";
import { plantingFertilizers } from "@/lib/fertilizers/plantingFertilizers";
import { topDressingFertilizers } from "@/lib/fertilizers/topDressingFertilizers";
import { cropVarieties } from "@/lib/data/varieties";
import { cropPestDiseaseMap } from "@/lib/data/pestDiseaseMapping";

interface CreateInterviewAgentProps {
  userName: string;
  userId?: string;
  profileImage?: string;
}

// Define crop categories
const cropCategories = {
  grains: ["maize", "beans", "wheat", "sorghum", "millet", "rice", "barley", "oats"],
  tubers: ["potatoes", "irish potatoes", "sweet potatoes", "cassava", "yams", "arrow roots", "taro"],
  fruits: ["bananas", "pineapples", "mangoes", "oranges", "avocados", "passion fruit", "pawpaw", "citrus"],
  vegetables: ["tomatoes", "cabbage", "kales", "onions", "carrots", "capsicums", "spinach", "lettuce", "broccoli", "cauliflower"],
  perennials: ["coffee", "tea", "sugarcane", "cocoa", "rubber"],
  treeCrops: ["coconuts", "palm oil", "cashew nuts", "macadamia", "pecans"]
};

// Helper to get crop type
const getCropType = (crop: string): string => {
  const lowerCrop = crop.toLowerCase();
  for (const [type, crops] of Object.entries(cropCategories)) {
    if (crops.includes(lowerCrop)) return type;
  }
  if (lowerCrop.includes("potato")) return "tubers";
  if (lowerCrop.includes("banana")) return "fruits";
  if (lowerCrop.includes("coffee")) return "perennials";
  if (lowerCrop.includes("sugar")) return "perennials";
  if (lowerCrop.includes("tomato")) return "vegetables";
  return "grains";
};

// Helper to get varieties dropdown
const getVarietiesOptions = (crop: string) => {
  const varieties = cropVarieties[crop.toLowerCase() as keyof typeof cropVarieties] || [];
  return [...varieties, "Other"];
};

// Helper to get pests dropdown
const getPestsOptions = (crop: string) => {
  const pests = cropPestDiseaseMap[crop.toLowerCase()]?.filter(p => p.type === "pest").map(p => p.name) || [];
  return [...pests, "Other (specify)"];
};

// Helper to get diseases dropdown
const getDiseasesOptions = (crop: string) => {
  const diseases = cropPestDiseaseMap[crop.toLowerCase()]?.filter(p => p.type === "disease").map(p => p.name) || [];
  return [...diseases, "Other (specify)"];
};

// Helper to get planting material question
const getPlantingMaterialQuestion = (crop: string) => {
  const cropType = getCropType(crop);
  const lowerCrop = crop.toLowerCase();

  if (lowerCrop === "bananas") {
    return {
      id: "plantingMaterial",
      question: "What type of banana planting material will you use?",
      type: "dropdown",
      options: ["Sword suckers", "Tissue culture seedlings", "Mother plant corms", "Bits", "Other"],
      section: "Planting Material"
    };
  }
  if (lowerCrop === "coffee") {
    return {
      id: "plantingMaterial",
      question: "What type of coffee planting material will you use?",
      type: "dropdown",
      options: ["Grafted seedlings", "Cuttings", "Seeds", "Tissue culture", "Other"],
      section: "Planting Material"
    };
  }
  if (lowerCrop === "sugarcane") {
    return {
      id: "plantingMaterial",
      question: "What type of sugarcane planting material will you use?",
      type: "dropdown",
      options: ["Setts (cane cuttings)", "Ratoon (regrowth)", "Tissue culture", "Other"],
      section: "Planting Material"
    };
  }
  if (lowerCrop.includes("potato")) {
    return {
      id: "plantingMaterial",
      question: "What type of potato planting material will you use?",
      type: "dropdown",
      options: ["Certified seed potatoes", "Farm-saved tubers", "Whole tubers", "Cut pieces", "Other"],
      section: "Planting Material"
    };
  }
  if (cropType === "tubers") {
    return {
      id: "plantingMaterial",
      question: `What type of planting material will you use for ${crop}?`,
      type: "dropdown",
      options: ["Tubers", "Root cuttings", "Sets", "Certified seed", "Other"],
      section: "Planting Material"
    };
  }
  if (cropType === "fruits") {
    return {
      id: "plantingMaterial",
      question: `What type of planting material will you use for ${crop}?`,
      type: "dropdown",
      options: ["Grafted seedlings", "Seedlings", "Cuttings", "Air layers", "Other"],
      section: "Planting Material"
    };
  }
  if (cropType === "vegetables") {
    return {
      id: "plantingMaterial",
      question: `How will you establish your ${crop} crop?`,
      type: "dropdown",
      options: ["Direct seeding", "Transplanting seedlings", "Sets", "Cuttings", "Other"],
      section: "Planting Material"
    };
  }
  return {
    id: "seedSource",
    question: "Where will you get your seeds from?",
    type: "dropdown",
    options: ["Certified seed dealer", "Farm-saved seed", "Local market", "Neighbors", "Agrovet", "Other"],
    section: "Seeds"
  };
};

// Helper to get planting quantity question
const getPlantingQuantityQuestion = (crop: string) => {
  const cropType = getCropType(crop);
  const lowerCrop = crop.toLowerCase();

  if (lowerCrop === "bananas") {
    return {
      id: "plantingQuantity",
      question: "How many banana suckers/seedlings will you plant per acre?",
      type: "number",
      placeholder: "e.g., 1,000 plants",
      section: "Planting Density"
    };
  }
  if (lowerCrop === "coffee") {
    return {
      id: "plantingQuantity",
      question: "How many coffee seedlings will you plant per acre? (Typical: 1,300)",
      type: "number",
      placeholder: "e.g., 1,300 seedlings",
      section: "Planting Density"
    };
  }
  if (lowerCrop === "sugarcane") {
    return {
      id: "plantingQuantity",
      question: "How many sugarcane setts will you plant per acre? (Typical: 10,000-15,000)",
      type: "number",
      placeholder: "e.g., 12,000 setts",
      section: "Planting Density"
    };
  }
  if (lowerCrop.includes("potato")) {
    return {
      id: "plantingQuantity",
      question: "How many kilograms of seed potatoes will you plant per acre?",
      type: "number",
      placeholder: "e.g., 500 kg",
      section: "Planting Rate"
    };
  }
  if (cropType === "tubers") {
    return {
      id: "plantingQuantity",
      question: `How many kilograms of planting material will you use per acre for ${crop}?`,
      type: "number",
      placeholder: "e.g., 400 kg",
      section: "Planting Rate"
    };
  }
  if (cropType === "fruits") {
    return {
      id: "plantingQuantity",
      question: `How many ${crop} trees/plants will you have per acre?`,
      type: "number",
      placeholder: "e.g., 150 trees",
      section: "Planting Density"
    };
  }
  if (cropType === "vegetables") {
    return {
      id: "plantingQuantity",
      question: `How many ${crop} plants will you have per acre?`,
      type: "number",
      placeholder: "e.g., 10,000 plants",
      section: "Planting Density"
    };
  }
  return {
    id: "seedRate",
    question: "What seed rate will you use? (kg per acre)",
    type: "number",
    placeholder: "e.g., 25 kg",
    section: "Seeds"
  };
};

const CreateInterviewAgent = ({
  userName,
  userId,
  profileImage
}: CreateInterviewAgentProps) => {
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userTranscript, setUserTranscript] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastSubmittedAnswer, setLastSubmittedAnswer] = useState("");

  const [currentStep, setCurrentStep] = useState<"idle" | "configuring" | "generating" | "redirecting" | "error">("idle");
  const [configStep, setConfigStep] = useState(0);

  const [streamingQuestion, setStreamingQuestion] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const questionWordsRef = useRef<string[]>([]);

  // Farmer details state
  const [farmerDetails, setFarmerDetails] = useState({
    farmerName: "",
    phoneNumber: "",
    county: "",
    subCounty: "",
    ward: "",
    village: "",
    altitude: "",
    annualRainfall: "",
    totalFarmSize: "",
    cultivatedAcres: "",
    soilType: "",
    waterSources: "",

    // Crops - SOIL TEST COMES FIRST
    hasDoneSoilTest: "",
    crops: "",
    cropVarieties: "",
    cropAcres: "",
    season: "",
    plantingDate: "",
    plantingMaterial: "",
    plantingQuantity: "",
    seedSource: "",
    spacing: "",

    // Pests & Diseases - dropdowns
    commonPests: "",
    pestControlMethod: "",
    commonDiseases: "",
    diseaseControlMethod: "",

    // Production
    averageHarvest: "",
    harvestUnit: "",
    pricePerUnit: "",
    storageMethod: "",

    // Financial - REMOVED dailyWageRate and buyerType
    dapCost: "",
    canCost: "",
    npkCost: "",
    ploughingCost: "",
    plantingLabourCost: "",
    weedingCost: "",
    harvestingCost: "",
    transportCostPerBag: "",
    bagCost: "",

    // Livestock
    livestockTypes: "",
    cattle: "",
    cattleBreed: "",
    milkYield: "",

    // Post-Harvest
    postHarvestPractices: "",
    postHarvestLosses: "",
    valueAddition: "",
    storageAccess: "",

    // CHALLENGES - ALL DROPDOWNS
    productionChallenges: "",
    marketingChallenges: "",
    climateChallenges: "",
    financialChallenges: "",
    knowledgeChallenges: "",
    mainChallenge: "",
    experience: "",

    // CONSERVATION - COMBINED DROPDOWN
    organicManure: "",
    conservationPractices: "",
    managementLevel: "",

    // SOIL TEST DETAILS (only if hasDoneSoilTest = "Yes")
    soilTestDate: "",
    soilTestPH: "",
    soilTestPHRating: "",
    soilTestP: "",
    soilTestPRating: "",
    soilTestK: "",
    soilTestKRating: "",
    soilTestNPercent: "",
    soilTestNPercentRating: "",
    targetYield: "",

    // NEW: Fertilizer selection for farmers WITH soil test
    // Planting fertilizer (dropdown only - kg calculated)
    plantingFertilizerToUse: "",
    plantingFertilizerCost: "", // price per 50kg bag

    // Topdressing fertilizer (dropdown only - kg calculated)
    topdressingFertilizerToUse: "",
    topdressingFertilizerCost: "", // price per 50kg bag

    // Potassium fertilizer (dropdown only - kg calculated)
    potassiumFertilizerToUse: "",
    potassiumFertilizerCost: "", // price per 50kg bag

    // For farmers WITHOUT soil test (they provide kg)
    plantingFertilizerType: "",
    plantingFertilizerQuantity: "",
    topdressingFertilizerType: "",
    topdressingFertilizerQuantity: "",
    potassiumFertilizerType: "",
    potassiumFertilizerQuantity: "",
  });

  const [debugInfo, setDebugInfo] = useState({
    callStatus: "INACTIVE",
    currentQuestion: 0,
    totalQuestions: 0,
    isListening: false,
    userId: userId || "MISSING",
    voiceMode: "SIMULATED" as "REAL" | "SIMULATED",
    generatedSessionId: "",
  });

  const voiceAssistantRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);
  const isRecognitionActiveRef = useRef(false);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  // ============ BASE QUESTIONS ============
  const baseQuestions = [
    { id: "farmerName", question: "What is your name?", type: "text", section: "Personal" },
    { id: "phoneNumber", question: "What is your phone number?", type: "tel", section: "Personal" },
    { id: "county", question: "What county are you in?", type: "text", section: "Location" },
    { id: "subCounty", question: "Which sub-county?", type: "text", section: "Location" },
    { id: "ward", question: "Which ward?", type: "text", section: "Location" },
    { id: "village", question: "Which village?", type: "text", section: "Location" },
    { id: "altitude", question: "What is your altitude?", type: "dropdown", options: ["Below 1200m", "1200-1500m", "1500-1800m", "Above 1800m"], section: "Climate" },
    { id: "annualRainfall", question: "Annual rainfall range?", type: "dropdown", options: ["Below 1000mm", "1000-1200mm", "1200-1500mm", "1500-1800mm", "Above 1800mm"], section: "Climate" },
    { id: "totalFarmSize", question: "Total farm size? (acres)", type: "number", section: "Farm" },
    { id: "cultivatedAcres", question: "Cultivated acres?", type: "number", section: "Farm" },
    { id: "soilType", question: "Soil type?", type: "dropdown", options: ["clay", "loam", "sandy", "clay loam", "sandy loam", "not sure"], section: "Soil" },

    // WATER SOURCES - WITH COMBINATIONS
    {
      id: "waterSources",
      question: "What are your main water sources? (Select all that apply)",
      type: "multiselect",
      options: [
        "River only",
        "Stream only",
        "Protected spring only",
        "Borehole only",
        "Hand-dug well only",
        "Piped scheme only",
        "Rainwater harvesting only",
        "Water pan/pond only",
        "River + Borehole",
        "River + Well",
        "River + Rainwater",
        "Borehole + Well",
        "Borehole + Rainwater",
        "Well + Rainwater",
        "Spring + Stream",
        "Piped + Rainwater",
        "River + Borehole + Well",
        "River + Borehole + Rainwater",
        "River + Well + Rainwater",
        "Borehole + Well + Rainwater",
        "Spring + Stream + Rainwater",
        "All available sources",
        "None (dryland farming)"
      ],
      section: "Water"
    },

    // SOIL TEST - MOVED TO BEGINNING (asked ONCE)
    {
      id: "hasDoneSoilTest",
      question: "Have you done a comprehensive soil test?",
      type: "dropdown",
      options: ["Yes", "No"],
      section: "Soil Test"
    },

    // CROPS
    {
      id: "crops",
      question: "What crop will you plant?",
      type: "dropdown",
      options: Object.keys(cropVarieties),
      section: "Crops"
    },
  ];

  // ============ CROP-SPECIFIC QUESTIONS ============
  const getCropSpecificQuestions = () => {
    if (!farmerDetails.crops) return [];
    const crop = farmerDetails.crops;

    return [
      {
        id: "cropVarieties",
        question: `Which variety of ${crop} will you plant?`,
        type: "dropdown",
        options: getVarietiesOptions(crop),
        section: "Crops"
      },
      { id: "cropAcres", question: `How many acres of ${crop}?`, type: "number", section: "Crops" },
      { id: "season", question: "Which season?", type: "dropdown", options: ["long rains", "short rains", "dry season"], section: "Crops" },
      {
        id: "plantingDate",
        question: "When will you plant? (select date)",
        type: "date",
        minDate: "2024-01-01",
        maxDate: new Date().toISOString().split('T')[0],
        section: "Crops"
      },
      getPlantingMaterialQuestion(crop),
      getPlantingQuantityQuestion(crop),
    ];
  };

  // ============ PEST & DISEASE QUESTIONS ============
  const getPestQuestions = () => {
    if (!farmerDetails.crops) return [];
    const crop = farmerDetails.crops;

    return [
      {
        id: "commonPests",
        question: "Which pests affect your crop?",
        type: "multiselect",
        options: getPestsOptions(crop),
        section: "Pests"
      },
      {
        id: "commonDiseases",
        question: "Which diseases affect your crop?",
        type: "multiselect",
        options: getDiseasesOptions(crop),
        section: "Diseases"
      },
    ];
  };

  // ============ PRODUCTION QUESTIONS ============
  const getProductionQuestions = () => {
    if (!farmerDetails.crops) return [];
    const crop = farmerDetails.crops;
    const cropType = getCropType(crop);

    let unitOptions = ["kg", "tonnes"];
    if (cropType === "grains") unitOptions = ["90kg bags", "50kg bags", "kg", "tonnes"];
    if (crop === "bananas") unitOptions = ["tonnes", "kg", "bunches"];
    if (crop === "coffee") unitOptions = ["kg cherry", "tonnes cherry", "kg clean coffee"];

    return [
      { id: "averageHarvest", question: "Expected yield per acre?", type: "number", section: "Production" },
      { id: "harvestUnit", question: "Unit for yield?", type: "dropdown", options: unitOptions, section: "Production" },
      { id: "pricePerUnit", question: "Expected price per unit? (Ksh)", type: "number", section: "Production" },
      { id: "storageMethod", question: "Storage method?", type: "dropdown", options: ["Gunny bags", "Silos", "Hermetic bags", "Sold immediately", "Other"], section: "Storage" },
    ];
  };

  // ============ FINANCIAL QUESTIONS (UPDATED - removed dailyWageRate and buyerType) ============
  const financialQuestions = [
    { id: "dapCost", question: "Cost of DAP per 50kg bag? (Ksh)", type: "number", section: "Finance" },
    { id: "canCost", question: "Cost of CAN per 50kg bag? (Ksh)", type: "number", section: "Finance" },
    { id: "npkCost", question: "Cost of NPK per 50kg bag? (Ksh)", type: "number", section: "Finance" },
    { id: "ploughingCost", question: "Ploughing cost per acre? (Ksh)", type: "number", section: "Finance" },
    { id: "plantingLabourCost", question: "Planting labour cost per acre? (Ksh)", type: "number", section: "Finance" },
    { id: "weedingCost", question: "Weeding cost per acre? (Ksh)", type: "number", section: "Finance" },
    { id: "harvestingCost", question: "Harvesting cost per acre? (Ksh)", type: "number", section: "Finance" },
    { id: "transportCostPerBag", question: "Transport cost per unit? (Ksh)", type: "number", section: "Finance" },
    { id: "bagCost", question: "Cost per empty bag? (Ksh)", type: "number", section: "Finance" },
  ];

  // ============ CHALLENGES QUESTIONS ============
  const challengesQuestions = [
    {
      id: "productionChallenges",
      question: "What production challenges do you face?",
      type: "multiselect",
      options: [
        "Pests", "Diseases", "Drought", "Floods", "Poor soil fertility",
        "High input costs", "Labor shortage", "Weeds", "Wild animals",
        "Fall armyworm", "Stalk borers", "Aphids", "Whiteflies",
        "Maize streak virus", "Leaf rust", "Blight", "Other"
      ],
      section: "Challenges"
    },
    {
      id: "marketingChallenges",
      question: "What marketing challenges do you face?",
      type: "multiselect",
      options: [
        "Low prices", "Price fluctuations", "No reliable buyer",
        "Transport costs", "Brokers/middlemen", "Post-harvest losses",
        "No storage", "Perishability", "Other"
      ],
      section: "Challenges"
    },
    {
      id: "climateChallenges",
      question: "What climate challenges affect you?",
      type: "multiselect",
      options: [
        "Unreliable rains", "Drought", "Floods", "Hailstorms",
        "Strong winds", "Extreme heat", "Late rains", "Early cessation",
        "Other"
      ],
      section: "Challenges"
    },
    {
      id: "financialChallenges",
      question: "What financial challenges do you face?",
      type: "multiselect",
      options: [
        "No capital", "No loans", "High interest rates",
        "No subsidies", "High input costs", "Cash flow problems",
        "Debt", "Other"
      ],
      section: "Challenges"
    },
    {
      id: "knowledgeChallenges",
      question: "What knowledge gaps do you have?",
      type: "multiselect",
      options: [
        "Pest identification", "Disease identification", "Fertilizer use",
        "Soil testing", "Good practices", "Post-harvest handling",
        "Marketing", "No extension services", "Other"
      ],
      section: "Challenges"
    },
    {
      id: "mainChallenge",
      question: "What is your SINGLE biggest challenge?",
      type: "dropdown",
      options: [
        "Pests", "Diseases", "Drought", "Poor soil", "High costs",
        "Labor shortage", "Market access", "Lack of knowledge",
        "Lack of capital", "Climate change", "Other"
      ],
      section: "Challenges"
    },
    { id: "experience", question: "Years of farming experience?", type: "number", section: "Profile" },
  ];

  // ============ CONSERVATION QUESTIONS ============
  const conservationQuestions = [
    { id: "organicManure", question: "Do you use organic manure?", type: "dropdown", options: ["yes", "no"], section: "Soil" },
    {
      id: "conservationPractices",
      question: "Which conservation practices do you use?",
      type: "multiselect",
      options: [
        "Terracing",
        "Mulching",
        "Cover crops",
        "Rainwater harvesting",
        "Contour farming",
        "Terracing + Mulching",
        "Terracing + Cover crops",
        "Mulching + Cover crops",
        "Rainwater harvesting + Contour farming",
        "Terracing + Mulching + Cover crops",
        "All practices",
        "None"
      ],
      section: "Conservation"
    },
    {
      id: "managementLevel",
      question: "Describe your farming practices?",
      type: "dropdown",
      options: ["Low input", "Medium input", "High input"],
      section: "Management"
    },
  ];

  // ============ SOIL TEST DETAILS ============
  const soilTestDetailsQuestions = [
    { id: "soilTestDate", question: "When was soil test done?", type: "date", minDate: "2020-01-01", maxDate: new Date().toISOString().split('T')[0], dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, section: "Soil Test" },
    { id: "soilTestPH", question: "pH value?", type: "number", min: 0, max: 14, step: 0.1, dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, section: "Soil Test" },
    { id: "soilTestPHRating", question: "pH rating?", type: "dropdown", options: ["Very Low", "Low", "Optimum", "High", "Very High"], dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, section: "Soil Test" },
    { id: "soilTestP", question: "Phosphorus (P) in ppm?", type: "number", dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, section: "Soil Test" },
    { id: "soilTestPRating", question: "Phosphorus rating?", type: "dropdown", options: ["Very Low", "Low", "Optimum", "High", "Very High"], dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, section: "Soil Test" },
    { id: "soilTestK", question: "Potassium (K) in ppm?", type: "number", dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, section: "Soil Test" },
    { id: "soilTestKRating", question: "Potassium rating?", type: "dropdown", options: ["Very Low", "Low", "Optimum", "High", "Very High"], dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, section: "Soil Test" },
    { id: "soilTestNPercent", question: "Total Nitrogen (N) in %?", type: "number", min: 0, max: 5, step: 0.01, dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, section: "Soil Test" },
    { id: "soilTestNPercentRating", question: "Nitrogen rating?", type: "dropdown", options: ["Very Low", "Low", "Optimum", "High", "Very High"], dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, section: "Soil Test" },
    { id: "targetYield", question: "Target yield per acre?", type: "number", dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, section: "Soil Test" },
  ];

  // ============ FERTILIZER QUESTIONS (NEW - based on soil test) ============

  // Planting fertilizer options dropdown
  const plantingFertilizerOptions = [
    "DAP (18-46-0)",
    "TSP (0-46-0)",
    "SSP (0-20-0)",
    "NPK 12.24.12+5S (12-24-12+5S)",
    "NPK 17-17-17 (17-17-17)",
    "NPK 23-23-0 (23-23-0)",
    "MEA NPK 10-26-10",
    "Yara Mila Power (13-24-12)",
    "Other"
  ];

  // Topdressing fertilizer options dropdown
  const topdressingFertilizerOptions = [
    "UREA (46-0-0)",
    "CAN (27-0-0)",
    "ASN / Sulphate of Ammonia (21-0-0-23S)",
    "Yara Bela Sulfan (24-0-0+6S)",
    "KynoKuza (20-4-20)",
    "KynoGrowMax (30-0-10)",
    "NPK 23-10-10",
    "NPK 26-0-20",
    "Other"
  ];

  // Potassium fertilizer options dropdown
  const potassiumFertilizerOptions = [
    "MOP / Muriate of Potash (0-0-60)",
    "SOP / Sulphate of Potash (0-0-50)",
    "Korn-Kali (0-0-40)",
    "Patentkali (0-0-30)",
    "NPK 17-17-17 (contains K)",
    "NPK 12.24.12+5S (contains K)",
    "NPK 10-26-10 (contains K)",
    "None - I don't use potassium"
  ];

  // Fertilizer questions for farmers WITH soil test (dropdown only - no kg input)
  const fertilizerQuestionsWithSoilTest = [
    {
      id: "plantingFertilizerToUse",
      question: "Which planting fertilizer will you use?",
      type: "dropdown",
      options: plantingFertilizerOptions,
      dependsOn: { field: "hasDoneSoilTest", value: "Yes" },
      section: "Fertilizer Selection"
    },
    {
      id: "plantingFertilizerCost",
      question: "How much do you pay for a 50kg bag of your planting fertilizer?",
      type: "number",
      placeholder: "e.g., 3,500",
      dependsOn: { field: "hasDoneSoilTest", value: "Yes" },
      section: "Fertilizer Selection"
    },
    {
      id: "topdressingFertilizerToUse",
      question: "Which topdressing fertilizer will you use?",
      type: "dropdown",
      options: topdressingFertilizerOptions,
      dependsOn: { field: "hasDoneSoilTest", value: "Yes" },
      section: "Fertilizer Selection"
    },
    {
      id: "topdressingFertilizerCost",
      question: "How much do you pay for a 50kg bag of your topdressing fertilizer?",
      type: "number",
      placeholder: "e.g., 2,800",
      dependsOn: { field: "hasDoneSoilTest", value: "Yes" },
      section: "Fertilizer Selection"
    },
    {
      id: "potassiumFertilizerToUse",
      question: "Which potassium fertilizer will you use?",
      type: "dropdown",
      options: potassiumFertilizerOptions,
      dependsOn: { field: "hasDoneSoilTest", value: "Yes" },
      section: "Fertilizer Selection"
    },
    {
      id: "potassiumFertilizerCost",
      question: "How much do you pay for a 50kg bag of your potassium fertilizer?",
      type: "number",
      placeholder: "e.g., 2,800",
      dependsOn: { field: "hasDoneSoilTest", value: "Yes", field2: "potassiumFertilizerToUse", valueNot: "None - I don't use potassium" },
      section: "Fertilizer Selection"
    },
  ];

  // Fertilizer questions for farmers WITHOUT soil test (dropdown + kg input)
  const fertilizerQuestionsWithoutSoilTest = [
    {
      id: "plantingFertilizerType",
      question: "Which planting fertilizer do you use?",
      type: "dropdown",
      options: plantingFertilizerOptions,
      dependsOn: { field: "hasDoneSoilTest", value: "No" },
      section: "Fertilizer Selection"
    },
    {
      id: "plantingFertilizerQuantity",
      question: "How many kg per acre do you apply?",
      type: "number",
      placeholder: "e.g., 50 kg",
      dependsOn: { field: "hasDoneSoilTest", value: "No" },
      section: "Fertilizer Selection"
    },
    {
      id: "topdressingFertilizerType",
      question: "Which topdressing fertilizer do you use?",
      type: "dropdown",
      options: topdressingFertilizerOptions,
      dependsOn: { field: "hasDoneSoilTest", value: "No" },
      section: "Fertilizer Selection"
    },
    {
      id: "topdressingFertilizerQuantity",
      question: "How many kg per acre do you apply for topdressing?",
      type: "number",
      placeholder: "e.g., 50 kg",
      dependsOn: { field: "hasDoneSoilTest", value: "No" },
      section: "Fertilizer Selection"
    },
    {
      id: "potassiumFertilizerType",
      question: "Which potassium fertilizer do you use?",
      type: "dropdown",
      options: potassiumFertilizerOptions,
      dependsOn: { field: "hasDoneSoilTest", value: "No" },
      section: "Fertilizer Selection"
    },
    {
      id: "potassiumFertilizerQuantity",
      question: "How many kg per acre do you apply for potassium?",
      type: "number",
      placeholder: "e.g., 50 kg",
      dependsOn: { field: "hasDoneSoilTest", value: "No", field2: "potassiumFertilizerType", valueNot: "None - I don't use potassium" },
      section: "Fertilizer Selection"
    },
  ];

  // Combine all questions in order
  const getAllQuestions = () => {
    let questions = [...baseQuestions];

    if (farmerDetails.crops) {
      questions = [...questions, ...getCropSpecificQuestions()];
    }

    questions = [...questions, ...getPestQuestions()];
    questions = [...questions, ...getProductionQuestions()];
    questions = [...questions, ...financialQuestions];
    questions = [...questions, ...challengesQuestions];
    questions = [...questions, ...conservationQuestions];

    // Soil test details ONLY if they said YES
    if (farmerDetails.hasDoneSoilTest === "Yes") {
      questions = [...questions, ...soilTestDetailsQuestions];
      // Add fertilizer questions for those with soil test
      questions = [...questions, ...fertilizerQuestionsWithSoilTest];
    } else {
      // Add fertilizer questions for those without soil test
      questions = [...questions, ...fertilizerQuestionsWithoutSoilTest];
    }

    return questions;
  };

  // Filter questions based on dependencies
  const filterQuestions = (questions: any[]) => {
    return questions.filter(q => {
      if (!q.dependsOn) return true;

      // Handle simple dependency
      if (q.dependsOn.field && !q.dependsOn.field2) {
        const dependsOnField = q.dependsOn.field;
        const expectedValue = q.dependsOn.value;
        const actualValue = farmerDetails[dependsOnField as keyof typeof farmerDetails];
        return actualValue === expectedValue;
      }

      // Handle dependency with "valueNot"
      if (q.dependsOn.field2 && q.dependsOn.valueNot) {
        const dependsOnField = q.dependsOn.field;
        const dependsOnField2 = q.dependsOn.field2;
        const expectedValue = q.dependsOn.value;
        const valueNot = q.dependsOn.valueNot;
        const actualValue = farmerDetails[dependsOnField as keyof typeof farmerDetails];
        const actualValue2 = farmerDetails[dependsOnField2 as keyof typeof farmerDetails];
        return actualValue === expectedValue && actualValue2 !== valueNot;
      }

      return true;
    });
  };

  const allQuestions = getAllQuestions();
  const visibleQuestions = filterQuestions(allQuestions);
  const totalQuestions = visibleQuestions.length;

  // Update debug info
  useEffect(() => {
    setDebugInfo(prev => ({ ...prev, totalQuestions: visibleQuestions.length }));
  }, [visibleQuestions.length]);

  // Voice initialization
  useEffect(() => {
    const checkVoiceSupport = () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices();
        const hasRealVoice = voices.length > 0;
        setDebugInfo(prev => ({ ...prev, voiceMode: hasRealVoice ? "REAL" : "SIMULATED" }));
      }
    };

    checkVoiceSupport();
    setTimeout(checkVoiceSupport, 500);

    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.timeout = 15000;

      recognitionRef.current.onresult = (event: any) => {
        retryCountRef.current = 0;
        if (isRecognitionActiveRef.current) {
          isRecognitionActiveRef.current = false;
          setDebugInfo(prev => ({ ...prev, isListening: false }));
        }
        const transcript = event.results[0][0].transcript;
        setUserTranscript(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        if (isRecognitionActiveRef.current) {
          isRecognitionActiveRef.current = false;
          setDebugInfo(prev => ({ ...prev, isListening: false }));
        }
        if (event.error === 'no-speech') {
          retryCountRef.current++;
          if (retryCountRef.current <= maxRetries) {
            toast.info(`No speech detected. Retry ${retryCountRef.current}/${maxRetries}`);
            setTimeout(() => safeStartListening(), 2000);
          }
        }
      };

      recognitionRef.current.onend = () => {
        if (isRecognitionActiveRef.current) {
          isRecognitionActiveRef.current = false;
          setDebugInfo(prev => ({ ...prev, isListening: false }));
        }
      };

      recognitionRef.current.onstart = () => {
        isRecognitionActiveRef.current = true;
        setDebugInfo(prev => ({ ...prev, isListening: true }));
        retryCountRef.current = 0;
      };
    }

    return () => {
      if (recognitionRef.current && isRecognitionActiveRef.current) {
        try { recognitionRef.current.stop(); } catch (error) {}
      }
    };
  }, []);

  // Karaoke streaming
  const streamQuestionWithVoice = async (fullText: string) => {
    if (!voiceEnabled || !window.speechSynthesis) {
      setStreamingQuestion(fullText);
      return;
    }

    setIsStreaming(true);
    setStreamingQuestion("");
    setCurrentWordIndex(0);
    setUserTranscript(""); // Clear input field for new question

    const words = fullText.split(' ');
    questionWordsRef.current = words;

    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Google UK') || v.name.includes('Samantha'));
    if (preferredVoice) utterance.voice = preferredVoice;

    setIsSpeaking(true);

    let wordIndex = 0;
    let currentText = '';

    utterance.onboundary = (event) => {
      if (event.name === 'word' && wordIndex < words.length) {
        currentText += (wordIndex === 0 ? '' : ' ') + words[wordIndex];
        setStreamingQuestion(currentText);
        setCurrentWordIndex(wordIndex + 1);
        wordIndex++;
      }
    };

    utterance.onend = () => {
      setStreamingQuestion(fullText);
      setIsStreaming(false);
      setIsSpeaking(false);
      setTimeout(() => safeStartListening(), 500);
    };

    utterance.onerror = () => {
      setStreamingQuestion(fullText);
      setIsStreaming(false);
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  // VOICE ACKNOWLEDGMENT
  const speakAcknowledgment = async (answer: string, fieldId: string) => {
    let acknowledgment = "";

    if (fieldId === "plantingFertilizerToUse" || fieldId === "plantingFertilizerType") {
      acknowledgment = `You'll use ${answer} at planting. Is that correct?`;
    } else if (fieldId === "topdressingFertilizerToUse" || fieldId === "topdressingFertilizerType") {
      acknowledgment = `You'll use ${answer} for topdressing. Is that correct?`;
    } else if (fieldId === "potassiumFertilizerToUse" || fieldId === "potassiumFertilizerType") {
      acknowledgment = `You'll use ${answer} for potassium. Is that correct?`;
    } else if (fieldId === "plantingFertilizerCost" || fieldId === "topdressingFertilizerCost" || fieldId === "potassiumFertilizerCost") {
      acknowledgment = `${answer} Ksh per bag. Is that correct?`;
    } else if (fieldId === "county") {
      acknowledgment = `${answer} county. Is that correct?`;
    } else if (fieldId === "phoneNumber") {
      acknowledgment = `${answer}. Is that your phone number?`;
    } else if (fieldId === "crops") {
      acknowledgment = `You're planting ${answer}. Correct?`;
    } else if (fieldId === "plantingDate") {
      const date = new Date(answer).toLocaleDateString();
      acknowledgment = `Planting on ${date}. Is that right?`;
    } else {
      acknowledgment = `${answer}. Is that correct?`;
    }

    await voiceAssistantRef.current?.speak(acknowledgment);
    toast.success(`✅ Recorded: ${answer}`);
  };

  // Initialize voice assistant
  useEffect(() => {
    if (!voiceEnabled) {
      voiceAssistantRef.current = null;
      return;
    }
    voiceAssistantRef.current = { speak: async (text: string) => streamQuestionWithVoice(text) };
    toast.success("🎤 Voice ready!");
  }, [voiceEnabled]);

  const handleVoiceToggle = (enabled: boolean) => {
    setVoiceEnabled(enabled);
    toast.success(enabled ? "Voice mode on!" : "Voice mode off");
  };

  // Process answer
  const processAnswer = async (answer: string) => {
    if (currentStep !== "configuring") return;

    const currentConfig = visibleQuestions[configStep];
    let cleanAnswer = answer;

    // Clean the answer
    const questionPhrases = [
      "your phone number is", "what county are you in", "you are in", "the answer is",
      "i said", "it is", "is that correct", "yes it is", "that is correct"
    ];

    for (const phrase of questionPhrases) {
      if (cleanAnswer.toLowerCase().includes(phrase)) {
        cleanAnswer = cleanAnswer.replace(new RegExp(phrase, 'gi'), '').trim();
      }
    }

    cleanAnswer = cleanAnswer.replace(/^[?:,\s]+/, '').replace(/[?:,\s]+$/, '');

    if (cleanAnswer.includes('?')) {
      const parts = cleanAnswer.split('?');
      cleanAnswer = parts[parts.length - 1].trim();
    }

    if (currentConfig.type === "number") {
      const numbers = cleanAnswer.match(/\d+/g);
      cleanAnswer = numbers ? numbers.join('') : "0";
    }

    // Save the answer
    setFarmerDetails(prev => ({ ...prev, [currentConfig.id]: cleanAnswer }));
    setLastSubmittedAnswer(cleanAnswer);

    await speakAcknowledgment(cleanAnswer, currentConfig.id);
    setUserTranscript("");

    if (configStep < visibleQuestions.length - 1) {
      setConfigStep(prev => prev + 1);
      setTimeout(() => askQuestion(configStep + 1), 2000);
    } else {
      setCurrentStep("generating");
      generateSession();
    }
  };

  const safeStartListening = () => {
    if (!recognitionRef.current || isRecognitionActiveRef.current || isSpeaking) return;
    try {
      recognitionRef.current.start();
      setDebugInfo(prev => ({ ...prev, isListening: true }));
    } catch (error) {}
  };

  const safeStopListening = () => {
    if (recognitionRef.current && isRecognitionActiveRef.current) {
      try { recognitionRef.current.stop(); } catch (error) {}
      isRecognitionActiveRef.current = false;
      setDebugInfo(prev => ({ ...prev, isListening: false }));
    }
  };

  const startVoiceSetup = async () => {
    if (!voiceEnabled || !voiceAssistantRef.current) {
      toast.error("Enable voice first");
      return;
    }

    safeStopListening();
    setCurrentStep("configuring");
    setConfigStep(0);
    setUserTranscript("");
    setLastSubmittedAnswer("");

    // Reset farmer details
    setFarmerDetails({
      farmerName: "", phoneNumber: "", county: "", subCounty: "", ward: "", village: "",
      altitude: "", annualRainfall: "", totalFarmSize: "", cultivatedAcres: "", soilType: "", waterSources: "",
      hasDoneSoilTest: "", crops: "", cropVarieties: "", cropAcres: "", season: "", plantingDate: "",
      plantingMaterial: "", plantingQuantity: "", seedSource: "", spacing: "",
      commonPests: "", pestControlMethod: "", commonDiseases: "", diseaseControlMethod: "",
      averageHarvest: "", harvestUnit: "", pricePerUnit: "", storageMethod: "",
      dapCost: "", canCost: "", npkCost: "", ploughingCost: "", plantingLabourCost: "",
      weedingCost: "", harvestingCost: "", transportCostPerBag: "", bagCost: "",
      livestockTypes: "", cattle: "", cattleBreed: "", milkYield: "",
      postHarvestPractices: "", postHarvestLosses: "", valueAddition: "", storageAccess: "",
      productionChallenges: "", marketingChallenges: "", climateChallenges: "", financialChallenges: "",
      knowledgeChallenges: "", mainChallenge: "", experience: "",
      organicManure: "", conservationPractices: "", managementLevel: "",
      soilTestDate: "", soilTestPH: "", soilTestPHRating: "", soilTestP: "", soilTestPRating: "",
      soilTestK: "", soilTestKRating: "", soilTestNPercent: "", soilTestNPercentRating: "", targetYield: "",
      plantingFertilizerToUse: "", plantingFertilizerCost: "",
      topdressingFertilizerToUse: "", topdressingFertilizerCost: "",
      potassiumFertilizerToUse: "", potassiumFertilizerCost: "",
      plantingFertilizerType: "", plantingFertilizerQuantity: "",
      topdressingFertilizerType: "", topdressingFertilizerQuantity: "",
      potassiumFertilizerType: "", potassiumFertilizerQuantity: "",
    });

    await voiceAssistantRef.current.speak(
      "Welcome! Let's set up your farm profile. Questions adapt to your answers. Speak clearly!"
    );
    await new Promise(resolve => setTimeout(resolve, 1000));
    askQuestion(0);
  };

  const askQuestion = async (step: number) => {
    if (!voiceAssistantRef.current || step >= visibleQuestions.length) return;
    if (isSpeaking) await new Promise(resolve => setTimeout(resolve, 500));

    const question = visibleQuestions[step].question;
    setDebugInfo(prev => ({ ...prev, currentQuestion: step + 1 }));
    setUserTranscript("");
    await voiceAssistantRef.current.speak(question);
  };

  const generateSession = async () => {
    if (!voiceAssistantRef.current) return;
    setIsLoading(true);

    await voiceAssistantRef.current.speak("Creating your farm profile...");

    let currentUserId = userId || localStorage.getItem('userId') || `user-${Date.now()}`;
    localStorage.setItem('userId', currentUserId);

    try {
      const response = await fetch("/api/vapi/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...farmerDetails, userid: currentUserId })
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const data = await response.json();
      if (data.success && data.sessionId) {
        await voiceAssistantRef.current.speak(`Ready! Taking you to recommendations.`);
        setTimeout(() => window.location.href = `/interview/${data.sessionId}`, 2000);
        setCurrentStep("redirecting");
      }
    } catch (error) {
      toast.error("Error creating profile");
      setCurrentStep("error");
    } finally {
      setIsLoading(false);
    }
  };

  const stopEverything = () => {
    safeStopListening();
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setCurrentStep("idle");
    setStreamingQuestion("");
    setIsStreaming(false);
    setUserTranscript("");
  };

  const skipQuestion = () => {
    if (currentStep === "configuring" && configStep < visibleQuestions.length) {
      processAnswer("not specified");
      toast.info("Skipped");
    }
  };

  const submitAnswer = () => {
    if (userTranscript.trim()) {
      processAnswer(userTranscript);
    }
  };

  const colors = {
    primary: "from-emerald-400 to-cyan-400",
    secondary: "from-purple-400 to-pink-400",
    background: "bg-gradient-to-br from-slate-50 to-white",
    card: "bg-white/80 backdrop-blur-sm",
  };

  const currentSection = visibleQuestions[configStep]?.section || "";
  const wordProgress = currentWordIndex > 0 && questionWordsRef.current.length > 0
    ? `${currentWordIndex}/${questionWordsRef.current.length} words`
    : '';

  const renderInput = () => {
    const q = visibleQuestions[configStep];
    if (!q) return null;

    if (q.type === "date") {
      return (
        <div className="relative">
          <input
            type="date"
            value={userTranscript}
            onChange={(e) => setUserTranscript(e.target.value)}
            className="w-full px-4 py-3 border-2 rounded-xl text-blue-900 font-medium focus:border-blue-600"
          />
          <Calendar className="absolute right-3 top-3 w-5 h-5 text-blue-600" />
        </div>
      );
    }

    if (q.type === "dropdown") {
      return (
        <div className="relative">
          <select
            value={userTranscript}
            onChange={(e) => setUserTranscript(e.target.value)}
            className="w-full px-4 py-3 border-2 rounded-xl appearance-none text-blue-900 font-medium focus:border-blue-600"
          >
            <option value="" className="text-gray-500">Select option</option>
            {q.options?.map((opt: string) => (
              <option key={opt} value={opt} className="text-blue-900">{opt}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-blue-600" />
        </div>
      );
    }

    if (q.type === "multiselect") {
      return (
        <div className="space-y-2 max-h-60 overflow-y-auto p-2 border-2 rounded-xl">
          {q.options?.map((opt: string) => (
            <label key={opt} className="flex items-center gap-2 p-2 hover:bg-blue-50 rounded-lg">
              <input
                type="checkbox"
                value={opt}
                checked={userTranscript.includes(opt)}
                onChange={(e) => {
                  const values = userTranscript ? userTranscript.split(',') : [];
                  e.target.checked ? values.push(opt) : values.splice(values.indexOf(opt), 1);
                  setUserTranscript(values.join(','));
                }}
                className="w-4 h-4 accent-blue-600"
              />
              <span className="text-blue-900">{opt}</span>
            </label>
          ))}
        </div>
      );
    }

    return (
      <input
        type={q.type || "text"}
        value={userTranscript}
        onChange={(e) => setUserTranscript(e.target.value)}
        placeholder="Type your answer here..."
        className="w-full px-4 py-3 border-2 rounded-xl text-blue-900 font-medium focus:border-blue-600 placeholder-gray-400"
      />
    );
  };

  return (
    <div className={`flex flex-col gap-6 p-4 ${colors.background} rounded-2xl min-h-screen`}>
      {/* Header */}
      <div className={`${colors.card} rounded-2xl p-5 shadow-xl border`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Image src={profileImage || "/farmer-avatar.png"} alt="Farmer" width={48} height={48} className="rounded-full ring-4" />
            <div>
              <h4 className="font-bold text-xl">{userName || "Farmer"}</h4>
              <p className="text-sm text-gray-500">Smart Farmer</p>
            </div>
          </div>
          <button
            onClick={startVoiceSetup}
            disabled={!voiceEnabled || currentStep !== "idle"}
            className={`px-6 py-3 rounded-xl font-bold ${
              voiceEnabled && currentStep === "idle"
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:scale-105 transition-all'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {currentStep === "idle" ? "Start Setup" : "Loading..."}
          </button>
        </div>
      </div>

      {/* Voice Toggle */}
      <div className={`${colors.card} rounded-2xl p-5 shadow-xl border`}>
        <VoiceToggle onVoiceToggle={handleVoiceToggle} initialEnabled={voiceEnabled} />
      </div>

      {/* Question Display */}
      {currentStep === "configuring" && visibleQuestions.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 shadow-xl border-2 border-green-300">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center font-bold">
              {debugInfo.currentQuestion}
            </span>
            <h4 className="font-bold text-xl text-emerald-800">Question {debugInfo.currentQuestion} of {visibleQuestions.length}</h4>
            {currentSection && <p className="text-sm text-emerald-600 ml-auto">{currentSection}</p>}
            {isStreaming && (
              <span className="ml-auto flex items-center gap-2 text-emerald-600">
                <Volume2 className="w-5 h-5 animate-pulse" />
                <span className="text-sm">{wordProgress}</span>
              </span>
            )}
          </div>

          <div className="bg-white rounded-xl p-6 border-2 border-emerald-200 min-h-[100px]">
            {streamingQuestion ? (
              <p className="text-2xl text-gray-800">
                {streamingQuestion.split(' ').map((word, wordIdx, arr) => (
                  <span key={wordIdx}>
                    <span className="text-emerald-700 font-bold">
                      {word}
                    </span>
                    {wordIdx < arr.length - 1 ? ' ' : ''}
                  </span>
                ))}
              </p>
            ) : (
              <p className="text-2xl text-gray-400 italic">
                {isStreaming ? '🔊 Speaking...' : 'Ready for your answer...'}
              </p>
            )}
          </div>

          {!isStreaming && streamingQuestion && (
            <div className="mt-6">
              <div className="bg-white rounded-xl border-2 border-purple-200 p-4">
                {renderInput()}

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={submitAnswer}
                    disabled={!userTranscript.trim()}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-2.5 rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Submit Answer
                  </button>
                  <button
                    onClick={skipQuestion}
                    className="px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white py-2.5 rounded-xl font-medium"
                  >
                    Skip
                  </button>
                </div>
              </div>

              {lastSubmittedAnswer && (
                <div className="mt-3 p-3 bg-blue-50 rounded-xl border-2 border-blue-200">
                  <p className="text-sm text-blue-800 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    Your answer: <span className="font-bold text-blue-900">{lastSubmittedAnswer}</span>
                  </p>
                  <p className="text-xs text-blue-600 mt-1">✓ Voice confirmation sent</p>
                </div>
              )}

              {debugInfo.isListening && (
                <div className="mt-3 p-3 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-red-600">🎤 Listening... Speak now!</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Summary Panel */}
      {currentStep === "configuring" && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-5 shadow-xl border border-purple-200">
          <h4 className="font-bold text-lg text-purple-800">Your Farm Profile</h4>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="bg-white p-2 rounded-lg border border-purple-100">
              <span className="text-purple-600">Crop:</span>{" "}
              <span className="font-bold text-blue-900">{farmerDetails.crops || "Not set"}</span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-purple-100">
              <span className="text-purple-600">County:</span>{" "}
              <span className="font-bold text-blue-900">{farmerDetails.county || "Not set"}</span>
            </div>
          </div>
          <p className="text-xs text-purple-600 mt-3">{debugInfo.currentQuestion}/{visibleQuestions.length} answered</p>
        </div>
      )}

      {/* AI Assistant */}
      <div className={`${colors.card} rounded-2xl p-4 shadow-xl border border-purple-200`}>
        <div className="flex items-center gap-4">
          <Image src="/farmer-assistant.jpg" alt="AI" width={48} height={48} className="rounded-full ring-4 ring-purple-200" />
          <div>
            <h4 className="font-bold text-purple-800">🌱 AI Assistant</h4>
            <p className="text-gray-600">
              {currentStep === "idle" ? "Ready!" :
               currentStep === "configuring" ? `Asking ${currentSection} questions` :
               "Processing..."}
            </p>
            {debugInfo.isListening && (
              <p className="text-sm text-blue-600 animate-pulse">🎤 Listening...</p>
            )}
            {isSpeaking && (
              <p className="text-sm text-purple-600 animate-pulse">🔊 Speaking...</p>
            )}
          </div>
        </div>
      </div>

      {/* Stop Button */}
      {(currentStep === "configuring" || currentStep === "generating") && (
        <button onClick={stopEverything} className="px-5 py-3 bg-gradient-to-r from-rose-500 to-red-500 text-white rounded-xl mx-auto w-48 font-medium flex items-center justify-center gap-2">
          <span>🛑</span> Stop Setup
        </button>
      )}
    </div>
  );
};

export default CreateInterviewAgent;