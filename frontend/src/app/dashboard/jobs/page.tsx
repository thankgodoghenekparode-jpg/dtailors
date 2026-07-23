"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { Job, PaginatedResponse } from "@/lib/types";
import LoadingSpinner from "@/components/LoadingSpinner";
import toast from "react-hot-toast";
import { Plus, Trash2, Briefcase, MapPin } from "lucide-react";
import { format } from "date-fns";

const jobTypeLabels: Record<string, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  APPRENTICESHIP: "Apprenticeship",
  INTERNSHIP: "Internship",
};

export default function EmployerJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      const res = await api.get("/employers/jobs?limit=50");
      setJobs(res.data.data || []);
    } catch {
      toast.error("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this job?")) return;
    try {
      await api.delete(`/jobs/${id}`);
      setJobs((prev) => prev.filter((j) => j.id !== id));
      toast.success("Job deleted");
    } catch {
      toast.error("Failed to delete job");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Jobs</h1>
        <Link href="/dashboard/jobs/new" className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-medium hover:bg-primary-600 transition-colors">
          <Plus className="h-4 w-4" />
          Post Job
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : jobs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No jobs posted yet</p>
          <Link href="/dashboard/jobs/new" className="mt-3 inline-flex items-center gap-1 text-primary-500 hover:text-primary-600 text-sm font-medium">
            <Plus className="h-4 w-4" />
            Post your first job
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{job.title}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${job.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {job.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1.5 text-sm text-gray-500">
                  <span className="bg-gray-100 px-2 py-0.5 rounded-full">{jobTypeLabels[job.jobType]}</span>
                  {(job.state || job.city) && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {[job.city, job.state].filter(Boolean).join(", ")}
                    </span>
                  )}
                  {job.salary && <span>&#8358;{job.salary.toLocaleString()}</span>}
                </div>
                <p className="text-xs text-gray-400 mt-1">Posted {format(new Date(job.createdAt), "MMM d, yyyy")}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link href={`/jobs/${job.id}`} className="p-2 text-gray-400 hover:text-primary-500 rounded-lg hover:bg-gray-50 text-sm">
                  View
                </Link>
                <button onClick={() => handleDelete(job.id)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
