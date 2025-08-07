import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';

// Import translation files
import en from './en.json';
import he from './he.json';

// Detect the device language. If the device language is Hebrew, we'll use 'he', otherwise 'en'.
// const locales = RNLocalize.getLocales();
// const deviceLanguage =
//   locales && locales.length > 0 ? locales[0].languageCode : 'en';
const deviceLanguage = 'he'; //test purposes only

// IMPORTANT: Removed RTL forcing from here - it's now handled in App.js
// This prevents the drawer initialization race condition

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v4', // Using 'v4' for compatibility as required by the type definitions
    resources: {
      en: { translation: en },
      he: { translation: he },
    },
    lng: deviceLanguage, // Set language directly
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  })
  .catch(err => console.error('i18next initialization failed:', err));

export default i18n;
