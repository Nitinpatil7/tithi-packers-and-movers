'use client';

import { create } from 'zustand';

export const useLanguageStore = create((set) => ({
  language: 'en',
  setLanguage: (lang) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('tithi_lang', lang);
    }
    set({ language: lang });
  },
  initializeLanguage: () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tithi_lang');
      if (saved) {
        set({ language: saved });
      }
    }
  }
}));
