// src/components/data_viz/tabs/StocksTab.tsx
"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { StockData, Category } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';

const availableStocks = [
    { ticker: 'AAPL', name: 'Apple Inc.' },
    { ticker: 'MSFT', name: 'Microsoft Corp.' },
    { ticker: 'GOOGL', name: 'Alphabet Inc. (Class A)' },
    { ticker: 'AMZN', name: 'Amazon.com Inc.' },
    { ticker: 'NVDA', name: 'NVIDIA Corp.' },
    { ticker: 'TSLA', name: 'Tesla Inc.' },
    { ticker: 'META', name: 'Meta Platforms Inc.' },
    { ticker: 'BRK-B', name: 'Berkshire Hathaway Inc. (Class B)' },
    { ticker: 'JPM', name: 'JPMorgan Chase & Co.' },
    { ticker: 'V', name: 'Visa Inc.' },
    { ticker: 'JNJ', name: 'Johnson & Johnson' },
    { ticker: 'WMT', name: 'Walmart Inc.' },
    { ticker: 'PG', name: 'Procter & Gamble Co.' },
    { ticker: 'UNH', name: 'UnitedHealth Group Inc.' },
    { ticker: 'HD', name: 'Home Depot Inc.' },
];


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
    const [searchedStock, setSearchedStock] = useState<string | null>('AAPL'); // Default to AAPL
    const [stockData, setStockData] = useState<StockData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!searchedStock) return;

        const fetchStockData = async () => {
            setLoading(true);
            setError(null);
            setStockData(null);
            try {
                const response = await fetch(`/api/stock/${searchedStock}`);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to fetch stock data');
                }
                const data = await response.json();
                setStockData(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStockData();
    }, [searchedStock]);

    const handleSelectStock = (ticker: string) => {
        setSearchedStock(ticker);
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
        if (loading) {
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
                </div>
            );
        }

        if (error) {
            return (
                <div className="text-center text-red-400">
                    <p>Error: {error}</p>
                </div>
            );
        }

        if (!stockData) {
            return (
                <div className="text-center text-gray-500">
                    <p>Search for a stock to see its overview.</p>
                </div>
            )
        }
        
        const isPositive = stockData.regularMarketChange ? stockData.regularMarketChange >= 0 : false;
        const stockName = stockData.name || 'N/A';

        return (
            <div>
                 <div className="flex items-end gap-4 mb-2">
                    <h2 className="text-2xl font-bold text-white">{stockName}</h2>
                 </div>
                 <div className="flex items-end gap-4 mb-6">
                    <h2 className="text-4xl font-bold text-white">{formatPrice(stockData.regularMarketPrice)}</h2>
                    <div className={`text-xl font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                        {isPositive ? '+' : ''}{formatPrice(stockData.regularMarketChange, 2).replace('$', '')} ({formatPercent(stockData.regularMarketChangePercent)})
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
                    <div className="space-y-1">
                        <p className="text-gray-400">Open</p>
                        <p className="text-white font-medium">{formatPrice(stockData.regularMarketOpen)}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-gray-400">Day High</p>
                        <p className="text-white font-medium">{formatPrice(stockData.regularMarketDayHigh)}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-gray-400">Day Low</p>
                        <p className="text-white font-medium">{formatPrice(stockData.regularMarketDayLow)}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-gray-400">Volume</p>
                        <p className="text-white font-medium">{formatLargeNumber(stockData.regularMarketVolume)}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-gray-400">Market Cap</p>
                        <p className="text-white font-medium">{formatLargeNumber(stockData.marketCap)}</p>
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
                                        stock.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        stock.name.toLowerCase().includes(searchTerm.toLowerCase())
                                    )
                                    .map((stock) => (
                                        <CommandItem
                                            key={stock.ticker}
                                            value={stock.ticker}
                                            onSelect={() => handleSelectStock(stock.ticker)}
                                            className="cursor-pointer hover:bg-zinc-700 data-[selected=true]:bg-zinc-700 aria-selected:bg-zinc-700"
                                        >
                                            <span className="font-semibold">{stock.ticker}</span> - <span className="text-gray-400">{stock.name}</span>
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
                                <CardTitle className="text-white flex items-center gap-2 text-lg">Overview for {searchedStock}</CardTitle>
                                <CardDescription className="text-gray-400 text-xs">Previous trading day's data for {searchedStock}.</CardDescription>
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