// src/lib/hooks/useStockWebSocket.ts
import { useEffect, useRef, useState, useCallback } from 'react';

export interface StockUpdate {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  high?: number;
  low?: number;
  open?: number;
  marketCap?: number;
  timestamp: string;
}

interface UseStockWebSocketOptions {
  symbols: string[];
  apiUrl?: string;
  enabled?: boolean;
  onUpdate?: (data: StockUpdate) => void;
  onError?: (error: Error) => void;
}

const DEFAULT_WS_URL = process.env.NEXT_PUBLIC_STOCK_WEBSOCKET_URL || 'wss://localhost:7039/ws/stock';

export function useStockWebSocket({
  symbols,
  apiUrl = DEFAULT_WS_URL,
  enabled = true,
  onUpdate,
  onError,
}: UseStockWebSocketOptions) {
  const [stockData, setStockData] = useState<Map<string, StockUpdate>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (!enabled || symbols.length === 0) return;

    try {
      // Close existing connection
      if (wsRef.current) {
        wsRef.current.close();
      }

      const ws = new WebSocket(apiUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;

        // Subscribe to symbols
        ws.send(JSON.stringify({
          action: 'subscribe',
          symbols: symbols,
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as StockUpdate;

          setStockData(prev => {
            const newData = new Map(prev);
            newData.set(data.symbol, data);
            return newData;
          });

          onUpdate?.(data);
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      ws.onerror = (event) => {
        const err = new Error('WebSocket error occurred');
        console.error('WebSocket error:', event);
        setError(err);
        onError?.(err);
      };

      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        setIsConnected(false);
        wsRef.current = null;

        // Attempt to reconnect if it wasn't a clean close
        if (enabled && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current})`);

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        }
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to connect to WebSocket');
      setError(error);
      onError?.(error);
    }
  }, [apiUrl, enabled, symbols, onUpdate, onError]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const subscribe = useCallback((newSymbols: string[]) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        action: 'subscribe',
        symbols: newSymbols,
      }));
    }
  }, []);

  const unsubscribe = useCallback((symbolsToRemove: string[]) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        action: 'unsubscribe',
        symbols: symbolsToRemove,
      }));
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  // Update subscriptions when symbols change
  useEffect(() => {
    if (isConnected && wsRef.current) {
      wsRef.current.send(JSON.stringify({
        action: 'subscribe',
        symbols: symbols,
      }));
    }
  }, [symbols, isConnected]);

  return {
    stockData,
    isConnected,
    error,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
  };
}
