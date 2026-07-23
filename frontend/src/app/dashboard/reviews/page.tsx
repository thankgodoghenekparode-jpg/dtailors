"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import useAuthStore from "@/store/authStore";
import { Review } from "@/lib/types";
import StarRating from "@/components/StarRating";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Star, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function ReviewsPage() {
  const { user } = useAuthStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!user) return;
      try {
        const res = await api.get(`/reviews/${user.id}`);
        setReviews(res.data.data || []);
        setAverageRating(res.data.averageRating || 0);
      } catch {
        // handle error
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [user]);

  if (!user) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Reviews</h1>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-accent-50 flex items-center justify-center">
            <Star className="h-8 w-8 text-accent-500 fill-accent-400" />
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900">{averageRating.toFixed(1)}</p>
            <StarRating rating={averageRating} showCount={false} size="md" />
            <p className="text-sm text-gray-500 mt-0.5">{reviews.length} reviews</p>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : reviews.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <Star className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No reviews yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                  {r.reviewer?.avatar ? (
                    <img src={r.reviewer.avatar} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">{r.reviewer?.name}</p>
                  <StarRating rating={r.rating} showCount={false} size="sm" />
                </div>
                <span className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}
                </span>
              </div>
              {r.comment && <p className="mt-3 text-sm text-gray-600">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
