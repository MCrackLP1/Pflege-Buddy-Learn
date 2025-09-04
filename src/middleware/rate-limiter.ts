// Simple rate limiter for API endpoints
// In production, use Redis-based solution

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits = new Map<string, RateLimitEntry>();
  
  // Check if request should be allowed
  checkLimit(
    identifier: string, 
    maxRequests: number = 100, 
    windowMs: number = 900000 // 15 minutes default
  ): { allowed: boolean; resetTime: number; remaining: number } {
    const now = Date.now();
    const entry = this.limits.get(identifier);
    
    // No previous entry or window expired
    if (!entry || now > entry.resetTime) {
      this.limits.set(identifier, {
        count: 1,
        resetTime: now + windowMs
      });
      
      return {
        allowed: true,
        resetTime: now + windowMs,
        remaining: maxRequests - 1
      };
    }
    
    // Within window - check limit
    if (entry.count >= maxRequests) {
      return {
        allowed: false,
        resetTime: entry.resetTime,
        remaining: 0
      };
    }
    
    // Increment counter
    entry.count++;
    this.limits.set(identifier, entry);
    
    return {
      allowed: true,
      resetTime: entry.resetTime,
      remaining: maxRequests - entry.count
    };
  }
  
  // Reset limit for identifier
  reset(identifier: string): void {
    this.limits.delete(identifier);
  }
  
  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetTime) {
        this.limits.delete(key);
      }
    }
  }
}

export const rateLimiter = new RateLimiter();

// Cleanup expired entries every 5 minutes
if (typeof window === 'undefined') {
  setInterval(() => {
    rateLimiter.cleanup();
  }, 300000);
}

// Rate limit presets for different endpoints
export const RATE_LIMITS = {
  // Quiz endpoints - more generous for learning
  QUIZ: { maxRequests: 60, windowMs: 900000 }, // 60 requests per 15 min
  
  // User progress - moderate limit
  PROGRESS: { maxRequests: 30, windowMs: 900000 }, // 30 requests per 15 min
  
  // Attempts saving - generous for quiz flow
  ATTEMPTS: { maxRequests: 120, windowMs: 900000 }, // 120 per 15 min
  
  // Payment endpoints - strict limit
  PAYMENT: { maxRequests: 10, windowMs: 3600000 }, // 10 per hour
  
  // Auth endpoints - moderate security
  AUTH: { maxRequests: 20, windowMs: 900000 }, // 20 per 15 min
} as const;
