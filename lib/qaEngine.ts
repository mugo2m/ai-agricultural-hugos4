// lib/qaEngine.ts
// 100% LOGIC-BASED Q&A ENGINE with Bungoma Farm Management Guidelines

const qaTemplates: Record<string, (data: any, question: string) => string> = {
  // Fertilizer questions
  fertilizer: (data, question) => {
    const crop = data?.crops?.[0] || 'your crops';
    const lowerCrop = crop.toLowerCase();

    if (data?.soilTest?.fertilizerPlan) {
      const plan = data.soilTest.fertilizerPlan;
      let answer = `**🌱 YOUR PRECISION FERTILIZER PLAN (Based on Soil Test):**\n\n`;

      if (plan.planting?.length > 0) {
        answer += `**PLANTING FERTILIZERS:**\n`;
        plan.planting.forEach((p: any) => {
          const bagsNeeded = Math.ceil(p.selected.amountKg / 50);
          answer += `• ${p.selected.name}: ${p.selected.amountKg}kg per acre\n`;
          answer += `  Buy: ${bagsNeeded} bag(s) of 50kg\n`;
          answer += `  Package options: ${p.selected.packageSizes?.join(", ") || "50kg bag"}\n`;
          answer += `  Cost: Ksh ${p.selected.cost?.toLocaleString()}\n`;
          answer += `  Provides: ${Object.entries(p.selected.provides).map(([k, v]) => `${v}kg ${k}`).join(', ')}\n\n`;
        });
      }

      if (plan.topdressing?.length > 0) {
        answer += `**TOPDRESSING FERTILIZERS (apply 3-4 weeks after planting):**\n`;
        plan.topdressing.forEach((t: any) => {
          const bagsNeeded = Math.ceil(t.selected.amountKg / 50);
          answer += `• ${t.selected.name}: ${t.selected.amountKg}kg per acre\n`;
          answer += `  Buy: ${bagsNeeded} bag(s) of 50kg\n`;
          answer += `  Package options: ${t.selected.packageSizes?.join(", ") || "50kg bag"}\n`;
          answer += `  Cost: Ksh ${t.selected.cost?.toLocaleString()}\n\n`;
        });
      }

      answer += `**TOTAL INVESTMENT: Ksh ${plan.totalCost?.toLocaleString()} per acre**\n`;
      answer += `**EXPECTED RETURN: 40 bags × Ksh 6,750 = Ksh 270,000**\n`;
      answer += `**GROSS MARGIN: Ksh ${(270000 - (plan.totalCost || 0)).toLocaleString()}**\n`;
      answer += `**📊 BUSINESS SUMMARY: Every Ksh 1 invested returns Ksh ${((270000 / (plan.totalCost || 1)) - 1).toFixed(1)} profit! Farming is a BUSINESS - invest wisely!**\n`;
      return answer;
    }

    // General fertilizer advice based on Bungoma guidelines
    const fertAdvice: Record<string, string> = {
      maize: "**🌽 MAIZE FERTILIZER RECOMMENDATION (Bungoma Guidelines):**\n\n**Planting:** Apply 150kg DAP per hectare (3 bags of 50kg) at planting. Cost: Ksh 9,900\n\n**Topdressing:** Apply 300kg CAN per hectare (6 bags of 50kg) 3-4 weeks after planting. Cost: Ksh 15,000\n\n**Total Investment:** Ksh 24,900/hectare (Ksh 10,000/acre)\n\n**Expected Yield:** 40 bags × Ksh 6,750 = Ksh 270,000\n\n**Gross Margin:** Ksh 245,100\n\n**ROI:** Every Ksh 1 invested returns Ksh 10 profit!\n\n**Package sizes:** DAP 50kg bag (Ksh 3,300), CAN 50kg bag (Ksh 2,500). Buy larger packs to save more!",

      beans: "**BEANS FERTILIZER RECOMMENDATION:**\n\n**Planting only:** Apply 250kg DAP per hectare (5 bags of 50kg). Cost: Ksh 16,500\n\n**Expected Yield:** 15 bags × Ksh 10,350 = Ksh 155,250\n\n**Gross Margin:** Ksh 138,750\n\n**Package sizes:** DAP 50kg bag (Ksh 3,300). Buy 5 bags and save with bulk discount!",

      tomatoes: "**🍅 TOMATOES FERTILIZER RECOMMENDATION:**\n\n**Planting:** Apply 200kg DAP per hectare (4 bags of 50kg). Cost: Ksh 13,200\n\n**Topdressing:** Apply 100kg CAN at transplanting + 200kg CAN at flowering (6 bags total). Cost: Ksh 15,000\n\n**Total Investment:** Ksh 28,200/hectare\n\n**Expected Yield:** 26,000kg × Ksh 120/kg = Ksh 3,120,000\n\n**Gross Margin:** Ksh 3,091,800\n\n**Package sizes:** DAP 50kg (Ksh 3,300), CAN 50kg (Ksh 2,500). Buy in bulk to maximize profit!"
    };

    return fertAdvice[lowerCrop] ||
      `For ${crop}, a general recommendation is to apply 150kg DAP at planting and topdress with 200kg CAN 3-4 weeks later. For precision, consider doing a soil test - it can save you up to 30% on fertilizer costs!`;
  },

  // Seed rate questions
  seed: (data, question) => {
    const crop = data?.crops?.[0] || 'your crops';
    const lowerCrop = crop.toLowerCase();

    const seedRates: Record<string, string> = {
      maize: "**🌽 MAIZE SEED RATE:** 10kg per acre (25kg per hectare). Buy certified seed from agrodealers. Cost: Ksh 180-200/kg. Package sizes: 2kg (Ksh 360), 10kg (Ksh 1,800), 25kg (Ksh 4,500). Buying 25kg bag saves 10%!",

      beans: "**BEANS SEED RATE:** 20-24kg per acre (50-60kg per hectare). Package sizes: 2kg (Ksh 300), 10kg (Ksh 1,400), 50kg (Ksh 6,500). Buy in bulk with neighbors!",

      "finger millet": "**FINGER MILLET SEED RATE:** 1.6kg per acre (4kg per hectare). Package: 2kg pack (Ksh 500).",

      sorghum: "**SORGHUM SEED RATE:** 2.8kg per acre (7kg per hectare). Package: 5kg pack (Ksh 900).",

      "soya beans": "**SOYA BEANS SEED RATE:** 16-24kg per acre (40-60kg per hectare). Package: 10kg (Ksh 800), 25kg (Ksh 1,900).",

      groundnuts: "**GROUNDNUTS SEED RATE:** 18-20kg per acre (45-50kg per hectare). Package: 10kg (Ksh 900), 25kg (Ksh 2,200).",

      tomatoes: "**🍅 TOMATOES SEED RATE:** 60-80g per acre (150-200g per hectare). Package: 10g (Ksh 500), 50g (Ksh 2,200), 100g (Ksh 4,000).",

      onions: "**ONIONS SEED RATE:** 0.7-0.8kg per acre (1.75-2kg per hectare). Package: 100g (Ksh 600), 500g (Ksh 2,800), 1kg (Ksh 5,200).",

      cabbages: "**CABBAGES SEED RATE:** 200g per acre (500g per hectare). Package: 100g (Ksh 800), 500g (Ksh 3,500)."
    };

    return seedRates[lowerCrop] ||
      `For ${crop}, use certified seed at recommended rates. Buy from certified agrodealers for quality assurance.`;
  },

  // Spacing questions
  spacing: (data, question) => {
    const crop = data?.crops?.[0] || 'crops';
    const spacingMap: Record<string, string> = {
      maize: "**🌽 MAIZE SPACING:** 75cm between rows x 25cm within rows (1 seed per hole) OR 75cm x 50cm (2 seeds per hole). Plant 5cm deep. This gives about 53,000 plants per hectare.",

      beans: "**BEANS SPACING:** 50cm x 10cm for pure stand (2 seeds per hole). For intercropping with maize, use 50cm x 15cm between maize rows.",

      "finger millet": "**FINGER MILLET SPACING:** 30cm x 15cm (drilled and thinned).",

      sorghum: "**SORGHUM SPACING:** 60cm x 15cm (drilled then thinned to 15cm intra-row).",

      "soya beans": "**SOYA BEANS SPACING:** 45cm x 10cm (3 seeds per hole, thin to 1 plant).",

      sunflower: "**SUNFLOWER SPACING:** 75cm x 30cm (2 seeds per hole, thin to 1).",

      tomatoes: "**🍅 TOMATOES SPACING:** 60-70cm x 40cm (processing), 90cm x 30cm (fresh market), or 60cm x 60cm (2 bearing stems).",

      kales: "**KALES SPACING:** 60cm x 60cm. Transplant at 4-6 leaf stage.",

      cabbages: "**CABBAGES SPACING:** 60cm x 45cm for medium heads, 75cm x 60cm for large heads.",

      onions: "**ONIONS SPACING:** 15cm x 7.5cm. Transplant when pencil-thick.",

      carrots: "**CARROTS SPACING:** Rows 25-30cm apart, thin to 3-5cm within row.",

      bananas: "**BANANAS SPACING:** 3m x 3m (short varieties), 3m x 4m (medium), 4m x 4m (tall). Hole size: 60cm x 60cm x 60cm.",

      coffee: "**COFFEE SPACING:** 2.75m x 2.75m for SL28/SL34 (1,300 trees/acre), 2m x 2m for Ruiru 11 (2,500 trees/acre).",

      cassava: "**CASSAVA SPACING:** 1m x 1m (10,000 cuttings per hectare).",

      "sweet potatoes": "**SWEET POTATOES SPACING:** 90cm x 30cm on ridges. Plant cuttings at 45° angle.",

      "irish potatoes": "**IRISH POTATOES SPACING:** 75cm x 30cm. Plant on ridges for better tuber development."
    };

    return spacingMap[crop.toLowerCase()] ||
      `For ${crop}, follow the recommended spacing for your specific variety. Generally, allow enough space for plants to grow without competing for light, water, and nutrients.`;
  },

  // Pest control questions
  pest: (data, question) => {
    const crop = data?.crops?.[0] || 'crops';
    const lowerCrop = crop.toLowerCase();

    const pestAdvice: Record<string, string> = {
      maize: `**🌽 MAIZE PEST CONTROL (Integrated Pest Management):**

**Fall Armyworm:**
• Cultural: Scout fields twice weekly, practice push-pull technology, conserve natural enemies
• Chemical:
  - Rocket 44EC (40ml/20L water): 100ml (Ksh 350) covers 0.5 acre, 250ml (Ksh 800) covers 1.25 acres, 500ml (Ksh 1,500) covers 2.5 acres
  - Emacot 5WG (4g/20L water): 10g (Ksh 250) covers 0.5 acre, 20g (Ksh 480) covers 1 acre
• Business: Early detection saves Ksh 5,000+ per acre!

**Stalk Borer:**
• Cultural: Apply ash in funnel (FREE!), rotate with legumes, push-pull technology
• Chemical: Bulldock granules (3.5g/plant): 500g (Ksh 600) covers 1 acre

**Larger Grain Borer (Osama):**
• Cultural: Dry to 13% moisture, use hermetic bags
• Chemical: Actellic Gold Dust (50g/90kg bag): 100g (Ksh 150) treats 2 bags
• Hermetic bags: Ksh 250 each (protects Ksh 6,750 grain = 2,600% ROI!)`,

      tomatoes: `**🍅 TOMATOES PEST CONTROL:**

**Whiteflies:**
• Cultural: Yellow sticky traps (Ksh 50 each)
• Chemical:
  - Decis 2.5EC (10ml/20L): 100ml (Ksh 400) covers 1 acre
  - Confidor 200SL (10ml/20L): 100ml (Ksh 450) covers 1 acre

**American Bollworm:**
• Chemical: Karate 5EC (5ml/20L): 100ml (Ksh 400) covers 2 acres

**BUSINESS TIP:** Combine methods = fewer sprays = more profit!`
    };

    return pestAdvice[lowerCrop] ||
      `For ${crop}, practice integrated pest management: monitor regularly, use resistant varieties, conserve natural enemies, and apply recommended pesticides only when pest levels reach economic thresholds. Always check package sizes - buying 500ml saves 20% compared to 100ml!`;
  },

  // Gross margin questions
  margin: (data, question) => {
    const crop = data?.crops?.[0] || 'maize';
    const lowerCrop = crop.toLowerCase();

    const margins: Record<string, string> = {
      maize: `**🌽 MAIZE GROSS MARGIN ANALYSIS (per hectare - Bungoma Guidelines):**

**LOW MANAGEMENT:**
• Yield: 10 bags × Ksh 6,750 = Ksh 67,500
• Costs: Ksh 23,310
• GROSS MARGIN: Ksh 44,190

**MEDIUM MANAGEMENT:**
• Yield: 40 bags × Ksh 6,750 = Ksh 270,000
• Costs: Ksh 52,290
• GROSS MARGIN: Ksh 217,710

**HIGH MANAGEMENT:**
• Yield: 75 bags × Ksh 6,750 = Ksh 506,250
• Costs: Ksh 72,570
• GROSS MARGIN: Ksh 433,680

**📊 BUSINESS SUMMARY:**
• Moving from Low to Medium: +Ksh 173,520 profit (393% increase!)
• Moving from Medium to High: +Ksh 215,970 profit (99% increase!)
• Every Ksh 1 invested at Medium level returns Ksh 4.16 profit!

**Your current level: ${data?.managementLevel || "Medium"}**`,

      beans: `**BEANS GROSS MARGIN ANALYSIS (per hectare):**

**LOW MANAGEMENT:**
• Yield: 5 bags × Ksh 10,350 = Ksh 51,750
• Costs: Ksh 24,840
• GROSS MARGIN: Ksh 26,910

**MEDIUM MANAGEMENT:**
• Yield: 10 bags × Ksh 10,350 = Ksh 103,500
• Costs: Ksh 31,980
• GROSS MARGIN: Ksh 71,520

**HIGH MANAGEMENT:**
• Yield: 15 bags × Ksh 10,350 = Ksh 155,250
• Costs: Ksh 35,100
• GROSS MARGIN: Ksh 120,150`
    };

    return margins[lowerCrop] ||
      `For ${crop}, track all your costs (seeds, fertilizer, labour, transport, bags) and revenue to calculate your gross margin. Farming is a BUSINESS - know your numbers!`;
  },

  // Business advice
  business: (data, question) => {
    return `**📊 FARMING AS A BUSINESS - KEY PRINCIPLES:**

**1. KNOW YOUR COSTS:**
• Track EVERY input: seeds, fertilizer, labour, transport, bags
• Example maize: Total costs Ksh 52,290/hectare at medium management

**2. KNOW YOUR RETURNS:**
• Maize: 40 bags × Ksh 6,750 = Ksh 270,000
• Gross Margin: Ksh 217,710

**3. ROI CALCULATION:**
• Every Ksh 1 invested returns Ksh 4.16 profit!
• That's 416% return on investment!

**4. OPTIMIZE INPUTS:**
• Buy in bulk: 500ml pesticide pack saves 20% vs 100ml
• Share transport with neighbors - save Ksh 500/acre
• Form farmer groups for bulk discounts

**5. WE'RE STILL IN EXPONENTIAL PHASE:**
• Every additional Ksh 1 input still returns Ksh 3-5 profit
• We haven't reached diminishing returns yet!
• Keep investing - more inputs = more profits!

**👉 BOTTOM LINE: Farming is a BUSINESS. Make every shilling work for you!**`;
  },

  // Default handler
  default: (data, question) => {
    return `Thank you for your question about "${question}". Based on Bungoma Farm Management Guidelines for ${data?.crops?.[0] || 'your crops'} in ${data?.county || 'your area'}, I recommend:

• Follow good agricultural practices for your specific crop
• Maintain soil fertility with manure and appropriate fertilizers
• Monitor regularly for pests and diseases using IPM
• Track ALL costs to know your true profit margin

**Remember: Farming is a BUSINESS. Every input should maximize your PROFIT while minimizing COSTS. We're here to help you PRODUCE MORE with LESS, putting MORE MONEY in your pocket!**

For more specific information, please ask about a particular topic (fertilizer, pests, spacing, harvest, seed rate, gross margins, etc.).`;
  }
};

// Detect question category
function detectCategory(question: string): string {
  const q = question.toLowerCase();

  if (q.includes('fertilizer') || q.includes('dap') || q.includes('can') || q.includes('npk') || q.includes('manure') || q.includes('topdress')) {
    return 'fertilizer';
  }
  if (q.includes('seed rate') || q.includes('how many kg') || q.includes('planting material')) {
    return 'seed';
  }
  if (q.includes('spacing') || q.includes('distance') || q.includes('how far') || q.includes('planting distance')) {
    return 'spacing';
  }
  if (q.includes('pest') || q.includes('insect') || q.includes('worm') || q.includes('armyworm') || q.includes('borer') || q.includes('osama')) {
    return 'pest';
  }
  if (q.includes('disease') || q.includes('blight') || q.includes('rust') || q.includes('virus') || q.includes('mlnd') || q.includes('smut')) {
    return 'disease';
  }
  if (q.includes('harvest') || q.includes('when to pick') || q.includes('maturity')) {
    return 'harvest';
  }
  if (q.includes('gross margin') || q.includes('profit') || q.includes('revenue') || q.includes('cost') || q.includes('roi')) {
    return 'margin';
  }
  if (q.includes('business') || q.includes('money') || q.includes('invest') || q.includes('return')) {
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