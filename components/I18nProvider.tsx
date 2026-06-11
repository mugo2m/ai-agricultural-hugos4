'use client';

import { ReactNode, useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { useCurrency } from '@/lib/context/CurrencyContext';
import { getLanguageFromCountry } from '@/lib/config/language';

export default function I18nProvider({ children }: { children: ReactNode }) {
  // Create a fallback instance synchronously (provides i18n context immediately)
  const [i18nInstance, setI18nInstance] = useState(() => {
    const fallback = createInstance();
    fallback.use(initReactI18next).init({
      lng: 'en-US',
      resources: {},
      fallbackLng: 'en-US',
      interpolation: { escapeValue: false },
    });
    return fallback;
  });

  const { country } = useCurrency();

  useEffect(() => {
    const loadI18n = async () => {
      const langWithRegion = getLanguageFromCountry(country);
      const simpleLang = langWithRegion.split('-')[0];
      const savedLang = localStorage.getItem('preferred-language');
      const finalLang = savedLang || simpleLang || 'en';

      // Dynamically import the real i18n initializer (with all resources)
      const { initI18next } = await import('@/lib/i18n');
      const realInstance = await initI18next(finalLang);
      setI18nInstance(realInstance);
    };
    loadI18n();
  }, [country]);

  return <I18nextProvider i18n={i18nInstance}>{children}</I18nextProvider>;
}