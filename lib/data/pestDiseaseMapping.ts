// lib/data/pestDiseaseMapping.ts
// Comprehensive pest and disease database with control options
// UPDATED: Added 15 new crops (Rice, Mangoes, Pineapples, Watermelons, Carrots, Chillies, Spinach, Pigeon Peas, Bambara Nuts, Yams, Taro, Okra, Tea, Macadamia, Cocoa)
// UPDATED: Removed illegal chemicals, flagged banned products

export interface PestDisease {
  name: string;
  type: "pest" | "disease";
  chemicalControls: {
    productName: string;
    activeIngredient: string;
    rate: string; // per 20L water unless specified
    applicationMethod: string;
    timing: string;
    safetyInterval?: string;
    packageSizes?: string[];
    costPerPackage?: number;
    status?: "active" | "restricted" | "banned" | "check-locally";
    notes?: string;
  }[];
  organicControls?: {
    method: string;
    preparation: string;
    application: string;
  }[];
  culturalControls: string[];
  businessNote?: string;
}

export const cropPestDiseaseMap: Record<string, PestDisease[]> = {
  // ========== EXISTING CROPS ==========

  maize: [
    {
      name: "Fall armyworm",
      type: "pest",
      chemicalControls: [
        {
          productName: "Rocket 44EC",
          activeIngredient: "Profenofos 40% + Cypermethrin 4%",
          rate: "40ml per 20L water",
          applicationMethod: "Spray into plant funnel/whorl",
          timing: "Early morning or late evening when larvae are active",
          safetyInterval: "21 days before harvest",
          packageSizes: ["100ml (Ksh 350)", "250ml (Ksh 800)", "500ml (Ksh 1,500)", "1L (Ksh 2,800)"],
          costPerPackage: 350,
          status: "active",
          notes: "Actively marketed in Kenya, Uganda, Tanzania"
        },
        {
          productName: "Emacot 5WG",
          activeIngredient: "Emamectin benzoate",
          rate: "4g per 20L water",
          applicationMethod: "Foliar spray, target whorl",
          timing: "When larvae are young (1st-3rd instar)",
          safetyInterval: "14 days before harvest",
          packageSizes: ["10g (Ksh 250)", "20g (Ksh 480)", "100g (Ksh 2,300)"],
          costPerPackage: 250,
          status: "active",
          notes: "Available in East Africa"
        },
        {
          productName: "Avaunt 150EC",
          activeIngredient: "Indoxacarb",
          rate: "10ml per 20L water",
          applicationMethod: "Foliar spray",
          timing: "When larvae are young",
          safetyInterval: "7 days before harvest",
          packageSizes: ["100ml (Ksh 750)", "250ml (Ksh 1,800)", "1L (Ksh 6,800)"],
          costPerPackage: 750,
          status: "check-locally",
          notes: "May be discontinued in some regions; check local availability"
        }
      ],
      organicControls: [
        {
          method: "Neem extract",
          preparation: "Mix 50ml neem oil with 20L water + few drops liquid soap",
          application: "Spray on plants, repeat every 7-10 days"
        },
        {
          method: "Ash application",
          preparation: "Collect clean wood ash",
          application: "Apply directly into plant funnel"
        },
        {
          method: "Bacillus thuringiensis (BT)",
          preparation: "Follow label instructions for commercial BT products",
          application: "Spray when larvae are young; safe for beneficial insects"
        }
      ],
      culturalControls: [
        "Scout fields twice weekly for eggs and young larvae",
        "Practice push-pull technology (plant desmodium between maize, napier grass around borders)",
        "Rotate maize with legumes (beans, cowpeas) for 2 seasons",
        "Conserve natural enemies (ladybirds, parasitic wasps, spiders)",
        "Plant early to escape peak pest pressure"
      ],
      businessNote: "Early detection saves Ksh 5,000+ per acre. Buy 500ml pack - save 20% vs buying 100ml!"
    },
    {
      name: "Maize stalk borer",
      type: "pest",
      chemicalControls: [
        {
          productName: "Bulldock granules",
          activeIngredient: "Beta-cyfluthrin",
          rate: "3.5g per plant (4kg/ha)",
          applicationMethod: "Apply granules into plant funnel",
          timing: "When window-like holes appear on leaves",
          safetyInterval: "21 days before harvest",
          packageSizes: ["500g (Ksh 600)", "1kg (Ksh 1,100)", "5kg (Ksh 5,200)"],
          costPerPackage: 600,
          status: "active",
          notes: "Available in Kenya and Uganda"
        }
      ],
      organicControls: [
        {
          method: "Ash application",
          preparation: "Collect clean wood ash",
          application: "Apply ash into leaf funnel of young plants"
        },
        {
          method: "Neem cake",
          preparation: "Apply neem cake around base of plants",
          application: "100kg per acre at planting"
        }
      ],
      culturalControls: [
        "Use clean planting materials",
        "Maintain good cultural practices to break life cycle",
        "Practice push-pull technology",
        "Rotate maize with legumes",
        "Apply ash on leaf funnel of young plants"
      ],
      businessNote: "Ash application is FREE! Combine with push-pull for long-term control."
    },
    {
      name: "Larger grain borer (Osama)",
      type: "pest",
      chemicalControls: [
        {
          productName: "Actellic Gold Dust",
          activeIngredient: "Pirimiphos-methyl + Thiamethoxam",
          rate: "50g per 90kg bag",
          applicationMethod: "Mix dust with grain during storage",
          timing: "At storage time",
          packageSizes: ["100g (Ksh 150)", "500g (Ksh 700)", "1kg (Ksh 1,300)"],
          costPerPackage: 150,
          status: "active",
          notes: "Currently marketed in Zimbabwe and Kenya"
        },
        {
          productName: "Sumicombi Powder",
          activeIngredient: "Fenitrothion + Cypermethrin",
          rate: "50g per 90kg bag",
          applicationMethod: "Mix dust with grain during storage",
          timing: "At storage time",
          packageSizes: ["100g (Ksh 120)", "500g (Ksh 550)", "1kg (Ksh 1,000)"],
          costPerPackage: 120,
          status: "active",
          notes: "Available in East Africa"
        },
        {
          productName: "Phostoxin tablets",
          activeIngredient: "Aluminium phosphide",
          rate: "2 tablets per 90kg bag",
          applicationMethod: "Place tablets in grain - fumigant (use carefully!)",
          timing: "At storage time",
          safetyInterval: "10 days before opening",
          packageSizes: ["100 tablets (Ksh 800)", "500 tablets (Ksh 3,500)"],
          costPerPackage: 800,
          status: "active",
          notes: "EU approved through 2027; use with caution"
        }
      ],
      organicControls: [
        {
          method: "Hermetic bags",
          preparation: "Purchase hermetic (PICS) bags",
          application: "Store grain in airtight bags - no chemicals needed"
        },
        {
          method: "Solar treatment",
          preparation: "Spread grain in sun",
          application: "Sun dry for 2-3 days before storage"
        }
      ],
      culturalControls: [
        "Harvest early",
        "Shell and dry to 13% moisture before storage",
        "Place sticky traps in store",
        "Sun dry and sort infested grains before packing",
        "Ensure well-ventilated and dump-free stores",
        "Place hermetic bags and metallic silos on raised surfaces",
        "Spray stores with recommended storage pesticides"
      ],
      businessNote: "Hermetic bags (Ksh 250 each) protect 90kg grain worth Ksh 6,750 - that's 2,600% ROI! Buy in bulk: 10 bags for Ksh 2,300."
    },
    {
      name: "Aphids",
      type: "pest",
      chemicalControls: [
        {
          productName: "Dimethoate 40EC",
          activeIngredient: "Dimethoate",
          rate: "10ml per 20L water",
          applicationMethod: "Foliar spray",
          timing: "When colonies appear",
          safetyInterval: "14 days before harvest",
          packageSizes: ["100ml (Ksh 300)", "250ml (Ksh 700)", "500ml (Ksh 1,300)"],
          costPerPackage: 300,
          status: "restricted",
          notes: "⚠️ BANNED in Tanzania (Jan 2026). Check local regulations before recommending."
        },
        {
          productName: "Karate 5EC",
          activeIngredient: "Lambda-cyhalothrin",
          rate: "5ml per 20L water",
          applicationMethod: "Foliar spray",
          timing: "When colonies appear",
          safetyInterval: "14 days before harvest",
          packageSizes: ["100ml (Ksh 400)", "250ml (Ksh 900)"],
          costPerPackage: 400,
          status: "active",
          notes: "Supply tight, prices rising; check availability"
        }
      ],
      organicControls: [
        {
          method: "Neem spray",
          preparation: "Mix 50ml neem oil with 20L water",
          application: "Spray on affected plants"
        },
        {
          method: "Soap solution",
          preparation: "Mix 2 tablespoons liquid soap in 5L water",
          application: "Spray directly on aphids"
        },
        {
          method: "Introduce ladybirds",
          preparation: "Collect ladybirds from wild or purchase",
          application: "Release 10-20 per plant"
        }
      ],
      culturalControls: [
        "Conserve ladybirds and hoverflies (natural predators)",
        "Use yellow sticky traps",
        "Remove heavily infested plants",
        "Avoid excess nitrogen fertilizer which attracts aphids"
      ],
      businessNote: "Ladybirds eat aphids for FREE! One ladybird can eat 50 aphids per day."
    },
    {
      name: "Maize streak virus",
      type: "disease",
      chemicalControls: [],
      culturalControls: [
        "Use resistant varieties (e.g., WH505, WH403, WE1101)",
        "Control leaf hoppers (vectors) with recommended insecticides",
        "Rogue out infected plants immediately",
        "Plant early to avoid peak vector populations",
        "Practice crop rotation with non-cereals"
      ],
      businessNote: "No chemical cure - prevention is key. Resistant varieties cost the same as susceptible ones!"
    },
    {
      name: "Head smut",
      type: "disease",
      chemicalControls: [
        {
          productName: "Mancozeb 80WP",
          activeIngredient: "Mancozeb",
          rate: "50g per 20L water",
          applicationMethod: "Seed treatment before planting",
          timing: "At planting time",
          packageSizes: ["100g (Ksh 400)", "500g (Ksh 1,800)"],
          costPerPackage: 400,
          status: "active",
          notes: "Widely available fungicide"
        },
        {
          productName: "Thiram 75WS",
          activeIngredient: "Thiram",
          rate: "30g per 10kg seed",
          applicationMethod: "Seed treatment",
          timing: "Before planting",
          packageSizes: ["100g (Ksh 350)", "500g (Ksh 1,500)"],
          costPerPackage: 350,
          status: "active"
        }
      ],
      culturalControls: [
        "Avoid planting in areas with history of head smut (spores survive in soil for long time)",
        "Use tolerant varieties",
        "Improve soil fertility (disease more severe in infertile soils)",
        "Remove and burn/bury infected plants",
        "Practice crop rotation for 3-4 years"
      ],
      businessNote: "Disease is more severe in infertile soils. Adding manure reduces infection by 50%!"
    }
  ],

  beans: [
    {
      name: "Bean fly",
      type: "pest",
      chemicalControls: [
        {
          productName: "Diazinon 60EC",
          activeIngredient: "Diazinon",
          rate: "20ml per 20L water",
          applicationMethod: "Foliar spray, target base of plants",
          timing: "At seedling stage (2-3 weeks after emergence)",
          safetyInterval: "14 days before harvest",
          packageSizes: ["100ml (Ksh 350)", "250ml (Ksh 800)", "500ml (Ksh 1,500)"],
          costPerPackage: 350,
          status: "check-locally",
          notes: "Check local registration; may be restricted in some countries"
        }
      ],
      organicControls: [
        {
          method: "Neem cake",
          preparation: "Apply neem cake to soil",
          application: "100kg per acre at planting"
        },
        {
          method: "Companion planting",
          preparation: "Plant marigolds or sunflowers around bean field",
          application: "Repels bean fly"
        }
      ],
      culturalControls: [
        "Plant early in season (avoid dry spells)",
        "Use certified seed",
        "Practice crop rotation",
        "Ensure good soil fertility for strong plants",
        "Hill soil around base of plants to encourage rooting"
      ],
      businessNote: "Early planting is FREE prevention! Delayed planting increases infestation by 60%."
    },
    {
      name: "Aphids",
      type: "pest",
      chemicalControls: [
        {
          productName: "Dimethoate 40EC",
          activeIngredient: "Dimethoate",
          rate: "10ml per 20L water",
          applicationMethod: "Foliar spray",
          timing: "When colonies appear",
          safetyInterval: "14 days before harvest",
          packageSizes: ["100ml (Ksh 300)", "250ml (Ksh 700)"],
          costPerPackage: 300,
          status: "restricted",
          notes: "⚠️ BANNED in Tanzania (Jan 2026). Check local regulations before recommending."
        }
      ],
      organicControls: [
        {
          method: "Neem spray",
          preparation: "Mix 50ml neem oil with 20L water",
          application: "Spray on affected plants"
        },
        {
          method: "Soap solution",
          preparation: "Mix 2 tablespoons liquid soap in 5L water",
          application: "Spray directly on aphids"
        },
        {
          method: "Introduce ladybirds",
          preparation: "Collect ladybirds from wild",
          application: "Release on infested plants"
        }
      ],
      culturalControls: [
        "Conserve ladybirds",
        "Use yellow sticky traps",
        "Remove heavily infested plants",
        "Plant flowers to attract beneficial insects"
      ],
      businessNote: "Ladybirds eat aphids for FREE! Attract them by planting flowers around your farm."
    },
    {
      name: "Thrips",
      type: "pest",
      chemicalControls: [
        {
          productName: "Decis 2.5EC",
          activeIngredient: "Deltamethrin",
          rate: "10ml per 20L water",
          applicationMethod: "Foliar spray",
          timing: "During flowering",
          safetyInterval: "7 days before harvest",
          packageSizes: ["100ml (Ksh 400)", "250ml (Ksh 900)"],
          costPerPackage: 400,
          status: "active",
          notes: "Available; rotate with other products to prevent resistance"
        }
      ],
      organicControls: [
        {
          method: "Neem spray",
          preparation: "Mix 50ml neem oil with 20L water",
          application: "Spray during flowering"
        },
        {
          method: "Blue sticky traps",
          preparation: "Purchase blue sticky traps",
          application: "Place 10-15 per acre"
        }
      ],
      culturalControls: [
        "Avoid planting near onions or garlic",
        "Use reflective mulch",
        "Maintain good soil moisture",
        "Remove weed hosts"
      ],
      businessNote: "Thrips cause silvering of pods - reduce market value by 50%!"
    },
    {
      name: "Anthracnose",
      type: "disease",
      chemicalControls: [
        {
          productName: "Mancozeb 80WP",
          activeIngredient: "Mancozeb",
          rate: "50g per 20L water",
          applicationMethod: "Foliar spray",
          timing: "Preventative, every 10-14 days",
          safetyInterval: "14 days before harvest",
          packageSizes: ["100g (Ksh 400)", "500g (Ksh 1,800)"],
          costPerPackage: 400,
          status: "active",
          notes: "Widely available protectant fungicide"
        },
        {
          productName: "Daconil 720SC",
          activeIngredient: "Chlorothalonil",
          rate: "40ml per 20L water",
          applicationMethod: "Foliar spray",
          timing: "At first sign of disease",
          safetyInterval: "14 days before harvest",
          packageSizes: ["100ml (Ksh 450)", "250ml (Ksh 1,000)"],
          costPerPackage: 450,
          status: "active",
          notes: "Broad-spectrum fungicide"
        }
      ],
      organicControls: [
        {
          method: "Copper spray",
          preparation: "Mix copper oxychloride at 50g per 20L",
          application: "Spray preventatively"
        },
        {
          method: "Baking soda solution",
          preparation: "Mix 1 tablespoon baking soda + 1 teaspoon oil in 4L water",
          application: "Spray weekly"
        }
      ],
      culturalControls: [
        "Use disease-free seed (certified)",
        "Practice crop rotation (3-4 years)",
        "Remove and destroy infected plants",
        "Avoid working in field when plants are wet",
        "Ensure good air circulation"
      ],
      businessNote: "Clean seed prevents 80% of disease problems! Buy certified seed from agrodealers."
    },
    {
      name: "Rust",
      type: "disease",
      chemicalControls: [
        {
          productName: "Daconil 720SC",
          activeIngredient: "Chlorothalonil",
          rate: "40ml per 20L water",
          applicationMethod: "Foliar spray",
          timing: "At first sign of rust pustules",
          safetyInterval: "14 days before harvest",
          packageSizes: ["100ml (Ksh 450)", "250ml (Ksh 1,000)"],
          costPerPackage: 450,
          status: "active"
        },
        {
          productName: "Sulfur 80WDG",
          activeIngredient: "Sulfur",
          rate: "30g per 20L water",
          applicationMethod: "Foliar spray",
          timing: "Preventatively",
          safetyInterval: "7 days before harvest",
          packageSizes: ["100g (Ksh 300)", "500g (Ksh 1,300)"],
          costPerPackage: 300,
          status: "active",
          notes: "Organic-approved"
        }
      ],
      organicControls: [
        {
          method: "Sulfur spray",
          preparation: "Mix wettable sulfur at label rate",
          application: "Spray preventatively"
        },
        {
          method: "Milk spray",
          preparation: "Mix 1 part milk with 9 parts water",
          application: "Spray weekly"
        }
      ],
      culturalControls: [
        "Use resistant varieties",
        "Ensure good air circulation",
        "Avoid overhead irrigation",
        "Remove crop residues after harvest",
        "Mulch to prevent soil splash"
      ],
      businessNote: "Rust reduces yield by 30-50% if not controlled. Early spraying saves your crop!"
    }
  ],

  tomatoes: [
    {
      name: "Whiteflies",
      type: "pest",
      chemicalControls: [
        {
          productName: "Confidor 200SL",
          activeIngredient: "Imidacloprid",
          rate: "10ml per 20L water",
          applicationMethod: "Foliar spray or soil drench",
          timing: "When populations are high",
          safetyInterval: "14 days before harvest",
          packageSizes: ["100ml (Ksh 450)", "250ml (Ksh 1,000)", "1L (Ksh 3,800)"],
          costPerPackage: 450,
          status: "active",
          notes: "Systemic insecticide"
        },
        {
          productName: "Decis 2.5EC",
          activeIngredient: "Deltamethrin",
          rate: "10ml per 20L water",
          applicationMethod: "Foliar spray",
          timing: "When whiteflies appear",
          safetyInterval: "7 days before harvest",
          packageSizes: ["100ml (Ksh 400)", "250ml (Ksh 900)"],
          costPerPackage: 400,
          status: "active"
        }
        // ❌ DUDU ACELAMECTIN REMOVED - ILLEGAL PRODUCT
      ],
      organicControls: [
        {
          method: "Yellow sticky traps",
          preparation: "Buy yellow sticky traps or paint plywood yellow and coat with grease",
          application: "Place 10-15 traps per acre"
        },
        {
          method: "Neem spray",
          preparation: "Mix 50ml neem oil with 20L water",
          application: "Spray weekly"
        },
        {
          method: "Reflective mulch",
          preparation: "Use silver/reflective plastic mulch",
          application: "Cover soil before transplanting"
        }
      ],
      culturalControls: [
        "Use reflective mulch",
        "Remove infested leaves",
        "Avoid planting near susceptible crops (cabbage, pumpkin)",
        "Use screen nets in nursery",
        "Conserve natural enemies (lacewings, ladybirds)"
      ],
      businessNote: "Yellow traps cost Ksh 50 each and last all season! Cheaper than repeated spraying."
    },
    {
      name: "Tomato borer (Tuta absoluta)",
      type: "pest",
      chemicalControls: [
        {
          productName: "Coragen 20SC",
          activeIngredient: "Chlorantraniliprole",
          rate: "4ml per 20L water",
          applicationMethod: "Foliar spray",
          timing: "At first sign of mines/borers",
          safetyInterval: "14 days before harvest",
          packageSizes: ["100ml (Ksh 1,200)", "250ml (Ksh 2,800)"],
          costPerPackage: 1200,
          status: "active",
          notes: "Very effective, rotate with other products"
        },
        {
          productName: "Radiant 120SC",
          activeIngredient: "Spinetoram",
          rate: "5ml per 20L water",
          applicationMethod: "Foliar spray",
          timing: "When larvae active",
          safetyInterval: "7 days before harvest",
          packageSizes: ["100ml (Ksh 950)", "250ml (Ksh 2,200)"],
          costPerPackage: 950,
          status: "active"
        },
        {
          productName: "Duduthrin 1.75EC",
          activeIngredient: "Lambda-cyhalothrin",
          rate: "10ml per 20L water",
          applicationMethod: "Foliar spray",
          timing: "At first sign of damage",
          safetyInterval: "14 days before harvest",
          packageSizes: ["100ml (Ksh 450)", "250ml (Ksh 1,000)"],
          costPerPackage: 450,
          status: "active"
        }
      ],
      organicControls: [
        {
          method: "Pheromone traps",
          preparation: "Buy Tuta absoluta pheromone lures",
          application: "Place 10-15 traps per acre"
        },
        {
          method: "Bacillus thuringiensis",
          preparation: "Follow label instructions",
          application: "Spray when larvae are young"
        },
        {
          method: "Neem oil",
          preparation: "Mix 50ml neem oil with 20L water",
          application: "Spray weekly"
        }
      ],
      culturalControls: [
        "Monitor regularly with pheromone traps",
        "Remove and destroy infested leaves and fruits",
        "Practice crop rotation (avoid planting after tomatoes)",
        "Deep plough to expose pupae",
        "Use netting in greenhouse"
      ],
      businessNote: "One borer can destroy multiple fruits. Early detection saves 40% of yield! Pheromone traps cost Ksh 500 per acre."
    },
    {
      name: "Late blight",
      type: "disease",
      chemicalControls: [
        {
          productName: "Ridomil Gold 68WG",
          activeIngredient: "Metalaxyl-M + Mancozeb",
          rate: "50g per 20L water",
          applicationMethod: "Foliar spray",
          timing: "Preventatively every 7-10 days in wet weather",
          safetyInterval: "14 days before harvest",
          packageSizes: ["100g (Ksh 600)", "500g (Ksh 2,800)"],
          costPerPackage: 600,
          status: "active",
          notes: "Systemic + protectant"
        },
        {
          productName: "Milraz 76WP",
          activeIngredient: "Propamocarb + Mancozeb",
          rate: "40g per 20L water",
          applicationMethod: "Foliar spray",
          timing: "At first sign of disease",
          safetyInterval: "14 days before harvest",
          packageSizes: ["100g (Ksh 550)", "500g (Ksh 2,500)"],
          costPerPackage: 550,
          status: "active"
        },
        {
          productName: "Mancozeb 80WP",
          activeIngredient: "Mancozeb",
          rate: "50g per 20L water",
          applicationMethod: "Foliar spray (preventative)",
          timing: "Every 7-10 days",
          safetyInterval: "14 days before harvest",
          packageSizes: ["100g (Ksh 400)", "500g (Ksh 1,800)"],
          costPerPackage: 400,
          status: "active"
        }
      ],
      organicControls: [
        {
          method: "Copper oxychloride",
          preparation: "Mix 50g per 20L water",
          application: "Spray preventatively (OMRI approved)"
        },
        {
          method: "Milk spray",
          preparation: "Mix 1 part milk with 9 parts water",
          application: "Spray weekly"
        },
        {
          method: "Compost tea",
          preparation: "Brew aerated compost tea",
          application: "Spray weekly"
        }
      ],
      culturalControls: [
        "Ensure good air circulation (proper spacing)",
        "Avoid overhead irrigation",
        "Remove and destroy infected plants",
        "Use resistant varieties where available",
        "Stake plants to keep foliage dry",
        "Mulch to prevent soil splash"
      ],
      businessNote: "Late blight can destroy entire crop in 7 days! Preventative spraying saves 60% of crop."
    },
    {
      name: "Early blight",
      type: "disease",
      chemicalControls: [
        {
          productName: "Mancozeb 80WP",
          activeIngredient: "Mancozeb",
          rate: "50g per 20L water",
          applicationMethod: "Foliar spray",
          timing: "At first sign of spots",
          safetyInterval: "14 days before harvest",
          packageSizes: ["100g (Ksh 400)", "500g (Ksh 1,800)"],
          costPerPackage: 400,
          status: "active"
        },
        {
          productName: "Antracol 70WP",
          activeIngredient: "Propineb",
          rate: "50g per 20L water",
          applicationMethod: "Foliar spray",
          timing: "Preventatively",
          safetyInterval: "14 days before harvest",
          packageSizes: ["100g (Ksh 500)", "500g (Ksh 2,200)"],
          costPerPackage: 500,
          status: "active"
        },
        {
          productName: "Daconil 720SC",
          activeIngredient: "Chlorothalonil",
          rate: "40ml per 20L water",
          applicationMethod: "Foliar spray",
          timing: "At first sign",
          safetyInterval: "14 days before harvest",
          packageSizes: ["100ml (Ksh 450)", "250ml (Ksh 1,000)"],
          costPerPackage: 450,
          status: "active"
        }
      ],
      organicControls: [
        {
          method: "Copper spray",
          preparation: "Copper oxychloride 50g per 20L",
          application: "Spray weekly"
        },
        {
          method: "Baking soda solution",
          preparation: "1 tbsp baking soda + 1 tsp oil in 4L water",
          application: "Spray weekly"
        }
      ],
      culturalControls: [
        "Use disease-free seed",
        "Practice crop rotation",
        "Remove infected lower leaves",
        "Mulch to prevent soil splash",
        "Water at base, not on foliage"
      ],
      businessNote: "Early blight reduces yield by 30-50%. Remove lower leaves to improve air circulation."
    }
  ],

  potatoes: [
    {
      name: "Potato tuber moth",
      type: "pest",
      chemicalControls: [
        {
          productName: "Dimethoate 40EC",
          activeIngredient: "Dimethoate",
          rate: "10ml per 20L water",
          applicationMethod: "Foliar spray",
          timing: "During tuber formation",
          safetyInterval: "14 days before harvest",
          packageSizes: ["100ml (Ksh 300)", "250ml (Ksh 700)"],
          costPerPackage: 300,
          status: "restricted",
          notes: "⚠️ BANNED in Tanzania (Jan 2026). Check local regulations before recommending."
        },
        {
          productName: "Duduthrin 1.75EC",
          activeIngredient: "Lambda-cyhalothrin",
          rate: "10ml per 20L water",
          applicationMethod: "Foliar spray",
          timing: "When moths active",
          safetyInterval: "14 days before harvest",
          packageSizes: ["100ml (Ksh 450)", "250ml (Ksh 1,000)"],
          costPerPackage: 450,
          status: "active"
        }
      ],
      organicControls: [
        {
          method: "Pheromone traps",
          preparation: "Buy potato tuber moth lures",
          application: "Place 4-6 traps per acre"
        },
        {
          method: "Bacillus thuringiensis",
          preparation: "Follow label instructions",
          application: "Spray when larvae active"
        }
      ],
      culturalControls: [
        "Hill properly (cover tubers with at least 10cm soil)",
        "Harvest promptly when mature",
        "Remove volunteer potatoes",
        "Store in cool, dark conditions",
        "Use clean storage containers"
      ],
      businessNote: "Proper hilling is FREE and reduces infestation by 70%!"
    },
    {
      name: "Late blight",
      type: "disease",
      chemicalControls: [
        {
          productName: "Ridomil Gold 68WG",
          activeIngredient: "Metalaxyl-M + Mancozeb",
          rate: "50g per 20L water",
          applicationMethod: "Foliar spray",
          timing: "Preventatively, especially during wet periods",
          safetyInterval: "14 days before harvest",
          packageSizes: ["100g (Ksh 600)", "500g (Ksh 2,800)"],
          costPerPackage: 600,
          status: "active"
        },
        {
          productName: "Curzate R 65WP",
          activeIngredient: "Cymoxanil + Mancozeb",
          rate: "40g per 20L water",
          applicationMethod: "Foliar spray",
          timing: "At first sign of blight",
          safetyInterval: "14 days before harvest",
          packageSizes: ["100g (Ksh 550)", "500g (Ksh 2,500)"],
          costPerPackage: 550,
          status: "active"
        },
        {
          productName: "Mancozeb 80WP",
          activeIngredient: "Mancozeb",
          rate: "50g per 20L water",
          applicationMethod: "Foliar spray",
          timing: "Preventatively every 7-10 days",
          safetyInterval: "14 days before harvest",
          packageSizes: ["100g (Ksh 400)", "500g (Ksh 1,800)"],
          costPerPackage: 400,
          status: "active"
        }
      ],
      organicControls: [
        {
          method: "Copper oxychloride",
          preparation: "50g per 20L water",
          application: "Spray preventatively"
        },
        {
          method: "Compost tea",
          preparation: "Brew aerated compost tea",
          application: "Spray weekly"
        }
      ],
      culturalControls: [
        "Use certified seed potatoes",
        "Plant in well-drained soil",
        "Hill to cover tubers",
        "Remove volunteer potatoes",
        "Destroy crop residues after harvest",
        "Avoid overhead irrigation"
      ],
      businessNote: "Late blight caused Irish Potato Famine! Don't take chances - spray preventatively in wet weather."
    }
  ],

  coffee: [
    {
      name: "Coffee berry borer",
      type: "pest",
      chemicalControls: [
        {
          productName: "Duduthrin 1.75EC",
          activeIngredient: "Lambda-cyhalothrin",
          rate: "10ml per 20L water",
          applicationMethod: "Foliar spray, target berries",
          timing: "When berries are pinhead stage",
          safetyInterval: "21 days before harvest",
          packageSizes: ["100ml (Ksh 450)", "250ml (Ksh 1,000)", "1L (Ksh 3,800)"],
          costPerPackage: 450,
          status: "active"
        },
        {
          productName: "Pyrethrum 5EC",
          activeIngredient: "Pyrethrins",
          rate: "20ml per 20L water",
          applicationMethod: "Foliar spray",
          timing: "When borers are active",
          safetyInterval: "7 days before harvest",
          packageSizes: ["100ml (Ksh 500)", "250ml (Ksh 1,200)"],
          costPerPackage: 500,
          status: "active",
          notes: "Organic-approved, derived from pyrethrum flowers"
        }
      ],
      organicControls: [
        {
          method: "Pyrethrum spray",
          preparation: "Pyrethrum 5EC at label rate",
          application: "Spray when borers active"
        },
        {
          method: "Beauveria bassiana",
          preparation: "Commercial biopesticide",
          application: "Follow label instructions"
        },
        {
          method: "Traps",
          preparation: "Use methanol:ethanol traps",
          application: "Place 10-15 per acre"
        }
      ],
      culturalControls: [
        "Regular harvesting (every 2-3 weeks)",
        "Trap trees - leave a few trees unsprayed to concentrate borers",
        "Remove all berries after harvest",
        "Prune to allow air circulation"
      ],
      businessNote: "Regular harvesting is FREE! Borer damage can reduce coffee value by 50%."
    },
    {
      name: "Coffee leaf rust",
      type: "disease",
      chemicalControls: [
        {
          productName: "Copper oxychloride",
          activeIngredient: "Copper oxychloride",
          rate: "50g per 20L water",
          applicationMethod: "Foliar spray",
          timing: "Preventatively during wet season",
          safetyInterval: "14 days before harvest",
          packageSizes: ["100g (Ksh 350)", "500g (Ksh 1,600)", "1kg (Ksh 3,000)"],
          costPerPackage: 350,
          status: "active",
          notes: "Organic-approved copper fungicide"
        },
        {
          productName: "Bordeaux mixture",
          activeIngredient: "Copper sulfate + lime",
          rate: "100g copper sulfate + 100g lime per 20L",
          applicationMethod: "Foliar spray",
          timing: "Preventatively",
          safetyInterval: "14 days before harvest",
          packageSizes: ["Make fresh"],
          status: "active"
        }
      ],
      organicControls: [
        {
          method: "Copper spray",
          preparation: "Copper oxychloride 50g per 20L",
          application: "Spray preventatively"
        },
        {
          method: "Bordeaux mixture",
          preparation: "100g copper sulfate + 100g lime per 20L",
          application: "Spray at onset of rains"
        }
      ],
      culturalControls: [
        "Use resistant varieties (Ruiru 11, Batian)",
        "Prune for good air circulation",
        "Maintain good soil fertility",
        "Remove and destroy infected leaves"
      ],
      businessNote: "Rust can reduce yield by 70%. Resistant varieties cost the same as susceptible ones!"
    }
  ],

  bananas: [
    {
      name: "Banana weevil",
      type: "pest",
      chemicalControls: [
        {
          productName: "Diazinon 60EC",
          activeIngredient: "Diazinon",
          rate: "20ml per 20L water",
          applicationMethod: "Apply at base of plant",
          timing: "At planting and every 3 months",
          safetyInterval: "30 days before harvest",
          packageSizes: ["100ml (Ksh 350)", "250ml (Ksh 800)"],
          costPerPackage: 350,
          status: "check-locally",
          notes: "Check local registration; may be restricted"
        }
      ],
      organicControls: [
        {
          method: "Traps",
          preparation: "Split pseudostems into 50cm pieces",
          application: "Place cut side down, collect weevils weekly"
        },
        {
          method: "Neem cake",
          preparation: "Apply neem cake around base",
          application: "200g per plant every 3 months"
        }
      ],
      culturalControls: [
        "Use clean planting material (pare suckers before planting)",
        "Trap using split pseudostems",
        "Keep plantation clean",
        "Practice crop rotation",
        "Destroy infested plants"
      ],
      businessNote: "Clean suckers are FREE! Weevil damage causes 30-50% yield loss."
    },
    {
      name: "Sigatoka (Black leaf streak)",
      type: "disease",
      chemicalControls: [
        {
          productName: "Mancozeb 80WP",
          activeIngredient: "Mancozeb",
          rate: "50g per 20L water",
          applicationMethod: "Foliar spray",
          timing: "Every 21 days in wet season",
          safetyInterval: "14 days before harvest",
          packageSizes: ["100g (Ksh 400)", "500g (Ksh 1,800)"],
          costPerPackage: 400,
          status: "active"
        },
        {
          productName: "Copper oxychloride",
          activeIngredient: "Copper oxychloride",
          rate: "50g per 20L water",
          applicationMethod: "Foliar spray",
          timing: "Preventatively",
          safetyInterval: "14 days before harvest",
          packageSizes: ["100g (Ksh 350)", "500g (Ksh 1,600)"],
          costPerPackage: 350,
          status: "active"
        }
      ],
      organicControls: [
        {
          method: "Copper spray",
          preparation: "Copper oxychloride 50g per 20L",
          application: "Spray every 21 days"
        },
        {
          method: "Remove infected leaves",
          preparation: "Cut and destroy infected leaves",
          application: "Weekly during wet season"
        }
      ],
      culturalControls: [
        "Remove infected leaves (deleafing)",
        "Maintain good drainage",
        "Proper spacing for air circulation",
        "Use disease-free planting material",
        "Mulch to conserve soil moisture"
      ],
      businessNote: "Sigatoka reduces fruit quality and size. Remove infected leaves regularly - it's FREE!"
    }
  ],

  avocados: [
    {
      name: "Anthracnose",
      type: "disease",
      chemicalControls: [
        {
          productName: "Copper oxychloride",
          activeIngredient: "Copper oxychloride 50%",
          rate: "50g per 20L water",
          applicationMethod: "Foliar spray",
          timing: "During flowering and fruit development, repeat every 14-21 days",
          safetyInterval: "14 days before harvest",
          packageSizes: ["100g (Ksh 350)", "500g (Ksh 1,600)", "1kg (Ksh 3,000)"],
          costPerPackage: 350,
          status: "active",
          notes: "Organic-approved copper fungicide"
        },
        {
          productName: "Mancozeb 80WP",
          activeIngredient: "Mancozeb",
          rate: "50g per 20L water",
          applicationMethod: "Foliar spray",
          timing: "Preventatively during wet weather",
          safetyInterval: "14 days before harvest",
          packageSizes: ["100g (Ksh 400)", "500g (Ksh 1,800)"],
          costPerPackage: 400,
          status: "active"
        }
      ],
      organicControls: [
        {
          method: "Copper spray",
          preparation: "Copper oxychloride 50g per 20L",
          application: "Spray during flowering"
        },
        {
          method: "Neem oil",
          preparation: "Mix 50ml neem oil with 20L water",
          application: "Spray every 14 days"
        }
      ],
      culturalControls: [
        "Prune trees to improve air circulation",
        "Remove and destroy infected fruits and branches",
        "Harvest fruits carefully to avoid bruising",
        "Maintain proper tree nutrition to reduce susceptibility"
      ],
      businessNote: "Anthracnose causes dark spots on fruits, reducing market value by 50-70%! Preventative spraying during flowering protects your crop."
    },
    {
      name: "Root rot (Phytophthora)",
      type: "disease",
      chemicalControls: [
        {
          productName: "Ridomil Gold 68WG",
          activeIngredient: "Metalaxyl-M + Mancozeb",
          rate: "50g per 20L water",
          applicationMethod: "Drench soil around base of tree",
          timing: "At first signs of wilting, repeat after 30 days",
          safetyInterval: "30 days before harvest",
          packageSizes: ["100g (Ksh 600)", "500g (Ksh 2,800)"],
          costPerPackage: 600,
          status: "active"
        },
        {
          productName: "Phosphorous acid",
          activeIngredient: "Potassium phosphonate",
          rate: "Follow label instructions",
          applicationMethod: "Soil drench or trunk injection",
          timing: "Preventatively",
          safetyInterval: "14 days",
          packageSizes: ["1L (Ksh 1,200)"],
          costPerPackage: 1200,
          status: "active"
        }
      ],
      organicControls: [
        {
          method: "Gypsum",
          preparation: "Apply gypsum around base",
          application: "5kg per tree annually"
        },
        {
          method: "Compost",
          preparation: "Apply well-decomposed compost",
          application: "20kg per tree annually"
        }
      ],
      culturalControls: [
        "Plant on well-drained soils",
        "Use resistant rootstocks (e.g., Duke 7, Toro Canyon, Dusa)",
        "Avoid overwatering and waterlogging",
        "Plant on raised beds in poorly drained areas",
        "Remove and destroy severely infected trees"
      ],
      businessNote: "Phytophthora root rot is the #1 killer of avocado trees! Prevention through good drainage is better than cure."
    },
    {
      name: "Cercospora spot",
      type: "disease",
      chemicalControls: [
        {
          productName: "Copper oxychloride",
          activeIngredient: "Copper oxychloride",
          rate: "50g per 20L water",
          applicationMethod: "Foliar spray",
          timing: "At first sign of leaf spots",
          safetyInterval: "14 days before harvest",
          packageSizes: ["100g (Ksh 350)", "500g (Ksh 1,600)"],
          costPerPackage: 350,
          status: "active"
        }
      ],
      organicControls: [
        {
          method: "Copper spray",
          preparation: "Copper oxychloride 50g per 20L",
          application: "Spray at first sign"
        },
        {
          method: "Remove infected leaves",
          preparation: "Hand remove spotted leaves",
          application: "Monthly"
        }
      ],
      culturalControls: [
        "Remove and destroy infected leaves",
        "Prune for better air circulation",
        "Avoid overhead irrigation"
      ],
      businessNote: "Cercospora causes defoliation and reduces yield. Remove infected leaves - it's FREE!"
    },
    {
      name: "Sunblotch",
      type: "disease",
      chemicalControls: [],
      organicControls: [],
      culturalControls: [
        "Buy certified disease-free trees from reputable nurseries",
        "Remove and destroy infected trees immediately",
        "Disinfect pruning tools between trees (10% bleach solution)",
        "Do not propagate from infected trees",
        "Plant certified virus-free material only"
      ],
      businessNote: "Sunblotch has NO CURE! Certified virus-free trees cost a little more but save your entire orchard."
    },
    {
      name: "Scab",
      type: "disease",
      chemicalControls: [
        {
          productName: "Copper oxychloride",
          activeIngredient: "Copper oxychloride",
          rate: "50g per 20L water",
          applicationMethod: "Foliar spray",
          timing: "At flowering and fruit set",
          safetyInterval: "14 days before harvest",
          packageSizes: ["100g (Ksh 350)", "500g (Ksh 1,600)"],
          costPerPackage: 350,
          status: "active"
        }
      ],
      organicControls: [
        {
          method: "Copper spray",
          preparation: "Copper oxychloride 50g per 20L",
          application: "Spray during flowering"
        },
        {
          method: "Sulfur spray",
          preparation: "Wettable sulfur at label rate",
          application: "Spray preventatively"
        }
      ],
      culturalControls: [
        "Prune to improve air circulation",
        "Remove infected fruits and leaves",
        "Apply protective fungicides during flowering"
      ],
      businessNote: "Scab causes rough, corky spots on fruits - reduces market value by 30-40%!"
    },
    {
      name: "Thrips",
      type: "pest",
      chemicalControls: [
        {
          productName: "Decis 2.5EC",
          activeIngredient: "Deltamethrin",
          rate: "10ml per 20L water",
          applicationMethod: "Foliar spray",
          timing: "During flowering",
          safetyInterval: "7 days before harvest",
          packageSizes: ["100ml (Ksh 400)", "250ml (Ksh 900)"],
          costPerPackage: 400,
          status: "active"
        },
        {
          productName: "Success 120SC",
          activeIngredient: "Spinetoram",
          rate: "5ml per 20L water",
          applicationMethod: "Foliar spray",
          timing: "When thrips active",
          safetyInterval: "7 days",
          packageSizes: ["100ml (Ksh 950)"],
          costPerPackage: 950,
          status: "active"
        }
      ],
      organicControls: [
        {
          method: "Neem spray",
          preparation: "Mix 50ml neem oil with 20L water + few drops liquid soap",
          application: "Spray on flowers and young fruits"
        },
        {
          method: "Blue sticky traps",
          preparation: "Purchase blue sticky traps",
          application: "Place 10-15 per acre"
        },
        {
          method: "Predatory mites",
          preparation: "Purchase beneficial mites",
          application: "Release 10-20 per tree"
        }
      ],
      culturalControls: [
        "Conserve natural enemies (minute pirate bugs, lacewings)",
        "Use reflective mulch",
        "Remove alternative host weeds"
      ],
      businessNote: "Thrips cause scarring on fruits - Grade A fruits sell for 40% more!"
    },
    {
      name: "False codling moth",
      type: "pest",
      chemicalControls: [
        {
          productName: "Duduthrin 1.75EC",
          activeIngredient: "Lambda-cyhalothrin",
          rate: "10ml per 20L water",
          applicationMethod: "Foliar spray",
          timing: "When moths are active",
          safetyInterval: "14 days before harvest",
          packageSizes: ["100ml (Ksh 450)", "250ml (Ksh 1,000)"],
          costPerPackage: 450,
          status: "active"
        },
        {
          productName: "Coragen 20SC",
          activeIngredient: "Chlorantraniliprole",
          rate: "4ml per 20L water",
          applicationMethod: "Foliar spray",
          timing: "At fruit set",
          safetyInterval: "14 days",
          packageSizes: ["100ml (Ksh 1,200)"],
          costPerPackage: 1200,
          status: "active"
        }
      ],
      organicControls: [
        {
          method: "Pheromone traps",
          preparation: "Buy FCM pheromone lures and traps",
          application: "Place 4-6 traps per acre for monitoring, 10-12 for mass trapping"
        },
        {
          method: "Mating disruption",
          preparation: "FCM pheromone dispensers",
          application: "Place 500-1000 per acre"
        },
        {
          method: "Neem oil",
          preparation: "50ml neem oil per 20L water",
          application: "Spray every 14 days"
        }
      ],
      culturalControls: [
        "Use pheromone traps for monitoring and mass trapping",
        "Remove and destroy infested fruits",
        "Harvest fruits promptly",
        "Keep orchard floor clean",
        "Bag fruits with paper bags"
      ],
      businessNote: "FCM makes fruits unmarketable for export. One trap per acre costs Ksh 500 and catches thousands of moths!"
    },
    {
      name: "Leaf roller",
      type: "pest",
      chemicalControls: [
        {
          productName: "Duduthrin 1.75EC",
          activeIngredient: "Lambda-cyhalothrin",
          rate: "10ml per 20L water",
          applicationMethod: "Foliar spray",
          timing: "When caterpillars and leaf rolling are observed",
          safetyInterval: "14 days before harvest",
          packageSizes: ["100ml (Ksh 450)", "250ml (Ksh 1,000)"],
          costPerPackage: 450,
          status: "active"
        }
      ],
      organicControls: [
        {
          method: "Bacillus thuringiensis",
          preparation: "Follow label instructions",
          application: "Spray when caterpillars young"
        },
        {
          method: "Handpicking",
          preparation: "Remove rolled leaves",
          application: "Weekly"
        }
      ],
      culturalControls: [
        "Handpick and destroy rolled leaves with caterpillars",
        "Conserve natural enemies (parasitic wasps)",
        "Prune to improve air circulation"
      ],
      businessNote: "Handpicking is FREE! Check trees every 2 weeks during growing season."
    }
  ],

  // ========== NEW CROPS ADDED ==========

  rice: [
    {
      name: "Rice blast (Pyricularia)",
      type: "disease",
      chemicalControls: [
        {
          productName: "Beam 75WP",
          activeIngredient: "Tricyclazole",
          rate: "40g per 20L water",
          applicationMethod: "Foliar spray",
          timing: "At first sign of leaf spots, repeat every 10-14 days",
          safetyInterval: "21 days before harvest",
          packageSizes: ["100g (Ksh 600)", "500g (Ksh 2,800)"],
          costPerPackage: 600,
          status: "active",
          notes: "Most destructive rice disease worldwide"
        },
        {
          productName: "Folicur 250EW",
          activeIngredient: "Tebuconazole",
          rate: "20ml per 20L water",
          applicationMethod: "Foliar spray",
          timing: "At neck blast stage",
          safetyInterval: "21 days",
          packageSizes: ["100ml (Ksh 550)", "250ml (Ksh 1,300)"],
          costPerPackage: 550,
          status: "active"
        }
      ],
      organicControls: [
        {
          method: "Silicon application",
          preparation: "Apply rice husk ash or calcium silicate",
          application: "2 tons per acre before planting"
        },
        {
          method: "Neem oil",
          preparation: "Mix 50ml neem oil with 20L water",
          application: "Spray every 10-14 days"
        }
      ],
      culturalControls: [
        "Plant resistant varieties (e.g., Komboka, IR54)",
        "Avoid excessive nitrogen fertilizer",
        "Maintain proper water drainage",
        "Remove and destroy infected plant debris",
        "Use certified disease-free seed"
      ],
      businessNote: "Rice blast can cause 50-90% yield loss! Resistant varieties are the most cost-effective control."
    },
    {
      name: "Rice bacterial leaf blight",
      type: "disease",
      chemicalControls: [
        {
          productName: "Copper oxychloride",
          activeIngredient: "Copper oxychloride",
          rate: "50g per 20L water",
          applicationMethod: "Foliar spray",
          timing: "At first sign of symptoms",
          safetyInterval: "14 days",
          packageSizes: ["100g (Ksh 350)", "500g (Ksh 1,600)"],
          costPerPackage: 350,
          status: "active"
        }
      ],
      organicControls: [],
      culturalControls: [
        "Use resistant varieties",
        "Avoid wounding plants",
        "Drain fields before tillering",
        "Remove infected leaves",
        "Balance nitrogen fertilization"
      ],
      businessNote: "Bacterial blight spreads rapidly in wet conditions. Early drainage helps!"
    },
    {
      name: "Rice yellow mottle virus (RYMV)",
      type: "disease",
      chemicalControls: [],
      organicControls: [],
      culturalControls: [
        "Use resistant varieties (e.g., Gigante, IR64)",
        "Control beetles (vectors) with recommended insecticides",
        "Rogue out infected plants",
        "Practice crop rotation",
        "Avoid using infected equipment"
      ],
      businessNote: "RYMV has NO CURE! Resistant varieties are essential in affected areas."
    },
    {
      name: "Rice stem borer",
      type: "pest",
      chemicalControls: [
        {
          productName: "Duduthrin 1.75EC",
          activeIngredient: "Lambda-cyhalothrin",
          rate: "10ml per 20L water",
          applicationMethod: "Foliar spray",
          timing: "At egg hatch and early larval stages",
          safetyInterval: "14 days",
          packageSizes: ["100ml (Ksh 450)", "250ml (Ksh 1,000)"],
          costPerPackage: 450,
          status: "active"
        }
      ],
      organicControls: [
        {
          method: "Trichogramma wasps",
          preparation: "Purchase egg parasitoids",
          application: "Release 50,000 per acre at booting stage"
        },
        {
          method: "Neem cake",
          preparation: "Apply neem cake to soil",
          application: "100kg per acre before planting"
        }
      ],
      culturalControls: [
        "Plant early to escape peak infestation",
        "Destroy crop residues after harvest",
        "Use light traps to monitor adult moths",
        "Practice crop rotation",
        "Keep fields weed-free"
      ],
      businessNote: "Stem borers can cause 20-30% yield loss. Early planting is FREE prevention!"
    }
  ],

  mangoes: [
    {
      name: "Mango fruit fly",
      type: "pest",
      chemicalControls: [
        {
          productName: "Success 120SC",
          activeIngredient: "Spinetoram",
          rate: "5ml per 20L water",
          applicationMethod: "Foliar spray",
          timing: "At fruit set and during ripening",
          safetyInterval: "7 days",
          packageSizes: ["100ml (Ksh 950)", "250ml (Ksh 2,200)"],
          costPerPackage: 950,
          status: "active"
        },
        {
          productName: "Decis 2.5EC",
          activeIngredient: "Deltamethrin",
          rate: "10ml per 20L water",
          applicationMethod: "Foliar spray",
          timing: "When flies active",
          safetyInterval: "7 days",
          packageSizes: ["100ml (Ksh 400)", "250ml (Ksh 900)"],
          costPerPackage: 400,
          status: "active"
        }
      ],
      organicControls: [
        {
          method: "Protein bait sprays",
          preparation: "Mix 100ml hydrolyzed protein + 20ml insecticide in 2L water",
          application: "Spot spray on tree trunks"
        },
        {
          method: "Pheromone traps",
          preparation: "Methyl eugenol traps",
          application: "Place 4-6 traps per acre"
        },
        {
          method: "Fruit bagging",
          preparation: "Use paper bags",
          application: "Bag fruits 45-50 days after fruit set"
        }
      ],
      culturalControls: [
        "Harvest fruits promptly",
        "Remove and destroy fallen and infested fruits",
        "Plough soil to expose pupae",
        "Use clean cultivation",
        "Practice early harvesting"
      ],
      businessNote: "Fruit flies can destroy 80% of mango crop! Protein bait sprays cost Ksh 500/acre - cheaper than full coverage spraying."
    },
    {
      name: "Mango powdery mildew",
      type: "disease",
      chemicalControls: [
        {
          productName: "Sulfur 80WDG",
          activeIngredient: "Sulfur",
          rate: "30g per 20L water",
          applicationMethod: "Foliar spray",
          timing: "At flowering, repeat every 10-14 days",
          safetyInterval: "7 days",
          packageSizes: ["100g (Ksh 300)", "500g (Ksh 1,300)"],
          costPerPackage: 300,
          status: "active",
          notes: "Organic-approved"
        },
        {
          productName: "Bayleton 25WP",
          activeIngredient: "Triadimefon",
          rate: "15g per 20L water",
          applicationMethod: "Foliar spray",
          timing: "At first sign of disease",
          safetyInterval: "14 days",
          packageSizes: ["100g (Ksh 450)", "500g (Ksh 2,000)"],
          costPerPackage: 450,
          status: "active"
        }
      ],
      organicControls: [
        {
          method: "Sulfur spray",
          preparation: "Wettable sulfur 30g per 20L",
          application: "Spray during flowering"
        },
        {
          method: "Milk spray",
          preparation: "Mix 1 part milk with 9 parts water",
          application: "Spray weekly during flowering"
        },
        {
          method: "Baking soda solution",
          preparation: "1 tbsp baking soda + 1 tsp oil in 4L water",
          application: "Spray weekly"
        }
      ],
      culturalControls: [
        "Prune to improve air circulation",
        "Avoid overhead irrigation",
        "Remove infected flowers and leaves",
        "Maintain proper tree spacing"
      ],
      businessNote: "Powdery mildew attacks flowers - yield loss can reach 80%! Protect blossoms at all cost."
    },
    {
      name: "Mango anthracnose",
      type: "disease",
      chemicalControls: [
        {
          productName: "Mancozeb 80WP",
          activeIngredient: "Mancozeb",
          rate: "50g per 20L water",
          applicationMethod: "Foliar spray",
          timing: "During flowering and fruit development",
          safetyInterval: "14 days",
          packageSizes: ["100g (Ksh 400)", "500g (Ksh 1,800)"],
          costPerPackage: 400,
          status: "active"
        },
        {
          productName: "Copper oxychloride",
          activeIngredient: "Copper oxychloride",
          rate: "50g per 20L water",
          applicationMethod: "Foliar spray",
          timing: "Preventatively during wet weather",
          safetyInterval: "14 days",
          packageSizes: ["100g (Ksh 350)", "500g (Ksh 1,600)"],
          costPerPackage: 350,
          status: "active"
        }
      ],
      organicControls: [
        {
          method: "Copper spray",
          preparation: "Copper oxychloride 50g per 20L",
          application: "Spray during flowering"
        },
        {
          method: "Neem oil",
          preparation: "50ml neem oil per 20L water",
          application: "Spray every 14 days"
        }
      ],
      culturalControls: [
        "Prune to improve air circulation",
        "Remove and destroy infected fruits and branches",
        "Harvest fruits carefully to avoid bruising",
        "Hot water treatment (52°C for 10 minutes) after harvest"
      ],
      businessNote: "Anthracnose causes black spots on fruits - reduces market value by 50%! Hot water treatment after harvest is 90% effective."
    },
    {
      name: "Mango scale insects",
      type: "pest",
      chemicalControls: [
        {
          productName: "Confidor 200SL",
          activeIngredient: "Imidacloprid",
          rate: "10ml per 20L water",
          applicationMethod: "Foliar spray",
          timing: "At crawler stage",
          safetyInterval: "14 days",
          packageSizes: ["100ml (Ksh 450)", "250ml (Ksh 1,000)"],
          costPerPackage: 450,
          status: "active"
        }
      ],
      organicControls: [
        {
          method: "Neem oil",
          preparation: "Mix 50ml neem oil with 20L water",
          application: "Spray thoroughly on infested branches"
        },
        {
          method: "Soap solution",
          preparation: "Mix 2 tablespoons liquid soap in 5L water",
          application: "Spray directly on scales"
        },
        {
          method: "Introduce ladybirds",
          preparation: "Collect ladybirds from wild",
          application: "Release on infested trees"
        }
      ],
      culturalControls: [
        "Prune heavily infested branches",
        "Scrape off scales manually",
        "Conserve natural enemies (ladybirds, parasitic wasps)",
        "Avoid excessive nitrogen fertilizer"
      ],
      businessNote: "Ladybirds eat scales for FREE! One ladybird can eat 50 scales per day."
    }
  ],

  pineapples: [
    {
      name: "Pineapple mealybug",
      type: "pest",
      chemicalControls: [
        {
          productName: "Confidor 200SL",
          activeIngredient: "Imidacloprid",
          rate: "10ml per 20L water",
          applicationMethod: "Soil drench or foliar spray",
          timing: "When mealybugs appear",
          safetyInterval: "30 days",
          packageSizes: ["100ml (Ksh 450)", "250ml (Ksh 1,000)"],
          costPerPackage: 450,
          status: "active"
        }
      ],
      organicControls: [
        {
          method: "Neem oil",
          preparation: "Mix 50ml neem oil with 20L water",
          application: "Spray on infested plants"
        },
        {
          method: "Soap solution",
          preparation: "Mix 2 tablespoons liquid soap in 5L water",
          application: "Spray directly on mealybugs"
        },
        {
          method: "Introduce ladybirds",
          preparation: "Collect ladybirds from wild",
          application: "Release on infested plants"
        }
      ],
      culturalControls: [
        "Use clean planting material",
        "Remove and destroy infested plants",
        "Control ants which protect mealybugs",
        "Practice crop rotation"
      ],
      businessNote: "Mealybugs transmit mealybug wilt virus - yield loss up to 100%! Control ants first."
    },
    {
      name: "Pineapple heart rot (Phytophthora)",
      type: "disease",
      chemicalControls: [
        {
          productName: "Ridomil Gold 68WG",
          activeIngredient: "Metalaxyl-M + Mancozeb",
          rate: "50g per 20L water",
          applicationMethod: "Soil drench at planting",
          timing: "At planting and during wet weather",
          safetyInterval: "30 days",
          packageSizes: ["100g (Ksh 600)", "500g (Ksh 2,800)"],
          costPerPackage: 600,
          status: "active"
        }
      ],
      organicControls: [
        {
          method: "Raised beds",
          preparation: "Plant on raised beds",
          application: "15-20cm high beds improve drainage"
        },
        {
          method: "Well-drained soil",
          preparation: "Avoid waterlogged areas",
          application: "Essential for prevention"
        }
      ],
      culturalControls: [
        "Plant on raised beds (15-20cm high)",
        "Ensure good drainage",
        "Use disease-free planting material",
        "Avoid overhead irrigation",
        "Remove and destroy infected plants"
      ],
      businessNote: "Heart rot kills plants within weeks! Raised beds are FREE prevention."
    },
    {
      name: "Pineapple nematodes",
      type: "pest",
      chemicalControls: [
        {
          productName: "Velum 400SC",
          activeIngredient: "Fluopyram",
          rate: "20ml per 20L water",
          applicationMethod: "Soil drench at planting",
          timing: "At planting",
          safetyInterval: "30 days",
          packageSizes: ["100ml (Ksh 1,200)", "500ml (Ksh 5,500)"],
          costPerPackage: 1200,
          status: "active"
        }
      ],
      organicControls: [
        {
          method: "Marigold rotation",
          preparation: "Plant marigolds before pineapples",
          application: "Grow for one season, incorporate into soil"
        },
        {
          method: "Neem cake",
          preparation: "Apply neem cake to soil",
          application: "200kg per acre before planting"
        },
        {
          method: "Compost",
          preparation: "Apply well-decomposed compost",
          application: "10 tons per acre"
        }
      ],
      culturalControls: [
        "Practice crop rotation with marigolds",
        "Use nematode-free planting material",
        "Solarize soil before planting",
        "Add organic matter to soil"
      ],
      businessNote: "Nematodes reduce root growth and yield by 40%. Marigold rotation costs nothing but time!"
    },
    {
      name: "Pineapple fruit borer",
      type: "pest",
      chemicalControls: [
        {
          productName: "Duduthrin 1.75EC",
          activeIngredient: "Lambda-cyhalothrin",
          rate: "10ml per 20L water",
          applicationMethod: "Foliar spray",
          timing: "During flowering and fruit development",
          safetyInterval: "14 days",
          packageSizes: ["100ml (Ksh 450)", "250ml (Ksh 1,000)"],
          costPerPackage: 450,
          status: "active"
        }
      ],
      organicControls: [
        {
          method: "Pheromone traps",
          preparation: "Purchase fruit borer lures",
          application: "Place 4-6 traps per acre"
        },
        {
          method: "Neem oil",
          preparation: "50ml neem oil per 20L water",
          application: "Spray every 14 days"
        }
      ],
      culturalControls: [
        "Remove and destroy infested fruits",
        "Keep field clean of crop residues",
        "Practice crop rotation",
        "Harvest fruits promptly"
      ],
      businessNote: "Fruit borers make pineapples unmarketable. One borer can destroy multiple fruits."
    }
  ],

  watermelons: [
    {
      name: "Watermelon aphids",
      type: "pest",
      chemicalControls: [
        {
          productName: "Dimethoate 40EC",
          activeIngredient: "Dimethoate",
          rate: "10ml per 20L water",
          applicationMethod: "Foliar spray",
          timing: "When colonies appear",
          safetyInterval: "14 days",
          packageSizes: ["100ml (Ksh 300)", "250ml (Ksh 700)"],
          costPerPackage: 300,
          status: "restricted",
          notes: "⚠️ BANNED in Tanzania (Jan 2026). Check local regulations before recommending."
        },
        {
          productName: "Decis 2.5EC",
          activeIngredient: "Deltamethrin",
          rate: "10ml per 20L water",
          applicationMethod: "Foliar spray",
          timing: "When aphids appear",
          safetyInterval: "7 days",
          packageSizes: ["100ml (Ksh 400)", "250ml (Ksh 900)"],
          costPerPackage: 400,
          status: "active"
        }
      ],
      organicControls: [
        {
          method: "Neem spray",
          preparation: "Mix 50ml neem oil with 20L water",
          application: "Spray on affected plants"
        },
        {
          method: "Soap solution",
          preparation: "Mix 2 tablespoons liquid soap in 5L water",
          application: "Spray directly on aphids"
        },
        {
          method: "Introduce ladybirds",
          preparation: "Collect ladybirds from wild",
          application: "Release on infested plants"
        }
      ],
      culturalControls: [
        "Use reflective mulch",
        "Conserve natural enemies",
        "Remove heavily infested leaves",
        "Avoid excess nitrogen"
      ],
      businessNote: "Aphids transmit watermelon mosaic virus - yield loss up to 50%! Control early."
    },
    {
      name: "Watermelon powdery mildew",
      type: "disease",
      chemicalControls: [
        {
          productName: "Sulfur 80WDG",
          activeIngredient: "Sulfur",
          rate: "30g per 20L water",
          applicationMethod: "Foliar spray",
          timing: "At first sign of disease",
          safetyInterval: "7 days",
          packageSizes: ["100g (Ksh 300)", "500g (Ksh 1,300)"],
          costPerPackage: 300,
          status: "active",
          notes: "Organic-approved"
        },
        {
          productName: "Bayleton 25WP",
          activeIngredient: "Triadimefon",
          rate: "15g per 20L water",
          applicationMethod: "Foliar spray",
          timing: "At first sign",
          safetyInterval: "14 days",
          packageSizes: ["100g (Ksh 450)", "500g (Ksh 2,000)"],
          costPerPackage: 450,
          status: "active"
        }
      ],
      organicControls: [
        {
          method: "Sulfur spray",
          preparation: "Wettable sulfur 30g per 20L",
          application: "Spray every 10-14 days"
        },
        {
          method: "Milk spray",
          preparation: "Mix 1 part milk with 9 parts water",
          application: "Spray weekly"
        },
        {
          method: "Baking soda solution",
          preparation: "1 tbsp baking soda + 1 tsp oil in 4L water",
          application: "Spray weekly"
        }
      ],
      culturalControls: [
        "Ensure good air circulation",
        "Avoid overhead irrigation",
        "Remove infected leaves",
        "Use resistant varieties where available"
      ],
      businessNote: "Powdery mildew reduces fruit quality and sweetness. Sulfur spray is cheap and effective!"
    },
    {
      name: "Watermelon fusarium wilt",
      type: "disease",
      chemicalControls: [],
      organicControls: [
        {
          method: "Grafting",
          preparation: "Graft onto resistant rootstock",
          application: "Use bottle gourd or pumpkin rootstock"
        },
        {
          method: "Bio-fumigation",
          preparation: "Incorporate mustard or marigold residues",
          application: "2 weeks before planting"
        }
      ],
      culturalControls: [
        "Practice crop rotation (4-5 years)",
        "Use resistant varieties",
        "Solarize soil before planting",
        "Plant in well-drained soil",
        "Remove and destroy infected plants"
      ],
      businessNote: "Fusarium wilt lives in soil for 10+ years! Rotation is essential."
    },
    {
      name: "Watermelon fruit flies",
      type: "pest",
      chemicalControls: [
        {
          productName: "Success 120SC",
          activeIngredient: "Spinetoram",
          rate: "5ml per 20L water",
          applicationMethod: "Foliar spray",
          timing: "During fruit development",
          safetyInterval: "7 days",
          packageSizes: ["100ml (Ksh 950)", "250ml (Ksh 2,200)"],
          costPerPackage: 950,
          status: "active"
        }
      ],
      organicControls: [
        {
          method: "Protein bait sprays",
          preparation: "Mix 100ml hydrolyzed protein + 20ml insecticide in 2L water",
          application: "Spot spray on plants"
        },
        {
          method: "Pheromone traps",
          preparation: "Cue-lure traps",
          application: "Place 4-6 traps per acre"
        },
        {
          method: "Fruit bagging",
          preparation: "Use paper bags",
          application: "Bag fruits when small"
        }
      ],
      culturalControls: [
        "Remove and destroy infested fruits",
        "Harvest fruits promptly",
        "Deep plough after harvest",
        "Keep field clean"
      ],
      businessNote: "Fruit flies make watermelons unmarketable. Traps cost Ksh 500 per acre."
    }
  ],

  carrots: [
    {
      name: "Carrot rust fly",
      type: "pest",
      chemicalControls: [
        {
          productName: "Decis 2.5EC",
          activeIngredient: "Deltamethrin",
          rate: "10ml per 20L water",
          applicationMethod: "Foliar spray",
          timing: "When flies active",
          safetyInterval: "14 days",
          packageSizes: ["100ml (Ksh 400)", "250ml (Ksh 900)"],
          costPerPackage: 400,
          status: "active"
        }
      ],
      organicControls: [
        {
          method: "Floating row covers",
          preparation: "Cover beds with insect netting",
          application: "Install at planting, remove at harvest"
        },
        {
          method: "Companion planting",
          preparation: "Plant onions or garlic between rows",
          application: "Repels rust flies"
        },
        {
          method: "Neem oil",
          preparation: "50ml neem oil per 20L water",
          application: "Spray every 10-14 days"
        }
      ],
      culturalControls: [
        "Delay planting until after peak fly activity",
        "Practice crop rotation",
        "Remove crop residues promptly",
        "Deep plough after harvest"
      ],
      businessNote: "Rust fly larvae tunnel into roots - makes carrots unmarketable. Row covers cost Ksh 2,000 per acre but last 3 seasons."
    },
    {
      name: "Carrot leaf blight (Alternaria)",
      type: "disease",
      chemicalControls: [
        {
          productName: "Mancozeb 80WP",
          activeIngredient: "Mancozeb",
          rate: "50g per 20L water",
          applicationMethod: "Foliar spray",
          timing: "At first sign of leaf spots",
          safetyInterval: "14 days",
          packageSizes: ["100g (Ksh 400)", "500g (Ksh 1,800)"],
          costPerPackage: 400,
          status: "active"
        },
        {
          productName: "Daconil 720SC",
          activeIngredient: "Chlorothalonil",
          rate: "40ml per 20L water",
          applicationMethod: "Foliar spray",
          timing: "Preventatively",
          safetyInterval: "14 days",
          packageSizes: ["100ml (Ksh 450)", "250ml (Ksh 1,000)"],
          costPerPackage: 450,
          status: "active"
        }
      ],
      organicControls: [
        {
          method: "Copper spray",
          preparation: "Copper oxychloride 50g per 20L",
          application: "Spray every 10-14 days"
        },
        {
          method: "Compost tea",
          preparation: "Brew aerated compost tea",
          application: "Spray weekly"
        }
      ],
      culturalControls: [
        "Use disease-free seed",
        "Practice crop rotation",
        "Ensure good air circulation",
        "Avoid overhead irrigation",
        "Remove infected leaves"
      ],
      businessNote: "Leaf blight reduces root size by 30-50%. Early spraying protects yield."
    },
    {
      name: "Carrot nematodes",
      type: "pest",
      chemicalControls: [
        {
          productName: "Velum 400SC",
          activeIngredient: "Fluopyram",
          rate: "20ml per 20L water",
          applicationMethod: "Soil drench",
          timing: "At planting",
          safetyInterval: "30 days",
          packageSizes: ["100ml (Ksh 1,200)", "500ml (Ksh 5,500)"],
          costPerPackage: 1200,
          status: "active"
        }
      ],
      organicControls: [
        {
          method: "Marigold rotation",
          preparation: "Plant marigolds before carrots",
          application: "Grow for one season, incorporate into soil"
        },
        {
          method: "Neem cake",
          preparation: "Apply neem cake to soil",
          application: "200kg per acre before planting"
        },
        {
          method: "Solarization",
          preparation: "Cover soil with clear plastic",
          application: "4-6 weeks during hot season"
        }
      ],
      culturalControls: [
        "Practice crop rotation with marigolds",
        "Solarize soil before planting",
        "Add organic matter",
        "Use nematode-free seed"
      ],
      businessNote: "Nematodes cause forked, stunted roots - 60% market loss. Marigold rotation is FREE!"
    },
    {
      name: "Carrot cavity spot",
      type: "disease",
      chemicalControls: [
        {
          productName: "Ridomil Gold 68WG",
          activeIngredient: "Metalaxyl-M + Mancozeb",
          rate: "50g per 20L water",
          applicationMethod: "Soil drench",
          timing: "At seedling stage",
          safetyInterval: "30 days",
          packageSizes: ["100g (Ksh 600)", "500g (Ksh 2,800)"],
          costPerPackage: 600,
          status: "active"
        }
      ],
      organicControls: [
        {
          method: "Gypsum",
          preparation: "Apply gypsum to soil",
          application: "500kg per acre before planting"
        },
        {
          method: "Compost",
          preparation: "Apply well-decomposed compost",
          application: "10 tons per acre"
        }
      ],
      culturalControls: [
        "Maintain proper soil pH (6.5-7.0)",
        "Avoid waterlogged conditions",
        "Ensure good drainage",
        "Practice crop rotation",
        "Add calcium to soil"
      ],
      businessNote: "Cavity spot causes sunken lesions - roots unmarketable. Gypsum costs Ksh 5,000 per acre."
    }
  ],

  chillies: [
    {
      name: "Chilli thrips",
      type: "pest",
      chemicalControls: [
        {
          productName: "Success 120SC",
          activeIngredient: "Spinetoram",
          rate: "5ml per 20L water",
          applicationMethod: "Foliar spray",
          timing: "When thrips active",
          safetyInterval: "7 days",
          packageSizes: ["100ml (Ksh 950)", "250ml (Ksh 2,200)"],
          costPerPackage: 950,
          status: "active"
        },
        {
          productName: "Decis 2.5EC",
          activeIngredient: "Deltamethrin",
          rate: "10ml per 20L water",
          applicationMethod: "Foliar spray",
          timing: "At first sign",
          safetyInterval: "7 days",
          packageSizes: ["100ml (Ksh 400)", "250ml (Ksh 900)"],
          costPerPackage: 400,
          status: "active"
        }
      ],
      organicControls: [
        {
          method: "Neem spray",
          preparation: "Mix 50ml neem oil with 20L water",
          application: "Spray every 7-10 days"
        },
        {
          method: "Blue sticky traps",
          preparation: "Purchase blue sticky traps",
          application: "Place 10-15 per acre"
        },
        {
          method: "Predatory mites",
          preparation: "Purchase beneficial mites",
          application: "Release 10-20 per plant"
        }
      ],
      culturalControls: [
        "Use reflective mulch",
        "Conserve natural enemies",
        "Remove weed hosts",
        "Avoid planting near onions"
      ],
      businessNote: "Thrips cause leaf curling and fruit scarring - 40% yield loss. Blue traps cost Ksh 50 each."
    },
    {
      name: "Chilli anthracnose",
      type: "disease",
      chemicalControls: [
        {
          productName: "Mancozeb 80WP",
          activeIngredient: "Mancozeb",
          rate: "50g per 20L water",
          applicationMethod: "Foliar spray",
          timing: "During flowering and fruiting",
          safetyInterval: "14 days",
          packageSizes: ["100g (Ksh 400)", "500g (Ksh 1,800)"],
          costPerPackage: 400,
          status: "active"
        },
        {
          productName: "Copper oxychloride",
          activeIngredient: "Copper oxychloride",
          rate: "50g per 20L water",
          applicationMethod: "Foliar spray",
          timing: "Preventatively",
          safetyInterval: "14 days",
          packageSizes: ["100g (Ksh 350)", "500g (Ksh 1,600)"],
          costPerPackage: 350,
          status: "active"
        }
      ],
      organicControls: [
        {
          method: "Copper spray",
          preparation: "Copper oxychloride 50g per 20L",
          application: "Spray during flowering"
        },
        {
          method: "Neem oil",
          preparation: "50ml neem oil per 20L water",
          application: "Spray every 10-14 days"
        },
        {
          method: "Baking soda solution",
          preparation: "1 tbsp baking soda + 1 tsp oil in 4L water",
          application: "Spray weekly"
        }
      ],
      culturalControls: [
        "Use disease-free seed",
        "Practice crop rotation",
        "Ensure good air circulation",
        "Remove infected fruits",
        "Mulch to prevent soil splash"
      ],
      businessNote: "Anthracnose causes sunken spots on fruits - Grade A chillies sell for 50% more!"
    },
    {
      name: "Chilli leaf curl virus",
      type: "disease",
      chemicalControls: [],
      organicControls: [],
      culturalControls: [
        "Use resistant varieties",
        "Control whiteflies (vectors) with recommended insecticides",
        "Rogue out infected plants immediately",
        "Use reflective mulch to repel whiteflies",
        "Plant barrier crops (maize, sunflower)"
      ],
      businessNote: "Leaf curl has NO CURE! Whitefly control is essential - reflective mulch costs Ksh 3,000 per acre."
    },
    {
      name: "Chilli fruit borers",
      type: "pest",
      chemicalControls: [
        {
          productName: "Coragen 20SC",
          activeIngredient: "Chlorantraniliprole",
          rate: "4ml per 20L water",
          applicationMethod: "Foliar spray",
          timing: "During fruiting",
          safetyInterval: "14 days",
          packageSizes: ["100ml (Ksh 1,200)", "250ml (Ksh 2,800)"],
          costPerPackage: 1200,
          status: "active"
        }
      ],
      organicControls: [
        {
          method: "Pheromone traps",
          preparation: "Purchase fruit borer lures",
          application: "Place 4-6 traps per acre"
        },
        {
          method: "Bacillus thuringiensis",
          preparation: "Follow label instructions",
          application: "Spray when larvae young"
        },
        {
          method: "Neem oil",
          preparation: "50ml neem oil per 20L water",
          application: "Spray every 10 days"
        }
      ],
      culturalControls: [
        "Monitor with pheromone traps",
        "Remove and destroy infested fruits",
        "Harvest promptly",
        "Deep plough after harvest"
      ],
      businessNote: "One borer can destroy 5-10 fruits. Traps cost Ksh 500 per acre."
    }
  ],

  spinach: [
    {
      name: "Spinach leaf miners",
      type: "pest",
      chemicalControls: [
        {
          productName: "Decis 2.5EC",
          activeIngredient: "Deltamethrin",
          rate: "10ml per 20L water",
          applicationMethod: "Foliar spray",
          timing: "When mines appear",
          safetyInterval: "7 days",
          packageSizes: ["100ml (Ksh 400)", "250ml (Ksh 900)"],
          costPerPackage: 400,
          status: "active"
        }
      ],
      organicControls: [
        {
          method: "Floating row covers",
          preparation: "Cover beds with insect netting",
          application: "Install at planting"
        },
        {
          method: "Neem oil",
          preparation: "50ml neem oil per 20L water",
          application: "Spray every 7-10 days"
        },
        {
          method: "Hand removal",
          preparation: "Remove and destroy mined leaves",
          application: "Weekly"
        }
      ],
      culturalControls: [
        "Remove and destroy mined leaves",
        "Practice crop rotation",
        "Use floating row covers",
        "Destroy crop residues after harvest"
      ],
      businessNote: "Leaf miners make spinach unmarketable. Row covers cost Ksh 2,000 per acre but last 3 seasons."
    },
    {
      name: "Spinach downy mildew",
      type: "disease",
      chemicalControls: [
        {
          productName: "Ridomil Gold 68WG",
          activeIngredient: "Metalaxyl-M + Mancozeb",
          rate: "50g per 20L water",
          applicationMethod: "Foliar spray",
          timing: "At first sign of disease",
          safetyInterval: "14 days",
          packageSizes: ["100g (Ksh 600)", "500g (Ksh 2,800)"],
          costPerPackage: 600,
          status: "active"
        }
      ],
      organicControls: [
        {
          method: "Copper spray",
          preparation: "Copper oxychloride 50g per 20L",
          application: "Spray every 7-10 days"
        },
        {
          method: "Milk spray",
          preparation: "Mix 1 part milk with 9 parts water",
          application: "Spray weekly"
        },
        {
          method: "Compost tea",
          preparation: "Brew aerated compost tea",
          application: "Spray weekly"
        }
      ],
      culturalControls: [
        "Ensure good air circulation",
        "Avoid overhead irrigation",
        "Space plants properly",
        "Remove infected leaves",
        "Use resistant varieties"
      ],
      businessNote: "Downy mildew spreads rapidly in cool, wet conditions. Preventative spraying is essential."
    },
    {
      name: "Spinach aphids",
      type: "pest",
      chemicalControls: [
        {
          productName: "Decis 2.5EC",
          activeIngredient: "Deltamethrin",
          rate: "10ml per 20L water",
          applicationMethod: "Foliar spray",
          timing: "When colonies appear",
          safetyInterval: "7 days",
          packageSizes: ["100ml (Ksh 400)", "250ml (Ksh 900)"],
          costPerPackage: 400,
          status: "active"
        }
      ],
      organicControls: [
        {
          method: "Neem spray",
          preparation: "Mix 50ml neem oil with 20L water",
          application: "Spray on affected plants"
        },
        {
          method: "Soap solution",
          preparation: "Mix 2 tablespoons liquid soap in 5L water",
          application: "Spray directly on aphids"
        },
        {
          method: "Introduce ladybirds",
          preparation: "Collect ladybirds from wild",
          application: "Release on infested plants"
        }
      ],
      culturalControls: [
        "Use reflective mulch",
        "Conserve natural enemies",
        "Remove heavily infested leaves",
        "Avoid excess nitrogen"
      ],
      businessNote: "Ladybirds eat aphids for FREE! One ladybird can eat 50 aphids per day."
    },
    {
      name: "Spinach white rust",
      type: "disease",
      chemicalControls: [
        {
          productName: "Mancozeb 80WP",
          activeIngredient: "Mancozeb",
          rate: "50g per 20L water",
          applicationMethod: "Foliar spray",
          timing: "At first sign of pustules",
          safetyInterval: "14 days",
          packageSizes: ["100g (Ksh 400)", "500g (Ksh 1,800)"],
          costPerPackage: 400,
          status: "active"
        }
      ],
      organicControls: [
        {
          method: "Copper spray",
          preparation: "Copper oxychloride 50g per 20L",
          application: "Spray every 10-14 days"
        },
        {
          method: "Remove infected leaves",
          preparation: "Hand remove spotted leaves",
          application: "Weekly"
        }
      ],
      culturalControls: [
        "Ensure good air circulation",
        "Avoid overhead irrigation",
        "Remove infected leaves",
        "Practice crop rotation",
        "Space plants properly"
      ],
      businessNote: "White rust causes white pustules on leaves - reduces market value by 40%."
    }
  ],

  pigeonpeas: [
    {
      name: "Pigeon pea pod borer",
      type: "pest",
      chemicalControls: [
        {
          productName: "Duduthrin 1.75EC",
          activeIngredient: "Lambda-cyhalothrin",
          rate: "10ml per 20L water",
          applicationMethod: "Foliar spray",
          timing: "During flowering and pod formation",
          safetyInterval: "14 days",
          packageSizes: ["100ml (Ksh 450)", "250ml (Ksh 1,000)"],
          costPerPackage: 450,
          status: "active"
        }
      ],
      organicControls: [
        {
          method: "Pheromone traps",
          preparation: "Purchase pod borer lures",
          application: "Place 4-6 traps per acre"
        },
        {
          method: "Neem oil",
          preparation: "50ml neem oil per 20L water",
          application: "Spray every 10-14 days"
        },
        {
          method: "Bacillus thuringiensis",
          preparation: "Follow label instructions",
          application: "Spray when larvae young"
        }
      ],
      culturalControls: [
        "Plant early to escape pest pressure",
        "Intercrop with sorghum or maize",
        "Remove and destroy infested pods",
        "Deep plough after harvest",
        "Conserve natural enemies"
      ],
      businessNote: "Pod borers can destroy 50% of crop. Intercropping with sorghum reduces infestation by 40%!"
    },
    {
      name: "Pigeon pea fusarium wilt",
      type: "disease",
      chemicalControls: [],
      organicControls: [
        {
          method: "Trichoderma application",
          preparation: "Apply Trichoderma to soil",
          application: "2kg per acre mixed with compost"
        },
        {
          method: "Neem cake",
          preparation: "Apply neem cake to soil",
          application: "200kg per acre before planting"
        }
      ],
      culturalControls: [
        "Use resistant varieties",
        "Practice crop rotation (3-4 years)",
        "Remove and destroy infected plants",
        "Plant in well-drained soil",
        "Solarize soil before planting"
      ],
      businessNote: "Fusarium wilt lives in soil for 10+ years! Rotation with cereals is essential."
    },
    {
      name: "Pigeon pea pod sucking bugs",
      type: "pest",
      chemicalControls: [
        {
          productName: "Decis 2.5EC",
          activeIngredient: "Deltamethrin",
          rate: "10ml per 20L water",
          applicationMethod: "Foliar spray",
          timing: "When bugs appear",
          safetyInterval: "14 days",
          packageSizes: ["100ml (Ksh 400)", "250ml (Ksh 900)"],
          costPerPackage: 400,
          status: "active"
        }
      ],
      organicControls: [
        {
          method: "Neem oil",
          preparation: "50ml neem oil per 20L water",
          application: "Spray every 10 days"
        },
        {
          method: "Handpicking",
          preparation: "Collect and destroy bugs",
          application: "Early morning when sluggish"
        },
        {
          method: "Bird perches",
          preparation: "Place perches in field",
          application: "Attract insectivorous birds"
        }
      ],
      culturalControls: [
        "Monitor regularly",
        "Handpick bugs in morning",
        "Conserve natural enemies",
        "Remove weed hosts",
        "Use bird perches"
      ],
      businessNote: "Pod bugs cause shriveled, discolored seeds - 30% yield loss. Bird perches are FREE!"
    },
    {
      name: "Pigeon pea sterility mosaic disease",
      type: "disease",
      chemicalControls: [],
      organicControls: [],
      culturalControls: [
        "Use resistant varieties",
        "Control mite vectors",
        "Rogue out infected plants immediately",
        "Avoid planting near infected fields",
        "Practice crop rotation"
      ],
      businessNote: "Sterility mosaic has NO CURE! Resistant varieties are essential in endemic areas."
    }
  ],

  bambaranuts: [
    {
      name: "Bambara groundnut rosette virus",
      type: "disease",
      chemicalControls: [],
      organicControls: [],
      culturalControls: [
        "Control aphid vectors",
        "Rogue out infected plants",
        "Plant early to avoid peak aphid populations",
        "Use certified seed",
        "Practice crop rotation"
      ],
      businessNote: "Rosette virus can cause 100% yield loss! Early planting reduces aphid pressure."
    },
    {
      name: "Bambara groundnut leaf spot",
      type: "disease",
      chemicalControls: [
        {
          productName: "Mancozeb 80WP",
          activeIngredient: "Mancozeb",
          rate: "50g per 20L water",
          applicationMethod: "Foliar spray",
          timing: "At first sign of spots",
          safetyInterval: "14 days",
          packageSizes: ["100g (Ksh 400)", "500g (Ksh 1,800)"],
          costPerPackage: 400,
          status: "active"
        }
      ],
      organicControls: [
        {
          method: "Copper spray",
          preparation: "Copper oxychloride 50g per 20L",
          application: "Spray every 10-14 days"
        },
        {
          method: "Remove infected leaves",
          preparation: "Hand remove spotted leaves",
          application: "Weekly"
        }
      ],
      culturalControls: [
        "Use disease-free seed",
        "Practice crop rotation",
        "Ensure good air circulation",
        "Remove infected leaves",
        "Avoid overhead irrigation"
      ],
      businessNote: "Leaf spot reduces pod filling and yield by 30%."
    },
    {
      name: "Bambara groundnut aphids",
      type: "pest",
      chemicalControls: [
        {
          productName: "Decis 2.5EC",
          activeIngredient: "Deltamethrin",
          rate: "10ml per 20L water",
          applicationMethod: "Foliar spray",
          timing: "When colonies appear",
          safetyInterval: "14 days",
          packageSizes: ["100ml (Ksh 400)", "250ml (Ksh 900)"],
          costPerPackage: 400,
          status: "active"
        }
      ],
      organicControls: [
        {
          method: "Neem spray",
          preparation: "Mix 50ml neem oil with 20L water",
          application: "Spray on affected plants"
        },
        {
          method: "Soap solution",
          preparation: "Mix 2 tablespoons liquid soap in 5L water",
          application: "Spray directly on aphids"
        },
        {
          method: "Introduce ladybirds",
          preparation: "Collect ladybirds from wild",
          application: "Release on infested plants"
        }
      ],
      culturalControls: [
        "Conserve natural enemies",
        "Remove heavily infested plants",
        "Use reflective mulch",
        "Plant early"
      ],
      businessNote: "Aphids transmit viruses - control them early!"
    }
  ],

  yams: [
    {
      name: "Yam nematodes (Scutellonema)",
      type: "pest",
      chemicalControls: [
        {
          productName: "Velum 400SC",
          activeIngredient: "Fluopyram",
          rate: "20ml per 20L water",
          applicationMethod: "Soil drench at planting",
          timing: "At planting",
          safetyInterval: "30 days",
          packageSizes: ["100ml (Ksh 1,200)", "500ml (Ksh 5,500)"],
          costPerPackage: 1200,
          status: "active"
        }
      ],
      organicControls: [
        {
          method: "Marigold rotation",
          preparation: "Plant marigolds before yams",
          application: "Grow for one season, incorporate into soil"
        },
        {
          method: "Neem cake",
          preparation: "Apply neem cake to soil",
          application: "200kg per acre before planting"
        },
        {
          method: "Solarization",
          preparation: "Cover soil with clear plastic",
          application: "4-6 weeks during hot season"
        }
      ],
      culturalControls: [
        "Use clean planting material (setts)",
        "Practice crop rotation with marigolds",
        "Solarize soil before planting",
        "Plant nematode-resistant varieties"
      ],
      businessNote: "Nematodes cause cracked, discolored tubers - 50% market loss. Hot water treatment of setts (52°C for 10 min) is 90% effective!"
    },
    {
      name: "Yam anthracnose",
      type: "disease",
      chemicalControls: [
        {
          productName: "Mancozeb 80WP",
          activeIngredient: "Mancozeb",
          rate: "50g per 20L water",
          applicationMethod: "Foliar spray",
          timing: "During growing season, every 14-21 days",
          safetyInterval: "14 days",
          packageSizes: ["100g (Ksh 400)", "500g (Ksh 1,800)"],
          costPerPackage: 400,
          status: "active"
        }
      ],
      organicControls: [
        {
          method: "Copper spray",
          preparation: "Copper oxychloride 50g per 20L",
          application: "Spray every 14 days"
        },
        {
          method: "Neem oil",
          preparation: "50ml neem oil per 20L water",
          application: "Spray every 10-14 days"
        }
      ],
      culturalControls: [
        "Use disease-free setts",
        "Practice crop rotation",
        "Ensure good air circulation",
        "Remove and destroy infected vines",
        "Mulch to prevent soil splash"
      ],
      businessNote: "Anthracnose causes defoliation and yield loss of 50-70%. Use disease-free setts."
    },
    {
      name: "Yam mosaic virus",
      type: "disease",
      chemicalControls: [],
      organicControls: [],
      culturalControls: [
        "Use virus-free planting material",
        "Control aphid vectors",
        "Rogue out infected plants",
        "Practice crop rotation",
        "Avoid planting near infected fields"
      ],
      businessNote: "YMV has NO CURE! Certified virus-free setts are essential."
    },
    {
      name: "Yam beetles",
      type: "pest",
      chemicalControls: [
        {
          productName: "Duduthrin 1.75EC",
          activeIngredient: "Lambda-cyhalothrin",
          rate: "10ml per 20L water",
          applicationMethod: "Foliar spray",
          timing: "When beetles active",
          safetyInterval: "14 days",
          packageSizes: ["100ml (Ksh 450)", "250ml (Ksh 1,000)"],
          costPerPackage: 450,
          status: "active"
        }
      ],
      organicControls: [
        {
          method: "Handpicking",
          preparation: "Collect beetles in evening",
          application: "Drop in soapy water"
        },
        {
          method: "Neem oil",
          preparation: "50ml neem oil per 20L water",
          application: "Spray every 10 days"
        },
        {
          method: "Light traps",
          preparation: "Use light traps at night",
          application: "Place 1-2 per acre"
        }
      ],
      culturalControls: [
        "Handpick beetles",
        "Use light traps",
        "Practice crop rotation",
        "Deep plough after harvest",
        "Destroy crop residues"
      ],
      businessNote: "Beetles bore into tubers - makes yams unmarketable. Light traps cost Ksh 500 each."
    }
  ],

  taro: [
    {
      name: "Taro leaf blight (Phytophthora)",
      type: "disease",
      chemicalControls: [
        {
          productName: "Ridomil Gold 68WG",
          activeIngredient: "Metalaxyl-M + Mancozeb",
          rate: "50g per 20L water",
          applicationMethod: "Foliar spray",
          timing: "At first sign of disease, repeat every 10-14 days",
          safetyInterval: "14 days",
          packageSizes: ["100g (Ksh 600)", "500g (Ksh 2,800)"],
          costPerPackage: 600,
          status: "active"
        }
      ],
      organicControls: [
        {
          method: "Copper spray",
          preparation: "Copper oxychloride 50g per 20L",
          application: "Spray every 10-14 days"
        },
        {
          method: "Remove infected leaves",
          preparation: "Cut and destroy infected leaves",
          application: "Weekly during wet season"
        }
      ],
      culturalControls: [
        "Use resistant varieties",
        "Ensure good drainage",
        "Space plants properly",
        "Remove and destroy infected leaves",
        "Avoid overhead irrigation"
      ],
      businessNote: "Taro leaf blight destroyed Samoa's taro industry! Resistant varieties saved it."
    },
    {
      name: "Taro beetle (Papuana)",
      type: "pest",
      chemicalControls: [
        {
          productName: "Duduthrin 1.75EC",
          activeIngredient: "Lambda-cyhalothrin",
          rate: "10ml per 20L water",
          applicationMethod: "Soil drench around plants",
          timing: "At planting and when damage seen",
          safetyInterval: "30 days",
          packageSizes: ["100ml (Ksh 450)", "250ml (Ksh 1,000)"],
          costPerPackage: 450,
          status: "active"
        }
      ],
      organicControls: [
        {
          method: "Traps",
          preparation: "Use split corms as traps",
          application: "Place in field, collect beetles weekly"
        },
        {
          method: "Neem cake",
          preparation: "Apply neem cake to soil",
          application: "200kg per acre before planting"
        }
      ],
      culturalControls: [
        "Use clean planting material",
        "Trap beetles using split corms",
        "Practice crop rotation",
        "Deep plough to expose beetles",
        "Keep field weed-free"
      ],
      businessNote: "Taro beetles bore into corms - 60% yield loss. Traps with split corms cost nothing!"
    },
    {
      name: "Taro soft rot",
      type: "disease",
      chemicalControls: [
        {
          productName: "Copper oxychloride",
          activeIngredient: "Copper oxychloride",
          rate: "50g per 20L water",
          applicationMethod: "Soil drench",
          timing: "At planting",
          safetyInterval: "14 days",
          packageSizes: ["100g (Ksh 350)", "500g (Ksh 1,600)"],
          costPerPackage: 350,
          status: "active"
        }
      ],
      organicControls: [
        {
          method: "Good drainage",
          preparation: "Plant on raised beds",
          application: "15-20cm high beds"
        },
        {
          method: "Lime application",
          preparation: "Apply agricultural lime",
          application: "500kg per acre before planting"
        }
      ],
      culturalControls: [
        "Plant in well-drained soil",
        "Use raised beds",
        "Avoid waterlogging",
        "Use disease-free planting material",
        "Practice crop rotation"
      ],
      businessNote: "Soft rot turns corms to mush in waterlogged soil. Raised beds are FREE prevention!"
    }
  ],

  okra: [
    {
      name: "Okra fruit borers (Earias)",
      type: "pest",
      chemicalControls: [
        {
          productName: "Coragen 20SC",
          activeIngredient: "Chlorantraniliprole",
          rate: "4ml per 20L water",
          applicationMethod: "Foliar spray",
          timing: "During fruiting",
          safetyInterval: "14 days",
          packageSizes: ["100ml (Ksh 1,200)", "250ml (Ksh 2,800)"],
          costPerPackage: 1200,
          status: "active"
        },
        {
          productName: "Duduthrin 1.75EC",
          activeIngredient: "Lambda-cyhalothrin",
          rate: "10ml per 20L water",
          applicationMethod: "Foliar spray",
          timing: "When borers active",
          safetyInterval: "14 days",
          packageSizes: ["100ml (Ksh 450)", "250ml (Ksh 1,000)"],
          costPerPackage: 450,
          status: "active"
        }
      ],
      organicControls: [
        {
          method: "Pheromone traps",
          preparation: "Purchase Earias lures",
          application: "Place 4-6 traps per acre"
        },
        {
          method: "Neem oil",
          preparation: "50ml neem oil per 20L water",
          application: "Spray every 7-10 days"
        },
        {
          method: "Bacillus thuringiensis",
          preparation: "Follow label instructions",
          application: "Spray when larvae young"
        }
      ],
      culturalControls: [
        "Monitor with pheromone traps",
        "Remove and destroy infested fruits",
        "Harvest every 2-3 days",
        "Practice crop rotation",
        "Deep plough after harvest"
      ],
      businessNote: "Fruit borers make okra unmarketable. Harvest every 2-3 days reduces infestation by 60%!"
    },
    {
      name: "Okra yellow vein mosaic virus",
      type: "disease",
      chemicalControls: [],
      organicControls: [],
      culturalControls: [
        "Use resistant varieties",
        "Control whiteflies (vectors)",
        "Rogue out infected plants",
        "Use reflective mulch",
        "Plant barrier crops"
      ],
      businessNote: "YVMV has NO CURE! Whitefly control is essential - reflective mulch costs Ksh 3,000 per acre."
    },
    {
      name: "Okra powdery mildew",
      type: "disease",
      chemicalControls: [
        {
          productName: "Sulfur 80WDG",
          activeIngredient: "Sulfur",
          rate: "30g per 20L water",
          applicationMethod: "Foliar spray",
          timing: "At first sign of disease",
          safetyInterval: "7 days",
          packageSizes: ["100g (Ksh 300)", "500g (sh 1,300)"],
          costPerPackage: 300,
          status: "active",
          notes: "Organic-approved"
        }
      ],
      organicControls: [
        {
          method: "Sulfur spray",
          preparation: "Wettable sulfur 30g per 20L",
          application: "Spray every 10-14 days"
        },
        {
          method: "Milk spray",
          preparation: "Mix 1 part milk with 9 parts water",
          application: "Spray weekly"
        },
        {
          method: "Baking soda solution",
          preparation: "1 tbsp baking soda + 1 tsp oil in 4L water",
          application: "Spray weekly"
        }
      ],
      culturalControls: [
        "Ensure good air circulation",
        "Avoid overhead irrigation",
        "Remove infected leaves",
        "Space plants properly"
      ],
      businessNote: "Powdery mildew reduces yield and fruit quality. Sulfur spray is cheap and effective!"
    },
    {
      name: "Okra root knot nematodes",
      type: "pest",
      chemicalControls: [
        {
          productName: "Velum 400SC",
          activeIngredient: "Fluopyram",
          rate: "20ml per 20L water",
          applicationMethod: "Soil drench",
          timing: "At planting",
          safetyInterval: "30 days",
          packageSizes: ["100ml (Ksh 1,200)", "500ml (Ksh 5,500)"],
          costPerPackage: 1200,
          status: "active"
        }
      ],
      organicControls: [
        {
          method: "Marigold rotation",
          preparation: "Plant marigolds before okra",
          application: "Grow for one season, incorporate into soil"
        },
        {
          method: "Neem cake",
          preparation: "Apply neem cake to soil",
          application: "200kg per acre before planting"
        },
        {
          method: "Solarization",
          preparation: "Cover soil with clear plastic",
          application: "4-6 weeks during hot season"
        }
      ],
      culturalControls: [
        "Practice crop rotation with marigolds",
        "Solarize soil",
        "Add organic matter",
        "Use nematode-free seedlings"
      ],
      businessNote: "Root knot nematodes cause stunted plants - 40% yield loss. Marigold rotation is FREE!"
    }
  ],

  tea: [
    {
      name: "Tea mosquito bug",
      type: "pest",
      chemicalControls: [
        {
          productName: "Duduthrin 1.75EC",
          activeIngredient: "Lambda-cyhalothrin",
          rate: "10ml per 20L water",
          applicationMethod: "Foliar spray",
          timing: "When bugs active",
          safetyInterval: "14 days",
          packageSizes: ["100ml (Ksh 450)", "250ml (Ksh 1,000)"],
          costPerPackage: 450,
          status: "active"
        }
      ],
      organicControls: [
        {
          method: "Neem oil",
          preparation: "50ml neem oil per 20L water",
          application: "Spray every 10-14 days"
        },
        {
          method: "Pruning",
          preparation: "Remove infested shoots",
          application: "During pruning"
        }
      ],
      culturalControls: [
        "Maintain proper shade",
        "Prune regularly",
        "Remove alternative hosts",
        "Conserve natural enemies",
        "Monitor regularly"
      ],
      businessNote: "Mosquito bug causes 'galls' on shoots - reduces tea quality and yield by 30%."
    },
    {
      name: "Tea blister blight",
      type: "disease",
      chemicalControls: [
        {
          productName: "Copper oxychloride",
          activeIngredient: "Copper oxychloride",
          rate: "50g per 20L water",
          applicationMethod: "Foliar spray",
          timing: "During wet weather, every 7-10 days",
          safetyInterval: "14 days",
          packageSizes: ["100g (Ksh 350)", "500g (Ksh 1,600)"],
          costPerPackage: 350,
          status: "active"
        }
      ],
      organicControls: [
        {
          method: "Copper spray",
          preparation: "Copper oxychloride 50g per 20L",
          application: "Spray during wet weather"
        },
        {
          method: "Plucking",
          preparation: "Frequent plucking",
          application: "Remove infected leaves during plucking"
        }
      ],
      culturalControls: [
        "Pluck frequently",
        "Maintain proper shade",
        "Ensure good air circulation",
        "Remove infected leaves",
        "Prune properly"
      ],
      businessNote: "Blister blight can reduce yield by 50% in wet weather. Frequent plucking helps control it."
    },
    {
      name: "Tea red spider mite",
      type: "pest",
      chemicalControls: [
        {
          productName: "Omite 57EC",
          activeIngredient: "Propargite",
          rate: "15ml per 20L water",
          applicationMethod: "Foliar spray",
          timing: "When mites active",
          safetyInterval: "14 days",
          packageSizes: ["100ml (Ksh 500)", "500ml (Ksh 2,200)"],
          costPerPackage: 500,
          status: "active"
        }
      ],
      organicControls: [
        {
          method: "Predatory mites",
          preparation: "Purchase beneficial mites",
          application: "Release 10-20 per bush"
        },
        {
          method: "Neem oil",
          preparation: "50ml neem oil per 20L water",
          application: "Spray every 10 days"
        },
        {
          method: "Water spray",
          preparation: "Strong water jet",
          application: "Wash mites off leaves"
        }
      ],
      culturalControls: [
        "Conserve predatory mites",
        "Maintain proper shade",
        "Avoid water stress",
        "Monitor regularly"
      ],
      businessNote: "Red spider mites cause bronze leaves - reduces photosynthesis and yield."
    }
  ],

  macadamia: [
    {
      name: "Macadamia nut borer",
      type: "pest",
      chemicalControls: [
        {
          productName: "Coragen 20SC",
          activeIngredient: "Chlorantraniliprole",
          rate: "4ml per 20L water",
          applicationMethod: "Foliar spray",
          timing: "During nut development",
          safetyInterval: "14 days",
          packageSizes: ["100ml (Ksh 1,200)", "250ml (Ksh 2,800)"],
          costPerPackage: 1200,
          status: "active"
        }
      ],
      organicControls: [
        {
          method: "Pheromone traps",
          preparation: "Purchase nut borer lures",
          application: "Place 4-6 traps per acre"
        },
        {
          method: "Trichogramma wasps",
          preparation: "Purchase egg parasitoids",
          application: "Release 50,000 per acre"
        },
        {
          method: "Neem oil",
          preparation: "50ml neem oil per 20L water",
          application: "Spray every 14 days"
        }
      ],
      culturalControls: [
        "Monitor with pheromone traps",
        "Remove and destroy infested nuts",
        "Harvest promptly",
        "Keep orchard floor clean",
        "Practice good sanitation"
      ],
      businessNote: "Nut borer can destroy 30% of crop. Traps cost Ksh 500 per acre - essential for export quality."
    },
    {
      name: "Macadamia husk spot",
      type: "disease",
      chemicalControls: [
        {
          productName: "Copper oxychloride",
          activeIngredient: "Copper oxychloride",
          rate: "50g per 20L water",
          applicationMethod: "Foliar spray",
          timing: "During wet weather",
          safetyInterval: "14 days",
          packageSizes: ["100g (Ksh 350)", "500g (Ksh 1,600)"],
          costPerPackage: 350,
          status: "active"
        }
      ],
      organicControls: [
        {
          method: "Copper spray",
          preparation: "Copper oxychloride 50g per 20L",
          application: "Spray during wet weather"
        },
        {
          method: "Pruning",
          preparation: "Prune for air circulation",
          application: "Annual pruning"
        }
      ],
      culturalControls: [
        "Prune to improve air circulation",
        "Remove infected husks",
        "Avoid overhead irrigation",
        "Maintain tree health"
      ],
      businessNote: "Husk spot stains nuts - reduces Grade A nuts by 40%."
    },
    {
      name: "Macadamia stink bugs",
      type: "pest",
      chemicalControls: [
        {
          productName: "Decis 2.5EC",
          activeIngredient: "Deltamethrin",
          rate: "10ml per 20L water",
          applicationMethod: "Foliar spray",
          timing: "When bugs active",
          safetyInterval: "14 days",
          packageSizes: ["100ml (Ksh 400)", "250ml (Ksh 900)"],
          costPerPackage: 400,
          status: "active"
        }
      ],
      organicControls: [
        {
          method: "Handpicking",
          preparation: "Collect bugs in morning",
          application: "Drop in soapy water"
        },
        {
          method: "Neem oil",
          preparation: "50ml neem oil per 20L water",
          application: "Spray every 10-14 days"
        },
        {
          method: "Egg parasitoids",
          preparation: "Purchase Trissolcus wasps",
          application: "Release 10,000 per acre"
        }
      ],
      culturalControls: [
        "Handpick bugs in morning",
        "Remove alternative hosts",
        "Conserve natural enemies",
        "Keep orchard clean"
      ],
      businessNote: "Stink bugs cause kernel spotting - nuts rejected for export. Handpicking is FREE!"
    }
  ],

  cocoa: [
    {
      name: "Cocoa mirids (Capsids)",
      type: "pest",
      chemicalControls: [
        {
          productName: "Duduthrin 1.75EC",
          activeIngredient: "Lambda-cyhalothrin",
          rate: "10ml per 20L water",
          applicationMethod: "Foliar spray",
          timing: "When mirids active",
          safetyInterval: "21 days",
          packageSizes: ["100ml (Ksh 450)", "250ml (Ksh 1,000)"],
          costPerPackage: 450,
          status: "active"
        }
      ],
      organicControls: [
        {
          method: "Neem oil",
          preparation: "50ml neem oil per 20L water",
          application: "Spray every 14 days"
        },
        {
          method: "Provide shade",
          preparation: "Maintain 40-50% shade",
          application: "Use shade trees (Gliricidia, Leucaena)"
        },
        {
          method: "Ant control",
          preparation: "Control ants that protect mirids",
          application: "Use sticky bands on trunks"
        }
      ],
      culturalControls: [
        "Maintain proper shade (40-50%)",
        "Prune regularly",
        "Remove chupons (water shoots)",
        "Regular harvesting",
        "Keep plantation clean"
      ],
      businessNote: "Mirids cause 'mirid blast' - pods blacken and die. Proper shade reduces infestation by 60%!"
    },
    {
      name: "Cocoa black pod disease",
      type: "disease",
      chemicalControls: [
        {
          productName: "Copper oxychloride",
          activeIngredient: "Copper oxychloride",
          rate: "50g per 20L water",
          applicationMethod: "Foliar spray",
          timing: "During wet weather, every 2-3 weeks",
          safetyInterval: "14 days",
          packageSizes: ["100g (Ksh 350)", "500g (Ksh 1,600)"],
          costPerPackage: 350,
          status: "active"
        },
        {
          productName: "Ridomil Gold 68WG",
          activeIngredient: "Metalaxyl-M + Mancozeb",
          rate: "50g per 20L water",
          applicationMethod: "Foliar spray",
          timing: "At first sign",
          safetyInterval: "21 days",
          packageSizes: ["100g (Ksh 600)", "500g (Ksh 2,800)"],
          costPerPackage: 600,
          status: "active"
        }
      ],
      organicControls: [
        {
          method: "Copper spray",
          preparation: "Copper oxychloride 50g per 20L",
          application: "Spray during wet weather"
        },
        {
          method: "Remove infected pods",
          preparation: "Collect and destroy black pods",
          application: "Weekly during wet season"
        },
        {
          method: "Proper drainage",
          preparation: "Ensure good drainage",
          application: "Essential for prevention"
        }
      ],
      culturalControls: [
        "Remove and destroy infected pods",
        "Prune for air circulation",
        "Ensure good drainage",
        "Maintain proper shade",
        "Regular harvesting"
      ],
      businessNote: "Black pod can destroy 80% of crop in wet season. Sanitation (removing infected pods) is FREE and 70% effective!"
    },
    {
      name: "Cocoa swollen shoot virus",
      type: "disease",
      chemicalControls: [],
      organicControls: [],
      culturalControls: [
        "Use resistant varieties",
        "Control mealybug vectors",
        "Rogue out infected trees immediately",
        "Use certified virus-free planting material",
        "Practice quarantine measures"
      ],
      businessNote: "CSSV has NO CURE! Certified virus-free seedlings are essential - they cost a little more but save your farm."
    },
    {
      name: "Cocoa pod borer",
      type: "pest",
      chemicalControls: [
        {
          productName: "Coragen 20SC",
          activeIngredient: "Chlorantraniliprole",
          rate: "4ml per 20L water",
          applicationMethod: "Foliar spray",
          timing: "During pod development",
          safetyInterval: "14 days",
          packageSizes: ["100ml (Ksh 1,200)", "250ml (Ksh 2,800)"],
          costPerPackage: 1200,
          status: "active"
        }
      ],
      organicControls: [
        {
          method: "Pheromone traps",
          preparation: "Purchase pod borer lures",
          application: "Place 4-6 traps per acre"
        },
        {
          method: "Bagging pods",
          preparation: "Use paper bags",
          application: "Bag young pods"
        },
        {
          method: "Trichogramma wasps",
          preparation: "Purchase egg parasitoids",
          application: "Release 50,000 per acre"
        }
      ],
      culturalControls: [
        "Monitor with pheromone traps",
        "Remove and destroy infested pods",
        "Harvest regularly",
        "Keep plantation clean",
        "Practice crop sanitation"
      ],
      businessNote: "Pod borer can destroy 50% of crop. Traps cost Ksh 500 per acre - essential for export quality."
    }
  ]
};