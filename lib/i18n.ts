import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next/initReactI18next';
import resourcesToBackend from 'i18next-resources-to-backend';

// This function will be used in client components to get the i18next instance
export const initI18next = async (lng: string) => {
  const i18nInstance = createInstance();
  await i18nInstance
    .use(initReactI18next)
    .use(resourcesToBackend((language: string, namespace: string) =>
      import(`../locales/${language}/${namespace}.json`)
    ))
    .init({
      lng,
      fallbackLng: 'en',
      supportedLngs: ['en', 'fr'],
      defaultNS: 'common',
      fallbackNS: 'common',
      interpolation: {
        escapeValue: false, // not needed for React
      },
      react: {
        useSuspense: false, // we'll handle loading ourselves
      },
    });
  return i18nInstance;
};