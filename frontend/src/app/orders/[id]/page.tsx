"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { Order } from "@/lib/marketTypes";
import Rating from "@/components/Rating";
import LoadingSpinner from "@/components/LoadingSpinner";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  MapPin,
  CreditCard,
  Phone,
  Calendar,
  Package,
  CheckCircle,
  Star,
  Send,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";

const statusStyles: Record<string, string> = {
  pending: "bg-accent-50 text-accent-600",
  confirmed: "bg-blue-50 text-blue-600",
  shipped: "bg-purple-50 text-purple-600",
  completed: "bg-green-50 text-green-600",
  cancelled: "bg-red-50 text-red-600",
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [reviewOpen, setReviewOpen] = useState<Record<string, boolean>>({});
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${params.id}`);
        setOrder(res.data.order || res.data);
      } catch {
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchOrder();
  }, [params.id]);

  if (loading) return <LoadingSpinner />;
  if (!order)
    return <div className="text-center py-20 text-gray-500">Order not found</div>;

  const isPending = order.status === "pending";
  const isCompleted = order.status === "completed";

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await api.post(`/orders/${order.id}/cancel`);
      toast.success("Order cancelled");
      const res = await api.get(`/orders/${order.id}`);
      setOrder(res.data.order || res.data);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to cancel order");
    } finally {
      setCancelling(false);
    }
  };

  const handleSubmitReview = async (productId: string) => {
    const rating = ratings[productId] || 0;
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    setSubmitting((s) => ({ ...s, [productId]: true }));
    try {
      await api.post(`/market/products/${productId}/reviews`, {
        rating,
        comment: comments[productId] || "",
        orderId: order.id,
      });
      toast.success("Review submitted");
      setReviewOpen((s) => ({ ...s, [productId]: false }));
      setRatings((s) => ({ ...s, [productId]: 0 }));
      setComments((s) => ({ ...s, [productId]: "" }));
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to submit review");
    } finally {
      setSubmitting((s) => ({ ...s, [productId]: false }));
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/orders" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Orders
      </Link>

      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
          <div className="mt-1 flex items-center gap-3 text-sm text-gray-500 flex-wrap">
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {format(new Date(order.createdAt), "MMM d, yyyy 'at' h:mm a")}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusStyles[order.status] || "bg-gray-100 text-gray-600"}`}>
              {order.status}
            </span>
          </div>
        </div>
        {isPending && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="px-4 py-2 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            {cancelling ? "Cancelling..." : "Cancel Order"}
          </button>
        )}
      </div>

      {/* Items */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Package className="h-5 w-5 text-primary-500" />
          Items ({order.items?.length || 0})
        </h2>
        <div className="space-y-4">
          {order.items?.map((item) => {
            const p = item.product;
            return (
              <div key={item.id} className="flex gap-4">
                <Link href={`/market/${item.productId}`} className="h-16 w-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                  {p?.images?.[0] ? (
                    <img src={p.images[0]} alt={p?.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-gray-300 text-xs">No img</div>
                  )}
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/market/${item.productId}`} className="text-sm font-medium text-gray-900 hover:text-primary-600 transition-colors">
                    {p?.name || "Product"}
                  </Link>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Qty: {item.quantity} × &#8358;{item.price.toLocaleString()}
                  </p>
                  <div className="text-sm font-semibold text-primary-600 mt-0.5">
                    &#8358;{(item.price * item.quantity).toLocaleString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-5 pt-4 border-t border-gray-100 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Subtotal</span>
            <span className="font-medium">&#8358;{order.subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Delivery</span>
            <span className="font-medium">{order.deliveryFee === 0 ? "Free" : `₦${order.deliveryFee.toLocaleString()}`}</span>
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="text-xl font-bold text-primary-600">&#8358;{order.total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Shipping */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary-500" />
          Shipping Details
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Full Name</p>
            <p className="font-medium text-gray-900">{order.shippingAddress?.fullname}</p>
          </div>
          <div>
            <p className="text-gray-500">Phone</p>
            <p className="font-medium text-gray-900 flex items-center gap-1">
              <Phone className="h-3.5 w-3.5 text-gray-400" />
              {order.shippingAddress?.phone}
            </p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-gray-500">Address</p>
            <p className="font-medium text-gray-900">
              {order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.state}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Payment Method</p>
            <p className="font-medium text-gray-900 flex items-center gap-1 capitalize">
              <CreditCard className="h-3.5 w-3.5 text-gray-400" />
              {(order.paymentMethod || "").replace(/_/g, " ")}
            </p>
          </div>
          {order.shippingAddress?.notes && (
            <div>
              <p className="text-gray-500">Notes</p>
              <p className="font-medium text-gray-900">{order.shippingAddress.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      {isCompleted && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Rate Your Products</h2>
          <div className="space-y-3">
            {order.items?.map((item) => {
              const p = item.product;
              const isOpen = reviewOpen[item.productId];
              return (
                <div key={item.id} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      {p?.images?.[0] ? (
                        <img src={p.images[0]} alt={p?.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-300 text-xs">No img</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{p?.name || "Product"}</p>
                    </div>
                    {!isOpen ? (
                      <button
                        onClick={() => setReviewOpen((s) => ({ ...s, [item.productId]: true }))}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Star className="h-3.5 w-3.5 text-accent-400" />
                        Rate Product
                      </button>
                    ) : (
                      <button
                        onClick={() => setReviewOpen((s) => ({ ...s, [item.productId]: false }))}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                  {isOpen && (
                    <div className="mt-4 space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Rating</label>
                        <Rating
                          value={ratings[item.productId] || 0}
                          interactive
                          size="lg"
                          onChange={(v) => setRatings((s) => ({ ...s, [item.productId]: v }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Comment</label>
                        <textarea
                          value={comments[item.productId] || ""}
                          onChange={(e) => setComments((s) => ({ ...s, [item.productId]: e.target.value }))}
                          rows={3}
                          placeholder="Share your experience..."
                          className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                        />
                      </div>
                      <button
                        onClick={() => handleSubmitReview(item.productId)}
                        disabled={submitting[item.productId]}
                        className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors disabled:opacity-50"
                      >
                        {submitting[item.productId] ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            Submit Review
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isPending && (
        <p className="text-sm text-gray-400 mb-6">
          This order is pending. You can cancel it until the seller confirms it.
        </p>
      )}
    </div>
  );
}
