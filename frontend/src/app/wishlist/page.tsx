"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import useAuthStore from "@/store/authStore";
import { MarketProduct } from "@/lib/marketTypes";
import ProductCard from "@/components/market/ProductCard";
import { Heart, ShoppingBag } from "lucide-react";

export default function WishlistPage() {
  const { user } = useAuthStore();
  const [items, setItems] = useState<MarketProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem("dt_token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get("/wishlist");
        const data = res.data.items || res.data || [];
        setItems(data.map((item: any) => item.product || item).filter(Boolean));
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-primary-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <Heart className="h-12 w-12 text-gray-300 mb-3" />
        <h1 className="text-xl font-bold text-gray-900 mb-2">Your Wishlist</h1>
        <p className="text-gray-500 mb-6">Please login to view your saved items</p>
        <Link
          href="/auth/login"
          className="px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
        >
          Login
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
        <p className="text-gray-500 mt-1">{items.length} item{items.length !== 1 ? "s" : ""} saved</p>
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
          <Heart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Your wishlist is empty</h3>
          <p className="text-sm text-gray-500 mb-4">Save items you love and find them here later</p>
          <Link
            href="/vendors"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
          >
            <ShoppingBag className="h-4 w-4" />
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
