// lib/i18n/server.ts
import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next/initReactI18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import { cookies } from 'next/headers';

export const initI18nextServer = async (lng: string) => {
  // DEBUG: Log the incoming language
  console.log(`🔍 Server initI18nextServer called with lng: "${lng}" (type: ${typeof lng}, length: ${lng?.length})`);

  // Validate lng - ensure it's a 2-letter code
  let validLng = lng;
  if (!lng || typeof lng !== 'string' || lng.length !== 2) {
    console.error(`❌ Server invalid language code detected: "${lng}", falling back to 'en'`);
    validLng = 'en';
  }

  // Check for the mysterious 'V'
  if (validLng === 'V') {
    console.error(`🔥 Server found the mysterious 'V' language! This should not happen.`);
    validLng = 'en';
  }

  const i18nInstance = createInstance();
  await i18nInstance
    .use(initReactI18next)
    .use(resourcesToBackend((language: string, namespace: string) => {
      // DEBUG: Log each language being loaded on server
      console.log(`📚 Server loading locale: "${language}/${namespace}.json"`);

      // Validate language before import
      let safeLanguage = language;
      if (!language || typeof language !== 'string' || language.length !== 2) {
        console.error(`❌ Server invalid language in resourcesToBackend: "${language}", falling back to 'en'`);
        safeLanguage = 'en';
      }

      // First try: requested language with requested namespace
      return import(`../../locales/${safeLanguage}/${namespace}.json`)
        .catch(() => {
          // Second try: requested language with 'common' namespace (your actual files)
          return import(`../../locales/${safeLanguage}/common.json`)
            .catch(() => {
              // Final fallback: English with 'common' namespace
              console.log(`⚠️ Server falling back to en/common.json for ${safeLanguage}/${namespace}`);
              return import(`../../locales/en/common.json`);
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
    });
  return i18nInstance;
};

export async function getTranslations(namespace: string = 'common') {
  const cookieStore = await cookies();

  // DEBUG: Log all cookies
  console.log('🍪 All cookies:', cookieStore.getAll());

  const preferredLangCookie = cookieStore.get('preferred-language');
  console.log('🍪 preferred-language cookie:', preferredLangCookie);

  const language = preferredLangCookie?.value || 'en';
  console.log(`🔤 getTranslations - using language: "${language}", namespace: "${namespace}"`);

  // Validate language
  if (language.length !== 2) {
    console.error(`❌ getTranslations - invalid language length: "${language}" (length: ${language.length})`);
  }

  const i18n = await initI18nextServer(language);
  return (key: string, params?: Record<string, any>) => i18n.t(key, params);
}