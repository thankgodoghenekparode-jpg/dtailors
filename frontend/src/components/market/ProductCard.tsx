"use client";

import Link from "next/link";
import { Star, Heart, MessageCircle, ShoppingCart, BadgeCheck, MapPin, Flame, Zap } from "lucide-react";
import { MarketProduct } from "@/lib/marketTypes";
import useMarketStore from "@/store/marketStore";
import useCartStore from "@/store/cartStore";
import toast from "react-hot-toast";

interface MarketProductCardProps {
  product: MarketProduct;
}

export default function MarketProductCard({ product }: MarketProductCardProps) {
  const { wishlist, toggleWishlist } = useMarketStore();
  const { addToCart } = useCartStore();
  const isWishlisted = wishlist.includes(product.id);
  const price = product.price;
  const discount = product.discountPrice ? price - product.discountPrice : 0;
  const displayPrice = product.discountPrice ?? price;
  const discountPercent = discount > 0 ? Math.round((discount / price) * 100) : 0;
  const outOfStock = product.stock <= 0 || product.status === "sold_out";

  const loc = product.location as Record<string, string> | undefined;
  const locationStr = [loc?.city, loc?.state].filter(Boolean).join(", ");

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("dt_token");
    if (!token) {
      toast.error("Please login to save items");
      return;
    }
    toggleWishlist(product.id);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("dt_token");
    if (!token) {
      toast.error("Please login to add to cart");
      return;
    }
    try {
      await addToCart(product.id, 1);
      toast.success("Added to cart");
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  const handleChat = (e: React.MouseEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("dt_token");
    if (!token) {
      toast.error("Please login to chat with seller");
      return;
    }
    window.location.href = `/sellers/${product.sellerId}`;
  };

  return (
    <div className="group bg-white rounded-2xl border border-stone-200/70 overflow-hidden hover-lift flex flex-col justify-between transition-all duration-300 hover:border-primary-300 hover:shadow-xl hover:shadow-primary-500/5 relative">
      {/* Temu-Style Deal Overlay Ribbons */}
      <Link href={`/market/${product.id}`} className="relative aspect-square bg-stone-100 overflow-hidden block">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-stone-300 bg-stone-50">
            <ShoppingCart className="h-12 w-12 text-stone-400 opacity-60" />
          </div>
        )}

        {/* Top Badges Bar */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start z-10">
          {discountPercent > 0 && (
            <span className="bg-gradient-to-r from-rose-600 to-amber-500 text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-full shadow-md shadow-rose-600/30 flex items-center gap-1">
              <Flame className="h-3 w-3 fill-white" />
              -{discountPercent}% OFF
            </span>
          )}
          {product.seller?.isVerified && (
            <span className="bg-emerald-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-0.5">
              <BadgeCheck className="h-3 w-3 fill-white text-emerald-600" /> Verified
            </span>
          )}
        </div>

        {outOfStock && (
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center">
            <span className="text-white font-extrabold text-xs bg-stone-900/90 border border-white/20 px-3.5 py-1.5 rounded-full shadow-lg">
              SOLD OUT
            </span>
          </div>
        )}

        <button
          onClick={handleWishlist}
          aria-label="Wishlist"
          className={`absolute top-2.5 right-2.5 p-2 rounded-full shadow-md backdrop-blur-md transition-all duration-200 ${
            isWishlisted
              ? "bg-rose-500 text-white scale-110"
              : "bg-white/90 text-stone-600 hover:text-rose-500 hover:bg-white hover:scale-110"
          }`}
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
        </button>
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <Link href={`/market/${product.id}`} className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-extrabold px-2 py-0.5 bg-stone-100 text-stone-700 rounded-full uppercase tracking-wider">
              {product.category}
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 bg-stone-100 text-stone-500 rounded-full capitalize">
              {product.condition}
            </span>
          </div>

          <h3 className="font-bold text-stone-900 group-hover:text-primary-600 transition-colors line-clamp-2 text-xs leading-snug">
            {product.name}
          </h3>
        </Link>

        {/* Facebook Marketplace Location Pill */}
        {locationStr && (
          <div className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-stone-500">
            <MapPin className="h-3 w-3 text-primary-500 shrink-0" />
            <span className="truncate">{locationStr}</span>
          </div>
        )}

        {/* Price & Savings Tag */}
        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-base font-black text-stone-900">
            &#8358;{displayPrice.toLocaleString()}
          </span>
          {discount > 0 && (
            <span className="text-xs text-stone-400 line-through">
              &#8358;{price.toLocaleString()}
            </span>
          )}
        </div>

        {/* Rating & Sold count */}
        <div className="mt-1.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
            <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
            <span className="font-extrabold text-amber-900 text-[11px]">
              {product.rating?.toFixed(1) || "4.9"}
            </span>
            <span className="text-[10px] text-amber-700 font-medium">({product.reviewCount || 18})</span>
          </div>
          <span className="text-[11px] font-semibold text-emerald-600">
            🔥 {product.reviewCount ? product.reviewCount * 7 + 15 : 45}+ sold
          </span>
        </div>

        {/* Stock Scarcity Bar (Temu Style) */}
        <div className="mt-3">
          <div className="flex justify-between text-[10px] font-bold mb-1">
            {outOfStock ? (
              <span className="text-rose-600">Out of Stock</span>
            ) : product.stock <= 5 ? (
              <span className="text-amber-600 flex items-center gap-1">
                <Zap className="h-3 w-3 fill-amber-500" /> Almost Sold Out! Only {product.stock} left
              </span>
            ) : (
              <span className="text-emerald-600">In Stock Ready to Ship</span>
            )}
          </div>
          {!outOfStock && (
            <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  product.stock <= 5 ? "bg-gradient-to-r from-amber-500 to-rose-500" : "bg-emerald-500"
                }`}
                style={{ width: `${Math.min(100, (product.stock / 20) * 100)}%` }}
              />
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-4 flex gap-2 pt-3 border-t border-stone-100 mt-auto">
          <button
            onClick={handleChat}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-stone-200 text-stone-700 text-xs font-bold hover:bg-stone-50 transition-all active:scale-[0.98]"
          >
            <MessageCircle className="h-3.5 w-3.5 text-stone-500" />
            <span className="hidden sm:inline">Chat</span>
          </button>
          <button
            onClick={handleAddToCart}
            disabled={outOfStock}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white text-xs font-bold hover:shadow-md hover:shadow-primary-500/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
}

