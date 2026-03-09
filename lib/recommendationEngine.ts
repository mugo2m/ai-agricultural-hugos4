// lib/recommendationEngine.ts (refactored for i18n)
import { COUNTRY_CURRENCY_MAP } from '@/lib/config/currency';

interface RecommendationInput {
  hasSoilTest: boolean;
  soilAnalysis?: any;
  fertilizerPlan?: any;
  crop: string;
  crops: string[];
  farmerData: {
    usePlantingFertilizer?: string;
    useTopdressingFertilizer?: string;
    organicManure?: string;
    terracing?: string;
    mulching?: string;
    coverCrops?: string;
    rainwaterHarvesting?: string;
    contourFarming?: string;
    commonPests?: string;
    commonDiseases?: string;
    mainChallenge?: string;
    experience?: string;
    managementLevel?: string;
    conservationPractices?: string;
    actualYield?: number;
    pricePerUnit?: number;
    totalCosts?: number;
    country?: string;
    limePricePerBag?: number;
    recCalciticLime?: number;
  };
}

interface RecommendationOutput {
  list: string[]; // kept for backward compatibility (will be built from structured data)
  financialAdvice: string; // kept for backward compatibility
  structuredList: RecommendationItem[];
  structuredFinancialAdvice: RecommendationItem;
}

interface RecommendationItem {
  key: string;
  params?: Record<string, any>;
}

export function generateRecommendations(input: RecommendationInput): RecommendationOutput {
  const structuredList: RecommendationItem[] = [];
  const { hasSoilTest, soilAnalysis, fertilizerPlan, crop, farmerData } = input;
  const lowerCrop = crop.toLowerCase();
  const country = farmerData.country || 'kenya';

  // Helper to format currency for display (symbol only)
  const formatCurrency = (amount: number): string => {
    const currency = COUNTRY_CURRENCY_MAP[country] || COUNTRY_CURRENCY_MAP.kenya;
    const formattedAmount = new Intl.NumberFormat(currency.locale, {
      style: 'decimal',
      minimumFractionDigits: currency.decimalPlaces,
      maximumFractionDigits: currency.decimalPlaces
    }).format(amount);
    return currency.position === 'before'
      ? `${currency.symbol} ${formattedAmount}`
      : `${formattedAmount} ${currency.symbol}`;
  };

  const currencySymbol = COUNTRY_CURRENCY_MAP[country]?.symbol || 'Ksh';

  // ========== RECOMMENDATION 1: SOIL TEST ANALYSIS ==========
  if (hasSoilTest && soilAnalysis) {
    structuredList.push({ key: 'soil_analysis_title' });

    if (soilAnalysis.ph) {
      const rating = soilAnalysis.phRating || 'N/A';
      let adviceKey = 'soil_ph_advice';
      if (soilAnalysis.ph < 5.5) adviceKey = 'soil_ph_advice_acidic';
      else if (soilAnalysis.ph > 7.5) adviceKey = 'soil_ph_advice_alkaline';
      else adviceKey = 'soil_ph_advice_optimal';
      structuredList.push({
        key: 'soil_ph',
        params: { value: soilAnalysis.ph, rating }
      });
      structuredList.push({ key: adviceKey });
    }

    if (soilAnalysis.phosphorus) {
      const rating = soilAnalysis.phosphorusRating || 'N/A';
      let adviceKey = 'soil_p_advice';
      if (soilAnalysis.phosphorus < 15) adviceKey = 'soil_p_advice_very_low';
      else if (soilAnalysis.phosphorus < 30) adviceKey = 'soil_p_advice_low';
      else adviceKey = 'soil_p_advice_optimal';
      structuredList.push({
        key: 'soil_p',
        params: { value: soilAnalysis.phosphorus, rating }
      });
      structuredList.push({ key: adviceKey });
    }

    if (soilAnalysis.potassium) {
      const rating = soilAnalysis.potassiumRating || 'N/A';
      let adviceKey = 'soil_k_advice';
      if (soilAnalysis.potassium < 100) adviceKey = 'soil_k_advice_very_low';
      else if (soilAnalysis.potassium < 200) adviceKey = 'soil_k_advice_low';
      else adviceKey = 'soil_k_advice_optimal';
      structuredList.push({
        key: 'soil_k',
        params: { value: soilAnalysis.potassium, rating }
      });
      structuredList.push({ key: adviceKey });
    }

    if (soilAnalysis.calcium) {
      const rating = soilAnalysis.calciumRating || 'N/A';
      let adviceKey = 'soil_ca_advice';
      if (soilAnalysis.calcium < 400) adviceKey = 'soil_ca_advice_low';
      else adviceKey = 'soil_ca_advice_adequate';
      structuredList.push({
        key: 'soil_ca',
        params: { value: soilAnalysis.calcium, rating }
      });
      structuredList.push({ key: adviceKey });
    }

    if (soilAnalysis.magnesium) {
      const rating = soilAnalysis.magnesiumRating || 'N/A';
      let adviceKey = 'soil_mg_advice';
      if (soilAnalysis.magnesium < 50) adviceKey = 'soil_mg_advice_low';
      else if (soilAnalysis.magnesium > 200) adviceKey = 'soil_mg_advice_high';
      else adviceKey = 'soil_mg_advice_optimal';
      structuredList.push({
        key: 'soil_mg',
        params: { value: soilAnalysis.magnesium, rating }
      });
      structuredList.push({ key: adviceKey });
    }

    if (soilAnalysis.totalNitrogen) {
      const rating = soilAnalysis.totalNitrogenRating || 'N/A';
      let adviceKey = 'soil_n_advice';
      if (soilAnalysis.totalNitrogen < 0.2) adviceKey = 'soil_n_advice_low';
      else adviceKey = 'soil_n_advice_adequate';
      structuredList.push({
        key: 'soil_n',
        params: { value: soilAnalysis.totalNitrogen, rating }
      });
      structuredList.push({ key: adviceKey });
    }

    if (soilAnalysis.organicMatter) {
      const rating = soilAnalysis.organicMatterRating || 'N/A';
      let adviceKey = 'soil_om_advice';
      if (soilAnalysis.organicMatter < 2) adviceKey = 'soil_om_advice_low';
      else if (soilAnalysis.organicMatter > 5) adviceKey = 'soil_om_advice_excellent';
      else adviceKey = 'soil_om_advice_good';
      structuredList.push({
        key: 'soil_om',
        params: { value: soilAnalysis.organicMatter, rating }
      });
      structuredList.push({ key: adviceKey });
    }

    if (soilAnalysis.calcium && soilAnalysis.magnesium && soilAnalysis.magnesium > 0) {
      const caMgRatio = (soilAnalysis.calcium / soilAnalysis.magnesium).toFixed(1);
      let ratioAdvice = 'soil_ca_mg_ratio_balanced';
      if (parseFloat(caMgRatio) < 5) ratioAdvice = 'soil_ca_mg_ratio_low';
      else if (parseFloat(caMgRatio) > 10) ratioAdvice = 'soil_ca_mg_ratio_high';
      structuredList.push({
        key: 'soil_ca_mg_ratio',
        params: { ratio: caMgRatio }
      });
      structuredList.push({ key: ratioAdvice });
    }

    structuredList.push({
      key: 'soil_business_insight',
      params: { symbol: currencySymbol }
    });
    structuredList.push({ key: 'soil_test_yearly' });
  }

  // ========== RECOMMENDATION 2: CALCITIC LIME ==========
  if (hasSoilTest && farmerData.recCalciticLime && farmerData.recCalciticLime > 0) {
    const limeKg = farmerData.recCalciticLime;
    const limePricePerBag = farmerData.limePricePerBag || 300;
    const bagsNeeded = Math.ceil(limeKg / 50);
    const totalCost = bagsNeeded * limePricePerBag;

    structuredList.push({ key: 'calcitic_lime_title' });
    structuredList.push({
      key: 'calcitic_lime_need',
      params: { kg: limeKg }
    });
    structuredList.push({
      key: 'calcitic_lime_bags',
      params: { bags: bagsNeeded }
    });
    structuredList.push({
      key: 'calcitic_lime_cost',
      params: {
        total: formatCurrency(totalCost),
        perBag: formatCurrency(limePricePerBag)
      }
    });
    structuredList.push({ key: 'calcitic_lime_application' });
    structuredList.push({ key: 'calcitic_lime_wait' });

    if (soilAnalysis) {
      if (soilAnalysis.ph < 5.5) {
        if (soilAnalysis.calcium && soilAnalysis.calcium < 400) {
          structuredList.push({
            key: 'calcitic_lime_why_acidic_low_ca',
            params: {
              ph: soilAnalysis.ph,
              ca: soilAnalysis.calcium
            }
          });
        } else {
          structuredList.push({
            key: 'calcitic_lime_why_acidic',
            params: { ph: soilAnalysis.ph }
          });
        }
      } else if (soilAnalysis.calcium && soilAnalysis.calcium < 400) {
        structuredList.push({
          key: 'calcitic_lime_why_low_ca',
          params: { ca: soilAnalysis.calcium }
        });
      }
    }

    structuredList.push({ key: 'calcitic_lime_business_case' });
    structuredList.push({ key: 'soil_test_yearly_reapply' });
  }

  // ========== RECOMMENDATION 3: FERTILIZER PLAN ==========
  if (hasSoilTest && fertilizerPlan) {
    structuredList.push({
      key: 'fertilizer_plan_title',
      params: { crop: crop.toUpperCase() }
    });

    if (fertilizerPlan.farmSize) {
      structuredList.push({
        key: 'fertilizer_plan_farm_size',
        params: { size: fertilizerPlan.farmSize }
      });
    }

    const totalFertilizerCost = fertilizerPlan.totalCost || 0;
    structuredList.push({
      key: 'fertilizer_plan_total_investment',
      params: { amount: formatCurrency(totalFertilizerCost) }
    });

    if (fertilizerPlan.plantingRecommendations?.length > 0) {
      structuredList.push({ key: 'fertilizer_planting_section' });
      fertilizerPlan.plantingRecommendations.forEach((rec: any) => {
        const bagsNeeded = Math.floor(rec.amountKg / 50);
        const extraKg = rec.amountKg % 50;
        const cost = Math.round(rec.amountKg * (rec.pricePer50kg / 50));
        structuredList.push({
          key: 'fertilizer_item',
          params: {
            amountKg: rec.amountKg,
            brand: rec.brand,
            npk: rec.npk,
            bags: bagsNeeded,
            extraKg,
            cost: formatCurrency(cost),
            n: rec.provides.n.toFixed(1),
            p: rec.provides.p.toFixed(1),
            k: rec.provides.k.toFixed(1)
          }
        });
      });
    }

    if (fertilizerPlan.topDressingRecommendations?.length > 0) {
      structuredList.push({ key: 'fertilizer_topdressing_section' });
      fertilizerPlan.topDressingRecommendations.forEach((rec: any) => {
        const bagsNeeded = Math.floor(rec.amountKg / 50);
        const extraKg = rec.amountKg % 50;
        const cost = Math.round(rec.amountKg * (rec.pricePer50kg / 50));
        const params: any = {
          amountKg: rec.amountKg,
          brand: rec.brand,
          npk: rec.npk,
          bags: bagsNeeded,
          extraKg,
          cost: formatCurrency(cost)
        };
        if (rec.provides.n > 0) {
          params.n = rec.provides.n.toFixed(1);
        } else {
          params.k = rec.provides.k.toFixed(1);
        }
        structuredList.push({
          key: rec.provides.n > 0 ? 'fertilizer_item_n' : 'fertilizer_item_k',
          params
        });
      });
    }

    structuredList.push({
      key: 'fertilizer_business_tip',
      params: { symbol: currencySymbol }
    });

    if (fertilizerPlan.perPlant) {
      const pp = fertilizerPlan.perPlant;
      structuredList.push({ key: 'fertilizer_plant_population_title' });
      structuredList.push({
        key: 'fertilizer_plant_population',
        params: {
          totalPlants: pp.totalPlants.toLocaleString(),
          farmSize: fertilizerPlan.farmSize
        }
      });
      structuredList.push({ key: 'fertilizer_per_plant_title' });
      structuredList.push({
        key: 'fertilizer_per_plant_dap',
        params: { grams: pp.dapGrams }
      });
      structuredList.push({
        key: 'fertilizer_per_plant_urea',
        params: { grams: pp.ureaGrams }
      });
      structuredList.push({
        key: 'fertilizer_per_plant_mop',
        params: { grams: pp.mopGrams }
      });
      structuredList.push({
        key: 'fertilizer_per_plant_total',
        params: { grams: pp.totalGrams }
      });
      structuredList.push({ key: 'measurement_guide_title' });
      structuredList.push({
        key: 'measurement_guide_dap',
        params: { grams: pp.dapGrams, guide: pp.dapGuide }
      });
      structuredList.push({
        key: 'measurement_guide_urea',
        params: { grams: pp.ureaGrams, guide: pp.ureaGuide }
      });
      structuredList.push({
        key: 'measurement_guide_mop',
        params: { grams: pp.mopGrams, guide: pp.mopGuide }
      });
      structuredList.push({
        key: 'measurement_guide_total',
        params: { grams: pp.totalGrams, guide: pp.totalGuide }
      });
    }

    structuredList.push({ key: 'gross_margin_note' });
    structuredList.push({
      key: 'fertilizer_remember',
      params: { crop: crop.toUpperCase() }
    });
  }

  // ========== RECOMMENDATION 4: GROSS MARGIN ANALYSIS ==========
  const actualYield = farmerData.actualYield || 27;
  const actualPrice = farmerData.pricePerUnit || 6750;
  const actualCosts = farmerData.totalCosts || 52290;

  const LOW_PERCENT = 0.33;
  const HIGH_PERCENT = 1.26;

  const lowYield = Math.round(actualYield * LOW_PERCENT);
  const lowRevenue = lowYield * actualPrice;
  const lowCosts = Math.round(actualCosts * LOW_PERCENT);
  const lowGM = lowRevenue - lowCosts;

  const mediumYield = actualYield;
  const mediumRevenue = actualYield * actualPrice;
  const mediumCosts = actualCosts;
  const mediumGM = mediumRevenue - mediumCosts;

  const highYield = Math.round(actualYield * HIGH_PERCENT);
  const highRevenue = highYield * actualPrice;
  const highCosts = Math.round(actualCosts * HIGH_PERCENT);
  const highGM = highRevenue - highCosts;

  structuredList.push({
    key: 'gross_margin_title',
    params: { crop: crop.toUpperCase() }
  });
  structuredList.push({ key: 'gross_margin_intro' });

  structuredList.push({ key: 'gross_margin_low_label' });
  structuredList.push({
    key: 'gross_margin_low_yield',
    params: {
      yield: lowYield,
      price: formatCurrency(actualPrice),
      revenue: formatCurrency(lowRevenue)
    }
  });
  structuredList.push({
    key: 'gross_margin_low_costs',
    params: { costs: formatCurrency(lowCosts) }
  });
  structuredList.push({
    key: 'gross_margin_low_gm',
    params: { gm: formatCurrency(lowGM) }
  });

  structuredList.push({ key: 'gross_margin_medium_label' });
  structuredList.push({
    key: 'gross_margin_medium_yield',
    params: {
      yield: mediumYield,
      price: formatCurrency(actualPrice),
      revenue: formatCurrency(mediumRevenue)
    }
  });
  structuredList.push({
    key: 'gross_margin_medium_costs',
    params: { costs: formatCurrency(mediumCosts) }
  });
  structuredList.push({
    key: 'gross_margin_medium_gm',
    params: { gm: formatCurrency(mediumGM) }
  });

  structuredList.push({ key: 'gross_margin_high_label' });
  structuredList.push({
    key: 'gross_margin_high_yield',
    params: {
      yield: highYield,
      price: formatCurrency(actualPrice),
      revenue: formatCurrency(highRevenue)
    }
  });
  structuredList.push({
    key: 'gross_margin_high_costs',
    params: { costs: formatCurrency(highCosts) }
  });
  structuredList.push({
    key: 'gross_margin_high_gm',
    params: { gm: formatCurrency(highGM) }
  });

  structuredList.push({ key: 'gross_margin_summary_title' });
  structuredList.push({
    key: 'gross_margin_increase_low_medium',
    params: { percent: Math.round((mediumGM/lowGM - 1)*100) }
  });
  structuredList.push({
    key: 'gross_margin_increase_medium_high',
    params: { percent: Math.round((highGM/mediumGM - 1)*100) }
  });
  structuredList.push({
    key: 'gross_margin_return_per_invested',
    params: {
      symbol: currencySymbol,
      return: (mediumRevenue/mediumCosts).toFixed(1)
    }
  });
  structuredList.push({
    key: 'gross_margin_current_level',
    params: { level: farmerData.managementLevel || "Medium" }
  });

  structuredList.push({ key: 'gross_margin_bottom_line' });
  structuredList.push({
    key: 'gross_margin_extra_profit',
    params: {
      amount: formatCurrency(highGM - mediumGM),
      from: farmerData.managementLevel || "Medium"
    }
  });

  // ========== RECOMMENDATION 5: GOOD AGRICULTURAL PRACTICES ==========
  structuredList.push({
    key: 'gap_title',
    params: { crop: crop.toUpperCase() }
  });

  // Use a map of crop-specific keys, or fallback to generic
  const gapKey = lowerCrop in gapKeys ? gapKeys[lowerCrop] : 'gap_generic';
  structuredList.push({ key: gapKey, params: { crop } });
  structuredList.push({ key: 'gap_remember' });

  // ========== RECOMMENDATION 6: DISEASE MANAGEMENT ==========
  structuredList.push({
    key: 'disease_management_title',
    params: { crop: crop.toUpperCase() }
  });

  if (farmerData.commonDiseases) {
    structuredList.push({
      key: 'disease_reported',
      params: { diseases: farmerData.commonDiseases }
    });
  }

  structuredList.push({ key: 'disease_prevention_title' });
  structuredList.push({ key: 'disease_prevention_list' }); // this will be a bullet list of items

  structuredList.push({ key: 'disease_control_title' });
  if (lowerCrop === "maize") {
    structuredList.push({ key: 'disease_control_maize_1' });
    structuredList.push({ key: 'disease_control_maize_2' });
  } else {
    structuredList.push({ key: 'disease_control_generic' });
  }

  structuredList.push({ key: 'disease_business_case_title' });
  structuredList.push({
    key: 'disease_business_case',
    params: {
      low: formatCurrency(2000),
      high: formatCurrency(5000),
      saved: formatCurrency(100000),
      symbol: currencySymbol
    }
  });

  // ========== RECOMMENDATION 7: PEST MANAGEMENT ==========
  structuredList.push({
    key: 'pest_management_title',
    params: { crop: crop.toUpperCase() }
  });

  if (farmerData.commonPests) {
    structuredList.push({
      key: 'pest_reported',
      params: { pests: farmerData.commonPests }
    });
  }

  structuredList.push({ key: 'pest_prevention_title' });
  structuredList.push({ key: 'pest_prevention_list' });

  structuredList.push({ key: 'pest_business_calc_title' });
  structuredList.push({
    key: 'pest_business_calc',
    params: {
      lowLoss: formatCurrency(80000),
      highLoss: formatCurrency(120000),
      lowCost: formatCurrency(1500),
      highCost: formatCurrency(3000),
      saved: formatCurrency(100000),
      symbol: currencySymbol
    }
  });

  // ========== RECOMMENDATION 8: SOIL & WATER CONSERVATION ==========
  structuredList.push({
    key: 'conservation_title',
    params: { crop: crop.toUpperCase() }
  });

  const conservationPractices = farmerData.conservationPractices ?
    farmerData.conservationPractices.split(',').map(p => p.trim()) : [];

  if (conservationPractices.length > 0 && !conservationPractices.includes("None")) {
    structuredList.push({
      key: 'conservation_already_using',
      params: { practices: conservationPractices.join(', ') }
    });
  }

  structuredList.push({ key: 'conservation_recommended_title' });

  if (conservationPractices.includes("Organic manure")) {
    structuredList.push({ key: 'conservation_organic_manure' });
  }
  if (conservationPractices.includes("Terracing")) {
    structuredList.push({ key: 'conservation_terracing' });
  }
  if (conservationPractices.includes("Mulching")) {
    structuredList.push({ key: 'conservation_mulching' });
  }
  if (conservationPractices.includes("Cover crops")) {
    structuredList.push({ key: 'conservation_cover_crops' });
  }
  if (conservationPractices.includes("Rainwater harvesting")) {
    structuredList.push({
      key: 'conservation_rainwater',
      params: { amount: formatCurrency(50000) }
    });
  }
  if (conservationPractices.includes("Contour farming")) {
    structuredList.push({ key: 'conservation_contour' });
  }

  structuredList.push({ key: 'conservation_business_case_title' });
  structuredList.push({
    key: 'conservation_business_case',
    params: {
      mulchingSaved: formatCurrency(5000),
      coverCropsSaved: formatCurrency(3500),
      symbol: currencySymbol
    }
  });

  // ========== RECOMMENDATION 9: FARMING AS BUSINESS ==========
  structuredList.push({ key: 'business_title' });

  structuredList.push({ key: 'business_know_costs_title' });
  structuredList.push({ key: 'business_know_costs_list' });
  structuredList.push({
    key: 'business_know_costs_example',
    params: { amount: formatCurrency(52290) }
  });

  structuredList.push({ key: 'business_buy_bulk_title' });
  structuredList.push({
    key: 'business_buy_bulk_dap',
    params: {
      single: formatCurrency(3300),
      ten: formatCurrency(31000),
      saved: formatCurrency(2000)
    }
  });
  structuredList.push({
    key: 'business_buy_bulk_can',
    params: {
      single: formatCurrency(2500),
      ten: formatCurrency(23500),
      saved: formatCurrency(1500)
    }
  });

  structuredList.push({ key: 'business_form_groups_title' });
  structuredList.push({ key: 'business_form_groups_list' });
  structuredList.push({
    key: 'business_form_groups_transport',
    params: { saved: formatCurrency(500) }
  });

  structuredList.push({ key: 'business_exponential_title' });
  structuredList.push({
    key: 'business_exponential',
    params: { symbol: currencySymbol }
  });

  structuredList.push({ key: 'business_bottom_line' });

  // ========== FINANCIAL ADVICE ==========
  const financialParams: Record<string, any> = {
    symbol: currencySymbol
  };
  if (hasSoilTest && fertilizerPlan?.totalCost) {
    financialParams.totalInvestment = formatCurrency(fertilizerPlan.totalCost);
  }
  // Add other parameters as needed for the financial advice template
  const structuredFinancialAdvice: RecommendationItem = {
    key: 'financial_advice',
    params: financialParams
  };

  // Build backward-compatible string lists
  const list = structuredList.map(item => {
    // This is a simple placeholder – in reality you'd need to actually format the strings
    // We'll just use the key as a placeholder; components that still use list will see keys.
    return item.key + (item.params ? JSON.stringify(item.params) : '');
  });

  const financialAdvice = structuredFinancialAdvice.key;

  return {
    list,
    financialAdvice,
    structuredList,
    structuredFinancialAdvice
  };
}

// Map for crop‑specific GAP keys
const gapKeys: Record<string, string> = {
  maize: 'gap_maize',
  beans: 'gap_beans',
  'finger millet': 'gap_finger_millet',
  sorghum: 'gap_sorghum'
};