import { create } from "zustand";
import api from "@/lib/api";

interface MarketState {
  wishlist: string[];
  loading: boolean;
  toggleWishlist: (productId: string) => Promise<void>;
  loadWishlist: () => Promise<void>;
}

const useMarketStore = create<MarketState>((set, get) => ({
  wishlist: [],
  loading: false,

  toggleWishlist: async (productId) => {
    const { wishlist } = get();
    const isWishlisted = wishlist.includes(productId);

    // Optimistic update
    set({
      wishlist: isWishlisted
        ? wishlist.filter((id) => id !== productId)
        : [...wishlist, productId],
    });

    try {
      if (isWishlisted) {
        await api.delete(`/wishlist/${productId}`);
      } else {
        await api.post("/wishlist", { productId });
      }
    } catch {
      // Revert on error
      set({
        wishlist: isWishlisted
          ? [...wishlist, productId]
          : wishlist.filter((id) => id !== productId),
      });
    }
  },

  loadWishlist: async () => {
    const token = localStorage.getItem("dt_token");
    if (!token) {
      set({ wishlist: [] });
      return;
    }
    set({ loading: true });
    try {
      const res = await api.get("/wishlist");
      const items = res.data.items || res.data || [];
      const ids = items.map((item: any) => item.productId || item.product?.id || item.id);
      set({ wishlist: ids, loading: false });
    } catch {
      set({ wishlist: [], loading: false });
    }
  },
}));

export default useMarketStore;
