// src/components/data_viz/tabs/DashboardTab.tsx
"use client";
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, TrendingUp, DollarSign, BarChart3, Briefcase, Star, Activity, Loader2 } from 'lucide-react';
import { Category } from '@/lib/types';
import { useSupabasePortfolios } from '@/lib/hooks';

const iconMap: { [key: string]: React.ReactNode } = {
    DollarSign: <DollarSign className="w-4 h-4" />,
    Briefcase: <Briefcase className="w-4 h-4" />,
    TrendingUp: <TrendingUp className="w-4 h-4" />,
    BarChart3: <BarChart3 className="w-4 h-4" />,
    Star: <Star className="w-4 h-4" />,
    Activity: <Activity className="w-4 h-4" />
};

const DashboardTab = ({ activeCategoryData }: { activeCategoryData: Category }) => {
    const { holdings, loading, error } = useSupabasePortfolios();

    // Calculate total cost from holdings
    const totalCost = holdings.reduce((sum, h) => sum + h.total_cost, 0);

    // Note: In production, fetch current prices from API
    // For now, using average_cost as placeholder
    const totalValue = holdings.reduce((sum, h) => sum + (h.quantity * h.average_cost), 0);

    const totalGain = {
        amount: totalValue - totalCost,
        percent: totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0,
    };

    // Calculate win rate (holdings with positive gains)
    const calculateWinRate = () => {
        if (holdings.length === 0) return 0;
        // Since we're using average_cost for current value, this will always be 0
        // In production, you'd compare current market price to average_cost
        const winners = holdings.filter(h => {
            const currentValue = h.quantity * h.average_cost;
            return currentValue > h.total_cost;
        }).length;
        return (winners / holdings.length) * 100;
    };

    const winRate = calculateWinRate();

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center py-12">
                <p className="text-red-400">Error loading dashboard: {error}</p>
            </div>
        );
    }

    const portfolioHighlights = [
        {
            title: `$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            subtitle: 'Total Portfolio Value',
            icon: 'DollarSign',
            change: `${totalGain.percent >= 0 ? '+' : ''}${totalGain.percent.toFixed(1)}%`
        },
        {
            title: `${holdings.length} stocks`,
            subtitle: 'Total Holdings',
            icon: 'Briefcase',
            change: null
        },
        {
            title: `${totalGain.amount >= 0 ? '+' : ''}$${Math.abs(totalGain.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            subtitle: "Total Gain/Loss",
            icon: 'TrendingUp',
            change: `${totalGain.percent >= 0 ? '+' : ''}${totalGain.percent.toFixed(1)}%`
        },
        {
            title: `${winRate.toFixed(1)}%`,
            subtitle: 'Win Rate',
            icon: 'BarChart3',
            change: null
        }
    ];
    return (
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
                        <h3 className="text-sm font-semibold text-white mb-3">Top Holdings</h3>
                        {holdings.length > 0 ? (
                            <div className="space-y-2">
                                {holdings.slice(0, 5).map((holding) => {
                                    const holdingTotalValue = holding.quantity * holding.average_cost;
                                    const gain = holdingTotalValue - holding.total_cost;
                                    const gainPercent = holding.total_cost > 0 ? (gain / holding.total_cost) * 100 : 0;

                                    return (
                                        <div key={holding.id} className="flex items-center justify-between p-2 rounded bg-zinc-900/30">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-semibold text-white">{holding.asset.symbol}</span>
                                                    <span className="text-xs text-gray-500">{holding.asset.name}</span>
                                                </div>
                                                <span className="text-xs text-gray-500">{holding.quantity} shares @ ${holding.average_cost.toFixed(2)}</span>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs font-medium text-white">${holdingTotalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                                                <div className={`text-xs ${gain >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                    {gain >= 0 ? '+' : ''}{gainPercent.toFixed(1)}%
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-4 text-gray-500 text-xs">
                                No holdings yet. Go to the Portfolio tab to add stocks.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default DashboardTab;