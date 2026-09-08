"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useCartStore from "@/store/cartStore";
import api from "@/lib/api";
import LoadingSpinner from "@/components/LoadingSpinner";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Banknote,
  CreditCard,
  Landmark,
  Loader2,
  MapPin,
  Phone,
  User,
} from "lucide-react";

const paymentMethods = [
  { value: "cash_on_delivery", label: "Cash on Delivery", icon: Banknote },
  { value: "bank_transfer", label: "Bank Transfer", icon: Landmark },
  { value: "card", label: "Card", icon: CreditCard },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, loadCart, clearCart, loading } = useCartStore();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [form, setForm] = useState({
    fullname: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    notes: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery");
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("dt_token");
    setIsLoggedIn(!!token);
    if (token) {
      loadCart();
      const storedUser = localStorage.getItem("dt_user");
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          setForm((f) => ({ ...f, fullname: f.fullname || user.name || "" }));
        } catch {}
      }
    }
  }, [loadCart]);

  if (isLoggedIn === null) return <LoadingSpinner />;

  if (!isLoggedIn) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
        <p className="text-gray-500 mt-2 mb-6">Please login to checkout</p>
        <Link
          href={`/auth/login?redirect=/checkout`}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors"
        >
          Login
        </Link>
      </div>
    );
  }

  const subtotal = items.reduce(
    (sum, item) => sum + (item.product?.discountPrice ?? item.product?.price ?? 0) * item.quantity,
    0
  );
  const deliveryFee = subtotal >= 50000 ? 0 : 2500;
  const total = subtotal + (subtotal > 0 ? deliveryFee : 0);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    if (!form.fullname || !form.phone || !form.address || !form.city || !form.state) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (!form.phone.match(/^[0-9+][0-9\s-]{7,}$/)) {
      toast.error("Please enter a valid phone number");
      return;
    }
    setPlacing(true);
    try {
      const res = await api.post("/orders/checkout", {
        paymentMethod,
        shippingAddress: form,
      });
      toast.success("Order placed successfully!");
      await clearCart();
      const orderId = res.data.order?.id || res.data.id;
      router.push(orderId ? `/orders/${orderId}` : "/orders");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to place order");
      setPlacing(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
        <p className="text-gray-500 mt-2 mb-6">Your cart is empty</p>
        <Link
          href="/market"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors"
        >
          Go to Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/cart" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Cart
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-6">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping form */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary-500" />
              Shipping Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="fullname"
                    value={form.fullname}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    placeholder="08012345678"
                    className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Address *</label>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  required
                  placeholder="12, Example Street, Awingba"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">City *</label>
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  required
                  placeholder="Lagos"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">State *</label>
                <input
                  type="text"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  required
                  placeholder="Lagos"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Delivery Notes</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Any delivery instructions..."
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Payment method */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary-500" />
              Payment Method
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {paymentMethods.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPaymentMethod(value)}
                  className={`flex flex-col items-center gap-2 px-4 py-4 rounded-xl border-2 transition-colors ${
                    paymentMethod === value
                      ? "border-primary-500 bg-primary-50 text-primary-600"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-sm font-medium text-center">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Ordered items */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Items</h2>
            <div className="space-y-3">
              {items.map((item) => {
                const p = item.product;
                const price = p?.discountPrice ?? p?.price ?? 0;
                return (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="h-14 w-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                      {p?.images?.[0] ? (
                        <img src={p.images[0]} alt={p?.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-300 text-xs">No img</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{p?.name || "Product"}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-medium text-sm">
                      &#8358;{(price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal ({items.length} items)</span>
                <span className="font-medium">&#8358;{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Delivery</span>
                {deliveryFee === 0 ? (
                  <span className="text-green-600 font-medium">Free</span>
                ) : (
                  <span className="font-medium">&#8358;{deliveryFee.toLocaleString()}</span>
                )}
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-primary-600">
                  &#8358;{total.toLocaleString()}
                </span>
              </div>
            </div>
            <button
              type="submit"
              disabled={placing}
              className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors disabled:opacity-60"
            >
              {placing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Placing Order...
                </>
              ) : (
                "Place Order"
              )}
            </button>
            <p className="mt-3 text-xs text-gray-400 text-center">
              By placing this order you agree to our terms & conditions.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
