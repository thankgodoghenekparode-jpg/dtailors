import { create } from "zustand";
import api from "@/lib/api";
import { User } from "@/lib/types";

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    role: string;
  }) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  setUser: (user: User) => void;
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  loading: false,

  login: async (email, password) => {
    set({ loading: true });
    try {
      const res = await api.post("/auth/login", { email, password });
      const { token, user } = res.data;
      localStorage.setItem("dt_token", token);
      localStorage.setItem("dt_user", JSON.stringify(user));
      set({ user, token, loading: false });
    } catch (error: any) {
      set({ loading: false });
      throw new Error(error.response?.data?.error || "Login failed");
    }
  },

  register: async (data) => {
    set({ loading: true });
    try {
      const res = await api.post("/auth/register", data);
      const { token, user } = res.data;
      localStorage.setItem("dt_token", token);
      localStorage.setItem("dt_user", JSON.stringify(user));
      set({ user, token, loading: false });
    } catch (error: any) {
      set({ loading: false });
      throw new Error(error.response?.data?.error || "Registration failed");
    }
  },

  logout: () => {
    localStorage.removeItem("dt_token");
    localStorage.removeItem("dt_user");
    set({ user: null, token: null });
  },

  loadUser: async () => {
    const token = localStorage.getItem("dt_token");
    const storedUser = localStorage.getItem("dt_user");

    if (!token) return;

    set({ token });

    if (storedUser) {
      try {
        set({ user: JSON.parse(storedUser) });
      } catch {
        localStorage.removeItem("dt_user");
      }
    }

    try {
      const res = await api.get("/auth/me");
      const user = res.data.user;
      localStorage.setItem("dt_user", JSON.stringify(user));
      set({ user });
    } catch {
      localStorage.removeItem("dt_token");
      localStorage.removeItem("dt_user");
      set({ user: null, token: null });
    }
  },

  setUser: (user) => set({ user }),
}));

export default useAuthStore;
