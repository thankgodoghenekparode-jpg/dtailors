"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import useAuthStore from "@/store/authStore";
import toast from "react-hot-toast";
import { MarketProduct } from "@/lib/marketTypes";
import {
  Plus,
  Package,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Search,
  AlertTriangle,
  ShoppingCart,
} from "lucide-react";

const statusColors: Record<string, string> = {
  active: "bg-green-50 text-green-700",
  inactive: "bg-gray-100 text-gray-600",
  sold_out: "bg-red-50 text-red-700",
};

export default function SellerProductsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [products, setProducts] = useState<MarketProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    if (!user) return;
    const checkAndLoad = async () => {
      try {
        const meRes = await api.get("/sellers/me");
        if (meRes.data.seller || meRes.data) {
          setHasProfile(true);
          loadProducts();
        }
      } catch {
        setHasProfile(false);
        setLoading(false);
      }
    };
    checkAndLoad();
  }, [user]);

  const loadProducts = async () => {
    try {
      const res = await api.get("/sellers/my-products");
      setProducts(res.data.products || res.data || []);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId: string) => {
    try {
      await api.delete(`/market/${productId}`);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      toast.success("Product deleted");
      setDeleteConfirm(null);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to delete");
    }
  };

  const handleToggleStatus = async (product: MarketProduct) => {
    const newStatus = product.status === "active" ? "inactive" : "active";
    try {
      await api.put(`/market/${product.id}`, { status: newStatus });
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, status: newStatus as any } : p))
      );
      toast.success(`Product ${newStatus === "active" ? "activated" : "deactivated"}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to update");
    }
  };

  const filtered = products.filter((p) => {
    if (!searchQuery) return true;
    return p.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-primary-500" />
      </div>
    );
  }

  if (!hasProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <Package className="h-12 w-12 text-gray-300 mb-3" />
        <p className="text-gray-500 mb-4">You need a seller profile to manage products</p>
        <Link
          href="/seller/apply"
          className="px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
        >
          Become a Seller
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
          <p className="text-gray-500 mt-1">{products.length} product{products.length !== 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/seller/products/new"
          className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-xl font-medium text-sm hover:bg-primary-600 transition-colors"
        >
          <Plus className="h-4 w-4" /> Add Product
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 mb-6">
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm border border-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
          <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {searchQuery ? "No products found" : "No products yet"}
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {searchQuery ? "Try a different search term" : "Add your first product to get started"}
          </p>
          {!searchQuery && (
            <Link
              href="/seller/products/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white rounded-xl font-medium text-sm hover:bg-primary-600 transition-colors"
            >
              <Plus className="h-4 w-4" /> Add Product
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3">Product</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Price</th>
                  <th className="px-6 py-3">Stock</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Rating</th>
                  <th className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                          {product.images?.[0] ? (
                            <img src={product.images[0]} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-gray-400">
                              <Package className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                          <p className="text-xs text-gray-500 capitalize">{product.condition}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600 capitalize">{product.category}</td>
                    <td className="px-6 py-3 text-sm font-medium text-gray-900">
                      &#8358;{(product.discountPrice || product.price).toLocaleString()}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">{product.stock}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusColors[product.status] || "bg-gray-100 text-gray-600"}`}>
                        {product.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-accent-400 text-accent-400" />
                        <span className="text-sm text-gray-600">{product.rating?.toFixed(1) || "0.0"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/seller/products/${product.id}/edit`}
                          className="p-2 rounded-lg text-gray-500 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleToggleStatus(product)}
                          className="p-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title={product.status === "active" ? "Deactivate" : "Activate"}
                        >
                          {product.status === "active" ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                        {deleteConfirm === product.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="px-2 py-1 bg-red-500 text-white rounded-lg text-xs font-medium hover:bg-red-600"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="px-2 py-1 bg-gray-200 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-300"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(product.id)}
                            className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
