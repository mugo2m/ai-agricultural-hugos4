// lib/data/pestDiseaseMapping.ts
export interface PestDisease {
  name: string;
  type: "pest" | "disease";
  controlProducts: string[];
  controlMethod: string;
}

export const cropPestDiseaseMap: Record<string, PestDisease[]> = {
  maize: [
    { name: "Fall armyworm", type: "pest", controlProducts: ["Karate", "Emamectin"], controlMethod: "Spray early morning" },
    { name: "Stalk borer", type: "pest", controlProducts: ["Bulldock"], controlMethod: "Apply granules in funnel" },
    { name: "Aphids", type: "pest", controlProducts: ["Dimethoate"], controlMethod: "Spray when colonies appear" },
    { name: "Maize streak virus", type: "disease", controlProducts: [], controlMethod: "Use resistant varieties" },
    { name: "Leaf rust", type: "disease", controlProducts: ["Daconil"], controlMethod: "Spray at first sign" },
    { name: "Blight", type: "disease", controlProducts: ["Mancozeb"], controlMethod: "Preventative spraying" },
  ],
  beans: [
    { name: "Bean fly", type: "pest", controlProducts: ["Diazinon"], controlMethod: "Spray seedlings" },
    { name: "Aphids", type: "pest", controlProducts: ["Dimethoate"], controlMethod: "Spray when present" },
    { name: "Thrips", type: "pest", controlProducts: ["Decis"], controlMethod: "Spray during flowering" },
    { name: "Anthracnose", type: "disease", controlProducts: ["Mancozeb"], controlMethod: "Use clean seed" },
    { name: "Rust", type: "disease", controlProducts: ["Daconil"], controlMethod: "Spray at first sign" },
    { name: "Angular leaf spot", type: "disease", controlProducts: ["Copper"], controlMethod: "Crop rotation" },
  ],
  coffee: [
    { name: "Coffee berry borer", type: "pest", controlProducts: ["Duduthrin"], controlMethod: "Regular harvesting" },
    { name: "Leaf miner", type: "pest", controlProducts: ["Dimethoate"], controlMethod: "Monitor and spray" },
    { name: "Scales", type: "pest", controlProducts: ["Diazinon"], controlMethod: "Prune and spray" },
    { name: "Leaf rust", type: "disease", controlProducts: ["Copper oxychloride"], controlMethod: "Spray preventatively" },
    { name: "CBD", type: "disease", controlProducts: ["Daconil"], controlMethod: "Spray 3-4 times per season" },
  ],
  tomatoes: [
    { name: "Whiteflies", type: "pest", controlProducts: ["Decis", "Confidor"], controlMethod: "Yellow traps" },
    { name: "Tomato borer", type: "pest", controlProducts: ["Duduthrin"], controlMethod: "Monitor and spray" },
    { name: "Aphids", type: "pest", controlProducts: ["Dimethoate"], controlMethod: "Spray when present" },
    { name: "Late blight", type: "disease", controlProducts: ["Ridomil", "Mancozeb"], controlMethod: "Spray preventatively" },
    { name: "Early blight", type: "disease", controlProducts: ["Mancozeb"], controlMethod: "Spray at first sign" },
    { name: "Bacterial wilt", type: "disease", controlProducts: [], controlMethod: "Crop rotation" },
  ],
  potatoes: [
    { name: "Tuber moth", type: "pest", controlProducts: ["Dimethoate"], controlMethod: "Hill properly" },
    { name: "Aphids", type: "pest", controlProducts: ["Dimethoate"], controlMethod: "Spray when present" },
    { name: "Late blight", type: "disease", controlProducts: ["Ridomil", "Mancozeb"], controlMethod: "Spray weekly in wet weather" },
    { name: "Bacterial wilt", type: "disease", controlProducts: [], controlMethod: "Use clean seed" },
  ],
  bananas: [
    { name: "Banana weevil", type: "pest", controlProducts: ["Diazinon"], controlMethod: "Clean planting material" },
    { name: "Nematodes", type: "pest", controlProducts: [], controlMethod: "Use clean suckers" },
    { name: "Sigatoka", type: "disease", controlProducts: ["Mancozeb"], controlMethod: "Spray regularly" },
    { name: "Panama disease", type: "disease", controlProducts: [], controlMethod: "Use resistant varieties" },
  ]
};