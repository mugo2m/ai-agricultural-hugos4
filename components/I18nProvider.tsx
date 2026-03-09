'use client';

import { ReactNode, useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { initI18next } from '@/lib/i18n';
import { useCurrency } from '@/lib/context/CurrencyContext'; // if you have a currency context with country

interface I18nProviderProps {
  children: ReactNode;
}

export default function I18nProvider({ children }: I18nProviderProps) {
  const [i18n, setI18n] = useState<any>(null);
  const { country } = useCurrency(); // assuming your currency context provides the selected country

  useEffect(() => {
    const loadI18n = async () => {
      // Map country to language code – you can reuse your language.ts mapping
      const langMap: Record<string, string> = {
        kenya: 'en',
        uganda: 'en',
        togo: 'fr',
        senegal: 'fr',
        // add all countries you support
      };
      const lang = langMap[country] || 'en';
      const instance = await initI18next(lang);
      setI18n(instance);
    };
    loadI18n();
  }, [country]);

  if (!i18n) {
    return <div>Loading languages...</div>; // or a simple loader
  }

  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
}