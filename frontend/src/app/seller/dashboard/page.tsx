"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import useAuthStore from "@/store/authStore";
import toast from "react-hot-toast";
import {
  Store,
  Package,
  TrendingUp,
  Clock,
  Plus,
  MessageSquare,
  ExternalLink,
  ShoppingBag,
  DollarSign,
  CheckCircle,
  XCircle,
  Truck,
} from "lucide-react";

interface SellerStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  buyer?: { name: string };
  items: any[];
  total: number;
  status: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700",
  confirmed: "bg-blue-50 text-blue-700",
  shipped: "bg-purple-50 text-purple-700",
  completed: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-700",
};

const statusIcons: Record<string, any> = {
  pending: Clock,
  confirmed: CheckCircle,
  shipped: Truck,
  completed: Package,
  cancelled: XCircle,
};

export default function SellerDashboardPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const [stats, setStats] = useState<SellerStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

  useEffect(() => {
    if (!user) return;
    const checkSeller = async () => {
      try {
        const res = await api.get("/sellers/me");
        if (res.data.seller || res.data) {
          setHasProfile(true);
          loadDashboard();
        }
      } catch {
        setHasProfile(false);
        setLoading(false);
      }
    };
    checkSeller();
  }, [user]);

  const loadDashboard = async () => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        api.get("/sellers/my-products?limit=1").catch(() => ({ data: { pagination: { total: 0 } } })),
        api.get("/sellers/orders").catch(() => ({ data: { orders: [] } })),
      ]);

      const totalProducts = productsRes.data.pagination?.total || 0;
      const orders = ordersRes.data.orders || ordersRes.data || [];
      const totalOrders = orders.length;
      const totalRevenue = orders
        .filter((o: RecentOrder) => o.status === "completed")
        .reduce((sum: number, o: RecentOrder) => sum + (o.total || 0), 0);
      const pendingOrders = orders.filter((o: RecentOrder) => o.status === "pending").length;

      setStats({ totalProducts, totalOrders, totalRevenue, pendingOrders });
      setRecentOrders(orders.slice(0, 5));
    } catch {
      // silently handle
    } finally {
      setLoading(false);
    }
  };

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
        <div className="h-20 w-20 rounded-2xl bg-primary-50 flex items-center justify-center mb-6">
          <Store className="h-10 w-10 text-primary-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Become a Seller</h1>
        <p className="text-gray-500 max-w-md mb-6">
          Start selling your products on D Tailors Marketplace. Set up your store in minutes.
        </p>
        <Link
          href="/seller/apply"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Create Your Store
        </Link>
      </div>
    );
  }

  const statCards = [
    { label: "Total Products", value: stats.totalProducts, icon: Package, color: "bg-blue-50 text-blue-600" },
    { label: "Total Orders", value: stats.totalOrders, icon: ShoppingBag, color: "bg-green-50 text-green-600" },
    {
      label: "Total Revenue",
      value: `\u20A6${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "bg-purple-50 text-purple-600",
    },
    { label: "Pending Orders", value: stats.pendingOrders, icon: Clock, color: "bg-yellow-50 text-yellow-600" },
  ];

  const quickLinks = [
    { label: "Add Product", href: "/seller/products/new", icon: Plus },
    { label: "View Store", href: `/sellers/${user?.id}`, icon: ExternalLink },
    { label: "Messages", href: "/chat", icon: MessageSquare },
    { label: "Orders", href: "/seller/orders", icon: ShoppingBag },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Seller Dashboard</h1>
        <p className="text-gray-500 mt-1">Manage your store and track performance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between">
                <div className={`h-10 w-10 rounded-xl ${stat.color} flex items-center justify-center`}>
                  <Icon className="h-5 w-5" />
                </div>
                <TrendingUp className="h-4 w-4 text-gray-300" />
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors text-sm">
                  {link.label}
                </span>
              </div>
              <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-primary-500 transition-colors" />
            </Link>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
          <Link href="/seller/orders" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            View All
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <ShoppingBag className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No orders yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-3">Order #</th>
                  <th className="px-6 py-3">Buyer</th>
                  <th className="px-6 py-3">Items</th>
                  <th className="px-6 py-3">Total</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map((order) => {
                  const StatusIcon = statusIcons[order.status] || Clock;
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-3 text-sm font-medium text-gray-900">
                        {order.orderNumber}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600">
                        {order.buyer?.name || "N/A"}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600">
                        {order.items?.length || 0}
                      </td>
                      <td className="px-6 py-3 text-sm font-medium text-gray-900">
                        &#8358;{(order.total || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusColors[order.status] || "bg-gray-50 text-gray-600"}`}>
                          <StatusIcon className="h-3 w-3" />
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
