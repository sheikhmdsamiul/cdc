import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en";
import bn from "./locales/bn";

const savedLang = localStorage.getItem("cdc-lang") ?? "bn";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      bn: { translation: bn },
    },
    lng: savedLang,
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });

i18n.on("languageChanged", (lng) => {
  localStorage.setItem("cdc-lang", lng);
  document.documentElement.lang = lng;
  document.documentElement.dir = "ltr";
  if (lng === "bn") {
    document.documentElement.classList.add("lang-bn");
  } else {
    document.documentElement.classList.remove("lang-bn");
  }
});

if (savedLang === "bn") {
  document.documentElement.classList.add("lang-bn");
  document.documentElement.lang = "bn";
}

export default i18n;
