import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isAdmin: false,
  
  setUser: (user, token) => {
    // If name or mobile hints at admin, flag as admin for demonstration purposes
    const isAdminUser = user?.mobile === '9999999999' || user?.email === 'admin@tithipacking.com' || user?.name === 'Admin User';
    
    // Save to localStorage for simple session persistence on refresh
    if (typeof window !== 'undefined') {
      localStorage.setItem('tithi-user', JSON.stringify(user));
      localStorage.setItem('tithi-token', token);
      localStorage.setItem('tithi-is-admin', isAdminUser ? 'true' : 'false');
    }
    
    set({ 
      user, 
      token, 
      isAuthenticated: true, 
      isAdmin: isAdminUser 
    });
  },
  
  initializeAuth: () => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('tithi-user');
      const storedToken = localStorage.getItem('tithi-token');
      const storedIsAdmin = localStorage.getItem('tithi-is-admin');
      
      if (storedUser && storedToken) {
        set({
          user: JSON.parse(storedUser),
          token: storedToken,
          isAuthenticated: true,
          isAdmin: storedIsAdmin === 'true'
        });
      }
    }
  },
  
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('tithi-user');
      localStorage.removeItem('tithi-token');
      localStorage.removeItem('tithi-is-admin');
    }
    set({ user: null, token: null, isAuthenticated: false, isAdmin: false });
  },
}));
