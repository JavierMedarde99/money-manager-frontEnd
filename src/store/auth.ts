import { create } from "zustand";
import { userApi } from "@/api/user";
import type { UserResponseDto, LoginRequestDTO, UserRequestDTO } from "@/types";

interface AuthState {
  token: string | null;
  user: UserResponseDto | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initializing: boolean;
  error: string | null;
  login: (data: LoginRequestDTO) => Promise<void>;
  register: (data: UserRequestDTO) => Promise<void>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
  clearError: () => void;
}

const hasToken = !!localStorage.getItem("token");

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem("token"),
  user: (() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })(),
  isAuthenticated: hasToken,
  isLoading: false,
  initializing: hasToken,
  error: null,

  login: async (data: LoginRequestDTO) => {
    set({ isLoading: true, error: null });
    try {
      const tokenResponse = await userApi.login(data);
      localStorage.setItem("token", tokenResponse.accessToken);
      set({ token: tokenResponse.accessToken, isLoading: false });
      // Fetch user profile after login
      const profile = await userApi.getProfile();
      localStorage.setItem("user", JSON.stringify(profile));
      set({ user: profile, isAuthenticated: true });
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      const message =
        axiosError.response?.data?.message || "Error al iniciar sesión";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  register: async (data: UserRequestDTO) => {
    set({ isLoading: true, error: null });
    try {
      const tokenResponse = await userApi.register(data);
      localStorage.setItem("token", tokenResponse.accessToken);
      set({ token: tokenResponse.accessToken, isLoading: false });
      const profile = await userApi.getProfile();
      localStorage.setItem("user", JSON.stringify(profile));
      set({ user: profile, isAuthenticated: true });
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      const message =
        axiosError.response?.data?.message || "Error al registrarse";
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ token: null, user: null, isAuthenticated: false });
  },

  fetchProfile: async () => {
    try {
      const profile = await userApi.getProfile();
      localStorage.setItem("user", JSON.stringify(profile));
      set({ user: profile, initializing: false });
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      set({ token: null, user: null, isAuthenticated: false, initializing: false });
    }
  },

  clearError: () => set({ error: null }),
}));
