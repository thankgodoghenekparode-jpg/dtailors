"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { Product, Review } from "@/lib/types";
import StarRating from "@/components/StarRating";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  ArrowLeft,
  MapPin,
  Phone,
  MessageCircle,
  Truck,
  Store,
  User,
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, reviewsRes] = await Promise.allSettled([
          api.get(`/products/${params.productId}`),
          api.get(`/products/${params.productId}/reviews`),
        ]);
        if (prodRes.status === "fulfilled") setProduct(prodRes.value.data.product);
        if (reviewsRes.status === "fulfilled") setReviews(reviewsRes.value.data.data || []);
      } catch {
        // handle error
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.productId]);

  if (loading) return <LoadingSpinner />;
  if (!product) return <div className="text-center py-20 text-gray-500">Product not found</div>;

  const vendor = product.vendor;
  const images = product.images?.length > 0 ? product.images : [];
  const loc = product.location as Record<string, string> | undefined;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href={vendor ? `/vendors/${vendor.id}` : "/vendors"}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Vendor
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="bg-gray-100 rounded-2xl aspect-square relative overflow-hidden">
            {images.length > 0 ? (
              <img
                src={images[currentImageIndex]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-gray-400 text-6xl">
                📦
              </div>
            )}
            {product.discount && product.discount > 0 && (
              <div className="absolute top-3 left-3 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                -{Math.round(((product.price - product.discount) / product.price) * 100)}% OFF
              </div>
            )}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImageIndex((i) => (i === 0 ? images.length - 1 : i - 1))}
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setCurrentImageIndex((i) => (i === images.length - 1 ? 0 : i + 1))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentImageIndex(i)}
                  className={`h-16 w-16 rounded-lg overflow-hidden shrink-0 border-2 transition ${
                    i === currentImageIndex ? "border-primary-500" : "border-transparent"
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{product.name}</h1>
          <p className="text-sm text-gray-500 mt-1 capitalize">{product.category}{product.subcategory ? ` / ${product.subcategory}` : ""}</p>

          <div className="mt-4">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-primary-600">
                &#8358;{(product.discount && product.discount > 0 ? product.discount : product.price).toLocaleString()}
              </span>
              {product.discount && product.discount > 0 && (
                <span className="text-lg text-gray-400 line-through">
                  &#8358;{product.price.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          <div className="mt-3">
            <StarRating rating={product.rating} count={product.reviewCount} size="md" />
          </div>

          {product.description && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed text-sm">{product.description}</p>
            </div>
          )}

          {product.deliveryOptions.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                <Truck className="h-4 w-4" />
                Delivery Options
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.deliveryOptions.map((d) => (
                  <span key={d} className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full">{d}</span>
                ))}
              </div>
            </div>
          )}

          {vendor && (
            <div className="mt-6 bg-gray-50 rounded-xl p-4">
              <Link href={`/vendors/${vendor.id}`} className="flex items-center gap-3 group">
                <div className="h-12 w-12 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-lg overflow-hidden">
                  {vendor.logo ? (
                    <img src={vendor.logo} alt="" className="h-full w-full object-cover" />
                  ) : (
                    vendor.businessName?.charAt(0)?.toUpperCase()
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">{vendor.businessName}</p>
                  <StarRating rating={vendor.rating} count={vendor.reviewCount} size="sm" />
                </div>
              </Link>
            </div>
          )}

          <div className="mt-6 space-y-3">
            {vendor?.phone && (
              <a href={`tel:${vendor.phone}`} className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-green-500 text-white font-medium hover:bg-green-600 transition-colors text-sm">
                <Phone className="h-4 w-4" />
                Call Vendor
              </a>
            )}
            {vendor?.whatsapp && (
              <a href={`https://wa.me/${vendor.whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-colors text-sm">
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
            )}
          </div>

          <div className="mt-4 flex gap-2">
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              <Heart className="h-4 w-4" />
              Save
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              <Share2 className="h-4 w-4" />
              Share
            </button>
          </div>
        </div>
      </div>

      <div className="mt-12 bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Reviews ({reviews.length})</h2>
        {reviews.length === 0 ? (
          <p className="text-gray-500 text-sm">No reviews yet</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="border-b border-gray-50 pb-4 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                    {r.reviewer?.avatar ? (
                      <img src={r.reviewer.avatar} alt="" className="h-full w-full rounded-full object-cover" />
                    ) : (
                      <User className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{r.reviewer?.name}</p>
                    <StarRating rating={r.rating} showCount={false} size="sm" />
                  </div>
                  <span className="ml-auto text-xs text-gray-400">
                    {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}
                  </span>
                </div>
                {r.comment && <p className="mt-2 text-sm text-gray-600 ml-11">{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
