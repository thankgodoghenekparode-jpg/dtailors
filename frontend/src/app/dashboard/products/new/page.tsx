"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Package, Upload, X, ArrowLeft } from "lucide-react";
import Link from "next/link";

const categoryOptions = [
  "Fabric", "Lace", "Ankara", "Beads", "Aso Oke", "Silk", "Chiffon",
  "Denim", "Velvet", "Cotton", "Organza", "Tulle", "Satin", "Accessories",
];

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    discount: "",
    category: "Fabric",
    subcategory: "",
    state: "",
    city: "",
    country: "Nigeria",
    deliveryOptions: [] as string[],
  });

  const update = (field: string, value: string | string[]) => setForm((prev) => ({ ...prev, [field]: value }));

  const toggleDelivery = (option: string) => {
    if (form.deliveryOptions.includes(option)) {
      update("deliveryOptions", form.deliveryOptions.filter((d) => d !== option));
    } else {
      update("deliveryOptions", [...form.deliveryOptions, option]);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files).slice(0, 10));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) {
      toast.error("Name and price are required");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("price", form.price);
      if (form.discount) formData.append("discount", form.discount);
      formData.append("category", form.category);
      if (form.subcategory) formData.append("subcategory", form.subcategory);
      formData.append("location", JSON.stringify({ state: form.state, city: form.city, country: form.country }));
      formData.append("deliveryOptions", JSON.stringify(form.deliveryOptions));
      images.forEach((img) => formData.append("images", img));

      await api.post("/vendors/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Product created!");
      router.push("/dashboard/products");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent";

  return (
    <div>
      <Link href="/dashboard/products" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="h-4 w-4" />
        Back to Products
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Product</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="h-5 w-5 text-primary-500" />
            Product Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Name *</label>
              <input type="text" value={form.name} onChange={(e) => update("name", e.target.value)} className={inputClass} placeholder="e.g., Premium Ankara Fabric" required />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={4} className={inputClass} placeholder="Describe your product..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Price (&#8358;) *</label>
              <input type="number" step="0.01" value={form.price} onChange={(e) => update("price", e.target.value)} className={inputClass} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Discount Price (&#8358;)</label>
              <input type="number" step="0.01" value={form.discount} onChange={(e) => update("discount", e.target.value)} className={inputClass} placeholder="Optional" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
              <select value={form.category} onChange={(e) => update("category", e.target.value)} className={inputClass}>
                {categoryOptions.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Subcategory</label>
              <input type="text" value={form.subcategory} onChange={(e) => update("subcategory", e.target.value)} className={inputClass} placeholder="Optional" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Location</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Country</label>
              <input type="text" value={form.country} onChange={(e) => update("country", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
              <input type="text" value={form.state} onChange={(e) => update("state", e.target.value)} className={inputClass} placeholder="Lagos" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
              <input type="text" value={form.city} onChange={(e) => update("city", e.target.value)} className={inputClass} placeholder="Ikeja" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Delivery Options</h2>
          <div className="flex flex-wrap gap-2">
            {["Pickup", "Local Delivery", "Nationwide Shipping", "International Shipping"].map((d) => (
              <button key={d} type="button" onClick={() => toggleDelivery(d)} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${form.deliveryOptions.includes(d) ? "bg-green-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary-500" />
            Product Images
          </h2>
          <input type="file" accept="image/*" multiple onChange={handleImageChange} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-600 hover:file:bg-primary-100" />
          {images.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {images.map((img, i) => (
                <div key={i} className="relative h-20 w-20 rounded-lg overflow-hidden bg-gray-100">
                  <img src={URL.createObjectURL(img)} alt="" className="h-full w-full object-cover" />
                  <button type="button" onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))} className="absolute top-0.5 right-0.5 h-5 w-5 bg-red-500 text-white rounded-full flex items-center justify-center">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="submit" disabled={loading} className="w-full sm:w-auto px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors disabled:opacity-50">
          {loading ? "Creating..." : "Create Product"}
        </button>
      </form>
    </div>
  );
}
