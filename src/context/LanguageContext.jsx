import React, { createContext, useContext, useState, useEffect } from "react";
import { translations } from "./translations";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("app_lang") || "en";
  });

  useEffect(() => {
    localStorage.setItem("app_lang", language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "en" ? "as" : "en"));
  };

  const t = (key) => {
    return translations[language][key] || translations["en"][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
