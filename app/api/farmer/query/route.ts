// app/api/farmer/query/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/firebase/admin';
import { generateAnswer as generateStructuredAnswer } from '@/lib/qaEngine';

// ✅ GET handler for testing
export async function GET() {
  return NextResponse.json({
    message: "Farmer query API is working. Use POST to send questions.",
    status: "online",
    timestamp: new DateTime().toISOString(),
    supportedCategories: [
      "varieties", "fertilizer", "nutrients", "damage", "seed", "spacing",
      "pest", "disease", "harvest", "water", "margin", "business", "planting"
    ]
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { question, userId, sessionId, sessionData } = body;

    console.log("📝 Farmer query received:", { question, userId, sessionId });

    // Validate required fields
    if (!question || !userId || !sessionId) {
      return NextResponse.json({
        success: false,
        error: "Missing required fields"
      }, { status: 400 });
    }

    // Determine question category for analytics
    const category = detectCategory(question);

    // Save query to Firebase
    try {
      const queryRef = db.collection("farmer_sessions")
        .doc(sessionId)
        .collection("queries")
        .doc();

      await queryRef.set({
        id: queryRef.id,
        question,
        category,
        timestamp: new Date().toISOString(),
        userId,
        sessionData: sessionData || null
      });

      // Update session query count
      await db.collection("farmer_sessions")
        .doc(sessionId)
        .update({
          queryCount: FieldValue.increment(1),
          lastQueryAt: new Date().toISOString()
        });

    } catch (dbError) {
      console.error("Failed to save query to Firebase:", dbError);
      // Continue even if save fails - don't block the user
    }

    // Generate answer using the enhanced QA engine
    const answer = generateStructuredAnswer(question, sessionData);

    return NextResponse.json({
      success: true,
      answer,
      category
    });

  } catch (error) {
    console.error("❌ API error:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to process request"
    }, { status: 500 });
  }
}

// Helper function to detect question category
function detectCategory(question: string): string {
  const q = question.toLowerCase();

  if (q.includes('variet') || q.includes('varity') ||
      q.includes('which type') || q.includes('what type of seed')) {
    return 'varieties';
  }

  if (q.includes('fertilizer') || q.includes('dap') || q.includes('can') ||
      q.includes('npk') || q.includes('manure') || q.includes('topdress')) {
    return 'fertilizer';
  }

  // NEW: Nutrient detection
  if (q.includes('nutrient') || q.includes('what nutrients') ||
      q.includes('n p k') || q.includes('what does my fertilizer contain') ||
      q.includes('fertilizer composition') || q.includes('secondary nutrients') ||
      q.includes('sulfur') || q.includes('calcium') || q.includes('magnesium') ||
      q.includes('zinc') || q.includes('boron') || q.includes('micronutrient')) {
    return 'nutrients';
  }

  // NEW: Damage detection
  if (q.includes('damage') || q.includes('plants damaged') ||
      q.includes('lost plants') || q.includes('plants died') ||
      q.includes('beyond recovery') || q.includes('crop loss')) {
    return 'damage';
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

  if (q.includes('plant') || q.includes('when to plant') || q.includes('planting time') ||
      q.includes('sow') || q.includes('sowing') || q.includes('best time to plant')) {
    return 'planting';
  }

  return 'default';
}

// Legacy answer generators (kept for backward compatibility)
function generateFinancialAnswer(sessionData: any): string {
  const crop = sessionData?.crops?.[0] || 'your crop';
  const profit = sessionData?.grossMarginAnalysis?.medium?.gm || 'significant';

  return `Based on your farm data, your ${crop} enterprise shows a profit of ${profit}. To maximize returns: 1) Track all input costs 2) Buy inputs in bulk with other farmers 3) Consider moving from Medium to High management for 26% more profit. Every shilling saved is profit in your pocket!`;
}

function generatePestAnswer(sessionData: any): string {
  const pests = sessionData?.commonPests || sessionData?.pests || ['pests'];
  const pestList = Array.isArray(pests) ? pests.join(', ') : pests;

  return `For ${pestList}, I recommend Integrated Pest Management: 1) Monitor fields weekly 2) Use traps and beneficial insects 3) Apply recommended pesticides only when thresholds are met. Early detection saves up to 60% of yield!`;
}

function generateDiseaseAnswer(sessionData: any): string {
  const diseases = sessionData?.commonDiseases || sessionData?.diseases || ['diseases'];
  const diseaseList = Array.isArray(diseases) ? diseases.join(', ') : diseases;

  return `For ${diseaseList}, prevention is cheaper than cure: 1) Use resistant varieties 2) Ensure proper spacing for air circulation 3) Apply copper-based fungicides preventatively during wet season. Without control, yield losses can reach 70%!`;
}

function generateFertilizerAnswer(sessionData: any): string {
  const crop = sessionData?.crops?.[0] || 'your crop';

  // Check if we have fertilizer plan with nutrients
  const fertilizerPlan = sessionData?.soilTest?.fertilizerPlan;
  if (fertilizerPlan) {
    const plantingRecs = fertilizerPlan.plantingRecommendations || [];
    const topdressingRecs = fertilizerPlan.topDressingRecommendations || [];

    let nutrientInfo = '';
    if (plantingRecs[0]?.provides) {
      const provides = plantingRecs[0].provides;
      const nutrients = [];
      if (provides.n) nutrients.push(`${provides.n}kg N`);
      if (provides.p) nutrients.push(`${provides.p}kg P`);
      if (provides.k) nutrients.push(`${provides.k}kg K`);
      if (provides.s) nutrients.push(`${provides.s}kg S`);
      if (provides.ca) nutrients.push(`${provides.ca}kg Ca`);
      if (provides.mg) nutrients.push(`${provides.mg}kg Mg`);
      if (provides.zn) nutrients.push(`${provides.zn}kg Zn`);
      nutrientInfo = ` providing ${nutrients.join(', ')}`;
    }

    return `For your ${crop}, based on soil test results, your fertilizer plan recommends: ${plantingRecs[0]?.brand || 'fertilizer'}${nutrientInfo}. Total investment: ${formatCurrency(fertilizerPlan.totalCost || 0)}. Every Ksh invested in fertilizer returns Ksh 3-5 in higher yields!`;
  }

  return `For your ${crop}, based on soil test results, use precision fertilizer application: 1) Apply DAP at planting 2) Top dress with CAN/UREA 3) Supplement with MOP for potassium. Every Ksh invested in fertilizer returns Ksh 3-5 in higher yields!`;
}

// NEW: Generate nutrient-specific answer
function generateNutrientAnswer(sessionData: any): string {
  const crop = sessionData?.crops?.[0] || 'your crop';
  const fertilizerPlan = sessionData?.soilTest?.fertilizerPlan;

  if (!fertilizerPlan) {
    return `For your ${crop}, I don't have detailed nutrient information yet. Complete the soil test section to get personalized nutrient recommendations.`;
  }

  const plantingRecs = fertilizerPlan.plantingRecommendations || [];
  const topdressingRecs = fertilizerPlan.topDressingRecommendations || [];

  let response = `🌱 **NUTRIENT COMPOSITION FOR YOUR ${crop.toUpperCase()}**\n\n`;

  // Planting fertilizer nutrients
  if (plantingRecs[0]) {
    response += `🌿 **${plantingRecs[0].brand} (${plantingRecs[0].npk}):**\n`;
    if (plantingRecs[0].provides.n) response += `  • Nitrogen (N): ${plantingRecs[0].provides.n} kg\n`;
    if (plantingRecs[0].provides.p) response += `  • Phosphorus (P): ${plantingRecs[0].provides.p} kg\n`;
    if (plantingRecs[0].provides.k) response += `  • Potassium (K): ${plantingRecs[0].provides.k} kg\n`;
    if (plantingRecs[0].provides.s) response += `  • Sulfur (S): ${plantingRecs[0].provides.s} kg\n`;
    if (plantingRecs[0].provides.ca) response += `  • Calcium (Ca): ${plantingRecs[0].provides.ca} kg\n`;
    if (plantingRecs[0].provides.mg) response += `  • Magnesium (Mg): ${plantingRecs[0].provides.mg} kg\n`;
    if (plantingRecs[0].provides.zn) response += `  • Zinc (Zn): ${plantingRecs[0].provides.zn} kg\n`;
  }

  // Topdressing fertilizer nutrients
  if (topdressingRecs[0]) {
    response += `\n🌱 **${topdressingRecs[0].brand} (${topdressingRecs[0].npk}):**\n`;
    if (topdressingRecs[0].provides.n) response += `  • Nitrogen (N): ${topdressingRecs[0].provides.n} kg\n`;
    if (topdressingRecs[0].provides.k) response += `  • Potassium (K): ${topdressingRecs[0].provides.k} kg\n`;
    if (topdressingRecs[0].provides.s) response += `  • Sulfur (S): ${topdressingRecs[0].provides.s} kg\n`;
    if (topdressingRecs[0].provides.ca) response += `  • Calcium (Ca): ${topdressingRecs[0].provides.ca} kg\n`;
    if (topdressingRecs[0].provides.mg) response += `  • Magnesium (Mg): ${topdressingRecs[0].provides.mg} kg\n`;
  }

  // Total nutrients
  if (fertilizerPlan.totalNutrientsProvided) {
    const total = fertilizerPlan.totalNutrientsProvided;
    response += `\n📊 **TOTAL NUTRIENTS PROVIDED:**\n`;
    if (total.n) response += `  • Nitrogen (N): ${total.n} kg\n`;
    if (total.p) response += `  • Phosphorus (P): ${total.p} kg\n`;
    if (total.k) response += `  • Potassium (K): ${total.k} kg\n`;
    if (total.s) response += `  • Sulfur (S): ${total.s} kg\n`;
    if (total.ca) response += `  • Calcium (Ca): ${total.ca} kg\n`;
    if (total.mg) response += `  • Magnesium (Mg): ${total.mg} kg\n`;
    if (total.zn) response += `  • Zinc (Zn): ${total.zn} kg\n`;
  }

  return response;
}

// NEW: Generate damage-specific answer
function generateDamageAnswer(sessionData: any): string {
  const plantsDamaged = sessionData?.plantsDamaged;
  const crop = sessionData?.crops?.[0] || 'your crop';

  if (!plantsDamaged || plantsDamaged === 0) {
    return `For your ${crop} enterprise, you haven't reported any plant damage. Monitor your fields weekly for early detection of pests and diseases.`;
  }

  const totalPlants = sessionData?.spacingInfo?.totalPlants || 10000;
  const damagePercentage = ((plantsDamaged / totalPlants) * 100).toFixed(1);

  let advice = '';
  if (damagePercentage > 20) {
    advice = `⚠️ This is significant damage (${damagePercentage}% of plants). I strongly recommend reviewing your pest and disease management strategies immediately.`;
  } else if (damagePercentage > 10) {
    advice = `⚠️ Damage is moderate (${damagePercentage}% of plants). Consider stepping up your monitoring and control measures.`;
  } else {
    advice = `✅ Damage is minimal (${damagePercentage}% of plants). Continue regular monitoring to prevent escalation.`;
  }

  return `📝 **DAMAGE REPORT FOR YOUR ${crop.toUpperCase()}**\n\n` +
         `• Plants damaged beyond recovery: ${plantsDamaged.toLocaleString()}\n` +
         `• Damage percentage: ${damagePercentage}% of total plants\n\n` +
         `${advice}\n\n` +
         `💼 BUSINESS TIP: Early detection of pest/disease outbreaks can save up to 60% of your yield!`;
}

// Helper function to format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}