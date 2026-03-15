// lib/i18n/index.ts
import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';
import resourcesToBackend from 'i18next-resources-to-backend';

export const initI18next = async (lng: string) => {
  const i18nInstance = createInstance();
  await i18nInstance
    .use(initReactI18next)
    .use(resourcesToBackend((language: string, namespace: string) =>
      // ✅ FIXED: Go up two levels to reach project root
      import(`../../locales/${language}/${namespace}.json`)
    ))
    .init({
      lng,
      fallbackLng: 'en',
      supportedLngs: ['en', 'fr', 'es', 'sw'],
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