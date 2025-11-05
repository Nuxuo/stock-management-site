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

// Dashboard
export interface PortfolioHolding {
  ticker: string;
  name: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
}

export interface Portfolio {
  id: string;
  name: string;
  createdAt: string;
  holdings: PortfolioHolding[];
}

export interface PortfolioState {
  portfolios: Portfolio[];
  activePortfolioId: string | null;
}

export interface WatchlistItem {
  ticker: string;
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
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