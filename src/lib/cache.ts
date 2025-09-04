// Simple in-memory cache for API responses
// In production, replace with Redis or similar

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class MemoryCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  
  set<T>(key: string, data: T, ttlMs: number = 300000): void { // Default 5 minutes
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    });
  }
  
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }
  
  delete(key: string): void {
    this.cache.delete(key);
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  // Clear expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

export const apiCache = new MemoryCache();

// Cache key generators for consistent naming
export const cacheKeys = {
  topicQuestions: (topicSlug: string, userId: string) => `questions:${topicSlug}:${userId}`,
  randomQuestions: (count: number, userId: string) => `random:${count}:${userId}`,
  userProgress: (userId: string) => `progress:${userId}`,
  topicProgress: (userId: string) => `topics:${userId}`,
  userAttempts: (userId: string) => `attempts:${userId}`,
};

// Cleanup expired cache entries every 10 minutes
if (typeof window === 'undefined') { // Server-side only
  setInterval(() => {
    apiCache.cleanup();
  }, 600000); // 10 minutes
}
