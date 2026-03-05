// lib/data/fertilizerRates.ts
// Based on Bungoma Farm Management Guidelines 2017

export const fertilizerRates = {
  maize: {
    planting: [
      { name: "DAP", rate: 150, unit: "kg/ha", provides: { n: 27, p: 69 } },
      { name: "20:20:0", rate: 300, unit: "kg/ha", provides: { n: 60, p: 60 } },
      { name: "23:23:0", rate: 250, unit: "kg/ha", provides: { n: 57.5, p: 57.5 } }
    ],
    topdressing: [
      { name: "CAN", rate: 300, unit: "kg/ha", provides: { n: 81 } },
      { name: "UREA", rate: 150, unit: "kg/ha", provides: { n: 69 } }
    ]
  },
  beans: {
    planting: [
      { name: "DAP", rate: 250, unit: "kg/ha", provides: { n: 45, p: 115 } }
    ],
    topdressing: []
  },
  "finger millet": {
    planting: [
      { name: "DAP", rate: 50, unit: "kg/ha", provides: { n: 9, p: 23 } }
    ],
    topdressing: [
      { name: "CAN", rate: 100, unit: "kg/ha", provides: { n: 27 } }
    ]
  },
  sorghum: {
    planting: [
      { name: "DAP", rate: 50, unit: "kg/ha", provides: { n: 9, p: 23 } },
      { name: "NPK 20:20:0", rate: 180, unit: "kg/ha", provides: { n: 36, p: 36 } }
    ],
    topdressing: [
      { name: "CAN", rate: 100, unit: "kg/ha", provides: { n: 27 } }
    ]
  },
  "soya beans": {
    planting: [
      { name: "DAP", rate: 100, unit: "kg/ha", provides: { n: 18, p: 46 } }
    ],
    topdressing: []
  },
  sunflower: {
    planting: [
      { name: "DAP", rate: 100, unit: "kg/ha", provides: { n: 18, p: 46 } }
    ],
    topdressing: []
  },
  cotton: {
    planting: [
      { name: "DAP", rate: 150, unit: "kg/ha", provides: { n: 27, p: 69 } }
    ],
    topdressing: []
  },
  groundnuts: {
    planting: [
      { name: "TSP", rate: 200, unit: "kg/ha", provides: { p: 92 } }
    ],
    topdressing: []
  },
  sugarcane: {
    planting: [
      { name: "DAP", rate: 100, unit: "kg/ha", provides: { n: 18, p: 46 } }
    ],
    topdressing: [
      { name: "UREA", rate: 100, unit: "kg/ha", provides: { n: 46 } }
    ]
  },
  coffee: {
    planting: [
      { name: "DAP", rate: 100, unit: "kg/ha", provides: { n: 18, p: 46 } },
      { name: "NPK 17:17:17", rate: 150, unit: "kg/ha", provides: { n: 25.5, p: 25.5, k: 25.5 } }
    ],
    topdressing: [
      { name: "CAN", rate: 150, unit: "kg/ha", provides: { n: 40.5 } }
    ]
  },
  tobacco: {
    planting: [
      { name: "NPK 6:18:20+4HGB+0.1B", rate: 500, unit: "kg/ha", provides: { n: 30, p: 90, k: 100 } }
    ],
    topdressing: []
  },
  potatoes: {
    planting: [
      { name: "DAP", rate: 500, unit: "kg/ha", provides: { n: 90, p: 230 } }
    ],
    topdressing: [
      { name: "CAN", rate: 300, unit: "kg/ha", provides: { n: 81 } }
    ]
  },
  tomatoes: {
    planting: [
      { name: "DAP", rate: 200, unit: "kg/ha", provides: { n: 36, p: 92 } }
    ],
    topdressing: [
      { name: "CAN", rate: 100, unit: "kg/ha", provides: { n: 27 } },
      { name: "CAN (at flowering)", rate: 200, unit: "kg/ha", provides: { n: 54 } }
    ]
  },
  kales: {
    planting: [
      { name: "TSP/DSP", rate: 200, unit: "kg/ha", provides: { p: 92 } }
    ],
    topdressing: [
      { name: "CAN", rate: 100, unit: "kg/ha", provides: { n: 27 } },
      { name: "CAN (4-6 weeks)", rate: 200, unit: "kg/ha", provides: { n: 54 } }
    ]
  },
  cabbages: {
    planting: [
      { name: "DAP/TSP", rate: 200, unit: "kg/ha", provides: { p: 92 } }
    ],
    topdressing: [
      { name: "CAN", rate: 100, unit: "kg/ha", provides: { n: 27 } },
      { name: "CAN (4-6 weeks)", rate: 200, unit: "kg/ha", provides: { n: 54 } }
    ]
  },
  onions: {
    planting: [
      { name: "DAP", rate: 200, unit: "kg/ha", provides: { n: 36, p: 92 } }
    ],
    topdressing: [
      { name: "CAN", rate: 300, unit: "kg/ha", provides: { n: 81 } }
    ]
  },
  carrots: {
    planting: [],
    topdressing: [
      { name: "CAN", rate: 200, unit: "kg/ha", provides: { n: 54 } }
    ]
  },
  bananas: {
    planting: [
      { name: "TSP", rate: 100, unit: "g/hole", provides: { p: 46 } }
    ],
    topdressing: [
      { name: "CAN", rate: 125, unit: "g/stool/year", provides: { n: 33.75 } }
    ]
  },
  oranges: {
    planting: [
      { name: "TSP", rate: 1, unit: "bag", provides: { p: 46 } }
    ],
    topdressing: [
      { name: "DAP", rate: 1, unit: "bag", provides: { n: 18, p: 46 } },
      { name: "CAN", rate: 1, unit: "bag", provides: { n: 27 } }
    ]
  },
  pineapples: {
    planting: [
      { name: "Compound fertilizer", rate: 300, unit: "kg/ha", provides: { n: 45, p: 45, k: 45 } }
    ],
    topdressing: [
      { name: "CAN", rate: 300, unit: "kg/ha", provides: { n: 81 } }
    ]
  },
  passion: {
    planting: [
      { name: "DAP", rate: 175, unit: "g/hole", provides: { n: 31.5, p: 80.5 } }
    ],
    topdressing: [
      { name: "CAN", rate: 120, unit: "g/plant", provides: { n: 32.4 } }
    ]
  }
};