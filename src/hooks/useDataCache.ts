import { useState, useCallback } from 'react';
import { CacheItem } from '../types/types';

// Default cache expiry time in milliseconds (30 minutes)
const DEFAULT_CACHE_EXPIRY = 30 * 60 * 1000;

export function useDataCache<T>() {
  // Use state to store the cache
  const [cache, setCache] = useState<Record<string, CacheItem<T>>>({});

  // Function to set data in cache with a key
  const setCachedData = useCallback((key: string, data: T, expiryTime = DEFAULT_CACHE_EXPIRY) => {
    const now = Date.now();
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: now,
      expiry: now + expiryTime
    };

    setCache(prevCache => ({
      ...prevCache,
      [key]: cacheItem
    }));
  }, []);

  // Function to get data from cache by key
  const getCachedData = useCallback((key: string): T | null => {
    const cacheItem = cache[key];
    
    // If no cache item exists or it's expired, return null
    if (!cacheItem || Date.now() > cacheItem.expiry) {
      return null;
    }
    
    return cacheItem.data;
  }, [cache]);

  // Function to clear the entire cache
  const clearCache = useCallback(() => {
    setCache({});
  }, []);

  // Function to remove a specific item from cache
  const removeCacheItem = useCallback((key: string) => {
    setCache(prevCache => {
      const newCache = { ...prevCache };
      delete newCache[key];
      return newCache;
    });
  }, []);

  return {
    cachedData: cache,
    setCachedData,
    getCachedData,
    clearCache,
    removeCacheItem
  };
}
