// components/AskAgent.tsx - Clean version with infinite loop fix
"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { useOfflineTranslation } from '@/lib/hooks/useOfflineTranslation';
import { VoiceToggle } from "@/components/VoiceToggle";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { OfflineBanner } from "@/components/OfflineBanner";
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
  Flag,
  Globe,
  Wifi,
  WifiOff
} from "lucide-react";
import { useCurrency } from '@/lib/context/CurrencyContext';
import { formatCurrencyForDisplay, formatCurrencyForSpeech } from '@/lib/utils/currency';
import { getLanguageFromCountry } from '@/lib/config/language';

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

interface StructuredItem {
  key: string;
  params?: Record<string, any>;
}

const AskAgent = ({
  userName,
  userId,
  sessionId,
  sessionData,
  recommendations: oldRecommendations
}: AskAgentProps) => {
  // ✅ ALL HOOKS MUST COME FIRST - before any conditional returns

  // Core hooks
  const { t, ready, isOnline } = useOfflineTranslation();
  const { currency } = useCurrency();

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

  // State hooks
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
  const [recognitionLanguage, setRecognitionLanguage] = useState('en-US');

  // Structured recommendations
  const [structuredList, setStructuredList] = useState<StructuredItem[]>([]);
  const [structuredFinancialAdvice, setStructuredFinancialAdvice] = useState<StructuredItem | null>(null);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const isAISpeakingRef = useRef(false);
  const wordsRef = useRef<string[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const streamTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const nameUsageCountRef = useRef(0);
  const welcomeSetRef = useRef(false); // ✅ NEW: Track if welcome message has been set

  // Derived values (not hooks - safe to use here)
  const farmerName = userName;
  const farmerCountry = sessionData?.country || 'kenya';

  // 🧪 TEST API - Temporary code to debug the API
  useEffect(() => {
    const testAPI = async () => {
      try {
        console.log("🧪 Testing API with POST...");
        const testResponse = await fetch('/api/farmer/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            question: "test question",
            userId: "test-user",
            sessionId: "test-session",
            sessionData: {}
          })
        });

        console.log("🧪 Test response status:", testResponse.status);
        console.log("🧪 Test response headers:", Object.fromEntries(testResponse.headers.entries()));

        if (testResponse.ok) {
          const testData = await testResponse.json();
          console.log("✅ Test success:", testData);
        } else {
          const testText = await testResponse.text();
          console.log("❌ Test error:", testText.substring(0, 500));
        }
      } catch (error) {
        console.error("💥 Test failed:", error);
      }
    };

    testAPI();
  }, []);

  // Extract structured data from session
  useEffect(() => {
    if (sessionData?.structuredList) {
      setStructuredList(sessionData.structuredList);
    }
    if (sessionData?.structuredFinancialAdvice) {
      setStructuredFinancialAdvice(sessionData.structuredFinancialAdvice);
    }
  }, [sessionData]);

  // Update language based on country
  useEffect(() => {
    if (sessionData?.country) {
      const lang = getLanguageFromCountry(sessionData.country);
      setRecognitionLanguage(lang);
      console.log(`AskAgent: Language set to ${lang} for country ${sessionData.country}`);
      if (recognitionRef.current) {
        recognitionRef.current.lang = lang;
      }
    }
  }, [sessionData]);

  // Reset name usage counter when session changes
  useEffect(() => {
    nameUsageCountRef.current = 0;
  }, [sessionId]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  // Initialize speech recognition and set welcome message - ✅ FIXED: only runs once
  useEffect(() => {
    // Skip if welcome message already set
    if (welcomeSetRef.current) return;

    // Initialize speech recognition
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = recognitionLanguage;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setUserTranscript(transcript);
      };

      recognitionRef.current.onend = () => setIsListening(false);
      recognitionRef.current.onerror = () => setIsListening(false);

      console.log(`Speech recognition initialized with language: ${recognitionLanguage}`);
    }

    // Set welcome message only once
    const greetings = [
      safeT('greeting_1'),
      safeT('greeting_2'),
      safeT('greeting_3'),
      safeT('greeting_4'),
      safeT('greeting_5'),
      safeT('greeting_6')
    ];
    const greeting = greetings[Math.floor(Math.random() * greetings.length)];

    let welcomeContent = `${greeting} ${safeT('welcome_question_prefix')}`;

    if (sessionData) {
      const cropList = sessionData?.crops?.map((c: string) => `${c} ${safeT('crop_enterprise')}`).join(", ") || safeT('crop_enterprises_placeholder');
      welcomeContent += safeT('welcome_for_crops', { crops: cropList, county: sessionData?.county || safeT('your_area') });

      if (sessionData.managementLevel) {
        welcomeContent += safeT('management_level', { level: sessionData.managementLevel });
      }

      if (sessionData.grossMarginAnalysis) {
        welcomeContent += safeT('financial_help');
      }
    }

    welcomeContent += safeT('what_would_you_like_to_know');

    setMessages([{
      role: "assistant",
      content: welcomeContent,
      timestamp: Date.now()
    }]);

    welcomeSetRef.current = true; // ✅ Mark as set

    // Cleanup function
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
  }, [sessionData, recognitionLanguage]); // ✅ Only run when sessionData or recognitionLanguage changes

  // ✅ NOW you can have conditional returns after ALL hooks
  if (!ready) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner message="Loading your farming assistant..." />
      </div>
    );
  }

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

  // Clean text of emojis and formatting
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

  // Prepare text for speech with personalization
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

    nameUsageCountRef.current++;
    const useName = nameUsageCountRef.current % 3 === 0;

    speechText = speechText
      .replace(/\b(farmer)\b/gi, useName ? farmerName : 'the farmer')
      .replace(/\b(you)\b/gi, useName ? farmerName : 'you')
      .replace(/\b(your)\b/gi, useName ? `${farmerName}'s` : 'your');

    return speechText;
  };

  // Synchronized streaming function
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

    let speechText = prepareForSpeech(fullText);
    const words = speechText.split(' ');
    wordsRef.current = words;

    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.volume = 1.0;
    utterance.lang = recognitionLanguage;

    // Comprehensive female voice names
    const femaleVoiceNames = [
      'Samantha', 'Victoria', 'Karen', 'Moira', 'Tessa', 'Veena', 'Nicky',
      'Catherine', 'Fiona', 'Martha', 'Naomi', 'Sangeeta', 'Rishi', 'Lekha',
      'Google UK English Female', 'Microsoft Jenny', 'Microsoft Aria',
      'Microsoft Sonia', 'Microsoft Zira', 'Microsoft Libby', 'Microsoft Heidi',
      'Microsoft Hazel', 'Microsoft Susan', 'Microsoft Kate', 'Microsoft Helen',
      'Google Deutsch Female', 'Google français Female', 'Google español Female',
      'Audrey', 'Amélie', 'Chloé', 'Margaux', 'Stéphanie', 'Cécile',
      'Julie', 'Nathalie', 'Sandrine', 'Valérie', 'Véronique',
      'Mónica', 'Carmen', 'Paloma', 'Lucia', 'Sofia', 'Elena',
      'Ana', 'Isabel', 'Laura', 'María', 'Patricia', 'Rosa',
      'Rafiki', 'Zawadi', 'Aisha', 'Makena', 'Subira', 'Asha',
      'Fatuma', 'Halima', 'Jamila', 'Khadija', 'Mariam', 'Salma',
      'Ivy', 'Joanna', 'Kendra', 'Kimberly', 'Salli', 'Amy', 'Emma',
      'Marlene', 'Vicki', 'Katja', 'Mizuki', 'Seoyeon', 'Zhiyu',
      'Aditi', 'Lekha', 'Nora', 'Liv', 'Ewa', 'Maja', 'Gwyneth',
      'Celine', 'Lea', 'Mathilde', 'Chantal', 'Cecile', 'Helene'
    ];

    const voices = window.speechSynthesis.getVoices();
    const matchingVoices = voices.filter(v => v.lang === recognitionLanguage);
    let preferredVoice;

    if (matchingVoices.length > 0) {
      preferredVoice = matchingVoices.find(v =>
        femaleVoiceNames.some(name => v.name.includes(name))
      );

      if (!preferredVoice) {
        const malePatterns = ['Daniel', 'James', 'David', 'John', 'Paul', 'Mark', 'Michael', 'Alex', 'Thomas', 'Robert', 'Richard'];
        preferredVoice = matchingVoices.find(v =>
          !malePatterns.some(pattern => v.name.includes(pattern))
        ) || matchingVoices[0];
        console.log('No female voice found for language, using non-male voice:', preferredVoice.name);
      }
    } else {
      preferredVoice = voices.find(v =>
        femaleVoiceNames.some(name => v.name.includes(name))
      ) || voices.find(v => !v.name.includes('Daniel') && !v.name.includes('James') && !v.name.includes('David'));
    }

    if (preferredVoice) {
      utterance.voice = preferredVoice;
      console.log(`Using FEMALE voice: ${preferredVoice.name} (${preferredVoice.lang})`);
    }

    utteranceRef.current = utterance;
    isAISpeakingRef.current = true;
    setIsSpeaking(true);

    let wordIndex = 0;
    let currentText = '';

    utterance.onboundary = (event) => {
      if (event.name === 'word' && wordIndex < words.length) {
        currentText += (wordIndex === 0 ? '' : ' ') + words[wordIndex];
        setStreamingContent(currentText);
        setCurrentWordIndex(wordIndex + 1);
        wordIndex++;
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
      if (isAISpeakingRef.current) toast.info(safeT('ai_speaking_wait'));
      return;
    }
    try {
      recognitionRef.current.start();
      setIsListening(true);
      toast.success(safeT('listening_speak_question'), {
        icon: <Mic className="w-4 h-4 text-purple-500" />,
        duration: 2000
      });
      console.log(`Started listening with language: ${recognitionLanguage}`);
    } catch (error) {}
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (error) {}
    }
    setIsListening(false);
  };

  // Helper to resolve nested translation keys
  const resolveNestedTranslations = (obj: any): any => {
    if (!obj) return obj;
    if (Array.isArray(obj)) return obj.map(resolveNestedTranslations);
    if (typeof obj === 'object') {
      if (obj.key && typeof obj.key === 'string') {
        return safeT(obj.key, resolveNestedTranslations(obj.params));
      }
      const newObj: any = {};
      for (const [k, v] of Object.entries(obj)) {
        newObj[k] = resolveNestedTranslations(v);
      }
      return newObj;
    }
    return obj;
  };

  const submitQuestion = async () => {
    if (!userTranscript.trim()) {
      toast.warning(safeT('type_or_speak_question'));
      return;
    }

    if (isAISpeakingRef.current) {
      toast.info(safeT('ai_speaking_wait'));
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
    nameUsageCountRef.current = 0;

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
      const enhancedSessionData = {
        ...sessionData,
        isFinancialQuestion,
        financialData: sessionData?.grossMarginAnalysis || null,
        inputCosts: sessionData?.inputCosts || null,
        labourCosts: sessionData?.labourCosts || null,
        farmerName: farmerName,
        country: farmerCountry
      };

      const response = await fetch('/api/farmer/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          question,
          userId,
          sessionId,
          sessionData: enhancedSessionData
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ API error response:", errorText.substring(0, 500));
        if (errorText.trim().startsWith('<!DOCTYPE')) {
          throw new Error("API endpoint returned HTML. The route might not be properly registered.");
        }
        throw new Error(`Server error: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error("❌ Non-JSON response:", text.substring(0, 500));
        throw new Error(`Server returned ${contentType || 'unknown'} instead of JSON`);
      }

      const data = await response.json();

      if (data.success && data.answer) {
        let answerText: string;
        if (typeof data.answer === 'string') {
          answerText = data.answer;
        } else if (typeof data.answer === 'object' && data.answer.key) {
          const resolvedParams = resolveNestedTranslations(data.answer.params || {});
          answerText = safeT(data.answer.key, resolvedParams);
        } else {
          throw new Error("Unexpected answer format");
        }

        await streamAnswerWithVoice(answerText, isFinancialQuestion);
        toast.success(safeT('answer_ready'), {
          icon: isFinancialQuestion ? <DollarSign className="w-4 h-4 text-green-500" /> : <Sparkles className="w-4 h-4 text-yellow-500" />
        });
      } else if (data.error) {
        toast.error(data.error);
        setMessages(prev => [...prev, {
          role: "assistant",
          content: safeT('oops_error', { error: data.error }),
          timestamp: Date.now()
        }]);
      } else {
        throw new Error("Unexpected answer format");
      }

    } catch (error) {
      console.error("❌ Query error:", error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process question';
      toast.error(errorMessage);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `Sorry, I couldn't process your question. ${errorMessage}`,
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
      toast.success(safeT('voice_mode_activated_ask'), {
        icon: <Volume2 className="w-4 h-4 text-green-500" />
      });
      nameUsageCountRef.current = 0;
    }
  };

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

  const wordProgress = currentWordIndex > 0 && wordsRef.current.length > 0
    ? `${currentWordIndex}/${wordsRef.current.length} ${safeT('words')}`
    : '';

  const financialQuickQuestions = [
    {
      text: safeT('profit_margin'),
      icon: <TrendingUp className="w-4 h-4" />,
      color: 'from-green-400 to-emerald-400'
    },
    {
      text: safeT('break_even'),
      icon: <Calculator className="w-4 h-4" />,
      color: 'from-blue-400 to-indigo-400'
    },
    {
      text: safeT('cost_of_production'),
      icon: <Package className="w-4 h-4" />,
      color: 'from-amber-400 to-orange-400'
    },
    {
      text: safeT('revenue_projection'),
      icon: <DollarSign className="w-4 h-4" />,
      color: 'from-purple-400 to-pink-400'
    }
  ];

  const generalQuickQuestions = [
    {
      text: safeT('fertilizer'),
      icon: <Sprout className="w-4 h-4" />,
      color: 'from-emerald-400 to-teal-400'
    },
    {
      text: safeT('pests'),
      icon: <Bug className="w-4 h-4" />,
      color: 'from-red-400 to-rose-400'
    },
    {
      text: safeT('watering'),
      icon: <Droplets className="w-4 h-4" />,
      color: 'from-blue-400 to-cyan-400'
    },
    {
      text: safeT('harvest'),
      icon: <Wheat className="w-4 h-4" />,
      color: 'from-amber-400 to-orange-400'
    },
    {
      text: safeT('soil'),
      icon: <Leaf className="w-4 h-4" />,
      color: 'from-lime-400 to-green-400'
    },
    {
      text: safeT('market'),
      icon: <Award className="w-4 h-4" />,
      color: 'from-purple-400 to-pink-400'
    }
  ];

  // Handle grouped recommendations
  const renderRecommendationText = (item: StructuredItem, idx: number) => {
    const resolvedParams = resolveNestedTranslations(item.params || {});

    if (item.key === 'gap_grouped' && resolvedParams.gapKey) {
      const gapText = safeT(resolvedParams.gapKey, {});
      resolvedParams.gapText = gapText;
    }

    const text = safeT(item.key, resolvedParams);

    return (
      <div key={idx} className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-white">
        <span className="font-bold mr-2">{idx + 1}.</span>
        <span className="text-sm whitespace-pre-line">{text}</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 p-4 min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-2xl">
      {/* Offline Status Banner */}
      {!isOnline && (
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-3 flex items-center gap-2">
          <WifiOff className="w-5 h-5 text-yellow-600" />
          <p className="text-sm text-yellow-800">
            {safeT('offline_mode') || "You're offline. Using cached translations."}
          </p>
        </div>
      )}

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
                {safeT('ask_your_farming_assistant')}
                <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
              </h2>
              <p className="text-white/90 flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {sessionData?.county} • {sessionData?.crops?.map((c: string) => `${c} ${safeT('crop_enterprise')}`).join(", ")}
                <Globe className="w-3 h-3 ml-1" />
                <span className="text-xs bg-white/20 px-1 rounded">{sessionData?.country || 'Kenya'}</span>
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
              {showFinancial ? safeT('hide_finance') : safeT('show_finance')}
            </button>
            <button
              onClick={() => setShowRecommendations(!showRecommendations)}
              className="px-3 py-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-xl flex items-center gap-2 border border-white/40 transition-all duration-300 text-sm"
            >
              <Sparkles className="w-4 h-4" />
              {showRecommendations ? safeT('hide_tips') : safeT('view_tips')}
            </button>
          </div>
        </div>
      </div>

      {/* Compact Voice Toggle */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-3 shadow-xl border-2 border-white/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-white" />
            <span className="font-semibold text-white">{safeT('voice_mode')}</span>
            <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">{safeT('beta')}</span>
          </div>
          <VoiceToggle onVoiceToggle={handleVoiceToggle} initialEnabled={voiceEnabled} />
        </div>
        {isSpeaking && (
          <div className="mt-1 text-xs text-white/80 flex items-center gap-1">
            <Volume2 className="w-3 h-3 animate-pulse" />
            <span>{safeT('speaking')} {wordProgress}</span>
          </div>
        )}
        <div className="mt-1 text-xs text-white/60 text-right">{safeT('language')}: {recognitionLanguage}</div>
      </div>

      {/* Recommendations Panel */}
      {showRecommendations && (
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-5 shadow-xl border-2 border-white/30">
          <h3 className="font-bold text-lg text-white flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5" />
            {safeT('personalized_recommendations')}
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {structuredList.length > 0 ? (
              structuredList.map((item, idx) => renderRecommendationText(item, idx))
            ) : (
              oldRecommendations.map((rec, idx) => (
                <div key={idx} className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-white">
                  <span className="font-bold mr-2">{idx + 1}.</span>
                  <span className="text-sm">{rec}</span>
                </div>
              ))
            )}
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
          {safeT('chat')}
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
          {safeT('financial_qa')}
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
          {safeT('farm_summary')}
        </button>
      </div>

      {/* Messages Area */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-xl border-2 border-emerald-200 min-h-[400px] max-h-[600px] overflow-y-auto">
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
                      {safeT('speaking')} {wordProgress}
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
            {safeT('pro_tip')}
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
            placeholder={activeTab === "financial" ? safeT('ask_about_costs') : safeT('type_question')}
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
                <span>{safeT('ask')}</span>
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
              {isListening ? safeT('listening_click_stop') : safeT('click_to_speak')}
            </button>
          </div>
        )}
      </div>

      {/* Quick question chips */}
      <div className="flex flex-wrap gap-2 justify-center">
        {activeTab === "financial" ? (
          financialQuickQuestions.map((item, index) => (
            <button
              key={`financial-${index}`}
              onClick={() => setUserTranscript(safeT('ask_my_question_template', { topic: item.text, crop: sessionData?.crops?.[0] || 'maize' }))}
              className={`px-4 py-2 bg-gradient-to-r ${item.color} text-white rounded-full text-sm hover:scale-105 transition-all duration-300 shadow-md flex items-center gap-1 border border-white/50`}
            >
              {item.icon}
              {item.text}
            </button>
          ))
        ) : (
          generalQuickQuestions.map((item, index) => (
            <button
              key={`general-${index}`}
              onClick={() => setUserTranscript(safeT('tell_me_about_template', { topic: item.text, crop: sessionData?.crops?.[0] || 'crops' }))}
              className={`px-4 py-2 bg-gradient-to-r ${item.color} text-white rounded-full text-sm hover:scale-105 transition-all duration-300 shadow-md flex items-center gap-1 border border-white/50`}
            >
              {item.icon}
              {item.text}
            </button>
          ))
        )}
      </div>

      {/* Offline Banner */}
      <OfflineBanner />
    </div>
  );
};

export default AskAgent;