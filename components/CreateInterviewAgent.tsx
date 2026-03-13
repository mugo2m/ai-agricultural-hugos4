"use client";

import { useState, useEffect, useRef } from "react";
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

// Country codes for phone numbers (same as before)
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
    crops: "",               // restored
    saleDate: "",             // new sale date field
    cropVarieties: "",        // free text
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
    deficiencySymptoms: "",   // NEW: farmer-reported deficiency symptoms
    deficiencyLocation: "",   // NEW: where symptoms appear (older leaves, new growth, etc.)
    harvestUnit: "",
    pricePerKg: "",           // Changed from pricePerUnit to pricePerKg
    actualYieldKg: "",        // Changed from actualYield to actualYieldKg
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

  // UPDATED CROP SELECTION QUESTION with 15 new crops
  const cropSelectionQuestion = {
    id: "crops",
    questionKey: "question_crop_enterprise",
    type: "dropdown",
    options: [
      // Existing crops
      "maize", "beans", "finger millet", "sorghum", "soya beans", "cowpeas",
      "green grams", "bambara nuts", "groundnuts", "sunflower", "simsim",
      "coffee", "cotton", "sugarcane", "tobacco", "cassava", "sweet potatoes",
      "irish potatoes", "tomatoes", "kales", "cabbages", "onions", "carrots",
      "capsicums", "chillies", "brinjals", "french beans", "garden peas",
      "bananas", "oranges", "pineapples", "avocados", "pawpaws", "passion fruit",
      // NEW CROPS ADDED HERE
      "rice", "mangoes", "watermelons", "spinach", "pigeon peas",
      "yams", "taro", "okra", "tea", "macadamia", "cocoa"
    ],
    sectionKey: "section_crops"
  };

  // SALE DATE QUESTION (additional)
  const saleDateQuestion = {
    id: "saleDate",
    questionKey: "question_sale_date",
    type: "date",
    minDate: new Date().toISOString().split('T')[0],
    maxDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    sectionKey: "section_production"
  };

  // NEW: Nutrient deficiency questions
  const deficiencyQuestions = [
    {
      id: "deficiencySymptoms",
      questionKey: "question_deficiency_symptoms",
      type: "text",
      placeholder: t('deficiency_symptom_placeholder'),
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

  const getCropSpecificQuestions = () => {
    if (!farmerDetails.crops) return [];
    const crop = farmerDetails.crops;
    const spacingOptions = getSpacingOptions(crop);

    return [
      {
        id: "cropVarieties",
        questionKey: "question_crop_varieties",
        type: "text", // free text
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
    const cropType = getCropType(crop);

    // Always use kg for yield - no bag options
    let unitOptions = ["kg", "tonnes"];

    return [
      {
        id: "harvestUnit",
        questionKey: "question_harvest_unit",
        type: "dropdown",
        options: unitOptions,
        sectionKey: "section_production"
      },
      {
        id: "actualYieldKg",  // Changed from pricePerUnit to actualYieldKg
        questionKey: "question_actual_yield_kg",
        type: "number",
        step: "any",
        placeholder: t('enter_yield_kg_placeholder'),
        sectionKey: "section_production"
      },
      {
        id: "pricePerKg",      // Changed from pricePerUnit to pricePerKg
        questionKey: "question_price_per_kg",
        type: "number",
        step: "any",
        placeholder: t('enter_price_kg_placeholder'),
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
    {
      id: "cultivatedAcres",
      questionKey: "question_cultivated_acres",
      type: "number",
      step: "any",
      placeholder: "e.g., 2.5",
      sectionKey: "section_farm"
    },
    {
      id: "waterSources",
      questionKey: "question_water_sources",
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

    return [
      { id: "seedCost", questionKey: "question_seed_cost", type: "number", placeholder: "e.g., 180", step: "any", sectionKey: "section_finance" },
      { id: "calciticLimePricePerBag", questionKey: "question_lime_price", type: "number", placeholder: "e.g., 300", step: "any", sectionKey: "section_finance" },
      { id: "ploughingCost", questionKey: "question_ploughing_cost", type: "number", step: "any", placeholder: "e.g., 7000", sectionKey: "section_finance" },
      { id: "plantingLabourCost", questionKey: "question_planting_labour_cost", type: "number", step: "any", placeholder: "e.g., 2000", sectionKey: "section_finance" },
      { id: "weedingCost", questionKey: "question_weeding_cost", type: "number", step: "any", placeholder: "e.g., 2500", sectionKey: "section_finance" },
      { id: "harvestingCost", questionKey: "question_harvesting_cost", type: "number", step: "any", placeholder: "e.g., 2000", sectionKey: "section_finance" },
      { id: "transportCostPerBag", questionKey: "question_transport_cost", type: "number", step: "any", placeholder: "e.g., 50", sectionKey: "section_finance" },
      { id: "bagCost", questionKey: "question_bag_cost", type: "number", step: "any", placeholder: "e.g., 40", sectionKey: "section_finance" },
    ];
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
    { id: "farmerName", questionKey: "question_farmer_name", type: "text", placeholder: "e.g., John Mugo", sectionKey: "section_personal" },
    {
      id: "phoneNumber",
      questionKey: "question_phone_number",
      type: "tel",
      renderCustom: true,
      sectionKey: "section_personal"
    },
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
      questionKey: "question_target_yield_kg",  // Changed to kg
      type: "number",
      step: "any",
      placeholder: t('enter_target_yield_kg'),
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

  const getAllQuestions = () => {
    let questions = [];

    questions = [...questions, ...countryQuestion];
    questions = [...questions, ...soilTestGatekeeperQuestion];

    if (farmerDetails.hasDoneSoilTest === "Yes") {
      questions = [...questions, ...soilTestDetailsQuestions];
      questions = [...questions, ...fertilizerSelectionQuestions];
    } else if (farmerDetails.hasDoneSoilTest === "No") {
      questions = [...questions, ...fertilizerQuestionsWithoutSoilTest];
    }

    // RESTORED crop selection
    questions = [...questions, cropSelectionQuestion];

    // ADDED sale date question
    questions = [...questions, saleDateQuestion];

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

    // ADDED nutrient deficiency questions
    if (farmerDetails.crops) {
      questions = [...questions, ...deficiencyQuestions];
    }

    questions = [...questions, ...conservationQuestion];
    questions = [...questions, ...challengesQuestions];
    questions = [...questions, ...personalLocationQuestions];

    return questions;
  };

  const allQuestions = getAllQuestions();
  const visibleQuestions = filterQuestions(allQuestions);
  const totalQuestions = visibleQuestions.length;

  useEffect(() => {
    setDebugInfo(prev => ({ ...prev, totalQuestions: visibleQuestions.length }));
  }, [visibleQuestions.length]);

  // Speech recognition initialization
  useEffect(() => {
    const checkVoiceSupport = () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices();
        setDebugInfo(prev => ({ ...prev, voiceMode: voices.length > 0 ? "REAL" : "SIMULATED" }));
      }
    };
    checkVoiceSupport();
    setTimeout(checkVoiceSupport, 500);

    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
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
            toast.info(t('no_speech_detected', { current: retryCountRef.current, max: maxRetries }));
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
        try { recognitionRef.current.stop(); } catch {}
      }
    };
  }, [recognitionLanguage, t]);

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
    utterance.rate = 0.75;
    utterance.pitch = 1.1;
    utterance.lang = recognitionLanguage;

    const voices = window.speechSynthesis.getVoices();
    const matchingVoices = voices.filter(v => v.lang === recognitionLanguage);
    let preferredVoice;
    if (matchingVoices.length > 0) {
      preferredVoice = matchingVoices.find(v =>
        v.name.includes('Jenny') || v.name.includes('Aria') ||
        v.name.includes('Sonia') || v.name.includes('Samantha') ||
        v.name.includes('Vivienne')
      ) || matchingVoices[0];
    } else {
      preferredVoice = voices.find(v =>
        v.name.includes('Google UK') || v.name.includes('Google') ||
        v.name.includes('Samantha') || v.name.includes('Microsoft Jenny') ||
        v.name.includes('Microsoft Aria') || v.name.includes('Microsoft Sonia') ||
        v.name.includes('Microsoft Vivienne')
      );
    }
    if (preferredVoice) {
      utterance.voice = preferredVoice;
      console.log(`Using voice: ${preferredVoice.name} (${preferredVoice.lang})`);
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
      acknowledgment = t('ack_planting_fertilizer', { answer });
    } else if (fieldId === "topdressingFertilizerToUse") {
      acknowledgment = t('ack_topdressing_fertilizer', { answer });
    } else if (fieldId === "potassiumFertilizerToUse") {
      acknowledgment = t('ack_potassium_fertilizer', { answer });
    } else if (fieldId === "plantingFertilizerCost" || fieldId === "topdressingFertilizerCost" || fieldId === "potassiumFertilizerCost") {
      acknowledgment = t('ack_cost', { answer });
    } else if (fieldId === "recPlantingFertilizer") {
      acknowledgment = t('ack_rec_planting', { answer });
    } else if (fieldId === "recTopdressingFertilizer") {
      acknowledgment = t('ack_rec_topdressing', { answer });
    } else if (fieldId === "recPotassiumFertilizer") {
      acknowledgment = t('ack_rec_potassium', { answer });
    } else if (fieldId === "recCalciticLime") {
      acknowledgment = t('ack_rec_lime', { answer });
    } else if (fieldId === "targetYield") {
      acknowledgment = t('ack_target_yield_kg', { answer });
    } else if (fieldId === "actualYieldKg") {
      acknowledgment = t('ack_actual_yield_kg', { answer });
    } else if (fieldId === "pricePerKg") {
      acknowledgment = t('ack_price_per_kg', { answer });
    } else if (fieldId === "country") {
      acknowledgment = t('ack_country', { answer });
      setCountry(answer);
    } else if (fieldId === "phoneNumber") {
      acknowledgment = t('ack_phone', { code: selectedCountryCode, number: answer });
    } else if (fieldId === "crops") {
      acknowledgment = t('ack_crops', { answer });
    } else if (fieldId === "plantingDate") {
      const date = new Date(answer).toLocaleDateString();
      acknowledgment = t('ack_planting_date', { date });
    } else if (fieldId === "deficiencySymptoms") {
      acknowledgment = t('ack_deficiency_symptoms', { answer });
    } else if (fieldId === "deficiencyLocation") {
      acknowledgment = t('ack_deficiency_location', { answer });
    } else {
      acknowledgment = t('ack_generic', { answer });
    }

    await voiceAssistantRef.current?.speak(acknowledgment);
    toast.success(t('recorded', { answer }));
  };

  // Voice assistant ref setup
  useEffect(() => {
    if (!voiceEnabled) {
      voiceAssistantRef.current = null;
      return;
    }
    voiceAssistantRef.current = { speak: async (text: string) => streamQuestionWithVoice(text) };
    toast.success(t('voice_ready'));
  }, [voiceEnabled, t]);

  // ========== HANDLE VOICE TOGGLE ==========
  const handleVoiceToggle = (enabled: boolean) => {
    setVoiceEnabled(enabled);
    toast.success(enabled ? t('voice_mode_on') : t('voice_mode_off'));
  };

  // Process answer with VALIDATION
  const processAnswer = async (answer: string) => {
    if (currentStep !== "configuring") return;

    const currentConfig = visibleQuestions[configStep];
    let cleanAnswer = answer;
    let finalValue = cleanAnswer;

    // ===== VALIDATION =====
    // Check for bag references in harvest unit
    if (currentConfig.id === "harvestUnit") {
      if (cleanAnswer.toLowerCase().includes("bag") ||
          cleanAnswer.toLowerCase().includes("sac") ||
          cleanAnswer.toLowerCase().includes("sacs")) {
        toast.warning(t('use_kg_warning'), {
          description: t('bags_to_kg_hint', {
            example: t('bags_to_kg_example')
          }),
          duration: 8000
        });
      }
    }

    // Validate yield (actualYieldKg)
    if (currentConfig.id === "actualYieldKg") {
      const yieldKg = parseFloat(cleanAnswer);
      if (!isNaN(yieldKg)) {
        // Check if yield seems too low (likely entered as bags)
        if (yieldKg < 100 && yieldKg > 0) {
          const bagsEquivalent = Math.round(yieldKg / 90);
          const convertedKg = bagsEquivalent * 90;

          toast.warning(t('yield_seems_low_warning'), {
            description: t('yield_seems_low_detail', {
              yield: yieldKg,
              bags: bagsEquivalent,
              converted: convertedKg
            }),
            duration: 10000,
            action: {
              label: t('use_converted'),
              onClick: () => {
                setUserTranscript(convertedKg.toString());
              }
            }
          });

          // Ask for confirmation
          const confirmed = window.confirm(
            t('yield_seems_low_confirm', {
              yield: yieldKg,
              bags: bagsEquivalent,
              converted: convertedKg
            })
          );
          if (!confirmed) return; // Stop if farmer cancels
        }

        // Check if yield is unrealistically high
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
          cocoa: 1500
        };
        const crop = farmerDetails.crops?.toLowerCase() || 'maize';
        const maxYield = maxYieldPerAcre[crop as keyof typeof maxYieldPerAcre] || 10000;
        const acres = parseFloat(farmerDetails.cropAcres) || 1;

        if (yieldKg > maxYield * acres * 1.5) {
          toast.warning(t('yield_too_high'), {
            description: t('yield_too_high_detail', { max: maxYield * acres }),
            duration: 8000
          });
        }
      }
    }

    // Validate price per kg
    if (currentConfig.id === "pricePerKg") {
      const price = parseFloat(cleanAnswer);
      if (!isNaN(price)) {
        if (price < 10) {
          toast.error(t('price_too_low'), {
            description: t('price_per_kg_expected', { crop: farmerDetails.crops || t('your_crop') }),
            duration: 8000
          });
          return; // Stop, ask again
        }
        if (price > 500) {
          toast.warning(t('price_very_high'), {
            description: t('price_high_verify'),
            duration: 8000
          });
        }
      }
    }

    // Validate target yield
    if (currentConfig.id === "targetYield") {
      const targetKg = parseFloat(cleanAnswer);
      if (!isNaN(targetKg) && targetKg < 100) {
        const confirmed = window.confirm(
          t('target_yield_low', { target: targetKg })
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
      currentConfig?.questionKey ? t(currentConfig.questionKey).toLowerCase() : ""
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
      toast.error(t('enable_voice_first'));
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
      hasDoneSoilTest: "", crops: "", saleDate: "", cropVarieties: "", cropAcres: "", season: "", plantingDate: "",
      plantingMaterial: "", plantingQuantity: "", seedSource: "", spacing: "",
      commonPests: "", pestControlMethod: "", commonDiseases: "", diseaseControlMethod: "",
      deficiencySymptoms: "", deficiencyLocation: "", // NEW: deficiency fields
      harvestUnit: "", pricePerKg: "", actualYieldKg: "", storageMethod: "",
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

    askQuestion(0);
  };

  const askQuestion = async (step: number) => {
    if (!voiceAssistantRef.current || step >= visibleQuestions.length) return;
    if (isSpeaking) await new Promise(resolve => setTimeout(resolve, 500));

    const question = t(visibleQuestions[step].questionKey);
    setDebugInfo(prev => ({ ...prev, currentQuestion: step + 1 }));
    setUserTranscript("");
    setLastSubmittedAnswer("");

    await voiceAssistantRef.current.speak(question);
  };

  const generateSession = async () => {
    if (!voiceAssistantRef.current) return;
    setIsLoading(true);

    await voiceAssistantRef.current.speak(t('creating_profile'));

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
        await voiceAssistantRef.current.speak(t('ready_redirect'));
        setTimeout(() => window.location.href = `/interview/${data.sessionId}`, 2000);
        setCurrentStep("redirecting");
      }
    } catch (error) {
      toast.error(t('error_creating_profile'));
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
      toast.info(t('skipped'));
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
  const currentSection = currentSectionKey ? t(currentSectionKey) : "";
  const wordProgress = currentWordIndex > 0 && questionWordsRef.current.length > 0
    ? `${currentWordIndex}/${questionWordsRef.current.length} ${t('words')}`
    : '';

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
          placeholder={t('phone_placeholder')}
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
            <option value="" className="text-gray-500">{t('select_option')}</option>
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
          placeholder={q.placeholder || t('type_answer')}
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
          placeholder={q.placeholder || t('type_answer')}
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
        placeholder={q.placeholder || t('type_answer')}
        step={q.step || "any"}
        className="w-full px-4 py-3 border-2 rounded-xl text-blue-900 font-medium focus:border-blue-600 placeholder-gray-400"
      />
    );
  };

  // ========== RENDER ==========
  return (
    <div className={`flex flex-col gap-6 p-4 ${colors.background} rounded-2xl min-h-screen`}>
      {/* Header */}
      <div className={`${colors.card} rounded-2xl p-5 shadow-xl border`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Image src={profileImage || "/farmer-avatar.png"} alt="Farmer" width={48} height={48} className="rounded-full ring-4" />
            <div>
              <h4 className="font-bold text-xl">{userName || t('farmer')}</h4>
              <p className="text-sm text-gray-500">{t('smart_farmer_building')}</p>
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
            {currentStep === "idle" ? t('start_setup') : t('loading')}
          </button>
        </div>
      </div>

      {/* Compact Voice Toggle */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-3 shadow-xl border-2 border-white/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-white" />
            <span className="font-semibold text-white">{t('voice_mode')}</span>
            <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">{t('beta')}</span>
          </div>
          <VoiceToggle onVoiceToggle={handleVoiceToggle} initialEnabled={voiceEnabled} />
        </div>
        {isSpeaking && (
          <div className="mt-1 text-xs text-white/80 flex items-center gap-1">
            <Volume2 className="w-3 h-3 animate-pulse" />
            <span>{t('speaking')} {wordProgress}</span>
          </div>
        )}
        <div className="mt-1 text-xs text-white/60 text-right">{t('language')}: {recognitionLanguage}</div>
      </div>

      {/* Question Display – enlarged */}
      {currentStep === "configuring" && visibleQuestions.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 shadow-xl border-2 border-green-300 min-h-[300px]">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center font-bold">
              {debugInfo.currentQuestion}
            </span>
            <h4 className="font-bold text-xl text-emerald-800">
              {t('question_x_of_y', { current: debugInfo.currentQuestion, total: visibleQuestions.length })}
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
                {isStreaming ? t('speaking_dots') : t('ready_for_answer')}
              </p>
            )}
          </div>

          {!isStreaming && streamingQuestion && (
            <div className="mt-6">
              <div className="bg-white rounded-xl border-2 border-purple-200 p-6">
                {renderInput()}

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={submitAnswer}
                    disabled={!userTranscript.trim()}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-2.5 rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {t('submit_answer')}
                  </button>
                  <button
                    onClick={skipQuestion}
                    className="px-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white py-2.5 rounded-xl font-medium"
                  >
                    {t('skip')}
                  </button>
                </div>
              </div>

              {lastSubmittedAnswer && (
                <div className="mt-3 p-3 bg-blue-50 rounded-xl border-2 border-blue-200">
                  <p className="text-sm text-blue-800 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                    {t('your_answer')}: <span className="font-bold text-blue-900">{lastSubmittedAnswer}</span>
                  </p>
                  <p className="text-xs text-blue-600 mt-1">{t('voice_confirmation_sent')}</p>
                </div>
              )}

              {debugInfo.isListening && (
                <div className="mt-3 p-3 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-red-600">{t('listening_speak_now')}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Stop Button */}
      {(currentStep === "configuring" || currentStep === "generating") && (
        <button onClick={stopEverything} className="px-5 py-3 bg-gradient-to-r from-rose-500 to-red-500 text-white rounded-xl mx-auto w-48 font-medium flex items-center justify-center gap-2">
          <span>{t('stop_setup')}</span>
        </button>
      )}
    </div>
  );
};

export default CreateInterviewAgent;