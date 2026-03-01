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
  ChevronDown
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

  // Karaoke streaming for questions
  const [streamingQuestion, setStreamingQuestion] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const questionWordsRef = useRef<string[]>([]);

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
    { id: "crops", question: "What crops do you grow? For example: maize, beans, coffee, or vegetables.", type: "dropdown", options: ["maize", "beans", "coffee", "vegetables", "wheat", "sorghum", "millet", "other"] },
    { id: "season", question: "Which season are you planting for? Long rains, short rains, or dry season?", type: "dropdown", options: ["long rains", "short rains", "dry season"] },
    { id: "county", question: "What county are you in?", type: "text" },
    { id: "subCounty", question: "Which sub-county or district?", type: "text" },
    { id: "village", question: "Which village?", type: "text" },
    { id: "cropOfInterest", question: "Which crop are you most interested in learning about?", type: "dropdown", options: ["maize", "beans", "coffee", "vegetables", "wheat", "sorghum", "millet", "all"] },
    { id: "acres", question: "How many acres are you planting?", type: "number" },
    { id: "previousCrop", question: "What was your previous crop in this field?", type: "dropdown", options: ["maize", "beans", "coffee", "vegetables", "wheat", "sorghum", "millet", "fallow", "other"] },
    { id: "averageHarvest", question: "What is your average harvest per acre? For example: 15 bags of maize.", type: "text" },
    { id: "harvestUnit", question: "What unit do you use? Bags, kg, or tonnes?", type: "dropdown", options: ["bags", "kg", "tonnes"] },
    { id: "usePlantingFertilizer", question: "Do you use planting fertilizer? Say yes or no.", type: "dropdown", options: ["yes", "no"] },
    { id: "plantingFertilizerType", question: "If yes, what type? For example: DAP or NPK. If no, say 'not applicable'.", type: "dropdown", options: ["DAP", "NPK", "CAN", "UREA", "not applicable"] },
    { id: "plantingFertilizerQuantity", question: "How many kilograms per acre? If no, say zero.", type: "number" },
    { id: "useTopdressingFertilizer", question: "Do you use topdressing fertilizer? Say yes or no.", type: "dropdown", options: ["yes", "no"] },
    { id: "topdressingFertilizerType", question: "If yes, what type? For example: CAN or Urea. If no, say 'not applicable'.", type: "dropdown", options: ["CAN", "UREA", "NPK", "not applicable"] },
    { id: "topdressingFertilizerQuantity", question: "How many kilograms per acre? If no, say zero.", type: "number" },
    { id: "useCertifiedSeed", question: "Do you use certified seed? Say yes or no.", type: "dropdown", options: ["yes", "no"] },
    { id: "certifiedSeedReason", question: "If no, why not? Too expensive, not available, or other reason? If yes, say 'not applicable'.", type: "dropdown", options: ["too expensive", "not available", "other", "not applicable"] },
    { id: "seedQuantity", question: "If yes, how many kilograms per acre? If no, say zero.", type: "number" },
    { id: "soilTested", question: "Have you ever done comprehensive soil testing? Say yes or no.", type: "dropdown", options: ["yes", "no"] },
    { id: "soilType", question: "What type of soil do you have? Clay, loam, sandy, or not sure?", type: "dropdown", options: ["clay", "loam", "sandy", "not sure"] },
    { id: "organicManure", question: "Do you use organic manure? Say yes or no.", type: "dropdown", options: ["yes", "no"] },
    { id: "terracing", question: "Do you use terracing? Say yes or no.", type: "dropdown", options: ["yes", "no"] },
    { id: "mulching", question: "Do you use mulching? Say yes or no.", type: "dropdown", options: ["yes", "no"] },
    { id: "coverCrops", question: "Do you use cover crops? Say yes or no.", type: "dropdown", options: ["yes", "no"] },
    { id: "rainwaterHarvesting", question: "Do you practice rainwater harvesting? Say yes or no.", type: "dropdown", options: ["yes", "no"] },
    { id: "contourFarming", question: "Do you use contour farming? Say yes or no.", type: "dropdown", options: ["yes", "no"] },
    { id: "cattle", question: "How many cattle do you have? Say zero if none.", type: "number" },
    { id: "cattleType", question: "If you have cattle, are they hybrid, local, or mixed? If none, say 'none'.", type: "dropdown", options: ["hybrid", "local", "mixed", "none"] },
    { id: "milkProduction", question: "How many liters of milk per day? If no cattle, say zero.", type: "number" },
    { id: "otherLivestock", question: "Do you have other livestock like goats or chickens?", type: "text" },
    { id: "smartphone", question: "Can you access a smartphone? Say yes or no.", type: "dropdown", options: ["yes", "no"] },
    { id: "phoneNumber", question: "What is your phone number for alerts?", type: "tel", placeholder: "e.g., 0712345678" },
    { id: "experience", question: "How many years of farming experience do you have?", type: "number" },
    { id: "mainChallenge", question: "What is your biggest farming challenge? Pests, disease, market, water, or other?", type: "dropdown", options: ["pests", "disease", "market", "water", "other"] }
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
    if (fieldId === "county") {
      acknowledgment = `Got it, you are from ${answer}. `;
    } else if (fieldId === "crops") {
      acknowledgment = `Cool, you grow ${answer}. `;
    } else if (fieldId === "acres") {
      acknowledgment = `${answer} acres, nice! `;
    } else if (fieldId === "cattle") {
      if (answer === "0" || answer === "none") {
        acknowledgment = `No cattle, okay. `;
      } else {
        acknowledgment = `${answer} cattle, great! `;
      }
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

  const processAnswer = async (answer: string) => {
    console.log("Processing answer:", answer);

    if (currentStep === "configuring") {
      const currentConfig = configQuestions[configStep];

      setFarmerDetails(prev => ({
        ...prev,
        [currentConfig.id]: answer
      }));

      toast.success(`✅ ${currentConfig.id}: ${answer}`);

      // Voice acknowledgment before next question
      await speakAcknowledgment(answer, currentConfig.id);

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
    // For text inputs, we'll update the state but not auto-submit
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

  const displayName = userName || "Farmer";
  const userAltText = `${displayName}'s profile picture`;
  const aiAltText = "Gen Z AI Agricultural Assistant";

  // Word count indicator
  const wordProgress = currentWordIndex > 0 && questionWordsRef.current.length > 0
    ? `${currentWordIndex}/${questionWordsRef.current.length} words`
    : '';

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
      </div>

      {/* 🔥 KARAOKE STREAMING QUESTION */}
      {currentStep === "configuring" && (
        <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 rounded-2xl p-6 shadow-xl border-2 border-green-300 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 bg-gradient-to-r ${colors.primary} text-white rounded-xl flex items-center justify-center text-sm font-bold shadow-md`}>
              {debugInfo.currentQuestion}
            </div>
            <h4 className="font-bold text-xl text-emerald-800">
              Question {debugInfo.currentQuestion} of {debugInfo.totalQuestions}
            </h4>
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

                {/* 🔥 Dynamic input based on question type */}
                {configQuestions[configStep].type === "dropdown" ? (
                  <div className="relative">
                    <select
                      value={userTranscript || farmerDetails[configQuestions[configStep].id as keyof typeof farmerDetails] || ""}
                      onChange={(e) => {
                        setUserTranscript(e.target.value);
                      }}
                      className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all text-blue-900 appearance-none"
                      style={{ color: '#1e3a8a' }}
                    >
                      <option value="">Select an option</option>
                      {configQuestions[configStep].options?.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                ) : configQuestions[configStep].type === "text" || configQuestions[configStep].type === "tel" ? (
                  <input
                    type="text"
                    value={userTranscript || farmerDetails[configQuestions[configStep].id as keyof typeof farmerDetails] || ""}
                    onChange={(e) => setUserTranscript(e.target.value)}
                    placeholder={configQuestions[configStep].placeholder || "Type answer here..."}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all text-blue-900"
                    style={{ color: '#1e3a8a' }}
                  />
                ) : configQuestions[configStep].type === "number" ? (
                  <input
                    type="number"
                    value={userTranscript || farmerDetails[configQuestions[configStep].id as keyof typeof farmerDetails] || ""}
                    onChange={(e) => setUserTranscript(e.target.value)}
                    placeholder="Enter number..."
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all text-blue-900"
                    style={{ color: '#1e3a8a' }}
                  />
                ) : (
                  <input
                    type="text"
                    value={userTranscript || farmerDetails[configQuestions[configStep].id as keyof typeof farmerDetails] || ""}
                    onChange={(e) => setUserTranscript(e.target.value)}
                    placeholder="Type answer here..."
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all text-blue-900"
                    style={{ color: '#1e3a8a' }}
                  />
                )}

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
                  <span className="text-sm font-medium text-red-600">🎤 Listening... Spill the tea!</span>
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
              Your Farm Profile So Far
            </span>
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/60 backdrop-blur-sm p-2 rounded-lg">
              <span className="font-medium text-emerald-600">Crops:</span>{" "}
              <span className="text-blue-900 font-semibold">{farmerDetails.crops || "⏳"}</span>
            </div>
            <div className="bg-white/60 backdrop-blur-sm p-2 rounded-lg">
              <span className="font-medium text-blue-600">County:</span>{" "}
              <span className="text-blue-900 font-semibold">{farmerDetails.county || "⏳"}</span>
            </div>
            <div className="bg-white/60 backdrop-blur-sm p-2 rounded-lg">
              <span className="font-medium text-amber-600">Acres:</span>{" "}
              <span className="text-blue-900 font-semibold">{farmerDetails.acres || "⏳"}</span>
            </div>
            <div className="bg-white/60 backdrop-blur-sm p-2 rounded-lg">
              <span className="font-medium text-purple-600">Cattle:</span>{" "}
              <span className="text-blue-900 font-semibold">{farmerDetails.cattle || "⏳"}</span>
            </div>
          </div>
          <p className="text-xs text-purple-600 mt-3 flex items-center gap-1">
            <Heart className="w-3 h-3" />
            {debugInfo.currentQuestion}/{configQuestions.length} questions answered
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