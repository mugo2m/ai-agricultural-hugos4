// lib/context/CurrencyContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { COUNTRY_CURRENCY_MAP, DEFAULT_COUNTRY, CountryCurrency } from '@/lib/config/currency';

interface CurrencyContextType {
  country: string;
  currency: CountryCurrency;
  setCountry: (country: string) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [country, setCountry] = useState<string>(DEFAULT_COUNTRY);
  const [currency, setCurrency] = useState<CountryCurrency>(COUNTRY_CURRENCY_MAP[DEFAULT_COUNTRY]);

  useEffect(() => {
    const savedCountry = localStorage.getItem('selected-country');
    if (savedCountry && COUNTRY_CURRENCY_MAP[savedCountry]) {
      setCountry(savedCountry);
      setCurrency(COUNTRY_CURRENCY_MAP[savedCountry]);
    }
  }, []);

  const handleSetCountry = (newCountry: string) => {
    if (COUNTRY_CURRENCY_MAP[newCountry]) {
      setCountry(newCountry);
      setCurrency(COUNTRY_CURRENCY_MAP[newCountry]);
      localStorage.setItem('selected-country', newCountry);
    }
  };

  return (
    <CurrencyContext.Provider value={{ country, currency, setCountry: handleSetCountry }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
}