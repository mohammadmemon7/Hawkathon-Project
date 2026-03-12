import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export function AppProvider({ children }) {
  const [currentPatient, setCurrentPatient] = useState(null);
  const [currentDoctor, setCurrentDoctor] = useState(null);
  const [language, setLanguage] = useState('hi');

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'hi' ? 'en' : 'hi'));
  };

  return (
    <AppContext.Provider
      value={{
        currentPatient,
        setCurrentPatient,
        currentDoctor,
        setCurrentDoctor,
        language,
        toggleLanguage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
