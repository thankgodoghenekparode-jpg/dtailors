"use client";

import Link from "next/link";
import { Scissors, ShoppingBag, Briefcase } from "lucide-react";
import SearchBar from "./SearchBar";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-40 h-40 border-2 border-white rounded-full" />
        <div className="absolute top-20 right-20 w-24 h-24 border-2 border-white rounded-full" />
        <div className="absolute bottom-10 left-1/4 w-32 h-32 border-2 border-white rounded-full" />
        <div className="absolute -bottom-5 right-1/3 w-20 h-20 border-2 border-white rounded-full" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Africa&apos;s Premier Fashion Marketplace
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            Connecting Tailors, Fashion Businesses, and Customers{" "}
            <span className="text-yellow-200">Everywhere</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10">
            Find skilled tailors, shop authentic African fabrics, discover job opportunities, and grow your fashion business.
          </p>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto mb-10">
            <SearchBar />
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/tailors"
              className="flex items-center gap-2 px-6 py-3 bg-white text-orange-600 font-semibold rounded-xl hover:bg-orange-50 transition-colors shadow-lg"
            >
              <Scissors className="w-5 h-5" />
              Find a Tailor
            </Link>
            <Link
              href="/vendors"
              className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              Shop Fabrics
            </Link>
            <Link
              href="/jobs"
              className="flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-colors"
            >
              <Briefcase className="w-5 h-5" />
              Find a Job
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto mt-14">
            <div>
              <div className="text-2xl md:text-3xl font-bold text-white">2K+</div>
              <div className="text-sm text-white/70">Tailors</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-white">500+</div>
              <div className="text-sm text-white/70">Vendors</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-white">1K+</div>
              <div className="text-sm text-white/70">Jobs Posted</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
