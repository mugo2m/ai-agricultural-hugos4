// lib/data/fertilizerRates.ts
export const fertilizerRates = {
  maize: {
    planting: [
      { name: "DAP", rate: 50, unit: "kg/acre", provides: { n: 9, p: 23 } },
      { name: "NPK 23-23-0", rate: 60, unit: "kg/acre", provides: { n: 13.8, p: 13.8 } },
      { name: "NPK 17-17-17", rate: 80, unit: "kg/acre", provides: { n: 13.6, p: 13.6, k: 13.6 } }
    ],
    topdressing: [
      { name: "CAN", rate: 50, unit: "kg/acre", provides: { n: 13.5 } },
      { name: "UREA", rate: 25, unit: "kg/acre", provides: { n: 11.5 } }
    ]
  },
  beans: {
    planting: [
      { name: "DAP", rate: 50, unit: "kg/acre", provides: { n: 9, p: 23 } },
      { name: "TSP", rate: 50, unit: "kg/acre", provides: { p: 23 } }
    ]
  },
  coffee: {
    planting: [
      { name: "DAP", rate: 100, unit: "kg/acre", provides: { n: 18, p: 46 } },
      { name: "NPK 17-17-17", rate: 150, unit: "kg/acre", provides: { n: 25.5, p: 25.5, k: 25.5 } }
    ],
    topdressing: [
      { name: "CAN", rate: 150, unit: "kg/acre", provides: { n: 40.5 } }
    ]
  },
  potatoes: {
    planting: [
      { name: "DAP", rate: 150, unit: "kg/acre", provides: { n: 27, p: 69 } },
      { name: "NPK 17-17-17", rate: 200, unit: "kg/acre", provides: { n: 34, p: 34, k: 34 } }
    ],
    topdressing: [
      { name: "CAN", rate: 100, unit: "kg/acre", provides: { n: 27 } }
    ]
  },
  tomatoes: {
    planting: [
      { name: "DAP", rate: 100, unit: "kg/acre", provides: { n: 18, p: 46 } },
      { name: "NPK 17-17-17", rate: 150, unit: "kg/acre", provides: { n: 25.5, p: 25.5, k: 25.5 } }
    ],
    topdressing: [
      { name: "CAN", rate: 100, unit: "kg/acre", provides: { n: 27 } }
    ]
  }
};