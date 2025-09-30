/**
 * Safe Storage Utilities
 * 
 * Provides localStorage functionality with fallback mechanisms
 * for environments where localStorage is blocked or unavailable
 */

type StorageValue = string | null;

class SafeStorage {
  private storage: Storage | null = null;
  private fallbackStorage = new Map<string, string>();
  private isLocalStorageAvailable = false;

  constructor() {
    this.initializeStorage();
  }

  private initializeStorage() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        // Test if localStorage is actually usable
        const testKey = '__localStorage_test__';
        localStorage.setItem(testKey, 'test');
        localStorage.removeItem(testKey);
        
        this.storage = localStorage;
        this.isLocalStorageAvailable = true;
        console.log('✅ localStorage available');
      }
    } catch (error) {
      console.warn('⚠️ localStorage not available, using fallback storage:', error);
      
      // Try sessionStorage as fallback
      try {
        if (typeof window !== 'undefined' && window.sessionStorage) {
          const testKey = '__sessionStorage_test__';
          sessionStorage.setItem(testKey, 'test');
          sessionStorage.removeItem(testKey);
          
          this.storage = sessionStorage;
          console.log('✅ sessionStorage available as fallback');
        }
      } catch {
        console.warn('⚠️ sessionStorage also not available, using memory storage');
        // Will use in-memory fallback
      }
    }
  }

  setItem(key: string, value: string): boolean {
    try {
      if (this.storage) {
        this.storage.setItem(key, value);
        return true;
      } else {
        // Memory fallback
        this.fallbackStorage.set(key, value);
        return true;
      }
    } catch (error) {
      console.warn(`Failed to set storage item "${key}":`, error);
      // Try memory fallback as last resort
      this.fallbackStorage.set(key, value);
      return false;
    }
  }

  getItem(key: string): StorageValue {
    try {
      if (this.storage) {
        return this.storage.getItem(key);
      } else {
        // Memory fallback
        return this.fallbackStorage.get(key) || null;
      }
    } catch (error) {
      console.warn(`Failed to get storage item "${key}":`, error);
      // Try memory fallback
      return this.fallbackStorage.get(key) || null;
    }
  }

  removeItem(key: string): boolean {
    try {
      if (this.storage) {
        this.storage.removeItem(key);
        return true;
      } else {
        // Memory fallback
        this.fallbackStorage.delete(key);
        return true;
      }
    } catch (error) {
      console.warn(`Failed to remove storage item "${key}":`, error);
      // Try memory fallback
      this.fallbackStorage.delete(key);
      return false;
    }
  }

  clear(): boolean {
    try {
      if (this.storage) {
        this.storage.clear();
        return true;
      } else {
        // Memory fallback
        this.fallbackStorage.clear();
        return true;
      }
    } catch (error) {
      console.warn('Failed to clear storage:', error);
      this.fallbackStorage.clear();
      return false;
    }
  }

  isAvailable(): boolean {
    return this.isLocalStorageAvailable;
  }

  getStorageType(): 'localStorage' | 'sessionStorage' | 'memory' {
    if (this.storage === localStorage) return 'localStorage';
    if (this.storage === sessionStorage) return 'sessionStorage';
    return 'memory';
  }
}

// Export singleton instance
export const safeStorage = new SafeStorage();

// Convenience functions
export function setStorageItem(key: string, value: string): boolean {
  return safeStorage.setItem(key, value);
}

export function getStorageItem(key: string): StorageValue {
  return safeStorage.getItem(key);
}

export function removeStorageItem(key: string): boolean {
  return safeStorage.removeItem(key);
}

export function clearStorage(): boolean {
  return safeStorage.clear();
}

export function isStorageAvailable(): boolean {
  return safeStorage.isAvailable();
}

export function getStorageType(): 'localStorage' | 'sessionStorage' | 'memory' {
  return safeStorage.getStorageType();
}
