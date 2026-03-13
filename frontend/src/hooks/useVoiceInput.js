import { useState, useRef, useCallback, useEffect } from 'react';

const SpeechRecognition = typeof window !== 'undefined'
  ? window.SpeechRecognition || window.webkitSpeechRecognition
  : null;

export default function useVoiceInput({ language = 'hi' } = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const isSupported = !!SpeechRecognition;
  const recognitionRef = useRef(null);

  const startListening = useCallback(() => {
    if (!SpeechRecognition) {
      setError('Voice input is not supported in this browser');
      return;
    }

    // stop any existing instance
    if (recognitionRef.current) {
        recognitionRef.current.stop();
    }

    setTranscript('');
    const recognition = new SpeechRecognition();
    const langMap = { hi: 'hi-IN', en: 'en-IN', pa: 'pa-IN' };
    recognition.lang = langMap[language] || 'hi-IN';
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          final += result[0].transcript + ' ';
        } else {
          interim += result[0].transcript;
        }
      }
      setTranscript(final + interim);
    };

    recognition.onerror = (event) => {
      // Ignore 'aborted' as it happens on manual stop or language switch
      if (event.error !== 'aborted') {
          setError(event.error);
          setIsListening(false);
      }
    };

    recognition.onend = () => {
      // Don't set isListening to false here because if we are restarting 
      // due to language change, we want to keep the state logically "listening"
      // However, for typical manual stops, it will be handled by stopListening
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    setError(null);
  }, [language]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  // Handle language changes while listening
  useEffect(() => {
    if (isListening) {
        startListening();
    }
  }, [language, isListening, startListening]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return { isListening, transcript, isSupported, error, startListening, stopListening, setTranscript };
}
