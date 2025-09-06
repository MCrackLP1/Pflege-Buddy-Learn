/**
 * Performance utilities for optimizing animations and interactions
 * on low-end devices and respecting user preferences
 */

// Check if user prefers reduced motion
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;

  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  return mediaQuery.matches;
};

// Check device performance capabilities
export const getDeviceCapabilities = () => {
  if (typeof window === 'undefined') return { isLowEnd: false, supportsWebGL: false };

  const connection = (navigator as any).connection;
  const deviceMemory = (navigator as any).deviceMemory;
  const hardwareConcurrency = navigator.hardwareConcurrency;

  // Check for low-end device indicators
  const isSlowConnection = connection && (
    connection.effectiveType === 'slow-2g' ||
    connection.effectiveType === '2g' ||
    connection.saveData === true
  );

  const isLowMemory = deviceMemory && deviceMemory < 4;
  const isLowConcurrency = hardwareConcurrency && hardwareConcurrency < 4;

  const isLowEnd = isSlowConnection || isLowMemory || isLowConcurrency;

  // Check WebGL support for complex animations
  let supportsWebGL = false;
  try {
    const canvas = document.createElement('canvas');
    supportsWebGL = !!(window.WebGLRenderingContext && canvas.getContext('webgl'));
  } catch (e) {
    supportsWebGL = false;
  }

  return {
    isLowEnd,
    supportsWebGL,
    connectionType: connection?.effectiveType || 'unknown',
    deviceMemory: deviceMemory || 'unknown',
    hardwareConcurrency: hardwareConcurrency || 'unknown'
  };
};

// Debounce function for performance optimization
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate?: boolean
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };

    const callNow = immediate && !timeout;

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) func(...args);
  };
};

// Throttle function for scroll and resize events
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Intersection Observer with performance optimizations
export const createOptimizedIntersectionObserver = (
  callback: IntersectionObserverCallback,
  options: IntersectionObserverInit = {}
) => {
  if (typeof window === 'undefined') return null;

  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  };

  return new IntersectionObserver(callback, defaultOptions);
};

// Animation frame utilities
export const requestAnimationFrame = (() => {
  if (typeof window === 'undefined') return (cb: () => void) => setTimeout(cb, 16);

  return window.requestAnimationFrame ||
         (window as any).webkitRequestAnimationFrame ||
         ((cb: () => void) => setTimeout(cb, 16));
})();

export const cancelAnimationFrame = (() => {
  if (typeof window === 'undefined') return (id: number) => clearTimeout(id);

  return window.cancelAnimationFrame ||
         (window as any).webkitCancelAnimationFrame ||
         ((id: number) => clearTimeout(id));
})();

// Performance monitoring
export const measurePerformance = (name: string, fn: () => void) => {
  if (typeof window === 'undefined') return fn();

  const start = performance.now();
  const result = fn();
  const end = performance.now();

  console.log(`${name} took ${end - start} milliseconds`);
  return result;
};

// Check if animations should be disabled
export const shouldDisableAnimations = (): boolean => {
  return prefersReducedMotion() || getDeviceCapabilities().isLowEnd;
};

// Optimized animation variants for Framer Motion
export const getOptimizedVariants = () => {
  const disableAnimations = shouldDisableAnimations();

  return {
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: disableAnimations ? { duration: 0 } : { duration: 0.6 }
    },
    slideUp: {
      initial: { opacity: 0, y: disableAnimations ? 0 : 30 },
      animate: { opacity: 1, y: 0 },
      transition: disableAnimations ? { duration: 0 } : { duration: 0.6, ease: "easeOut" }
    },
    scaleIn: {
      initial: { opacity: 0, scale: disableAnimations ? 1 : 0.9 },
      animate: { opacity: 1, scale: 1 },
      transition: disableAnimations ? { duration: 0 } : { duration: 0.5, ease: "easeOut" }
    }
  };
};
