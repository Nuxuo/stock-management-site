// src/components/data_viz/tabs/NewsTab.tsx
"use client";
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Newspaper, User, Star, Clock, TrendingUp, Globe, AlertCircle } from 'lucide-react';
import { Category } from '@/lib/types';

// Mock data
const newsHighlights = [
    { title: '156 articles', subtitle: 'Published Today', icon: 'Newspaper' },
    { title: '42 breaking', subtitle: 'Breaking News', icon: 'AlertCircle' },
    { title: '28 mentions', subtitle: 'Portfolio Mentions', icon: 'TrendingUp' },
    { title: '15 updates', subtitle: 'Earnings Reports', icon: 'Globe' }
];

const mockTopStories = [
    {
        title: "Fed Signals Potential Rate Cut in Next Meeting",
        source: "Reuters",
        time: "15 minutes ago",
        summary: "Federal Reserve officials hint at possible interest rate reduction amid cooling inflation data...",
        impact: "High",
        relatedStocks: ["SPY", "QQQ", "DIA"]
    },
    {
        title: "NVIDIA Announces Revolutionary AI Chip Architecture",
        source: "TechCrunch",
        time: "1 hour ago",
        summary: "NVIDIA unveils next-generation GPU architecture promising 5x performance improvement for AI workloads...",
        impact: "High",
        relatedStocks: ["NVDA", "AMD", "INTC"]
    },
    {
        title: "Apple's Vision Pro Sales Exceed Expectations",
        source: "Bloomberg",
        time: "2 hours ago",
        summary: "Apple reports stronger than expected demand for Vision Pro headset in international markets...",
        impact: "Medium",
        relatedStocks: ["AAPL", "META", "GOOGL"]
    },
    {
        title: "Oil Prices Surge on Middle East Tensions",
        source: "WSJ",
        time: "3 hours ago",
        summary: "Crude oil futures jump 4% as geopolitical tensions escalate in key producing regions...",
        impact: "High",
        relatedStocks: ["XOM", "CVX", "COP"]
    },
];

const mockPersonalizedFeed = [
    {
        title: "Your Portfolio Stock AAPL Hits New 52-Week High",
        source: "Market Watch",
        time: "30 minutes ago",
        summary: "Apple shares reach new heights following strong iPhone sales data...",
        type: "Portfolio Alert",
        ticker: "AAPL"
    },
    {
        title: "Analyst Upgrades MSFT to Strong Buy",
        source: "Seeking Alpha",
        time: "45 minutes ago",
        summary: "Goldman Sachs raises Microsoft price target to $450 citing cloud growth...",
        type: "Analyst Update",
        ticker: "MSFT"
    },
    {
        title: "Breaking: Tesla Announces Stock Split",
        source: "CNBC",
        time: "1 hour ago",
        summary: "Tesla board approves 3-for-1 stock split to make shares more accessible...",
        type: "Breaking News",
        ticker: "TSLA"
    },
    {
        title: "Your Watchlist Stock AMD Reports Earnings Beat",
        source: "Yahoo Finance",
        time: "2 hours ago",
        summary: "AMD exceeds Q4 earnings expectations with strong datacenter revenue...",
        type: "Earnings",
        ticker: "AMD"
    },
];

const mockWatchlistNews = [
    {
        ticker: "NVDA",
        newsCount: 12,
        sentiment: "Positive",
        latestHeadline: "NVIDIA Partners with Major Cloud Provider for AI Infrastructure",
        time: "20 minutes ago"
    },
    {
        ticker: "TSLA",
        newsCount: 8,
        sentiment: "Mixed",
        latestHeadline: "Tesla Faces Regulatory Review in European Markets",
        time: "1 hour ago"
    },
    {
        ticker: "META",
        newsCount: 6,
        sentiment: "Positive",
        latestHeadline: "Meta's AI Assistant Reaches 500 Million Users",
        time: "2 hours ago"
    },
    {
        ticker: "AMZN",
        newsCount: 5,
        sentiment: "Neutral",
        latestHeadline: "Amazon Expands Same-Day Delivery to 10 New Cities",
        time: "3 hours ago"
    },
];

const iconMap: { [key: string]: React.ReactNode } = {
    Newspaper: <Newspaper className="w-4 h-4" />,
    AlertCircle: <AlertCircle className="w-4 h-4" />,
    TrendingUp: <TrendingUp className="w-4 h-4" />,
    Globe: <Globe className="w-4 h-4" />,
    Clock: <Clock className="w-4 h-4" />
};

const NewsTab = ({ activeSubCategory, onSubCategoryChange, activeCategoryData }: { activeSubCategory: string, onSubCategoryChange: (value: string) => void, activeCategoryData: Category }) => {
    const getImpactColor = (impact: string) => {
        if (impact === 'High') return 'text-red-500 bg-red-500/20';
        if (impact === 'Medium') return 'text-yellow-500 bg-yellow-500/20';
        return 'text-blue-500 bg-blue-500/20';
    };

    const getSentimentColor = (sentiment: string) => {
        if (sentiment === 'Positive') return 'text-green-500';
        if (sentiment === 'Negative') return 'text-red-500';
        return 'text-yellow-500';
    };

    return (
        <Tabs value={activeSubCategory} onValueChange={onSubCategoryChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-[#1c1c1c]">
                <TabsTrigger value="top-stories">Top Stories</TabsTrigger>
                <TabsTrigger value="my-feed">My Feed</TabsTrigger>
                <TabsTrigger value="watchlist-news">Watchlist News</TabsTrigger>
            </TabsList>
            
            <TabsContent value="top-stories">
                <div className="space-y-6 mt-6">
                    <Card className="border-zinc-800 overflow-hidden" style={{ background: `linear-gradient(135deg, ${activeCategoryData.color}10 0%, #1c1c1c 100%)` }}>
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2 text-lg">
                                <Newspaper className="w-4 h-4" />Breaking Financial News
                            </CardTitle>
                            <CardDescription className="text-gray-400 text-xs">
                                Latest market-moving stories and updates.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                                {newsHighlights.map((highlight, index) => (
                                    <div key={index} className="group flex items-start gap-3 p-3 rounded-lg bg-zinc-900/30 border border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-900/50 transition-all duration-200">
                                        <div className="mt-0.5 p-1.5 rounded" style={{ background: `${activeCategoryData.color}15`, color: activeCategoryData.color }}>
                                            {iconMap[highlight.icon]}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-200">{highlight.title}</p>
                                            <p className="text-xs text-gray-500">{highlight.subtitle}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="border-t border-zinc-800 pt-4">
                                <h3 className="text-sm font-semibold text-white mb-3">Top Stories</h3>
                                <div className="space-y-3">
                                    {mockTopStories.map((story, index) => (
                                        <div key={index} className="group p-3 rounded-lg bg-zinc-900/30 border border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-900/50 transition-all duration-200 cursor-pointer">
                                            <div className="flex items-start justify-between mb-2">
                                                <h4 className="text-sm font-semibold text-white flex-1 mr-2">{story.title}</h4>
                                                <span className={`text-xs px-2 py-0.5 rounded ${getImpactColor(story.impact)}`}>
                                                    {story.impact}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-400 mb-2">{story.summary}</p>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                                    <span>{story.source}</span>
                                                    <span>•</span>
                                                    <span>{story.time}</span>
                                                </div>
                                                <div className="flex gap-1">
                                                    {story.relatedStocks.map((ticker, i) => (
                                                        <span key={i} className="text-xs px-1.5 py-0.5 rounded bg-zinc-800 text-gray-400">
                                                            {ticker}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>
            
            <TabsContent value="my-feed">
                <div className="space-y-6 mt-6">
                    <Card className="border-zinc-800 overflow-hidden" style={{ background: `linear-gradient(135deg, ${activeCategoryData.color}10 0%, #1c1c1c 100%)` }}>
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2 text-lg">
                                <User className="w-4 h-4" />Personalized News Feed
                            </CardTitle>
                            <CardDescription className="text-gray-400 text-xs">
                                News tailored to your portfolio and interests.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {mockPersonalizedFeed.map((item, index) => (
                                    <div key={index} className="group p-3 rounded-lg bg-zinc-900/30 border border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-900/50 transition-all duration-200 cursor-pointer">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`text-xs px-2 py-0.5 rounded ${
                                                        item.type === 'Portfolio Alert' ? 'bg-blue-500/20 text-blue-500' :
                                                        item.type === 'Breaking News' ? 'bg-red-500/20 text-red-500' :
                                                        item.type === 'Earnings' ? 'bg-green-500/20 text-green-500' :
                                                        'bg-yellow-500/20 text-yellow-500'
                                                    }`}>
                                                        {item.type}
                                                    </span>
                                                    <span className="text-xs font-semibold text-white bg-zinc-800 px-1.5 py-0.5 rounded">
                                                        {item.ticker}
                                                    </span>
                                                </div>
                                                <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-400 mb-2">{item.summary}</p>
                                        <div className="flex items-center gap-3 text-xs text-gray-500">
                                            <span>{item.source}</span>
                                            <span>•</span>
                                            <span>{item.time}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>
            
            <TabsContent value="watchlist-news">
                <div className="space-y-6 mt-6">
                    <Card className="border-zinc-800 overflow-hidden" style={{ background: `linear-gradient(135deg, ${activeCategoryData.color}10 0%, #1c1c1c 100%)` }}>
                        <CardHeader>
                            <CardTitle className="text-white flex items-center gap-2 text-lg">
                                <Star className="w-4 h-4" />Watchlist News Summary
                            </CardTitle>
                            <CardDescription className="text-gray-400 text-xs">
                                Latest updates on stocks you're watching.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {mockWatchlistNews.map((item, index) => (
                                    <div key={index} className="group flex items-center justify-between p-3 rounded-lg bg-zinc-900/30 border border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-900/50 transition-all duration-200">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="text-sm font-semibold text-white">{item.ticker}</span>
                                                <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-gray-400">
                                                    {item.newsCount} articles
                                                </span>
                                                <span className={`text-xs font-medium ${getSentimentColor(item.sentiment)}`}>
                                                    {item.sentiment}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-400">{item.latestHeadline}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500">{item.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-zinc-800">
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span>📈 3 stocks trending positive</span>
                                    <span>📊 Total: 31 news articles</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>
        </Tabs>
    );
}

export default NewsTab;