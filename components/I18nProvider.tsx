'use client';

import { ReactNode, useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { initI18next } from '@/lib/i18n';
import { useCurrency } from '@/lib/context/CurrencyContext';
import { getLanguageFromCountry } from '@/lib/config/language';

interface I18nProviderProps {
  children: ReactNode;
}

export default function I18nProvider({ children }: I18nProviderProps) {
  const [i18n, setI18n] = useState<any>(null);
  const { country } = useCurrency();

  useEffect(() => {
    const loadI18n = async () => {
      // Get language from country only (e.g., 'en-US', 'fr-FR', 'sw-KE')
      const langWithRegion = getLanguageFromCountry(country);
      // i18next expects simple codes like 'en', 'fr', 'sw'
      const simpleLang = langWithRegion.split('-')[0];
      const instance = await initI18next(simpleLang);
      setI18n(instance);
    };
    loadI18n();
  }, [country]);

  if (!i18n) {
    return <div>Loading languages...</div>;
  }

  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
}