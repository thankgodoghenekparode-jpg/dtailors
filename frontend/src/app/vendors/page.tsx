"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { VendorProfile, PaginatedResponse } from "@/lib/types";
import VendorCard from "@/components/VendorCard";
import Pagination from "@/components/Pagination";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Search, SlidersHorizontal } from "lucide-react";

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
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Fabric Vendors</h1>
        <p className="text-gray-500 mt-1">Find quality fabrics and materials for your fashion needs</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search vendors..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </form>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </button>
      </div>

      {showFilters && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <div className="flex flex-wrap gap-2">
              {categoryOptions.map((c) => (
                <button
                  key={c}
                  onClick={() => updateParams({ category: category === c ? "" : c })}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    category === c
                      ? "bg-primary-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : vendors.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">No vendors found</p>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {vendors.map((v) => (
              <VendorCard key={v.id} vendor={v} />
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
