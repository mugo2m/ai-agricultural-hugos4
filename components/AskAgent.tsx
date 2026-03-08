// components/AskAgent.tsx - SYNCHRONIZED STREAMING WITH VOICE & FINANCIAL CONTEXT
"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { VoiceToggle } from "@/components/VoiceToggle";
import {
  Send,
  Loader2,
  Mic,
  ArrowLeft,
  Sparkles,
  MessageCircle,
  Volume2,
  VolumeX,
  Heart,
  Star,
  Sun,
  Leaf,
  Flower2,
  Sprout,
  Wheat,
  Coffee,
  Apple,
  Cherry,
  Citrus,
  Cloud,
  Droplets,
  ThermometerSun,
  Trees,
  Gem,
  Rocket,
  Zap,
  Award,
  Gift,
  Smile,
  ThumbsUp,
  MapPin,
  Bug,
  DollarSign,
  TrendingUp,
  Package,
  Tractor,
  BarChart3,
  Table,
  PieChart,
  CreditCard,
  Landmark,
  Calculator,
  Wallet,
  AlertCircle,
  CheckCircle2,
  Crown,
  Target,
  Trophy,
  Flag
} from "lucide-react";
import { useCurrency } from '@/lib/context/CurrencyContext';
import { formatCurrencyForDisplay, formatCurrencyForSpeech } from '@/lib/utils/currency';

interface AskAgentProps {
  userName: string;
  userId: string;
  sessionId: string;
  sessionData: any;
  recommendations: string[];
}

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  isStreaming?: boolean;
  financial?: boolean;
}

const AskAgent = ({
  userName,
  userId,
  sessionId,
  sessionData,
  recommendations
}: AskAgentProps) => {
  const { currency } = useCurrency();
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userTranscript, setUserTranscript] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showFinancial, setShowFinancial] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"chat" | "financial" | "summary">("chat");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const isAISpeakingRef = useRef(false);
  const wordsRef = useRef<string[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const streamTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const nameUsageCountRef = useRef(0); // ADDED: Counter for name usage

  // Farmer name from props
  const farmerName = userName;

  // Helper to get currency name for speech
  const getCurrencyName = () => {
    switch(currency.code) {
      case 'KES': return 'Kenyan Shillings';
      case 'UGX': return 'Ugandan Shillings';
      case 'TZS': return 'Tanzanian Shillings';
      case 'RWF': return 'Rwandan Francs';
      case 'BIF': return 'Burundian Francs';
      case 'SSP': return 'South Sudanese Pounds';
      case 'ETB': return 'Ethiopian Birr';
      case 'SOS': return 'Somali Shillings';
      case 'DJF': return 'Djiboutian Francs';
      case 'ERN': return 'Eritrean Nakfa';
      case 'NGN': return 'Nigerian Nairas';
      case 'GHS': return 'Ghanaian Cedis';
      case 'XOF': return 'West African CFA Francs';
      case 'XAF': return 'Central African CFA Francs';
      case 'GNF': return 'Guinean Francs';
      case 'LRD': return 'Liberian Dollars';
      case 'SLL': return 'Sierra Leonean Leones';
      case 'GMD': return 'Gambian Dalasis';
      case 'CVE': return 'Cape Verdean Escudos';
      case 'CDF': return 'Congolese Francs';
      case 'AOA': return 'Angolan Kwanzas';
      case 'STN': return 'São Tomé and Príncipe Dobras';
      case 'ZAR': return 'South African Rand';
      case 'NAD': return 'Namibian Dollars';
      case 'BWP': return 'Botswana Pula';
      case 'ZWL': return 'Zimbabwean Dollars';
      case 'ZMW': return 'Zambian Kwacha';
      case 'MWK': return 'Malawian Kwacha';
      case 'MZN': return 'Mozambican Meticais';
      case 'MGA': return 'Malagasy Ariary';
      case 'KMF': return 'Comorian Francs';
      case 'MUR': return 'Mauritian Rupees';
      case 'SCR': return 'Seychellois Rupees';
      case 'SZL': return 'Swazi Lilangeni';
      case 'LSL': return 'Lesotho Loti';
      case 'EGP': return 'Egyptian Pounds';
      case 'SDG': return 'Sudanese Pounds';
      case 'LYD': return 'Libyan Dinars';
      case 'TND': return 'Tunisian Dinars';
      case 'DZD': return 'Algerian Dinars';
      case 'MAD': return 'Moroccan Dirhams';
      case 'MRU': return 'Mauritanian Ouguiya';
      case 'USD': return 'US Dollars';
      case 'GBP': return 'British Pounds';
      case 'EUR': return 'Euros';
      default: return currency.name;
    }
  };

  // Helper to clean text of emojis and formatting
  const cleanText = (text: string): string => {
    return text
      .replace(/[\u{1F600}-\u{1F64F}]/gu, '')
      .replace(/[\u{1F300}-\u{1F5FF}]/gu, '')
      .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')
      .replace(/[\u{2600}-\u{26FF}]/gu, '')
      .replace(/[\u{2700}-\u{27BF}]/gu, '')
      .replace(/\*\*\*/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/#{1,6}\s?/g, '')
      .replace(/_/g, '')
      .replace(/~/g, '')
      .replace(/`/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Helper to replace currency symbols with full names for speech - WITH NAME COUNTER
  const prepareForSpeech = (text: string): string => {
    let speechText = cleanText(text);

    // Currency replacements
    switch(currency.code) {
      case 'ZAR':
        speechText = speechText.replace(/R\s/g, 'South African Rand ');
        speechText = speechText.replace(/R\b/g, 'South African Rand');
        break;
      case 'KES':
        speechText = speechText.replace(/Ksh\s/g, 'Kenyan Shillings ');
        speechText = speechText.replace(/Ksh\b/g, 'Kenyan Shillings');
        break;
      case 'UGX':
        speechText = speechText.replace(/USh\s/g, 'Ugandan Shillings ');
        speechText = speechText.replace(/USh\b/g, 'Ugandan Shillings');
        break;
      case 'TZS':
        speechText = speechText.replace(/TSh\s/g, 'Tanzanian Shillings ');
        speechText = speechText.replace(/TSh\b/g, 'Tanzanian Shillings');
        break;
      case 'RWF':
        speechText = speechText.replace(/FRw\s/g, 'Rwandan Francs ');
        speechText = speechText.replace(/FRw\b/g, 'Rwandan Francs');
        break;
      case 'GHS':
        speechText = speechText.replace(/GH₵\s/g, 'Ghanaian Cedis ');
        speechText = speechText.replace(/GH₵\b/g, 'Ghanaian Cedis');
        break;
      case 'NGN':
        speechText = speechText.replace(/₦\s/g, 'Nigerian Nairas ');
        speechText = speechText.replace(/₦\b/g, 'Nigerian Nairas');
        break;
      case 'ETB':
        speechText = speechText.replace(/Br\s/g, 'Ethiopian Birr ');
        speechText = speechText.replace(/Br\b/g, 'Ethiopian Birr');
        break;
      case 'USD':
        speechText = speechText.replace(/\$\s/g, 'US Dollars ');
        speechText = speechText.replace(/\$\b/g, 'US Dollars');
        break;
      case 'GBP':
        speechText = speechText.replace(/£\s/g, 'British Pounds ');
        speechText = speechText.replace(/£\b/g, 'British Pounds');
        break;
      case 'EUR':
        speechText = speechText.replace(/€\s/g, 'Euros ');
        speechText = speechText.replace(/€\b/g, 'Euros');
        break;
      default:
        const symbol = currency.symbol;
        if (symbol && symbol !== '') {
          const regex = new RegExp(`${symbol}\\s`, 'g');
          speechText = speechText.replace(regex, `${currency.name} `);
        }
    }

    // Add farmer name personalization - REDUCED FREQUENCY
    nameUsageCountRef.current++;
    const useName = nameUsageCountRef.current % 3 === 0;

    speechText = speechText
      .replace(/\b(farmer)\b/gi, useName ? farmerName : 'the farmer')
      .replace(/\b(you)\b/gi, useName ? farmerName : 'you')
      .replace(/\b(your)\b/gi, useName ? `${farmerName}'s` : 'your');

    return speechText;
  };

  // Reset name counter when component mounts or session changes
  useEffect(() => {
    nameUsageCountRef.current = 0;
  }, [sessionId]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setUserTranscript(transcript);
      };

      recognitionRef.current.onend = () => setIsListening(false);
      recognitionRef.current.onerror = () => setIsListening(false);
    }

    // Get random greeting with farmer name
    const greetings = [
      `Welcome! Ready to level up your farm enterprise's profitability?`,
      `Let's make your farm enterprise more profitable!`,
      `I've got answers based on your complete farm financial profile.`,
      `Welcome back! Ready to maximize your returns?`,
      `Let's crunch those farm numbers!`,
      `Your financial farming assistant is here to help.`
    ];
    const greeting = greetings[Math.floor(Math.random() * greetings.length)];

    // Create enhanced welcome message with financial context
    let welcomeContent = `${greeting} I'll answer your questions based on your complete farm profile`;

    if (sessionData) {
      welcomeContent += ` for your ${sessionData?.crops?.map((c: string) => `${c} Enterprise`).join(", ") || "crop enterprises"} in ${sessionData?.county || "your area"}`;

      if (sessionData.managementLevel) {
        welcomeContent += `. You're currently at a ${sessionData.managementLevel} management level`;
      }

      if (sessionData.grossMarginAnalysis) {
        welcomeContent += `. I can also help with financial analysis and gross margin calculations to put more money in your pocket.`;
      }
    }

    welcomeContent += ` What would you like to know?`;

    // Welcome message
    setMessages([{
      role: "assistant",
      content: welcomeContent,
      timestamp: Date.now()
    }]);

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (error) {}
      }
      if (streamTimeoutRef.current) {
        clearTimeout(streamTimeoutRef.current);
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [farmerName, sessionData]);

  // Synchronized streaming function with financial indicators
  const streamAnswerWithVoice = async (fullText: string, isFinancial: boolean = false) => {
    if (!voiceEnabled || !window.speechSynthesis) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: fullText,
        timestamp: Date.now(),
        financial: isFinancial
      }]);
      return;
    }

    setIsStreaming(true);
    setStreamingContent("");
    setCurrentWordIndex(0);

    // Prepare text for speech (currency names + farmer name)
    let speechText = prepareForSpeech(fullText);

    // Split into words
    const words = speechText.split(' ');
    wordsRef.current = words;

    // Create utterance
    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.rate = 0.75; // SLOWER (was 0.8)
    utterance.pitch = 1.1;
    utterance.volume = 1.0;

    // Get available voices and pick a nice one
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

    utteranceRef.current = utterance;
    isAISpeakingRef.current = true;
    setIsSpeaking(true);

    let wordIndex = 0;
    let currentText = '';

    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        if (wordIndex < words.length) {
          currentText += (wordIndex === 0 ? '' : ' ') + words[wordIndex];
          setStreamingContent(currentText);
          setCurrentWordIndex(wordIndex + 1);
          wordIndex++;
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
      }
    };

    utterance.onend = () => {
      setStreamingContent(fullText);
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: fullText,
          timestamp: Date.now(),
          financial: isFinancial
        }]);
        setStreamingContent("");
        setIsStreaming(false);
        setIsSpeaking(false);
        isAISpeakingRef.current = false;
      }, 100);
    };

    utterance.onerror = (event) => {
      console.error("Speech error:", event);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: fullText,
        timestamp: Date.now(),
        financial: isFinancial
      }]);
      setStreamingContent("");
      setIsStreaming(false);
      setIsSpeaking(false);
      isAISpeakingRef.current = false;
    };

    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    if (!recognitionRef.current || !voiceEnabled || isAISpeakingRef.current) {
      if (isAISpeakingRef.current) toast.info(`AI is speaking, please wait.`);
      return;
    }
    try {
      recognitionRef.current.start();
      setIsListening(true);
      toast.success(`Listening... speak your question!`, {
        icon: <Mic className="w-4 h-4 text-purple-500" />,
        duration: 2000
      });
    } catch (error) {}
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (error) {}
    }
    setIsListening(false);
  };

  // Submit with synchronized streaming and financial context
  const submitQuestion = async () => {
    if (!userTranscript.trim()) {
      toast.warning(`Type or speak your question.`);
      return;
    }

    if (isAISpeakingRef.current) {
      toast.info(`AI is speaking, please wait.`);
      return;
    }

    stopListening();

    setMessages(prev => [...prev, {
      role: "user",
      content: userTranscript,
      timestamp: Date.now()
    }]);

    const question = userTranscript;
    setUserTranscript("");
    setIsLoading(true);
    nameUsageCountRef.current = 0; // Reset name counter for new response

    const isFinancialQuestion =
      question.toLowerCase().includes('cost') ||
      question.toLowerCase().includes('price') ||
      question.toLowerCase().includes('profit') ||
      question.toLowerCase().includes('margin') ||
      question.toLowerCase().includes('revenue') ||
      question.toLowerCase().includes('income') ||
      question.toLowerCase().includes('expense') ||
      question.toLowerCase().includes('budget') ||
      question.toLowerCase().includes('investment');

    try {
      console.log("Sending question:", question);

      const enhancedSessionData = {
        ...sessionData,
        isFinancialQuestion,
        financialData: sessionData?.grossMarginAnalysis || null,
        inputCosts: sessionData?.inputCosts || null,
        labourCosts: sessionData?.labourCosts || null,
        farmerName: farmerName
      };

      const response = await fetch('/api/farmer/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          userId,
          sessionId,
          sessionData: enhancedSessionData
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status}`);
      }

      const text = await response.text();

      if (!text || text.trim() === '') {
        throw new Error("Empty response from server");
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error("Failed to parse JSON:", parseError);
        throw new Error("Invalid response format from server");
      }

      if (data.success && data.answer) {
        await streamAnswerWithVoice(data.answer, isFinancialQuestion);
        toast.success(`Answer ready!`, {
          icon: isFinancialQuestion ? <DollarSign className="w-4 h-4 text-green-500" /> : <Sparkles className="w-4 h-4 text-yellow-500" />
        });
      } else if (data.error) {
        toast.error(data.error);
        setMessages(prev => [...prev, {
          role: "assistant",
          content: `Oops! ${data.error}`,
          timestamp: Date.now()
        }]);
      } else {
        throw new Error("Unexpected response format");
      }

    } catch (error) {
      console.error("Query error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to process question");

      setMessages(prev => [...prev, {
        role: "assistant",
        content: `Sorry, something went wrong. Try again!`,
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceToggle = (enabled: boolean) => {
    setVoiceEnabled(enabled);
    if (!enabled) {
      stopListening();
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
      isAISpeakingRef.current = false;
      setIsStreaming(false);
      setStreamingContent("");
    } else {
      toast.success(`Voice mode activated! Ask about your farm enterprise finances too!`, {
        icon: <Volume2 className="w-4 h-4 text-green-500" />
      });
      nameUsageCountRef.current = 0;
    }
  };

  // Random icon for each message
  const getRandomIcon = () => {
    const icons = [
      <Sprout className="w-4 h-4 text-emerald-500" />,
      <Leaf className="w-4 h-4 text-green-500" />,
      <Flower2 className="w-4 h-4 text-pink-500" />,
      <Sun className="w-4 h-4 text-yellow-500" />,
      <Star className="w-4 h-4 text-amber-500" />,
      <Gem className="w-4 h-4 text-purple-500" />,
      <Zap className="w-4 h-4 text-blue-500" />,
      <Rocket className="w-4 h-4 text-orange-500" />
    ];
    return icons[Math.floor(Math.random() * icons.length)];
  };

  // Word count indicator for streaming
  const wordProgress = currentWordIndex > 0 && wordsRef.current.length > 0
    ? `${currentWordIndex}/${wordsRef.current.length} words`
    : '';

  // Financial quick questions
  const financialQuickQuestions = [
    { text: 'profit margin', icon: <TrendingUp className="w-4 h-4" />, color: 'from-green-400 to-emerald-400' },
    { text: 'break-even', icon: <Calculator className="w-4 h-4" />, color: 'from-blue-400 to-indigo-400' },
    { text: 'cost of production', icon: <Package className="w-4 h-4" />, color: 'from-amber-400 to-orange-400' },
    { text: 'revenue projection', icon: <DollarSign className="w-4 h-4" />, color: 'from-purple-400 to-pink-400' }
  ];

  return (
    <div className="flex flex-col gap-6 p-4 min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-2xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-2xl p-5 shadow-xl border-2 border-white/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/interview/${sessionId}`}
              className="p-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-xl transition-all duration-300 border border-white/40"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </Link>
            <div>
              <h2 className="font-bold text-xl text-white flex items-center gap-2">
                <Sprout className="w-6 h-6" />
                Ask Your Farming Assistant
                <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
              </h2>
              <p className="text-white/90 flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {sessionData?.county} • {sessionData?.crops?.map((c: string) => `${c} Enterprise`).join(", ")}
                {sessionData?.managementLevel && (
                  <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                    {sessionData.managementLevel}
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFinancial(!showFinancial)}
              className="px-3 py-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-xl flex items-center gap-2 border border-white/40 transition-all duration-300 text-sm"
            >
              <DollarSign className="w-4 h-4" />
              {showFinancial ? "Hide Finance" : "Show Finance"}
            </button>
            <button
              onClick={() => setShowRecommendations(!showRecommendations)}
              className="px-3 py-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-xl flex items-center gap-2 border border-white/40 transition-all duration-300 text-sm"
            >
              <Sparkles className="w-4 h-4" />
              {showRecommendations ? "Hide Tips" : "View Tips"}
            </button>
          </div>
        </div>
      </div>

      {/* Voice Toggle */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-5 shadow-xl border-2 border-white/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-lg text-white flex items-center gap-2">
            <Mic className="w-5 h-5" />
            Voice Mode
            <span className="text-sm bg-white/20 px-2 py-1 rounded-full">Beta</span>
          </h3>
          <VoiceToggle onVoiceToggle={handleVoiceToggle} initialEnabled={voiceEnabled} />
        </div>
        {isSpeaking && (
          <div className="flex items-center gap-2 text-white bg-white/20 p-2 rounded-xl animate-pulse">
            <Volume2 className="w-4 h-4" />
            <span>AI is speaking... {wordProgress}</span>
          </div>
        )}
      </div>

      {/* Financial Summary Card */}
      {showFinancial && sessionData?.grossMarginAnalysis && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-5 shadow-xl border-2 border-white/30">
          <h3 className="font-bold text-lg text-white flex items-center gap-2 mb-3">
            <DollarSign className="w-5 h-5" />
            Your Farm Enterprise Financial Snapshot
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
              <p className="text-white/80 text-xs">Low Input GM</p>
              <p className="text-white font-bold text-lg">{formatCurrencyForDisplay(sessionData.grossMarginAnalysis.low?.grossMargin || 44190, currency)}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
              <p className="text-white/80 text-xs">Medium Input GM</p>
              <p className="text-white font-bold text-lg">{formatCurrencyForDisplay(sessionData.grossMarginAnalysis.medium?.grossMargin || 217710, currency)}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
              <p className="text-white/80 text-xs">High Input GM</p>
              <p className="text-white font-bold text-lg">{formatCurrencyForDisplay(sessionData.grossMarginAnalysis.high?.grossMargin || 433680, currency)}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
              <p className="text-white/80 text-xs">Your Level</p>
              <p className="text-white font-bold text-lg">{sessionData.managementLevel || "Medium"}</p>
            </div>
          </div>
          {sessionData.financialAdvice && (
            <p className="text-white/90 text-sm mt-3 bg-white/10 p-2 rounded-lg">
              {sessionData.financialAdvice.substring(0, 100)}...
            </p>
          )}
          <p className="text-white/80 text-xs mt-2">Every {currency.symbol} 1 invested should return {currency.symbol} 3-5 profit.</p>
        </div>
      )}

      {/* Recommendations Panel */}
      {showRecommendations && recommendations.length > 0 && (
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-5 shadow-xl border-2 border-white/30">
          <h3 className="font-bold text-lg text-white flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5" />
            Personalized Recommendations
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {recommendations.map((rec, idx) => (
              <div key={idx} className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-white">
                <span className="font-bold mr-2">{idx + 1}.</span>
                <span className="text-sm">{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 justify-center">
        <button
          onClick={() => setActiveTab("chat")}
          className={`px-4 py-2 rounded-full font-medium transition-all ${
            activeTab === "chat"
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
              : 'bg-white/80 text-gray-600 hover:bg-white'
          }`}
        >
          <MessageCircle className="w-4 h-4 inline mr-1" />
          Chat
        </button>
        <button
          onClick={() => setActiveTab("financial")}
          className={`px-4 py-2 rounded-full font-medium transition-all ${
            activeTab === "financial"
              ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
              : 'bg-white/80 text-gray-600 hover:bg-white'
          }`}
        >
          <DollarSign className="w-4 h-4 inline mr-1" />
          Financial Q&A
        </button>
        <button
          onClick={() => setActiveTab("summary")}
          className={`px-4 py-2 rounded-full font-medium transition-all ${
            activeTab === "summary"
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
              : 'bg-white/80 text-gray-600 hover:bg-white'
          }`}
        >
          <BarChart3 className="w-4 h-4 inline mr-1" />
          Farm Summary
        </button>
      </div>

      {/* Messages Area */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-xl border-2 border-emerald-200 min-h-[400px] max-h-[500px] overflow-y-auto">
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-in`}>
              <div className={`max-w-[80%] rounded-2xl p-4 shadow-md ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-br-none'
                  : msg.financial
                    ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-gray-800 border-2 border-green-300 rounded-bl-none'
                    : 'bg-gradient-to-r from-amber-100 to-yellow-100 text-gray-800 border-2 border-yellow-300 rounded-bl-none'
              }`}>
                <div className="flex items-start gap-2">
                  {msg.role === 'assistant' && (
                    <div className="mt-1">
                      {msg.financial ? <DollarSign className="w-4 h-4 text-green-600" /> : getRandomIcon()}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <p className={`text-xs mt-2 flex items-center gap-1 ${
                      msg.role === 'user' ? 'text-blue-100' : msg.financial ? 'text-green-700' : 'text-amber-700'
                    }`}>
                      {new Date(msg.timestamp).toLocaleTimeString()}
                      {msg.role === 'assistant' && msg.financial && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          <TrendingUp className="w-3 h-3" />
                        </span>
                      )}
                    </p>
                  </div>
                  {msg.role === 'user' && (
                    <ThumbsUp className="w-4 h-4 text-white/70 mt-1" />
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* SYNCHRONIZED STREAMING */}
          {isStreaming && streamingContent && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl p-4 shadow-md bg-gradient-to-r from-yellow-300 to-amber-300 border-2 border-green-500 rounded-bl-none">
                <div className="flex items-start gap-2">
                  <Volume2 className="w-4 h-4 text-green-600 mt-1 animate-pulse" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-800 font-medium whitespace-pre-wrap">{streamingContent}</p>
                    <p className="text-xs text-green-700 mt-2 flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      Speaking: {wordProgress}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />

          {isLoading && !isStreaming && (
            <div className="flex justify-start">
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-4 border-2 border-purple-300">
                <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
              </div>
            </div>
          )}
        </div>

        {/* Business Tip */}
        <div className="mt-4 p-2 bg-yellow-50 rounded-lg border border-yellow-300">
          <p className="text-xs text-yellow-800 flex items-center gap-1">
            <Rocket className="w-3 h-3" />
            PRO TIP: Every question you ask helps build your profitable farm enterprise!
          </p>
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 rounded-2xl p-5 shadow-xl border-2 border-white/30">
        <div className="flex gap-2">
          <input
            type="text"
            value={userTranscript}
            onChange={(e) => setUserTranscript(e.target.value)}
            placeholder={activeTab === "financial" ? `Ask about costs, profits, margins...` : `Type your question here...`}
            className="flex-1 px-5 py-4 bg-white/90 backdrop-blur-sm border-2 border-white rounded-xl focus:border-purple-400 focus:ring-4 focus:ring-purple-200 transition-all text-gray-800 placeholder-gray-500"
            disabled={isAISpeakingRef.current}
          />
          <button
            onClick={submitQuestion}
            disabled={!userTranscript.trim() || isLoading || isAISpeakingRef.current}
            className={`px-8 py-4 rounded-xl font-bold whitespace-nowrap transition-all duration-300 ${
              userTranscript.trim() && !isLoading && !isAISpeakingRef.current
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl scale-105 hover:scale-110'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                <span>ASK</span>
                {activeTab === "financial" && <DollarSign className="w-4 h-4" />}
              </div>
            )}
          </button>
        </div>

        {/* Voice button */}
        {voiceEnabled && (
          <div className="mt-3">
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={isAISpeakingRef.current}
              className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 font-medium ${
                isListening
                  ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white animate-pulse border-2 border-white'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 border-2 border-white/50'
              } ${isAISpeakingRef.current ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Mic className={`w-5 h-5 ${isListening ? 'animate-pulse' : ''}`} />
              {isListening ? `Listening... Click to stop` : `Click to speak your question`}
            </button>
          </div>
        )}
      </div>

      {/* Quick question chips */}
      <div className="flex flex-wrap gap-2 justify-center">
        {activeTab === "financial" ? (
          financialQuickQuestions.map((item) => (
            <button
              key={item.text}
              onClick={() => setUserTranscript(`What is my ${item.text} for my ${sessionData?.crops?.[0] || 'maize'} enterprise?`)}
              className={`px-4 py-2 bg-gradient-to-r ${item.color} text-white rounded-full text-sm hover:scale-105 transition-all duration-300 shadow-md flex items-center gap-1 border border-white/50`}
            >
              {item.icon}
              {item.text}
            </button>
          ))
        ) : (
          [
            { text: 'fertilizer', icon: <Sprout className="w-4 h-4" />, color: 'from-emerald-400 to-teal-400' },
            { text: 'pests', icon: <Bug className="w-4 h-4" />, color: 'from-red-400 to-rose-400' },
            { text: 'watering', icon: <Droplets className="w-4 h-4" />, color: 'from-blue-400 to-cyan-400' },
            { text: 'harvest', icon: <Wheat className="w-4 h-4" />, color: 'from-amber-400 to-orange-400' },
            { text: 'soil', icon: <Leaf className="w-4 h-4" />, color: 'from-lime-400 to-green-400' },
            { text: 'market', icon: <Award className="w-4 h-4" />, color: 'from-purple-400 to-pink-400' }
          ].map((item) => (
            <button
              key={item.text}
              onClick={() => setUserTranscript(`Tell me about ${item.text} for my ${sessionData?.crops?.[0] || 'crops'} enterprise`)}
              className={`px-4 py-2 bg-gradient-to-r ${item.color} text-white rounded-full text-sm hover:scale-105 transition-all duration-300 shadow-md flex items-center gap-1 border border-white/50`}
            >
              {item.icon}
              {item.text}
            </button>
          ))
        )}
      </div>

      {/* Farm stats footer */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-3 shadow-lg">
        <div className="flex justify-around text-white text-sm">
          <div className="flex items-center gap-1">
            <Sprout className="w-4 h-4" />
            <span>{sessionData?.crops?.map((c: string) => `${c}`).join(", ")}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{sessionData?.county}</span>
          </div>
          <div className="flex items-center gap-1">
            <Rocket className="w-4 h-4" />
            <span>{recommendations.length} tips</span>
          </div>
          {sessionData?.grossMarginAnalysis && (
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              <span>GM Available</span>
            </div>
          )}
        </div>
        <div className="text-center text-white/70 text-xs mt-2">
          Test soil yearly. Knowledge = Profit!
        </div>
      </div>
    </div>
  );
};

export default AskAgent;