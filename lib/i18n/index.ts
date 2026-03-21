// lib/i18n/index.ts
import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';
import resourcesToBackend from 'i18next-resources-to-backend';

export const initI18next = async (lng: string) => {
  // DEBUG: Log the incoming language
  console.log(`🔍 initI18next called with lng: "${lng}" (type: ${typeof lng}, length: ${lng?.length})`);

  // Validate lng - ensure it's a 2-letter code
  let validLng = lng;
  if (!lng || typeof lng !== 'string' || lng.length !== 2) {
    console.error(`❌ Invalid language code detected: "${lng}", falling back to 'en'`);
    validLng = 'en';
  }

  const i18nInstance = createInstance();
  await i18nInstance
    .use(initReactI18next)
    .use(resourcesToBackend((language: string, namespace: string) => {
      // DEBUG: Log each language being loaded
      console.log(`📚 Loading locale: "${language}/${namespace}.json"`);

      // Validate language before import
      let safeLanguage = language;
      if (!language || typeof language !== 'string' || language.length !== 2) {
        console.error(`❌ Invalid language in resourcesToBackend: "${language}", falling back to 'en'`);
        safeLanguage = 'en';
      }

      // Check if it's the mysterious 'V'
      if (safeLanguage === 'V') {
        console.error(`🔥 Found the mysterious 'V' language! This should not happen.`);
        safeLanguage = 'en';
      }

      // First try: requested language with requested namespace
      return import(`@/public/locales/${safeLanguage}/${namespace}.json`) // ✅ Updated path
        .catch(() => {
          // Second try: requested language with 'common' namespace (your actual files)
          return import(`@/public/locales/${safeLanguage}/common.json`) // ✅ Updated path
            .catch(() => {
              // Final fallback: English with 'common' namespace
              console.log(`⚠️ Falling back to en/common.json for ${safeLanguage}/${namespace}`);
              return import(`@/public/locales/en/common.json`); // ✅ Updated path
            });
        });
    }))
    .init({
      lng: validLng,
      fallbackLng: 'en',
      supportedLngs: [
        'en', 'fr', 'es', 'sw', 'hi', 'zh', 'ar',
        'pt', 'ru', 'de', 'it', 'nl', 'el',
        'th', 'vi', 'id', 'am', 'bn'
      ],
      defaultNS: 'common',
      fallbackNS: 'common',
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
    });
  return i18nInstance;
};