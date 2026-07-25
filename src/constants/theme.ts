/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
    // Hairline border used to give flat surfaces a sense of depth without
    // relying on drop shadows (which barely read against a dark background).
    border: 'rgba(11,11,11,0.08)',
    borderStrong: 'rgba(11,11,11,0.16)',
    // Status "good" green, from the validated dataviz status palette - the
    // app's one accent color, used consistently for CTAs, selected states,
    // and progress fill rather than being re-picked per component.
    accent: '#0ca30c',
    accentText: '#ffffff',
    progressFill: '#0ca30c',
    progressTrack: '#e1e0d9',
  },
  dark: {
    text: '#ffffff',
    // Not pure black: a true #000000 page background makes shadows
    // invisible (nothing to contrast against) and reads as an unfinished
    // wireframe rather than a designed surface. #0d0d0d is the "page
    // plane" step from the same validated dark palette used elsewhere here.
    background: '#0d0d0d',
    backgroundElement: '#1C1D20',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
    border: 'rgba(255,255,255,0.09)',
    borderStrong: 'rgba(255,255,255,0.16)',
    // Status colors are fixed, not themed - same hex both modes (validated
    // for contrast against a dark chart surface, which pure black clears
    // with room to spare).
    accent: '#0ca30c',
    accentText: '#ffffff',
    progressFill: '#0ca30c',
    progressTrack: '#2c2c2a',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

/** Cross-platform elevation: RN's `boxShadow` style prop renders natively via Fabric on iOS/Android and as CSS on web. */
export const Shadow = {
  card: '0 1px 3px rgba(0,0,0,0.25)',
  floating: '0 4px 14px rgba(0,0,0,0.35)',
} as const;
