import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

import translationsCs from './locales/cs/translation.json';
import translationsEn from './locales/en/translation.json';

i18n
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: 'en',
        debug: true,
        supportedLngs: ['en', 'cs'],
        interpolation: {
            escapeValue: false,
        },
        resources: {
            en: { translation: translationsEn },
            cs: { translation: translationsCs },
          },
    });

export default i18n;