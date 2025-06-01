import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import detector from "i18next-browser-languagedetector";
import en from "app/locales/en.json"
import de from "app/locales/de.json"

const resources = {
    en: {
        translation: en
    },
    de: {
        translation: de
    }
};

i18n
    .use(initReactI18next) // passes i18n down to react-i18next
    .use(detector)
    .init({
        resources,
        supportedLngs: ["en", "de"],
        interpolation: {
            escapeValue: false // react already safes from xss
        }
    });

export function changeLanguage(lng: string) {
    sessionStorage.setItem("i18nextLng", lng);
    i18n.changeLanguage(lng);
}

export default i18n;