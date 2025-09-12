// src/app/api/stock/[ticker]/route.ts
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  context: { params: { ticker: string } }
) {
  // Await the params before accessing its properties
  const params = await context.params;
  const ticker = params.ticker.toUpperCase();
  const apiKey = process.env.POLYGON_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'API key is not configured or is a placeholder.' }, { status: 500 });
  }
  if (!ticker) {
    return NextResponse.json({ error: 'Ticker symbol is required' }, { status: 400 });
  }

  try {
    // Set a timeout for API requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 seconds

    // Fetch previous day's close, high, low, open, volume
    const prevDayUrl = `https://api.polygon.io/v2/aggs/ticker/${ticker}/prev?adjusted=true&apiKey=${apiKey}`;
    const prevDayResponse = await fetch(prevDayUrl, { signal: controller.signal });
    
    // Fetch ticker details for name and market cap
    const detailsUrl = `https://api.polygon.io/v3/reference/tickers/${ticker}?apiKey=${apiKey}`;
    const detailsResponse = await fetch(detailsUrl, { signal: controller.signal });
    
    clearTimeout(timeoutId);

    if (!prevDayResponse.ok) {
        const errorData = await prevDayResponse.json();
        throw new Error(errorData.error || `Failed to fetch previous day data for ${ticker}`);
    }
    if (!detailsResponse.ok) {
        const errorData = await detailsResponse.json();
        throw new Error(errorData.error || `Failed to fetch ticker details for ${ticker}`);
    }

    const prevDayData = await prevDayResponse.json();
    const detailsData = await detailsResponse.json();

    const prevDay = prevDayData.results?.[0];
    const details = detailsData.results;
    
    if (!prevDay || !details) {
        return NextResponse.json({ error: `No data found for ticker: ${ticker}` }, { status: 404 });
    }

    const regularMarketPrice = prevDay.c; // Previous day's close price
    const regularMarketOpen = prevDay.o;
    const regularMarketChange = prevDay.c - prevDay.o; // Change from open to close of the previous day
    const regularMarketChangePercent = (regularMarketChange / regularMarketOpen);

    const stockData = {
      symbol: prevDay.T,
      name: details.name,
      regularMarketPrice: regularMarketPrice,
      regularMarketChange: regularMarketChange,
      regularMarketChangePercent: regularMarketChangePercent,
      regularMarketDayHigh: prevDay.h,
      regularMarketDayLow: prevDay.l,
      regularMarketVolume: prevDay.v,
      marketCap: details.market_cap,
      regularMarketOpen: regularMarketOpen,
    };
    
    return NextResponse.json(stockData);

  } catch (error: any) {
    console.error(`Polygon API Error for ${ticker}:`, error.message);
    const errorMessage = error.name === 'AbortError' ? 'Request to Polygon API timed out.' : error.message;
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}