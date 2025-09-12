// src/components/data_viz/tabs/DashboardTab.tsx
"use client";
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, Briefcase, Star, TrendingUp, DollarSign, BarChart3, Activity } from 'lucide-react';
import { Category } from '@/lib/types';

// Mock data
const portfolioHighlights = [
    { title: '$125,450', subtitle: 'Total Portfolio Value', icon: 'DollarSign', change: '+12.5%' },
    { title: '15 stocks', subtitle: 'Total Holdings', icon: 'Briefcase', change: '+3' },
    { title: '+$8,234', subtitle: "Today's Gain", icon: 'TrendingUp', change: '+2.3%' },
    { title: '85.2%', subtitle: 'Win Rate', icon: 'BarChart3', change: '+5.1%' }
];

const watchlistHighlights = [
    { title: '24 stocks', subtitle: 'Watching', icon: 'Star', change: null },
    { title: '7 alerts', subtitle: 'Active Alerts', icon: 'Activity', change: 'New' },
    { title: '3 buy signals', subtitle: 'Today', icon: 'TrendingUp', change: null },
    { title: '92% accuracy', subtitle: 'Alert Success', icon: 'BarChart3', change: '+3%' }
];

const mockPortfolio = [
    { ticker: 'AAPL', name: 'Apple Inc.', shares: 50, avgPrice: 150.25, currentPrice: 182.50, gain: '+$1,612.50', gainPercent: '+21.5%' },
    { ticker: 'MSFT', name: 'Microsoft Corp.', shares: 30, avgPrice: 280.00, currentPrice: 378.85, gain: '+$2,965.50', gainPercent: '+35.3%' },
    { ticker: 'GOOGL', name: 'Alphabet Inc.', shares: 20, avgPrice: 120.50, currentPrice: 138.25, gain: '+$355.00', gainPercent: '+14.7%' },
    { ticker: 'NVDA', name: 'NVIDIA Corp.', shares: 15, avgPrice: 450.00, currentPrice: 875.50, gain: '+$6,382.50', gainPercent: '+94.6%' },
];

const mockWatchlist = [
    { ticker: 'TSLA', name: 'Tesla Inc.', price: 248.50, change: '+5.25', changePercent: '+2.16%', alert: 'Buy Signal' },
    { ticker: 'META', name: 'Meta Platforms', price: 485.20, change: '-3.80', changePercent: '-0.78%', alert: null },
    { ticker: 'AMD', name: 'AMD', price: 165.30, change: '+8.90', changePercent: '+5.69%', alert: 'Volume Spike' },
    { ticker: 'JPM', name: 'JPMorgan Chase', price: 195.80, change: '+1.20', changePercent: '+0.62%', alert: null },
];

const iconMap: { [key: string]: React.ReactNode } = {
    DollarSign: <DollarSign className="w-4 h-4" />,
    Briefcase: <Briefcase className="w-4 h-4" />,
    TrendingUp: <TrendingUp className="w-4 h-4" />,
    BarChart3: <BarChart3 className="w-4 h-4" />,
    Star: <Star className="w-4 h-4" />,
    Activity: <Activity className="w-4 h-4" />
};

const DashboardTab = ({ activeSubCategory, onSubCategoryChange, activeCategoryData }: { activeSubCategory: string, onSubCategoryChange: (value: string) => void, activeCategoryData: Category }) => {
    return (
        <Tabs value={activeSubCategory} onValueChange={onSubCategoryChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-[#1c1c1c]">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
                <div className="space-y-6 mt-6">
                    <Card className="border-zinc-800 overflow-hidden" style={{ background: `linear-gradient(135deg, ${activeCategoryData.color}10 0%, #1c1c1c 100%)` }}>
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2 text-lg">
                                <Home className="w-4 h-4" />Dashboard Overview
                            </CardTitle>
                            <CardDescription className="text-gray-400 text-xs">
                                Your complete portfolio performance at a glance.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                                {portfolioHighlights.map((highlight, index) => (
                                    <div key={index} className="group flex items-start gap-3 p-3 rounded-lg bg-zinc-900/30 border border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-900/50 transition-all duration-200">
                                        <div className="mt-0.5 p-1.5 rounded" style={{ background: `${activeCategoryData.color}15`, color: activeCategoryData.color }}>
                                            {iconMap[highlight.icon]}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-baseline gap-2">
                                                <p className="text-sm font-medium text-gray-200">{highlight.title}</p>
                                                {highlight.change && (
                                                    <span className={`text-xs ${highlight.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                                                        {highlight.change}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500">{highlight.subtitle}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="border-t border-zinc-800 pt-4">
                                <h3 className="text-sm font-semibold text-white mb-3">Recent Activity</h3>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between p-2 rounded bg-zinc-900/30">
                                        <span className="text-xs text-gray-400">AAPL buy order executed</span>
                                        <span className="text-xs text-gray-500">2 hours ago</span>
                                    </div>
                                    <div className="flex items-center justify-between p-2 rounded bg-zinc-900/30">
                                        <span className="text-xs text-gray-400">NVDA hit price target</span>
                                        <span className="text-xs text-gray-500">5 hours ago</span>
                                    </div>
                                    <div className="flex items-center justify-between p-2 rounded bg-zinc-900/30">
                                        <span className="text-xs text-gray-400">Portfolio rebalanced</span>
                                        <span className="text-xs text-gray-500">Yesterday</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>
            
            <TabsContent value="portfolio">
                <div className="space-y-6 mt-6">
                    <Card className="border-zinc-800 overflow-hidden" style={{ background: `linear-gradient(135deg, ${activeCategoryData.color}10 0%, #1c1c1c 100%)` }}>
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2 text-lg">
                                <Briefcase className="w-4 h-4" />Portfolio Performance
                            </CardTitle>
                            <CardDescription className="text-gray-400 text-xs">
                                Track your investments and returns.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                                {portfolioHighlights.map((highlight, index) => (
                                    <div key={index} className="group flex items-start gap-3 p-3 rounded-lg bg-zinc-900/30 border border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-900/50 transition-all duration-200">
                                        <div className="mt-0.5 p-1.5 rounded" style={{ background: `${activeCategoryData.color}15`, color: activeCategoryData.color }}>
                                            {iconMap[highlight.icon]}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-baseline gap-2">
                                                <p className="text-sm font-medium text-gray-200">{highlight.title}</p>
                                                {highlight.change && (
                                                    <span className={`text-xs ${highlight.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                                                        {highlight.change}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500">{highlight.subtitle}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="border-t border-zinc-800 pt-4">
                                <h3 className="text-sm font-semibold text-white mb-3">Holdings</h3>
                                <div className="space-y-2">
                                    {mockPortfolio.map((stock, index) => (
                                        <div key={index} className="group flex items-center justify-between p-3 rounded-lg bg-zinc-900/30 border border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-900/50 transition-all duration-200">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-semibold text-white">{stock.ticker}</span>
                                                    <span className="text-xs text-gray-500">{stock.name}</span>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">{stock.shares} shares @ ${stock.avgPrice}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-white">${stock.currentPrice}</p>
                                                <p className={`text-xs ${stock.gain.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                                                    {stock.gain} ({stock.gainPercent})
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>
            
            <TabsContent value="watchlist">
                <div className="space-y-6 mt-6">
                    <Card className="border-zinc-800 overflow-hidden" style={{ background: `linear-gradient(135deg, ${activeCategoryData.color}10 0%, #1c1c1c 100%)` }}>
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2 text-lg">
                                <Star className="w-4 h-4" />Watchlist Monitor
                            </CardTitle>
                            <CardDescription className="text-gray-400 text-xs">
                                Track potential investment opportunities.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                                {watchlistHighlights.map((highlight, index) => (
                                    <div key={index} className="group flex items-start gap-3 p-3 rounded-lg bg-zinc-900/30 border border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-900/50 transition-all duration-200">
                                        <div className="mt-0.5 p-1.5 rounded" style={{ background: `${activeCategoryData.color}15`, color: activeCategoryData.color }}>
                                            {iconMap[highlight.icon]}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-baseline gap-2">
                                                <p className="text-sm font-medium text-gray-200">{highlight.title}</p>
                                                {highlight.change && (
                                                    <span className={`text-xs ${highlight.change === 'New' ? 'text-yellow-500' : highlight.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                                                        {highlight.change}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500">{highlight.subtitle}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="border-t border-zinc-800 pt-4">
                                <h3 className="text-sm font-semibold text-white mb-3">Watched Stocks</h3>
                                <div className="space-y-2">
                                    {mockWatchlist.map((stock, index) => (
                                        <div key={index} className="group flex items-center justify-between p-3 rounded-lg bg-zinc-900/30 border border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-900/50 transition-all duration-200">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-semibold text-white">{stock.ticker}</span>
                                                    <span className="text-xs text-gray-500">{stock.name}</span>
                                                    {stock.alert && (
                                                        <span className="text-xs px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-500">
                                                            {stock.alert}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-white">${stock.price}</p>
                                                <p className={`text-xs ${stock.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                                                    {stock.change} ({stock.changePercent})
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>
        </Tabs>
    );
}

export default DashboardTab;