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
  uganda: { code: 'sw-KE', name: 'Swahili', ttsSupported: true },
  tanzania: { code: 'sw-KE', name: 'Swahili', ttsSupported: true },
  rwanda: { code: 'fr-FR', name: 'French', ttsSupported: true },
  burundi: { code: 'fr-FR', name: 'French', ttsSupported: true },
  ethiopia: { code: 'am-ET', name: 'Amharic', ttsSupported: true },

  // ===== WEST AFRICA =====
  nigeria: { code: 'en-NG', name: 'English (Nigeria)', ttsSupported: true },

  // ===== NORTH AFRICA =====
  egypt: { code: 'ar-EG', name: 'Arabic (Egypt)', ttsSupported: true },
  morocco: { code: 'ar-MA', name: 'Arabic (Morocco)', ttsSupported: true },
  algeria: { code: 'ar-DZ', name: 'Arabic (Algeria)', ttsSupported: true },
  tunisia: { code: 'ar-TN', name: 'Arabic (Tunisia)', ttsSupported: true },
  libya: { code: 'ar-LY', name: 'Arabic (Libya)', ttsSupported: true },
  sudan: { code: 'ar-SA', name: 'Arabic', ttsSupported: true },

  // ===== SOUTH ASIA =====
  india: { code: 'hi-IN', name: 'Hindi', ttsSupported: true },
  pakistan: { code: 'ur-PK', name: 'Urdu', ttsSupported: true }, // Keep in map for country lookup
  bangladesh: { code: 'bn-BD', name: 'Bengali', ttsSupported: true },

  // ===== EAST ASIA =====
  china: { code: 'zh-CN', name: 'Chinese (Simplified)', ttsSupported: true },

  // ===== SOUTHEAST ASIA =====
  vietnam: { code: 'vi-VN', name: 'Vietnamese', ttsSupported: true },
  thailand: { code: 'th-TH', name: 'Thai', ttsSupported: true },
  indonesia: { code: 'id-ID', name: 'Indonesian', ttsSupported: true },

  // ===== MIDDLE EAST =====
  saudi: { code: 'ar-SA', name: 'Arabic (Saudi Arabia)', ttsSupported: true },
  uae: { code: 'ar-AE', name: 'Arabic (UAE)', ttsSupported: true },
  iraq: { code: 'ar-IQ', name: 'Arabic (Iraq)', ttsSupported: true },
  jordan: { code: 'ar-JO', name: 'Arabic (Jordan)', ttsSupported: true },
  lebanon: { code: 'ar-LB', name: 'Arabic (Lebanon)', ttsSupported: true },
  palestine: { code: 'ar-PS', name: 'Arabic (Palestine)', ttsSupported: true },
  syria: { code: 'ar-SY', name: 'Arabic (Syria)', ttsSupported: true },
  yemen: { code: 'ar-YE', name: 'Arabic (Yemen)', ttsSupported: true },
  qatar: { code: 'ar-QA', name: 'Arabic (Qatar)', ttsSupported: true },
  kuwait: { code: 'ar-KW', name: 'Arabic (Kuwait)', ttsSupported: true },
  oman: { code: 'ar-OM', name: 'Arabic (Oman)', ttsSupported: true },
  bahrain: { code: 'ar-BH', name: 'Arabic (Bahrain)', ttsSupported: true },

  // ===== EUROPE =====
  spain: { code: 'es-ES', name: 'Spanish', ttsSupported: true },
  france: { code: 'fr-FR', name: 'French', ttsSupported: true },
  germany: { code: 'de-DE', name: 'German', ttsSupported: true },
  italy: { code: 'it-IT', name: 'Italian', ttsSupported: true },
  netherlands: { code: 'nl-NL', name: 'Dutch', ttsSupported: true },
  greece: { code: 'el-GR', name: 'Greek', ttsSupported: true },
  portugal: { code: 'pt-PT', name: 'Portuguese', ttsSupported: true },
  russia: { code: 'ru-RU', name: 'Russian', ttsSupported: true },
  ukraine: { code: 'ru-UA', name: 'Russian', ttsSupported: true },
  belarus: { code: 'ru-BY', name: 'Russian', ttsSupported: true },
  kazakhstan: { code: 'ru-KZ', name: 'Russian', ttsSupported: true },
  uk: { code: 'en-GB', name: 'English (UK)', ttsSupported: true },

  // ===== WESTERN COUNTRIES =====
  usa: { code: 'en-US', name: 'English (US)', ttsSupported: true },
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

// Language options for the language bar - URDU REMOVED
export const LANGUAGE_OPTIONS = [
  // Original 4
  { code: 'en', label: '🇬🇧 ENGLISH', flag: '🇬🇧', name: 'English' },
  { code: 'fr', label: '🇫🇷 FRANÇAIS', flag: '🇫🇷', name: 'Français' },
  { code: 'es', label: '🇪🇸 ESPAÑOL', flag: '🇪🇸', name: 'Español' },
  { code: 'sw', label: '🇰🇪 KISWAHILI', flag: '🇰🇪', name: 'Kiswahili' },

  // Hindi, Chinese, Arabic
  { code: 'hi', label: '🇮🇳 हिन्दी', flag: '🇮🇳', name: 'Hindi' },
  { code: 'zh', label: '🇨🇳 中文', flag: '🇨🇳', name: 'Chinese' },
  { code: 'ar', label: '🇸🇦 العربية', flag: '🇸🇦', name: 'Arabic' },

  // Portuguese, Russian
  { code: 'pt', label: '🇵🇹 PORTUGUÊS', flag: '🇵🇹', name: 'Portuguese' },
  { code: 'ru', label: '🇷🇺 РУССКИЙ', flag: '🇷🇺', name: 'Russian' },

  // German, Italian, Dutch, Greek
  { code: 'de', label: '🇩🇪 DEUTSCH', flag: '🇩🇪', name: 'German' },
  { code: 'it', label: '🇮🇹 ITALIANO', flag: '🇮🇹', name: 'Italian' },
  { code: 'nl', label: '🇳🇱 NEDERLANDS', flag: '🇳🇱', name: 'Dutch' },
  { code: 'el', label: '🇬🇷 ΕΛΛΗΝΙΚΑ', flag: '🇬🇷', name: 'Greek' },

  // Thai, Vietnamese, Indonesian
  { code: 'th', label: '🇹🇭 ภาษาไทย', flag: '🇹🇭', name: 'Thai' },
  { code: 'vi', label: '🇻🇳 TIẾNG VIỆT', flag: '🇻🇳', name: 'Vietnamese' },
  { code: 'id', label: '🇮🇩 BAHASA INDONESIA', flag: '🇮🇩', name: 'Indonesian' },

  // Amharic
  { code: 'am', label: '🇪🇹 አማርኛ', flag: '🇪🇹', name: 'Amharic' },

  // Bengali (Urdu removed)
  { code: 'bn', label: '🇧🇩 বাংলা', flag: '🇧🇩', name: 'Bengali' }
];