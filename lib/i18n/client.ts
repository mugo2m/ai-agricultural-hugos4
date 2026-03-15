// lib/i18n/client.ts
import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';
import resourcesToBackend from 'i18next-resources-to-backend';

export const initI18nextClient = async (lng: string) => {
  const i18nInstance = createInstance();
  await i18nInstance
    .use(initReactI18next)
    .use(resourcesToBackend((language: string, namespace: string) =>
      import(`../locales/${language}/${namespace}.json`)
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
    });
  return i18nInstance;
};

// ✅ For Client Components
export async function getClientTranslations(language: string, namespace: string = 'common') {
  const i18n = await initI18nextClient(language);
  return (key: string, params?: Record<string, any>) => i18n.t(key, params);
}