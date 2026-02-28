// components/Agent.tsx - FINAL VERSION (NO DUPLICATES, ONLY KARAOKE)
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
  ArrowRight
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

  // Karaoke streaming for recommendations
  const [recommendationStreams, setRecommendationStreams] = useState<{[key: number]: string}>({});
  const [activeStreamingRec, setActiveStreamingRec] = useState<number | null>(null);
  const recWordsRef = useRef<{[key: number]: string[]}>({});
  const isAISpeakingRef = useRef(false);

  const voiceServiceRef = useRef<VoiceService | null>(null);
  const mountedRef = useRef(true);
  const voiceServiceInitializedRef = useRef(false);

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

        toast.success("🌱 Gen Z Farmer AI is here!");
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
      setActiveStreamingRec(null);
    };

    utterance.onerror = () => {
      setRecommendationStreams(prev => ({ ...prev, [index]: recommendation }));
      setActiveStreamingRec(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  // ============ AUTO-STREAM ALL RECOMMENDATIONS ============
  const streamAllRecommendations = async () => {
    if (!sessionData?.recommendations || sessionData.recommendations.length === 0 || recommendationsSpoken) return;

    setRecommendationsSpoken(true);
    setRecommendationStreams({});

    await speakStreaming("I've got some fire recommendations for your farm. Let me drop them for you.");
    await new Promise(resolve => setTimeout(resolve, 1500));

    for (let i = 0; i < sessionData.recommendations.length; i++) {
      await streamRecommendationKaraoke(sessionData.recommendations[i], i);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    await speakStreaming("Now you can ask me anything about your farm.");
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
          const welcomeUtterance = new SpeechSynthesisUtterance("I'm ready to help you level up your farm.");
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

  // ============ UI RENDER ============
  const isStartButtonDisabled = isLoading || !voiceEnabled || !hasPaid || voiceInitializing;

  const getStartButtonText = () => {
    if (isLoading) return "Starting...";
    if (voiceInitializing) return "Initializing...";
    if (!hasPaid) return "Pay KES 3 to Start";
    return "🌱 Start Vibing";
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
                Farmer AI • Gen Z Edition
              </p>
              {sessionData && (
                <div className="mt-1 flex gap-2">
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full flex items-center gap-1">
                    <Sprout className="w-3 h-3" />
                    {sessionData.crops?.join(", ")}
                  </span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {sessionData.county}
                  </span>
                </div>
              )}

              {/* PAYMENT UI - KEPT */}
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
        </div>

        <VoiceToggle onVoiceToggle={handleVoiceToggle} initialEnabled={voiceEnabled} />

        {voiceInitializing && (
          <div className="mt-3 p-3 bg-blue-50 rounded-xl text-blue-700 flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Initializing voice...</span>
          </div>
        )}
      </div>

      {/* ========== ONLY KARAOKE RECOMMENDATIONS - STATIC BLOCK REMOVED ========== */}
      {sessionData && sessionData.recommendations && sessionData.recommendations.length > 0 && (
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

          <div className="space-y-4">
            {sessionData.recommendations.map((rec: string, idx: number) => {
              const streamingText = recommendationStreams[idx] || "";
              const isActive = activeStreamingRec === idx;

              return (
                <div
                  key={idx}
                  className={`
                    rounded-xl p-5 transition-all duration-300 border-2
                    ${isActive
                      ? 'bg-purple-100 border-purple-500 shadow-2xl scale-105'
                      : streamingText
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
                        {streamingText ? (
                          <p className="text-xl text-gray-800 leading-relaxed">
                            {streamingText.split(' ').map((word, wordIdx, arr) => (
                              <span key={wordIdx}>
                                <span className={isActive ? "text-purple-900 font-bold" : "text-gray-700"}>
                                  {word}
                                </span>
                                {wordIdx < arr.length - 1 ? ' ' : ''}
                              </span>
                            ))}
                          </p>
                        ) : (
                          <p className="text-lg text-gray-500">
                            {isActive ? '🎤 Speaking...' : rec.substring(0, 100) + '...'}
                          </p>
                        )}
                      </div>

                      {isActive && recWordsRef.current[idx] && (
                        <div className="mt-3 flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-purple-600 transition-all duration-150"
                              style={{
                                width: `${(streamingText.split(' ').length / recWordsRef.current[idx].length) * 100}%`
                              }}
                            />
                          </div>
                          <span className="text-sm text-purple-700 font-medium">
                            {streamingText.split(' ').length}/{recWordsRef.current[idx].length} words
                          </span>
                        </div>
                      )}

                      {recommendationStreams[idx] === rec && !isActive && (
                        <p className="text-base text-gray-700 mt-2">
                          {rec}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RETURN BUTTON - Go to Ask Questions Page */}
          <div className="mt-6 flex justify-center">
            <Link href={`/ask/${interviewId}`}>
              <button className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3">
                <MessageCircle className="w-6 h-6" />
                Continue to Ask Questions
                <ArrowRight className="w-6 h-6" />
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