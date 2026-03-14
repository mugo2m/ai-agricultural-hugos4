// lib/qaEngine.ts
// 100% LOGIC-BASED Q&A ENGINE - STRUCTURED OUTPUT FOR I18N
import { COUNTRY_CURRENCY_MAP } from '@/lib/config/currency';
import { cropPestDiseaseMap, PestDisease } from '@/lib/data/pestDiseaseMapping';
import { getPlantingAdvice, getPlantingAdviceText } from '@/lib/data/plantingDates';
import { getCropMaturityPeriod } from '@/lib/data/cropMaturity';

interface QaOutput {
  key: string;
  params?: Record<string, any>;
}

// Helper to format currency for display (symbol only) – kept for internal use, not for output
function formatCurrencyForCountry(amount: number, country: string = 'kenya'): string {
  const currency = COUNTRY_CURRENCY_MAP[country] || COUNTRY_CURRENCY_MAP.kenya;
  const formatted = new Intl.NumberFormat(currency.locale, {
    style: 'decimal',
    minimumFractionDigits: currency.decimalPlaces,
    maximumFractionDigits: currency.decimalPlaces
  }).format(amount);
  return currency.position === 'before'
    ? `${currency.symbol} ${formatted}`
    : `${formatted} ${currency.symbol}`;
}

function getCountryFromData(data: any): string {
  return data?.country || 'kenya';
}

function getFarmerName(data: any): string {
  return data?.farmerName || 'Farmer';
}

// Helper to get control methods for a specific pest/disease
function getControlMethods(pestName: string, crop: string, type: 'pest' | 'disease'): string {
  const cropLookupKey = crop.toLowerCase().replace(/\s+/g, '');
  const cropPestsAndDiseases = cropPestDiseaseMap[cropLookupKey] || cropPestDiseaseMap[crop.toLowerCase()] || [];

  const item = cropPestsAndDiseases.find((pd: PestDisease) =>
    pd.type === type && pd.name.toLowerCase().includes(pestName.toLowerCase())
  );

  if (!item) return '';

  let methods = '';

  // Cultural controls
  if (item.culturalControls.length > 0) {
    methods += '  • Cultural: ' + item.culturalControls.slice(0, 2).join('; ') + '\n';
  }

  // Chemical controls
  if (item.chemicalControls.length > 0) {
    const chem = item.chemicalControls[0];
    methods += `  • Chemical: ${chem.productName} (${chem.rate}) - ${chem.timing}\n`;
    if (chem.packageSizes) {
      methods += `    Pack sizes: ${chem.packageSizes.join(', ')}\n`;
    }
  }

  // Organic controls
  if (item.organicControls && item.organicControls.length > 0) {
    const organic = item.organicControls[0];
    methods += `  • Organic: ${organic.method}\n`;
  }

  // Business note
  if (item.businessNote) {
    methods += `  💼 ${item.businessNote}\n`;
  }

  return methods;
}

const qaTemplates: Record<string, (data: any, question: string, farmerName: string) => QaOutput> = {
  varieties: (data, question, farmerName) => {
    const crop = data?.crops?.[0] || 'your crops';
    const lowerCrop = crop.toLowerCase();
    const county = data?.county || 'your area';
    const farmerVariety = data?.cropVarieties || '';

    const varietyKeyMap: Record<string, string> = {
      maize: 'qa_varieties_maize',
      beans: 'qa_varieties_beans',
      sorghum: 'qa_varieties_sorghum',
      'finger millet': 'qa_varieties_finger_millet',
      coffee: 'qa_varieties_coffee',
      tomatoes: 'qa_varieties_tomatoes',
      potatoes: 'qa_varieties_potatoes',
      onions: 'qa_varieties_onions',
      cabbages: 'qa_varieties_cabbages',
      bananas: 'qa_varieties_bananas',
      groundnuts: 'qa_varieties_groundnuts',
    };

    const key = varietyKeyMap[lowerCrop] || 'qa_varieties_generic';
    const params: any = { farmerName, crop, county, farmerVariety };

    if (lowerCrop === 'maize') {
      params.varieties = [
        'H614: High yielding, 4-6 months, resistant to lodging',
        'H629: Drought tolerant, 3-4 months, good for medium altitudes',
        'H6213: High protein, 4-5 months, excellent for milling',
        'PHB 3253: Hybrid, 3-4 months, very high yield potential',
        'WH505: White grain, 4-5 months, resistant to MSV',
        'DK 777: Drought tolerant, 3-4 months, consistent performance',
        'Local varieties also available at your agrovet.'
      ];
    } else if (lowerCrop === 'beans') {
      params.varieties = [
        'Rosecoco: Popular, good taste, 3-4 months',
        'Canadian Wonder: High yielding, 3 months',
        'KK15: Drought tolerant, 2-3 months',
        'Nyota: Disease resistant, 3 months',
        'Mwitemania: Early maturity, 2-3 months',
        'Chelalang: High protein, 3 months'
      ];
    }

    return { key, params };
  },

  fertilizer: (data, question, farmerName) => {
    const crop = data?.crops?.[0] || 'your crops';
    const lowerCrop = crop.toLowerCase();
    const country = getCountryFromData(data);

    if (data?.soilTest?.fertilizerPlan) {
      const plan = data.soilTest.fertilizerPlan;

      // Helper to compute total cost for an item (same logic as in recommendation engine)
      const computeItemCost = (item: any) => {
        const bags = Math.floor(item.amountKg / 50);
        const extraKg = item.amountKg % 50;
        const total = (bags * item.pricePer50kg) + (extraKg * (item.pricePer50kg / 50));
        return formatCurrencyForCountry(total, country);
      };

      // Planting fertilizers (e.g., DAP)
      const plantingItems = plan.planting?.map((p: any) => ({
        name: p.brand || p.name || 'Unknown',
        amount: p.amountKg,
        bags: Math.ceil(p.amountKg / 50),
        cost: computeItemCost(p),
        provides: p.provides ? Object.entries(p.provides).map(([k, v]) => `${v}kg ${k}`).join(', ') : ''
      })) || [];

      // Topdressing fertilizers (UREA, MOP, etc.)
      const topdressingItems = plan.topdressing?.map((t: any) => ({
        name: t.brand || t.name || 'Unknown',
        amount: t.amountKg,
        bags: Math.ceil(t.amountKg / 50),
        cost: computeItemCost(t)
      })) || [];

      const totalCost = formatCurrencyForCountry(plan.totalCost || 0, country);

      return {
        key: 'qa_fertilizer_plan',
        params: { farmerName, crop, plantingItems, topdressingItems, totalCost }
      };
    }

    // Generic advice per crop
    const fertKeyMap: Record<string, string> = {
      maize: 'qa_fertilizer_maize',
      beans: 'qa_fertilizer_beans',
      tomatoes: 'qa_fertilizer_tomatoes',
    };
    const key = fertKeyMap[lowerCrop] || 'qa_fertilizer_generic';
    return { key, params: { farmerName, crop } };
  },

  seed: (data, question, farmerName) => {
    const crop = data?.crops?.[0] || 'your crops';
    const lowerCrop = crop.toLowerCase();
    const country = getCountryFromData(data);

    const seedKeyMap: Record<string, string> = {
      maize: 'qa_seed_maize',
      beans: 'qa_seed_beans',
      'finger millet': 'qa_seed_finger_millet',
      sorghum: 'qa_seed_sorghum',
      tomatoes: 'qa_seed_tomatoes',
      onions: 'qa_seed_onions',
    };
    const key = seedKeyMap[lowerCrop] || 'qa_seed_generic';
    const params: any = { farmerName, crop };
    if (lowerCrop === 'maize') {
      params.costLow = formatCurrencyForCountry(180, country);
      params.costHigh = formatCurrencyForCountry(200, country);
    }
    return { key, params };
  },

  spacing: (data, question, farmerName) => {
    const crop = data?.crops?.[0] || 'crops';
    const lowerCrop = crop.toLowerCase();

    // Get farmer's chosen spacing
    const spacingInfo = data?.spacingInfo;
    const chosenSpacing = spacingInfo ?
      `${spacingInfo.rowCm}cm x ${spacingInfo.plantCm}cm (${spacingInfo.plantsPerAcre?.toLocaleString() || '?'} plants/acre)` :
      'your chosen spacing';

    const spacingKeyMap: Record<string, string> = {
      maize: 'qa_spacing_maize',
      beans: 'qa_spacing_beans',
      sorghum: 'qa_spacing_sorghum',
      tomatoes: 'qa_spacing_tomatoes',
      cabbages: 'qa_spacing_cabbages',
      onions: 'qa_spacing_onions',
      bananas: 'qa_spacing_bananas',
      coffee: 'qa_spacing_coffee',
    };

    const key = spacingKeyMap[lowerCrop] || 'qa_spacing_generic';

    // Add chosen spacing to params
    return {
      key,
      params: {
        farmerName,
        crop,
        chosenSpacing,
        reminder: "For more details on any spacing option, visit the question-answering section."
      }
    };
  },

  pest: (data, question, farmerName) => {
    const crop = data?.crops?.[0] || 'crops';
    const lowerCrop = crop.toLowerCase();
    const country = getCountryFromData(data);

    // Get farmer's actual reported pests
    const farmerPests = data?.commonPests || [];
    let pestList: string[] = [];

    if (Array.isArray(farmerPests)) {
      pestList = farmerPests;
    } else if (typeof farmerPests === 'string') {
      pestList = farmerPests.split(',').map((p: string) => p.trim()).filter(p => p);
    }

    // If no pests reported, use generic response
    if (pestList.length === 0) {
      const pestKeyMap: Record<string, string> = {
        maize: 'qa_pest_maize',
        tomatoes: 'qa_pest_tomatoes',
      };
      const key = pestKeyMap[lowerCrop] || 'qa_pest_generic';
      const params: any = { farmerName, crop };
      if (lowerCrop === 'maize') {
        params.rocketCost = 'Rocket 44EC (40ml/20L water)';
        params.emacotCost = 'Emacot 5WG (4g/20L water)';
        params.bulldock = 'Bulldock granules (3.5g per plant)';
        params.actellic = 'Actellic Gold Dust (50g per 90kg bag)';
      }
      return { key, params };
    }

    // Build control methods for each pest
    let controlMethods = '';
    pestList.forEach(pest => {
      const methods = getControlMethods(pest, lowerCrop, 'pest');
      if (methods) {
        controlMethods += `🐛 ${pest}:\n${methods}\n`;
      } else {
        controlMethods += `🐛 ${pest}:\n  • Consult your local agricultural extension for specific control methods.\n\n`;
      }
    });

    return {
      key: 'qa_pest_personalized',
      params: {
        farmerName,
        crop: crop.toUpperCase(),
        pestList: pestList.join(', '),
        controlMethods,
        reminder: "For more details on any specific pest, visit the question-answering section."
      }
    };
  },

  disease: (data, question, farmerName) => {
    const crop = data?.crops?.[0] || 'crops';
    const lowerCrop = crop.toLowerCase();

    // Get farmer's actual reported diseases
    const farmerDiseases = data?.commonDiseases || [];
    let diseaseList: string[] = [];

    if (Array.isArray(farmerDiseases)) {
      diseaseList = farmerDiseases;
    } else if (typeof farmerDiseases === 'string') {
      diseaseList = farmerDiseases.split(',').map((d: string) => d.trim()).filter(d => d);
    }

    // If no diseases reported, use generic response
    if (diseaseList.length === 0) {
      const diseaseKeyMap: Record<string, string> = {
        maize: 'qa_disease_maize',
        tomatoes: 'qa_disease_tomatoes',
      };
      const key = diseaseKeyMap[lowerCrop] || 'qa_disease_generic';
      return { key, params: { farmerName, crop } };
    }

    // Build control methods for each disease
    let controlMethods = '';
    diseaseList.forEach(disease => {
      const methods = getControlMethods(disease, lowerCrop, 'disease');
      if (methods) {
        controlMethods += `🦠 ${disease}:\n${methods}\n`;
      } else {
        controlMethods += `🦠 ${disease}:\n  • Consult your local agricultural extension for specific control methods.\n\n`;
      }
    });

    return {
      key: 'qa_disease_personalized',
      params: {
        farmerName,
        crop: crop.toUpperCase(),
        diseaseList: diseaseList.join(', '),
        controlMethods,
        reminder: "For more details on any specific disease, visit the question-answering section."
      }
    };
  },

  harvest: (data, question, farmerName) => {
    const crop = data?.crops?.[0] || 'crops';
    const lowerCrop = crop.toLowerCase();

    const harvestKeyMap: Record<string, string> = {
      maize: 'qa_harvest_maize',
      beans: 'qa_harvest_beans',
      tomatoes: 'qa_harvest_tomatoes',
    };
    const key = harvestKeyMap[lowerCrop] || 'qa_harvest_generic';
    return { key, params: { farmerName, crop } };
  },

  water: (data, question, farmerName) => {
    return { key: 'qa_water', params: { farmerName } };
  },

  margin: (data, question, farmerName) => {
    const crop = data?.crops?.[0] || 'maize';
    const country = getCountryFromData(data);

    if (data?.grossMarginAnalysis) {
      const gm = data.grossMarginAnalysis;
      const revenue = formatCurrencyForCountry(gm.revenue || 0, country);
      const totalCosts = formatCurrencyForCountry(gm.totalCosts || 0, country);
      const grossMargin = formatCurrencyForCountry(gm.grossMargin || 0, country);
      const roi = ((gm.grossMargin || 0) / (gm.totalCosts || 1) * 100).toFixed(1);
      const returnPerInvested = (gm.revenue / gm.totalCosts).toFixed(1);
      const currencySymbol = COUNTRY_CURRENCY_MAP[country]?.symbol || 'Ksh';

      let roiMessageKey = 'qa_margin_roi_excellent';
      if (Number(roi) <= 50) roiMessageKey = 'qa_margin_roi_low';
      else if (Number(roi) <= 100) roiMessageKey = 'qa_margin_roi_medium';

      return {
        key: 'qa_margin_with_data',
        params: {
          farmerName,
          crop,
          revenue,
          totalCosts,
          grossMargin,
          roi,
          returnPerInvested,
          currencySymbol,
          roiMessageKey
        }
      };
    }

    return { key: 'qa_margin_generic', params: { farmerName } };
  },

  business: (data, question, farmerName) => {
    const country = getCountryFromData(data);
    const currency = COUNTRY_CURRENCY_MAP[country] || COUNTRY_CURRENCY_MAP.kenya;
    const symbol = currency.symbol;
    return {
      key: 'qa_business',
      params: { farmerName, symbol }
    };
  },

  // NEW: Planting category
  planting: (data, question, farmerName) => {
    const crop = data?.crops?.[0] || 'crops';
    const lowerCrop = crop.toLowerCase();
    const country = data?.country || 'kenya';
    const region = data?.county || 'your area';
    const plantingDate = data?.plantingDate;

    // Get planting advice if date exists
    if (plantingDate) {
      try {
        const advice = getPlantingAdvice(crop, country, region, plantingDate);
        const adviceText = getPlantingAdviceText(crop, country, region, plantingDate);

        // Get maturity period
        const maturityMonths = getCropMaturityPeriod(crop, country);

        return {
          key: 'qa_planting_personalized',
          params: {
            farmerName,
            crop,
            country,
            region,
            plantingDate,
            advice,
            adviceText,
            maturityMonths
          }
        };
      } catch (error) {
        console.error("Error getting planting advice:", error);
      }
    }

    // Generic planting advice
    return {
      key: 'qa_planting_generic',
      params: { farmerName, crop }
    };
  },

  default: (data, question, farmerName) => {
    const crop = data?.crops?.[0] || 'your crops';
    const county = data?.county || 'your area';
    return {
      key: 'qa_default',
      params: { farmerName, question, crop, county }
    };
  }
};

// Helper to detect category
function detectCategory(question: string): string {
  const q = question.toLowerCase();

  if (q.includes('variet') || q.includes('varity') ||
      q.includes('which type') || q.includes('what type of seed') ||
      q.includes('what seed') || q.includes('which seed') ||
      q.includes('recommended variety') || q.includes('best variety') ||
      q.includes('whar') || q.includes('wat varieties')) {
    return 'varieties';
  }

  if (q.includes('fertilizer') || q.includes('dap') || q.includes('can') ||
      q.includes('npk') || q.includes('manure') || q.includes('topdress')) {
    return 'fertilizer';
  }

  if (q.includes('seed rate') || q.includes('how many kg') || q.includes('seed per acre')) {
    return 'seed';
  }

  if (q.includes('spacing') || q.includes('distance') || q.includes('how far')) {
    return 'spacing';
  }

  if (q.includes('pest') || q.includes('insect') || q.includes('worm') ||
      q.includes('borer') || q.includes('armyworm')) {
    return 'pest';
  }

  if (q.includes('disease') || q.includes('blight') || q.includes('rust') ||
      q.includes('virus') || q.includes('smut')) {
    return 'disease';
  }

  if (q.includes('harvest') || q.includes('when to pick') || q.includes('storage')) {
    return 'harvest';
  }

  if (q.includes('water') || q.includes('irrigation') || q.includes('drought')) {
    return 'water';
  }

  if (q.includes('gross margin') || q.includes('profit') || q.includes('revenue') ||
      q.includes('cost') || q.includes('roi')) {
    return 'margin';
  }

  if (q.includes('business') || q.includes('money') || q.includes('invest')) {
    return 'business';
  }

  // NEW: Planting detection
  if (q.includes('plant') || q.includes('when to plant') || q.includes('planting time') ||
      q.includes('sow') || q.includes('sowing') || q.includes('best time to plant')) {
    return 'planting';
  }

  return 'default';
}

export function generateAnswer(question: string, sessionData: any): QaOutput {
  const category = detectCategory(question);
  console.log(`📋 Question category: ${category}`);

  const farmerName = getFarmerName(sessionData);
  const handler = qaTemplates[category] || qaTemplates.default;

  return handler(sessionData, question, farmerName);
}