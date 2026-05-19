// src/constants/theme.ts
// Single source of truth for all design tokens (light + dark)
// Per frontend-guidelines.md — "The Obsidian Curator" design system

export const darkTheme = {
  mode: 'dark' as const,
  colors: {
    // Obsidian surfaces
    background: '#131313',
    surface: '#1C1B1B',                  // backward compat
    surfaceLow: '#1C1B1B',
    surfaceContainerLow: '#1C1B1B',       // backward compat
    surfaceHighest: '#353534',
    surfaceContainerHighest: '#353534',   // backward compat
    surfaceContainer: '#2A2A2A',          // backward compat
    // Typography
    onSurface: '#F0EAD6',
    onSurfaceVariant: '#D0C5AF',
    // Brand
    primary: '#D4AF37',           // Gold Leaf — CTAs, active states
    primaryContainer: '#D4AF37',
    onPrimary: '#3D2F00',
    secondary: '#F2CA50',         // Highlight gold
    // Status
    error: '#FFB4AB',
    success: '#10B981',
    openNow: '#10B981',
    closedNow: '#FFB4AB',
    tonightBadge: '#D4AF37',
    // Interaction
    overlay: 'rgba(0,0,0,0.6)',
    outline: '#99907C',           // backward compat — input underlines
    outlineVariant: 'rgba(77,70,53,0.4)',
    skeleton: '#2A2A2A',
    // Deprecated aliases
    textPrimary: '#F0EAD6',       // backward compat
    textSecondary: '#D0C5AF',     // backward compat
    border: 'rgba(77,70,53,0.4)', // backward compat
  },
  typography: {
    // Noto Serif for headlines, Manrope for body/UI
    displayLarge: { fontFamily: 'NotoSerif-Bold', fontSize: 36, letterSpacing: -0.72 },
    displayMedium: { fontFamily: 'NotoSerif-Bold', fontSize: 28, letterSpacing: -0.56 },
    headlineLarge: { fontFamily: 'NotoSerif-SemiBold', fontSize: 24, letterSpacing: -0.48 },
    titleLarge: { fontFamily: 'Manrope-SemiBold', fontSize: 18, letterSpacing: 0.9 },
    titleMedium: { fontFamily: 'Manrope-SemiBold', fontSize: 14, letterSpacing: 0.7 },
    bodyLarge: { fontFamily: 'Manrope-Regular', fontSize: 16, lineHeight: 26 },
    bodyMedium: { fontFamily: 'Manrope-Regular', fontSize: 14, lineHeight: 22 },
    labelLarge: { fontFamily: 'Manrope-Medium', fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase' as const },
    labelSmall: { fontFamily: 'Manrope-Medium', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase' as const },
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
  borderRadius: { none: 0, sm: 2, md: 4, lg: 8, full: 9999 },
  shadows: {
    ambient: { shadowColor: '#000', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.4, shadowRadius: 40, elevation: 8 },
    card: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 4 },
    ambientGold: { shadowColor: '#D4AF37', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.05, shadowRadius: 30, elevation: 4 }, // backward compat
  },
};

export const lightTheme = {
  mode: 'light' as const,
  colors: {
    background: '#F5F3E6',         // Warm cream
    surface: '#FFFFFF',            // backward compat
    surfaceLow: '#EDEADE',
    surfaceContainerLow: '#EDEADE', // backward compat
    surfaceHighest: '#FFFFFF',
    surfaceContainerHighest: '#EBE8D8', // backward compat
    surfaceContainer: '#F0EDE0',    // backward compat
    onSurface: '#1A1A1A',
    onSurfaceVariant: '#5A5550',
    primary: '#0F4C81',            // Frix Deep Blue (light mode)
    primaryContainer: '#0F4C81',
    onPrimary: '#FFFFFF',
    secondary: '#F2A900',
    error: '#EF4444',
    success: '#10B981',
    openNow: '#10B981',
    closedNow: '#EF4444',
    tonightBadge: '#F2A900',
    overlay: 'rgba(0,0,0,0.45)',
    outline: '#D1CBB8',            // backward compat — input underlines
    outlineVariant: 'rgba(195,155,42,0.4)',
    skeleton: '#E8E5D9',
    // Deprecated aliases
    textPrimary: '#1A1A1A',        // backward compat
    textSecondary: '#5A5550',      // backward compat
    border: 'rgba(195,155,42,0.4)', // backward compat
  },
  typography: darkTheme.typography, // Same type scale, different surface colors
  spacing: darkTheme.spacing,
  borderRadius: darkTheme.borderRadius,
  shadows: {
    ambient: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 24, elevation: 4 },
    card: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
    ambientGold: { shadowColor: '#D4AF37', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.08, shadowRadius: 20, elevation: 3 }, // backward compat
  },
};

export type AppTheme = typeof darkTheme;

/**
 * @deprecated Use `darkTheme.colors` instead.
 */
export const darkColors = darkTheme.colors;

/**
 * @deprecated Use `lightTheme.colors` instead.
 */
export const lightColors = lightTheme.colors;

/**
 * @deprecated Use `useThemeStore().theme` instead.
 * This export is only for backward compatibility with old screens.
 */
export const theme = darkTheme as AppTheme;
