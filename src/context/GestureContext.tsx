import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface GestureContextType {
  recognizedText: string;
  marathiText: string;
  lastRecognizedLetter: string;
  confidence: number;
  isTranslating: boolean;
  isConnected: boolean;
  connectionStatus: string;
  addLetter: (letter: string) => void;
  clearText: () => void;
  translateText: () => void;
}

const GestureContext = createContext<GestureContextType | undefined>(undefined);

export const useGesture = () => {
  const context = useContext(GestureContext);
  if (!context) {
    throw new Error('useGesture must be used within a GestureProvider');
  }
  return context;
};

interface GestureProviderProps {
  children: React.ReactNode;
}

export const GestureProvider: React.FC<GestureProviderProps> = ({ children }) => {
  const [recognizedText, setRecognizedText] = useState('');
  const [marathiText, setMarathiText] = useState('');
  const [lastRecognizedLetter, setLastRecognizedLetter] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Checking connection...');

  // Check backend connection
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch('http://localhost:5000/health');
        if (response.ok) {
          setIsConnected(true);
          setConnectionStatus('Connected');
        } else {
          setIsConnected(false);
          setConnectionStatus('Backend unavailable');
        }
      } catch (error) {
        setIsConnected(false);
        setConnectionStatus('Backend offline');
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const addLetter = useCallback((letter: string) => {
    if (letter && letter !== lastRecognizedLetter) {
      setRecognizedText(prev => prev + letter);
      setLastRecognizedLetter(letter);
      setConfidence(0.85); // Mock confidence for demo
    }
  }, [lastRecognizedLetter]);

  const clearText = useCallback(() => {
    setRecognizedText('');
    setMarathiText('');
    setLastRecognizedLetter('');
    setConfidence(0);
  }, []);

  const translateText = useCallback(async () => {
    if (!recognizedText.trim() || isTranslating) return;

    setIsTranslating(true);
    try {
      const response = await fetch('http://localhost:5000/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: recognizedText }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setMarathiText(result.marathi);
        }
      }
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      setIsTranslating(false);
    }
  }, [recognizedText, isTranslating]);

  const value: GestureContextType = {
    recognizedText,
    marathiText,
    lastRecognizedLetter,
    confidence,
    isTranslating,
    isConnected,
    connectionStatus,
    addLetter,
    clearText,
    translateText,
  };

  return (
    <GestureContext.Provider value={value}>
      {children}
    </GestureContext.Provider>
  );
};