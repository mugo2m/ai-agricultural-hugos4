// lib/data/pestDiseaseMapping.ts
// Comprehensive pest and disease database with control options

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
          costPerPackage: 350
        },
        {
          productName: "Emacot 5WG",
          activeIngredient: "Emamectin benzoate",
          rate: "4g per 20L water",
          applicationMethod: "Foliar spray, target whorl",
          timing: "When larvae are young (1st-3rd instar)",
          safetyInterval: "14 days before harvest",
          packageSizes: ["10g (Ksh 250)", "20g (Ksh 480)", "100g (Ksh 2,300)"],
          costPerPackage: 250
        },
        {
          productName: "Avaunt 150EC",
          activeIngredient: "Indoxacarb",
          rate: "10ml per 20L water",
          applicationMethod: "Foliar spray",
          timing: "When larvae are young",
          safetyInterval: "7 days before harvest",
          packageSizes: ["100ml (Ksh 750)", "250ml (Ksh 1,800)", "1L (Ksh 6,800)"],
          costPerPackage: 750
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
          costPerPackage: 600
        }
      ],
      organicControls: [
        {
          method: "Ash application",
          preparation: "Collect clean wood ash",
          application: "Apply ash into leaf funnel of young plants"
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
          costPerPackage: 150
        },
        {
          productName: "Sumicombi Powder",
          activeIngredient: "Fenitrothion + Cypermethrin",
          rate: "50g per 90kg bag",
          applicationMethod: "Mix dust with grain during storage",
          timing: "At storage time",
          packageSizes: ["100g (Ksh 120)", "500g (Ksh 550)", "1kg (Ksh 1,000)"],
          costPerPackage: 120
        },
        {
          productName: "Phostoxin tablets",
          activeIngredient: "Aluminium phosphide",
          rate: "2 tablets per 90kg bag",
          applicationMethod: "Place tablets in grain - fumigant (use carefully!)",
          timing: "At storage time",
          safetyInterval: "10 days before opening",
          packageSizes: ["100 tablets (Ksh 800)", "500 tablets (Ksh 3,500)"],
          costPerPackage: 800
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
          costPerPackage: 300
        },
        {
          productName: "Karate 5EC",
          activeIngredient: "Lambda-cyhalothrin",
          rate: "5ml per 20L water",
          applicationMethod: "Foliar spray",
          timing: "When colonies appear",
          safetyInterval: "14 days before harvest",
          packageSizes: ["100ml (Ksh 400)", "250ml (Ksh 900)"],
          costPerPackage: 400
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
        "Use resistant varieties (e.g., WH505, WH403)",
        "Control leaf hoppers (vectors) with insecticides",
        "Rogue out infected plants immediately",
        "Plant early to avoid peak vector populations",
        "Practice crop rotation"
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
          costPerPackage: 400
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
          costPerPackage: 350
        }
      ],
      culturalControls: [
        "Plant early in season",
        "Use certified seed",
        "Practice crop rotation",
        "Ensure good soil fertility for strong plants"
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
          costPerPackage: 300
        }
      ],
      organicControls: [
        {
          method: "Neem spray",
          preparation: "Mix 50ml neem oil with 20L water",
          application: "Spray on affected plants"
        }
      ],
      culturalControls: [
        "Conserve ladybirds",
        "Use yellow sticky traps",
        "Remove heavily infested plants"
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
          costPerPackage: 400
        }
      ],
      culturalControls: [
        "Avoid planting near onions or garlic",
        "Use reflective mulch",
        "Maintain good soil moisture"
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
          costPerPackage: 400
        },
        {
          productName: "Daconil 720SC",
          activeIngredient: "Chlorothalonil",
          rate: "40ml per 20L water",
          applicationMethod: "Foliar spray",
          timing: "At first sign of disease",
          safetyInterval: "14 days before harvest",
          packageSizes: ["100ml (Ksh 450)", "250ml (Ksh 1,000)"],
          costPerPackage: 450
        }
      ],
      culturalControls: [
        "Use disease-free seed",
        "Practice crop rotation (3-4 years)",
        "Remove and destroy infected plants",
        "Avoid working in field when plants are wet"
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
          costPerPackage: 450
        }
      ],
      culturalControls: [
        "Use resistant varieties",
        "Ensure good air circulation",
        "Avoid overhead irrigation",
        "Remove crop residues after harvest"
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
          applicationMethod: "Foliar spray",
          timing: "When populations are high",
          safetyInterval: "14 days before harvest",
          packageSizes: ["100ml (Ksh 450)", "250ml (Ksh 1,000)", "1L (Ksh 3,800)"],
          costPerPackage: 450
        },
        {
          productName: "Decis 2.5EC",
          activeIngredient: "Deltamethrin",
          rate: "10ml per 20L water",
          applicationMethod: "Foliar spray",
          timing: "When whiteflies appear",
          safetyInterval: "7 days before harvest",
          packageSizes: ["100ml (Ksh 400)", "250ml (Ksh 900)"],
          costPerPackage: 400
        }
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
        }
      ],
      culturalControls: [
        "Use reflective mulch",
        "Remove infested leaves",
        "Avoid planting near susceptible crops",
        "Use screen nets in nursery"
      ],
      businessNote: "Yellow traps cost Ksh 50 each and last all season! Cheaper than repeated spraying."
    },
    {
      name: "Tomato borer",
      type: "pest",
      chemicalControls: [
        {
          productName: "Duduthrin 1.75EC",
          activeIngredient: "Lambda-cyhalothrin",
          rate: "10ml per 20L water",
          applicationMethod: "Foliar spray",
          timing: "At first sign of damage",
          safetyInterval: "14 days before harvest",
          packageSizes: ["100ml (Ksh 450)", "250ml (Ksh 1,000)"],
          costPerPackage: 450
        }
      ],
      culturalControls: [
        "Monitor regularly",
        "Remove and destroy affected fruits",
        "Practice crop rotation",
        "Deep plough to expose pupae"
      ],
      businessNote: "One borer can destroy multiple fruits. Early detection saves 40% of yield!"
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
          costPerPackage: 600
        },
        {
          productName: "Milraz 76WP",
          activeIngredient: "Propamocarb + Mancozeb",
          rate: "40g per 20L water",
          applicationMethod: "Foliar spray",
          timing: "At first sign of disease",
          safetyInterval: "14 days before harvest",
          packageSizes: ["100g (Ksh 550)", "500g (Ksh 2,500)"],
          costPerPackage: 550
        },
        {
          productName: "Mancozeb 80WP",
          activeIngredient: "Mancozeb",
          rate: "50g per 20L water",
          applicationMethod: "Foliar spray (preventative)",
          timing: "Every 7-10 days",
          safetyInterval: "14 days before harvest",
          packageSizes: ["100g (Ksh 400)", "500g (Ksh 1,800)"],
          costPerPackage: 400
        }
      ],
      culturalControls: [
        "Ensure good air circulation (proper spacing)",
        "Avoid overhead irrigation",
        "Remove and destroy infected plants",
        "Use resistant varieties where available",
        "Stake plants to keep foliage dry"
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
          costPerPackage: 400
        },
        {
          productName: "Antracol 70WP",
          activeIngredient: "Propineb",
          rate: "50g per 20L water",
          applicationMethod: "Foliar spray",
          timing: "Preventatively",
          safetyInterval: "14 days before harvest",
          packageSizes: ["100g (Ksh 500)", "500g (Ksh 2,200)"],
          costPerPackage: 500
        }
      ],
      culturalControls: [
        "Use disease-free seed",
        "Practice crop rotation",
        "Remove infected leaves",
        "Mulch to prevent soil splash"
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
          costPerPackage: 300
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
          costPerPackage: 600
        },
        {
          productName: "Curzate R 65WP",
          activeIngredient: "Cymoxanil + Mancozeb",
          rate: "40g per 20L water",
          applicationMethod: "Foliar spray",
          timing: "At first sign of blight",
          safetyInterval: "14 days before harvest",
          packageSizes: ["100g (Ksh 550)", "500g (Ksh 2,500)"],
          costPerPackage: 550
        }
      ],
      culturalControls: [
        "Use certified seed potatoes",
        "Plant in well-drained soil",
        "Hill to cover tubers",
        "Remove volunteer potatoes",
        "Destroy crop residues after harvest"
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
          costPerPackage: 450
        },
        {
          productName: "Pyrethrum 5EC",
          activeIngredient: "Pyrethrins",
          rate: "20ml per 20L water",
          applicationMethod: "Foliar spray",
          timing: "When borers are active",
          safetyInterval: "7 days before harvest",
          packageSizes: ["100ml (Ksh 500)", "250ml (Ksh 1,200)"],
          costPerPackage: 500
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
          costPerPackage: 350
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
          costPerPackage: 350
        }
      ],
      culturalControls: [
        "Use clean planting material (pare suckers before planting)",
        "Trap using split pseudostems",
        "Keep plantation clean",
        "Practice crop rotation"
      ],
      businessNote: "Clean suckers are FREE! Weevil damage causes 30-50% yield loss."
    },
    {
      name: "Sigatoka",
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
          costPerPackage: 400
        }
      ],
      culturalControls: [
        "Remove infected leaves",
        "Maintain good drainage",
        "Proper spacing for air circulation",
        "Use disease-free planting material"
      ],
      businessNote: "Sigatoka reduces fruit quality and size. Remove infected leaves regularly - it's FREE!"
    }
  ]
};