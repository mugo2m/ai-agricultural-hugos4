// components/Agent.tsx - COMPLETE VERSION WITH TEST BUTTONS AND DEBUG INFO
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
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
  Mic
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
      const welcomeMessage = `🌾 Welcome! I'm your agricultural assistant. I see you grow ${sessionData.crops?.join(", ")} in ${sessionData.county}. Ask me anything about your farm!`;

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

  // ============ STREAMING VOICE FUNCTION ============
  const speakStreaming = async (text: string) => {
    if (!voiceServiceRef.current) {
      // Fallback: Use browser speech synthesis
      try {
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
      } catch (error) {
        console.error("Streaming speech error:", error);
      }
      return;
    }

    try {
      // Use the new streaming method if available
      if (typeof voiceServiceRef.current.speakStreaming === 'function') {
        await voiceServiceRef.current.speakStreaming(text);
      } else {
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
      }
    } catch (error) {
      console.error("Streaming speech error:", error);
    }
  };

  // ============ SPEAK RECOMMENDATIONS ONE BY ONE ============
  const speakRecommendations = async () => {
    if (!sessionData?.recommendations || recommendationsSpoken) return;

    setRecommendationsSpoken(true);

    try {
      await speakStreaming("I have prepared some personalized recommendations for your farm. Let me read them to you.");
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

      await speakStreaming("You can now ask me any questions about your farm. Just speak clearly or type your question below.");
    } catch (error) {
      console.error("Error speaking recommendations:", error);
      toast.info("📢 Read your recommendations below:");
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
          toast.success("🎤 Microphone connected successfully");
        })
        .catch(err => {
          console.error("❌ Microphone error:", err.name, err.message);

          let errorMessage = "Microphone access failed";
          if (err.name === 'NotAllowedError') {
            errorMessage = "Microphone permission denied. Please allow access in browser settings.";
          } else if (err.name === 'NotFoundError') {
            errorMessage = "No microphone found. Please connect a microphone.";
          } else if (err.name === 'NotReadableError') {
            errorMessage = "Microphone is in use by another application.";
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

          // CRITICAL: Update transcript from voice service
          if (state.transcript !== userTranscript) {
            console.log("🎤 Voice state transcript update:", {
              old: userTranscript,
              new: state.transcript,
              isListening: state.isListening
            });
            setUserTranscript(state.transcript);
          }

          setDebugInfo(prev => ({
            ...prev,
            isListening: state.isListening,
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
          if (!mountedRef.current) return;

          const userMessages = voiceMessages.filter(m => m.role === "user");
          const assistantMessages = voiceMessages.filter(m => m.role === "assistant");

          const currentQ = Math.max(0, Math.min(assistantMessages.length, questions.length));

          // 🌾 If user just spoke a question (farmer mode)
          if (userMessages.length > assistantMessages.length && sessionData) {
            const latestUserMessage = userMessages[userMessages.length - 1];
            const question = latestUserMessage.content;

            console.log("🌾 Farmer asked (voice):", question);

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
                toast.success("✅ Answer ready!");
              } else {
                toast.error(data.error || "Failed to get answer");
              }
            } catch (error) {
              console.error("Query error:", error);
              toast.error("Failed to process question. Please try again.");
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
            toast.success("✅ Session completed! Thank you for using Farmer AI.");
            setTimeout(() => {
              window.location.href = '/';
            }, 3000);
          } else {
            handleInterviewCompletion(data, [...answersRef.current]);
          }
        });

        setDebugInfo(prev => ({ ...prev, serviceStatus: "READY" }));

        if (sessionData) {
          toast.success("🌾 Farmer AI ready! I'll answer your farming questions.");
        } else {
          toast.success("🎤 Voice service ready! Click 'Start Practice'.");
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
      toast.error("Please enable voice first");
      return;
    }

    setVoiceInitializing(true);
    const toastId = toast.loading("🔄 Reinitializing voice service...");

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
    toast.success("✅ Voice service reinitialized. Please click 'Start Asking' again.");
  };

  // ============ INTERVIEW CONTROL FUNCTIONS ============
  const startVoiceInterview = async () => {
    if (interviewId && userId) {
      if (paymentUsed) {
        console.log("💳 Payment already used, requiring new payment");
        toast.info("💳 Previous payment used. New payment required for this attempt.");
        setShowPaymentModal(true);
        return;
      }

      if (!hasPaid) {
        console.log("💳 No payment found, showing modal");
        toast.info("💳 Payment required to start interview");
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
        toast.error("Voice service failed to initialize. Please click the '🔄 Retry Voice' button below and try again.");
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

      // 🌾 Speak welcome message and recommendations for farmer mode (ONLY ONCE)
      if (sessionData && !welcomeSpoken && voiceServiceRef.current) {
        setWelcomeSpoken(true);

        // Welcome message
        const welcomeMsg = `I am ready to answer your farming questions. You can speak your question or type it below.`;

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
          toast.info("📢 Read your recommendations below:");
        }
      }

      // Auto-start listening after recommendations
      if (sessionData && voiceServiceRef.current && typeof voiceServiceRef.current.listenForQuestion === 'function') {
        console.log("🎤 Auto-starting listening for questions...");
        setTimeout(async () => {
          try {
            await voiceServiceRef.current?.listenForQuestion();
            setIsVoiceListening(true);
            toast.success("🎤 I'm listening - speak your question!", { duration: 3000 });
          } catch (error) {
            console.error("Failed to start listening:", error);
          }
        }, 3000);
      }

      toast.success(sessionData ? "🌾 Ask your farming questions!" : "🎤 Interview started! Speak your answers clearly.");
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

  // ============ FIXED: submitAnswer with debug logging ============
  const submitAnswer = async () => {
    console.log("🔘 Submit button clicked!");
    console.log("📝 Current userTranscript:", userTranscript);
    console.log("📝 userTranscript length:", userTranscript?.length);
    console.log("📝 userTranscript trimmed:", userTranscript?.trim());
    console.log("📝 Transcript empty?", !userTranscript || !userTranscript.trim());

    if (!userTranscript || !userTranscript.trim()) {
      console.log("⚠️ No transcript to submit");
      toast.warning("Please speak or type your question first.");
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
          toast.success("✅ Answer ready!");

          // Clear transcript after successful submission
          setUserTranscript("");
          sessionStorage.removeItem('lastTranscript');
        } else {
          toast.error(data.error || "Failed to get answer");
        }
      } catch (error) {
        console.error("❌ Query error:", error);
        toast.error("Failed to process question");
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
      toast.success(sessionData ? "🌾 Voice mode activated! Ask your farming questions." : "Voice mode activated!");
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

  // ============ Manual voice listening start ============
  const startVoiceListening = async () => {
    if (!voiceServiceRef.current) {
      toast.error("Voice service not ready");
      return;
    }

    if (typeof voiceServiceRef.current.listenForQuestion === 'function') {
      try {
        await voiceServiceRef.current.listenForQuestion();
        setIsVoiceListening(true);
        toast.success("🎤 Listening... speak your question");
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
        toast.success("🎤 Interview resumed! Continue where you left off.");
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
    toast.info("Starting new interview");
  };

  // ============ INTERVIEW COMPLETION HANDLER (for interview mode) ============
  const handleInterviewCompletion = async (data: any, capturedAnswers?: AnswerHistory[]) => {
    console.log("🎉 Interview completed:", data);
    toast.success("Interview completed!");
    setTimeout(() => {
      window.location.href = '/';
    }, 3000);
  };

  // ============ UI RENDER ============
  const displayName = userName || "User";
  const userAltText = `${displayName}'s profile picture`;
  const aiAltText = sessionData ? "🌾 Farmer AI Assistant" : "AI Interviewer avatar";

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
    if (debugInfo.callStatus === "COMPLETED") return "✅ Completed";
    if (questions.length === 0 && !sessionData) return "No Data";
    if (!paymentChecked) return "Checking...";
    if (paymentUsed) return "Payment Used - Pay Again";
    if (interviewId && userId && !hasPaid) return "Pay KES 3 to Start";
    return sessionData ? "🌾 Start Asking" : "Start Practice";
  };

  // Determine if submit button should be enabled
  const isSubmitEnabled = userTranscript?.trim()?.length > 0 && !isLoading;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row items-center gap-4">
          <Image
            src={profileImage || "/beautiful-avatar.png"}
            alt={userAltText}
            width={40}
            height={40}
            className="rounded-full object-cover size-10"
          />
          <div>
            <h4 className="font-semibold">{displayName}</h4>
            <p className="text-sm text-gray-500">{sessionData ? "Farmer AI Assistant" : "Interview Practice"}</p>
            <p className="text-xs text-gray-400">ID: {debugInfo.userId.substring(0, 8)}...</p>

            {sessionData && (
              <div className="mt-1">
                <span className="text-xs text-green-600 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  {sessionData.crops?.join(", ")} • {sessionData.county}
                </span>
              </div>
            )}

            {resumeData?.canResume && (
              <div className="mt-1">
                <span className="text-xs text-blue-600 flex items-center gap-1">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                  Resume available
                </span>
              </div>
            )}

            {performanceHistory && performanceHistory.length > 0 && (
              <div className="mt-1">
                <span className="text-xs text-purple-600 flex items-center gap-1">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  {performanceHistory.length} interviews analyzed
                </span>
              </div>
            )}

            {currentEmotion && (
              <div className="mt-1">
                <span className="text-xs flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${
                    currentEmotion === 'confident' ? 'bg-green-500' :
                    currentEmotion === 'anxious' ? 'bg-red-500' :
                    currentEmotion === 'calm' ? 'bg-blue-500' :
                    'bg-yellow-500'
                  }`}></span>
                  <span className={
                    currentEmotion === 'confident' ? 'text-green-600' :
                    currentEmotion === 'anxious' ? 'text-red-600' :
                    currentEmotion === 'calm' ? 'text-blue-600' :
                    'text-yellow-600'
                  }>
                    {currentEmotion.charAt(0).toUpperCase() + currentEmotion.slice(1)}
                  </span>
                </span>
              </div>
            )}

            {interviewId && userId && (
              <div className="mt-1">
                {!paymentChecked ? (
                  <span className="text-xs text-yellow-600 flex items-center gap-1">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                    Checking payment...
                  </span>
                ) : paymentUsed ? (
                  <span className="text-xs text-amber-600 flex items-center gap-1">
                    <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                    🔒 Payment used - New payment required
                  </span>
                ) : hasPaid ? (
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    ✅ Paid - Ready to start
                  </span>
                ) : (
                  <span className="text-xs text-amber-600 flex items-center gap-1">
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
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                showEmotionalSupport
                  ? 'bg-pink-500 text-white'
                  : 'bg-gradient-to-r from-pink-400 to-rose-400 text-white hover:from-pink-500 hover:to-rose-500'
              } shadow-md hover:shadow-lg`}
            >
              <Heart className="w-4 h-4" />
              Support
            </button>
          )}

          {performanceHistory && performanceHistory.length > 0 && (
            <button
              onClick={() => setShowPerformanceAnalysis(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              <BarChart3 className="w-4 h-4" />
              Performance
            </button>
          )}

          <button
            onClick={startVoiceInterview}
            disabled={isStartButtonDisabled}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              !isStartButtonDisabled
                ? sessionData ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            } ${isLoading ? 'animate-pulse' : ''}`}
          >
            <span className="flex items-center gap-2">
              {isLoading && <span className="animate-spin">⏳</span>}
              {getStartButtonText()}
            </span>
          </button>
        </div>
      </div>

      {/* Farm Profile Summary - Only for farmer mode */}
      {sessionData && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <h4 className="font-semibold text-green-800 mb-2">🌾 Your Farm Profile</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            <div><span className="font-medium">Crops:</span> {sessionData.crops?.join(", ")}</div>
            <div><span className="font-medium">Location:</span> {sessionData.county}{sessionData.subCounty ? `, ${sessionData.subCounty}` : ""}</div>
            {sessionData.acres && <div><span className="font-medium">Acres:</span> {sessionData.acres}</div>}
            {sessionData.cattle > 0 && <div><span className="font-medium">Cattle:</span> {sessionData.cattle}</div>}
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

      {/* Voice Toggle with Retry Button */}
      <div className="border border-gray-300 rounded-xl p-4">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-bold">{sessionData ? "🌾 Farmer Voice Assistant" : "Voice Practice"}</h4>
          <div className="flex items-center gap-2">
            {voiceEnabled && !voiceServiceRef.current && !voiceInitializing && (
              <button
                onClick={reinitializeVoiceService}
                className="px-3 py-1 bg-yellow-500 text-white text-sm rounded-lg hover:bg-yellow-600 flex items-center gap-1"
              >
                <span>🔄</span> Retry Voice
              </button>
            )}
            <span className={`text-sm font-medium px-2 py-1 rounded ${
              debugInfo.callStatus === "COMPLETED" ? 'bg-green-100 text-green-800' :
              debugInfo.callStatus === "ACTIVE" ? 'bg-blue-100 text-blue-800' :
              debugInfo.callStatus === "LISTENING" ? 'bg-yellow-100 text-yellow-800' :
              debugInfo.callStatus === "SPEAKING" ? 'bg-purple-100 text-purple-800' :
              debugInfo.callStatus === "STARTING" ? 'bg-orange-100 text-orange-800' :
              debugInfo.callStatus === "STOPPED" ? 'bg-gray-100 text-gray-800' :
              debugInfo.callStatus === "ERROR" ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
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
          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-blue-700 flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Initializing voice service...</span>
          </div>
        )}

        <div className="mt-4 text-sm text-gray-600 space-y-1">
          <p>{sessionData ? "• Speak OR type your farming questions" : "• Speak your answer after each question"}</p>
          <p>{sessionData ? "• Click 'Submit Answer' after you finish speaking/typing" : "• Click 'Submit Answer' to move forward"}</p>
          <p>{sessionData ? "• Get instant answers from agricultural knowledge base" : "• Your answers are saved below"}</p>
          <p>{sessionData ? "• Your questions and answers are saved below" : ""}</p>

          {voiceEnabled && (
            <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-blue-700">
              <p className="font-medium">💾 Auto-save Enabled</p>
              <p className="text-xs">Progress saved every 30 seconds. You can resume if interrupted.</p>
            </div>
          )}

          {sessionData ? (
            <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-green-700">
              <p className="font-medium">🌾 Ask about:</p>
              <p className="text-xs">Planting, pests, diseases, fertilizers, harvesting, and more!</p>
              <p className="text-xs font-medium mt-1 text-green-800">👉 Speak clearly OR type, then press Submit Answer button</p>
            </div>
          ) : (
            <>
              <div className="mt-3 p-2 bg-purple-50 border border-purple-200 rounded text-purple-700">
                <p className="font-medium">📊 Performance Tracking</p>
                <p className="text-xs">Your answers are analyzed to identify strengths and weak areas</p>
              </div>

              <div className="mt-3 p-2 bg-pink-50 border border-pink-200 rounded text-pink-700">
                <p className="font-medium">😊 Emotional Awareness</p>
                <p className="text-xs">Your emotional state is monitored for personalized support</p>
              </div>
            </>
          )}

          {interviewId && userId && (
            <div className="mt-3 p-2 rounded text-sm">
              {paymentUsed ? (
                <div className="bg-amber-50 border border-amber-200 text-amber-700 p-2 rounded">
                  <p className="font-medium">💳 Payment Used</p>
                  <p className="text-xs">Previous payment consumed. Pay KES 3 for this attempt.</p>
                </div>
              ) : !hasPaid && paymentChecked ? (
                <div className="bg-amber-50 border border-amber-200 text-amber-700 p-2 rounded">
                  <p className="font-medium">💳 Payment Required</p>
                  <p className="text-xs">Pay KES 3 with MPESA to unlock this interview</p>
                  <p className="text-xs mt-1 font-medium">💰 KES 3 per attempt - each retake requires new payment</p>
                </div>
              ) : hasPaid ? (
                <div className="bg-green-50 border border-green-200 text-green-700 p-2 rounded">
                  <p className="font-medium">✅ Payment Verified</p>
                  <p className="text-xs">KES 3 payment ready for this interview attempt</p>
                  <p className="text-xs mt-1">Payment will be consumed when you start</p>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* Farmer Instruction Banner */}
      {sessionData && debugInfo.callStatus === "ACTIVE" && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 animate-pulse">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🗣️</span>
            <p className="text-yellow-800 font-medium">
              Speak OR type your question, then press the <span className="bg-green-600 text-white px-2 py-1 rounded mx-1">Submit Answer</span> button
            </p>
          </div>
        </div>
      )}

      {/* Voice Listening Indicator */}
      {isVoiceListening && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-2 flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-700">🎤 Listening for your question... Speak now</span>
        </div>
      )}

      {/* Manual Voice Start Button */}
      {sessionData && debugInfo.callStatus === "ACTIVE" && !isVoiceListening && (
        <button
          onClick={startVoiceListening}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2 w-fit"
        >
          <Mic className="w-4 h-4" />
          Start Voice Listening
        </button>
      )}

      {/* ========== 🔧 TEST BUTTONS AND DEBUG INFO ========== */}
      {sessionData && (
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-3">
          <h4 className="font-bold text-yellow-800 mb-2">🔧 TEST CONTROLS (Remove later)</h4>

          {/* Test buttons */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setUserTranscript("What is the best fertilizer for maize?")}
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
            >
              Test: Set Transcript
            </button>
            <button
              onClick={() => {
                console.log("Current transcript:", userTranscript);
                toast.info(`Transcript: "${userTranscript}"`);
              }}
              className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
            >
              Log Transcript
            </button>
            <button
              onClick={() => setUserTranscript("")}
              className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
            >
              Clear Transcript
            </button>
          </div>

          {/* Debug info */}
          <div className="bg-white p-3 rounded-lg border border-yellow-200 text-xs font-mono">
            <p><span className="font-bold">Transcript:</span> "{userTranscript || "(empty)"}"</p>
            <p><span className="font-bold">Length:</span> {userTranscript.length}</p>
            <p><span className="font-bold">Has content:</span> {userTranscript.trim().length > 0 ? "✅" : "❌"}</p>
            <p><span className="font-bold">isVoiceListening:</span> {isVoiceListening ? "✅" : "❌"}</p>
            <p><span className="font-bold">callStatus:</span> {debugInfo.callStatus}</p>
            <p><span className="font-bold">Button enabled:</span> {userTranscript.trim().length > 0 && !isLoading ? "✅" : "❌"}</p>
          </div>
        </div>
      )}

      {/* ========== ✅ COMPACT SUBMIT SECTION ========== */}
      {sessionData && (
        <div className="bg-white border-2 border-green-500 rounded-xl p-3 shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-bold text-green-800">📝 Your Question</h3>
            {userTranscript.trim().length > 0 && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Ready to submit</span>
            )}
          </div>

          {/* Main input area */}
          <div className="flex gap-2">
            <input
              type="text"
              value={userTranscript}
              onChange={(e) => setUserTranscript(e.target.value)}
              placeholder="Type your question here..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-1 focus:ring-green-200"
            />

            {/* SUBMIT BUTTON */}
            <button
              onClick={submitAnswer}
              disabled={!userTranscript.trim() || isLoading}
              className={`px-6 py-2 rounded-lg font-bold whitespace-nowrap ${
                userTranscript.trim() && !isLoading
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  ...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span>✅</span>
                  ASK
                </span>
              )}
            </button>
          </div>

          {/* Character count */}
          <p className="text-xs text-gray-500 mt-1">
            {userTranscript.length} characters • {userTranscript.trim().length > 0 ? "Ready to submit" : "Type or speak your question"}
          </p>

          {/* Manual voice start button (compact) */}
          {!isVoiceListening ? (
            <button
              onClick={startVoiceListening}
              className="mt-2 w-full px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2 text-sm"
            >
              <Mic className="w-4 h-4" />
              Start Voice Listening
            </button>
          ) : (
            <div className="mt-2 flex items-center gap-2 text-green-600 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Listening... Speak now</span>
            </div>
          )}
        </div>
      )}

      {/* Recommendations Display */}
      {sessionData && sessionData.recommendations && sessionData.recommendations.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
            <span>📋</span> Your Personalized Recommendations
          </h4>
          <div className="space-y-3">
            {sessionData.recommendations.map((rec: string, idx: number) => (
              <div key={idx} className="bg-white p-3 rounded-lg border border-blue-100">
                <div className="flex items-start gap-2">
                  <span className="bg-blue-100 text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-gray-700">{rec}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Question Display - Only for interview mode */}
      {!sessionData && debugInfo.currentQuestion > 0 && currentQuestionText && (
        <div className="border border-blue-200 bg-blue-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
              {debugInfo.currentQuestion}
            </div>
            <h4 className="font-bold text-blue-800">Current Question</h4>
            <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
              {categorizeQuestion(currentQuestionText)}
            </span>
          </div>
          <p className="text-blue-900">{currentQuestionText}</p>
          {debugInfo.isListening && (
            <div className="mt-3 flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-red-600">🎤 Listening...</span>
            </div>
          )}
        </div>
      )}

      {/* Messages Display */}
      {messages.length > 0 && (
        <div className="border border-purple-200 bg-purple-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center">
              <span className="text-sm">💬</span>
            </div>
            <h4 className="font-bold text-purple-800">Conversation</h4>
          </div>

          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-lg p-3 ${
                  msg.role === 'user' ? 'bg-green-600 text-white' : 'bg-white border border-gray-200'
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
        <div className="border border-purple-200 bg-purple-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center">
              <span className="text-sm">📝</span>
            </div>
            <h4 className="font-bold text-purple-800">Your Answers</h4>
            <span className="ml-auto text-sm bg-purple-100 text-purple-700 px-2 py-1 rounded">
              {answerHistory.length} answered
            </span>
          </div>

          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {answerHistory.map((item, index) => (
              <div key={index} className="bg-white border border-purple-100 rounded-lg p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {item.questionNumber}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h5 className="font-bold text-purple-800">Question {item.questionNumber}</h5>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {item.timestamp}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm mb-3">{item.question}</p>
                    <div className="border-t pt-3">
                      <h6 className="font-semibold text-green-700 mb-2">Your Answer</h6>
                      <div className="bg-green-50 border border-green-100 rounded-lg p-3">
                        <p className="text-gray-800 whitespace-pre-wrap">{item.answer}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Status Panel */}
      <div className="border border-gray-300 rounded-xl p-4">
        <h4 className="font-bold text-lg mb-4">📊 Session Status</h4>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-500">{sessionData ? "Questions" : "Questions"}</div>
            <div className="font-bold text-gray-800">
              {messages.filter(m => m.role === 'user').length}/{sessionData ? "∞" : debugInfo.totalQuestions}
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-500">Answers</div>
            <div className="font-bold text-gray-800">
              {messages.filter(m => m.role === 'assistant').length}
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-500">Voice</div>
            <div className={`font-bold ${voiceEnabled ? 'text-green-600' : 'text-red-600'}`}>
              {voiceEnabled ? "ON" : "OFF"}
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-sm text-gray-500">Payment</div>
            <div className={`font-bold ${
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
            className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
              !isStartButtonDisabled
                ? sessionData ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <span>{sessionData ? '🌾' : '🎤'}</span>
            {getStartButtonText()}
          </button>

          {(debugInfo.callStatus === "ACTIVE" || debugInfo.callStatus === "LISTENING" || debugInfo.callStatus === "SPEAKING") && (
            <button
              onClick={stopInterview}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              <span>🛑</span>
              Stop
            </button>
          )}

          {resumeData?.canResume && !showResumeModal && debugInfo.callStatus === "INACTIVE" && (
            <button
              onClick={() => setShowResumeModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              <span>⏯️</span>
              Resume
            </button>
          )}

          {currentEmotion && emotionalIntensity > 6 && (
            <button
              onClick={() => setShowEmotionalSupport(!showEmotionalSupport)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                showEmotionalSupport
                  ? 'bg-pink-500 text-white'
                  : 'bg-gradient-to-r from-pink-400 to-rose-400 text-white hover:from-pink-500 hover:to-rose-500'
              } shadow-md hover:shadow-lg`}
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
              className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 flex items-center gap-2 shadow-lg hover:shadow-xl"
            >
              <span>💳</span>
              {paymentUsed ? "Pay Again KES 3" : "Pay KES 3"}
            </button>
          )}
        </div>
      </div>

      {/* AI Assistant */}
      <div className="border border-gray-300 rounded-xl p-4">
        <div className="flex flex-row items-center gap-4">
          <Image
            src="/interview-panel.jpg"
            alt={aiAltText}
            width={40}
            height={40}
            className="rounded-full object-cover size-10"
          />
          <div className="flex-1">
            <h4 className="font-semibold">{sessionData ? "🌾 Farmer AI Assistant" : "AI Interviewer"}</h4>
            <p className="text-gray-600">
              {debugInfo.callStatus === "COMPLETED"
                ? "Session completed!"
                : sessionData
                ? `Ready to answer your farming questions`
                : debugInfo.currentQuestion > 0
                ? `Question ${debugInfo.currentQuestion} of ${debugInfo.totalQuestions}`
                : `Ready with ${debugInfo.totalQuestions} questions`
              }
            </p>
            {debugInfo.isListening && (
              <p className="text-sm text-blue-600 mt-1 animate-pulse">
                🎤 {sessionData ? "Listening for your question..." : "I'm listening to your answer..."}
              </p>
            )}
            {debugInfo.isSpeaking && (
              <p className="text-sm text-purple-600 mt-1 animate-pulse">
                🔊 {sessionData ? "Speaking answer..." : "Asking question..."}
              </p>
            )}
            {debugInfo.callStatus === "ACTIVE" && !debugInfo.isListening && !debugInfo.isSpeaking && (
              <p className="text-sm text-green-600 mt-1">
                ⏳ {sessionData ? "Ready for your question - speak/type and press Submit" : "Ready for your answer"}
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
          toast.success("✅ Payment confirmed! Starting interview...");
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