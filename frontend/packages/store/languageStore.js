'use client';

import { create } from 'zustand';

export const useLanguageStore = create((set) => ({
  language: 'en',
  setLanguage: () => set({ language: 'en' }),
  initializeLanguage: () => set({ language: 'en' }),
}));
