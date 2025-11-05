// src/components/data_viz/tabs/PortfolioTab.tsx
"use client";
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, Plus, Trash2, DollarSign, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { Category } from '@/lib/types';
import { useSupabasePortfolios, useStockWebSocket } from '@/lib/hooks';
import { toast } from 'sonner';

const PortfolioTab = ({ activeCategoryData }: { activeCategoryData: Category }) => {
    const {
        portfolios,
        activePortfolioId,
        activePortfolioWithHoldings,
        holdings,
        loading,
        error,
        createPortfolio,
        deletePortfolio,
        setActivePortfolio,
        addHolding,
        removeHolding,
    } = useSupabasePortfolios();

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isAddHoldingDialogOpen, setIsAddHoldingDialogOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const [newPortfolioName, setNewPortfolioName] = useState('');
    const [newHolding, setNewHolding] = useState({
        symbol: '',
        name: '',
        shares: '',
        price: '',
    });

    const handleCreatePortfolio = async () => {
        if (!newPortfolioName.trim()) return;

        setIsProcessing(true);
        try {
            await createPortfolio(newPortfolioName.trim());
            setNewPortfolioName('');
            setIsCreateDialogOpen(false);
            toast.success('Portfolio created successfully');
        } catch (err) {
            toast.error('Failed to create portfolio');
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDeletePortfolio = async (id: string) => {
        if (portfolios.length <= 1) {
            toast.error('Cannot delete the last portfolio');
            return;
        }

        setIsProcessing(true);
        try {
            await deletePortfolio(id);
            toast.success('Portfolio deleted successfully');
        } catch (err) {
            toast.error('Failed to delete portfolio');
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleAddHolding = async () => {
        if (!activePortfolioId || !newHolding.symbol || !newHolding.name || !newHolding.shares || !newHolding.price) {
            toast.error('Please fill in all fields');
            return;
        }

        setIsProcessing(true);
        try {
            await addHolding({
                symbol: newHolding.symbol.toUpperCase(),
                name: newHolding.name,
                shares: parseFloat(newHolding.shares),
                price: parseFloat(newHolding.price),
            });
            setNewHolding({ symbol: '', name: '', shares: '', price: '' });
            setIsAddHoldingDialogOpen(false);
            toast.success('Holding added successfully');
        } catch (err) {
            toast.error('Failed to add holding');
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRemoveHolding = async (asset_id: string, symbol: string) => {
        const holding = holdings.find(h => h.asset_id === asset_id);
        if (!holding) return;

        setIsProcessing(true);
        try {
            await removeHolding({
                asset_id,
                shares: holding.quantity,
                price: holding.average_cost,
                notes: `Sold all shares of ${symbol}`,
            });
            toast.success('Holding removed successfully');
        } catch (err) {
            toast.error('Failed to remove holding');
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    // Get all symbols from holdings for WebSocket subscription
    const symbols = useMemo(() => holdings.map(h => h.asset.symbol), [holdings]);

    // Connect to WebSocket for real-time prices
    const { stockData: wsStockData, isConnected } = useStockWebSocket({
        symbols,
        enabled: holdings.length > 0,
    });

    // Helper to get current price for a holding
    const getCurrentPrice = (symbol: string, fallbackPrice: number) => {
        const liveData = wsStockData.get(symbol);
        return liveData?.price ?? fallbackPrice;
    };

    // Calculate total cost from holdings
    const totalCost = holdings.reduce((sum, h) => sum + h.total_cost, 0);

    // Calculate total value using live prices
    const totalValue = holdings.reduce((sum, h) => {
        const currentPrice = getCurrentPrice(h.asset.symbol, h.average_cost);
        return sum + (h.quantity * currentPrice);
    }, 0);

    const totalGain = {
        amount: totalValue - totalCost,
        percent: totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0,
    };

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
                <p className="text-red-400">Error loading portfolios: {error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 mt-6">
            <Card className="border-zinc-800 overflow-hidden" style={{ background: `linear-gradient(135deg, ${activeCategoryData.color}10 0%, #1c1c1c 100%)` }}>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-white flex items-center gap-2 text-lg">
                                <Briefcase className="w-4 h-4" />Portfolio Management
                                {isConnected && holdings.length > 0 && <span className="text-xs text-green-500 font-normal">● Live</span>}
                            </CardTitle>
                            <CardDescription className="text-gray-400 text-xs">
                                Manage your investment portfolios and holdings with real-time prices.
                            </CardDescription>
                        </div>
                        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm" style={{ backgroundColor: activeCategoryData.color }}>
                                    <Plus className="w-4 h-4 mr-1" />
                                    New Portfolio
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                                <DialogHeader>
                                    <DialogTitle>Create New Portfolio</DialogTitle>
                                    <DialogDescription className="text-gray-400">
                                        Enter a name for your new portfolio.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="py-4">
                                    <Label htmlFor="portfolio-name">Portfolio Name</Label>
                                    <Input
                                        id="portfolio-name"
                                        value={newPortfolioName}
                                        onChange={(e) => setNewPortfolioName(e.target.value)}
                                        placeholder="e.g., Tech Stocks, Dividends..."
                                        className="mt-2 bg-zinc-800 border-zinc-700 text-white"
                                    />
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="border-zinc-700">
                                        Cancel
                                    </Button>
                                    <Button onClick={handleCreatePortfolio} style={{ backgroundColor: activeCategoryData.color }}>
                                        Create
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Portfolio Selector */}
                    <div className="mb-6">
                        <Label className="text-gray-300 mb-2 block">Active Portfolio</Label>
                        <div className="flex gap-2">
                            <Select value={activePortfolioId || ''} onValueChange={setActivePortfolio}>
                                <SelectTrigger className="flex-1 bg-zinc-800 border-zinc-700 text-white">
                                    <SelectValue placeholder="Select a portfolio" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                                    {portfolios.map((portfolio) => (
                                        <SelectItem key={portfolio.id} value={portfolio.id}>
                                            {portfolio.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {portfolios.length > 1 && activePortfolioId && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeletePortfolio(activePortfolioId)}
                                    className="border-zinc-700 text-red-400 hover:bg-red-950"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    </div>

                    {activePortfolioWithHoldings && (
                        <>
                            {/* Portfolio Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                                <div className="p-3 rounded-lg bg-zinc-900/30 border border-zinc-800/50">
                                    <div className="flex items-center gap-2 mb-1">
                                        <DollarSign className="w-4 h-4" style={{ color: activeCategoryData.color }} />
                                        <span className="text-xs text-gray-400">Total Value</span>
                                    </div>
                                    <p className="text-lg font-semibold text-white">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                </div>
                                <div className="p-3 rounded-lg bg-zinc-900/30 border border-zinc-800/50">
                                    <div className="flex items-center gap-2 mb-1">
                                        {totalGain.amount >= 0 ? (
                                            <TrendingUp className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <TrendingDown className="w-4 h-4 text-red-500" />
                                        )}
                                        <span className="text-xs text-gray-400">Total Gain/Loss</span>
                                    </div>
                                    <p className={`text-lg font-semibold ${totalGain.amount >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {totalGain.amount >= 0 ? '+' : ''}${totalGain.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        <span className="text-sm ml-2">({totalGain.percent >= 0 ? '+' : ''}{totalGain.percent.toFixed(2)}%)</span>
                                    </p>
                                </div>
                                <div className="p-3 rounded-lg bg-zinc-900/30 border border-zinc-800/50">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Briefcase className="w-4 h-4" style={{ color: activeCategoryData.color }} />
                                        <span className="text-xs text-gray-400">Holdings</span>
                                    </div>
                                    <p className="text-lg font-semibold text-white">{holdings.length}</p>
                                </div>
                            </div>

                            {/* Holdings List */}
                            <div className="border-t border-zinc-800 pt-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-semibold text-white">Holdings</h3>
                                    <Dialog open={isAddHoldingDialogOpen} onOpenChange={setIsAddHoldingDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button size="sm" variant="outline" className="border-zinc-700">
                                                <Plus className="w-3 h-3 mr-1" />
                                                Add Holding
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                                            <DialogHeader>
                                                <DialogTitle>Add New Holding</DialogTitle>
                                                <DialogDescription className="text-gray-400">
                                                    Enter the details of your stock holding.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4 py-4">
                                                <div>
                                                    <Label htmlFor="symbol">Ticker Symbol</Label>
                                                    <Input
                                                        id="symbol"
                                                        value={newHolding.symbol}
                                                        onChange={(e) => setNewHolding({ ...newHolding, symbol: e.target.value })}
                                                        placeholder="e.g., AAPL"
                                                        className="mt-2 bg-zinc-800 border-zinc-700 text-white"
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="name">Company Name</Label>
                                                    <Input
                                                        id="name"
                                                        value={newHolding.name}
                                                        onChange={(e) => setNewHolding({ ...newHolding, name: e.target.value })}
                                                        placeholder="e.g., Apple Inc."
                                                        className="mt-2 bg-zinc-800 border-zinc-700 text-white"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <Label htmlFor="shares">Shares</Label>
                                                        <Input
                                                            id="shares"
                                                            type="number"
                                                            value={newHolding.shares}
                                                            onChange={(e) => setNewHolding({ ...newHolding, shares: e.target.value })}
                                                            placeholder="50"
                                                            className="mt-2 bg-zinc-800 border-zinc-700 text-white"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="price">Purchase Price</Label>
                                                        <Input
                                                            id="price"
                                                            type="number"
                                                            step="0.01"
                                                            value={newHolding.price}
                                                            onChange={(e) => setNewHolding({ ...newHolding, price: e.target.value })}
                                                            placeholder="150.25"
                                                            className="mt-2 bg-zinc-800 border-zinc-700 text-white"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button variant="outline" onClick={() => setIsAddHoldingDialogOpen(false)} className="border-zinc-700">
                                                    Cancel
                                                </Button>
                                                <Button onClick={handleAddHolding} style={{ backgroundColor: activeCategoryData.color }}>
                                                    Add Holding
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>

                                {holdings.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500 text-sm">
                                        No holdings yet. Add your first stock to get started.
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {holdings.map((holding) => {
                                            const currentPrice = getCurrentPrice(holding.asset.symbol, holding.average_cost);
                                            const isLivePrice = wsStockData.has(holding.asset.symbol);
                                            const holdingTotalCost = holding.total_cost;
                                            const holdingTotalValue = holding.quantity * currentPrice;
                                            const gain = holdingTotalValue - holdingTotalCost;
                                            const gainPercent = holdingTotalCost > 0 ? (gain / holdingTotalCost) * 100 : 0;

                                            return (
                                                <div key={holding.id} className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/30 border border-zinc-800/50 hover:border-zinc-700 transition-all">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-sm font-semibold text-white">{holding.asset.symbol}</span>
                                                            {isLivePrice && <span className="text-xs text-green-500">●</span>}
                                                            <span className="text-xs text-gray-500">{holding.asset.name}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3 text-xs text-gray-400">
                                                            <span>{holding.quantity} shares</span>
                                                            <span>Cost: ${holding.average_cost.toFixed(2)}</span>
                                                            <span className="text-gray-500">•</span>
                                                            <span>Now: ${currentPrice.toFixed(2)}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="text-right">
                                                            <p className="text-sm font-medium text-white">${holdingTotalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                                            <p className={`text-xs ${gain >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                                {gain >= 0 ? '+' : ''}${gain.toFixed(2)} ({gainPercent >= 0 ? '+' : ''}{gainPercent.toFixed(2)}%)
                                                            </p>
                                                        </div>
                                                        <div className="flex gap-1">
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => handleRemoveHolding(holding.asset_id, holding.asset.symbol)}
                                                                className="h-8 w-8 p-0 text-gray-400 hover:text-red-400"
                                                                disabled={isProcessing}
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default PortfolioTab;
