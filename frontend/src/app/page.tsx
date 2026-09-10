"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { TailorProfile, VendorProfile, Job, Product } from "@/lib/types";
import TailorCard from "@/components/TailorCard";
import VendorCard from "@/components/VendorCard";
import JobCard from "@/components/JobCard";
import ProductCard from "@/components/ProductCard";
import MarketProductCard from "@/components/market/ProductCard";
import HeroSection from "@/components/HeroSection";
import LoadingSpinner from "@/components/LoadingSpinner";
import { MarketProduct } from "@/lib/marketTypes";
import {
  Scissors,
  Store,
  Briefcase,
  ArrowRight,
  Star,
  Users,
  Sparkles,
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
    <div className="space-y-16 pb-20">
      {/* Dynamic Animated Hero Section */}
      <HeroSection />

      {/* Popular Categories Grid */}
      <motion.section
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-2">
          <div>
            <span className="text-xs font-black tracking-wider text-primary-600 uppercase">Categories</span>
            <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mt-1 tracking-tight">Popular Fabrics & Materials</h2>
          </div>
          <p className="text-xs text-stone-500 font-medium">Explore authentic African textiles by material</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3.5">
          {categories.map((cat, idx) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              whileHover={{ y: -5, scale: 1.04 }}
            >
              <Link
                href={`/vendors?category=${cat.name}`}
                className="group flex flex-col items-center gap-2 p-4 rounded-2xl bg-white border border-stone-200/80 shadow-sm hover:border-primary-300 hover:shadow-xl hover:shadow-primary-500/10 transition-all text-center"
              >
                <span className="text-3.5xl group-hover:scale-110 transition-transform duration-300">{cat.icon}</span>
                <span className="text-xs font-extrabold text-stone-800 group-hover:text-primary-600 transition-colors">{cat.name}</span>
                <span className="text-[11px] font-semibold text-stone-400">{cat.count}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Featured Tailors */}
      {tailors.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-black tracking-wider text-primary-600 uppercase">Master Craftsmen</span>
              <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mt-1 tracking-tight">Featured Tailors</h2>
            </div>
            <Link href="/tailors" className="text-primary-600 hover:text-primary-700 text-xs font-extrabold flex items-center gap-1 bg-primary-50 px-3.5 py-1.5 rounded-full hover:bg-primary-100 transition-all hover:scale-105">
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {tailors.map((t, idx) => (
              <TailorCard key={t.id} tailor={t} index={idx} />
            ))}
          </div>
        </motion.section>
      )}

      {/* Featured Vendors */}
      {vendors.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-black tracking-wider text-amber-600 uppercase">Fabric Suppliers</span>
              <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mt-1 tracking-tight">Featured Vendors</h2>
            </div>
            <Link href="/vendors" className="text-amber-600 hover:text-amber-700 text-xs font-extrabold flex items-center gap-1 bg-amber-50 px-3.5 py-1.5 rounded-full hover:bg-amber-100 transition-all hover:scale-105">
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {vendors.map((v, idx) => (
              <VendorCard key={v.id} vendor={v} index={idx} />
            ))}
          </div>
        </motion.section>
      )}

      {/* Trending Products */}
      {products.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-black tracking-wider text-primary-600 uppercase">Catalog</span>
              <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mt-1 tracking-tight">Trending Products</h2>
            </div>
            <Link href="/vendors" className="text-primary-600 hover:text-primary-700 text-xs font-extrabold flex items-center gap-1 bg-primary-50 px-3.5 py-1.5 rounded-full hover:bg-primary-100 transition-all hover:scale-105">
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </motion.section>
      )}

      {/* Marketplace Spotlight */}
      {marketProducts.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-black tracking-wider text-amber-600 uppercase">Spotlight</span>
              <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mt-1 tracking-tight">Marketplace Highlights</h2>
            </div>
            <Link href="/market" className="text-amber-600 hover:text-amber-700 text-xs font-extrabold flex items-center gap-1 bg-amber-50 px-3.5 py-1.5 rounded-full hover:bg-amber-100 transition-all hover:scale-105">
              Shop Market <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {marketProducts.map((product, idx) => (
              <MarketProductCard key={product.id} product={product} index={idx} />
            ))}
          </div>
        </motion.section>
      )}

      {/* Latest Jobs */}
      {jobs.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-black tracking-wider text-emerald-600 uppercase">Opportunities</span>
              <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mt-1 tracking-tight">Latest Job Postings</h2>
            </div>
            <Link href="/jobs" className="text-emerald-600 hover:text-emerald-700 text-xs font-extrabold flex items-center gap-1 bg-emerald-50 px-3.5 py-1.5 rounded-full hover:bg-emerald-100 transition-all hover:scale-105">
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {jobs.map((j, idx) => (
              <JobCard key={j.id} job={j} index={idx} />
            ))}
          </div>
        </motion.section>
      )}

      {/* Testimonials Section Assembly */}
      <motion.section
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10"
      >
        <div className="text-center mb-10 max-w-lg mx-auto">
          <span className="text-xs font-black tracking-wider text-primary-600 uppercase">Community Feedback</span>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 mt-1 tracking-tight">Trusted by Fashion Creators</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.1, type: "spring", stiffness: 240, damping: 20 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-sm hover:shadow-xl hover:shadow-primary-500/10 relative flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-stone-600 text-xs leading-relaxed italic font-medium">&quot;{t.text}&quot;</p>
              </div>
              <div className="mt-6 flex items-center gap-3 pt-4 border-t border-stone-100">
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary-500 to-amber-500 flex items-center justify-center text-white font-extrabold text-sm shadow-md">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-extrabold text-stone-900">{t.name}</p>
                  <p className="text-[11px] font-semibold text-stone-500">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* CTA Onboarding Section */}
      <motion.section
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.65, type: "spring", stiffness: 220, damping: 20 }}
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
      >
        <div className="bg-stone-950 rounded-3xl p-8 sm:p-14 relative overflow-hidden text-white shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary-500/20 to-amber-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Join the D Tailors Ecosystem</h2>
            <p className="mt-2 text-sm text-stone-400 font-medium">Select your role to get started with tailored tools and marketplace access.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <motion.div whileHover={{ y: -5, scale: 1.02 }} className="bg-white/5 backdrop-blur-md rounded-2xl p-6 text-center border border-white/10 hover:border-primary-500/50 transition-all">
              <div className="h-12 w-12 bg-primary-500/20 rounded-xl flex items-center justify-center mx-auto mb-4 text-primary-400 shadow-md">
                <Scissors className="h-6 w-6" />
              </div>
              <h3 className="font-extrabold text-white text-base">Are you a Tailor?</h3>
              <p className="text-xs text-stone-400 mt-1 font-normal">Showcase your portfolio & take custom orders</p>
              <Link href="/auth/register" className="mt-5 inline-block w-full py-2.5 bg-gradient-to-r from-primary-500 to-amber-500 text-white rounded-xl text-xs font-extrabold hover:shadow-lg hover:shadow-primary-500/25 transition-all active:scale-[0.98]">
                Join as Tailor
              </Link>
            </motion.div>

            <motion.div whileHover={{ y: -5, scale: 1.02 }} className="bg-white/5 backdrop-blur-md rounded-2xl p-6 text-center border border-white/10 hover:border-amber-500/50 transition-all">
              <div className="h-12 w-12 bg-amber-500/20 rounded-xl flex items-center justify-center mx-auto mb-4 text-amber-400 shadow-md">
                <Store className="h-6 w-6" />
              </div>
              <h3 className="font-extrabold text-white text-base">Are you a Vendor?</h3>
              <p className="text-xs text-stone-400 mt-1 font-normal">Sell fabrics & materials to thousands</p>
              <Link href="/auth/register" className="mt-5 inline-block w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-xs font-extrabold hover:shadow-lg hover:shadow-amber-500/25 transition-all active:scale-[0.98]">
                Join as Vendor
              </Link>
            </motion.div>

            <motion.div whileHover={{ y: -5, scale: 1.02 }} className="bg-white/5 backdrop-blur-md rounded-2xl p-6 text-center border border-white/10 hover:border-emerald-500/50 transition-all">
              <div className="h-12 w-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mx-auto mb-4 text-emerald-400 shadow-md">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="font-extrabold text-white text-base">Are you an Employer?</h3>
              <p className="text-xs text-stone-400 mt-1 font-normal">Post fashion jobs & hire talent</p>
              <Link href="/auth/register" className="mt-5 inline-block w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-xs font-extrabold hover:shadow-lg hover:shadow-emerald-500/25 transition-all active:scale-[0.98]">
                Join as Employer
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
