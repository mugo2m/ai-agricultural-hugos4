// components/Agent.tsx - COMPLETE KARAOKE VERSION WITH SWAHILI VOICE FALLBACK
"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { useOfflineTranslation } from '@/lib/hooks/useOfflineTranslation';
import VoiceService from "@/lib/voice/VoiceService";
import { MPESAPaymentModal } from "@/components/Payment/MPESAPaymentModal";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { OfflineBanner } from "@/components/OfflineBanner";
import {
  Sparkles,
  Volume2,
  Mic,
  MicOff,
  Loader2,
  ArrowLeft,
  MessageCircle,
  BarChart3,
  Beaker,
  AlertCircle,
  Rocket,
  VolumeX,
} from "lucide-react";
import { useCurrency } from '@/lib/context/CurrencyContext';
import { formatCurrencyForDisplay } from '@/lib/utils/currency';
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
  const { t, ready, isOnline, i18n } = useOfflineTranslation();
  const { currency } = useCurrency();
  const [currentLang, setCurrentLang] = useState<string>('en');

  // Sync language from session data
  useEffect(() => {
    const sessionLang = sessionData?.language;
    if (sessionLang && sessionLang !== i18n.language) {
      console.log(`🌐 Syncing i18n language to: ${sessionLang}`);
      i18n.changeLanguage(sessionLang);
      setCurrentLang(sessionLang);
      localStorage.setItem('preferred-language', sessionLang);
    }
  }, [sessionData, i18n]);

  const safeT = (key: string, params?: any): string => {
    try {
      if (key && (key.includes(' ') || key.includes('\n') || key.includes('.'))) {
        return key;
      }
      if (!t || typeof t !== 'function') return key;
      const template = t(key);
      if (!params) return template;
      let result = template;
      for (const [paramKey, paramValue] of Object.entries(params)) {
        const placeholder = new RegExp(`{{${paramKey}}}`, 'g');
        result = result.replace(placeholder, String(paramValue));
      }
      return result;
    } catch (e) {
      return key;
    }
  };

  const resolveDeep = (obj: any): any => {
    if (!obj) return obj;
    if (Array.isArray(obj)) return obj.map(resolveDeep);
    if (typeof obj === 'object') {
      if (obj.key && typeof obj.key === 'string') return obj;
      const resolved: any = {};
      for (const [k, v] of Object.entries(obj)) {
        resolved[k] = resolveDeep(v);
      }
      return resolved;
    }
    return obj;
  };

  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [voiceInitializing, setVoiceInitializing] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  const [paymentChecked, setPaymentChecked] = useState(false);
  const [paymentUsed, setPaymentUsed] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [welcomeSpoken, setWelcomeSpoken] = useState(false);
  const [recommendationsSpoken, setRecommendationsSpoken] = useState(false);
  const [structuredList, setStructuredList] = useState<any[]>([]);
  const [structuredFinancialAdvice, setStructuredFinancialAdvice] = useState<any>(null);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [readRecommendations, setReadRecommendations] = useState<Set<number>>(new Set());
  const [recommendationStreams, setRecommendationStreams] = useState<{[key: number]: string}>({});
  const [activeStreamingRec, setActiveStreamingRec] = useState<number | null>(null);
  const recWordsRef = useRef<{[key: number]: string[]}>({});
  const isAISpeakingRef = useRef(false);
  const nameUsageCountRef = useRef(0);
  const voiceServiceRef = useRef<VoiceService | null>(null);
  const mountedRef = useRef(true);
  const voiceServiceInitializedRef = useRef(false);

  const soilTest = sessionData?.soilTest;
  const hasSoilTest = soilTest && soilTest.testDate;
  const interventions = soilTest?.interventions || [];
  const fertilizerPlan = soilTest?.fertilizerPlan;
  const farmerName = sessionData?.farmerName || userName || "Farmer";
  const farmerCountry = sessionData?.country || 'kenya';
  const recognitionLanguage = getLanguageFromCountry(farmerCountry);

  // Helper function to get best available voice with Swahili preference and English fallback
  const getBestVoice = () => {
    const voices = window.speechSynthesis.getVoices();

    // First try: Swahili female voice (Rafiki, Zuri, Aisha, etc.)
    let swahiliVoices = voices.filter(v =>
      v.lang === 'sw-KE' &&
      (v.name.includes('Rafiki') || v.name.includes('Zuri') || v.name.includes('Aisha') || v.name.includes('Kenya'))
    );

    if (swahiliVoices.length > 0) {
      console.log('✅ Swahili voice found:', swahiliVoices[0].name);
      return { voice: swahiliVoices[0], language: 'sw-KE' };
    }

    // Second try: Any Swahili voice
    swahiliVoices = voices.filter(v => v.lang === 'sw-KE');
    if (swahiliVoices.length > 0) {
      console.log('✅ Swahili voice (any) found:', swahiliVoices[0].name);
      return { voice: swahiliVoices[0], language: 'sw-KE' };
    }

    // Fallback: English female voice
    const englishVoices = voices.filter(v =>
      v.lang === 'en-US' &&
      (v.name.includes('Samantha') || v.name.includes('Victoria') ||
       v.name.includes('Google UK English Female') || v.name.includes('Microsoft Jenny'))
    );

    if (englishVoices.length > 0) {
      console.log('⚠️ Falling back to English voice:', englishVoices[0].name);
      return { voice: englishVoices[0], language: 'en-US' };
    }

    // Final fallback: Any voice
    console.log('⚠️ Using default voice');
    return { voice: null, language: 'en-US' };
  };

  useEffect(() => {
    if (sessionData?.structuredList) {
      setStructuredList(sessionData.structuredList);
    }
    if (sessionData?.structuredFinancialAdvice) {
      setStructuredFinancialAdvice(sessionData.structuredFinancialAdvice);
    }
  }, [sessionData]);

  useEffect(() => {
    nameUsageCountRef.current = 0;
  }, [sessionData]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const supported = 'speechSynthesis' in window;
      if (supported) {
        const loadVoices = () => {
          const voices = window.speechSynthesis.getVoices();
          if (voices.length > 0) {
            setVoicesLoaded(true);
          }
        };
        loadVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
          window.speechSynthesis.onvoiceschanged = loadVoices;
        }
      }
    }
  }, []);

  useEffect(() => {
    setHasPaid(true);
    setPaymentChecked(true);
  }, [interviewId, userId]);

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
          speechRate: 0.9,
          speechVolume: 0.8,
          country: farmerCountry,
          farmerName: farmerName
        });
        voiceServiceInitializedRef.current = true;
        setVoiceInitializing(false);
        toast.success(safeT('smart_farmer_here') || "Smart Farmer AI is here!");
      } catch (error: any) {
        console.error("Failed to initialize VoiceService:", error);
        toast.error(safeT('voice_service_failed') || "Failed to initialize voice service");
        setVoiceInitializing(false);
      }
    }
  }, [voiceEnabled, farmerName, farmerCountry, safeT]);

  if (!ready) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner fullScreen={false} message="Loading your farm advisor..." />
      </div>
    );
  }

  const getCurrencyName = () => {
    switch(currency.code) {
      case 'KES': return 'Kenyan Shillings';
      case 'UGX': return 'Ugandan Shillings';
      case 'TZS': return 'Tanzanian Shillings';
      default: return currency.name;
    }
  };

  const cleanText = (text: string): string => {
    return text
      .replace(/[\u{1F600}-\u{1F64F}]/gu, '')
      .replace(/[\u{1F300}-\u{1F5FF}]/gu, '')
      .replace(/[\u{1F680}-\u{1F6FF}]/gu, '')
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

  const prepareForSpeech = (text: string): string => {
    let speechText = cleanText(text);
    speechText = speechText
      .replace(/Ksh\s/g, 'Kenyan Shillings ')
      .replace(/Ksh\b/g, 'Kenyan Shillings');

    nameUsageCountRef.current++;
    const useName = nameUsageCountRef.current % 3 === 0;
    speechText = speechText
      .replace(/\b(farmer)\b/gi, useName ? farmerName : 'the farmer')
      .replace(/\b(you)\b/gi, useName ? farmerName : 'you')
      .replace(/\b(your)\b/gi, useName ? `${farmerName}'s` : 'your');
    return speechText;
  };

  // Karaoke streaming function with chunking for long texts and voice fallback
  const streamRecommendationKaraoke = async (recommendation: string, index: number) => {
    if (!voiceEnabled || !window.speechSynthesis) return;

    if (!voicesLoaded) {
      await new Promise<void>((resolve) => {
        const checkVoices = () => {
          const voices = window.speechSynthesis.getVoices();
          if (voices.length > 0) {
            setVoicesLoaded(true);
            resolve();
          } else {
            setTimeout(checkVoices, 100);
          }
        };
        checkVoices();
      });
    }

    try {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      setActiveStreamingRec(index);
      const allWords = recommendation.split(' ');
      recWordsRef.current[index] = allWords;

      // Split into chunks of 250 words to prevent speech from getting stuck
      const maxChunkWords = 250;
      const chunks = [];
      for (let i = 0; i < allWords.length; i += maxChunkWords) {
        chunks.push(allWords.slice(i, i + maxChunkWords).join(' '));
      }

      setRecommendationStreams(prev => ({ ...prev, [index]: "" }));

      let cumulativeText = '';

      for (let chunkIdx = 0; chunkIdx < chunks.length; chunkIdx++) {
        const chunk = chunks[chunkIdx];
        const chunkWords = chunk.split(' ');

        const utterance = new SpeechSynthesisUtterance(chunk);
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        utterance.volume = 1.0;

        // Get best voice (Swahili preferred, English fallback)
        const { voice, language } = getBestVoice();
        if (voice) utterance.voice = voice;
        utterance.lang = language;

        let localWordIndex = 0;

        utterance.onboundary = (event) => {
          if (event.name === 'word' && localWordIndex < chunkWords.length) {
            cumulativeText += (cumulativeText === '' ? '' : ' ') + chunkWords[localWordIndex];
            setRecommendationStreams(prev => ({ ...prev, [index]: cumulativeText }));
            localWordIndex++;
          }
        };

        await new Promise<void>((resolve) => {
          utterance.onend = () => resolve();
          utterance.onerror = () => resolve();
          window.speechSynthesis.speak(utterance);
        });

        await new Promise(resolve => setTimeout(resolve, 150));
      }

      setRecommendationStreams(prev => ({ ...prev, [index]: recommendation }));
      setReadRecommendations(prev => new Set(prev).add(index));
      setActiveStreamingRec(null);
      currentUtteranceRef.current = null;

    } catch (error) {
      console.error('Error in streamRecommendationKaraoke:', error);
      setRecommendationStreams(prev => ({ ...prev, [index]: recommendation }));
      setReadRecommendations(prev => new Set(prev).add(index));
      setActiveStreamingRec(null);
    }
  };

  const speakWithVoice = async (text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis) {
        resolve();
        return;
      }

      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }

      setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        utterance.volume = 1.0;

        // Get best voice (Swahili preferred, English fallback)
        const { voice, language } = getBestVoice();
        if (voice) utterance.voice = voice;
        utterance.lang = language;

        console.log(`🔊 Speaking with voice: ${utterance.voice?.name || 'default'} (${utterance.lang})`);

        let resolved = false;

        utterance.onend = () => {
          if (!resolved) {
            resolved = true;
            resolve();
          }
        };

        utterance.onerror = (event) => {
          console.error("Speech error with", utterance.voice?.name, ":", event);
          if (!resolved) {
            resolved = true;

            // If Swahili voice failed, try English as fallback
            if (utterance.lang === 'sw-KE') {
              console.log('⚠️ Swahili voice failed, retrying with English voice...');
              const englishUtterance = new SpeechSynthesisUtterance(text);
              englishUtterance.rate = 0.9;
              englishUtterance.pitch = 1.1;
              englishUtterance.volume = 1.0;
              englishUtterance.lang = 'en-US';

              const englishVoices = window.speechSynthesis.getVoices().filter(v =>
                v.lang === 'en-US' &&
                (v.name.includes('Samantha') || v.name.includes('Victoria') ||
                 v.name.includes('Google UK English Female') || v.name.includes('Microsoft Jenny'))
              );
              if (englishVoices.length > 0) englishUtterance.voice = englishVoices[0];

              englishUtterance.onend = () => resolve();
              englishUtterance.onerror = () => resolve();
              window.speechSynthesis.speak(englishUtterance);
            } else {
              resolve();
            }
          }
        };

        window.speechSynthesis.speak(utterance);

        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            resolve();
          }
        }, Math.max(text.length * 20, 3000));
      }, 100);
    });
  };

  const streamAllRecommendations = async () => {
    if (structuredList.length === 0 || recommendationsSpoken) return;

    setRecommendationsSpoken(true);
    nameUsageCountRef.current = 0;

    const currencyName = getCurrencyName();

    let introMessage = safeT('prepared_recommendations', 'I\'ve prepared personalized recommendations for your farm enterprise. ');
    if (hasSoilTest && fertilizerPlan?.totalCost) {
      introMessage += safeT('soil_test_recommendations', {
        amount: fertilizerPlan.totalCost.toLocaleString(),
        currencyName
      }) + ' ';
    } else if (hasSoilTest) {
      introMessage += safeT('soil_test_calculated', 'Based on your soil test, I\'ve calculated precision fertilizer recommendations. ');
    }

    await speakWithVoice(introMessage);
    await new Promise(resolve => setTimeout(resolve, 2000));

    for (let i = 0; i < structuredList.length; i++) {
      const item = structuredList[i];
      const resolvedItem = resolveDeep(item);
      let recommendation;

      if (resolvedItem.key === 'gap_grouped') {
        const parts = [];
        if (resolvedItem.params?.title) parts.push(resolvedItem.params.title);
        const gapKey = resolvedItem.params?.gapKey;
        if (gapKey) parts.push(safeT(gapKey, {}));
        if (resolvedItem.params?.remember) parts.push(resolvedItem.params.remember);
        recommendation = parts.join('\n\n');
      } else if (resolvedItem.key === 'damage_report_grouped') {
        const parts = [];
        if (resolvedItem.params?.title) parts.push(resolvedItem.params.title);
        if (resolvedItem.params?.message) parts.push(resolvedItem.params.message);
        if (resolvedItem.params?.advice) parts.push(resolvedItem.params.advice);
        if (resolvedItem.params?.followUp) parts.push(resolvedItem.params.followUp);
        recommendation = parts.join('\n\n');
      } else {
        recommendation = safeT(resolvedItem.key, resolvedItem.params);
      }

      await streamRecommendationKaraoke(recommendation, i);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    if (structuredFinancialAdvice) {
      const resolvedItem = resolveDeep(structuredFinancialAdvice);
      const financialText = safeT(resolvedItem.key, resolvedItem.params);
      await speakWithVoice(financialText);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    await speakWithVoice(safeT('post_recommendations'));
  };

  const startVoiceInterview = async () => {
    if (!voiceEnabled) {
      toast.error("Please turn voice ON first by clicking the 'Voice ON' button");
      return;
    }

    if (interviewId && userId) {
      if (paymentUsed) {
        toast.info(safeT('payment_used_new'));
        setShowPaymentModal(true);
        return;
      }
      if (!hasPaid) {
        toast.info(safeT('payment_required_to_start'));
        setShowPaymentModal(true);
        return;
      }
    }

    if (!voiceServiceRef.current) {
      const initToast = toast.loading(safeT('initializing_voice'));
      setVoiceInitializing(true);
      let attempts = 0;
      while (!voiceServiceRef.current && attempts < 15) {
        await new Promise(resolve => setTimeout(resolve, 300));
        attempts++;
      }
      toast.dismiss(initToast);
      setVoiceInitializing(false);
      if (!voiceServiceRef.current) {
        toast.error(safeT('voice_service_failed'));
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

        // DO NOT show all recommendations immediately
        // Start with empty streams - recommendations appear only when being read
        setRecommendationStreams({});
        setReadRecommendations(new Set());

        const welcomeText = safeT('welcome_farm_plan');
        await speakWithVoice(welcomeText);
        await new Promise(resolve => setTimeout(resolve, 2000));
        await streamAllRecommendations();
      }

      toast.success(safeT('ready_ask_away'));
    } catch (error: any) {
      console.error("Failed to start:", error);
      toast.error(safeT('failed_to_start', { message: error.message }));
    } finally {
      setIsLoading(false);
    }
  };

  const isStartButtonDisabled = isLoading || !voiceEnabled || !hasPaid || voiceInitializing;

  const getStartButtonText = () => {
    if (isLoading) return safeT('starting');
    if (voiceInitializing) return safeT('initializing');
    if (!hasPaid) return safeT('pay_to_start', { symbol: currency.symbol, amount: 3 });
    if (!voiceEnabled) return "Turn Voice ON First";
    return safeT('start_voice_session');
  };

  const renderRecommendationText = (item: StructuredItem, idx: number) => {
    const resolvedItem = resolveDeep(item);
    let displayContent = '';

    if (resolvedItem.key === 'gap_grouped') {
      const parts = [];
      if (resolvedItem.params?.title) parts.push(resolvedItem.params.title);
      const gapKey = resolvedItem.params?.gapKey;
      if (gapKey) parts.push(safeT(gapKey, {}));
      if (resolvedItem.params?.remember) parts.push(resolvedItem.params.remember);
      displayContent = parts.join('\n\n');
    }
    else if (resolvedItem.key === 'damage_report_grouped') {
      const parts = [];
      if (resolvedItem.params?.title) parts.push(resolvedItem.params.title);
      if (resolvedItem.params?.message) parts.push(resolvedItem.params.message);
      if (resolvedItem.params?.advice) parts.push(resolvedItem.params.advice);
      if (resolvedItem.params?.followUp) parts.push(resolvedItem.params.followUp);
      displayContent = parts.join('\n\n');
    }
    else {
      displayContent = safeT(resolvedItem.key, resolvedItem.params);
    }

    const streamingText = recommendationStreams[idx];
    const isActive = activeStreamingRec === idx;
    const isRead = readRecommendations.has(idx);

    // KARAOKE BEHAVIOR:
    // - Only show recommendation if it's currently being spoken (active) OR has been read
    // - During active streaming: show words as they're spoken (streamingText)
    // - After read: show full content (displayContent)
    // - Unread recommendations: HIDDEN
    if (!isActive && !isRead) {
      return null;
    }

    const finalText = isActive ? (streamingText || "") : displayContent;

    return (
      <div
        key={idx}
        className={`rounded-xl p-5 transition-all duration-300 border-2 ${
          isActive ? 'bg-purple-100 border-purple-500 shadow-2xl scale-105' : 'bg-purple-50 border-purple-300'
        }`}
      >
        <div className="flex items-start gap-4">
          <span className="rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0 bg-purple-500 text-white">
            {idx + 1}
          </span>
          <div className="flex-1">
            <p className="text-xl text-gray-800 leading-relaxed whitespace-pre-line">{finalText}</p>
            {isActive && recWordsRef.current[idx] && (
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-600 transition-all duration-150"
                    style={{ width: `${((streamingText?.split(' ').length || 0) / recWordsRef.current[idx].length) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-purple-700 font-medium">
                  {streamingText?.split(' ').length || 0}/{recWordsRef.current[idx].length}
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
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-emerald-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/interview/${interviewId}`} className="p-2 bg-emerald-100 hover:bg-emerald-200 rounded-xl">
              <ArrowLeft className="w-5 h-5 text-emerald-700" />
            </Link>
            <div className="relative">
              <Image src="/beautiful-avatar.png" alt={userName} width={48} height={48} className="rounded-full size-12 ring-4 ring-emerald-200" />
            </div>
            <div>
              <h4 className="font-bold text-lg text-gray-800">{userName}</h4>
              <div className="flex flex-wrap gap-1 text-xs">
                {sessionData?.crops && <span className="text-emerald-600">{sessionData.crops.join(", ")}</span>}
                {sessionData?.county && <span className="text-gray-500">• {sessionData.county}</span>}
                {sessionData?.country && <span className="text-gray-400">• {sessionData.country}</span>}
                {hasSoilTest && <span className="text-purple-600">• {safeT('soil_test')}</span>}
              </div>
              {interviewId && userId && (
                <div className="mt-1">
                  {hasPaid ? (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      {safeT('payment_verified', { symbol: currency.symbol, amount: 3 })}
                    </span>
                  ) : (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                      {safeT('payment_required', { symbol: currency.symbol, amount: 3 })}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 font-medium text-sm transition-all ${
                voiceEnabled
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                  : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
              }`}
            >
              {voiceEnabled ? <><Mic className="w-4 h-4" /><span>Voice ON</span></> : <><MicOff className="w-4 h-4" /><span>Voice OFF</span></>}
            </button>
            <button onClick={startVoiceInterview} disabled={isStartButtonDisabled} className={`px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap ${!isStartButtonDisabled ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
              <span className="flex items-center gap-2">
                {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                {getStartButtonText()}
              </span>
            </button>
          </div>
        </div>
        {isSpeaking && (
          <div className="mt-2 text-xs text-blue-600 flex items-center gap-1">
            <Volume2 className="w-3 h-3 animate-pulse" />
            <span>{safeT('speaking')}</span>
          </div>
        )}
      </div>

      {!voiceEnabled && structuredList.length > 0 && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <VolumeX className="w-6 h-6 text-yellow-600" />
            <div>
              <p className="font-semibold text-yellow-800">Voice is OFF</p>
              <p className="text-sm text-yellow-700">Click "Voice ON" above, then "Start Voice Session" to hear recommendations with karaoke effect.</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-row gap-4 justify-center">
        {sessionData?.grossMarginAnalysis && (
          <Link href={`/financial/${interviewId}`} className="flex-1">
            <button className="w-full px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold hover:from-emerald-700 hover:to-teal-700 flex items-center justify-center gap-2">
              <BarChart3 className="w-5 h-5" />
              {safeT('view_financial_analysis')}
            </button>
          </Link>
        )}
        <Link href={`/ask/${interviewId}`} className="flex-1">
          <button className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 flex items-center justify-center gap-2">
            <MessageCircle className="w-5 h-5" />
            {safeT('ask_questions')}
          </button>
        </Link>
      </div>

      {structuredList.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border-2 border-purple-200 shadow-xl">
          <h3 className="font-bold text-2xl mb-4 flex items-center gap-2 text-purple-800">
            <Sparkles className="w-6 h-6 text-purple-600" />
            {safeT('personalized_recommendations')}
            {activeStreamingRec !== null && (
              <span className="ml-auto flex items-center gap-2 text-purple-600">
                <Volume2 className="w-5 h-5 animate-pulse" />
                <span className="text-sm">{safeT('speaking')}</span>
              </span>
            )}
          </h3>
          <div className="mb-6 p-3 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-xl text-white">
            <p className="text-sm flex items-center gap-2">
              <Rocket className="w-4 h-4" />
              {safeT('business_tip_short')}
            </p>
          </div>
          <div className="space-y-4">
            {structuredList.map((item, idx) => renderRecommendationText(item, idx))}
          </div>
          {interventions.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-xl border-2 border-blue-300">
              <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                <Beaker className="w-5 h-5" />
                {safeT('precision_fertilizer_calculations')}
              </h4>
              <div className="space-y-3">
                {interventions.map((inv: any, idx: number) => (
                  <div key={idx} className="border-l-4 border-red-500 pl-3 py-1">
                    <p className="font-semibold text-gray-800">{inv.nutrient}: {inv.value} ({inv.level})</p>
                    <p className="text-sm text-gray-700">{inv.recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {!hasSoilTest && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-300">
              <p className="text-yellow-800 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {safeT('soil_test_reminder')}
              </p>
            </div>
          )}
          <div className="mt-4 text-center text-sm text-gray-500">
            {safeT('yearly_testing_reminder')}
          </div>
        </div>
      )}

      <MPESAPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={() => {
          setShowPaymentModal(false);
          setHasPaid(true);
          setPaymentUsed(false);
          toast.success(safeT('payment_confirmed'));
          setTimeout(() => startVoiceInterview(), 1500);
        }}
        cost={3}
        interviewId={interviewId || ""}
        userId={userId || ""}
      />

      <OfflineBanner />
    </div>
  );
};

export default Agent;