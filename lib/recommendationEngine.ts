// lib/recommendationEngine.ts – Grouped recommendations with Swahili support
// This is a utility function, not a Server Action

import { COUNTRY_CURRENCY_MAP } from '@/lib/config/currency';
import { cropPestDiseaseMap, PestDisease } from '@/lib/data/pestDiseaseMapping';
import { nutrientDeficiencies, findDeficiencyBySymptom, getDeficienciesForCrop } from '@/lib/data/nutrientDeficiency';

interface RecommendationInput {
  hasSoilTest: boolean;
  soilAnalysis?: any;
  fertilizerPlan?: any;
  crop: string;
  crops: string[];
  farmerData: {
    farmerName?: string;
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
    deficiencySymptoms?: string;
    deficiencyLocation?: string;
    mainChallenge?: string;
    experience?: string;
    managementLevel?: string;
    conservationPractices?: string;
    actualYieldKg?: number;
    pricePerKg?: number;
    totalCosts?: number;
    country?: string;
    limePricePerBag?: number;
    recCalciticLime?: number;
    plantsDamaged?: number;
    language?: string;
  };
}

interface RecommendationOutput {
  list: string[];
  financialAdvice: string;
  structuredList: RecommendationItem[];
  structuredFinancialAdvice: RecommendationItem;
}

interface RecommendationItem {
  key: string;
  params?: Record<string, any>;
}

// Swahili translations for static text
const swahiliTexts: Record<string, string> = {
  soil_analysis_title: 'UCHAMBUZI WA UDONGO - JUA UDONGO WAKO, KUKUZA BIASHARA YAKO',
  ph: 'pH',
  phosphorus: 'Fosforasi (P)',
  potassium: 'Potasiamu (K)',
  calcium: 'Kalsiamu (Ca)',
  magnesium: 'Magnesiamu (Mg)',
  nitrogen: 'Nitrojeni (N)',
  organic_matter: 'Mabaki Hai',
  very_low: 'Chini Sana',
  low: 'Chini',
  too_acidic: 'Asidi nyingi. Inahitaji chokaa.',
  needs_phosphorus: 'Inahitaji mbolea ya fosforasi.',
  needs_potassium: 'Inahitaji mbolea ya potasiamu.',
  soil_business_insight: 'UFAHAMU WA BIASHARA: Kila {{symbol}} 1 inayowekezwa katika kurekebisha udongo inarudisha {{symbol}} 3-5 katika mavuno makubwa!',
  soil_test_yearly: 'CHUNGUZA UDONGO KILA MWAKA kufuatilia maendeleo na kurekebisha pembejeo.',
  calcitic_lime_title: 'MAPENDEKEZO YA CHOKAA KUTOKA KWA UCHAMBUZI WAKO WA UDONGO',
  calcitic_lime_need: 'Kulingana na uchambuzi wako wa udongo, unahitaji {{kg}} kg za chokaa kwa ekari.',
  calcitic_lime_bags: 'Hii ni magunia {{bags}} ya 50kg.',
  calcitic_lime_cost: 'Gharama: {{total}} ({{perBag}} kwa gunia)',
  calcitic_lime_why_acidic_low_ca: 'Kwanini: pH yako ni {{ph}} (asidi) na kalsiamu yako ni chini ({{ca}} ppm). Chokaa inarekebisha matatizo yote mawili!',
  calcitic_lime_why_acidic: 'Kwanini: pH yako ni {{ph}} (asidi). Chokaa itainua pH na kuongeza kalsiamu.',
  calcitic_lime_why_low_ca: 'Kwanini: Kalsiamu yako ni chini ({{ca}} ppm). Chokaa inaongeza kalsiamu bila kuongeza magnesiamu.',
  calcitic_lime_application: 'Weka wiki 3-4 kabla ya upandaji na uchanganye kwenye udongo wa juu wa 10-15cm',
  calcitic_lime_wait: 'Subiri wiki 1-2 kabla ya kuweka mbolea za nitrojeni',
  calcitic_lime_business_case: 'HALI YA BIASHARA: pH sahihi inaweza kuongeza ufyonzaji wa virutubisho kwa 30-50%!',
  soil_test_yearly_reapply: 'CHUNGUZA UDONGO KILA MWAKA kujua wakati wa kurudia.',
  fertilizer_plan_title: 'MPANGO SAHIHI WA UWEKEZAJI WA MBOLEA kwa BIASHARA yako ya {{crop}}',
  fertilizer_plan_farm_size: 'Ukubwa wa shamba lako: {{size}} ekari',
  fertilizer_plan_total_investment: 'JUMLA YA UWEKEZAJI WA MBOLEA: {{amount}} kwa shamba lako zima',
  fertilizer_planting_section: 'MBOLEA ZA UPANDAJI (weka wakati wa kupanda)',
  fertilizer_topdressing_section: 'MBOLEA ZA KURUTUBISHA (weka wiki 3-4 baada ya kupanda)',
  buy: 'Nunua',
  kg_of: 'kg za',
  this_is: 'Hii ni',
  bags_of_50kg: 'magunia ya 50kg +',
  kg_open: 'kg fungua',
  cost: 'Gharama:',
  provides: 'Inatoa:',
  plant_population_title: '---\nIDADI YA MIMEA',
  plant_population: 'Kulingana na nafasi yako, una takriban mimea {{totalPlants}} kwenye shamba lako la ekari {{farmSize}}.',
  fertilizer_per_plant_title: 'MBOLEA KWA KILA MMEA',
  fertilizer_per_plant_dap: 'DAP: gramu {{grams}}',
  fertilizer_per_plant_urea: 'UREA: gramu {{grams}}',
  fertilizer_per_plant_mop: 'MOP: gramu {{grams}}',
  fertilizer_per_plant_total: 'JUMLA: gramu {{grams}}',
  fertilizer_business_tip: 'SHAURI YA BIASHARA: Nunua ukubwa unaolingana na mahitaji yako ili kuepuka upotevu. Kila {{symbol}} unayookoa ni {{symbol}} uliyopata!',
  fertilizer_remember: 'KUMBUKA: Hii ni BIASHARA yako ya {{crop}}. Kila pembejeo lazima iongeze faida yako!',
  gross_margin_title: 'UCHAMBUZI WA FAIDA KWA BIASHARA YAKO YA {{crop}} (kwa ekari)',
  gross_margin_intro: 'Kulingana na DATA yako halisi ya shamba, hivi ndivyo viwango tofauti vya usimamizi vinavyolinganishwa',
  low_management: 'USIMAMIZI WA CHINI (33% ya kiwango chako cha sasa)',
  medium_management: 'USIMAMIZI WA KATI (KIWANGO CHAKO CHA SASA)',
  high_management: 'USIMAMIZI WA JUU (126% ya kiwango chako cha sasa)',
  yield: 'Mavuno:',
  kg_times: 'kg ×',
  costs: 'Gharama:',
  gross_margin: 'FAIDA:',
  business_summary: 'MUHTASARI WA BIASHARA',
  from_low_to_medium: 'Kutoka Chini hadi Kati: +{{percent}}% ongezeko la faida',
  from_medium_to_high: 'Kutoka Kati hadi Juu: +{{percent}}% ongezeko la faida',
  every_invested: 'Kila {{symbol}} 1 inayowekezwa inarudisha {{return}} faida katika kiwango chako cha sasa',
  your_current_level: 'Kiwango chako cha sasa: {{level}}',
  bottom_line: 'MATOKEO YA MWISHO',
  moving_from: 'Kuhama kutoka {{from}} hadi Juu kunaweza kuweka ziada ya {{amount}} mfukoni mwako',

  // Disease management
  disease_management_title: 'UDHIBITI JUMUISHI WA MAGONJWA KWA BIASHARA YAKO YA {{crop}}',
  disease_reported: 'Magonjwa uliyoripoti: {{diseases}}',
  disease_prevention_title: 'KUZUIA (Rahisi kuliko kutibu)',
  disease_prevention_list: '• Tumia aina zinazostahimili magonjwa zinapopatikana\n• Zoea mzunguko wa mazao (miaka 3-4) kwa magonjwa yanayotokana na udongo\n• Hakikisha nafasi sahihi kwa mzunguko wa hewa\n• Epuka kufanya kazi kwenye mashamba yenye unyevu kuzuia kuenea\n• Ondoa na uharibu mimea iliyoathirika mara moja\n• Sababisha zana kati ya mashamba',
  disease_control_title: 'CHAGUO ZA UDHIBITI WA MAGONJWA SHAMBANI KWAKO:',
  disease_cultural_control: 'Udhibiti wa Kitamaduni',
  disease_chemical_control: 'Udhibiti wa Kemikali',
  disease_rate: 'Kiwango',
  disease_timing: 'Muda',
  disease_safety: 'Usalama',
  disease_pack_sizes: 'Ukubwa wa vifurushi',
  disease_status: 'Hali',
  disease_active: 'Inatumika',
  disease_restricted: 'IMEZUILIWA',
  disease_banned: 'IMEPIGWA MARUFUKU',
  disease_note: 'Kumbuka',
  disease_business_case_title: 'HALI YA BIASHARA',
  disease_business_case: 'Bila udhibiti: Uwezekano wa hasara ya mavuno ya 30-100%\nKwa kuzuia: Gharama {{low}}-{{high}}/ekari = OKOA {{saved}}+!\nKila {{symbol}} 1 inayotumika kuzuia magonjwa inarudisha {{symbol}} 20-50 katika mavuno yaliyookolewa',

  // Pest management
  pest_management_title: 'UDHIBITI JUMUISHI WA WADUDU (IPM) KWA BIASHARA YAKO YA {{crop}}',
  pest_reported: 'Wadudu ulioripoti: {{pests}}',
  pest_prevention_title: 'KUZUIA (Rahisi kuliko kutibu)',
  pest_prevention_list: '• Zoea mzunguko wa mazao na mimea isiyowavutia\n• Tumia aina zinazostahimili zinapopatikana\n• Angalia mashamba kila wiki kwa utambuzi wa mapema (BURE!)\n• Hifadhi maadui wa asili (kunguru, buibui, nyigu)\n• Ondoa na uharibu mimea iliyoathirika mara moja',
  pest_control_options: 'CHAGUO ZA UDHIBITI WA WADUDU SHAMBANI KWAKO:',
  pest_cultural_control: 'Udhibiti wa Kitamaduni',
  pest_organic_control: 'Udhibiti wa Kiasili',
  pest_chemical_control: 'Udhibiti wa Kemikali',
  pest_preparation: 'Maandalizi',
  pest_application: 'Utumiaji',
  pest_rate: 'Kiwango',
  pest_timing: 'Muda',
  pest_safety: 'Usalama',
  pest_pack_sizes: 'Ukubwa wa vifurushi',
  pest_status: 'Hali',
  pest_active: 'Inatumika',
  pest_restricted: 'IMEZUILIWA',
  pest_banned: 'IMEPIGWA MARUFUKU',
  pest_note: 'Kumbuka',
  pest_business_calc_title: 'HESABU YA BIASHARA',
  pest_business_calc: 'Bila udhibiti: Hasara 40-60% ya mavuno = hasara {{lowLoss}}-{{highLoss}}/ekari\nKwa IPM: Gharama {{lowCost}}-{{highCost}} = OKOA {{saved}}+ faida\nKila {{symbol}} 1 inayotumika kudhibiti wadudu inarudisha {{symbol}} 30-40 katika mavuno yaliyookolewa',

  // Conservation
  conservation_title: 'UHIFADHI WA UDONGO NA MAJI KWA BIASHARA YAKO YA {{crop}}',
  conservation_already_using: 'Tayari unatumia: {{practices}}. Kazi nzuri!',
  conservation_recommended_title: 'NJIA ZILIZOPENDEKEZWA',
  conservation_organic_manure: 'Samadi: Endelea kuweka tani 5-10 kwa ekari. Inaboresha muundo wa udongo na uwezo wa kuhifadhi maji.',
  conservation_terracing: 'Matuta: Bora kwa miteremko! Inapunguza mmonyoko wa udongo hadi 80%.',
  conservation_mulching: 'Kufunika: Kuhifadhi unyevu, kupunguza palizi. Tumia mabaki ya mazao - NI BURE!',
  conservation_cover_crops: 'Mazao ya kufunika: Panda mucuna au dolichos kati ya mistari. Hutoa kilo 40 N/ekari kiasili!',
  conservation_rainwater: 'Kuvuna maji ya mvua: Jenga mabirika - 1,000m³ yanagharimu {{amount}}, yanadumu miaka 10.',
  conservation_contour: 'Kilimo cha mtaro: Kwenye miteremko >5% - inapunguza mmonyoko kwa 50% na kuhifadhi maji.',
  conservation_business_case_title: 'HALI YA BIASHARA',
  conservation_business_case: 'Kufunika kunaokoa palizi mara 2 = {{mulchingSaved}}/ekari iliyookolewa\nMazao ya kufunika hutoa kilo 40 N/ekari = yanaokoa {{coverCropsSaved}} ya mbolea\nKila {{symbol}} 1 inayowekezwa katika uhifadhi inarudisha {{symbol}} 5 katika kuokoa pembejeo na kuongeza mavuno',

  // Business
  business_title: 'KILIMO KAMA BIASHARA - ONGEZA FAIDA YAKO',
  business_know_costs_title: '1. JUA GHARAMA ZAKO',
  business_know_costs_list: 'Fuatilia KILA pembejeo: mbegu, mbolea, kazi, usafirishaji, magunia',
  business_know_costs_example: 'Mfano mahindi ya kati: Gharama {{amount}}/hekta',
  business_buy_bulk_title: '2. NUNUA KWA JUMLA (Okoa 20-30%)',
  business_buy_bulk_dap: 'DAP: gunia 50kg {{single}} -> Nunua magunia 10 {{ten}} (okoa {{saved}})',
  business_buy_bulk_can: 'CAN: gunia 50kg {{single}} -> Nunua magunia 10 {{ten}} (okoa {{saved}})',
  business_form_groups_title: '3. UNDA VIKUNDI VYA WAKULIMA',
  business_form_groups_list: 'Ununuzi wa jumla wa pembejeo: Okoa 15-25%',
  business_form_groups_transport: 'Usafirishaji wa pamoja: Okoa {{saved}}/ekari\nUuzaji wa pamoja: Pata bei 10-20% za juu',
  business_exponential_title: '4. AWAMU YA KUONGEZEKA',
  business_exponential: 'Kila {{symbol}} 1 ya ziada inayowekezwa inarudisha {{symbol}} 3-5 faida\nEndelea kuwekeza - pembejeo zaidi = faida zaidi',
  business_bottom_line: 'MATOKEO YA MWISHO: Kilimo ni BIASHARA. Fanya kila shilingi ikufanyie kazi',

  // Damage report
  damage_report_title: 'RIPOTI YA UHARIBIFU KWA BIASHARA YAKO YA {{crop}}',
  damage_message: 'Uliripoti mimea {{plants}} iliyoharibika zaidi ya kurekebishwa. Taarifa hii inatusaidia kufuatilia afya ya shamba lako.',
  damage_advice: 'Fikiria kukagua mikakati yako ya kudhibiti wadudu na magonjwa ili kuzuia hasara za baadaye.',
  damage_followup: 'Kwa ushauri wa kibinafsi wa kupunguza uharibifu wa mimea, uliza mfumo wetu wa Maswali na Majibu kuhusu udhibiti wa wadudu au kuzuia magonjwa.',

  // GAP
  gap_title: 'KANUNI NZURI ZA KILIMO KWA BIASHARA YAKO YA {{crop}}',
  gap_remember: 'KUMBUKA: Kila tendo zuri unalofanya linaweka pesa zaidi mfukoni mwako'
};

export async function generateRecommendations(input: RecommendationInput): Promise<RecommendationOutput> {
  const structuredList: RecommendationItem[] = [];
  const { hasSoilTest, soilAnalysis, fertilizerPlan, crop, farmerData } = input;
  const lowerCrop = crop.toLowerCase();
  const country = farmerData.country || 'kenya';
  const language = farmerData.language || 'en';
  const isSwahili = language === 'sw';

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

  const getSwahiliText = (key: string, params?: Record<string, any>): string => {
    let text = swahiliTexts[key] || key;
    if (params) {
      for (const [paramKey, paramValue] of Object.entries(params)) {
        text = text.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(paramValue));
      }
    }
    return text;
  };

  // ========== GROUP 1: SOIL TEST ANALYSIS ==========
  if (hasSoilTest && soilAnalysis) {
    const soilLines: string[] = [];

    if (isSwahili) {
      soilLines.push(`${getSwahiliText('ph')}: ${soilAnalysis.ph || '?'} (${soilAnalysis.phRating === 'Very Low' ? getSwahiliText('very_low') : soilAnalysis.phRating === 'Low' ? getSwahiliText('low') : soilAnalysis.phRating})`);
      if (soilAnalysis.ph < 5.5) soilLines.push(`– ${getSwahiliText('too_acidic')}`);
      soilLines.push(`${getSwahiliText('phosphorus')}: ${soilAnalysis.phosphorus || '?'} ppm (${soilAnalysis.phosphorusRating === 'Very Low' ? getSwahiliText('very_low') : soilAnalysis.phosphorusRating})`);
      if (soilAnalysis.phosphorus < 15) soilLines.push(`– ${getSwahiliText('needs_phosphorus')}`);
      soilLines.push(`${getSwahiliText('potassium')}: ${soilAnalysis.potassium || '?'} ppm (${soilAnalysis.potassiumRating === 'Very Low' ? getSwahiliText('very_low') : soilAnalysis.potassiumRating})`);
      if (soilAnalysis.potassium < 100) soilLines.push(`– ${getSwahiliText('needs_potassium')}`);
      soilLines.push(`${getSwahiliText('calcium')}: ${soilAnalysis.calcium || '?'} ppm (${soilAnalysis.calciumRating === 'Very Low' ? getSwahiliText('very_low') : soilAnalysis.calciumRating})`);
      soilLines.push(`${getSwahiliText('magnesium')}: ${soilAnalysis.magnesium || '?'} ppm (${soilAnalysis.magnesiumRating === 'Very Low' ? getSwahiliText('very_low') : soilAnalysis.magnesiumRating})`);
      soilLines.push(`${getSwahiliText('nitrogen')}: ${soilAnalysis.totalNitrogen || '?'}% (${soilAnalysis.totalNitrogenRating === 'Very Low' ? getSwahiliText('very_low') : soilAnalysis.totalNitrogenRating})`);
      soilLines.push(`${getSwahiliText('organic_matter')}: ${soilAnalysis.organicMatter || '?'}% (${soilAnalysis.organicMatterRating === 'Very Low' ? getSwahiliText('very_low') : soilAnalysis.organicMatterRating})`);
    } else {
      soilLines.push(`pH: ${soilAnalysis.ph || '?'} (${soilAnalysis.phRating || ''})`);
      if (soilAnalysis.ph < 5.5) soilLines.push(`– Too acidic. Needs lime.`);
      else if (soilAnalysis.ph > 7.5) soilLines.push(`– Too alkaline. Needs sulfur/organic matter.`);
      soilLines.push(`Phosphorus (P): ${soilAnalysis.phosphorus || '?'} ppm (${soilAnalysis.phosphorusRating || ''})`);
      if (soilAnalysis.phosphorus < 15) soilLines.push(`– Low. Needs phosphorus fertilizer.`);
      soilLines.push(`Potassium (K): ${soilAnalysis.potassium || '?'} ppm (${soilAnalysis.potassiumRating || ''})`);
      if (soilAnalysis.potassium < 100) soilLines.push(`– Low. Needs potassium fertilizer.`);
      soilLines.push(`Calcium (Ca): ${soilAnalysis.calcium || '?'} ppm (${soilAnalysis.calciumRating || ''})`);
      soilLines.push(`Magnesium (Mg): ${soilAnalysis.magnesium || '?'} ppm (${soilAnalysis.magnesiumRating || ''})`);
      soilLines.push(`Nitrogen (N): ${soilAnalysis.totalNitrogen || '?'}% (${soilAnalysis.totalNitrogenRating || ''})`);
      soilLines.push(`Organic Matter (OM): ${soilAnalysis.organicMatter || '?'}% (${soilAnalysis.organicMatterRating || ''})`);
    }

    structuredList.push({
      key: 'soil_test_grouped',
      params: {
        title: isSwahili ? getSwahiliText('soil_analysis_title') : 'SOIL TEST ANALYSIS - KNOW YOUR SOIL, GROW YOUR BUSINESS',
        content: soilLines.join('\n'),
        insight: isSwahili ? getSwahiliText('soil_business_insight', { symbol: currencySymbol }) : `BUSINESS INSIGHT: Every ${currencySymbol} 1 invested in soil correction returns ${currencySymbol} 3-5 in higher yields!`,
        yearly: isSwahili ? getSwahiliText('soil_test_yearly') : 'TEST SOIL YEARLY to track improvements and adjust inputs.',
        symbol: currencySymbol
      }
    });
  }

  // ========== GROUP 2: CALCITIC LIME ==========
  if (hasSoilTest && farmerData.recCalciticLime && farmerData.recCalciticLime > 0) {
    const limeKg = farmerData.recCalciticLime;
    const limePricePerBag = farmerData.limePricePerBag || 300;
    const bagsNeeded = Math.ceil(limeKg / 50);
    const totalCost = bagsNeeded * limePricePerBag;

    let whyText = '';
    if (isSwahili) {
      if (soilAnalysis && soilAnalysis.ph < 5.5 && soilAnalysis.calcium && soilAnalysis.calcium < 400) {
        whyText = getSwahiliText('calcitic_lime_why_acidic_low_ca', { ph: soilAnalysis.ph, ca: soilAnalysis.calcium });
      } else if (soilAnalysis && soilAnalysis.ph < 5.5) {
        whyText = getSwahiliText('calcitic_lime_why_acidic', { ph: soilAnalysis.ph });
      } else if (soilAnalysis && soilAnalysis.calcium && soilAnalysis.calcium < 400) {
        whyText = getSwahiliText('calcitic_lime_why_low_ca', { ca: soilAnalysis.calcium });
      }
    } else {
      if (soilAnalysis && soilAnalysis.ph < 5.5 && soilAnalysis.calcium && soilAnalysis.calcium < 400) {
        whyText = `Why: Your pH is ${soilAnalysis.ph} (acidic) and your calcium is low (${soilAnalysis.calcium} ppm). Calcitic lime fixes both problems!`;
      } else if (soilAnalysis && soilAnalysis.ph < 5.5) {
        whyText = `Why: Your pH is ${soilAnalysis.ph} (acidic). Calcitic lime will raise pH and add calcium.`;
      } else if (soilAnalysis && soilAnalysis.calcium && soilAnalysis.calcium < 400) {
        whyText = `Why: Your calcium is low (${soilAnalysis.calcium} ppm). Calcitic lime adds calcium without adding magnesium.`;
      }
    }

    structuredList.push({
      key: 'calcitic_lime_grouped',
      params: {
        title: isSwahili ? getSwahiliText('calcitic_lime_title') : 'CALCITIC LIME RECOMMENDATION FROM YOUR SOIL TEST',
        need: isSwahili ? getSwahiliText('calcitic_lime_need', { kg: limeKg }) : `Based on your soil test, you need ${limeKg} kg of calcitic lime per acre.`,
        bags: isSwahili ? getSwahiliText('calcitic_lime_bags', { bags: bagsNeeded }) : `This is ${bagsNeeded} bags of 50kg.`,
        cost: isSwahili ? getSwahiliText('calcitic_lime_cost', { total: formatCurrency(totalCost), perBag: formatCurrency(limePricePerBag) }) : `Cost: ${formatCurrency(totalCost)} (${formatCurrency(limePricePerBag)} per bag)`,
        why: whyText,
        application: isSwahili ? getSwahiliText('calcitic_lime_application') : 'Apply 3-4 weeks before planting and incorporate into top 10-15cm soil.',
        wait: isSwahili ? getSwahiliText('calcitic_lime_wait') : 'Wait 1-2 weeks before applying nitrogen fertilizers.',
        business: isSwahili ? getSwahiliText('calcitic_lime_business_case') : 'BUSINESS CASE: Proper pH can increase nutrient uptake by 30-50%!',
        yearly: isSwahili ? getSwahiliText('soil_test_yearly_reapply') : 'TEST SOIL YEARLY to know when to reapply.'
      }
    });
  }

  // ========== GROUP 3: FERTILIZER PLAN HEADER ==========
  if (hasSoilTest && fertilizerPlan) {
    structuredList.push({
      key: 'fertilizer_header_grouped',
      params: {
        title: isSwahili ? getSwahiliText('fertilizer_plan_title', { crop: crop.toUpperCase() }) : `PRECISION FERTILIZER INVESTMENT PLAN for your ${crop.toUpperCase()} ENTERPRISE`,
        farmSize: isSwahili ? getSwahiliText('fertilizer_plan_farm_size', { size: fertilizerPlan.farmSize }) : `Your farm size: ${fertilizerPlan.farmSize} acre(s)`,
        totalInvestment: isSwahili ? getSwahiliText('fertilizer_plan_total_investment', { amount: formatCurrency(fertilizerPlan.totalCost || 0) }) : `TOTAL FERTILIZER INVESTMENT: ${formatCurrency(fertilizerPlan.totalCost || 0)} for your entire farm`
      }
    });
  }

  // ========== GROUP 4: PLANTING FERTILIZERS ==========
  if (hasSoilTest && fertilizerPlan && fertilizerPlan.plantingRecommendations?.length > 0) {
    const plantingLines: string[] = [];
    plantingLines.push(isSwahili ? getSwahiliText('fertilizer_planting_section') : 'PLANTING FERTILIZERS (apply at planting)');

    fertilizerPlan.plantingRecommendations.forEach((rec: any) => {
      const bagsNeeded = Math.floor(rec.amountKg / 50);
      const extraKg = rec.amountKg % 50;
      const cost = Math.round(rec.amountKg * (rec.pricePer50kg / 50));

      const providesParts = [];
      if (rec.provides.n > 0) providesParts.push(`${rec.provides.n.toFixed(1)} kg N`);
      if (rec.provides.p > 0) providesParts.push(`${rec.provides.p.toFixed(1)} kg P`);
      if (rec.provides.k > 0) providesParts.push(`${rec.provides.k.toFixed(1)} kg K`);

      if (isSwahili) {
        plantingLines.push(
          `${getSwahiliText('buy')} ${rec.amountKg} ${getSwahiliText('kg_of')} ${rec.brand} (${rec.npk})`,
          `${getSwahiliText('this_is')} ${bagsNeeded} ${getSwahiliText('bags_of_50kg')} ${extraKg}${getSwahiliText('kg_open')}`,
          `${getSwahiliText('cost')} ${formatCurrency(cost)}`,
          `${getSwahiliText('provides')}: ${providesParts.join(', ')}`,
          ``
        );
      } else {
        plantingLines.push(
          `Buy ${rec.amountKg} kg of ${rec.brand} (${rec.npk})`,
          `This is ${bagsNeeded} bag(s) of 50kg + ${extraKg}kg open`,
          `Cost: ${formatCurrency(cost)}`,
          `Provides: ${providesParts.join(', ')}`,
          ``
        );
      }
    });

    structuredList.push({
      key: 'planting_fertilizers_grouped',
      params: { content: plantingLines.join('\n') }
    });
  }

  // ========== GROUP 5: TOP DRESSING FERTILIZERS ==========
  if (hasSoilTest && fertilizerPlan && fertilizerPlan.topDressingRecommendations?.length > 0) {
    const topdressingLines: string[] = [];
    topdressingLines.push(isSwahili ? getSwahiliText('fertilizer_topdressing_section') : 'TOP DRESSING FERTILIZERS (apply 3-4 weeks after planting)');

    fertilizerPlan.topDressingRecommendations.forEach((rec: any) => {
      const bagsNeeded = Math.floor(rec.amountKg / 50);
      const extraKg = rec.amountKg % 50;
      const cost = Math.round(rec.amountKg * (rec.pricePer50kg / 50));

      const providesParts = [];
      if (rec.provides.n > 0) providesParts.push(`${rec.provides.n.toFixed(1)} kg N`);
      if (rec.provides.k > 0) providesParts.push(`${rec.provides.k.toFixed(1)} kg K`);

      if (isSwahili) {
        topdressingLines.push(
          `${getSwahiliText('buy')} ${rec.amountKg} ${getSwahiliText('kg_of')} ${rec.brand} (${rec.npk})`,
          `${getSwahiliText('this_is')} ${bagsNeeded} ${getSwahiliText('bags_of_50kg')} ${extraKg}${getSwahiliText('kg_open')}`,
          `${getSwahiliText('cost')} ${formatCurrency(cost)}`,
          `${getSwahiliText('provides')}: ${providesParts.join(', ')}`,
          ``
        );
      } else {
        topdressingLines.push(
          `Buy ${rec.amountKg} kg of ${rec.brand} (${rec.npk})`,
          `This is ${bagsNeeded} bag(s) of 50kg + ${extraKg}kg open`,
          `Cost: ${formatCurrency(cost)}`,
          `Provides: ${providesParts.join(', ')}`,
          ``
        );
      }
    });

    structuredList.push({
      key: 'topdressing_fertilizers_grouped',
      params: { content: topdressingLines.join('\n') }
    });
  }

  // ========== GROUP 6: PLANT POPULATION ==========
  if (hasSoilTest && fertilizerPlan && fertilizerPlan.perPlant) {
    const perPlant = fertilizerPlan.perPlant;
    const plantLines: string[] = [];

    plantLines.push(isSwahili ? getSwahiliText('plant_population_title') : '---\nPLANT POPULATION');
    plantLines.push(isSwahili ? getSwahiliText('plant_population', { totalPlants: perPlant.totalPlants?.toLocaleString(), farmSize: fertilizerPlan.farmSize }) : `Based on your spacing, you have approximately ${perPlant.totalPlants?.toLocaleString()} plants on your ${fertilizerPlan.farmSize} acre farm.`);
    plantLines.push('');
    plantLines.push(isSwahili ? getSwahiliText('fertilizer_per_plant_title') : 'FERTILIZER PER PLANT');
    plantLines.push(isSwahili ? getSwahiliText('fertilizer_per_plant_dap', { grams: perPlant.dapGrams }) : `DAP: ${perPlant.dapGrams} grams (${perPlant.dapGuide})`);
    plantLines.push(isSwahili ? getSwahiliText('fertilizer_per_plant_urea', { grams: perPlant.ureaGrams }) : `UREA: ${perPlant.ureaGrams} grams (${perPlant.ureaGuide})`);
    plantLines.push(isSwahili ? getSwahiliText('fertilizer_per_plant_mop', { grams: perPlant.mopGrams }) : `MOP: ${perPlant.mopGrams} grams (${perPlant.mopGuide})`);
    plantLines.push(isSwahili ? getSwahiliText('fertilizer_per_plant_total', { grams: perPlant.totalGrams }) : `TOTAL: ${perPlant.totalGrams} grams (${perPlant.totalGuide})`);

    structuredList.push({
      key: 'plant_population_grouped',
      params: { content: plantLines.join('\n') }
    });
  }

  // ========== GROUP 7: BUSINESS TIP ==========
  structuredList.push({
    key: 'fertilizer_business_tip',
    params: { symbol: currencySymbol }
  });

  // ========== GROUP 8: FERTILIZER REMEMBER ==========
  structuredList.push({
    key: 'fertilizer_remember',
    params: { crop: crop.toUpperCase() }
  });

  // ========== GROUP 9: GROSS MARGIN ANALYSIS ==========
  let actualYieldKg = farmerData.actualYieldKg || 0;
  let pricePerKg = farmerData.pricePerKg || 0;
  let actualCosts = farmerData.totalCosts || 0;

  if (!actualYieldKg || actualYieldKg === 0) {
    const defaultYields: Record<string, number> = {
      maize: 2000, beans: 1200, onions: 8000, potatoes: 10000, tomatoes: 15000,
      cabbages: 12000, kales: 8000, bananas: 6000, avocados: 2000, coffee: 2000,
      sugarcane: 40000, rice: 3000, sorghum: 1500, millet: 1200, groundnuts: 1000,
      cassava: 8000, sweetpotatoes: 7000, mangoes: 8000, pineapples: 20000,
      watermelons: 15000, carrots: 10000, chillies: 6000, spinach: 8000,
      pigeonpeas: 1000, bambaranuts: 800, yams: 12000, taro: 10000, okra: 7000,
      tea: 2500, macadamia: 4000, cocoa: 800
    };
    actualYieldKg = defaultYields[lowerCrop] || 2000;
  }

  if (!pricePerKg || pricePerKg === 0) {
    const defaultPrices: Record<string, number> = {
      maize: 40, beans: 80, onions: 50, potatoes: 30, tomatoes: 40,
      cabbages: 25, kales: 20, bananas: 30, avocados: 40, coffee: 300,
      sugarcane: 5, rice: 60, sorghum: 45, millet: 50, groundnuts: 120,
      cassava: 20, sweetpotatoes: 25, mangoes: 50, pineapples: 40,
      watermelons: 30, carrots: 40, chillies: 80, spinach: 25,
      pigeonpeas: 70, bambaranuts: 80, yams: 50, taro: 40, okra: 35,
      tea: 200, macadamia: 150, cocoa: 300
    };
    pricePerKg = defaultPrices[lowerCrop] || 40;
  }

  if (!actualCosts || actualCosts === 0) {
    actualCosts = fertilizerPlan?.totalCost || 25000;
  }

  const LOW_PERCENT = 0.33;
  const HIGH_PERCENT = 1.26;

  const lowYieldKg = Math.round(actualYieldKg * LOW_PERCENT);
  const lowRevenue = lowYieldKg * pricePerKg;
  const lowCosts = Math.round(actualCosts * LOW_PERCENT);
  const lowGM = lowRevenue - lowCosts;

  const mediumYieldKg = actualYieldKg;
  const mediumRevenue = actualYieldKg * pricePerKg;
  const mediumCosts = actualCosts;
  const mediumGM = mediumRevenue - mediumCosts;

  const highYieldKg = Math.round(actualYieldKg * HIGH_PERCENT);
  const highRevenue = highYieldKg * pricePerKg;
  const highCosts = Math.round(actualCosts * HIGH_PERCENT);
  const highGM = highRevenue - highCosts;

  const gmLines: string[] = [];

  if (isSwahili) {
    gmLines.push(getSwahiliText('gross_margin_title', { crop: crop.toUpperCase() }));
    gmLines.push(getSwahiliText('gross_margin_intro'));
    gmLines.push('');
    gmLines.push(getSwahiliText('low_management'));
    gmLines.push(`${getSwahiliText('yield')} ${lowYieldKg.toLocaleString()} ${getSwahiliText('kg_times')} ${formatCurrency(pricePerKg)} = ${formatCurrency(lowRevenue)}`);
    gmLines.push(`${getSwahiliText('costs')} ${formatCurrency(lowCosts)}`);
    gmLines.push(`${getSwahiliText('gross_margin')} ${formatCurrency(lowGM)}`);
    gmLines.push('');
    gmLines.push(getSwahiliText('medium_management'));
    gmLines.push(`${getSwahiliText('yield')} ${mediumYieldKg.toLocaleString()} ${getSwahiliText('kg_times')} ${formatCurrency(pricePerKg)} = ${formatCurrency(mediumRevenue)}`);
    gmLines.push(`${getSwahiliText('costs')} ${formatCurrency(mediumCosts)}`);
    gmLines.push(`${getSwahiliText('gross_margin')} ${formatCurrency(mediumGM)}`);
    gmLines.push('');
    gmLines.push(getSwahiliText('high_management'));
    gmLines.push(`${getSwahiliText('yield')} ${highYieldKg.toLocaleString()} ${getSwahiliText('kg_times')} ${formatCurrency(pricePerKg)} = ${formatCurrency(highRevenue)}`);
    gmLines.push(`${getSwahiliText('costs')} ${formatCurrency(highCosts)}`);
    gmLines.push(`${getSwahiliText('gross_margin')} ${formatCurrency(highGM)}`);
    gmLines.push('');
    gmLines.push(getSwahiliText('business_summary'));
  } else {
    gmLines.push(`GROSS MARGIN ANALYSIS FOR YOUR ${crop.toUpperCase()} ENTERPRISE (per acre)`);
    gmLines.push('Based on YOUR actual farm data, here\'s how different management levels compare');
    gmLines.push('');
    gmLines.push('LOW MANAGEMENT (33% of your current level)');
    gmLines.push(`Yield: ${lowYieldKg.toLocaleString()} kg × ${formatCurrency(pricePerKg)} = ${formatCurrency(lowRevenue)}`);
    gmLines.push(`Costs: ${formatCurrency(lowCosts)}`);
    gmLines.push(`GROSS MARGIN: ${formatCurrency(lowGM)}`);
    gmLines.push('');
    gmLines.push('MEDIUM MANAGEMENT (YOUR CURRENT LEVEL)');
    gmLines.push(`Yield: ${mediumYieldKg.toLocaleString()} kg × ${formatCurrency(pricePerKg)} = ${formatCurrency(mediumRevenue)}`);
    gmLines.push(`Costs: ${formatCurrency(mediumCosts)}`);
    gmLines.push(`GROSS MARGIN: ${formatCurrency(mediumGM)}`);
    gmLines.push('');
    gmLines.push('HIGH MANAGEMENT (126% of your current level)');
    gmLines.push(`Yield: ${highYieldKg.toLocaleString()} kg × ${formatCurrency(pricePerKg)} = ${formatCurrency(highRevenue)}`);
    gmLines.push(`Costs: ${formatCurrency(highCosts)}`);
    gmLines.push(`GROSS MARGIN: ${formatCurrency(highGM)}`);
    gmLines.push('');
    gmLines.push('BUSINESS SUMMARY');
  }

  const lowToMediumIncrease = lowGM !== 0 ? Math.round((mediumGM / lowGM - 1) * 100) : 0;
  const mediumToHighIncrease = mediumGM !== 0 ? Math.round((highGM / mediumGM - 1) * 100) : 0;
  const roi = mediumCosts !== 0 ? (mediumRevenue / mediumCosts).toFixed(1) : "0";

  if (isSwahili) {
    gmLines.push(getSwahiliText('from_low_to_medium', { percent: lowToMediumIncrease }));
    gmLines.push(getSwahiliText('from_medium_to_high', { percent: mediumToHighIncrease }));
    gmLines.push(getSwahiliText('every_invested', { symbol: currencySymbol, return: roi }));
    gmLines.push(getSwahiliText('your_current_level', { level: farmerData.managementLevel || "Kati" }));
    gmLines.push('');
    gmLines.push(getSwahiliText('bottom_line'));
    gmLines.push(getSwahiliText('moving_from', { from: farmerData.managementLevel || "Kati", amount: formatCurrency(highGM - mediumGM) }));
  } else {
    gmLines.push(`From Low to Medium: +${lowToMediumIncrease}% profit increase`);
    gmLines.push(`From Medium to High: +${mediumToHighIncrease}% profit increase`);
    gmLines.push(`Every ${currencySymbol}1 invested returns ${roi} profit at your current level`);
    gmLines.push(`Your current level: ${farmerData.managementLevel || "Medium"}`);
    gmLines.push('');
    gmLines.push('BOTTOM LINE');
    gmLines.push(`Moving from ${farmerData.managementLevel || "Medium"} to High could put an extra ${formatCurrency(highGM - mediumGM)} in your pocket`);
  }

  structuredList.push({
    key: 'gross_margin_grouped',
    params: { content: gmLines.join('\n') }
  });

  // ========== GROUP 10: GAP ==========
  const gapKeys: Record<string, string> = {
    maize: 'gap_maize', beans: 'gap_beans', 'finger millet': 'gap_finger_millet',
    sorghum: 'gap_sorghum', onions: 'gap_onions', tomatoes: 'gap_tomatoes',
    cabbages: 'gap_cabbages', potatoes: 'gap_potatoes', bananas: 'gap_bananas',
    avocados: 'gap_avocados', coffee: 'gap_coffee', cassava: 'gap_cassava',
    'sweet potatoes': 'gap_sweet_potatoes', groundnuts: 'gap_groundnuts',
    rice: 'gap_rice', mangoes: 'gap_mangoes', pineapples: 'gap_pineapples',
    watermelons: 'gap_watermelons', carrots: 'gap_carrots', chillies: 'gap_chillies',
    spinach: 'gap_spinach', pigeonpeas: 'gap_pigeonpeas', bambaranuts: 'gap_bambaranuts',
    yams: 'gap_yams', taro: 'gap_taro', okra: 'gap_okra', tea: 'gap_tea',
    macadamia: 'gap_macadamia', cocoa: 'gap_cocoa'
  };

  const gapKey = lowerCrop in gapKeys ? gapKeys[lowerCrop] : 'gap_generic';

  structuredList.push({
    key: 'gap_grouped',
    params: {
      title: isSwahili ? getSwahiliText('gap_title', { crop: crop.toUpperCase() }) : `GOOD AGRICULTURAL PRACTICES FOR YOUR ${crop.toUpperCase()} ENTERPRISE`,
      gapKey: gapKey,
      gapContent: '',
      remember: isSwahili ? getSwahiliText('gap_remember') : 'REMEMBER: Every practice you do well puts more money in your pocket'
    }
  });

  // ========== GROUP 11: DISEASE MANAGEMENT ==========
  if (farmerData.commonDiseases) {
    const diseaseLines: string[] = [];
    diseaseLines.push(isSwahili ? getSwahiliText('disease_management_title', { crop: crop.toUpperCase() }) : `INTEGRATED DISEASE MANAGEMENT FOR YOUR ${crop.toUpperCase()} ENTERPRISE`);
    diseaseLines.push(isSwahili ? getSwahiliText('disease_reported', { diseases: farmerData.commonDiseases }) : `The diseases affecting your ${crop.toUpperCase()} ENTERPRISE:`);

    const diseaseList = farmerData.commonDiseases.split(',').map(d => d.trim()).filter(d => d);
    diseaseList.forEach(disease => { diseaseLines.push(`• ${disease}`); });
    diseaseLines.push('');
    diseaseLines.push(isSwahili ? getSwahiliText('disease_prevention_title') : 'PREVENTION (Cheaper than cure)');
    diseaseLines.push(isSwahili ? getSwahiliText('disease_prevention_list') : '• Use disease-resistant varieties where available\n• Practice crop rotation (3-4 years) for soil-borne diseases\n• Ensure proper spacing for air circulation\n• Avoid working in wet fields to prevent spread\n• Remove and destroy infected plants immediately\n• Disinfect tools between fields');
    diseaseLines.push('');

    const cropLookupKey = lowerCrop.replace(/\s+/g, '');
    const cropPestsAndDiseases = cropPestDiseaseMap[cropLookupKey] || cropPestDiseaseMap[lowerCrop] || [];
    const cropDiseases = cropPestsAndDiseases.filter((pd: PestDisease) => pd.type === "disease");

    if (cropDiseases.length > 0) {
      diseaseLines.push(isSwahili ? getSwahiliText('disease_control_title') : 'CONTROL OPTIONS FOR DISEASES IN YOUR FARM:');
      cropDiseases.forEach(disease => {
        diseaseLines.push('');
        diseaseLines.push(`📌 ${disease.name.toUpperCase()}`);

        if (disease.culturalControls.length > 0) {
          diseaseLines.push(isSwahili ? getSwahiliText('disease_cultural_control') : '  Cultural Control:');
          disease.culturalControls.forEach(control => { diseaseLines.push(`  • ${control}`); });
        }

        if (disease.chemicalControls.length > 0) {
          diseaseLines.push(isSwahili ? getSwahiliText('disease_chemical_control') : '  Chemical Control:');
          disease.chemicalControls.forEach(chem => {
            if (isSwahili) {
              diseaseLines.push(`  • ${chem.productName} (${chem.activeIngredient})`);
              diseaseLines.push(`    ${getSwahiliText('disease_rate')}: ${chem.rate}`);
              diseaseLines.push(`    ${getSwahiliText('disease_timing')}: ${chem.timing}`);
              if (chem.safetyInterval) diseaseLines.push(`    ${getSwahiliText('disease_safety')}: ${chem.safetyInterval}`);
              if (chem.packageSizes) diseaseLines.push(`    ${getSwahiliText('disease_pack_sizes')}: ${chem.packageSizes.join(' • ')}`);
              const statusText = chem.status === 'restricted' ? getSwahiliText('disease_restricted') : chem.status === 'banned' ? getSwahiliText('disease_banned') : getSwahiliText('disease_active');
              diseaseLines.push(`    ${getSwahiliText('disease_status')}: ${statusText}`);
              if (chem.notes) diseaseLines.push(`    ${getSwahiliText('disease_note')}: ${chem.notes}`);
            } else {
              diseaseLines.push(`  • ${chem.productName} (${chem.activeIngredient})`);
              diseaseLines.push(`    Rate: ${chem.rate}`);
              diseaseLines.push(`    Timing: ${chem.timing}`);
              if (chem.safetyInterval) diseaseLines.push(`    Safety: ${chem.safetyInterval}`);
              if (chem.packageSizes) diseaseLines.push(`    Pack sizes: ${chem.packageSizes.join(' • ')}`);
              const statusText = chem.status === 'restricted' ? '⚠️ RESTRICTED' : chem.status === 'banned' ? '❌ BANNED' : '✅ Active';
              diseaseLines.push(`    Status: ${statusText}`);
              if (chem.notes) diseaseLines.push(`    Note: ${chem.notes}`);
            }
          });
        }
        if (disease.businessNote) diseaseLines.push(`  💼 ${disease.businessNote}`);
      });
    }

    diseaseLines.push('');
    diseaseLines.push(isSwahili ? getSwahiliText('disease_business_case_title') : 'BUSINESS CASE');
    diseaseLines.push(isSwahili ? getSwahiliText('disease_business_case', { low: formatCurrency(2000), high: formatCurrency(5000), saved: formatCurrency(100000), symbol: currencySymbol }) : `Without control: Yield losses of 30-100% possible\nWith prevention: Cost ${formatCurrency(2000)}-${formatCurrency(5000)}/acre = SAVE ${formatCurrency(100000)}+!\nEvery ${currencySymbol}1 spent on disease prevention returns ${currencySymbol}20-50 in saved yield`);

    structuredList.push({
      key: 'disease_management_grouped',
      params: { content: diseaseLines.join('\n') }
    });
  }

  // ========== GROUP 12: PEST MANAGEMENT ==========
  if (farmerData.commonPests) {
    const pestLines: string[] = [];
    pestLines.push(isSwahili ? getSwahiliText('pest_management_title', { crop: crop.toUpperCase() }) : `INTEGRATED PEST MANAGEMENT (IPM) FOR YOUR ${crop.toUpperCase()} ENTERPRISE`);
    pestLines.push(isSwahili ? getSwahiliText('pest_reported', { pests: farmerData.commonPests }) : `The pests affecting your ${crop.toUpperCase()} ENTERPRISE:`);

    const pestList = farmerData.commonPests.split(',').map(p => p.trim()).filter(p => p);
    pestList.forEach(pest => { pestLines.push(`• ${pest}`); });
    pestLines.push('');
    pestLines.push(isSwahili ? getSwahiliText('pest_prevention_title') : 'PREVENTION (Cheaper than cure)');
    pestLines.push(isSwahili ? getSwahiliText('pest_prevention_list') : '• Practice crop rotation with non-host crops\n• Use resistant varieties where available\n• Monitor fields weekly for early detection (FREE!)\n• Conserve natural enemies (ladybirds, spiders, parasitic wasps)\n• Remove and destroy infected plants immediately');
    pestLines.push('');

    const cropLookupKey = lowerCrop.replace(/\s+/g, '');
    const cropPestsAndDiseases = cropPestDiseaseMap[cropLookupKey] || cropPestDiseaseMap[lowerCrop] || [];
    const cropPests = cropPestsAndDiseases.filter((pd: PestDisease) => pd.type === "pest");

    if (cropPests.length > 0) {
      pestLines.push(isSwahili ? getSwahiliText('pest_control_options') : 'CONTROL OPTIONS FOR PESTS IN YOUR FARM:');
      cropPests.forEach(pest => {
        pestLines.push('');
        pestLines.push(`🐛 ${pest.name.toUpperCase()}`);

        if (pest.culturalControls.length > 0) {
          pestLines.push(isSwahili ? getSwahiliText('pest_cultural_control') : '  Cultural Control:');
          pest.culturalControls.forEach(control => { pestLines.push(`  • ${control}`); });
        }

        if (pest.organicControls && pest.organicControls.length > 0) {
          pestLines.push(isSwahili ? getSwahiliText('pest_organic_control') : '  Organic Control:');
          pest.organicControls.forEach(organic => {
            if (isSwahili) {
              pestLines.push(`  • ${organic.method}`);
              pestLines.push(`    ${getSwahiliText('pest_preparation')}: ${organic.preparation}`);
              pestLines.push(`    ${getSwahiliText('pest_application')}: ${organic.application}`);
            } else {
              pestLines.push(`  • ${organic.method}`);
              pestLines.push(`    Preparation: ${organic.preparation}`);
              pestLines.push(`    Application: ${organic.application}`);
            }
          });
        }

        if (pest.chemicalControls.length > 0) {
          pestLines.push(isSwahili ? getSwahiliText('pest_chemical_control') : '  Chemical Control:');
          pest.chemicalControls.forEach(chem => {
            if (isSwahili) {
              pestLines.push(`  • ${chem.productName} (${chem.activeIngredient})`);
              pestLines.push(`    ${getSwahiliText('pest_rate')}: ${chem.rate}`);
              pestLines.push(`    ${getSwahiliText('pest_timing')}: ${chem.timing}`);
              if (chem.safetyInterval) pestLines.push(`    ${getSwahiliText('pest_safety')}: ${chem.safetyInterval}`);
              if (chem.packageSizes) pestLines.push(`    ${getSwahiliText('pest_pack_sizes')}: ${chem.packageSizes.join(' • ')}`);
              const statusText = chem.status === 'restricted' ? getSwahiliText('pest_restricted') : chem.status === 'banned' ? getSwahiliText('pest_banned') : getSwahiliText('pest_active');
              pestLines.push(`    ${getSwahiliText('pest_status')}: ${statusText}`);
              if (chem.notes) pestLines.push(`    ${getSwahiliText('pest_note')}: ${chem.notes}`);
            } else {
              pestLines.push(`  • ${chem.productName} (${chem.activeIngredient})`);
              pestLines.push(`    Rate: ${chem.rate}`);
              pestLines.push(`    Timing: ${chem.timing}`);
              if (chem.safetyInterval) pestLines.push(`    Safety: ${chem.safetyInterval}`);
              if (chem.packageSizes) pestLines.push(`    Pack sizes: ${chem.packageSizes.join(' • ')}`);
              const statusText = chem.status === 'restricted' ? '⚠️ RESTRICTED' : chem.status === 'banned' ? '❌ BANNED' : '✅ Active';
              pestLines.push(`    Status: ${statusText}`);
              if (chem.notes) pestLines.push(`    Note: ${chem.notes}`);
            }
          });
        }
        if (pest.businessNote) pestLines.push(`  💼 ${pest.businessNote}`);
      });
    }

    pestLines.push('');
    pestLines.push(isSwahili ? getSwahiliText('pest_business_calc_title') : 'BUSINESS CALCULATION');
    pestLines.push(isSwahili ? getSwahiliText('pest_business_calc', { lowLoss: formatCurrency(80000), highLoss: formatCurrency(120000), lowCost: formatCurrency(1500), highCost: formatCurrency(3000), saved: formatCurrency(100000), symbol: currencySymbol }) : `Without control: Loss 40-60% yield = ${formatCurrency(80000)}-${formatCurrency(120000)} loss/acre\nWith IPM: Cost ${formatCurrency(1500)}-${formatCurrency(3000)} = SAVE ${formatCurrency(100000)}+ profit\nEvery ${currencySymbol}1 spent on pest control returns ${currencySymbol}30-40 in saved yield`);

    structuredList.push({
      key: 'pest_management_grouped',
      params: { content: pestLines.join('\n') }
    });
  }

  // ========== GROUP 13: DAMAGE REPORT ==========
  if (farmerData.plantsDamaged && farmerData.plantsDamaged > 0) {
    structuredList.push({
      key: 'damage_report_grouped',
      params: {
        title: isSwahili ? getSwahiliText('damage_report_title', { crop: crop.toUpperCase() }) : `DAMAGE REPORT FOR YOUR ${crop.toUpperCase()} ENTERPRISE`,
        plantsDamaged: farmerData.plantsDamaged,
        message: isSwahili ? getSwahiliText('damage_message', { plants: farmerData.plantsDamaged }) : `You reported ${farmerData.plantsDamaged} plants damaged beyond recovery. This information helps us track farm health trends.`,
        advice: isSwahili ? getSwahiliText('damage_advice') : 'Consider reviewing your pest and disease management strategies to prevent future losses.',
        followUp: isSwahili ? getSwahiliText('damage_followup') : 'For personalized advice on reducing plant damage, ask our Q&A system about pest control or disease prevention.'
      }
    });
  }

  // ========== GROUP 14: CONSERVATION ==========
  const conservationPractices = farmerData.conservationPractices ?
    farmerData.conservationPractices.split(',').map(p => p.trim()) : [];

  if (conservationPractices.length > 0) {
    const conservationLines: string[] = [];
    conservationLines.push(isSwahili ? getSwahiliText('conservation_title', { crop: crop.toUpperCase() }) : `SOIL AND WATER CONSERVATION FOR YOUR ${crop.toUpperCase()} ENTERPRISE`);
    conservationLines.push(isSwahili ? getSwahiliText('conservation_already_using', { practices: conservationPractices.filter(p => p !== 'None').join(', ') }) : `You're already using: ${conservationPractices.filter(p => p !== 'None').join(', ')}. Great job!`);
    conservationLines.push('');
    conservationLines.push(isSwahili ? getSwahiliText('conservation_recommended_title') : 'RECOMMENDED PRACTICES');
    conservationLines.push(isSwahili ? getSwahiliText('conservation_organic_manure') : '• Organic Manure: Continue applying 5-10 tons per acre. It improves soil structure and water holding capacity.');
    conservationLines.push(isSwahili ? getSwahiliText('conservation_terracing') : '• Terracing: Excellent for slopes! Reduces soil erosion by up to 80%.');
    conservationLines.push(isSwahili ? getSwahiliText('conservation_mulching', { mulchingSaved: formatCurrency(5000) }) : `• Mulching: Retains moisture, reduces weeding. Use crop residues - it's FREE! (Saves ${formatCurrency(5000)}/acre)`);
    conservationLines.push(isSwahili ? getSwahiliText('conservation_cover_crops', { coverCropsSaved: formatCurrency(3500) }) : `• Cover crops: Plant mucuna or dolichos between rows. Fixes 40kg N/acre naturally! (Saves ${formatCurrency(3500)} fertilizer)`);
    conservationLines.push(isSwahili ? getSwahiliText('conservation_rainwater', { amount: formatCurrency(200000) }) : `• Rainwater harvesting: Build water pans - 1,000m³ pan costs ${formatCurrency(200000)}, lasts 10 years.`);
    conservationLines.push(isSwahili ? getSwahiliText('conservation_contour') : '• Contour farming: On slopes >5% - reduces erosion by 50% and retains water.');
    conservationLines.push('');
    conservationLines.push(isSwahili ? getSwahiliText('conservation_business_case_title') : 'BUSINESS CASE');
    conservationLines.push(isSwahili ? getSwahiliText('conservation_business_case', { mulchingSaved: formatCurrency(5000), coverCropsSaved: formatCurrency(3500), symbol: currencySymbol }) : `Mulching saves 2 weeding rounds = ${formatCurrency(5000)}/acre saved\nCover crops fix 40kg N/acre = saves ${formatCurrency(3500)} fertilizer\nEvery ${currencySymbol}1 invested in conservation returns ${currencySymbol}5 in saved inputs and increased yields`);

    structuredList.push({
      key: 'conservation_grouped',
      params: { content: conservationLines.join('\n') }
    });
  }

  // ========== GROUP 15: BUSINESS ==========
  const businessLines: string[] = [];

  if (isSwahili) {
    businessLines.push(getSwahiliText('business_title'));
    businessLines.push('');
    businessLines.push(getSwahiliText('business_know_costs_title'));
    businessLines.push(getSwahiliText('business_know_costs_list'));
    businessLines.push(getSwahiliText('business_know_costs_example', { amount: formatCurrency(40000) }));
    businessLines.push('');
    businessLines.push(getSwahiliText('business_buy_bulk_title'));
    businessLines.push(getSwahiliText('business_buy_bulk_dap', { single: formatCurrency(3500), ten: formatCurrency(31500), saved: formatCurrency(3500) }));
    businessLines.push(getSwahiliText('business_buy_bulk_can', { single: formatCurrency(3200), ten: formatCurrency(28800), saved: formatCurrency(3200) }));
    businessLines.push('');
    businessLines.push(getSwahiliText('business_form_groups_title'));
    businessLines.push(getSwahiliText('business_form_groups_list'));
    businessLines.push(getSwahiliText('business_form_groups_transport', { saved: formatCurrency(5000) }));
    businessLines.push('');
    businessLines.push(getSwahiliText('business_exponential_title'));
    businessLines.push(getSwahiliText('business_exponential', { symbol: currencySymbol }));
    businessLines.push('');
    businessLines.push(getSwahiliText('business_bottom_line'));
  } else {
    businessLines.push('FARMING AS A BUSINESS - MAXIMIZE YOUR PROFIT');
    businessLines.push('');
    businessLines.push('1. KNOW YOUR COSTS');
    businessLines.push('Track EVERY input: seeds, fertilizer, labour, transport, bags');
    businessLines.push(`Example maize medium: Costs ${formatCurrency(40000)}/hectare`);
    businessLines.push('');
    businessLines.push('2. BUY IN BULK (Save 20-30%)');
    businessLines.push(`DAP: 50kg bag ${formatCurrency(3500)} -> Buy 10 bags ${formatCurrency(31500)} (save ${formatCurrency(3500)})`);
    businessLines.push(`CAN: 50kg bag ${formatCurrency(3200)} -> Buy 10 bags ${formatCurrency(28800)} (save ${formatCurrency(3200)})`);
    businessLines.push('');
    businessLines.push('3. FORM FARMER GROUPS');
    businessLines.push('Bulk input purchases: Save 15-25%');
    businessLines.push(`Shared transport: Save ${formatCurrency(5000)}/acre`);
    businessLines.push('Collective marketing: Get 10-20% higher prices');
    businessLines.push('');
    businessLines.push('4. EXPONENTIAL PHASE');
    businessLines.push(`Every additional ${currencySymbol}1 input returns ${currencySymbol}3-5 profit`);
    businessLines.push('Keep investing - more inputs = more profits');
    businessLines.push('');
    businessLines.push(`BOTTOM LINE: Farming is a BUSINESS. Make every ${currencySymbol} work for you`);
  }

  structuredList.push({
    key: 'business_grouped',
    params: { content: businessLines.join('\n') }
  });

  // ========== FINANCIAL ADVICE ==========
  const financialParams: Record<string, any> = { symbol: currencySymbol };
  if (hasSoilTest && fertilizerPlan?.totalCost) {
    financialParams.totalInvestment = formatCurrency(fertilizerPlan.totalCost);
  }
  const structuredFinancialAdvice: RecommendationItem = {
    key: 'financial_advice',
    params: financialParams
  };

  const list = structuredList.map(item => item.key + (item.params ? JSON.stringify(item.params) : ''));
  const financialAdvice = structuredFinancialAdvice.key;

  return {
    list,
    financialAdvice,
    structuredList,
    structuredFinancialAdvice
  };
}