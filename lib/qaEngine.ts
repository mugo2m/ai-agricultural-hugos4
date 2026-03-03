// lib/qaEngine.ts
// 100% LOGIC-BASED Q&A ENGINE

const qaTemplates: Record<string, (data: any, question: string) => string> = {
  // Fertilizer questions
  fertilizer: (data, question) => {
    const crop = data?.crops?.[0] || 'your crops';

    if (data?.soilTest?.fertilizerPlan) {
      const plan = data.soilTest.fertilizerPlan;
      let answer = `**Based on your soil test, here's your precision fertilizer plan:**\n\n`;

      if (plan.planting?.length > 0) {
        answer += `🌱 **PLANTING FERTILIZERS:**\n`;
        plan.planting.forEach((p: any) => {
          answer += `• ${p.selected.name}: ${p.selected.amountKg}kg per acre\n`;
          answer += `  Cost: Ksh ${p.selected.cost?.toLocaleString()}\n`;
          answer += `  Provides: ${Object.entries(p.selected.provides).map(([k, v]) => `${v}kg ${k}`).join(', ')}\n\n`;
        });
      }

      if (plan.topdressing?.length > 0) {
        answer += `🌾 **TOPDRESSING FERTILIZERS (apply 3-4 weeks after planting):**\n`;
        plan.topdressing.forEach((t: any) => {
          answer += `• ${t.selected.name}: ${t.selected.amountKg}kg per acre\n`;
          answer += `  Cost: Ksh ${t.selected.cost?.toLocaleString()}\n\n`;
        });
      }

      answer += `**Total investment: Ksh ${plan.totalCost?.toLocaleString()} per acre**\n`;
      return answer;
    }

    // General fertilizer advice
    const fertAdvice: Record<string, string> = {
      maize: "For maize without soil test: Apply 50kg DAP per acre at planting. Topdress with 50kg CAN or 25kg UREA 3-4 weeks after planting. Add 5 tons manure for best results.",
      beans: "For beans: Apply 50kg DAP per acre at planting. Beans fix their own nitrogen, so topdressing is usually not needed.",
      coffee: "For coffee: Apply 100kg NPK 17-17-17 per acre twice yearly (start and mid-rains). Topdress with 100kg CAN during rainy seasons.",
      tomatoes: "For tomatoes: Apply 100kg DAP at planting. After flowering, apply 100kg CAN. Use foliar feeds for micronutrients.",
      potatoes: "For potatoes: Apply 150kg DAP at planting. After 4-6 weeks, topdress with 100kg CAN."
    };

    return fertAdvice[crop.toLowerCase()] ||
      `For ${crop}, a general recommendation is to apply 50kg DAP at planting and topdress with 50kg CAN 3-4 weeks later. For precision, consider doing a soil test.`;
  },

  // Pest control questions
  pest: (data, question) => {
    const crop = data?.crops?.[0] || 'crops';
    const pestAdvice: Record<string, string> = {
      maize: "**Maize pest control:**\n\n• **Fall armyworm:** Scout early, spray Emamectin benzoate or use neem-based products. Conserve natural enemies.\n• **Stalk borer:** Apply Bulldock granules in plant funnel. Practice crop rotation.\n• **Cutworms:** Spray soil surface with Karate along crop rows at planting.",

      beans: "**Bean pest control:**\n\n• **Bean fly:** Plant early, use certified seed, spray with Diazinon if severe.\n• **Aphids:** Use Dimethoate or neem spray. Conserve ladybirds.\n• **Thrips:** Spray with appropriate insecticide when flowering.",

      coffee: "**Coffee pest control:**\n\n• **Coffee berry borer:** Regular harvesting, trap trees, spray Duduthrin only when necessary.\n• **Leaf miners:** Monitor and spray if severe.\n• **Scales:** Use recommended insecticides, prune affected branches.",

      tomatoes: "**Tomato pest control:**\n\n• **Whiteflies:** Use yellow sticky traps, spray Decis or Confidor if populations high.\n• **Tomato borer:** Monitor regularly, spray Duduthrin at first sign.\n• **Aphids:** Use Dimethoate or neem spray."
    };

    return pestAdvice[crop.toLowerCase()] ||
      `For ${crop}, practice integrated pest management: monitor regularly, use resistant varieties, conserve natural enemies, and apply recommended pesticides only when pest levels reach economic thresholds.`;
  },

  // Disease control questions
  disease: (data, question) => {
    const crop = data?.crops?.[0] || 'crops';
    const diseaseAdvice: Record<string, string> = {
      maize: "**Maize disease control:**\n\n• **Maize streak virus:** Use resistant varieties. Control leaf hoppers. Rogue out infected plants.\n• **Rust:** Apply fungicides preventatively. Use resistant varieties.\n• **Blight:** Spray with Mancozeb. Ensure good air circulation.",

      beans: "**Bean disease control:**\n\n• **Anthracnose:** Use disease-free seed. Apply fungicides. Practice crop rotation.\n• **Rust:** Use resistant varieties. Apply fungicides when necessary.\n• **Angular leaf spot:** Practice crop rotation. Use clean seed.",

      coffee: "**Coffee disease control:**\n\n• **Leaf rust:** Spray copper-based fungicides preventatively during wet season.\n• **CBD (Coffee Berry Disease):** Spray Daconil or Delan 3-4 times per season.\n• **Prune for air circulation and remove infected berries.**",

      tomatoes: "**Tomato disease control:**\n\n• **Late blight:** Spray Ridomil or Mancozeb preventatively every 7-10 days in wet weather.\n• **Early blight:** Use resistant varieties, spray Mancozeb.\n• **Bacterial wilt:** Practice crop rotation, use resistant varieties."
    };

    return diseaseAdvice[crop.toLowerCase()] ||
      `For ${crop}, practice integrated disease management: use resistant varieties, ensure good air circulation through proper spacing, remove infected plants, and apply fungicides preventatively during wet conditions.`;
  },

  // Spacing questions
  spacing: (data, question) => {
    const crop = data?.crops?.[0] || 'crops';
    const spacingMap: Record<string, string> = {
      maize: "**Maize spacing:** 75cm x 25cm (1 seed/hole) or 75cm x 50cm (2 seeds/hole). This gives about 53,000 plants per hectare or 21,000 plants per acre.",
      beans: "**Bean spacing:** 50cm x 10cm for pure stand (2 seeds/hole). For intercropping with maize, use 50cm x 15cm.",
      coffee: "**Coffee spacing:** 2.75m x 2.75m. This gives about 1,300 trees per acre.",
      bananas: "**Banana spacing:** 3m x 3m. This gives about 450 suckers per acre.",
      potatoes: "**Potato spacing:** 75cm x 30cm. Plant on ridges for better tuber development.",
      tomatoes: "**Tomato spacing:** 60cm x 45cm for determinate varieties, 60cm x 60cm for indeterminate varieties (need staking).",
      cabbage: "**Cabbage spacing:** 60cm x 45cm for medium heads, 75cm x 60cm for large heads.",
      onions: "**Onion spacing:** 30cm x 10cm. Transplant when seedlings are pencil-thick."
    };

    return spacingMap[crop.toLowerCase()] ||
      `For ${crop}, follow the recommended spacing for your specific variety. Generally, allow enough space for plants to grow without competing for light, water, and nutrients.`;
  },

  // Harvest questions
  harvest: (data, question) => {
    const crop = data?.crops?.[0] || 'crops';
    const harvestAdvice: Record<string, string> = {
      maize: "**Maize harvest:** Harvest when cobs are dry and husks are brown. Grain moisture should be 13-15%. Dry to 12-13% for storage. Store in hermetic bags to prevent weevil damage.",
      beans: "**Bean harvest:** Harvest when pods are dry and rattling. Sun-dry thoroughly before storage. Thresh carefully to avoid splitting.",
      coffee: "**Coffee harvest:** Pick only ripe red cherries. Process within 24 hours. Sun-dry on raised beds until moisture content is 10-12%.",
      bananas: "**Banana harvest:** Harvest when fingers are full and ribs are less angular. Cut bunches carefully to avoid bruising.",
      tomatoes: "**Tomato harvest:** Pick at color break (green to pink) for distant markets, fully ripe for local markets."
    };

    return harvestAdvice[crop.toLowerCase()] ||
      `Harvest ${crop} at the right maturity for best quality. Handle carefully to reduce losses, and store in clean, dry conditions.`;
  },

  // Watering questions
  water: (data, question) => {
    return `**Water management tips:**\n\n• Water early morning or late evening to reduce evaporation\n• Use drip irrigation where possible to save water\n• Mulch around plants to retain soil moisture\n• During dry spells, water deeply but less frequently to encourage deep roots\n• For rainfed farming, plant with the first rains and use water conservation techniques like terracing and contour farming.`;
  },

  // Default handler
  default: (data, question) => {
    return `Thank you for your question about "${question}". Based on your farm data for ${data?.crops?.[0] || 'your crops'} in ${data?.county || 'your area'}, I recommend:\n\n• Follow good agricultural practices for your specific crop\n• Maintain soil fertility with manure and appropriate fertilizers\n• Monitor regularly for pests and diseases\n• Practice crop rotation and soil conservation\n\nFor more specific information, please ask about a particular topic (fertilizer, pests, spacing, harvest, etc.).`;
  }
};

// Detect question category
function detectCategory(question: string): string {
  const q = question.toLowerCase();

  if (q.includes('fertilizer') || q.includes('dap') || q.includes('can') || q.includes('npk') || q.includes('manure')) {
    return 'fertilizer';
  }
  if (q.includes('pest') || q.includes('insect') || q.includes('worm') || q.includes('armyworm') || q.includes('borer')) {
    return 'pest';
  }
  if (q.includes('disease') || q.includes('blight') || q.includes('rust') || q.includes('virus') || q.includes('fungus')) {
    return 'disease';
  }
  if (q.includes('spacing') || q.includes('distance') || q.includes('how far') || q.includes('planting distance')) {
    return 'spacing';
  }
  if (q.includes('harvest') || q.includes('when to pick') || q.includes('maturity')) {
    return 'harvest';
  }
  if (q.includes('water') || q.includes('irrigation') || q.includes('drought')) {
    return 'water';
  }

  return 'default';
}

export function generateAnswer(question: string, sessionData: any): string {
  const category = detectCategory(question);
  console.log(`📋 Question category: ${category}`);

  const handler = qaTemplates[category] || qaTemplates.default;
  return handler(sessionData, question);
}