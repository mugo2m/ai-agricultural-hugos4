// lib/data/nutrientDeficiency.ts
// Nutrient deficiency symptoms database for all crops

export interface DeficiencySymptom {
  id: string;
  nutrient: string;
  nutrientSymbol: string;
  description: string;
  visualCues: string[];
  location: "older leaves" | "younger leaves" | "whole plant" | "specific parts";
  mobility: "mobile" | "immobile" | "partially mobile";
  severity: "mild" | "moderate" | "severe";
  affects: string[];
  correction: {
    fertilizer: string[];
    rate: string;
    application: string;
    organic?: string[];
  };
  imagePrompt?: string; // For future AI image recognition
}

export const nutrientDeficiencies: DeficiencySymptom[] = [
  {
    id: "deficit_nitrogen",
    nutrient: "Nitrogen",
    nutrientSymbol: "N",
    description: "Pale green to yellow leaves, stunted growth",
    visualCues: [
      "Uniform yellowing starting from older leaves",
      "Pale green color throughout plant",
      "Stunted growth and thin stems",
      "Small leaves and reduced tillering"
    ],
    location: "older leaves",
    mobility: "mobile",
    severity: "moderate",
    affects: ["all crops", "cereals", "vegetables"],
    correction: {
      fertilizer: ["UREA (46-0-0)", "CAN (27-0-0)", "ASN (21-0-0)"],
      rate: "50-100 kg/acre depending on crop",
      application: "Side-dress near plants and incorporate",
      organic: ["Compost tea", "Manure slurry", "Blood meal"]
    }
  },
  {
    id: "deficit_phosphorus",
    nutrient: "Phosphorus",
    nutrientSymbol: "P",
    description: "Purplish discoloration, poor root development",
    visualCues: [
      "Purple or reddish leaves (especially undersides)",
      "Stunted growth with thin stems",
      "Delayed maturity",
      "Poor root development",
      "Smaller leaves than normal"
    ],
    location: "older leaves",
    mobility: "mobile",
    severity: "moderate",
    affects: ["all crops", "cereals", "legumes", "root crops"],
    correction: {
      fertilizer: ["DAP (18-46-0)", "TSP (0-46-0)", "SSP (0-20-0)", "NPK 23-23-0"],
      rate: "50-100 kg/acre",
      application: "Band near seeds at planting",
      organic: ["Bone meal", "Rock phosphate", "Composted manure"]
    }
  },
  {
    id: "deficit_potassium",
    nutrient: "Potassium",
    nutrientSymbol: "K",
    description: "Yellow/brown leaf edges (scorching), weak stems",
    visualCues: [
      "Yellowing and browning at leaf tips and margins",
      "Leaf edges appear scorched or burned",
      "Weak stems and lodging",
      "Small grains/fruits",
      "Yellow spots between veins"
    ],
    location: "older leaves",
    mobility: "mobile",
    severity: "moderate",
    affects: ["all crops", "fruits", "tubers", "vegetables"],
    correction: {
      fertilizer: ["MOP (0-0-60)", "SOP (0-0-50)", "Korn-Kali", "NPK with K"],
      rate: "50-100 kg/acre",
      application: "Side-dress or incorporate before planting",
      organic: ["Wood ash", "Compost", "Banana peels"]
    }
  },
  {
    id: "deficit_magnesium",
    nutrient: "Magnesium",
    nutrientSymbol: "Mg",
    description: "Interveinal chlorosis on older leaves",
    visualCues: [
      "Yellowing between leaf veins (veins remain green)",
      "Affects older leaves first",
      "Leaf edges may curl upward",
      "Bronzing or reddish tint in severe cases"
    ],
    location: "older leaves",
    mobility: "mobile",
    severity: "moderate",
    affects: ["all crops", "tomatoes", "potatoes", "fruits"],
    correction: {
      fertilizer: ["Kieserite", "Magnesium sulphate", "Dolomitic lime"],
      rate: "25-50 kg/acre",
      application: "Soil application or foliar spray",
      organic: ["Epsom salts (foliar)", "Compost", "Manure"]
    }
  },
  {
    id: "deficit_calcium",
    nutrient: "Calcium",
    nutrientSymbol: "Ca",
    description: "New growth distortion, blossom end rot",
    visualCues: [
      "New leaves distorted or hook-shaped",
      "Blossom end rot in tomatoes/peppers",
      "Tip burn in leafy vegetables",
      "Stunted root growth",
      "Poor fruit development"
    ],
    location: "younger leaves",
    mobility: "immobile",
    severity: "severe",
    affects: ["tomatoes", "peppers", "cabbages", "fruits", "vegetables"],
    correction: {
      fertilizer: ["Calcium nitrate", "Gypsum", "Calcitic lime"],
      rate: "50-100 kg/acre",
      application: "Soil application or foliar spray",
      organic: ["Eggshells (crushed)", "Gypsum", "Lime"]
    }
  },
  {
    id: "deficit_sulphur",
    nutrient: "Sulphur",
    nutrientSymbol: "S",
    description: "Uniform yellowing of new leaves (like N but on new growth)",
    visualCues: [
      "Yellowing of young leaves (unlike N which affects older)",
      "Stunted growth",
      "Thin stems",
      "Delayed maturity"
    ],
    location: "younger leaves",
    mobility: "immobile",
    severity: "moderate",
    affects: ["all crops", "cereals", "onions", "garlic", "oil crops"],
    correction: {
      fertilizer: ["ASN (21-0-0-23S)", "Ammonium sulphate", "Gypsum"],
      rate: "25-50 kg/acre",
      application: "Soil application",
      organic: ["Compost", "Manure", "Sulphur (elemental)"]
    }
  },
  {
    id: "deficit_iron",
    nutrient: "Iron",
    nutrientSymbol: "Fe",
    description: "Interveinal chlorosis on young leaves",
    visualCues: [
      "Yellowing between veins of new leaves",
      "Veins remain dark green",
      "Severe cases turn almost white",
      "Affects new growth first"
    ],
    location: "younger leaves",
    mobility: "immobile",
    severity: "moderate",
    affects: ["all crops", "fruits", "ornamentals", "acid-loving plants"],
    correction: {
      fertilizer: ["Iron chelates", "Iron sulphate"],
      rate: "Follow label instructions",
      application: "Foliar spray or soil drench",
      organic: ["Compost", "Manure", "Acidic mulch"]
    }
  },
  {
    id: "deficit_zinc",
    nutrient: "Zinc",
    nutrientSymbol: "Zn",
    description: "Small leaves, rosettes, interveinal chlorosis",
    visualCues: [
      "Smaller than normal leaves",
      "Rosette formation (tight clusters of small leaves)",
      "Interveinal chlorosis",
      "Short internodes",
      "Bronzing in some crops"
    ],
    location: "younger leaves",
    mobility: "immobile",
    severity: "moderate",
    affects: ["maize", "beans", "fruits", "citrus"],
    correction: {
      fertilizer: ["Zinc sulphate", "Zinc chelates"],
      rate: "5-10 kg/acre",
      application: "Soil or foliar",
      organic: ["Compost", "Manure"]
    }
  },
  {
    id: "deficit_boron",
    nutrient: "Boron",
    nutrientSymbol: "B",
    description: "Cracked stems, poor fruit set, hollow areas",
    visualCues: [
      "Cracked or brittle stems",
      "Hollow areas in vegetables",
      "Poor fruit set",
      "Death of growing points",
      "Thick, curled leaves"
    ],
    location: "younger leaves",
    mobility: "immobile",
    severity: "severe",
    affects: ["vegetables", "fruits", "coffee", "sunflower"],
    correction: {
      fertilizer: ["Borax", "Solubor", "Boric acid"],
      rate: "1-2 kg/acre (careful - toxic in excess)",
      application: "Foliar spray or soil",
      organic: ["Compost", "Manure", "Mulch"]
    }
  },
  {
    id: "deficit_manganese",
    nutrient: "Manganese",
    nutrientSymbol: "Mn",
    description: "Interveinal chlorosis with spots",
    visualCues: [
      "Yellowing between veins",
      "Small dark spots on leaves",
      "Grayish patches",
      "Affects young leaves"
    ],
    location: "younger leaves",
    mobility: "immobile",
    severity: "mild",
    affects: ["cereals", "soya beans", "potatoes"],
    correction: {
      fertilizer: ["Manganese sulphate", "Manganese chelates"],
      rate: "2-5 kg/acre",
      application: "Foliar spray",
      organic: ["Compost", "Manure", "Acidic conditions"]
    }
  },
  {
    id: "deficit_copper",
    nutrient: "Copper",
    nutrientSymbol: "Cu",
    description: "Wilting, twisted leaves, bleached tips",
    visualCues: [
      "Wilting even with adequate water",
      "Twisted new leaves",
      "Bleached tips",
      "Stunted growth"
    ],
    location: "younger leaves",
    mobility: "immobile",
    severity: "moderate",
    affects: ["cereals", "citrus", "onions"],
    correction: {
      fertilizer: ["Copper sulphate", "Copper chelates"],
      rate: "2-5 kg/acre",
      application: "Foliar or soil",
      organic: ["Compost", "Manure"]
    }
  },
  {
    id: "deficit_molybdenum",
    nutrient: "Molybdenum",
    nutrientSymbol: "Mo",
    description: "Whiptail in cauliflower, yellowing",
    visualCues: [
      "Whiptail (narrow, distorted leaves in brassicas)",
      "Yellowing similar to nitrogen",
      "Leaf margins cup upward",
      "Poor nodulation in legumes"
    ],
    location: "whole plant",
    mobility: "mobile",
    severity: "mild",
    affects: ["brassicas", "cauliflower", "legumes", "citrus"],
    correction: {
      fertilizer: ["Sodium molybdate", "Ammonium molybdate"],
      rate: "100-200g/acre (very small amount)",
      application: "Foliar spray or seed treatment",
      organic: ["Compost", "Lime (reduces availability)"]
    }
  }
];

// Crop-specific deficiency lookup
export const cropDeficiencySymptoms: Record<string, string[]> = {
  maize: [
    "deficit_nitrogen", // Yellowing from tip down midrib
    "deficit_phosphorus", // Purple leaves
    "deficit_potassium", // Yellow/brown leaf edges
    "deficit_zinc", // White bands
    "deficit_magnesium" // Striped appearance
  ],
  tomatoes: [
    "deficit_nitrogen", // Pale green
    "deficit_phosphorus", // Purple undersides
    "deficit_potassium", // Leaf edge scorch
    "deficit_calcium", // Blossom end rot
    "deficit_magnesium", // Interveinal chlorosis
    "deficit_iron", // New leaves yellow
    "deficit_boron" // Poor fruit set
  ],
  beans: [
    "deficit_nitrogen", // Pale green
    "deficit_phosphorus", // Stunted
    "deficit_potassium", // Leaf scorch
    "deficit_magnesium", // Interveinal chlorosis
    "deficit_iron", // Yellow new leaves
    "deficit_zinc", // Small leaves
    "deficit_molybdenum" // Poor nodulation
  ],
  onions: [
    "deficit_nitrogen", // Light green
    "deficit_phosphorus", // Slow growth
    "deficit_potassium", // Tip burn
    "deficit_sulphur", // Yellow new leaves
    "deficit_zinc" // Distorted growth
  ],
  potatoes: [
    "deficit_nitrogen", // Pale leaves
    "deficit_phosphorus", // Stunted
    "deficit_potassium", // Leaf scorch
    "deficit_magnesium", // Interveinal chlorosis
    "deficit_calcium", // Tip burn
    "deficit_boron" // Hollow heart
  ],
  cabbages: [
    "deficit_nitrogen", // Pale green
    "deficit_phosphorus", // Purple
    "deficit_potassium", // Leaf scorch
    "deficit_calcium", // Tip burn
    "deficit_boron", // Hollow stem
    "deficit_molybdenum" // Whiptail
  ],
  bananas: [
    "deficit_nitrogen", // Pale green
    "deficit_potassium", // Yellow leaf edges
    "deficit_magnesium", // Interveinal chlorosis
    "deficit_iron", // Yellow new leaves
    "deficit_zinc" // Small leaves
  ],
  citrus: [
    "deficit_nitrogen", // Pale
    "deficit_phosphorus", // Dull color
    "deficit_potassium", // Leaf tip burn
    "deficit_zinc", // Little leaf
    "deficit_iron", // Yellow new leaves
    "deficit_manganese", // Vein banding
    "deficit_boron" // Cracked fruit
  ]
};

// Helper function to get deficiencies by crop
export function getDeficienciesForCrop(crop: string): DeficiencySymptom[] {
  const cropKey = crop.toLowerCase();
  const deficiencyIds = cropDeficiencySymptoms[cropKey] || [];

  return deficiencyIds
    .map(id => nutrientDeficiencies.find(d => d.id === id))
    .filter((d): d is DeficiencySymptom => d !== undefined);
}

// Helper to get deficiencies by visual symptoms
export function findDeficiencyBySymptom(
  symptomKeyword: string,
  crop?: string
): DeficiencySymptom[] {
  const allDeficiencies = crop
    ? getDeficienciesForCrop(crop)
    : nutrientDeficiencies;

  return allDeficiencies.filter(def =>
    def.visualCues.some(cue =>
      cue.toLowerCase().includes(symptomKeyword.toLowerCase())
    ) ||
    def.description.toLowerCase().includes(symptomKeyword.toLowerCase())
  );
}