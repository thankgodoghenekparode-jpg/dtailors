"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { SellerProfile, MarketProduct } from "@/lib/marketTypes";
import MarketProductCard from "@/components/market/ProductCard";
import StarRating from "@/components/StarRating";
import LoadingSpinner from "@/components/LoadingSpinner";
import toast from "react-hot-toast";
import {
  MapPin,
  CheckCircle,
  ArrowLeft,
  MessageCircle,
  Calendar,
} from "lucide-react";

export default function SellerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [products, setProducts] = useState<MarketProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("dt_token"));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [sellerRes, productsRes] = await Promise.allSettled([
          api.get(`/market/sellers/${params.id}`),
          api.get(`/market/sellers/${params.id}/products`),
        ]);
        if (sellerRes.status === "fulfilled")
          setSeller(sellerRes.value.data.seller || sellerRes.value.data);
        if (productsRes.status === "fulfilled")
          setProducts(
            productsRes.value.data.data ||
              productsRes.value.data.products ||
              []
          );
      } catch {
        // handled by not-found
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchData();
  }, [params.id]);

  if (loading) return <LoadingSpinner />;
  if (!seller)
    return <div className="text-center py-20 text-gray-500">Seller not found</div>;

  const loc = seller.location as Record<string, string> | undefined;
  const locationStr = [loc?.city, loc?.state, loc?.country].filter(Boolean).join(", ");
  const whatsapp = seller.whatsapp;

  const handleChat = () => {
    if (!isLoggedIn) {
      toast.error("Please login to chat with seller");
      return;
    }
    router.push(`/conversations?seller=${seller.id}`);
  };

  const handleWhatsApp = () => {
    if (whatsapp) {
      const num = whatsapp.replace(/[^0-9]/g, "");
      window.open(`https://wa.me/${num}`, "_blank");
    } else {
      toast.error("Seller has no WhatsApp number");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/market" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Marketplace
      </Link>

      {/* Banner */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6">
        <div className="h-40 sm:h-56 bg-gradient-to-r from-primary-100 via-accent-100 to-primary-50 relative">
          {seller.banner ? (
            <img src={seller.banner} alt="Store banner" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <span className="text-5xl font-bold text-primary-300/60">
                {seller.storeName?.charAt(0)?.toUpperCase()}
              </span>
            </div>
          )}
        </div>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 -mt-16 sm:-mt-14">
            <div className="h-24 w-24 rounded-2xl bg-white border-4 border-white shadow-sm flex items-center justify-center text-primary-600 font-bold text-3xl overflow-hidden shrink-0">
              {seller.logo ? (
                <img src={seller.logo} alt={seller.storeName} className="h-full w-full object-cover" />
              ) : (
                seller.storeName?.charAt(0)?.toUpperCase()
              )}
            </div>
            <div className="flex-1 sm:mt-0 mt-2">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">{seller.storeName}</h1>
                {seller.isVerified && <CheckCircle className="h-5 w-5 text-primary-500" />}
              </div>
              <div className="mt-1 flex items-center gap-3 text-sm text-gray-500 flex-wrap">
                <StarRating rating={seller.rating || 0} count={seller.reviewCount || 0} size="md" />
                {locationStr && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {locationStr}
                  </span>
                )}
                {seller.memberSince && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Member since {new Date(seller.memberSince).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2 sm:mt-0">
              <button
                onClick={handleChat}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                Chat with Seller
              </button>
              <button
                onClick={handleWhatsApp}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp Seller
              </button>
            </div>
          </div>

          {seller.description && (
            <p className="mt-4 text-gray-600 leading-relaxed">{seller.description}</p>
          )}
        </div>
      </div>

      {/* Products */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Products ({products.length})
        </h2>
        {products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <p className="text-gray-500 text-lg">No products yet</p>
            <p className="text-gray-400 text-sm mt-1">This seller hasn't listed any products</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => (
              <MarketProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
