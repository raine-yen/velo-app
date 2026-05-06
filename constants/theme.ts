/**
 * Velo Design System
 * Dark-first, premium athletic aesthetic with lime accent.
 * Mirrors the landing page design language.
 */

import { Platform } from 'react-native';

export const Colors = {
  // Velo design uses a single dark theme by default.
  // We expose both light/dark for compatibility but route everything to dark.
  dark: {
    background: '#0a0a0a',
    surface: '#141414',
    surfaceElevated: '#1a1a1a',
    border: '#1f1f1f',
    borderMuted: '#141414',
    text: '#fafafa',
    textMuted: '#9ca3af',
    textDim: '#6b7280',
    accent: '#c7ff1a',
    accentMuted: '#9bbf14',
    danger: '#ff4d4f',
    success: '#34d399',
    warning: '#f59e0b',

    // Tab bar tokens
    tint: '#c7ff1a',
    icon: '#6b7280',
    tabIconDefault: '#6b7280',
    tabIconSelected: '#c7ff1a',
  },
  light: {
    background: '#ffffff',
    surface: '#f5f5f5',
    surfaceElevated: '#ebebeb',
    border: '#e5e5e5',
    borderMuted: '#f0f0f0',
    text: '#0a0a0a',
    textMuted: '#4b5563',
    textDim: '#9ca3af',
    accent: '#84cc16',
    accentMuted: '#65a30d',
    danger: '#ef4444',
    success: '#10b981',
    warning: '#f59e0b',

    tint: '#84cc16',
    icon: '#9ca3af',
    tabIconDefault: '#9ca3af',
    tabIconSelected: '#84cc16',
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
};

export const FontSizes = {
  caption: 11,
  small: 13,
  body: 15,
  bodyLg: 17,
  title: 22,
  display: 32,
  hero: 44,
};

export const FontWeights = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
