'use client';

/**
 * Lazy-loaded components to improve initial page load performance
 * These components are loaded only when needed, reducing the initial bundle size
 */

import dynamic from 'next/dynamic';

// Lazy load heavy animation components
export const BackgroundBeams = dynamic(
  () => import('@/components/ui/background-beams').then(mod => mod.BackgroundBeams),
  {
    ssr: false,
    loading: () => null,
  }
);

export const TextGenerateEffect = dynamic(
  () => import('@/components/ui/text-generate-effect').then(mod => mod.TextGenerateEffect),
  {
    ssr: false,
    loading: () => <div className="h-20" />,
  }
);

export const SparklesCore = dynamic(
  () => import('@/components/ui/sparkles').then(mod => mod.SparklesCore),
  {
    ssr: false,
    loading: () => null,
  }
);

export const AnimatedCounter = dynamic(
  () => import('@/components/ui/animated-counter').then(mod => mod.AnimatedCounter),
  {
    ssr: false,
    loading: () => <span>0</span>,
  }
);

export const MovingBorder = dynamic(
  () => import('@/components/ui/moving-border').then(mod => mod.MovingBorder),
  {
    ssr: false,
    loading: () => null,
  }
);

// Lazy load chart components
export const ChartContainer = dynamic(
  () => import('@/components/ui/chart').then(mod => mod.ChartContainer),
  {
    ssr: false,
    loading: () => <div className="h-64 animate-pulse bg-slate-200 dark:bg-slate-800 rounded" />,
  }
);

// Note: Some components may need to be loaded directly if they don't have default exports
// Use these as examples for other components that need lazy loading
