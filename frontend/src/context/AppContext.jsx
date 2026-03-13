import React, { createContext, useEffect, useState } from 'react';

export const AppContext = createContext();

const PATIENT_STORAGE_KEY = 'sehatsetu_patient';
const DOCTOR_STORAGE_KEY = 'sehatsetu_doctor';
const LANG_STORAGE_KEY = 'sehatsetu_lang';

function getStoredValue(key) {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AppProvider({ children }) {
  const [patient, setPatientState] = useState(() => getStoredValue(PATIENT_STORAGE_KEY) || getStoredValue('patient'));
  const [currentDoctor, setCurrentDoctorState] = useState(() => getStoredValue(DOCTOR_STORAGE_KEY));
  const [language, setLanguage] = useState(() => window.localStorage.getItem(LANG_STORAGE_KEY) || 'hi');
  const [lastAnalysis, setLastAnalysis] = useState(() => getStoredValue('sehatsetu_last_analysis'));
  const [lowBw, setLowBw] = useState(() => window.localStorage.getItem('sehatsetu_lowbw') === '1');
  const [selectedDoctor, setSelectedDoctor] = useState(() => {
    if (typeof window === 'undefined') return null;
    const raw = window.sessionStorage.getItem('sehatsetu_selected_doctor');
    return raw ? JSON.parse(raw) : null;
  });

  const setPatient = (nextPatient) => {
    setPatientState(nextPatient);
  };

  const setCurrentDoctor = (nextDoctor) => {
    setCurrentDoctorState(nextDoctor);
  };

  const logoutPatient = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(PATIENT_STORAGE_KEY);
      window.localStorage.removeItem('patient');
    }
    setPatientState(null);
  };

  const logoutDoctor = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(DOCTOR_STORAGE_KEY);
    }
    setCurrentDoctorState(null);
  };

  // Deprecated global logout for backward compatibility
  const logout = () => {
    logoutPatient();
    logoutDoctor();
  };

  useEffect(() => {
    if (document.documentElement) {
      document.documentElement.lang = language;
    }
    window.localStorage.setItem(LANG_STORAGE_KEY, language);
  }, [language]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (patient) {
      window.localStorage.setItem(PATIENT_STORAGE_KEY, JSON.stringify(patient));
      window.localStorage.setItem('patient', JSON.stringify(patient));
    } else {
      window.localStorage.removeItem(PATIENT_STORAGE_KEY);
      window.localStorage.removeItem('patient');
    }
  }, [patient]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (currentDoctor) {
      window.localStorage.setItem(DOCTOR_STORAGE_KEY, JSON.stringify(currentDoctor));
    } else {
      window.localStorage.removeItem(DOCTOR_STORAGE_KEY);
    }
  }, [currentDoctor]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (lastAnalysis) {
      window.localStorage.setItem('sehatsetu_last_analysis', JSON.stringify(lastAnalysis));
    }
  }, [lastAnalysis]);

  useEffect(() => {
    window.localStorage.setItem('sehatsetu_lowbw', lowBw ? '1' : '0');
    if (lowBw) {
      document.body.classList.add('low-bandwidth');
    } else {
      document.body.classList.remove('low-bandwidth');
    }
  }, [lowBw]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (selectedDoctor) {
      window.sessionStorage.setItem('sehatsetu_selected_doctor', JSON.stringify(selectedDoctor));
    } else {
      window.sessionStorage.removeItem('sehatsetu_selected_doctor');
    }
  }, [selectedDoctor]);

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
        currentDoctor,
        setCurrentDoctor,
        logoutPatient,
        logoutDoctor,
        logout,
        language,
        toggleLanguage,
        lastAnalysis,
        setLastAnalysis,
        lowBw,
        toggleLowBw: () => setLowBw(prev => !prev),
        selectedDoctor,
        setSelectedDoctor
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
