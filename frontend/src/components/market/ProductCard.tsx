"use client";

import Link from "next/link";
import { Star, Heart, MessageCircle, ShoppingCart, BadgeCheck } from "lucide-react";
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
  const discount = product.discountPrice
    ? price - product.discountPrice
    : 0;
  const displayPrice = product.discountPrice ?? price;
  const discountPercent = discount > 0 ? Math.round((discount / price) * 100) : 0;
  const outOfStock = product.stock <= 0 || product.status === "sold_out";

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
    <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 flex flex-col">
      <Link href={`/market/${product.id}`} className="relative aspect-square bg-gray-100 overflow-hidden block">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-gray-400">
            <ShoppingCart className="h-12 w-12" />
          </div>
        )}
        {discountPercent > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            -{discountPercent}%
          </div>
        )}
        {outOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-semibold text-sm bg-black/60 px-3 py-1 rounded-full">Out of Stock</span>
          </div>
        )}
        <button
          onClick={handleWishlist}
          className={`absolute top-2 right-2 p-2 rounded-full shadow-sm transition-colors ${
            isWishlisted ? "bg-primary-500 text-white" : "bg-white text-gray-500 hover:text-primary-500"
          }`}
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`} />
        </button>
      </Link>

      <div className="p-4 flex flex-col flex-1">
        <Link href={`/market/${product.id}`}>
          <div className="flex flex-wrap gap-1 mb-1">
            <span className="text-[11px] px-2 py-0.5 bg-accent-50 text-accent-600 rounded-full font-medium capitalize">
              {product.category}
            </span>
            <span className="text-[11px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full capitalize">
              {product.condition}
            </span>
            {product.seller?.isVerified && (
              <span className="text-[11px] px-2 py-0.5 bg-green-50 text-green-700 rounded-full font-medium inline-flex items-center gap-1">
                <BadgeCheck className="h-3 w-3" />
                Verified Seller
              </span>
            )}
          </div>
          <h3 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2 text-sm">
            {product.name}
          </h3>
        </Link>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-bold text-primary-600">
            &#8358;{displayPrice.toLocaleString()}
          </span>
          {discount > 0 && (
            <span className="text-sm text-gray-400 line-through">
              &#8358;{price.toLocaleString()}
            </span>
          )}
        </div>
        <div className="mt-1 flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-accent-400 text-accent-400" />
          <span className="text-xs text-gray-600">
            {product.rating?.toFixed(1) || "0.0"} ({product.reviewCount || 0})
          </span>
        </div>
        <div className="mt-3 text-xs">
          {outOfStock ? (
            <span className="text-red-500 font-medium">Out of stock</span>
          ) : product.stock <= 5 ? (
            <span className="text-accent-600 font-medium">Only {product.stock} left</span>
          ) : (
            <span className="text-green-600 font-medium">In Stock</span>
          )}
        </div>

        <div className="mt-3 flex gap-2 pt-3 border-t border-gray-50 mt-auto">
          <button
            onClick={handleChat}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Chat</span>
          </button>
          <button
            onClick={handleAddToCart}
            disabled={outOfStock}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
}
