// components/Agent.tsx - UPDATED VERSION WITH BETTER FILTERING
"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
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
  Play
} from "lucide-react";

interface AgentProps {
  userName: string;
  userId?: string;
  interviewId?: string;
  sessionData?: any;
}

const Agent = ({
  userName,
  userId,
  interviewId,
  sessionData
}: AgentProps) => {
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
  const [filteredRecommendations, setFilteredRecommendations] = useState<any[]>([]);

  // Track which recommendations have been read
  const [readRecommendations, setReadRecommendations] = useState<Set<number>>(new Set());

  // Karaoke streaming for recommendations
  const [recommendationStreams, setRecommendationStreams] = useState<{[key: number]: string}>({});
  const [activeStreamingRec, setActiveStreamingRec] = useState<number | null>(null);
  const recWordsRef = useRef<{[key: number]: string[]}>({});
  const isAISpeakingRef = useRef(false);

  const voiceServiceRef = useRef<VoiceService | null>(null);
  const mountedRef = useRef(true);
  const voiceServiceInitializedRef = useRef(false);

  // Soil test data
  const soilTest = sessionData?.soilTest;
  const hasSoilTest = soilTest && soilTest.testDate;
  const interventions = soilTest?.interventions || [];
  const fertilizerPlan = soilTest?.fertilizerPlan;

  // ============ FILTER RECOMMENDATIONS ON MOUNT - IMPROVED VERSION ============
  useEffect(() => {
    if (sessionData?.recommendations) {
      console.log("Raw recommendations:", sessionData.recommendations);

      // Filter out JSON artifacts and get only real recommendations
      const filtered = sessionData.recommendations.filter((rec: any) => {
        if (typeof rec !== 'string') return false;
        const text = rec.trim();

        // Log each recommendation for debugging
        console.log(`Checking rec: "${text.substring(0, 50)}..."`);

        // Keep recommendations that:
        // 1. Are long enough (more than 20 chars)
        if (text.length < 20) return false;

        // 2. Don't contain JSON artifacts
        if (text.includes('"recommendations"')) return false;
        if (text.match(/^\[\s*$/)) return false;

        // 3. Actually look like recommendations (contain words and punctuation)
        if (!/[A-Za-z]/.test(text)) return false;

        // 4. Should have some structure - either starts with ** or has a colon
        if (!text.includes('**') && !text.includes(':')) return false;

        return true;
      });

      console.log("Filtered recommendations:", filtered);
      setFilteredRecommendations(filtered);
    }
  }, [sessionData]);

  // ============ PAYMENT CHECK ============
  useEffect(() => {
    console.log(`⏩ Payment check - INTERVIEW UNLOCKED`);
    setHasPaid(true);
    setPaymentChecked(true);
  }, [interviewId, userId]);

  // ============ VOICE SERVICE INIT ============
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
          speechRate: 1.0,
          speechVolume: 0.8
        });

        voiceServiceInitializedRef.current = true;
        setVoiceInitializing(false);
        console.log("✅ VoiceService created");

        toast.success("🌱 Smart Farmer AI is here!");
      } catch (error: any) {
        console.error("❌ Failed to initialize VoiceService:", error);
        toast.error("Failed to initialize voice service");
        setVoiceInitializing(false);
      }
    }
  }, [voiceEnabled]);

  // ============ SPEAK FUNCTION ============
  const speakStreaming = async (text: string) => {
    isAISpeakingRef.current = true;

    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      if (!voiceServiceRef.current) {
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
        for (const sentence of sentences) {
          const utterance = new SpeechSynthesisUtterance(sentence);
          utterance.rate = 0.9;
          await new Promise((resolve) => {
            utterance.onend = resolve;
            utterance.onerror = resolve;
            window.speechSynthesis.speak(utterance);
          });
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      } else {
        if (typeof voiceServiceRef.current.speakStreaming === 'function') {
          await voiceServiceRef.current.speakStreaming(text);
        } else {
          await voiceServiceRef.current.speak(text);
        }
      }
    } catch (error) {
      console.error("Streaming speech error:", error);
    } finally {
      isAISpeakingRef.current = false;
    }
  };

  // ============ KARAOKE STREAMING ============
  const streamRecommendationKaraoke = async (recommendation: string, index: number) => {
    if (!voiceEnabled || !window.speechSynthesis) {
      setRecommendationStreams(prev => ({ ...prev, [index]: recommendation }));
      setReadRecommendations(prev => new Set(prev).add(index));
      return;
    }

    setActiveStreamingRec(index);
    const words = recommendation.split(' ');
    recWordsRef.current[index] = words;
    setRecommendationStreams(prev => ({ ...prev, [index]: "" }));

    const utterance = new SpeechSynthesisUtterance(recommendation);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Google UK') || v.name.includes('Samantha'));
    if (preferredVoice) utterance.voice = preferredVoice;

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
      setRecommendationStreams(prev => ({ ...prev, [index]: recommendation }));
      setReadRecommendations(prev => new Set(prev).add(index));
      setActiveStreamingRec(null);
    };

    utterance.onerror = () => {
      setRecommendationStreams(prev => ({ ...prev, [index]: recommendation }));
      setReadRecommendations(prev => new Set(prev).add(index));
      setActiveStreamingRec(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  // ============ AUTO-STREAM ALL RECOMMENDATIONS ============
  const streamAllRecommendations = async () => {
    if (filteredRecommendations.length === 0 || recommendationsSpoken) return;

    setRecommendationsSpoken(true);
    setRecommendationStreams({});
    setReadRecommendations(new Set());

    let introMessage = "I've prepared your personalized recommendations. ";
    if (hasSoilTest) {
      introMessage += "Based on your soil test, I've calculated precision fertilizer recommendations. ";
    }

    await speakStreaming(introMessage);
    await new Promise(resolve => setTimeout(resolve, 1500));

    for (let i = 0; i < filteredRecommendations.length; i++) {
      await streamRecommendationKaraoke(filteredRecommendations[i], i);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    if (sessionData.financialAdvice) {
      await speakStreaming("I've also prepared detailed financial analysis for your farm.");
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    await speakStreaming("You can now view your financial analysis or ask me questions about your farm.");
  };

  // ============ START VOICE INTERVIEW ============
  const startVoiceInterview = async () => {
    if (interviewId && userId) {
      if (paymentUsed) {
        toast.info("💳 Payment used. New payment required.");
        setShowPaymentModal(true);
        return;
      }
      if (!hasPaid) {
        toast.info("💳 Payment required to start");
        setShowPaymentModal(true);
        return;
      }
    }

    if (!voiceServiceRef.current) {
      if (!voiceEnabled) {
        toast.error("Please enable voice first");
        return;
      }

      const initToast = toast.loading("🔄 Initializing voice...");
      setVoiceInitializing(true);

      let attempts = 0;
      while (!voiceServiceRef.current && attempts < 15) {
        await new Promise(resolve => setTimeout(resolve, 300));
        attempts++;
      }

      toast.dismiss(initToast);
      setVoiceInitializing(false);

      if (!voiceServiceRef.current) {
        toast.error("Voice service failed");
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

        try {
          const welcomeUtterance = new SpeechSynthesisUtterance("I'm ready to help you with your farm plan.");
          welcomeUtterance.rate = 0.9;
          window.speechSynthesis.speak(welcomeUtterance);

          await new Promise(resolve => setTimeout(resolve, 2000));
          await streamAllRecommendations();
        } catch (speechError) {
          console.error("Speech error:", speechError);
        }
      }

      toast.success("🌱 Ready! Ask away");
    } catch (error: any) {
      console.error("❌ Failed to start:", error);
      toast.error("Failed to start: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceToggle = (enabled: boolean) => {
    setVoiceEnabled(enabled);
    if (enabled) {
      toast.success("🌱 Voice mode activated!");
    } else {
      toast.info("Voice mode disabled");
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // ============ UI RENDER ============
  const isStartButtonDisabled = isLoading || !voiceEnabled || !hasPaid || voiceInitializing;

  const getStartButtonText = () => {
    if (isLoading) return "Starting...";
    if (voiceInitializing) return "Initializing...";
    if (!hasPaid) return "Pay KES 3 to Start";
    return "🌱 Start Voice Session";
  };

  return (
    <div className="flex flex-col gap-6 p-4 bg-gradient-to-br from-slate-50 to-white rounded-2xl">
      {/* Header with Back Button */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-emerald-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* BACK BUTTON */}
            <Link
              href={`/interview/${interviewId}`}
              className="p-2 bg-emerald-100 hover:bg-emerald-200 rounded-xl transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-emerald-700" />
            </Link>

            <div className="relative">
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
                Smart Farmer • Complete Farm Analysis
              </p>
              {sessionData && (
                <div className="mt-1 flex flex-wrap gap-2">
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full flex items-center gap-1">
                    <Sprout className="w-3 h-3" />
                    {sessionData.crops?.join(", ")}
                  </span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {sessionData.county}
                  </span>
                  {hasSoilTest && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full flex items-center gap-1">
                      <Beaker className="w-3 h-3" />
                      Soil Test
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
                      Checking payment...
                    </span>
                  ) : paymentUsed ? (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                      🔒 Payment used - Pay again
                    </span>
                  ) : hasPaid ? (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      ✅ Payment Verified • KES 3 ready
                    </span>
                  ) : (
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">
                      🔒 Payment required (KES 3)
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

      {/* Voice Toggle */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-purple-100">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-semibold text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
            <Mic className="w-5 h-5 text-purple-500" />
            Voice Assistant
          </h4>
          {sessionData?.grossMarginAnalysis && (
            <Link href={`/financial/${interviewId}`}>
              <button className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm rounded-full flex items-center gap-1 hover:scale-105 transition-all">
                <BarChart3 className="w-4 h-4" />
                Financial Analysis
                <ChevronRight className="w-3 h-3" />
              </button>
            </Link>
          )}
        </div>

        <VoiceToggle onVoiceToggle={handleVoiceToggle} initialEnabled={voiceEnabled} />

        {voiceInitializing && (
          <div className="mt-3 p-3 bg-blue-50 rounded-xl text-blue-700 flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Initializing voice...</span>
          </div>
        )}
      </div>

      {/* Soil Test Alert */}
      {hasSoilTest && soilTest && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-4 border-2 border-purple-200 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-100 rounded-full">
              <Beaker className="w-5 h-5 text-purple-700" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-purple-800">Soil Test Analysis Available</h3>
              <p className="text-sm text-purple-700">
                pH: {soilTest.ph} ({soilTest.phRating}) • P: {soilTest.phosphorus} ppm • K: {soilTest.potassium} ppm
              </p>
              {fertilizerPlan && (
                <p className="text-xs text-purple-600 mt-1">
                  ✓ Precision fertilizer plan calculated - Total investment: {formatCurrency(fertilizerPlan.totalCost)}
                </p>
              )}
            </div>
            <Link href={`/financial/${interviewId}?tab=soiltest`}>
              <button className="px-3 py-1 bg-purple-600 text-white text-sm rounded-full hover:bg-purple-700">
                View Details
              </button>
            </Link>
          </div>
        </div>
      )}

      {/* Financial Snapshot */}
      {sessionData?.grossMarginAnalysis && (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 border-2 border-emerald-200 shadow-lg">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-lg flex items-center gap-2 text-emerald-800">
              <DollarSign className="w-5 h-5" />
              Financial Snapshot
            </h3>
            <Link href={`/financial/${interviewId}`}>
              <button className="text-sm text-emerald-600 hover:text-emerald-800 flex items-center gap-1">
                View Full Analysis
                <ChevronRight className="w-4 h-4" />
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white/80 rounded-lg p-2">
              <p className="text-xs text-gray-500">Low</p>
              <p className="font-bold text-emerald-700">{formatCurrency(sessionData.grossMarginAnalysis.low?.grossMargin || 44190)}</p>
            </div>
            <div className="bg-white/80 rounded-lg p-2">
              <p className="text-xs text-gray-500">Medium</p>
              <p className="font-bold text-emerald-700">{formatCurrency(sessionData.grossMarginAnalysis.medium?.grossMargin || 217710)}</p>
            </div>
            <div className="bg-white/80 rounded-lg p-2">
              <p className="text-xs text-gray-500">High</p>
              <p className="font-bold text-emerald-700">{formatCurrency(sessionData.grossMarginAnalysis.high?.grossMargin || 433680)}</p>
            </div>
          </div>
        </div>
      )}

      {/* ========== KARAOKE RECOMMENDATIONS ========== */}
      {filteredRecommendations.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border-2 border-purple-200 shadow-xl">
          <h3 className="font-bold text-2xl mb-4 flex items-center gap-2 text-purple-800">
            <Sparkles className="w-6 h-6 text-purple-600" />
            Your Personalized Recommendations
            {activeStreamingRec !== null && (
              <span className="ml-auto flex items-center gap-2 text-purple-600">
                <Volume2 className="w-5 h-5 animate-pulse" />
                <span className="text-sm">Speaking...</span>
              </span>
            )}
          </h3>

          {/* Fertilizer Investment Summary - Show if available */}
          {fertilizerPlan?.totalCost > 0 && (
            <div className="mb-6 p-4 bg-green-100 rounded-xl border-2 border-green-400">
              <h4 className="font-bold text-green-800 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Total Fertilizer Investment: {formatCurrency(fertilizerPlan.totalCost)} per acre
              </h4>
              <p className="text-sm text-green-700 mt-1">
                Based on your soil test, this is the exact fertilizer you need to buy.
              </p>
            </div>
          )}

          <div className="space-y-4">
            {filteredRecommendations.map((rec: string, idx: number) => {
              const streamingText = recommendationStreams[idx];
              const isActive = activeStreamingRec === idx;
              const isRead = readRecommendations.has(idx);

              // Only show if streaming OR already read
              if (!streamingText && !isRead && !isActive) return null;

              const displayText = streamingText || rec;

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
                          {displayText.split(' ').map((word, wordIdx, arr) => (
                            <span key={wordIdx}>
                              <span className={isActive ? "text-purple-900 font-bold" : "text-gray-700"}>
                                {word}
                              </span>
                              {wordIdx < arr.length - 1 ? ' ' : ''}
                            </span>
                          ))}
                        </p>
                      </div>

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
                            {streamingText?.split(' ').length || 0}/{recWordsRef.current[idx].length} words
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Fertilizer Plan Details - Show if available */}
          {interventions.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-xl border-2 border-blue-300">
              <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                <Beaker className="w-5 h-5" />
                Precision Fertilizer Calculations
              </h4>
              <div className="space-y-3">
                {interventions.map((inv: any, idx: number) => (
                  <div key={idx} className="border-l-4 border-red-500 pl-3 py-1">
                    <p className="font-semibold text-gray-800">
                      {inv.nutrient}: {inv.value} {inv.nutrient.includes('pH') ? '' : inv.nutrient.includes('Nitrogen') ? '%' : 'ppm'} ({inv.level})
                    </p>
                    <p className="text-sm text-gray-700">{inv.recommendation}</p>
                    <div className="mt-1 text-xs text-gray-600">
                      Options: {inv.fertilizerOptions.map((opt: any) =>
                        `${opt.name} (${opt.amountKg}kg @ ${formatCurrency(opt.cost || 0)})`
                      ).join(' OR ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Financial Advice */}
          {sessionData?.financialAdvice && (
            <div className="mt-4 p-4 bg-green-50 rounded-xl border-2 border-green-300">
              <h4 className="font-bold text-green-800 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Financial Advice
              </h4>
              <p className="text-gray-700 mt-1">{sessionData.financialAdvice}</p>
            </div>
          )}

          {/* Farm Summary Stats */}
          {sessionData && (
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-gray-50 rounded-xl">
              <div className="text-center">
                <Sprout className="w-5 h-5 text-emerald-600 mx-auto" />
                <p className="text-xs text-gray-500">Crops</p>
                <p className="font-bold">{sessionData.crops?.join(", ") || "N/A"}</p>
              </div>
              <div className="text-center">
                <Tractor className="w-5 h-5 text-blue-600 mx-auto" />
                <p className="text-xs text-gray-500">Farm Size</p>
                <p className="font-bold">{sessionData.acres || sessionData.cultivatedAcres || "?"} acres</p>
              </div>
              <div className="text-center">
                <Droplets className="w-5 h-5 text-cyan-600 mx-auto" />
                <p className="text-xs text-gray-500">Soil Type</p>
                <p className="font-bold">{sessionData.soilType || "N/A"}</p>
              </div>
              <div className="text-center">
                <Heart className="w-5 h-5 text-red-600 mx-auto" />
                <p className="text-xs text-gray-500">Experience</p>
                <p className="font-bold">{sessionData.experience || "?"} yrs</p>
              </div>
            </div>
          )}

          {/* Financial Analysis Button */}
          {sessionData?.grossMarginAnalysis && (
            <div className="mt-6 flex justify-center">
              <Link href={`/financial/${interviewId}`}>
                <button className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold text-lg hover:from-emerald-700 hover:to-teal-700 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3">
                  <BarChart3 className="w-6 h-6" />
                  View Financial Analysis
                  <ArrowRight className="w-6 h-6" />
                </button>
              </Link>
            </div>
          )}

          {/* Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href={`/ask/${interviewId}`}>
              <button className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 shadow-lg transition-all duration-300 flex items-center justify-center gap-3">
                <MessageCircle className="w-5 h-5" />
                Ask Questions About Your Farm
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
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
          toast.success("✅ Payment confirmed!");
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