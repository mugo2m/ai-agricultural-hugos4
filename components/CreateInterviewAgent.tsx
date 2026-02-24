"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { VoiceToggle } from "@/components/VoiceToggle";

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

  // 🌾 NEW: Farmer details state with all fields
  const [farmerDetails, setFarmerDetails] = useState({
    // Location
    crops: "",
    season: "",
    county: "",
    subCounty: "",
    village: "",

    // Crop details
    cropOfInterest: "",
    acres: "",
    previousCrop: "",
    averageHarvest: "",
    harvestUnit: "bags",

    // Fertilizer - Planting
    usePlantingFertilizer: "",
    plantingFertilizerType: "",
    plantingFertilizerQuantity: "",
    noPlantingFertilizerReason: "",

    // Fertilizer - Topdressing
    useTopdressingFertilizer: "",
    topdressingFertilizerType: "",
    topdressingFertilizerQuantity: "",
    noTopdressingFertilizerReason: "",

    // Soil & Organic
    soilTested: "",
    soilType: "",
    organicManure: "",

    // Seed details
    useCertifiedSeed: "",
    certifiedSeedReason: "",
    seedQuantity: "",

    // Conservation practices
    terracing: "",
    mulching: "",
    coverCrops: "",
    rainwaterHarvesting: "",
    contourFarming: "",

    // Livestock
    cattle: "",
    cattleType: "",
    milkProduction: "",
    otherLivestock: "",

    // Technology
    smartphone: "",
    phoneNumber: "",

    // Farmer profile
    experience: "",
    mainChallenge: "",
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

  // 🌾 NEW: Farmer configuration questions (16 questions)
  const configQuestions = [
    // Location & Crops (4)
    {
      id: "crops",
      question: "What crops do you grow? For example: maize, beans, coffee, or vegetables.",
      parse: (answer: string) => answer
    },
    {
      id: "season",
      question: "Which season are you planting for? Long rains, short rains, or dry season?",
      parse: (answer: string) => answer.toLowerCase().includes("long") ? "long rains" :
                                    answer.toLowerCase().includes("short") ? "short rains" : "dry season"
    },
    {
      id: "county",
      question: "What county are you in?",
      parse: (answer: string) => answer
    },
    {
      id: "subCounty",
      question: "Which sub-county or district?",
      parse: (answer: string) => answer
    },
    {
      id: "village",
      question: "Which village?",
      parse: (answer: string) => answer
    },

    // Crop Details (4)
    {
      id: "cropOfInterest",
      question: "Which crop are you most interested in learning about?",
      parse: (answer: string) => answer
    },
    {
      id: "acres",
      question: "How many acres are you planting?",
      parse: (answer: string) => answer.replace(/[^0-9.]/g, '')
    },
    {
      id: "previousCrop",
      question: "What was your previous crop in this field?",
      parse: (answer: string) => answer
    },
    {
      id: "averageHarvest",
      question: "What is your average harvest per acre? For example: 15 bags of maize.",
      parse: (answer: string) => {
        const match = answer.match(/\d+/);
        return match ? match[0] : "";
      }
    },
    {
      id: "harvestUnit",
      question: "What unit do you use? Bags, kg, or tonnes?",
      parse: (answer: string) => answer.toLowerCase().includes("kg") ? "kg" :
                                    answer.toLowerCase().includes("tonne") ? "tonnes" : "bags"
    },

    // Planting Fertilizer (3)
    {
      id: "usePlantingFertilizer",
      question: "Do you use planting fertilizer? Say yes or no.",
      parse: (answer: string) => answer.toLowerCase().includes("yes") ? "yes" : "no"
    },
    {
      id: "plantingFertilizerType",
      question: "If yes, what type? For example: DAP or NPK. If no, say 'not applicable'.",
      parse: (answer: string) => answer
    },
    {
      id: "plantingFertilizerQuantity",
      question: "How many kilograms per acre? If no, say zero.",
      parse: (answer: string) => answer.replace(/[^0-9.]/g, '') || "0"
    },

    // Topdressing Fertilizer (3)
    {
      id: "useTopdressingFertilizer",
      question: "Do you use topdressing fertilizer? Say yes or no.",
      parse: (answer: string) => answer.toLowerCase().includes("yes") ? "yes" : "no"
    },
    {
      id: "topdressingFertilizerType",
      question: "If yes, what type? For example: CAN or Urea. If no, say 'not applicable'.",
      parse: (answer: string) => answer
    },
    {
      id: "topdressingFertilizerQuantity",
      question: "How many kilograms per acre? If no, say zero.",
      parse: (answer: string) => answer.replace(/[^0-9.]/g, '') || "0"
    },

    // Seed Details (3)
    {
      id: "useCertifiedSeed",
      question: "Do you use certified seed? Say yes or no.",
      parse: (answer: string) => answer.toLowerCase().includes("yes") ? "yes" : "no"
    },
    {
      id: "certifiedSeedReason",
      question: "If no, why not? Too expensive, not available, or other reason? If yes, say 'not applicable'.",
      parse: (answer: string) => answer
    },
    {
      id: "seedQuantity",
      question: "If yes, how many kilograms per acre? If no, say zero.",
      parse: (answer: string) => answer.replace(/[^0-9.]/g, '') || "0"
    },

    // Soil & Organic (3)
    {
      id: "soilTested",
      question: "Have you ever done comprehensive soil testing? Say yes or no.",
      parse: (answer: string) => answer.toLowerCase().includes("yes") ? "yes" : "no"
    },
    {
      id: "soilType",
      question: "What type of soil do you have? Clay, loam, sandy, or not sure?",
      parse: (answer: string) => answer.toLowerCase().includes("clay") ? "clay" :
                                    answer.toLowerCase().includes("loam") ? "loam" :
                                    answer.toLowerCase().includes("sandy") ? "sandy" : "not sure"
    },
    {
      id: "organicManure",
      question: "Do you use organic manure? Say yes or no.",
      parse: (answer: string) => answer.toLowerCase().includes("yes") ? "yes" : "no"
    },

    // Conservation Practices (5)
    {
      id: "terracing",
      question: "Do you use terracing? Say yes or no.",
      parse: (answer: string) => answer.toLowerCase().includes("yes") ? "yes" : "no"
    },
    {
      id: "mulching",
      question: "Do you use mulching? Say yes or no.",
      parse: (answer: string) => answer.toLowerCase().includes("yes") ? "yes" : "no"
    },
    {
      id: "coverCrops",
      question: "Do you use cover crops? Say yes or no.",
      parse: (answer: string) => answer.toLowerCase().includes("yes") ? "yes" : "no"
    },
    {
      id: "rainwaterHarvesting",
      question: "Do you practice rainwater harvesting? Say yes or no.",
      parse: (answer: string) => answer.toLowerCase().includes("yes") ? "yes" : "no"
    },
    {
      id: "contourFarming",
      question: "Do you use contour farming? Say yes or no.",
      parse: (answer: string) => answer.toLowerCase().includes("yes") ? "yes" : "no"
    },

    // Livestock (4)
    {
      id: "cattle",
      question: "How many cattle do you have? Say zero if none.",
      parse: (answer: string) => answer.replace(/[^0-9]/g, '') || "0"
    },
    {
      id: "cattleType",
      question: "If you have cattle, are they hybrid, local, or mixed? If none, say 'none'.",
      parse: (answer: string) => answer.toLowerCase().includes("hybrid") ? "hybrid" :
                                    answer.toLowerCase().includes("local") ? "local" :
                                    answer.toLowerCase().includes("mixed") ? "mixed" : "none"
    },
    {
      id: "milkProduction",
      question: "How many liters of milk per day? If no cattle, say zero.",
      parse: (answer: string) => answer.replace(/[^0-9.]/g, '') || "0"
    },
    {
      id: "otherLivestock",
      question: "Do you have other livestock like goats or chickens?",
      parse: (answer: string) => answer
    },

    // Technology & Profile (4)
    {
      id: "smartphone",
      question: "Can you access a smartphone? Say yes or no.",
      parse: (answer: string) => answer.toLowerCase().includes("yes") ? "yes" : "no"
    },
    {
      id: "phoneNumber",
      question: "What is your phone number for alerts?",
      parse: (answer: string) => answer.replace(/[^0-9+]/g, '')
    },
    {
      id: "experience",
      question: "How many years of farming experience do you have?",
      parse: (answer: string) => answer.replace(/[^0-9]/g, '') || "0"
    },
    {
      id: "mainChallenge",
      question: "What is your biggest farming challenge? Pests, disease, market, water, or other?",
      parse: (answer: string) => answer
    }
  ];

  // Initialize voice and speech recognition (KEEP EXISTING)
  useEffect(() => {
    const checkVoiceSupport = () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices();
        const hasRealVoice = voices.length > 0;
        setDebugInfo(prev => ({
          ...prev,
          voiceMode: hasRealVoice ? "REAL" : "SIMULATED"
        }));
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
      recognitionRef.current.maxAlternatives = 1;

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

  // Initialize voice assistant (KEEP EXISTING)
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

    // Reset everything
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
      "Welcome! I'm your agricultural assistant. I'll help you set up your farm profile by asking you a few questions. " +
      "This will help me give you personalized farming advice. Please speak clearly after each question. " +
      "Let's begin!"
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
      `Thank you for providing all your farm details! I'm now creating your personalized farming profile. ` +
      `Please wait a moment while I prepare your recommendations.`
    );

    // Get or create userId
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
          `Great! I've prepared ${data.count} personalized recommendations for your farm. ` +
          `I'll now take you to the Q&A page where you can ask me anything about your crops. ` +
          `Just speak your questions and I'll answer them with helpful information and images.`
        );

        console.log(`✅ Redirecting to interview page with session: ${data.sessionId}`);
        toast.success(`✅ Farm profile created! Redirecting...`);

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
      // Provide smart defaults based on question type
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
  const aiAltText = "AI Agricultural Assistant";

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row items-center gap-4">
          <Image
            src={profileImage || "/farmer-avatar.png"}
            alt={userAltText}
            width={40}
            height={40}
            className="rounded-full object-cover size-10"
          />
          <div>
            <h4 className="font-semibold">{displayName}</h4>
            <p className="text-sm text-gray-500">🌾 Farm Profile Setup</p>
            <p className="text-xs text-gray-400">ID: {debugInfo.userId.substring(0, 8)}...</p>
          </div>
        </div>

        <button
          onClick={startVoiceSetup}
          disabled={isLoading || !voiceEnabled || currentStep !== "idle"}
          className={`px-4 py-2 rounded-lg font-medium ${
            voiceEnabled && currentStep === "idle"
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          } ${isLoading ? 'animate-pulse' : ''}`}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin">⏳</span>
              Creating Profile...
            </span>
          ) : currentStep === "redirecting" ? (
            "Redirecting..."
          ) : (
            "🌾 Start Farm Setup"
          )}
        </button>
      </div>

      {/* Voice Toggle */}
      <div className="border border-gray-300 rounded-xl p-4">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-bold">🌱 Voice Farm Setup</h4>
          <span className={`text-sm font-medium px-2 py-1 rounded ${
            debugInfo.callStatus === "REDIRECTING" ? 'bg-green-100 text-green-800' :
            debugInfo.callStatus === "GENERATING" ? 'bg-blue-100 text-blue-800' :
            debugInfo.callStatus === "CONFIGURING" ? 'bg-yellow-100 text-yellow-800' :
            debugInfo.callStatus === "ERROR" ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {debugInfo.callStatus}
          </span>
        </div>

        <VoiceToggle
          onVoiceToggle={handleVoiceToggle}
          initialEnabled={voiceEnabled}
        />

        <div className="mt-4 text-sm text-gray-600 space-y-1">
          <p>• I'll ask you about your farm, crops, and livestock</p>
          <p>• Answer each question by voice</p>
          <p>• Get personalized farming recommendations</p>
          <p className="text-green-600 font-medium">• Then ask any farming questions by voice!</p>
        </div>
      </div>

      {/* Current Question Status */}
      {currentStep === "configuring" && (
        <div className="border border-green-200 bg-green-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
              {debugInfo.currentQuestion}
            </div>
            <h4 className="font-bold text-green-800">Question {debugInfo.currentQuestion} of {debugInfo.totalQuestions}</h4>
          </div>
          <p className="text-green-900 mb-3">{configQuestions[configStep]?.question}</p>

          {userTranscript && (
            <div className="mt-3 p-3 bg-white border border-green-100 rounded-lg mb-3">
              <div className="flex justify-between items-start mb-1">
                <span className="text-sm font-medium text-green-700">Your Answer:</span>
                <button
                  onClick={() => setUserTranscript("")}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear
                </button>
              </div>
              <p className="text-gray-800">{userTranscript}</p>
            </div>
          )}

          {debugInfo.isListening && (
            <div className="mt-3 flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-red-600">🎤 Listening... Speak now</span>
            </div>
          )}
        </div>
      )}

      {/* Summary Panel */}
      {currentStep === "configuring" && (
        <div className="border border-purple-200 bg-purple-50 rounded-xl p-4">
          <h4 className="font-bold text-purple-800 mb-2">📋 Your Farm Profile So Far</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="font-medium">Crops:</span> {farmerDetails.crops || "⏳"}</div>
            <div><span className="font-medium">County:</span> {farmerDetails.county || "⏳"}</div>
            <div><span className="font-medium">Acres:</span> {farmerDetails.acres || "⏳"}</div>
            <div><span className="font-medium">Cattle:</span> {farmerDetails.cattle || "⏳"}</div>
          </div>
          <p className="text-xs text-purple-600 mt-2">
            {debugInfo.currentQuestion}/{configQuestions.length} questions answered
          </p>
        </div>
      )}

      {/* Status Panel with Buttons */}
      <div className="border border-gray-300 rounded-xl p-4">
        <h4 className="font-bold text-lg mb-4">📊 Setup Status</h4>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-500">Progress</div>
            <div className="font-bold text-gray-800">
              {debugInfo.currentQuestion}/{debugInfo.totalQuestions}
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-500">Voice</div>
            <div className={`font-bold ${voiceEnabled ? 'text-green-600' : 'text-red-600'}`}>
              {voiceEnabled ? "ON" : "OFF"}
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-500">Mode</div>
            <div className={`font-bold ${
              debugInfo.voiceMode === "REAL" ? 'text-green-600' : 'text-yellow-600'
            }`}>
              {debugInfo.voiceMode}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
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
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={startVoiceSetup}
            disabled={isLoading || !voiceEnabled || currentStep !== "idle"}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            <span>🌾</span>
            {currentStep === "idle" ? "Start Farm Setup" : "In Progress"}
          </button>

          {(currentStep === "configuring" || currentStep === "generating") && (
            <button
              onClick={stopEverything}
              disabled={isSpeaking}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2 disabled:opacity-50"
            >
              <span>🛑</span>
              Stop Setup
            </button>
          )}

          {currentStep === "configuring" && userTranscript && (
            <button
              onClick={submitAnswer}
              disabled={!userTranscript.trim()}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center gap-2"
            >
              <span>✅</span>
              Submit Answer
            </button>
          )}

          {currentStep === "configuring" && (
            <button
              onClick={skipQuestion}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 flex items-center gap-2"
            >
              <span>⏭️</span>
              Skip Question
            </button>
          )}
        </div>
      </div>

      {/* AI Assistant */}
      <div className="border border-gray-300 rounded-xl p-4">
        <div className="flex flex-row items-center gap-4">
          <Image
            src="/farmer-assistant.jpg"
            alt={aiAltText}
            width={40}
            height={40}
            className="rounded-full object-cover size-10"
          />
          <div className="flex-1">
            <h4 className="font-semibold">🌾 Agricultural Assistant</h4>
            <p className="text-gray-600">
              {currentStep === "idle"
                ? "Ready to learn about your farm"
                : currentStep === "configuring"
                ? `Asking question ${debugInfo.currentQuestion} of ${debugInfo.totalQuestions}`
                : currentStep === "generating"
                ? "Creating your personalized farm profile..."
                : currentStep === "redirecting"
                ? "Taking you to the Q&A page..."
                : "Error occurred"}
            </p>
            {debugInfo.isListening && (
              <p className="text-sm text-blue-600 mt-1 animate-pulse">
                🎤 I'm listening to your answer...
              </p>
            )}
            {isSpeaking && (
              <p className="text-sm text-purple-600 mt-1 animate-pulse">
                🔊 Speaking...
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="border border-gray-300 rounded-xl p-4">
        <h4 className="font-bold mb-3">📋 How It Works:</h4>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
          <li><span className="font-medium">Turn on Voice Mode</span> above</li>
          <li><span className="font-medium">Click "Start Farm Setup"</span></li>
          <li><span className="font-medium">Answer questions</span> about your farm by voice</li>
          <li><span className="font-medium">Get personalized recommendations</span></li>
          <li><span className="font-medium">Ask any farming question</span> on the next page</li>
          <li><span className="font-medium">Receive answers with images</span> from our knowledge base</li>
        </ol>
      </div>
    </div>
  );
};

export default CreateInterviewAgent;