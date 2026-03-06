// lib/qaEngine.ts
// 100% LOGIC-BASED Q&A ENGINE - CLEAN VERSION

const qaTemplates: Record<string, (data: any, question: string) => string> = {
  // ========== VARIETIES QUESTIONS ==========
  varieties: (data, question) => {
    const crop = data?.crops?.[0] || 'your crops';
    const lowerCrop = crop.toLowerCase();
    const county = data?.county || 'your area';

    const varietyMap: Record<string, string> = {
      maize: `MAIZE VARIETIES FOR ${county.toUpperCase()}:

• H614: High yielding, 4-6 months, resistant to lodging
• H629: Drought tolerant, 3-4 months, good for medium altitudes
• H6213: High protein, 4-5 months, excellent for milling
• PHB 3253: Hybrid, 3-4 months, very high yield potential
• WH505: White grain, 4-5 months, resistant to MSV
• DK 777: Drought tolerant, 3-4 months, consistent performance

Local varieties also available at your agrovet.`,

      beans: `BEANS VARIETIES FOR ${county.toUpperCase()}:

• Rosecoco: Popular, good taste, 3-4 months
• Canadian Wonder: High yielding, 3 months
• KK15: Drought tolerant, 2-3 months
• Nyota: Disease resistant, 3 months
• Mwitemania: Early maturity, 2-3 months
• Chelalang: High protein, 3 months`,

      sorghum: `SORGHUM VARIETIES FOR ${county.toUpperCase()}:

• Seredo: High yielding, 3-4 months
• Serena: Drought tolerant, 3 months
• Gadam: Bird resistant, 4 months`,

      "finger millet": `FINGER MILLET VARIETIES:

• Local varieties: Traditional, well-adapted
• Serere: Improved, high yield
• Gulu: Early maturing`,

      coffee: `COFFEE VARIETIES FOR ${county.toUpperCase()}:

• SL 28: High quality, drought resistant
• SL 34: Good cup quality, high yield
• Ruiru 11: Disease resistant, compact
• Batian: High yield, CBD resistant
• K7: Rust resistant, good for lower altitudes`,

      tomatoes: `TOMATO VARIETIES:

• Fortune Maker: Large fruits, disease resistant
• Money Maker: Continuous cropping, reliable
• Rio Grande: Oval shape, good for processing
• Anna F1: Hybrid, very high yield
• Onyx: Firm fruits, good for transport`,

      potatoes: `POTATO VARIETIES:

• Shangi: Popular, early maturity (3 months)
• Unica: Drought tolerant, disease resistant
• Tigoni: High yielding, good quality
• Desiree: Red skin, good for crisps
• Kenya Baraka: Late blight resistant`,

      onions: `ONION VARIETIES:

• Red Creole: Red bulbs, good storage
• Bombay Red: Dark red, pungent flavor
• Texas Grano: Large bulbs, mild flavor
• Tropicana: Heat tolerant, high yield`,

      cabbages: `CABBAGE VARIETIES:

• Copenhagen Market: Early maturing, round heads
• Gloria F1: Hybrid, disease resistant
• Pruktor: Large heads, good storage
• Sugarloaf: Pointed heads, sweet flavor`,

      bananas: `BANANA VARIETIES:

• Giant Cavendish: Commercial variety
• Williams: Sweet, good for dessert
• FHIA 17: Disease resistant, cooking banana
• Local varieties: Well adapted to your area`,

      groundnuts: `GROUNDNUT VARIETIES:

• Homa Bay: Spreader type, high yield
• Uganda Red: Bunch type, early maturity
• Local varieties: Well adapted`,
    };

    if (varietyMap[lowerCrop]) {
      return varietyMap[lowerCrop];
    }

    return `For ${crop}, recommended varieties include improved hybrids and local landraces adapted to ${county}. Visit your local agrovet for seeds suitable for your specific area.`;
  },

  // Fertilizer questions
  fertilizer: (data, question) => {
    const crop = data?.crops?.[0] || 'your crops';
    const lowerCrop = crop.toLowerCase();

    if (data?.soilTest?.fertilizerPlan) {
      const plan = data.soilTest.fertilizerPlan;
      let answer = `PRECISION FERTILIZER PLAN (Based on Your Soil Test):\n\n`;

      if (plan.planting?.length > 0) {
        answer += `PLANTING FERTILIZERS:\n`;
        plan.planting.forEach((p: any) => {
          const bagsNeeded = Math.ceil(p.selected.amountKg / 50);
          answer += `• ${p.selected.name}: ${p.selected.amountKg}kg per acre\n`;
          answer += `  Buy: ${bagsNeeded} bag(s) of 50kg\n`;
          answer += `  Cost: Ksh ${p.selected.cost?.toLocaleString()}\n`;
          answer += `  Provides: ${Object.entries(p.selected.provides).map(([k, v]) => `${v}kg ${k}`).join(', ')}\n\n`;
        });
      }

      if (plan.topdressing?.length > 0) {
        answer += `TOPDRESSING FERTILIZERS (apply 3-4 weeks after planting):\n`;
        plan.topdressing.forEach((t: any) => {
          const bagsNeeded = Math.ceil(t.selected.amountKg / 50);
          answer += `• ${t.selected.name}: ${t.selected.amountKg}kg per acre\n`;
          answer += `  Buy: ${bagsNeeded} bag(s) of 50kg\n`;
          answer += `  Cost: Ksh ${t.selected.cost?.toLocaleString()}\n\n`;
        });
      }

      answer += `TOTAL INVESTMENT: Ksh ${plan.totalCost?.toLocaleString()} per acre`;
      return answer;
    }

    const fertAdvice: Record<string, string> = {
      maize: `MAIZE FERTILIZER RECOMMENDATION:

Planting: Apply 50kg DAP per acre at planting (1 bag of 50kg)
Topdressing: Apply 50kg CAN or 25kg UREA per acre 3-4 weeks after planting
Add 2.5 tons manure per acre for best results

Expected yield: 25-40 bags per acre with good management`,

      beans: `BEANS FERTILIZER RECOMMENDATION:

Planting only: Apply 50kg DAP per acre at planting
No topdressing needed - beans fix their own nitrogen
Add manure for better yields`,

      tomatoes: `TOMATOES FERTILIZER RECOMMENDATION:

Planting: Apply 100kg DAP per acre at planting
Topdressing 1: 50kg CAN at transplanting
Topdressing 2: 100kg CAN at flowering
Use foliar feeds for micronutrients`
    };

    return fertAdvice[lowerCrop] ||
      `For ${crop}, general recommendation is to apply 50kg DAP at planting and topdress with 50kg CAN 3-4 weeks later. Consider a soil test for precision recommendations.`;
  },

  // Seed rate questions
  seed: (data, question) => {
    const crop = data?.crops?.[0] || 'your crops';
    const lowerCrop = crop.toLowerCase();

    const seedRates: Record<string, string> = {
      maize: `MAIZE SEED RATE:

10kg per acre (25kg per hectare)
Buy certified seed from agrodealers
Cost: Ksh 180-200 per kg`,

      beans: `BEANS SEED RATE:

20-24kg per acre (50-60kg per hectare)
Certified seed recommended`,

      "finger millet": `FINGER MILLET SEED RATE:

1.6kg per acre (4kg per hectare)`,

      sorghum: `SORGHUM SEED RATE:

2.8kg per acre (7kg per hectare)`,

      tomatoes: `TOMATOES SEED RATE:

60-80g per acre (150-200g per hectare) for nursery`,

      onions: `ONIONS SEED RATE:

0.7-0.8kg per acre (1.75-2kg per hectare) for nursery`
    };

    return seedRates[lowerCrop] ||
      `For ${crop}, use certified seed at recommended rates from your local agrovet.`;
  },

  // Spacing questions
  spacing: (data, question) => {
    const crop = data?.crops?.[0] || 'crops';
    const spacingMap: Record<string, string> = {
      maize: `MAIZE SPACING:

75cm between rows x 25cm within rows (1 seed per hole)
OR 75cm x 50cm (2 seeds per hole)
Plant 5cm deep
This gives about 53,000 plants per hectare`,

      beans: `BEANS SPACING:

50cm x 10cm for pure stand (2 seeds per hole)
For intercropping with maize, use 50cm x 15cm between maize rows`,

      sorghum: `SORGHUM SPACING:

60cm x 15cm (drilled then thinned to 15cm intra-row)`,

      tomatoes: `TOMATOES SPACING:

60-70cm x 40cm (processing)
90cm x 30cm (fresh market)
60cm x 60cm (2 bearing stems)`,

      cabbages: `CABBAGES SPACING:

60cm x 45cm for medium heads
75cm x 60cm for large heads`,

      onions: `ONIONS SPACING:

15cm x 7.5cm. Transplant when pencil-thick`,

      bananas: `BANANAS SPACING:

3m x 3m (short varieties)
3m x 4m (medium)
4m x 4m (tall)
Hole size: 60cm x 60cm x 60cm`,

      coffee: `COFFEE SPACING:

2.75m x 2.75m for SL28/SL34 (1,300 trees/acre)
2m x 2m for Ruiru 11 (2,500 trees/acre)`
    };

    return spacingMap[crop.toLowerCase()] ||
      `For ${crop}, follow the recommended spacing for your specific variety. Check with your local agrovet for guidance.`;
  },

  // Pest control questions
  pest: (data, question) => {
    const crop = data?.crops?.[0] || 'crops';
    const lowerCrop = crop.toLowerCase();

    const pestAdvice: Record<string, string> = {
      maize: `MAIZE PEST CONTROL:

Fall Armyworm:
• Cultural: Scout fields weekly, practice push-pull technology
• Chemical: Rocket 44EC (40ml/20L water) or Emacot 5WG (4g/20L water)

Stalk Borer:
• Cultural: Apply ash in funnel (FREE!), rotate with legumes
• Chemical: Bulldock granules (3.5g per plant)

Larger Grain Borer (Storage):
• Cultural: Dry to 13% moisture, use hermetic bags
• Chemical: Actellic Gold Dust (50g per 90kg bag)`,

      tomatoes: `TOMATO PEST CONTROL:

Whiteflies:
• Cultural: Yellow sticky traps
• Chemical: Decis 2.5EC (10ml/20L) or Confidor 200SL (10ml/20L)

American Bollworm:
• Chemical: Karate 5EC (5ml/20L)`
    };

    return pestAdvice[lowerCrop] ||
      `For ${crop}, practice integrated pest management: monitor regularly, use resistant varieties, conserve natural enemies, and apply pesticides only when pest levels reach economic thresholds.`;
  },

  // Disease control questions
  disease: (data, question) => {
    const crop = data?.crops?.[0] || 'crops';
    const lowerCrop = crop.toLowerCase();

    const diseaseAdvice: Record<string, string> = {
      maize: `MAIZE DISEASE CONTROL:

Maize Lethal Necrosis Disease (MLND):
• Use certified seed, keep field weed-free
• Control vectors with yellow sticky traps
• Uproot and destroy infected plants

Maize streak virus:
• Use resistant varieties, control leaf hoppers

Head smut:
• Use tolerant varieties, improve soil fertility
• Remove and burn infected plants`,

      tomatoes: `TOMATO DISEASE CONTROL:

Late Blight:
• Spray Ridomil or Mancozeb preventatively
• Ensure good air circulation

Early Blight:
• Use resistant varieties, spray Mancozeb`
    };

    return diseaseAdvice[lowerCrop] ||
      `For ${crop}, use resistant varieties, ensure good air circulation, remove infected plants, and apply fungicides preventatively during wet conditions.`;
  },

  // Harvest questions
  harvest: (data, question) => {
    const crop = data?.crops?.[0] || 'crops';
    const lowerCrop = crop.toLowerCase();

    const harvestAdvice: Record<string, string> = {
      maize: `MAIZE HARVEST:

Harvest timing: 3-6 months after planting (when husks are brown)
Expected yield: 25-40 (90kg) bags per acre with good management

Drying: Spread on tarpaulin, dry to 13% moisture
Storage: Hermetic bags or metallic silos on raised surfaces`,

      beans: `BEANS HARVEST:

Harvest when pods are dry and rattling
Sun-dry thoroughly before storage
Store in hermetic bags or clean containers`,

      tomatoes: `TOMATOES HARVEST:

Pick at color break (green to pink) for distant markets
Fully ripe for local markets
Handle carefully to avoid bruising`
    };

    return harvestAdvice[lowerCrop] ||
      `Harvest ${crop} at the right maturity for best quality. Handle carefully to reduce losses.`;
  },

  // Water management
  water: (data, question) => {
    return `WATER MANAGEMENT TIPS:

• Water early morning or late evening to reduce evaporation
• Use drip irrigation where possible to save water
• Mulch around plants to retain soil moisture
• During dry spells, water deeply but less frequently
• For rainfed farming, plant with the first rains
• Consider rainwater harvesting structures`;
  },

  // Gross margin
  margin: (data, question) => {
    const crop = data?.crops?.[0] || 'maize';

    if (data?.grossMarginAnalysis) {
      const gm = data.grossMarginAnalysis;
      return `YOUR GROSS MARGIN FOR ${crop.toUpperCase()}:

Revenue: Ksh ${(gm.revenue || 0).toLocaleString()}
Total Costs: Ksh ${(gm.totalCosts || 0).toLocaleString()}
GROSS MARGIN: Ksh ${(gm.grossMargin || 0).toLocaleString()}
ROI: ${((gm.grossMargin || 0) / (gm.totalCosts || 1) * 100).toFixed(1)}%`;
    }

    return `GROSS MARGIN CALCULATION:

Gross Margin = (Yield × Price) - (Seed + Fertilizer + Labour + Transport + Bags)

Track ALL your costs to know your true profit!`;
  },

  // Business advice
  business: (data, question) => {
    return `FARMING AS A BUSINESS:

1. KNOW YOUR COSTS: Track EVERY input
2. BUY IN BULK: Save 20-30% with larger packs
3. FORM FARMER GROUPS: Bulk purchases, shared transport
4. EXPONENTIAL PHASE: Every Ksh 1 invested returns Ksh 3-5 profit!

BOTTOM LINE: Farming is a BUSINESS. Make every shilling work for you!`;
  },

  // Default handler
  default: (data, question) => {
    const crop = data?.crops?.[0] || 'your crops';
    const county = data?.county || 'your area';

    return `Thank you for your question about "${question}".

Based on your farm data for ${crop} in ${county}:

• Follow good agricultural practices for your crop
• Maintain soil fertility with manure and fertilizers
• Monitor regularly for pests and diseases
• Track ALL costs to know your true profit margin

For more specific information, ask about: fertilizer, pests, spacing, harvest, seed rate, varieties, or gross margins.`;
  }
};

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

  const handler = qaTemplates[category] || qaTemplates.default;
  return handler(sessionData, question);
}