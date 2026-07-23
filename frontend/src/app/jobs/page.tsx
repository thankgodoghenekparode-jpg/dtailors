"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Job, PaginatedResponse } from "@/lib/types";
import JobCard from "@/components/JobCard";
import Pagination from "@/components/Pagination";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Search, SlidersHorizontal } from "lucide-react";

function JobsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const page = parseInt(searchParams.get("page") || "1");
  const search = searchParams.get("search") || "";
  const state = searchParams.get("state") || "";
  const jobType = searchParams.get("jobType") || "";
  const accommodation = searchParams.get("accommodation") || "";
  const [searchInput, setSearchInput] = useState(search);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", "12");
      if (search) params.set("search", search);
      if (state) params.set("state", state);
      if (jobType) params.set("jobType", jobType);
      if (accommodation) params.set("accommodation", accommodation);
      const res = await api.get(`/jobs?${params.toString()}`);
      const data: PaginatedResponse<Job> = res.data;
      setJobs(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, state, jobType, accommodation]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const updateParams = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    if (updates.search !== undefined) params.delete("page");
    router.push(`/jobs?${params.toString()}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search: searchInput });
  };

  const states = [
    "Lagos", "Abuja", "Oyo", "Rivers", "Kano", "Ogun", "Enugu",
    "Anambra", "Edo", "Delta", "Kaduna", "Abia", "Imo", "Ondo",
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Job Opportunities</h1>
        <p className="text-gray-500 mt-1">Find tailoring jobs, apprenticeships, and more</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search jobs..."
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Job Type</label>
              <select
                value={jobType}
                onChange={(e) => updateParams({ jobType: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Types</option>
                <option value="FULL_TIME">Full-time</option>
                <option value="PART_TIME">Part-time</option>
                <option value="APPRENTICESHIP">Apprenticeship</option>
                <option value="INTERNSHIP">Internship</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
              <select
                value={state}
                onChange={(e) => updateParams({ state: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All States</option>
                {states.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Accommodation</label>
              <select
                value={accommodation}
                onChange={(e) => updateParams({ accommodation: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Any</option>
                <option value="Live-in">Live-in</option>
                <option value="Live-out">Live-out</option>
                <option value="Provided">Provided</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : jobs.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">No jobs found</p>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {jobs.map((j) => (
              <JobCard key={j.id} job={j} />
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

export default function JobsPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <JobsContent />
    </Suspense>
  );
}
