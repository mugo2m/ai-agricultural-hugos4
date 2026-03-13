// components/Agent.tsx - Fixed Karaoke: only spoken words appear
"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { useTranslation } from 'react-i18next';
import VoiceService from "@/lib/voice/VoiceService";
import { VoiceToggle } from "@/components/VoiceToggle";
import { MPESAPaymentModal } from "@/components/Payment/MPESAPaymentModal";
import {
  Sparkles,
  Volume2,
  Mic,
  Loader2,
  Sprout,
  MapPin,
  ArrowLeft,
  MessageCircle,
  ArrowRight,
  DollarSign,
  TrendingUp,
  Package,
  Tractor,
  Droplets,
  Sun,
  Leaf,
  Flower2,
  Wheat,
  Coffee,
  Apple,
  Heart,
  BarChart3,
  Table,
  Calculator,
  Wallet,
  ChevronRight,
  Download,
  Share2,
  Beaker,
  FlaskConical,
  AlertCircle,
  CheckCircle2,
  VolumeX,
  Pause,
  Play,
  Award,
  Gem,
  Rocket,
  Zap,
  Target,
  Crown,
  Globe
} from "lucide-react";
import { useCurrency } from '@/lib/context/CurrencyContext';
import { formatCurrencyForDisplay, formatCurrencyForSpeech } from '@/lib/utils/currency';
import { getLanguageFromCountry } from '@/lib/config/language';

interface AgentProps {
  userName: string;
  userId?: string;
  interviewId?: string;
  sessionData?: any;
}

interface StructuredItem {
  key: string;
  params?: Record<string, any>;
}

const Agent = ({
  userName,
  userId,
  interviewId,
  sessionData
}: AgentProps) => {
  const { t } = useTranslation();
  const { currency } = useCurrency();
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [voiceInitializing, setVoiceInitializing] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  const [paymentChecked, setPaymentChecked] = useState(false);
  const [paymentUsed, setPaymentUsed] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [welcomeSpoken, setWelcomeSpoken] = useState(false);
  const [recommendationsSpoken, setRecommendationsSpoken] = useState(false);
  const [showFinancials, setShowFinancials] = useState(false);

  // Structured recommendations
  const [structuredList, setStructuredList] = useState<any[]>([]);
  const [structuredFinancialAdvice, setStructuredFinancialAdvice] = useState<any>(null);

  // Voice state
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Track which recommendations have been read
  const [readRecommendations, setReadRecommendations] = useState<Set<number>>(new Set());

  // Karaoke streaming for recommendations
  const [recommendationStreams, setRecommendationStreams] = useState<{[key: number]: string}>({});
  const [activeStreamingRec, setActiveStreamingRec] = useState<number | null>(null);
  const recWordsRef = useRef<{[key: number]: string[]}>({});
  const isAISpeakingRef = useRef(false);
  const nameUsageCountRef = useRef(0);

  const voiceServiceRef = useRef<VoiceService | null>(null);
  const mountedRef = useRef(true);
  const voiceServiceInitializedRef = useRef(false);

  // Soil test data
  const soilTest = sessionData?.soilTest;
  const hasSoilTest = soilTest && soilTest.testDate;
  const interventions = soilTest?.interventions || [];
  const fertilizerPlan = soilTest?.fertilizerPlan;

  // Get farmer name and country from session
  const farmerName = sessionData?.farmerName || userName || "Farmer";
  const farmerCountry = sessionData?.country || 'kenya';
  const recognitionLanguage = getLanguageFromCountry(farmerCountry);

  // Extract structured data from session
  useEffect(() => {
    if (sessionData?.structuredList) {
      setStructuredList(sessionData.structuredList);
    }
    if (sessionData?.structuredFinancialAdvice) {
      setStructuredFinancialAdvice(sessionData.structuredFinancialAdvice);
    }
  }, [sessionData]);

  // Helper to resolve nested translation keys
  const resolveNestedTranslations = (obj: any): any => {
    if (!obj) return obj;
    if (Array.isArray(obj)) return obj.map(resolveNestedTranslations);
    if (typeof obj === 'object') {
      if (obj.key && typeof obj.key === 'string') {
        return t(obj.key, resolveNestedTranslations(obj.params));
      }
      const newObj: any = {};
      for (const [k, v] of Object.entries(obj)) {
        newObj[k] = resolveNestedTranslations(v);
      }
      return newObj;
    }
    return obj;
  };

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

  useEffect(() => {
    nameUsageCountRef.current = 0;
  }, [sessionData]);

  // Check speech support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const supported = 'speechSynthesis' in window;
      setSpeechSupported(supported);
      console.log("Speech synthesis supported:", supported);

      if (supported) {
        const loadVoices = () => {
          const voices = window.speechSynthesis.getVoices();
          if (voices.length > 0) {
            setVoicesLoaded(true);
            console.log(`${voices.length} voices loaded`);
          }
        };

        loadVoices();

        if (window.speechSynthesis.onvoiceschanged !== undefined) {
          window.speechSynthesis.onvoiceschanged = loadVoices;
        }
      }
    }
  }, []);

  // Payment check
  useEffect(() => {
    console.log(`Payment check - INTERVIEW UNLOCKED`);
    setHasPaid(true);
    setPaymentChecked(true);
  }, [interviewId, userId]);

  // Voice service init with country
  useEffect(() => {
    if (!mountedRef.current) return;
    if (voiceServiceInitializedRef.current && voiceServiceRef.current) return;

    if (!voiceEnabled) {
      if (voiceServiceRef.current) {
        voiceServiceRef.current.destroy();
        voiceServiceRef.current = null;
        voiceServiceInitializedRef.current = false;
      }
      return;
    }

    if (voiceEnabled && !voiceServiceRef.current && !voiceServiceInitializedRef.current) {
      let currentUserId = userId;
      if (!currentUserId) {
        currentUserId = localStorage.getItem('userId') || `user-${Date.now()}`;
        localStorage.setItem('userId', currentUserId);
      }

      try {
        voiceServiceRef.current = new VoiceService({
          interviewId: interviewId || `demo-${Date.now()}`,
          userId: currentUserId,
          type: "practice",
          speechRate: 1.0, // Faster speech
          speechVolume: 0.8,
          country: farmerCountry,
          farmerName: farmerName
        });

        voiceServiceInitializedRef.current = true;
        setVoiceInitializing(false);
        console.log(`VoiceService created for ${farmerName} (Country: ${farmerCountry})`);

        toast.success(t('smart_farmer_here') || `Smart Farmer AI is here!`);
      } catch (error: any) {
        console.error("Failed to initialize VoiceService:", error);
        toast.error(t('voice_service_failed') || "Failed to initialize voice service");
        setVoiceInitializing(false);
      }
    }
  }, [voiceEnabled, farmerName, farmerCountry, t]);

  // ============ KARAOKE STREAMING ============
  const streamRecommendationKaraoke = async (recommendation: string, index: number) => {
    if (!voiceEnabled || !window.speechSynthesis || !voicesLoaded) {
      // Fallback: just show the whole text
      setRecommendationStreams(prev => ({ ...prev, [index]: recommendation }));
      setReadRecommendations(prev => new Set(prev).add(index));
      return;
    }

    // Cancel any ongoing speech for this recommendation
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setActiveStreamingRec(index);
    const words = recommendation.split(' ');
    recWordsRef.current[index] = words;
    setRecommendationStreams(prev => ({ ...prev, [index]: "" })); // start empty

    const utterance = new SpeechSynthesisUtterance(recommendation);
    utterance.rate = 1.0; // Faster speech
    utterance.pitch = 1.1;
    utterance.volume = 1.0;
    utterance.lang = recognitionLanguage;

    // Female voice names (common across browsers)
    const femaleVoiceNames = [
      'Jenny', 'Aria', 'Sonia', 'Samantha', 'Zira', 'Libby', 'Hazel',
      'Susan', 'Kate', 'Google UK English Female', 'Microsoft Jenny',
      'Microsoft Aria', 'Microsoft Sonia', 'Microsoft Zira', 'Microsoft Libby',
      'Rafiki' // Swahili female voice
    ];

    const voices = window.speechSynthesis.getVoices();
    const matchingVoices = voices.filter(v => v.lang === recognitionLanguage);
    let preferredVoice;

    if (matchingVoices.length > 0) {
      // First try to find a female voice in the matching language
      preferredVoice = matchingVoices.find(v =>
        femaleVoiceNames.some(name => v.name.includes(name))
      );

      // If no female voice found in matching language, take any voice in that language
      if (!preferredVoice) {
        preferredVoice = matchingVoices[0];
        console.log('No female voice found for language, using:', preferredVoice.name);
      }
    } else {
      // Fallback to any voice, preferring female
      preferredVoice = voices.find(v =>
        femaleVoiceNames.some(name => v.name.includes(name))
      ) || voices[0];
    }

    if (preferredVoice) {
      utterance.voice = preferredVoice;
      console.log(`Using voice: ${preferredVoice.name} (${preferredVoice.lang})`);
    }

    currentUtteranceRef.current = utterance;

    let wordIndex = 0;
    let currentText = '';

    utterance.onboundary = (event) => {
      if (event.name === 'word' && wordIndex < words.length) {
        currentText += (wordIndex === 0 ? '' : ' ') + words[wordIndex];
        setRecommendationStreams(prev => ({ ...prev, [index]: currentText }));
        wordIndex++;
      }
    };

    utterance.onend = () => {
      // Show full text after finished
      setRecommendationStreams(prev => ({ ...prev, [index]: recommendation }));
      setReadRecommendations(prev => new Set(prev).add(index));
      setActiveStreamingRec(null);
      currentUtteranceRef.current = null;
    };

    utterance.onerror = (event) => {
      console.error("Speech error:", event);
      setRecommendationStreams(prev => ({ ...prev, [index]: recommendation }));
      setReadRecommendations(prev => new Set(prev).add(index));
      setActiveStreamingRec(null);
      currentUtteranceRef.current = null;
    };

    window.speechSynthesis.speak(utterance);
  };

  // Fallback speak for intro and financial advice (non‑karaoke)
  const speakWithVoice = async (text: string) => {
    isAISpeakingRef.current = true;

    await new Promise(resolve => setTimeout(resolve, 100));

    if (voiceServiceRef.current) {
      if (typeof voiceServiceRef.current.speakStreaming === 'function') {
        await voiceServiceRef.current.speakStreaming(text);
      } else {
        await voiceServiceRef.current.speak(text);
      }
      isAISpeakingRef.current = false;
      return;
    }

    // Fallback: use window.speechSynthesis
    if (!window.speechSynthesis) {
      console.log("AI (no speech):", text);
      isAISpeakingRef.current = false;
      return;
    }

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0; // Faster speech
    utterance.pitch = 1.1;
    utterance.volume = 1.0;
    utterance.lang = recognitionLanguage;

    // Female voice names
    const femaleVoiceNames = [
      'Jenny', 'Aria', 'Sonia', 'Samantha', 'Zira', 'Libby', 'Hazel',
      'Susan', 'Kate', 'Google UK English Female', 'Microsoft Jenny',
      'Microsoft Aria', 'Microsoft Sonia', 'Microsoft Zira', 'Microsoft Libby',
      'Rafiki'
    ];

    const voices = window.speechSynthesis.getVoices();
    const matchingVoices = voices.filter(v => v.lang === recognitionLanguage);

    if (matchingVoices.length > 0) {
      const preferred = matchingVoices.find(v =>
        femaleVoiceNames.some(name => v.name.includes(name))
      ) || matchingVoices[0];
      utterance.voice = preferred;
      console.log(`Using voice: ${preferred.name} (${preferred.lang})`);
    }

    utterance.onend = () => {
      isAISpeakingRef.current = false;
    };
    utterance.onerror = () => {
      isAISpeakingRef.current = false;
    };

    window.speechSynthesis.speak(utterance);
  };

  // Auto-stream all recommendations
  const streamAllRecommendations = async () => {
    if (structuredList.length === 0 || recommendationsSpoken) return;

    setRecommendationsSpoken(true);
    setRecommendationStreams({});
    setReadRecommendations(new Set());
    nameUsageCountRef.current = 0;

    const currencyName = getCurrencyName();

    let introMessage = t('prepared_recommendations', 'I\'ve prepared personalized recommendations for your farm enterprise. ');
    if (hasSoilTest && fertilizerPlan?.totalCost) {
      introMessage += t('soil_test_recommendations', {
        amount: fertilizerPlan.totalCost.toLocaleString(),
        currencyName
      }) + ' ';
    } else if (hasSoilTest) {
      introMessage += t('soil_test_calculated', 'Based on your soil test, I\'ve calculated precision fertilizer recommendations. ');
    }

    await speakWithVoice(introMessage);
    await new Promise(resolve => setTimeout(resolve, 2500));

    for (let i = 0; i < structuredList.length; i++) {
      const item = structuredList[i];
      const recommendation = t(item.key, item.params);

      await streamRecommendationKaraoke(recommendation, i);
      await new Promise(resolve => setTimeout(resolve, 4000));

      while (currentUtteranceRef.current !== null) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    if (structuredFinancialAdvice) {
      const financialText = t(structuredFinancialAdvice.key, structuredFinancialAdvice.params);
      await speakWithVoice(financialText);
      await new Promise(resolve => setTimeout(resolve, 2500));
    }

    await speakWithVoice(t('post_recommendations'));
  };

  const startVoiceInterview = async () => {
    if (interviewId && userId) {
      if (paymentUsed) {
        toast.info(t('payment_used_new'));
        setShowPaymentModal(true);
        return;
      }
      if (!hasPaid) {
        toast.info(t('payment_required_to_start'));
        setShowPaymentModal(true);
        return;
      }
    }

    if (!voiceServiceRef.current) {
      if (!voiceEnabled) {
        toast.error(t('enable_voice_first'));
        return;
      }

      const initToast = toast.loading(t('initializing_voice'));
      setVoiceInitializing(true);

      let attempts = 0;
      while (!voiceServiceRef.current && attempts < 15) {
        await new Promise(resolve => setTimeout(resolve, 300));
        attempts++;
      }

      toast.dismiss(initToast);
      setVoiceInitializing(false);

      if (!voiceServiceRef.current) {
        toast.error(t('voice_service_failed'));
        return;
      }
    }

    setIsLoading(true);

    try {
      if (sessionData && voiceServiceRef.current && typeof voiceServiceRef.current.startFarmerSession === 'function') {
        await voiceServiceRef.current.startFarmerSession(sessionData);
      }

      if (sessionData && !welcomeSpoken) {
        setWelcomeSpoken(true);
        nameUsageCountRef.current = 0;

        try {
          const welcomeText = t('welcome_farm_plan');
          await speakWithVoice(welcomeText);
          await new Promise(resolve => setTimeout(resolve, 3000));
          await streamAllRecommendations();
        } catch (speechError) {
          console.error("Speech error:", speechError);
          // fallback: show all recommendations as plain text
          structuredList.forEach((item, i) => {
            setRecommendationStreams(prev => ({ ...prev, [i]: t(item.key, item.params) }));
            setReadRecommendations(prev => new Set(prev).add(i));
          });
        }
      }

      toast.success(t('ready_ask_away'));
    } catch (error: any) {
      console.error("Failed to start:", error);
      toast.error(t('failed_to_start', { message: error.message }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceToggle = (enabled: boolean) => {
    setVoiceEnabled(enabled);
    if (enabled) {
      toast.success(t('voice_mode_activated'));
      nameUsageCountRef.current = 0;
    } else {
      toast.info(t('voice_mode_disabled'));
    }
  };

  const isStartButtonDisabled = isLoading || !voiceEnabled || !hasPaid || voiceInitializing;

  const getStartButtonText = () => {
    if (isLoading) return t('starting');
    if (voiceInitializing) return t('initializing');
    if (!hasPaid) return t('pay_to_start', { symbol: currency.symbol, amount: 3 });
    return t('start_voice_session');
  };

  // Handle grouped recommendations - FIXED for gap_grouped
  const renderRecommendationText = (item: StructuredItem, idx: number) => {
    // Special handling for gap_grouped which contains a nested gapKey
    if (item.key === 'gap_grouped') {
      const params = item.params || {};
      const gapKey = params.gapKey;

      if (gapKey) {
        // Get the actual GAP text from translations
        const gapText = t(gapKey, {});

        // Build the complete text with title + gapText + remember
        const title = params.title || `GOOD AGRICULTURAL PRACTICES FOR YOUR FARM`;
        const remember = params.remember || 'REMEMBER: Every practice you do well puts more money in your pocket';

        const fullText = `${title}\n\n${gapText}\n\n${remember}`;

        // Only show if read
        if (!readRecommendations.has(idx)) return null;

        return (
          <div key={idx} className="rounded-xl p-5 transition-all duration-300 border-2 bg-purple-50 border-purple-300">
            <div className="flex items-start gap-4">
              <span className="rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0 bg-purple-500 text-white">
                {idx + 1}
              </span>
              <div className="flex-1">
                <div className="min-h-[60px]">
                  <p className="text-xl text-gray-800 leading-relaxed whitespace-pre-line">
                    {fullText}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      }
    }

    // For all other items, use the streaming/karaoke display
    const streamingText = recommendationStreams[idx];
    const isActive = activeStreamingRec === idx;
    const isRead = readRecommendations.has(idx);

    // Only show if streaming (for active) or already read
    if (!isActive && !isRead) return null;
    if (isActive && !streamingText) return null;

    const displayText = streamingText || t(item.key, item.params);

    return (
      <div
        key={idx}
        className={`
          rounded-xl p-5 transition-all duration-300 border-2
          ${isActive
            ? 'bg-purple-100 border-purple-500 shadow-2xl scale-105'
            : isRead
              ? 'bg-purple-50 border-purple-300'
              : 'bg-gray-50 border-gray-200'
          }
        `}
      >
        <div className="flex items-start gap-4">
          <span className={`
            rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0
            ${isActive ? 'bg-purple-600 text-white' : 'bg-purple-500 text-white'}
          `}>
            {idx + 1}
          </span>

          <div className="flex-1">
            <div className="min-h-[60px]">
              <p className="text-xl text-gray-800 leading-relaxed whitespace-pre-line">
                {displayText}
              </p>
            </div>

            {/* Karaoke progress bar */}
            {isActive && recWordsRef.current[idx] && (
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-600 transition-all duration-150"
                    style={{
                      width: `${((streamingText?.split(' ').length || 0) / recWordsRef.current[idx].length) * 100}%`
                    }}
                  />
                </div>
                <span className="text-sm text-purple-700 font-medium">
                  {streamingText?.split(' ').length || 0}/{recWordsRef.current[idx].length} {t('words')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 p-4 bg-gradient-to-br from-slate-50 to-white rounded-2xl">
      {/* Header - with MockMate Logo and dark blue hugos */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-emerald-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/interview/${interviewId}`}
              className="p-2 bg-emerald-100 hover:bg-emerald-200 rounded-xl transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-emerald-700" />
            </Link>

            {/* MockMate Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-900 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <div>
                <span className="font-bold text-xl text-blue-900">MockMate</span>
                <span className="text-sm text-blue-700 block -mt-1">hugos</span>
              </div>
            </div>

            <div className="relative ml-2">
              <Image
                src="/beautiful-avatar.png"
                alt={userName}
                width={48}
                height={48}
                className="rounded-full size-12 ring-4 ring-emerald-200"
              />
            </div>
            <div>
              <h4 className="font-bold text-lg bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
                {userName}
              </h4>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-500" />
                {t('smart_farmer_description')}
              </p>
              {sessionData && (
                <div className="mt-1 flex flex-wrap gap-2">
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full flex items-center gap-1">
                    <Sprout className="w-3 h-3" />
                    {sessionData.crops?.map((c: string) => `${c}`).join(", ")}
                  </span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {sessionData.county}
                  </span>
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    {sessionData.country || 'Kenya'}
                  </span>
                  {hasSoilTest && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full flex items-center gap-1">
                      <Beaker className="w-3 h-3" />
                      {t('soil_test')}
                    </span>
                  )}
                  {sessionData.managementLevel && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {sessionData.managementLevel}
                    </span>
                  )}
                </div>
              )}

              {/* PAYMENT UI */}
              {interviewId && userId && (
                <div className="mt-1">
                  {!paymentChecked ? (
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                      {t('checking_payment')}
                    </span>
                  ) : paymentUsed ? (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                      {t('payment_used')}
                    </span>
                  ) : hasPaid ? (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      {t('payment_verified', { symbol: currency.symbol, amount: 3 })}
                    </span>
                  ) : (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                      {t('payment_required', { symbol: currency.symbol, amount: 3 })}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={startVoiceInterview}
              disabled={isStartButtonDisabled}
              className={`px-4 py-2 rounded-xl font-medium shadow-lg ${
                !isStartButtonDisabled
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <span className="flex items-center gap-2">
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {getStartButtonText()}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Voice Toggle - COMPACT VERSION */}
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
            <span>{t('speaking')}</span>
          </div>
        )}
      </div>

      {/* Soil Test Alert - REMOVED */}
      {/* Financial Snapshot - REMOVED */}

      {/* Buttons Row - Side by side */}
      <div className="flex flex-row gap-4 justify-center">
        {sessionData?.grossMarginAnalysis && (
          <Link href={`/financial/${interviewId}`} className="flex-1">
            <button className="w-full px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold hover:from-emerald-700 hover:to-teal-700 shadow-lg transition-all duration-300 flex items-center justify-center gap-2">
              <BarChart3 className="w-5 h-5" />
              {t('view_financial_analysis')}
            </button>
          </Link>
        )}

        <Link href={`/ask/${interviewId}`} className="flex-1">
          <button className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 shadow-lg transition-all duration-300 flex items-center justify-center gap-2">
            <MessageCircle className="w-5 h-5" />
            {t('ask_questions')}
          </button>
        </Link>
      </div>

      {/* Recommendations */}
      {structuredList.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border-2 border-purple-200 shadow-xl">
          <h3 className="font-bold text-2xl mb-4 flex items-center gap-2 text-purple-800">
            <Sparkles className="w-6 h-6 text-purple-600" />
            {t('personalized_recommendations')}
            {activeStreamingRec !== null && (
              <span className="ml-auto flex items-center gap-2 text-purple-600">
                <Volume2 className="w-5 h-5 animate-pulse" />
                <span className="text-sm">{t('speaking')}</span>
              </span>
            )}
          </h3>

          {/* Business Summary Card */}
          <div className="mb-6 p-3 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-xl text-white">
            <p className="text-sm flex items-center gap-2">
              <Rocket className="w-4 h-4" />
              {t('business_tip_short')}
            </p>
          </div>

          {/* Recommendations List - only shown when read */}
          <div className="space-y-4">
            {structuredList.map((item, idx) => renderRecommendationText(item, idx))}
          </div>

          {/* Fertilizer Plan Details */}
          {interventions.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-xl border-2 border-blue-300">
              <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                <Beaker className="w-5 h-5" />
                {t('precision_fertilizer_calculations')}
              </h4>
              <div className="space-y-3">
                {interventions.map((inv: any, idx: number) => (
                  <div key={idx} className="border-l-4 border-red-500 pl-3 py-1">
                    <p className="font-semibold text-gray-800">
                      {inv.nutrient}: {inv.value} {inv.nutrient.includes('pH') ? '' : inv.nutrient.includes('Nitrogen') ? '%' : 'ppm'} ({inv.level})
                    </p>
                    <p className="text-sm text-gray-700">{inv.recommendation}</p>
                    <div className="mt-1 text-xs text-gray-600">
                      {t('options')}: {inv.fertilizerOptions.map((opt: any) =>
                        `${opt.name} (${opt.amountKg}kg @ ${formatCurrencyForDisplay(opt.cost || 0, currency)})`
                      ).join(' OR ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Soil Test Reminder */}
          {!hasSoilTest && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-300">
              <p className="text-yellow-800 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {t('soil_test_reminder')}
              </p>
            </div>
          )}

          {/* Yearly Testing Reminder */}
          <div className="mt-4 text-center text-sm text-gray-500">
            {t('yearly_testing_reminder')}
          </div>
        </div>
      )}

      {/* MPESA Payment Modal */}
      <MPESAPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={() => {
          setShowPaymentModal(false);
          setHasPaid(true);
          setPaymentUsed(false);
          toast.success(t('payment_confirmed'));
          setTimeout(() => {
            startVoiceInterview();
          }, 1500);
        }}
        cost={3}
        interviewId={interviewId || ""}
        userId={userId || ""}
      />
    </div>
  );
};

export default Agent;