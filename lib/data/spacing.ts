// lib/data/spacing.ts
// Based on Bungoma Farm Management Guidelines 2017

export const cropSpacing = {
  maize: {
    pure: "75cm x 25cm (1 seed/hole) or 75cm x 50cm (2 seeds/hole)",
    population: { low: 35000, medium: 45000, high: 53000 }
  },
  beans: {
    pure: "50cm x 10cm (2 seeds/hole)",
    mixed: "50cm x 15cm (2 seeds/hole, 1 line)",
    population: { low: 80000, medium: 100000, high: 120000 }
  },
  "maize-beans intercrop": {
    spacing: "Maize: 75cm x 25cm, Beans: 50cm x 15cm between maize rows",
    population: "Maize 44,000 plants/ha, Beans 66,000 plants/ha"
  },
  "finger millet": {
    pure: "30cm x 15cm (drilled and thinned)",
    seedRate: "4kg/ha",
    population: "1.3 tons/ha yield"
  },
  sorghum: {
    pure: "60cm x 15cm (drilled and thinned)",
    seedRate: "7kg/ha",
    population: "1.5 tons/ha yield"
  },
  "soya beans": {
    pure: "45cm x 10cm (3 plants/hole, thin to one)",
    seedRate: "40-60kg/ha",
    population: "1.8 tons/ha yield"
  },
  sunflower: {
    pure: "75cm x 30cm (2 seeds/hole, thin to one)",
    seedRate: "5kg/ha",
    population: "44,000 plants/ha"
  },
  cotton: {
    pure: "90cm x 30cm (5-6 seeds/hole, thin to 2)",
    seedRate: "20kg/ha",
    population: "1000kg/ha yield"
  },
  groundnuts: {
    pure: "45cm x 10cm (bunch type) or 60cm x 10cm (spreaders)",
    seedRate: "45-50kg/ha",
    population: "1.5 tons/ha yield"
  },
  sugarcane: {
    pure: "1.5m x 0.5m",
    population: "12,000 setts/ha"
  },
  coffee: {
    spacing: "2.75m x 2.75m (SL28, SL34) or 2m x 2m (Ruiru 11)",
    population: 1300
  },
  tobacco: {
    spacing: "110cm x 60cm (fire cured) or 120cm x 70cm (flu cured)",
    population: "15,050 plants/ha (fire cured) or 12,000 plants/ha (flu cured)"
  },
  cassava: {
    spacing: "1m x 1m",
    population: 10000
  },
  "sweet potatoes": {
    spacing: "90cm x 30cm (on ridges)",
    population: 16000
  },
  "irish potatoes": {
    spacing: "75cm x 30cm",
    population: 18000
  },
  tomatoes: {
    spacing: "60-70cm x 40cm (processing) or 90cm x 30cm (fresh market) or 60cm x 60cm (2 bearing stems)",
    population: 20000
  },
  kales: {
    spacing: "60cm x 60cm",
    population: 27777
  },
  cabbages: {
    spacing: "60cm x 45cm",
    population: 16000
  },
  onions: {
    spacing: "15cm x 7.5cm (transplanted)",
    population: 130000
  },
  carrots: {
    spacing: "25-30cm rows, thinned to 3-5cm within row",
    population: "4-10 tons/ha"
  },
  capsicums: {
    spacing: "60cm x 45cm",
    population: 16000
  },
  chillies: {
    spacing: "60cm x 45cm",
    population: 16000
  },
  brinjals: {
    spacing: "60cm x 45cm",
    population: 16000
  },
  "french beans": {
    spacing: "45cm x 10cm",
    population: 220000
  },
  "garden peas": {
    spacing: "50cm x 10cm",
    population: 200000
  },
  bananas: {
    spacing: "3m x 3m (short), 3m x 4m (medium), 4m x 4m (tall)",
    population: 450
  },
  oranges: {
    spacing: "4.5m x 4.5m",
    population: 493
  },
  pineapples: {
    spacing: "90cm x 60cm x 30cm (double rows)",
    population: 37000
  },
  avocados: {
    spacing: "5m x 5m",
    population: 400
  },
  pawpaws: {
    spacing: "2.5m x 2.5m",
    population: 1600
  },
  "passion fruit": {
    spacing: "2m x 3m or 3m x 3m",
    population: 1666
  }
};