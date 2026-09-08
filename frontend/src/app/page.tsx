"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { TailorProfile, VendorProfile, Job, Product } from "@/lib/types";
import TailorCard from "@/components/TailorCard";
import VendorCard from "@/components/VendorCard";
import JobCard from "@/components/JobCard";
import ProductCard from "@/components/ProductCard";
import MarketProductCard from "@/components/market/ProductCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { MarketProduct } from "@/lib/marketTypes";
import {
  Scissors,
  Store,
  Briefcase,
  ArrowRight,
  Star,
  Users,
  MapPin,
} from "lucide-react";

export default function HomePage() {
  const [tailors, setTailors] = useState<TailorProfile[]>([]);
  const [vendors, setVendors] = useState<VendorProfile[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [marketProducts, setMarketProducts] = useState<MarketProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tailorsRes, vendorsRes, jobsRes, productsRes] = await Promise.allSettled([
          api.get("/tailors?limit=4"),
          api.get("/vendors?limit=4"),
          api.get("/jobs?limit=6"),
          api.get("/products?limit=8"),
        ]);
        const marketRes = await api.get("/market?limit=4&sortBy=rating");
        if (tailorsRes.status === "fulfilled") setTailors(tailorsRes.value.data.data || []);
        if (vendorsRes.status === "fulfilled") setVendors(vendorsRes.value.data.data || []);
        if (jobsRes.status === "fulfilled") setJobs(jobsRes.value.data.data || []);
        if (productsRes.status === "fulfilled") setProducts(productsRes.value.data.data || []);
        setMarketProducts(marketRes.data.data || []);
      } catch {
        // Silently fail on homepage
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const categories = [
    { name: "Lace", icon: "🪡", count: "500+" },
    { name: "Ankara", icon: "🎨", count: "800+" },
    { name: "Aso Oke", icon: "🧵", count: "300+" },
    { name: "Beads", icon: "📿", count: "200+" },
    { name: "Silk", icon: "✨", count: "400+" },
    { name: "Chiffon", icon: "🌬️", count: "150+" },
    { name: "Denim", icon: "👖", count: "250+" },
    { name: "Velvet", icon: "💜", count: "180+" },
  ];

  const testimonials = [
    {
      name: "Adaeze O.",
      role: "Tailor",
      text: "D Tailors helped me find clients in Lagos. My business has grown 3x since joining!",
    },
    {
      name: "Fatima B.",
      role: "Vendor",
      text: "I sell Ankara fabrics to tailors across Nigeria. The platform is easy to use.",
    },
    {
      name: "Chidi N.",
      role: "Employer",
      text: "Found an amazing apprentice tailor through D Tailors. Highly recommend!",
    },
  ];

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-stone-900 via-primary-950 to-stone-900 overflow-hidden text-white py-24 sm:py-32">
        {/* Glow Effects & Ambient Orbs */}
        <div className="absolute inset-0 opacity-25 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-primary-500 to-accent-500 rounded-full blur-[140px] animate-pulse-glow" />
          <div className="absolute -bottom-20 right-10 w-96 h-96 bg-amber-500/30 rounded-full blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-accent-300 shadow-sm animate-float">
              <span className="flex h-2 w-2 rounded-full bg-accent-400 animate-ping" />
              Africa&apos;s #1 Fashion & Textile Hub
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Crafting Africa&apos;s Next Generation of{" "}
              <span className="bg-gradient-to-r from-accent-300 via-primary-400 to-accent-200 bg-clip-text text-transparent">
                Fashion & Style
              </span>
            </h1>

            <p className="text-base sm:text-xl text-stone-300 max-w-2xl mx-auto leading-relaxed font-light">
              Connect directly with verified tailors, authentic African fabric vendors, and top fashion employers in one premium ecosystem.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row gap-3.5 justify-center items-center">
              <Link
                href="/tailors"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-primary-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Scissors className="h-5 w-5" />
                Find Tailors
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/vendors"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-xl font-semibold hover:bg-white/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Store className="h-5 w-5 text-accent-300" />
                Shop Fabrics
              </Link>
              <Link
                href="/jobs"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-xl font-semibold hover:bg-white/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Briefcase className="h-5 w-5 text-emerald-400" />
                Browse Jobs
              </Link>
            </div>

            {/* Stat Counters Banner */}
            <div className="pt-10 grid grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
                <div className="text-2xl sm:text-3xl font-extrabold text-white">2,500+</div>
                <div className="text-xs text-stone-400 font-medium mt-0.5">Verified Tailors</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
                <div className="text-2xl sm:text-3xl font-extrabold text-white">1,200+</div>
                <div className="text-xs text-stone-400 font-medium mt-0.5">Fabric Vendors</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10">
                <div className="text-2xl sm:text-3xl font-extrabold text-white">5,000+</div>
                <div className="text-xs text-stone-400 font-medium mt-0.5">Jobs Created</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-2">
          <div>
            <span className="text-xs font-extrabold tracking-wider text-primary-600 uppercase">Categories</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 mt-1">Popular Fabrics & Materials</h2>
          </div>
          <p className="text-xs text-stone-500">Explore authentic African textiles by material</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={`/vendors?category=${cat.name}`}
              className="group flex flex-col items-center gap-2 p-4 rounded-2xl bg-white border border-stone-200/70 hover:border-primary-300 hover-lift transition-all text-center"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform duration-200">{cat.icon}</span>
              <span className="text-xs font-bold text-stone-800 group-hover:text-primary-600 transition-colors">{cat.name}</span>
              <span className="text-[11px] font-medium text-stone-400">{cat.count}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Tailors */}
      {tailors.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-extrabold tracking-wider text-primary-600 uppercase">Master Craftsmen</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 mt-1">Featured Tailors</h2>
            </div>
            <Link href="/tailors" className="text-primary-600 hover:text-primary-700 text-xs font-bold flex items-center gap-1 bg-primary-50 px-3 py-1.5 rounded-full hover:bg-primary-100 transition-colors">
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {tailors.map((t) => (
              <TailorCard key={t.id} tailor={t} />
            ))}
          </div>
        </section>
      )}

      {/* Featured Vendors */}
      {vendors.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-extrabold tracking-wider text-accent-600 uppercase">Fabric Suppliers</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 mt-1">Featured Vendors</h2>
            </div>
            <Link href="/vendors" className="text-accent-600 hover:text-accent-700 text-xs font-bold flex items-center gap-1 bg-accent-50 px-3 py-1.5 rounded-full hover:bg-accent-100 transition-colors">
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {vendors.map((v) => (
              <VendorCard key={v.id} vendor={v} />
            ))}
          </div>
        </section>
      )}

      {/* Trending Products */}
      {products.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-extrabold tracking-wider text-primary-600 uppercase">Catalog</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 mt-1">Trending Products</h2>
            </div>
            <Link href="/vendors" className="text-primary-600 hover:text-primary-700 text-xs font-bold flex items-center gap-1 bg-primary-50 px-3 py-1.5 rounded-full hover:bg-primary-100 transition-colors">
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Marketplace Spotlight */}
      {marketProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-extrabold tracking-wider text-accent-600 uppercase">Spotlight</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 mt-1">Marketplace Highlights</h2>
            </div>
            <Link href="/market" className="text-accent-600 hover:text-accent-700 text-xs font-bold flex items-center gap-1 bg-accent-50 px-3 py-1.5 rounded-full hover:bg-accent-100 transition-colors">
              Shop Market <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {marketProducts.map((product) => (
              <MarketProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Latest Jobs */}
      {jobs.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-extrabold tracking-wider text-emerald-600 uppercase">Opportunities</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 mt-1">Latest Job Postings</h2>
            </div>
            <Link href="/jobs" className="text-emerald-600 hover:text-emerald-700 text-xs font-bold flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-full hover:bg-emerald-100 transition-colors">
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {jobs.map((j) => (
              <JobCard key={j.id} job={j} />
            ))}
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10 max-w-lg mx-auto">
          <span className="text-xs font-extrabold tracking-wider text-primary-600 uppercase">Community Feedback</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 mt-1">Trusted by Fashion Creators</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-white rounded-2xl border border-stone-200/70 p-6 hover-lift relative flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-stone-600 text-xs leading-relaxed italic">&quot;{t.text}&quot;</p>
              </div>
              <div className="mt-6 flex items-center gap-3 pt-4 border-t border-stone-100">
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-900">{t.name}</p>
                  <p className="text-[11px] font-medium text-stone-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Onboarding Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="bg-stone-900 rounded-3xl p-8 sm:p-12 relative overflow-hidden text-white">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">Join the D Tailors Ecosystem</h2>
            <p className="mt-2 text-sm text-stone-400">Select your role to get started with tailored tools and marketplace access.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 text-center border border-white/10 hover:border-primary-500/50 transition-all">
              <div className="h-12 w-12 bg-primary-500/20 rounded-xl flex items-center justify-center mx-auto mb-4 text-primary-400">
                <Scissors className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-white text-base">Are you a Tailor?</h3>
              <p className="text-xs text-stone-400 mt-1">Showcase your portfolio & take custom orders</p>
              <Link href="/auth/register" className="mt-5 inline-block w-full py-2.5 bg-primary-500 text-white rounded-xl text-xs font-bold hover:bg-primary-600 transition-colors shadow-md shadow-primary-500/20">
                Join as Tailor
              </Link>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 text-center border border-white/10 hover:border-accent-500/50 transition-all">
              <div className="h-12 w-12 bg-accent-500/20 rounded-xl flex items-center justify-center mx-auto mb-4 text-accent-400">
                <Store className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-white text-base">Are you a Vendor?</h3>
              <p className="text-xs text-stone-400 mt-1">Sell fabrics & materials to thousands</p>
              <Link href="/auth/register" className="mt-5 inline-block w-full py-2.5 bg-accent-500 text-white rounded-xl text-xs font-bold hover:bg-accent-600 transition-colors shadow-md shadow-accent-500/20">
                Join as Vendor
              </Link>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 text-center border border-white/10 hover:border-emerald-500/50 transition-all">
              <div className="h-12 w-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mx-auto mb-4 text-emerald-400">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-white text-base">Are you an Employer?</h3>
              <p className="text-xs text-stone-400 mt-1">Post fashion jobs & hire talent</p>
              <Link href="/auth/register" className="mt-5 inline-block w-full py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-colors shadow-md shadow-emerald-500/20">
                Join as Employer
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
