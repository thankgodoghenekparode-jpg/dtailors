"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Job, PaginatedResponse } from "@/lib/types";
import JobCard from "@/components/JobCard";
import Pagination from "@/components/Pagination";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Search, SlidersHorizontal, Briefcase, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

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
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner Assembly */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 220, damping: 20 }}
        className="bg-gradient-to-r from-stone-900 via-emerald-950 to-stone-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl"
      >
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
            <Briefcase className="h-3.5 w-3.5 text-emerald-400" />
            FASHION & TAILORING CAREERS
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Tailoring Jobs, Apprenticeships & Hires
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 max-w-xl font-light">
            Browse full-time tailoring jobs, part-time offers, apprenticeships with accommodation, and fashion workshop openings.
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
            placeholder="Search job title, skills, employer..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-xs"
          />
        </form>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
            showFilters
              ? "border-emerald-500 text-emerald-600 bg-emerald-50 shadow-xs"
              : "border-stone-200 text-stone-700 hover:bg-stone-50"
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {(state || jobType || accommodation) && <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />}
        </button>
      </motion.div>

      {/* Filter Drawer */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-stone-200 p-5 shadow-lg shadow-stone-900/5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">State</label>
              <select
                value={state}
                onChange={(e) => updateParams({ state: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">All States</option>
                {states.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">Job Type</label>
              <select
                value={jobType}
                onChange={(e) => updateParams({ jobType: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">All Types</option>
                <option value="FULL_TIME">Full-Time</option>
                <option value="PART_TIME">Part-Time</option>
                <option value="APPRENTICESHIP">Apprenticeship</option>
                <option value="INTERNSHIP">Internship</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">Accommodation</label>
              <select
                value={accommodation}
                onChange={(e) => updateParams({ accommodation: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Any</option>
                <option value="provided">Provided</option>
                <option value="not_provided">Not Provided</option>
              </select>
            </div>
          </div>
        </motion.div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : jobs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-stone-200 p-8">
          <span className="text-4xl mb-3 block">💼</span>
          <p className="text-stone-800 font-bold text-base">No job postings found</p>
          <p className="text-stone-500 text-xs mt-1">Try clearing your filters or search keywords</p>
          <button
            onClick={() => updateParams({ state: "", jobType: "", accommodation: "", search: "" })}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {jobs.map((j, idx) => (
              <JobCard key={j.id} job={j} index={idx} />
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
