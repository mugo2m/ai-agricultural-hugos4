// components/Agent.tsx - COMPLETE VERSION WITH ECHO CANCELLATION AND ASK BUTTON
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link"; // 🔥 ADD THIS IMPORT
import { toast } from "sonner";
import VoiceService from "@/lib/voice/VoiceService";
console.log("📦 VoiceService imported from: @/lib/voice/VoiceService");
import { VoiceToggle } from "@/components/VoiceToggle";
import { MPESAPaymentModal } from "@/components/Payment/MPESAPaymentModal";
import { checkPaymentStatus } from "@/lib/payment/clientCheck";
import { useMemory } from "@/lib/hooks/useMemory";
import { ResumeInterviewModal } from "@/components/Memory/ResumeInterviewModal";
import { PerformanceAnalysis } from "@/components/Memory/PerformanceAnalysis";
import { EmotionalSupport } from "@/components/Memory/EmotionalSupport";
import {
  BarChart3,
  TrendingUp,
  AlertCircle,
  Target,
  CheckCircle,
  Heart,
  Brain,
  Zap,
  Send,
  Loader2,
  Mic,
  Sparkles,
  Droplets,
  Sprout,
  Sun,
  Cloud,
  Leaf,
  Wheat,
  Flower2,
  MapPin,
  MessageCircle, // 🔥 ADD THIS
  ArrowRight    // 🔥 ADD THIS
} from "lucide-react";

interface AgentProps {
  userName: string;
  userId?: string;
  interviewId?: string;
  questions?: string[];
  profileImage?: string;
  sessionData?: any;
}

interface AnswerHistory {
  question: string;
  answer: string;
  questionNumber: number;
  timestamp: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

// Helper function for categorizing questions (needed for interview mode)
const categorizeQuestion = (question: string): string => {
  const q = question.toLowerCase();
  if (q.includes('react') || q.includes('component') || q.includes('hook') || q.includes('state')) {
    return 'React';
  }
  if (q.includes('javascript') || q.includes('js ') || q.includes('ecmascript')) {
    return 'JavaScript';
  }
  if (q.includes('typescript') || q.includes('ts ') || q.includes('type ')) {
    return 'TypeScript';
  }
  if (q.includes('system design') || q.includes('scalability') || q.includes('architecture')) {
    return 'System Design';
  }
  if (q.includes('algorithm') || q.includes('data structure') || q.includes('complexity')) {
    return 'Algorithms';
  }
  if (q.includes('experience') || q.includes('team') || q.includes('conflict') || q.includes('challenge')) {
    return 'Behavioral';
  }
  if (q.includes('api') || q.includes('rest') || q.includes('graphql') || q.includes('endpoint')) {
    return 'APIs';
  }
  if (q.includes('database') || q.includes('sql') || q.includes('mongodb') || q.includes('redis')) {
    return 'Database';
  }
  return 'General';
};

const Agent = ({
  userName,
  userId,
  interviewId,
  questions = [],
  profileImage,
  sessionData
}: AgentProps) => {
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userTranscript, setUserTranscript] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [answerHistory, setAnswerHistory] = useState<AnswerHistory[]>([]);
  const [currentQuestionText, setCurrentQuestionText] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  const [paymentChecked, setPaymentChecked] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [paymentUsed, setPaymentUsed] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  const [showPerformanceAnalysis, setShowPerformanceAnalysis] = useState(false);
  const [questionStartTimes, setQuestionStartTimes] = useState<{[key: number]: number}>({});
  const [performanceSaved, setPerformanceSaved] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<string | null>(null);
  const [emotionalIntensity, setEmotionalIntensity] = useState(5);
  const [showEmotionalSupport, setShowEmotionalSupport] = useState(false);
  const [feedbackCalled, setFeedbackCalled] = useState(false);
  const [welcomeSpoken, setWelcomeSpoken] = useState(false);
  const [recommendationsSpoken, setRecommendationsSpoken] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [voiceInitializing, setVoiceInitializing] = useState(false);
  const [isVoiceListening, setIsVoiceListening] = useState(false);

  // ============ REFS FOR ECHO CANCELLATION ============
  const isAISpeakingRef = useRef(false);
  const lastUserTranscriptRef = useRef("");
  const speechEndTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [debugInfo, setDebugInfo] = useState({
    callStatus: "INACTIVE",
    currentQuestion: 0,
    totalQuestions: questions.length || 0,
    messages: 0,
    collectedAnswers: 0,
    isListening: false,
    isSpeaking: false,
    userId: userId || "MISSING",
    voiceMode: "SIMULATED" as "REAL" | "SIMULATED",
    serviceStatus: "NOT_INITIALIZED"
  });

  // ============ FIX: Use ref to persist answers across renders ============
  const answersRef = useRef<AnswerHistory[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ============ EMERGENCY GUARD to prevent infinite loops ============
  const mountedRef = useRef(true);
  const initAttemptsRef = useRef(0);
  const voiceServiceInitializedRef = useRef(false);
  const isComponentMounted = useRef(true);

  // ============ PERSIST STATE ACROSS FAST REFRESH ============
  useEffect(() => {
    // Save transcript to sessionStorage on changes
    if (userTranscript) {
      sessionStorage.setItem('lastTranscript', userTranscript);
    }
  }, [userTranscript]);

  useEffect(() => {
    // Restore transcript from sessionStorage on load
    const saved = sessionStorage.getItem('lastTranscript');
    if (saved) {
      setUserTranscript(saved);
      sessionStorage.removeItem('lastTranscript');
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    isComponentMounted.current = true;
    return () => {
      mountedRef.current = false;
      isComponentMounted.current = false;

      // Clear timeouts on unmount
      if (speechEndTimeoutRef.current) {
        clearTimeout(speechEndTimeoutRef.current);
      }
    };
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize memory system
  const {
    resumeData,
    saveInterviewProgress,
    markInterviewCompleted,
    checkResumeInterview,
    saveUserPerformance,
    performanceHistory,
    weakAreas,
    performanceTrends,
    loadPerformanceData,
    recordEmotionalState,
    getEmotionalSupport
  } = useMemory(userId);

  const voiceServiceRef = useRef<VoiceService | null>(null);
  const redirectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const saveProgressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const questionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const emotionCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ============ FIX: PREVENT DUPLICATE PAYMENT CHECKS ============
  const paymentCheckRan = useRef(false);
  const paymentCheckId = useRef(`payment-check-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  // ============ Add welcome message with session data ============
  useEffect(() => {
    if (sessionData && messages.length === 0) {
      const welcomeMessage = `🌱 Welcome! I'm your Gen Z farming assistant. I see you're growing ${sessionData.crops?.join(", ")} in ${sessionData.county}. Let's level up your farm! Ask me anything.`;

      setMessages([{
        role: "assistant",
        content: welcomeMessage,
        timestamp: Date.now()
      }]);
    }
  }, [sessionData]);

  // ============ DEBUG: Monitor transcript updates ============
  useEffect(() => {
    console.log("📝 userTranscript UPDATED:", {
      value: userTranscript,
      length: userTranscript.length,
      hasContent: userTranscript.trim().length > 0,
      timestamp: new Date().toLocaleTimeString()
    });
  }, [userTranscript]);

  // ============ ENHANCED STREAMING VOICE FUNCTION WITH MUTING ============
  const speakStreaming = async (text: string) => {
    // Set flag that AI is speaking
    isAISpeakingRef.current = true;

    // Stop listening while AI speaks
    if (voiceServiceRef.current && typeof voiceServiceRef.current.stopListening === 'function') {
      console.log("🔇 Stopping listening - AI speaking");
      voiceServiceRef.current.stopListening();
      setIsVoiceListening(false);
    }

    // Small pause to ensure listening stops
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      if (!voiceServiceRef.current) {
        // Fallback: Use browser speech synthesis
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

        for (const sentence of sentences) {
          const utterance = new SpeechSynthesisUtterance(sentence);
          utterance.rate = 0.9;
          utterance.pitch = 1.0;
          utterance.volume = 1.0;

          await new Promise((resolve) => {
            utterance.onend = resolve;
            utterance.onerror = resolve;
            window.speechSynthesis.speak(utterance);
          });

          await new Promise(resolve => setTimeout(resolve, 300));
        }
      } else {
        // Use the streaming method
        if (typeof voiceServiceRef.current.speakStreaming === 'function') {
          await voiceServiceRef.current.speakStreaming(text);
        } else {
          // Fallback to regular speak
          await voiceServiceRef.current.speak(text);
        }
      }
    } catch (error) {
      console.error("Streaming speech error:", error);
    } finally {
      // AI finished speaking
      isAISpeakingRef.current = false;

      // Clear any pending restart
      if (speechEndTimeoutRef.current) {
        clearTimeout(speechEndTimeoutRef.current);
      }

      // Wait a bit before restarting listening
      speechEndTimeoutRef.current = setTimeout(() => {
        if (debugInfo.callStatus === "ACTIVE" && voiceEnabled && !isAISpeakingRef.current) {
          console.log("🎤 Restarting listening after AI speech");
          startVoiceListening();
        }
        speechEndTimeoutRef.current = null;
      }, 1000); // 1 second delay to prevent catching echo
    }
  };

  // ============ SPEAK RECOMMENDATIONS ONE BY ONE ============
  const speakRecommendations = async () => {
    if (!sessionData?.recommendations || recommendationsSpoken) return;

    setRecommendationsSpoken(true);

    try {
      await speakStreaming("I've got some fire recommendations for your farm. Let me drop them for you.");
      await new Promise(resolve => setTimeout(resolve, 1500));

      for (let i = 0; i < sessionData.recommendations.length; i++) {
        const rec = sessionData.recommendations[i];
        await speakStreaming(`Recommendation ${i + 1}: ${rec}`);
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Add to answer history
        const newEntry: AnswerHistory = {
          question: `Recommendation ${i + 1}`,
          answer: rec,
          questionNumber: answerHistory.length + i + 1,
          timestamp: new Date().toLocaleTimeString()
        };
        setAnswerHistory(prev => [...prev, newEntry]);
      }

      await speakStreaming("Now you can ask me anything about your farm. Spill the tea or type it below.");
    } catch (error) {
      console.error("Error speaking recommendations:", error);
      toast.info("📱 Check out your recommendations below:");
    }
  };

  // ============ DEBUG: MONITOR TRANSCRIPT ============
  useEffect(() => {
    if (userTranscript) {
      console.log("📝 Agent received transcript:", {
        length: userTranscript.length,
        preview: userTranscript.substring(0, 50),
        hasContent: !!userTranscript.trim()
      });
    }
  }, [userTranscript]);

  // ============ MICROPHONE DIAGNOSTIC ============
  useEffect(() => {
    if (voiceEnabled && debugInfo.callStatus === "ACTIVE") {
      console.log("🎤 Running microphone diagnostic...");

      navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })
        .then(stream => {
          console.log("✅ Microphone is working and accessible!");
          stream.getTracks().forEach(track => track.stop());
          toast.success("🎤 Mic is lit! Ready to go");
        })
        .catch(err => {
          console.error("❌ Microphone error:", err.name, err.message);

          let errorMessage = "Mic access failed";
          if (err.name === 'NotAllowedError') {
            errorMessage = "Allow mic access in browser settings bestie";
          } else if (err.name === 'NotFoundError') {
            errorMessage = "No mic found. Plug one in!";
          } else if (err.name === 'NotReadableError') {
            errorMessage = "Mic is busy with another app";
          }

          toast.error(errorMessage);
        });
    }
  }, [voiceEnabled, debugInfo.callStatus]);

  // ============ PAYMENT CHECK - BYPASSED FOR TESTING ============
  useEffect(() => {
    console.log(`⏩ Payment check SKIPPED for testing - INTERVIEW UNLOCKED`);
    setHasPaid(true);
    setPaymentChecked(true);
  }, [interviewId, userId]);

  // ============ FIXED: VOICE SERVICE INITIALIZATION ============
  useEffect(() => {
    // Only run when voiceEnabled changes or when component mounts
    if (!mountedRef.current) return;

    // Prevent multiple initializations
    if (voiceServiceInitializedRef.current && voiceServiceRef.current) {
      return;
    }

    // Clean up previous instance if voice is disabled
    if (!voiceEnabled) {
      if (voiceServiceRef.current) {
        console.log("🗑️ Destroying voice service (voice disabled)");
        voiceServiceRef.current.destroy();
        voiceServiceRef.current = null;
        voiceServiceInitializedRef.current = false;
      }
      setDebugInfo(prev => ({ ...prev, serviceStatus: "DISABLED" }));
      return;
    }

    // Only create new instance if voice is enabled and we don't have one
    if (voiceEnabled && !voiceServiceRef.current && !voiceServiceInitializedRef.current) {
      console.log("🔴🔴🔴 CREATING NEW VOICE SERVICE INSTANCE 🔴🔴🔴");

      // Reset init attempts counter
      initAttemptsRef.current = 0;

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

        console.log("✅ VoiceService instance created successfully");

        if (questions.length > 0) {
          voiceServiceRef.current.setInterviewQuestions(questions);
        }

        voiceServiceRef.current.onStateChange((state) => {
          if (!mountedRef.current) return;

          // CRITICAL: Ignore transcript updates while AI is speaking
          if (state.transcript !== userTranscript && !isAISpeakingRef.current) {
            // Also filter out common AI phrases
            const lowerTranscript = state.transcript.toLowerCase();
            const isLikelyAISpeech =
              lowerTranscript.includes('recommendation') ||
              lowerTranscript.includes('soil testing') ||
              lowerTranscript.includes('terracing') ||
              lowerTranscript.includes('contour farming') ||
              lowerTranscript.includes('mulching') ||
              lowerTranscript.includes('dap') ||
              lowerTranscript.includes('can fertilizer') ||
              lowerTranscript.includes('let me see') ||
              lowerTranscript.includes('well') ||
              lowerTranscript.includes('alright') ||
              lowerTranscript.includes('great') ||
              lowerTranscript.includes('hmm') ||
              lowerTranscript.includes('interesting') ||
              lowerTranscript.includes('monitor for pests') ||
              lowerTranscript.includes('download agricultural apps') ||
              state.transcript === lastUserTranscriptRef.current; // Prevent duplicates

            if (!isLikelyAISpeech) {
              console.log("🎤 User speech detected:", state.transcript);
              setUserTranscript(state.transcript);
              lastUserTranscriptRef.current = state.transcript;
            } else {
              console.log("🚫 Ignoring likely AI speech:", state.transcript);
            }
          }

          setDebugInfo(prev => ({
            ...prev,
            isListening: state.isListening && !isAISpeakingRef.current,
            isSpeaking: state.isSpeaking,
            isProcessing: state.isProcessing,
            callStatus: state.isListening ? "LISTENING" :
                       state.isSpeaking ? "SPEAKING" :
                       state.isProcessing ? "PROCESSING" :
                       prev.callStatus === "STARTING" ? "ACTIVE" : prev.callStatus,
            serviceStatus: "ACTIVE"
          }));
        });

        voiceServiceRef.current.onUpdate(async (voiceMessages) => {
          if (!mountedRef.current || isAISpeakingRef.current) return; // Ignore while AI speaks

          const userMessages = voiceMessages.filter(m => m.role === "user");
          const assistantMessages = voiceMessages.filter(m => m.role === "assistant");

          const currentQ = Math.max(0, Math.min(assistantMessages.length, questions.length));

          // 🌱 If user just spoke a question (farmer mode)
          if (userMessages.length > assistantMessages.length && sessionData) {
            const latestUserMessage = userMessages[userMessages.length - 1];
            const question = latestUserMessage.content;

            // Double-check this isn't AI speech
            const lowerQuestion = question.toLowerCase();
            if (lowerQuestion.includes('recommendation') ||
                lowerQuestion.includes('soil testing') ||
                lowerQuestion.includes('terracing') ||
                lowerQuestion.includes('contour farming') ||
                lowerQuestion.includes('mulching') ||
                lowerQuestion.includes('dap') ||
                lowerQuestion.includes('can fertilizer')) {
              console.log("🚫 Ignoring likely AI question:", question);
              return;
            }

            console.log("🌱 Farmer asked (voice):", question);

            // Add user message to UI
            setMessages(prev => [...prev, {
              role: "user",
              content: question,
              timestamp: Date.now()
            }]);

            // Create answer history entry
            const newEntry: AnswerHistory = {
              question: question,
              answer: "Loading answer...",
              questionNumber: userMessages.length,
              timestamp: new Date().toLocaleTimeString()
            };

            setAnswerHistory(prev => [...prev, newEntry]);
            setIsLoading(true);

            try {
              const response = await fetch('/api/farmer/query', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  question,
                  userId,
                  sessionId: interviewId,
                  sessionData
                })
              });

              const data = await response.json();

              if (data.success) {
                setAnswerHistory(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    ...updated[updated.length - 1],
                    answer: data.answer
                  };
                  return updated;
                });

                setMessages(prev => [...prev, {
                  role: "assistant",
                  content: data.answer,
                  timestamp: Date.now()
                }]);

                await speakStreaming(data.answer);
                toast.success("✅ Answer secured!");
              } else {
                toast.error(data.error || "Failed to get answer");
              }
            } catch (error) {
              console.error("Query error:", error);
              toast.error("Failed to process question. Try again bestie");
            } finally {
              setIsLoading(false);
            }
          }

          setDebugInfo(prev => ({
            ...prev,
            messages: voiceMessages.length,
            collectedAnswers: userMessages.length,
            currentQuestion: currentQ
          }));
        });

        voiceServiceRef.current.onComplete((data) => {
          console.log("🎉🎉🎉 VOICE SERVICE ONCOMPLETE FIRED! 🎉🎉🎉");

          setIsLoading(false);

          setDebugInfo(prev => ({
            ...prev,
            callStatus: "COMPLETED",
            currentQuestion: questions.length,
            collectedAnswers: data.answersGiven || 0,
            serviceStatus: "COMPLETED"
          }));

          if (sessionData) {
            toast.success("✅ Session complete! Catch you later!");
            setTimeout(() => {
              window.location.href = '/';
            }, 3000);
          } else {
            handleInterviewCompletion(data, [...answersRef.current]);
          }
        });

        setDebugInfo(prev => ({ ...prev, serviceStatus: "READY" }));

        if (sessionData) {
          toast.success("🌱 Gen Z Farmer AI is here! Ask me anything!");
        } else {
          toast.success("🎤 Voice service ready! Let's get this bread!");
        }

      } catch (error: any) {
        console.error("❌ Failed to initialize VoiceService:", error);
        toast.error("Failed to initialize voice service: " + error.message);
        setDebugInfo(prev => ({ ...prev, serviceStatus: "ERROR" }));
        setVoiceInitializing(false);
      }
    }
  }, [voiceEnabled]); // ONLY depend on voiceEnabled, NOT on other props!

  // ============ Add this to ensure voice service is ready when voice is enabled ============
  useEffect(() => {
    if (voiceEnabled && !voiceServiceRef.current && !voiceInitializing) {
      console.log("⏳ Voice enabled but service not ready, waiting...");
      setVoiceInitializing(true);
      // The main initialization useEffect will handle this
    }
  }, [voiceEnabled, voiceInitializing]);

  // ============ HELPER: Manually reinitialize voice service ============
  const reinitializeVoiceService = async () => {
    if (!voiceEnabled) {
      toast.error("Enable voice first bestie");
      return;
    }

    setVoiceInitializing(true);
    const toastId = toast.loading("🔄 Refreshing voice service...");

    // Destroy existing service if any
    if (voiceServiceRef.current) {
      voiceServiceRef.current.destroy();
      voiceServiceRef.current = null;
      voiceServiceInitializedRef.current = false;
    }

    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 500));

    // Trigger reinitialization by toggling voice state
    setVoiceEnabled(false);
    await new Promise(resolve => setTimeout(resolve, 100));
    setVoiceEnabled(true);

    toast.dismiss(toastId);
    setVoiceInitializing(false);
    toast.success("✅ Voice service refreshed! Try again");
  };

  // ============ INTERVIEW CONTROL FUNCTIONS ============
  const startVoiceInterview = async () => {
    if (interviewId && userId) {
      if (paymentUsed) {
        console.log("💳 Payment already used, requiring new payment");
        toast.info("💳 Payment used. New payment required for this attempt.");
        setShowPaymentModal(true);
        return;
      }

      if (!hasPaid) {
        console.log("💳 No payment found, showing modal");
        toast.info("💳 Payment required to start");
        setShowPaymentModal(true);
        return;
      }
    }

    // 🚨 FIX: Wait for voice service to be ready
    if (!voiceServiceRef.current) {
      console.log("⏳ Voice service not ready, checking status...");

      if (!voiceEnabled) {
        toast.error("Please enable voice first using the toggle above");
        return;
      }

      // Show initializing toast
      const initToast = toast.loading("🔄 Initializing voice service...");
      setVoiceInitializing(true);

      // Wait for voice service to initialize with multiple attempts
      let attempts = 0;
      const maxAttempts = 15; // 15 * 300ms = 4.5 seconds max wait

      while (!voiceServiceRef.current && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 300));
        attempts++;
        console.log(`⏳ Waiting for voice service... attempt ${attempts}/${maxAttempts}`);
      }

      toast.dismiss(initToast);
      setVoiceInitializing(false);

      if (!voiceServiceRef.current) {
        console.error("❌ Voice service failed to initialize after", maxAttempts, "attempts");
        toast.error("Voice service failed. Hit the '🔄 Retry Voice' button and try again.");
        return;
      } else {
        console.log("✅ Voice service initialized successfully after", attempts, "attempts");
        toast.success("✅ Voice service ready!");
      }
    }

    if (questions.length === 0 && !sessionData) {
      toast.error("No session data available");
      return;
    }

    if (!showResumeModal) {
      setMessages([]);
      setAnswerHistory([]);
      answersRef.current = [];
      setUserTranscript("");
      setCurrentQuestionText("");
      setQuestionStartTimes({});
      setPerformanceSaved(false);
      setCurrentEmotion(null);
      setEmotionalIntensity(5);
      setFeedbackCalled(false);
    }

    setIsLoading(true);
    setDebugInfo(prev => ({
      ...prev,
      callStatus: "STARTING",
      currentQuestion: resumeData.currentQuestion || 0,
      collectedAnswers: resumeData.answerHistory?.length || 0
    }));

    try {
      // For farmer mode, use the new farmer session method
      if (sessionData && voiceServiceRef.current && typeof voiceServiceRef.current.startFarmerSession === 'function') {
        await voiceServiceRef.current.startFarmerSession(sessionData);
      } else if (voiceServiceRef.current) {
        await voiceServiceRef.current.startInterview();
      } else {
        throw new Error("Voice service not available");
      }

      setDebugInfo(prev => ({ ...prev, callStatus: "ACTIVE" }));

      // 🌱 Speak welcome message and recommendations for farmer mode (ONLY ONCE)
      if (sessionData && !welcomeSpoken && voiceServiceRef.current) {
        setWelcomeSpoken(true);

        // Welcome message
        const welcomeMsg = `I'm ready to help you level up your farm. Spill the tea or type your question below.`;

        // Use browser speech synthesis for welcome (more reliable)
        try {
          const welcomeUtterance = new SpeechSynthesisUtterance(welcomeMsg);
          welcomeUtterance.rate = 0.9;
          window.speechSynthesis.speak(welcomeUtterance);

          // Small pause before recommendations
          await new Promise(resolve => setTimeout(resolve, 2000));

          // Stream recommendations one by one
          await speakRecommendations();
        } catch (speechError) {
          console.error("Speech synthesis error:", speechError);
          toast.info("📱 Check out your recommendations below:");
        }
      }

      // Auto-start listening after recommendations
      if (sessionData && voiceServiceRef.current && typeof voiceServiceRef.current.listenForQuestion === 'function') {
        console.log("🎤 Auto-starting listening for questions...");
        setTimeout(async () => {
          try {
            await voiceServiceRef.current?.listenForQuestion();
            setIsVoiceListening(true);
            toast.success("🎤 I'm listening - drop your question!", { duration: 3000 });
          } catch (error) {
            console.error("Failed to start listening:", error);
          }
        }, 3000);
      }

      toast.success(sessionData ? "🌱 Ask away! I'm all ears" : "🎤 Interview started! Let's go!");
    } catch (error: any) {
      console.error("❌ Failed to start interview:", error);
      toast.error("Failed to start: " + error.message);
      setDebugInfo(prev => ({ ...prev, callStatus: "ERROR" }));
    } finally {
      setIsLoading(false);
    }
  };

  const stopInterview = () => {
    if (voiceServiceRef.current) {
      voiceServiceRef.current.stop();
      setIsLoading(false);
      setDebugInfo(prev => ({
        ...prev,
        callStatus: "STOPPED",
        isListening: false,
        isSpeaking: false
      }));
      toast.info("🛑 Session stopped");
      setIsVoiceListening(false);
    }
  };

  // ============ FIXED: submitAnswer with AI speaking check ============
  const submitAnswer = async () => {
    console.log("🔘 Submit button clicked!");
    console.log("📝 Current userTranscript:", userTranscript);

    // Don't submit if AI is speaking
    if (isAISpeakingRef.current) {
      console.log("⏳ AI is speaking, please wait...");
      toast.info("AI's talking - give it a sec");
      return;
    }

    if (!userTranscript || !userTranscript.trim()) {
      console.log("⚠️ No transcript to submit");
      toast.warning("Say or type your question first bestie");
      return;
    }

    console.log("✅ Transcript valid, submitting question:", userTranscript);

    // For farmer mode, manually submit the question
    if (sessionData) {
      // Add user message to UI
      setMessages(prev => [...prev, {
        role: "user",
        content: userTranscript,
        timestamp: Date.now()
      }]);

      // Create answer history entry
      const newEntry: AnswerHistory = {
        question: userTranscript,
        answer: "Loading answer...",
        questionNumber: answerHistory.length + 1,
        timestamp: new Date().toLocaleTimeString()
      };

      setAnswerHistory(prev => [...prev, newEntry]);
      setIsLoading(true);

      // Stop listening while processing
      if (voiceServiceRef.current && typeof voiceServiceRef.current.stopListening === 'function') {
        voiceServiceRef.current.stopListening();
        setIsVoiceListening(false);
      }

      try {
        console.log("📡 Sending question to farmer API:", userTranscript);

        const response = await fetch('/api/farmer/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            question: userTranscript,
            userId,
            sessionId: interviewId,
            sessionData
          })
        });

        const data = await response.json();
        console.log("📡 API Response:", data);

        if (data.success) {
          setAnswerHistory(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              answer: data.answer
            };
            return updated;
          });

          setMessages(prev => [...prev, {
            role: "assistant",
            content: data.answer,
            timestamp: Date.now()
          }]);

          await speakStreaming(data.answer);

          // Clear transcript after successful submission
          setUserTranscript("");
          sessionStorage.removeItem('lastTranscript');

          toast.success("✅ Answer secured!");
        } else {
          toast.error(data.error || "Failed to get answer");
        }
      } catch (error) {
        console.error("❌ Query error:", error);
        toast.error("Failed to process question. Try again");
      } finally {
        setIsLoading(false);
      }
    } else if (voiceServiceRef.current) {
      // Interview mode
      try {
        await voiceServiceRef.current.submitAnswer();
      } catch (error) {
        console.error("❌ Failed to submit answer:", error);
        toast.error("Failed to submit answer");
      }
    } else {
      toast.error("Submit function not available");
    }
  };

  const skipQuestion = async () => {
    if (voiceServiceRef.current) {
      try {
        await voiceServiceRef.current.skipQuestion();
      } catch (error) {
        console.error("❌ Failed to skip question:", error);
        toast.error("Failed to skip question");
      }
    } else {
      toast.error("Skip function not available");
    }
  };

  const handleVoiceToggle = (enabled: boolean) => {
    setVoiceEnabled(enabled);
    if (enabled) {
      toast.success(sessionData ? "🌱 Voice mode activated! Let's vibe" : "Voice mode activated!");
      setDebugInfo(prev => ({
        ...prev,
        callStatus: "READY",
        serviceStatus: "INITIALIZING"
      }));
    } else {
      toast.info("Voice mode disabled");
      setDebugInfo(prev => ({
        ...prev,
        callStatus: "INACTIVE",
        isListening: false,
        isSpeaking: false,
        serviceStatus: "DISABLED"
      }));
      setIsVoiceListening(false);
    }
  };

  // ============ Manual voice listening start with AI speaking check ============
  const startVoiceListening = async () => {
    if (!voiceServiceRef.current) {
      toast.error("Voice service not ready");
      return;
    }

    // Don't start listening if AI is speaking
    if (isAISpeakingRef.current) {
      console.log("⏳ AI is speaking, will start listening after");
      toast.info("AI's talking - hold up");
      return;
    }

    if (typeof voiceServiceRef.current.listenForQuestion === 'function') {
      try {
        await voiceServiceRef.current.listenForQuestion();
        setIsVoiceListening(true);
        toast.success("🎤 Listening... spill the tea");
      } catch (error) {
        console.error("Failed to start listening:", error);
        toast.error("Failed to start listening");
      }
    } else {
      toast.error("Listen function not available");
    }
  };

  // ============ RESUME FUNCTIONALITY ============
  const handleResumeInterview = async () => {
    if (!resumeData?.canResume || !userId) {
      toast.error("Cannot resume interview");
      return;
    }

    setShowResumeModal(false);

    if (resumeData.partialAnswer) {
      setUserTranscript(resumeData.partialAnswer);
    }

    if (resumeData.answerHistory) {
      const history = resumeData.answerHistory.map((item: any) => ({
        question: item.question,
        answer: item.answer,
        questionNumber: item.questionNumber,
        timestamp: item.timestamp
      }));
      setAnswerHistory(history);
      answersRef.current = history;
    }

    if (resumeData.currentQuestion) {
      setDebugInfo(prev => ({
        ...prev,
        currentQuestion: resumeData.currentQuestion || 0,
        collectedAnswers: resumeData.answerHistory?.length || 0
      }));
    }

    toast.success(`✅ Resumed from question ${resumeData.currentQuestion || 1}`);

    if (voiceServiceRef.current && questions.length > 0) {
      try {
        setIsLoading(true);
        await voiceServiceRef.current.startInterview();
        setDebugInfo(prev => ({ ...prev, callStatus: "ACTIVE" }));
        toast.success("🎤 Interview resumed! Pick up where you left off");
      } catch (error: any) {
        console.error("❌ Failed to resume interview:", error);
        toast.error("Failed to resume: " + error.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleStartNewInterview = () => {
    setShowResumeModal(false);
    if (interviewId && userId) {
      localStorage.removeItem(`resume_interview_${userId}`);
    }
    toast.info("Starting fresh");
  };

  // ============ INTERVIEW COMPLETION HANDLER (for interview mode) ============
  const handleInterviewCompletion = async (data: any, capturedAnswers?: AnswerHistory[]) => {
    console.log("🎉 Interview completed:", data);
    toast.success("Interview complete! You crushed it!");
    setTimeout(() => {
      window.location.href = '/';
    }, 3000);
  };

  // ============ UI RENDER ============
  const displayName = userName || "User";
  const userAltText = `${displayName}'s profile picture`;
  const aiAltText = sessionData ? "🌱 Gen Z Farmer AI" : "AI Interviewer";

  const isStartButtonDisabled =
    isLoading ||
    !voiceEnabled ||
    debugInfo.callStatus === "COMPLETED" ||
    (questions.length === 0 && !sessionData) ||
    !paymentChecked ||
    (interviewId && userId && !hasPaid) ||
    (interviewId && userId && paymentUsed) ||
    voiceInitializing;

  const getStartButtonText = () => {
    if (isLoading) return "Starting...";
    if (voiceInitializing) return "Initializing...";
    if (debugInfo.callStatus === "COMPLETED") return "✅ Done";
    if (questions.length === 0 && !sessionData) return "No Data";
    if (!paymentChecked) return "Checking...";
    if (paymentUsed) return "Pay Again - KES 3";
    if (interviewId && userId && !hasPaid) return "Pay KES 3 to Start";
    return sessionData ? "🌱 Start Vibing" : "🎤 Start Practice";
  };

  // Determine if submit button should be enabled
  const isSubmitEnabled = userTranscript?.trim()?.length > 0 && !isLoading && !isAISpeakingRef.current;

  // Gen Z color palette
  const colors = {
    primary: "from-emerald-400 to-teal-500",
    secondary: "from-purple-400 to-pink-500",
    accent: "from-amber-400 to-orange-500",
    success: "from-green-400 to-emerald-500",
    warning: "from-yellow-400 to-amber-500",
    error: "from-rose-400 to-red-500",
    info: "from-blue-400 to-indigo-500",
    background: "bg-gradient-to-br from-slate-50 to-white",
    card: "bg-white/80 backdrop-blur-sm border border-white/20",
    text: "text-gray-800",
    textLight: "text-gray-600",
  };

  return (
    <div className={`flex flex-col gap-6 p-4 ${colors.background} rounded-2xl`}>
      {/* Header with Gen Z styling */}
      <div className={`${colors.card} rounded-2xl p-4 shadow-lg border border-emerald-100`}>
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-row items-center gap-4">
            <div className="relative">
              <Image
                src={profileImage || "/beautiful-avatar.png"}
                alt={userAltText}
                width={48}
                height={48}
                className="rounded-full object-cover size-12 ring-4 ring-emerald-200"
              />
              {debugInfo.callStatus === "ACTIVE" && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white animate-pulse"></span>
              )}
            </div>
            <div>
              <h4 className={`font-bold text-lg bg-gradient-to-r ${colors.primary} bg-clip-text text-transparent`}>
                {displayName}
              </h4>
              <p className={`text-sm ${colors.textLight} flex items-center gap-1`}>
                <Sparkles className="w-3 h-3 text-emerald-500" />
                {sessionData ? "Farmer AI • Gen Z Edition" : "Interview Practice"}
              </p>
              <p className="text-xs text-gray-400">ID: {debugInfo.userId.substring(0, 8)}...</p>

              {sessionData && (
                <div className="mt-1 flex flex-wrap gap-2">
                  <span className="text-xs bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 px-2 py-1 rounded-full flex items-center gap-1">
                    <Sprout className="w-3 h-3" />
                    {sessionData.crops?.join(", ")}
                  </span>
                  <span className="text-xs bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {sessionData.county}
                  </span>
                </div>
              )}

              {resumeData?.canResume && (
                <div className="mt-1">
                  <span className="text-xs bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-2 py-1 rounded-full flex items-center gap-1 w-fit">
                    <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                    Resume available
                  </span>
                </div>
              )}

              {performanceHistory && performanceHistory.length > 0 && (
                <div className="mt-1">
                  <span className="text-xs bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 px-2 py-1 rounded-full flex items-center gap-1 w-fit">
                    <BarChart3 className="w-3 h-3" />
                    {performanceHistory.length} interviews analyzed
                  </span>
                </div>
              )}

              {currentEmotion && (
                <div className="mt-1">
                  <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 w-fit ${
                    currentEmotion === 'confident' ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700' :
                    currentEmotion === 'anxious' ? 'bg-gradient-to-r from-rose-100 to-red-100 text-red-700' :
                    currentEmotion === 'calm' ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700' :
                    'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${
                      currentEmotion === 'confident' ? 'bg-green-500' :
                      currentEmotion === 'anxious' ? 'bg-red-500' :
                      currentEmotion === 'calm' ? 'bg-blue-500' :
                      'bg-yellow-500'
                    }`}></span>
                    Feeling {currentEmotion}
                  </span>
                </div>
              )}

              {interviewId && userId && (
                <div className="mt-1">
                  {!paymentChecked ? (
                    <span className="text-xs bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 px-2 py-1 rounded-full flex items-center gap-1 w-fit">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                      Checking payment...
                    </span>
                  ) : paymentUsed ? (
                    <span className="text-xs bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 px-2 py-1 rounded-full flex items-center gap-1 w-fit">
                      <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                      🔒 Payment used - Pay again
                    </span>
                  ) : hasPaid ? (
                    <span className="text-xs bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1 w-fit">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      ✅ Paid & ready
                    </span>
                  ) : (
                    <span className="text-xs bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 px-2 py-1 rounded-full flex items-center gap-1 w-fit">
                      <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                      🔒 Payment required (KES 3)
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {currentEmotion && emotionalIntensity > 6 && (
              <button
                onClick={() => setShowEmotionalSupport(!showEmotionalSupport)}
                className={`px-4 py-2 rounded-xl flex items-center gap-2 bg-gradient-to-r from-pink-400 to-rose-400 text-white hover:from-pink-500 hover:to-rose-500 shadow-lg hover:shadow-xl transition-all duration-300`}
              >
                <Heart className="w-4 h-4" />
                <span className="hidden sm:inline">Support</span>
              </button>
            )}

            {performanceHistory && performanceHistory.length > 0 && (
              <button
                onClick={() => setShowPerformanceAnalysis(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Performance</span>
              </button>
            )}

            <button
              onClick={startVoiceInterview}
              disabled={isStartButtonDisabled}
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-xl ${
                !isStartButtonDisabled
                  ? sessionData
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              } ${isLoading ? 'animate-pulse' : ''}`}
            >
              <span className="flex items-center gap-2">
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                {getStartButtonText()}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Farm Profile Summary - Gen Z style */}
      {sessionData && (
        <div className={`${colors.card} rounded-2xl p-5 shadow-lg border border-emerald-100`}>
          <h4 className="font-semibold text-lg bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-3 flex items-center gap-2">
            <Sprout className="w-5 h-5 text-emerald-500" />
            Your Farm Vibe
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-3 border border-emerald-100">
              <div className="text-xs text-emerald-600 mb-1">Crops</div>
              <div className="font-medium text-emerald-800">{sessionData.crops?.join(", ")}</div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-3 border border-blue-100">
              <div className="text-xs text-blue-600 mb-1">Location</div>
              <div className="font-medium text-blue-800">{sessionData.county}{sessionData.subCounty ? `, ${sessionData.subCounty}` : ""}</div>
            </div>
            {sessionData.acres && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-3 border border-amber-100">
                <div className="text-xs text-amber-600 mb-1">Acres</div>
                <div className="font-medium text-amber-800">{sessionData.acres}</div>
              </div>
            )}
            {sessionData.cattle > 0 && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-3 border border-purple-100">
                <div className="text-xs text-purple-600 mb-1">Cattle</div>
                <div className="font-medium text-purple-800">{sessionData.cattle}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Emotional Support Panel */}
      {showEmotionalSupport && userId && (
        <div className="animate-fade-in">
          <EmotionalSupport
            userId={userId}
            currentEmotion={currentEmotion}
            emotionIntensity={emotionalIntensity}
          />
        </div>
      )}

      {/* Voice Toggle with Retry Button - Gen Z style */}
      <div className={`${colors.card} rounded-2xl p-5 shadow-lg border border-purple-100`}>
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-semibold text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
            <Mic className="w-5 h-5 text-purple-500" />
            {sessionData ? "Voice Assistant" : "Voice Practice"}
          </h4>
          <div className="flex items-center gap-2">
            {voiceEnabled && !voiceServiceRef.current && !voiceInitializing && (
              <button
                onClick={reinitializeVoiceService}
                className="px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-sm rounded-xl hover:from-yellow-500 hover:to-amber-600 flex items-center gap-1 shadow-md"
              >
                <span>🔄</span> Retry
              </button>
            )}
            <span className={`text-sm font-medium px-3 py-1.5 rounded-xl ${
              debugInfo.callStatus === "COMPLETED" ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700' :
              debugInfo.callStatus === "ACTIVE" ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700' :
              debugInfo.callStatus === "LISTENING" ? 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700' :
              debugInfo.callStatus === "SPEAKING" ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700' :
              debugInfo.callStatus === "STARTING" ? 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700' :
              debugInfo.callStatus === "STOPPED" ? 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700' :
              debugInfo.callStatus === "ERROR" ? 'bg-gradient-to-r from-rose-100 to-red-100 text-red-700' :
              'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700'
            }`}>
              {debugInfo.callStatus}
            </span>
          </div>
        </div>

        <VoiceToggle
          onVoiceToggle={handleVoiceToggle}
          initialEnabled={voiceEnabled}
        />

        {voiceInitializing && (
          <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl text-blue-700 flex items-center gap-2 border border-blue-200">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Initializing voice service...</span>
          </div>
        )}

        {/* AI Speaking Indicator */}
        {isAISpeakingRef.current && (
          <div className="mt-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl text-purple-700 flex items-center gap-2 border border-purple-200">
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
            <span>🔊 AI is speaking...</span>
          </div>
        )}

        <div className="mt-4 space-y-2 text-sm text-gray-600">
          <p className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
            {sessionData ? "Speak OR type your farming questions" : "Speak your answer after each question"}
          </p>
          <p className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
            {sessionData ? "Click 'ASK' after you finish" : "Click 'Submit Answer' to move forward"}
          </p>
          {sessionData && (
            <p className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
              Get instant answers from agricultural knowledge base
            </p>
          )}

          {voiceEnabled && (
            <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl text-blue-700 border border-blue-200">
              <p className="font-medium flex items-center gap-1">
                <Zap className="w-4 h-4" />
                Auto-save Enabled
              </p>
              <p className="text-xs">Progress saved every 30 secs. You can resume anytime.</p>
            </div>
          )}

          {sessionData ? (
            <div className="mt-3 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl text-emerald-700 border border-emerald-200">
              <p className="font-medium flex items-center gap-1">
                <Sprout className="w-4 h-4" />
                Ask about:
              </p>
              <p className="text-xs">Planting, pests, diseases, fertilizers, harvesting, and more!</p>
              <p className="text-xs font-medium mt-2 text-emerald-800">👉 Speak clearly OR type, then hit ASK</p>
            </div>
          ) : (
            <>
              <div className="mt-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl text-purple-700 border border-purple-200">
                <p className="font-medium flex items-center gap-1">
                  <BarChart3 className="w-4 h-4" />
                  Performance Tracking
                </p>
                <p className="text-xs">Your answers are analyzed to find your strengths</p>
              </div>

              <div className="mt-3 p-3 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl text-pink-700 border border-pink-200">
                <p className="font-medium flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  Emotional Awareness
                </p>
                <p className="text-xs">We vibe with your mood for personalized support</p>
              </div>
            </>
          )}

          {interviewId && userId && (
            <div className="mt-3">
              {paymentUsed ? (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-3 text-amber-700 border border-amber-200">
                  <p className="font-medium">💳 Payment Used</p>
                  <p className="text-xs">Previous payment consumed. Pay KES 3 for this attempt.</p>
                </div>
              ) : !hasPaid && paymentChecked ? (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-3 text-amber-700 border border-amber-200">
                  <p className="font-medium">💳 Payment Required</p>
                  <p className="text-xs">Pay KES 3 with MPESA to unlock</p>
                  <p className="text-xs mt-1 font-medium">💰 KES 3 per attempt</p>
                </div>
              ) : hasPaid ? (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-3 text-green-700 border border-green-200">
                  <p className="font-medium">✅ Payment Verified</p>
                  <p className="text-xs">KES 3 payment ready for this attempt</p>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* Farmer Instruction Banner - Gen Z style */}
      {sessionData && debugInfo.callStatus === "ACTIVE" && (
        <div className="bg-gradient-to-r from-yellow-100 to-amber-100 rounded-2xl p-4 shadow-lg border border-yellow-200 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-amber-400 rounded-full flex items-center justify-center">
              <span className="text-xl">🗣️</span>
            </div>
            <p className="text-yellow-800 font-medium">
              Speak OR type your question, then hit the <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 py-1.5 rounded-xl mx-1 font-bold">ASK</span> button
            </p>
          </div>
        </div>
      )}

      {/* Voice Listening Indicator */}
      {isVoiceListening && !isAISpeakingRef.current && (
        <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl p-3 flex items-center gap-3 shadow-lg border border-green-200">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-700 font-medium">🎤 Listening... drop your question</span>
        </div>
      )}

      {/* Manual Voice Start Button */}
      {sessionData && debugInfo.callStatus === "ACTIVE" && !isVoiceListening && !isAISpeakingRef.current && (
        <button
          onClick={startVoiceListening}
          className="px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 flex items-center gap-2 w-fit shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Mic className="w-4 h-4" />
          Start Voice Listening
        </button>
      )}

      {/* ========== ✅ COMPACT SUBMIT SECTION - Gen Z style ========== */}
      {sessionData && (
        <div className={`${colors.card} rounded-2xl p-5 shadow-lg border-2 border-emerald-200`}>
          <div className="flex items-center gap-2 mb-3">
            <h3 className="font-bold text-lg bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent flex items-center gap-2">
              <Send className="w-5 h-5 text-emerald-500" />
              Your Question
            </h3>
            {userTranscript.trim().length > 0 && (
              <span className="text-xs bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-2 py-1 rounded-full">
                Ready to submit
              </span>
            )}
          </div>

          {/* Main input area */}
          <div className="flex gap-2">
            <input
              type="text"
              value={userTranscript}
              onChange={(e) => setUserTranscript(e.target.value)}
              placeholder="Type your question here..."
              className="flex-1 px-4 py-3 bg-white/90 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 transition-all duration-300"
              disabled={isAISpeakingRef.current}
            />

            {/* SUBMIT BUTTON */}
            <button
              onClick={submitAnswer}
              disabled={!userTranscript.trim() || isLoading || isAISpeakingRef.current}
              className={`px-6 py-3 rounded-xl font-bold whitespace-nowrap transition-all duration-300 ${
                userTranscript.trim() && !isLoading && !isAISpeakingRef.current
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 shadow-lg hover:shadow-xl'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  ...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  ASK
                </span>
              )}
            </button>
          </div>

          {/* Character count */}
          <p className="text-xs text-gray-500 mt-2 flex items-center gap-2">
            <span>{userTranscript.length} characters</span>
            {userTranscript.trim().length > 0 && (
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
            )}
            <span>{userTranscript.trim().length > 0 ? "Ready to submit" : "Type or speak your question"}</span>
            {isAISpeakingRef.current && (
              <span className="ml-auto text-purple-600 flex items-center gap-1">
                <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></span>
                AI speaking - wait
              </span>
            )}
          </p>

          {/* Manual voice start button (compact) */}
          {!isVoiceListening && !isAISpeakingRef.current ? (
            <button
              onClick={startVoiceListening}
              className="mt-3 w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 flex items-center justify-center gap-2 text-sm shadow-md hover:shadow-lg transition-all duration-300"
            >
              <Mic className="w-4 h-4" />
              Start Voice Listening
            </button>
          ) : isVoiceListening && !isAISpeakingRef.current ? (
            <div className="mt-3 flex items-center gap-2 text-emerald-600 text-sm bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-xl">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Listening... Speak now</span>
            </div>
          ) : null}
        </div>
      )}

      {/* ========== 🔥 RECOMMENDATIONS DISPLAY WITH "ASK QUESTIONS" BUTTON ========== */}
      {sessionData && sessionData.recommendations && sessionData.recommendations.length > 0 && (
        <div className={`${colors.card} rounded-2xl p-5 shadow-lg border border-indigo-100`}>
          <h4 className="font-semibold text-lg bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            Your Personalized Recommendations
          </h4>
          <div className="space-y-3">
            {sessionData.recommendations.map((rec: string, idx: number) => {
              // Random gradient for each card
              const gradients = [
                "from-emerald-50 to-teal-50 border-emerald-200",
                "from-blue-50 to-indigo-50 border-blue-200",
                "from-purple-50 to-pink-50 border-purple-200",
                "from-amber-50 to-orange-50 border-amber-200",
                "from-rose-50 to-red-50 border-rose-200"
              ];
              return (
                <div key={idx} className={`bg-gradient-to-r ${gradients[idx % gradients.length]} p-4 rounded-xl border shadow-sm hover:shadow-md transition-all duration-300`}>
                  <div className="flex items-start gap-3">
                    <span className={`bg-gradient-to-r ${
                      idx === 0 ? 'from-emerald-500 to-teal-500' :
                      idx === 1 ? 'from-blue-500 to-indigo-500' :
                      idx === 2 ? 'from-purple-500 to-pink-500' :
                      idx === 3 ? 'from-amber-500 to-orange-500' :
                      'from-rose-500 to-red-500'
                    } text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-md`}>
                      {idx + 1}
                    </span>
                    <p className="text-gray-700">{rec}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 🔥 NEW BUTTON - Go to Q&A Page */}
          <div className="mt-6 flex justify-center">
            <Link href={`/ask/${interviewId}`}>
              <button className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold text-lg hover:from-emerald-600 hover:to-teal-600 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3">
                <MessageCircle className="w-6 h-6" />
                Continue to Ask Questions
                <ArrowRight className="w-6 h-6" />
              </button>
            </Link>
          </div>
        </div>
      )}

      {/* Current Question Display - Only for interview mode */}
      {!sessionData && debugInfo.currentQuestion > 0 && currentQuestionText && (
        <div className={`${colors.card} rounded-2xl p-5 shadow-lg border border-blue-200`}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl flex items-center justify-center text-sm font-bold shadow-md">
              {debugInfo.currentQuestion}
            </div>
            <h4 className="font-bold text-lg bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Current Question
            </h4>
            <span className="ml-auto text-xs bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-2 py-1 rounded-full">
              {categorizeQuestion(currentQuestionText)}
            </span>
          </div>
          <p className="text-gray-700 bg-white/50 p-4 rounded-xl">{currentQuestionText}</p>
          {debugInfo.isListening && !isAISpeakingRef.current && (
            <div className="mt-3 flex items-center gap-2 text-red-600">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">🎤 Listening...</span>
            </div>
          )}
        </div>
      )}

      {/* Messages Display */}
      {messages.length > 0 && (
        <div className={`${colors.card} rounded-2xl p-5 shadow-lg border border-purple-200`}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl flex items-center justify-center">
              <span className="text-sm">💬</span>
            </div>
            <h4 className="font-bold text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Conversation
            </h4>
          </div>

          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl p-3 ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                    : 'bg-white border-2 border-gray-200 shadow-md'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <p className="text-xs opacity-70 mt-2">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
      )}

      {/* Answer History (for compatibility) */}
      {answerHistory.length > 0 && !sessionData && (
        <div className={`${colors.card} rounded-2xl p-5 shadow-lg border border-purple-200`}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl flex items-center justify-center">
              <span className="text-sm">📝</span>
            </div>
            <h4 className="font-bold text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Your Answers
            </h4>
            <span className="ml-auto text-sm bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-3 py-1 rounded-full">
              {answerHistory.length} answered
            </span>
          </div>

          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {answerHistory.map((item, index) => {
              const gradients = [
                "from-purple-50 to-pink-50 border-purple-200",
                "from-blue-50 to-indigo-50 border-blue-200",
                "from-emerald-50 to-teal-50 border-emerald-200"
              ];
              return (
                <div key={index} className={`bg-gradient-to-r ${gradients[index % gradients.length]} rounded-xl p-4 border shadow-sm`}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-md">
                      {item.questionNumber}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-bold text-purple-800">Question {item.questionNumber}</h5>
                        <span className="text-xs bg-white/80 px-2 py-1 rounded-full">
                          {item.timestamp}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm mb-3">{item.question}</p>
                      <div className="border-t pt-3">
                        <h6 className="font-semibold text-emerald-700 mb-2">Your Answer</h6>
                        <div className="bg-white/80 border border-emerald-200 rounded-lg p-3">
                          <p className="text-gray-800 whitespace-pre-wrap">{item.answer}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Status Panel - Gen Z style */}
      <div className={`${colors.card} rounded-2xl p-5 shadow-lg border border-gray-200`}>
        <h4 className="font-bold text-lg mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-gray-600" />
          Session Status
        </h4>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-3 border border-gray-200">
            <div className="text-xs text-gray-500 mb-1">{sessionData ? "Questions" : "Questions"}</div>
            <div className="font-bold text-lg text-gray-800">
              {messages.filter(m => m.role === 'user').length}/{sessionData ? "∞" : debugInfo.totalQuestions}
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-3 border border-gray-200">
            <div className="text-xs text-gray-500 mb-1">Answers</div>
            <div className="font-bold text-lg text-gray-800">
              {messages.filter(m => m.role === 'assistant').length}
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-3 border border-gray-200">
            <div className="text-xs text-gray-500 mb-1">Voice</div>
            <div className={`font-bold text-lg ${voiceEnabled ? 'text-green-600' : 'text-red-600'}`}>
              {voiceEnabled ? "ON" : "OFF"}
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-3 border border-gray-200">
            <div className="text-xs text-gray-500 mb-1">Payment</div>
            <div className={`font-bold text-lg ${
              paymentUsed ? 'text-amber-600' :
              hasPaid ? 'text-green-600' :
              'text-red-600'
            }`}>
              {paymentUsed ? "Used" : hasPaid ? "Paid" : "Required"}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={startVoiceInterview}
            disabled={isStartButtonDisabled}
            className={`px-4 py-2.5 rounded-xl font-medium transition-all duration-300 shadow-md hover:shadow-lg ${
              !isStartButtonDisabled
                ? sessionData
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <span className="flex items-center gap-2">
              <span>{sessionData ? '🌱' : '🎤'}</span>
              {getStartButtonText()}
            </span>
          </button>

          {(debugInfo.callStatus === "ACTIVE" || debugInfo.callStatus === "LISTENING" || debugInfo.callStatus === "SPEAKING") && (
            <button
              onClick={stopInterview}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-500 text-white hover:from-rose-600 hover:to-red-600 flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-300"
            >
              <span>🛑</span>
              Stop
            </button>
          )}

          {resumeData?.canResume && !showResumeModal && debugInfo.callStatus === "INACTIVE" && (
            <button
              onClick={() => setShowResumeModal(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-300"
            >
              <span>⏯️</span>
              Resume
            </button>
          )}

          {currentEmotion && emotionalIntensity > 6 && (
            <button
              onClick={() => setShowEmotionalSupport(!showEmotionalSupport)}
              className={`px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-300 ${
                showEmotionalSupport
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white'
                  : 'bg-gradient-to-r from-pink-400 to-rose-400 text-white hover:from-pink-500 hover:to-rose-500'
              }`}
            >
              <Heart className="w-4 h-4" />
              Support
            </button>
          )}

          {interviewId && userId && paymentChecked && (paymentUsed || !hasPaid) && (
            <button
              onClick={() => {
                if (!interviewId || !userId) {
                  toast.error("Cannot process payment: Missing information");
                  return;
                }
                setShowPaymentModal(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-600 hover:to-green-600 flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <span>💳</span>
              {paymentUsed ? "Pay Again KES 3" : "Pay KES 3"}
            </button>
          )}
        </div>
      </div>

      {/* AI Assistant - Gen Z style */}
      <div className={`${colors.card} rounded-2xl p-4 shadow-lg border border-purple-200`}>
        <div className="flex flex-row items-center gap-4">
          <div className="relative">
            <Image
              src="/interview-panel.jpg"
              alt={aiAltText}
              width={48}
              height={48}
              className="rounded-full object-cover size-12 ring-4 ring-purple-200"
            />
            {debugInfo.isSpeaking && (
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center animate-pulse">
                <span className="text-[10px] text-white">🔊</span>
              </span>
            )}
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {sessionData ? "🌱 Gen Z Farmer AI" : "AI Interviewer"}
            </h4>
            <p className="text-gray-600">
              {debugInfo.callStatus === "COMPLETED"
                ? "Session completed! You crushed it!"
                : sessionData
                ? `Ready to help you level up your farm`
                : debugInfo.currentQuestion > 0
                ? `Question ${debugInfo.currentQuestion} of ${debugInfo.totalQuestions}`
                : `Ready with ${debugInfo.totalQuestions} questions`
              }
            </p>
            {debugInfo.isListening && !isAISpeakingRef.current && (
              <p className="text-sm text-blue-600 mt-1 animate-pulse flex items-center gap-1">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                🎤 {sessionData ? "Listening for your question..." : "I'm listening to your answer..."}
              </p>
            )}
            {debugInfo.isSpeaking && (
              <p className="text-sm text-purple-600 mt-1 animate-pulse flex items-center gap-1">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                🔊 {sessionData ? "Speaking answer..." : "Asking question..."}
              </p>
            )}
            {debugInfo.callStatus === "ACTIVE" && !debugInfo.isListening && !debugInfo.isSpeaking && !isAISpeakingRef.current && (
              <p className="text-sm text-emerald-600 mt-1 flex items-center gap-1">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                ⏳ {sessionData ? "Ready for your question - speak/type and hit ASK" : "Ready for your answer"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Resume Interview Modal */}
      {showResumeModal && resumeData?.canResume && (
        <ResumeInterviewModal
          isOpen={showResumeModal}
          onClose={() => setShowResumeModal(false)}
          onResume={handleResumeInterview}
          onStartNew={handleStartNewInterview}
          resumeData={resumeData}
        />
      )}

      {/* MPESA Payment Modal */}
      <MPESAPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={() => {
          setShowPaymentModal(false);
          setHasPaid(true);
          setPaymentUsed(false);
          toast.success("✅ Payment confirmed! Starting now...");
          setTimeout(() => {
            startVoiceInterview();
          }, 1500);
        }}
        cost={3}
        interviewId={interviewId || ""}
        userId={userId || ""}
      />

      {/* Performance Analysis Modal */}
      {!sessionData && showPerformanceAnalysis && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-auto">
            <PerformanceAnalysis
              userId={userId}
              interviewId={interviewId}
              onClose={() => setShowPerformanceAnalysis(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Agent;