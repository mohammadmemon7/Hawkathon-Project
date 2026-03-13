/**
 * useT() — Centralized i18n hook for SehatSetu
 *
 * Usage:
 *   const t = useT();
 *   t('loginTitle')              // → "Login by phone number" (en) / "फोन नंबर से लॉगिन करें" (hi)
 *   t('greetingPrefix') + name   // composition
 *   t('welcome', { name: 'Ali' }) // → "Namaste, Ali" with interpolation
 */
import { useContext, useCallback } from 'react';
import { AppContext } from '../context/AppContext';
import translations from './translations';

export default function useT() {
  const { language } = useContext(AppContext);

  const t = useCallback(
    (key, params) => {
      const langDict = translations[language] || translations.en;
      const fallback = translations.en;

      let str = langDict[key] ?? fallback[key] ?? key;

      // Simple {{param}} / {param} interpolation
      if (params && typeof params === 'object') {
        str = str.replace(/\{\{?(\w+)\}?\}/g, (_, k) =>
          params[k] !== undefined ? String(params[k]) : `{${k}}`
        );
      }

      return str;
    },
    [language]
  );

  return t;
}
