"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import {
  MarketProduct,
  MarketReview,
  SellerProfile,
} from "@/lib/marketTypes";
import MarketProductCard from "@/components/market/ProductCard";
import StarRating from "@/components/StarRating";
import Rating from "@/components/Rating";
import LoadingSpinner from "@/components/LoadingSpinner";
import useCartStore from "@/store/cartStore";
import toast from "react-hot-toast";
import {
  MapPin,
  ArrowLeft,
  CheckCircle,
  ShoppingCart,
  Zap,
  MessageCircle,
  Heart,
  Truck,
  Shield,
  Minus,
  Plus,
  Package,
  Send,
  User,
} from "lucide-react";

export default function MarketProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCartStore();
  const [product, setProduct] = useState<MarketProduct | null>(null);
  const [reviews, setReviews] = useState<MarketReview[]>([]);
  const [related, setRelated] = useState<MarketProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"description" | "reviews">("description");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("dt_token"));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productRes, reviewsRes, relatedRes] = await Promise.allSettled([
          api.get(`/market/products/${params.id}`),
          api.get(`/market/products/${params.id}/reviews`),
          api.get(`/market/products/${params.id}/related`),
        ]);
        if (productRes.status === "fulfilled") {
          const p = productRes.value.data.product || productRes.value.data;
          setProduct(p);
          if (p.sizes?.length) setSelectedSize(p.sizes[0]);
          if (p.colors?.length) setSelectedColor(p.colors[0]);
        }
        if (reviewsRes.status === "fulfilled")
          setReviews(reviewsRes.value.data.data || reviewsRes.value.data.reviews || []);
        if (relatedRes.status === "fulfilled")
          setRelated(relatedRes.value.data.data || relatedRes.value.data.related || []);
      } catch {
        // handled by not-found below
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchData();
  }, [params.id]);

  if (loading) return <LoadingSpinner />;
  if (!product) return <div className="text-center py-20 text-gray-500">Product not found</div>;

  const price = product.price;
  const displayPrice = product.discountPrice ?? price;
  const discount = price - displayPrice;
  const outOfStock = product.stock <= 0 || product.status === "sold_out";
  const loc = product.location as Record<string, string> | undefined;
  const locationStr = [loc?.city, loc?.state, loc?.country].filter(Boolean).join(", ");
  const seller = product.seller;
  const sellerLoc = seller?.location as Record<string, string> | undefined;
  const sellerLocationStr = [sellerLoc?.city, sellerLoc?.state, sellerLoc?.country].filter(Boolean).join(", ");
  const specs = product.specifications || {};
  const watsapp = seller?.whatsapp;

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      toast.error("Please login to add to cart");
      return;
    }
    try {
      await addToCart(product.id, 1);
      toast.success("Added to cart");
    } catch (err: any) {
      toast.error(err.message || "Failed to add to cart");
    }
  };

  const handleBuyNow = async () => {
    if (!isLoggedIn) {
      toast.error("Please login to checkout");
      return;
    }
    try {
      await addToCart(product.id, 1);
      router.push("/checkout");
    } catch (err: any) {
      toast.error(err.message || "Failed to add to cart");
    }
  };

  const handleChat = () => {
    if (!isLoggedIn) {
      toast.error("Please login to chat with seller");
      return;
    }
    router.push(`/sellers/${product.sellerId}`);
  };

  const handleWhatsApp = () => {
    if (watsapp) {
      const num = watsapp.replace(/[^0-9]/g, "");
      window.open(`https://wa.me/${num}`, "_blank");
    } else {
      toast.error("Seller has no WhatsApp number");
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/market/products/${product.id}/reviews`, { rating, comment });
      toast.success("Review submitted");
      setRating(0);
      setComment("");
      const res = await api.get(`/market/products/${product.id}/reviews`);
      setReviews(res.data.data || res.data.reviews || []);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/market" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Marketplace
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Gallery */}
        <div>
          <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden border border-gray-100 sticky top-24">
            {product.images?.[activeImage] ? (
              <img src={product.images[activeImage]} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-gray-400">
                <Package className="h-20 w-20" />
              </div>
            )}
          </div>
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`h-20 w-20 rounded-xl overflow-hidden border-2 transition-colors ${
                    activeImage === i ? "border-primary-500" : "border-gray-100 hover:border-gray-300"
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="px-3 py-1 bg-accent-50 text-accent-600 text-sm rounded-full font-medium capitalize">
              {product.category}
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full capitalize">
              {product.condition}
            </span>
            {discount > 0 && (
              <span className="px-3 py-1 bg-red-50 text-red-600 text-sm rounded-full font-medium">
                {Math.round((discount / price) * 100)}% OFF
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{product.name}</h1>

          <div className="mt-2 flex items-center gap-2">
            <StarRating rating={product.rating || 0} count={product.reviewCount || 0} size="md" />
            <span className="text-gray-500 text-sm">({product.reviewCount || 0} reviews)</span>
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-primary-600">
              &#8358;{displayPrice.toLocaleString()}
            </span>
            {discount > 0 && (
              <span className="text-lg text-gray-400 line-through">
                &#8358;{price.toLocaleString()}
              </span>
            )}
          </div>

          <div className="mt-2 text-sm">
            {outOfStock ? (
              <span className="text-red-500 font-medium">Out of stock</span>
            ) : (
              <span className="text-green-600 font-medium">In stock ({product.stock} available)</span>
            )}
          </div>

          {locationStr && (
            <div className="mt-2 flex items-center gap-1 text-sm text-gray-500">
              <MapPin className="h-4 w-4" />
              {locationStr}
            </div>
          )}

          {product.sizes && product.sizes.length > 0 && (
            <div className="mt-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Size</h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                      selectedSize === s
                        ? "border-primary-500 bg-primary-50 text-primary-600"
                        : "border-gray-200 text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.colors && product.colors.length > 0 && (
            <div className="mt-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Color</h3>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                      selectedColor === c
                        ? "border-primary-500 bg-primary-50 text-primary-600"
                        : "border-gray-200 text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={handleAddToCart}
              disabled={outOfStock}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-primary-500 text-primary-600 font-medium hover:bg-primary-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="h-5 w-5" />
              Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              disabled={outOfStock}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Zap className="h-5 w-5" />
              Buy Now
            </button>
            <button
              onClick={handleChat}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
              Chat with Seller
            </button>
            <button
              onClick={handleWhatsApp}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-colors"
            >
              <MessageCircle className="h-5 w-5" />
              Chat on WhatsApp
            </button>
          </div>

          <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1"><Truck className="h-4 w-4 text-primary-500" /> Delivery available</span>
            <span className="flex items-center gap-1"><Shield className="h-4 w-4 text-primary-500" /> Buyer protection</span>
          </div>
        </div>
      </div>

      {/* Seller card */}
      {seller && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-2xl overflow-hidden shrink-0">
              {seller.logo ? (
                <img src={seller.logo} alt={seller.storeName} className="h-full w-full object-cover" />
              ) : (
                seller.storeName?.charAt(0)?.toUpperCase()
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Link href={`/sellers/${seller.id}`} className="text-lg font-bold text-gray-900 hover:text-primary-600 transition-colors">
                  {seller.storeName}
                </Link>
                {seller.isVerified && <CheckCircle className="h-5 w-5 text-primary-500" />}
              </div>
              <div className="mt-1 flex items-center gap-3 text-sm text-gray-500 flex-wrap">
                <StarRating rating={seller.rating || 0} count={seller.reviewCount || 0} size="sm" />
                {sellerLocationStr && (
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{sellerLocationStr}</span>
                )}
                {seller.memberSince && (
                  <span>Member since {new Date(seller.memberSince).getFullYear()}</span>
                )}
              </div>
            </div>
            <Link
              href={`/sellers/${seller.id}`}
              className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shrink-0"
            >
              View Store
            </Link>
          </div>
          {seller.description && (
            <p className="mt-3 text-sm text-gray-600 line-clamp-2">{seller.description}</p>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 flex gap-4 border-b border-gray-100">
        <button
          onClick={() => setActiveTab("description")}
          className={`pb-3 font-medium text-sm transition-colors border-b-2 ${
            activeTab === "description" ? "border-primary-500 text-primary-600" : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Description
        </button>
        <button
          onClick={() => setActiveTab("reviews")}
          className={`pb-3 font-medium text-sm transition-colors border-b-2 ${
            activeTab === "reviews" ? "border-primary-500 text-primary-600" : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Reviews ({reviews.length})
        </button>
      </div>

      {activeTab === "description" ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <p className="text-gray-600 leading-relaxed whitespace-pre-line">
            {product.description || "No description available."}
          </p>
          {Object.keys(specs).length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mt-6 mb-4">Specifications</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                {Object.entries(specs).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-2 border-b border-gray-50">
                    <span className="text-sm text-gray-500 capitalize">{key.replace(/_/g, " ")}</span>
                    <span className="text-sm font-medium text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {isLoggedIn && (
            <form onSubmit={handleSubmitReview} className="bg-white rounded-2xl border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Write a Review</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Your rating</label>
                <Rating value={rating} interactive size="lg" onChange={setRating} />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Your comment</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  placeholder="Share your experience with this product..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          )}

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Customer Reviews ({reviews.length})</h3>
            {reviews.length === 0 ? (
              <p className="text-gray-500 text-sm">No reviews yet. Be the first to review this product.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r.id} className="border-b border-gray-50 pb-4 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                        {r.reviewer?.avatar ? (
                          <img src={r.reviewer.avatar} alt="" className="h-full w-full rounded-full object-cover" />
                        ) : (
                          <User className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{r.reviewer?.name || "User"}</p>
                        <StarRating rating={r.rating} showCount={false} size="sm" />
                      </div>
                    </div>
                    {r.comment && <p className="mt-2 text-sm text-gray-600 ml-11">{r.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Related products */}
      {related.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Related Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {related.map((p) => (
              <MarketProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
