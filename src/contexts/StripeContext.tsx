'use client';

import { createContext, useContext, useState, useEffect, ReactNode, Dispatch, SetStateAction } from 'react';

interface StripeContextType {
  apiKey: string | null;
  setApiKey: Dispatch<SetStateAction<string | null>>;
  isLoading: boolean;
}

const StripeContext = createContext<StripeContextType | undefined>(undefined);

export const StripeProvider = ({ children }: { children: ReactNode }) => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedKey = localStorage.getItem('stripe_api_key');
      if (storedKey) {
        setApiKey(storedKey);
      }
    } catch (error) {
      console.error('Failed to read from localStorage', error);
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    try {
      if (apiKey) {
        localStorage.setItem('stripe_api_key', apiKey);
      } else {
        localStorage.removeItem('stripe_api_key');
      }
    } catch (error) {
      console.error('Failed to write to localStorage', error);
    }
  }, [apiKey]);

  const value = { apiKey, setApiKey, isLoading };

  return (
    <StripeContext.Provider value={value}>
      {children}
    </StripeContext.Provider>
  );
};

export const useStripeApiKey = () => {
  const context = useContext(StripeContext);
  if (context === undefined) {
    throw new Error('useStripeApiKey must be used within a StripeProvider');
  }
  return context;
};
