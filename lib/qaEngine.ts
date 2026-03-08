// lib/qaEngine.ts
// 100% LOGIC-BASED Q&A ENGINE - CLEAN VERSION WITH FARMER NAME & BUSINESS LANGUAGE
import { COUNTRY_CURRENCY_MAP } from '@/lib/config/currency';

// Helper function to format currency based on country
function formatCurrencyForCountry(amount: number, country: string = 'kenya'): string {
  const currency = COUNTRY_CURRENCY_MAP[country] || COUNTRY_CURRENCY_MAP.kenya;

  return new Intl.NumberFormat(currency.locale, {
    style: 'currency',
    currency: currency.code,
    minimumFractionDigits: currency.decimalPlaces,
    maximumFractionDigits: currency.decimalPlaces
  }).format(amount);
}

// Helper to get country from session data
function getCountryFromData(data: any): string {
  return data?.country || 'kenya';
}

// Helper to get farmer name
function getFarmerName(data: any): string {
  return data?.farmerName || 'Farmer';
}

// Helper to add business language to responses
function addBusinessFlavor(text: string, farmerName: string): string {
  const businessLines = [
    `\n\n💼 BUSINESS TIP: Remember ${farmerName}, farming is an ENTERPRISE - every input must increase your profit!`,
    `\n\n📈 PRODUCE MORE WITH LESS, ${farmerName.toUpperCase()}! Track these costs carefully.`,
    `\n\n💰 PUT MORE MONEY IN YOUR POCKET, ${farmerName}! Smart decisions = bigger profits.`,
    `\n\n🌾 ${farmerName}, treat your farm like a business and watch your returns grow!`,
    `\n\n💵 EVERY SHILLING INVESTED SHOULD RETURN 3-5 SHILLINGS PROFIT, ${farmerName}!`
  ];
  const randomLine = businessLines[Math.floor(Math.random() * businessLines.length)];
  return text + randomLine;
}

const qaTemplates: Record<string, (data: any, question: string, farmerName: string) => string> = {
  // ========== VARIETIES QUESTIONS ==========
  varieties: (data, question, farmerName) => {
    const crop = data?.crops?.[0] || 'your crops';
    const lowerCrop = crop.toLowerCase();
    const county = data?.county || 'your area';

    const varietyMap: Record<string, string> = {
      maize: `${farmerName}, here are MAIZE VARIETIES for your ${county.toUpperCase()} ENTERPRISE:

• H614: High yielding, 4-6 months, resistant to lodging
• H629: Drought tolerant, 3-4 months, good for medium altitudes
• H6213: High protein, 4-5 months, excellent for milling
• PHB 3253: Hybrid, 3-4 months, very high yield potential
• WH505: White grain, 4-5 months, resistant to MSV
• DK 777: Drought tolerant, 3-4 months, consistent performance

Local varieties also available at your agrovet.`,

      beans: `${farmerName}, here are BEANS VARIETIES for your ${county.toUpperCase()} ENTERPRISE:

• Rosecoco: Popular, good taste, 3-4 months
• Canadian Wonder: High yielding, 3 months
• KK15: Drought tolerant, 2-3 months
• Nyota: Disease resistant, 3 months
• Mwitemania: Early maturity, 2-3 months
• Chelalang: High protein, 3 months`,

      sorghum: `${farmerName}, here are SORGHUM VARIETIES for your ${county.toUpperCase()} ENTERPRISE:

• Seredo: High yielding, 3-4 months
• Serena: Drought tolerant, 3 months
• Gadam: Bird resistant, 4 months`,

      "finger millet": `${farmerName}, here are FINGER MILLET VARIETIES for your ENTERPRISE:

• Local varieties: Traditional, well-adapted
• Serere: Improved, high yield
• Gulu: Early maturing`,

      coffee: `${farmerName}, here are COFFEE VARIETIES for your ${county.toUpperCase()} ENTERPRISE:

• SL 28: High quality, drought resistant
• SL 34: Good cup quality, high yield
• Ruiru 11: Disease resistant, compact
• Batian: High yield, CBD resistant
• K7: Rust resistant, good for lower altitudes`,

      tomatoes: `${farmerName}, here are TOMATO VARIETIES for your ENTERPRISE:

• Fortune Maker: Large fruits, disease resistant
• Money Maker: Continuous cropping, reliable
• Rio Grande: Oval shape, good for processing
• Anna F1: Hybrid, very high yield
• Onyx: Firm fruits, good for transport`,

      potatoes: `${farmerName}, here are POTATO VARIETIES for your ENTERPRISE:

• Shangi: Popular, early maturity (3 months)
• Unica: Drought tolerant, disease resistant
• Tigoni: High yielding, good quality
• Desiree: Red skin, good for crisps
• Kenya Baraka: Late blight resistant`,

      onions: `${farmerName}, here are ONION VARIETIES for your ENTERPRISE:

• Red Creole: Red bulbs, good storage
• Bombay Red: Dark red, pungent flavor
• Texas Grano: Large bulbs, mild flavor
• Tropicana: Heat tolerant, high yield`,

      cabbages: `${farmerName}, here are CABBAGE VARIETIES for your ENTERPRISE:

• Copenhagen Market: Early maturing, round heads
• Gloria F1: Hybrid, disease resistant
• Pruktor: Large heads, good storage
• Sugarloaf: Pointed heads, sweet flavor`,

      bananas: `${farmerName}, here are BANANA VARIETIES for your ENTERPRISE:

• Giant Cavendish: Commercial variety
• Williams: Sweet, good for dessert
• FHIA 17: Disease resistant, cooking banana
• Local varieties: Well adapted to your area`,

      groundnuts: `${farmerName}, here are GROUNDNUT VARIETIES for your ENTERPRISE:

• Homa Bay: Spreader type, high yield
• Uganda Red: Bunch type, early maturity
• Local varieties: Well adapted`,
    };

    let answer = '';
    if (varietyMap[lowerCrop]) {
      answer = varietyMap[lowerCrop];
    } else {
      answer = `${farmerName}, for your ${crop} ENTERPRISE, recommended varieties include improved hybrids and local landraces adapted to ${county}. Visit your local agrovet for seeds suitable for your specific area.`;
    }

    return addBusinessFlavor(answer, farmerName);
  },

  // Fertilizer questions
  fertilizer: (data, question, farmerName) => {
    const crop = data?.crops?.[0] || 'your crops';
    const lowerCrop = crop.toLowerCase();
    const country = getCountryFromData(data);

    if (data?.soilTest?.fertilizerPlan) {
      const plan = data.soilTest.fertilizerPlan;
      let answer = `${farmerName}, here's your PRECISION FERTILIZER INVESTMENT PLAN based on YOUR soil test:\n\n`;

      if (plan.planting?.length > 0) {
        answer += `PLANTING FERTILIZERS (apply at planting):\n`;
        plan.planting.forEach((p: any) => {
          const bagsNeeded = Math.ceil(p.selected.amountKg / 50);
          answer += `• ${p.selected.name}: ${p.selected.amountKg}kg per acre\n`;
          answer += `  Buy: ${bagsNeeded} bag(s) of 50kg\n`;
          answer += `  Cost: ${formatCurrencyForCountry(p.selected.cost || 0, country)} (YOUR investment)\n`;
          answer += `  Provides: ${Object.entries(p.selected.provides).map(([k, v]) => `${v}kg ${k}`).join(', ')}\n\n`;
        });
      }

      if (plan.topdressing?.length > 0) {
        answer += `TOPDRESSING FERTILIZERS (apply 3-4 weeks after planting):\n`;
        plan.topdressing.forEach((t: any) => {
          const bagsNeeded = Math.ceil(t.selected.amountKg / 50);
          answer += `• ${t.selected.name}: ${t.selected.amountKg}kg per acre\n`;
          answer += `  Buy: ${bagsNeeded} bag(s) of 50kg\n`;
          answer += `  Cost: ${formatCurrencyForCountry(t.selected.cost || 0, country)}\n\n`;
        });
      }

      answer += `💰 TOTAL FERTILIZER INVESTMENT: ${formatCurrencyForCountry(plan.totalCost || 0, country)} per acre for your ${crop.toUpperCase()} ENTERPRISE`;
      return addBusinessFlavor(answer, farmerName);
    }

    const fertAdvice: Record<string, string> = {
      maize: `${farmerName}, here's your MAIZE FERTILIZER INVESTMENT PLAN:

Planting: Apply 50kg DAP per acre (1 bag of 50kg)
Topdressing: Apply 50kg CAN or 25kg UREA per acre 3-4 weeks after planting
Add 2.5 tons manure per acre for best results

Expected yield: 25-40 bags per acre with good management`,

      beans: `${farmerName}, BEANS fix their own nitrogen! Just apply:
Planting: 50kg DAP per acre at planting
Add manure for better yields`,

      tomatoes: `${farmerName}, here's your TOMATO FERTILIZER INVESTMENT PLAN:
Planting: 100kg DAP per acre
Topdressing 1: 50kg CAN at transplanting
Topdressing 2: 100kg CAN at flowering
Use foliar feeds for micronutrients`
    };

    let answer = fertAdvice[lowerCrop] ||
      `${farmerName}, for your ${crop} ENTERPRISE, apply 50kg DAP at planting and topdress with 50kg CAN 3-4 weeks later. Consider a soil test for precision recommendations - it saves money!`;

    return addBusinessFlavor(answer, farmerName);
  },

  // Seed rate questions
  seed: (data, question, farmerName) => {
    const crop = data?.crops?.[0] || 'your crops';
    const lowerCrop = crop.toLowerCase();
    const country = getCountryFromData(data);

    const seedRates: Record<string, string> = {
      maize: `${farmerName}, for your MAIZE ENTERPRISE:
SEED RATE: 10kg per acre (25kg per hectare)
Buy certified seed from agrodealers
Cost: ${formatCurrencyForCountry(180, country)}-${formatCurrencyForCountry(200, country)} per kg`,

      beans: `${farmerName}, for your BEANS ENTERPRISE:
SEED RATE: 20-24kg per acre (50-60kg per hectare)
Certified seed recommended`,

      "finger millet": `${farmerName}, for your FINGER MILLET ENTERPRISE:
SEED RATE: 1.6kg per acre (4kg per hectare)`,

      sorghum: `${farmerName}, for your SORGHUM ENTERPRISE:
SEED RATE: 2.8kg per acre (7kg per hectare)`,

      tomatoes: `${farmerName}, for your TOMATO ENTERPRISE:
SEED RATE: 60-80g per acre (150-200g per hectare) for nursery`,

      onions: `${farmerName}, for your ONION ENTERPRISE:
SEED RATE: 0.7-0.8kg per acre (1.75-2kg per hectare) for nursery`
    };

    let answer = seedRates[lowerCrop] ||
      `${farmerName}, for your ${crop} ENTERPRISE, use certified seed at recommended rates from your local agrovet.`;

    return addBusinessFlavor(answer, farmerName);
  },

  // Spacing questions
  spacing: (data, question, farmerName) => {
    const crop = data?.crops?.[0] || 'crops';
    const spacingMap: Record<string, string> = {
      maize: `${farmerName}, for your MAIZE ENTERPRISE:

75cm between rows x 25cm within rows (1 seed per hole)
OR 75cm x 50cm (2 seeds per hole)
Plant 5cm deep
This gives about 53,000 plants per hectare
More plants = more potential profit!`,

      beans: `${farmerName}, for your BEANS ENTERPRISE:

50cm x 10cm for pure stand (2 seeds per hole)
For intercropping with maize, use 50cm x 15cm between maize rows`,

      sorghum: `${farmerName}, for your SORGHUM ENTERPRISE:

60cm x 15cm (drilled then thinned to 15cm intra-row)`,

      tomatoes: `${farmerName}, for your TOMATO ENTERPRISE:

60-70cm x 40cm (processing)
90cm x 30cm (fresh market)
60cm x 60cm (2 bearing stems)`,

      cabbages: `${farmerName}, for your CABBAGE ENTERPRISE:

60cm x 45cm for medium heads
75cm x 60cm for large heads`,

      onions: `${farmerName}, for your ONION ENTERPRISE:

15cm x 7.5cm. Transplant when pencil-thick`,

      bananas: `${farmerName}, for your BANANA ENTERPRISE:

3m x 3m (short varieties)
3m x 4m (medium)
4m x 4m (tall)
Hole size: 60cm x 60cm x 60cm`,

      coffee: `${farmerName}, for your COFFEE ENTERPRISE:

2.75m x 2.75m for SL28/SL34 (1,300 trees/acre)
2m x 2m for Ruiru 11 (2,500 trees/acre)`
    };

    let answer = spacingMap[crop.toLowerCase()] ||
      `${farmerName}, for your ${crop} ENTERPRISE, follow the recommended spacing for your specific variety. Check with your local agrovet for guidance.`;

    return addBusinessFlavor(answer, farmerName);
  },

  // Pest control questions
  pest: (data, question, farmerName) => {
    const crop = data?.crops?.[0] || 'crops';
    const lowerCrop = crop.toLowerCase();
    const country = getCountryFromData(data);

    const pestAdvice: Record<string, string> = {
      maize: `${farmerName}, PROTECT YOUR MAIZE ENTERPRISE INVESTMENT:

Fall Armyworm:
• Cultural: Scout fields weekly, practice push-pull technology
• Chemical: Rocket 44EC (40ml/20L water) or Emacot 5WG (4g/20L water)

Stalk Borer:
• Cultural: Apply ash in funnel (FREE!), rotate with legumes
• Chemical: Bulldock granules (3.5g per plant)

Larger Grain Borer (Storage):
• Cultural: Dry to 13% moisture, use hermetic bags
• Chemical: Actellic Gold Dust (50g per 90kg bag)`,

      tomatoes: `${farmerName}, PROTECT YOUR TOMATO ENTERPRISE:

Whiteflies:
• Cultural: Yellow sticky traps
• Chemical: Decis 2.5EC (10ml/20L) or Confidor 200SL (10ml/20L)

American Bollworm:
• Chemical: Karate 5EC (5ml/20L)`
    };

    let answer = pestAdvice[lowerCrop] ||
      `${farmerName}, practice integrated pest management for your ${crop} ENTERPRISE: monitor regularly, use resistant varieties, conserve natural enemies, and apply pesticides only when pest levels reach economic thresholds.`;

    return addBusinessFlavor(answer, farmerName);
  },

  // Disease control questions
  disease: (data, question, farmerName) => {
    const crop = data?.crops?.[0] || 'crops';
    const lowerCrop = crop.toLowerCase();
    const country = getCountryFromData(data);

    const diseaseAdvice: Record<string, string> = {
      maize: `${farmerName}, PROTECT YOUR MAIZE ENTERPRISE:

Maize Lethal Necrosis Disease (MLND):
• Use certified seed, keep field weed-free
• Control vectors with yellow sticky traps
• Uproot and destroy infected plants

Maize streak virus:
• Use resistant varieties, control leaf hoppers

Head smut:
• Use tolerant varieties, improve soil fertility
• Remove and burn infected plants`,

      tomatoes: `${farmerName}, PROTECT YOUR TOMATO ENTERPRISE:

Late Blight:
• Spray Ridomil or Mancozeb preventatively
• Ensure good air circulation

Early Blight:
• Use resistant varieties, spray Mancozeb`
    };

    let answer = diseaseAdvice[lowerCrop] ||
      `${farmerName}, for your ${crop} ENTERPRISE, use resistant varieties, ensure good air circulation, remove infected plants, and apply fungicides preventatively during wet conditions.`;

    return addBusinessFlavor(answer, farmerName);
  },

  // Harvest questions
  harvest: (data, question, farmerName) => {
    const crop = data?.crops?.[0] || 'crops';
    const lowerCrop = crop.toLowerCase();

    const harvestAdvice: Record<string, string> = {
      maize: `${farmerName}, MAXIMIZE YOUR MAIZE ENTERPRISE RETURNS:

Harvest timing: 3-6 months after planting (when husks are brown)
Expected yield: 25-40 (90kg) bags per acre with good management

Drying: Spread on tarpaulin, dry to 13% moisture
Storage: Hermetic bags or metallic silos on raised surfaces`,

      beans: `${farmerName}, MAXIMIZE YOUR BEANS ENTERPRISE RETURNS:

Harvest when pods are dry and rattling
Sun-dry thoroughly before storage
Store in hermetic bags or clean containers`,

      tomatoes: `${farmerName}, MAXIMIZE YOUR TOMATO ENTERPRISE RETURNS:

Pick at color break (green to pink) for distant markets
Fully ripe for local markets
Handle carefully to avoid bruising`
    };

    let answer = harvestAdvice[lowerCrop] ||
      `${farmerName}, harvest your ${crop} ENTERPRISE at the right maturity for best quality. Handle carefully to reduce losses.`;

    return addBusinessFlavor(answer, farmerName);
  },

  // Water management
  water: (data, question, farmerName) => {
    let answer = `${farmerName}, here's how to MAXIMIZE your WATER INVESTMENT:

• Water early morning or late evening to reduce evaporation
• Use drip irrigation where possible to save water (saves 40% on water bills!)
• Mulch around plants to retain soil moisture (FREE!)
• During dry spells, water deeply but less frequently
• For rainfed farming, plant with the first rains
• Consider rainwater harvesting structures - pays for itself in 2 seasons!`;

    return addBusinessFlavor(answer, farmerName);
  },

  // Gross margin
  margin: (data, question, farmerName) => {
    const crop = data?.crops?.[0] || 'maize';
    const country = getCountryFromData(data);

    if (data?.grossMarginAnalysis) {
      const gm = data.grossMarginAnalysis;
      const roi = ((gm.grossMargin || 0) / (gm.totalCosts || 1) * 100).toFixed(1);

      let answer = `${farmerName}, here's the BOTTOM LINE for your ${crop.toUpperCase()} ENTERPRISE:

💰 REVENUE: ${formatCurrencyForCountry(gm.revenue || 0, country)}
📉 TOTAL COSTS: ${formatCurrencyForCountry(gm.totalCosts || 0, country)}
💵 GROSS MARGIN: ${formatCurrencyForCountry(gm.grossMargin || 0, country)}
📊 ROI: ${roi}%

${roi > 100 ? `🔥 EXCELLENT! Every ${getCurrencySymbol(country)} 1 invested returns ${(gm.revenue/gm.totalCosts).toFixed(1)}!` :
  roi > 50 ? `👍 Good, ${farmerName}! But we can do better.` :
  `⚠️ ${farmerName}, we need to improve this return!`}`;

      return addBusinessFlavor(answer, farmerName);
    }

    return `${farmerName}, here's how to calculate your GROSS MARGIN:

Gross Margin = (Yield × Price) - (Seed + Fertilizer + Labour + Transport + Bags)

Track ALL your costs to know your true profit! This is the difference between farming and running a PROFITABLE ENTERPRISE.`;
  },

  // Business advice
  business: (data, question, farmerName) => {
    const country = getCountryFromData(data);
    const currency = COUNTRY_CURRENCY_MAP[country] || COUNTRY_CURRENCY_MAP.kenya;
    const symbol = currency.symbol;

    return `${farmerName}, FARMING AS A BUSINESS - LISTEN UP! 👂

1. KNOW YOUR COSTS: Track EVERY input - seeds, fertilizer, labour, transport, bags
2. BUY IN BULK: Save 20-30% with larger packs (${symbol}2,000-${symbol}5,000 saved!)
3. FORM FARMER GROUPS: Bulk purchases, shared transport, collective marketing
4. EXPONENTIAL PHASE: Every 1 ${symbol} invested returns 3-5 ${symbol} profit!

💥 PRODUCE MORE WITH LESS, ${farmerName.toUpperCase()}!
💰 PUT MORE MONEY IN YOUR POCKET!
🚀 THIS IS YOUR BUSINESS - MAKE IT PROFITABLE!

BOTTOM LINE: You're not just farming, ${farmerName} - you're running an ENTERPRISE!`;
  },

  // Default handler
  default: (data, question, farmerName) => {
    const crop = data?.crops?.[0] || 'your crops';
    const county = data?.county || 'your area';

    return `${farmerName}, thanks for asking about "${question}".

Based on your farm data for your ${crop} ENTERPRISE in ${county}:

• Follow good agricultural practices to maximize returns
• Maintain soil fertility - it's your biggest asset
• Monitor regularly for pests and diseases (early detection saves ${getCurrencySymbol(data?.country || 'kenya')}10,000+!)
• Track ALL costs to know your true profit margin

For more specific information to grow your business, ask about: fertilizer, pests, spacing, harvest, seed rate, varieties, or gross margins.

Remember ${farmerName}, every shilling counts! 🚀`;
  }
};

// Helper to get currency symbol
function getCurrencySymbol(country: string = 'kenya'): string {
  return COUNTRY_CURRENCY_MAP[country]?.symbol || 'Ksh';
}

// Detect question category
function detectCategory(question: string): string {
  const q = question.toLowerCase();

  // Variety detection
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

  return 'default';
}

export function generateAnswer(question: string, sessionData: any): string {
  const category = detectCategory(question);
  console.log(`📋 Question category: ${category}`);

  const farmerName = getFarmerName(sessionData);
  const handler = qaTemplates[category] || qaTemplates.default;

  return handler(sessionData, question, farmerName);
}