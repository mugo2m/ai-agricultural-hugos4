// lib/config/language.ts
// Country to Language Code Mapping for Voice

export interface CountryLanguage {
  code: string;           // Language code (en-US, fr-FR, sw-KE, etc.)
  name: string;           // Language name for display
  ttsSupported: boolean;  // Whether text-to-speech supports this language
}

export const COUNTRY_LANGUAGE_MAP: Record<string, CountryLanguage> = {
  // East Africa
  kenya: { code: 'sw-KE', name: 'Swahili', ttsSupported: true },
  uganda: { code: 'sw-KE', name: 'Swahili', ttsSupported: true },
  tanzania: { code: 'sw-KE', name: 'Swahili', ttsSupported: true },
  rwanda: { code: 'fr-FR', name: 'French', ttsSupported: true },
  burundi: { code: 'fr-FR', name: 'French', ttsSupported: true },
  southsudan: { code: 'en-GB', name: 'English (UK)', ttsSupported: true },
  ethiopia: { code: 'en-US', name: 'English (US)', ttsSupported: true },
  somalia: { code: 'ar-SA', name: 'Arabic', ttsSupported: true },
  djibouti: { code: 'fr-FR', name: 'French', ttsSupported: true },
  eritrea: { code: 'ar-SA', name: 'Arabic', ttsSupported: true },

  // West Africa
  nigeria: { code: 'en-GB', name: 'English (UK)', ttsSupported: true },
  ghana: { code: 'en-GB', name: 'English (UK)', ttsSupported: true },
  senegal: { code: 'fr-FR', name: 'French', ttsSupported: true },
  ivorycoast: { code: 'fr-FR', name: 'French', ttsSupported: true },
  mali: { code: 'fr-FR', name: 'French', ttsSupported: true },
  burkinafaso: { code: 'fr-FR', name: 'French', ttsSupported: true },
  niger: { code: 'fr-FR', name: 'French', ttsSupported: true },
  togo: { code: 'fr-FR', name: 'French', ttsSupported: true },
  benin: { code: 'fr-FR', name: 'French', ttsSupported: true },
  guinea: { code: 'fr-FR', name: 'French', ttsSupported: true },
  liberia: { code: 'en-US', name: 'English (US)', ttsSupported: true },
  sierraleone: { code: 'en-GB', name: 'English (UK)', ttsSupported: true },
  gambia: { code: 'en-GB', name: 'English (UK)', ttsSupported: true },
  capoverde: { code: 'pt-PT', name: 'Portuguese', ttsSupported: true },

  // Central Africa
  cameroon: { code: 'fr-FR', name: 'French', ttsSupported: true },
  gabon: { code: 'fr-FR', name: 'French', ttsSupported: true },
  chad: { code: 'fr-FR', name: 'French', ttsSupported: true },
  car: { code: 'fr-FR', name: 'French', ttsSupported: true },
  equatorialguinea: { code: 'es-ES', name: 'Spanish', ttsSupported: true },
  congobrazzaville: { code: 'fr-FR', name: 'French', ttsSupported: true },
  congokinshasa: { code: 'fr-FR', name: 'French', ttsSupported: true },
  angola: { code: 'pt-PT', name: 'Portuguese', ttsSupported: true },
  saotome: { code: 'pt-PT', name: 'Portuguese', ttsSupported: true },

  // Southern Africa
  southafrica: { code: 'en-ZA', name: 'English (South Africa)', ttsSupported: true },
  namibia: { code: 'en-ZA', name: 'English (South Africa)', ttsSupported: true },
  botswana: { code: 'en-ZA', name: 'English (South Africa)', ttsSupported: true },
  zimbabwe: { code: 'en-GB', name: 'English (UK)', ttsSupported: true },
  zambia: { code: 'en-ZM', name: 'English (Zambia)', ttsSupported: true },
  malawi: { code: 'en-MW', name: 'English (Malawi)', ttsSupported: true },
  mozambique: { code: 'pt-PT', name: 'Portuguese', ttsSupported: true },
  madagascar: { code: 'fr-FR', name: 'French', ttsSupported: true },
  comoros: { code: 'fr-FR', name: 'French', ttsSupported: true },
  mauritius: { code: 'en-MU', name: 'English (Mauritius)', ttsSupported: true },
  seychelles: { code: 'fr-FR', name: 'French', ttsSupported: true },
  eswatini: { code: 'en-ZA', name: 'English (South Africa)', ttsSupported: true },
  lesotho: { code: 'en-ZA', name: 'English (South Africa)', ttsSupported: true },

  // North Africa
  egypt: { code: 'ar-EG', name: 'Arabic (Egypt)', ttsSupported: true },
  sudan: { code: 'ar-SA', name: 'Arabic', ttsSupported: true },
  libya: { code: 'ar-LY', name: 'Arabic (Libya)', ttsSupported: true },
  tunisia: { code: 'ar-TN', name: 'Arabic (Tunisia)', ttsSupported: true },
  algeria: { code: 'ar-DZ', name: 'Arabic (Algeria)', ttsSupported: true },
  morocco: { code: 'ar-MA', name: 'Arabic (Morocco)', ttsSupported: true },
  mauritania: { code: 'ar-MR', name: 'Arabic (Mauritania)', ttsSupported: true },

  // Western countries
  usa: { code: 'en-US', name: 'English (US)', ttsSupported: true },
  uk: { code: 'en-GB', name: 'English (UK)', ttsSupported: true },
  europe: { code: 'en-GB', name: 'English (UK)', ttsSupported: true },
  canada: { code: 'en-CA', name: 'English (Canada)', ttsSupported: true },
  australia: { code: 'en-AU', name: 'English (Australia)', ttsSupported: true }
};

// Default language if country not found
export const DEFAULT_LANGUAGE = 'en-US';

// Helper function to get language code from country
export function getLanguageFromCountry(country: string): string {
  return COUNTRY_LANGUAGE_MAP[country]?.code || DEFAULT_LANGUAGE;
}

// Helper function to get language name from country
export function getLanguageNameFromCountry(country: string): string {
  return COUNTRY_LANGUAGE_MAP[country]?.name || 'English (US)';
}