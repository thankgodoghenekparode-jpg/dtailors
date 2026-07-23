"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { TailorProfile, PaginatedResponse } from "@/lib/types";
import TailorCard from "@/components/TailorCard";
import Pagination from "@/components/Pagination";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Search, SlidersHorizontal, X } from "lucide-react";

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
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Find Tailors</h1>
        <p className="text-gray-500 mt-1">Discover skilled tailors for your fashion needs</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name, skill, specialization..."
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Skill</label>
              <select
                value={skill}
                onChange={(e) => updateParams({ skill: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Skills</option>
                {skillOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Experience</label>
              <select
                value={experience}
                onChange={(e) => updateParams({ experience: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Any</option>
                <option value="1">0-2 years</option>
                <option value="3">3-5 years</option>
                <option value="6">6+ years</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Gender</label>
              <select
                value={gender}
                onChange={(e) => updateParams({ gender: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Any</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Availability</label>
              <select
                value={availability}
                onChange={(e) => updateParams({ availability: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Any</option>
                <option value="available">Available</option>
                <option value="busy">Busy</option>
              </select>
            </div>
          </div>
          {(skill || experience || gender || availability) && (
            <button
              onClick={clearFilters}
              className="mt-3 flex items-center gap-1 text-sm text-primary-500 hover:text-primary-600 font-medium"
            >
              <X className="h-3.5 w-3.5" />
              Clear filters
            </button>
          )}
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : tailors.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">No tailors found</p>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tailors.map((t) => (
              <TailorCard key={t.id} tailor={t} />
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
