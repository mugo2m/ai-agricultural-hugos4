// lib/config/language.ts
// Country to Language Code Mapping for Voice

export interface CountryLanguage {
  code: string;           // Language code (en-US, fr-FR, sw-KE, etc.)
  name: string;           // Language name for display
  ttsSupported: boolean;  // Whether text-to-speech supports this language
}

export const COUNTRY_LANGUAGE_MAP: Record<string, CountryLanguage> = {
  // ===== EAST AFRICA =====
  kenya: { code: 'sw-KE', name: 'Swahili', ttsSupported: true },
  kikuyu: { code: 'ki', name: 'Kikuyu', ttsSupported: true }, // for internal use
  uganda: { code: 'sw-KE', name: 'Swahili', ttsSupported: true },
  tanzania: { code: 'sw-KE', name: 'Swahili', ttsSupported: true },
  rwanda: { code: 'fr-FR', name: 'French', ttsSupported: true },
  burundi: { code: 'fr-FR', name: 'French', ttsSupported: true },
  southsudan: { code: 'en-GB', name: 'English (UK)', ttsSupported: true },
  ethiopia: { code: 'en-US', name: 'English (US)', ttsSupported: true },
  somalia: { code: 'ar-SA', name: 'Arabic', ttsSupported: true },
  djibouti: { code: 'fr-FR', name: 'French', ttsSupported: true },
  eritrea: { code: 'ar-SA', name: 'Arabic', ttsSupported: true },

  // ===== WEST AFRICA =====
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

  // ===== CENTRAL AFRICA =====
  cameroon: { code: 'fr-FR', name: 'French', ttsSupported: true },
  gabon: { code: 'fr-FR', name: 'French', ttsSupported: true },
  chad: { code: 'fr-FR', name: 'French', ttsSupported: true },
  car: { code: 'fr-FR', name: 'French', ttsSupported: true },
  // Equatorial Guinea - Spanish speaking country in Africa
  equatorialguinea: { code: 'es-ES', name: 'Spanish', ttsSupported: true },
  congobrazzaville: { code: 'fr-FR', name: 'French', ttsSupported: true },
  // DRC - French official, Swahili widely spoken
  congokinshasa: { code: 'fr-FR', name: 'French', ttsSupported: true },
  angola: { code: 'pt-PT', name: 'Portuguese', ttsSupported: true },
  saotome: { code: 'pt-PT', name: 'Portuguese', ttsSupported: true },

  // ===== SOUTHERN AFRICA =====
  southafrica: { code: 'en-ZA', name: 'English (South Africa)', ttsSupported: true },
  namibia: { code: 'en-ZA', name: 'English (South Africa)', ttsSupported: true },
  botswana: { code: 'en-ZA', name: 'English (South Africa)', ttsSupported: true },
  zimbabwe: { code: 'en-GB', name: 'English (UK)', ttsSupported: true },
  zambia: { code: 'en-ZM', name: 'English (Zambia)', ttsSupported: true },
  malawi: { code: 'en-MW', name: 'English (Malawi)', ttsSupported: true },
  // Mozambique - Portuguese official, Swahili spoken in north
  mozambique: { code: 'pt-PT', name: 'Portuguese', ttsSupported: true },
  madagascar: { code: 'fr-FR', name: 'French', ttsSupported: true },
  // Comoros - French and Swahili
  comoros: { code: 'fr-FR', name: 'French', ttsSupported: true },
  mauritius: { code: 'en-MU', name: 'English (Mauritius)', ttsSupported: true },
  seychelles: { code: 'fr-FR', name: 'French', ttsSupported: true },
  eswatini: { code: 'en-ZA', name: 'English (South Africa)', ttsSupported: true },
  lesotho: { code: 'en-ZA', name: 'English (South Africa)', ttsSupported: true },

  // ===== NORTH AFRICA =====
  egypt: { code: 'ar-EG', name: 'Arabic (Egypt)', ttsSupported: true },
  sudan: { code: 'ar-SA', name: 'Arabic', ttsSupported: true },
  libya: { code: 'ar-LY', name: 'Arabic (Libya)', ttsSupported: true },
  tunisia: { code: 'ar-TN', name: 'Arabic (Tunisia)', ttsSupported: true },
  algeria: { code: 'ar-DZ', name: 'Arabic (Algeria)', ttsSupported: true },
  morocco: { code: 'ar-MA', name: 'Arabic (Morocco)', ttsSupported: true },
  mauritania: { code: 'ar-MR', name: 'Arabic (Mauritania)', ttsSupported: true },

  // ===== SPANISH SPEAKING COUNTRIES (Latin America & Spain) =====
  // North America
  mexico: { code: 'es-ES', name: 'Spanish', ttsSupported: true },

  // Central America
  guatemala: { code: 'es-ES', name: 'Spanish', ttsSupported: true },
  honduras: { code: 'es-ES', name: 'Spanish', ttsSupported: true },
  elsalvador: { code: 'es-ES', name: 'Spanish', ttsSupported: true },
  nicaragua: { code: 'es-ES', name: 'Spanish', ttsSupported: true },
  costarica: { code: 'es-ES', name: 'Spanish', ttsSupported: true },
  panama: { code: 'es-ES', name: 'Spanish', ttsSupported: true },

  // Caribbean
  cuba: { code: 'es-ES', name: 'Spanish', ttsSupported: true },
  dominicanrepublic: { code: 'es-ES', name: 'Spanish', ttsSupported: true },
  puertorico: { code: 'es-ES', name: 'Spanish', ttsSupported: true },

  // South America
  colombia: { code: 'es-ES', name: 'Spanish', ttsSupported: true },
  venezuela: { code: 'es-ES', name: 'Spanish', ttsSupported: true },
  ecuador: { code: 'es-ES', name: 'Spanish', ttsSupported: true },
  peru: { code: 'es-ES', name: 'Spanish', ttsSupported: true },
  bolivia: { code: 'es-ES', name: 'Spanish', ttsSupported: true },
  chile: { code: 'es-ES', name: 'Spanish', ttsSupported: true },
  paraguay: { code: 'es-ES', name: 'Spanish', ttsSupported: true },
  argentina: { code: 'es-ES', name: 'Spanish', ttsSupported: true },
  uruguay: { code: 'es-ES', name: 'Spanish', ttsSupported: true },

  // Europe
  spain: { code: 'es-ES', name: 'Spanish', ttsSupported: true },

  // ===== ADDITIONAL SWAHILI-SPEAKING REGIONS =====
  // East African Community countries where Swahili is widely spoken
  rwanda_sw: { code: 'sw-KE', name: 'Swahili', ttsSupported: true },
  burundi_sw: { code: 'sw-KE', name: 'Swahili', ttsSupported: true },
  southsudan_sw: { code: 'sw-KE', name: 'Swahili', ttsSupported: true },

  // Southern African countries with Swahili speakers
  zambia_sw: { code: 'sw-KE', name: 'Swahili', ttsSupported: true },
  malawi_sw: { code: 'sw-KE', name: 'Swahili', ttsSupported: true },
  mozambique_sw: { code: 'sw-KE', name: 'Swahili', ttsSupported: true },

  // Central Africa
  congokinshasa_sw: { code: 'sw-KE', name: 'Swahili', ttsSupported: true },

  // Indian Ocean
  comoros_sw: { code: 'sw-KE', name: 'Swahili', ttsSupported: true },

  // Middle East (historical trade communities)
  oman: { code: 'sw-KE', name: 'Swahili', ttsSupported: true },
  yemen: { code: 'sw-KE', name: 'Swahili', ttsSupported: true },

  // ===== WESTERN COUNTRIES =====
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

// Language options for the language bar (SINGLE EXPORT - CORRECTED)
export const LANGUAGE_OPTIONS = [
  { code: 'en', label: '🇬🇧 ENGLISH', flag: '🇬🇧', name: 'English' },
  { code: 'fr', label: '🇫🇷 FRANÇAIS', flag: '🇫🇷', name: 'Français' },
  { code: 'es', label: '🇪🇸 ESPAÑOL', flag: '🇪🇸', name: 'Español' },
  { code: 'sw', label: '🇰🇪 KISWAHILI', flag: '🇰🇪', name: 'Kiswahili' },
];