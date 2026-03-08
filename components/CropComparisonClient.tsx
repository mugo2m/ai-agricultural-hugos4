// components/CropComparisonClient.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
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
  ArrowRight,
  Heart,
  Volume2,
  BarChart3,
  PieChart,
  Calculator,
  Wallet,
  Award,
  Gem,
  Rocket,
  Zap,
  ChevronUp,
  ChevronDown,
  TrendingDown,
  TrendingUp as TrendingUpIcon,
  Scale,
  Gauge,
  Target,
  Star,
  Crown,
  Coffee,
  Apple,
  Banana,
  Carrot,
  Flower2,
  Trophy,
  Flag,
  Citrus,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { useCurrency } from '@/lib/context/CurrencyContext';
import { formatCurrencyForDisplay, formatCurrencyForSpeech } from '@/lib/utils/currency';

interface CropComparisonClientProps {
  sessionData: any;
  sessionId: string;
}

interface RankedCrop {
  crop: string;
  profit: number;
  revenue: number;
  costs: number;
  rank: number;
  color: string;
  icon: string;
  barColor: string;
  roi?: number;
}

export default function CropComparisonClient({
  sessionData,
  sessionId
}: CropComparisonClientProps) {
  const { currency } = useCurrency();
  const [rankedCrops, setRankedCrops] = useState<RankedCrop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"chart" | "table">("chart");
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  // ============ KARAOKE STREAMING STATE ============
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const wordsRef = useRef<string[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Get farmer name from session data
  const farmerName = sessionData?.farmerName || "Farmer";

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // ========== GET RANKED CROPS FROM FIREBASE DATA ==========
  useEffect(() => {
    const fetchAllCrops = async () => {
      setIsLoading(true);

      try {
        const crops: RankedCrop[] = [];

        // Add current session crop if it has gross margin data
        if (sessionData?.grossMarginAnalysis) {
          const gm = sessionData.grossMarginAnalysis;
          crops.push({
            crop: sessionData.crops?.[0] || "Unknown",
            profit: gm.grossMargin || 0,
            revenue: gm.revenue || 0,
            costs: gm.totalCosts || 0,
            rank: 0,
            color: "",
            icon: "",
            barColor: ""
          });
        }

        // 🔥 FETCH ALL USER SESSIONS FROM FIREBASE
        try {
          const response = await fetch(`/api/user/sessions?userId=${sessionData?.userId}`);
          if (response.ok) {
            const data = await response.json();
            const allSessions = data.sessions || [];

            // Add crops from other sessions
            allSessions.forEach((session: any) => {
              // Skip current session (already added)
              if (session.id === sessionData?.id) return;

              if (session?.grossMarginAnalysis && session?.crops?.[0]) {
                crops.push({
                  crop: session.crops[0],
                  profit: session.grossMarginAnalysis.grossMargin || 0,
                  revenue: session.grossMarginAnalysis.revenue || 0,
                  costs: session.grossMarginAnalysis.totalCosts || 0,
                  rank: 0,
                  color: "",
                  icon: "",
                  barColor: ""
                });
              }
            });
          }
        } catch (error) {
          console.error("Error fetching user sessions:", error);
        }

        // Sort by profit descending
        const sorted = crops.sort((a, b) => b.profit - a.profit);

        // Colors for bars
        const barColors = [
          "from-yellow-500 to-amber-400",
          "from-blue-500 to-indigo-400",
          "from-green-500 to-emerald-400",
          "from-purple-500 to-pink-400",
          "from-red-500 to-rose-400",
          "from-teal-500 to-cyan-400"
        ];

        const ranked = sorted.map((item, index) => ({
          ...item,
          rank: index + 1,
          color: barColors[index % barColors.length],
          barColor: barColors[index % barColors.length],
          icon: ["Crown", "Trophy", "Award", "Star", "Target", "Flag"][index % 6],
          roi: item.costs > 0 ? (item.profit / item.costs) * 100 : 0
        }));

        setRankedCrops(ranked);
      } catch (error) {
        console.error("Error fetching crops:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (sessionData?.userId) {
      fetchAllCrops();
    } else {
      setIsLoading(false);
    }
  }, [sessionData]);

  // Get icon component based on string
  const getIconComponent = (iconName: string) => {
    switch(iconName) {
      case "Crown": return <Crown className="w-5 h-5" />;
      case "Trophy": return <Trophy className="w-5 h-5" />;
      case "Award": return <Award className="w-5 h-5" />;
      case "Star": return <Star className="w-5 h-5" />;
      case "Target": return <Target className="w-5 h-5" />;
      case "Flag": return <Flag className="w-5 h-5" />;
      default: return <Sprout className="w-5 h-5" />;
    }
  };

  // Get crop icon
  const getCropIcon = (crop: string) => {
    const iconMap: Record<string, any> = {
      maize: <Wheat className="w-5 h-5" />,
      beans: <Leaf className="w-5 h-5" />,
      coffee: <Coffee className="w-5 h-5" />,
      sorghum: <Wheat className="w-5 h-5" />,
      "finger millet": <Wheat className="w-5 h-5" />,
      bananas: <Banana className="w-5 h-5" />,
      tomatoes: <Apple className="w-5 h-5" />,
      onions: <Sprout className="w-5 h-5" />,
      cabbage: <Sprout className="w-5 h-5" />,
      kales: <Leaf className="w-5 h-5" />,
      groundnuts: <Sprout className="w-5 h-5" />,
      cassava: <Sprout className="w-5 h-5" />,
      "sweet potatoes": <Sprout className="w-5 h-5" />,
      potatoes: <Sprout className="w-5 h-5" />,
      oranges: <Citrus className="w-5 h-5" />,
      avocado: <Apple className="w-5 h-5" />
    };
    return iconMap[crop.toLowerCase()] || <Sprout className="w-5 h-5" />;
  };

  // Find max profit for chart scaling
  const maxProfit = rankedCrops.length > 0
    ? Math.max(...rankedCrops.map(c => c.profit))
    : 0;

  // ============ KARAOKE STREAMING FUNCTIONS ============
  const streamTextWithVoice = async (text: string) => {
    if (!voiceEnabled || !window.speechSynthesis) return;

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    setIsStreaming(true);
    setStreamingContent("");
    setCurrentWordIndex(0);

    const words = text.split(' ');
    wordsRef.current = words;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8; // SLOWER (was 0.9)
    utterance.pitch = 1.1;
    utterance.volume = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Google UK') || v.name.includes('Samantha') || v.name.includes('Microsoft Zira'));
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
      setIsStreaming(false);
      setIsSpeaking(false);
      setStreamingContent("");
    };

    utterance.onerror = () => {
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

  // Stream comparison summary - SLOWER with farmer name
  const streamComparison = () => {
    if (rankedCrops.length === 0) return;

    const bestCrop = rankedCrops[0];
    const avgProfit = rankedCrops.reduce((sum, c) => sum + c.profit, 0) / rankedCrops.length;
    const currencyName = getCurrencyName();

    let text = `${farmerName}, here's your crop enterprise profitability ranking based on YOUR actual farm data. `;
    text += `Rank 1: ${bestCrop.crop} enterprise with profit of ${currencyName} ${bestCrop.profit.toLocaleString()} per acre. `;

    if (rankedCrops.length >= 2) {
      text += `Rank 2: ${rankedCrops[1].crop} enterprise with ${currencyName} ${rankedCrops[1].profit.toLocaleString()}. `;
    }
    if (rankedCrops.length >= 3) {
      text += `Rank 3: ${rankedCrops[2].crop} enterprise with ${currencyName} ${rankedCrops[2].profit.toLocaleString()}. `;
    }

    text += `Your average profit across all your crop enterprises is ${currencyName} ${avgProfit.toLocaleString()}. `;
    text += `Remember ${farmerName}, focus more resources on your most profitable enterprises to put MORE MONEY IN YOUR POCKET!`;

    streamTextWithVoice(text);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-white animate-spin" />
      </div>
    );
  }

  if (rankedCrops.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-center p-8">
          <Sprout className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h2 className="text-2xl font-bold mb-2">No Crop Enterprise Data Available</h2>
          <p className="text-blue-200">Complete more farm interviews to see profitability comparisons, {farmerName}.</p>
          <Link href={`/interview/${sessionId}`} className="mt-6 inline-block px-6 py-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all">
            Back to Recommendations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      {/* Voice Control Bar */}
      <div className="bg-blue-950 text-white p-3 sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              className={`p-2 rounded-full transition-all ${
                voiceEnabled ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'
              }`}
            >
              {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <Volume2 className="w-5 h-5 opacity-50" />}
            </button>
            <span className="text-sm">
              {isSpeaking ? '🔊 Speaking...' : voiceEnabled ? 'Voice ready' : 'Voice muted'}
            </span>
            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                className="px-3 py-1 bg-red-600 rounded-full text-xs hover:bg-red-700 transition-all flex items-center gap-1"
              >
                Stop
              </button>
            )}
          </div>
          <button
            onClick={streamComparison}
            className="px-4 py-2 bg-blue-700 rounded-lg text-sm hover:bg-blue-600 transition-all flex items-center gap-2"
          >
            <Volume2 className="w-4 h-4" />
            Listen to Rankings
          </button>
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
                href={`/financial/${sessionId}`}
                className="p-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-xl transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <BarChart3 className="w-6 h-6" />
                  {farmerName}'s Crop Enterprise Profitability Rankings
                </h1>
                <p className="text-white/80 flex items-center gap-2">
                  <Sprout className="w-4 h-4" />
                  Comparing {rankedCrops.length} crop enterprise{rankedCrops.length > 1 ? 's' : ''} from your farm history
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode(viewMode === "chart" ? "table" : "chart")}
                className="px-4 py-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-xl flex items-center gap-2 transition-all"
              >
                {viewMode === "chart" ? "Show Table" : "Show Chart"}
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

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-12">
        {/* Business Summary Card */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-4 text-white shadow-xl mb-8">
          <div className="flex items-start gap-3">
            <Rocket className="w-6 h-6 flex-shrink-0" />
            <div>
              <p className="text-sm opacity-90">🔥 BUSINESS INSIGHT, {farmerName.toUpperCase()}</p>
              <p className="font-medium">
                Your most profitable enterprise is <span className="font-bold">{rankedCrops[0]?.crop}</span> with {formatCurrencyForDisplay(rankedCrops[0]?.profit, currency)} profit.
                Focus more resources here to maximize returns!
              </p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-4 text-white">
            <p className="text-sm opacity-90">Most Profitable Enterprise</p>
            <p className="text-2xl font-bold capitalize">{rankedCrops[0]?.crop}</p>
            <p className="text-xl">{formatCurrencyForDisplay(rankedCrops[0]?.profit, currency)}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-4 text-white">
            <p className="text-sm opacity-90">Average Profit Per Enterprise</p>
            <p className="text-2xl font-bold">
              {formatCurrencyForDisplay(rankedCrops.reduce((sum, c) => sum + c.profit, 0) / rankedCrops.length, currency)}
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-4 text-white">
            <p className="text-sm opacity-90">Total Crop Enterprises</p>
            <p className="text-2xl font-bold">{rankedCrops.length}</p>
          </div>
        </div>

        {/* CHART VIEW - Side by side bars with hover effects */}
        {viewMode === "chart" && (
          <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-blue-300">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-blue-900">
              <BarChart3 className="w-5 h-5" />
              Profit Comparison: Side by Side - {farmerName}'s Enterprises
            </h2>

            {/* Bar Chart Container */}
            <div className="flex items-end justify-center gap-0 min-h-[450px] w-full">
              {rankedCrops.map((crop, index) => {
                const barHeight = (crop.profit / maxProfit) * 300;
                const roi = (crop.profit / crop.costs) * 100;

                return (
                  <div
                    key={crop.crop}
                    className="flex-1 flex flex-col items-center group"
                    onMouseEnter={() => setHoveredBar(index)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    {/* Profit amount (always visible) */}
                    <div className="mb-2 text-center transition-all duration-300">
                      <span className={`text-sm font-bold px-2 py-1 rounded-full ${
                        hoveredBar === index
                          ? 'bg-yellow-400 text-blue-900 scale-110'
                          : 'bg-blue-100 text-blue-900'
                      }`}>
                        {formatCurrencyForDisplay(crop.profit, currency)}
                      </span>
                    </div>

                    {/* Bar with ROI inside (always visible) and hover effects */}
                    <div className="relative w-full px-1">
                      <div
                        className={`w-full bg-gradient-to-t ${crop.barColor} rounded-t-lg transition-all duration-300 flex flex-col items-center justify-center text-white font-bold`}
                        style={{
                          height: `${barHeight}px`,
                          minHeight: '80px',
                          transform: hoveredBar === index ? 'scale(1.05)' : 'scale(1)',
                          boxShadow: hoveredBar === index ? '0 10px 25px -5px rgba(0,0,0,0.3)' : 'none'
                        }}
                      >
                        {/* Crop name */}
                        <span className="text-lg font-bold mb-1 drop-shadow-lg">
                          {crop.crop.toUpperCase()} ENTERPRISE
                        </span>

                        {/* ROI inside the bar (always visible) */}
                        <span className="text-xs bg-white/30 px-2 py-1 rounded-full backdrop-blur-sm">
                          ROI: {formatPercentage(roi)}
                        </span>
                      </div>
                    </div>

                    {/* Rank indicator below bar */}
                    <div className="mt-2 flex items-center justify-center gap-1">
                      {crop.rank === 1 && <Crown className="w-5 h-5 text-yellow-500" />}
                      {crop.rank === 2 && <Trophy className="w-5 h-5 text-gray-400" />}
                      {crop.rank === 3 && <Award className="w-5 h-5 text-amber-600" />}
                      <span className="text-xs text-white">Rank {crop.rank}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-8 p-4 bg-blue-50 rounded-xl">
              <div className="flex items-center gap-6 flex-wrap justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gradient-to-t from-yellow-500 to-amber-400 rounded"></div>
                  <span className="text-sm text-blue-800">Profit Bar</span>
                </div>
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm text-blue-800">Rank 1: Most Profitable Enterprise</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-blue-800">Rank 2: Second Best Enterprise</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-600" />
                  <span className="text-sm text-blue-800">Rank 3: Third Place Enterprise</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TABLE VIEW */}
        {viewMode === "table" && (
          <div className="bg-white rounded-2xl p-6 shadow-xl border-2 border-blue-300">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-blue-900">
              <Scale className="w-5 h-5" />
              {farmerName}'s Crop Enterprise Profitability Rankings
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-blue-900 text-white">
                    <th className="p-4 text-center rounded-tl-xl">Rank</th>
                    <th className="p-4 text-left">Crop Enterprise</th>
                    <th className="p-4 text-right">Revenue</th>
                    <th className="p-4 text-right">Costs</th>
                    <th className="p-4 text-right">Profit</th>
                    <th className="p-4 text-center">ROI</th>
                    <th className="p-4 text-right rounded-tr-xl">vs Top</th>
                  </tr>
                </thead>
                <tbody>
                  {rankedCrops.map((crop, index) => {
                    const percentageOfTop = (crop.profit / maxProfit) * 100;
                    const roi = (crop.profit / crop.costs) * 100;

                    return (
                      <tr
                        key={crop.crop}
                        className={`border-b border-blue-100 hover:bg-blue-50 transition-all ${
                          index === 0 ? 'bg-yellow-50' :
                          index === 1 ? 'bg-gray-50' :
                          index === 2 ? 'bg-orange-50' : ''
                        }`}
                      >
                        <td className="p-4 text-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mx-auto ${
                            index === 0 ? 'bg-yellow-500 text-white' :
                            index === 1 ? 'bg-gray-400 text-white' :
                            index === 2 ? 'bg-orange-500 text-white' :
                            'bg-blue-500 text-white'
                          }`}>
                            {crop.rank}
                          </div>
                        </td>
                        <td className="p-4 font-medium text-blue-900 capitalize flex items-center gap-2">
                          {getCropIcon(crop.crop)}
                          {crop.crop} Enterprise
                        </td>
                        <td className="p-4 text-right text-blue-900">{formatCurrencyForDisplay(crop.revenue, currency)}</td>
                        <td className="p-4 text-right text-blue-900">{formatCurrencyForDisplay(crop.costs, currency)}</td>
                        <td className="p-4 text-right font-bold text-blue-900">{formatCurrencyForDisplay(crop.profit, currency)}</td>
                        <td className="p-4 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            roi > 100 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {formatPercentage(roi)}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  index === 0 ? 'bg-green-500' :
                                  index === 1 ? 'bg-blue-500' :
                                  index === 2 ? 'bg-orange-500' :
                                  'bg-purple-500'
                                }`}
                                style={{ width: `${percentageOfTop}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600">{percentageOfTop.toFixed(0)}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Podium Cards - Top 3 Crops (Simplified) */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Rank 2 - Silver */}
          {rankedCrops.length >= 2 && (
            <div className="bg-gradient-to-br from-gray-300 to-gray-400 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-all order-2 md:order-1">
              <div className="flex items-center gap-3 mb-2">
                <Trophy className="w-8 h-8 text-gray-700" />
                <h3 className="text-xl font-bold">2nd Place Enterprise</h3>
              </div>
              <p className="text-3xl font-bold mb-1 capitalize">{rankedCrops[1].crop}</p>
              <p className="text-2xl font-semibold opacity-90">{formatCurrencyForDisplay(rankedCrops[1].profit, currency)}</p>
            </div>
          )}

          {/* Rank 1 - Gold */}
          {rankedCrops.length >= 1 && (
            <div className="bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl p-8 text-white shadow-xl transform hover:scale-105 transition-all order-1 md:order-2 border-4 border-yellow-300">
              <div className="flex items-center gap-3 mb-2">
                <Crown className="w-10 h-10 text-yellow-800" />
                <h3 className="text-2xl font-bold">Most Profitable Enterprise</h3>
              </div>
              <p className="text-4xl font-bold mb-1 capitalize">{rankedCrops[0].crop}</p>
              <p className="text-3xl font-semibold opacity-90">{formatCurrencyForDisplay(rankedCrops[0].profit, currency)}</p>
            </div>
          )}

          {/* Rank 3 - Bronze */}
          {rankedCrops.length >= 3 && (
            <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl p-6 text-white shadow-xl transform hover:scale-105 transition-all order-3">
              <div className="flex items-center gap-3 mb-2">
                <Award className="w-8 h-8 text-amber-800" />
                <h3 className="text-xl font-bold">3rd Place Enterprise</h3>
              </div>
              <p className="text-3xl font-bold mb-1 capitalize">{rankedCrops[2].crop}</p>
              <p className="text-2xl font-semibold opacity-90">{formatCurrencyForDisplay(rankedCrops[2].profit, currency)}</p>
            </div>
          )}
        </div>

        {/* Business Insight Card */}
        <div className="mt-8 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Wallet className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">💼 BUSINESS INSIGHT, {farmerName.toUpperCase()}</h3>
              <p className="text-lg opacity-90">
                Your top enterprise is <span className="font-bold capitalize">{rankedCrops[0]?.crop}</span> with <span className="font-bold">{formatCurrencyForDisplay(rankedCrops[0]?.profit, currency)}</span> profit.
                {rankedCrops.length >= 2 && (
                  <> Rank 2 (<span className="font-bold capitalize">{rankedCrops[1].crop}</span>) earns {formatCurrencyForDisplay(rankedCrops[1].profit, currency)}.</>
                )}
              </p>
              <p className="mt-3 text-white/80">
                🔥 PRO TIP: Focus 60% of your resources on your most profitable enterprise.
                Every {currency.symbol} 1 invested here returns more than others!
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between">
          <Link
            href={`/financial/${sessionId}`}
            className="px-6 py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-all flex items-center gap-2 border border-white/30"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Financial Analysis
          </Link>

          <Link
            href={`/ask/${sessionId}`}
            className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:from-green-600 hover:to-emerald-700 transition-all flex items-center gap-3 shadow-lg"
          >
            Continue to Q&A
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Reminder to test soil yearly */}
        <div className="mt-4 text-center text-white/50 text-sm">
          🔬 Remember {farmerName}, test your soil yearly to keep your enterprises profitable!
        </div>
      </div>
    </div>
  );
}