import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authAPI } from "../api";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        localStorage.setItem("token", token);
        set({ user, token, isAuthenticated: true });
      },

      updateUser: (user) => set({ user }),

      verifyToken: async () => {
        const token = get().token || localStorage.getItem("token");
        if (!token) {
          set({ user: null, token: null, isAuthenticated: false });
          return;
        }

        try {
          const response = await authAPI.getMe();
          set({ user: response.data.data, token, isAuthenticated: true });
        } catch (error) {
          console.error("Token verification failed:", error);
          localStorage.removeItem("token");
          set({ user: null, token: null, isAuthenticated: false });
        }
      },

      logout: () => {
        localStorage.removeItem("token");
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: "auth-storage",
    }
  )
);
