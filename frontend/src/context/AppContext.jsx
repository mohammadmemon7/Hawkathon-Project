import React, { createContext, useEffect, useState } from 'react';

export const AppContext = createContext();

const PATIENT_STORAGE_KEY = 'sehatsetu_patient';

function getStoredPatient() {
  if (typeof window === 'undefined') return null;

  try {
    const rawPatient = window.localStorage.getItem(PATIENT_STORAGE_KEY);
    return rawPatient ? JSON.parse(rawPatient) : null;
  } catch {
    return null;
  }
}

export function AppProvider({ children }) {
  const [patient, setPatientState] = useState(getStoredPatient);
  const [currentDoctor, setCurrentDoctor] = useState(null);
  const [language, setLanguage] = useState('hi');

  const setPatient = (nextPatient) => {
    setPatientState(nextPatient);
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(PATIENT_STORAGE_KEY);
    }
    setPatientState(null);
    setCurrentDoctor(null);
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (patient) {
      window.localStorage.setItem(PATIENT_STORAGE_KEY, JSON.stringify(patient));
    } else {
      window.localStorage.removeItem(PATIENT_STORAGE_KEY);
    }
  }, [patient]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'hi' ? 'en' : 'hi'));
  };

  return (
    <AppContext.Provider
      value={{
        patient,
        setPatient,
        currentPatient: patient,
        setCurrentPatient: setPatient,
        logout,
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
