"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Product, PaginatedResponse } from "@/lib/types";
import useAuthStore from "@/store/authStore";
import LoadingSpinner from "@/components/LoadingSpinner";
import toast from "react-hot-toast";
import { Plus, Edit, Trash2, Eye, Package } from "lucide-react";

export default function VendorProductsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/vendors/products?limit=50");
      setProducts(res.data.data || []);
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Product deleted");
    } catch {
      toast.error("Failed to delete product");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
        <Link href="/dashboard/products/new" className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-medium hover:bg-primary-600 transition-colors">
          <Plus className="h-4 w-4" />
          Add Product
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No products yet</p>
          <Link href="/dashboard/products/new" className="mt-3 inline-flex items-center gap-1 text-primary-500 hover:text-primary-600 text-sm font-medium">
            <Plus className="h-4 w-4" />
            Add your first product
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Product</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Category</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Price</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Rating</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-gray-50 last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                          {product.images?.[0] ? (
                            <img src={product.images[0]} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs">📦</div>
                          )}
                        </div>
                        <span className="font-medium text-gray-900 truncate max-w-[200px]">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 capitalize">{product.category}</td>
                    <td className="px-4 py-3 text-gray-900 font-medium">&#8358;{product.price.toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-500">{product.rating?.toFixed(1)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/vendors/${user?.vendorProfile?.id}/products/${product.id}`} className="p-1.5 text-gray-400 hover:text-primary-500 rounded-lg hover:bg-gray-50">
                          <Eye className="h-4 w-4" />
                        </Link>
                        <button onClick={() => handleDelete(product.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </button>
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
