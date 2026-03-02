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

interface CreateInterviewAgentProps {
  userName: string;
  userId?: string;
  profileImage?: string;
}

const CreateInterviewAgent = ({
  userName,
  userId,
  profileImage
}: CreateInterviewAgentProps) => {
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userTranscript, setUserTranscript] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);

  const [currentStep, setCurrentStep] = useState<"idle" | "configuring" | "generating" | "redirecting" | "error">("idle");
  const [configStep, setConfigStep] = useState(0);

  // Karaoke streaming for questions
  const [streamingQuestion, setStreamingQuestion] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const questionWordsRef = useRef<string[]>([]);

  // 🌱 COMPREHENSIVE Farmer details state - ALL 100+ QUESTIONS
  const [farmerDetails, setFarmerDetails] = useState({
    // SECTION 1: Personal & Location Information
    farmerName: "",
    phoneNumber: "",
    subCounty: "",
    ward: "",
    village: "",
    altitude: "",
    annualRainfall: "",

    // SECTION 2: Farm Overview
    totalFarmSize: "",
    cultivatedAcres: "",
    soilType: "",
    soilTested: "",
    waterSources: "",

    // SECTION 3: Crops Grown
    crops: "",
    cropVarieties: "",
    cropAcres: "",
    plantingDate: "",
    harvestDate: "",
    seedSource: "",
    spacing: "",
    seedRate: "",
    usePlantingFertilizer: "",
    plantingFertilizerType: "",
    plantingFertilizerQuantity: "",
    noPlantingFertilizerReason: "",
    useTopdressingFertilizer: "",
    topdressingFertilizerType: "",
    topdressingFertilizerQuantity: "",
    noTopdressingFertilizerReason: "",
    commonPests: "",
    pestControlMethod: "",
    commonDiseases: "",
    diseaseControlMethod: "",
    actualYield: "",
    yieldUnit: "bags",
    storageMethod: "",

    // SECTION 4: Financial Information
    dapCost: "",
    canCost: "",
    npkCost: "",
    dailyWageRate: "",
    ploughingCost: "",
    plantingLabourCost: "",
    weedingCost: "",
    harvestingCost: "",
    maizePrice: "",
    beansPrice: "",
    buyerType: "",
    transportCostPerBag: "",

    // SECTION 5: Infrastructure & Access
    roadAccess: "",
    marketDistance: "",
    creditAccess: "",
    supportPrograms: "",

    // SECTION 6: Livestock Enterprises
    livestockTypes: "",
    cattleBreed: "",
    milkYield: "",
    calvingRate: "",
    feedingSystem: "",
    poultryType: "",
    birdCount: "",
    eggProduction: "",
    mortalityRate: "",

    // SECTION 7: Post-Harvest & Value Addition
    postHarvestPractices: "",
    postHarvestLosses: "",
    valueAddition: "",
    bagCost: "",
    storageAccess: "",

    // SECTION 8: Challenges & Support
    productionChallenges: "",
    marketingChallenges: "",
    experience: "",
    mainChallenge: "",

    // SECTION 9: Management Level
    managementLevel: "",

    // ========== SOIL TEST SECTION ==========
    hasDoneSoilTest: "",
    soilTestDate: "",

    // pH
    soilTestPH: "",
    soilTestPHRating: "",

    // Phosphorus
    soilTestP: "",
    soilTestPRating: "",

    // Potassium
    soilTestK: "",
    soilTestKRating: "",

    // Calcium
    soilTestCa: "",
    soilTestCaRating: "",

    // Magnesium
    soilTestMg: "",
    soilTestMgRating: "",

    // Sodium
    soilTestNa: "",
    soilTestNaRating: "",

    // Total Nitrogen
    soilTestNPercent: "",
    soilTestNPercentRating: "",

    // Organic Carbon
    soilTestOC: "",
    soilTestOCRating: "",

    // Organic Matter
    soilTestOM: "",
    soilTestOMRating: "",

    // CEC
    soilTestCEC: "",
    soilTestCECRating: "",

    // Target Yield
    targetYield: "",

    // Fertilizer Selection
    availablePlantingFertilizers: "",
    availableTopDressingFertilizers: "",

    // Original fields kept for backward compatibility
    season: "",
    county: "",
    cropOfInterest: "",
    acres: "",
    previousCrop: "",
    averageHarvest: "",
    harvestUnit: "bags",
    organicManure: "",
    terracing: "",
    mulching: "",
    coverCrops: "",
    rainwaterHarvesting: "",
    contourFarming: "",
    useCertifiedSeed: "",
    certifiedSeedReason: "",
    seedQuantity: "",
    cattle: "",
    cattleType: "",
    milkProduction: "",
    otherLivestock: "",
    smartphone: "",
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

  // COMPREHENSIVE Configuration questions - ALL 100+ QUESTIONS
  const configQuestions = [
    // ========== SECTION 1: Personal & Location Information ==========
    { id: "farmerName", question: "What is your name?", type: "text", section: "Personal Info" },
    { id: "phoneNumber", question: "What is your phone number for alerts?", type: "tel", placeholder: "e.g., 0712345678", section: "Personal Info" },
    { id: "county", question: "What county are you in?", type: "text", section: "Location" },
    { id: "subCounty", question: "Which sub-county or district?", type: "text", section: "Location" },
    { id: "ward", question: "Which ward do you belong to?", type: "text", section: "Location" },
    { id: "village", question: "Which village?", type: "text", section: "Location" },
    { id: "altitude", question: "What is your approximate altitude above sea level? (in meters)", type: "dropdown", options: ["Below 1200m", "1200-1500m", "1500-1800m", "Above 1800m"], section: "Climate" },
    { id: "annualRainfall", question: "What is your typical annual rainfall range?", type: "dropdown", options: ["Below 1000mm", "1000-1200mm", "1200-1500mm", "1500-1800mm", "Above 1800mm"], section: "Climate" },

    // ========== SECTION 2: Farm Overview ==========
    { id: "totalFarmSize", question: "What is your total farm size? (in acres)", type: "number", section: "Farm Overview" },
    { id: "cultivatedAcres", question: "How many acres do you currently cultivate?", type: "number", section: "Farm Overview" },
    { id: "soilType", question: "What type of soil do you have? Clay, loam, sandy, or not sure?", type: "dropdown", options: ["clay", "loam", "sandy", "clay loam", "sandy loam", "not sure"], section: "Soil" },
    { id: "soilTested", question: "Have you ever done comprehensive soil testing?", type: "dropdown", options: ["yes", "no"], section: "Soil" },
    { id: "waterSources", question: "What are your main water sources? (Select all that apply - river, spring, borehole, well, piped, rainwater)", type: "text", section: "Water" },

    // ========== SECTION 3: Crops Grown ==========
    { id: "crops", question: "What crops do you grow? For example: maize, beans, coffee, or vegetables.", type: "dropdown", options: ["maize", "beans", "coffee", "vegetables", "wheat", "sorghum", "millet", "groundnuts", "cassava", "sweet potatoes", "irish potatoes", "bananas", "other"], section: "Crops" },
    { id: "cropVarieties", question: "Which varieties of your main crop do you grow?", type: "text", section: "Crops" },
    { id: "cropAcres", question: "How many acres of your main crop are you planting?", type: "number", section: "Crops" },
    { id: "season", question: "Which season are you planting for? Long rains, short rains, or dry season?", type: "dropdown", options: ["long rains", "short rains", "dry season"], section: "Crops" },
    { id: "plantingDate", question: "When do you typically plant your main crop?", type: "text", section: "Crops" },
    { id: "harvestDate", question: "When do you typically harvest your main crop?", type: "text", section: "Crops" },
    { id: "previousCrop", question: "What was your previous crop in this field?", type: "dropdown", options: ["maize", "beans", "coffee", "vegetables", "wheat", "sorghum", "millet", "fallow", "other"], section: "Crops" },
    { id: "cropOfInterest", question: "Which crop are you most interested in learning about?", type: "dropdown", options: ["maize", "beans", "coffee", "vegetables", "wheat", "sorghum", "millet", "all"], section: "Crops" },
    { id: "seedSource", question: "Where do you get your seeds from?", type: "dropdown", options: ["Certified seed dealer", "Farm-saved seed", "Local market", "Neighbors", "Agrovet"], section: "Seeds" },
    { id: "spacing", question: "What spacing do you use for your main crop? (e.g., 75cm x 25cm)", type: "text", section: "Planting" },
    { id: "seedRate", question: "What seed rate do you use? (kg per acre)", type: "number", section: "Seeds" },
    { id: "useCertifiedSeed", question: "Do you use certified seed?", type: "dropdown", options: ["yes", "no"], section: "Seeds" },
    { id: "certifiedSeedReason", question: "If no certified seed, why not? Too expensive, not available, or other? If yes, say 'not applicable'.", type: "dropdown", options: ["too expensive", "not available", "other", "not applicable"], section: "Seeds" },

    // Fertilizer - Planting
    { id: "usePlantingFertilizer", question: "Do you use planting fertilizer? Say yes or no.", type: "dropdown", options: ["yes", "no"], section: "Fertilizer" },
    { id: "plantingFertilizerType", question: "If yes, what type? For example: DAP or NPK. If no, say 'not applicable'.", type: "dropdown", options: ["DAP", "NPK", "CAN", "UREA", "TSP", "not applicable"], section: "Fertilizer" },
    { id: "plantingFertilizerQuantity", question: "How many kilograms per acre? If no, say zero.", type: "number", section: "Fertilizer" },
    { id: "noPlantingFertilizerReason", question: "If no fertilizer, what's the main reason? Cost, availability, other?", type: "text", section: "Fertilizer" },

    // Fertilizer - Topdressing
    { id: "useTopdressingFertilizer", question: "Do you use topdressing fertilizer? Say yes or no.", type: "dropdown", options: ["yes", "no"], section: "Fertilizer" },
    { id: "topdressingFertilizerType", question: "If yes, what type? For example: CAN or Urea. If no, say 'not applicable'.", type: "dropdown", options: ["CAN", "UREA", "NPK", "not applicable"], section: "Fertilizer" },
    { id: "topdressingFertilizerQuantity", question: "How many kilograms per acre? If no, say zero.", type: "number", section: "Fertilizer" },
    { id: "noTopdressingFertilizerReason", question: "If no topdressing, what's the main reason?", type: "text", section: "Fertilizer" },

    // Pests & Diseases
    { id: "commonPests", question: "What are the most common pests affecting your crops?", type: "text", section: "Pests" },
    { id: "pestControlMethod", question: "What pest control methods do you use?", type: "text", section: "Pests" },
    { id: "commonDiseases", question: "What are the most common diseases affecting your crops?", type: "text", section: "Diseases" },
    { id: "diseaseControlMethod", question: "What disease control methods do you use?", type: "text", section: "Diseases" },

    // Production
    { id: "averageHarvest", question: "What is your average harvest per acre? For example: 15 bags.", type: "text", section: "Production" },
    { id: "harvestUnit", question: "What unit do you use? Bags, kg, or tonnes?", type: "dropdown", options: ["bags", "kg", "tonnes"], section: "Production" },
    { id: "actualYield", question: "What was your actual yield last season? (number only)", type: "number", section: "Production" },
    { id: "yieldUnit", question: "Unit for actual yield? Bags, kg, tonnes?", type: "dropdown", options: ["bags", "kg", "tonnes"], section: "Production" },
    { id: "storageMethod", question: "How do you store your harvested crop? Gunny bags, silos, traditional?", type: "text", section: "Storage" },

    // Soil & Organic
    { id: "organicManure", question: "Do you use organic manure? Say yes or no.", type: "dropdown", options: ["yes", "no"], section: "Soil" },

    // ========== SECTION 4: Financial Information ==========
    { id: "dapCost", question: "How much do you pay for a 50kg bag of DAP fertilizer? (in Ksh)", type: "number", section: "Finance" },
    { id: "canCost", question: "How much do you pay for a 50kg bag of CAN fertilizer? (in Ksh)", type: "number", section: "Finance" },
    { id: "npkCost", question: "How much do you pay for a 50kg bag of NPK fertilizer? (in Ksh)", type: "number", section: "Finance" },
    { id: "dailyWageRate", question: "What is the daily wage rate for farm workers in your area? (in Ksh)", type: "number", section: "Finance" },
    { id: "ploughingCost", question: "How much do you pay for ploughing per acre? (in Ksh)", type: "number", section: "Finance" },
    { id: "plantingLabourCost", question: "How much do you pay for planting labour per acre? (in Ksh)", type: "number", section: "Finance" },
    { id: "weedingCost", question: "How much do you pay for weeding per acre? (in Ksh)", type: "number", section: "Finance" },
    { id: "harvestingCost", question: "How much do you pay for harvesting per acre? (in Ksh)", type: "number", section: "Finance" },
    { id: "maizePrice", question: "What price do you get per 90kg bag of maize? (in Ksh)", type: "number", section: "Finance" },
    { id: "beansPrice", question: "What price do you get per 90kg bag of beans? (in Ksh)", type: "number", section: "Finance" },
    { id: "buyerType", question: "Who do you sell your produce to? NCPB, local traders, consumers, cooperatives?", type: "text", section: "Finance" },
    { id: "transportCostPerBag", question: "How much does it cost to transport one bag to market? (in Ksh)", type: "number", section: "Finance" },
    { id: "bagCost", question: "How much do you pay for empty gunny bags? (per bag in Ksh)", type: "number", section: "Finance" },

    // ========== SECTION 5: Infrastructure & Access ==========
    { id: "roadAccess", question: "How would you describe your road access to market? All-weather, seasonal, footpath only?", type: "dropdown", options: ["All-weather road", "Seasonal earth road", "Footpath only", "Poor access"], section: "Infrastructure" },
    { id: "marketDistance", question: "What is the distance to your nearest market? (in km)", type: "number", section: "Infrastructure" },
    { id: "creditAccess", question: "Do you have access to agricultural credit? (AFC, bank, micro-finance, table banking, none)", type: "text", section: "Finance" },
    { id: "supportPrograms", question: "Are you part of any agricultural support programs? (crop insurance, NAAIAP, ASDSP, cooperative, none)", type: "text", section: "Support" },
    { id: "smartphone", question: "Can you access a smartphone? Say yes or no.", type: "dropdown", options: ["yes", "no"], section: "Technology" },

    // ========== SECTION 6: Livestock Enterprises ==========
    { id: "livestockTypes", question: "Which livestock do you keep? (dairy, beef, goats, sheep, poultry, bees, pigs, none)", type: "text", section: "Livestock" },
    { id: "cattle", question: "How many cattle do you have? Say zero if none.", type: "number", section: "Livestock" },
    { id: "cattleBreed", question: "If you have cattle, are they Friesian, Ayrshire, Jersey, crosses, or local?", type: "dropdown", options: ["Friesian", "Ayrshire", "Jersey", "Crosses", "Local Zebu", "none"], section: "Livestock" },
    { id: "cattleType", question: "Cattle type: hybrid, local, or mixed? If none, say 'none'.", type: "dropdown", options: ["hybrid", "local", "mixed", "none"], section: "Livestock" },
    { id: "milkYield", question: "Average milk yield per cow per day? (litres)", type: "number", section: "Livestock" },
    { id: "milkProduction", question: "Total milk production per day? (litres)", type: "number", section: "Livestock" },
    { id: "calvingRate", question: "How many calves per cow per year? (one every 2 years, one per year, two per year)", type: "dropdown", options: ["One every 2 years", "One per year", "Two per year"], section: "Livestock" },
    { id: "feedingSystem", question: "What feeding system do you use? Zero grazing, semi-zero, free range, tethering?", type: "dropdown", options: ["Zero grazing", "Semi-zero grazing", "Free range", "Tethering"], section: "Livestock" },
    { id: "poultryType", question: "What type of poultry do you keep? Layers, broilers, indigenous, mixed?", type: "dropdown", options: ["Layers", "Broilers", "Indigenous", "Mixed", "None"], section: "Livestock" },
    { id: "birdCount", question: "How many birds do you have?", type: "number", section: "Livestock" },
    { id: "eggProduction", question: "Average eggs per bird per year? (for layers)", type: "number", section: "Livestock" },
    { id: "mortalityRate", question: "What is your typical poultry mortality rate? (percentage)", type: "number", section: "Livestock" },
    { id: "otherLivestock", question: "Do you have other livestock like goats or chickens? Specify", type: "text", section: "Livestock" },

    // ========== SECTION 7: Post-Harvest & Value Addition ==========
    { id: "postHarvestPractices", question: "What post-harvest practices do you use? Drying, threshing, shelling, grading?", type: "text", section: "Post-Harvest" },
    { id: "postHarvestLosses", question: "What percentage of your harvest is lost post-harvest? (less than 5%, 5-10%, 10-20%, more)", type: "dropdown", options: ["Less than 5%", "5-10%", "10-20%", "More than 20%"], section: "Post-Harvest" },
    { id: "valueAddition", question: "Do you add value to your produce before selling? Drying, milling, grading, packaging, processing?", type: "text", section: "Post-Harvest" },
    { id: "storageAccess", question: "Do you have access to storage facilities? Yes or no.", type: "dropdown", options: ["yes", "no"], section: "Storage" },

    // ========== SECTION 8: Challenges & Support ==========
    { id: "productionChallenges", question: "What are your main production challenges? Pests, diseases, drought, floods, poor soil, high costs, labor?", type: "text", section: "Challenges" },
    { id: "marketingChallenges", question: "What are your main marketing challenges? Low prices, transport, lack of information, brokers, storage?", type: "text", section: "Challenges" },
    { id: "experience", question: "How many years of farming experience do you have?", type: "number", section: "Profile" },
    { id: "mainChallenge", question: "What is your biggest farming challenge? Pests, disease, market, water, or other?", type: "dropdown", options: ["pests", "disease", "market", "water", "other"], section: "Challenges" },

    // ========== SECTION 9: Conservation & Management ==========
    { id: "terracing", question: "Do you use terracing? Say yes or no.", type: "dropdown", options: ["yes", "no"], section: "Conservation" },
    { id: "mulching", question: "Do you use mulching? Say yes or no.", type: "dropdown", options: ["yes", "no"], section: "Conservation" },
    { id: "coverCrops", question: "Do you use cover crops? Say yes or no.", type: "dropdown", options: ["yes", "no"], section: "Conservation" },
    { id: "rainwaterHarvesting", question: "Do you practice rainwater harvesting? Say yes or no.", type: "dropdown", options: ["yes", "no"], section: "Conservation" },
    { id: "contourFarming", question: "Do you use contour farming? Say yes or no.", type: "dropdown", options: ["yes", "no"], section: "Conservation" },
    { id: "managementLevel", question: "How would you describe your current farming practices? Low input (minimal fertilizer), Medium input (some fertilizer), or High input (full recommendations)?", type: "dropdown", options: ["Low input", "Medium input", "High input"], section: "Management" },

    // ========== SECTION 10: SOIL TEST SECTION ==========
    { id: "hasDoneSoilTest", question: "Have you done a comprehensive soil test?", type: "dropdown", options: ["Yes", "No"], section: "Soil Test" },
    { id: "soilTestDate", question: "When was your soil test done? Please select the date from the calendar.", type: "date", placeholder: "Click to select date", minDate: "2020-01-01", maxDate: new Date().toISOString().split('T')[0], dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, section: "Soil Test" },

    // pH
    { id: "soilTestPH", question: "What is your soil pH (H₂O) value? (e.g., 6.2)", type: "number", placeholder: "e.g., 6.2", min: 0, max: 14, step: 0.1, dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, section: "Soil Test" },
    { id: "soilTestPHRating", question: "Based on your soil test report, is your pH level?", type: "dropdown", options: ["Very Low", "Low", "Optimum", "High", "Very High"], dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, section: "Soil Test" },

    // Phosphorus
    { id: "soilTestP", question: "What is your soil Phosphorus (P) value in ppm? (e.g., 24)", type: "number", placeholder: "e.g., 24", min: 0, dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, section: "Soil Test" },
    { id: "soilTestPRating", question: "Based on your soil test report, is your Phosphorus level?", type: "dropdown", options: ["Very Low", "Low", "Optimum", "High", "Very High"], dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, section: "Soil Test" },

    // Potassium
    { id: "soilTestK", question: "What is your soil Potassium (K) value in ppm? (e.g., 180)", type: "number", placeholder: "e.g., 180", min: 0, dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, section: "Soil Test" },
    { id: "soilTestKRating", question: "Based on your soil test report, is your Potassium level?", type: "dropdown", options: ["Very Low", "Low", "Optimum", "High", "Very High"], dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, section: "Soil Test" },

    // Calcium
    { id: "soilTestCa", question: "What is your soil Calcium (Ca) value in ppm? (e.g., 800)", type: "number", placeholder: "e.g., 800", min: 0, dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, section: "Soil Test" },
    { id: "soilTestCaRating", question: "Based on your soil test report, is your Calcium level?", type: "dropdown", options: ["Very Low", "Low", "Optimum", "High", "Very High"], dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, section: "Soil Test" },

    // Magnesium
    { id: "soilTestMg", question: "What is your soil Magnesium (Mg) value in ppm? (e.g., 120)", type: "number", placeholder: "e.g., 120", min: 0, dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, section: "Soil Test" },
    { id: "soilTestMgRating", question: "Based on your soil test report, is your Magnesium level?", type: "dropdown", options: ["Very Low", "Low", "Optimum", "High", "Very High"], dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, section: "Soil Test" },

    // Sodium
    { id: "soilTestNa", question: "What is your soil Sodium (Na) value in ppm? (e.g., 50)", type: "number", placeholder: "e.g., 50", min: 0, dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, section: "Soil Test" },
    { id: "soilTestNaRating", question: "Based on your soil test report, is your Sodium level?", type: "dropdown", options: ["Very Low", "Low", "Optimum", "High", "Very High"], dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, section: "Soil Test" },

    // Total Nitrogen
    { id: "soilTestNPercent", question: "What is your soil Total Nitrogen (N) value in percentage (%)? (e.g., 0.15)", type: "number", placeholder: "e.g., 0.15", min: 0, max: 5, step: 0.01, dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, section: "Soil Test" },
    { id: "soilTestNPercentRating", question: "Based on your soil test report, is your Total Nitrogen level?", type: "dropdown", options: ["Very Low", "Low", "Optimum", "High", "Very High"], dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, section: "Soil Test" },

    // Organic Carbon
    { id: "soilTestOC", question: "What is your soil Organic Carbon (OC) value in percentage (%)? (e.g., 1.2)", type: "number", placeholder: "e.g., 1.2", min: 0, max: 10, step: 0.1, dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, section: "Soil Test" },
    { id: "soilTestOCRating", question: "Based on your soil test report, is your Organic Carbon level?", type: "dropdown", options: ["Very Low", "Low", "Optimum", "High", "Very High"], dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, section: "Soil Test" },

    // Organic Matter
    { id: "soilTestOM", question: "What is your soil Organic Matter (OM) value in percentage (%)? (e.g., 2.1)", type: "number", placeholder: "e.g., 2.1", min: 0, max: 20, step: 0.1, dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, section: "Soil Test" },
    { id: "soilTestOMRating", question: "Based on your soil test report, is your Organic Matter level?", type: "dropdown", options: ["Very Low", "Low", "Optimum", "High", "Very High"], dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, section: "Soil Test" },

    // CEC
    { id: "soilTestCEC", question: "What is your soil Cation Exchange Capacity (CEC) value in meq/100g? (e.g., 12.5)", type: "number", placeholder: "e.g., 12.5", min: 0, max: 50, step: 0.1, dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, section: "Soil Test" },
    { id: "soilTestCECRating", question: "Based on your soil test report, is your CEC level?", type: "dropdown", options: ["Very Low", "Low", "Optimum", "High", "Very High"], dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, section: "Soil Test" },

    // Target Yield
    { id: "targetYield", question: "What is your target yield per acre? (in bags)", type: "number", placeholder: "e.g., 40", min: 0, dependsOn: { field: "hasDoneSoilTest", value: "Yes" }, section: "Fertilizer Planning" },

    // Available Planting Fertilizers
    {
      id: "availablePlantingFertilizers",
      question: "Which PLANTING fertilizers are available in your market? (Select all that apply)",
      type: "multiselect",
      options: plantingFertilizers.map(f => ({
        value: f.id,
        label: `${f.brand} (${f.npk}) - ${f.company}`
      })),
      dependsOn: { field: "hasDoneSoilTest", value: "Yes" },
      section: "Fertilizer Selection"
    },

    // Available Top Dressing Fertilizers
    {
      id: "availableTopDressingFertilizers",
      question: "Which TOP DRESSING fertilizers are available in your market? (Select all that apply)",
      type: "multiselect",
      options: topDressingFertilizers.map(f => ({
        value: f.id,
        label: `${f.brand} (${f.npk}) - ${f.company}`
      })),
      dependsOn: { field: "hasDoneSoilTest", value: "Yes" },
      section: "Fertilizer Selection"
    }
  ];

  // Initialize voice
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

    // Initialize speech recognition
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.timeout = 15000;
      recognitionRef.current.nospeech_timeout = 15000;

      recognitionRef.current.onresult = (event: any) => {
        console.log("Speech recognition result received");
        retryCountRef.current = 0;

        if (isRecognitionActiveRef.current) {
          isRecognitionActiveRef.current = false;
          setDebugInfo(prev => ({ ...prev, isListening: false }));
        }

        const transcript = event.results[0][0].transcript;
        console.log("Voice input:", transcript);
        setUserTranscript(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);

        if (isRecognitionActiveRef.current) {
          isRecognitionActiveRef.current = false;
          setDebugInfo(prev => ({ ...prev, isListening: false }));
        }

        if (event.error === 'no-speech') {
          retryCountRef.current++;
          if (retryCountRef.current <= maxRetries) {
            toast.info(`No speech detected. Please speak. Retry ${retryCountRef.current}/${maxRetries}`);
            setTimeout(() => safeStartListening(), 2000);
          } else {
            toast.error("No speech detected after multiple attempts.");
            setCurrentStep("idle");
            retryCountRef.current = 0;
          }
        } else if (event.error === 'not-allowed') {
          toast.error("Microphone access denied. Please allow microphone access.");
        } else {
          toast.error(`Voice error: ${event.error}. Please try again.`);
        }
      };

      recognitionRef.current.onend = () => {
        if (isRecognitionActiveRef.current) {
          isRecognitionActiveRef.current = false;
          setDebugInfo(prev => ({ ...prev, isListening: false }));
        }
      };

      recognitionRef.current.onstart = () => {
        console.log("Speech recognition started");
        isRecognitionActiveRef.current = true;
        setDebugInfo(prev => ({ ...prev, isListening: true }));
        retryCountRef.current = 0;
      };
    }

    return () => {
      if (recognitionRef.current && isRecognitionActiveRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.error("Error stopping recognition on cleanup:", error);
        }
      }
    };
  }, [currentStep]);

  // ============ KARAOKE STREAMING FOR QUESTIONS ============
  const streamQuestionWithVoice = async (fullText: string) => {
    if (!voiceEnabled || !window.speechSynthesis) {
      setStreamingQuestion(fullText);
      return;
    }

    setIsStreaming(true);
    setStreamingQuestion("");
    setCurrentWordIndex(0);

    const words = fullText.split(' ');
    questionWordsRef.current = words;

    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.volume = 1.0;

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

      // Start listening after question is done
      setTimeout(() => safeStartListening(), 500);
    };

    utterance.onerror = (event) => {
      console.error("Speech error:", event);
      setStreamingQuestion(fullText);
      setIsStreaming(false);
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  // ============ VOICE ACKNOWLEDGMENT ============
  const speakAcknowledgment = async (answer: string, fieldId: string) => {
    let acknowledgment = "";

    // Custom acknowledgments based on field
    if (fieldId === "county" || fieldId === "subCounty" || fieldId === "village") {
      acknowledgment = `Got it, you are from ${answer}. `;
    } else if (fieldId === "crops") {
      acknowledgment = `Cool, you grow ${answer}. `;
    } else if (fieldId === "acres" || fieldId === "cultivatedAcres" || fieldId === "totalFarmSize") {
      acknowledgment = `${answer} acres, nice! `;
    } else if (fieldId.includes("fertilizer")) {
      acknowledgment = `Fertilizer: ${answer}. `;
    } else if (fieldId === "cattle" || fieldId === "cattleBreed" || fieldId === "milkYield") {
      if (answer === "0" || answer === "none") {
        acknowledgment = `No cattle, okay. `;
      } else {
        acknowledgment = `${answer} for cattle, great! `;
      }
    } else if (fieldId.includes("Cost") || fieldId.includes("Price")) {
      acknowledgment = `${answer} Ksh, noted. `;
    } else if (fieldId.includes("soilTest")) {
      acknowledgment = `Soil test: ${answer}. `;
    } else {
      acknowledgment = `Got it, ${answer}. `;
    }

    await voiceAssistantRef.current?.speak(acknowledgment);
  };

  // Initialize voice assistant with streaming
  useEffect(() => {
    if (!voiceEnabled) {
      voiceAssistantRef.current = null;
      return;
    }

    voiceAssistantRef.current = {
      speak: async (text: string) => {
        return streamQuestionWithVoice(text);
      }
    };

    toast.success("🎤 Voice assistant ready!");
  }, [voiceEnabled]);

  const handleVoiceToggle = (enabled: boolean) => {
    setVoiceEnabled(enabled);

    if (enabled) {
      toast.success("Voice mode activated!");
      setDebugInfo(prev => ({ ...prev, callStatus: "READY" }));
    } else {
      toast.info("Voice mode disabled");
      setDebugInfo(prev => ({
        ...prev,
        callStatus: "INACTIVE",
        isListening: false
      }));
    }
  };

  // ============ ENHANCED PROCESS ANSWER WITH CLEANING ============
  const processAnswer = async (answer: string) => {
    console.log("Processing answer:", answer);

    if (currentStep === "configuring") {
      const currentConfig = configQuestions[configStep];

      // Clean the answer - remove any question text that might be included
      let cleanAnswer = answer;

      // If the answer contains a question mark, split and take the last part
      if (answer.includes('?')) {
        const parts = answer.split('?');
        cleanAnswer = parts[parts.length - 1].trim();
      }

      // List of common question phrases to remove
      const questionPhrases = [
        "what county are you in",
        "which sub county or district",
        "which ward do you belong to",
        "which village",
        "what crops do you grow",
        "which varieties of your main crop",
        "how many acres of your main crop",
        "which season are you planting for",
        "when do you typically plant",
        "when do you typically harvest",
        "what was your previous crop",
        "which crop are you most interested in",
        "where do you get your seeds from",
        "what spacing do you use",
        "what seed rate do you use",
        "do you use certified seed",
        "if no certified seed why not",
        "do you use planting fertilizer",
        "if yes what type",
        "how many kilograms per acre",
        "if no fertilizer what's the main reason",
        "do you use topdressing fertilizer",
        "what are the most common pests",
        "what pest control methods do you use",
        "what are the most common diseases",
        "what disease control methods do you use",
        "what is your average harvest",
        "what unit do you use",
        "what was your actual yield",
        "unit for actual yield",
        "how do you store your harvested crop",
        "do you use organic manure",
        "how much do you pay for a 50kg bag of dap",
        "how much do you pay for a 50kg bag of can",
        "how much do you pay for a 50kg bag of npk",
        "what is the daily wage rate",
        "how much do you pay for ploughing",
        "how much do you pay for planting labour",
        "how much do you pay for weeding",
        "how much do you pay for harvesting",
        "what price do you get per 90kg bag of maize",
        "what price do you get per 90kg bag of beans",
        "who do you sell your produce to",
        "how much does it cost to transport",
        "how much do you pay for empty gunny bags",
        "how would you describe your road access",
        "what is the distance to your nearest market",
        "do you have access to agricultural credit",
        "are you part of any agricultural support programs",
        "can you access a smartphone",
        "which livestock do you keep",
        "how many cattle do you have",
        "if you have cattle are they friesian",
        "cattle type hybrid local or mixed",
        "average milk yield per cow per day",
        "total milk production per day",
        "how many calves per cow per year",
        "what feeding system do you use",
        "what type of poultry do you keep",
        "how many birds do you have",
        "average eggs per bird per year",
        "what is your typical poultry mortality rate",
        "do you have other livestock",
        "what post harvest practices do you use",
        "what percentage of your harvest is lost",
        "do you add value to your produce",
        "do you have access to storage facilities",
        "what are your main production challenges",
        "what are your main marketing challenges",
        "how many years of farming experience",
        "what is your biggest farming challenge",
        "do you use terracing",
        "do you use mulching",
        "do you use cover crops",
        "do you practice rainwater harvesting",
        "do you use contour farming",
        "how would you describe your current farming practices",
        "have you done a comprehensive soil test",
        "when was your soil test done",
        "what is your soil ph value",
        "based on your soil test report is your ph level",
        "what is your soil phosphorus value",
        "based on your soil test report is your phosphorus level",
        "what is your soil potassium value",
        "based on your soil test report is your potassium level",
        "what is your soil calcium value",
        "based on your soil test report is your calcium level",
        "what is your soil magnesium value",
        "based on your soil test report is your magnesium level",
        "what is your soil sodium value",
        "based on your soil test report is your sodium level",
        "what is your soil total nitrogen value",
        "based on your soil test report is your total nitrogen level",
        "what is your soil organic carbon value",
        "based on your soil test report is your organic carbon level",
        "what is your soil organic matter value",
        "based on your soil test report is your organic matter level",
        "what is your soil cec value",
        "based on your soil test report is your cec level",
        "what is your target yield per acre",
        "which planting fertilizers are available",
        "which top dressing fertilizers are available"
      ];

      // Remove any question phrases from the answer
      for (const phrase of questionPhrases) {
        const regex = new RegExp(phrase, 'gi');
        cleanAnswer = cleanAnswer.replace(regex, '').trim();
      }

      // Remove any leading punctuation or spaces
      cleanAnswer = cleanAnswer.replace(/^[?:,\s]+/, '').replace(/[?:,\s]+$/, '');

      // Handle number fields
      if (currentConfig.type === "number") {
        const numbers = cleanAnswer.match(/\d+/g);
        if (numbers) {
          cleanAnswer = numbers.join('');
        } else {
          cleanAnswer = "0";
        }
      }

      setFarmerDetails(prev => ({
        ...prev,
        [currentConfig.id]: cleanAnswer
      }));

      toast.success(`✅ ${currentConfig.id}: ${cleanAnswer}`);

      // Voice acknowledgment before next question
      await speakAcknowledgment(cleanAnswer, currentConfig.id);

      if (configStep < configQuestions.length - 1) {
        setConfigStep(prev => prev + 1);
        setTimeout(() => askConfigurationQuestion(configStep + 1), 1500);
      } else {
        setCurrentStep("generating");
        generateFarmerSession();
      }
    }
  };

  const safeStartListening = () => {
    if (!recognitionRef.current || isRecognitionActiveRef.current || isSpeaking) {
      console.log("Cannot start listening - already active or speaking");
      return;
    }

    try {
      console.log("Starting speech recognition...");
      recognitionRef.current.start();
      setDebugInfo(prev => ({ ...prev, isListening: true }));
      toast.info("🎤 Listening... Speak now!");
    } catch (error: any) {
      console.error("Failed to start speech recognition:", error);

      if (error.name === 'InvalidStateError') {
        isRecognitionActiveRef.current = false;
        setDebugInfo(prev => ({ ...prev, isListening: false }));

        setTimeout(() => {
          if (!isRecognitionActiveRef.current) {
            safeStartListening();
          }
        }, 500);
      }
    }
  };

  const safeStopListening = () => {
    if (recognitionRef.current && isRecognitionActiveRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error("Error stopping recognition:", error);
      } finally {
        isRecognitionActiveRef.current = false;
        setDebugInfo(prev => ({ ...prev, isListening: false }));
      }
    }
  };

  const startVoiceSetup = async () => {
    if (!voiceEnabled || !voiceAssistantRef.current) {
      toast.error("Please enable voice mode first");
      return;
    }

    console.log("Starting comprehensive farmer voice setup...");

    safeStopListening();
    setCurrentStep("configuring");
    setConfigStep(0);
    setUserTranscript("");

    // Reset all farmer details
    setFarmerDetails({
      farmerName: "", phoneNumber: "", subCounty: "", ward: "", village: "", altitude: "", annualRainfall: "",
      totalFarmSize: "", cultivatedAcres: "", soilType: "", soilTested: "", waterSources: "",
      crops: "", cropVarieties: "", cropAcres: "", plantingDate: "", harvestDate: "", seedSource: "", spacing: "", seedRate: "",
      usePlantingFertilizer: "", plantingFertilizerType: "", plantingFertilizerQuantity: "", noPlantingFertilizerReason: "",
      useTopdressingFertilizer: "", topdressingFertilizerType: "", topdressingFertilizerQuantity: "", noTopdressingFertilizerReason: "",
      commonPests: "", pestControlMethod: "", commonDiseases: "", diseaseControlMethod: "",
      actualYield: "", yieldUnit: "bags", storageMethod: "",
      dapCost: "", canCost: "", npkCost: "", dailyWageRate: "", ploughingCost: "", plantingLabourCost: "", weedingCost: "", harvestingCost: "",
      maizePrice: "", beansPrice: "", buyerType: "", transportCostPerBag: "",
      roadAccess: "", marketDistance: "", creditAccess: "", supportPrograms: "",
      livestockTypes: "", cattleBreed: "", milkYield: "", calvingRate: "", feedingSystem: "",
      poultryType: "", birdCount: "", eggProduction: "", mortalityRate: "",
      postHarvestPractices: "", postHarvestLosses: "", valueAddition: "", bagCost: "", storageAccess: "",
      productionChallenges: "", marketingChallenges: "", experience: "", mainChallenge: "",
      managementLevel: "",

      // NEW SOIL TEST FIELDS
      hasDoneSoilTest: "",
      soilTestDate: "",
      soilTestPH: "",
      soilTestPHRating: "",
      soilTestP: "",
      soilTestPRating: "",
      soilTestK: "",
      soilTestKRating: "",
      soilTestCa: "",
      soilTestCaRating: "",
      soilTestMg: "",
      soilTestMgRating: "",
      soilTestNa: "",
      soilTestNaRating: "",
      soilTestNPercent: "",
      soilTestNPercentRating: "",
      soilTestOC: "",
      soilTestOCRating: "",
      soilTestOM: "",
      soilTestOMRating: "",
      soilTestCEC: "",
      soilTestCECRating: "",
      targetYield: "",
      availablePlantingFertilizers: "",
      availableTopDressingFertilizers: "",

      // Original fields
      season: "", county: "", cropOfInterest: "", acres: "", previousCrop: "", averageHarvest: "", harvestUnit: "bags",
      organicManure: "", terracing: "", mulching: "", coverCrops: "", rainwaterHarvesting: "", contourFarming: "",
      useCertifiedSeed: "", certifiedSeedReason: "", seedQuantity: "",
      cattle: "", cattleType: "", milkProduction: "", otherLivestock: "", smartphone: "",
    });

    retryCountRef.current = 0;
    setDebugInfo(prev => ({
      ...prev,
      callStatus: "CONFIGURING",
      currentQuestion: 0,
      generatedSessionId: "",
      totalQuestions: configQuestions.length
    }));

    await voiceAssistantRef.current.speak(
      "Welcome farmer! I'll help you set up your complete farm profile by asking you a series of questions about your farm. " +
      "This will help me give you personalized farming advice and financial analysis. " +
      "Please speak clearly after each question. Let's get started!"
    );

    await new Promise(resolve => setTimeout(resolve, 1000));

    askConfigurationQuestion(0);
  };

  const askConfigurationQuestion = async (step: number) => {
    if (!voiceAssistantRef.current || step >= configQuestions.length) return;

    if (isSpeaking) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    const question = configQuestions[step].question;
    console.log("Asking config question", step + 1, "of", configQuestions.length);

    setDebugInfo(prev => ({
      ...prev,
      currentQuestion: step + 1,
      totalQuestions: configQuestions.length
    }));

    await voiceAssistantRef.current.speak(question);
  };

  const generateFarmerSession = async (retryCount = 0) => {
    if (!voiceAssistantRef.current) return;

    setIsLoading(true);
    setDebugInfo(prev => ({ ...prev, callStatus: "GENERATING" }));

    await voiceAssistantRef.current.speak(
      `Thank you farmer for sharing all your farm details! I'm now creating your personalized farming profile and financial analysis. ` +
      `Please wait a moment while I prepare your recommendations.`
    );

    let currentUserId = userId;
    if (!currentUserId) {
      currentUserId = localStorage.getItem('userId') || `user-${Date.now()}`;
      localStorage.setItem('userId', currentUserId);
    }

    try {
      console.log("🌾 Calling comprehensive farmer session API...");

      const response = await fetch("/api/vapi/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...farmerDetails,
          userid: currentUserId
        })
      });

      if (response.status === 429 && retryCount < 3) {
        const retryAfter = response.headers.get('Retry-After') || '60';
        toast.info(`⏳ Rate limit reached. Retrying in ${retryAfter} seconds...`);

        setTimeout(() => {
          generateFarmerSession(retryCount + 1);
        }, parseInt(retryAfter) * 1000);

        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Server returned error:", response.status, errorText);
        throw new Error(`Server error ${response.status}: ${response.statusText}`);
      }

      let data;
      try {
        const text = await response.text();
        console.log("📥 Raw API response:", text.substring(0, 200));

        if (!text || text.trim() === '') {
          throw new Error("Empty response from server");
        }

        data = JSON.parse(text);
      } catch (parseError) {
        console.error("❌ Failed to parse JSON:", parseError);
        throw new Error("Invalid JSON response from server");
      }

      if (!data) {
        throw new Error("No data received from server");
      }

      if (data.success && data.sessionId) {
        console.log(`✅ Got session ID: ${data.sessionId} with ${data.count} recommendations`);

        setDebugInfo(prev => ({
          ...prev,
          generatedSessionId: data.sessionId,
          totalQuestions: data.count,
          callStatus: "REDIRECTING",
        }));

        await voiceAssistantRef.current.speak(
          `Great! I've prepared ${data.count} personalized recommendations and financial analysis for your farm. ` +
          `I'll now take you to the recommendations page.`
        );

        console.log(`✅ Redirecting to recommendations page: /interview/${data.sessionId}`);
        toast.success(`✅ Farm profile created! Check out your recommendations!`);

        setTimeout(() => {
          if (data.sessionId) {
            window.location.href = `/interview/${data.sessionId}`;
          } else {
            window.location.href = '/';
          }
        }, 3000);

        setCurrentStep("redirecting");

      } else {
        const errorMessage = data.error || "Failed to create farm session";
        console.error("❌ API returned error:", errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error("❌ Error creating farm session:", error);

      await voiceAssistantRef.current?.speak(
        "Sorry, there was an error creating your farm profile. Please try again."
      );

      toast.error(`❌ ${error.message || "Unknown error occurred"}`);
      setCurrentStep("error");
      setDebugInfo(prev => ({ ...prev, callStatus: "ERROR" }));
    } finally {
      setIsLoading(false);
    }
  };

  const stopEverything = () => {
    safeStopListening();
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setCurrentStep("idle");
    setStreamingQuestion("");
    setIsStreaming(false);
    retryCountRef.current = 0;
    toast.info("Setup stopped");
  };

  // ============ SKIP QUESTION FUNCTION ============
  const skipQuestion = () => {
    if (currentStep === "configuring") {
      const defaultAnswers = [
        // Personal Info
        "John Farmer", "0712345678", "Kiambu", "Kikuyu", "Ward 1", "Gachie", "1200-1500m", "1000-1200mm",
        // Farm Overview
        "5", "3", "loam", "no", "river, borehole",
        // Crops
        "maize", "H614", "2", "long rains", "March", "August", "beans", "maize", "Agrovet", "75cm x 25cm", "25", "yes", "not applicable",
        // Fertilizer Planting
        "yes", "DAP", "50", "",
        // Fertilizer Topdressing
        "yes", "CAN", "50", "",
        // Pests
        "armyworms, stalk borers", "spraying", "maize streak", "uprooting",
        // Production
        "15", "bags", "15", "bags", "gunny bags",
        // Organic
        "yes",
        // Financial
        "3300", "2500", "3400", "200", "7000", "2000", "2500", "2000", "6750", "10350", "NCPB", "50", "40",
        // Infrastructure
        "All-weather road", "5", "table banking", "ASDSP", "yes",
        // Livestock
        "dairy", "3", "Friesian", "hybrid", "20", "20", "One per year", "Zero grazing", "Layers", "50", "250", "5", "none",
        // Post-Harvest
        "drying, threshing", "5-10%", "grading", "yes",
        // Challenges
        "pests, diseases", "low prices", "10", "pests",
        // Conservation
        "no", "yes", "no", "no", "no", "Medium input",

        // ========== SOIL TEST DEFAULTS ==========
        "Yes", // hasDoneSoilTest
        "2025-01-15", // soilTestDate
        "6.2", // pH
        "Optimum", // pH rating
        "24", // P
        "Optimum", // P rating
        "180", // K
        "Optimum", // K rating
        "800", // Ca
        "Optimum", // Ca rating
        "120", // Mg
        "Optimum", // Mg rating
        "50", // Na
        "Optimum", // Na rating
        "0.15", // N%
        "Optimum", // N rating
        "1.2", // OC
        "Optimum", // OC rating
        "2.1", // OM
        "Optimum", // OM rating
        "12.5", // CEC
        "Optimum", // CEC rating
        "40", // targetYield
        "dap,etg_falcon_urea,ss_can", // planting fertilizers
        "ss_urea,ss_can,interagro_can" // top dressing fertilizers
      ];

      const answer = defaultAnswers[configStep] || "not specified";
      processAnswer(answer);
      toast.info(`⏭️ Using default: ${answer}`);
    }
  };

  const submitAnswer = () => {
    if (userTranscript.trim()) {
      processAnswer(userTranscript);
      setUserTranscript("");
      toast.success("✅ Answer submitted!");
    } else {
      toast.error("Please speak or enter an answer first");
    }
  };

  const handleSelectChange = (fieldId: string, value: string) => {
    processAnswer(value);
  };

  const handleInputChange = (fieldId: string, value: string) => {
    setFarmerDetails(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleInputSubmit = (fieldId: string) => {
    const value = farmerDetails[fieldId as keyof typeof farmerDetails];
    if (value && value.toString().trim()) {
      processAnswer(value.toString());
    } else {
      toast.error("Please enter a value");
    }
  };

  const displayName = userName || farmerDetails.farmerName || "Farmer";
  const userAltText = `${displayName}'s profile picture`;
  const aiAltText = "AI Agricultural Assistant";

  // Word count indicator
  const wordProgress = currentWordIndex > 0 && questionWordsRef.current.length > 0
    ? `${currentWordIndex}/${questionWordsRef.current.length} words`
    : '';

  // Color palette
  const colors = {
    primary: "from-emerald-400 via-teal-400 to-cyan-400",
    secondary: "from-purple-400 via-pink-400 to-rose-400",
    accent: "from-amber-400 via-orange-400 to-red-400",
    success: "from-green-400 via-emerald-400 to-teal-400",
    warning: "from-yellow-400 via-amber-400 to-orange-400",
    info: "from-blue-400 via-indigo-400 to-purple-400",
    background: "bg-gradient-to-br from-slate-50 via-white to-emerald-50",
    card: "bg-white/80 backdrop-blur-sm border border-white/30",
  };

  // Get section name for current question
  const currentSection = configQuestions[configStep]?.section || "";

  // Render input based on type
  const renderInputByType = () => {
    const question = configQuestions[configStep];

    if (question.type === "date") {
      return (
        <div className="relative">
          <input
            type="date"
            value={userTranscript || farmerDetails[question.id as keyof typeof farmerDetails] || ""}
            onChange={(e) => setUserTranscript(e.target.value)}
            min={question.minDate}
            max={question.maxDate}
            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all text-blue-900"
          />
          <Calendar className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
      );
    }

    if (question.type === "dropdown") {
      return (
        <div className="relative">
          <select
            value={userTranscript || farmerDetails[question.id as keyof typeof farmerDetails] || ""}
            onChange={(e) => setUserTranscript(e.target.value)}
            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all text-blue-900 appearance-none"
          >
            <option value="">Select an option</option>
            {question.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
      );
    }

    if (question.type === "multiselect") {
      return (
        <div className="space-y-2 max-h-60 overflow-y-auto p-2 border-2 border-gray-200 rounded-xl">
          {question.options?.map((opt: any) => (
            <label key={opt.value} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                value={opt.value}
                checked={userTranscript.includes(opt.value)}
                onChange={(e) => {
                  const values = userTranscript ? userTranscript.split(',') : [];
                  if (e.target.checked) {
                    values.push(opt.value);
                  } else {
                    const index = values.indexOf(opt.value);
                    if (index > -1) values.splice(index, 1);
                  }
                  setUserTranscript(values.join(','));
                }}
                className="w-4 h-4 text-purple-600"
              />
              <span className="text-sm text-gray-700">{opt.label}</span>
            </label>
          ))}
        </div>
      );
    }

    if (question.type === "number") {
      return (
        <input
          type="number"
          value={userTranscript || farmerDetails[question.id as keyof typeof farmerDetails] || ""}
          onChange={(e) => {
            const value = e.target.value.replace(/[^0-9.]/g, '');
            setUserTranscript(value);
          }}
          placeholder={question.placeholder || "Enter number..."}
          min={question.min}
          max={question.max}
          step={question.step}
          className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all text-blue-900"
        />
      );
    }

    return (
      <input
        type="text"
        value={userTranscript || farmerDetails[question.id as keyof typeof farmerDetails] || ""}
        onChange={(e) => setUserTranscript(e.target.value)}
        placeholder={question.placeholder || "Type answer here..."}
        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all text-blue-900"
      />
    );
  };

  return (
    <div className={`flex flex-col gap-6 p-4 ${colors.background} rounded-2xl min-h-screen`}>
      {/* Header */}
      <div className={`${colors.card} rounded-2xl p-5 shadow-xl border border-emerald-200/50`}>
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-row items-center gap-4">
            <div className="relative">
              <Image
                src={profileImage || "/farmer-avatar.png"}
                alt={userAltText}
                width={48}
                height={48}
                className="rounded-full object-cover size-12 ring-4 ring-emerald-200/50"
              />
              {debugInfo.callStatus === "CONFIGURING" && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white animate-pulse"></span>
              )}
            </div>
            <div>
              <h4 className={`font-bold text-xl bg-gradient-to-r ${colors.primary} bg-clip-text text-transparent`}>
                {displayName}
              </h4>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                Smart Farmer • Complete Profile 🌱
              </p>
              <p className="text-xs text-gray-400">ID: {debugInfo.userId.substring(0, 8)}...</p>
            </div>
          </div>

          <button
            onClick={startVoiceSetup}
            disabled={isLoading || !voiceEnabled || currentStep !== "idle"}
            className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl ${
              voiceEnabled && currentStep === "idle"
                ? `bg-gradient-to-r ${colors.primary} text-white hover:scale-105`
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            } ${isLoading ? 'animate-pulse' : ''}`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating...
              </span>
            ) : currentStep === "redirecting" ? (
              <span className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 animate-pulse" />
                Redirecting...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sprout className="w-5 h-5" />
                Start Complete Farm Setup
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Voice Toggle */}
      <div className={`${colors.card} rounded-2xl p-5 shadow-xl border border-purple-200/50`}>
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-bold text-lg flex items-center gap-2">
            <Mic className="w-5 h-5 text-purple-500" />
            <span className={`bg-gradient-to-r ${colors.secondary} bg-clip-text text-transparent`}>
              Voice Mode
            </span>
          </h4>
          <span className={`text-sm font-medium px-3 py-1.5 rounded-xl ${
            debugInfo.callStatus === "REDIRECTING" ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700' :
            debugInfo.callStatus === "GENERATING" ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700' :
            debugInfo.callStatus === "CONFIGURING" ? 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700' :
            debugInfo.callStatus === "ERROR" ? 'bg-gradient-to-r from-rose-100 to-red-100 text-red-700' :
            'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700'
          }`}>
            {debugInfo.callStatus}
          </span>
        </div>

        <VoiceToggle
          onVoiceToggle={handleVoiceToggle}
          initialEnabled={voiceEnabled}
        />
      </div>

      {/* 🔥 KARAOKE STREAMING QUESTION */}
      {currentStep === "configuring" && (
        <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 rounded-2xl p-6 shadow-xl border-2 border-green-300 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 bg-gradient-to-r ${colors.primary} text-white rounded-xl flex items-center justify-center text-sm font-bold shadow-md`}>
              {debugInfo.currentQuestion}
            </div>
            <div>
              <h4 className="font-bold text-xl text-emerald-800">
                Question {debugInfo.currentQuestion} of {debugInfo.totalQuestions}
              </h4>
              {currentSection && (
                <p className="text-sm text-emerald-600 flex items-center gap-1">
                  <Sprout className="w-3 h-3" />
                  Section: {currentSection}
                </p>
              )}
            </div>
            {isStreaming && (
              <span className="ml-auto flex items-center gap-2 text-emerald-600">
                <Volume2 className="w-5 h-5 animate-pulse" />
                <span className="text-sm">{wordProgress}</span>
              </span>
            )}
          </div>

          {/* Karaoke streaming text */}
          <div className="min-h-[100px] bg-white/90 backdrop-blur-sm rounded-xl p-6 border-2 border-emerald-200">
            {streamingQuestion ? (
              <p className="text-2xl text-gray-800 leading-relaxed">
                {streamingQuestion.split(' ').map((word, wordIdx, arr) => (
                  <span key={wordIdx}>
                    <span className="text-emerald-700 font-medium">
                      {word}
                    </span>
                    {wordIdx < arr.length - 1 ? ' ' : ''}
                  </span>
                ))}
              </p>
            ) : (
              <p className="text-2xl text-gray-400 italic">
                {isStreaming ? '🔊 Speaking...' : 'Ready for next question...'}
              </p>
            )}
          </div>

          {/* Progress bar */}
          {isStreaming && questionWordsRef.current.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-150"
                    style={{
                      width: `${(currentWordIndex / questionWordsRef.current.length) * 100}%`
                    }}
                  />
                </div>
                <span className="text-sm text-emerald-700 font-medium">
                  {wordProgress}
                </span>
              </div>
            </div>
          )}

          {/* Answer input - appears after question */}
          {!isStreaming && streamingQuestion && (
            <div className="mt-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border-2 border-purple-200 p-4">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-sm font-medium text-purple-700 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Your Answer:
                  </span>
                </div>

                {/* Dynamic input based on question type */}
                {renderInputByType()}

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => {
                      const value = userTranscript || farmerDetails[configQuestions[configStep].id as keyof typeof farmerDetails];
                      if (value && value.toString().trim()) {
                        processAnswer(value.toString());
                        setUserTranscript("");
                      } else {
                        toast.error("Please select or enter an answer");
                      }
                    }}
                    disabled={!userTranscript && !farmerDetails[configQuestions[configStep].id as keyof typeof farmerDetails]}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Submit Answer
                  </button>
                  <button
                    onClick={skipQuestion}
                    className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:from-amber-600 hover:to-orange-600 flex items-center gap-2"
                  >
                    <ArrowRight className="w-4 h-4" />
                    Skip
                  </button>
                </div>
              </div>

              {debugInfo.isListening && (
                <div className="mt-3 flex items-center gap-3 p-3 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl">
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
        <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-rose-50 rounded-2xl p-5 shadow-xl border border-purple-200">
          <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <span className={`bg-gradient-to-r ${colors.secondary} bg-clip-text text-transparent`}>
              Your Farm Profile Summary
            </span>
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white/60 backdrop-blur-sm p-2 rounded-lg">
              <span className="font-medium text-emerald-600 flex items-center gap-1">
                <Sprout className="w-3 h-3" /> Crops:
              </span>{" "}
              <span className="text-blue-900 font-semibold">{farmerDetails.crops || "⏳"}</span>
            </div>
            <div className="bg-white/60 backdrop-blur-sm p-2 rounded-lg">
              <span className="font-medium text-blue-600 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> County:
              </span>{" "}
              <span className="text-blue-900 font-semibold">{farmerDetails.county || "⏳"}</span>
            </div>
            <div className="bg-white/60 backdrop-blur-sm p-2 rounded-lg">
              <span className="font-medium text-amber-600 flex items-center gap-1">
                <Tractor className="w-3 h-3" /> Acres:
              </span>{" "}
              <span className="text-blue-900 font-semibold">{farmerDetails.acres || farmerDetails.cultivatedAcres || "⏳"}</span>
            </div>
            <div className="bg-white/60 backdrop-blur-sm p-2 rounded-lg">
              <span className="font-medium text-purple-600 flex items-center gap-1">
                <Beaker className="w-3 h-3" /> Soil Test:
              </span>{" "}
              <span className="text-blue-900 font-semibold">{farmerDetails.hasDoneSoilTest || "⏳"}</span>
            </div>
          </div>
          <p className="text-xs text-purple-600 mt-3 flex items-center gap-1">
            <Heart className="w-3 h-3" />
            {debugInfo.currentQuestion}/{configQuestions.length} questions answered • {Math.round((debugInfo.currentQuestion / configQuestions.length) * 100)}% complete
          </p>
        </div>
      )}

      {/* AI Assistant */}
      <div className={`${colors.card} rounded-2xl p-4 shadow-xl border border-purple-200/50`}>
        <div className="flex flex-row items-center gap-4">
          <div className="relative">
            <Image
              src="/farmer-assistant.jpg"
              alt={aiAltText}
              width={48}
              height={48}
              className="rounded-full object-cover size-12 ring-4 ring-purple-200/50"
            />
            {isSpeaking && (
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center animate-pulse">
                <span className="text-[10px] text-white">🔊</span>
              </span>
            )}
          </div>
          <div className="flex-1">
            <h4 className={`font-bold text-lg bg-gradient-to-r ${colors.secondary} bg-clip-text text-transparent`}>
              🌱 Smart Farmer AI Assistant
            </h4>
            <p className="text-gray-600">
              {currentStep === "idle"
                ? "Ready to learn about your farm! We'll ask questions to create your complete profile."
                : currentStep === "configuring"
                ? `Asking ${currentSection} questions (${debugInfo.currentQuestion} of ${debugInfo.totalQuestions})`
                : currentStep === "generating"
                ? "Creating your personalized farm profile and financial analysis..."
                : currentStep === "redirecting"
                ? "Taking you to your recommendations and financial analysis..."
                : "Error occurred"}
            </p>
            {debugInfo.isListening && (
              <p className="text-sm text-blue-600 mt-1 animate-pulse flex items-center gap-1">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                🎤 Listening to your answer...
              </p>
            )}
            {isSpeaking && (
              <p className="text-sm text-purple-600 mt-1 animate-pulse flex items-center gap-1">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                🔊 Speaking...
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stop button */}
      {(currentStep === "configuring" || currentStep === "generating") && (
        <button
          onClick={stopEverything}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-red-500 text-white font-medium hover:from-rose-600 hover:to-red-600 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all mx-auto w-48"
        >
          <span>🛑</span>
          Stop Setup
        </button>
      )}
    </div>
  );
};

export default CreateInterviewAgent;