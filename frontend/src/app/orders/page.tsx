"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Order } from "@/lib/marketTypes";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  Package,
  ArrowRight,
  Calendar,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";

const statusStyles: Record<string, string> = {
  pending: "bg-accent-50 text-accent-600",
  confirmed: "bg-blue-50 text-blue-600",
  shipped: "bg-purple-50 text-purple-600",
  completed: "bg-green-50 text-green-600",
  cancelled: "bg-red-50 text-red-600",
};

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("dt_token");
    setIsLoggedIn(!!token);
    if (!token) {
      setLoading(false);
      return;
    }
    const fetchOrders = async () => {
      try {
        const res = await api.get("/orders");
        setOrders(res.data.orders || res.data.data || []);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <LoadingSpinner />;

  if (isLoggedIn === false || isLoggedIn === null) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900">Your Orders</h1>
        <p className="text-gray-500 mt-2 mb-6">Please login to view your orders</p>
        <Link
          href="/auth/login?redirect=/orders"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors"
        >
          Login
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No orders yet</p>
          <p className="text-gray-400 text-sm mt-1 mb-6">When you place an order, it will show up here</p>
          <Link
            href="/market"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors"
          >
            Go to Marketplace
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const itemCount = order.items?.length || 0;
            const firstItem = order.items?.[0]?.product;
            return (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-900">#{order.orderNumber}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusStyles[order.status] || "bg-gray-100 text-gray-600"}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                      <Calendar className="h-3.5 w-3.5" />
                      {format(new Date(order.createdAt), "MMM d, yyyy 'at' h:mm a")}
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      {firstItem?.images?.[0] ? (
                        <img src={firstItem.images[0]} alt="" className="h-10 w-10 rounded-lg object-cover bg-gray-100" />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300 text-xs">No img</div>
                      )}
                      <div className="text-sm text-gray-500">
                        <span className="font-medium text-gray-900">{itemCount} item{itemCount !== 1 ? "s" : ""}</span>
                        {firstItem && (
                          <>
                            {" "}· <span className="truncate">{firstItem.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold text-primary-600">
                      &#8358;{order.total.toLocaleString()}
                    </div>
                    <div className="mt-2 inline-flex items-center gap-1 text-sm text-primary-600">
                      View details
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
