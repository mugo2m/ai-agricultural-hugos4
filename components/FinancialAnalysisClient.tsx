// components/FinancialAnalysisClient.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Package,
  Sprout,
  Loader2,
  Download,
  Share2,
  BarChart3,
  Leaf,
  Tractor,
  Truck,
  BaggageClaim,
  Droplets,
  Beaker,
  FlaskConical,
  Award,
  Gem,
  Rocket,
  Zap,
  TrendingUp as TrendingUpIcon
} from "lucide-react";
import { useCurrency } from '@/lib/context/CurrencyContext';
import { formatCurrencyForDisplay, formatCurrencyForSpeech } from '@/lib/utils/currency';

interface FinancialAnalysisClientProps {
  sessionData: any;
  sessionId: string;
}

export default function FinancialAnalysisClient({
  sessionData,
  sessionId
}: FinancialAnalysisClientProps) {
  const { t } = useTranslation();
  const { currency } = useCurrency();
  const [isLoading, setIsLoading] = useState(true);
  const [grossMargin, setGrossMargin] = useState<any>(null);
  const [crop, setCrop] = useState<string>("");
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [yield_bags, setYield] = useState<number>(0);

  // Detailed cost breakdowns
  const [fertilizerDetails, setFertilizerDetails] = useState<any[]>([]);
  const [labourDetails, setLabourDetails] = useState<any[]>([]);
  const [seedDetails, setSeedDetails] = useState<any>({});
  const [transportDetails, setTransportDetails] = useState<any>({});
  const [bagDetails, setBagDetails] = useState<any>({});

  // Soil test data for summary (we keep state but won't use it)
  const [soilTest, setSoilTest] = useState<any>(null);

  useEffect(() => {
    if (sessionData) {
      console.log("📊 FinancialAnalysisClient received data:", sessionData);

      // Get selling price and yield
      setSellingPrice(sessionData.pricePerUnit || 0);
      setYield(sessionData.actualYield || sessionData.grossMarginAnalysis?.bags || 27);

      // Get soil test data (still needed for cost calculations? If not, you can remove)
      if (sessionData.soilTest) {
        setSoilTest(sessionData.soilTest);
      }

      // Extract fertilizer details from fertilizer plan
      if (sessionData.soilTest?.fertilizerPlan) {
        const plan = sessionData.soilTest.fertilizerPlan;
        const planting = plan.planting || [];
        const topdressing = plan.topdressing || [];

        const fertilizerItems = [];

        // Process planting fertilizers (DAP)
        planting.forEach((item: any) => {
          if (item.brand?.includes('DAP')) {
            const bags = Math.floor(item.amountKg / 50);
            const extraKg = item.amountKg % 50;
            const pricePer50kg = item.pricePer50kg;
            const totalCost = (bags * pricePer50kg) + (extraKg * (pricePer50kg / 50));

            fertilizerItems.push({
              name: t('fertilizer_dap'),
              unitPrice: pricePer50kg,
              quantity: bags + (extraKg / 50),
              bags: bags,
              extraKg: extraKg,
              total: Math.round(totalCost)
            });
          }
        });

        // Process topdressing fertilizers (CAN, UREA, MOP)
        topdressing.forEach((item: any) => {
          const bags = Math.floor(item.amountKg / 50);
          const extraKg = item.amountKg % 50;
          const pricePer50kg = item.pricePer50kg;
          const totalCost = (bags * pricePer50kg) + (extraKg * (pricePer50kg / 50));

          let name = "";
          if (item.brand?.includes('CAN')) name = t('fertilizer_can');
          else if (item.brand?.includes('UREA')) name = t('fertilizer_urea');
          else if (item.brand?.includes('MOP')) name = t('fertilizer_mop');
          else if (item.brand?.includes('Thabiti')) name = t('fertilizer_thabiti');

          fertilizerItems.push({
            name: name,
            unitPrice: pricePer50kg,
            quantity: bags + (extraKg / 50),
            bags: bags,
            extraKg: extraKg,
            total: Math.round(totalCost)
          });
        });

        setFertilizerDetails(fertilizerItems);
      }

      // Labour details
      if (sessionData.labourCosts) {
        const labourItems = [];
        const labourTypes = [
          { key: 'ploughing', nameKey: 'labour_ploughing' },
          { key: 'planting', nameKey: 'labour_planting' },
          { key: 'weeding', nameKey: 'labour_weeding' },
          { key: 'harvesting', nameKey: 'labour_harvesting' }
        ];

        labourTypes.forEach(type => {
          const cost = sessionData.labourCosts[type.key] || 0;
          if (cost > 0) {
            labourItems.push({
              name: t(type.nameKey),
              unitPrice: cost,
              quantity: 1,
              total: cost
            });
          }
        });

        setLabourDetails(labourItems);
      }

      // Seed details
      if (sessionData.seedRate && sessionData.seedCost) {
        setSeedDetails({
          name: t('seed_name'),
          unitPrice: sessionData.seedCost,
          quantity: sessionData.seedRate,
          total: sessionData.seedRate * sessionData.seedCost
        });
      }

      // Transport details
      if (sessionData.transportCostPerBag && sessionData.grossMarginAnalysis?.bags) {
        const bags = sessionData.grossMarginAnalysis.bags || 27;
        setTransportDetails({
          name: t('transport_name'),
          unitPrice: sessionData.transportCostPerBag,
          quantity: bags,
          total: bags * sessionData.transportCostPerBag
        });
      }

      // Bag details
      if (sessionData.bagCost && sessionData.grossMarginAnalysis?.bags) {
        const bags = sessionData.grossMarginAnalysis.bags || 27;
        setBagDetails({
          name: t('bags_name'),
          unitPrice: sessionData.bagCost,
          quantity: bags,
          total: bags * sessionData.bagCost
        });
      }

      // Handle gross margin data
      if (sessionData.grossMarginAnalysis) {
        const gm = sessionData.grossMarginAnalysis;

        if (gm.low && gm.medium && gm.high) {
          setGrossMargin(gm);
        } else {
          setGrossMargin({
            low: {
              bags: gm.bags || 0,
              revenue: gm.revenue || 0,
              seedCost: gm.seedCost || 0,
              fertilizerCost: gm.fertilizerCost || 0,
              labourCost: gm.labourCost || 0,
              transportCost: gm.transportCost || 0,
              bagCost: gm.bagCost || 0,
              totalCost: gm.totalCosts || 0,
              grossMargin: gm.grossMargin || 0,
              pricePerBag: gm.pricePerBag || 0
            },
            medium: {
              bags: gm.bags || 0,
              revenue: gm.revenue || 0,
              seedCost: gm.seedCost || 0,
              fertilizerCost: gm.fertilizerCost || 0,
              labourCost: gm.labourCost || 0,
              transportCost: gm.transportCost || 0,
              bagCost: gm.bagCost || 0,
              totalCost: gm.totalCosts || 0,
              grossMargin: gm.grossMargin || 0,
              pricePerBag: gm.pricePerBag || 0
            },
            high: {
              bags: gm.bags || 0,
              revenue: gm.revenue || 0,
              seedCost: gm.seedCost || 0,
              fertilizerCost: gm.fertilizerCost || 0,
              labourCost: gm.labourCost || 0,
              transportCost: gm.transportCost || 0,
              bagCost: gm.bagCost || 0,
              totalCost: gm.totalCosts || 0,
              grossMargin: gm.grossMargin || 0,
              pricePerBag: gm.pricePerBag || 0
            }
          });
        }
      } else {
        setGrossMargin({
          low: { bags: 0, revenue: 0, seedCost: 0, fertilizerCost: 0, labourCost: 0, transportCost: 0, bagCost: 0, totalCost: 0, grossMargin: 0, pricePerBag: 0 },
          medium: { bags: 0, revenue: 0, seedCost: 0, fertilizerCost: 0, labourCost: 0, transportCost: 0, bagCost: 0, totalCost: 0, grossMargin: 0, pricePerBag: 0 },
          high: { bags: 0, revenue: 0, seedCost: 0, fertilizerCost: 0, labourCost: 0, transportCost: 0, bagCost: 0, totalCost: 0, grossMargin: 0, pricePerBag: 0 }
        });
      }

      setCrop(sessionData.crops?.[0] || t('crops'));
      setIsLoading(false);
    }
  }, [sessionData, t]);

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${(value || 0).toFixed(1)}%`;
  };

  // Helper function to get rating color (still used? If you remove soil test, you may not need it)
  const getRatingColor = (rating: string) => {
    switch(rating?.toLowerCase()) {
      case 'very low': return 'text-red-600 bg-red-100';
      case 'low': return 'text-orange-600 bg-orange-100';
      case 'optimum': return 'text-green-600 bg-green-100';
      case 'high': return 'text-blue-600 bg-blue-100';
      case 'very high': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-white animate-spin" />
      </div>
    );
  }

  const gm = grossMargin?.low || {
    bags: 0,
    revenue: 0,
    seedCost: 0,
    fertilizerCost: 0,
    labourCost: 0,
    transportCost: 0,
    bagCost: 0,
    totalCost: 0,
    grossMargin: 0,
    pricePerBag: 0
  };

  const farmerName = sessionData?.farmerName || t('farmer');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-950 to-indigo-950 text-white p-6 shadow-xl">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/interview/${sessionId}`}
                className="p-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-xl transition-all"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <DollarSign className="w-6 h-6" />
                  {t('financial_analysis_title', { crop })}
                </h1>
                <p className="text-white/80 flex items-center gap-2">
                  <Sprout className="w-4 h-4" />
                  {t('financial_analysis_subtitle', { crop, county: sessionData?.county || t('unknown_location'), farmerName })}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-xl flex items-center gap-2 transition-all">
                <Download className="w-4 h-4" />
                {t('download')}
              </button>
              <button className="px-4 py-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-xl flex items-center gap-2 transition-all">
                <Share2 className="w-4 h-4" />
                {t('share')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* SOIL TEST SUMMARY SECTION – REMOVED */}

        {/* Revenue Card with Selling Price */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl mb-8">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <DollarSign className="w-6 h-6" />
            {t('revenue_summary_title', { farmerName, crop })}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm opacity-90">{t('selling_price_per_bag')}</p>
              <p className="text-3xl font-bold">{formatCurrencyForDisplay(sellingPrice, currency)}</p>
            </div>
            <div>
              <p className="text-sm opacity-90">{t('total_yield')}</p>
              <p className="text-3xl font-bold">{yield_bags} {t('bags')}</p>
            </div>
            <div>
              <p className="text-sm opacity-90">{t('total_revenue')}</p>
              <p className="text-3xl font-bold">{formatCurrencyForDisplay(sellingPrice * yield_bags, currency)}</p>
            </div>
          </div>
          <p className="mt-3 text-white/80 text-sm">
            {t('revenue_message', { farmerName })}
          </p>
        </div>

        {/* Detailed Cost Breakdown with Unit Prices */}
        <div className="bg-white rounded-2xl p-6 shadow-xl mb-8">
          <h2 className="text-xl font-bold mb-6 text-blue-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            {t('detailed_cost_breakdown_title')}
          </h2>

          {/* Fertilizer Costs */}
          {fertilizerDetails.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold text-blue-900 mb-3 text-lg flex items-center gap-2">
                <Package className="w-5 h-5" />
                {t('fertilizer_costs_title')}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-blue-100">
                    <tr>
                      <th className="p-2 text-left text-blue-800">{t('item')}</th>
                      <th className="p-2 text-right text-blue-800">{t('unit_price_50kg')}</th>
                      <th className="p-2 text-right text-blue-800">{t('quantity_50kg_bags')}</th>
                      <th className="p-2 text-right text-blue-800">{t('total')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fertilizerDetails.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 font-medium text-blue-800">{item.name}</td>
                        <td className="p-2 text-right text-blue-800">{formatCurrencyForDisplay(item.unitPrice, currency)}</td>
                        <td className="p-2 text-right text-blue-800">
                          {item.bags} {item.extraKg > 0 ? `+ ${item.extraKg}kg` : ''}
                        </td>
                        <td className="p-2 text-right font-bold text-blue-800">{formatCurrencyForDisplay(item.total, currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Labour Costs */}
          {labourDetails.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold text-green-900 mb-3 text-lg flex items-center gap-2">
                <Tractor className="w-5 h-5" />
                {t('labour_costs_title')}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-green-100">
                    <tr>
                      <th className="p-2 text-left text-green-800">{t('item')}</th>
                      <th className="p-2 text-right text-green-800">{t('rate_per_acre')}</th>
                      <th className="p-2 text-right text-green-800">{t('quantity_acres')}</th>
                      <th className="p-2 text-right text-green-800">{t('total')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {labourDetails.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 font-medium text-green-800">{item.name}</td>
                        <td className="p-2 text-right text-green-800">{formatCurrencyForDisplay(item.unitPrice, currency)}</td>
                        <td className="p-2 text-right text-green-800">1</td>
                        <td className="p-2 text-right font-bold text-green-800">{formatCurrencyForDisplay(item.total, currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Seed Costs */}
          {seedDetails.total > 0 && (
            <div className="mb-6">
              <h3 className="font-bold text-purple-900 mb-3 text-lg flex items-center gap-2">
                <Sprout className="w-5 h-5" />
                {t('seed_costs_title')}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-purple-100">
                    <tr>
                      <th className="p-2 text-left text-purple-800">{t('item')}</th>
                      <th className="p-2 text-right text-purple-800">{t('price_per_kg')}</th>
                      <th className="p-2 text-right text-purple-800">{t('quantity_kg')}</th>
                      <th className="p-2 text-right text-purple-800">{t('total')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 font-medium text-purple-800">{seedDetails.name}</td>
                      <td className="p-2 text-right text-purple-800">{formatCurrencyForDisplay(seedDetails.unitPrice, currency)}</td>
                      <td className="p-2 text-right text-purple-800">{seedDetails.quantity}</td>
                      <td className="p-2 text-right font-bold text-purple-800">{formatCurrencyForDisplay(seedDetails.total, currency)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Transport & Bags */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {transportDetails.total > 0 && (
              <div>
                <h3 className="font-bold text-amber-900 mb-3 text-lg flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  {t('transport_title')}
                </h3>
                <table className="w-full">
                  <thead className="bg-amber-100">
                    <tr>
                      <th className="p-2 text-left text-amber-800">{t('item')}</th>
                      <th className="p-2 text-right text-amber-800">{t('per_bag')}</th>
                      <th className="p-2 text-right text-amber-800">{t('bags')}</th>
                      <th className="p-2 text-right text-amber-800">{t('total')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 font-medium text-amber-800">{t('transport_name')}</td>
                      <td className="p-2 text-right text-amber-800">{formatCurrencyForDisplay(transportDetails.unitPrice, currency)}</td>
                      <td className="p-2 text-right text-amber-800">{transportDetails.quantity}</td>
                      <td className="p-2 text-right font-bold text-amber-800">{formatCurrencyForDisplay(transportDetails.total, currency)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {bagDetails.total > 0 && (
              <div>
                <h3 className="font-bold text-amber-900 mb-3 text-lg flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  {t('bags_title')}
                </h3>
                <table className="w-full">
                  <thead className="bg-amber-100">
                    <tr>
                      <th className="p-2 text-left text-amber-800">{t('item')}</th>
                      <th className="p-2 text-right text-amber-800">{t('per_bag')}</th>
                      <th className="p-2 text-right text-amber-800">{t('bags')}</th>
                      <th className="p-2 text-right text-amber-800">{t('total')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 font-medium text-amber-800">{t('bags_name')}</td>
                      <td className="p-2 text-right text-amber-800">{formatCurrencyForDisplay(bagDetails.unitPrice, currency)}</td>
                      <td className="p-2 text-right text-amber-800">{bagDetails.quantity}</td>
                      <td className="p-2 text-right font-bold text-amber-800">{formatCurrencyForDisplay(bagDetails.total, currency)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Grand Total Table */}
          <div className="mt-8 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-blue-900 text-white">
                  <th className="p-3 text-left rounded-tl-xl">{t('cost_item')}</th>
                  <th className="p-3 text-right">{t('details')}</th>
                  <th className="p-3 text-right rounded-tr-xl">{t('amount')}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-blue-100">
                  <td className="p-3 font-medium text-blue-800">{t('revenue')}</td>
                  <td className="p-3 text-right text-blue-800">{yield_bags} {t('bags')} × {formatCurrencyForDisplay(sellingPrice, currency)}</td>
                  <td className="p-3 text-right font-bold text-green-600">{formatCurrencyForDisplay(sellingPrice * yield_bags, currency)}</td>
                </tr>
                <tr className="border-b border-blue-100 bg-blue-50">
                  <td className="p-3 font-medium text-blue-800">{t('seed_cost')}</td>
                  <td className="p-3 text-right text-blue-800">{seedDetails.quantity} kg × {formatCurrencyForDisplay(seedDetails.unitPrice, currency)}</td>
                  <td className="p-3 text-right font-bold text-blue-800">{formatCurrencyForDisplay(seedDetails.total, currency)}</td>
                </tr>
                {fertilizerDetails.map((item, index) => (
                  <tr key={`fert-${index}`} className="border-b border-blue-100">
                    <td className="p-3 font-medium text-blue-800">{item.name}</td>
                    <td className="p-3 text-right text-blue-800">
                      {item.bags} {t('bags')} × {formatCurrencyForDisplay(item.unitPrice, currency)}
                      {item.extraKg > 0 ? ` + ${item.extraKg}kg × ${formatCurrencyForDisplay(item.unitPrice/50, currency)}` : ''}
                    </td>
                    <td className="p-3 text-right font-bold text-blue-800">{formatCurrencyForDisplay(item.total, currency)}</td>
                  </tr>
                ))}
                {labourDetails.map((item, index) => (
                  <tr key={`labour-${index}`} className="border-b border-blue-100 bg-blue-50">
                    <td className="p-3 font-medium text-blue-800">{item.name}</td>
                    <td className="p-3 text-right text-blue-800">1 {t('acre')} × {formatCurrencyForDisplay(item.unitPrice, currency)}</td>
                    <td className="p-3 text-right font-bold text-blue-800">{formatCurrencyForDisplay(item.total, currency)}</td>
                  </tr>
                ))}
                <tr className="border-b border-blue-100">
                  <td className="p-3 font-medium text-blue-800">{t('transport')}</td>
                  <td className="p-3 text-right text-blue-800">{transportDetails.quantity} {t('bags')} × {formatCurrencyForDisplay(transportDetails.unitPrice, currency)}</td>
                  <td className="p-3 text-right font-bold text-blue-800">{formatCurrencyForDisplay(transportDetails.total, currency)}</td>
                </tr>
                <tr className="border-b border-blue-100 bg-blue-50">
                  <td className="p-3 font-medium text-blue-800">{t('bags')}</td>
                  <td className="p-3 text-right text-blue-800">{bagDetails.quantity} {t('bags')} × {formatCurrencyForDisplay(bagDetails.unitPrice, currency)}</td>
                  <td className="p-3 text-right font-bold text-blue-800">{formatCurrencyForDisplay(bagDetails.total, currency)}</td>
                </tr>
                <tr className="bg-blue-900 text-white font-bold">
                  <td className="p-3 rounded-bl-xl">{t('total_costs')}</td>
                  <td className="p-3 text-right"></td>
                  <td className="p-3 text-right rounded-br-xl">{formatCurrencyForDisplay(gm.totalCost, currency)}</td>
                </tr>
                <tr className="bg-green-600 text-white font-bold">
                  <td className="p-3 rounded-bl-xl">{t('gross_margin_profit')}</td>
                  <td className="p-3 text-right"></td>
                  <td className="p-3 text-right rounded-br-xl">{formatCurrencyForDisplay(gm.grossMargin, currency)}</td>
                </tr>
              </tbody>
            </table>

            {/* Business Message */}
            <div className="mt-4 p-4 bg-green-50 rounded-lg border-2 border-green-300">
              <p className="text-green-800 font-medium flex items-center gap-2">
                <Rocket className="w-5 h-5" />
                {t('business_summary', {
                  farmerName: farmerName.toUpperCase(),
                  totalCost: formatCurrencyForDisplay(gm.totalCost, currency),
                  profit: formatCurrencyForDisplay(gm.grossMargin, currency),
                  roi: (gm.grossMargin / gm.totalCost * 100).toFixed(1)
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Farm Details */}
        <div className="bg-white rounded-2xl p-6 shadow-xl">
          <h3 className="text-lg font-bold mb-4 text-blue-900 flex items-center gap-2">
            <Leaf className="w-5 h-5" />
            {t('farm_details_title', { farmerName })}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-600">{t('crop_enterprise')}</p>
              <p className="font-bold text-blue-900 capitalize">{crop}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-600">{t('county')}</p>
              <p className="font-bold text-blue-900">{sessionData?.county || t('unknown')}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-600">{t('farm_size')}</p>
              <p className="font-bold text-blue-900">{sessionData?.cultivatedAcres || 1} {t('acres')}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-600">{t('soil_test')}</p>
              <p className="font-bold text-blue-900">{sessionData?.soilTest ? t('yes') : t('no')}</p>
            </div>
          </div>

          {/* Business Reminder */}
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-300">
            <p className="text-yellow-800 text-sm flex items-center gap-2">
              <Zap className="w-4 h-4" />
              {t('business_reminder', { farmerName: farmerName.toUpperCase() })}
            </p>
          </div>
        </div>

        {/* Navigation with Compare Crops by Profit Button */}
        <div className="mt-8 flex justify-between">
          <Link
            href={`/interview/${sessionId}`}
            className="px-6 py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-all flex items-center gap-2 border border-white/30"
          >
            <ArrowLeft className="w-5 h-5" />
            {t('back_to_recommendations')}
          </Link>

          <Link
            href={`/compare/${sessionId}`}
            className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-bold hover:from-purple-600 hover:to-pink-700 transition-all flex items-center gap-3 shadow-lg"
          >
            <BarChart3 className="w-5 h-5" />
            {t('compare_crops_by_profit')}
          </Link>
        </div>
      </div>
    </div>
  );
}