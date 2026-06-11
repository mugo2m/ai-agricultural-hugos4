import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { OfflineTranslationService } from '@/lib/services/offlineTranslation';
import { useOffline } from './useOffline';

export const useOfflineTranslation = () => {
  const { t, i18n, ready } = useTranslation();
  const { isOnline } = useOffline();
  const [isReady, setIsReady] = useState(false);

  // Set ready only when i18n instance is truly initialized
  useEffect(() => {
    if (i18n && i18n.isInitialized && ready) {
      setIsReady(true);
    } else {
      setIsReady(false);
    }
  }, [i18n, ready]);

  // Preload common translations when online and language is ready
  useEffect(() => {
    if (!isOnline || !isReady || !i18n?.language) return;

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
      'ask_questions',
      'personalized_recommendations',
      'business_tip_short',
      'yearly_testing_reminder',
      'soil_test_grouped',
      'calcitic_lime_grouped',
      'fertilizer_header_grouped',
      'planting_fertilizers_grouped',
      'topdressing_fertilizers_grouped',
      'plant_population_grouped',
      'gross_margin_grouped',
      'gap_grouped',
      'disease_management_grouped',
      'pest_management_grouped',
      'conservation_grouped',
      'business_grouped'
    ];

    OfflineTranslationService.preloadLanguage(i18n.language, preloadCommonKeys)
      .catch(error => {
        console.warn('Failed to preload translations:', error);
      });
  }, [i18n?.language, isOnline, isReady]);

  const offlineT = (key: string, params?: any): string => {
    // Fallback to key when not ready – no console warnings
    if (!isReady || !t || !i18n?.isInitialized) {
      return key;
    }
    try {
      const translation = t(key, params);
      // If translation returns a Promise (shouldn't happen), fallback
      if (translation && typeof translation.then === 'function') {
        return key;
      }
      return typeof translation === 'string' ? translation : String(translation || key);
    } catch {
      return key;
    }
  };

  return {
    t: offlineT,
    ready: isReady,
    i18n,
    isOnline
  };
};