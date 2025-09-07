import { useEffect, useState } from 'react';
import {
  prefersReducedMotion,
  getDeviceCapabilities,
  getOptimizedVariants
} from '@/lib/utils/performance';

export interface AnimationConfig {
  disabled?: boolean;
  delay?: number;
  duration?: number;
  ease?: string | number[];
}

// Global state to avoid duplicate device capability checks
let globalDeviceCapabilities: ReturnType<typeof getDeviceCapabilities> | null = null;
let globalShouldAnimate: boolean | null = null;
let globalIsReady = false;

export const useOptimizedAnimation = (config: AnimationConfig = {}) => {
  const [isReady, setIsReady] = useState(globalIsReady);
  const [shouldAnimate, setShouldAnimate] = useState(globalShouldAnimate ?? false);
  const [deviceCapabilities, setDeviceCapabilities] = useState(globalDeviceCapabilities ?? {
    isLowEnd: false,
    supportsWebGL: false
  });

  useEffect(() => {
    // Only run device detection on client side
    if (typeof window === 'undefined') {
      setIsReady(true);
      return;
    }

    // Use cached values if available
    if (globalDeviceCapabilities && globalShouldAnimate !== null) {
      setDeviceCapabilities(globalDeviceCapabilities);
      setShouldAnimate(globalShouldAnimate);
      setIsReady(true);
      return;
    }

    // Check user preferences and device capabilities
    const userPrefersReducedMotion = prefersReducedMotion();
    const capabilities = getDeviceCapabilities();

    // Update global state
    globalDeviceCapabilities = capabilities;
    globalShouldAnimate = !userPrefersReducedMotion && !capabilities.isLowEnd && !config.disabled;
    globalIsReady = true;

    setDeviceCapabilities(capabilities);
    setShouldAnimate(globalShouldAnimate);
    setIsReady(true);
  }, [config.disabled]);

  const getVariants = () => {
    if (!shouldAnimate) {
      return getOptimizedVariants();
    }

    return getOptimizedVariants();
  };

  const getTransition = (overrides: AnimationConfig = {}) => {
    if (!shouldAnimate) {
      return { duration: 0 };
    }

    return {
      duration: config.duration || 0.6,
      delay: config.delay || 0,
      ease: (config.ease as any) || "easeOut",
      ...overrides
    };
  };

  return {
    isReady,
    shouldAnimate,
    deviceCapabilities,
    variants: getVariants(),
    getTransition,
    prefersReducedMotion: prefersReducedMotion(),
    isLowEndDevice: deviceCapabilities.isLowEnd
  };
};
