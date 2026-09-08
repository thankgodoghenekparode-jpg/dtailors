"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { MarketProduct, PaginatedResponse } from "@/lib/marketTypes";
import MarketProductCard from "@/components/market/ProductCard";
import Pagination from "@/components/Pagination";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Search, SlidersHorizontal, X } from "lucide-react";

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
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "top_rated", label: "Top Rated" },
  { value: "popular", label: "Popular" },
];

function MarketContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<MarketProduct[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

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
      params.set("limit", "12");
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
  }, [page, search, category, sort, minPrice, maxPrice, condition, inStock]);

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
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Marketplace</h1>
        <p className="text-gray-500 mt-1">Discover quality products from trusted sellers</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => updateParams({ category: "" })}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            !category ? "bg-primary-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => updateParams({ category: category === c ? "" : c })}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              category === c ? "bg-primary-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </form>
        <select
          value={sort}
          onChange={(e) => updateParams({ sort: e.target.value, page: "1" })}
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
        >
          {sortOptions.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
            showFilters ? "border-primary-500 text-primary-600 bg-primary-50" : "border-gray-200 text-gray-700 hover:bg-gray-50"
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {(minPrice || maxPrice || condition || inStock) && (
            <span className="h-2 w-2 rounded-full bg-primary-500" />
          )}
        </button>
      </div>

      {showFilters && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Min Price (₦)</label>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => updateParams({ minPrice: e.target.value, page: "1" })}
                placeholder="0"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Price (₦)</label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => updateParams({ maxPrice: e.target.value, page: "1" })}
                placeholder="∞"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
              <div className="flex gap-2">
                <button
                  onClick={() => updateParams({ condition: condition === "new" ? "" : "new", page: "1" })}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    condition === "new" ? "bg-primary-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  New
                </button>
                <button
                  onClick={() => updateParams({ condition: condition === "used" ? "" : "used", page: "1" })}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    condition === "used" ? "bg-primary-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Used
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStock}
                  onChange={(e) => updateParams({ inStock: e.target.checked ? "true" : "", page: "1" })}
                  className="h-4 w-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">In stock only</span>
              </label>
            </div>
          </div>
          {(minPrice || maxPrice || condition || inStock) && (
            <button
              onClick={() =>
                router.push("/market")
              }
              className="mt-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
              Clear all filters
            </button>
          )}
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">No products found</p>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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
