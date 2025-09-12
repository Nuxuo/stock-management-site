// src/components/data_viz/tabs/MarketsTab.tsx
"use client";
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, BarChart2, PieChart, TrendingUp, TrendingDown, Activity, DollarSign } from 'lucide-react';
import { Category } from '@/lib/types';

// Mock data
const marketOverviewHighlights = [
    { title: '4,782.45', subtitle: 'S&P 500', icon: 'BarChart2', change: '+0.85%' },
    { title: '38,564.82', subtitle: 'Dow Jones', icon: 'TrendingUp', change: '+0.62%' },
    { title: '16,234.56', subtitle: 'NASDAQ', icon: 'Activity', change: '+1.24%' },
    { title: '2,145.67', subtitle: 'Russell 2000', icon: 'DollarSign', change: '-0.35%' }
];

const mockIndices = [
    { name: 'S&P 500', value: 4782.45, change: '+40.25', changePercent: '+0.85%', high: 4795.20, low: 4745.30 },
    { name: 'Dow Jones', value: 38564.82, change: '+238.75', changePercent: '+0.62%', high: 38650.00, low: 38420.50 },
    { name: 'NASDAQ', value: 16234.56, change: '+198.45', changePercent: '+1.24%', high: 16280.00, low: 16100.25 },
    { name: 'Russell 2000', value: 2145.67, change: '-7.50', changePercent: '-0.35%', high: 2158.90, low: 2142.30 },
    { name: 'FTSE 100', value: 7654.32, change: '+45.80', changePercent: '+0.60%', high: 7670.00, low: 7620.50 },
    { name: 'DAX', value: 17234.56, change: '+125.40', changePercent: '+0.73%', high: 17280.00, low: 17150.00 },
];

const mockSectors = [
    { sector: 'Technology', performance: '+2.45%', leader: 'NVDA', volume: '125.3M' },
    { sector: 'Healthcare', performance: '+1.82%', leader: 'JNJ', volume: '98.5M' },
    { sector: 'Financial', performance: '+1.35%', leader: 'JPM', volume: '112.8M' },
    { sector: 'Consumer', performance: '+0.95%', leader: 'AMZN', volume: '145.2M' },
    { sector: 'Energy', performance: '-0.45%', leader: 'XOM', volume: '87.3M' },
    { sector: 'Utilities', performance: '-0.72%', leader: 'NEE', volume: '45.6M' },
    { sector: 'Real Estate', performance: '-1.15%', leader: 'PLD', volume: '38.9M' },
    { sector: 'Materials', performance: '+0.35%', leader: 'LIN', volume: '52.4M' },
];

const marketStats = [
    { title: '$45.8T', subtitle: 'Total Market Cap', icon: 'DollarSign' },
    { title: '8.5B', subtitle: 'Total Volume', icon: 'Activity' },
    { title: '286', subtitle: 'Advances', icon: 'TrendingUp' },
    { title: '214', subtitle: 'Declines', icon: 'TrendingDown' }
];

const iconMap: { [key: string]: React.ReactNode } = {
    BarChart2: <BarChart2 className="w-4 h-4" />,
    TrendingUp: <TrendingUp className="w-4 h-4" />,
    TrendingDown: <TrendingDown className="w-4 h-4" />,
    Activity: <Activity className="w-4 h-4" />,
    DollarSign: <DollarSign className="w-4 h-4" />
};

const MarketsTab = ({ activeSubCategory, onSubCategoryChange, activeCategoryData }: { activeSubCategory: string, onSubCategoryChange: (value: string) => void, activeCategoryData: Category }) => {
    return (
        <Tabs value={activeSubCategory} onValueChange={onSubCategoryChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-[#1c1c1c]">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="indices">Indices</TabsTrigger>
                <TabsTrigger value="sectors">Sectors</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
                <div className="space-y-6 mt-6">
                    <Card className="border-zinc-800 overflow-hidden" style={{ background: `linear-gradient(135deg, ${activeCategoryData.color}10 0%, #1c1c1c 100%)` }}>
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2 text-lg">
                                <Globe className="w-4 h-4" />Market Overview
                            </CardTitle>
                            <CardDescription className="text-gray-400 text-xs">
                                Global markets performance and key indicators.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                                {marketOverviewHighlights.map((highlight, index) => (
                                    <div key={index} className="group flex items-start gap-3 p-3 rounded-lg bg-zinc-900/30 border border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-900/50 transition-all duration-200">
                                        <div className="mt-0.5 p-1.5 rounded" style={{ background: `${activeCategoryData.color}15`, color: activeCategoryData.color }}>
                                            {iconMap[highlight.icon]}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-baseline gap-2">
                                                <p className="text-sm font-medium text-gray-200">{highlight.title}</p>
                                                <span className={`text-xs ${highlight.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                                                    {highlight.change}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500">{highlight.subtitle}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="border-t border-zinc-800 pt-4">
                                <h3 className="text-sm font-semibold text-white mb-3">Market Statistics</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {marketStats.map((stat, index) => (
                                        <div key={index} className="p-3 rounded-lg bg-zinc-900/30 border border-zinc-800/50">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="p-1 rounded" style={{ background: `${activeCategoryData.color}15`, color: activeCategoryData.color }}>
                                                    {iconMap[stat.icon]}
                                                </div>
                                            </div>
                                            <p className="text-sm font-semibold text-white">{stat.title}</p>
                                            <p className="text-xs text-gray-500">{stat.subtitle}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>
            
            <TabsContent value="indices">
                <div className="space-y-6 mt-6">
                    <Card className="border-zinc-800 overflow-hidden" style={{ background: `linear-gradient(135deg, ${activeCategoryData.color}10 0%, #1c1c1c 100%)` }}>
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2 text-lg">
                                <BarChart2 className="w-4 h-4" />Global Indices
                            </CardTitle>
                            <CardDescription className="text-gray-400 text-xs">
                                Major stock market indices performance.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {mockIndices.map((index, i) => (
                                    <div key={i} className="group flex items-center justify-between p-3 rounded-lg bg-zinc-900/30 border border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-900/50 transition-all duration-200">
                                        <div>
                                            <p className="text-sm font-semibold text-white">{index.name}</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                H: {index.high.toLocaleString()} | L: {index.low.toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-white">{index.value.toLocaleString()}</p>
                                            <p className={`text-xs ${index.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                                                {index.change} ({index.changePercent})
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>
            
            <TabsContent value="sectors">
                <div className="space-y-6 mt-6">
                    <Card className="border-zinc-800 overflow-hidden" style={{ background: `linear-gradient(135deg, ${activeCategoryData.color}10 0%, #1c1c1c 100%)` }}>
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2 text-lg">
                                <PieChart className="w-4 h-4" />Sector Performance
                            </CardTitle>
                            <CardDescription className="text-gray-400 text-xs">
                                Performance breakdown by market sectors.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {mockSectors.map((sector, index) => (
                                    <div key={index} className="group flex items-center justify-between p-3 rounded-lg bg-zinc-900/30 border border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-900/50 transition-all duration-200">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <div 
                                                    className="w-2 h-2 rounded-full"
                                                    style={{ 
                                                        backgroundColor: sector.performance.startsWith('+') 
                                                            ? '#10b981' 
                                                            : '#ef4444' 
                                                    }}
                                                />
                                                <p className="text-sm font-semibold text-white">{sector.sector}</p>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1 ml-5">
                                                Leader: {sector.leader} | Volume: {sector.volume}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-sm font-medium ${sector.performance.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                                                {sector.performance}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-zinc-800">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-500">Best Performer: Technology</span>
                                    <span className="text-gray-500">Worst Performer: Real Estate</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>
        </Tabs>
    );
}

export default MarketsTab;