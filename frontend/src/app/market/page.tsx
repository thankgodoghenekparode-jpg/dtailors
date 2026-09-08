"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { MarketProduct, PaginatedResponse } from "@/lib/marketTypes";
import MarketProductCard from "@/components/market/ProductCard";
import Pagination from "@/components/Pagination";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Search, SlidersHorizontal, X, Flame, ShieldCheck, Truck, Zap, Grid3X3, LayoutGrid } from "lucide-react";

const categories = [
  "Ankara",
  "Fabrics",
  "Senator",
  "Suits",
  "Shirts",
  "Trousers",
  "Dresses",
  "Shoes",
  "Bags",
  "Accessories",
  "Tailoring Materials",
  "Electronics",
  "Household",
  "Others",
];

const sortOptions = [
  { value: "newest", label: "Newest Arrivals" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "top_rated", label: "Top Rated" },
  { value: "popular", label: "Most Popular" },
];

function MarketContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<MarketProduct[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [gridCols, setGridCols] = useState<"standard" | "compact">("standard");

  const page = parseInt(searchParams.get("page") || "1");
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "newest";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const condition = searchParams.get("condition") || "";
  const inStock = searchParams.get("inStock") === "true";

  const [searchInput, setSearchInput] = useState(search);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", gridCols === "compact" ? "16" : "12");
      if (search) params.set("search", search);
      if (category) params.set("category", category);
      if (sort) params.set("sort", sort);
      if (minPrice) params.set("minPrice", minPrice);
      if (maxPrice) params.set("maxPrice", maxPrice);
      if (condition) params.set("condition", condition);
      if (inStock) params.set("inStock", "true");
      const res = await api.get(`/market/products?${params.toString()}`);
      const data: PaginatedResponse<MarketProduct> = res.data;
      setProducts(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, category, sort, minPrice, maxPrice, condition, inStock, gridCols]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    if (updates.search !== undefined) params.delete("page");
    router.push(`/market?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search: searchInput });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Temu Style Flash Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-primary-950 to-stone-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl shadow-stone-900/10">
        <div className="absolute top-0 right-0 w-80 h-80 bg-accent-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-500/20 border border-accent-400/30 text-accent-300 text-xs font-bold">
              <Flame className="h-3.5 w-3.5 fill-accent-400 text-accent-400" />
              TEMU & MARKETPLACE SELECTION
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Africa&apos;s Fashion & Textile Marketplace
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 max-w-xl font-light">
              Buy directly from verified fabric vendors, master tailors, and fashion creators with buyer protection.
            </p>
          </div>

          {/* Guarantees Chips */}
          <div className="grid grid-cols-3 gap-3 w-full md:w-auto text-center shrink-0">
            <div className="p-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 flex flex-col items-center">
              <Truck className="h-5 w-5 text-accent-300 mb-1" />
              <span className="text-[11px] font-bold">Fast Delivery</span>
            </div>
            <div className="p-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 flex flex-col items-center">
              <ShieldCheck className="h-5 w-5 text-emerald-400 mb-1" />
              <span className="text-[11px] font-bold">Buyer Protection</span>
            </div>
            <div className="p-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 flex flex-col items-center">
              <Zap className="h-5 w-5 text-amber-400 mb-1" />
              <span className="text-[11px] font-bold">Direct Deals</span>
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal Category Pill Ribbon */}
      <div className="overflow-x-auto no-scrollbar py-2 -mx-4 px-4 sm:mx-0 sm:px-0 flex gap-2 border-b border-stone-200/60 pb-4">
        <button
          onClick={() => updateParams({ category: "" })}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 ${
            !category
              ? "bg-primary-600 text-white shadow-md shadow-primary-600/20"
              : "bg-white text-stone-700 border border-stone-200/80 hover:bg-stone-50"
          }`}
        >
          ✨ All Items
        </button>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => updateParams({ category: category === c ? "" : c })}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 ${
              category === c
                ? "bg-primary-600 text-white shadow-md shadow-primary-600/20"
                : "bg-white text-stone-700 border border-stone-200/80 hover:bg-stone-50"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Search & Toolbar Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search fabrics, senator suits, tailoring accessories..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white shadow-xs"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                updateParams({ search: "" });
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </form>

        <div className="flex items-center gap-2">
          <select
            value={sort}
            onChange={(e) => updateParams({ sort: e.target.value, page: "1" })}
            className="px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer shadow-xs"
          >
            {sortOptions.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          {/* Density Layout Switcher */}
          <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200/70">
            <button
              onClick={() => setGridCols("standard")}
              className={`p-1.5 rounded-lg transition-all ${
                gridCols === "standard" ? "bg-white text-primary-600 shadow-xs font-bold" : "text-stone-500 hover:text-stone-800"
              }`}
              title="Standard Grid"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setGridCols("compact")}
              className={`p-1.5 rounded-lg transition-all ${
                gridCols === "compact" ? "bg-white text-primary-600 shadow-xs font-bold" : "text-stone-500 hover:text-stone-800"
              }`}
              title="Compact Grid"
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
          </div>

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
            {(minPrice || maxPrice || condition || inStock) && (
              <span className="h-2 w-2 rounded-full bg-primary-500 animate-pulse" />
            )}
          </button>
        </div>
      </div>

      {/* Filter Drawer */}
      {showFilters && (
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-lg shadow-stone-900/5 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">Min Price (₦)</label>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => updateParams({ minPrice: e.target.value, page: "1" })}
                placeholder="0"
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">Max Price (₦)</label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => updateParams({ maxPrice: e.target.value, page: "1" })}
                placeholder="No limit"
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">Condition</label>
              <div className="flex gap-2">
                <button
                  onClick={() => updateParams({ condition: condition === "new" ? "" : "new", page: "1" })}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                    condition === "new" ? "bg-primary-600 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  Brand New
                </button>
                <button
                  onClick={() => updateParams({ condition: condition === "used" ? "" : "used", page: "1" })}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                    condition === "used" ? "bg-primary-600 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                  }`}
                >
                  Pre-owned
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">Availability</label>
              <label className="flex items-center gap-2 cursor-pointer mt-2">
                <input
                  type="checkbox"
                  checked={inStock}
                  onChange={(e) => updateParams({ inStock: e.target.checked ? "true" : "", page: "1" })}
                  className="h-4 w-4 rounded border-stone-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-xs font-semibold text-stone-700">In stock only</span>
              </label>
            </div>
          </div>

          {(minPrice || maxPrice || condition || inStock) && (
            <div className="mt-4 pt-4 border-t border-stone-100 flex justify-end">
              <button
                onClick={() => router.push("/market")}
                className="inline-flex items-center gap-1 text-xs text-rose-600 font-bold hover:text-rose-700"
              >
                <X className="h-3.5 w-3.5" />
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Main Item Grid */}
      {loading ? (
        <LoadingSpinner />
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-stone-200/70 p-8">
          <span className="text-4xl mb-3 block">📦</span>
          <p className="text-stone-800 font-bold text-base">No marketplace items found</p>
          <p className="text-stone-500 text-xs mt-1">Try adjusting your search criteria or resetting filters</p>
          <button
            onClick={() => router.push("/market")}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-xl text-xs font-bold hover:bg-primary-700 transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <>
          <div
            className={`grid gap-4 ${
              gridCols === "compact"
                ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
                : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
            }`}
          >
            {products.map((p) => (
              <MarketProductCard key={p.id} product={p} />
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

export default function MarketPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <MarketContent />
    </Suspense>
  );
}

