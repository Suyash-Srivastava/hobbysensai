/**
 * Design system: four named color families (Primary navy, Secondary steel,
 * Tertiary warm amber, Neutral grey) plus semantic role tokens derived from
 * them. Deliberately moves away from a single "dark background + one green
 * accent" look - the app's identity color per hobby (see
 * features/home/hobby-category-icon.ts) supplies the variety that a lone
 * accent color can't.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#0F172A',
    textSecondary: '#5B6472',
    background: '#F7F8FA',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#EDF0F4',
    border: 'rgba(15,23,42,0.10)',
    borderStrong: 'rgba(15,23,42,0.20)',
    // Primary CTA fill: a deep navy pop against the light page (inverted
    // from dark mode's light-on-dark treatment, same family).
    accent: '#16233F',
    accentText: '#FFFFFF',
    // Warm amber/rust label color for eyebrows and small caps - darkened
    // from the dark-mode step for legibility against a light background.
    eyebrow: '#B4550E',
    // The technique-detail sheet is a plain elevated surface in light mode -
    // the "paper card over a dark backdrop" contrast only means something
    // when the app itself is dark.
    paperSurface: '#FFFFFF',
    paperText: '#0F172A',
    error: '#DC2626',
    progressFill: '#16233F',
    progressTrack: '#E4E7EC',
  },
  dark: {
    text: '#F1F5F9',
    textSecondary: '#94A3B8',
    // Not pure black: a true #000000 page background makes shadows
    // invisible (nothing to contrast against) and reads as an unfinished
    // wireframe rather than a designed surface.
    background: '#0A0F1A',
    backgroundElement: '#0F172A',
    backgroundSelected: '#1E293B',
    border: 'rgba(148,163,184,0.16)',
    borderStrong: 'rgba(148,163,184,0.28)',
    // Primary CTA fill: a pale periwinkle that pops against the dark page,
    // paired with dark navy text rather than white.
    accent: '#C7D9FA',
    accentText: '#0F172A',
    eyebrow: '#E0A458',
    // The signature move: the technique-detail sheet is a warm cream
    // "index card" floating over the dark app chrome, not another dark
    // panel - ink color reuses the Tertiary family's darkest step.
    paperSurface: '#F3ECE0',
    paperText: '#231508',
    error: '#F87171',
    progressFill: '#C7D9FA',
    progressTrack: 'rgba(148,163,184,0.22)',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

// Loaded via @expo-google-fonts in src/app/_layout.tsx - each weight is its
// own registered font family name, not a family+fontWeight pair.
export const Fonts = {
  headline: 'Inter_800ExtraBold',
  title: 'Inter_700Bold',
  semibold: 'Inter_600SemiBold',
  medium: 'Inter_500Medium',
  body: 'Inter_400Regular',
  label: 'JetBrainsMono_600SemiBold',
  labelMedium: 'JetBrainsMono_500Medium',
};

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
