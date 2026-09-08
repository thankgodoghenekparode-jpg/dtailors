import { create } from "zustand";
import api from "@/lib/api";
import { CartItem } from "@/lib/marketTypes";

interface CartState {
  items: CartItem[];
  count: number;
  loading: boolean;
  loadCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const useCartStore = create<CartState>((set, get) => ({
  items: [],
  count: 0,
  loading: false,

  
  loadCart: async () => {
    const token = localStorage.getItem("dt_token");
    if (!token) {
      set({ items: [], count: 0, loading: false });
      return;
    }

    set({ loading: true });
    try {
      const res = await api.get("/cart");
      const items = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data?.items)
          ? res.data.items
          : Array.isArray(res.data)
            ? res.data
            : [];

      set({ items, count: items.length, loading: false });
    } catch {
      set({ items: [], count: 0, loading: false });
    }
  },

  addToCart: async (productId, quantity = 1) => {
    try {
      await api.post("/cart/add", { productId, quantity });
      await get().loadCart();
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to add to cart");
    }
  },

  updateQuantity: async (itemId, quantity) => {
    try {
      await api.put(`/cart/${itemId}`, { quantity });
      await get().loadCart();
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to update quantity");
    }
  },

  removeItem: async (itemId) => {
    try {
      await api.delete(`/cart/${itemId}`);
      await get().loadCart();
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to remove item");
    }
  },

  clearCart: async () => {
    try {
      await api.delete("/cart/clear");
      set({ items: [], count: 0 });
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to clear cart");
    }
  },
}));

export default useCartStore;
