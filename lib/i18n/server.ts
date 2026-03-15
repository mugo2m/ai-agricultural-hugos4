// lib/i18n/server.ts
import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next/initReactI18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import { cookies } from 'next/headers';

export const initI18nextServer = async (lng: string) => {
  const i18nInstance = createInstance();
  await i18nInstance
    .use(initReactI18next)
    .use(resourcesToBackend((language: string, namespace: string) =>
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
    });
  return i18nInstance;
};

export async function getTranslations(namespace: string = 'common') {
  const cookieStore = await cookies(); // ✅ Await the cookies() function
  const language = cookieStore.get('preferred-language')?.value || 'en';

  const i18n = await initI18nextServer(language);
  return (key: string, params?: Record<string, any>) => i18n.t(key, params);
}