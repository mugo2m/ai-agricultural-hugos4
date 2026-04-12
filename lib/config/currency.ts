// lib/config/currency.ts
// Country to Currency Mapping - Complete African Countries

export interface CountryCurrency {
  code: string;           // ISO currency code
  symbol: string;         // Symbol for display
  name: string;           // Full name for speech
  locale: string;         // Locale for formatting
  position: 'before' | 'after'; // Symbol position
  decimalPlaces: number;  // Number of decimal places
}

export const COUNTRY_CURRENCY_MAP: Record<string, CountryCurrency> = {
  // ========== EAST AFRICA ==========
  kenya: {
    code: 'KES',
    symbol: 'Ksh',
    name: 'Kenyan Shillings',
    locale: 'en-KE',
    position: 'before',
    decimalPlaces: 0
  },
  uganda: {
    code: 'UGX',
    symbol: 'USh',
    name: 'Ugandan Shillings',
    locale: 'en-UG',
    position: 'before',
    decimalPlaces: 0
  },
  tanzania: {
    code: 'TZS',
    symbol: 'TSh',
    name: 'Tanzanian Shillings',
    locale: 'en-TZ',
    position: 'before',
    decimalPlaces: 0
  },
  rwanda: {
    code: 'RWF',
    symbol: 'FRw',
    name: 'Rwandan Francs',
    locale: 'en-RW',
    position: 'before',
    decimalPlaces: 0
  },
  burundi: {
    code: 'BIF',
    symbol: 'FBu',
    name: 'Burundian Francs',
    locale: 'en-BI',
    position: 'before',
    decimalPlaces: 0
  },
  southsudan: {
    code: 'SSP',
    symbol: 'SS£',
    name: 'South Sudanese Pounds',
    locale: 'en-SS',
    position: 'before',
    decimalPlaces: 2
  },
  ethiopia: {
    code: 'ETB',
    symbol: 'Br',
    name: 'Ethiopian Birr',
    locale: 'am-ET',
    position: 'before',
    decimalPlaces: 2
  },
  somalia: {
    code: 'SOS',
    symbol: 'Sh.So.',
    name: 'Somali Shillings',
    locale: 'so-SO',
    position: 'before',
    decimalPlaces: 0
  },
  djibouti: {
    code: 'DJF',
    symbol: 'Fdj',
    name: 'Djiboutian Francs',
    locale: 'fr-DJ',
    position: 'before',
    decimalPlaces: 0
  },
  eritrea: {
    code: 'ERN',
    symbol: 'Nfk',
    name: 'Eritrean Nakfa',
    locale: 'ti-ER',
    position: 'before',
    decimalPlaces: 2
  },

  // ========== WEST AFRICA ==========
  nigeria: {
    code: 'NGN',
    symbol: '₦',
    name: 'Nigerian Nairas',
    locale: 'en-NG',
    position: 'before',
    decimalPlaces: 2
  },
  ghana: {
    code: 'GHS',
    symbol: 'GH₵',
    name: 'Ghanaian Cedis',
    locale: 'en-GH',
    position: 'before',
    decimalPlaces: 2
  },
  senegal: {
    code: 'XOF',
    symbol: 'CFA',
    name: 'West African CFA Francs',
    locale: 'fr-SN',
    position: 'after',
    decimalPlaces: 0
  },
  ivorycoast: {
    code: 'XOF',
    symbol: 'CFA',
    name: 'West African CFA Francs',
    locale: 'fr-CI',
    position: 'after',
    decimalPlaces: 0
  },
  mali: {
    code: 'XOF',
    symbol: 'CFA',
    name: 'West African CFA Francs',
    locale: 'fr-ML',
    position: 'after',
    decimalPlaces: 0
  },
  burkinafaso: {
    code: 'XOF',
    symbol: 'CFA',
    name: 'West African CFA Francs',
    locale: 'fr-BF',
    position: 'after',
    decimalPlaces: 0
  },
  niger: {
    code: 'XOF',
    symbol: 'CFA',
    name: 'West African CFA Francs',
    locale: 'fr-NE',
    position: 'after',
    decimalPlaces: 0
  },
  togo: {
    code: 'XOF',
    symbol: 'CFA',
    name: 'West African CFA Francs',
    locale: 'fr-TG',
    position: 'after',
    decimalPlaces: 0
  },
  benin: {
    code: 'XOF',
    symbol: 'CFA',
    name: 'West African CFA Francs',
    locale: 'fr-BJ',
    position: 'after',
    decimalPlaces: 0
  },
  guinea: {
    code: 'GNF',
    symbol: 'FG',
    name: 'Guinean Francs',
    locale: 'fr-GN',
    position: 'before',
    decimalPlaces: 0
  },
  guineabissau: {
    code: 'XOF',
    symbol: 'CFA',
    name: 'West African CFA Francs',
    locale: 'pt-GW',
    position: 'after',
    decimalPlaces: 0
  },
  liberia: {
    code: 'LRD',
    symbol: 'L$',
    name: 'Liberian Dollars',
    locale: 'en-LR',
    position: 'before',
    decimalPlaces: 2
  },
  sierraleone: {
    code: 'SLL',
    symbol: 'Le',
    name: 'Sierra Leonean Leones',
    locale: 'en-SL',
    position: 'before',
    decimalPlaces: 0
  },
  gambia: {
    code: 'GMD',
    symbol: 'D',
    name: 'Gambian Dalasis',
    locale: 'en-GM',
    position: 'before',
    decimalPlaces: 2
  },
  capoverde: {
    code: 'CVE',
    symbol: '$',
    name: 'Cape Verdean Escudos',
    locale: 'pt-CV',
    position: 'after',
    decimalPlaces: 0
  },

  // ========== CENTRAL AFRICA ==========
  cameroon: {
    code: 'XAF',
    symbol: 'FCFA',
    name: 'Central African CFA Francs',
    locale: 'fr-CM',
    position: 'after',
    decimalPlaces: 0
  },
  gabon: {
    code: 'XAF',
    symbol: 'FCFA',
    name: 'Central African CFA Francs',
    locale: 'fr-GA',
    position: 'after',
    decimalPlaces: 0
  },
  chad: {
    code: 'XAF',
    symbol: 'FCFA',
    name: 'Central African CFA Francs',
    locale: 'fr-TD',
    position: 'after',
    decimalPlaces: 0
  },
  car: {
    code: 'XAF',
    symbol: 'FCFA',
    name: 'Central African CFA Francs',
    locale: 'fr-CF',
    position: 'after',
    decimalPlaces: 0
  },
  equatorialguinea: {
    code: 'XAF',
    symbol: 'FCFA',
    name: 'Central African CFA Francs',
    locale: 'es-GQ',
    position: 'after',
    decimalPlaces: 0
  },
  congobrazzaville: {
    code: 'XAF',
    symbol: 'FCFA',
    name: 'Central African CFA Francs',
    locale: 'fr-CG',
    position: 'after',
    decimalPlaces: 0
  },
  congokinshasa: {
    code: 'CDF',
    symbol: 'FC',
    name: 'Congolese Francs',
    locale: 'fr-CD',
    position: 'before',
    decimalPlaces: 2
  },
  angola: {
    code: 'AOA',
    symbol: 'Kz',
    name: 'Angolan Kwanzas',
    locale: 'pt-AO',
    position: 'before',
    decimalPlaces: 2
  },
  saotome: {
    code: 'STN',
    symbol: 'Db',
    name: 'São Tomé and Príncipe Dobras',
    locale: 'pt-ST',
    position: 'after',
    decimalPlaces: 0
  },

  // ========== SOUTHERN AFRICA ==========
  southafrica: {
    code: 'ZAR',
    symbol: 'R',
    name: 'South African Rand',
    locale: 'en-ZA',
    position: 'before',
    decimalPlaces: 2
  },
  namibia: {
    code: 'NAD',
    symbol: 'N$',
    name: 'Namibian Dollars',
    locale: 'en-NA',
    position: 'before',
    decimalPlaces: 2
  },
  botswana: {
    code: 'BWP',
    symbol: 'P',
    name: 'Botswana Pula',
    locale: 'en-BW',
    position: 'before',
    decimalPlaces: 2
  },
  zimbabwe: {
    code: 'ZWL',
    symbol: 'Z$',
    name: 'Zimbabwean Dollars',
    locale: 'en-ZW',
    position: 'before',
    decimalPlaces: 2
  },
  zambia: {
    code: 'ZMW',
    symbol: 'ZK',
    name: 'Zambian Kwacha',
    locale: 'en-ZM',
    position: 'before',
    decimalPlaces: 2
  },
  malawi: {
    code: 'MWK',
    symbol: 'MK',
    name: 'Malawian Kwacha',
    locale: 'en-MW',
    position: 'before',
    decimalPlaces: 0
  },
  mozambique: {
    code: 'MZN',
    symbol: 'MT',
    name: 'Mozambican Meticais',
    locale: 'pt-MZ',
    position: 'before',
    decimalPlaces: 2
  },
  madagascar: {
    code: 'MGA',
    symbol: 'Ar',
    name: 'Malagasy Ariary',
    locale: 'mg-MG',
    position: 'before',
    decimalPlaces: 0
  },
  comoros: {
    code: 'KMF',
    symbol: 'CF',
    name: 'Comorian Francs',
    locale: 'fr-KM',
    position: 'after',
    decimalPlaces: 0
  },
  mauritius: {
    code: 'MUR',
    symbol: 'Rs',
    name: 'Mauritian Rupees',
    locale: 'en-MU',
    position: 'before',
    decimalPlaces: 0
  },
  seychelles: {
    code: 'SCR',
    symbol: 'SR',
    name: 'Seychellois Rupees',
    locale: 'en-SC',
    position: 'before',
    decimalPlaces: 2
  },
  eswatini: {
    code: 'SZL',
    symbol: 'E',
    name: 'Swazi Lilangeni',
    locale: 'en-SZ',
    position: 'before',
    decimalPlaces: 2
  },
  lesotho: {
    code: 'LSL',
    symbol: 'L',
    name: 'Lesotho Loti',
    locale: 'en-LS',
    position: 'before',
    decimalPlaces: 2
  },

  // ========== NORTH AFRICA ==========
  egypt: {
    code: 'EGP',
    symbol: 'E£',
    name: 'Egyptian Pounds',
    locale: 'ar-EG',
    position: 'before',
    decimalPlaces: 2
  },
  sudan: {
    code: 'SDG',
    symbol: 'SDG',
    name: 'Sudanese Pounds',
    locale: 'ar-SD',
    position: 'before',
    decimalPlaces: 2
  },
  libya: {
    code: 'LYD',
    symbol: 'LD',
    name: 'Libyan Dinars',
    locale: 'ar-LY',
    position: 'before',
    decimalPlaces: 3
  },
  tunisia: {
    code: 'TND',
    symbol: 'DT',
    name: 'Tunisian Dinars',
    locale: 'ar-TN',
    position: 'before',
    decimalPlaces: 3
  },
  algeria: {
    code: 'DZD',
    symbol: 'DA',
    name: 'Algerian Dinars',
    locale: 'ar-DZ',
    position: 'before',
    decimalPlaces: 2
  },
  morocco: {
    code: 'MAD',
    symbol: 'DH',
    name: 'Moroccan Dirhams',
    locale: 'ar-MA',
    position: 'before',
    decimalPlaces: 2
  },
  mauritania: {
    code: 'MRU',
    symbol: 'UM',
    name: 'Mauritanian Ouguiya',
    locale: 'ar-MR',
    position: 'after',
    decimalPlaces: 1
  },

  // ========== OTHER INTERNATIONAL ==========
  usa: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollars',
    locale: 'en-US',
    position: 'before',
    decimalPlaces: 2
  },
  uk: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pounds',
    locale: 'en-GB',
    position: 'before',
    decimalPlaces: 2
  },
  europe: {
    code: 'EUR',
    symbol: '€',
    name: 'Euros',
    locale: 'de-DE',
    position: 'after',
    decimalPlaces: 2
  }
};

// Default to Kenya if no country selected
export const DEFAULT_COUNTRY = 'kenya';

// Helper function to get country by currency code
export function getCountryByCurrencyCode(code: string): string | undefined {
  for (const [country, currency] of Object.entries(COUNTRY_CURRENCY_MAP)) {
    if (currency.code === code) {
      return country;
    }
  }
  return undefined;
}

// Helper function to get all countries with the same currency
export function getCountriesByCurrencyCode(code: string): string[] {
  const countries: string[] = [];
  for (const [country, currency] of Object.entries(COUNTRY_CURRENCY_MAP)) {
    if (currency.code === code) {
      countries.push(country);
    }
  }
  return countries;
}
// Alias for easier consumption in components
export const CURRENCY_CONFIG = COUNTRY_CURRENCY_MAP;