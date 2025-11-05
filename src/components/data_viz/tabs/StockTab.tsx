// src/components/data_viz/tabs/StocksTab.tsx
"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Category, Asset } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { useStockWebSocket, StockUpdate } from '@/lib/hooks';
import { getAssets } from '@/lib/supabase/database';


// Helper function to safely format numbers or return a fallback string
const formatPrice = (num: number | null | undefined, digits = 2) => {
    if (typeof num !== 'number') return 'N/A';
    return `$${num.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
};

const formatPercent = (num: number | null | undefined) => {
    if (typeof num !== 'number') return 'N/A';
    return `${(num * 100).toFixed(2)}%`;
};

// Updated formatNumber for large numbers (Volume, Market Cap)
const formatLargeNumber = (num: number | null | undefined) => {
    if (typeof num !== 'number') return 'N/A';
    if (num >= 1_000_000_000_000) {
        return `${(num / 1_000_000_000_000).toFixed(2)}T`;
    }
    if (num >= 1_000_000_000) {
        return `${(num / 1_000_000_000).toFixed(2)}B`;
    }
    if (num >= 1_000_000) {
        return `${(num / 1_000_000).toFixed(2)}M`;
    }
    return num.toLocaleString();
};


const StocksTab = ({ activeCategoryData }: { activeCategoryData: Category }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchedStock, setSearchedStock] = useState<string | null>(null);
    const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
    const [availableStocks, setAvailableStocks] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Load available stocks from Supabase
    useEffect(() => {
        const loadStocks = async () => {
            try {
                const { data, error } = await getAssets({
                    assetType: 'stock',
                    isActive: true
                });
                if (error) throw error;
                setAvailableStocks(data || []);

                // Set default stock to first one if available
                if (data && data.length > 0) {
                    setSearchedStock(data[0].symbol);
                    setSelectedAsset(data[0]);
                }
            } catch (err) {
                console.error('Error loading stocks:', err);
                setError(err instanceof Error ? err.message : 'Failed to load stocks');
            }
        };

        loadStocks();
    }, []);

    // WebSocket connection for real-time updates
    const { stockData: wsStockData, isConnected, error: wsError } = useStockWebSocket({
        symbols: searchedStock ? [searchedStock] : [],
        enabled: !!searchedStock,
        onError: (err) => {
            console.error('WebSocket error:', err);
            setError(err.message);
        },
    });

    // Get current stock data from WebSocket
    const currentStockData = searchedStock ? wsStockData.get(searchedStock) : null;

    const handleSelectStock = (ticker: string) => {
        const asset = availableStocks.find(s => s.symbol === ticker);
        setSearchedStock(ticker);
        setSelectedAsset(asset || null);
        setSearchTerm(ticker);
        setOpen(false);
        if (inputRef.current) {
            inputRef.current.blur();
        }
    };
    
    // A small delay on blur allows the user to click an item in the list
    const handleBlur = () => {
        setTimeout(() => {
            setOpen(false);
        }, 150);
    };

    const renderOverviewContent = () => {
        if (loading || !isConnected) {
            return (
                <div className="space-y-4">
                    <Skeleton className="h-8 w-3/4" />
                    <div className="grid grid-cols-2 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="space-y-2">
                                <Skeleton className="h-4 w-1/2" />
                                <Skeleton className="h-6 w-3/4" />
                            </div>
                        ))}
                    </div>
                    <div className="text-center text-sm text-gray-500 mt-4">
                        {!isConnected ? 'Connecting to live data feed...' : 'Loading stock data...'}
                    </div>
                </div>
            );
        }

        if (error || wsError) {
            return (
                <div className="text-center text-red-400">
                    <p>Error: {error || wsError?.message}</p>
                    <p className="text-xs text-gray-500 mt-2">Make sure your local API is running at https://localhost:7039</p>
                </div>
            );
        }

        if (!currentStockData) {
            return (
                <div className="text-center text-gray-500">
                    <p>Waiting for live data...</p>
                    <p className="text-xs text-gray-600 mt-2">Connected to WebSocket</p>
                </div>
            );
        }

        const isPositive = currentStockData.change >= 0;
        const stockName = selectedAsset?.name || searchedStock || 'N/A';

        return (
            <div>
                 <div className="flex items-end gap-4 mb-2">
                    <h2 className="text-2xl font-bold text-white">{stockName}</h2>
                    <span className="text-xs text-green-500">● LIVE</span>
                 </div>
                 <div className="flex items-end gap-4 mb-6">
                    <h2 className="text-4xl font-bold text-white">{formatPrice(currentStockData.price)}</h2>
                    <div className={`text-xl font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                        {isPositive ? '+' : ''}{formatPrice(currentStockData.change, 2).replace('$', '')} ({formatPercent(currentStockData.changePercent)})
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
                    <div className="space-y-1">
                        <p className="text-gray-400">Open</p>
                        <p className="text-white font-medium">{formatPrice(currentStockData.open)}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-gray-400">Day High</p>
                        <p className="text-white font-medium">{formatPrice(currentStockData.high)}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-gray-400">Day Low</p>
                        <p className="text-white font-medium">{formatPrice(currentStockData.low)}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-gray-400">Volume</p>
                        <p className="text-white font-medium">{formatLargeNumber(currentStockData.volume)}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-gray-400">Market Cap</p>
                        <p className="text-white font-medium">{formatLargeNumber(currentStockData.marketCap)}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <Command className="relative border border-zinc-800 rounded-md bg-[#1c1c1c] overflow-visible">
                <CommandInput
                    ref={inputRef}
                    placeholder="Search for a stock (e.g., AAPL)"
                    value={searchTerm}
                    onValueChange={setSearchTerm}
                    onFocus={() => setOpen(true)}
                    onBlur={handleBlur}
                    className="h-9 bg-[#1c1c1c] text-white placeholder-gray-500 border-none focus:ring-0"
                />
                {open && (
                    <div className="absolute top-full mt-2 w-full z-10 rounded-md border border-zinc-700 bg-[#1c1c1c] text-white">
                        <CommandList>
                            <CommandEmpty>No stock found.</CommandEmpty>
                            <CommandGroup>
                                {availableStocks
                                    .filter(stock =>
                                        stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        stock.name.toLowerCase().includes(searchTerm.toLowerCase())
                                    )
                                    .map((stock) => (
                                        <CommandItem
                                            key={stock.id}
                                            value={stock.symbol}
                                            onSelect={() => handleSelectStock(stock.symbol)}
                                            className="cursor-pointer hover:bg-zinc-700 data-[selected=true]:bg-zinc-700 aria-selected:bg-zinc-700"
                                        >
                                            <span className="font-semibold">{stock.symbol}</span> - <span className="text-gray-400">{stock.name}</span>
                                        </CommandItem>
                                    ))}
                            </CommandGroup>
                        </CommandList>
                    </div>
                )}
            </Command>

            <AnimatePresence>
                {searchedStock && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card className="border-zinc-800 mt-6" style={{ background: `linear-gradient(135deg, ${activeCategoryData.color}10 0%, #1c1c1c 100%)` }}>
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2 text-lg">
                                    Overview for {searchedStock}
                                    {isConnected && <span className="text-xs text-green-500 font-normal">● Live</span>}
                                </CardTitle>
                                <CardDescription className="text-gray-400 text-xs">
                                    Real-time stock data from your local API
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {renderOverviewContent()}
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default StocksTab;