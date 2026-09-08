"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { MarketProduct } from "@/lib/marketTypes";
import {
  ArrowLeft,
  Save,
  Plus,
  X,
  Package,
  MapPin,
  Tag,
  Image as ImageIcon,
} from "lucide-react";

const categoryOptions = [
  "Ankara", "Lace", "Fabrics", "Ready-to-Wear", "Accessories",
  "Beads", "Aso Oke", "Silk", "Chiffon", "Buttons", "Zippers",
  "Threads", "Tools", "Footwear", "Jewelry", "Bags",
];

const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"];
const conditionOptions = ["new", "used"];

const inputClass =
  "w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const productId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    discountPrice: "",
    category: "",
    condition: "new",
    stock: "1",
    sizes: [] as string[],
    customSize: "",
    colors: [] as string[],
    customColor: "",
    locationCity: "",
    locationState: "",
    images: [] as string[],
    imageUrl: "",
    specs: [{ key: "", value: "" }],
  });

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const res = await api.get(`/market/${productId}`);
        const p: MarketProduct = res.data.product || res.data;
        const specEntries = Object.entries(p.specifications || {}).map(([key, value]) => ({ key, value }));
        setForm({
          name: p.name || "",
          description: p.description || "",
          price: p.price?.toString() || "",
          discountPrice: p.discountPrice?.toString() || "",
          category: p.category || "",
          condition: p.condition || "new",
          stock: p.stock?.toString() || "1",
          sizes: p.sizes || [],
          customSize: "",
          colors: p.colors || [],
          customColor: "",
          locationCity: p.location?.city || "",
          locationState: p.location?.state || "",
          images: p.images || [],
          imageUrl: "",
          specs: specEntries.length > 0 ? specEntries : [{ key: "", value: "" }],
        });
      } catch (err: any) {
        toast.error(err.response?.data?.error || "Failed to load product");
        router.push("/seller/products");
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [productId, router]);

  const update = (field: string, value: any) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const toggleSize = (size: string) => {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const addCustomSize = () => {
    const s = form.customSize.trim();
    if (s && !form.sizes.includes(s)) {
      setForm((prev) => ({ ...prev, sizes: [...prev.sizes, s], customSize: "" }));
    }
  };

  const addCustomColor = () => {
    const c = form.customColor.trim();
    if (c && !form.colors.includes(c)) {
      setForm((prev) => ({ ...prev, colors: [...prev.colors, c], customColor: "" }));
    }
  };

  const addImage = () => {
    const url = form.imageUrl.trim();
    if (url && form.images.length < 8) {
      setForm((prev) => ({ ...prev, images: [...prev.images, url], imageUrl: "" }));
    }
  };

  const removeImage = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx),
    }));
  };

  const addSpec = () => {
    setForm((prev) => ({ ...prev, specs: [...prev.specs, { key: "", value: "" }] }));
  };

  const updateSpec = (idx: number, field: "key" | "value", value: string) => {
    setForm((prev) => ({
      ...prev,
      specs: prev.specs.map((s, i) => (i === idx ? { ...s, [field]: value } : s)),
    }));
  };

  const removeSpec = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      specs: prev.specs.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Product name is required");
      return;
    }
    if (!form.price || Number(form.price) <= 0) {
      toast.error("Valid price is required");
      return;
    }
    if (!form.category) {
      toast.error("Category is required");
      return;
    }

    const specifications: Record<string, string> = {};
    form.specs.forEach((s) => {
      if (s.key.trim() && s.value.trim()) {
        specifications[s.key.trim()] = s.value.trim();
      }
    });

    setSaving(true);
    try {
      await api.put(`/market/${productId}`, {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        discountPrice: form.discountPrice ? Number(form.discountPrice) : undefined,
        category: form.category,
        condition: form.condition,
        stock: Number(form.stock) || 1,
        sizes: form.sizes.length > 0 ? form.sizes : undefined,
        colors: form.colors.length > 0 ? form.colors : undefined,
        specifications: Object.keys(specifications).length > 0 ? specifications : undefined,
        location: {
          city: form.locationCity.trim(),
          state: form.locationState.trim(),
        },
        images: form.images.length > 0 ? form.images : undefined,
      });
      toast.success("Product updated successfully!");
      router.push("/seller/products");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-primary-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/seller/products" className="text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4 inline" /> Products
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-medium text-gray-900">Edit Product</span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Edit Product</h1>
            <p className="text-sm text-gray-500">Update your product details</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Tag className="h-5 w-5 text-primary-500" />
              Basic Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  className={inputClass}
                  placeholder="Beautiful Ankara Fabric"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                  rows={4}
                  className={inputClass}
                  placeholder="Describe your product..."
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Price (&#8358;) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => update("price", e.target.value)}
                    className={inputClass}
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Discount Price (&#8358;)
                  </label>
                  <input
                    type="number"
                    value={form.discountPrice}
                    onChange={(e) => update("discountPrice", e.target.value)}
                    className={inputClass}
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Stock</label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => update("stock", e.target.value)}
                    className={inputClass}
                    min="0"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => update("category", e.target.value)}
                    className={inputClass}
                    required
                  >
                    <option value="">Select category</option>
                    {categoryOptions.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Condition</label>
                  <select
                    value={form.condition}
                    onChange={(e) => update("condition", e.target.value)}
                    className={inputClass}
                  >
                    {conditionOptions.map((c) => (
                      <option key={c} value={c}>{c === "new" ? "New" : "Used"}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Sizes</h2>
            <div className="flex flex-wrap gap-2">
              {sizeOptions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSize(s)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    form.sizes.includes(s)
                      ? "bg-primary-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={form.customSize}
                onChange={(e) => update("customSize", e.target.value)}
                placeholder="Custom size"
                className={inputClass}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomSize())}
              />
              <button
                type="button"
                onClick={addCustomSize}
                className="px-4 py-2 bg-gray-100 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-200"
              >
                Add
              </button>
            </div>
            {form.sizes.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {form.sizes.map((s) => (
                  <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium">
                    {s}
                    <button type="button" onClick={() => toggleSize(s)} className="hover:text-primary-900">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Colors</h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={form.customColor}
                onChange={(e) => update("customColor", e.target.value)}
                placeholder="Add a color (e.g. Red, Navy Blue)"
                className={inputClass}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomColor())}
              />
              <button
                type="button"
                onClick={addCustomColor}
                className="px-4 py-2 bg-gray-100 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-200"
              >
                Add
              </button>
            </div>
            {form.colors.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {form.colors.map((c) => (
                  <span key={c} className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium">
                    {c}
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, colors: prev.colors.filter((x) => x !== c) }))}
                      className="hover:text-primary-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary-500" />
              Location
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                <input
                  type="text"
                  value={form.locationCity}
                  onChange={(e) => update("locationCity", e.target.value)}
                  className={inputClass}
                  placeholder="Lagos"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
                <input
                  type="text"
                  value={form.locationState}
                  onChange={(e) => update("locationState", e.target.value)}
                  className={inputClass}
                  placeholder="Lagos State"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-primary-500" />
              Product Images (up to 8)
            </h2>
            <div className="flex gap-2">
              <input
                type="url"
                value={form.imageUrl}
                onChange={(e) => update("imageUrl", e.target.value)}
                placeholder="Image URL"
                className={inputClass}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addImage())}
              />
              <button
                type="button"
                onClick={addImage}
                disabled={form.images.length >= 8}
                className="px-4 py-2 bg-gray-100 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-200 disabled:opacity-40"
              >
                Add
              </button>
            </div>
            {form.images.length > 0 && (
              <div className="mt-4 grid grid-cols-4 gap-2">
                {form.images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl bg-gray-100 overflow-hidden group">
                    <img src={img} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">Specifications</h2>
              <button
                type="button"
                onClick={addSpec}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-200"
              >
                <Plus className="h-3 w-3" /> Add
              </button>
            </div>
            <div className="space-y-2">
              {form.specs.map((spec, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={spec.key}
                    onChange={(e) => updateSpec(idx, "key", e.target.value)}
                    placeholder="Key (e.g. Material)"
                    className={inputClass}
                  />
                  <input
                    type="text"
                    value={spec.value}
                    onChange={(e) => updateSpec(idx, "value", e.target.value)}
                    placeholder="Value (e.g. Cotton)"
                    className={inputClass}
                  />
                  {form.specs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSpec(idx)}
                      className="p-2 text-gray-400 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              href="/seller/products"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary-500 text-white font-medium text-sm hover:bg-primary-600 transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
