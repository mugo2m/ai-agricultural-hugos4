// components/AskAgent.tsx - SYNCHRONIZED STREAMING WITH VOICE
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
  Bug
} from "lucide-react";

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
}

const AskAgent = ({
  userName,
  userId,
  sessionId,
  sessionData,
  recommendations
}: AskAgentProps) => {
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userTranscript, setUserTranscript] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const isAISpeakingRef = useRef(false);
  const wordsRef = useRef<string[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const streamTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

    // Get random greeting
    const greetings = [
      `🌱 Karibu ${userName}! Ready to level up your farm?`,
      `🌾 Yo ${userName}! Let's make your crops thrive!`,
      `🍃 Hey ${userName}! I've got answers based on your farm profile.`,
      `🌸 Welcome back ${userName}! Your crops are calling.`,
      `🌿 Sup ${userName}! Let's get that harvest poppin'!`,
      `🍀 ${userName}! Your farming bestie is here to help.`
    ];
    const greeting = greetings[Math.floor(Math.random() * greetings.length)];

    // Welcome message
    setMessages([{
      role: "assistant",
      content: `${greeting} I'll answer your questions based on your personalized recommendations for ${sessionData?.crops?.join(", ") || "your crops"} in ${sessionData?.county || "your area"}. What would you like to know? 🌟`,
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
  }, [userName, sessionData]);

  // 🔥 NEW: Synchronized streaming function
  const streamAnswerWithVoice = async (fullText: string) => {
    if (!voiceEnabled || !window.speechSynthesis) {
      // Fallback: just show the full text
      setMessages(prev => [...prev, {
        role: "assistant",
        content: fullText,
        timestamp: Date.now()
      }]);
      return;
    }

    setIsStreaming(true);
    setStreamingContent("");
    setCurrentWordIndex(0);

    // Split into words
    const words = fullText.split(' ');
    wordsRef.current = words;

    // Create utterance
    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.volume = 1.0;

    // Get available voices and pick a nice one
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Google UK') || v.name.includes('Samantha'));
    if (preferredVoice) utterance.voice = preferredVoice;

    utteranceRef.current = utterance;
    isAISpeakingRef.current = true;
    setIsSpeaking(true);

    // Track word boundaries for synchronization
    let wordIndex = 0;
    let currentText = '';

    // Use onboundary event to sync text with speech
    utterance.onboundary = (event) => {
      if (event.name === 'word') {
        // Add the next word
        if (wordIndex < words.length) {
          currentText += (wordIndex === 0 ? '' : ' ') + words[wordIndex];
          setStreamingContent(currentText);
          setCurrentWordIndex(wordIndex + 1);
          wordIndex++;

          // Auto-scroll
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
      }
    };

    utterance.onend = () => {
      // Ensure full text is displayed
      setStreamingContent(fullText);

      // Add to messages after a tiny delay
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: fullText,
          timestamp: Date.now()
        }]);
        setStreamingContent("");
        setIsStreaming(false);
        setIsSpeaking(false);
        isAISpeakingRef.current = false;
      }, 100);
    };

    utterance.onerror = (event) => {
      console.error("Speech error:", event);

      // Fallback: show full text
      setMessages(prev => [...prev, {
        role: "assistant",
        content: fullText,
        timestamp: Date.now()
      }]);
      setStreamingContent("");
      setIsStreaming(false);
      setIsSpeaking(false);
      isAISpeakingRef.current = false;
    };

    // Start speaking
    window.speechSynthesis.speak(utterance);
  };

  const speak = async (text: string) => {
    if (!voiceEnabled || !window.speechSynthesis) return;

    // This is now handled by streamAnswerWithVoice
    return Promise.resolve();
  };

  const startListening = () => {
    if (!recognitionRef.current || !voiceEnabled || isAISpeakingRef.current) {
      if (isAISpeakingRef.current) toast.info("✨ AI is speaking, hold up bestie!");
      return;
    }
    try {
      recognitionRef.current.start();
      setIsListening(true);
      toast.success("🎤 Listening... spill the tea!", {
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

  // 🔥 UPDATED: Submit with synchronized streaming
  const submitQuestion = async () => {
    if (!userTranscript.trim()) {
      toast.warning("🌱 Type or speak your question bestie");
      return;
    }

    if (isAISpeakingRef.current) {
      toast.info("✨ AI is speaking, gimme a sec!");
      return;
    }

    stopListening();

    // Add user message
    setMessages(prev => [...prev, {
      role: "user",
      content: userTranscript,
      timestamp: Date.now()
    }]);

    const question = userTranscript;
    setUserTranscript("");
    setIsLoading(true);

    try {
      console.log("📡 Sending question:", question);

      const response = await fetch('/api/farmer/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          userId,
          sessionId,
          sessionData
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
        console.error("❌ Failed to parse JSON:", parseError);
        throw new Error("Invalid response format from server");
      }

      if (data.success && data.answer) {
        // Stream with synchronized voice
        await streamAnswerWithVoice(data.answer);

        toast.success("✅ Answer ready! 💫", {
          icon: <Sparkles className="w-4 h-4 text-yellow-500" />
        });
      } else if (data.error) {
        toast.error(data.error);
        setMessages(prev => [...prev, {
          role: "assistant",
          content: `😅 Oops! ${data.error}`,
          timestamp: Date.now()
        }]);
      } else {
        throw new Error("Unexpected response format");
      }

    } catch (error) {
      console.error("❌ Query error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to process question");

      setMessages(prev => [...prev, {
        role: "assistant",
        content: "🌧️ Sorry bestie, something went wrong. Try again!",
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
      toast.success("🎤 Voice mode activated! Let's vibe!", {
        icon: <Volume2 className="w-4 h-4 text-green-500" />
      });
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

  return (
    <div className="flex flex-col gap-6 p-4 min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-2xl">
      {/* Header with rainbow gradient */}
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
                Ask Your Farming Bestie
                <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
              </h2>
              <p className="text-white/90 flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {sessionData?.county} • {sessionData?.crops?.join(", ")}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowRecommendations(!showRecommendations)}
            className="px-4 py-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-xl flex items-center gap-2 border border-white/40 transition-all duration-300"
          >
            <Sparkles className="w-4 h-4" />
            {showRecommendations ? "✨ Hide Tips" : "🌟 View Tips"}
          </button>
        </div>
      </div>


      {/* Voice Toggle - Cosmic theme */}
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

      {/* Messages Area - WhatsApp style with colored bubbles */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-xl border-2 border-emerald-200 min-h-[400px] max-h-[500px] overflow-y-auto">
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-in`}>
              <div className={`max-w-[80%] rounded-2xl p-4 shadow-md ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-br-none'
                  : 'bg-gradient-to-r from-amber-100 to-yellow-100 text-gray-800 border-2 border-yellow-300 rounded-bl-none'
              }`}>
                <div className="flex items-start gap-2">
                  {msg.role === 'assistant' && (
                    <div className="mt-1">
                      {getRandomIcon()}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <p className={`text-xs mt-2 flex items-center gap-1 ${
                      msg.role === 'user' ? 'text-blue-100' : 'text-amber-700'
                    }`}>
                      {new Date(msg.timestamp).toLocaleTimeString()}
                      {msg.role === 'assistant' && (
                        <span className="flex items-center gap-1">
                          <Leaf className="w-3 h-3" />
                          <Smile className="w-3 h-3" />
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

          {/* 🔥 SYNCHRONIZED STREAMING - Yellow with Green border */}
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
      </div>

      {/* Input Area - Vibrant rainbow */}
      <div className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 rounded-2xl p-5 shadow-xl border-2 border-white/30">
        <div className="flex gap-2">
          <input
            type="text"
            value={userTranscript}
            onChange={(e) => setUserTranscript(e.target.value)}
            placeholder="💬 Type your question here..."
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
                <Sparkles className="w-4 h-4" />
              </div>
            )}
          </button>
        </div>

        {/* Voice button - Cosmic */}
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
              {isListening ? '🎤 Listening... Click to stop' : '🎙️ Click to speak your question'}
            </button>
          </div>
        )}
      </div>

      {/* Quick question chips - Colorful buttons */}
      <div className="flex flex-wrap gap-2 justify-center">
        {[
          { text: 'fertilizer', icon: <Sprout className="w-4 h-4" />, color: 'from-emerald-400 to-teal-400' },
          { text: 'pests', icon: <Bug className="w-4 h-4" />, color: 'from-red-400 to-rose-400' },
          { text: 'watering', icon: <Droplets className="w-4 h-4" />, color: 'from-blue-400 to-cyan-400' },
          { text: 'harvest', icon: <Wheat className="w-4 h-4" />, color: 'from-amber-400 to-orange-400' },
          { text: 'soil', icon: <Leaf className="w-4 h-4" />, color: 'from-lime-400 to-green-400' },
          { text: 'market', icon: <Award className="w-4 h-4" />, color: 'from-purple-400 to-pink-400' }
        ].map((item) => (
          <button
            key={item.text}
            onClick={() => setUserTranscript(`Tell me about ${item.text} for my ${sessionData?.crops?.[0] || 'crops'}`)}
            className={`px-4 py-2 bg-gradient-to-r ${item.color} text-white rounded-full text-sm hover:scale-105 transition-all duration-300 shadow-md flex items-center gap-1 border border-white/50`}
          >
            {item.icon}
            {item.text} 🌱
          </button>
        ))}
      </div>

      {/* Farm stats footer */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-3 shadow-lg">
        <div className="flex justify-around text-white text-sm">
          <div className="flex items-center gap-1">
            <Sprout className="w-4 h-4" />
            <span>{sessionData?.crops?.join(", ")}</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{sessionData?.county}</span>
          </div>
          <div className="flex items-center gap-1">
            <Rocket className="w-4 h-4" />
            <span>{recommendations.length} tips</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AskAgent;