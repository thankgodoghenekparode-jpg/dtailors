"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { VendorProfile, Review, Product } from "@/lib/types";
import ProductCard from "@/components/ProductCard";
import StarRating from "@/components/StarRating";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  MapPin,
  Phone,
  MessageCircle,
  Instagram,
  Facebook,
  Globe,
  CheckCircle,
  ArrowLeft,
  ExternalLink,
  User,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function VendorProfilePage() {
  const params = useParams();
  const [vendor, setVendor] = useState<VendorProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vendorRes, reviewsRes] = await Promise.allSettled([
          api.get(`/vendors/${params.id}`),
          api.get(`/reviews/${params.id}`),
        ]);
        if (vendorRes.status === "fulfilled") setVendor(vendorRes.value.data.vendor);
        if (reviewsRes.status === "fulfilled") setReviews(reviewsRes.value.data.data || []);
      } catch {
        // handle error
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.id]);

  if (loading) return <LoadingSpinner />;
  if (!vendor) return <div className="text-center py-20 text-gray-500">Vendor not found</div>;

  const loc = vendor.location as Record<string, string> | undefined;
  const locationStr = [loc?.city, loc?.state, loc?.country].filter(Boolean).join(", ");
  const mapsQuery = encodeURIComponent(locationStr || vendor.businessName);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/vendors" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Vendors
      </Link>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
        <div className="flex items-start gap-5">
          <div className="h-20 w-20 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-3xl shrink-0 overflow-hidden">
            {vendor.logo ? (
              <img src={vendor.logo} alt={vendor.businessName} className="h-full w-full object-cover" />
            ) : (
              vendor.businessName?.charAt(0)?.toUpperCase()
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{vendor.businessName}</h1>
              {vendor.verified && <CheckCircle className="h-5 w-5 text-primary-500" />}
            </div>
            {locationStr && (
              <div className="flex items-center gap-1 text-gray-500 mt-1">
                <MapPin className="h-4 w-4" />
                <span>{locationStr}</span>
              </div>
            )}
            <div className="mt-2">
              <StarRating rating={vendor.rating} count={vendor.reviewCount} size="md" />
            </div>
          </div>
        </div>

        {vendor.about && <p className="mt-5 text-gray-600 leading-relaxed">{vendor.about}</p>}

        {vendor.categories.length > 0 && (
          <div className="mt-4">
            <div className="flex flex-wrap gap-2">
              {vendor.categories.map((c) => (
                <span key={c} className="px-3 py-1 bg-accent-50 text-accent-600 text-sm rounded-full font-medium">{c}</span>
              ))}
            </div>
          </div>
        )}

        {vendor.deliveryOptions.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-1">Delivery Options</h3>
            <div className="flex flex-wrap gap-2">
              {vendor.deliveryOptions.map((d) => (
                <span key={d} className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full">{d}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {vendor.products && vendor.products.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Products ({vendor.products.length})</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {vendor.products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
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

        <div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24 space-y-3">
            <h3 className="font-semibold text-gray-900">Contact</h3>
            {vendor.phone && (
              <a href={`tel:${vendor.phone}`} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 transition-colors font-medium text-sm">
                <Phone className="h-4 w-4" />
                Call Now
              </a>
            )}
            {vendor.whatsapp && (
              <a href={`https://wa.me/${vendor.whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors font-medium text-sm">
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
            )}
            {vendor.instagram && (
              <a href={vendor.instagram.startsWith("http") ? vendor.instagram : `https://instagram.com/${vendor.instagram}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-pink-50 text-pink-700 hover:bg-pink-100 transition-colors font-medium text-sm">
                <Instagram className="h-4 w-4" />
                Instagram
              </a>
            )}
            {vendor.facebook && (
              <a href={vendor.facebook.startsWith("http") ? vendor.facebook : `https://facebook.com/${vendor.facebook}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors font-medium text-sm">
                <Facebook className="h-4 w-4" />
                Facebook
              </a>
            )}
            {vendor.website && (
              <a href={vendor.website.startsWith("http") ? vendor.website : `https://${vendor.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors font-medium text-sm">
                <Globe className="h-4 w-4" />
                Website
              </a>
            )}
            {locationStr && (
              <a href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors font-medium text-sm">
                <MapPin className="h-4 w-4" />
                Get Directions
                <ExternalLink className="h-3.5 w-3.5 ml-auto" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
