// lib/data/plantingDates.ts
// Based on Bungoma Farm Management Guidelines 2017

export const plantingDates = {
  maize: {
    regions: {
      "Bungoma": { earliest: "15th February", latest: "15th May", optimal: "March-April" },
      "Kiambu": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Nakuru": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Uasin Gishu": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Trans Nzoia": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Kakamega": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
    },
    default: { earliest: "15th March", latest: "15th May", optimal: "March-April" }
  },
  beans: {
    regions: {
      "Bungoma": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
    },
    default: { earliest: "15th March", latest: "15th May", optimal: "March-April" }
  },
  "finger millet": {
    regions: {
      "Bungoma": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
    },
    default: { earliest: "15th March", latest: "15th May", optimal: "March-April" }
  },
  sorghum: {
    regions: {
      "Bungoma": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
    },
    default: { earliest: "15th March", latest: "15th May", optimal: "March-April" }
  },
  "soya beans": {
    regions: {
      "Bungoma": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
    },
    default: { earliest: "15th March", latest: "15th May", optimal: "March-April" }
  },
  sunflower: {
    regions: {
      "Bungoma": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
    },
    default: { earliest: "15th March", latest: "15th May", optimal: "March-April" }
  },
  cotton: {
    regions: {
      "Bungoma": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
    },
    default: { earliest: "15th March", latest: "15th May", optimal: "March-April" }
  },
  groundnuts: {
    regions: {
      "Bungoma": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
    },
    default: { earliest: "15th March", latest: "15th May", optimal: "March-April" }
  },
  sugarcane: {
    regions: {
      "Bungoma": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
    },
    default: { earliest: "15th March", latest: "15th May", optimal: "March-April" }
  },
  tobacco: {
    regions: {
      "Bungoma": { earliest: "15th November", latest: "31st August", optimal: "November-December" },
    },
    default: { earliest: "15th November", latest: "31st August", optimal: "November-December" }
  },
  coffee: {
    regions: {
      "Bungoma": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Kiambu": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Muranga": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Kirinyaga": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
    },
    default: { earliest: "15th March", latest: "15th May", optimal: "March-April" }
  },
  "irish potatoes": {
    regions: {
      "Bungoma": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
    },
    default: { earliest: "15th March", latest: "15th May", optimal: "March-April" }
  },
  tomatoes: {
    regions: {
      "Bungoma": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
    },
    default: { earliest: "15th March", latest: "15th May", optimal: "March-April" }
  }
};

export function getPlantingAdvice(crop: string, county: string, plantingDate: string): string {
  const cropData = plantingDates[crop as keyof typeof plantingDates] || plantingDates.maize;
  const regionData = cropData.regions?.[county as keyof typeof cropData.regions] || cropData.default;

  const date = new Date(plantingDate);
  const month = date.getMonth() + 1;

  if (month >= 3 && month <= 4) {
    return "optimal";
  } else if (month === 2 || month === 5) {
    return "acceptable";
  } else {
    return "late";
  }
}