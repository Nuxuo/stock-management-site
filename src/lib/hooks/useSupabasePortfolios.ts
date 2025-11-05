// src/lib/hooks/useSupabasePortfolios.ts
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  getPortfolios,
  getHoldings,
  createPortfolio as createPortfolioDB,
  updatePortfolio as updatePortfolioDB,
  deletePortfolio as deletePortfolioDB,
  executeBuyTransaction,
  executeSellTransaction,
} from '@/lib/supabase/database';
import type { Portfolio, Holding, Asset } from '@/lib/types';

/**
 * Extended Portfolio type with holdings included
 */
export interface PortfolioWithHoldings extends Portfolio {
  holdings: Array<Holding & { asset: Asset }>;
}

/**
 * Custom hook to manage portfolios with Supabase backend
 * Provides CRUD operations for portfolios and holdings
 */
export function useSupabasePortfolios() {
  const { user } = useAuth();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [activePortfolioId, setActivePortfolioId] = useState<string | null>(null);
  const [holdings, setHoldings] = useState<Array<Holding & { asset: Asset }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load portfolios from Supabase
  const loadPortfolios = useCallback(async () => {
    if (!user) {
      setPortfolios([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await getPortfolios(user.id);

      if (error) throw error;

      setPortfolios(data || []);

      // Set active portfolio to first one if none selected
      if (data && data.length > 0 && !activePortfolioId) {
        setActivePortfolioId(data[0].id);
      }
    } catch (err) {
      console.error('Error loading portfolios:', err);
      setError(err instanceof Error ? err.message : 'Failed to load portfolios');
    } finally {
      setLoading(false);
    }
  }, [user, activePortfolioId]);

  // Load holdings for active portfolio
  const loadHoldings = useCallback(async () => {
    if (!activePortfolioId) {
      setHoldings([]);
      return;
    }

    try {
      const { data, error } = await getHoldings(activePortfolioId);

      if (error) throw error;

      setHoldings(data || []);
    } catch (err) {
      console.error('Error loading holdings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load holdings');
    }
  }, [activePortfolioId]);

  // Initial load
  useEffect(() => {
    loadPortfolios();
  }, [loadPortfolios]);

  // Load holdings when active portfolio changes
  useEffect(() => {
    loadHoldings();
  }, [loadHoldings]);

  // Create a new portfolio
  const createPortfolio = useCallback(
    async (name: string, description?: string, currency: string = 'USD') => {
      if (!user) {
        throw new Error('User must be logged in to create a portfolio');
      }

      try {
        const { data, error } = await createPortfolioDB({
          user_id: user.id,
          name,
          description,
          currency,
        });

        if (error) throw error;

        if (data) {
          setPortfolios((prev) => [data, ...prev]);
          setActivePortfolioId(data.id);
          return data.id;
        }
      } catch (err) {
        console.error('Error creating portfolio:', err);
        setError(err instanceof Error ? err.message : 'Failed to create portfolio');
        throw err;
      }
    },
    [user]
  );

  // Update a portfolio
  const updatePortfolio = useCallback(
    async (id: string, updates: Partial<Portfolio>) => {
      try {
        const { data, error } = await updatePortfolioDB(id, updates);

        if (error) throw error;

        if (data) {
          setPortfolios((prev) =>
            prev.map((p) => (p.id === id ? data : p))
          );
        }
      } catch (err) {
        console.error('Error updating portfolio:', err);
        setError(err instanceof Error ? err.message : 'Failed to update portfolio');
        throw err;
      }
    },
    []
  );

  // Delete a portfolio
  const deletePortfolio = useCallback(
    async (id: string) => {
      try {
        const { error } = await deletePortfolioDB(id);

        if (error) throw error;

        setPortfolios((prev) => {
          const newPortfolios = prev.filter((p) => p.id !== id);
          // If deleting active portfolio, switch to first available
          if (activePortfolioId === id) {
            setActivePortfolioId(newPortfolios[0]?.id || null);
          }
          return newPortfolios;
        });
      } catch (err) {
        console.error('Error deleting portfolio:', err);
        setError(err instanceof Error ? err.message : 'Failed to delete portfolio');
        throw err;
      }
    },
    [activePortfolioId]
  );

  // Set active portfolio
  const setActivePortfolio = useCallback((id: string) => {
    setActivePortfolioId(id);
  }, []);

  // Add a holding (via buy transaction)
  const addHolding = useCallback(
    async (data: {
      symbol: string;
      name: string;
      shares: number;
      price: number;
      fees?: number;
      notes?: string;
    }) => {
      if (!activePortfolioId) {
        throw new Error('No active portfolio selected');
      }

      try {
        const { data: transaction, error } = await executeBuyTransaction({
          portfolio_id: activePortfolioId,
          symbol: data.symbol,
          asset_name: data.name,
          quantity: data.shares,
          price_per_unit: data.price,
          fees: data.fees,
          notes: data.notes,
        });

        if (error) throw error;

        // Reload holdings to reflect the transaction
        await loadHoldings();

        return transaction;
      } catch (err) {
        console.error('Error adding holding:', err);
        setError(err instanceof Error ? err.message : 'Failed to add holding');
        throw err;
      }
    },
    [activePortfolioId, loadHoldings]
  );

  // Update a holding (via transaction)
  const updateHolding = useCallback(
    async (data: {
      asset_id: string;
      shares: number;
      price: number;
      fees?: number;
      notes?: string;
    }) => {
      if (!activePortfolioId) {
        throw new Error('No active portfolio selected');
      }

      try {
        // Execute buy transaction to add more shares
        const { data: transaction, error } = await executeBuyTransaction({
          portfolio_id: activePortfolioId,
          symbol: '', // Will be looked up by asset_id
          quantity: data.shares,
          price_per_unit: data.price,
          fees: data.fees,
          notes: data.notes,
        });

        if (error) throw error;

        // Reload holdings
        await loadHoldings();

        return transaction;
      } catch (err) {
        console.error('Error updating holding:', err);
        setError(err instanceof Error ? err.message : 'Failed to update holding');
        throw err;
      }
    },
    [activePortfolioId, loadHoldings]
  );

  // Remove a holding (via sell transaction)
  const removeHolding = useCallback(
    async (data: {
      asset_id: string;
      shares: number;
      price: number;
      fees?: number;
      notes?: string;
    }) => {
      if (!activePortfolioId) {
        throw new Error('No active portfolio selected');
      }

      try {
        const { data: transaction, error } = await executeSellTransaction({
          portfolio_id: activePortfolioId,
          asset_id: data.asset_id,
          quantity: data.shares,
          price_per_unit: data.price,
          fees: data.fees,
          notes: data.notes,
        });

        if (error) throw error;

        // Reload holdings
        await loadHoldings();

        return transaction;
      } catch (err) {
        console.error('Error removing holding:', err);
        setError(err instanceof Error ? err.message : 'Failed to remove holding');
        throw err;
      }
    },
    [activePortfolioId, loadHoldings]
  );

  // Get active portfolio
  const getActivePortfolio = useCallback((): Portfolio | null => {
    return portfolios.find((p) => p.id === activePortfolioId) || null;
  }, [portfolios, activePortfolioId]);

  // Get active portfolio with holdings
  const getActivePortfolioWithHoldings = useCallback((): PortfolioWithHoldings | null => {
    const portfolio = getActivePortfolio();
    if (!portfolio) return null;

    return {
      ...portfolio,
      holdings,
    };
  }, [getActivePortfolio, holdings]);

  // Refresh all data
  const refresh = useCallback(async () => {
    await loadPortfolios();
    await loadHoldings();
  }, [loadPortfolios, loadHoldings]);

  return {
    // State
    portfolios,
    activePortfolioId,
    activePortfolio: getActivePortfolio(),
    activePortfolioWithHoldings: getActivePortfolioWithHoldings(),
    holdings,
    loading,
    error,

    // Actions
    createPortfolio,
    updatePortfolio,
    deletePortfolio,
    setActivePortfolio,
    addHolding,
    updateHolding,
    removeHolding,
    refresh,
  };
}
