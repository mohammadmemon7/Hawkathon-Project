import React, { createContext, useState } from 'react';

export const AppContext = createContext();

export function AppProvider({ children }) {
  const [currentPatient, setCurrentPatient] = useState(null);
  const [currentDoctor, setCurrentDoctor] = useState(null);
  const [language, setLanguage] = useState('hi');

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
