// src/lib/supabase/database.ts
import { createClient } from '@/lib/supabase/client';
import type {
  Portfolio,
  Asset,
  Holding,
  Transaction,
  TransactionType,
  Watchlist,
  WatchlistItem,
  Alert,
  PortfolioGoal,
  PortfolioSnapshot,
  AssetCategory,
} from '@/lib/types';

/**
 * Database service layer for Supabase operations
 * All functions return { data, error } format
 */

// =============================================
// PORTFOLIO OPERATIONS
// =============================================

export async function getPortfolios(userId: string) {
  const supabase = createClient();
  return await supabase
    .from('portfolios')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
}

export async function getPortfolio(portfolioId: string) {
  const supabase = createClient();
  return await supabase
    .from('portfolios')
    .select('*')
    .eq('id', portfolioId)
    .single();
}

export async function createPortfolio(data: {
  user_id: string;
  name: string;
  description?: string;
  currency?: string;
  is_public?: boolean;
  benchmark_symbol?: string;
}) {
  const supabase = createClient();
  return await supabase
    .from('portfolios')
    .insert([data])
    .select()
    .single();
}

export async function updatePortfolio(
  portfolioId: string,
  updates: Partial<Portfolio>
) {
  const supabase = createClient();
  return await supabase
    .from('portfolios')
    .update(updates)
    .eq('id', portfolioId)
    .select()
    .single();
}

export async function deletePortfolio(portfolioId: string) {
  const supabase = createClient();
  return await supabase
    .from('portfolios')
    .delete()
    .eq('id', portfolioId);
}

// =============================================
// ASSET OPERATIONS
// =============================================

export async function getAssets(options?: {
  symbols?: string[];
  assetType?: string;
  isActive?: boolean;
  limit?: number;
}) {
  const supabase = createClient();
  let query = supabase.from('assets').select('*');

  if (options?.symbols && options.symbols.length > 0) {
    query = query.in('symbol', options.symbols);
  }

  if (options?.assetType) {
    query = query.eq('asset_type', options.assetType);
  }

  if (options?.isActive !== undefined) {
    query = query.eq('is_active', options.isActive);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  return await query.order('symbol', { ascending: true });
}

export async function getAssetBySymbol(symbol: string) {
  const supabase = createClient();
  return await supabase
    .from('assets')
    .select('*')
    .eq('symbol', symbol.toUpperCase())
    .single();
}

export async function createAsset(data: {
  symbol: string;
  name: string;
  asset_type: string;
  exchange?: string;
  currency?: string;
  sector?: string;
  industry?: string;
  description?: string;
  asset_category_id?: string;
}) {
  const supabase = createClient();
  return await supabase
    .from('assets')
    .insert([{ ...data, symbol: data.symbol.toUpperCase() }])
    .select()
    .single();
}

export async function upsertAsset(data: {
  symbol: string;
  name: string;
  asset_type: string;
  exchange?: string;
  currency?: string;
  sector?: string;
  industry?: string;
  description?: string;
}) {
  const supabase = createClient();
  return await supabase
    .from('assets')
    .upsert([{ ...data, symbol: data.symbol.toUpperCase() }], {
      onConflict: 'symbol',
    })
    .select()
    .single();
}

// =============================================
// HOLDINGS OPERATIONS
// =============================================

export async function getHoldings(portfolioId: string) {
  const supabase = createClient();
  return await supabase
    .from('holdings')
    .select(`
      *,
      asset:assets(*)
    `)
    .eq('portfolio_id', portfolioId)
    .gt('quantity', 0)
    .order('created_at', { ascending: false });
}

export async function getHolding(portfolioId: string, assetId: string) {
  const supabase = createClient();
  return await supabase
    .from('holdings')
    .select('*')
    .eq('portfolio_id', portfolioId)
    .eq('asset_id', assetId)
    .single();
}

// Holdings are automatically managed by database triggers
// when transactions are created, but we provide these for manual adjustments

export async function updateHolding(
  holdingId: string,
  updates: Partial<Holding>
) {
  const supabase = createClient();
  return await supabase
    .from('holdings')
    .update(updates)
    .eq('id', holdingId)
    .select()
    .single();
}

export async function deleteHolding(holdingId: string) {
  const supabase = createClient();
  return await supabase
    .from('holdings')
    .delete()
    .eq('id', holdingId);
}

// =============================================
// TRANSACTION OPERATIONS
// =============================================

export async function getTransactions(portfolioId: string, options?: {
  limit?: number;
  assetId?: string;
  transactionType?: TransactionType;
}) {
  const supabase = createClient();
  let query = supabase
    .from('transactions')
    .select(`
      *,
      asset:assets(*)
    `)
    .eq('portfolio_id', portfolioId);

  if (options?.assetId) {
    query = query.eq('asset_id', options.assetId);
  }

  if (options?.transactionType) {
    query = query.eq('transaction_type', options.transactionType);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  return await query.order('transaction_date', { ascending: false });
}

export async function createTransaction(data: {
  portfolio_id: string;
  asset_id: string;
  transaction_type: TransactionType;
  quantity: number;
  price_per_unit: number;
  total_amount: number;
  fees?: number;
  transaction_date: string;
  settlement_date?: string;
  notes?: string;
}) {
  const supabase = createClient();
  return await supabase
    .from('transactions')
    .insert([data])
    .select()
    .single();
}

export async function updateTransaction(
  transactionId: string,
  updates: Partial<Transaction>
) {
  const supabase = createClient();
  return await supabase
    .from('transactions')
    .update(updates)
    .eq('id', transactionId)
    .select()
    .single();
}

export async function deleteTransaction(transactionId: string) {
  const supabase = createClient();
  return await supabase
    .from('transactions')
    .delete()
    .eq('id', transactionId);
}

// =============================================
// PORTFOLIO SNAPSHOTS
// =============================================

export async function getPortfolioSnapshots(
  portfolioId: string,
  options?: { limit?: number; startDate?: string; endDate?: string }
) {
  const supabase = createClient();
  let query = supabase
    .from('portfolio_snapshots')
    .select('*')
    .eq('portfolio_id', portfolioId);

  if (options?.startDate) {
    query = query.gte('snapshot_date', options.startDate);
  }

  if (options?.endDate) {
    query = query.lte('snapshot_date', options.endDate);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  return await query.order('snapshot_date', { ascending: false });
}

export async function createPortfolioSnapshot(data: {
  portfolio_id: string;
  total_value: number;
  total_cost: number;
  cash_balance?: number;
  total_gain_loss?: number;
  total_gain_loss_pct?: number;
  snapshot_date: string;
}) {
  const supabase = createClient();
  return await supabase
    .from('portfolio_snapshots')
    .insert([data])
    .select()
    .single();
}

// =============================================
// WATCHLIST OPERATIONS
// =============================================

export async function getWatchlists(userId: string) {
  const supabase = createClient();
  return await supabase
    .from('watchlists')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
}

export async function getWatchlistItems(watchlistId: string) {
  const supabase = createClient();
  return await supabase
    .from('watchlist_items')
    .select(`
      *,
      asset:assets(*)
    `)
    .eq('watchlist_id', watchlistId)
    .order('created_at', { ascending: false });
}

export async function createWatchlist(data: {
  user_id: string;
  name: string;
  description?: string;
}) {
  const supabase = createClient();
  return await supabase
    .from('watchlists')
    .insert([data])
    .select()
    .single();
}

export async function addToWatchlist(data: {
  watchlist_id: string;
  asset_id: string;
  target_price?: number;
  notes?: string;
}) {
  const supabase = createClient();
  return await supabase
    .from('watchlist_items')
    .insert([data])
    .select()
    .single();
}

export async function removeFromWatchlist(watchlistItemId: string) {
  const supabase = createClient();
  return await supabase
    .from('watchlist_items')
    .delete()
    .eq('id', watchlistItemId);
}

export async function deleteWatchlist(watchlistId: string) {
  const supabase = createClient();
  return await supabase
    .from('watchlists')
    .delete()
    .eq('id', watchlistId);
}

// =============================================
// ALERT OPERATIONS
// =============================================

export async function getAlerts(userId: string, options?: {
  isActive?: boolean;
  portfolioId?: string;
}) {
  const supabase = createClient();
  let query = supabase
    .from('alerts')
    .select('*')
    .eq('user_id', userId);

  if (options?.isActive !== undefined) {
    query = query.eq('is_active', options.isActive);
  }

  if (options?.portfolioId) {
    query = query.eq('portfolio_id', options.portfolioId);
  }

  return await query.order('created_at', { ascending: false });
}

export async function createAlert(data: {
  user_id: string;
  asset_id?: string;
  portfolio_id?: string;
  alert_type: string;
  condition_value: number;
  message?: string;
}) {
  const supabase = createClient();
  return await supabase
    .from('alerts')
    .insert([data])
    .select()
    .single();
}

export async function updateAlert(alertId: string, updates: Partial<Alert>) {
  const supabase = createClient();
  return await supabase
    .from('alerts')
    .update(updates)
    .eq('id', alertId)
    .select()
    .single();
}

export async function deleteAlert(alertId: string) {
  const supabase = createClient();
  return await supabase
    .from('alerts')
    .delete()
    .eq('id', alertId);
}

// =============================================
// PORTFOLIO GOALS
// =============================================

export async function getPortfolioGoals(portfolioId: string) {
  const supabase = createClient();
  return await supabase
    .from('portfolio_goals')
    .select('*')
    .eq('portfolio_id', portfolioId)
    .order('created_at', { ascending: false });
}

export async function createPortfolioGoal(data: {
  portfolio_id: string;
  goal_name: string;
  target_value: number;
  target_date?: string;
  description?: string;
}) {
  const supabase = createClient();
  return await supabase
    .from('portfolio_goals')
    .insert([data])
    .select()
    .single();
}

export async function updatePortfolioGoal(
  goalId: string,
  updates: Partial<PortfolioGoal>
) {
  const supabase = createClient();
  return await supabase
    .from('portfolio_goals')
    .update(updates)
    .eq('id', goalId)
    .select()
    .single();
}

export async function deletePortfolioGoal(goalId: string) {
  const supabase = createClient();
  return await supabase
    .from('portfolio_goals')
    .delete()
    .eq('id', goalId);
}

// =============================================
// ASSET CATEGORIES
// =============================================

export async function getAssetCategories() {
  const supabase = createClient();
  return await supabase
    .from('asset_categories')
    .select('*')
    .order('name', { ascending: true });
}

// =============================================
// HELPER FUNCTIONS
// =============================================

/**
 * Get or create an asset by symbol
 * If the asset doesn't exist, creates it with minimal information
 */
export async function getOrCreateAsset(
  symbol: string,
  name?: string,
  assetType: string = 'stock'
) {
  // First try to get the asset
  const { data: existingAsset } = await getAssetBySymbol(symbol);

  if (existingAsset) {
    return { data: existingAsset, error: null };
  }

  // If it doesn't exist, create it
  return await createAsset({
    symbol: symbol.toUpperCase(),
    name: name || symbol.toUpperCase(),
    asset_type: assetType,
    currency: 'USD',
  });
}

/**
 * Execute a buy transaction with automatic asset creation
 */
export async function executeBuyTransaction(data: {
  portfolio_id: string;
  symbol: string;
  asset_name?: string;
  quantity: number;
  price_per_unit: number;
  fees?: number;
  transaction_date?: string;
  notes?: string;
}) {
  // Get or create the asset
  const { data: asset, error: assetError } = await getOrCreateAsset(
    data.symbol,
    data.asset_name
  );

  if (assetError || !asset) {
    return { data: null, error: assetError || new Error('Failed to get or create asset') };
  }

  // Calculate total amount
  const totalAmount = data.quantity * data.price_per_unit;

  // Create the transaction
  return await createTransaction({
    portfolio_id: data.portfolio_id,
    asset_id: asset.id,
    transaction_type: 'buy',
    quantity: data.quantity,
    price_per_unit: data.price_per_unit,
    total_amount: totalAmount,
    fees: data.fees || 0,
    transaction_date: data.transaction_date || new Date().toISOString(),
    notes: data.notes,
  });
}

/**
 * Execute a sell transaction
 */
export async function executeSellTransaction(data: {
  portfolio_id: string;
  asset_id: string;
  quantity: number;
  price_per_unit: number;
  fees?: number;
  transaction_date?: string;
  notes?: string;
}) {
  const totalAmount = data.quantity * data.price_per_unit;

  return await createTransaction({
    portfolio_id: data.portfolio_id,
    asset_id: data.asset_id,
    transaction_type: 'sell',
    quantity: data.quantity,
    price_per_unit: data.price_per_unit,
    total_amount: totalAmount,
    fees: data.fees || 0,
    transaction_date: data.transaction_date || new Date().toISOString(),
    notes: data.notes,
  });
}

/**
 * Get portfolio summary with current value calculations
 */
export async function getPortfolioSummary(portfolioId: string) {
  const supabase = createClient();

  // Get portfolio details
  const { data: portfolio, error: portfolioError } = await getPortfolio(portfolioId);
  if (portfolioError || !portfolio) {
    return { data: null, error: portfolioError };
  }

  // Get all holdings with assets
  const { data: holdings, error: holdingsError } = await getHoldings(portfolioId);
  if (holdingsError) {
    return { data: null, error: holdingsError };
  }

  // Calculate summary
  const totalCost = holdings?.reduce((sum, h) => sum + h.total_cost, 0) || 0;
  const totalPositions = holdings?.length || 0;

  return {
    data: {
      ...portfolio,
      total_positions: totalPositions,
      total_cost: totalCost,
      holdings: holdings || [],
    },
    error: null,
  };
}
