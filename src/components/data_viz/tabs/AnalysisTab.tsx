// src/components/data_viz/tabs/AnalysisTab.tsx
"use client";
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sliders, TrendingUp, TrendingDown, BarChart3, DollarSign } from 'lucide-react';
import { Category } from '@/lib/types';

// Mock data
const analysisHighlights = [
    { title: '1,247 stocks', subtitle: 'Analyzed Today', icon: 'BarChart3', change: '+84' },
    { title: '156 bullish', subtitle: 'Buy Signals', icon: 'TrendingUp', change: '+12' },
    { title: '89 bearish', subtitle: 'Sell Signals', icon: 'TrendingDown', change: '+5' },
    { title: '$2.4B', subtitle: 'Trading Volume', icon: 'DollarSign', change: '+15%' }
];

const topMovers = [
    { ticker: 'NVDA', name: 'NVIDIA Corp.', price: 875.50, change: '+48.25', changePercent: '+5.83%', volume: '52.3M' },
    { ticker: 'AMD', name: 'AMD', price: 165.30, change: '+8.90', changePercent: '+5.69%', volume: '48.1M' },
    { ticker: 'TSLA', name: 'Tesla Inc.', price: 248.50, change: '+12.75', changePercent: '+5.41%', volume: '125.8M' },
    { ticker: 'META', name: 'Meta Platforms', price: 485.20, change: '-15.80', changePercent: '-3.15%', volume: '32.7M' },
];

const iconMap: { [key: string]: React.ReactNode } = {
    BarChart3: <BarChart3 className="w-4 h-4" />,
    TrendingUp: <TrendingUp className="w-4 h-4" />,
    TrendingDown: <TrendingDown className="w-4 h-4" />,
    DollarSign: <DollarSign className="w-4 h-4" />
};

const AnalysisTab = ({ activeCategoryData }: { activeCategoryData: Category }) => {
    return (
        <div className="space-y-6 mt-6">
            <Card className="border-zinc-800 overflow-hidden" style={{ background: `linear-gradient(135deg, ${activeCategoryData.color}10 0%, #1c1c1c 100%)` }}>
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2 text-lg">
                        <Sliders className="w-4 h-4" />Stock Analysis
                    </CardTitle>
                    <CardDescription className="text-gray-400 text-xs">
                        Real-time market analysis and insights.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                        {analysisHighlights.map((highlight, index) => (
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
                        <h3 className="text-sm font-semibold text-white mb-3">Top Movers</h3>
                        <div className="space-y-2">
                            {topMovers.map((stock, index) => (
                                <div key={index} className="group flex items-center justify-between p-3 rounded-lg bg-zinc-900/30 border border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-900/50 transition-all duration-200">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold text-white">{stock.ticker}</span>
                                            <span className="text-xs text-gray-500">{stock.name}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Volume: {stock.volume}</p>
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
    );
}

export default AnalysisTab;
