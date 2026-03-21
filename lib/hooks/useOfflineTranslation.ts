// lib/hooks/useOfflineTranslation.ts
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { OfflineTranslationService } from '@/lib/services/offlineTranslation';
import { useOffline } from './useOffline';

export const useOfflineTranslation = () => {
  const { t, i18n, ready } = useTranslation();
  const { isOnline } = useOffline();

  // Preload common translations when language changes
  useEffect(() => {
    if (!isOnline) return;

    const preloadCommonKeys = [
      'welcome',
      'soil_test',
      'fertilizer',
      'pests',
      'watering',
      'harvest',
      'profit',
      'costs',
      'revenue',
      'farm_size',
      'acres',
      'cattle',
      'ask_questions'
    ];

    // Handle the promise properly
    OfflineTranslationService.preloadLanguage(i18n.language, preloadCommonKeys)
      .catch(error => {
        console.warn('Failed to preload translations:', error);
      });

  }, [i18n.language, isOnline]);

  const offlineT = (key: string, params?: any): string => {
    try {
      return OfflineTranslationService.getTranslation(
        key,
        i18n.language,
        () => t(key, params)
      );
    } catch (error) {
      console.warn('Translation error, falling back to key:', key);
      return key;
    }
  };

  return {
    t: offlineT,
    ready,
    i18n,
    isOnline
  };
};