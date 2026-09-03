'use client';

import { create } from 'zustand';

export const useThemeStore = create((set, get) => ({
  theme: 'system', // 'light' | 'dark' | 'system'
  
  setTheme: (newTheme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('tithi_theme', newTheme);
      get().applyTheme(newTheme);
    }
    set({ theme: newTheme });
  },
  
  applyTheme: (themeVal) => {
    if (typeof window === 'undefined') return;
    
    const root = document.documentElement;
    let isDark = false;
    
    if (themeVal === 'dark') {
      isDark = true;
    } else if (themeVal === 'light') {
      isDark = false;
    } else {
      // system preference
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    
    root.style.colorScheme = isDark ? 'dark' : 'only light';
    let colorSchemeMeta = document.querySelector('meta[name="color-scheme"]');
    if (!colorSchemeMeta) {
      colorSchemeMeta = document.createElement('meta');
      colorSchemeMeta.setAttribute('name', 'color-scheme');
      document.head.appendChild(colorSchemeMeta);
    }
    colorSchemeMeta.setAttribute('content', isDark ? 'dark' : 'light');
    root.dataset.theme = isDark ? 'dark' : 'light';

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  },
  
  initializeTheme: () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tithi_theme') || 'system';
      set({ theme: saved });
      get().applyTheme(saved);
      
      // Listen to system preference changes if theme is system
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => {
        if (get().theme === 'system') {
          get().applyTheme('system');
        }
      };
      
      try {
        mediaQuery.addEventListener('change', listener);
      } catch (e) {
        mediaQuery.addListener(listener);
      }
    }
  }
}));
