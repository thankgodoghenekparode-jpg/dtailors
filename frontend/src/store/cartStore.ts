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
      set({ items: [], count: 0 });
      return;
    }
    set({ loading: true });
    try {
      const res = await api.get("/cart");
      const items = res.data.items || res.data || [];
      set({ items, count: items.length, loading: false });
    } catch {
      set({ items: [], count: 0, loading: false });
    }
  },

  addToCart: async (productId, quantity = 1) => {
    try {
      const res = await api.post("/cart/add", { productId, quantity });
      const items = res.data.items || res.data.cart?.items || get().items;
      if (res.data.items || res.data.cart?.items) {
        const newItems = res.data.items || res.data.cart?.items;
        set({ items: newItems, count: newItems.length });
      } else {
        await get().loadCart();
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to add to cart");
    }
  },

  updateQuantity: async (itemId, quantity) => {
    try {
      const res = await api.put(`/cart/update`, { itemId, quantity });
      if (res.data.items || res.data.cart?.items) {
        const newItems = res.data.items || res.data.cart?.items;
        set({ items: newItems, count: newItems.length });
      } else {
        await get().loadCart();
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to update quantity");
    }
  },

  removeItem: async (itemId) => {
    try {
      await api.delete(`/cart/remove/${itemId}`);
      const items = get().items.filter((i) => i.id !== itemId);
      set({ items, count: items.length });
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
