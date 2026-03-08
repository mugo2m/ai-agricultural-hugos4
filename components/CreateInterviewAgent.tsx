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
  Gauge,
  Globe,
  Smartphone,
  PhoneCall
} from "lucide-react";
import { plantingFertilizers } from "@/lib/fertilizers/plantingFertilizers";
import { topDressingFertilizers } from "@/lib/fertilizers/topDressingFertilizers";
import { cropVarieties } from "@/lib/data/varieties";
import { cropPestDiseaseMap } from "@/lib/data/pestDiseaseMapping";
import { getSpacingOptions } from "@/lib/data/spacing";
import { useCurrency } from "@/lib/context/CurrencyContext";
import { COUNTRY_CURRENCY_MAP } from "@/lib/config/currency";

interface CreateInterviewAgentProps {
  userName: string;
  userId?: string;
  profileImage?: string;
}

// Country codes for phone numbers
const countryCodes = [
  { code: "+254", country: "Kenya", flag: "🇰🇪" },
  { code: "+256", country: "Uganda", flag: "🇺🇬" },
  { code: "+255", country: "Tanzania", flag: "🇹🇿" },
  { code: "+250", country: "Rwanda", flag: "🇷🇼" },
  { code: "+257", country: "Burundi", flag: "🇧🇮" },
  { code: "+211", country: "South Sudan", flag: "🇸🇸" },
  { code: "+251", country: "Ethiopia", flag: "🇪🇹" },
  { code: "+252", country: "Somalia", flag: "🇸🇴" },
  { code: "+253", country: "Djibouti", flag: "🇩🇯" },
  { code: "+291", country: "Eritrea", flag: "🇪🇷" },
  { code: "+234", country: "Nigeria", flag: "🇳🇬" },
  { code: "+233", country: "Ghana", flag: "🇬🇭" },
  { code: "+221", country: "Senegal", flag: "🇸🇳" },
  { code: "+225", country: "Ivory Coast", flag: "🇨🇮" },
  { code: "+223", country: "Mali", flag: "🇲🇱" },
  { code: "+226", country: "Burkina Faso", flag: "🇧🇫" },
  { code: "+227", country: "Niger", flag: "🇳🇪" },
  { code: "+228", country: "Togo", flag: "🇹🇬" },
  { code: "+229", country: "Benin", flag: "🇧🇯" },
  { code: "+224", country: "Guinea", flag: "🇬🇳" },
  { code: "+245", country: "Guinea-Bissau", flag: "🇬🇼" },
  { code: "+231", country: "Liberia", flag: "🇱🇷" },
  { code: "+232", country: "Sierra Leone", flag: "🇸🇱" },
  { code: "+220", country: "Gambia", flag: "🇬🇲" },
  { code: "+238", country: "Cape Verde", flag: "🇨🇻" },
  { code: "+237", country: "Cameroon", flag: "🇨🇲" },
  { code: "+241", country: "Gabon", flag: "🇬🇦" },
  { code: "+235", country: "Chad", flag: "🇹🇩" },
  { code: "+236", country: "Central African Republic", flag: "🇨🇫" },
  { code: "+240", country: "Equatorial Guinea", flag: "🇬🇶" },
  { code: "+242", country: "Congo Brazzaville", flag: "🇨🇬" },
  { code: "+243", country: "Congo Kinshasa", flag: "🇨🇩" },
  { code: "+244", country: "Angola", flag: "🇦🇴" },
  { code: "+239", country: "São Tomé", flag: "🇸🇹" },
  { code: "+27", country: "South Africa", flag: "🇿🇦" },
  { code: "+264", country: "Namibia", flag: "🇳🇦" },
  { code: "+267", country: "Botswana", flag: "🇧🇼" },
  { code: "+263", country: "Zimbabwe", flag: "🇿🇼" },
  { code: "+260", country: "Zambia", flag: "🇿🇲" },
  { code: "+265", country: "Malawi", flag: "🇲🇼" },
  { code: "+258", country: "Mozambique", flag: "🇲🇿" },
  { code: "+261", country: "Madagascar", flag: "🇲🇬" },
  { code: "+269", country: "Comoros", flag: "🇰🇲" },
  { code: "+230", country: "Mauritius", flag: "🇲🇺" },
  { code: "+248", country: "Seychelles", flag: "🇸🇨" },
  { code: "+268", country: "Eswatini", flag: "🇸🇿" },
  { code: "+266", country: "Lesotho", flag: "🇱🇸" },
  { code: "+20", country: "Egypt", flag: "🇪🇬" },
  { code: "+249", country: "Sudan", flag: "🇸🇩" },
  { code: "+218", country: "Libya", flag: "🇱🇾" },
  { code: "+216", country: "Tunisia", flag: "🇹🇳" },
  { code: "+213", country: "Algeria", flag: "🇩🇿" },
  { code: "+212", country: "Morocco", flag: "🇲🇦" },
  { code: "+222", country: "Mauritania", flag: "🇲🇷" },
  { code: "+1", country: "USA/Canada", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+33", country: "France", flag: "🇫🇷" },
  { code: "+49", country: "Germany", flag: "🇩🇪" }
];

// Define crop categories
const cropCategories = {
  grains: ["maize", "beans", "wheat", "sorghum", "millet", "rice", "barley", "finger millet"],
  pulses: ["soya beans", "cowpeas", "green grams", "bambara nuts", "groundnuts", "pigeon peas"],
  cash: ["coffee", "cotton", "sugarcane", "tobacco", "sunflower", "simsim", "pyrethrum"],
  tubers: ["cassava", "sweet potatoes", "irish potatoes", "yams", "arrow roots"],
  vegetables: ["tomatoes", "cabbage", "kales", "onions", "carrots", "capsicums", "chillies", "brinjals", "french beans", "garden peas", "spinach", "cauliflower"],
  fruits: ["bananas", "oranges", "pineapples", "mangoes", "avocados", "pawpaws", "passion fruit", "citrus", "watermelon"],
  cover: ["mucuna", "desmodium", "dolichos", "canavalia", "crotalaria ochroleuca", "crotalaria juncea", "crotalaria paulina"]
};

// Helper to get crop type
const getCropType = (crop: string): string => {
  const lowerCrop = crop.toLowerCase();
  for (const [type, crops] of Object.entries(cropCategories)) {
    if (crops.includes(lowerCrop)) return type;
  }
  if (lowerCrop.includes("potato")) return "tubers";
  if (lowerCrop.includes("banana")) return "fruits";
  if (lowerCrop.includes("coffee")) return "cash";
  if (lowerCrop.includes("sugar")) return "cash";
  if (lowerCrop.includes("tomato")) return "vegetables";
  return "grains";
};

// Helper to get varieties dropdown
const getVarietiesOptions = (crop: string) => {
  const varieties = cropVarieties[crop.toLowerCase() as keyof typeof cropVarieties] || [];
  return varieties;
};

// Helper to get pests dropdown
const getPestsOptions = (crop: string) => {
  const pests = cropPestDiseaseMap[crop.toLowerCase()]?.filter(p => p.type === "pest").map(p => p.name) || [];
  if (pests.length === 0) {
    return ["Aphids", "Cutworms", "Stalk borers", "Fall armyworm", "Thrips", "Whiteflies", "Other (specify)"];
  }
  return pests;
};

// Helper to get diseases dropdown
const getDiseasesOptions = (crop: string) => {
  const diseases = cropPestDiseaseMap[crop.toLowerCase()]?.filter(p => p.type === "disease").map(p => p.name) || [];
  if (diseases.length === 0) {
    return ["Blight", "Rust", "Mosaic virus", "Leaf spot", "Powdery mildew", "Other (specify)"];
  }
  return diseases;
};

// Helper to get planting material question
const getPlantingMaterialQuestion = (crop: string) => {
  const cropType = getCropType(crop);
  const lowerCrop = crop.toLowerCase();

  if (lowerCrop === "bananas") {
    return {
      id: "plantingMaterial",
      question: "What type of banana planting material will you use for your enterprise?",
      type: "dropdown",
      options: ["Sword suckers", "Tissue culture seedlings", "Mother plant corms", "Bits", "Other"],
      section: "Planting Material"
    };
  }
  if (lowerCrop === "coffee") {
    return {
      id: "plantingMaterial",
      question: "What type of coffee planting material will you use for your enterprise?",
      type: "dropdown",
      options: ["Grafted seedlings", "Cuttings", "Seeds", "Tissue culture", "Other"],
      section: "Planting Material"
    };
  }
  if (lowerCrop === "sugarcane") {
    return {
      id: "plantingMaterial",
      question: "What type of sugarcane planting material will you use for your enterprise?",
      type: "dropdown",
      options: ["Setts (cane cuttings)", "Ratoon (regrowth)", "Tissue culture", "Other"],
      section: "Planting Material"
    };
  }
  if (lowerCrop.includes("potato")) {
    return {
      id: "plantingMaterial",
      question: "What type of potato planting material will you use for your enterprise?",
      type: "dropdown",
      options: ["Certified seed potatoes", "Farm-saved tubers", "Whole tubers", "Cut pieces", "Other"],
      section: "Planting Material"
    };
  }
  if (cropType === "tubers") {
    return {
      id: "plantingMaterial",
      question: `What type of planting material will you use for your ${crop} enterprise?`,
      type: "dropdown",
      options: ["Tubers", "Root cuttings", "Sets", "Certified seed", "Other"],
      section: "Planting Material"
    };
  }
  if (cropType === "fruits") {
    return {
      id: "plantingMaterial",
      question: `What type of planting material will you use for your ${crop} enterprise?`,
      type: "dropdown",
      options: ["Grafted seedlings", "Seedlings", "Cuttings", "Air layers", "Other"],
      section: "Planting Material"
    };
  }
  if (cropType === "vegetables") {
    return {
      id: "plantingMaterial",
      question: `How will you establish your ${crop} enterprise?`,
      type: "dropdown",
      options: ["Direct seeding", "Transplanting seedlings", "Sets", "Cuttings", "Other"],
      section: "Planting Material"
    };
  }
  return {
    id: "seedSource",
    question: "Where will you get your seeds from for your enterprise?",
    type: "dropdown",
    options: ["Certified seed dealer", "Farm-saved seed", "Local market", "Neighbors", "Agrovet", "Other"],
    section: "Seeds"
  };
};

// Helper to get planting quantity question
const getPlantingQuantityQuestion = (crop: string) => {
  const cropType = getCropType(crop);
  const lowerCrop = crop.toLowerCase();

  if (lowerCrop === "maize") {
    return {
      id: "seedRate",
      question: "What seed rate will you use for your maize enterprise? (kg per acre) - Recommended: 10kg/acre (25kg/ha)",
      type: "number",
      placeholder: "e.g., 10 kg",
      step: "any",
      section: "Seeds"
    };
  }
  if (lowerCrop === "beans") {
    return {
      id: "seedRate",
      question: "What seed rate will you use for your beans enterprise? (kg per acre) - Recommended: 20-24kg/acre (50-60kg/ha)",
      type: "number",
      placeholder: "e.g., 20 kg",
      step: "any",
      section: "Seeds"
    };
  }
  if (lowerCrop === "finger millet") {
    return {
      id: "seedRate",
      question: "What seed rate will you use for your finger millet enterprise? (kg per acre) - Recommended: 1.6kg/acre (4kg/ha)",
      type: "number",
      placeholder: "e.g., 1.6 kg",
      step: "any",
      section: "Seeds"
    };
  }
  if (lowerCrop === "sorghum") {
    return {
      id: "seedRate",
      question: "What seed rate will you use for your sorghum enterprise? (kg per acre) - Recommended: 2.8kg/acre (7kg/ha)",
      type: "number",
      placeholder: "e.g., 2.8 kg",
      step: "any",
      section: "Seeds"
    };
  }
  if (lowerCrop === "soya beans") {
    return {
      id: "seedRate",
      question: "What seed rate will you use for your soya beans enterprise? (kg per acre) - Recommended: 16-24kg/acre (40-60kg/ha)",
      type: "number",
      placeholder: "e.g., 20 kg",
      step: "any",
      section: "Seeds"
    };
  }
  if (lowerCrop === "groundnuts") {
    return {
      id: "seedRate",
      question: "What seed rate will you use for your groundnuts enterprise? (kg per acre) - Recommended: 18-20kg/acre (45-50kg/ha)",
      type: "number",
      placeholder: "e.g., 18 kg",
      step: "any",
      section: "Seeds"
    };
  }
  if (lowerCrop === "sunflower") {
    return {
      id: "seedRate",
      question: "What seed rate will you use for your sunflower enterprise? (kg per acre) - Recommended: 2kg/acre (5kg/ha)",
      type: "number",
      placeholder: "e.g., 2 kg",
      step: "any",
      section: "Seeds"
    };
  }
  if (lowerCrop === "cassava") {
    return {
      id: "plantingQuantity",
      question: "How many cuttings will you plant per acre for your cassava enterprise? - Recommended: 4,000 cuttings (10,000/ha)",
      type: "number",
      placeholder: "e.g., 4000",
      step: "any",
      section: "Planting Material"
    };
  }
  if (lowerCrop === "sweet potatoes") {
    return {
      id: "plantingQuantity",
      question: "How many vines will you plant per acre for your sweet potatoes enterprise? - Recommended: 16,000 plants",
      type: "number",
      placeholder: "e.g., 16000",
      step: "any",
      section: "Planting Density"
    };
  }
  if (lowerCrop === "irish potatoes") {
    return {
      id: "seedRate",
      question: "What seed rate will you use for your Irish potatoes enterprise? (90kg bags per acre) - Recommended: 10-12 bags (25-30 bags/ha)",
      type: "number",
      placeholder: "e.g., 10 bags",
      step: "any",
      section: "Seeds"
    };
  }
  if (lowerCrop === "tomatoes") {
    return {
      id: "seedRate",
      question: "What seed rate will you use for your tomatoes enterprise? (grams for nursery) - Recommended: 60-80g/acre (150-200g/ha)",
      type: "number",
      placeholder: "e.g., 80 grams",
      step: "any",
      section: "Seeds"
    };
  }
  if (lowerCrop === "onions") {
    return {
      id: "seedRate",
      question: "What seed rate will you use for your onions enterprise? (kg for nursery) - Recommended: 0.7-0.8kg/acre (1.75-2kg/ha)",
      type: "number",
      placeholder: "e.g., 0.8 kg",
      step: "any",
      section: "Seeds"
    };
  }
  if (lowerCrop === "cabbages" || lowerCrop === "kales") {
    return {
      id: "seedRate",
      question: "What seed rate will you use for your cabbage/kales enterprise? (grams for nursery) - Recommended: 200g/acre (500g/ha)",
      type: "number",
      placeholder: "e.g., 200 grams",
      step: "any",
      section: "Seeds"
    };
  }
  if (lowerCrop === "carrots") {
    return {
      id: "seedRate",
      question: "What seed rate will you use for your carrots enterprise? (kg per acre) - Recommended: 1.2-1.6kg/acre (3-4kg/ha)",
      type: "number",
      placeholder: "e.g., 1.5 kg",
      step: "any",
      section: "Seeds"
    };
  }
  if (lowerCrop === "bananas") {
    return {
      id: "plantingQuantity",
      question: "How many banana suckers will you plant per acre for your banana enterprise? - Recommended: 450 suckers (3m x 3m spacing)",
      type: "number",
      placeholder: "e.g., 450",
      step: "any",
      section: "Planting Density"
    };
  }
  if (lowerCrop === "coffee") {
    return {
      id: "plantingQuantity",
      question: "How many coffee seedlings will you plant per acre for your coffee enterprise? - Recommended: 1,300 trees (2.75m x 2.75m)",
      type: "number",
      placeholder: "e.g., 1300",
      step: "any",
      section: "Planting Density"
    };
  }
  return {
    id: "seedRate",
    question: `What seed rate will you use for your ${crop} enterprise? (kg per acre)`,
    type: "number",
    placeholder: "e.g., 10 kg",
    step: "any",
    section: "Seeds"
  };
};

// Helper to get storage question
const getStorageQuestion = (crop: string) => {
  const lowerCrop = crop.toLowerCase();

  if (lowerCrop === "maize" || lowerCrop === "sorghum" || lowerCrop === "finger millet") {
    return {
      id: "storageMethod",
      question: "How will you store your grain to protect your investment?",
      type: "dropdown",
      options: ["Hermetic bags", "Metallic silos", "Gunny bags", "Local cribs", "Sold immediately", "Other"],
      section: "Storage"
    };
  }
  if (lowerCrop === "beans" || lowerCrop === "cowpeas" || lowerCrop === "green grams" || lowerCrop === "groundnuts") {
    return {
      id: "storageMethod",
      question: "How will you store your pulses to maximize profit?",
      type: "dropdown",
      options: ["Hermetic bags", "Gunny bags", "Plastic containers", "Sold immediately", "Other"],
      section: "Storage"
    };
  }
  if (lowerCrop === "irish potatoes" || lowerCrop === "sweet potatoes" || lowerCrop === "cassava") {
    return {
      id: "storageMethod",
      question: "How will you store your tubers to reduce losses?",
      type: "dropdown",
      options: ["Cool dark room", "In-ground storage", "Sold immediately", "Processed into flour", "Other"],
      section: "Storage"
    };
  }
  if (lowerCrop === "tomatoes" || lowerCrop === "onions" || lowerCrop === "cabbages") {
    return {
      id: "storageMethod",
      question: "How will you handle your vegetables after harvest to maintain quality?",
      type: "dropdown",
      options: ["Sold immediately", "Cool storage", "Market delivery", "Other"],
      section: "Storage"
    };
  }
  return {
    id: "storageMethod",
    question: "How will you store your harvest to protect your investment?",
    type: "dropdown",
    options: ["Sold immediately", "Storage facility", "Cold storage", "Other"],
    section: "Storage"
  };
};

const CreateInterviewAgent = ({
  userName,
  userId,
  profileImage
}: CreateInterviewAgentProps) => {
  const { setCountry } = useCurrency();
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userTranscript, setUserTranscript] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastSubmittedAnswer, setLastSubmittedAnswer] = useState("");
  const [selectedCountryCode, setSelectedCountryCode] = useState("+254");
  const nameUsageCountRef = useRef(0);

  const [currentStep, setCurrentStep] = useState<"idle" | "configuring" | "generating" | "redirecting" | "error">("idle");
  const [configStep, setConfigStep] = useState(0);

  const [streamingQuestion, setStreamingQuestion] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const questionWordsRef = useRef<string[]>([]);

  // ========== FERTILIZER DATABASE MAPPINGS ==========
  const plantingFertilizerOptions = [
    { label: "DAP (18-46-0)", id: "dap" },
    { label: "TSP (0-46-0)", id: "tsp" },
    { label: "SSP (0-20-0)", id: "ssp" },
    { label: "NPK 23-23-0 (23-23-0)", id: "npk_2323" },
    { label: "NPK 17-17-17 (17-17-17)", id: "npk_171717" },
    { label: "NPK 12.24.12+5S (12-24-12+5S)", id: "elgon_thabiti_1225_hort_special" },
    { label: "Yara Mila Power (13-24-12)", id: "yara_power" },
    { label: "MEA NPK 10-26-10", id: "mea_102610" },
    { label: "OCP NPSB (18.9-37.7-0)", id: "ocp_npsb" },
    { label: "Other", id: "other" }
  ];

  const topdressingFertilizerOptions = [
    { label: "UREA (46-0-0)", id: "ss_urea" },
    { label: "CAN (27-0-0)", id: "ss_can" },
    { label: "ASN (21-0-0-23S)", id: "ss_as" },
    { label: "Yara Bela Sulfan (24-0-0+6S)", id: "yara_bela_sulfan" },
    { label: "KynoKuza (20-4-20)", id: "etg_kynokuza" },
    { label: "KynoGrowMax (30-0-10)", id: "etg_kynogrowmax" },
    { label: "NPK 23-10-10", id: "mea_231010" },
    { label: "NPK 26-0-20", id: "elgon_thabiti_top_sugar" },
    { label: "Other", id: "other" }
  ];

  const potassiumFertilizerOptions = [
    { label: "MOP (0-0-60)", id: "mop" },
    { label: "SOP (0-0-50)", id: "sop" },
    { label: "Korn-Kali (0-0-40)", id: "kplus_korn_kali" },
    { label: "Patentkali (0-0-30)", id: "kplus_patentkali" },
    { label: "None - I don't use potassium", id: "none" }
  ];

  // Farmer details state
  const [farmerDetails, setFarmerDetails] = useState({
    country: "",
    farmerName: "",
    phoneCountryCode: "+254",
    phoneNumber: "",
    county: "",
    subCounty: "",
    ward: "",
    village: "",
    totalFarmSize: "",
    cultivatedAcres: "",
    waterSources: "",
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
    commonPests: "",
    pestControlMethod: "",
    commonDiseases: "",
    diseaseControlMethod: "",
    harvestUnit: "",
    pricePerUnit: "",
    storageMethod: "",
    npkCost: "",
    ploughingCost: "",
    plantingLabourCost: "",
    weedingCost: "",
    harvestingCost: "",
    transportCostPerBag: "",
    bagCost: "",
    seedCost: "",
    calciticLimePricePerBag: "",
    recCalciticLime: "",
    livestockTypes: "",
    cattle: "",
    cattleBreed: "",
    milkYield: "",
    postHarvestPractices: "",
    postHarvestLosses: "",
    valueAddition: "",
    storageAccess: "",
    productionChallenges: "",
    marketingChallenges: "",
    climateChallenges: "",
    financialChallenges: "",
    conservationPractices: "",
    soilTestDate: "",
    soilTestPH: "",
    soilTestPHRating: "",
    soilTestP: "",
    soilTestPRating: "",
    soilTestK: "",
    soilTestKRating: "",
    soilTestNPercent: "",
    soilTestNPercentRating: "",
    soilTestOC: "",
    soilTestOCRating: "",
    soilTestOM: "",
    soilTestOMRating: "",
    soilTestCEC: "",
    soilTestCECRating: "",
    soilTestCa: "",
    soilTestCaRating: "",
    soilTestMg: "",
    soilTestMgRating: "",
    soilTestNa: "",
    soilTestNaRating: "",
    targetYield: "",
    recPlantingFertilizer: "",
    recPlantingQuantity: "",
    recTopdressingFertilizer: "",
    recTopdressingQuantity: "",
    recPotassiumFertilizer: "",
    recPotassiumQuantity: "",
    plantingFertilizerToUse: "",
    plantingFertilizerCost: "",
    topdressingFertilizerToUse: "",
    topdressingFertilizerCost: "",
    potassiumFertilizerToUse: "",
    potassiumFertilizerCost: "",
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

  // ============ REORDERED BASE QUESTIONS ============
  // PART 1: COUNTRY (1st)
  const countryQuestion = [
    {
      id: "country",
      question: "Which country are you in?",
      type: "dropdown",
      options: [
        "kenya", "uganda", "tanzania", "rwanda", "burundi", "southsudan",
        "ethiopia", "somalia", "djibouti", "eritrea", "nigeria", "ghana",
        "senegal", "ivorycoast", "mali", "burkinafaso", "niger", "togo",
        "benin", "guinea", "liberia", "sierraleone", "gambia", "capoverde",
        "cameroon", "gabon", "chad", "car", "equatorialguinea", "congobrazzaville",
        "congokinshasa", "angola", "saotome", "southafrica", "namibia",
        "botswana", "zimbabwe", "zambia", "malawi", "mozambique", "madagascar",
        "comoros", "mauritius", "seychelles", "eswatini", "lesotho", "egypt",
        "sudan", "libya", "tunisia", "algeria", "morocco", "mauritania",
        "usa", "uk", "europe", "other"
      ],
      section: "Location"
    }
  ];

  // PART 2: SOIL TEST GATEKEEPER (2nd)
  const soilTestGatekeeperQuestion = [
    {
      id: "hasDoneSoilTest",
      question: "Have you done a comprehensive soil test for your enterprise?",
      type: "dropdown",
      options: ["Yes", "No"],
      section: "Soil Test"
    }
  ];

  // PART 3: CROP SELECTION (3rd) - FIXED: Now dropdown only, not date
  const cropSelectionQuestion = {
    id: "crops",
    question: "Which crop enterprise will you invest in?",
    type: "dropdown",
    options: [
      "maize", "beans", "finger millet", "sorghum", "soya beans", "cowpeas",
      "green grams", "bambara nuts", "groundnuts", "sunflower", "simsim",
      "coffee", "cotton", "sugarcane", "tobacco", "cassava", "sweet potatoes",
      "irish potatoes", "tomatoes", "kales", "cabbages", "onions", "carrots",
      "capsicums", "chillies", "brinjals", "french beans", "garden peas",
      "bananas", "oranges", "pineapples", "avocados", "pawpaws", "passion fruit"
    ],
    section: "Crops"
  };

  // PART 4: CROP-SPECIFIC QUESTIONS (4th)
  const getCropSpecificQuestions = () => {
    if (!farmerDetails.crops) return [];
    const crop = farmerDetails.crops;

    const spacingOptions = getSpacingOptions(crop);

    return [
      {
        id: "cropVarieties",
        question: `Which variety will you grow for your ${crop} enterprise?`,
        type: "combobox", // CHANGED: dropdown + typing
        options: getVarietiesOptions(crop),
        section: "Crops"
      },
      {
        id: "cropAcres",
        question: `How many acres will you dedicate to your ${crop} enterprise?`,
        type: "number",
        step: "any",
        placeholder: "e.g., 2.5",
        section: "Crops"
      },
      { id: "season", question: "Which season will you plant for maximum profit?", type: "dropdown", options: ["long rains", "short rains", "dry season"], section: "Crops" },
      {
        id: "plantingDate",
        question: "When will you plant? (select date)",
        type: "date",
        minDate: "2024-01-01",
        maxDate: new Date().toISOString().split('T')[0],
        section: "Crops"
      },
      getPlantingMaterialQuestion(crop),
      {
        id: "spacing",
        question: `What spacing will you use for your ${crop} enterprise?`,
        type: "dropdown",
        options: spacingOptions.map(s => s.label),
        section: "Planting Density"
      },
      getPlantingQuantityQuestion(crop),
    ];
  };

  // PART 5: PRODUCTION QUESTIONS (5th)
  const getProductionQuestions = () => {
    if (!farmerDetails.crops) return [];
    const crop = farmerDetails.crops;
    const cropType = getCropType(crop);

    let unitOptions = ["kg", "tonnes"];
    if (cropType === "grains") unitOptions = ["90kg bags", "50kg bags", "kg", "tonnes"];
    if (crop === "bananas") unitOptions = ["tonnes", "kg", "bunches"];
    if (crop === "coffee") unitOptions = ["kg cherry", "tonnes cherry", "kg clean coffee"];
    if (crop === "tomatoes") unitOptions = ["kg", "crates", "tonnes"];
    if (crop === "irish potatoes") unitOptions = ["90kg bags", "kg", "tonnes"];

    return [
      { id: "harvestUnit", question: "What unit will you use for your yield?", type: "dropdown", options: unitOptions, section: "Production" },
      { id: "pricePerUnit", question: "What price do you expect per unit?", type: "number", step: "any", placeholder: "e.g., 6750", section: "Production" },
      getStorageQuestion(crop)
    ];
  };

  // PART 6: FARM & WATER (6th)
  const farmWaterQuestions = [
    {
      id: "totalFarmSize",
      question: "What is your total farm size? (acres)",
      type: "number",
      step: "any",
      placeholder: "e.g., 5",
      section: "Farm"
    },
    {
      id: "cultivatedAcres",
      question: "How many acres are you cultivating for this enterprise?",
      type: "number",
      step: "any",
      placeholder: "e.g., 2.5",
      section: "Farm"
    },
    {
      id: "waterSources",
      question: "What are your main water sources? (Select all that apply)",
      type: "multiselect",
      options: [
        "River only", "Stream only", "Protected spring only", "Borehole only",
        "Hand-dug well only", "Piped scheme only", "Rainwater harvesting only",
        "Water pan/pond only", "River + Borehole", "River + Well", "River + Rainwater",
        "Borehole + Well", "Borehole + Rainwater", "Well + Rainwater",
        "Spring + Stream", "Piped + Rainwater", "River + Borehole + Well",
        "River + Borehole + Rainwater", "River + Well + Rainwater",
        "Borehole + Well + Rainwater", "Spring + Stream + Rainwater",
        "All available sources", "None (dryland farming)"
      ],
      section: "Water"
    }
  ];

  // PART 7: PESTS & DISEASES (7th)
  const getPestQuestions = () => {
    if (!farmerDetails.crops) return [];
    const crop = farmerDetails.crops;

    return [
      {
        id: "commonPests",
        question: "Which pests threaten your enterprise's profitability?",
        type: "multiselect",
        options: getPestsOptions(crop),
        section: "Pests"
      },
      {
        id: "commonDiseases",
        question: "Which diseases affect your enterprise's yield?",
        type: "multiselect",
        options: getDiseasesOptions(crop),
        section: "Diseases"
      },
    ];
  };

  // PART 8: FINANCIAL (8th)
  const getFinancialQuestions = () => {
    if (!farmerDetails.crops) return [];

    return [
      { id: "seedCost", question: "How much do you pay per kg for your seed?", type: "number", placeholder: "e.g., 180", step: "any", section: "Finance" },
      { id: "calciticLimePricePerBag", question: "How much do you pay per 50kg bag of calcitic lime?", type: "number", placeholder: "e.g., 300", step: "any", section: "Finance" },
      { id: "ploughingCost", question: "Ploughing cost per acre?", type: "number", step: "any", placeholder: "e.g., 7000", section: "Finance" },
      { id: "plantingLabourCost", question: "Planting labour cost per acre?", type: "number", step: "any", placeholder: "e.g., 2000", section: "Finance" },
      { id: "weedingCost", question: "Weeding cost per acre?", type: "number", step: "any", placeholder: "e.g., 2500", section: "Finance" },
      { id: "harvestingCost", question: "Harvesting cost per acre?", type: "number", step: "any", placeholder: "e.g., 2000", section: "Finance" },
      { id: "transportCostPerBag", question: "Transport cost per unit?", type: "number", step: "any", placeholder: "e.g., 50", section: "Finance" },
      { id: "bagCost", question: "Cost per empty bag?", type: "number", step: "any", placeholder: "e.g., 40", section: "Finance" },
    ];
  };

  // PART 9: CONSERVATION (9th)
  const conservationQuestion = [
    {
      id: "conservationPractices",
      question: "What soil and water conservation practices do you use to protect your investment?",
      type: "multiselect",
      options: [
        "Organic manure",
        "Terracing",
        "Mulching",
        "Cover crops",
        "Rainwater harvesting",
        "Contour farming",
        "None"
      ],
      section: "Conservation"
    }
  ];

  // PART 10: CHALLENGES (10th)
  const challengesQuestions = [
    {
      id: "productionChallenges",
      question: "What production challenges hurt your profit?",
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
      question: "What marketing challenges keep money from your pocket?",
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
      question: "What climate challenges affect your enterprise?",
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
      question: "What financial challenges limit your growth?",
      type: "multiselect",
      options: [
        "No capital", "No loans", "High interest rates",
        "No subsidies", "High input costs", "Cash flow problems",
        "Debt", "Other"
      ],
      section: "Challenges"
    },
  ];

  // PART 11: PERSONAL & LOCATION (11th - LAST)
  const personalLocationQuestions = [
    { id: "farmerName", question: "What is your name?", type: "text", placeholder: "e.g., John Mugo", section: "Personal" },
    {
      id: "phoneNumber",
      question: "What is your phone number?",
      type: "tel",
      renderCustom: true,
      section: "Personal"
    },
    { id: "county", question: "What county/region are you in?", type: "text", placeholder: "e.g., Bungoma", section: "Location" },
    { id: "subCounty", question: "Which sub-county/district?", type: "text", placeholder: "e.g., Kimilili", section: "Location" },
    { id: "ward", question: "Which ward?", type: "text", placeholder: "e.g., Kimilili", section: "Location" },
    { id: "village", question: "Which village?", type: "text", placeholder: "e.g., Sikulu", section: "Location" },
  ];

  // ============ SOIL TEST DETAILS QUESTIONS ============
  const soilTestDetailsQuestions = [
    { id: "soilTestDate", question: "When was your soil test done?", type: "date", minDate: "2020-01-01", maxDate: new Date().toISOString().split('T')[0], dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, section: "Soil Test" },
    { id: "soilTestPH", question: "What is your pH value?", type: "number", min: 0, max: 14, step: 0.1, dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, section: "Soil Test" },
    { id: "soilTestPHRating", question: "What is your pH rating?", type: "dropdown", options: ["Very Low", "Low", "Optimum", "High", "Very High"], dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, section: "Soil Test" },
    { id: "soilTestP", question: "Phosphorus (P) in ppm?", type: "number", step: "any", dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, section: "Soil Test" },
    { id: "soilTestPRating", question: "Phosphorus rating?", type: "dropdown", options: ["Very Low", "Low", "Optimum", "High", "Very High"], dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, section: "Soil Test" },
    { id: "soilTestK", question: "Potassium (K) in ppm?", type: "number", step: "any", dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, section: "Soil Test" },
    { id: "soilTestKRating", question: "Potassium rating?", type: "dropdown", options: ["Very Low", "Low", "Optimum", "High", "Very High"], dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, section: "Soil Test" },
    { id: "soilTestNPercent", question: "Total Nitrogen (N) in %?", type: "number", min: 0, max: 5, step: 0.01, dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, section: "Soil Test" },
    { id: "soilTestNPercentRating", question: "Nitrogen rating?", type: "dropdown", options: ["Very Low", "Low", "Optimum", "High", "Very High"], dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, section: "Soil Test" },
    { id: "soilTestCa", question: "Calcium (Ca) in ppm?", type: "number", step: "any", dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, section: "Soil Test" },
    { id: "soilTestCaRating", question: "Calcium rating?", type: "dropdown", options: ["Very Low", "Low", "Optimum", "High", "Very High"], dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, section: "Soil Test" },
    { id: "soilTestMg", question: "Magnesium (Mg) in ppm?", type: "number", step: "any", dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, section: "Soil Test" },
    { id: "soilTestMgRating", question: "Magnesium rating?", type: "dropdown", options: ["Very Low", "Low", "Optimum", "High", "Very High"], dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, section: "Soil Test" },
    { id: "soilTestNa", question: "Sodium (Na) in ppm?", type: "number", step: "any", dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, section: "Soil Test" },
    { id: "soilTestNaRating", question: "Sodium rating?", type: "dropdown", options: ["Very Low", "Low", "Optimum", "High", "Very High"], dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, section: "Soil Test" },
    { id: "soilTestOC", question: "Organic Carbon (OC) in %?", type: "number", step: 0.01, dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, section: "Soil Test" },
    { id: "soilTestOCRating", question: "Organic Carbon rating?", type: "dropdown", options: ["Very Low", "Low", "Optimum", "High", "Very High"], dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, section: "Soil Test" },
    { id: "soilTestOM", question: "Organic Matter (OM) in %?", type: "number", step: 0.01, dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, section: "Soil Test" },
    { id: "soilTestOMRating", question: "Organic Matter rating?", type: "dropdown", options: ["Very Low", "Low", "Optimum", "High", "Very High"], dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, section: "Soil Test" },
    { id: "soilTestCEC", question: "CEC in meq/100g?", type: "number", step: "any", dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, section: "Soil Test" },
    { id: "soilTestCECRating", question: "CEC rating?", type: "dropdown", options: ["Very Low", "Low", "Optimum", "High", "Very High"], dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, section: "Soil Test" },

    // SOIL TEST RECOMMENDATIONS
    {
      id: "targetYield",
      question: "According to your soil test, what is your recommended target yield? (e.g., 27 bags/acre)",
      type: "number",
      step: "any",
      dependsOn: { field: "hasDoneSoilTest", value: "Yes" },
      section: "Soil Test Recommendations"
    },
    {
      id: "recCalciticLime",
      question: "According to your soil test, what calcitic lime rate (kg/acre) was recommended? (e.g., 120)",
      type: "number",
      step: "any",
      placeholder: "e.g., 120",
      dependsOn: { field: "hasDoneSoilTest", value: "Yes" },
      section: "Soil Test Recommendations"
    },
    {
      id: "recPlantingFertilizer",
      question: "According to your soil test, what is your recommended planting fertilizer and its formulation? (e.g., NPK 12.24.12+5S)",
      type: "text",
      placeholder: "e.g., NPK 12.24.12+5S",
      dependsOn: { field: "hasDoneSoilTest", value: "Yes" },
      section: "Soil Test Recommendations"
    },
    {
      id: "recPlantingQuantity",
      question: "According to your soil test, what is the recommended quantity per acre for your planting fertilizer? (e.g., 100kg)",
      type: "number",
      step: "any",
      placeholder: "e.g., 100",
      dependsOn: { field: "hasDoneSoilTest", value: "Yes" },
      section: "Soil Test Recommendations"
    },
    {
      id: "recTopdressingFertilizer",
      question: "According to your soil test, what is your recommended topdressing fertilizer and its formulation? (e.g., UREA 46-0-0)",
      type: "text",
      placeholder: "e.g., UREA 46-0-0",
      dependsOn: { field: "hasDoneSoilTest", value: "Yes" },
      section: "Soil Test Recommendations"
    },
    {
      id: "recTopdressingQuantity",
      question: "According to your soil test, what is the recommended quantity per acre for your topdressing fertilizer? (e.g., 90kg)",
      type: "number",
      step: "any",
      placeholder: "e.g., 90",
      dependsOn: { field: "hasDoneSoilTest", value: "Yes" },
      section: "Soil Test Recommendations"
    },
    {
      id: "recPotassiumFertilizer",
      question: "According to your soil test, what is your recommended potassium fertilizer and its formulation? (e.g., MOP 0-0-60)",
      type: "text",
      placeholder: "e.g., MOP 0-0-60",
      dependsOn: { field: "hasDoneSoilTest", value: "Yes" },
      section: "Soil Test Recommendations"
    },
    {
      id: "recPotassiumQuantity",
      question: "According to your soil test, what is the recommended quantity per acre for your potassium fertilizer? (e.g., 30kg)",
      type: "number",
      step: "any",
      placeholder: "e.g., 30",
      dependsOn: { field: "hasDoneSoilTest", value: "Yes" },
      section: "Soil Test Recommendations"
    },
  ];

  // ============ FERTILIZER SELECTION QUESTIONS ============
  const fertilizerSelectionQuestions = [
    {
      id: "plantingFertilizerToUse",
      question: "Based on your soil test recommendations, which planting fertilizer will you actually buy and use for your enterprise?",
      type: "dropdown",
      options: plantingFertilizerOptions.map(opt => opt.label),
      dependsOn: { field: "hasDoneSoilTest", value: "Yes" },
      section: "Fertilizer Selection"
    },
    {
      id: "plantingFertilizerCost",
      question: "How much do you pay for a 50kg bag of your chosen planting fertilizer?",
      type: "number",
      placeholder: "e.g., 3,500",
      step: "any",
      dependsOn: { field: "hasDoneSoilTest", value: "Yes" },
      section: "Fertilizer Selection"
    },
    {
      id: "topdressingFertilizerToUse",
      question: "Based on your soil test recommendations, which topdressing fertilizer will you actually buy and use?",
      type: "dropdown",
      options: topdressingFertilizerOptions.map(opt => opt.label),
      dependsOn: { field: "hasDoneSoilTest", value: "Yes" },
      section: "Fertilizer Selection"
    },
    {
      id: "topdressingFertilizerCost",
      question: "How much do you pay for a 50kg bag of your chosen topdressing fertilizer?",
      type: "number",
      placeholder: "e.g., 2,800",
      step: "any",
      dependsOn: { field: "hasDoneSoilTest", value: "Yes" },
      section: "Fertilizer Selection"
    },
    {
      id: "potassiumFertilizerToUse",
      question: "Based on your soil test recommendations, which potassium fertilizer will you actually buy and use?",
      type: "dropdown",
      options: potassiumFertilizerOptions.map(opt => opt.label),
      dependsOn: { field: "hasDoneSoilTest", value: "Yes" },
      section: "Fertilizer Selection"
    },
    {
      id: "potassiumFertilizerCost",
      question: "How much do you pay for a 50kg bag of your chosen potassium fertilizer?",
      type: "number",
      placeholder: "e.g., 2,800",
      step: "any",
      dependsOn: { field: "hasDoneSoilTest", value: "Yes", field2: "potassiumFertilizerToUse", valueNot: "None - I don't use potassium" },
      section: "Fertilizer Selection"
    },
  ];

  // ============ FERTILIZER QUESTIONS FOR NO SOIL TEST ============
  const fertilizerQuestionsWithoutSoilTest = [
    {
      id: "plantingFertilizerType",
      question: "Which planting fertilizer do you use for your enterprise?",
      type: "dropdown",
      options: plantingFertilizerOptions.map(opt => opt.label),
      dependsOn: { field: "hasDoneSoilTest", value: "No" },
      section: "Fertilizer Selection"
    },
    {
      id: "plantingFertilizerQuantity",
      question: "How many kg per acre do you apply?",
      type: "number",
      placeholder: "e.g., 50 kg",
      step: "any",
      dependsOn: { field: "hasDoneSoilTest", value: "No" },
      section: "Fertilizer Selection"
    },
    {
      id: "topdressingFertilizerType",
      question: "Which topdressing fertilizer do you use?",
      type: "dropdown",
      options: topdressingFertilizerOptions.map(opt => opt.label),
      dependsOn: { field: "hasDoneSoilTest", value: "No" },
      section: "Fertilizer Selection"
    },
    {
      id: "topdressingFertilizerQuantity",
      question: "How many kg per acre do you apply for topdressing?",
      type: "number",
      placeholder: "e.g., 50 kg",
      step: "any",
      dependsOn: { field: "hasDoneSoilTest", value: "No" },
      section: "Fertilizer Selection"
    },
    {
      id: "potassiumFertilizerType",
      question: "Which potassium fertilizer do you use?",
      type: "dropdown",
      options: potassiumFertilizerOptions.map(opt => opt.label),
      dependsOn: { field: "hasDoneSoilTest", value: "No" },
      section: "Fertilizer Selection"
    },
    {
      id: "potassiumFertilizerQuantity",
      question: "How many kg per acre do you apply for potassium?",
      type: "number",
      placeholder: "e.g., 50 kg",
      step: "any",
      dependsOn: { field: "hasDoneSoilTest", value: "No", field2: "potassiumFertilizerType", valueNot: "None - I don't use potassium" },
      section: "Fertilizer Selection"
    },
  ];

  // Combine all questions
  const getAllQuestions = () => {
    let questions = [];

    questions = [...questions, ...countryQuestion];
    questions = [...questions, ...soilTestGatekeeperQuestion];

    if (farmerDetails.hasDoneSoilTest === "Yes") {
      questions = [...questions, ...soilTestDetailsQuestions];
      questions = [...questions, ...fertilizerSelectionQuestions];
    }
    else if (farmerDetails.hasDoneSoilTest === "No") {
      questions = [...questions, ...fertilizerQuestionsWithoutSoilTest];
    }

    questions = [...questions, cropSelectionQuestion];

    if (farmerDetails.crops) {
      questions = [...questions, ...getCropSpecificQuestions()];
    }

    if (farmerDetails.crops) {
      questions = [...questions, ...getProductionQuestions()];
    }

    questions = [...questions, ...farmWaterQuestions];

    if (farmerDetails.crops) {
      questions = [...questions, ...getPestQuestions()];
    }

    if (farmerDetails.crops) {
      questions = [...questions, ...getFinancialQuestions()];
    }

    questions = [...questions, ...conservationQuestion];
    questions = [...questions, ...challengesQuestions];
    questions = [...questions, ...personalLocationQuestions];

    return questions;
  };

  // Helper function to get fertilizer ID from label
  const getFertilizerIdFromLabel = (label: string, options: any[]): string => {
    const found = options.find(opt => opt.label === label);
    return found ? found.id : "other";
  };

  // Filter questions based on dependencies
  const filterQuestions = (questions: any[]) => {
    return questions.filter(q => {
      if (!q.dependsOn) return true;

      if (q.dependsOn.field && !q.dependsOn.field2) {
        const dependsOnField = q.dependsOn.field;
        const expectedValue = q.dependsOn.value;
        const actualValue = farmerDetails[dependsOnField as keyof typeof farmerDetails];
        return actualValue === expectedValue;
      }

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

  const streamQuestionWithVoice = async (fullText: string) => {
    if (!voiceEnabled || !window.speechSynthesis) {
      setStreamingQuestion(fullText);
      return;
    }

    setIsStreaming(true);
    setStreamingQuestion("");
    setCurrentWordIndex(0);
    setUserTranscript("");

    if (recognitionRef.current && isRecognitionActiveRef.current) {
      try { recognitionRef.current.stop(); } catch (error) {}
      isRecognitionActiveRef.current = false;
      setDebugInfo(prev => ({ ...prev, isListening: false }));
    }

    const words = fullText.split(' ');
    questionWordsRef.current = words;

    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.rate = 0.75;
    utterance.pitch = 1.1;

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v =>
      v.name.includes('Google UK') ||
      v.name.includes('Google') ||
      v.name.includes('Samantha') ||
      v.name.includes('Microsoft Jenny') ||
      v.name.includes('Microsoft Aria') ||
      v.name.includes('Microsoft Sonia')
    );
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
      setTimeout(() => safeStartListening(), 1500);
    };

    utterance.onerror = () => {
      setStreamingQuestion(fullText);
      setIsStreaming(false);
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const speakAcknowledgment = async (answer: string, fieldId: string) => {
    let acknowledgment = "";

    if (fieldId === "plantingFertilizerToUse") {
      acknowledgment = `You will invest in ${answer} at planting for your enterprise. Is that correct?`;
    } else if (fieldId === "topdressingFertilizerToUse") {
      acknowledgment = `You will invest in ${answer} for topdressing. Is that correct?`;
    } else if (fieldId === "potassiumFertilizerToUse") {
      acknowledgment = `You will invest in ${answer} for potassium. Is that correct?`;
    } else if (fieldId === "plantingFertilizerCost" || fieldId === "topdressingFertilizerCost" || fieldId === "potassiumFertilizerCost") {
      acknowledgment = `${answer} per bag. Is that correct?`;
    } else if (fieldId === "recPlantingFertilizer") {
      acknowledgment = `Your soil test recommends ${answer} for planting. Is that correct?`;
    } else if (fieldId === "recTopdressingFertilizer") {
      acknowledgment = `Your soil test recommends ${answer} for topdressing. Is that correct?`;
    } else if (fieldId === "recPotassiumFertilizer") {
      acknowledgment = `Your soil test recommends ${answer} for potassium. Is that correct?`;
    } else if (fieldId === "recCalciticLime") {
      acknowledgment = `Your soil test recommends ${answer} kilograms of calcitic lime per acre. Is that correct?`;
    } else if (fieldId === "targetYield") {
      acknowledgment = `Your target yield is ${answer} bags per acre. Is that correct?`;
    } else if (fieldId === "country") {
      acknowledgment = `You are in ${answer}. Is that correct?`;
      setCountry(answer);
    } else if (fieldId === "phoneNumber") {
      acknowledgment = `${selectedCountryCode} ${answer}. Is that your phone number?`;
    } else if (fieldId === "crops") {
      acknowledgment = `You are investing in ${answer} enterprise. Correct?`;
    } else if (fieldId === "plantingDate") {
      const date = new Date(answer).toLocaleDateString();
      acknowledgment = `Planting on ${date}. Is that right?`;
    } else {
      acknowledgment = `${answer}. Is that correct?`;
    }

    await voiceAssistantRef.current?.speak(acknowledgment);
    toast.success(`Recorded: ${answer}`);
  };

  // Initialize voice assistant
  useEffect(() => {
    if (!voiceEnabled) {
      voiceAssistantRef.current = null;
      return;
    }
    voiceAssistantRef.current = { speak: async (text: string) => streamQuestionWithVoice(text) };
    toast.success("Voice ready!");
  }, [voiceEnabled]);

  const handleVoiceToggle = (enabled: boolean) => {
    setVoiceEnabled(enabled);
    toast.success(enabled ? "Voice mode on!" : "Voice mode off");
  };

  const processAnswer = async (answer: string) => {
    if (currentStep !== "configuring") return;

    const currentConfig = visibleQuestions[configStep];
    let cleanAnswer = answer;
    let finalValue = cleanAnswer;

    const questionPhrases = [
      "what is your", "what's your", "tell me your", "your phone number is",
      "what county are you in", "you are in", "the answer is", "i said",
      "it is", "is that correct", "yes it is", "that is correct", "that's correct",
      "my phone number is", "my name is", "i am", "i'm", "my answer is",
      "into your soil test", "according to your soil test", "what is your recommended",
      "and its formulation", "for your", "fertilizer", "top dressing", "planting",
      "potassium", "per acre", "exam", "exact", "dash", "point",
      currentConfig?.question?.toLowerCase() || ""
    ];

    for (const phrase of questionPhrases) {
      if (phrase && cleanAnswer.toLowerCase().includes(phrase)) {
        cleanAnswer = cleanAnswer.replace(new RegExp(phrase, 'gi'), '').trim();
      }
    }

    cleanAnswer = cleanAnswer.replace(/^[?:,\s]+/, '').replace(/[?:,\s]+$/, '');

    if (cleanAnswer.includes('?')) {
      const parts = cleanAnswer.split('?');
      cleanAnswer = parts[parts.length - 1].trim();
    }

    if (currentConfig.id === "phoneNumber") {
      cleanAnswer = cleanAnswer.replace(/\+?\d{1,3}\s?/, '').trim();
      const digits = cleanAnswer.match(/\d+/g);
      cleanAnswer = digits ? digits.join('') : cleanAnswer;
    }

    if (currentConfig.type === "number") {
      const numbers = cleanAnswer.match(/\d+\.?\d*/g);
      cleanAnswer = numbers ? numbers.join('') : "0";
    }

    if (currentConfig.id.includes("rec") && currentConfig.id.includes("Fertilizer")) {
      const fertilizerMatch = cleanAnswer.match(/(NPK\s*[\d\.]+[\d\.]+[\d\.]+[^\s]*|UREA|CAN|DAP|MOP|SSP|TSP)/i);
      if (fertilizerMatch) {
        cleanAnswer = fertilizerMatch[0];
      }
    }

    if (currentConfig.id === "plantingFertilizerToUse") {
      finalValue = getFertilizerIdFromLabel(cleanAnswer, plantingFertilizerOptions);
      console.log(`Mapping planting fertilizer: "${cleanAnswer}" → ID: "${finalValue}"`);
    } else if (currentConfig.id === "topdressingFertilizerToUse") {
      finalValue = getFertilizerIdFromLabel(cleanAnswer, topdressingFertilizerOptions);
      console.log(`Mapping topdressing fertilizer: "${cleanAnswer}" → ID: "${finalValue}"`);
    } else if (currentConfig.id === "potassiumFertilizerToUse") {
      finalValue = getFertilizerIdFromLabel(cleanAnswer, potassiumFertilizerOptions);
      console.log(`Mapping potassium fertilizer: "${cleanAnswer}" → ID: "${finalValue}"`);
    } else if (currentConfig.id === "subCounty") {
      const parts = cleanAnswer.split(/[.\s]+/);
      finalValue = parts[parts.length - 1].toLowerCase();
    } else if (currentConfig.id === "ward") {
      const parts = cleanAnswer.split(/[.\s]+/);
      finalValue = parts[parts.length - 1].toLowerCase();
    } else {
      finalValue = cleanAnswer;
    }

    if (currentConfig.id === "country" && finalValue) {
      setCountry(finalValue);
    }

    if (currentConfig.id === "phoneNumber") {
      finalValue = `${selectedCountryCode} ${finalValue}`;
    }

    setFarmerDetails(prev => ({ ...prev, [currentConfig.id]: finalValue }));
    setLastSubmittedAnswer(cleanAnswer);

    await speakAcknowledgment(cleanAnswer, currentConfig.id);
    setUserTranscript("");

    if (configStep < visibleQuestions.length - 1) {
      setConfigStep(prev => prev + 1);
      setTimeout(() => askQuestion(configStep + 1), 2500);
    } else {
      setCurrentStep("generating");
      generateSession();
    }
  };

  const safeStartListening = () => {
    if (isSpeaking || isStreaming) {
      console.log("AI is speaking, waiting to listen...");
      return;
    }
    if (!recognitionRef.current || isRecognitionActiveRef.current) return;
    try {
      recognitionRef.current.start();
      setDebugInfo(prev => ({ ...prev, isListening: true }));
      console.log("Started listening for answer...");
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
    nameUsageCountRef.current = 0;

    setFarmerDetails({
      country: "",
      farmerName: "",
      phoneCountryCode: "+254",
      phoneNumber: "",
      county: "", subCounty: "", ward: "", village: "",
      totalFarmSize: "", cultivatedAcres: "", waterSources: "",
      hasDoneSoilTest: "", crops: "", cropVarieties: "", cropAcres: "", season: "", plantingDate: "",
      plantingMaterial: "", plantingQuantity: "", seedSource: "", spacing: "",
      commonPests: "", pestControlMethod: "", commonDiseases: "", diseaseControlMethod: "",
      harvestUnit: "", pricePerUnit: "", storageMethod: "",
      npkCost: "", ploughingCost: "", plantingLabourCost: "", weedingCost: "",
      harvestingCost: "", transportCostPerBag: "", bagCost: "", seedCost: "",
      calciticLimePricePerBag: "", recCalciticLime: "",
      livestockTypes: "", cattle: "", cattleBreed: "", milkYield: "",
      postHarvestPractices: "", postHarvestLosses: "", valueAddition: "", storageAccess: "",
      productionChallenges: "", marketingChallenges: "", climateChallenges: "", financialChallenges: "",
      conservationPractices: "",
      soilTestDate: "", soilTestPH: "", soilTestPHRating: "", soilTestP: "", soilTestPRating: "",
      soilTestK: "", soilTestKRating: "", soilTestNPercent: "", soilTestNPercentRating: "",
      soilTestOC: "", soilTestOCRating: "", soilTestOM: "", soilTestOMRating: "",
      soilTestCEC: "", soilTestCECRating: "", soilTestCa: "", soilTestCaRating: "",
      soilTestMg: "", soilTestMgRating: "", soilTestNa: "", soilTestNaRating: "",
      targetYield: "", recPlantingFertilizer: "", recPlantingQuantity: "",
      recTopdressingFertilizer: "", recTopdressingQuantity: "",
      recPotassiumFertilizer: "", recPotassiumQuantity: "",
      plantingFertilizerToUse: "", plantingFertilizerCost: "",
      topdressingFertilizerToUse: "", topdressingFertilizerCost: "",
      potassiumFertilizerToUse: "", potassiumFertilizerCost: "",
      plantingFertilizerType: "", plantingFertilizerQuantity: "",
      topdressingFertilizerType: "", topdressingFertilizerQuantity: "",
      potassiumFertilizerType: "", potassiumFertilizerQuantity: "",
    });

    await voiceAssistantRef.current.speak(
      `Welcome! Let's set up your farm enterprise profile. Questions adapt to your answers. Speak clearly! This is your business, let's make it profitable.`
    );
    await new Promise(resolve => setTimeout(resolve, 1500));
    askQuestion(0);
  };

  const askQuestion = async (step: number) => {
    if (!voiceAssistantRef.current || step >= visibleQuestions.length) return;
    if (isSpeaking) await new Promise(resolve => setTimeout(resolve, 500));

    const question = visibleQuestions[step].question;
    setDebugInfo(prev => ({ ...prev, currentQuestion: step + 1 }));
    setUserTranscript("");
    setLastSubmittedAnswer("");

    await voiceAssistantRef.current.speak(question);
  };

  const generateSession = async () => {
    if (!voiceAssistantRef.current) return;
    setIsLoading(true);

    await voiceAssistantRef.current.speak(`Creating your farm enterprise profile...`);

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
        await voiceAssistantRef.current.speak(`Ready! Taking you to your personalized recommendations. Let's put more money in your pocket.`);
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

  // Custom render for phone number input with country code
  const renderPhoneInput = () => {
    return (
      <div className="flex gap-2">
        <select
          value={selectedCountryCode}
          onChange={(e) => setSelectedCountryCode(e.target.value)}
          className="px-3 py-3 border-2 rounded-xl text-blue-900 font-medium focus:border-blue-600 bg-white"
        >
          {countryCodes.map((cc) => (
            <option key={cc.code} value={cc.code}>
              {cc.flag} {cc.code} ({cc.country})
            </option>
          ))}
        </select>
        <input
          type="tel"
          value={userTranscript}
          onChange={(e) => setUserTranscript(e.target.value)}
          placeholder="712345678"
          className="flex-1 px-4 py-3 border-2 rounded-xl text-blue-900 font-medium focus:border-blue-600 placeholder-gray-400"
        />
      </div>
    );
  };

  const renderInput = () => {
    const q = visibleQuestions[configStep];
    if (!q) return null;

    if (q.id === "phoneNumber") {
      return renderPhoneInput();
    }

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
            {q.options?.map((opt: string, index: number) => (
              <option key={`${opt}-${index}`} value={opt} className="text-blue-900">{opt}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-blue-600" />
        </div>
      );
    }

    if (q.type === "combobox") {
      return (
        <div className="relative">
          <input
            type="text"
            list={q.id + "-options"}
            value={userTranscript}
            onChange={(e) => setUserTranscript(e.target.value)}
            placeholder="Select or type your answer..."
            className="w-full px-4 py-3 border-2 rounded-xl text-blue-900 font-medium focus:border-blue-600"
          />
          <datalist id={q.id + "-options"}>
            {q.options?.map((opt: string) => (
              <option key={opt} value={opt} />
            ))}
          </datalist>
          <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-blue-600 pointer-events-none" />
        </div>
      );
    }

    if (q.type === "multiselect") {
      return (
        <div className="space-y-2 max-h-60 overflow-y-auto p-2 border-2 rounded-xl">
          {q.options?.map((opt: string, index: number) => (
            <label key={`${opt}-${index}`} className="flex items-center gap-2 p-2 hover:bg-blue-50 rounded-lg">
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
        placeholder={q.placeholder || "Type your answer here..."}
        step={q.step || "any"}
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
              <p className="text-sm text-gray-500">Smart Farmer • Building Your Enterprise</p>
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
                    <span className="text-emerald-700 font-bold">{word}</span>
                    {wordIdx < arr.length - 1 ? ' ' : ''}
                  </span>
                ))}
              </p>
            ) : (
              <p className="text-2xl text-gray-400 italic">
                {isStreaming ? 'Speaking...' : 'Ready for your answer...'}
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
                  <p className="text-xs text-blue-600 mt-1">Voice confirmation sent</p>
                </div>
              )}

              {debugInfo.isListening && (
                <div className="mt-3 p-3 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-red-600">Listening... Speak now!</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Summary Panel */}
      {currentStep === "configuring" && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-5 shadow-xl border border-purple-200">
          <h4 className="font-bold text-lg text-purple-800">Your Farm Enterprise Profile</h4>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="bg-white p-2 rounded-lg border border-purple-100">
              <span className="text-purple-600">Enterprise:</span>{" "}
              <span className="font-bold text-blue-900">{farmerDetails.crops ? `${farmerDetails.crops}` : "Not set"}</span>
            </div>
            <div className="bg-white p-2 rounded-lg border border-purple-100">
              <span className="text-purple-600">Country:</span>{" "}
              <span className="font-bold text-blue-900">{farmerDetails.country || "Not set"}</span>
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
            <h4 className="font-bold text-purple-800">AI Business Assistant</h4>
            <p className="text-gray-600">
              {currentStep === "idle" ? "Ready to build your profitable enterprise!" :
               currentStep === "configuring" ? `Asking ${currentSection} questions` :
               "Processing..."}
            </p>
            {debugInfo.isListening && (
              <p className="text-sm text-blue-600 animate-pulse">Listening...</p>
            )}
            {isSpeaking && (
              <p className="text-sm text-purple-600 animate-pulse">Speaking...</p>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">Every question builds your profitable farm enterprise.</p>
      </div>

      {/* Stop Button */}
      {(currentStep === "configuring" || currentStep === "generating") && (
        <button onClick={stopEverything} className="px-5 py-3 bg-gradient-to-r from-rose-500 to-red-500 text-white rounded-xl mx-auto w-48 font-medium flex items-center justify-center gap-2">
          <span>Stop Setup</span>
        </button>
      )}
    </div>
  );
};

export default CreateInterviewAgent;