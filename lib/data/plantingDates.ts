// lib/data/plantingDates.ts
export const plantingDates = {
  maize: {
    regions: {
      "Kiambu": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Nakuru": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Uasin Gishu": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Trans Nzoia": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Bungoma": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Kakamega": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Meru": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Embu": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Machakos": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Kitui": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
    },
    default: { earliest: "15th March", latest: "15th May", optimal: "March-April" }
  },
  beans: {
    regions: {
      "Kiambu": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Nakuru": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
    },
    default: { earliest: "15th March", latest: "15th May", optimal: "March-April" }
  },
  coffee: {
    regions: {
      "Kiambu": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Muranga": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
      "Kirinyaga": { earliest: "15th March", latest: "15th May", optimal: "March-April" },
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