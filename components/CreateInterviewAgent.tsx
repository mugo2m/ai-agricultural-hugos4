"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { useTranslation } from 'react-i18next';
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
import { getLanguageFromCountry } from "@/lib/config/language";

interface CreateInterviewAgentProps {
  userName: string;
  userId?: string;
  profileImage?: string;
}

// Helper function for crop template variables
const translateWithCrop = (t: any, key: string, crop: string | undefined) => {
  return String(t(key, { crop: crop?.toUpperCase() || 'your crop' }));
};

// REDUCED country codes for better performance (kept for any future use)
const countryCodes = [
  { code: "+254", country: "Kenya", flag: "🇰🇪" },
  { code: "+256", country: "Uganda", flag: "🇺🇬" },
  { code: "+255", country: "Tanzania", flag: "🇹🇿" },
  { code: "+250", country: "Rwanda", flag: "🇷🇼" },
  { code: "+257", country: "Burundi", flag: "🇧🇮" },
  { code: "+27", country: "South Africa", flag: "🇿🇦" },
  { code: "+260", country: "Zambia", flag: "🇿🇲" },
  { code: "+263", country: "Zimbabwe", flag: "🇿🇼" },
  { code: "+265", country: "Malawi", flag: "🇲🇼" },
  { code: "+258", country: "Mozambique", flag: "🇲🇿" },
  { code: "+267", country: "Botswana", flag: "🇧🇼" },
  { code: "+264", country: "Namibia", flag: "🇳🇦" },
  { code: "+20", country: "Egypt", flag: "🇪🇬" },
  { code: "+234", country: "Nigeria", flag: "🇳🇬" },
  { code: "+233", country: "Ghana", flag: "🇬🇭" },
  { code: "+1", country: "USA/Canada", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" }
];

// Crop categories - UPDATED with new crops
const cropCategories = {
  grains: ["maize", "beans", "wheat", "sorghum", "millet", "rice", "barley", "finger millet"],
  pulses: ["soya beans", "cowpeas", "green grams", "bambara nuts", "groundnuts", "pigeon peas"],
  cash: ["coffee", "cotton", "sugarcane", "tobacco", "sunflower", "simsim", "pyrethrum", "tea", "cocoa"],
  tubers: ["cassava", "sweet potatoes", "irish potatoes", "yams", "taro", "arrow roots"],
  vegetables: ["tomatoes", "cabbage", "kales", "onions", "carrots", "capsicums", "chillies", "brinjals", "french beans", "garden peas", "spinach", "okra", "cauliflower"],
  fruits: ["bananas", "oranges", "pineapples", "mangoes", "avocados", "pawpaws", "passion fruit", "citrus", "watermelon"],
  nuts: ["macadamia", "groundnuts"],
  cover: ["mucuna", "desmodium", "dolichos", "canavalia", "crotalaria ochroleuca", "crotalaria juncea", "crotalaria paulina"]
};

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
  if (lowerCrop.includes("macadamia")) return "nuts";
  if (lowerCrop.includes("tea")) return "cash";
  if (lowerCrop.includes("cocoa")) return "cash";
  return "grains";
};

const getVarietiesOptions = (crop: string) => {
  const varieties = cropVarieties[crop.toLowerCase() as keyof typeof cropVarieties] || [];
  return varieties;
};

const getPestsOptions = (crop: string) => {
  const pests = cropPestDiseaseMap[crop.toLowerCase()]?.filter(p => p.type === "pest").map(p => p.name) || [];
  if (pests.length === 0) {
    return ["Aphids", "Cutworms", "Stalk borers", "Fall armyworm", "Thrips", "Whiteflies", "Other (specify)"];
  }
  return pests;
};

const getDiseasesOptions = (crop: string) => {
  const diseases = cropPestDiseaseMap[crop.toLowerCase()]?.filter(p => p.type === "disease").map(p => p.name) || [];
  if (diseases.length === 0) {
    return ["Blight", "Rust", "Mosaic virus", "Leaf spot", "Powdery mildew", "Other (specify)"];
  }
  return diseases;
};

// Helper to determine if crop needs planting material cost question
const needsPlantingMaterialCost = (crop: string): boolean => {
  const lowerCrop = crop.toLowerCase();
  const vegetativeCrops = [
    "sweet potatoes", "cassava", "bananas", "sugarcane", "irish potatoes",
    "yams", "taro", "pineapples", "coffee", "tea", "cocoa", "mangoes",
    "avocados", "oranges", "macadamia", "passion fruit"
  ];
  return vegetativeCrops.includes(lowerCrop);
};

const getPlantingMaterialCostQuestion = (crop: string) => {
  const lowerCrop = crop.toLowerCase();

  // Determine the unit based on crop type
  let unit = "seedling";
  let placeholder = "e.g., 30";

  if (lowerCrop.includes("sweet potato") || lowerCrop.includes("cassava")) {
    unit = "cutting";
    placeholder = "e.g., 5";
  } else if (lowerCrop.includes("banana")) {
    unit = "sucker";
    placeholder = "e.g., 100";
  } else if (lowerCrop.includes("sugarcane")) {
    unit = "sett";
    placeholder = "e.g., 12";
  } else if (lowerCrop.includes("potato") || lowerCrop.includes("yam") || lowerCrop.includes("taro")) {
    unit = "kg";
    placeholder = "e.g., 50";
  } else if (lowerCrop.includes("pineapple")) {
    unit = "crown/slip";
    placeholder = "e.g., 20";
  } else if (lowerCrop.includes("coffee") || lowerCrop.includes("tea") || lowerCrop.includes("cocoa")) {
    unit = "seedling";
    placeholder = "e.g., 30";
  } else if (lowerCrop.includes("mango") || lowerCrop.includes("avocado") || lowerCrop.includes("orange") || lowerCrop.includes("macadamia")) {
    unit = "seedling";
    placeholder = "e.g., 150";
  }

  return {
    id: "plantingMaterialCost",
    questionKey: "question_planting_material_cost",
    type: "number",
    placeholder: placeholder,
    step: "any",
    sectionKey: "section_finance"
  };
};

const getPlantingMaterialQuestion = (crop: string) => {
  const cropType = getCropType(crop);
  const lowerCrop = crop.toLowerCase();

  // New crops
  if (lowerCrop === "rice") {
    return {
      id: "plantingMaterial",
      questionKey: "question_planting_material_rice",
      type: "dropdown",
      options: ["Direct seeding", "Transplanting seedlings", "Broadcasting", "Other"],
      sectionKey: "section_planting_material"
    };
  }
  if (lowerCrop === "mangoes" || lowerCrop === "macadamia") {
    return {
      id: "plantingMaterial",
      questionKey: "question_planting_material_fruits",
      type: "dropdown",
      options: ["Grafted seedlings", "Seedlings", "Cuttings", "Air layers", "Other"],
      sectionKey: "section_planting_material"
    };
  }
  if (lowerCrop === "pineapples") {
    return {
      id: "plantingMaterial",
      questionKey: "question_planting_material_pineapples",
      type: "dropdown",
      options: ["Crowns", "Slips", "Suckers", "Tissue culture", "Other"],
      sectionKey: "section_planting_material"
    };
  }
  if (lowerCrop === "watermelons" || lowerCrop === "carrots" || lowerCrop === "spinach" || lowerCrop === "okra") {
    return {
      id: "plantingMaterial",
      questionKey: "question_planting_material_vegetables",
      type: "dropdown",
      options: ["Direct seeding", "Transplanting seedlings", "Other"],
      sectionKey: "section_planting_material"
    };
  }
  if (lowerCrop === "chillies" || lowerCrop === "capsicums") {
    return {
      id: "plantingMaterial",
      questionKey: "question_planting_material_vegetables",
      type: "dropdown",
      options: ["Transplanting seedlings", "Direct seeding", "Other"],
      sectionKey: "section_planting_material"
    };
  }
  if (lowerCrop === "pigeon peas" || lowerCrop === "bambara nuts") {
    return {
      id: "plantingMaterial",
      questionKey: "question_planting_material_legumes",
      type: "dropdown",
      options: ["Direct seeding", "Certified seed", "Farm-saved seed", "Other"],
      sectionKey: "section_planting_material"
    };
  }
  if (lowerCrop === "yams" || lowerCrop === "taro") {
    return {
      id: "plantingMaterial",
      questionKey: "question_planting_material_tubers",
      type: "dropdown",
      options: ["Tubers", "Sets", "Cormels", "Certified seed", "Other"],
      sectionKey: "section_planting_material"
    };
  }
  if (lowerCrop === "tea") {
    return {
      id: "plantingMaterial",
      questionKey: "question_planting_material_tea",
      type: "dropdown",
      options: ["Clonal cuttings", "Seedlings", "Tissue culture", "Other"],
      sectionKey: "section_planting_material"
    };
  }
  if (lowerCrop === "cocoa") {
    return {
      id: "plantingMaterial",
      questionKey: "question_planting_material_cocoa",
      type: "dropdown",
      options: ["Hybrid seedlings", "Cuttings", "Grafted seedlings", "Other"],
      sectionKey: "section_planting_material"
    };
  }

  // Existing crops
  if (lowerCrop === "bananas") {
    return {
      id: "plantingMaterial",
      questionKey: "question_planting_material_bananas",
      type: "dropdown",
      options: ["Sword suckers", "Tissue culture seedlings", "Mother plant corms", "Bits", "Other"],
      sectionKey: "section_planting_material"
    };
  }
  if (lowerCrop === "coffee") {
    return {
      id: "plantingMaterial",
      questionKey: "question_planting_material_coffee",
      type: "dropdown",
      options: ["Grafted seedlings", "Cuttings", "Seeds", "Tissue culture", "Other"],
      sectionKey: "section_planting_material"
    };
  }
  if (lowerCrop === "sugarcane") {
    return {
      id: "plantingMaterial",
      questionKey: "question_planting_material_sugarcane",
      type: "dropdown",
      options: ["Setts (cane cuttings)", "Ratoon (regrowth)", "Tissue culture", "Other"],
      sectionKey: "section_planting_material"
    };
  }
  if (lowerCrop.includes("potato")) {
    return {
      id: "plantingMaterial",
      questionKey: "question_planting_material_potato",
      type: "dropdown",
      options: ["Certified seed potatoes", "Farm-saved tubers", "Whole tubers", "Cut pieces", "Other"],
      sectionKey: "section_planting_material"
    };
  }
  if (cropType === "tubers") {
    return {
      id: "plantingMaterial",
      questionKey: "question_planting_material_tubers",
      type: "dropdown",
      options: ["Tubers", "Root cuttings", "Sets", "Certified seed", "Other"],
      sectionKey: "section_planting_material"
    };
  }
  if (cropType === "fruits") {
    return {
      id: "plantingMaterial",
      questionKey: "question_planting_material_fruits",
      type: "dropdown",
      options: ["Grafted seedlings", "Seedlings", "Cuttings", "Air layers", "Other"],
      sectionKey: "section_planting_material"
    };
  }
  if (cropType === "vegetables") {
    return {
      id: "plantingMaterial",
      questionKey: "question_planting_material_vegetables",
      type: "dropdown",
      options: ["Direct seeding", "Transplanting seedlings", "Sets", "Cuttings", "Other"],
      sectionKey: "section_planting_material"
    };
  }
  return {
    id: "seedSource",
    questionKey: "question_seed_source",
    type: "dropdown",
    options: ["Certified seed dealer", "Farm-saved seed", "Local market", "Neighbors", "Agrovet", "Other"],
    sectionKey: "section_seeds"
  };
};

const getPlantingQuantityQuestion = (crop: string) => {
  const lowerCrop = crop.toLowerCase();
  return {
    id: "seedRate",
    questionKey: `question_seed_rate_${lowerCrop.replace(/ /g, '_')}`,
    type: "number",
    placeholder: "e.g., 10 kg",
    step: "any",
    sectionKey: "section_seeds"
  };
};

const getStorageQuestion = (crop: string) => {
  const lowerCrop = crop.toLowerCase();

  if (lowerCrop === "maize" || lowerCrop === "sorghum" || lowerCrop === "finger millet" || lowerCrop === "rice") {
    return {
      id: "storageMethod",
      questionKey: "question_storage_grain",
      type: "dropdown",
      options: ["Hermetic bags", "Metallic silos", "Gunny bags", "Local cribs", "Sold immediately", "Other"],
      sectionKey: "section_storage"
    };
  }
  if (lowerCrop === "beans" || lowerCrop === "cowpeas" || lowerCrop === "green grams" || lowerCrop === "groundnuts" || lowerCrop === "pigeon peas" || lowerCrop === "bambara nuts") {
    return {
      id: "storageMethod",
      questionKey: "question_storage_pulses",
      type: "dropdown",
      options: ["Hermetic bags", "Gunny bags", "Plastic containers", "Sold immediately", "Other"],
      sectionKey: "section_storage"
    };
  }
  if (lowerCrop === "irish potatoes" || lowerCrop === "sweet potatoes" || lowerCrop === "cassava" || lowerCrop === "yams" || lowerCrop === "taro") {
    return {
      id: "storageMethod",
      questionKey: "question_storage_tubers",
      type: "dropdown",
      options: ["Cool dark room", "In-ground storage", "Sold immediately", "Processed into flour", "Other"],
      sectionKey: "section_storage"
    };
  }
  if (lowerCrop === "tomatoes" || lowerCrop === "onions" || lowerCrop === "cabbages" || lowerCrop === "chillies" || lowerCrop === "capsicums" || lowerCrop === "okra") {
    return {
      id: "storageMethod",
      questionKey: "question_storage_vegetables",
      type: "dropdown",
      options: ["Sold immediately", "Cool storage", "Market delivery", "Other"],
      sectionKey: "section_storage"
    };
  }
  if (lowerCrop === "mangoes" || lowerCrop === "avocados" || lowerCrop === "oranges" || lowerCrop === "macadamia") {
    return {
      id: "storageMethod",
      questionKey: "question_storage_fruits",
      type: "dropdown",
      options: ["Sold immediately", "Cool storage", "Processing", "Other"],
      sectionKey: "section_storage"
    };
  }
  if (lowerCrop === "tea" || lowerCrop === "coffee" || lowerCrop === "cocoa") {
    return {
      id: "storageMethod",
      questionKey: "question_storage_perishable",
      type: "dropdown",
      options: ["Sold immediately", "Processing facility", "Drying and storage", "Other"],
      sectionKey: "section_storage"
    };
  }
  return {
    id: "storageMethod",
    questionKey: "question_storage_generic",
    type: "dropdown",
    options: ["Sold immediately", "Storage facility", "Cold storage", "Other"],
    sectionKey: "section_storage"
  };
};

// ========== FIXED NUTRIENT DROPDOWN WITH DARK TEXT ==========
const NutrientDropdown = ({
  nutrient,
  value,
  onChange
}: {
  nutrient: string;
  value: string;
  onChange: (value: string) => void;
}) => {
  const { t } = useTranslation();

  const nutrientLabels: Record<string, string> = {
    s: "Sulfur (S)",
    ca: "Calcium (Ca)",
    mg: "Magnesium (Mg)",
    zn: "Zinc (Zn)",
    b: "Boron (B)",
    cu: "Copper (Cu)",
    mn: "Manganese (Mn)"
  };

  const percentageOptions = ["0%", "2%", "3%", "4%", "5%", "6%", "7%", "8%", "10%", "12%"];

  return (
    <div className="flex items-center gap-3 mb-2">
      <label className="w-32 text-sm font-medium text-gray-800">{nutrientLabels[nutrient]}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      >
        <option value="" className="text-gray-600">Select %</option>
        {percentageOptions.map(opt => (
          <option key={opt} value={opt} className="text-gray-800">{opt}</option>
        ))}
        <option value="other" className="text-gray-800">Other (specify)</option>
      </select>
      {value === "other" && (
        <input
          type="text"
          placeholder="e.g., 15%"
          className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 bg-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
};

const CreateInterviewAgent = ({
  userName,
  userId,
  profileImage
}: CreateInterviewAgentProps) => {
  const { t } = useTranslation();
  const { setCountry } = useCurrency();
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userTranscript, setUserTranscript] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastSubmittedAnswer, setLastSubmittedAnswer] = useState("");
  const [selectedCountryCode, setSelectedCountryCode] = useState("+254");
  const [recognitionLanguage, setRecognitionLanguage] = useState('en-US');
  const nameUsageCountRef = useRef(0);

  // Safe translation helper
  const safeT = (key: string, params?: any): string => {
    try {
      const result = t(key, params);
      // Handle if result is a Promise
      if (result && typeof result.then === 'function') {
        console.warn(`Translation for "${key}" returned a Promise`);
        return key;
      }
      return typeof result === 'string' ? result : String(result || '');
    } catch (e) {
      console.error('Translation error for key:', key, e);
      return key;
    }
  };

  const [currentStep, setCurrentStep] = useState<"idle" | "configuring" | "generating" | "redirecting" | "error">("idle");
  const [configStep, setConfigStep] = useState(0);

  const [streamingQuestion, setStreamingQuestion] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const questionWordsRef = useRef<string[]>([]);

  const voiceServiceRef = useRef<any>(null);

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

  const [farmerDetails, setFarmerDetails] = useState({
    country: "",
    farmerName: "",
    // REMOVED phoneCountryCode and phoneNumber
    county: "",
    subCounty: "",
    ward: "",
    village: "",
    totalFarmSize: "",
    cultivatedAcres: "",
    waterSources: "",
    hasDoneSoilTest: "",
    crops: "",
    saleDate: "",
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
    deficiencySymptoms: "",
    deficiencyLocation: "",
    harvestUnit: "kg",
    pricePerKg: "",
    actualYieldKg: "",
    storageMethod: "",
    npkCost: "",
    ploughingCost: "",
    plantingLabourCost: "",
    weedingCost: "",
    harvestingCost: "",
    transportCostPerKg: "",
    emptyBags: "",
    bagCost: "",
    seedCost: "",
    plantingMaterialCost: "",
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
    recCalciticLime: "",
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
    plantingFertilizerNutrients: "",
    topdressingFertilizerNutrients: "",
    potassiumFertilizerNutrients: "",
    plantsDamaged: "",
  });

  // NEW: State for nutrient selections
  const [plantingNutrients, setPlantingNutrients] = useState({
    s: "", ca: "", mg: "", zn: "", b: "", cu: "", mn: ""
  });
  const [topdressingNutrients, setTopdressingNutrients] = useState({
    s: "", ca: "", mg: "", zn: "", b: "", cu: "", mn: ""
  });
  const [potassiumNutrients, setPotassiumNutrients] = useState({
    s: "", ca: "", mg: "", zn: "", b: "", cu: "", mn: ""
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

  // Update language when country changes
  useEffect(() => {
    if (farmerDetails.country) {
      const lang = getLanguageFromCountry(farmerDetails.country);
      setRecognitionLanguage(lang);
      console.log(`CreateInterviewAgent: Language set to ${lang} for country ${farmerDetails.country}`);
      if (recognitionRef.current) {
        recognitionRef.current.lang = lang;
      }
    }
  }, [farmerDetails.country]);

  // ========== QUESTION DEFINITIONS ==========

  const countryQuestion = [
    {
      id: "country",
      questionKey: "question_country",
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
      sectionKey: "section_location"
    }
  ];

  const soilTestGatekeeperQuestion = [
    {
      id: "hasDoneSoilTest",
      questionKey: "question_soil_test",
      type: "dropdown",
      options: ["Yes", "No"],
      sectionKey: "section_soil_test"
    }
  ];

  // CROP SELECTION QUESTION - Q3
  const cropSelectionQuestion = {
    id: "crops",
    questionKey: "question_crop_enterprise",
    type: "dropdown",
    options: [
      "maize", "beans", "finger millet", "sorghum", "soya beans", "cowpeas",
      "green grams", "bambara nuts", "groundnuts", "sunflower", "simsim",
      "coffee", "cotton", "sugarcane", "tobacco", "cassava", "sweet potatoes",
      "irish potatoes", "tomatoes", "kales", "cabbages", "onions", "carrots",
      "capsicums", "chillies", "brinjals", "french beans", "garden peas",
      "bananas", "oranges", "pineapples", "mangoes", "avocados", "pawpaws",
      "passion fruit", "rice", "watermelons", "spinach", "pigeon peas",
      "yams", "taro", "okra", "tea", "macadamia", "cocoa"
    ],
    sectionKey: "section_crops"
  };

  // SALE DATE QUESTION
  const saleDateQuestion = {
    id: "saleDate",
    questionKey: "question_sale_date",
    type: "date",
    minDate: new Date().toISOString().split('T')[0],
    maxDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    sectionKey: "section_production"
  };

  // NUTRIENT DEFICIENCY QUESTIONS
  const deficiencyQuestions = [
    {
      id: "deficiencySymptoms",
      questionKey: "question_deficiency_symptoms",
      type: "dropdown",
      options: [
        "Yellow leaves",
        "Purple color",
        "Burned edges",
        "Yellow between veins",
        "Stunted growth",
        "Blossom end rot",
        "Distorted new leaves",
        "Other (specify)"
      ],
      sectionKey: "section_nutrition"
    },
    {
      id: "deficiencyLocation",
      questionKey: "question_deficiency_location",
      type: "dropdown",
      options: ["Older leaves (bottom)", "Younger leaves (top)", "Whole plant", "Fruits/flowers only"],
      sectionKey: "section_nutrition"
    }
  ];

  // NEW: Nutrient detail questions (only if soil test done)
  const nutrientDetailQuestions = [
    {
      id: "plantingFertilizerNutrients",
      questionKey: "question_planting_fertilizer_nutrients",
      type: "custom",
      renderCustom: true,
      dependsOn: { field: "hasDoneSoilTest", value: "Yes" },
      sectionKey: "section_fertilizer_selection"
    },
    {
      id: "topdressingFertilizerNutrients",
      questionKey: "question_topdressing_fertilizer_nutrients",
      type: "custom",
      renderCustom: true,
      dependsOn: { field: "hasDoneSoilTest", value: "Yes" },
      sectionKey: "section_fertilizer_selection"
    },
    {
      id: "potassiumFertilizerNutrients",
      questionKey: "question_potassium_fertilizer_nutrients",
      type: "custom",
      renderCustom: true,
      dependsOn: { field: "hasDoneSoilTest", value: "Yes" },
      sectionKey: "section_fertilizer_selection"
    },
  ];

  // NEW: Plants damaged question (data-only)
  const plantsDamagedQuestion = {
    id: "plantsDamaged",
    questionKey: "question_plants_damaged",
    type: "number",
    placeholder: "e.g., 50",
    step: "any",
    sectionKey: "section_pests"
  };

  const getCropSpecificQuestions = () => {
    if (!farmerDetails.crops) return [];
    const crop = farmerDetails.crops;
    const spacingOptions = getSpacingOptions(crop);

    return [
      {
        id: "cropVarieties",
        questionKey: "question_crop_varieties",
        type: "text",
        placeholder: "e.g., H614",
        sectionKey: "section_crops"
      },
      {
        id: "cropAcres",
        questionKey: "question_crop_acres",
        type: "number",
        step: "any",
        placeholder: "e.g., 2.5",
        sectionKey: "section_crops"
      },
      {
        id: "season",
        questionKey: "question_season",
        type: "dropdown",
        options: ["long rains", "short rains", "dry season"],
        sectionKey: "section_crops"
      },
      {
        id: "plantingDate",
        questionKey: "question_planting_date",
        type: "date",
        minDate: "2024-01-01",
        maxDate: new Date().toISOString().split('T')[0],
        sectionKey: "section_crops"
      },
      getPlantingMaterialQuestion(crop),
      {
        id: "spacing",
        questionKey: "question_spacing",
        type: "dropdown",
        options: spacingOptions.map(s => s.label),
        sectionKey: "section_planting_density"
      },
      getPlantingQuantityQuestion(crop),
    ];
  };

  const getProductionQuestions = () => {
    if (!farmerDetails.crops) return [];
    const crop = farmerDetails.crops;

    const unitOptions = ["kg"];

    return [
      {
        id: "harvestUnit",
        questionKey: "question_harvest_unit",
        type: "dropdown",
        options: unitOptions,
        sectionKey: "section_production"
      },
      {
        id: "actualYieldKg",
        questionKey: "question_actual_yield_kg",
        type: "number",
        step: "any",
        placeholder: safeT('enter_yield_kg_placeholder'),
        sectionKey: "section_production"
      },
      {
        id: "pricePerKg",
        questionKey: "question_price_per_kg",
        type: "number",
        step: "any",
        placeholder: safeT('enter_price_kg_placeholder'),
        sectionKey: "section_production"
      },
      getStorageQuestion(crop)
    ];
  };

  const farmWaterQuestions = [
    {
      id: "totalFarmSize",
      questionKey: "question_total_farm_size",
      type: "number",
      step: "any",
      placeholder: "e.g., 5",
      sectionKey: "section_farm"
    },
    // REMOVED duplicate cultivatedAcres
    {
      id: "waterSources",
      questionKey: "question_water_sources",
      type: "multiselect",
      options: [
        "Rainwater only",
        "River only",
        "Borehole only",
        "River + Borehole",
        "River + Borehole + Rainwater",
        "None (dryland farming)"
      ],
      sectionKey: "section_water"
    }
  ];

  const getPestQuestions = () => {
    if (!farmerDetails.crops) return [];
    const crop = farmerDetails.crops;

    return [
      {
        id: "commonPests",
        questionKey: "question_common_pests",
        type: "multiselect",
        options: getPestsOptions(crop),
        sectionKey: "section_pests"
      },
      {
        id: "commonDiseases",
        questionKey: "question_common_diseases",
        type: "multiselect",
        options: getDiseasesOptions(crop),
        sectionKey: "section_diseases"
      },
    ];
  };

  const getFinancialQuestions = () => {
    if (!farmerDetails.crops) return [];
    const crop = farmerDetails.crops;

    let questions = [
      { id: "ploughingCost", questionKey: "question_ploughing_cost", type: "number", step: "any", placeholder: "e.g., 7000", sectionKey: "section_finance" },
      { id: "plantingLabourCost", questionKey: "question_planting_labour_cost", type: "number", step: "any", placeholder: "e.g., 2000", sectionKey: "section_finance" },
      { id: "weedingCost", questionKey: "question_weeding_cost", type: "number", step: "any", placeholder: "e.g., 2500", sectionKey: "section_finance" },
      { id: "harvestingCost", questionKey: "question_harvesting_cost", type: "number", step: "any", placeholder: "e.g., 2000", sectionKey: "section_finance" },
      { id: "transportCostPerKg", questionKey: "question_transport_cost", type: "number", step: "any", placeholder: "e.g., 5", sectionKey: "section_finance" },
      { id: "emptyBags", questionKey: "question_empty_bags", type: "number", placeholder: "e.g., 100 bags", step: "any", sectionKey: "section_finance" },
      { id: "bagCost", questionKey: "question_bag_cost", type: "number", step: "any", placeholder: "e.g., 40", sectionKey: "section_finance" },
    ];

    if (!needsPlantingMaterialCost(crop)) {
      questions.unshift({ id: "seedCost", questionKey: "question_seed_cost", type: "number", placeholder: "e.g., 180", step: "any", sectionKey: "section_finance" });
    }

    if (needsPlantingMaterialCost(crop)) {
      questions.unshift(getPlantingMaterialCostQuestion(crop));
    }

    questions.push({ id: "calciticLimePricePerBag", questionKey: "question_lime_price", type: "number", placeholder: "e.g., 300", step: "any", sectionKey: "section_finance" });

    return questions;
  };

  const conservationQuestion = [
    {
      id: "conservationPractices",
      questionKey: "question_conservation_practices",
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
      sectionKey: "section_conservation"
    }
  ];

  const challengesQuestions = [
    {
      id: "productionChallenges",
      questionKey: "question_production_challenges",
      type: "multiselect",
      options: [
        "Pests", "Diseases", "Drought", "Floods", "Poor soil fertility",
        "High input costs", "Labor shortage", "Weeds", "Wild animals",
        "Fall armyworm", "Stalk borers", "Aphids", "Whiteflies",
        "Maize streak virus", "Leaf rust", "Blight", "Other"
      ],
      sectionKey: "section_challenges"
    },
    {
      id: "marketingChallenges",
      questionKey: "question_marketing_challenges",
      type: "multiselect",
      options: [
        "Low prices", "Price fluctuations", "No reliable buyer",
        "Transport costs", "Brokers/middlemen", "Post-harvest losses",
        "No storage", "Perishability", "Other"
      ],
      sectionKey: "section_challenges"
    },
    {
      id: "climateChallenges",
      questionKey: "question_climate_challenges",
      type: "multiselect",
      options: [
        "Unreliable rains", "Drought", "Floods", "Hailstorms",
        "Strong winds", "Extreme heat", "Late rains", "Early cessation",
        "Other"
      ],
      sectionKey: "section_challenges"
    },
    {
      id: "financialChallenges",
      questionKey: "question_financial_challenges",
      type: "multiselect",
      options: [
        "No capital", "No loans", "High interest rates",
        "No subsidies", "High input costs", "Cash flow problems",
        "Debt", "Other"
      ],
      sectionKey: "section_challenges"
    },
  ];

  const personalLocationQuestions = [
    {
      id: "farmerName",
      questionKey: "question_farmer_name",
      type: "text",
      placeholder: "e.g., John Mugo",
      sectionKey: "section_personal"
    },
    // REMOVED phoneNumber question
    { id: "county", questionKey: "question_county", type: "text", placeholder: "e.g., Bungoma", sectionKey: "section_location" },
    { id: "subCounty", questionKey: "question_sub_county", type: "text", placeholder: "e.g., Kimilili", sectionKey: "section_location" },
    { id: "ward", questionKey: "question_ward", type: "text", placeholder: "e.g., Kimilili", sectionKey: "section_location" },
    { id: "village", questionKey: "question_village", type: "text", placeholder: "e.g., Sikulu", sectionKey: "section_location" },
  ];

  const soilTestDetailsQuestions = [
    { id: "soilTestDate", questionKey: "question_soil_test_date", type: "date", minDate: "2020-01-01", maxDate: new Date().toISOString().split('T')[0], dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, sectionKey: "section_soil_test" },
    { id: "soilTestPH", questionKey: "question_soil_test_ph", type: "number", min: 0, max: 14, step: 0.1, dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, sectionKey: "section_soil_test" },
    { id: "soilTestPHRating", questionKey: "question_soil_test_ph_rating", type: "dropdown", options: ["Very Low", "Low", "Optimum", "High", "Very High"], dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, sectionKey: "section_soil_test" },
    { id: "soilTestP", questionKey: "question_soil_test_p", type: "number", step: "any", dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, sectionKey: "section_soil_test" },
    { id: "soilTestPRating", questionKey: "question_soil_test_p_rating", type: "dropdown", options: ["Very Low", "Low", "Optimum", "High", "Very High"], dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, sectionKey: "section_soil_test" },
    { id: "soilTestK", questionKey: "question_soil_test_k", type: "number", step: "any", dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, sectionKey: "section_soil_test" },
    { id: "soilTestKRating", questionKey: "question_soil_test_k_rating", type: "dropdown", options: ["Very Low", "Low", "Optimum", "High", "Very High"], dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, sectionKey: "section_soil_test" },
    { id: "soilTestNPercent", questionKey: "question_soil_test_n", type: "number", min: 0, max: 5, step: 0.01, dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, sectionKey: "section_soil_test" },
    { id: "soilTestNPercentRating", questionKey: "question_soil_test_n_rating", type: "dropdown", options: ["Very Low", "Low", "Optimum", "High", "Very High"], dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, sectionKey: "section_soil_test" },
    { id: "soilTestCa", questionKey: "question_soil_test_ca", type: "number", step: "any", dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, sectionKey: "section_soil_test" },
    { id: "soilTestCaRating", questionKey: "question_soil_test_ca_rating", type: "dropdown", options: ["Very Low", "Low", "Optimum", "High", "Very High"], dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, sectionKey: "section_soil_test" },
    { id: "soilTestMg", questionKey: "question_soil_test_mg", type: "number", step: "any", dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, sectionKey: "section_soil_test" },
    { id: "soilTestMgRating", questionKey: "question_soil_test_mg_rating", type: "dropdown", options: ["Very Low", "Low", "Optimum", "High", "Very High"], dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, sectionKey: "section_soil_test" },
    { id: "soilTestNa", questionKey: "question_soil_test_na", type: "number", step: "any", dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, sectionKey: "section_soil_test" },
    { id: "soilTestNaRating", questionKey: "question_soil_test_na_rating", type: "dropdown", options: ["Very Low", "Low", "Optimum", "High", "Very High"], dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, sectionKey: "section_soil_test" },
    { id: "soilTestOC", questionKey: "question_soil_test_oc", type: "number", step: 0.01, dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, sectionKey: "section_soil_test" },
    { id: "soilTestOCRating", questionKey: "question_soil_test_oc_rating", type: "dropdown", options: ["Very Low", "Low", "Optimum", "High", "Very High"], dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, sectionKey: "section_soil_test" },
    { id: "soilTestOM", questionKey: "question_soil_test_om", type: "number", step: 0.01, dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, sectionKey: "section_soil_test" },
    { id: "soilTestOMRating", questionKey: "question_soil_test_om_rating", type: "dropdown", options: ["Very Low", "Low", "Optimum", "High", "Very High"], dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, sectionKey: "section_soil_test" },
    { id: "soilTestCEC", questionKey: "question_soil_test_cec", type: "number", step: "any", dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, sectionKey: "section_soil_test" },
    { id: "soilTestCECRating", questionKey: "question_soil_test_cec_rating", type: "dropdown", options: ["Very Low", "Low", "Optimum", "High", "Very High"], dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, sectionKey: "section_soil_test" },
    {
      id: "targetYield",
      questionKey: "question_target_yield_kg",
      type: "number",
      step: "any",
      placeholder: safeT('enter_target_yield_kg'),
      dependsOn: { field: "hasDoneSoilTest", value: "Yes" },
      sectionKey: "section_soil_test_recommendations"
    },
    {
      id: "recCalciticLime",
      questionKey: "question_rec_calcitic_lime",
      type: "number",
      step: "any",
      placeholder: "e.g., 120",
      dependsOn: { field: "hasDoneSoilTest", value: "Yes" },
      sectionKey: "section_soil_test_recommendations"
    },
    {
      id: "recPlantingFertilizer",
      questionKey: "question_rec_planting_fertilizer",
      type: "text",
      placeholder: "e.g., NPK 12.24.12+5S",
      dependsOn: { field: "hasDoneSoilTest", value: "Yes" },
      sectionKey: "section_soil_test_recommendations"
    },
    {
      id: "recPlantingQuantity",
      questionKey: "question_rec_planting_quantity",
      type: "number",
      step: "any",
      placeholder: "e.g., 100",
      dependsOn: { field: "hasDoneSoilTest", value: "Yes" },
      sectionKey: "section_soil_test_recommendations"
    },
    {
      id: "recTopdressingFertilizer",
      questionKey: "question_rec_topdressing_fertilizer",
      type: "text",
      placeholder: "e.g., UREA 46-0-0",
      dependsOn: { field: "hasDoneSoilTest", value: "Yes" },
      sectionKey: "section_soil_test_recommendations"
    },
    {
      id: "recTopdressingQuantity",
      questionKey: "question_rec_topdressing_quantity",
      type: "number",
      step: "any",
      placeholder: "e.g., 90",
      dependsOn: { field: "hasDoneSoilTest", value: "Yes" },
      sectionKey: "section_soil_test_recommendations"
    },
    {
      id: "recPotassiumFertilizer",
      questionKey: "question_rec_potassium_fertilizer",
      type: "text",
      placeholder: "e.g., MOP 0-0-60",
      dependsOn: { field: "hasDoneSoilTest", value: "Yes" },
      sectionKey: "section_soil_test_recommendations"
    },
    {
      id: "recPotassiumQuantity",
      questionKey: "question_rec_potassium_quantity",
      type: "number",
      step: "any",
      placeholder: "e.g., 30",
      dependsOn: { field: "hasDoneSoilTest", value: "Yes" },
      sectionKey: "section_soil_test_recommendations"
    },
  ];

  const fertilizerSelectionQuestions = [
    {
      id: "plantingFertilizerToUse",
      questionKey: "question_planting_fertilizer_to_use",
      type: "dropdown",
      options: plantingFertilizerOptions.map(opt => opt.label),
      dependsOn: { field: "hasDoneSoilTest", value: "Yes" },
      sectionKey: "section_fertilizer_selection"
    },
    {
      id: "plantingFertilizerCost",
      questionKey: "question_planting_fertilizer_cost",
      type: "number",
      placeholder: "e.g., 3,500",
      step: "any",
      dependsOn: { field: "hasDoneSoilTest", value: "Yes" },
      sectionKey: "section_fertilizer_selection"
    },
    {
      id: "topdressingFertilizerToUse",
      questionKey: "question_topdressing_fertilizer_to_use",
      type: "dropdown",
      options: topdressingFertilizerOptions.map(opt => opt.label),
      dependsOn: { field: "hasDoneSoilTest", value: "Yes" },
      sectionKey: "section_fertilizer_selection"
    },
    {
      id: "topdressingFertilizerCost",
      questionKey: "question_topdressing_fertilizer_cost",
      type: "number",
      placeholder: "e.g., 2,800",
      step: "any",
      dependsOn: { field: "hasDoneSoilTest", value: "Yes" },
      sectionKey: "section_fertilizer_selection"
    },
    {
      id: "potassiumFertilizerToUse",
      questionKey: "question_potassium_fertilizer_to_use",
      type: "dropdown",
      options: potassiumFertilizerOptions.map(opt => opt.label),
      dependsOn: { field: "hasDoneSoilTest", value: "Yes" },
      sectionKey: "section_fertilizer_selection"
    },
    {
      id: "potassiumFertilizerCost",
      questionKey: "question_potassium_fertilizer_cost",
      type: "number",
      placeholder: "e.g., 2,800",
      step: "any",
      dependsOn: { field: "hasDoneSoilTest", value: "Yes", field2: "potassiumFertilizerToUse", valueNot: "None - I don't use potassium" },
      sectionKey: "section_fertilizer_selection"
    },
  ];

  const fertilizerQuestionsWithoutSoilTest = [
    {
      id: "plantingFertilizerType",
      questionKey: "question_planting_fertilizer_type",
      type: "dropdown",
      options: plantingFertilizerOptions.map(opt => opt.label),
      dependsOn: { field: "hasDoneSoilTest", value: "No" },
      sectionKey: "section_fertilizer_selection"
    },
    {
      id: "plantingFertilizerQuantity",
      questionKey: "question_planting_fertilizer_quantity",
      type: "number",
      placeholder: "e.g., 50 kg",
      step: "any",
      dependsOn: { field: "hasDoneSoilTest", value: "No" },
      sectionKey: "section_fertilizer_selection"
    },
    {
      id: "topdressingFertilizerType",
      questionKey: "question_topdressing_fertilizer_type",
      type: "dropdown",
      options: topdressingFertilizerOptions.map(opt => opt.label),
      dependsOn: { field: "hasDoneSoilTest", value: "No" },
      sectionKey: "section_fertilizer_selection"
    },
    {
      id: "topdressingFertilizerQuantity",
      questionKey: "question_topdressing_fertilizer_quantity",
      type: "number",
      placeholder: "e.g., 50 kg",
      step: "any",
      dependsOn: { field: "hasDoneSoilTest", value: "No" },
      sectionKey: "section_fertilizer_selection"
    },
    {
      id: "potassiumFertilizerType",
      questionKey: "question_potassium_fertilizer_type",
      type: "dropdown",
      options: potassiumFertilizerOptions.map(opt => opt.label),
      dependsOn: { field: "hasDoneSoilTest", value: "No" },
      sectionKey: "section_fertilizer_selection"
    },
    {
      id: "potassiumFertilizerQuantity",
      questionKey: "question_potassium_fertilizer_quantity",
      type: "number",
      placeholder: "e.g., 50 kg",
      step: "any",
      dependsOn: { field: "hasDoneSoilTest", value: "No", field2: "potassiumFertilizerType", valueNot: "None - I don't use potassium" },
      sectionKey: "section_fertilizer_selection"
    },
  ];

  // Helper to get fertilizer ID from label
  const getFertilizerIdFromLabel = (label: string, options: any[]): string => {
    const found = options.find(opt => opt.label === label);
    return found ? found.id : "other";
  };

  // Filter questions based on current farmerDetails
  const filterQuestions = useCallback((questions: any[]) => {
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
  }, [farmerDetails]);

  // Build all questions
  const getAllQuestions = useCallback(() => {
    let questions = [];

    questions = [...questions, ...countryQuestion];
    questions = [...questions, ...soilTestGatekeeperQuestion];
    questions = [...questions, cropSelectionQuestion];
    questions = [...questions, saleDateQuestion];

    if (farmerDetails.crops) {
      questions = [...questions, ...getCropSpecificQuestions()];
    }

    if (farmerDetails.crops) {
      questions = [...questions, ...getProductionQuestions()];
    }

    if (farmerDetails.hasDoneSoilTest === "Yes") {
      questions = [...questions, ...soilTestDetailsQuestions];
      questions = [...questions, ...fertilizerSelectionQuestions];
      questions = [...questions, ...nutrientDetailQuestions];
    } else if (farmerDetails.hasDoneSoilTest === "No") {
      questions = [...questions, ...fertilizerQuestionsWithoutSoilTest];
    }

    questions = [...questions, ...farmWaterQuestions];

    if (farmerDetails.crops) {
      questions = [...questions, ...getPestQuestions()];
    }

    questions = [...questions, plantsDamagedQuestion];

    if (farmerDetails.crops) {
      questions = [...questions, ...getFinancialQuestions()];
    }

    if (farmerDetails.crops) {
      questions = [...questions, ...deficiencyQuestions];
    }

    questions = [...questions, ...conservationQuestion];
    questions = [...questions, ...challengesQuestions];
    questions = [...questions, ...personalLocationQuestions];

    return questions;
  }, [farmerDetails]);

  // Memoized visible questions that update when farmerDetails changes
  const allQuestions = useMemo(() => getAllQuestions(), [getAllQuestions]);
  const visibleQuestions = useMemo(() => filterQuestions(allQuestions), [allQuestions, filterQuestions]);
  const totalQuestions = visibleQuestions.length;

  useEffect(() => {
    setDebugInfo(prev => ({ ...prev, totalQuestions: visibleQuestions.length }));
  }, [visibleQuestions.length]);

  // ========== FIXED: Speech recognition initialization with proper dependencies ==========
  useEffect(() => {
    let isMounted = true;

    const checkVoiceSupport = () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window && isMounted) {
        const voices = window.speechSynthesis.getVoices();
        // Only update if voice mode actually changed
        setDebugInfo(prev => {
          const newMode = voices.length > 0 ? "REAL" : "SIMULATED";
          if (prev.voiceMode === newMode) return prev;
          return { ...prev, voiceMode: newMode };
        });
      }
    };

    checkVoiceSupport();

    // Use setTimeout to avoid multiple rapid calls
    const timeoutId = setTimeout(checkVoiceSupport, 500);

    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) && !recognitionRef.current) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = recognitionLanguage;
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
            toast.info(safeT('no_speech_detected', { current: retryCountRef.current, max: maxRetries }));
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

    // Cleanup function
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      if (recognitionRef.current && isRecognitionActiveRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
    };
  }, [recognitionLanguage, safeT]);

  // ========== FIXED: Voice assistant ref setup - prevents multiple toasts ==========
  useEffect(() => {
    let isMounted = true;

    if (!voiceEnabled) {
      voiceAssistantRef.current = null;
      return;
    }

    if (!voiceAssistantRef.current) {
      voiceAssistantRef.current = { speak: async (text: string) => streamQuestionWithVoice(text) };
      // Only show toast once when voice is first enabled
      if (isMounted && voiceEnabled) {
        toast.success(safeT('voice_ready'));
      }
    }

    return () => {
      isMounted = false;
    };
  }, [voiceEnabled, safeT]); // Only re-run when voiceEnabled changes

  // Stream question with voice
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
      try { recognitionRef.current.stop(); } catch {}
      isRecognitionActiveRef.current = false;
      setDebugInfo(prev => ({ ...prev, isListening: false }));
    }

    const words = fullText.split(' ');
    questionWordsRef.current = words;

    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.rate = 1.0;
    utterance.pitch = 1.1;
    utterance.lang = recognitionLanguage;

    const voices = window.speechSynthesis.getVoices();

    const femaleVoicePatterns = [
      'Google UK', 'Google', 'Samantha', 'Microsoft Jenny',
      'Microsoft Aria', 'Microsoft Sonia', 'Microsoft Vivienne',
      'Moira', 'Tessa', 'Karen', 'Veena', 'Nicky', 'Catherine',
      'Fiona', 'Martha', 'Naomi', 'Sangeeta', 'Rishi', 'Lekha',
      'Zira', 'Heera', 'Kalpana', 'Hemant', 'Prabhat', 'Sagar'
    ];

    let selectedVoice = voices.find(voice =>
      voice.lang === recognitionLanguage &&
      femaleVoicePatterns.some(pattern => voice.name.includes(pattern))
    );

    if (!selectedVoice) {
      selectedVoice = voices.find(voice =>
        femaleVoicePatterns.some(pattern => voice.name.includes(pattern))
      );
    }

    if (!selectedVoice) {
      const malePatterns = ['Daniel', 'James', 'David', 'John', 'Paul', 'Mark', 'Michael'];
      selectedVoice = voices.find(voice =>
        !malePatterns.some(pattern => voice.name.includes(pattern))
      );
    }

    if (!selectedVoice && voices.length > 0) {
      selectedVoice = voices[0];
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      console.log(`Using voice: ${selectedVoice.name} (${selectedVoice.lang}) - FEMALE ONLY`);
    }

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

  // Speak acknowledgment
  const speakAcknowledgment = async (answer: string, fieldId: string) => {
    let acknowledgment = "";

    if (fieldId === "plantingFertilizerToUse") {
      acknowledgment = safeT('ack_planting_fertilizer', { answer });
    } else if (fieldId === "topdressingFertilizerToUse") {
      acknowledgment = safeT('ack_topdressing_fertilizer', { answer });
    } else if (fieldId === "potassiumFertilizerToUse") {
      acknowledgment = safeT('ack_potassium_fertilizer', { answer });
    } else if (fieldId === "plantingFertilizerCost" || fieldId === "topdressingFertilizerCost" || fieldId === "potassiumFertilizerCost") {
      acknowledgment = safeT('ack_cost', { answer });
    } else if (fieldId === "recPlantingFertilizer") {
      acknowledgment = safeT('ack_rec_planting', { answer });
    } else if (fieldId === "recTopdressingFertilizer") {
      acknowledgment = safeT('ack_rec_topdressing', { answer });
    } else if (fieldId === "recPotassiumFertilizer") {
      acknowledgment = safeT('ack_rec_potassium', { answer });
    } else if (fieldId === "recCalciticLime") {
      acknowledgment = safeT('ack_rec_lime', { answer });
    } else if (fieldId === "targetYield") {
      acknowledgment = safeT('ack_target_yield_kg', { answer });
    } else if (fieldId === "actualYieldKg") {
      acknowledgment = safeT('ack_actual_yield_kg', { answer });
    } else if (fieldId === "pricePerKg") {
      acknowledgment = safeT('ack_price_per_kg', { answer });
    } else if (fieldId === "country") {
      acknowledgment = safeT('ack_country', { answer });
      setCountry(answer);
    } else if (fieldId === "phoneNumber") {
      acknowledgment = safeT('ack_phone', { code: selectedCountryCode, number: answer });
    } else if (fieldId === "crops") {
      acknowledgment = safeT('ack_crops', { answer });
    } else if (fieldId === "plantingDate") {
      const date = new Date(answer).toLocaleDateString();
      acknowledgment = safeT('ack_planting_date', { date });
    } else if (fieldId === "deficiencySymptoms") {
      acknowledgment = safeT('ack_deficiency_symptoms', { answer });
    } else if (fieldId === "deficiencyLocation") {
      acknowledgment = safeT('ack_deficiency_location', { answer });
    } else if (fieldId === "plantsDamaged") {
      acknowledgment = safeT('ack_plants_damaged', { answer });
    } else {
      acknowledgment = safeT('ack_generic', { answer });
    }

    await voiceAssistantRef.current?.speak(acknowledgment);
    toast.success(safeT('recorded', { answer }));
  };

  // ========== HANDLE VOICE TOGGLE ==========
  const handleVoiceToggle = (enabled: boolean) => {
    setVoiceEnabled(enabled);
    toast.success(enabled ? safeT('voice_mode_on') : safeT('voice_mode_off'));
  };

  // Process nutrient selections - FIXED to properly save values
  const handleNutrientSubmit = (type: string, nutrients: any) => {
    const nutrientString = Object.entries(nutrients)
      .filter(([_, value]) => value && value !== "" && value !== "0" && value !== "0%")
      .map(([key, value]) => {
        // Extract just the number, remove % if present
        const percent = value.toString().replace('%', '');
        return `${percent}${key.toUpperCase()}`;
      })
      .join('+');

    setFarmerDetails(prev => ({
      ...prev,
      [type]: nutrientString || "No additional nutrients"
    }));

    // Show success toast
    toast.success(safeT('nutrients_recorded'));
  };

  // Process answer with VALIDATION
  const processAnswer = async (answer: string) => {
    if (currentStep !== "configuring") return;

    const currentConfig = visibleQuestions[configStep];
    let cleanAnswer = answer;
    let finalValue = cleanAnswer;

    // Check if this is a custom nutrient question
    if (currentConfig.id === "plantingFertilizerNutrients") {
      handleNutrientSubmit("plantingFertilizerNutrients", plantingNutrients);
      // Skip to next question
      if (configStep < visibleQuestions.length - 1) {
        setConfigStep(prev => prev + 1);
        setTimeout(() => askQuestion(configStep + 1), 2500);
      }
      return;
    }
    if (currentConfig.id === "topdressingFertilizerNutrients") {
      handleNutrientSubmit("topdressingFertilizerNutrients", topdressingNutrients);
      if (configStep < visibleQuestions.length - 1) {
        setConfigStep(prev => prev + 1);
        setTimeout(() => askQuestion(configStep + 1), 2500);
      }
      return;
    }
    if (currentConfig.id === "potassiumFertilizerNutrients") {
      handleNutrientSubmit("potassiumFertilizerNutrients", potassiumNutrients);
      if (configStep < visibleQuestions.length - 1) {
        setConfigStep(prev => prev + 1);
        setTimeout(() => askQuestion(configStep + 1), 2500);
      }
      return;
    }

    // ===== VALIDATION =====
    if (currentConfig.id === "harvestUnit") {
      if (cleanAnswer.toLowerCase().includes("bag") ||
          cleanAnswer.toLowerCase().includes("sac") ||
          cleanAnswer.toLowerCase().includes("sacs")) {
        toast.warning(safeT('use_kg_warning'), {
          description: safeT('bags_to_kg_hint', {
            example: safeT('bags_to_kg_example')
          }),
          duration: 8000
        });
      }
    }

    if (currentConfig.id === "actualYieldKg") {
      const yieldKg = parseFloat(cleanAnswer);
      if (!isNaN(yieldKg)) {
        if (yieldKg < 100 && yieldKg > 0) {
          const bagsEquivalent = Math.round(yieldKg / 90);
          const convertedKg = bagsEquivalent * 90;

          toast.warning(safeT('yield_seems_low_warning'), {
            description: safeT('yield_seems_low_detail', {
              yield: yieldKg,
              bags: bagsEquivalent,
              converted: convertedKg
            }),
            duration: 10000,
            action: {
              label: safeT('use_converted'),
              onClick: () => {
                setUserTranscript(convertedKg.toString());
              }
            }
          });

          const confirmed = window.confirm(
            safeT('yield_seems_low_confirm', {
              yield: yieldKg,
              bags: bagsEquivalent,
              converted: convertedKg
            })
          );
          if (!confirmed) return;
        }

        const maxYieldPerAcre = {
          maize: 5000,
          beans: 3000,
          onions: 15000,
          tomatoes: 30000,
          potatoes: 20000,
          cabbages: 25000,
          rice: 6000,
          mangoes: 20000,
          pineapples: 40000,
          watermelons: 30000,
          carrots: 15000,
          chillies: 10000,
          spinach: 12000,
          pigeonpeas: 1500,
          bambaranuts: 1200,
          yams: 20000,
          taro: 15000,
          okra: 10000,
          tea: 4000,
          macadamia: 6800,
          cocoa: 1500,
          "sweet potatoes": 20000
        };
        const crop = farmerDetails.crops?.toLowerCase() || 'maize';
        const maxYield = maxYieldPerAcre[crop as keyof typeof maxYieldPerAcre] || 20000;
        const acres = parseFloat(farmerDetails.cropAcres) || 1;

        if (yieldKg > maxYield * acres * 1.5) {
          toast.warning(safeT('yield_too_high'), {
            description: safeT('yield_too_high_detail', { max: maxYield * acres }),
            duration: 8000
          });
        }
      }
    }

    if (currentConfig.id === "pricePerKg") {
      const price = parseFloat(cleanAnswer);
      if (!isNaN(price)) {
        if (price < 10) {
          toast.error(safeT('price_too_low'), {
            description: safeT('price_per_kg_expected', { crop: farmerDetails.crops || safeT('your_crop') }),
            duration: 8000
          });
          return;
        }
        if (price > 500) {
          toast.warning(safeT('price_very_high'), {
            description: safeT('price_high_verify'),
            duration: 8000
          });
        }
      }
    }

    if (currentConfig.id === "targetYield") {
      const targetKg = parseFloat(cleanAnswer);
      if (!isNaN(targetKg) && targetKg < 100) {
        const confirmed = window.confirm(
          safeT('target_yield_low', { target: targetKg })
        );
        if (!confirmed) return;
      }
    }
    // ===== END VALIDATION =====

    const questionPhrases = [
      "what is your", "what's your", "tell me your", "your phone number is",
      "what county are you in", "you are in", "the answer is", "i said",
      "it is", "is that correct", "yes it is", "that is correct", "that's correct",
      "my phone number is", "my name is", "i am", "i'm", "my answer is",
      "into your soil test", "according to your soil test", "what is your recommended",
      "and its formulation", "for your", "fertilizer", "top dressing", "planting",
      "potassium", "per acre", "exam", "exact", "dash", "point",
      currentConfig?.questionKey ? safeT(currentConfig.questionKey).toLowerCase() : ""
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
      if (fertilizerMatch) cleanAnswer = fertilizerMatch[0];
    }

    if (currentConfig.id === "plantingFertilizerToUse") {
      finalValue = getFertilizerIdFromLabel(cleanAnswer, plantingFertilizerOptions);
    } else if (currentConfig.id === "topdressingFertilizerToUse") {
      finalValue = getFertilizerIdFromLabel(cleanAnswer, topdressingFertilizerOptions);
    } else if (currentConfig.id === "potassiumFertilizerToUse") {
      finalValue = getFertilizerIdFromLabel(cleanAnswer, potassiumFertilizerOptions);
    } else if (currentConfig.id === "subCounty") {
      finalValue = cleanAnswer.split(/[.\s]+/).pop()?.toLowerCase() || cleanAnswer;
    } else if (currentConfig.id === "ward") {
      finalValue = cleanAnswer.split(/[.\s]+/).pop()?.toLowerCase() || cleanAnswer;
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
      console.log(`Started listening for answer with language: ${recognitionLanguage}`);
    } catch (error) {}
  };

  const safeStopListening = () => {
    if (recognitionRef.current && isRecognitionActiveRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      isRecognitionActiveRef.current = false;
      setDebugInfo(prev => ({ ...prev, isListening: false }));
    }
  };

  const startVoiceSetup = async () => {
    if (!voiceEnabled || !voiceAssistantRef.current) {
      toast.error(safeT('enable_voice_first'));
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
      // REMOVED phoneCountryCode and phoneNumber
      county: "",
      subCounty: "",
      ward: "",
      village: "",
      totalFarmSize: "",
      cultivatedAcres: "",
      waterSources: "",
      hasDoneSoilTest: "",
      crops: "",
      saleDate: "",
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
      deficiencySymptoms: "",
      deficiencyLocation: "",
      harvestUnit: "kg",
      pricePerKg: "",
      actualYieldKg: "",
      storageMethod: "",
      npkCost: "",
      ploughingCost: "",
      plantingLabourCost: "",
      weedingCost: "",
      harvestingCost: "",
      transportCostPerKg: "",
      emptyBags: "",
      bagCost: "",
      seedCost: "",
      plantingMaterialCost: "",
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
      recCalciticLime: "",
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
      plantingFertilizerNutrients: "",
      topdressingFertilizerNutrients: "",
      potassiumFertilizerNutrients: "",
      plantsDamaged: "",
    });

    setPlantingNutrients({ s: "", ca: "", mg: "", zn: "", b: "", cu: "", mn: "" });
    setTopdressingNutrients({ s: "", ca: "", mg: "", zn: "", b: "", cu: "", mn: "" });
    setPotassiumNutrients({ s: "", ca: "", mg: "", zn: "", b: "", cu: "", mn: "" });

    askQuestion(0);
  };

  const askQuestion = async (step: number) => {
    if (!voiceAssistantRef.current || step >= visibleQuestions.length) return;
    if (isSpeaking) await new Promise(resolve => setTimeout(resolve, 500));

    const questionKey = visibleQuestions[step].questionKey;
    const question = translateWithCrop(safeT, questionKey, farmerDetails.crops);

    setDebugInfo(prev => ({ ...prev, currentQuestion: step + 1 }));
    setUserTranscript("");
    setLastSubmittedAnswer("");

    await voiceAssistantRef.current.speak(question);
  };

  const generateSession = async () => {
    if (!voiceAssistantRef.current) return;
    setIsLoading(true);

    await voiceAssistantRef.current.speak(safeT('creating_profile'));

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
        await voiceAssistantRef.current.speak(safeT('ready_redirect'));
        setTimeout(() => window.location.href = `/interview/${data.sessionId}`, 2000);
        setCurrentStep("redirecting");
      }
    } catch (error) {
      toast.error(safeT('error_creating_profile'));
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
      toast.info(safeT('skipped'));
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

  const currentSectionKey = visibleQuestions[configStep]?.sectionKey;
  const currentSection = currentSectionKey ? safeT(currentSectionKey) : "";
  const wordProgress = currentWordIndex > 0 && questionWordsRef.current.length > 0
    ? `${currentWordIndex}/${questionWordsRef.current.length} ${safeT('words')}`
    : '';

  // ✅ Define q here to fix "q is not defined" error
  const q = visibleQuestions[configStep];

  // FIXED nutrient selector with dark text
  const renderNutrientSelector = useCallback((
    type: string,
    nutrients: any,
    setNutrients: any
  ) => {
    const nutrientList = ['s', 'ca', 'mg', 'zn', 'b', 'cu', 'mn'];

    return (
      <div className="space-y-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
        <p className="font-medium text-blue-900">
          {safeT(`question_${type}_fertilizer_nutrients`)}
        </p>
        <div className="space-y-2">
          {nutrientList.map(nutrient => (
            <NutrientDropdown
              key={nutrient}
              nutrient={nutrient}
              value={nutrients[nutrient]}
              onChange={(value) =>
                setNutrients((prev: any) => ({ ...prev, [nutrient]: value }))
              }
            />
          ))}
        </div>
        <button
          onClick={() => {
            if (type === "planting") {
              handleNutrientSubmit("plantingFertilizerNutrients", plantingNutrients);
            } else if (type === "topdressing") {
              handleNutrientSubmit("topdressingFertilizerNutrients", topdressingNutrients);
            } else if (type === "potassium") {
              handleNutrientSubmit("potassiumFertilizerNutrients", potassiumNutrients);
            }

            if (configStep < visibleQuestions.length - 1) {
              setConfigStep(prev => prev + 1);
              setTimeout(() => askQuestion(configStep + 1), 1500);
            }
          }}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          {safeT('continue')}
        </button>
      </div>
    );
  }, [plantingNutrients, topdressingNutrients, potassiumNutrients, configStep, visibleQuestions.length, safeT]);

  const renderInput = useCallback(() => {
    const q = visibleQuestions[configStep];
    if (!q) return null;

    if (q.id === "plantingFertilizerNutrients") {
      return renderNutrientSelector("planting", plantingNutrients, setPlantingNutrients);
    }
    if (q.id === "topdressingFertilizerNutrients") {
      return renderNutrientSelector("topdressing", topdressingNutrients, setTopdressingNutrients);
    }
    if (q.id === "potassiumFertilizerNutrients") {
      return renderNutrientSelector("potassium", potassiumNutrients, setPotassiumNutrients);
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
            <option value="" className="text-gray-500">{safeT('select_option')}</option>
            {q.options?.map((opt: string, index: number) => (
              <option key={`${opt}-${index}`} value={opt} className="text-blue-900">{opt}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-blue-600" />
        </div>
      );
    }

    if (q.type === "text") {
      return (
        <input
          type="text"
          value={userTranscript}
          onChange={(e) => setUserTranscript(e.target.value)}
          placeholder={q.placeholder || safeT('type_answer')}
          className="w-full px-4 py-3 border-2 rounded-xl text-blue-900 font-medium focus:border-blue-600 placeholder-gray-400"
        />
      );
    }

    if (q.type === "number") {
      return (
        <input
          type="number"
          value={userTranscript}
          onChange={(e) => setUserTranscript(e.target.value)}
          placeholder={q.placeholder || safeT('type_answer')}
          step={q.step || "any"}
          className="w-full px-4 py-3 border-2 rounded-xl text-blue-900 font-medium focus:border-blue-600 placeholder-gray-400"
        />
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
        placeholder={q.placeholder || safeT('type_answer')}
        step={q.step || "any"}
        className="w-full px-4 py-3 border-2 rounded-xl text-blue-900 font-medium focus:border-blue-600 placeholder-gray-400"
      />
    );
  }, [configStep, visibleQuestions, userTranscript, plantingNutrients, topdressingNutrients, potassiumNutrients, renderNutrientSelector, safeT]);

  // ========== RENDER ==========
  return (
    <div className={`flex flex-col gap-6 p-4 ${colors.background} rounded-2xl min-h-screen`}>
      {/* Simplified Header with integrated voice toggle */}
      <div className={`${colors.card} rounded-2xl p-5 shadow-xl border`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Image src={profileImage || "/farmer-avatar.png"} alt="Farmer" width={48} height={48} className="rounded-full ring-4" />
            <div>
              <h4 className="font-bold text-xl">{userName || safeT('farmer')}</h4>
              <p className="text-sm text-gray-500">{safeT('smart_farmer_building')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Simple voice toggle */}
            <div className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl px-3 py-2 border border-white-30">
              <Mic className={`w-5 h-5 text-white ${isSpeaking ? 'animate-pulse' : ''}`} />
              <button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className="text-white font-medium text-sm focus:outline-none"
              >
                {voiceEnabled ? safeT('voice_on') : safeT('voice_off')}
              </button>
            </div>
            {/* Start Setup button */}
            <button
              onClick={startVoiceSetup}
              disabled={!voiceEnabled || currentStep !== "idle"}
              className={`px-6 py-2 rounded-xl font-bold text-sm ${
                voiceEnabled && currentStep === "idle"
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:scale-105 transition-all'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {currentStep === "idle" ? safeT('start_setup') : safeT('loading')}
            </button>
          </div>
        </div>
        {/* Speaking indicator */}
        {isSpeaking && (
          <div className="mt-2 text-xs text-blue-600 flex items-center gap-1">
            <Volume2 className="w-3 h-3 animate-pulse" />
            <span>{safeT('speaking')} {wordProgress}</span>
          </div>
        )}
      </div>

      {/* Question Display – enlarged with dynamic count */}
      {currentStep === "configuring" && visibleQuestions.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 shadow-xl border-2 border-green-300 min-h-[300px]">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center font-bold">
              {configStep + 1}
            </span>
            <h4 className="font-bold text-xl text-emerald-800">
              {safeT('question_x_of_y', { current: configStep + 1, total: visibleQuestions.length })}
            </h4>
            {currentSection && <p className="text-sm text-emerald-600 ml-auto">{currentSection}</p>}
            {isStreaming && (
              <span className="ml-auto flex items-center gap-2 text-emerald-600">
                <Volume2 className="w-5 h-5 animate-pulse" />
                <span className="text-sm">{wordProgress}</span>
              </span>
            )}
          </div>

          <div className="bg-white rounded-xl p-6 border-2 border-emerald-200 min-h-[120px]">
            {streamingQuestion ? (
              <p className="text-3xl text-gray-800">
                {streamingQuestion.split(' ').map((word, wordIdx, arr) => (
                  <span key={wordIdx}>
                    <span className="text-emerald-700 font-bold">{word}</span>
                    {wordIdx < arr.length - 1 ? ' ' : ''}
                  </span>
                ))}
              </p>
            ) : (
              <p className="text-3xl text-gray-400 italic">
                {isStreaming ? safeT('speaking_dots') : safeT('ready_for_answer')}
              </p>
            )}
          </div>

          {!isStreaming && streamingQuestion && (
            <div className="mt-6">
              <div className="bg-white rounded-xl border-2 border-purple-200 p-6">
                {renderInput()}

                {!q?.renderCustom && (
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={submitAnswer}
                      disabled={!userTranscript.trim()}
                      className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-2.5 rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      {safeT('submit_answer')}
                    </button>
                    <button
                      onClick={skipQuestion}
                      className="px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white py-2.5 rounded-xl font-medium"
                    >
                      {safeT('skip')}
                    </button>
                  </div>
                )}
              </div>

              {lastSubmittedAnswer && (
                <div className="mt-3 p-3 bg-blue-50 rounded-xl border-2 border-blue-200">
                  <p className="text-sm text-blue-800 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    {safeT('your_answer')}: <span className="font-bold text-blue-900">{lastSubmittedAnswer}</span>
                  </p>
                  <p className="text-xs text-blue-600 mt-1">{safeT('voice_confirmation_sent')}</p>
                </div>
              )}

              {debugInfo.isListening && (
                <div className="mt-3 p-3 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-red-600">{safeT('listening_speak_now')}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Stop Button */}
      {(currentStep === "configuring" || currentStep === "generating") && (
        <button onClick={stopEverything} className="px-5 py-3 bg-gradient-to-r from-rose-500 to-red-500 text-white rounded-xl mx-auto w-48 font-medium flex items-center justify-center gap-2">
          <span>{safeT('stop_setup')}</span>
        </button>
      )}
    </div>
  );
};

export default CreateInterviewAgent;