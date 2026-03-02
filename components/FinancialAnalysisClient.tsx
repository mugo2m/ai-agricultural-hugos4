"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Sprout,
  MapPin,
  ArrowLeft,
  DollarSign,
  TrendingUp,
  Package,
  Tractor,
  Droplets,
  Leaf,
  Wheat,
  Loader2,
  CheckCircle,
  ArrowRight,
  Heart,
  Volume2,
  Download,
  Printer,
  Share2,
  Calendar,
  User,
  Phone,
  Mail,
  FileText,
  BarChart3,
  PieChart,
  Calculator,
  Wallet,
  CreditCard,
  Landmark,
  Award,
  Gem,
  Rocket,
  Zap,
  VolumeX,
  Volume1,
  Play,
  Pause,
  SkipForward,
  Beaker,
  FlaskConical,
  Scale,
  Gauge,
  Droplet,
  Wind,
  Thermometer,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info
} from "lucide-react";

interface FinancialAnalysisClientProps {
  sessionData: any;
  sessionId: string;
}

export default function FinancialAnalysisClient({
  sessionData,
  sessionId
}: FinancialAnalysisClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"summary" | "details" | "projections" | "soiltest">("summary");
  const [isExporting, setIsExporting] = useState(false);
  const [expandedIntervention, setExpandedIntervention] = useState<number | null>(null);

  // ============ KARAOKE STREAMING STATE ============
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [autoPlay, setAutoPlay] = useState(true);

  const wordsRef = useRef<string[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const streamTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format percentage
  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Get gross margin data from session or use defaults
  const grossMargin = sessionData?.grossMarginAnalysis || {
    crop: sessionData?.crops?.[0] || "maize",
    low: { bags: 10, grossOutput: 67500, seedCost: 5625, fertilizerCost: 0, labourCost: 13300, transportCost: 500, bagCost: 400, totalCost: 23310, grossMargin: 44190 },
    medium: { bags: 40, grossOutput: 270000, seedCost: 5625, fertilizerCost: 13250, labourCost: 24200, transportCost: 2000, bagCost: 1600, totalCost: 52290, grossMargin: 217710 },
    high: { bags: 75, grossOutput: 506250, seedCost: 5625, fertilizerCost: 20700, labourCost: 33650, transportCost: 3750, bagCost: 3000, totalCost: 72570, grossMargin: 433680 }
  };

  // Soil test data
  const soilTest = sessionData?.soilTest;
  const fertilizerRecs = soilTest?.fertilizerRecommendations;
  const interventions = soilTest?.interventions || [];
  const fertilizerPlan = soilTest?.fertilizerPlan;

  // Calculate cost per bag
  const lowCostPerBag = Math.round(grossMargin.low.totalCost / grossMargin.low.bags);
  const mediumCostPerBag = Math.round(grossMargin.medium.totalCost / grossMargin.medium.bags);
  const highCostPerBag = Math.round(grossMargin.high.totalCost / grossMargin.high.bags);

  // Calculate profit margins
  const lowProfitMargin = ((grossMargin.low.grossMargin / grossMargin.low.grossOutput) * 100).toFixed(1);
  const mediumProfitMargin = ((grossMargin.medium.grossMargin / grossMargin.medium.grossOutput) * 100).toFixed(1);
  const highProfitMargin = ((grossMargin.high.grossMargin / grossMargin.high.grossOutput) * 100).toFixed(1);

  // Farmer's current level
  const farmerLevel = sessionData?.managementLevel || "Medium input";

  // Get current level data
  const getCurrentLevelData = () => {
    if (farmerLevel.toLowerCase().includes("low")) return grossMargin.low;
    if (farmerLevel.toLowerCase().includes("high")) return grossMargin.high;
    return grossMargin.medium;
  };

  const currentData = getCurrentLevelData();

  // ============ KARAOKE STREAMING FUNCTIONS ============
  const streamTextWithVoice = async (text: string) => {
    if (!voiceEnabled || !window.speechSynthesis) {
      return;
    }

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    setIsStreaming(true);
    setStreamingContent("");
    setCurrentWordIndex(0);

    const words = text.split(' ');
    wordsRef.current = words;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.volume = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Google UK') || v.name.includes('Samantha'));
    if (preferredVoice) utterance.voice = preferredVoice;

    utteranceRef.current = utterance;
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
        }
      }
    };

    utterance.onend = () => {
      setStreamingContent(text);
      setIsStreaming(false);
      setIsSpeaking(false);

      setTimeout(() => {
        setStreamingContent("");
      }, 2000);
    };

    utterance.onerror = (event) => {
      console.error("Speech error:", event);
      setIsStreaming(false);
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsStreaming(false);
      setStreamingContent("");
    }
  };

  const toggleVoice = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      setVoiceEnabled(!voiceEnabled);
    }
  };

  // Stream summary on load
  useEffect(() => {
    if (autoPlay && voiceEnabled) {
      let summaryText = `Here is your financial analysis for ${grossMargin.crop}.
        At your current ${farmerLevel} level, you are earning ${formatCurrency(currentData.grossMargin)} per hectare.`;

      if (soilTest) {
        summaryText += ` Based on your soil test from ${soilTest.testDate}, your pH is ${soilTest.ph} which is ${soilTest.phRating}. `;

        if (interventions.length > 0) {
          summaryText += ` We've identified ${interventions.length} nutrient deficiencies that need correction.`;
        }

        if (fertilizerPlan) {
          summaryText += ` Your precision fertilizer plan costs ${formatCurrency(fertilizerPlan.totalCost)} per acre.`;
        }
      }

      setTimeout(() => {
        streamTextWithVoice(summaryText);
      }, 1000);
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Export as PDF/Image
  const exportAnalysis = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert("Export feature would download your financial analysis");
    }, 1500);
  };

  // Stream a specific section
  const streamSection = (sectionTitle: string, content: string) => {
    const text = `${sectionTitle}. ${content}`;
    streamTextWithVoice(text);
  };

  // Get color for nutrient rating
  const getRatingColor = (rating: string) => {
    switch(rating) {
      case "Very Low": return "bg-red-100 text-red-800 border-red-300";
      case "Low": return "bg-orange-100 text-orange-800 border-orange-300";
      case "Optimum": return "bg-green-100 text-green-800 border-green-300";
      case "High": return "bg-blue-100 text-blue-800 border-blue-300";
      case "Very High": return "bg-purple-100 text-purple-800 border-purple-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  // Get icon for nutrient
  const getNutrientIcon = (nutrient: string) => {
    if (nutrient.includes("pH")) return <Droplet className="w-5 h-5" />;
    if (nutrient.includes("Phosphorus")) return <FlaskConical className="w-5 h-5" />;
    if (nutrient.includes("Potassium")) return <FlaskConical className="w-5 h-5" />;
    if (nutrient.includes("Nitrogen")) return <Wind className="w-5 h-5" />;
    if (nutrient.includes("Organic")) return <Leaf className="w-5 h-5" />;
    if (nutrient.includes("Calcium")) return <Scale className="w-5 h-5" />;
    if (nutrient.includes("Magnesium")) return <Scale className="w-5 h-5" />;
    return <Beaker className="w-5 h-5" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      {/* Voice Control Bar */}
      <div className="bg-blue-950 text-white p-3 sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleVoice}
              className={`p-2 rounded-full transition-all ${
                voiceEnabled ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'
              }`}
            >
              {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            <span className="text-sm">
              {isSpeaking ? '🔊 Speaking...' : voiceEnabled ? 'Voice ready' : 'Voice muted'}
            </span>
            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                className="px-3 py-1 bg-red-600 rounded-full text-xs hover:bg-red-700 transition-all flex items-center gap-1"
              >
                <Pause className="w-3 h-3" /> Stop
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-blue-700 px-3 py-1 rounded-full">
              {currentWordIndex}/{wordsRef.current.length} words
            </span>
            <button
              onClick={() => setAutoPlay(!autoPlay)}
              className={`text-xs px-3 py-1 rounded-full ${
                autoPlay ? 'bg-green-600' : 'bg-gray-600'
              }`}
            >
              {autoPlay ? 'Auto-play on' : 'Auto-play off'}
            </button>
          </div>
        </div>
      </div>

      {/* Karaoke Streaming Display */}
      {isStreaming && streamingContent && (
        <div className="bg-gradient-to-r from-yellow-400 to-amber-500 text-blue-900 p-6 shadow-xl sticky top-16 z-40">
          <div className="container mx-auto">
            <div className="flex items-start gap-4">
              <Volume2 className="w-6 h-6 text-blue-900 mt-1 animate-pulse flex-shrink-0" />
              <div className="flex-1">
                <p className="text-2xl font-bold leading-relaxed">
                  {streamingContent.split(' ').map((word, idx, arr) => (
                    <span key={idx}>
                      <span className="bg-white/30 px-1 rounded">
                        {word}
                      </span>
                      {idx < arr.length - 1 ? ' ' : ''}
                    </span>
                  ))}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 h-2 bg-blue-900/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white transition-all duration-150"
                      style={{
                        width: `${(currentWordIndex / wordsRef.current.length) * 100}%`
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    {currentWordIndex}/{wordsRef.current.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-950 to-indigo-950 text-white p-6 shadow-xl">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/interview/${sessionId}`}
                className="p-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-xl transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <DollarSign className="w-6 h-6" />
                  Financial Analysis
                </h1>
                <p className="text-white/80 flex items-center gap-2">
                  <Sprout className="w-4 h-4" />
                  {sessionData?.crops?.join(", ")} • {sessionData?.county}
                  <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                    {farmerLevel}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={exportAnalysis}
                disabled={isExporting}
                className="px-4 py-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-xl flex items-center gap-2 transition-all"
              >
                {isExporting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Export
              </button>
              <Link
                href={`/ask/${sessionId}`}
                className="px-4 py-2 bg-white text-blue-900 rounded-xl font-medium hover:bg-white/90 transition-all flex items-center gap-2"
              >
                Ask Questions
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-2 border-b border-blue-700 overflow-x-auto">
          <button
            onClick={() => setActiveTab("summary")}
            className={`px-6 py-3 font-medium transition-all whitespace-nowrap ${
              activeTab === "summary"
                ? "text-white border-b-2 border-white"
                : "text-blue-300 hover:text-white"
            }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-2" />
            Summary
          </button>
          <button
            onClick={() => setActiveTab("details")}
            className={`px-6 py-3 font-medium transition-all whitespace-nowrap ${
              activeTab === "details"
                ? "text-white border-b-2 border-white"
                : "text-blue-300 hover:text-white"
            }`}
          >
            <Calculator className="w-4 h-4 inline mr-2" />
            Detailed Analysis
          </button>
          <button
            onClick={() => setActiveTab("projections")}
            className={`px-6 py-3 font-medium transition-all whitespace-nowrap ${
              activeTab === "projections"
                ? "text-white border-b-2 border-white"
                : "text-blue-300 hover:text-white"
            }`}
          >
            <TrendingUp className="w-4 h-4 inline mr-2" />
            Projections
          </button>
          {soilTest && (
            <button
              onClick={() => setActiveTab("soiltest")}
              className={`px-6 py-3 font-medium transition-all whitespace-nowrap ${
                activeTab === "soiltest"
                  ? "text-white border-b-2 border-white"
                  : "text-blue-300 hover:text-white"
              }`}
            >
              <Beaker className="w-4 h-4 inline mr-2" />
              Soil Test {interventions.length > 0 && `(${interventions.length})`}
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-12">
        {/* SUMMARY TAB */}
        {activeTab === "summary" && (
          <div className="space-y-6">
            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-blue-300">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-900 rounded-xl">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-800">Your Current GM</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {formatCurrency(currentData.grossMargin)}
                    </p>
                    <p className="text-xs text-blue-600">at {farmerLevel} level</p>
                  </div>
                </div>
                <button
                  onClick={() => streamSection("Your current gross margin",
                    `You are currently earning ${formatCurrency(currentData.grossMargin)} per hectare at ${farmerLevel} level.`)}
                  className="mt-2 text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <Volume2 className="w-3 h-3" /> Listen
                </button>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-blue-300">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-900 rounded-xl">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-800">Cost per Bag</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {formatCurrency(
                        farmerLevel.toLowerCase().includes("low") ? lowCostPerBag :
                        farmerLevel.toLowerCase().includes("high") ? highCostPerBag :
                        mediumCostPerBag
                      )}
                    </p>
                    <p className="text-xs text-blue-600">per 90kg bag</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-blue-300">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-900 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-800">Profit Margin</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {farmerLevel.toLowerCase().includes("low") ? lowProfitMargin :
                       farmerLevel.toLowerCase().includes("high") ? highProfitMargin :
                       mediumProfitMargin}%
                    </p>
                    <p className="text-xs text-blue-600">of revenue</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-blue-300">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-900 rounded-xl">
                    <Tractor className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-800">Yield</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {currentData.bags} bags
                    </p>
                    <p className="text-xs text-blue-600">per hectare</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Gross Margin Table */}
            <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-blue-400">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2 text-blue-900">
                  <BarChart3 className="w-5 h-5" />
                  Gross Margin Analysis - {grossMargin.crop.toUpperCase()}
                </h2>
                <button
                  onClick={() => streamSection("Gross margin table",
                    `For ${grossMargin.crop}, low input yields ${grossMargin.low.bags} bags with gross margin ${formatCurrency(grossMargin.low.grossMargin)}.
                    Medium input yields ${grossMargin.medium.bags} bags with gross margin ${formatCurrency(grossMargin.medium.grossMargin)}.
                    High input yields ${grossMargin.high.bags} bags with gross margin ${formatCurrency(grossMargin.high.grossMargin)}.`)}
                  className="px-3 py-1 bg-blue-900 text-white rounded-full text-sm flex items-center gap-1 hover:bg-blue-800"
                >
                  <Volume2 className="w-4 h-4" /> Listen
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-blue-900 text-white">
                      <th className="p-4 text-left rounded-tl-xl">Item</th>
                      <th className="p-4 text-right">Low</th>
                      <th className="p-4 text-right">Medium</th>
                      <th className="p-4 text-right rounded-tr-xl">High</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-blue-200 bg-blue-50">
                      <td className="p-4 font-semibold text-blue-900">Yield (bags)</td>
                      <td className="p-4 text-right text-blue-900">{grossMargin.low.bags}</td>
                      <td className="p-4 text-right text-blue-900">{grossMargin.medium.bags}</td>
                      <td className="p-4 text-right text-blue-900">{grossMargin.high.bags}</td>
                    </tr>
                    <tr className="border-b border-blue-200">
                      <td className="p-4 font-semibold text-blue-900">Price per bag</td>
                      <td className="p-4 text-right text-blue-900">{formatCurrency(6750)}</td>
                      <td className="p-4 text-right text-blue-900">{formatCurrency(6750)}</td>
                      <td className="p-4 text-right text-blue-900">{formatCurrency(6750)}</td>
                    </tr>
                    <tr className="border-b border-blue-200 bg-blue-100">
                      <td className="p-4 font-bold text-blue-900">GROSS OUTPUT</td>
                      <td className="p-4 text-right font-bold text-blue-900">{formatCurrency(grossMargin.low.grossOutput)}</td>
                      <td className="p-4 text-right font-bold text-blue-900">{formatCurrency(grossMargin.medium.grossOutput)}</td>
                      <td className="p-4 text-right font-bold text-blue-900">{formatCurrency(grossMargin.high.grossOutput)}</td>
                    </tr>

                    <tr className="bg-blue-800">
                      <td colSpan={4} className="p-3 font-bold text-white">VARIABLE COSTS</td>
                    </tr>

                    <tr className="border-b border-blue-200">
                      <td className="p-4 pl-8 text-blue-900">Seed Cost</td>
                      <td className="p-4 text-right text-blue-900">{formatCurrency(grossMargin.low.seedCost)}</td>
                      <td className="p-4 text-right text-blue-900">{formatCurrency(grossMargin.medium.seedCost)}</td>
                      <td className="p-4 text-right text-blue-900">{formatCurrency(grossMargin.high.seedCost)}</td>
                    </tr>

                    <tr className="border-b border-blue-200 bg-blue-50">
                      <td className="p-4 pl-8 text-blue-900">Fertilizer Cost</td>
                      <td className="p-4 text-right text-blue-900">{formatCurrency(grossMargin.low.fertilizerCost)}</td>
                      <td className="p-4 text-right text-blue-900">{formatCurrency(grossMargin.medium.fertilizerCost)}</td>
                      <td className="p-4 text-right text-blue-900">{formatCurrency(grossMargin.high.fertilizerCost)}</td>
                    </tr>

                    <tr className="border-b border-blue-200">
                      <td className="p-4 pl-8 text-blue-900">Labour Cost</td>
                      <td className="p-4 text-right text-blue-900">{formatCurrency(grossMargin.low.labourCost)}</td>
                      <td className="p-4 text-right text-blue-900">{formatCurrency(grossMargin.medium.labourCost)}</td>
                      <td className="p-4 text-right text-blue-900">{formatCurrency(grossMargin.high.labourCost)}</td>
                    </tr>

                    <tr className="border-b border-blue-200 bg-blue-50">
                      <td className="p-4 pl-8 text-blue-900">Transport Cost</td>
                      <td className="p-4 text-right text-blue-900">{formatCurrency(grossMargin.low.transportCost || 500)}</td>
                      <td className="p-4 text-right text-blue-900">{formatCurrency(grossMargin.medium.transportCost || 2000)}</td>
                      <td className="p-4 text-right text-blue-900">{formatCurrency(grossMargin.high.transportCost || 3750)}</td>
                    </tr>

                    <tr className="border-b border-blue-200">
                      <td className="p-4 pl-8 text-blue-900">Bag Cost</td>
                      <td className="p-4 text-right text-blue-900">{formatCurrency(grossMargin.low.bagCost || 400)}</td>
                      <td className="p-4 text-right text-blue-900">{formatCurrency(grossMargin.medium.bagCost || 1600)}</td>
                      <td className="p-4 text-right text-blue-900">{formatCurrency(grossMargin.high.bagCost || 3000)}</td>
                    </tr>

                    <tr className="bg-blue-200 font-bold">
                      <td className="p-4 text-blue-900">TOTAL VARIABLE COST</td>
                      <td className="p-4 text-right text-blue-900">{formatCurrency(grossMargin.low.totalCost)}</td>
                      <td className="p-4 text-right text-blue-900">{formatCurrency(grossMargin.medium.totalCost)}</td>
                      <td className="p-4 text-right text-blue-900">{formatCurrency(grossMargin.high.totalCost)}</td>
                    </tr>

                    <tr className="bg-blue-900 text-white font-bold">
                      <td className="p-4 rounded-bl-xl">GROSS MARGIN</td>
                      <td className="p-4 text-right">{formatCurrency(grossMargin.low.grossMargin)}</td>
                      <td className="p-4 text-right">{formatCurrency(grossMargin.medium.grossMargin)}</td>
                      <td className="p-4 text-right rounded-br-xl">{formatCurrency(grossMargin.high.grossMargin)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-700">Cost per bag</p>
                  <p className="font-bold text-blue-900">{formatCurrency(lowCostPerBag)}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-700">Cost per bag</p>
                  <p className="font-bold text-blue-900">{formatCurrency(mediumCostPerBag)}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-700">Cost per bag</p>
                  <p className="font-bold text-blue-900">{formatCurrency(highCostPerBag)}</p>
                </div>
              </div>
            </div>

            {/* Financial Advice */}
            {sessionData?.financialAdvice && (
              <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl p-6 border-2 border-blue-400">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-bold mb-2 flex items-center gap-2 text-blue-900">
                    <Wallet className="w-5 h-5" />
                    Financial Advice
                  </h3>
                  <button
                    onClick={() => streamSection("Financial advice", sessionData.financialAdvice)}
                    className="px-3 py-1 bg-blue-900 text-white rounded-full text-sm flex items-center gap-1"
                  >
                    <Volume2 className="w-4 h-4" /> Listen
                  </button>
                </div>
                <p className="text-blue-800">{sessionData.financialAdvice}</p>
              </div>
            )}
          </div>
        )}

        {/* DETAILED ANALYSIS TAB */}
        {activeTab === "details" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-blue-400">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-blue-900">
                <Calculator className="w-5 h-5" />
                Detailed Cost Breakdown
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Low Input Card */}
                <div className="border-2 border-blue-200 rounded-xl p-5 bg-blue-50">
                  <h3 className="font-bold text-lg mb-3 text-blue-900">Low Input</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-blue-800">Seed:</span>
                      <span className="font-medium text-blue-900">{formatCurrency(grossMargin.low.seedCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-800">Fertilizer:</span>
                      <span className="font-medium text-blue-900">{formatCurrency(grossMargin.low.fertilizerCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-800">Labour:</span>
                      <span className="font-medium text-blue-900">{formatCurrency(grossMargin.low.labourCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-800">Transport:</span>
                      <span className="font-medium text-blue-900">{formatCurrency(grossMargin.low.transportCost || 500)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-800">Bags:</span>
                      <span className="font-medium text-blue-900">{formatCurrency(grossMargin.low.bagCost || 400)}</span>
                    </div>
                    <div className="border-t border-blue-300 pt-2 mt-2 flex justify-between font-bold">
                      <span className="text-blue-900">Total:</span>
                      <span className="text-blue-900">{formatCurrency(grossMargin.low.totalCost)}</span>
                    </div>
                  </div>
                </div>

                {/* Medium Input Card */}
                <div className="border-2 border-blue-400 rounded-xl p-5 bg-blue-100">
                  <h3 className="font-bold text-lg mb-3 text-blue-900">Medium Input</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-blue-800">Seed:</span>
                      <span className="font-medium text-blue-900">{formatCurrency(grossMargin.medium.seedCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-800">Fertilizer:</span>
                      <span className="font-medium text-blue-900">{formatCurrency(grossMargin.medium.fertilizerCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-800">Labour:</span>
                      <span className="font-medium text-blue-900">{formatCurrency(grossMargin.medium.labourCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-800">Transport:</span>
                      <span className="font-medium text-blue-900">{formatCurrency(grossMargin.medium.transportCost || 2000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-800">Bags:</span>
                      <span className="font-medium text-blue-900">{formatCurrency(grossMargin.medium.bagCost || 1600)}</span>
                    </div>
                    <div className="border-t border-blue-500 pt-2 mt-2 flex justify-between font-bold">
                      <span className="text-blue-900">Total:</span>
                      <span className="text-blue-900">{formatCurrency(grossMargin.medium.totalCost)}</span>
                    </div>
                  </div>
                </div>

                {/* High Input Card */}
                <div className="border-2 border-blue-600 rounded-xl p-5 bg-blue-200">
                  <h3 className="font-bold text-lg mb-3 text-blue-900">High Input</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-blue-800">Seed:</span>
                      <span className="font-medium text-blue-900">{formatCurrency(grossMargin.high.seedCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-800">Fertilizer:</span>
                      <span className="font-medium text-blue-900">{formatCurrency(grossMargin.high.fertilizerCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-800">Labour:</span>
                      <span className="font-medium text-blue-900">{formatCurrency(grossMargin.high.labourCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-800">Transport:</span>
                      <span className="font-medium text-blue-900">{formatCurrency(grossMargin.high.transportCost || 3750)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-800">Bags:</span>
                      <span className="font-medium text-blue-900">{formatCurrency(grossMargin.high.bagCost || 3000)}</span>
                    </div>
                    <div className="border-t border-blue-700 pt-2 mt-2 flex justify-between font-bold">
                      <span className="text-blue-900">Total:</span>
                      <span className="text-blue-900">{formatCurrency(grossMargin.high.totalCost)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PROJECTIONS TAB */}
        {activeTab === "projections" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-purple-400">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-purple-900">
                <Rocket className="w-5 h-5" />
                What If Scenarios
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border-2 border-green-300 rounded-xl p-5 bg-green-50">
                  <h3 className="font-bold text-lg mb-2 text-green-800">10% Yield Increase</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Current profit:</span>
                      <span>{formatCurrency(currentData.grossMargin)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>New profit:</span>
                      <span className="font-bold text-green-700">
                        {formatCurrency(Math.round(currentData.grossMargin * 1.1))}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-2 border-blue-300 rounded-xl p-5 bg-blue-50">
                  <h3 className="font-bold text-lg mb-2 text-blue-800">5% Price Increase</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Current profit:</span>
                      <span>{formatCurrency(currentData.grossMargin)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>New profit:</span>
                      <span className="font-bold text-blue-700">
                        {formatCurrency(Math.round(currentData.grossOutput * 1.05 - currentData.totalCost))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SOIL TEST TAB */}
        {activeTab === "soiltest" && soilTest && (
          <div className="space-y-6">
            {/* Soil Test Summary */}
            <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-emerald-400">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2 text-emerald-900">
                  <Beaker className="w-5 h-5" />
                  Soil Test Results
                </h2>
                <div className={`px-3 py-1 rounded-full text-sm ${
                  soilTest.testAge < 6 ? 'bg-green-100 text-green-800' :
                  soilTest.testAge < 12 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  Tested: {new Date(soilTest.testDate).toLocaleDateString()}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* pH */}
                <div className={`p-4 rounded-xl border-2 ${getRatingColor(soilTest.phRating)}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Droplet className="w-4 h-4" />
                    <span className="font-semibold">pH</span>
                  </div>
                  <p className="text-2xl font-bold">{soilTest.ph}</p>
                  <p className="text-sm">{soilTest.phRating}</p>
                </div>

                {/* Phosphorus */}
                <div className={`p-4 rounded-xl border-2 ${getRatingColor(soilTest.phosphorusRating)}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <FlaskConical className="w-4 h-4" />
                    <span className="font-semibold">Phosphorus (P)</span>
                  </div>
                  <p className="text-2xl font-bold">{soilTest.phosphorus} ppm</p>
                  <p className="text-sm">{soilTest.phosphorusRating}</p>
                </div>

                {/* Potassium */}
                <div className={`p-4 rounded-xl border-2 ${getRatingColor(soilTest.potassiumRating)}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <FlaskConical className="w-4 h-4" />
                    <span className="font-semibold">Potassium (K)</span>
                  </div>
                  <p className="text-2xl font-bold">{soilTest.potassium} ppm</p>
                  <p className="text-sm">{soilTest.potassiumRating}</p>
                </div>

                {/* Calcium */}
                <div className={`p-4 rounded-xl border-2 ${getRatingColor(soilTest.calciumRating)}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Scale className="w-4 h-4" />
                    <span className="font-semibold">Calcium (Ca)</span>
                  </div>
                  <p className="text-2xl font-bold">{soilTest.calcium} ppm</p>
                  <p className="text-sm">{soilTest.calciumRating}</p>
                </div>

                {/* Magnesium */}
                <div className={`p-4 rounded-xl border-2 ${getRatingColor(soilTest.magnesiumRating)}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Scale className="w-4 h-4" />
                    <span className="font-semibold">Magnesium (Mg)</span>
                  </div>
                  <p className="text-2xl font-bold">{soilTest.magnesium} ppm</p>
                  <p className="text-sm">{soilTest.magnesiumRating}</p>
                </div>

                {/* Total Nitrogen */}
                <div className={`p-4 rounded-xl border-2 ${getRatingColor(soilTest.totalNitrogenRating)}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Wind className="w-4 h-4" />
                    <span className="font-semibold">Total Nitrogen</span>
                  </div>
                  <p className="text-2xl font-bold">{soilTest.totalNitrogen}%</p>
                  <p className="text-sm">{soilTest.totalNitrogenRating}</p>
                </div>

                {/* Organic Matter */}
                <div className={`p-4 rounded-xl border-2 ${getRatingColor(soilTest.organicMatterRating)}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Leaf className="w-4 h-4" />
                    <span className="font-semibold">Organic Matter</span>
                  </div>
                  <p className="text-2xl font-bold">{soilTest.organicMatter}%</p>
                  <p className="text-sm">{soilTest.organicMatterRating}</p>
                </div>

                {/* CEC */}
                <div className={`p-4 rounded-xl border-2 ${getRatingColor(soilTest.cecRating)}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Gauge className="w-4 h-4" />
                    <span className="font-semibold">CEC</span>
                  </div>
                  <p className="text-2xl font-bold">{soilTest.cec} meq/100g</p>
                  <p className="text-sm">{soilTest.cecRating}</p>
                </div>
              </div>
            </div>

            {/* ========== PRECISION FERTILIZER PLAN - FOR EACH DEFICIENT NUTRIENT ========== */}
            {interventions && interventions.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-green-400">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-green-900">
                  <Package className="w-6 h-6" />
                  Precision Fertilizer Plan - Correcting {interventions.length} Nutrient Deficiencies
                </h2>

                {/* Plan Summary from soilTestInterpreter */}
                {fertilizerPlan?.summary && (
                  <div className="mb-6 p-4 bg-green-50 rounded-xl border border-green-200">
                    <p className="text-green-800 whitespace-pre-line">{fertilizerPlan.summary}</p>
                  </div>
                )}

                {/* List of Interventions */}
                <div className="space-y-4">
                  {interventions.map((intervention: any, idx: number) => {
                    const isExpanded = expandedIntervention === idx;
                    const isDeficient = intervention.level.includes("Low") || intervention.level.includes("Very Low");

                    return (
                      <div
                        key={idx}
                        className={`border-l-4 ${isDeficient ? 'border-red-500' : 'border-yellow-500'} bg-gray-50 rounded-r-xl overflow-hidden`}
                      >
                        {/* Header - Always visible */}
                        <div
                          className="p-4 cursor-pointer hover:bg-gray-100 transition-all flex items-start justify-between"
                          onClick={() => setExpandedIntervention(isExpanded ? null : idx)}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`mt-1 ${isDeficient ? 'text-red-600' : 'text-yellow-600'}`}>
                              {isDeficient ? <AlertTriangle className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                            </div>
                            <div>
                              <h3 className="font-bold text-lg flex items-center gap-2">
                                {getNutrientIcon(intervention.nutrient)}
                                {intervention.nutrient}
                                <span className={`text-sm px-2 py-0.5 rounded-full ${
                                  intervention.level === "Very Low" ? 'bg-red-200 text-red-800' :
                                  intervention.level === "Low" ? 'bg-orange-200 text-orange-800' :
                                  'bg-yellow-200 text-yellow-800'
                                }`}>
                                  {intervention.level}
                                </span>
                              </h3>
                              <p className="text-sm text-gray-600 mt-1">
                                Value: {intervention.value} {intervention.nutrient.includes("pH") ? '' :
                                  intervention.nutrient.includes("Nitrogen") ? '%' : 'ppm'}
                              </p>
                            </div>
                          </div>
                          <div className="text-blue-600">
                            {isExpanded ? '▼' : '▶'}
                          </div>
                        </div>

                        {/* Expanded Content - Shows fertilizer options */}
                        {isExpanded && (
                          <div className="p-4 border-t border-gray-200 bg-white">
                            <p className="text-gray-700 mb-3">{intervention.recommendation}</p>

                            <h4 className="font-semibold mb-2">Fertilizer Options:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {intervention.fertilizerOptions.map((opt: any, optIdx: number) => (
                                <div key={optIdx} className="border rounded-lg p-3 hover:shadow-md transition-all">
                                  <p className="font-bold text-blue-900">{opt.name}</p>
                                  <p className="text-sm">Amount: <span className="font-bold">{opt.amountKg} kg</span></p>
                                  {opt.cost && <p className="text-sm">Cost: <span className="font-bold text-green-700">{formatCurrency(opt.cost)}</span></p>}
                                  <p className="text-xs text-gray-600 mt-1">
                                    Provides: {Object.entries(opt.provides).map(([k, v]) => `${v} kg ${k}`).join(', ')}
                                  </p>
                                </div>
                              ))}
                            </div>

                            <p className="mt-3 text-sm text-gray-600 italic">
                              Timing: {intervention.applicationTiming}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Planting vs Topdressing Summary */}
                {fertilizerPlan && (
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {fertilizerPlan.planting?.length > 0 && (
                      <div className="p-4 bg-blue-50 rounded-xl">
                        <h4 className="font-bold text-blue-900 mb-2">🌱 Planting Fertilizers</h4>
                        {fertilizerPlan.planting.map((item: any, idx: number) => (
                          <div key={idx} className="text-sm mb-1">
                            • {item.selected.name}: {item.selected.amountKg} kg
                          </div>
                        ))}
                      </div>
                    )}

                    {fertilizerPlan.topdressing?.length > 0 && (
                      <div className="p-4 bg-green-50 rounded-xl">
                        <h4 className="font-bold text-green-900 mb-2">🌾 Topdressing Fertilizers</h4>
                        {fertilizerPlan.topdressing.map((item: any, idx: number) => (
                          <div key={idx} className="text-sm mb-1">
                            • {item.selected.name}: {item.selected.amountKg} kg
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Total Cost */}
                {fertilizerPlan?.totalCost > 0 && (
                  <div className="mt-4 p-4 bg-blue-100 rounded-xl">
                    <p className="text-lg font-bold text-blue-900">
                      Total Fertilizer Investment: {formatCurrency(fertilizerPlan.totalCost)} per acre
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Original Fertilizer Recommendations (if any) */}
            {fertilizerRecs && (
              <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-blue-400">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-blue-900">
                  <Package className="w-5 h-5" />
                  Additional Fertilizer Calculations
                </h2>

                {/* Planting Recommendations */}
                {fertilizerRecs.plantingRecommendations.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-bold text-lg mb-3 text-blue-900">🌱 PLANTING FERTILIZERS</h3>
                    <div className="space-y-3">
                      {fertilizerRecs.plantingRecommendations.map((rec: any, idx: number) => (
                        <div key={idx} className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-blue-900">{rec.brand}</p>
                              <p className="text-sm text-blue-700">{rec.company} • {rec.npk}</p>
                            </div>
                            <div className="bg-blue-900 text-white px-3 py-1 rounded-full text-lg font-bold">
                              {rec.amountKg} kg
                            </div>
                          </div>
                          <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                            <div>N: {rec.provides.n.toFixed(1)} kg</div>
                            <div>P: {rec.provides.p.toFixed(1)} kg</div>
                            <div>K: {rec.provides.k.toFixed(1)} kg</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Top Dressing Recommendations */}
                {fertilizerRecs.topDressingRecommendations.length > 0 && (
                  <div>
                    <h3 className="font-bold text-lg mb-3 text-green-900">🌾 TOP DRESSING FERTILIZERS</h3>
                    <div className="space-y-3">
                      {fertilizerRecs.topDressingRecommendations.map((rec: any, idx: number) => (
                        <div key={idx} className="bg-green-50 p-4 rounded-xl border border-green-200">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-green-900">{rec.brand}</p>
                              <p className="text-sm text-green-700">{rec.company} • {rec.npk}</p>
                            </div>
                            <div className="bg-green-900 text-white px-3 py-1 rounded-full text-lg font-bold">
                              {rec.amountKg} kg
                            </div>
                          </div>
                          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                            <div>N: {rec.provides.n.toFixed(1)} kg</div>
                            <div>K: {rec.provides.k.toFixed(1)} kg</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Total Nutrients */}
                <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                  <h4 className="font-bold mb-2">Total Nutrients Applied:</h4>
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-sm text-gray-600">Nitrogen (N)</p>
                      <p className="text-xl font-bold text-blue-900">{fertilizerRecs.totalNutrientsProvided.n.toFixed(1)} kg</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Phosphorus (P)</p>
                      <p className="text-xl font-bold text-blue-900">{fertilizerRecs.totalNutrientsProvided.p.toFixed(1)} kg</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Potassium (K)</p>
                      <p className="text-xl font-bold text-blue-900">{fertilizerRecs.totalNutrientsProvided.k.toFixed(1)} kg</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Sulphur (S)</p>
                      <p className="text-xl font-bold text-blue-900">{fertilizerRecs.totalNutrientsProvided.s?.toFixed(1) || '0'} kg</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 flex flex-col gap-4">
          {/* Comparison Button */}
          <div className="flex justify-center">
            <Link href={`/compare/${sessionId}`} className="w-full md:w-auto">
              <button className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3">
                <BarChart3 className="w-6 h-6" />
                Compare All Crops Profitability
                <ArrowRight className="w-6 h-6" />
              </button>
            </Link>
          </div>

          {/* Back and Q&A Buttons */}
          <div className="flex justify-between">
            <Link
              href={`/interview/${sessionId}`}
              className="px-6 py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-all flex items-center gap-2 border border-white/30"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Recommendations
            </Link>

            <Link
              href={`/ask/${sessionId}`}
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:from-green-600 hover:to-emerald-700 transition-all flex items-center gap-3 shadow-lg"
            >
              Continue to Q&A
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}