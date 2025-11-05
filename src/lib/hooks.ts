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
 */
export function usePortfolios() {
  const STORAGE_KEY = 'portfolios_state';
  const DEFAULT_STATE: PortfolioState = {
    portfolios: [
      {
        id: 'default',
        name: 'Main Portfolio',
        createdAt: new Date().toISOString(),
        holdings: [
          {
            ticker: 'AAPL',
            name: 'Apple Inc.',
            shares: 50,
            avgPrice: 150.25,
            currentPrice: 182.50,
          },
          {
            ticker: 'MSFT',
            name: 'Microsoft Corporation',
            shares: 30,
            avgPrice: 280.00,
            currentPrice: 378.85,
          },
          {
            ticker: 'GOOGL',
            name: 'Alphabet Inc.',
            shares: 20,
            avgPrice: 120.50,
            currentPrice: 138.25,
          },
          {
            ticker: 'NVDA',
            name: 'NVIDIA Corporation',
            shares: 15,
            avgPrice: 450.00,
            currentPrice: 875.50,
          },
        ],
      },
    ],
    activePortfolioId: 'default',
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

  const createPortfolio = useCallback((name: string) => {
    const newPortfolio: Portfolio = {
      id: `portfolio_${Date.now()}`,
      name,
      createdAt: new Date().toISOString(),
      holdings: [],
    };
    setState((prev) => ({
      ...prev,
      portfolios: [...prev.portfolios, newPortfolio],
    }));
    return newPortfolio.id;
  }, []);

  const updatePortfolio = useCallback((id: string, updates: Partial<Omit<Portfolio, 'id' | 'createdAt'>>) => {
    setState((prev) => ({
      ...prev,
      portfolios: prev.portfolios.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    }));
  }, []);

  const deletePortfolio = useCallback((id: string) => {
    setState((prev) => {
      const newPortfolios = prev.portfolios.filter((p) => p.id !== id);
      const newActiveId =
        prev.activePortfolioId === id
          ? newPortfolios[0]?.id || null
          : prev.activePortfolioId;
      return {
        portfolios: newPortfolios,
        activePortfolioId: newActiveId,
      };
    });
  }, []);

  const setActivePortfolio = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      activePortfolioId: id,
    }));
  }, []);

  const addHolding = useCallback((portfolioId: string, holding: PortfolioHolding) => {
    setState((prev) => ({
      ...prev,
      portfolios: prev.portfolios.map((p) =>
        p.id === portfolioId
          ? { ...p, holdings: [...p.holdings, holding] }
          : p
      ),
    }));
  }, []);

  const updateHolding = useCallback((portfolioId: string, ticker: string, updates: Partial<PortfolioHolding>) => {
    setState((prev) => ({
      ...prev,
      portfolios: prev.portfolios.map((p) =>
        p.id === portfolioId
          ? {
              ...p,
              holdings: p.holdings.map((h) =>
                h.ticker === ticker ? { ...h, ...updates } : h
              ),
            }
          : p
      ),
    }));
  }, []);

  const removeHolding = useCallback((portfolioId: string, ticker: string) => {
    setState((prev) => ({
      ...prev,
      portfolios: prev.portfolios.map((p) =>
        p.id === portfolioId
          ? { ...p, holdings: p.holdings.filter((h) => h.ticker !== ticker) }
          : p
      ),
    }));
  }, []);

  const getActivePortfolio = useCallback(() => {
    return state.portfolios.find((p) => p.id === state.activePortfolioId) || null;
  }, [state]);

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