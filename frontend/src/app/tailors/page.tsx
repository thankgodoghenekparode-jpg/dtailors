"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { TailorProfile, PaginatedResponse } from "@/lib/types";
import TailorCard from "@/components/TailorCard";
import Pagination from "@/components/Pagination";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Search, SlidersHorizontal, X, Scissors, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const skillOptions = [
  "Ankara", "Lace", "Aso Oke", "Beads", "Bridal", "Male wears",
  "Female wears", "Children wears", "Unisex", "Embroidery", "Knitting",
];

function TailorsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [tailors, setTailors] = useState<TailorProfile[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const page = parseInt(searchParams.get("page") || "1");
  const search = searchParams.get("search") || "";
  const skill = searchParams.get("skill") || "";
  const experience = searchParams.get("experience") || "";
  const gender = searchParams.get("gender") || "";
  const availability = searchParams.get("availability") || "";

  const [searchInput, setSearchInput] = useState(search);

  const fetchTailors = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "12");
      if (search) params.set("search", search);
      if (skill) params.set("skill", skill);
      if (experience) params.set("experience", experience);
      if (gender) params.set("gender", gender);
      if (availability) params.set("availability", availability);
      const res = await api.get(`/tailors?${params.toString()}`);
      const data: PaginatedResponse<TailorProfile> = res.data;
      setTailors(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch {
      setTailors([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, skill, experience, gender, availability]);

  useEffect(() => {
    fetchTailors();
  }, [fetchTailors]);

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    if (updates.search !== undefined) params.delete("page");
    router.push(`/tailors?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search: searchInput });
  };

  const clearFilters = () => {
    setSearchInput("");
    router.push("/tailors");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner Assembly */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 220, damping: 20 }}
        className="bg-gradient-to-r from-stone-900 via-primary-950 to-stone-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/20 border border-primary-400/30 text-primary-300 text-xs font-bold">
            <Scissors className="h-3.5 w-3.5 text-primary-400" />
            VERIFIED CRAFTSMEN
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Discover Master Tailors & Fashion Designers
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 max-w-xl font-light">
            Connect with skilled fashion creators, view past work portfolios, and commission custom tailored outfits directly.
          </p>
        </div>
      </motion.div>

      {/* Search & Filter Assembly */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by tailor name, skill, specialization..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-xs"
          />
        </form>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
            showFilters
              ? "border-primary-500 text-primary-600 bg-primary-50 shadow-xs"
              : "border-stone-200 text-stone-700 hover:bg-stone-50"
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {(skill || experience || gender || availability) && (
            <span className="h-2 w-2 rounded-full bg-primary-500 animate-pulse" />
          )}
        </button>
      </motion.div>

      {/* Filter Drawer */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-stone-200 p-5 shadow-lg shadow-stone-900/5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">Skill</label>
              <select
                value={skill}
                onChange={(e) => updateParams({ skill: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Skills</option>
                {skillOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">Experience</label>
              <select
                value={experience}
                onChange={(e) => updateParams({ experience: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Any</option>
                <option value="1">0-2 years</option>
                <option value="3">3-5 years</option>
                <option value="6">6+ years</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">Gender</label>
              <select
                value={gender}
                onChange={(e) => updateParams({ gender: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Any</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">Availability</label>
              <select
                value={availability}
                onChange={(e) => updateParams({ availability: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Any</option>
                <option value="available">Available</option>
                <option value="busy">Busy</option>
              </select>
            </div>
          </div>
          {(skill || experience || gender || availability) && (
            <div className="mt-4 pt-3 border-t border-stone-100 flex justify-end">
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1 text-xs text-rose-600 font-bold hover:text-rose-700"
              >
                <X className="h-3.5 w-3.5" />
                Clear filters
              </button>
            </div>
          )}
        </motion.div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : tailors.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-stone-200 p-8">
          <span className="text-4xl mb-3 block">🪡</span>
          <p className="text-stone-800 font-bold text-base">No tailors found</p>
          <p className="text-stone-500 text-xs mt-1">Try adjusting your filters or search keywords</p>
          <button
            onClick={clearFilters}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-xl text-xs font-bold hover:bg-primary-700 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {tailors.map((t, idx) => (
              <TailorCard key={t.id} tailor={t} index={idx} />
            ))}
          </div>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => updateParams({ page: String(p) })}
          />
        </>
      )}
    </div>
  );
}

export default function TailorsPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <TailorsContent />
    </Suspense>
  );
}
