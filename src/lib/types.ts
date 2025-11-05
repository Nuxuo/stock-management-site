// src/lib/types.ts
export type CategorySlug = 'dashboard' | 'analysis' | 'stocks' | 'portfolio';

export interface Category {
  id: string;
  slug: CategorySlug;
  title: string;
  icon: string;
  color: string;
  description: string;
  subCategories: { [key: string]: string };
}

// =============================================
// SUPABASE DATABASE TYPES
// =============================================

// Asset Categories
export interface AssetCategory {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

// Assets
export type AssetType = 'stock' | 'etf' | 'bond' | 'crypto' | 'option' | 'mutual_fund' | 'commodity';

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  asset_category_id: string | null;
  asset_type: AssetType;
  exchange: string | null;
  currency: string;
  sector: string | null;
  industry: string | null;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Portfolios
export interface Portfolio {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  currency: string;
  is_public: boolean;
  benchmark_symbol: string | null;
  created_at: string;
  updated_at: string;
}

// Holdings
export interface Holding {
  id: string;
  portfolio_id: string;
  asset_id: string;
  quantity: number;
  average_cost: number;
  total_cost: number;
  last_updated: string;
  created_at: string;
}

// Transactions
export type TransactionType =
  | 'buy'
  | 'sell'
  | 'dividend'
  | 'split'
  | 'transfer_in'
  | 'transfer_out'
  | 'fee'
  | 'interest';

export interface Transaction {
  id: string;
  portfolio_id: string;
  asset_id: string;
  transaction_type: TransactionType;
  quantity: number;
  price_per_unit: number;
  total_amount: number;
  fees: number;
  transaction_date: string;
  settlement_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Portfolio Snapshots
export interface PortfolioSnapshot {
  id: string;
  portfolio_id: string;
  total_value: number;
  total_cost: number;
  cash_balance: number;
  total_gain_loss: number | null;
  total_gain_loss_pct: number | null;
  snapshot_date: string;
  created_at: string;
}

// Watchlists
export interface Watchlist {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface WatchlistItem {
  id: string;
  watchlist_id: string;
  asset_id: string;
  target_price: number | null;
  notes: string | null;
  created_at: string;
}

// Alerts
export type AlertType =
  | 'price_above'
  | 'price_below'
  | 'price_change_pct'
  | 'volume_spike'
  | 'position_value';

export interface Alert {
  id: string;
  user_id: string;
  asset_id: string | null;
  portfolio_id: string | null;
  alert_type: AlertType;
  condition_value: number;
  is_active: boolean;
  triggered_at: string | null;
  message: string | null;
  created_at: string;
}

// Portfolio Goals
export interface PortfolioGoal {
  id: string;
  portfolio_id: string;
  goal_name: string;
  target_value: number;
  target_date: string | null;
  description: string | null;
  is_achieved: boolean;
  achieved_at: string | null;
  created_at: string;
  updated_at: string;
}

// =============================================
// VIEW TYPES (for joined data from database views)
// =============================================

// From holdings_detail view
export interface HoldingDetail extends Holding {
  asset: Asset;
  portfolio_name: string;
  user_id: string;
}

// From transaction_details view
export interface TransactionDetail extends Transaction {
  asset: Asset;
  portfolio_name: string;
  user_id: string;
}

// From portfolio_summary view
export interface PortfolioSummary {
  id: string;
  name: string;
  user_id: string;
  currency: string;
  is_public: boolean;
  total_positions: number;
  total_cost: number;
  created_at: string;
  updated_at: string;
}

// =============================================
// FRONTEND STATE TYPES
// =============================================

export interface PortfolioState {
  portfolios: Portfolio[];
  activePortfolioId: string | null;
}

// Legacy type for backward compatibility - will be phased out
export interface PortfolioHolding {
  ticker: string;
  name: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
}

// Markets
export interface MarketIndex {
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

export interface SectorPerformance {
  sector: string;
  performance: number;
}

// Analysis
export interface Stock {
    ticker: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    marketCap: number;
    volume: number;
}

// News
export interface NewsArticle {
    id: string;
    title: string;
    source: string;
    publishedAt: string;
    url: string;
    summary: string;
}

// Stock Data from Polygon.io
export interface StockData {
    symbol: string;
    name: string | null;
    regularMarketPrice: number | null;
    regularMarketChange: number | null;
    regularMarketChangePercent: number | null;
    regularMarketDayHigh: number | null;
    regularMarketDayLow: number | null;
    regularMarketVolume: number | null;
    marketCap: number | null;
    regularMarketOpen: number | null;
}