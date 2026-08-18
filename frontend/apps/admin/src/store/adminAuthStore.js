import { create } from 'zustand';
import { adminLogin, adminLogout, clearAdminAccessToken, getAdminMe, storeAdminAccessToken } from '@/lib/adminAuth';

const extractAdmin = (data) => data?.admin || data?.user || data?.data?.admin || data?.data?.user || data?.data || data;
const SESSION_MAX_AGE = 5 * 60 * 1000;

export const useAdminAuthStore = create((set, get) => ({
  admin: null,
  status: 'idle',
  checkedAt: 0,

  checkSession: async (force = false) => {
    const state = get();
    if (!force && state.status === 'authenticated' && Date.now() - state.checkedAt < SESSION_MAX_AGE) return state.admin;
    if (!force && state.status === 'loading') return state.admin;
    if (!force && state.status === 'unauthenticated') return null;
    set({ status: 'loading' });
    try {
      const data = await getAdminMe();
      storeAdminAccessToken(data?.accessToken || data?.data?.accessToken);
      const admin = extractAdmin(data);
      set({ admin, status: 'authenticated', checkedAt: Date.now() });
      return admin;
    } catch (error) {
      clearAdminAccessToken();
      set({ admin: null, status: 'unauthenticated', checkedAt: Date.now() });
      return null;
    }
  },

  login: async (email, password) => {
    const data = await adminLogin(email, password);
    storeAdminAccessToken(data?.accessToken || data?.data?.accessToken);
    const admin = extractAdmin(data);
    set({ admin, status: 'authenticated', checkedAt: Date.now() });
    return admin;
  },

  logout: async () => {
    try {
      await adminLogout();
    } finally {
      clearAdminAccessToken();
      set({ admin: null, status: 'unauthenticated', checkedAt: Date.now() });
    }
  },
}));
