// src/store/themeStore.ts
/**
 * Theme state management for Frix's dual-theme system.
 * 
 * Provides light/dark theme toggle with MMKV persistence.
 * Default theme is dark (Obsidian Curator design system).
 * 
 * @example
 * ```tsx
 * const { theme, isDarkMode, toggleTheme } = useThemeStore();
 * 
 * <View style={{ backgroundColor: theme.colors.background }}>
 *   <Text style={{ color: theme.colors.onSurface }}>Hello</Text>
 * </View>
 * ```
 */
import { create } from 'zustand';
import { darkTheme, lightTheme } from '@/constants/theme';
import { storage, STORAGE_KEYS } from '@/lib/storage';

// Use a shared type that both themes conform to
export type ThemeShape = {
  mode: 'dark' | 'light';
  colors: Record<string, string | undefined>;
  typography: Record<string, Record<string, unknown>>;
  spacing: Record<string, number>;
  borderRadius: Record<string, number>;
  shadows: Record<string, Record<string, unknown>>;
};

/**
 * ThemeState interface for the theme store.
 */
export interface ThemeState {
  /** Current theme object (darkTheme or lightTheme) */
  theme: ThemeShape;
  /** Whether dark mode is enabled */
  isDarkMode: boolean;
  /** Toggle between light and dark themes */
  toggleTheme: () => void;
  /** Explicitly set theme (light or dark) */
  setTheme: (isDark: boolean) => void;
}

/**
 * useThemeStore — Global theme state management.
 * 
 * Features:
 * - Persists theme preference to MMKV 'userTheme' key
 * - Defaults to dark theme on first launch
 * - Restores theme preference on app init
 * - Provides full theme object for styling
 */
export const useThemeStore = create<ThemeState>((set, get) => {
  // Restore theme from MMKV, default to dark mode
  const savedTheme = storage.getString(STORAGE_KEYS.USER_THEME);
  const initialIsDark = savedTheme ? savedTheme === 'dark' : true;

  return {
    theme: (initialIsDark ? darkTheme : lightTheme) as ThemeShape,
    isDarkMode: initialIsDark,

    /**
     * Toggle between light and dark themes.
     * Persists the new preference to MMKV automatically.
     */
    toggleTheme: (): void => {
      const nextIsDark = !get().isDarkMode;
      storage.set(STORAGE_KEYS.USER_THEME, nextIsDark ? 'dark' : 'light');
      set({
        isDarkMode: nextIsDark,
        theme: (nextIsDark ? darkTheme : lightTheme) as ThemeShape,
      });
    },

    /**
     * Explicitly set the theme.
     * @param isDark - true for dark mode, false for light mode
     */
    setTheme: (isDark: boolean): void => {
      storage.set(STORAGE_KEYS.USER_THEME, isDark ? 'dark' : 'light');
      set({
        isDarkMode: isDark,
        theme: (isDark ? darkTheme : lightTheme) as ThemeShape,
      });
    },
  };
});
