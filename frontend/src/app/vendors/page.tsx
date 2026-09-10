"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { VendorProfile, PaginatedResponse } from "@/lib/types";
import VendorCard from "@/components/VendorCard";
import Pagination from "@/components/Pagination";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Search, SlidersHorizontal, Store, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const categoryOptions = [
  "Fabric", "Lace", "Ankara", "Beads", "Aso Oke", "Silk", "Chiffon",
  "Denim", "Velvet", "Cotton", "Organza", "Tulle", "Satin", "Accessories",
];

function VendorsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [vendors, setVendors] = useState<VendorProfile[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const page = parseInt(searchParams.get("page") || "1");
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const [searchInput, setSearchInput] = useState(search);

  const fetchVendors = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "12");
      if (search) params.set("search", search);
      if (category) params.set("category", category);
      const res = await api.get(`/vendors?${params.toString()}`);
      const data: PaginatedResponse<VendorProfile> = res.data;
      setVendors(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch {
      setVendors([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, category]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    if (updates.search !== undefined) params.delete("page");
    router.push(`/vendors?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search: searchInput });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner Assembly */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 220, damping: 20 }}
        className="bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold">
            <Store className="h-3.5 w-3.5 text-amber-400" />
            DIRECT SUPPLIERS & FABRIC STORES
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Authentic African Fabric Vendors & Suppliers
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 max-w-xl font-light">
            Shop quality Ankara, Lace, Silk, Kente, Aso Oke, and tailoring accessories directly from verified vendors across Africa.
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
            placeholder="Search vendor stores, fabric types, materials..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent shadow-xs"
          />
        </form>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
            showFilters
              ? "border-amber-500 text-amber-600 bg-amber-50 shadow-xs"
              : "border-stone-200 text-stone-700 hover:bg-stone-50"
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {category && <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />}
        </button>
      </motion.div>

      {/* Filter Drawer */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-stone-200 p-5 shadow-lg shadow-stone-900/5"
        >
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-2">Category Filter</label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => updateParams({ category: "" })}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                  !category ? "bg-amber-600 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}
              >
                All Categories
              </button>
              {categoryOptions.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => updateParams({ category: c === category ? "" : c })}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                    c === category ? "bg-amber-600 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : vendors.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-stone-200 p-8">
          <span className="text-4xl mb-3 block">🏪</span>
          <p className="text-stone-800 font-bold text-base">No fabric vendors found</p>
          <p className="text-stone-500 text-xs mt-1">Try resetting your category or search query</p>
          <button
            onClick={() => updateParams({ category: "", search: "" })}
            className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {vendors.map((v, idx) => (
              <VendorCard key={v.id} vendor={v} index={idx} />
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

export default function VendorsPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <VendorsContent />
    </Suspense>
  );
}
