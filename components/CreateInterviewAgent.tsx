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
  Heart
} from "lucide-react";

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

  // 🌱 Farmer details state
  const [farmerDetails, setFarmerDetails] = useState({
    crops: "", season: "", county: "", subCounty: "", village: "",
    cropOfInterest: "", acres: "", previousCrop: "", averageHarvest: "", harvestUnit: "bags",
    usePlantingFertilizer: "", plantingFertilizerType: "", plantingFertilizerQuantity: "", noPlantingFertilizerReason: "",
    useTopdressingFertilizer: "", topdressingFertilizerType: "", topdressingFertilizerQuantity: "", noTopdressingFertilizerReason: "",
    soilTested: "", soilType: "", organicManure: "",
    useCertifiedSeed: "", certifiedSeedReason: "", seedQuantity: "",
    terracing: "", mulching: "", coverCrops: "", rainwaterHarvesting: "", contourFarming: "",
    cattle: "", cattleType: "", milkProduction: "", otherLivestock: "",
    smartphone: "", phoneNumber: "", experience: "", mainChallenge: "",
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

  // Configuration questions
  const configQuestions = [
    { id: "crops", question: "What crops do you grow? For example: maize, beans, coffee, or vegetables.", parse: (a: string) => a },
    { id: "season", question: "Which season are you planting for? Long rains, short rains, or dry season?", parse: (a: string) => a.toLowerCase().includes("long") ? "long rains" : a.toLowerCase().includes("short") ? "short rains" : "dry season" },
    { id: "county", question: "What county are you in?", parse: (a: string) => a },
    { id: "subCounty", question: "Which sub-county or district?", parse: (a: string) => a },
    { id: "village", question: "Which village?", parse: (a: string) => a },
    { id: "cropOfInterest", question: "Which crop are you most interested in learning about?", parse: (a: string) => a },
    { id: "acres", question: "How many acres are you planting?", parse: (a: string) => a.replace(/[^0-9.]/g, '') },
    { id: "previousCrop", question: "What was your previous crop in this field?", parse: (a: string) => a },
    { id: "averageHarvest", question: "What is your average harvest per acre? For example: 15 bags of maize.", parse: (a: string) => { const match = a.match(/\d+/); return match ? match[0] : ""; } },
    { id: "harvestUnit", question: "What unit do you use? Bags, kg, or tonnes?", parse: (a: string) => a.toLowerCase().includes("kg") ? "kg" : a.toLowerCase().includes("tonne") ? "tonnes" : "bags" },
    { id: "usePlantingFertilizer", question: "Do you use planting fertilizer? Say yes or no.", parse: (a: string) => a.toLowerCase().includes("yes") ? "yes" : "no" },
    { id: "plantingFertilizerType", question: "If yes, what type? For example: DAP or NPK. If no, say 'not applicable'.", parse: (a: string) => a },
    { id: "plantingFertilizerQuantity", question: "How many kilograms per acre? If no, say zero.", parse: (a: string) => a.replace(/[^0-9.]/g, '') || "0" },
    { id: "useTopdressingFertilizer", question: "Do you use topdressing fertilizer? Say yes or no.", parse: (a: string) => a.toLowerCase().includes("yes") ? "yes" : "no" },
    { id: "topdressingFertilizerType", question: "If yes, what type? For example: CAN or Urea. If no, say 'not applicable'.", parse: (a: string) => a },
    { id: "topdressingFertilizerQuantity", question: "How many kilograms per acre? If no, say zero.", parse: (a: string) => a.replace(/[^0-9.]/g, '') || "0" },
    { id: "useCertifiedSeed", question: "Do you use certified seed? Say yes or no.", parse: (a: string) => a.toLowerCase().includes("yes") ? "yes" : "no" },
    { id: "certifiedSeedReason", question: "If no, why not? Too expensive, not available, or other reason? If yes, say 'not applicable'.", parse: (a: string) => a },
    { id: "seedQuantity", question: "If yes, how many kilograms per acre? If no, say zero.", parse: (a: string) => a.replace(/[^0-9.]/g, '') || "0" },
    { id: "soilTested", question: "Have you ever done comprehensive soil testing? Say yes or no.", parse: (a: string) => a.toLowerCase().includes("yes") ? "yes" : "no" },
    { id: "soilType", question: "What type of soil do you have? Clay, loam, sandy, or not sure?", parse: (a: string) => a.toLowerCase().includes("clay") ? "clay" : a.toLowerCase().includes("loam") ? "loam" : a.toLowerCase().includes("sandy") ? "sandy" : "not sure" },
    { id: "organicManure", question: "Do you use organic manure? Say yes or no.", parse: (a: string) => a.toLowerCase().includes("yes") ? "yes" : "no" },
    { id: "terracing", question: "Do you use terracing? Say yes or no.", parse: (a: string) => a.toLowerCase().includes("yes") ? "yes" : "no" },
    { id: "mulching", question: "Do you use mulching? Say yes or no.", parse: (a: string) => a.toLowerCase().includes("yes") ? "yes" : "no" },
    { id: "coverCrops", question: "Do you use cover crops? Say yes or no.", parse: (a: string) => a.toLowerCase().includes("yes") ? "yes" : "no" },
    { id: "rainwaterHarvesting", question: "Do you practice rainwater harvesting? Say yes or no.", parse: (a: string) => a.toLowerCase().includes("yes") ? "yes" : "no" },
    { id: "contourFarming", question: "Do you use contour farming? Say yes or no.", parse: (a: string) => a.toLowerCase().includes("yes") ? "yes" : "no" },
    { id: "cattle", question: "How many cattle do you have? Say zero if none.", parse: (a: string) => a.replace(/[^0-9]/g, '') || "0" },
    { id: "cattleType", question: "If you have cattle, are they hybrid, local, or mixed? If none, say 'none'.", parse: (a: string) => a.toLowerCase().includes("hybrid") ? "hybrid" : a.toLowerCase().includes("local") ? "local" : a.toLowerCase().includes("mixed") ? "mixed" : "none" },
    { id: "milkProduction", question: "How many liters of milk per day? If no cattle, say zero.", parse: (a: string) => a.replace(/[^0-9.]/g, '') || "0" },
    { id: "otherLivestock", question: "Do you have other livestock like goats or chickens?", parse: (a: string) => a },
    { id: "smartphone", question: "Can you access a smartphone? Say yes or no.", parse: (a: string) => a.toLowerCase().includes("yes") ? "yes" : "no" },
    { id: "phoneNumber", question: "What is your phone number for alerts?", parse: (a: string) => a.replace(/[^0-9+]/g, '') },
    { id: "experience", question: "How many years of farming experience do you have?", parse: (a: string) => a.replace(/[^0-9]/g, '') || "0" },
    { id: "mainChallenge", question: "What is your biggest farming challenge? Pests, disease, market, water, or other?", parse: (a: string) => a }
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

  // Initialize voice assistant
  useEffect(() => {
    if (!voiceEnabled) {
      voiceAssistantRef.current = null;
      return;
    }

    voiceAssistantRef.current = {
      speak: async (text: string) => {
        return new Promise((resolve) => {
          if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
            console.log("Would speak:", text.substring(0, 50) + "...");
            setTimeout(resolve, 2000);
            return;
          }

          setIsSpeaking(true);

          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 0.9;
          utterance.volume = 1.0;
          utterance.pitch = 1.0;

          utterance.onend = () => {
            console.log("Finished speaking");
            setIsSpeaking(false);
            resolve();
          };

          utterance.onerror = (error) => {
            console.error("Speech error:", error);
            setIsSpeaking(false);
            resolve();
          };

          window.speechSynthesis.speak(utterance);
        });
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

  const processAnswer = (transcript: string) => {
    console.log("Processing answer:", transcript);

    if (currentStep === "configuring") {
      const currentConfig = configQuestions[configStep];
      const parsedValue = currentConfig.parse(transcript);

      setFarmerDetails(prev => ({
        ...prev,
        [currentConfig.id]: parsedValue
      }));

      toast.success(`✅ ${currentConfig.id}: ${parsedValue}`);

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

    console.log("Starting farmer voice setup...");

    safeStopListening();
    setCurrentStep("configuring");
    setConfigStep(0);
    setUserTranscript("");
    setFarmerDetails({
      crops: "", season: "", county: "", subCounty: "", village: "",
      cropOfInterest: "", acres: "", previousCrop: "", averageHarvest: "", harvestUnit: "bags",
      usePlantingFertilizer: "", plantingFertilizerType: "", plantingFertilizerQuantity: "", noPlantingFertilizerReason: "",
      useTopdressingFertilizer: "", topdressingFertilizerType: "", topdressingFertilizerQuantity: "", noTopdressingFertilizerReason: "",
      soilTested: "", soilType: "", organicManure: "",
      useCertifiedSeed: "", certifiedSeedReason: "", seedQuantity: "",
      terracing: "", mulching: "", coverCrops: "", rainwaterHarvesting: "", contourFarming: "",
      cattle: "", cattleType: "", milkProduction: "", otherLivestock: "",
      smartphone: "", phoneNumber: "", experience: "", mainChallenge: "",
    });
    retryCountRef.current = 0;
    setDebugInfo(prev => ({
      ...prev,
      callStatus: "CONFIGURING",
      currentQuestion: 0,
      generatedSessionId: "",
    }));

    await voiceAssistantRef.current.speak(
      "Welcome bestie! I'm your Gen Z farming assistant. I'll help you set up your farm profile by asking you a few questions. " +
      "This will help me give you personalized farming advice. Please speak clearly after each question. " +
      "Let's get this bread!"
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
    console.log("Asking config question", step + 1);

    setDebugInfo(prev => ({
      ...prev,
      currentQuestion: step + 1,
      totalQuestions: configQuestions.length
    }));

    await voiceAssistantRef.current.speak(question);
    await new Promise(resolve => setTimeout(resolve, 1000));

    safeStartListening();
  };

  const generateFarmerSession = async () => {
    if (!voiceAssistantRef.current) return;

    setIsLoading(true);
    setDebugInfo(prev => ({ ...prev, callStatus: "GENERATING" }));

    await voiceAssistantRef.current.speak(
      `Thank you bestie for sharing all your farm deets! I'm now creating your personalized farming profile. ` +
      `Please wait a moment while I prepare your recommendations.`
    );

    let currentUserId = userId;
    if (!currentUserId) {
      currentUserId = localStorage.getItem('userId') || `user-${Date.now()}`;
      localStorage.setItem('userId', currentUserId);
    }

    try {
      console.log("🌾 Calling farmer session API...");

      const response = await fetch("/api/vapi/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...farmerDetails,
          userid: currentUserId
        })
      });

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
          `Great! I've prepared ${data.count} personalized recommendations for your farm bestie. ` +
          `I'll now take you to the recommendations page where you can see all your tips. ` +
          `After that, you can ask me anything about your crops!`
        );

        console.log(`✅ Redirecting to recommendations page: /interview/${data.sessionId}`);
        toast.success(`✅ Farm profile created! Check out your recommendations!`);

        setTimeout(() => {
          if (data.sessionId) {
            // 🔥 CHANGED: First go to recommendations page
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
        "Sorry bestie, there was an error creating your farm profile. Please try again."
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
    setCurrentStep("idle");
    retryCountRef.current = 0;
    toast.info("Setup stopped");
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

  const skipQuestion = () => {
    if (currentStep === "configuring") {
      const defaultAnswers = [
        "maize", "long rains", "Kiambu", "Kikuyu", "Gachie",
        "maize", "2", "beans", "15", "bags",
        "yes", "DAP", "50", "yes", "CAN", "50",
        "yes", "not applicable", "10", "no", "loam", "yes",
        "no", "no", "no", "no", "no",
        "0", "none", "0", "none",
        "yes", "0712345678", "5", "pests"
      ];
      const answer = defaultAnswers[configStep] || "not specified";

      processAnswer(answer);
      toast.info(`⏭️ Using default: ${answer}`);
    }
  };

  const displayName = userName || "Farmer";
  const userAltText = `${displayName}'s profile picture`;
  const aiAltText = "Gen Z AI Agricultural Assistant";

  // Gen Z color palette
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
                Gen Z Farmer • Let's vibe 🌱
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
                Start Farm Setup
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

        <div className="mt-4 text-sm text-gray-600 space-y-2">
          <p className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
            I'll ask you about your farm, crops, and livestock
          </p>
          <p className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
            Answer each question by voice
          </p>
          <p className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-pink-400 rounded-full"></span>
            Get personalized farming recommendations
          </p>
          <p className="flex items-center gap-2 font-medium text-emerald-600">
            <Zap className="w-4 h-4" />
            Then ask unlimited questions on next page!
          </p>
        </div>
      </div>

      {/* Current Question Status */}
      {currentStep === "configuring" && (
        <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 rounded-2xl p-5 shadow-xl border border-green-200 animate-fade-in">
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-8 h-8 bg-gradient-to-r ${colors.primary} text-white rounded-xl flex items-center justify-center text-sm font-bold shadow-md`}>
              {debugInfo.currentQuestion}
            </div>
            <h4 className="font-bold text-lg text-emerald-800">
              Question {debugInfo.currentQuestion} of {debugInfo.totalQuestions}
            </h4>
          </div>
          <p className="text-emerald-900 mb-4 text-lg">{configQuestions[configStep]?.question}</p>

          {userTranscript && (
            <div className="mt-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-emerald-200 mb-4">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-medium text-emerald-700 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Your Answer:
                </span>
                <button
                  onClick={() => setUserTranscript("")}
                  className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 bg-white rounded-lg"
                >
                  Clear
                </button>
              </div>
              <p className="text-gray-800">{userTranscript}</p>
            </div>
          )}

          {debugInfo.isListening && (
            <div className="mt-4 flex items-center gap-3 p-3 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-red-600">🎤 Listening... Spill the tea!</span>
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
              Your Farm Profile So Far
            </span>
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/60 backdrop-blur-sm p-2 rounded-lg">
              <span className="font-medium text-emerald-600">Crops:</span> {farmerDetails.crops || "⏳"}
            </div>
            <div className="bg-white/60 backdrop-blur-sm p-2 rounded-lg">
              <span className="font-medium text-blue-600">County:</span> {farmerDetails.county || "⏳"}
            </div>
            <div className="bg-white/60 backdrop-blur-sm p-2 rounded-lg">
              <span className="font-medium text-amber-600">Acres:</span> {farmerDetails.acres || "⏳"}
            </div>
            <div className="bg-white/60 backdrop-blur-sm p-2 rounded-lg">
              <span className="font-medium text-purple-600">Cattle:</span> {farmerDetails.cattle || "⏳"}
            </div>
          </div>
          <p className="text-xs text-purple-600 mt-3 flex items-center gap-1">
            <Heart className="w-3 h-3" />
            {debugInfo.currentQuestion}/{configQuestions.length} questions answered
          </p>
        </div>
      )}

      {/* Status Panel with Buttons */}
      <div className={`${colors.card} rounded-2xl p-5 shadow-xl border border-gray-200/50`}>
        <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" />
          <span className={`bg-gradient-to-r ${colors.accent} bg-clip-text text-transparent`}>
            Setup Status
          </span>
        </h4>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-3 border border-gray-200">
            <div className="text-xs text-gray-500 mb-1">Progress</div>
            <div className="font-bold text-lg text-gray-800">
              {debugInfo.currentQuestion}/{debugInfo.totalQuestions}
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-3 border border-gray-200">
            <div className="text-xs text-gray-500 mb-1">Voice</div>
            <div className={`font-bold text-lg ${voiceEnabled ? 'text-green-600' : 'text-red-600'}`}>
              {voiceEnabled ? "ON" : "OFF"}
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-3 border border-gray-200">
            <div className="text-xs text-gray-500 mb-1">Mode</div>
            <div className={`font-bold text-lg ${
              debugInfo.voiceMode === "REAL" ? 'text-green-600' : 'text-yellow-600'
            }`}>
              {debugInfo.voiceMode}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`bg-gradient-to-r ${colors.primary} h-3 rounded-full transition-all duration-500`}
              style={{
                width: currentStep === "idle" ? "0%" :
                       currentStep === "configuring" ? `${(debugInfo.currentQuestion / debugInfo.totalQuestions) * 100}%` :
                       currentStep === "generating" ? "90%" :
                       currentStep === "redirecting" ? "100%" : "0%"
              }}
            ></div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex flex-wrap gap-3 mt-4">
          <button
            onClick={startVoiceSetup}
            disabled={isLoading || !voiceEnabled || currentStep !== "idle"}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
          >
            <Sprout className="w-4 h-4" />
            {currentStep === "idle" ? "Start Farm Setup" : "In Progress"}
          </button>

          {(currentStep === "configuring" || currentStep === "generating") && (
            <button
              onClick={stopEverything}
              disabled={isSpeaking}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-500 text-white font-medium hover:from-rose-600 hover:to-red-600 flex items-center gap-2 disabled:opacity-50 shadow-lg hover:shadow-xl transition-all"
            >
              <span>🛑</span>
              Stop Setup
            </button>
          )}

          {currentStep === "configuring" && userTranscript && (
            <button
              onClick={submitAnswer}
              disabled={!userTranscript.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white font-medium hover:from-emerald-600 hover:to-green-600 disabled:opacity-50 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
            >
              <Send className="w-4 h-4" />
              Submit Answer
            </button>
          )}

          {currentStep === "configuring" && (
            <button
              onClick={skipQuestion}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium hover:from-amber-600 hover:to-orange-600 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
            >
              <ArrowRight className="w-4 h-4" />
              Skip Question
            </button>
          )}
        </div>
      </div>

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
              🌱 Gen Z Farmer AI
            </h4>
            <p className="text-gray-600">
              {currentStep === "idle"
                ? "Ready to learn about your farm bestie!"
                : currentStep === "configuring"
                ? `Asking question ${debugInfo.currentQuestion} of ${debugInfo.totalQuestions}`
                : currentStep === "generating"
                ? "Creating your personalized farm profile..."
                : currentStep === "redirecting"
                ? "Taking you to your recommendations..."
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

      {/* Instructions */}
      <div className={`${colors.card} rounded-2xl p-5 shadow-xl border border-emerald-200/50`}>
        <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-500" />
          <span className={`bg-gradient-to-r ${colors.primary} bg-clip-text text-transparent`}>
            How It Works
          </span>
        </h4>
        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">1</div>
            <p><span className="font-medium">Turn on Voice Mode</span> above</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">2</div>
            <p><span className="font-medium">Click "Start Farm Setup"</span></p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">3</div>
            <p><span className="font-medium">Answer questions</span> about your farm by voice</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">4</div>
            <p><span className="font-medium">Get personalized recommendations</span> on next page</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">5</div>
            <p><span className="font-medium">Ask any farming question</span> with voice on Q&A page!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateInterviewAgent;