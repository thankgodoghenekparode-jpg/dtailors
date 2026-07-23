"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { TailorProfile, VendorProfile, Job, Product } from "@/lib/types";
import TailorCard from "@/components/TailorCard";
import VendorCard from "@/components/VendorCard";
import JobCard from "@/components/JobCard";
import ProductCard from "@/components/ProductCard";
import LoadingSpinner from "@/components/LoadingSpinner";
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
        if (tailorsRes.status === "fulfilled") setTailors(tailorsRes.value.data.data || []);
        if (vendorsRes.status === "fulfilled") setVendors(vendorsRes.value.data.data || []);
        if (jobsRes.status === "fulfilled") setJobs(jobsRes.value.data.data || []);
        if (productsRes.status === "fulfilled") setProducts(productsRes.value.data.data || []);
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
    <div>
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-500 to-accent-500 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Africa&apos;s Premier{" "}
              <span className="text-accent-200">Fashion</span> Marketplace
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-white/80 max-w-2xl mx-auto">
              Connect with skilled tailors, trusted fabric vendors, and top employers.
              Everything you need for the fashion industry, in one place.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/tailors"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-primary-600 rounded-xl font-semibold hover:bg-primary-50 transition-colors shadow-lg"
              >
                <Scissors className="h-5 w-5" />
                Find Tailors
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/vendors"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/10 text-white border border-white/30 rounded-xl font-semibold hover:bg-white/20 transition-colors"
              >
                <Store className="h-5 w-5" />
                Shop Fabrics
              </Link>
              <Link
                href="/jobs"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/10 text-white border border-white/30 rounded-xl font-semibold hover:bg-white/20 transition-colors"
              >
                <Briefcase className="h-5 w-5" />
                Browse Jobs
              </Link>
            </div>
            <div className="mt-10 flex items-center justify-center gap-8 text-white/70">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">2,500+</div>
                <div className="text-sm">Tailors</div>
              </div>
              <div className="w-px h-8 bg-white/30" />
              <div className="text-center">
                <div className="text-2xl font-bold text-white">1,200+</div>
                <div className="text-sm">Vendors</div>
              </div>
              <div className="w-px h-8 bg-white/30" />
              <div className="text-center">
                <div className="text-2xl font-bold text-white">5,000+</div>
                <div className="text-sm">Jobs Posted</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Popular Categories</h2>
            <p className="mt-1 text-gray-500">Browse by fabric type</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={`/vendors?category=${cat.name}`}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-gray-100 hover:border-primary-200 hover:bg-primary-50 transition-all group"
            >
              <span className="text-3xl">{cat.icon}</span>
              <span className="text-sm font-medium text-gray-700 group-hover:text-primary-600">{cat.name}</span>
              <span className="text-xs text-gray-400">{cat.count}</span>
            </Link>
          ))}
        </div>
      </section>

      {tailors.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Featured Tailors</h2>
              <p className="mt-1 text-gray-500">Skilled professionals ready to bring your designs to life</p>
            </div>
            <Link href="/tailors" className="text-primary-500 hover:text-primary-600 text-sm font-medium flex items-center gap-1">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {tailors.map((t) => (
              <TailorCard key={t.id} tailor={t} />
            ))}
          </div>
        </section>
      )}

      {vendors.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Featured Vendors</h2>
              <p className="mt-1 text-gray-500">Quality fabrics and materials at the best prices</p>
            </div>
            <Link href="/vendors" className="text-primary-500 hover:text-primary-600 text-sm font-medium flex items-center gap-1">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {vendors.map((v) => (
              <VendorCard key={v.id} vendor={v} />
            ))}
          </div>
        </section>
      )}

      {products.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Trending Products</h2>
              <p className="mt-1 text-gray-500">Popular items from our vendors</p>
            </div>
            <Link href="/vendors" className="text-primary-500 hover:text-primary-600 text-sm font-medium flex items-center gap-1">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {jobs.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Latest Jobs</h2>
              <p className="mt-1 text-gray-500">Find your next opportunity in fashion</p>
            </div>
            <Link href="/jobs" className="text-primary-500 hover:text-primary-600 text-sm font-medium flex items-center gap-1">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map((j) => (
              <JobCard key={j.id} job={j} />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Success Stories</h2>
          <p className="mt-1 text-gray-500">Hear from our community</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="h-4 w-4 fill-accent-400 text-accent-400" />
                ))}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">&quot;{t.text}&quot;</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold text-sm">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Get Started Today</h2>
            <p className="mt-1 text-gray-500">Join thousands of fashion professionals</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 text-center border border-gray-100">
              <div className="h-14 w-14 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Scissors className="h-7 w-7 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Are you a Tailor?</h3>
              <p className="text-sm text-gray-500 mt-1">Showcase your skills and find more clients</p>
              <Link href="/auth/register" className="mt-4 inline-block px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors">
                Join as Tailor
              </Link>
            </div>
            <div className="bg-white rounded-2xl p-6 text-center border border-gray-100">
              <div className="h-14 w-14 bg-accent-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Store className="h-7 w-7 text-accent-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Are you a Vendor?</h3>
              <p className="text-sm text-gray-500 mt-1">Sell your fabrics to thousands of customers</p>
              <Link href="/auth/register" className="mt-4 inline-block px-4 py-2 bg-accent-500 text-white rounded-lg text-sm font-medium hover:bg-accent-600 transition-colors">
                Join as Vendor
              </Link>
            </div>
            <div className="bg-white rounded-2xl p-6 text-center border border-gray-100">
              <div className="h-14 w-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-7 w-7 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Are you an Employer?</h3>
              <p className="text-sm text-gray-500 mt-1">Hire talented tailors and apprentices</p>
              <Link href="/auth/register" className="mt-4 inline-block px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors">
                Join as Employer
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
