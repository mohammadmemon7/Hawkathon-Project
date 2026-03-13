import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export function AppProvider({ children }) {
  const [currentPatient, setCurrentPatient] = useState(() => {
    try {
      const saved = localStorage.getItem('patient');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [currentDoctor, setCurrentDoctor] = useState(null);
  const [language, setLanguage] = useState('hi');

  useEffect(() => {
    if (currentPatient) {
      localStorage.setItem('patient', JSON.stringify(currentPatient));
    } else {
      localStorage.removeItem('patient');
    }
  }, [currentPatient]);

  const logout = () => {
    setCurrentPatient(null);
    localStorage.removeItem('patient');
  };

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
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
