import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark';

interface ThemeState {
  /** Current active theme */
  theme: Theme;
}

interface ThemeActions {
  /** Toggles between light and dark theme */
  toggleTheme: () => void;
  /** Sets a specific theme */
  setTheme: (theme: Theme) => void;
  /** Initializes theme from system preference or stored value */
  initializeTheme: () => void;
}

/**
 * Theme store with persistence and system preference detection.
 *
 * The theme is applied by adding/removing the 'dark' class on the
 * document root element, which Tailwind uses for dark: variants.
 */
export const useThemeStore = create<ThemeState & ThemeActions>()(
  persist(
    (set, get) => ({
      theme: 'light',

      toggleTheme: () => {
        const newTheme = get().theme === 'light' ? 'dark' : 'light';
        set({ theme: newTheme });
        applyTheme(newTheme);
      },

      setTheme: (theme) => {
        set({ theme });
        applyTheme(theme);
      },

      initializeTheme: () => {
        const stored = get().theme;
        applyTheme(stored);
      },
    }),
    {
      name: 'sprintdesk-theme',
    }
  )
);

/**
 * Applies the theme class to the document root element.
 */
function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}
