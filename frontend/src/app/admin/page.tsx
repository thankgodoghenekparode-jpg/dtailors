"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import useAuthStore from "@/store/authStore";
import LoadingSpinner from "@/components/LoadingSpinner";
import Pagination from "@/components/Pagination";
import toast from "react-hot-toast";
import {
  Users,
  Scissors,
  Store,
  Briefcase,
  Package,
  Star,
  FileText,
  Shield,
  CheckCircle,
  Trash2,
  Eye,
  BarChart3,
  RefreshCw,
  Search,
  Filter,
  Image as ImageIcon,
  BadgeCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

interface AdminStats {
  totalUsers: number;
  totalTailors: number;
  totalVendors: number;
  totalEmployers: number;
  totalProducts: number;
  totalJobs: number;
  totalReviews: number;
}

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface JobRecord {
  id: string;
  title: string;
  jobType: string;
  state?: string;
  createdAt: string;
}

interface ProductRecord {
  id: string;
  name: string;
  price: number;
  category: string;
  createdAt: string;
}

interface MarketProductRecord {
  id: string;
  name: string;
  category: string;
  status?: string;
  isActive?: boolean;
  price?: number;
  rating?: number;
  reviewCount?: number;
  images?: string[];
  createdAt?: string;
  seller?: {
    id?: string;
    storeName?: string;
    isVerified?: boolean;
    user?: { name?: string; email?: string };
  };
}

interface SellerRecord {
  id: string;
  storeName: string;
  storeDescription?: string;
  isVerified?: boolean;
  isActive?: boolean;
  createdAt?: string;
  user?: { id?: string; name?: string; email?: string; phone?: string };
  _count?: { products?: number; orders?: number };
}

interface MarketOrderRecord {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  user?: { name?: string; email?: string; phone?: string };
  seller?: { storeName?: string };
  items?: Array<{ id: string; quantity: number; product?: { name?: string } }>;
}

export default function AdminPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<UserRecord[]>([]);
  const [recentProducts, setRecentProducts] = useState<ProductRecord[]>([]);
  const [recentJobs, setRecentJobs] = useState<JobRecord[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [marketProducts, setMarketProducts] = useState<MarketProductRecord[]>([]);
  const [marketSellers, setMarketSellers] = useState<SellerRecord[]>([]);
  const [marketOrders, setMarketOrders] = useState<MarketOrderRecord[]>([]);
  const [marketLoading, setMarketLoading] = useState(false);
  const [marketView, setMarketView] = useState<"products" | "sellers" | "orders">("products");
  const [marketPagination, setMarketPagination] = useState<{ page: number; limit: number; total: number; totalPages: number } | null>(null);
  const [marketSearch, setMarketSearch] = useState("");
  const [marketCategory, setMarketCategory] = useState("");
  const [marketStatus, setMarketStatus] = useState("");
  const [marketIsActive, setMarketIsActive] = useState("");
  const [marketOrderStatus, setMarketOrderStatus] = useState("");
  const [marketPage, setMarketPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "users" | "marketplace">("overview");

  useEffect(() => {
    if (user && user.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [user, router]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("/admin/dashboard");
        setStats(res.data.stats);
        setRecentUsers(res.data.recentUsers || []);
        setRecentProducts(res.data.recentProducts || []);
        setRecentJobs(res.data.recentJobs || []);
      } catch {
        toast.error("Failed to load admin dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const fetchAllUsers = async () => {
    try {
      const res = await api.get("/admin/users?limit=100");
      setAllUsers(res.data.data || []);
    } catch {
      toast.error("Failed to load users");
    }
  };

  const fetchMarketplace = async () => {
    setMarketLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(marketPage));
      params.set("limit", "10");

      if (marketSearch.trim()) params.set("search", marketSearch.trim());

      if (marketView === "products") {
        if (marketCategory) params.set("category", marketCategory);
        if (marketStatus) params.set("status", marketStatus);
        if (marketIsActive) params.set("isActive", marketIsActive);
        const res = await api.get(`/market-admin/products?${params.toString()}`);
        setMarketProducts(res.data.data || []);
        setMarketPagination(res.data.pagination || null);
      } else if (marketView === "sellers") {
        if (marketStatus) params.set("isVerified", marketStatus);
        if (marketIsActive) params.set("isActive", marketIsActive);
        const res = await api.get(`/market-admin/sellers?${params.toString()}`);
        setMarketSellers(res.data.data || []);
        setMarketPagination(res.data.pagination || null);
      } else {
        if (marketOrderStatus) params.set("status", marketOrderStatus);
        const res = await api.get(`/market-admin/orders?${params.toString()}`);
        setMarketOrders(res.data.data || []);
        setMarketPagination(res.data.pagination || null);
      }
    } catch {
      toast.error("Failed to load marketplace data");
    } finally {
      setMarketLoading(false);
    }
  };

  useEffect(() => {
    if (tab !== "marketplace") return;
    fetchMarketplace();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, marketView, marketPage, marketSearch, marketCategory, marketStatus, marketIsActive, marketOrderStatus]);

  const handleVerify = async (userId: string) => {
    try {
      await api.put(`/admin/users/${userId}/verify`);
      toast.success("User verified");
      setAllUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, verified: true } : u))
      );
    } catch {
      toast.error("Failed to verify user");
    }
  };

  const handleDelete = async (resource: string, id: string) => {
    if (!confirm("Are you sure? This action cannot be undone.")) return;
    try {
      await api.delete(`/admin/${resource}/${id}`);
      toast.success("Deleted successfully");
      if (resource === "users") setAllUsers((prev) => prev.filter((u) => u.id !== id));
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleProductStatus = async (id: string, isActive: boolean) => {
    try {
      await api.put(`/market-admin/products/${id}/status`, { isActive });
      toast.success(isActive ? "Product activated" : "Product deactivated");
      setMarketProducts((prev) => prev.map((p) => (p.id === id ? { ...p, isActive } : p)));
    } catch {
      toast.error("Failed to update product");
    }
  };

  const handleProductDelete = async (id: string) => {
    if (!confirm("Delete this marketplace product?")) return;
    try {
      await api.delete(`/market-admin/products/${id}`);
      toast.success("Product deleted");
      setMarketProducts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      toast.error("Failed to delete product");
    }
  };

  const handleSellerVerify = async (id: string) => {
    try {
      await api.put(`/market-admin/sellers/${id}/verify`);
      toast.success("Seller verification updated");
      setMarketSellers((prev) => prev.map((s) => (s.id === id ? { ...s, isVerified: !s.isVerified } : s)));
    } catch {
      toast.error("Failed to update seller verification");
    }
  };

  const handleSellerStatus = async (id: string, isActive: boolean) => {
    try {
      await api.put(`/market-admin/sellers/${id}/status`, { isActive });
      toast.success(isActive ? "Seller activated" : "Seller deactivated");
      setMarketSellers((prev) => prev.map((s) => (s.id === id ? { ...s, isActive } : s)));
    } catch {
      toast.error("Failed to update seller status");
    }
  };

  const handleOrderStatus = async (id: string, status: string) => {
    try {
      await api.put(`/market-admin/orders/${id}/status`, { status });
      toast.success("Order status updated");
      setMarketOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    } catch {
      toast.error("Failed to update order status");
    }
  };

  if (!user || user.role !== "ADMIN") return null;
  if (loading) return <LoadingSpinner />;

  const statCards = stats
    ? [
        { label: "Total Users", value: stats.totalUsers, icon: Users, color: "bg-blue-50 text-blue-600" },
        { label: "Tailors", value: stats.totalTailors, icon: Scissors, color: "bg-primary-50 text-primary-600" },
        { label: "Vendors", value: stats.totalVendors, icon: Store, color: "bg-accent-50 text-accent-600" },
        { label: "Employers", value: stats.totalEmployers, icon: Briefcase, color: "bg-green-50 text-green-600" },
        { label: "Products", value: stats.totalProducts, icon: Package, color: "bg-purple-50 text-purple-600" },
        { label: "Jobs", value: stats.totalJobs, icon: FileText, color: "bg-pink-50 text-pink-600" },
        { label: "Reviews", value: stats.totalReviews, icon: Star, color: "bg-red-50 text-red-600" },
      ]
    : [];

  const marketplaceCategories = [
    "Ankara",
    "Fabrics",
    "Senator",
    "Suits",
    "Shirts",
    "Trousers",
    "Dresses",
    "Shoes",
    "Bags",
    "Accessories",
    "Tailoring Materials",
    "Electronics",
    "Household",
    "Others",
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary-500" />
            Admin Dashboard
          </h1>
          <p className="text-gray-500 text-sm mt-1">Platform overview and management</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setTab("overview"); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === "overview" ? "bg-primary-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            <BarChart3 className="h-4 w-4 inline mr-1" />
            Overview
          </button>
          <button
            onClick={() => { setTab("users"); fetchAllUsers(); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === "users" ? "bg-primary-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            <Users className="h-4 w-4 inline mr-1" />
            Users
          </button>
          <button
            onClick={() => { setTab("marketplace"); fetchMarketplace(); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === "marketplace" ? "bg-primary-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            <Store className="h-4 w-4 inline mr-1" />
            Marketplace
          </button>
        </div>
      </div>

      {tab === "overview" && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className={`h-10 w-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Recent Users</h2>
              <div className="space-y-3">
                {recentUsers.length === 0 ? (
                  <p className="text-gray-500 text-sm">No users yet</p>
                ) : (
                  recentUsers.map((u) => (
                    <div key={u.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-500">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{u.name}</p>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </div>
                      </div>
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full capitalize">{u.role.toLowerCase()}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Recent Jobs</h2>
              <div className="space-y-3">
                {recentJobs.length === 0 ? (
                  <p className="text-gray-500 text-sm">No jobs yet</p>
                ) : (
                  recentJobs.map((j) => (
                    <div key={j.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{j.title}</p>
                        <p className="text-xs text-gray-500">{j.state || "N/A"} &middot; {j.jobType}</p>
                      </div>
                      <span className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(j.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {tab === "users" && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {allUsers.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500">Click &quot;Users&quot; to load user list</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-4 py-3 font-medium text-gray-500">User</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Role</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Joined</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map((u) => (
                    <tr key={u.id} className="border-b border-gray-50 last:border-0">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-500">
                            {u.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{u.name}</p>
                            <p className="text-xs text-gray-500">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs capitalize">{u.role.toLowerCase()}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {formatDistanceToNow(new Date(u.createdAt), { addSuffix: true })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleVerify(u.id)} className="p-1.5 text-gray-400 hover:text-green-500 rounded-lg hover:bg-green-50" title="Verify">
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDelete("users", u.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50" title="Delete">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "marketplace" && (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {(["products", "sellers", "orders"] as const).map((view) => (
              <button
                key={view}
                onClick={() => {
                  setMarketView(view);
                  setMarketPage(1);
                }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors capitalize ${marketView === view ? "bg-primary-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                {view}
              </button>
            ))}
            <button
              onClick={fetchMarketplace}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 inline-flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${marketLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Filter className="h-4 w-4" /> Filters
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
              <div className="relative md:col-span-2 xl:col-span-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  value={marketSearch}
                  onChange={(e) => {
                    setMarketPage(1);
                    setMarketSearch(e.target.value);
                  }}
                  placeholder={marketView === "orders" ? "Search order number" : "Search marketplace..."}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {marketView === "products" && (
                <>
                  <select value={marketCategory} onChange={(e) => { setMarketPage(1); setMarketCategory(e.target.value); }} className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm bg-white">
                    <option value="">All Categories</option>
                    {marketplaceCategories.map((category) => <option key={category} value={category}>{category}</option>)}
                  </select>
                  <select value={marketStatus} onChange={(e) => { setMarketPage(1); setMarketStatus(e.target.value); }} className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm bg-white">
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="sold_out">Sold Out</option>
                  </select>
                  <select value={marketIsActive} onChange={(e) => { setMarketPage(1); setMarketIsActive(e.target.value); }} className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm bg-white">
                    <option value="">Any Visibility</option>
                    <option value="true">Visible</option>
                    <option value="false">Hidden</option>
                  </select>
                </>
              )}

              {marketView === "sellers" && (
                <>
                  <select value={marketStatus} onChange={(e) => { setMarketPage(1); setMarketStatus(e.target.value); }} className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm bg-white">
                    <option value="">Any Verification</option>
                    <option value="true">Verified</option>
                    <option value="false">Unverified</option>
                  </select>
                  <select value={marketIsActive} onChange={(e) => { setMarketPage(1); setMarketIsActive(e.target.value); }} className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm bg-white">
                    <option value="">Any Status</option>
                    <option value="true">Active</option>
                    <option value="false">Suspended</option>
                  </select>
                </>
              )}

              {marketView === "orders" && (
                <select value={marketOrderStatus} onChange={(e) => { setMarketPage(1); setMarketOrderStatus(e.target.value); }} className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm bg-white">
                  <option value="">All Order Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="shipped">Shipped</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              )}
            </div>
          </div>

          {marketLoading ? (
            <div className="py-12">
              <LoadingSpinner />
            </div>
          ) : marketView === "products" ? (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-gray-900">Marketplace Products</h2>
                  <p className="text-sm text-gray-500">Manage listing status and removals</p>
                </div>
                <span className="text-xs text-gray-500">{marketPagination?.total ?? 0} items</span>
              </div>
              {marketProducts.length === 0 ? (
                <div className="text-center py-14 text-gray-500">No marketplace products found</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="text-left px-4 py-3 font-medium text-gray-500">Product</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-500">Seller</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-500">Category</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {marketProducts.map((product) => (
                        <tr key={product.id} className="border-b border-gray-50 last:border-0">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100 flex items-center justify-center">
                                {product.images?.[0] ? (
                                  <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                                ) : (
                                  <ImageIcon className="h-5 w-5 text-gray-300" />
                                )}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{product.name}</div>
                                <div className="text-xs text-gray-500 flex items-center gap-2">
                                  {product.price ? `₦${product.price.toLocaleString()}` : "No price"}
                                  {product.reviewCount ? `• ${product.reviewCount} reviews` : ""}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            <div className="font-medium text-gray-900 flex items-center gap-1.5">
                              {product.seller?.storeName || "-"}
                              {product.seller?.isVerified && <BadgeCheck className="h-4 w-4 text-green-500" />}
                            </div>
                            <div className="text-xs text-gray-500">{product.seller?.user?.name || product.seller?.user?.email || "Unknown"}</div>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{product.category}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-1 rounded-full ${product.isActive === false ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
                              {product.isActive === false ? "Inactive" : "Active"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleProductStatus(product.id, !(product.isActive ?? true))}
                                className="p-1.5 text-gray-400 hover:text-primary-500 rounded-lg hover:bg-primary-50"
                                title={product.isActive === false ? "Activate" : "Deactivate"}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleProductDelete(product.id)}
                                className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : marketView === "sellers" ? (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-gray-900">Sellers</h2>
                  <p className="text-sm text-gray-500">Verify or suspend stores</p>
                </div>
                <span className="text-xs text-gray-500">{marketPagination?.total ?? 0} stores</span>
              </div>
              {marketSellers.length === 0 ? (
                <div className="text-center py-14 text-gray-500">No sellers found</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="text-left px-4 py-3 font-medium text-gray-500">Store</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-500">Owner</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-500">Counts</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-500">Flags</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {marketSellers.map((seller) => (
                        <tr key={seller.id} className="border-b border-gray-50 last:border-0">
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-900">{seller.storeName}</div>
                            <div className="text-xs text-gray-500">{seller.storeDescription || "No description"}</div>
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            <div className="font-medium text-gray-900">{seller.user?.name || "-"}</div>
                            <div className="text-xs text-gray-500">{seller.user?.email || "-"}</div>
                          </td>
                          <td className="px-4 py-3 text-gray-600 text-xs">
                            Products: {seller._count?.products ?? 0}<br />
                            Orders: {seller._count?.orders ?? 0}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-1">
                              <span className={`text-xs px-2 py-1 rounded-full w-fit ${seller.isVerified ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-700"}`}>
                                {seller.isVerified ? "Verified" : "Unverified"}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-full w-fit ${seller.isActive === false ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"}`}>
                                {seller.isActive === false ? "Suspended" : "Active"}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleSellerVerify(seller.id)}
                                className="p-1.5 text-gray-400 hover:text-green-500 rounded-lg hover:bg-green-50"
                                title="Toggle verification"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleSellerStatus(seller.id, !(seller.isActive ?? true))}
                                className="p-1.5 text-gray-400 hover:text-primary-500 rounded-lg hover:bg-primary-50"
                                title={seller.isActive === false ? "Activate" : "Suspend"}
                              >
                                <Shield className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-gray-900">Orders</h2>
                  <p className="text-sm text-gray-500">Update order lifecycle</p>
                </div>
                <span className="text-xs text-gray-500">{marketPagination?.total ?? 0} orders</span>
              </div>
              {marketOrders.length === 0 ? (
                <div className="text-center py-14 text-gray-500">No marketplace orders found</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="text-left px-4 py-3 font-medium text-gray-500">Order</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-500">Buyer</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-500">Seller</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                        <th className="text-left px-4 py-3 font-medium text-gray-500">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {marketOrders.map((order) => (
                        <tr key={order.id} className="border-b border-gray-50 last:border-0">
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-900">{order.orderNumber}</div>
                            <div className="text-xs text-gray-500">₦{(order.total || 0).toLocaleString()}</div>
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            <div className="font-medium text-gray-900">{order.user?.name || "-"}</div>
                            <div className="text-xs text-gray-500">{order.user?.email || "-"}</div>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{order.seller?.storeName || "-"}</td>
                          <td className="px-4 py-3">
                            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 capitalize">
                              {order.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={order.status}
                              onChange={(e) => handleOrderStatus(order.id, e.target.value)}
                              className="rounded-lg border border-gray-200 px-3 py-2 text-xs bg-white"
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="shipped">Shipped</option>
                              <option value="completed">Completed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {marketPagination && (
            <Pagination
              currentPage={marketPagination.page}
              totalPages={marketPagination.totalPages}
              onPageChange={(page) => setMarketPage(page)}
            />
          )}
        </div>
      )}
    </div>
  );
}
