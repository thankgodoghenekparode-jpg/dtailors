"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import useAuthStore from "@/store/authStore";
import toast from "react-hot-toast";
import { Order } from "@/lib/marketTypes";
import OrderTimeline from "@/components/market/OrderTimeline";
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  Truck,
  Package,
  XCircle,
  MessageSquare,
} from "lucide-react";

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  all: { label: "All", color: "bg-gray-100 text-gray-600", icon: ShoppingBag },
  pending: { label: "Pending", color: "bg-yellow-50 text-yellow-700", icon: Clock },
  confirmed: { label: "Confirmed", color: "bg-blue-50 text-blue-700", icon: CheckCircle },
  shipped: { label: "Shipped", color: "bg-purple-50 text-purple-700", icon: Truck },
  completed: { label: "Completed", color: "bg-green-50 text-green-700", icon: Package },
  cancelled: { label: "Cancelled", color: "bg-red-50 text-red-700", icon: XCircle },
};

const tabs = ["all", "pending", "confirmed", "shipped", "completed", "cancelled"];

export default function SellerOrdersPage() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    if (!user) return;
    const checkAndLoad = async () => {
      try {
        await api.get("/sellers/me");
        setHasProfile(true);
        loadOrders();
      } catch {
        setHasProfile(false);
        setLoading(false);
      }
    };
    checkAndLoad();
  }, [user]);

  const loadOrders = async () => {
    try {
      const res = await api.get("/sellers/orders");
      setOrders(res.data.orders || res.data || []);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const prevStatus = orders.find((o) => o.id === orderId)?.status;
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus as any } : o))
    );
    try {
      await api.put(`/sellers/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order marked as ${newStatus}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to update order");
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: prevStatus as any } : o))
      );
    }
  };

  const filteredOrders = activeTab === "all"
    ? orders
    : orders.filter((o) => o.status === activeTab);

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
        <ShoppingBag className="h-12 w-12 text-gray-300 mb-3" />
        <p className="text-gray-500 mb-4">You need a seller profile to manage orders</p>
        <Link
          href="/seller/apply"
          className="px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
        >
          Become a Seller
        </Link>
      </div>
    );
  }

  const countByStatus = (status: string) =>
    status === "all" ? orders.length : orders.filter((o) => o.status === status).length;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-500 mt-1">Manage and update your orders</p>
      </div>

      <div className="flex overflow-x-auto gap-2 mb-6 pb-1">
        {tabs.map((tab) => {
          const config = statusConfig[tab];
          const Icon = config.icon;
          const count = countByStatus(tab);
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? "bg-primary-500 text-white"
                  : "bg-white text-gray-600 border border-gray-100 hover:bg-gray-50"
              }`}
            >
              <Icon className="h-4 w-4" />
              {config.label}
              <span className={`text-xs font-bold ${isActive ? "bg-white/20 rounded-full px-2 py-0.5" : "bg-gray-100 rounded-full px-2 py-0.5"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
          <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No orders found</h3>
          <p className="text-sm text-gray-500">
            {activeTab === "all" ? "You don't have any orders yet" : `No ${activeTab} orders`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredOrders.map((order) => {
            const config = statusConfig[order.status] || statusConfig.all;
            const StatusIcon = config.icon;
            const itemCount = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
            const buyerName =
              order.shippingAddress?.fullname || "N/A";

            const nextStatuses: Record<string, string[]> = {
              pending: ["confirmed", "cancelled"],
              confirmed: ["shipped", "cancelled"],
              shipped: ["completed", "cancelled"],
              completed: [],
              cancelled: [],
            };

            return (
              <div key={order.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900 text-sm">{order.orderNumber}</span>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                        <StatusIcon className="h-3 w-3" />
                        {config.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{buyerName}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{itemCount} item{itemCount !== 1 ? "s" : ""}</p>
                    <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>

                  <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-start lg:items-end gap-3 lg:gap-2">
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary-600">
                        &#8358;{(order.total || 0).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`/chat?seller=${user?.id}`}
                        className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                        title="Message buyer"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </a>
                      {nextStatuses[order.status]?.length > 0 && (
                        <select
                          value=""
                          onChange={(e) => e.target.value && handleStatusChange(order.id, e.target.value)}
                          className="px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                          <option value="" disabled>Update Status</option>
                          {nextStatuses[order.status].map((s) => (
                            <option key={s} value={s} className="capitalize">
                              {s === "cancelled" ? "Cancel Order" : `Mark as ${s}`}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <OrderTimeline status={order.status} createdAt={order.createdAt} updatedAt={order.updatedAt} compact />
                </div>

                {order.items?.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-50">
                    <div className="flex flex-wrap gap-2">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                          <div className="h-8 w-8 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                            {item.product?.images?.[0] ? (
                              <img src={item.product.images[0]} alt="" className="h-full w-full object-cover" />
                            ) : null}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-800">{item.product?.name || "Product"}</p>
                            <p className="text-[11px] text-gray-500">
                              x{item.quantity} · &#8358;{(item.price * item.quantity).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
