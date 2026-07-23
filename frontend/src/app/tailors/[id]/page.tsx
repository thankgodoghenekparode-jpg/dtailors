"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { TailorProfile, Review } from "@/lib/types";
import StarRating from "@/components/StarRating";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  MapPin,
  Phone,
  MessageCircle,
  Instagram,
  Facebook,
  Award,
  Clock,
  Heart,
  ArrowLeft,
  User,
  Star,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function TailorProfilePage() {
  const params = useParams();
  const [tailor, setTailor] = useState<TailorProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tailorRes, reviewsRes] = await Promise.allSettled([
          api.get(`/tailors/${params.id}`),
          api.get(`/reviews/${params.id}`),
        ]);
        if (tailorRes.status === "fulfilled") setTailor(tailorRes.value.data.tailor);
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
  if (!tailor) return <div className="text-center py-20 text-gray-500">Tailor not found</div>;

  const loc = tailor.location as Record<string, string> | undefined;
  const locationStr = [loc?.city, loc?.state, loc?.country].filter(Boolean).join(", ");

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/tailors" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Tailors
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-start gap-5">
              <div className="h-20 w-20 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-3xl shrink-0 overflow-hidden">
                {tailor.photo ? (
                  <img src={tailor.photo} alt={tailor.user?.name || ""} className="h-full w-full object-cover" />
                ) : (
                  tailor.user?.name?.charAt(0)?.toUpperCase()
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{tailor.user?.name}</h1>
                {locationStr && (
                  <div className="flex items-center gap-1 text-gray-500 mt-1">
                    <MapPin className="h-4 w-4" />
                    <span>{locationStr}</span>
                  </div>
                )}
                <div className="mt-2">
                  <StarRating rating={0} count={tailor.portfolio?.length || 0} size="md" />
                </div>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    {tailor.yearsOfExperience || 0} years experience
                  </div>
                  <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${tailor.availability === "available" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                    {tailor.availability || "Available"}
                  </div>
                </div>
              </div>
            </div>

            {tailor.bio && <p className="mt-5 text-gray-600 leading-relaxed">{tailor.bio}</p>}

            {tailor.specializations.length > 0 && (
              <div className="mt-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Specializations</h3>
                <div className="flex flex-wrap gap-2">
                  {tailor.specializations.map((s) => (
                    <span key={s} className="px-3 py-1 bg-primary-50 text-primary-600 text-sm rounded-full font-medium">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {tailor.skills.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {tailor.skills.map((s) => (
                    <span key={s} className="px-3 py-1 bg-accent-50 text-accent-700 text-sm rounded-full font-medium">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {tailor.languages?.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {tailor.languages.map((l) => (
                    <span key={l} className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">{l}</span>
                  ))}
                </div>
              </div>
            )}

            {tailor.expectedSalary && (
              <div className="mt-4 flex items-center gap-2">
                <span className="text-sm text-gray-500">Expected Salary:</span>
                <span className="text-sm font-semibold text-gray-900">&#8358;{tailor.expectedSalary.toLocaleString()}</span>
              </div>
            )}
          </div>

          {tailor.portfolio.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Portfolio</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {tailor.portfolio.map((img, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedImage(img)}
                    className="aspect-square bg-gray-100 rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition"
                  >
                    <img src={img} alt={`Portfolio ${i + 1}`} className="h-full w-full object-cover" />
                  </div>
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

        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
            <h3 className="font-semibold text-gray-900 mb-4">Contact</h3>
            <div className="space-y-3">
              {tailor.user?.phone && (
                <a
                  href={`tel:${tailor.user.phone}`}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 transition-colors font-medium text-sm"
                >
                  <Phone className="h-4 w-4" />
                  Call Now
                </a>
              )}
              {tailor.whatsapp && (
                <a
                  href={`https://wa.me/${tailor.whatsapp.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors font-medium text-sm"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
              )}
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors font-medium text-sm">
                <Award className="h-4 w-4" />
                Hire This Tailor
              </button>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="text-lg font-bold text-gray-900">{tailor.yearsOfExperience || 0}</div>
                  <div className="text-xs text-gray-500">Years Exp</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="text-lg font-bold text-gray-900">{tailor.portfolio.length}</div>
                  <div className="text-xs text-gray-500">Portfolio</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
          <img src={selectedImage} alt="Portfolio" className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain" />
        </div>
      )}
    </div>
  );
}
