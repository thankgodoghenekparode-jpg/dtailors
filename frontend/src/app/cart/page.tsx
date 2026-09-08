"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useCartStore from "@/store/cartStore";
import {
  CartItem,
} from "@/lib/marketTypes";
import LoadingSpinner from "@/components/LoadingSpinner";
import toast from "react-hot-toast";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingCart,
  ArrowRight,
  Truck,
} from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    loadCart,
    updateQuantity,
    removeItem,
    loading,
  } = useCartStore();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("dt_token");
    setIsLoggedIn(!!token);
    if (token) {
      loadCart();
    }
  }, [loadCart]);

  if (isLoggedIn === null) return <LoadingSpinner />;

  if (!isLoggedIn) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900">Your Cart</h1>
        <p className="text-gray-500 mt-2 mb-6">Please login to view your cart</p>
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors"
        >
          Login
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const subtotal = items.reduce(
    (sum, item) => sum + (item.product?.discountPrice ?? item.product?.price ?? 0) * item.quantity,
    0
  );
  const deliveryFee = subtotal > 0 && subtotal >= 50000 ? 0 : 2500;
  const total = subtotal + (subtotal > 0 ? deliveryFee : 0);

  const handleUpdateQuantity = async (item: CartItem, quantity: number) => {
    if (quantity < 1) return;
    const max = item.product?.stock ?? quantity;
    const newQty = Math.min(quantity, max);
    try {
      await updateQuantity(item.id, newQty);
    } catch (err: any) {
      toast.error(err.message || "Failed to update quantity");
    }
  };

  const handleRemove = async (itemId: string) => {
    try {
      await removeItem(itemId);
      toast.success("Removed from cart");
    } catch (err: any) {
      toast.error(err.message || "Failed to remove item");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Cart</h1>

      {loading ? (
        <LoadingSpinner />
      ) : items.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Your cart is empty</p>
          <p className="text-gray-400 text-sm mt-1 mb-6">Browse the marketplace and find something you like</p>
          <Link
            href="/market"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors"
          >
            Go to Marketplace
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => {
              const product = item.product;
              const price = product?.discountPrice ?? product?.price ?? 0;
              const originalPrice = product?.price;
              const outOfStock = product && (product.stock <= 0 || product.status === "sold_out");
              return (
                <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4">
                  <Link href={`/market/${item.productId}`} className="h-20 w-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                    {product?.images?.[0] ? (
                      <img src={product.images[0]} alt={product?.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-300 text-xs">No img</div>
                    )}
                  </Link>
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/market/${item.productId}`}
                        className="font-medium text-gray-900 hover:text-primary-600 transition-colors text-sm"
                      >
                        {product?.name || "Product"}
                      </Link>
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    {product?.category && (
                      <span className="text-xs text-gray-500 mt-0.5 capitalize">{product.category}</span>
                    )}
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="h-8 w-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                          disabled={outOfStock}
                          className="h-8 w-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-primary-600">
                          &#8358;{(price * item.quantity).toLocaleString()}
                        </span>
                        {originalPrice && originalPrice > price && (
                          <div className="text-xs text-gray-400 line-through">
                            &#8358;{(originalPrice * item.quantity).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <Link
              href="/market"
              className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              <ArrowRight className="h-4 w-4 rotate-180" />
              Continue shopping
            </Link>
          </div>

          <div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">&#8358;{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Delivery</span>
                  {deliveryFee === 0 ? (
                    <span className="text-green-600 font-medium font-medium">Free</span>
                  ) : (
                    <span className="font-medium">&#8358;{deliveryFee.toLocaleString()}</span>
                  )}
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-primary-600">
                    &#8358;{total.toLocaleString()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => router.push("/checkout")}
                className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors"
              >
                Checkout
                <ArrowRight className="h-4 w-4" />
              </button>
              <p className="mt-3 text-xs text-gray-400 flex items-center gap-1 justify-center">
                <Truck className="h-3.5 w-3.5" />
                Free delivery on orders above &#8358;50,000
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
