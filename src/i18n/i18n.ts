import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationsCs from './locales/cs/translation.json';
import translationsEn from './locales/en/translation.json';

i18n
    .use(initReactI18next)
    .init({
        lng: 'cs',
        fallbackLng: 'cs',
        debug: true,
        supportedLngs: ['en', 'cs'],
        interpolation: {
            escapeValue: false,
        },
        resources: {
            cs: { translation: translationsCs },
            en: { translation: translationsEn },
        },
    });

export default i18n;