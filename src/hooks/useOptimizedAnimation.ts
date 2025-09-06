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

export const useOptimizedAnimation = (config: AnimationConfig = {}) => {
  const [isReady, setIsReady] = useState(false);
  const [shouldAnimate, setShouldAnimate] = useState(false); // Start with false for SSR
  const [deviceCapabilities, setDeviceCapabilities] = useState({
    isLowEnd: false,
    supportsWebGL: false
  });

  useEffect(() => {
    // Only run device detection on client side
    if (typeof window === 'undefined') {
      setIsReady(true);
      return;
    }

    // Check user preferences and device capabilities
    const userPrefersReducedMotion = prefersReducedMotion();
    const capabilities = getDeviceCapabilities();

    setDeviceCapabilities(capabilities);

    // Determine if animations should run
    const shouldDisable = userPrefersReducedMotion ||
                         capabilities.isLowEnd ||
                         config.disabled ||
                         false;

    setShouldAnimate(!shouldDisable);
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
