# WebSocket Stock Data Integration

This document describes the WebSocket integration for real-time stock data in the Stock Management Site.

## Overview

The application has been updated to remove the Polygon API dependency and instead connect to your local WebSocket API for real-time stock price updates.

## Configuration

### Environment Variables

Add the following to your `.env.local` file:

```bash
# Stock WebSocket API Configuration
NEXT_PUBLIC_STOCK_WEBSOCKET_URL=wss://localhost:7039/ws/stock
```

**Note:** Use `wss://` for HTTPS (port 7039) or `ws://` for HTTP (port 5268)

### Local API Requirements

Your local API should implement the WebSocket endpoint at `/ws/stock` as shown in your code:

```csharp
app.Map("/ws/stock", async (HttpContext context, StockWebSocketManager manager, ILogger<Program> logger) =>
{
    if (context.WebSockets.IsWebSocketRequest)
    {
        using var webSocket = await context.WebSockets.AcceptWebSocketAsync();
        await StockWebSocketHandler.HandleWebSocketConnection(webSocket, manager, logger);
    }
    else
    {
        context.Response.StatusCode = 400;
    }
});
```

## WebSocket Protocol

### Client → Server Messages

The client sends subscription messages in the following format:

```json
{
  "action": "subscribe",
  "symbols": ["AAPL", "MSFT", "GOOGL"]
}
```

To unsubscribe from symbols:

```json
{
  "action": "unsubscribe",
  "symbols": ["AAPL"]
}
```

### Server → Client Messages

Your server should send stock updates in the following format:

```json
{
  "symbol": "AAPL",
  "price": 150.25,
  "change": 2.50,
  "changePercent": 0.0169,
  "volume": 50000000,
  "high": 152.00,
  "low": 148.50,
  "open": 149.00,
  "marketCap": 2500000000000,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Required Fields
- `symbol` (string): Stock ticker symbol
- `price` (number): Current stock price
- `change` (number): Price change from previous close
- `changePercent` (number): Percentage change (as decimal, e.g., 0.0169 for 1.69%)
- `timestamp` (string): ISO 8601 timestamp

### Optional Fields
- `volume` (number): Trading volume
- `high` (number): Day high price
- `low` (number): Day low price
- `open` (number): Opening price
- `marketCap` (number): Market capitalization

## Features Using WebSocket

### 1. Stock Search Tab
- Displays real-time stock data for selected stocks
- Shows live indicator when connected
- Auto-reconnects on connection loss

### 2. Portfolio Tab
- Real-time price updates for all holdings
- Live gain/loss calculations
- Green dot indicator for stocks receiving live updates

### 3. Dashboard Tab
- Live portfolio value updates
- Real-time performance metrics
- Top 5 holdings with current prices

## Stock Data Source

Stock symbols are now loaded from the Supabase `assets` table instead of a hardcoded list. The application queries:

```typescript
getAssets({
  assetType: 'stock',
  isActive: true
})
```

Make sure your Supabase database has stocks populated in the `assets` table.

## Connection Management

The WebSocket hook (`useStockWebSocket`) handles:
- Automatic connection on component mount
- Reconnection with exponential backoff (max 5 attempts)
- Subscription management when symbols change
- Clean disconnection on unmount
- Error handling and reporting

## Troubleshooting

### WebSocket fails to connect

1. Verify your local API is running at the configured URL
2. Check browser console for connection errors
3. Ensure WebSocket endpoint is accessible (check CORS if needed)
4. Verify SSL certificate if using `wss://`

### No stock data received

1. Check that your server is sending messages in the correct format
2. Verify the subscription message is being received by your server
3. Check browser console for parsing errors
3. Ensure stock symbols exist in your local API data

### Stocks not loading in search

1. Verify Supabase connection is working
2. Check that the `assets` table has stocks with `asset_type = 'stock'` and `is_active = true`
3. Check browser console for database errors

## Removed Dependencies

- ❌ Polygon API integration (`/api/stock/[ticker]/route.ts`)
- ❌ `POLYGON_API_KEY` environment variable
- ❌ Hardcoded stock list in `StockTab.tsx`

## Added Dependencies

- ✅ WebSocket hook (`useStockWebSocket`)
- ✅ Supabase assets table integration
- ✅ `NEXT_PUBLIC_STOCK_WEBSOCKET_URL` environment variable
- ✅ Real-time price updates across all views
