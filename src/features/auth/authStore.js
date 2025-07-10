import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (userData, authToken) => set({
        user: userData,
        token: authToken,
        isAuthenticated: true,
      }),

      logout: () => set({
        user: null,
        token: null,
        isAuthenticated: false,
      }),

      setUser: (userData) => set({ user: userData }),
    }),
    {
      name: 'auth-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
      partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }), // only persist the token, user and isAuthenticated status
    }
  )
);

export default useAuthStore;
