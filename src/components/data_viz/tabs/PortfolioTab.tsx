// src/components/data_viz/tabs/PortfolioTab.tsx
"use client";
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, Plus, Trash2, Edit2, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { Category, PortfolioHolding } from '@/lib/types';
import { usePortfolios } from '@/lib/hooks';

const PortfolioTab = ({ activeCategoryData }: { activeCategoryData: Category }) => {
    const {
        portfolios,
        activePortfolioId,
        activePortfolio,
        createPortfolio,
        deletePortfolio,
        setActivePortfolio,
        addHolding,
        updateHolding,
        removeHolding,
    } = usePortfolios();

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isAddHoldingDialogOpen, setIsAddHoldingDialogOpen] = useState(false);
    const [isEditHoldingDialogOpen, setIsEditHoldingDialogOpen] = useState(false);
    const [editingHolding, setEditingHolding] = useState<PortfolioHolding | null>(null);

    const [newPortfolioName, setNewPortfolioName] = useState('');
    const [newHolding, setNewHolding] = useState({
        ticker: '',
        name: '',
        shares: '',
        avgPrice: '',
        currentPrice: '',
    });

    const handleCreatePortfolio = () => {
        if (newPortfolioName.trim()) {
            createPortfolio(newPortfolioName.trim());
            setNewPortfolioName('');
            setIsCreateDialogOpen(false);
        }
    };

    const handleDeletePortfolio = (id: string) => {
        if (portfolios.length > 1) {
            deletePortfolio(id);
        }
    };

    const handleAddHolding = () => {
        if (activePortfolioId && newHolding.ticker && newHolding.name && newHolding.shares && newHolding.avgPrice && newHolding.currentPrice) {
            const holding: PortfolioHolding = {
                ticker: newHolding.ticker.toUpperCase(),
                name: newHolding.name,
                shares: parseFloat(newHolding.shares),
                avgPrice: parseFloat(newHolding.avgPrice),
                currentPrice: parseFloat(newHolding.currentPrice),
            };
            addHolding(activePortfolioId, holding);
            setNewHolding({ ticker: '', name: '', shares: '', avgPrice: '', currentPrice: '' });
            setIsAddHoldingDialogOpen(false);
        }
    };

    const handleEditHolding = (holding: PortfolioHolding) => {
        setEditingHolding(holding);
        setIsEditHoldingDialogOpen(true);
    };

    const handleUpdateHolding = () => {
        if (activePortfolioId && editingHolding) {
            updateHolding(activePortfolioId, editingHolding.ticker, editingHolding);
            setEditingHolding(null);
            setIsEditHoldingDialogOpen(false);
        }
    };

    const handleRemoveHolding = (ticker: string) => {
        if (activePortfolioId) {
            removeHolding(activePortfolioId, ticker);
        }
    };

    const calculateTotalValue = () => {
        if (!activePortfolio) return 0;
        return activePortfolio.holdings.reduce((sum, h) => sum + (h.shares * h.currentPrice), 0);
    };

    const calculateTotalGain = () => {
        if (!activePortfolio) return { amount: 0, percent: 0 };
        const totalCost = activePortfolio.holdings.reduce((sum, h) => sum + (h.shares * h.avgPrice), 0);
        const totalValue = calculateTotalValue();
        const gain = totalValue - totalCost;
        const percent = totalCost > 0 ? (gain / totalCost) * 100 : 0;
        return { amount: gain, percent };
    };

    const totalValue = calculateTotalValue();
    const totalGain = calculateTotalGain();

    return (
        <div className="space-y-6 mt-6">
            <Card className="border-zinc-800 overflow-hidden" style={{ background: `linear-gradient(135deg, ${activeCategoryData.color}10 0%, #1c1c1c 100%)` }}>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-white flex items-center gap-2 text-lg">
                                <Briefcase className="w-4 h-4" />Portfolio Management
                            </CardTitle>
                            <CardDescription className="text-gray-400 text-xs">
                                Manage your investment portfolios and holdings.
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

                    {activePortfolio && (
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
                                    <p className="text-lg font-semibold text-white">{activePortfolio.holdings.length}</p>
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
                                                    <Label htmlFor="ticker">Ticker Symbol</Label>
                                                    <Input
                                                        id="ticker"
                                                        value={newHolding.ticker}
                                                        onChange={(e) => setNewHolding({ ...newHolding, ticker: e.target.value })}
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
                                                <div className="grid grid-cols-3 gap-3">
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
                                                        <Label htmlFor="avgPrice">Avg Price</Label>
                                                        <Input
                                                            id="avgPrice"
                                                            type="number"
                                                            step="0.01"
                                                            value={newHolding.avgPrice}
                                                            onChange={(e) => setNewHolding({ ...newHolding, avgPrice: e.target.value })}
                                                            placeholder="150.25"
                                                            className="mt-2 bg-zinc-800 border-zinc-700 text-white"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="currentPrice">Current Price</Label>
                                                        <Input
                                                            id="currentPrice"
                                                            type="number"
                                                            step="0.01"
                                                            value={newHolding.currentPrice}
                                                            onChange={(e) => setNewHolding({ ...newHolding, currentPrice: e.target.value })}
                                                            placeholder="182.50"
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

                                {activePortfolio.holdings.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500 text-sm">
                                        No holdings yet. Add your first stock to get started.
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {activePortfolio.holdings.map((holding) => {
                                            const totalCost = holding.shares * holding.avgPrice;
                                            const totalValue = holding.shares * holding.currentPrice;
                                            const gain = totalValue - totalCost;
                                            const gainPercent = (gain / totalCost) * 100;

                                            return (
                                                <div key={holding.ticker} className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/30 border border-zinc-800/50 hover:border-zinc-700 transition-all">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-sm font-semibold text-white">{holding.ticker}</span>
                                                            <span className="text-xs text-gray-500">{holding.name}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3 text-xs text-gray-400">
                                                            <span>{holding.shares} shares</span>
                                                            <span>@${holding.avgPrice.toFixed(2)}</span>
                                                            <span className="text-gray-500">→</span>
                                                            <span>${holding.currentPrice.toFixed(2)}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="text-right">
                                                            <p className="text-sm font-medium text-white">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                                            <p className={`text-xs ${gain >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                                {gain >= 0 ? '+' : ''}${gain.toFixed(2)} ({gainPercent >= 0 ? '+' : ''}{gainPercent.toFixed(2)}%)
                                                            </p>
                                                        </div>
                                                        <div className="flex gap-1">
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => handleEditHolding(holding)}
                                                                className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                                                            >
                                                                <Edit2 className="w-3 h-3" />
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => handleRemoveHolding(holding.ticker)}
                                                                className="h-8 w-8 p-0 text-gray-400 hover:text-red-400"
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

            {/* Edit Holding Dialog */}
            <Dialog open={isEditHoldingDialogOpen} onOpenChange={setIsEditHoldingDialogOpen}>
                <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                    <DialogHeader>
                        <DialogTitle>Edit Holding</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Update the details of your stock holding.
                        </DialogDescription>
                    </DialogHeader>
                    {editingHolding && (
                        <div className="space-y-4 py-4">
                            <div>
                                <Label>Ticker Symbol</Label>
                                <Input
                                    value={editingHolding.ticker}
                                    disabled
                                    className="mt-2 bg-zinc-800 border-zinc-700 text-gray-500"
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-name">Company Name</Label>
                                <Input
                                    id="edit-name"
                                    value={editingHolding.name}
                                    onChange={(e) => setEditingHolding({ ...editingHolding, name: e.target.value })}
                                    className="mt-2 bg-zinc-800 border-zinc-700 text-white"
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <Label htmlFor="edit-shares">Shares</Label>
                                    <Input
                                        id="edit-shares"
                                        type="number"
                                        value={editingHolding.shares}
                                        onChange={(e) => setEditingHolding({ ...editingHolding, shares: parseFloat(e.target.value) })}
                                        className="mt-2 bg-zinc-800 border-zinc-700 text-white"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="edit-avgPrice">Avg Price</Label>
                                    <Input
                                        id="edit-avgPrice"
                                        type="number"
                                        step="0.01"
                                        value={editingHolding.avgPrice}
                                        onChange={(e) => setEditingHolding({ ...editingHolding, avgPrice: parseFloat(e.target.value) })}
                                        className="mt-2 bg-zinc-800 border-zinc-700 text-white"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="edit-currentPrice">Current Price</Label>
                                    <Input
                                        id="edit-currentPrice"
                                        type="number"
                                        step="0.01"
                                        value={editingHolding.currentPrice}
                                        onChange={(e) => setEditingHolding({ ...editingHolding, currentPrice: parseFloat(e.target.value) })}
                                        className="mt-2 bg-zinc-800 border-zinc-700 text-white"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditHoldingDialogOpen(false)} className="border-zinc-700">
                            Cancel
                        </Button>
                        <Button onClick={handleUpdateHolding} style={{ backgroundColor: activeCategoryData.color }}>
                            Update
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default PortfolioTab;
