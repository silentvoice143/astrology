import * as Localization from 'react-native-localize';
import i18next, {Resource} from 'i18next';
import {initReactI18next} from 'react-i18next';
import type {LanguageDetectorAsyncModule} from 'i18next';

// Import your translation files
import en from './src/locales/en.json';
import bn from './src/locales/bn.json';
import hi from './src/locales/hi.json';

// Define the structure of the resources for better typing
const resources: Resource = {
  en: {translation: en},
  bn: {translation: bn},
  hi: {translation: hi},
};

const languageDetector: LanguageDetectorAsyncModule = {
  type: 'languageDetector',
  async: true,
  detect: callback => {
    const bestLanguage = Localization.findBestLanguageTag(
      Object.keys(resources),
    );
    callback(bestLanguage?.languageTag ?? 'en');
  },
  init: () => {},
  cacheUserLanguage: () => {},
};

i18next
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    lng: 'bn',
    compatibilityJSON: 'v4',
    fallbackLng: 'en',
    resources,
    interpolation: {
      escapeValue: false,
    },
    // debug: __DEV__, // Uncomment for development
  });

export default i18next;
