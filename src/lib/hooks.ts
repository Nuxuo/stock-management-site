import { useState, useEffect } from 'react';

/**
 * A custom hook to manage state that persists in localStorage with a Time-to-Live (TTL).
 * @param key The key to use in localStorage.
 * @param defaultValue The default value if nothing is in localStorage or the item is expired.
 * @param ttlMinutes The number of minutes until the cached data expires.
 * @returns A stateful value, and a function to update it.
 */
export function usePersistentState<T>(key: string, defaultValue: T, ttlMinutes: number) {
  const [state, setState] = useState<T>(defaultValue);

  useEffect(() => {
    try {
      const storedValue = localStorage.getItem(key);
      if (storedValue) {
        const item = JSON.parse(storedValue);
        const now = new Date().getTime();
        if (item.expiry && now < item.expiry) {
          setState(item.value);
        } else {
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.error(`Error reading localStorage key “${key}”:`, error);
    }
  }, [key]); 

  useEffect(() => {
    try {
      const now = new Date().getTime();
      const expiry = now + ttlMinutes * 60 * 1000;
      const item = { value: state, expiry };
      localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
        console.error(`Error setting localStorage key “${key}”:`, error);
    }
  }, [key, state, ttlMinutes]);

  return [state, setState] as const;
}