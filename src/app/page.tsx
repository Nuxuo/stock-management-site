// src/app/page.tsx
"use client"

import React, { useState, useEffect } from 'react';
import { Category, CategorySlug } from '@/lib/types';
import { usePersistentState } from '@/lib/hooks';
import { Separator } from "@/components/ui/separator";
import { iconMap } from '@/lib/icons';
import { CategorySelector } from '@/components/data_viz/CategorySelector';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import all the tab components
import DashboardTab from '@/components/data_viz/tabs/DashboardTab';
import MarketsTab from '@/components/data_viz/tabs/MarketsTab';
import AnalysisTab from '@/components/data_viz/tabs/AnalysisTab';
import NewsTab from '@/components/data_viz/tabs/NewsTab';
import StocksTab from '@/components/data_viz/tabs/StockTab';
import ClimateTab from '@/components/data_viz/tabs/ClimateTab';

const CACHE_TTL_MINUTES = 15;

export default function Home() {
  const [categories, setCategories] = usePersistentState<Category[]>('categories_cache_stocks', [], CACHE_TTL_MINUTES);
  const [activeCategory, setActiveCategory] = useState<CategorySlug>('dashboard');
  const [activeSubCategory, setActiveSubCategory] = useState<string>('overview');

  const [loading, setLoading] = useState({ categories: true });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const staticCategories: Category[] = [
      { id: '1', slug: 'dashboard', title: 'Dashboard', icon: 'Home', color: '#3b82f6', description: 'Your personal stock overview.', subCategories: { overview: "Overview", portfolio: "Portfolio", watchlist: "Watchlist" } },
      { id: '2', slug: 'markets', title: 'Markets', icon: 'Globe', color: '#22c55e', description: "Get a pulse on the market.", subCategories: { overview: "Overview", indices: "Indices", sectors: "Sectors" } },
      { id: '3', slug: 'analysis', title: 'Analysis', icon: 'Sliders', color: '#f97316', description: 'Tools for stock analysis.', subCategories: { screener: "Screener", heatmap: "Heatmap", "top-movers": "Top Movers" } },
      { id: '4', slug: 'news', title: 'News', icon: 'Newspaper', color: '#eab308', description: 'The latest financial news.', subCategories: { "top-stories": "Top Stories", "my-feed": "My Feed", "watchlist-news": "Watchlist News" } },
      { id: '5', slug: 'stocks', title: 'Stocks', icon: 'Search', color: '#8b5cf6', description: 'Search for a specific stock.', subCategories: { overview: "Overview", charts: "Charts", news: "News" } },
    ];
    setCategories(staticCategories);
    setLoading(prev => ({ ...prev, categories: false }));
  }, [setCategories]);

  const activeCategoryData = categories.find(c => c.slug === activeCategory);

  const handleSelectCategory = (slug: CategorySlug) => {
    setActiveCategory(slug);
    const firstSubCategory = Object.keys(categories.find(c => c.slug === slug)?.subCategories || {})[0];
    setActiveSubCategory(firstSubCategory || 'overview');
  }

  const renderActiveTab = () => {
    if (!activeCategoryData) return null;
    switch (activeCategory) {
      case 'dashboard':
        return <DashboardTab activeSubCategory={activeSubCategory} onSubCategoryChange={setActiveSubCategory} activeCategoryData={activeCategoryData} />;
      case 'markets':
        return <MarketsTab activeSubCategory={activeSubCategory} onSubCategoryChange={setActiveSubCategory} activeCategoryData={activeCategoryData} />;
      case 'analysis':
        return <AnalysisTab activeSubCategory={activeSubCategory} onSubCategoryChange={setActiveSubCategory} activeCategoryData={activeCategoryData} />;
      case 'news':
        return <NewsTab activeSubCategory={activeSubCategory} onSubCategoryChange={setActiveSubCategory} activeCategoryData={activeCategoryData} />;
      case 'stocks':
        return <StocksTab activeSubCategory={activeSubCategory} onSubCategoryChange={setActiveSubCategory} activeCategoryData={activeCategoryData} />;
      default:
        return null;
    }
  }

  if (loading.categories && categories.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(to right, #171717 0%, #171717 100%)' }}>
        <p className="text-white">Loading Stock Viewer...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-900/20">
        <p className="text-red-400 text-center px-4">Error: {error}<br />Please check the console.</p>
      </div>
    );
  }

  if (!activeCategoryData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(to right, #171717 0%, #171717 100%)' }}>
        <p className="text-white">No category data available.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to right, #171717 0%, #171717 100%)' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <CategorySelector categories={categories} activeCategory={activeCategory} onSelectCategory={handleSelectCategory} />

        <div className="relative mb-8">
          <Separator className="bg-zinc-800" />
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 px-4 bg-[#171717]">
            <div className="flex items-center gap-2">
              <div style={{ color: activeCategoryData.color }}>{iconMap[activeCategoryData.icon]}</div>
              <span className="text-sm font-medium text-gray-400">{activeCategoryData.title}</span>
            </div>
          </div>
        </div>

        <div className="mb-6">
          {renderActiveTab()}
        </div>
      </div>
    </div>
  )
}