// lib/recommendationEngine.ts – Complete for 219 crops

import { COUNTRY_CURRENCY_MAP } from '@/lib/config/currency';
import { cropPestDiseaseMap, PestDisease } from '@/lib/data/pestDiseaseMapping';
import swTranslations from '../public/locales/sw/common.json';
import frTranslations from '../public/locales/fr/common.json';
import { getDeficienciesForCrop } from '@/lib/data/nutrientDeficiency';
const SW = swTranslations as any;
const FR = frTranslations as any;
import { soilTestInterpreter } from './soilTestInterpreter';
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
    spacing?: string;
    storageMethod?: string;
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

// Helper to determine crop category for post‑harvest advice (expanded for all crops)
const getCropCategory = (crop: string): string => {
  const c = crop.toLowerCase();
  const grains = [
    "maize", "beans", "wheat", "sorghum", "millet", "rice", "barley", "finger millet",
    "oats", "teff", "triticale", "buckwheat", "quinoa", "fonio", "spelt", "kamut", "amaranth grain"
  ];
  const pulses = [
    "soya beans", "cowpeas", "green grams", "bambara nuts", "groundnuts", "pigeon peas",
    "chickpea", "lentil", "faba bean", "peanut", "alfalfa", "lucerne", "clover", "white clover",
    "vetch", "mucuna", "desmodium", "dolichos", "canavalia", "sunn hemp", "crotalaria paulina"
  ];
  const tubers = [
    "cassava", "sweet potatoes", "irish potatoes", "yams", "taro", "arrow roots",
    "ginger", "turmeric", "horseradish", "parsnip", "turnip", "rutabaga", "beetroot", "radish"
  ];
  const vegetables = [
    "tomatoes", "cabbage", "kales", "onions", "carrots", "capsicums", "chillies",
    "brinjals", "eggplants", "french beans", "garden peas", "spinach", "okra", "cauliflower",
    "lettuce", "broccoli", "celery", "leeks", "pumpkin leaves", "sweet potato leaves",
    "jute mallow", "spider plant", "african nightshade", "amaranth", "ethiopian kale",
    "coriander", "parsley", "arugula", "endive", "kohlrabi", "watercress", "pumpkin",
    "courgettes", "cucumbers", "artichoke", "asparagus", "rhubarb", "wasabi", "bok choy",
    "collard greens", "mustard greens", "swiss chard", "radicchio", "escarole", "frisee",
    "turnip greens", "celery", "leeks", "lettuce"
  ];
  const fruits = [
    "bananas", "oranges", "pineapples", "mangoes", "avocados", "pawpaws", "passion fruit",
    "citrus", "watermelon", "grapefruit", "lemons", "limes", "guava", "jackfruit",
    "breadfruit", "pomegranate", "star fruit", "coconut", "fig", "date palm", "mulberry",
    "lychee", "persimmon", "gooseberry", "currant", "elderberry", "rambutan", "durian",
    "mangosteen", "longan", "marula"
  ];
  if (grains.includes(c)) return "grains";
  if (pulses.includes(c)) return "pulses";
  if (tubers.includes(c)) return "tubers";
  if (vegetables.includes(c)) return "vegetables";
  if (fruits.includes(c)) return "fruits";
  return "other";
};

// ========== Crop‑specific post‑harvest loss warning (expanded) ==========
const getPostHarvestLossWarning = (crop: string, language: string): string => {
  const c = crop.toLowerCase();
  if (language === 'sw') {
    if (c.includes('cabbage') || c.includes('kale') || c.includes('sukuma')) {
      return "⚠️ HADHARI: Utunzaji duni wa kabichi/sukumawiki unaweza kusababisha hasara ya HADI 50%! Majani ya nje yaliyovunjika huoza haraka, na majani yaliyopasuka huvutia bakteria – hii inapunguza thamani ya soko na maisha ya rafu.";
    }
    if (c.includes('spinach')) {
      return "⚠️ HADHARI: Utunzaji duni wa mchicha unaweza kusababisha hasara ya HADI 50%! Majani yaliyopondwa hupoteza unyevu na kugeuka manjano ndani ya siku 1-2, na uchafu husababisha uozo haraka.";
    }
    if (c.includes('lettuce')) {
      return "⚠️ HADHARI: Utunzaji duni wa lettuce unaweza kusababisha hasara ya HADI 50%! Majani yaliyovunjika hupoteza mnofu na kuoza, na joto la juu husababisha kuchipua na kuwa chungu.";
    }
    if (c.includes('broccoli') || c.includes('cauliflower')) {
      return "⚠️ HADHARI: Utunzaji duni wa brokoli/koli flower unaweza kusababisha hasara ya HADI 50%! Maua yaliyopondwa yanageuka manjano na kuoza haraka, na unyevu husababisha ukungu.";
    }
    if (c.includes('capsicum') || c.includes('pepper') || c.includes('pilipili')) {
      return "⚠️ HADHARI: Utunzaji duni wa pilipili hoho unaweza kusababisha hasara ya HADI 50%! Nyanya za pilipili zilizopondwa hupoteza unyevu na kuharibika ndani ya siku 3-5, na majeraha huwavutia wadudu.";
    }
    if (c.includes('brinjal') || c.includes('eggplant') || c.includes('biringani')) {
      return "⚠️ HADHARI: Utunzaji duni wa biringani unaweza kusababisha hasara ya HADI 50%! Matunda yaliyopondwa yana madoa meusi ndani na huiva mapema, na majeraha hufungua mlango kwa magonjwa.";
    }
    if (c.includes('french beans') || c.includes('garden peas')) {
      return "⚠️ HADHARI: Utunzaji duni wa maharagwe ya kifaransa/mbaazi unaweza kusababisha hasara ya HADI 50%! Maganda yaliyovunjika hupoteza unyevu na kukauka, na majeraha huruhusu ukungu kuingia.";
    }
    if (c.includes('carrot')) return "⚠️ HADHARI: Utunzaji duni wa karoti unaweza kusababisha hasara ya HADI 50%! Karoti zilizovunjika au kupasuka hupoteza unyevu haraka na kuvutia ukungu – hii hupunguza thamani ya soko na inaweza kuleta metali nzito kutoka udongo.";
    if (c.includes('tomato')) return "⚠️ HADHARI: Utunzaji duni wa nyanya unaweza kusababisha hasara ya HADI 50%! Nyanya zilizopasuka huingiza bakteria na ukungu – hii huharibu ubora wa kuuza nje na kupunguza maisha ya rafu.";
    if (c.includes('maize')) return "⚠️ HADHARI: Utunzaji duni wa mahindi unaweza kusababisha hasara ya HADI 50%! Nafaka zilizovunjika huruhusu aflatoxini (sumu ya saratani) na wadudu kuingia – hii inashusha daraja la soko na kuhatarisha afya.";
    if (c.includes('cassava')) return "⚠️ HADHARI: Utunzaji duni wa mihogo unaweza kusababisha hasara ya HADI 50%! Mizizi iliyopondwa huoza ndani ya siku 3-5 kwa sababu ya kuvu na bakteria – hii inapunguza ubora wa usindikaji na mauzo ya nje.";
    if (c.includes('onion')) return "⚠️ HADHARI: Utunzaji duni wa vitunguu unaweza kusababisha hasara ya HADI 50%! Vitunguu vilivyopondwa huoza kwenye shingo na kuota kwa sababu ya mwanga na unyevu – hii hupunguza thamani ya soko.";
    if (c.includes('avocado')) return "⚠️ HADHARI: Utunzaji duni wa parachichi unaweza kusababisha hasara ya HADI 50%! Matunda yaliyopondwa yana madoa meusi ndani na huiva mapema kwa sababu ya ethilini – hii inafanya yasiuzike.";
    return "⚠️ HADHARI: Utunzaji duni wa mavuno unaweza kusababisha hasara ya HADI 50%! Aflatoxini (sumu), majeraha, uchafu na metali nzito hushusha ubora na kuzuia soko.";
  }
  if (language === 'fr') {
    if (c.includes('cabbage') || c.includes('kale')) return "⚠️ ATTENTION : Une mauvaise manutention du chou peut entraîner une PERTE DE 50% ! Les feuilles extérieures cassées pourrissent rapidement, et les têtes fendues attirent les bactéries – cela réduit la valeur marchande.";
    if (c.includes('spinach')) return "⚠️ ATTENTION : Une mauvaise manutention des épinards peut entraîner une PERTE DE 50% ! Les feuilles meurtries perdent leur humidité et jaunissent en 1-2 jours, et la saleté provoque une pourriture rapide.";
    if (c.includes('lettuce')) return "⚠️ ATTENTION : Une mauvaise manutention de la laitue peut entraîner une PERTE DE 50% ! Les feuilles cassées perdent leur croquant et pourrissent, et la chaleur provoque la montaison et l'amertume.";
    if (c.includes('broccoli') || c.includes('cauliflower')) return "⚠️ ATTENTION : Une mauvaise manutention du brocoli/chou-fleur peut entraîner une PERTE DE 50% ! Les fleurons meurtris jaunissent et pourrissent rapidement, et l'humidité favorise la moisissure.";
    if (c.includes('capsicum') || c.includes('pepper')) return "⚠️ ATTENTION : Une mauvaise manutention du poivron peut entraîner une PERTE DE 50% ! Les fruits meurtris perdent leur eau et se gâtent en 3-5 jours, et les blessures attirent les insectes.";
    if (c.includes('brinjal') || c.includes('eggplant')) return "⚠️ ATTENTION : Une mauvaise manutention de l'aubergine peut entraîner une PERTE DE 50% ! Les fruits meurtris développent des taches sombres internes et mûrissent de manière inégale, et les blessures ouvrent la porte aux maladies.";
    if (c.includes('french beans') || c.includes('garden peas')) return "⚠️ ATTENTION : Une mauvaise manutention des haricots verts/pois peut entraîner une PERTE DE 50% ! Les gousses cassées perdent leur humidité et se ratatinent, et les dommages permettent l'entrée de moisissures.";
    if (c.includes('carrot')) return "⚠️ ATTENTION : La mauvaise manutention des carottes peut entraîner une PERTE DE 50% ! Les racines cassées perdent leur humidité et attirent les moisissures – cela réduit la valeur marchande.";
    if (c.includes('tomato')) return "⚠️ ATTENTION : La mauvaise manutention des tomates peut entraîner une PERTE DE 50% ! Les fruits fendus laissent entrer bactéries et moisissures – cela réduit la durée de conservation.";
    if (c.includes('maize')) return "⚠️ ATTENTION : La mauvaise manutention du maïs peut entraîner une PERTE DE 50% ! Les grains cassés favorisent l'aflatoxine (cancérigène) et les insectes – cela abaisse la qualité marchande.";
    return "⚠️ ATTENTION : Une mauvaise manutention peut entraîner une PERTE DE 50% ! L'aflatoxine, les blessures, la contamination et les métaux lourds réduisent la qualité.";
  }
  // English
  if (c.includes('cabbage') || c.includes('kale')) {
    return "⚠️ WARNING: Poor cabbage/kale handling can cause UP TO 50% LOSS! Broken outer leaves rot quickly, and split heads invite bacteria – this reduces market value and shelf life.";
  }
  if (c.includes('spinach')) {
    return "⚠️ WARNING: Poor spinach handling can cause UP TO 50% LOSS! Bruised leaves lose moisture and turn yellow within 1-2 days, and dirt introduces rapid decay.";
  }
  if (c.includes('lettuce')) {
    return "⚠️ WARNING: Poor lettuce handling can cause UP TO 50% LOSS! Broken leaves lose crispness and rot, and high temperatures cause bolting and bitterness.";
  }
  if (c.includes('broccoli') || c.includes('cauliflower')) {
    return "⚠️ WARNING: Poor broccoli/cauliflower handling can cause UP TO 50% LOSS! Bruised florets turn yellow and decay quickly, and moisture promotes mould.";
  }
  if (c.includes('capsicum') || c.includes('pepper')) {
    return "⚠️ WARNING: Poor capsicum handling can cause UP TO 50% LOSS! Bruised peppers lose water and spoil within 3-5 days, and injury invites insect damage.";
  }
  if (c.includes('brinjal') || c.includes('eggplant')) {
    return "⚠️ WARNING: Poor eggplant handling can cause UP TO 50% LOSS! Bruised fruits develop internal dark spots and ripen unevenly, and wounds open the door to disease.";
  }
  if (c.includes('french beans') || c.includes('garden peas')) {
    return "⚠️ WARNING: Poor French bean/pea handling can cause UP TO 50% LOSS! Broken pods lose moisture and shrivel, and damage allows mould entry.";
  }
  if (c.includes('carrot')) return "⚠️ WARNING: Poor carrot handling can cause UP TO 50% LOSS! Broken or cracked roots lose moisture rapidly and invite mould – this reduces market value and may contain heavy metals from soil.";
  if (c.includes('tomato')) return "⚠️ WARNING: Poor tomato handling can cause UP TO 50% LOSS! Split fruits allow bacteria and mould entry – this reduces shelf life and export quality.";
  if (c.includes('maize')) return "⚠️ WARNING: Poor maize handling can cause UP TO 50% LOSS! Broken grains allow aflatoxin (cancer‑causing mould) and weevils to enter – this lowers market grade and health safety.";
  if (c.includes('cassava')) return "⚠️ WARNING: Poor cassava handling can cause UP TO 50% LOSS! Bruised roots rot within 3-5 days due to fungi and bacteria – this reduces processing quality and export potential.";
  if (c.includes('onion')) return "⚠️ WARNING: Poor onion handling can cause UP TO 50% LOSS! Bruised bulbs rot at the neck and sprout due to light and moisture – this reduces market value and storage life.";
  if (c.includes('avocado')) return "⚠️ WARNING: Poor avocado handling can cause UP TO 50% LOSS! Bruised fruits develop internal dark spots and ripen unevenly due to ethylene – this makes them unmarketable.";
  return "⚠️ WARNING: Poor post‑harvest handling can cause UP TO 50% LOSS! Aflatoxin (toxic mould), physical injury, contamination and trace elements lower quality and block market access.";
};

// ========== Crop‑specific sorting & grading (expanded) ==========
const getSortingGradingAdvice = (crop: string, language: string): string => {
  const c = crop.toLowerCase();
  if (language === 'sw') {
    if (c.includes('cabbage') || c.includes('kale')) {
      return "Panga na chemsha kabichi/sukumawiki: ondoa majani ya nje yaliyovunjika, yaliyokauka au yenye madoa – **majani yaliyoharibika husababisha uozo unaoenea haraka**. Weka vichwa vilivyo imara na safi.";
    }
    if (c.includes('spinach')) {
      return "Panga na chemsha mchicha: tenga majani yaliyo safi, yenye rangi ya kijani, bila majeraha – **majani yaliyopondwa huoza ndani ya siku moja**. Ondoa yale yaliyochanika au yenye ukungu.";
    }
    if (c.includes('lettuce')) {
      return "Panga na chemsha lettuce: chagua vichwa vilivyo imara, majani safi bila madoa – **vichwa vilivyoharibika huathiri wengine kwa uharibifu**. Ondoa majani ya nje yaliyokauka.";
    }
    if (c.includes('broccoli') || c.includes('cauliflower')) {
      return "Panga na chemsha brokoli/koli flower: chagua maua yaliyo imara, yenye rangi sawa – **maua yaliyopondwa yanageuka manjano haraka**. Ondoa yale yaliyo na madoa au uozo.";
    }
    if (c.includes('capsicum') || c.includes('pepper')) {
      return "Panga na chemsha pilipili hoho: tenga pilipili zenye rangi kamili, ngozi ngumu, bila madoa – **pilipili zilizoharibika huathiri ubora wa zima**. Daraja A hupata bei ya juu 30%.";
    }
    if (c.includes('brinjal') || c.includes('eggplant')) {
      return "Panga na chemsha biringani: chagua zenye ngozi laini, rangi ya zambarau iliyokaa, bila madoa – **biringani zilizopondwa huwa na ladha chungu**. Ondoa zenye madoa ya kahawia.";
    }
    if (c.includes('french beans') || c.includes('garden peas')) {
      return "Panga na chemsha maharagwe/mbaazi: chagua maganda yenye rangi ya kijani, yaliyojaa, bila madoa – **maganda yaliyovunjika hukauka haraka na kupoteza thamani**. Ondoa yale yaliyokauka au yenye ukungu.";
    }
    if (c.includes('carrot')) return "Panga na chemsha karoti: ondoa zilizovunjika, zilizopasuka au zenye madoa – **karoti zilizoharibika hueneza magonjwa kwa nzima na hupunguza bei kwa 30%**. Karoti safi na nyofu hupata bei ya juu.";
    if (c.includes('tomato')) return "Panga na chemsha nyanya: tenga zilizoiva sawasawa, nyekundu, bila nyufa – **nyanya zilizopasuka huvutia bakteria na kuoza mapema, na hushusha daraja**. Daraja A hupata bei mara 2.";
    if (c.includes('avocado')) return "Panga na chemsha parachichi: chagua zilizo na umbo zuri, bila madoa – **madoa ya ndani yanaashiria uozo unaoenea kwa wengine**. Daraja la kwanza hupata bei 40% za juu.";
    if (c.includes('onion')) return "Panga na chemsha vitunguu: ondoa vilivyopondwa, vilivyoota au vyenye madoa meusi – **vitunguu vilivyoharibika husababisha uozo wa shingo na kuota kwa wengine**. Hii huokoa hasara kubwa.";
    return "Panga na chemsha mavuno yako: ondoa yaliyoharibika, yenye ukungu au majeraha – **kuondoa bidhaa mbaya huzuia kuenea kwa magonjwa na inaboresha bei kwa 20-30%**.";
  }
  if (language === 'fr') {
    if (c.includes('cabbage')) return "Triez et calibrez le chou : retirez les feuilles extérieures abîmées – **les feuilles endommagées propagent la pourriture**. Gardez les têtes fermes et propres.";
    if (c.includes('spinach')) return "Triez et calibrez les épinards : sélectionnez les feuilles vertes, non meurtries – **les feuilles meurtries pourrissent en 24h**. Jetez celles qui sont jaunes ou visqueuses.";
    if (c.includes('lettuce')) return "Triez et calibrez la laitue : choisissez des têtes fermes aux feuilles intactes – **les têtes abîmées font pourrir les voisines**. Retirez les feuilles extérieures fanées.";
    if (c.includes('broccoli')) return "Triez et calibrez le brocoli : sélectionnez des fleurons fermes, de couleur uniforme – **les fleurons meurtris jaunissent rapidement**. Retirez ceux avec taches ou pourriture.";
    if (c.includes('capsicum')) return "Triez et calibrez les poivrons : choisissez des fruits de couleur vive, fermes, sans taches – **les fruits endommagés se gâtent plus vite et affectent la qualité**. Le grade A obtient un prix 30% supérieur.";
    if (c.includes('brinjal')) return "Triez et calibrez les aubergines : choisissez des fruits brillants, violet foncé, sans taches – **les aubergines meurtries deviennent amères**. Jetez celles avec des taches brunes.";
    if (c.includes('french beans')) return "Triez et calibrez les haricots verts : sélectionnez des gousses vert vif, bien remplies, sans taches – **les gousses cassées se ratatinent rapidement et perdent de la valeur**. Retirez celles qui sont sèches ou moisiess.";
    if (c.includes('carrot')) return "Triez et calibrez les carottes : retirez les racines cassées ou tachées – **les carottes endommagées propagent les maladies et réduisent le prix de 30%**.";
    if (c.includes('tomato')) return "Triez et calibrez les tomates : séparez les tomates mûres uniformément, rouges, sans fissures – **les tomates fissurées attirent les bactéries et pourrissent tôt, abaissant la qualité**.";
    return "Triez et calibrez : retirez les produits endommagés – **cela empêche la propagation des maladies et augmente le prix de 20-30%**.";
  }
  // English
  if (c.includes('cabbage') || c.includes('kale')) {
    return "Sort and grade cabbage/kale: remove loose, yellow or cracked outer leaves – **damaged leaves spread rot quickly**. Keep firm, compact heads with clean leaves.";
  }
  if (c.includes('spinach')) {
    return "Sort and grade spinach: select fresh, green, unbruised leaves – **bruised leaves wilt and rot within 24 hours**. Discard yellowed or slimy ones.";
  }
  if (c.includes('lettuce')) {
    return "Sort and grade lettuce: choose firm heads with crisp, unblemished leaves – **damaged heads cause neighbouring heads to spoil**. Remove wilted outer leaves.";
  }
  if (c.includes('broccoli') || c.includes('cauliflower')) {
    return "Sort and grade broccoli/cauliflower: select firm, evenly coloured florets – **bruised florets yellow quickly**. Remove any with dark spots or decay.";
  }
  if (c.includes('capsicum') || c.includes('pepper')) {
    return "Sort and grade capsicum: select fully coloured, firm, unblemished fruits – **damaged peppers spoil faster and affect quality**. Grade A fetches 30% premium.";
  }
  if (c.includes('brinjal') || c.includes('eggplant')) {
    return "Sort and grade eggplants: select shiny, deep purple fruits without blemishes – **bruised eggplants become bitter**. Discard those with brown spots.";
  }
  if (c.includes('french beans') || c.includes('garden peas')) {
    return "Sort and grade French beans/peas: select bright green, well‑filled pods without blemishes – **broken pods shrivel quickly and lose value**. Discard dried or mouldy pods.";
  }
  if (c.includes('carrot')) return "Sort and grade carrots: remove broken, cracked or spotted roots – **damaged carrots spread rot to healthy ones and reduce price by 30%**. Clean, straight roots get premium prices.";
  if (c.includes('tomato')) return "Sort and grade tomatoes: separate evenly ripe, red tomatoes without cracks – **cracked tomatoes invite bacteria and rot early, lowering grade**. Grade A gets 2x price.";
  if (c.includes('avocado')) return "Sort and grade avocados: select well‑shaped fruits without blemishes – **internal blemishes indicate rot that spreads**. Grade 1 sells for 40% premium.";
  if (c.includes('onion')) return "Sort and grade onions: remove bruised, sprouted or black‑spotted bulbs – **damaged onions cause neck rot and sprouting in storage**. This prevents major losses.";
  return "Sort and grade your produce: remove damaged, mouldy or injured items – **removing bad produce prevents disease spread and improves price by 20-30%**.";
};

// ========== Crop‑specific value addition (expanded) ==========
const getValueAdditionSuggestion = (crop: string, language: string): string => {
  const c = crop.toLowerCase();
  if (language === 'sw') {
    if (c.includes('cabbage') || c.includes('kale')) {
      return "Ongeza thamani: Tengeneza sauerkraut (kabichi iliyochachuka) au kabichi kavu – **kuchachuka kunaongeza probiotics na kuhifadhi kwa miezi 6+, kukausha kunazuia uozo**. Pia unaweza kutengeneza coleslaw safi kwa bei ya juu.";
    }
    if (c.includes('spinach')) {
      return "Ongeza thamani: Kausha mchicha na ufunge kwa plastiki – **mchicha kavu huhifadhi virutubisho na hudumu miezi 12**. Pia unaweza kusaga kuwa unga wa mchicha kwa uji wa lishe.";
    }
    if (c.includes('lettuce')) {
      return "Ongeza thamani: Fungasha lettuce kwenye vifungashio vya plastiki vilivyowekewa unyevu – **hii inaongeza maisha ya rafu hadi wiki 2**. Fikiria kuuza lettuce iliyoosha na kupangwa tayari kula kwa bei ya juu.";
    }
    if (c.includes('broccoli') || c.includes('cauliflower')) {
      return "Ongeza thamani: Ganda na uuze vipande vilivyokatwa, au kausha na ufunge – **mboga zilizokatwa tayari hupata bei ya juu 40%**. Kukausha huongeza maisha ya rafu hadi miezi 12.";
    }
    if (c.includes('capsicum') || c.includes('pepper')) {
      return "Ongeza thamani: Tengeneza pilipili kavu, pilipili iliyosagwa (paprika), au pilipili iliyokatwa kwenye mafuta – **kukausha huongeza maisha ya rafu hadi miezi 12 na bei mara 3**. Pilipili nzima kavu huzuia ukungu.";
    }
    if (c.includes('brinjal') || c.includes('eggplant')) {
      return "Ongeza thamani: Kausha vipande vya biringani, tengeneza pickles, au uuze kama biringani zilizochomwa (grilled) – **kukausha kunazuia uozo na kudumisha ladha**. Pickles hudumu zaidi ya mwaka 1.";
    }
    if (c.includes('french beans') || c.includes('garden peas')) {
      return "Ongeza thamani: Kausha maharagwe au mbaazi, au weka kwenye mifuko ya plastiki kwa kufungia – **kukausha kunazuia ukungu na kuhifadhi protini, na kufungia huhifadhi ubora**. Maharagwe kavu huuzwa bei ya juu mara 2.";
    }
    if (c.includes('avocado')) return "Ongeza thamani: Tengeneza mafuta ya parachichi (avocado oil) au guacamole – **mafuta huhifadhi virutubisho na huuzwa bei ya juu mara 3**. Kausha vipande kwa jua ili kuondoa unyevu na kuzuia ukungu.";
    if (c.includes('mango')) return "Ongeza thamani: Tengeneza vipande vikavu vya maembe – **kukausha kunazuia ukuaji wa ukungu na kuongeza maisha ya rafu hadi miezi 12**. Bei ya maembe kavu ni mara 3 ya mabichi.";
    if (c.includes('tomato')) return "Ongeza thamani: Tengeneza nyanya kavu au kuwa paste – **kukausha kunapunguza unyevu, kuzuia bakteria, na kuongeza maisha ya rafu hadi miezi 6**. Bei ni mara 2 ya nyanya mbichi.";
    if (c.includes('cassava')) return "Ongeza thamani: Saga mihogo kuwa unga – **unga hauhitaji hifadhi maalum na hudumu zaidi ya mwaka 1**. Pia unaweza kutengeneza chips au wanga (starch) kwa matumizi ya viwandani.";
    if (c.includes('banana')) return "Ongeza thamani: Tengeneza unga wa ndizi au vipande vikavu – **unga una maisha marefu ya rafu na hutumika kwa uji wa lishe**. Ndizi kavu huuzwa bei ya juu mara 2.";
    return "Ongeza thamani: Kausha, saga, funga kwa plastiki – **kukausha huondoa unyevu unaosababisha uozo, na ufungaji mzuri huzuia wadudu**. Bidhaa iliyochakatwa ina bei mara 2-3.";
  }
  if (language === 'fr') {
    if (c.includes('cabbage')) return "Ajoutez de la valeur : Faites de la choucroute ou du chou séché – **la fermentation ajoute des probiotiques et conserve 6+ mois, le séchage empêche la pourriture**. Vendez aussi de la coleslaw fraîche à prix premium.";
    if (c.includes('spinach')) return "Ajoutez de la valeur : Séchez les épinards et emballez – **les épinards séchés conservent les nutriments et durent 12 mois**. Vous pouvez aussi les moudre en poudre pour une bouillie nutritive.";
    if (c.includes('lettuce')) return "Ajoutez de la valeur : Emballez la laitue dans des sachets perforés – **cela prolonge la durée de conservation à 2 semaines**. Vendez de la laitue lavée et prête à manger à un prix plus élevé.";
    if (c.includes('broccoli')) return "Ajoutez de la valeur : Coupez en fleurons et vendez frais, ou blanchissez et congelez – **les légumes pré‑découpés se vendent 40% plus cher**. La congélation préserve la qualité pendant 8 mois.";
    if (c.includes('capsicum')) return "Ajoutez de la valeur : Faites du poivron séché, du paprika, ou des poivrons marinés – **le séchage prolonge la durée de conservation à 12 mois et triple le prix**. Les poivrons entiers séchés empêchent les moisissures.";
    if (c.includes('brinjal')) return "Ajoutez de la valeur : Séchez les tranches, faites des pickles, ou vendez des aubergines grillées – **le séchage empêche la pourriture et préserve la saveur**. Les pickles durent plus d'un an.";
    if (c.includes('french beans')) return "Ajoutez de la valeur : Séchez les haricots/pois, ou congelez dans des sacs plastique – **le séchage empêche les moisissures et préserve les protéines, la congélation maintient la qualité**. Les haricots secs se vendent 2 fois plus cher.";
    if (c.includes('avocado')) return "Ajoutez de la valeur : Produisez de l'huile d'avocat – **l'huile conserve les nutriments et se vend 3 fois plus cher**. Séchez des tranches au soleil pour éliminer l'humidité et prévenir la moisissure.";
    if (c.includes('mango')) return "Ajoutez de la valeur : Faites des tranches de mangue séchées – **le séchage arrête la croissance des moisissures et prolonge la durée de conservation à 12+ mois**. Les mangues séchées se vendent 3 fois plus cher.";
    if (c.includes('tomato')) return "Ajoutez de la valeur : Faites des tomates séchées ou de la purée – **le séchage réduit l'humidité, arrête les bactéries, et prolonge la durée de conservation à 6 mois**. Le prix est 2 fois supérieur.";
    return "Ajoutez de la valeur : séchez, broyez, emballez – **le séchage élimine l'humidité qui cause la pourriture, et l'emballage hermétique empêche les insectes**.";
  }
  // English
  if (c.includes('cabbage') || c.includes('kale')) {
    return "Add value: Make sauerkraut (fermented cabbage) or dried cabbage – **fermentation adds probiotics and preserves for 6+ months, drying stops rot**. Also sell fresh coleslaw mix for premium.";
  }
  if (c.includes('spinach')) {
    return "Add value: Dry spinach and package – **dried spinach retains nutrients and lasts 12 months**. You can also grind into spinach powder for nutritious porridge.";
  }
  if (c.includes('lettuce')) {
    return "Add value: Package lettuce in perforated plastic bags – **this extends shelf life to 2 weeks**. Sell washed, ready‑to‑eat lettuce at a premium.";
  }
  if (c.includes('broccoli') || c.includes('cauliflower')) {
    return "Add value: Cut into florets and sell fresh, or blanch and freeze – **pre‑cut vegetables fetch 40% higher price**. Freezing preserves quality for 8 months.";
  }
  if (c.includes('capsicum') || c.includes('pepper')) {
    return "Add value: Make dried capsicum, paprika powder, or roasted peppers in oil – **drying extends shelf life to 12 months and triples price**. Whole dried capsicums prevent mould.";
  }
  if (c.includes('brinjal') || c.includes('eggplant')) {
    return "Add value: Dry slices, make pickles, or sell grilled eggplants – **drying prevents rot and preserves flavour**. Pickles last over 1 year.";
  }
  if (c.includes('french beans') || c.includes('garden peas')) {
    return "Add value: Dry beans/peas, or freeze in plastic bags – **drying stops mould and preserves protein, freezing retains quality**. Dried beans sell for 2x price.";
  }
  if (c.includes('avocado')) return "Add value: Make avocado oil or guacamole – **oil preserves nutrients and sells for 3x higher price**. Dry slices in the sun to remove moisture and prevent mould.";
  if (c.includes('mango')) return "Add value: Make dried mango slices – **drying stops mould growth and extends shelf life to 12+ months**. Dried mango sells for 3x fresh price.";
  if (c.includes('tomato')) return "Add value: Make sun‑dried tomatoes or paste – **drying reduces moisture, stopping bacteria, and extends shelf life to 6 months**. Price is 2x fresh tomatoes.";
  if (c.includes('cassava')) return "Add value: Make cassava flour – **flour needs no special storage and lasts over 1 year**. Also make chips or starch for industrial use.";
  if (c.includes('banana')) return "Add value: Make banana flour or dried slices – **flour has long shelf life and is used for nutritious porridge**. Dried bananas sell for 2x fresh price.";
  return "Add value: dry, mill, package – **drying removes moisture that causes rot, and good packaging prevents pests**. Processed products sell for 2-3x higher price.";
};

// ========== Crop‑specific cool/dark storage advice (expanded) ==========
const getCoolDarkStorageAdvice = (crop: string, language: string): string => {
  const c = crop.toLowerCase();
  if (c.includes('onion') || c.includes('garlic')) {
    if (language === 'sw') return "Hifadhi vitunguu mahali pa giza, kavu na baridi (0-2°C) – **mwanga husababisha kuota na kugeuka kijani (solanine), ambayo ina sumu na hupunguza thamani**. Giza pia huzuia ukuaji wa chipukizi.";
    if (language === 'fr') return "Stockez les oignons dans un endroit sombre, sec et frais (0-2°C) – **la lumière provoque la germination et le verdissement (solanine), toxique et réduit la valeur**.";
    return "Store onions in a dark, cool, dry place (0-2°C) – **light triggers sprouting and greening (solanine), which is toxic and reduces market value**. Darkness also prevents sprout growth.";
  }
  if (c.includes('potato')) {
    if (language === 'sw') return "Hifadhi viazi mahali pa giza, baridi (4-8°C) – **mwanga husababisha viazi kuwa kijani kwa sababu ya solanine, sumu inayosababisha kichefuchefu**. Giza huzuia hili na kuongeza maisha ya rafu.";
    if (language === 'fr') return "Stockez les pommes de terre dans l'obscurité, au frais (4-8°C) – **la lumière les fait verdir (solanine), toxique et amère**.";
    return "Store potatoes in a dark, cool place (4-8°C) – **light causes greening (solanine), a toxin that causes nausea and bitterness**. Darkness prevents this and extends shelf life.";
  }
  return "";
};

// ========== Crop‑specific storage chemical advice (only for grains, with reason) ==========
const getStorageChemicalAdvice = (crop: string, language: string): string => {
  const category = getCropCategory(crop);
  if (category !== 'grains' && category !== 'pulses') return '';
  if (language === 'sw') return "Kwa nafaka, ongeza Actellic Gold 50g kwa gunia la 90kg – **dawa hii huwaua wadudu wazima na mabuu kwa kuvuruga mfumo wao wa neva, lakini haiondoi aflatoxini**. Kausha nafaka hadi unyevu 13% kabla ya matumizi.";
  if (language === 'fr') return "Pour les céréales, ajoutez Actellic Gold 50g par sac de 90 kg – **cet insecticide tue les insectes adultes et les larves en perturbant leur système nerveux, mais n'élimine pas l'aflatoxine**. Séchez les grains à 13% d'humidité d'abord.";
  return "For grains, add Actellic Gold 50g per 90kg bag – **this insecticide kills adult insects and larvae by disrupting their nervous system, but does not remove aflatoxin**. Dry grain to 13% moisture first.";
};

// ========== Helper: nutrient description (includes micronutrients and benefits) ==========
const getNutrientDescription = (nutrient: string, language: string): string => {
  const n = nutrient.toLowerCase();
  if (language === 'sw') {
    if (n === 'n') return 'kwa ukuaji wa majani na shina';
    if (n === 'p') return 'kwa ukuaji wa mizizi na maua';
    if (n === 'k') return 'kwa ubora wa matunda, upinzani wa magonjwa, **utamu, rangi nzuri, na maisha marefu ya rafu**';
    if (n === 's') return 'kwa usanisi wa protini, rangi ya majani, **ladha na harufu**';
    if (n === 'ca') return 'kwa nguvu za seli, kuzuia uozo wa maua, **na kuongeza maisha ya rafu**';
    if (n === 'mg') return 'kwa usanisi wa klorofili (rangi ya kijani)';
    if (n === 'zn') return 'kwa uundaji wa homoni za ukuaji';
    if (n === 'b') return 'kwa ukuaji wa maua, uchavushaji, **umbo zuri la matunda, na mvuto sokoni**';
    if (n === 'cu') return 'kwa usanisi wa lignin (nguvu za mimea)';
    if (n === 'mn') return 'kwa usanisi wa klorofili na ulinzi wa seli';
    return '';
  }
  if (language === 'fr') {
    if (n === 'n') return 'pour la croissance des feuilles et tiges';
    if (n === 'p') return 'pour le développement des racines et fleurs';
    if (n === 'k') return 'pour la qualité des fruits, résistance aux maladies, **douceur, couleur attrayante et durée de conservation**';
    if (n === 's') return 'pour la synthèse des protéines, la couleur des feuilles, **la saveur et l\'arôme**';
    if (n === 'ca') return 'pour la solidité des parois cellulaires, prévention de la pourriture apicale, **et prolongation de la conservation**';
    if (n === 'mg') return 'pour la synthèse de la chlorophylle (couleur verte)';
    if (n === 'zn') return 'pour la formation des hormones de croissance';
    if (n === 'b') return 'pour la floraison, la pollinisation, **la forme des fruits et l\'attrait du marché**';
    if (n === 'cu') return 'pour la synthèse de la lignine (rigidité des tiges)';
    if (n === 'mn') return 'pour la photosynthèse et la protection cellulaire';
    return '';
  }
  // English
  if (n === 'n') return 'for leafy growth';
  if (n === 'p') return 'for root development';
  if (n === 'k') return 'for fruit quality, disease resistance, **sweetness, appealing colour, and longer shelf life**';
  if (n === 's') return 'for protein synthesis, leaf colour, **flavour and aroma**';
  if (n === 'ca') return 'for cell wall strength, blossom end rot prevention, **and extended shelf life**';
  if (n === 'mg') return 'for chlorophyll synthesis (green colour)';
  if (n === 'zn') return 'for growth hormone formation';
  if (n === 'b') return 'for flowering, pollination, **fruit shape, and improved market appeal**';
  if (n === 'cu') return 'for lignin synthesis (stem strength)';
  if (n === 'mn') return 'for chlorophyll synthesis and cell protection';
  return '';
};

// ========== Helper: format nutrient string with descriptions ==========
const formatNutrientString = (nutrientString: string | null, language: string): string => {
  if (!nutrientString || nutrientString === "No additional nutrients") return "";
  const pairs = nutrientString.split('+');
  const formatted = pairs.map(pair => {
    const match = pair.match(/(\d+(?:\.\d+)?)([A-Z]+)/);
    if (match) {
      const value = match[1];
      const element = match[2].toLowerCase();
      const desc = getNutrientDescription(element, language);
      return `${element.toUpperCase()}: ${value}% ${desc ? `(${desc})` : ''}`;
    }
    return pair;
  }).join(', ');
  if (language === 'sw') return `Virutubisho vya ziada: ${formatted}`;
  if (language === 'fr') return `Nutriments supplémentaires : ${formatted}`;
  return `Additional nutrients: ${formatted}`;
};

// ----- Translation helpers (keep your existing ones) -----
const getCulturalTranslation = (baseKey: string, fallbackText: string): string => {
  const translations = swTranslations as any;
  if (translations[baseKey]) return translations[baseKey];
  const cleanedKey = baseKey.replace(/_[0-9]+(_[0-9]+)*$/, '');
  if (cleanedKey !== baseKey && translations[cleanedKey]) return translations[cleanedKey];
  return fallbackText;
};

const getFrenchCulturalTranslation = (baseKey: string, fallbackText: string): string => {
  const translations = frTranslations as any;
  if (translations[baseKey]) return translations[baseKey];
  const cleanedKey = baseKey.replace(/_[0-9]+(_[0-9]+)*$/, '');
  if (cleanedKey !== baseKey && translations[cleanedKey]) return translations[cleanedKey];
  return fallbackText;
};

const translateRate = (rate: string, lang: string): string => {
  if (lang === 'sw') {
    const map: Record<string, string> = {
      "10ml per 20L water": "10 mililita kwa lita 20 za maji",
      "50g per 20L water": "50 gramu kwa lita 20 za maji",
      "40ml per 20L water": "40 mililita kwa lita 20 za maji",
      "20ml per 20L water": "20 mililita kwa lita 20 za maji",
      "4ml per 20L water": "4 mililita kwa lita 20 za maji",
      "5ml per 20L water": "5 mililita kwa lita 20 za maji",
      "30g per 20L water": "30 gramu kwa lita 20 za maji",
      "15g per 20L water": "15 gramu kwa lita 20 za maji"
    };
    return map[rate] || rate;
  }
  if (lang === 'fr') {
    const map: Record<string, string> = {
      "10ml per 20L water": "10 ml pour 20 L d'eau",
      "50g per 20L water": "50 g pour 20 L d'eau",
      "40ml per 20L water": "40 ml pour 20 L d'eau",
      "20ml per 20L water": "20 ml pour 20 L d'eau",
      "4ml per 20L water": "4 ml pour 20 L d'eau",
      "5ml per 20L water": "5 ml pour 20 L d'eau",
      "30g per 20L water": "30 g pour 20 L d'eau",
      "15g per 20L water": "15 g pour 20 L d'eau"
    };
    return map[rate] || rate;
  }
  return rate;
};

const translateTiming = (timing: string, lang: string): string => {
  if (lang === 'sw') {
    const map: Record<string, string> = {
      "When larvae young (1st-2nd instar)": "Wakati mabuu ni wachanga (1-2)",
      "When larvae young": "Wakati mabuu ni wachanga",
      "At first sign of larvae": "Wakati dalili za mabuu zinaonekana",
      "When larvae active": "Wakati mabuu wanashambulia",
      "When colonies appear": "Wakati makundi yanaonekana",
      "When aphids appear": "Wakati vidukari wanaonekana",
      "When webbing visible": "Wakati utando unaonekana",
      "When flies active": "Wakati nzi wanashambulia",
      "At first sign of disease, repeat every 7-10 days": "Dalili za kwanza za ugonjwa, rudia kila siku 7-10",
      "Every 7-10 days in wet weather": "Kila siku 7-10 wakati wa mvua",
      "At first sign of spots": "Wakati madoa yanaonekana",
      "Preventatively, every 7-10 days": "Kinga, kila siku 7-10",
      "Preventatively": "Kinga"
    };
    return map[timing] || timing;
  }
  if (lang === 'fr') {
    const map: Record<string, string> = {
      "When larvae young (1st-2nd instar)": "Quand les larves sont jeunes (1er-2e stade)",
      "When larvae young": "Quand les larves sont jeunes",
      "At first sign of larvae": "Au premier signe de larves",
      "When larvae active": "Quand les larves sont actives",
      "When colonies appear": "Quand les colonies apparaissent",
      "When aphids appear": "Quand les pucerons apparaissent",
      "When webbing visible": "Quand les toiles sont visibles",
      "When flies active": "Quand les mouches sont actives",
      "At first sign of disease, repeat every 7-10 days": "Au premier signe de maladie, répéter tous les 7-10 jours",
      "Every 7-10 days in wet weather": "Tous les 7-10 jours par temps humide",
      "At first sign of spots": "Au premier signe de taches",
      "Preventatively, every 7-10 days": "Préventivement, tous les 7-10 jours",
      "Preventatively": "Préventivement"
    };
    return map[timing] || timing;
  }
  return timing;
};

const translateSafety = (safety: string, lang: string): string => {
  if (lang === 'sw') {
    const map: Record<string, string> = {
      "14 days": "siku kumi na nne",
      "7 days": "siku saba",
      "21 days": "siku ishirini na moja",
      "30 days": "siku thelathini",
      "14 days before harvest": "siku kumi na nne kabla ya mavuno",
      "7 days before harvest": "siku saba kabla ya mavuno"
    };
    return map[safety] || safety;
  }
  if (lang === 'fr') {
    const map: Record<string, string> = {
      "14 days": "14 jours",
      "7 days": "7 jours",
      "21 days": "21 jours",
      "30 days": "30 jours",
      "14 days before harvest": "14 jours avant la récolte",
      "7 days before harvest": "7 jours avant la récolte"
    };
    return map[safety] || safety;
  }
  return safety;
};

const translateStatus = (status: string, lang: string): string => {
  if (lang === 'sw') {
    const map: Record<string, string> = {
      "✅ Active": "✅ Inatumika",
      "⚠️ RESTRICTED": "⚠️ IMERESTRISHWA",
      "❌ BANNED": "❌ IMEPIGWA MARUFUKU",
      "check-locally": "Angalia upatikanaji"
    };
    return map[status] || status;
  }
  if (lang === 'fr') {
    const map: Record<string, string> = {
      "✅ Active": "✅ Actif",
      "⚠️ RESTRICTED": "⚠️ RESTREINT",
      "❌ BANNED": "❌ INTERDIT",
      "check-locally": "Vérifiez la disponibilité locale"
    };
    return map[status] || status;
  }
  return status;
};

const translateOrganic = (text: string, lang: string): string => {
  if (lang === 'sw') {
    const map: Record<string, string> = {
      "Mix 50ml neem oil with 20L water + few drops liquid soap": "Changanya 50 mililita mafuta ya mwarobaini na lita 20 za maji + matone machache ya sabuni",
      "50ml neem oil per 20L water": "50 mililita mafuta ya mwarobaini kwa lita 20 za maji",
      "Spray every 10-14 days": "Pulizia kila siku 10-14",
      "Spray every 7-10 days": "Pulizia kila siku 7-10",
      "Spray on affected plants": "Pulizia kwenye mimea iliyoathirika",
      "Cover beds with insect netting": "Funika vitanda kwa nyavu za wadudu",
      "Install at planting, remove at harvest": "Weka wakati wa kupanda, ondoa wakati wa mavuno",
      "Plant onions or garlic between rows": "Panda vitunguu kati ya mistari",
      "Repels rust flies": "Huzuia nzi wa karoti",
      "Follow label instructions": "Fuata maagizo kwenye lebo",
      "Collect ladybirds from wild or purchase": "Kusanya kunguru porini au nunua",
      "Introduce ladybirds": "Weka kunguru",
      "Release 10-20 per plant": "Achia 10-20 kwa kila mmea",
      "Apply neem cake to soil": "Weka keki ya mwarobaini kwenye udongo",
      "200kg per acre before planting": "Kilo 200 kwa ekari kabla ya kupanda",
      "Plant marigolds before carrots": "Panda marigold kabla ya karoti",
      "Grow for one season, incorporate into soil": "Kua kwa msimu mmoja, changanya kwenye udongo",
      "Cover soil with clear plastic": "Funika udongo kwa plastiki wazi",
      "4-6 weeks during hot season": "Wiki 4-6 wakati wa joto",
      "Use yellow sticky traps": "Tumia mitego ya manjano yenye kunata",
      "Remove heavily infested leaves": "Ondoa majani yaliyoathirika sana",
      "Avoid excess nitrogen fertilizer which attracts aphids": "Epuka mbolea ya nitrojeni nyingi kwa sababu huvutia vidukari",
      "Handpicking": "Kukusanya kwa mkono",
      "Hand removal": "Kuondoa kwa mkono",
      "Hand removal (weekly)": "Kuondoa kwa mkono (kila wiki)",
      "Collect larvae in evening": "Kusanya mabuu jioni",
      "Drop in soapy water": "Weka kwenye maji ya sabuni",
      "Neem spray": "Pulizia ya mwarobaini",
      "Soap solution": "Suluhisho la sabuni",
      "Floating row covers": "Vifuniko vya safu",
      "Companion planting": "Upandaji pamoja",
      "Marigold rotation": "Mzunguko wa marigold",
      "Neem cake": "Keki ya mwarobaini",
      "Solarization": "Kutia jua",
      "Mix 2 tablespoons liquid soap in 5L water": "Changanya vijiko 2 vya sabuni kwa lita 5 za maji",
      "Spray directly on aphids": "Pulizia moja kwa moja kwenye vidukari"
    };
    return map[text] || text;
  }
  if (lang === 'fr') {
    const map: Record<string, string> = {
      "Mix 50ml neem oil with 20L water + few drops liquid soap": "Mélanger 50 ml d'huile de neem avec 20 L d'eau + quelques gouttes de savon liquide",
      "50ml neem oil per 20L water": "50 ml d'huile de neem pour 20 L d'eau",
      "Spray every 10-14 days": "Pulvériser tous les 10-14 jours",
      "Spray every 7-10 days": "Pulvériser tous les 7-10 jours",
      "Spray on affected plants": "Pulvériser sur les plantes affectées",
      "Cover beds with insect netting": "Couvrir les planches avec une moustiquaire",
      "Install at planting, remove at harvest": "Installer à la plantation, retirer à la récolte",
      "Plant onions or garlic between rows": "Planter des oignons ou de l'ail entre les rangs",
      "Repels rust flies": "Repousse les mouches de la rouille",
      "Follow label instructions": "Suivre les instructions sur l'étiquette",
      "Collect ladybirds from wild or purchase": "Collecter des coccinelles dans la nature ou en acheter",
      "Introduce ladybirds": "Introduire des coccinelles",
      "Release 10-20 per plant": "Lâcher 10-20 par plante",
      "Apply neem cake to soil": "Appliquer du tourteau de neem sur le sol",
      "200kg per acre before planting": "200 kg par acre avant la plantation",
      "Plant marigolds before carrots": "Planter des œillets d'Inde avant les carottes",
      "Grow for one season, incorporate into soil": "Cultiver pendant une saison, incorporer au sol",
      "Cover soil with clear plastic": "Couvrir le sol avec du plastique transparent",
      "4-6 weeks during hot season": "4-6 semaines pendant la saison chaude",
      "Use yellow sticky traps": "Utiliser des pièges jaunes collants",
      "Remove heavily infested leaves": "Retirer les feuilles fortement infestées",
      "Avoid excess nitrogen fertilizer which attracts aphids": "Éviter l'excès d'engrais azoté qui attire les pucerons",
      "Handpicking": "Cueillette manuelle",
      "Hand removal": "Retrait manuel",
      "Hand removal (weekly)": "Retrait manuel (hebdomadaire)",
      "Collect larvae in evening": "Collecter les larves le soir",
      "Drop in soapy water": "Plonger dans de l'eau savonneuse",
      "Neem spray": "Pulvérisation de neem",
      "Soap solution": "Solution savonneuse",
      "Floating row covers": "Couvertures flottantes",
      "Companion planting": "Culture associée",
      "Marigold rotation": "Rotation avec œillets d'Inde",
      "Neem cake": "Tourteau de neem",
      "Solarization": "Solarisation",
      "Mix 2 tablespoons liquid soap in 5L water": "Mélanger 2 cuillères à soupe de savon liquide dans 5 L d'eau",
      "Spray directly on aphids": "Pulvériser directement sur les pucerons",
      "Spray when larvae are young; safe for beneficial insects": "Pulvériser quand les larves sont jeunes ; sans danger pour les insectes utiles",
      "Spray when larvae young": "Pulvériser quand les larves sont jeunes",
      "Purchase DBM pheromone lures": "Achetez des leurres à phéromones de la teigne des crucifères",
      "Place 4-6 traps per acre for monitoring, 10-12 for mass trapping": "Placez 4-6 pièges par acre pour la surveillance, 10-12 pour le piégeage de masse",
      "Remove and destroy webbed leaves": "Retirer et détruire les feuilles toilées",
      "Weekly": "Hebdomadaire"
    };
    return map[text] || text;
  }
  return text;
};

const translateNote = (note: string, lang: string): string => {
  if (lang === 'sw') {
    const map: Record<string, string> = {
      "Highly effective, rotate with other products": "Inafanya kazi vizuri, badilisha bidhaa",
      "⚠️ BANNED in Tanzania (Jan 2026). Check local regulations before recommending.": "⚠️ IMEPIGWA MARUFUKU Tanzania (Jan 2026). Angalia sheria za eneo lako kabla ya kupendekeza."
    };
    return map[note] || note;
  }
  if (lang === 'fr') {
    const map: Record<string, string> = {
      "Highly effective, rotate with other products": "Très efficace, alternez avec d'autres produits",
      "⚠️ BANNED in Tanzania (Jan 2026). Check local regulations before recommending.": "⚠️ INTERDIT en Tanzanie (janv. 2026). Vérifiez la réglementation locale avant de recommander."
    };
    return map[note] || note;
  }
  return note;
};



// ========== MAIN generateRecommendations FUNCTION ==========
export async function generateRecommendations(input: RecommendationInput): Promise<RecommendationOutput> {
  const structuredList: RecommendationItem[] = [];
  const { hasSoilTest, soilAnalysis, fertilizerPlan, crop, farmerData } = input;
  const lowerCrop = crop.toLowerCase();
  const country = farmerData.country || 'kenya';
  const language = farmerData.language || 'en';
  const isSwahili = language === 'sw';
  const isFrench = language === 'fr';

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

  // ========== GROUP 1: SOIL TEST ANALYSIS ==========
  if (hasSoilTest && soilAnalysis) {
    const soilLines: string[] = [];
    if (isSwahili) {
      soilLines.push(`pH: ${soilAnalysis.ph || '?'} (${soilAnalysis.phRating === 'Very Low' ? 'Chini Sana' : soilAnalysis.phRating === 'Low' ? 'Chini' : soilAnalysis.phRating})`);
      if (soilAnalysis.ph < 5.5) soilLines.push(`– Asidi nyingi. Inahitaji chokaa.`);
      soilLines.push(`Fosforasi (P): ${soilAnalysis.phosphorus || '?'} ppm (${soilAnalysis.phosphorusRating === 'Very Low' ? 'Chini Sana' : soilAnalysis.phosphorusRating})`);
      if (soilAnalysis.phosphorus < 15) soilLines.push(`– Chini. Inahitaji mbolea ya fosforasi.`);
      soilLines.push(`Potasiamu (K): ${soilAnalysis.potassium || '?'} ppm (${soilAnalysis.potassiumRating === 'Very Low' ? 'Chini Sana' : soilAnalysis.potassiumRating})`);
      if (soilAnalysis.potassium < 100) soilLines.push(`– Chini. Inahitaji mbolea ya potasiamu.`);
      soilLines.push(`Kalsiamu (Ca): ${soilAnalysis.calcium || '?'} ppm (${soilAnalysis.calciumRating === 'Very Low' ? 'Chini Sana' : soilAnalysis.calciumRating})`);
      soilLines.push(`Magnesiamu (Mg): ${soilAnalysis.magnesium || '?'} ppm (${soilAnalysis.magnesiumRating === 'Very Low' ? 'Chini Sana' : soilAnalysis.magnesiumRating})`);
      soilLines.push(`Nitrojeni (N): ${soilAnalysis.totalNitrogen || '?'}% (${soilAnalysis.totalNitrogenRating === 'Very Low' ? 'Chini Sana' : soilAnalysis.totalNitrogenRating})`);
      soilLines.push(`Mabaki Hai: ${soilAnalysis.organicMatter || '?'}% (${soilAnalysis.organicMatterRating === 'Very Low' ? 'Chini Sana' : soilAnalysis.organicMatterRating})`);
    } else if (isFrench) {
      soilLines.push(`pH : ${soilAnalysis.ph || '?'} (${soilAnalysis.phRating === 'Very Low' ? 'Très faible' : soilAnalysis.phRating === 'Low' ? 'Faible' : soilAnalysis.phRating})`);
      if (soilAnalysis.ph < 5.5) soilLines.push(`– Trop acide. Besoin de chaux.`);
      soilLines.push(`Phosphore (P) : ${soilAnalysis.phosphorus || '?'} ppm (${soilAnalysis.phosphorusRating === 'Very Low' ? 'Très faible' : soilAnalysis.phosphorusRating})`);
      if (soilAnalysis.phosphorus < 15) soilLines.push(`– Faible. Besoin d'engrais phosphaté.`);
      soilLines.push(`Potassium (K) : ${soilAnalysis.potassium || '?'} ppm (${soilAnalysis.potassiumRating === 'Very Low' ? 'Très faible' : soilAnalysis.potassiumRating})`);
      if (soilAnalysis.potassium < 100) soilLines.push(`– Faible. Besoin d'engrais potassique.`);
      soilLines.push(`Calcium (Ca) : ${soilAnalysis.calcium || '?'} ppm (${soilAnalysis.calciumRating === 'Very Low' ? 'Très faible' : soilAnalysis.calciumRating})`);
      soilLines.push(`Magnésium (Mg) : ${soilAnalysis.magnesium || '?'} ppm (${soilAnalysis.magnesiumRating === 'Very Low' ? 'Très faible' : soilAnalysis.magnesiumRating})`);
      soilLines.push(`Azote (N) : ${soilAnalysis.totalNitrogen || '?'}% (${soilAnalysis.totalNitrogenRating === 'Very Low' ? 'Très faible' : soilAnalysis.totalNitrogenRating})`);
      soilLines.push(`Matière organique : ${soilAnalysis.organicMatter || '?'}% (${soilAnalysis.organicMatterRating === 'Very Low' ? 'Très faible' : soilAnalysis.organicMatterRating})`);
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
        title: isSwahili ? SW.soil_analysis_title : isFrench ? FR.soil_analysis_title : 'SOIL TEST ANALYSIS - KNOW YOUR SOIL, GROW YOUR BUSINESS',
        content: soilLines.join('\n'),
        insight: isSwahili ? SW.soil_business_insight(currencySymbol) : isFrench ? FR.soil_business_insight(currencySymbol) : `BUSINESS INSIGHT: Every ${currencySymbol}1 invested in soil correction returns ${currencySymbol}3-5 in higher yields!`,
        yearly: isSwahili ? SW.soil_test_yearly : isFrench ? FR.soil_test_yearly : 'TEST SOIL YEARLY to track improvements and adjust inputs.',
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
        whyText = SW.calcitic_lime_why_acidic_low_ca(soilAnalysis.ph, soilAnalysis.calcium);
      } else if (soilAnalysis && soilAnalysis.ph < 5.5) {
        whyText = SW.calcitic_lime_why_acidic(soilAnalysis.ph);
      } else if (soilAnalysis && soilAnalysis.calcium && soilAnalysis.calcium < 400) {
        whyText = SW.calcitic_lime_why_low_ca(soilAnalysis.calcium);
      }
    } else if (isFrench) {
      if (soilAnalysis && soilAnalysis.ph < 5.5 && soilAnalysis.calcium && soilAnalysis.calcium < 400) {
        whyText = FR.calcitic_lime_why_acidic_low_ca(soilAnalysis.ph, soilAnalysis.calcium);
      } else if (soilAnalysis && soilAnalysis.ph < 5.5) {
        whyText = FR.calcitic_lime_why_acidic(soilAnalysis.ph);
      } else if (soilAnalysis && soilAnalysis.calcium && soilAnalysis.calcium < 400) {
        whyText = FR.calcitic_lime_why_low_ca(soilAnalysis.calcium);
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
        title: isSwahili ? SW.calcitic_lime_title : isFrench ? FR.calcitic_lime_title : 'CALCITIC LIME RECOMMENDATION FROM YOUR SOIL TEST',
        need: isSwahili ? SW.calcitic_lime_need(limeKg) : isFrench ? FR.calcitic_lime_need(limeKg) : `Based on your soil test, you need ${limeKg} kg of calcitic lime per acre.`,
        bags: isSwahili ? SW.calcitic_lime_bags(bagsNeeded) : isFrench ? FR.calcitic_lime_bags(bagsNeeded) : `This is ${bagsNeeded} bags of 50kg.`,
        cost: isSwahili ? SW.calcitic_lime_cost(formatCurrency(totalCost), formatCurrency(limePricePerBag)) : isFrench ? FR.calcitic_lime_cost(formatCurrency(totalCost), formatCurrency(limePricePerBag)) : `Cost: ${formatCurrency(totalCost)} (${formatCurrency(limePricePerBag)} per bag)`,
        why: whyText,
        application: isSwahili ? SW.calcitic_lime_application : isFrench ? FR.calcitic_lime_application : 'Apply 3-4 weeks before planting and incorporate into top 10-15cm soil.',
        wait: isSwahili ? SW.calcitic_lime_wait : isFrench ? FR.calcitic_lime_wait : 'Wait 1-2 weeks before applying nitrogen fertilizers.',
        business: isSwahili ? SW.calcitic_lime_business_case : isFrench ? FR.calcitic_lime_business_case : 'BUSINESS CASE: Proper pH can increase nutrient uptake by 30-50%!',
        yearly: isSwahili ? SW.soil_test_yearly_reapply : isFrench ? FR.soil_test_yearly_reapply : 'TEST SOIL YEARLY to know when to reapply.',
        kg: limeKg,
        bags: bagsNeeded,
        total: formatCurrency(totalCost),
        perBag: formatCurrency(limePricePerBag),
        ph: soilAnalysis?.ph,
        ca: soilAnalysis?.calcium
      }
    });
  }
// ========== DOLOMITIC LIME RECOMMENDATION (with translation keys) ==========
if (hasSoilTest && soilAnalysis) {
  // Get auto-calculated recommendation
  const autoDolomitic = soilTestInterpreter.getDolomiticLimeRecommendation(soilAnalysis);
  let dolomiticNeeded = autoDolomitic.needed;
  let limeKg = autoDolomitic.kgPerAcre;

  // If user provided a custom rate, use that instead (and mark as needed)
  if (farmerData.recDolomiticLime && farmerData.recDolomiticLime > 0) {
    limeKg = farmerData.recDolomiticLime;
    dolomiticNeeded = true;
  }

  if (dolomiticNeeded) {
    const dolomiticPricePerBag = farmerData.dolomiticLimePricePerBag || farmerData.limePricePerBag || 300;
    const bagsNeeded = Math.ceil(limeKg / 50);
    const totalCost = bagsNeeded * dolomiticPricePerBag;
    let whyText = autoDolomitic.reason;
    if (farmerData.recDolomiticLime && farmerData.recDolomiticLime > 0) {
      whyText = `You specified a custom rate of ${limeKg} kg/acre. ${autoDolomitic.reason}`;
    }

    // Helper to replace placeholders in translation strings
    const replacePlaceholders = (template: string, params: Record<string, string | number>) => {
      let result = template;
      for (const [key, value] of Object.entries(params)) {
        result = result.replace(new RegExp(`{{${key}}}`, 'g'), value.toString());
      }
      return result;
    };

    // Build translated strings
    let title, need, bagsText, costText, application, wait, business, yearly;
    if (isSwahili) {
      title = SW.dolomitic_lime_title;
      need = replacePlaceholders(SW.dolomitic_lime_need, { kg: limeKg });
      bagsText = replacePlaceholders(SW.dolomitic_lime_bags, { bags: bagsNeeded });
      costText = replacePlaceholders(SW.dolomitic_lime_cost, { total: formatCurrency(totalCost), perBag: formatCurrency(dolomiticPricePerBag) });
      application = SW.dolomitic_lime_application;
      wait = SW.dolomitic_lime_wait;
      business = SW.dolomitic_lime_business_case;
      yearly = SW.dolomitic_lime_yearly;
    } else if (isFrench) {
      title = FR.dolomitic_lime_title;
      need = replacePlaceholders(FR.dolomitic_lime_need, { kg: limeKg });
      bagsText = replacePlaceholders(FR.dolomitic_lime_bags, { bags: bagsNeeded });
      costText = replacePlaceholders(FR.dolomitic_lime_cost, { total: formatCurrency(totalCost), perBag: formatCurrency(dolomiticPricePerBag) });
      application = FR.dolomitic_lime_application;
      wait = FR.dolomitic_lime_wait;
      business = FR.dolomitic_lime_business_case;
      yearly = FR.dolomitic_lime_yearly;
    } else {
      title = "DOLOMITIC LIME RECOMMENDATION FROM YOUR SOIL TEST";
      need = `Based on your soil test, you need ${limeKg} kg of dolomitic lime per acre.`;
      bagsText = `This is ${bagsNeeded} bags of 50kg.`;
      costText = `Cost: ${formatCurrency(totalCost)} (${formatCurrency(dolomiticPricePerBag)} per bag)`;
      application = "Apply 3-4 weeks before planting and incorporate into top 10-15cm soil.";
      wait = "Wait 1-2 weeks before applying nitrogen fertilizers.";
      business = "BUSINESS CASE: Proper magnesium improves chlorophyll synthesis and photosynthesis!";
      yearly = "TEST SOIL YEARLY to know when to reapply.";
    }

    structuredList.push({
      key: 'dolomitic_lime_grouped',
      params: {
        title,
        need,
        bags: bagsText,
        cost: costText,
        why: whyText,
        application,
        wait,
        business,
        yearly,
        kg: limeKg,
        bags: bagsNeeded,
        total: formatCurrency(totalCost),
        perBag: formatCurrency(dolomiticPricePerBag),
        mg: soilAnalysis?.magnesium,
        caMgRatio: soilAnalysis?.calcium && soilAnalysis?.magnesium ? (soilAnalysis.calcium / soilAnalysis.magnesium).toFixed(1) : undefined
      }
    });
  }
}
  // ========== GROUP 3: FERTILIZER PLAN HEADER ==========
  if (hasSoilTest && fertilizerPlan) {
    structuredList.push({
      key: 'fertilizer_header_grouped',
      params: {
        title: isSwahili ? SW.fertilizer_plan_title(crop) : isFrench ? FR.fertilizer_plan_title(crop) : `PRECISION FERTILIZER INVESTMENT PLAN for your ${crop.toUpperCase()} ENTERPRISE`,
        farmSize: isSwahili ? SW.fertilizer_plan_farm_size(fertilizerPlan.farmSize) : isFrench ? FR.fertilizer_plan_farm_size(fertilizerPlan.farmSize) : `Your farm size: ${fertilizerPlan.farmSize} acre(s)`,
        totalInvestment: isSwahili ? SW.fertilizer_plan_total_investment(formatCurrency(fertilizerPlan.totalCost || 0)) : isFrench ? FR.fertilizer_plan_total_investment(formatCurrency(fertilizerPlan.totalCost || 0)) : `TOTAL FERTILIZER INVESTMENT: ${formatCurrency(fertilizerPlan.totalCost || 0)} for your entire farm`,
        crop: crop.toUpperCase(),
        size: fertilizerPlan.farmSize,
        amount: formatCurrency(fertilizerPlan.totalCost || 0)
      }
    });
  } else if (hasSoilTest) {
    structuredList.push({
      key: 'fertilizer_header_grouped',
      params: {
        title: isSwahili ? SW.fertilizer_plan_title(crop) : isFrench ? FR.fertilizer_plan_title(crop) : `PRECISION FERTILIZER INVESTMENT PLAN for your ${crop.toUpperCase()} ENTERPRISE`,
        farmSize: isSwahili ? SW.fertilizer_plan_farm_size(1) : isFrench ? FR.fertilizer_plan_farm_size(1) : `Your farm size: 1 acre(s)`,
        totalInvestment: isSwahili ? SW.fertilizer_plan_total_investment(formatCurrency(0)) : isFrench ? FR.fertilizer_plan_total_investment(formatCurrency(0)) : `TOTAL FERTILIZER INVESTMENT: ${formatCurrency(0)} for your entire farm`,
        crop: crop.toUpperCase(),
        size: 1,
        amount: formatCurrency(0)
      }
    });
  }

  // ========== GROUP 4: PLANTING FERTILIZERS ==========
  if (hasSoilTest && fertilizerPlan && fertilizerPlan.plantingRecommendations?.length > 0) {
    const plantingLines: string[] = [];
    plantingLines.push(isSwahili ? SW.fertilizer_planting_section : isFrench ? FR.fertilizer_planting_section : 'PLANTING FERTILIZERS (apply at planting)');
    fertilizerPlan.plantingRecommendations.forEach((rec: any) => {
      const bagsNeeded = Math.floor(rec.amountKg / 50);
      const extraKg = rec.amountKg % 50;
      const cost = Math.round(rec.amountKg * (rec.pricePer50kg / 50));
      const providesParts = [];
      if (rec.provides.n > 0) providesParts.push(`${rec.provides.n.toFixed(1)} kg N`);
      if (rec.provides.p > 0) providesParts.push(`${rec.provides.p.toFixed(1)} kg P`);
      if (rec.provides.k > 0) providesParts.push(`${rec.provides.k.toFixed(1)} kg K`);
      const providesText = providesParts.map(part => {
        const match = part.match(/([\d.]+) kg ([NPK])/);
        if (match) {
          const amount = match[1];
          const nutrient = match[2];
          const desc = getNutrientDescription(nutrient, language);
          return `${amount} kg ${nutrient} ${desc ? `(${desc})` : ''}`;
        }
        return part;
      }).join(', ');
      if (isSwahili) {
        plantingLines.push(
          `${SW.buy} ${rec.amountKg} ${SW.kg_of} ${rec.brand} (${rec.npk})`,
          `${SW.this_is} ${bagsNeeded} ${SW.bags_of_50kg} ${extraKg}${SW.kg_open}`,
          `${SW.cost} ${formatCurrency(cost)}`,
          `${SW.provides}: ${providesText}`
        );
        if (soilAnalysis?.plantingFertilizerNutrients) {
          const nutrientText = formatNutrientString(soilAnalysis.plantingFertilizerNutrients, language);
          if (nutrientText) plantingLines.push(nutrientText);
        }
        plantingLines.push(``);
      } else if (isFrench) {
        plantingLines.push(
          `${FR.buy} ${rec.amountKg} ${FR.kg_of} ${rec.brand} (${rec.npk})`,
          `${FR.this_is} ${bagsNeeded} ${FR.bags_of_50kg} ${extraKg}${FR.kg_open}`,
          `${FR.cost} ${formatCurrency(cost)}`,
          `${FR.provides}: ${providesText}`
        );
        if (soilAnalysis?.plantingFertilizerNutrients) {
          const nutrientText = formatNutrientString(soilAnalysis.plantingFertilizerNutrients, language);
          if (nutrientText) plantingLines.push(nutrientText);
        }
        plantingLines.push(``);
      } else {
        plantingLines.push(
          `Buy ${rec.amountKg} kg of ${rec.brand} (${rec.npk})`,
          `This is ${bagsNeeded} bag(s) of 50kg + ${extraKg}kg open`,
          `Cost: ${formatCurrency(cost)}`,
          `Provides: ${providesText}`
        );
        if (soilAnalysis?.plantingFertilizerNutrients) {
          const nutrientText = formatNutrientString(soilAnalysis.plantingFertilizerNutrients, language);
          if (nutrientText) plantingLines.push(nutrientText);
        }
        plantingLines.push(``);
      }
    });
    structuredList.push({
      key: 'planting_fertilizers_grouped',
      params: { content: plantingLines.join('\n') }
    });
  } else if (hasSoilTest) {
    structuredList.push({
      key: 'planting_fertilizers_grouped',
      params: { content: isSwahili ? SW.fertilizer_planting_section + '\n(Hakuna mapendekezo ya mbolea ya upandaji)' : isFrench ? FR.fertilizer_planting_section + '\n(Aucune recommandation d\'engrais de plantation)' : 'PLANTING FERTILIZERS (apply at planting)\n(No planting fertilizer recommendations)' }
    });
  }

  // ========== GROUP 5: TOP DRESSING FERTILIZERS ==========
  if (hasSoilTest && fertilizerPlan && fertilizerPlan.topDressingRecommendations?.length > 0) {
    const topdressingLines: string[] = [];
    topdressingLines.push(isSwahili ? SW.fertilizer_topdressing_section : isFrench ? FR.fertilizer_topdressing_section : 'TOP DRESSING FERTILIZERS (apply 3-4 weeks after planting)');
    fertilizerPlan.topDressingRecommendations.forEach((rec: any) => {
      const bagsNeeded = Math.floor(rec.amountKg / 50);
      const extraKg = rec.amountKg % 50;
      const cost = Math.round(rec.amountKg * (rec.pricePer50kg / 50));
      const providesParts = [];
      if (rec.provides.n > 0) providesParts.push(`${rec.provides.n.toFixed(1)} kg N`);
      if (rec.provides.k > 0) providesParts.push(`${rec.provides.k.toFixed(1)} kg K`);
      const providesText = providesParts.map(part => {
        const match = part.match(/([\d.]+) kg ([NPK])/);
        if (match) {
          const amount = match[1];
          const nutrient = match[2];
          const desc = getNutrientDescription(nutrient, language);
          return `${amount} kg ${nutrient} ${desc ? `(${desc})` : ''}`;
        }
        return part;
      }).join(', ');
      if (isSwahili) {
        topdressingLines.push(
          `${SW.buy} ${rec.amountKg} ${SW.kg_of} ${rec.brand} (${rec.npk})`,
          `${SW.this_is} ${bagsNeeded} ${SW.bags_of_50kg} ${extraKg}${SW.kg_open}`,
          `${SW.cost} ${formatCurrency(cost)}`,
          `${SW.provides}: ${providesText}`
        );
        if (rec.brand.includes('UREA') && soilAnalysis?.topdressingFertilizerNutrients) {
          const nutrientText = formatNutrientString(soilAnalysis.topdressingFertilizerNutrients, language);
          if (nutrientText) topdressingLines.push(nutrientText);
        } else if (rec.brand.includes('MOP') && soilAnalysis?.potassiumFertilizerNutrients) {
          const nutrientText = formatNutrientString(soilAnalysis.potassiumFertilizerNutrients, language);
          if (nutrientText) topdressingLines.push(nutrientText);
        }
        topdressingLines.push(``);
      } else if (isFrench) {
        topdressingLines.push(
          `${FR.buy} ${rec.amountKg} ${FR.kg_of} ${rec.brand} (${rec.npk})`,
          `${FR.this_is} ${bagsNeeded} ${FR.bags_of_50kg} ${extraKg}${FR.kg_open}`,
          `${FR.cost} ${formatCurrency(cost)}`,
          `${FR.provides}: ${providesText}`
        );
        if (rec.brand.includes('UREA') && soilAnalysis?.topdressingFertilizerNutrients) {
          const nutrientText = formatNutrientString(soilAnalysis.topdressingFertilizerNutrients, language);
          if (nutrientText) topdressingLines.push(nutrientText);
        } else if (rec.brand.includes('MOP') && soilAnalysis?.potassiumFertilizerNutrients) {
          const nutrientText = formatNutrientString(soilAnalysis.potassiumFertilizerNutrients, language);
          if (nutrientText) topdressingLines.push(nutrientText);
        }
        topdressingLines.push(``);
      } else {
        topdressingLines.push(
          `Buy ${rec.amountKg} kg of ${rec.brand} (${rec.npk})`,
          `This is ${bagsNeeded} bag(s) of 50kg + ${extraKg}kg open`,
          `Cost: ${formatCurrency(cost)}`,
          `Provides: ${providesText}`
        );
        if (rec.brand.includes('UREA') && soilAnalysis?.topdressingFertilizerNutrients) {
          const nutrientText = formatNutrientString(soilAnalysis.topdressingFertilizerNutrients, language);
          if (nutrientText) topdressingLines.push(nutrientText);
        } else if (rec.brand.includes('MOP') && soilAnalysis?.potassiumFertilizerNutrients) {
          const nutrientText = formatNutrientString(soilAnalysis.potassiumFertilizerNutrients, language);
          if (nutrientText) topdressingLines.push(nutrientText);
        }
        topdressingLines.push(``);
      }
    });
    structuredList.push({
      key: 'topdressing_fertilizers_grouped',
      params: { content: topdressingLines.join('\n') }
    });
  } else if (hasSoilTest) {
    structuredList.push({
      key: 'topdressing_fertilizers_grouped',
      params: { content: isSwahili ? SW.fertilizer_topdressing_section + '\n(Hakuna mapendekezo ya mbolea ya kurutubisha)' : isFrench ? FR.fertilizer_topdressing_section + '\n(Aucune recommandation d\'engrais de couverture)' : 'TOP DRESSING FERTILIZERS (apply 3-4 weeks after planting)\n(No top dressing fertilizer recommendations)' }
    });
  }

  // ========== GROUP 6: PLANT POPULATION ==========
  if (hasSoilTest && fertilizerPlan && fertilizerPlan.perPlant) {
    const perPlant = fertilizerPlan.perPlant;
    const plantLines: string[] = [];
    const spacingValue = farmerData.spacing || "your spacing";
    if (isSwahili) {
      plantLines.push(SW.plant_population_title);
      plantLines.push(`Kulingana na nafasi yako ya ${spacingValue}, una takriban mimea ${perPlant.totalPlants?.toLocaleString()} kwenye shamba lako la ekari ${fertilizerPlan.farmSize}.`);
      plantLines.push('');
      plantLines.push(SW.fertilizer_per_plant_title);
      plantLines.push(SW.fertilizer_per_plant_dap(perPlant.dapGrams));
      plantLines.push(SW.fertilizer_per_plant_urea(perPlant.ureaGrams));
      plantLines.push(SW.fertilizer_per_plant_mop(perPlant.mopGrams));
      plantLines.push(SW.fertilizer_per_plant_total(perPlant.totalGrams));
    } else if (isFrench) {
      plantLines.push(FR.plant_population_title);
      plantLines.push(`Selon votre espacement de ${spacingValue}, vous avez environ ${perPlant.totalPlants?.toLocaleString()} plants sur vos ${fertilizerPlan.farmSize} acres.`);
      plantLines.push('');
      plantLines.push(FR.fertilizer_per_plant_title);
      plantLines.push(FR.fertilizer_per_plant_dap(perPlant.dapGrams));
      plantLines.push(FR.fertilizer_per_plant_urea(perPlant.ureaGrams));
      plantLines.push(FR.fertilizer_per_plant_mop(perPlant.mopGrams));
      plantLines.push(FR.fertilizer_per_plant_total(perPlant.totalGrams));
    } else {
      plantLines.push('---\nPLANT POPULATION');
      plantLines.push(`Based on your spacing of ${spacingValue}, you have approximately ${perPlant.totalPlants?.toLocaleString()} plants on your ${fertilizerPlan.farmSize} acre farm.`);
      plantLines.push('');
      plantLines.push('FERTILIZER PER PLANT');
      plantLines.push(`DAP: ${perPlant.dapGrams} grams (${perPlant.dapGuide})`);
      plantLines.push(`UREA: ${perPlant.ureaGrams} grams (${perPlant.ureaGuide})`);
      plantLines.push(`MOP: ${perPlant.mopGrams} grams (${perPlant.mopGuide})`);
      plantLines.push(`TOTAL: ${perPlant.totalGrams} grams (${perPlant.totalGuide})`);
    }
    structuredList.push({
      key: 'plant_population_grouped',
      params: {
        content: plantLines.join('\n'),
        totalPlants: perPlant.totalPlants?.toLocaleString(),
        farmSize: fertilizerPlan.farmSize,
        grams: perPlant.dapGrams,
        ureaGrams: perPlant.ureaGrams,
        mopGrams: perPlant.mopGrams,
        totalGrams: perPlant.totalGrams
      }
    });
  } else if (hasSoilTest) {
    structuredList.push({
      key: 'plant_population_grouped',
      params: { content: isSwahili ? SW.plant_population_title + '\n(Hakuna data ya idadi ya mimea)' : isFrench ? FR.plant_population_title + '\n(Aucune donnée de population végétale)' : '---\nPLANT POPULATION\n(No plant population data available)' }
    });
  }

  // ========== GROUP 7: BUSINESS TIP ==========
  structuredList.push({
    key: 'fertilizer_business_tip',
    params: { symbol: currencySymbol, content: isSwahili ? SW.fertilizer_business_tip(currencySymbol) : isFrench ? FR.fertilizer_business_tip(currencySymbol) : undefined }
  });

  // ========== GROUP 8: FERTILIZER REMEMBER ==========
  structuredList.push({
    key: 'fertilizer_remember',
    params: { crop: crop.toUpperCase(), content: isSwahili ? SW.fertilizer_remember(crop) : isFrench ? FR.fertilizer_remember(crop) : undefined }
  });

  // ========== GROUP 9: GROSS MARGIN ANALYSIS ==========
  let actualYieldKg = farmerData.actualYieldKg || 0;
  let pricePerKg = farmerData.pricePerKg || 0;
  let actualCosts = farmerData.totalCosts || 0;
  if (!actualYieldKg || actualYieldKg === 0) {
    const defaultYields: Record<string, number> = {
      // Cereals & grains
      maize: 2000, rice: 3000, wheat: 2000, barley: 2000, sorghum: 1500, millet: 1200,
      "finger millet": 1200, teff: 1000, triticale: 2000, oats: 1500, buckwheat: 1000,
      quinoa: 1200, fonio: 800, spelt: 1500, kamut: 1500, "amaranth grain": 800,
      // Pulses & legumes
      beans: 1200, cowpeas: 800, "green grams": 800, groundnuts: 1000, "soya beans": 1000,
      pigeonpeas: 1000, bambaranuts: 800, chickpea: 800, lentil: 800, "faba bean": 1000,
      peanut: 1000,
      // Root crops & tubers
      cassava: 8000, "sweet potatoes": 7000, "irish potatoes": 10000, yams: 12000, taro: 10000,
      ginger: 8000, turmeric: 6000, horseradish: 5000, parsnip: 8000, turnip: 8000, rutabaga: 8000,
      // Vegetables
      tomatoes: 15000, onions: 8000, carrots: 10000, cabbages: 12000, kales: 8000,
      capsicums: 8000, chillies: 6000, brinjals: 10000, "french beans": 5000, "garden peas": 4000,
      spinach: 8000, okra: 7000, lettuce: 8000, broccoli: 6000, cauliflower: 6000,
      celery: 8000, leeks: 8000, beetroot: 8000, radish: 8000, pumpkin: 10000,
      courgettes: 8000, cucumbers: 10000, "pumpkin leaves": 8000, "sweet potato leaves": 8000,
      "ethiopian kale": 8000, "jute mallow": 6000, "spider plant": 6000, "african nightshade": 5000,
      amaranth: 4000, arugula: 5000, asparagus: 3000, artichoke: 5000, rhubarb: 8000,
      wasabi: 5000, "bok choy": 8000, "collard greens": 8000, "mustard greens": 6000,
      "swiss chard": 8000, radicchio: 6000, escarole: 6000, frisee: 6000, "turnip greens": 6000,
      // Fruits
      bananas: 6000, mangoes: 8000, avocados: 2000, oranges: 10000, pineapples: 20000,
      watermelons: 15000, pawpaws: 10000, "passion fruit": 8000, grapefruit: 10000, lemons: 10000,
      limes: 8000, guava: 8000, jackfruit: 5000, breadfruit: 5000, pomegranate: 6000,
      "star fruit": 8000, coconut: 3000, cashew: 2000, macadamia: 4000, fig: 6000,
      "date palm": 5000, mulberry: 4000, lychee: 5000, persimmon: 6000, gooseberry: 4000,
      currant: 3000, elderberry: 3000, rambutan: 5000, durian: 8000, mangosteen: 4000,
      longan: 5000, marula: 4000,
      // Cash crops
      coffee: 2000, tea: 2500, cocoa: 800, cotton: 2000, sunflower: 1500, simsim: 500,
      sugarcane: 40000, tobacco: 2000, sisal: 5000, pyrethrum: 1000, "oil palm": 8000,
      rubber: 500,
      // Cover crops
      canavalia: 2000, crotalaria: 2000, desmodium: 5000, dolichos: 2000, mucuna: 2000, vetch: 2000,
      // Herbs & spices
      vanilla: 1000, "black pepper": 2000, cardamom: 1000, cinnamon: 2000, cloves: 1000,
      coriander: 1000, basil: 2000, mint: 2000, rosemary: 2000, thyme: 2000, oregano: 2000,
      sage: 2000, dill: 1000, fennel: 2000, lavender: 1000, chamomile: 1000, echinacea: 1000,
      ginseng: 1000, goldenseal: 1000, "stinging nettle": 5000, moringa: 5000, stevia: 1000,
      fenugreek: 800, cumin: 500, caraway: 500, anise: 500, lovage: 2000, marjoram: 2000,
      tarragon: 2000, sorrel: 2000, chervil: 2000, savory: 2000, calendula: 1000, nasturtium: 2000,
      borage: 2000, "st. john's wort": 1000, valerian: 1000,
      // Forage grasses
      alfalfa: 8000, brachiaria: 10000, "buffel grass": 6000, "guinea grass": 8000,
      "italian ryegrass": 8000, "napier grass": 20000, "napier hybrid": 25000, "orchard grass": 8000,
      "rhodes grass": 8000, "timothy grass": 8000, "white clover": 5000, "forage sorghum": 15000,
      leucaena: 8000, calliandra: 8000, sesbania: 8000, cenchrus: 6000,
      // Other
      bamboo: 5000, "aloe vera": 10000, "oyster nut": 2000, watercress: 5000, ramie: 3000,
      flax: 1000, hemp: 2000, jute: 2000, kenaf: 2000, "slender leaf": 4000
    };
    actualYieldKg = defaultYields[lowerCrop] || 2000;
  }
  if (!pricePerKg || pricePerKg === 0) {
    const defaultPrices: Record<string, number> = {
      // Cereals & grains
      maize: 40, rice: 60, wheat: 45, barley: 40, sorghum: 45, millet: 50,
      "finger millet": 50, teff: 60, triticale: 45, oats: 35, buckwheat: 50,
      quinoa: 80, fonio: 60, spelt: 55, kamut: 60, "amaranth grain": 50,
      // Pulses & legumes
      beans: 80, cowpeas: 70, "green grams": 70, groundnuts: 120, "soya beans": 60,
      pigeonpeas: 70, bambaranuts: 80, chickpea: 80, lentil: 70, "faba bean": 60,
      peanut: 120,
      // Root crops & tubers
      cassava: 20, "sweet potatoes": 25, "irish potatoes": 30, yams: 50, taro: 40,
      ginger: 80, turmeric: 100, horseradish: 40, parsnip: 30, turnip: 25, rutabaga: 25,
      // Vegetables
      tomatoes: 40, onions: 50, carrots: 40, cabbages: 25, kales: 20,
      capsicums: 50, chillies: 80, brinjals: 40, "french beans": 60, "garden peas": 50,
      spinach: 25, okra: 35, lettuce: 30, broccoli: 50, cauliflower: 40,
      celery: 30, leeks: 40, beetroot: 30, radish: 25, pumpkin: 30,
      courgettes: 40, cucumbers: 30, "pumpkin leaves": 20, "sweet potato leaves": 20,
      "ethiopian kale": 20, "jute mallow": 20, "spider plant": 20, "african nightshade": 30,
      amaranth: 20, arugula: 30, asparagus: 100, artichoke: 80, rhubarb: 50,
      wasabi: 200, "bok choy": 30, "collard greens": 20, "mustard greens": 20,
      "swiss chard": 25, radicchio: 40, escarole: 30, frisee: 30, "turnip greens": 20,
      // Fruits
      bananas: 30, mangoes: 50, avocados: 40, oranges: 40, pineapples: 40,
      watermelons: 30, pawpaws: 30, "passion fruit": 50, grapefruit: 30, lemons: 30,
      limes: 30, guava: 30, jackfruit: 40, breadfruit: 30, pomegranate: 50,
      "star fruit": 40, coconut: 20, cashew: 100, macadamia: 150, fig: 60,
      "date palm": 80, mulberry: 40, lychee: 80, persimmon: 60, gooseberry: 40,
      currant: 50, elderberry: 40, rambutan: 80, durian: 100, mangosteen: 120,
      longan: 70, marula: 50,
      // Cash crops
      coffee: 300, tea: 200, cocoa: 300, cotton: 100, sunflower: 60, simsim: 80,
      sugarcane: 5, tobacco: 200, sisal: 10, pyrethrum: 200, "oil palm": 300,
      rubber: 100,
      // Cover crops
      canavalia: 30, crotalaria: 30, desmodium: 30, dolichos: 40, mucuna: 30, vetch: 30,
      // Herbs & spices
      vanilla: 500, "black pepper": 300, cardamom: 200, cinnamon: 200, cloves: 300,
      coriander: 50, basil: 50, mint: 40, rosemary: 60, thyme: 60, oregano: 50,
      sage: 50, dill: 40, fennel: 50, lavender: 100, chamomile: 100, echinacea: 80,
      ginseng: 500, goldenseal: 200, "stinging nettle": 20, moringa: 30, stevia: 100,
      fenugreek: 50, cumin: 80, caraway: 60, anise: 70, lovage: 40, marjoram: 50,
      tarragon: 60, sorrel: 30, chervil: 40, savory: 50, calendula: 40, nasturtium: 30,
      borage: 30, "st. john's wort": 40, valerian: 50,
      // Forage grasses
      alfalfa: 10, brachiaria: 8, "buffel grass": 8, "guinea grass": 8,
      "italian ryegrass": 8, "napier grass": 5, "napier hybrid": 6, "orchard grass": 8,
      "rhodes grass": 8, "timothy grass": 8, "white clover": 10, "forage sorghum": 6,
      leucaena: 8, calliandra: 8, sesbania: 8, cenchrus: 8,
      // Other
      bamboo: 50, "aloe vera": 10, "oyster nut": 100, watercress: 30, ramie: 20,
      flax: 40, hemp: 50, jute: 30, kenaf: 30, "slender leaf": 20
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
    gmLines.push(SW.gross_margin_title(crop));
    gmLines.push(SW.gross_margin_intro);
    gmLines.push('');
    gmLines.push(SW.low_management);
    gmLines.push(`${SW.yield} ${lowYieldKg.toLocaleString()} ${SW.kg_times} ${formatCurrency(pricePerKg)} = ${formatCurrency(lowRevenue)}`);
    gmLines.push(`${SW.costs} ${formatCurrency(lowCosts)}`);
    gmLines.push(`${SW.gross_margin} ${formatCurrency(lowGM)}`);
    gmLines.push('');
    gmLines.push(SW.medium_management);
    gmLines.push(`${SW.yield} ${mediumYieldKg.toLocaleString()} ${SW.kg_times} ${formatCurrency(pricePerKg)} = ${formatCurrency(mediumRevenue)}`);
    gmLines.push(`${SW.costs} ${formatCurrency(mediumCosts)}`);
    gmLines.push(`${SW.gross_margin} ${formatCurrency(mediumGM)}`);
    gmLines.push('');
    gmLines.push(SW.high_management);
    gmLines.push(`${SW.yield} ${highYieldKg.toLocaleString()} ${SW.kg_times} ${formatCurrency(pricePerKg)} = ${formatCurrency(highRevenue)}`);
    gmLines.push(`${SW.costs} ${formatCurrency(highCosts)}`);
    gmLines.push(`${SW.gross_margin} ${formatCurrency(highGM)}`);
    gmLines.push('');
    gmLines.push(SW.business_summary(farmerData.farmerName || "Mkulima", formatCurrency(mediumCosts), formatCurrency(mediumGM), (mediumRevenue / mediumCosts).toFixed(1)));
  } else if (isFrench) {
    gmLines.push(FR.gross_margin_title(crop));
    gmLines.push(FR.gross_margin_intro);
    gmLines.push('');
    gmLines.push(FR.low_management);
    gmLines.push(`${FR.yield} ${lowYieldKg.toLocaleString()} ${FR.kg_times} ${formatCurrency(pricePerKg)} = ${formatCurrency(lowRevenue)}`);
    gmLines.push(`${FR.costs} ${formatCurrency(lowCosts)}`);
    gmLines.push(`${FR.gross_margin} ${formatCurrency(lowGM)}`);
    gmLines.push('');
    gmLines.push(FR.medium_management);
    gmLines.push(`${FR.yield} ${mediumYieldKg.toLocaleString()} ${FR.kg_times} ${formatCurrency(pricePerKg)} = ${formatCurrency(mediumRevenue)}`);
    gmLines.push(`${FR.costs} ${formatCurrency(mediumCosts)}`);
    gmLines.push(`${FR.gross_margin} ${formatCurrency(mediumGM)}`);
    gmLines.push('');
    gmLines.push(FR.high_management);
    gmLines.push(`${FR.yield} ${highYieldKg.toLocaleString()} ${FR.kg_times} ${formatCurrency(pricePerKg)} = ${formatCurrency(highRevenue)}`);
    gmLines.push(`${FR.costs} ${formatCurrency(highCosts)}`);
    gmLines.push(`${FR.gross_margin} ${formatCurrency(highGM)}`);
    gmLines.push('');
    gmLines.push(FR.business_summary(farmerData.farmerName || "Agriculteur", formatCurrency(mediumCosts), formatCurrency(mediumGM), (mediumRevenue / mediumCosts).toFixed(1)));
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
    gmLines.push(SW.from_low_to_medium(lowToMediumIncrease));
    gmLines.push(SW.from_medium_to_high(mediumToHighIncrease));
    gmLines.push(SW.every_invested(currencySymbol, roi));
    gmLines.push(SW.your_current_level(farmerData.managementLevel || "Kati"));
    gmLines.push('');
    gmLines.push(SW.bottom_line);
    gmLines.push(SW.moving_from(farmerData.managementLevel || "Kati", formatCurrency(highGM - mediumGM)));
  } else if (isFrench) {
    gmLines.push(FR.from_low_to_medium(lowToMediumIncrease));
    gmLines.push(FR.from_medium_to_high(mediumToHighIncrease));
    gmLines.push(FR.every_invested(currencySymbol, roi));
    gmLines.push(FR.your_current_level(farmerData.managementLevel || "Moyen"));
    gmLines.push('');
    gmLines.push(FR.bottom_line);
    gmLines.push(FR.moving_from(farmerData.managementLevel || "Moyen", formatCurrency(highGM - mediumGM)));
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
    params: {
      content: gmLines.join('\n'),
      crop: crop.toUpperCase(),
      lowYield: lowYieldKg.toLocaleString(),
      mediumYield: mediumYieldKg.toLocaleString(),
      highYield: highYieldKg.toLocaleString(),
      price: formatCurrency(pricePerKg),
      lowRevenue: formatCurrency(lowRevenue),
      mediumRevenue: formatCurrency(mediumRevenue),
      highRevenue: formatCurrency(highRevenue),
      lowCosts: formatCurrency(lowCosts),
      mediumCosts: formatCurrency(mediumCosts),
      highCosts: formatCurrency(highCosts),
      lowGM: formatCurrency(lowGM),
      mediumGM: formatCurrency(mediumGM),
      highGM: formatCurrency(highGM),
      percentLowToMedium: lowToMediumIncrease,
      percentMediumToHigh: mediumToHighIncrease,
      roi: roi,
      level: farmerData.managementLevel || (isSwahili ? "Kati" : isFrench ? "Moyen" : "Medium"),
      from: farmerData.managementLevel || (isSwahili ? "Kati" : isFrench ? "Moyen" : "Medium"),
      amount: formatCurrency(highGM - mediumGM),
      symbol: currencySymbol
    }
  });

  // ========== GROUP 10: GAP ==========
  const gapKeys: Record<string, string> ={
    // === Grains & Cereals ===
    maize: "gap_maize", wheat: "gap_wheat", barley: "gap_barley", rice: "gap_rice",
    sorghum: "gap_sorghum", "finger millet": "gap_finger_millet", millet: "gap_millet",
    teff: "gap_teff", triticale: "gap_triticale", oats: "gap_oats", buckwheat: "gap_buckwheat",
    quinoa: "gap_quinoa", fonio: "gap_fonio", spelt: "gap_spelt", kamut: "gap_kamut",
    "amaranth grain": "gap_amaranth_grain",
    // Pulses & Legumes
    beans: "gap_beans", "soya beans": "gap_soya_beans", cowpeas: "gap_cowpeas",
    "green grams": "gap_green_grams", groundnuts: "gap_groundnuts", pigeonpeas: "gap_pigeonpeas",
    "bambara nuts": "gap_bambaranuts", chickpea: "gap_chickpea", "faba bean": "gap_faba_bean",
    lentil: "gap_lentil", peanut: "gap_peanut", clover: "gap_clover", vetch: "gap_vetch",
    desmodium: "gap_desmodium", dolichos: "gap_dolichos", mucuna: "gap_mucuna",
    canavalia: "gap_canavalia", "sunn hemp": "gap_sunn_hemp", "slender leaf": "gap_slender_leaf",
    "crotalaria paulina": "gap_crotalaria_paulina",
    // Root & Tuber Crops
    cassava: "gap_cassava", "sweet potatoes": "gap_sweet_potatoes", "irish potatoes": "gap_irish_potatoes",
    potatoes: "gap_potatoes", yams: "gap_yams", taro: "gap_taro", carrots: "gap_carrots",
    beetroot: "gap_beetroot", radish: "gap_radish", parsnip: "gap_parsnip", turnip: "gap_turnip",
    rutabaga: "gap_rutabaga", ginger: "gap_ginger", turmeric: "gap_turmeric", horseradish: "gap_horseradish",
    // Vegetables
    tomatoes: "gap_tomatoes", kales: "gap_kales", cabbages: "gap_cabbages", capsicums: "gap_capsicums",
    brinjals: "gap_brinjals", eggplants: "gap_brinjals", "french beans": "gap_french_beans",
    "garden peas": "gap_garden_peas", spinach: "gap_spinach", okra: "gap_okra", onions: "gap_onions",
    cauliflower: "gap_cauliflower", broccoli: "gap_broccoli", leeks: "gap_leeks", celery: "gap_celery",
    lettuce: "gap_lettuce", "african nightshade": "gap_african_nightshade", amaranth: "gap_amaranth",
    "spider plant": "gap_spider_plant", "pumpkin leaves": "gap_pumpkin_leaves", "jute mallow": "gap_jute_mallow",
    "ethiopian kale": "gap_ethiopian_kale", pumpkin: "gap_pumpkin", courgettes: "gap_courgettes",
    cucumbers: "gap_cucumbers", endive: "gap_endive", kohlrabi: "gap_kohlrabi", "sweet potato leaves": "gap_sweet_potato_leaves",
    watercress: "gap_watercress", rhubarb: "gap_rhubarb", artichoke: "gap_artichoke", asparagus: "gap_asparagus",
    arugula: "gap_arugula", "bok choy": "gap_bok_choy", "collard greens": "gap_collard_greens",
    "mustard greens": "gap_mustard_greens", "swiss chard": "gap_swiss_chard", radicchio: "gap_radicchio",
    escarole: "gap_escarole", frisee: "gap_frisee", "turnip greens": "gap_turnip_greens", wasabi: "gap_wasabi",
    // Fruits
    bananas: "gap_bananas", mangoes: "gap_mangoes", pineapples: "gap_pineapples", watermelons: "gap_watermelons",
    avocado: "gap_avocados", avocados: "gap_avocados", oranges: "gap_oranges", pawpaws: "gap_pawpaws",
    "passion fruit": "gap_passion_fruit", lemons: "gap_lemons", limes: "gap_limes", grapefruit: "gap_grapefruit",
    guava: "gap_guava", jackfruit: "gap_jackfruit", breadfruit: "gap_breadfruit", pomegranate: "gap_pomegranate",
    "star fruit": "gap_star_fruit", coconut: "gap_coconut", cashew: "gap_cashew", "oil palm": "gap_oil_palm",
    fig: "gap_fig", "date palm": "gap_date_palm", mulberry: "gap_mulberry", lychee: "gap_lychee",
    persimmon: "gap_persimmon", gooseberry: "gap_gooseberry", currant: "gap_currant", elderberry: "gap_elderberry",
    rambutan: "gap_rambutan", durian: "gap_durian", mangosteen: "gap_mangosteen", longan: "gap_longan",
    marula: "gap_marula",
    // Cash & Industrial Crops
    coffee: "gap_coffee", cocoa: "gap_cocoa", tea: "gap_tea", cotton: "gap_cotton", sugarcane: "gap_sugarcane",
    tobacco: "gap_tobacco", sunflower: "gap_sunflower", simsim: "gap_simsim", sesame: "gap_simsim",
    sisal: "gap_sisal", rubber: "gap_rubber", hemp: "gap_hemp", flax: "gap_flax", jute: "gap_jute",
    kenaf: "gap_kenaf", pyrethrum: "gap_pyrethrum",
    // Nuts
    macadamia: "gap_macadamia", almond: "gap_almond", chestnut: "gap_chestnut", hazelnut: "gap_hazelnut",
    walnut: "gap_walnut", pecan: "gap_pecan", pistachio: "gap_pistachio", "brazil nut": "gap_brazil_nut",
    "pili nut": "gap_pili_nut", shea: "gap_shea",
    // Herbs & Spices
    vanilla: "gap_vanilla", cardamom: "gap_cardamom", cinnamon: "gap_cinnamon", cloves: "gap_cloves",
    "black pepper": "gap_black_pepper", "lemon grass": "gap_lemon_grass", rosemary: "gap_rosemary",
    thyme: "gap_thyme", parsley: "gap_parsley", coriander: "gap_coriander", basil: "gap_basil",
    mint: "gap_mint", oregano: "gap_oregano", sage: "gap_sage", dill: "gap_dill", fennel: "gap_fennel",
    lavender: "gap_lavender", chamomile: "gap_chamomile", echinacea: "gap_echinacea", ginseng: "gap_ginseng",
    goldenseal: "gap_goldenseal", moringa: "gap_moringa", mustard: "gap_mustard", stevia: "gap_stevia",
    fenugreek: "gap_fenugreek", cumin: "gap_cumin", caraway: "gap_caraway", anise: "gap_anise",
    lovage: "gap_lovage", marjoram: "gap_marjoram", tarragon: "gap_tarragon", sorrel: "gap_sorrel",
    chervil: "gap_chervil", savory: "gap_savory", calendula: "gap_calendula", nasturtium: "gap_nasturtium",
    borage: "gap_borage", "st. john's wort": "gap_st_johns_wort", valerian: "gap_valerian",
    "birds eye chili": "gap_birds_eye_chili", cayenne: "gap_cayenne", jalapeno: "gap_jalapeno",
    // Forage Grasses & Cover Crops
    alfalfa: "gap_alfalfa", lucerne: "gap_lucerne", brachiaria: "gap_brachiaria", "guinea grass": "gap_guinea_grass",
    "buffel grass": "gap_buffel_grass", "napier grass": "gap_napier_grass", "napier hybrid": "gap_napier_hybrid",
    "rhodes grass": "gap_rhodes_grass", "italian ryegrass": "gap_italian_ryegrass", "timothy grass": "gap_timothy_grass",
    "orchard grass": "gap_orchard_grass", "white clover": "gap_white_clover", "forage sorghum": "gap_forage_sorghum",
    leucaena: "gap_leucaena", calliandra: "gap_calliandra", sesbania: "gap_sesbania", cenchrus: "gap_cenchrus",
    // Other / Perennial
    bamboo: "gap_bamboo", "aloe vera": "gap_aloe_vera", hibiscus: "gap_hibiscus", "stinging nettle": "gap_stinging_nettle",
    mushroom: "gap_mushroom", "oyster nut": "gap_oyster_nut", ramie: "gap_ramie"
  };
  const gapKey = lowerCrop in gapKeys ? gapKeys[lowerCrop] : 'gap_generic';
  structuredList.push({
    key: 'gap_grouped',
    params: {
      title: isSwahili ? SW.gap_title(crop) : isFrench ? FR.gap_title(crop) : `GOOD AGRICULTURAL PRACTICES FOR YOUR ${crop.toUpperCase()} ENTERPRISE`,
      gapKey: gapKey,
      gapContent: '',
      remember: isSwahili ? SW.gap_remember : isFrench ? FR.gap_remember : 'REMEMBER: Every practice you do well puts more money in your pocket',
      crop: crop.toUpperCase()
    }
  });

  // ========== GROUP 11: DISEASE MANAGEMENT ==========
  if (farmerData.commonDiseases) {
    const diseaseLines: string[] = [];
    diseaseLines.push(isSwahili ? SW.disease_management_title(crop) : isFrench ? FR.disease_management_title(crop) : `INTEGRATED DISEASE MANAGEMENT FOR YOUR ${crop.toUpperCase()} ENTERPRISE`);
    diseaseLines.push(isSwahili ? SW.disease_reported(farmerData.commonDiseases) : isFrench ? FR.disease_reported(farmerData.commonDiseases) : `The diseases affecting your ${crop.toUpperCase()} ENTERPRISE:`);
    const diseaseList = farmerData.commonDiseases.split(',').map(d => d.trim()).filter(d => d);
    diseaseList.forEach(disease => { diseaseLines.push(`• ${disease}`); });
    diseaseLines.push('');
    diseaseLines.push(isSwahili ? SW.disease_prevention_title : isFrench ? FR.disease_prevention_title : 'PREVENTION (Cheaper than cure)');
    const cropLookupKey = lowerCrop.replace(/\s+/g, '');
    const cropPestsAndDiseases = cropPestDiseaseMap[cropLookupKey] || cropPestDiseaseMap[lowerCrop] || [];
    const cropDiseases = cropPestsAndDiseases.filter((pd: PestDisease) => pd.type === "disease");
    const userDiseases = farmerData.commonDiseases.split(',').map(d => d.trim().toLowerCase());
    const filteredDiseases = userDiseases.length > 0
      ? cropDiseases.filter(disease =>
          userDiseases.some(userDisease =>
            disease.name.toLowerCase().includes(userDisease)
          )
        )
      : cropDiseases;
    const preventionSet = new Set<string>();
    filteredDiseases.forEach(disease => {
      disease.culturalControls.forEach(control => {
        preventionSet.add(control);
      });
    });
    const preventionList = Array.from(preventionSet);
    if (preventionList.length === 0) {
      diseaseLines.push('• Use disease-resistant varieties where available\n• Practice crop rotation (3-4 years) for soil-borne diseases\n• Ensure proper spacing for air circulation\n• Avoid working in wet fields to prevent spread\n• Remove and destroy infected plants immediately\n• Disinfect tools between fields');
    } else {
      preventionList.forEach(item => { diseaseLines.push(`• ${item}`); });
    }
    diseaseLines.push('');
    if (filteredDiseases.length > 0) {
      diseaseLines.push(isSwahili ? SW.disease_control_title : isFrench ? FR.disease_control_title : 'CONTROL OPTIONS FOR DISEASES IN YOUR FARM:');
      filteredDiseases.forEach(disease => {
        diseaseLines.push('');
        diseaseLines.push(`📌 ${disease.name.toUpperCase()}`);
        if (disease.culturalControls.length > 0) {
          diseaseLines.push(isSwahili ? SW.disease_cultural_control : isFrench ? FR.disease_cultural_control : '  Cultural Control:');
          disease.culturalControls.forEach(control => {
            if (isSwahili) {
              const diseaseKey = disease.name.toLowerCase().replace(/\s+/g, '_').replace(/[()]/g, '');
              const controlKey = control.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
              const translationKey = `disease_cultural_${diseaseKey}_${controlKey}`.substring(0, 100);
              const translated = getCulturalTranslation(translationKey, control);
              diseaseLines.push(`  • ${translated}`);
            } else if (isFrench) {
              const diseaseKey = disease.name.toLowerCase().replace(/\s+/g, '_').replace(/[()]/g, '');
              const controlKey = control.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
              const translationKey = `disease_cultural_${diseaseKey}_${controlKey}`.substring(0, 100);
              const translated = getFrenchCulturalTranslation(translationKey, control);
              diseaseLines.push(`  • ${translated}`);
            } else {
              diseaseLines.push(`  • ${control}`);
            }
          });
        }
        if (disease.organicControls && disease.organicControls.length > 0) {
          diseaseLines.push(isSwahili ? '  Udhibiti wa kikaboni:' : isFrench ? '  Lutte biologique :' : '  Organic Control:');
          disease.organicControls.forEach(organic => {
            if (isSwahili) {
              diseaseLines.push(`  • ${translateOrganic(organic.method, language)}`);
              diseaseLines.push(`    Maandalizi: ${translateOrganic(organic.preparation, language)}`);
              diseaseLines.push(`    Matumizi: ${translateOrganic(organic.application, language)}`);
            } else if (isFrench) {
              diseaseLines.push(`  • ${translateOrganic(organic.method, language)}`);
              diseaseLines.push(`    Préparation : ${translateOrganic(organic.preparation, language)}`);
              diseaseLines.push(`    Application : ${translateOrganic(organic.application, language)}`);
            } else {
              diseaseLines.push(`  • ${organic.method}`);
              diseaseLines.push(`    Preparation: ${organic.preparation}`);
              diseaseLines.push(`    Application: ${organic.application}`);
            }
          });
        } else {
          diseaseLines.push(isSwahili ? '  Udhibiti wa kikaboni: Hakuna (hakuna tiba ya virusi)' : isFrench ? '  Lutte biologique : Aucun (pas de remède pour les virus)' : '  Organic Control: None (no cure for viruses)');
        }
        if (disease.chemicalControls.length > 0) {
          diseaseLines.push(isSwahili ? SW.disease_chemical_control : isFrench ? FR.disease_chemical_control : '  Chemical Control:');
          disease.chemicalControls.forEach(chem => {
            if (isSwahili) {
              diseaseLines.push(`  • ${chem.productName} (${chem.activeIngredient})`);
              diseaseLines.push(`    ${SW.disease_rate} ${translateRate(chem.rate, language)}`);
              diseaseLines.push(`    Kiwango kwa ekari: ${chem.ratePerAcre}`);
              diseaseLines.push(`    ${SW.disease_timing} ${translateTiming(chem.timing, language)}`);
              if (chem.safetyInterval) diseaseLines.push(`    ${SW.disease_safety} ${translateSafety(chem.safetyInterval, language)}`);
              if (chem.packageSizes) diseaseLines.push(`    ${SW.disease_pack_sizes} ${chem.packageSizes.join(' • ')}`);
              const statusText = chem.status === 'restricted' ? '⚠️ RESTRICTED' : chem.status === 'banned' ? '❌ BANNED' : '✅ Active';
              diseaseLines.push(`    ${SW.disease_status} ${translateStatus(statusText, language)}`);
              if (chem.notes) diseaseLines.push(`    ${translateNote(chem.notes, language)}`);
            } else if (isFrench) {
              diseaseLines.push(`  • ${chem.productName} (${chem.activeIngredient})`);
              diseaseLines.push(`    ${FR.disease_rate} ${translateRate(chem.rate, language)}`);
              diseaseLines.push(`    Dose par acre : ${chem.ratePerAcre}`);
              diseaseLines.push(`    ${FR.disease_timing} ${translateTiming(chem.timing, language)}`);
              if (chem.safetyInterval) diseaseLines.push(`    ${FR.disease_safety} ${translateSafety(chem.safetyInterval, language)}`);
              if (chem.packageSizes) diseaseLines.push(`    ${FR.disease_pack_sizes} ${chem.packageSizes.join(' • ')}`);
              const statusText = chem.status === 'restricted' ? '⚠️ RESTRICTED' : chem.status === 'banned' ? '❌ BANNED' : '✅ Active';
              diseaseLines.push(`    ${FR.disease_status} ${translateStatus(statusText, language)}`);
              if (chem.notes) diseaseLines.push(`    ${translateNote(chem.notes, language)}`);
            } else {
              diseaseLines.push(`  • ${chem.productName} (${chem.activeIngredient})`);
              diseaseLines.push(`    Rate: ${chem.rate}`);
              diseaseLines.push(`    Rate per acre: ${chem.ratePerAcre}`);
              diseaseLines.push(`    Timing: ${chem.timing}`);
              if (chem.safetyInterval) diseaseLines.push(`    Safety: ${chem.safetyInterval}`);
              if (chem.packageSizes) diseaseLines.push(`    Pack sizes: ${chem.packageSizes.join(' • ')}`);
              const statusText = chem.status === 'restricted' ? '⚠️ RESTRICTED' : chem.status === 'banned' ? '❌ BANNED' : '✅ Active';
              diseaseLines.push(`    Status: ${statusText}`);
              if (chem.notes) diseaseLines.push(`    Note: ${chem.notes}`);
            }
          });
        } else {
          diseaseLines.push(isSwahili ? '  Udhibiti wa kemikali: Hakuna (hakuna tiba ya virusi)' : isFrench ? '  Lutte chimique : Aucun (pas de remède pour les virus)' : '  Chemical Control: None (no cure for viruses)');
        }
        let businessNote = disease.businessNote;
        if (isSwahili) {
          if (disease.name === "Black rot (Xanthomonas campestris)") businessNote = "Uozo mweusi huenea kwa kasi wakati wa mvua. Matibabu ya mbegu kwa maji moto ni ya bei nafuu na yenye ufanisi.";
          else if (disease.name === "Downy mildew (Peronospora parasitica)") businessNote = "Ukungu hustawi katika hali ya baridi na unyevu. Nafasi sahihi (30-45cm) huboresha mzunguko wa hewa.";
          else if (disease.name === "Alternaria leaf spot (Alternaria brassicae)") businessNote = "Alternaria husababisha madoa kama shabaha kwenye majani. Kuondoa majani yaliyoathirika mapema hupunguza kuenea.";
          else if (disease.name === "Clubroot (Plasmodiophora brassicae)") businessNote = "Kichomi hukaa kwenye udongo kwa miaka 10+! Kuweka chokaa hadi pH 7.0 ndio udhibiti bora zaidi.";
        } else if (isFrench) {
          if (disease.name === "Black rot (Xanthomonas campestris)") businessNote = "La pourriture noire se propage rapidement par temps humide. Le traitement des semences à l'eau chaude est peu coûteux et efficace.";
          else if (disease.name === "Downy mildew (Peronospora parasitica)") businessNote = "Le mildiou prospère dans des conditions fraîches et humides. Un espacement correct (30-45 cm) améliore la circulation de l'air.";
          else if (disease.name === "Alternaria leaf spot (Alternaria brassicae)") businessNote = "L'alternariose provoque des taches circulaires sur les feuilles. L'élimination précoce des feuilles infectées réduit la propagation.";
          else if (disease.name === "Clubroot (Plasmodiophora brassicae)") businessNote = "La hernie des racines survit dans le sol pendant plus de 10 ans ! L'ajout de chaux jusqu'à pH 7,0 est le contrôle le plus efficace.";
        }
        if (businessNote) diseaseLines.push(`  💼 ${businessNote}`);
      });
    }
    diseaseLines.push('');
    diseaseLines.push(isSwahili ? SW.disease_business_case_title : isFrench ? FR.disease_business_case_title : 'BUSINESS CASE');
    diseaseLines.push(isSwahili ? SW.disease_business_case(formatCurrency(2000), formatCurrency(5000), formatCurrency(100000), currencySymbol) : isFrench ? FR.disease_business_case(formatCurrency(2000), formatCurrency(5000), formatCurrency(100000), currencySymbol) : `Without control: Yield losses of 30-100% possible\nWith prevention: Cost ${formatCurrency(2000)}-${formatCurrency(5000)}/acre = SAVE ${formatCurrency(100000)}+!\nEvery ${currencySymbol}1 spent on disease prevention returns ${currencySymbol}20-50 in saved yield`);
    structuredList.push({
      key: 'disease_management_grouped',
      params: {
        content: diseaseLines.join('\n'),
        crop: crop.toUpperCase(),
        diseases: farmerData.commonDiseases,
        low: formatCurrency(2000),
        high: formatCurrency(5000),
        saved: formatCurrency(100000),
        symbol: currencySymbol
      }
    });
  } else {
    structuredList.push({
      key: 'disease_management_grouped',
      params: {
        content: isSwahili ? SW.disease_management_title(crop) + '\n(Hakuna magonjwa yaliyoripotiwa)' : isFrench ? FR.disease_management_title(crop) + '\n(Aucune maladie signalée)' : `INTEGRATED DISEASE MANAGEMENT FOR YOUR ${crop.toUpperCase()} ENTERPRISE\n(No diseases reported)`,
        crop: crop.toUpperCase(),
        diseases: '',
        low: formatCurrency(2000),
        high: formatCurrency(5000),
        saved: formatCurrency(100000),
        symbol: currencySymbol
      }
    });
  }

  // ========== GROUP 12: PEST MANAGEMENT ==========
  if (farmerData.commonPests) {
    const pestLines: string[] = [];
    pestLines.push(isSwahili ? SW.pest_management_title(crop) : isFrench ? FR.pest_management_title(crop) : `INTEGRATED PEST MANAGEMENT (IPM) FOR YOUR ${crop.toUpperCase()} ENTERPRISE`);
    pestLines.push(isSwahili ? SW.pest_reported(farmerData.commonPests) : isFrench ? FR.pest_reported(farmerData.commonPests) : `The pests affecting your ${crop.toUpperCase()} ENTERPRISE:`);
    const pestList = farmerData.commonPests.split(',').map(p => p.trim()).filter(p => p);
    pestList.forEach(pest => { pestLines.push(`• ${pest}`); });
    pestLines.push('');
    pestLines.push(isSwahili ? SW.pest_prevention_title : isFrench ? FR.pest_prevention_title : 'PREVENTION (Cheaper than cure)');
    pestLines.push(isSwahili ? SW.pest_prevention_list : isFrench ? FR.pest_prevention_list : '• Practice crop rotation with non-host crops\n• Use resistant varieties where available\n• Monitor fields weekly for early detection (FREE!)\n• Conserve natural enemies (ladybirds, spiders, parasitic wasps)\n• Remove and destroy infected plants immediately');
    pestLines.push('');
    const cropLookupKey = lowerCrop.replace(/\s+/g, '');
    const cropPestsAndDiseases = cropPestDiseaseMap[cropLookupKey] || cropPestDiseaseMap[lowerCrop] || [];
    const cropPests = cropPestsAndDiseases.filter((pd: PestDisease) => pd.type === "pest");
    const userPests = farmerData.commonPests.split(',').map(p => p.trim().toLowerCase());
    const filteredPests = userPests.length > 0
      ? cropPests.filter(pest =>
          userPests.some(userPest =>
            pest.name.toLowerCase().includes(userPest)
          )
        )
      : cropPests;
    if (filteredPests.length > 0) {
      pestLines.push(isSwahili ? 'CHAGUO ZA UDHIBITI:' : isFrench ? 'OPTIONS DE LUTTE :' : 'CONTROL OPTIONS FOR PESTS IN YOUR FARM:');
      filteredPests.forEach(pest => {
        pestLines.push('');
        pestLines.push(`🐛 ${pest.name.toUpperCase()}`);
        if (pest.culturalControls.length > 0) {
          pestLines.push(isSwahili ? SW.pest_cultural_control : isFrench ? FR.pest_cultural_control : '  Cultural Control:');
          pest.culturalControls.forEach(control => {
            if (isSwahili) {
              const pestKey = pest.name.toLowerCase().replace(/\s+/g, '_').replace(/[()]/g, '');
              const controlKey = control.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
              const translationKey = `pest_cultural_${pestKey}_${controlKey}`.substring(0, 100);
              const translated = getCulturalTranslation(translationKey, control);
              pestLines.push(`  • ${translated}`);
            } else if (isFrench) {
              const pestKey = pest.name.toLowerCase().replace(/\s+/g, '_').replace(/[()]/g, '');
              const controlKey = control.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
              const translationKey = `pest_cultural_${pestKey}_${controlKey}`.substring(0, 100);
              const translated = getFrenchCulturalTranslation(translationKey, control);
              pestLines.push(`  • ${translated}`);
            } else {
              pestLines.push(`  • ${control}`);
            }
          });
        }
        if (pest.organicControls && pest.organicControls.length > 0) {
          pestLines.push(isSwahili ? SW.pest_organic_control : isFrench ? FR.pest_organic_control : '  Organic Control:');
          pest.organicControls.forEach(organic => {
            if (isSwahili) {
              pestLines.push(`  • ${translateOrganic(organic.method, language)}`);
              pestLines.push(`    Maandalizi: ${translateOrganic(organic.preparation, language)}`);
              pestLines.push(`    Matumizi: ${translateOrganic(organic.application, language)}`);
            } else if (isFrench) {
              pestLines.push(`  • ${translateOrganic(organic.method, language)}`);
              pestLines.push(`    Préparation : ${translateOrganic(organic.preparation, language)}`);
              pestLines.push(`    Application : ${translateOrganic(organic.application, language)}`);
            } else {
              pestLines.push(`  • ${organic.method}`);
              pestLines.push(`    Preparation: ${organic.preparation}`);
              pestLines.push(`    Application: ${organic.application}`);
            }
          });
        } else {
          pestLines.push(isSwahili ? '  Udhibiti wa kikaboni: Hakuna' : isFrench ? '  Lutte biologique : Aucune' : '  Organic Control: None');
        }
        if (pest.chemicalControls.length > 0) {
          pestLines.push(isSwahili ? SW.pest_chemical_control : isFrench ? FR.pest_chemical_control : '  Chemical Control:');
          pest.chemicalControls.forEach(chem => {
            if (isSwahili) {
              pestLines.push(`  • ${chem.productName} (${chem.activeIngredient})`);
              pestLines.push(`    ${SW.pest_rate} ${translateRate(chem.rate, language)}`);
              pestLines.push(`    Kiwango kwa ekari: ${chem.ratePerAcre}`);
              pestLines.push(`    ${SW.pest_timing} ${translateTiming(chem.timing, language)}`);
              if (chem.safetyInterval) pestLines.push(`    ${SW.pest_safety} ${translateSafety(chem.safetyInterval, language)}`);
              if (chem.packageSizes) pestLines.push(`    ${SW.pest_pack_sizes} ${chem.packageSizes.join(' • ')}`);
              const statusText = chem.status === 'restricted' ? '⚠️ RESTRICTED' : chem.status === 'banned' ? '❌ BANNED' : '✅ Active';
              pestLines.push(`    ${SW.pest_status} ${translateStatus(statusText, language)}`);
              if (chem.notes) pestLines.push(`    ${translateNote(chem.notes, language)}`);
            } else if (isFrench) {
              pestLines.push(`  • ${chem.productName} (${chem.activeIngredient})`);
              pestLines.push(`    ${FR.pest_rate} ${translateRate(chem.rate, language)}`);
              pestLines.push(`    Dose par acre : ${chem.ratePerAcre}`);
              pestLines.push(`    ${FR.pest_timing} ${translateTiming(chem.timing, language)}`);
              if (chem.safetyInterval) pestLines.push(`    ${FR.pest_safety} ${translateSafety(chem.safetyInterval, language)}`);
              if (chem.packageSizes) pestLines.push(`    ${FR.pest_pack_sizes} ${chem.packageSizes.join(' • ')}`);
              const statusText = chem.status === 'restricted' ? '⚠️ RESTRICTED' : chem.status === 'banned' ? '❌ BANNED' : '✅ Active';
              pestLines.push(`    ${FR.pest_status} ${translateStatus(statusText, language)}`);
              if (chem.notes) pestLines.push(`    ${translateNote(chem.notes, language)}`);
            } else {
              pestLines.push(`  • ${chem.productName} (${chem.activeIngredient})`);
              pestLines.push(`    Rate: ${chem.rate}`);
              pestLines.push(`    Rate per acre: ${chem.ratePerAcre}`);
              pestLines.push(`    Timing: ${chem.timing}`);
              if (chem.safetyInterval) pestLines.push(`    Safety: ${chem.safetyInterval}`);
              if (chem.packageSizes) pestLines.push(`    Pack sizes: ${chem.packageSizes.join(' • ')}`);
              const statusText = chem.status === 'restricted' ? '⚠️ RESTRICTED' : chem.status === 'banned' ? '❌ BANNED' : '✅ Active';
              pestLines.push(`    Status: ${statusText}`);
              if (chem.notes) pestLines.push(`    Note: ${chem.notes}`);
            }
          });
        } else {
          pestLines.push(isSwahili ? '  Udhibiti wa kemikali: Hakuna' : isFrench ? '  Lutte chimique : Aucune' : '  Chemical Control: None');
        }
        let businessNote = pest.businessNote;
        if (isSwahili) {
          if (pest.name === "Aphids" || pest.name === "Aphids (Aphididae)") businessNote = "Kunguru hula vidukari BURE! Kunguru mmoja anaweza kula vidukari 50 kwa siku.";
          else if (pest.name === "Diamondback moth (Plutella xylostella)") businessNote = "DBM ina kinga kwa kemikali nyingi. Badilisha bidhaa na tumia BT mapema. Mitego inagharimu Ksh 500 kwa ekari.";
          else if (pest.name === "Cabbage webworm (Hellula undalis)") businessNote = "Webworm huharibu sehemu za ukuaji, na kusababisha mimea kukwama. Vifuniko vya safu vinagharimu Ksh 2,000 kwa ekari lakini vinadumu misimu 3.";
          else if (pest.name === "Cabbage looper (Trichoplusia ni)") businessNote = "Looper larvae hula mashimo makubwa kwenye majani. Kukusanya kwa mkono ni BURE na inafaa kwa mashamba madogo.";
        } else if (isFrench) {
          if (pest.name === "Aphids" || pest.name === "Aphids (Aphididae)") businessNote = "Les coccinelles mangent les pucerons GRATUITEMENT ! Une coccinelle peut manger 50 pucerons par jour.";
          else if (pest.name === "Diamondback moth (Plutella xylostella)") businessNote = "La teigne est résistante à de nombreux produits chimiques. Alternez les produits et utilisez le BT tôt. Les pièges coûtent 500 Ksh par acre.";
          else if (pest.name === "Cabbage webworm (Hellula undalis)") businessNote = "La pyrale endommage les points de croissance, rabougrissant les plantes. Les couvertures flottantes coûtent 2 000 Ksh par acre mais durent 3 saisons.";
          else if (pest.name === "Cabbage looper (Trichoplusia ni)") businessNote = "Les larves de la fausse-arpenteuse font de grands trous dans les feuilles. La cueillette manuelle est GRATUITE et efficace pour les petites parcelles.";
        }
        if (businessNote) pestLines.push(`  💼 ${businessNote}`);
      });
    }
    pestLines.push('');
    pestLines.push(isSwahili ? SW.pest_business_calc_title : isFrench ? FR.pest_business_calc_title : 'BUSINESS CALCULATION');
    pestLines.push(isSwahili ? SW.pest_business_calc(formatCurrency(80000), formatCurrency(120000), formatCurrency(1500), formatCurrency(3000), formatCurrency(100000), currencySymbol) : isFrench ? FR.pest_business_calc(formatCurrency(80000), formatCurrency(120000), formatCurrency(1500), formatCurrency(3000), formatCurrency(100000), currencySymbol) : `Without control: Loss 40-60% yield = ${formatCurrency(80000)}-${formatCurrency(120000)} loss/acre\nWith IPM: Cost ${formatCurrency(1500)}-${formatCurrency(3000)} = SAVE ${formatCurrency(100000)}+ profit\nEvery ${currencySymbol}1 spent on pest control returns ${currencySymbol}30-40 in saved yield`);
    structuredList.push({
      key: 'pest_management_grouped',
      params: {
        content: pestLines.join('\n'),
        crop: crop.toUpperCase(),
        pests: farmerData.commonPests,
        lowLoss: formatCurrency(80000),
        highLoss: formatCurrency(120000),
        lowCost: formatCurrency(1500),
        highCost: formatCurrency(3000),
        saved: formatCurrency(100000),
        symbol: currencySymbol
      }
    });
  } else {
    structuredList.push({
      key: 'pest_management_grouped',
      params: {
        content: isSwahili ? SW.pest_management_title(crop) + '\n(Hakuna wadudu waliyoripotiwa)' : isFrench ? FR.pest_management_title(crop) + '\n(Aucun ravageur signalé)' : `INTEGRATED PEST MANAGEMENT (IPM) FOR YOUR ${crop.toUpperCase()} ENTERPRISE\n(No pests reported)`,
        crop: crop.toUpperCase(),
        pests: '',
        lowLoss: formatCurrency(80000),
        highLoss: formatCurrency(120000),
        lowCost: formatCurrency(1500),
        highCost: formatCurrency(3000),
        saved: formatCurrency(100000),
        symbol: currencySymbol
      }
    });
  }

  // ========== GROUP 13: NUTRIENT DEFICIENCY ==========
  if (farmerData.deficiencySymptoms && farmerData.deficiencySymptoms.trim() !== '') {
    const deficiencyLines: string[] = [];
    const symptoms = farmerData.deficiencySymptoms;
    const location = farmerData.deficiencyLocation || 'not specified';
    const deficiencies = getDeficienciesForCrop(crop, farmerData.deficiencySymptoms, farmerData.deficiencyLocation);
    if (deficiencies.length > 0) {
      if (isSwahili) {
        deficiencyLines.push(SW.deficiency_title(crop));
        deficiencyLines.push(`${SW.deficiency_symptoms_label} ${symptoms}`);
        deficiencyLines.push(`${SW.deficiency_location_label} ${location}`);
        deficiencyLines.push('');
        deficiencyLines.push(`${SW.deficiency_possible}`);
        deficiencies.forEach(def => {
          deficiencyLines.push(`• ${def.nutrient} (${def.nutrientSymbol}) – ${def.description}`);
          deficiencyLines.push(`  ${SW.deficiency_correction} ${def.correction.fertilizer.join(', ')} (${def.correction.rate}) – ${def.correction.application}`);
          if (def.correction.organic && def.correction.organic.length > 0) {
            deficiencyLines.push(`  ${SW.deficiency_organic} ${def.correction.organic.join(', ')}`);
          }
          if (def.visualCues.length) deficiencyLines.push(`  Dalili: ${def.visualCues[0]}`);
        });
        deficiencyLines.push('');
        deficiencyLines.push(SW.deficiency_business_tip);
      } else if (isFrench) {
        deficiencyLines.push(FR.deficiency_title(crop));
        deficiencyLines.push(`${FR.deficiency_symptoms_label} ${symptoms}`);
        deficiencyLines.push(`${FR.deficiency_location_label} ${location}`);
        deficiencyLines.push('');
        deficiencyLines.push(`${FR.deficiency_possible}`);
        deficiencies.forEach(def => {
          deficiencyLines.push(`• ${def.nutrient} (${def.nutrientSymbol}) – ${def.description}`);
          deficiencyLines.push(`  ${FR.deficiency_correction} ${def.correction.fertilizer.join(', ')} (${def.correction.rate}) – ${def.correction.application}`);
          if (def.correction.organic && def.correction.organic.length > 0) {
            deficiencyLines.push(`  ${FR.deficiency_organic} ${def.correction.organic.join(', ')}`);
          }
          if (def.visualCues.length) deficiencyLines.push(`  Symptômes : ${def.visualCues[0]}`);
        });
        deficiencyLines.push('');
        deficiencyLines.push(FR.deficiency_business_tip);
      } else {
        deficiencyLines.push(`NUTRIENT DEFICIENCY ANALYSIS FOR YOUR ${crop.toUpperCase()} ENTERPRISE`);
        deficiencyLines.push(`Symptoms reported: ${symptoms}`);
        deficiencyLines.push(`Location: ${location}`);
        deficiencyLines.push('');
        deficiencyLines.push('Possible deficiencies:');
        deficiencies.forEach(def => {
          deficiencyLines.push(`• ${def.nutrient} (${def.nutrientSymbol}) – ${def.description}`);
          deficiencyLines.push(`  Correction: ${def.correction.fertilizer.join(', ')} (${def.correction.rate}) – ${def.correction.application}`);
          if (def.correction.organic && def.correction.organic.length > 0) {
            deficiencyLines.push(`  Organic: ${def.correction.organic.join(', ')}`);
          }
          if (def.visualCues.length) deficiencyLines.push(`  Visual cue: ${def.visualCues[0]}`);
        });
        deficiencyLines.push('');
        deficiencyLines.push('BUSINESS TIP: Early detection saves yield and profit!');
      }
    } else {
      if (isSwahili) {
        deficiencyLines.push(SW.deficiency_title(crop));
        deficiencyLines.push(`${SW.deficiency_symptoms_label} ${symptoms}`);
        deficiencyLines.push(`${SW.deficiency_location_label} ${location}`);
        deficiencyLines.push('');
        deficiencyLines.push('Hakuna upungufu maalum ulioainishwa kwa zao hili. Tunapendekeza uchambuzi wa udongo kwa usahihi zaidi.');
        deficiencyLines.push('');
        deficiencyLines.push(SW.deficiency_business_tip);
      } else if (isFrench) {
        deficiencyLines.push(FR.deficiency_title(crop));
        deficiencyLines.push(`${FR.deficiency_symptoms_label} ${symptoms}`);
        deficiencyLines.push(`${FR.deficiency_location_label} ${location}`);
        deficiencyLines.push('');
        deficiencyLines.push('Aucune carence spécifique n\'est définie pour cette culture. Nous recommandons une analyse de sol pour plus de précision.');
        deficiencyLines.push('');
        deficiencyLines.push(FR.deficiency_business_tip);
      } else {
        deficiencyLines.push(`NUTRIENT DEFICIENCY ANALYSIS FOR YOUR ${crop.toUpperCase()} ENTERPRISE`);
        deficiencyLines.push(`Symptoms reported: ${symptoms}`);
        deficiencyLines.push(`Location: ${location}`);
        deficiencyLines.push('');
        deficiencyLines.push('No specific deficiencies defined for this crop. A soil test is recommended for accurate diagnosis.');
        deficiencyLines.push('');
        deficiencyLines.push('BUSINESS TIP: Early detection saves yield and profit!');
      }
    }
    structuredList.push({
      key: 'deficiency_management_grouped',
      params: {
        title: isSwahili ? SW.deficiency_title(crop) : isFrench ? FR.deficiency_title(crop) : `NUTRIENT DEFICIENCY ANALYSIS FOR YOUR ${crop.toUpperCase()} ENTERPRISE`,
        symptoms, location, content: deficiencyLines.join('\n'),
        crop: crop.toUpperCase()
      }
    });
  }

  // ========== GROUP 14: DAMAGE REPORT ==========
  if (farmerData.plantsDamaged && farmerData.plantsDamaged > 0) {
    structuredList.push({
      key: 'damage_report_grouped',
      params: {
        title: isSwahili ? SW.damage_report_title(crop) : isFrench ? FR.damage_report_title(crop) : `DAMAGE REPORT FOR YOUR ${crop.toUpperCase()} ENTERPRISE`,
        plantsDamaged: farmerData.plantsDamaged,
        message: isSwahili ? SW.damage_message(farmerData.plantsDamaged) : isFrench ? FR.damage_message(farmerData.plantsDamaged) : `You reported ${farmerData.plantsDamaged} plants damaged beyond recovery. This information helps us track farm health trends.`,
        advice: isSwahili ? SW.damage_advice : isFrench ? FR.damage_advice : 'Consider reviewing your pest and disease management strategies to prevent future losses.',
        followUp: isSwahili ? SW.damage_followup : isFrench ? FR.damage_followup : 'For personalized advice on reducing plant damage, ask our Q&A system about pest control or disease prevention.',
        crop: crop.toUpperCase(),
        plants: farmerData.plantsDamaged
      }
    });
  } else {
    structuredList.push({
      key: 'damage_report_grouped',
      params: {
        title: isSwahili ? SW.damage_report_title(crop) : isFrench ? FR.damage_report_title(crop) : `DAMAGE REPORT FOR YOUR ${crop.toUpperCase()} ENTERPRISE`,
        plantsDamaged: 0,
        message: isSwahili ? "Hakuna uharibifu ulioripotiwa." : isFrench ? "Aucun dommage signalé." : "No damage reported.",
        advice: isSwahili ? "Endelea kufuatilia afya ya shamba lako." : isFrench ? "Continuez à surveiller la santé de votre exploitation." : "Continue monitoring your farm health.",
        followUp: isSwahili ? "Kwa ushauri zaidi, tumia mfumo wetu wa Maswali na Majibu." : isFrench ? "Pour plus de conseils, utilisez notre système Q&A." : "For more advice, use our Q&A system.",
        crop: crop.toUpperCase(),
        plants: 0
      }
    });
  }

  // ========== GROUP 15: CONSERVATION ==========
  const conservationPractices = farmerData.conservationPractices ? farmerData.conservationPractices.split(',').map(p => p.trim()) : [];
  if (conservationPractices.length > 0) {
    const conservationLines: string[] = [];
    conservationLines.push(isSwahili ? SW.conservation_title(crop) : isFrench ? FR.conservation_title(crop) : `SOIL AND WATER CONSERVATION FOR YOUR ${crop.toUpperCase()} ENTERPRISE`);
    conservationLines.push(isSwahili ? SW.conservation_already_using(conservationPractices.filter(p => p !== 'None').join(', ')) : isFrench ? FR.conservation_already_using(conservationPractices.filter(p => p !== 'None').join(', ')) : `You're already using: ${conservationPractices.filter(p => p !== 'None').join(', ')}. Great job!`);
    conservationLines.push('');
    conservationLines.push(isSwahili ? SW.conservation_recommended_title : isFrench ? FR.conservation_recommended_title : 'RECOMMENDED PRACTICES');
    conservationLines.push(isSwahili ? SW.conservation_organic_manure : isFrench ? FR.conservation_organic_manure : '• Organic Manure: Continue applying 5-10 tons per acre. It improves soil structure and water holding capacity.');
    conservationLines.push(isSwahili ? SW.conservation_terracing : isFrench ? FR.conservation_terracing : '• Terracing: Excellent for slopes! Reduces soil erosion by up to 80%.');
    conservationLines.push(isSwahili ? SW.conservation_mulching : isFrench ? FR.conservation_mulching : `• Mulching: Retains moisture, reduces weeding. Use crop residues - it's FREE! (Saves ${formatCurrency(5000)}/acre)`);
    conservationLines.push(isSwahili ? SW.conservation_cover_crops : isFrench ? FR.conservation_cover_crops : `• Cover crops: Plant mucuna or dolichos between rows. Fixes 40kg N/acre naturally! (Saves ${formatCurrency(3500)} fertilizer)`);
    conservationLines.push(isSwahili ? SW.conservation_rainwater(formatCurrency(200000)) : isFrench ? FR.conservation_rainwater(formatCurrency(200000)) : `• Rainwater harvesting: Build water pans - 1,000m³ pan costs ${formatCurrency(200000)}, lasts 10 years.`);
    conservationLines.push(isSwahili ? SW.conservation_contour : isFrench ? FR.conservation_contour : '• Contour farming: On slopes >5% - reduces erosion by 50% and retains water.');
    conservationLines.push('');
    conservationLines.push(isSwahili ? SW.conservation_business_case_title : isFrench ? FR.conservation_business_case_title : 'BUSINESS CASE');
    conservationLines.push(isSwahili ? SW.conservation_business_case(formatCurrency(5000), formatCurrency(3500), currencySymbol) : isFrench ? FR.conservation_business_case(formatCurrency(5000), formatCurrency(3500), currencySymbol) : `Mulching saves 2 weeding rounds = ${formatCurrency(5000)}/acre saved\nCover crops fix 40kg N/acre = saves ${formatCurrency(3500)} fertilizer\nEvery ${currencySymbol}1 invested in conservation returns ${currencySymbol}5 in saved inputs and increased yields`);
    structuredList.push({
      key: 'conservation_grouped',
      params: {
        content: conservationLines.join('\n'),
        crop: crop.toUpperCase(),
        practices: conservationPractices.filter(p => p !== 'None').join(', '),
        mulchingSaved: formatCurrency(5000),
        coverCropsSaved: formatCurrency(3500),
        amount: formatCurrency(200000),
        symbol: currencySymbol
      }
    });
  } else {
    structuredList.push({
      key: 'conservation_grouped',
      params: {
        content: isSwahili ? SW.conservation_title(crop) + '\n' + SW.conservation_recommended_title + '\n' + SW.conservation_organic_manure + '\n' + SW.conservation_terracing + '\n' + SW.conservation_mulching + '\n' + SW.conservation_cover_crops + '\n' + SW.conservation_rainwater(formatCurrency(200000)) + '\n' + SW.conservation_contour + '\n' + SW.conservation_business_case(formatCurrency(5000), formatCurrency(3500), currencySymbol) : isFrench ? FR.conservation_title(crop) + '\n' + FR.conservation_recommended_title + '\n' + FR.conservation_organic_manure + '\n' + FR.conservation_terracing + '\n' + FR.conservation_mulching + '\n' + FR.conservation_cover_crops + '\n' + FR.conservation_rainwater(formatCurrency(200000)) + '\n' + FR.conservation_contour + '\n' + FR.conservation_business_case(formatCurrency(5000), formatCurrency(3500), currencySymbol) : `SOIL AND WATER CONSERVATION FOR YOUR ${crop.toUpperCase()} ENTERPRISE\nRECOMMENDED PRACTICES\n• Organic Manure: Apply 5-10 tons per acre.\n• Terracing: Excellent for slopes!\n• Mulching: Retains moisture, reduces weeding.\n• Cover crops: Fix 40kg N/acre naturally!\n• Rainwater harvesting: Build water pans.\n• Contour farming: On slopes >5%.\nBUSINESS CASE\nMulching saves 2 weeding rounds.\nCover crops fix 40kg N/acre.\nEvery ${currencySymbol}1 invested returns ${currencySymbol}5.`,
        crop: crop.toUpperCase(),
        practices: 'None',
        mulchingSaved: formatCurrency(5000),
        coverCropsSaved: formatCurrency(3500),
        amount: formatCurrency(200000),
        symbol: currencySymbol
      }
    });
  }

  // ========== GROUP 16: POST-HARVEST HANDLING & STORAGE ==========
  if (farmerData.storageMethod) {
    const storageMethod = farmerData.storageMethod;
    const phLines: string[] = [];
    phLines.push(isSwahili ? SW.postharvest_title(crop) : isFrench ? FR.postharvest_title(crop) : `POST-HARVEST HANDLING & STORAGE FOR YOUR ${crop.toUpperCase()} ENTERPRISE`);
    phLines.push(isSwahili ? SW.postharvest_method(storageMethod) : isFrench ? FR.postharvest_method(storageMethod) : `Your storage method: ${storageMethod}`);
    phLines.push('');
    const lossWarning = getPostHarvestLossWarning(crop, language);
    phLines.push(lossWarning);
    phLines.push('');
    const methodLower = storageMethod.toLowerCase();
    let advice = '';
    if (methodLower.includes('hermetic')) {
      advice = isSwahili ? SW.postharvest_advice_hermetic : isFrench ? FR.postharvest_advice_hermetic : "Use hermetic bags – **they remove oxygen, suffocating insects and preventing mould without chemicals**. Ensure bags are properly sealed and stored in a dry place.";
    } else if (methodLower.includes('silo')) {
      advice = isSwahili ? SW.postharvest_advice_silo : isFrench ? FR.postharvest_advice_silo : "Store in metallic silos – **silos are airtight, preventing insect entry and keeping grain dry**. Check for cracks and seal well. Dry grain to 13% moisture before storage.";
    } else if (methodLower.includes('gunny') || methodLower.includes('jute')) {
      advice = isSwahili ? SW.postharvest_advice_gunny : isFrench ? FR.postharvest_advice_gunny : "Gunny bags allow air but do not prevent insects – **insects can lay eggs through the weave**. Switch to hermetic bags or add storage insecticides (Actellic Gold 50g/90kg). Dry grain to 13% moisture first.";
    } else if (methodLower.includes('crib')) {
      advice = isSwahili ? SW.postharvest_advice_crib : isFrench ? FR.postharvest_advice_crib : "Traditional cribs attract pests and rodents – **open structure allows insects and moisture**. Switch to hermetic bags or silos for safer storage.";
    } else if (methodLower.includes('sold immediately')) {
      advice = isSwahili ? SW.postharvest_advice_sold : isFrench ? FR.postharvest_advice_sold : "Selling immediately gives quick cash, but you miss higher prices later – **prices often rise 2-3 months after harvest**. Store part of your harvest for 2-3 months. Sort and grade to get better prices.";
    } else if (methodLower.includes('cool room') || methodLower.includes('cool storage')) {
      advice = isSwahili ? SW.postharvest_advice_cool_room : isFrench ? FR.postharvest_advice_cool_room : "A cool room extends shelf life – **low temperature (2-4°C for vegetables, 10-15°C for fruits) slows ripening and reduces water loss**. Avoid storing with ripening fruits because of ethylene gas.";
    } else if (methodLower.includes('cold storage')) {
      advice = isSwahili ? SW.postharvest_advice_cold_storage : isFrench ? FR.postharvest_advice_cold_storage : "Cold storage is excellent for vegetables and fruits – **refrigeration stops microbial growth and slows respiration**. Initial cost is high but pays off by reducing losses and selling off‑season.";
    } else if (methodLower.includes('processing')) {
      advice = isSwahili ? SW.postharvest_advice_processing : isFrench ? FR.postharvest_advice_processing : "Processing (drying, milling, freezing) adds value – **removing moisture stops mould and bacteria, and milling creates stable products**. Sell processed products at 2-3x higher price.";
    } else if (methodLower.includes('in-ground') || methodLower.includes('in ground')) {
      advice = isSwahili ? SW.postharvest_advice_in_ground : isFrench ? FR.postharvest_advice_in_ground : "Storing roots in the ground is free but risky – **roots continue to respire and can rot if soil is too wet**. Harvest little by little as needed, and dry immediately after harvest.";
    } else if (methodLower.includes('plastic container') || methodLower.includes('container')) {
      advice = isSwahili ? SW.postharvest_advice_containers : isFrench ? FR.postharvest_advice_containers : "Well-sealed plastic containers prevent insects – **insects cannot chew through plastic if sealed**. Ensure containers are clean and dry to avoid mould.";
    } else {
      advice = isSwahili ? SW.postharvest_generic_tip(crop) : isFrench ? FR.postharvest_generic_tip(crop) : `For ${crop}, dry well, remove debris, and store in a dry, cool, clean place – **drying reduces moisture that causes rot, and cleanliness prevents pest attraction**. Inspect regularly for pests or mold.`;
    }
    phLines.push(advice);
    phLines.push('');
    const darkAdvice = getCoolDarkStorageAdvice(crop, language);
    if (darkAdvice) {
      phLines.push(darkAdvice);
      phLines.push('');
    }
    const category = getCropCategory(crop);
    if ((category === 'grains' || category === 'pulses') && !methodLower.includes('hermetic') && !methodLower.includes('silo')) {
      phLines.push(isSwahili ? SW.postharvest_advice_drying : isFrench ? FR.postharvest_advice_drying : "Dry grain to 13% moisture before storage – **below 13% moisture, mould cannot grow and aflatoxin cannot form**. Use a moisture meter or bite test: grain should crack, not crush.");
    }
    const sortingAdvice = getSortingGradingAdvice(crop, language);
    phLines.push(sortingAdvice);
    const valueAdvice = getValueAdditionSuggestion(crop, language);
    phLines.push(valueAdvice);
    const chemicalAdvice = getStorageChemicalAdvice(crop, language);
    if (chemicalAdvice) {
      phLines.push(chemicalAdvice);
    }
    phLines.push('');
    phLines.push(isSwahili ? SW.postharvest_business_tip : isFrench ? FR.postharvest_business_tip : "BUSINESS TIP: Reducing post-harvest losses by 10% increases your profit by 10% with no extra production costs! Sort and grade for better prices.");
    structuredList.push({
      key: 'postharvest_grouped',
      params: {
        content: phLines.join('\n'),
        method: storageMethod,
        crop: crop.toUpperCase()
      }
    });
  }

  // ========== GROUP 17: BUSINESS ==========
  const businessLines: string[] = [];
  if (isSwahili) {
    businessLines.push(SW.business_title);
    businessLines.push('');
    businessLines.push(SW.business_know_costs_title);
    businessLines.push(SW.business_know_costs_list);
    businessLines.push(SW.business_know_costs_example(formatCurrency(40000)));
    businessLines.push('');
    businessLines.push(SW.business_buy_bulk_title);
    businessLines.push(SW.business_buy_bulk_dap(formatCurrency(3500), formatCurrency(31500), formatCurrency(3500)));
    businessLines.push(SW.business_buy_bulk_can(formatCurrency(3200), formatCurrency(28800), formatCurrency(3200)));
    businessLines.push('');
    businessLines.push(SW.business_form_groups_title);
    businessLines.push(SW.business_form_groups_list);
    businessLines.push(SW.business_form_groups_transport(formatCurrency(5000)));
    businessLines.push('');
    businessLines.push(SW.business_exponential_title);
    businessLines.push(SW.business_exponential(currencySymbol));
    businessLines.push('');
    businessLines.push(SW.business_bottom_line);
  } else if (isFrench) {
    businessLines.push(FR.business_title);
    businessLines.push('');
    businessLines.push(FR.business_know_costs_title);
    businessLines.push(FR.business_know_costs_list);
    businessLines.push(FR.business_know_costs_example(formatCurrency(40000)));
    businessLines.push('');
    businessLines.push(FR.business_buy_bulk_title);
    businessLines.push(FR.business_buy_bulk_dap(formatCurrency(3500), formatCurrency(31500), formatCurrency(3500)));
    businessLines.push(FR.business_buy_bulk_can(formatCurrency(3200), formatCurrency(28800), formatCurrency(3200)));
    businessLines.push('');
    businessLines.push(FR.business_form_groups_title);
    businessLines.push(FR.business_form_groups_list);
    businessLines.push(FR.business_form_groups_transport(formatCurrency(5000)));
    businessLines.push('');
    businessLines.push(FR.business_exponential_title);
    businessLines.push(FR.business_exponential(currencySymbol));
    businessLines.push('');
    businessLines.push(FR.business_bottom_line);
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
    params: {
      content: businessLines.join('\n'),
      amount: formatCurrency(40000),
      single: formatCurrency(3500),
      ten: formatCurrency(31500),
      saved: formatCurrency(3500),
      symbol: currencySymbol
    }
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
    // ========== GROUP: CROP NUTRITION & HEALTH BENEFITS ==========
  if (farmerData.wantsNutritionBenefits === true) {
    const { getCropBenefits } = await import('@/lib/data/cropBenefits');
    const cropBenefits = getCropBenefits(crop);
    if (cropBenefits) {
      const nutrientsList = cropBenefits.nutrients
        .map(n => `• ${n.name}: ${n.amount} (${n.dailyValuePercent}% of Daily Value)`)
        .join('\n');
      const healthList = cropBenefits.healthBenefits.map(b => `• ${b}`).join('\n');
      structuredList.push({
        key: 'crop_benefits_grouped',
        params: {
          title: isSwahili ? SW.crop_benefits_title(crop) : isFrench ? FR.crop_benefits_title(crop) : `🌿 NUTRITION & HEALTH BENEFITS – ${crop.toUpperCase()}`,
          subtitle: isSwahili ? SW.crop_benefits_subtitle : isFrench ? FR.crop_benefits_subtitle : 'Per 100g fresh weight',
          nutrientsHeader: isSwahili ? SW.crop_benefits_nutrients_header : isFrench ? FR.crop_benefits_nutrients_header : 'Key Nutrients',
          nutrientsList,
          healthHeader: isSwahili ? SW.crop_benefits_health_header : isFrench ? FR.crop_benefits_health_header : 'Health Benefits',
          healthList
        }
      });
    } else {
      // Fallback if crop not found in database
      structuredList.push({
        key: 'crop_benefits_grouped',
        params: {
          title: isSwahili ? SW.crop_benefits_fallback_title(crop) : isFrench ? FR.crop_benefits_fallback_title(crop) : `🌿 NUTRITION & HEALTH BENEFITS – ${crop.toUpperCase()} (General)`,
          subtitle: isSwahili ? SW.crop_benefits_subtitle : isFrench ? FR.crop_benefits_subtitle : 'Per 100g fresh weight',
          nutrientsHeader: isSwahili ? SW.crop_benefits_nutrients_header : isFrench ? FR.crop_benefits_nutrients_header : 'Key Nutrients',
          nutrientsList: isSwahili ? SW.crop_benefits_fallback_nutrients : isFrench ? FR.crop_benefits_fallback_nutrients : '• Varied nutrients depending on variety',
          healthHeader: isSwahili ? SW.crop_benefits_health_header : isFrench ? FR.crop_benefits_health_header : 'Health Benefits',
          healthList: isSwahili ? SW.crop_benefits_fallback_health : isFrench ? FR.crop_benefits_fallback_health : '• Supports overall health\n• Rich in vitamins and minerals'
        }
      });
    }
  }

  const list = structuredList.map(item => item.key + (item.params ? JSON.stringify(item.params) : ''));
  const financialAdvice = structuredFinancialAdvice.key;

  return {
    list,
    financialAdvice,
    structuredList,
    structuredFinancialAdvice
  };
}