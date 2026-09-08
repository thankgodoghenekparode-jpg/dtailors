"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import toast from "react-hot-toast";
import {
  Store,
  ArrowLeft,
  Save,
  MapPin,
  Phone,
  MessageCircle,
  Upload,
  X,
} from "lucide-react";

const inputClass =
  "w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent";

export default function SellerApplyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    storeName: "",
    description: "",
    phone: "",
    whatsapp: "",
    city: "",
    state: "",
    country: "",
    logo: "",
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.storeName.trim()) {
      toast.error("Store name is required");
      return;
    }
    setLoading(true);
    try {
      await api.post("/sellers/become-seller", {
        storeName: form.storeName.trim(),
        description: form.description.trim(),
        phone: form.phone.trim(),
        whatsapp: form.whatsapp.trim(),
        location: {
          city: form.city.trim(),
          state: form.state.trim(),
          country: form.country.trim(),
        },
        logo: form.logo.trim(),
      });
      toast.success("Store created successfully!");
      router.push("/seller/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to create store");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/seller/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4 inline" /> Back
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600">
            <Store className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Create Your Store</h1>
            <p className="text-sm text-gray-500">Set up your seller profile on D Tailors</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Store Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.storeName}
              onChange={(e) => update("storeName", e.target.value)}
              className={inputClass}
              placeholder="My Fashion Store"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Store Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={3}
              className={inputClass}
              placeholder="Tell customers about your store..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Phone className="h-4 w-4 text-gray-400" /> Phone
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                className={inputClass}
                placeholder="+234..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                <MessageCircle className="h-4 w-4 text-gray-400" /> WhatsApp
              </label>
              <input
                type="text"
                value={form.whatsapp}
                onChange={(e) => update("whatsapp", e.target.value)}
                className={inputClass}
                placeholder="+234..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-gray-400" /> Location
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
                className={inputClass}
                placeholder="City"
              />
              <input
                type="text"
                value={form.state}
                onChange={(e) => update("state", e.target.value)}
                className={inputClass}
                placeholder="State"
              />
              <input
                type="text"
                value={form.country}
                onChange={(e) => update("country", e.target.value)}
                className={inputClass}
                placeholder="Country"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Upload className="h-4 w-4 text-gray-400" /> Store Logo URL
            </label>
            <input
              type="url"
              value={form.logo}
              onChange={(e) => update("logo", e.target.value)}
              className={inputClass}
              placeholder="https://example.com/logo.png"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Link
              href="/seller/dashboard"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary-500 text-white font-medium text-sm hover:bg-primary-600 transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {loading ? "Creating..." : "Create Store"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
