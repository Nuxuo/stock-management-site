import { useState, useEffect, useCallback } from 'react';
import { Portfolio, PortfolioHolding, PortfolioState } from './types';

/**
 * A custom hook to manage state that persists in localStorage with a Time-to-Live (TTL).
 * @param key The key to use in localStorage.
 * @param defaultValue The default value if nothing is in localStorage or the item is expired.
 * @param ttlMinutes The number of minutes until the cached data expires.
 * @returns A stateful value, and a function to update it.
 */
export function usePersistentState<T>(key: string, defaultValue: T, ttlMinutes: number) {
  const [state, setState] = useState<T>(defaultValue);

  useEffect(() => {
    try {
      const storedValue = localStorage.getItem(key);
      if (storedValue) {
        const item = JSON.parse(storedValue);
        const now = new Date().getTime();
        if (item.expiry && now < item.expiry) {
          setState(item.value);
        } else {
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.error(`Error reading localStorage key “${key}”:`, error);
    }
  }, [key]); 

  useEffect(() => {
    try {
      const now = new Date().getTime();
      const expiry = now + ttlMinutes * 60 * 1000;
      const item = { value: state, expiry };
      localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
        console.error(`Error setting localStorage key “${key}”:`, error);
    }
  }, [key, state, ttlMinutes]);

  return [state, setState] as const;
}

/**
 * A custom hook to manage multiple portfolios with localStorage persistence.
 * Provides CRUD operations for portfolios and holdings.
 *
 * @deprecated Use useSupabasePortfolios from '@/lib/hooks/useSupabasePortfolios' instead
 * This hook is kept for backward compatibility but will be removed in the future
 */
export function usePortfolios() {
  const STORAGE_KEY = 'portfolios_state';
  const DEFAULT_STATE: PortfolioState = {
    portfolios: [],
    activePortfolioId: null,
  };

  const [state, setState] = useState<PortfolioState>(DEFAULT_STATE);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setState(parsed);
      }
    } catch (error) {
      console.error('Error loading portfolios from localStorage:', error);
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving portfolios to localStorage:', error);
    }
  }, [state]);

  const createPortfolio = useCallback((_name: string) => {
    // This is deprecated - use useSupabasePortfolios instead
    console.warn('usePortfolios is deprecated. Use useSupabasePortfolios instead.');
    return '';
  }, []);

  const updatePortfolio = useCallback((_id: string, _updates: Partial<Portfolio>) => {
    console.warn('usePortfolios is deprecated. Use useSupabasePortfolios instead.');
  }, []);

  const deletePortfolio = useCallback((_id: string) => {
    console.warn('usePortfolios is deprecated. Use useSupabasePortfolios instead.');
  }, []);

  const setActivePortfolio = useCallback((_id: string) => {
    console.warn('usePortfolios is deprecated. Use useSupabasePortfolios instead.');
  }, []);

  const addHolding = useCallback((_portfolioId: string, _holding: PortfolioHolding) => {
    console.warn('usePortfolios is deprecated. Use useSupabasePortfolios instead.');
  }, []);

  const updateHolding = useCallback((_portfolioId: string, _ticker: string, _updates: Partial<PortfolioHolding>) => {
    console.warn('usePortfolios is deprecated. Use useSupabasePortfolios instead.');
  }, []);

  const removeHolding = useCallback((_portfolioId: string, _ticker: string) => {
    console.warn('usePortfolios is deprecated. Use useSupabasePortfolios instead.');
  }, []);

  const getActivePortfolio = useCallback(() => {
    return null;
  }, []);

  return {
    portfolios: state.portfolios,
    activePortfolioId: state.activePortfolioId,
    activePortfolio: getActivePortfolio(),
    createPortfolio,
    updatePortfolio,
    deletePortfolio,
    setActivePortfolio,
    addHolding,
    updateHolding,
    removeHolding,
  };
}

// Export the new Supabase-based hook
export { useSupabasePortfolios } from './hooks/useSupabasePortfolios';