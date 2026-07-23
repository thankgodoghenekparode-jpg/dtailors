"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { Job } from "@/lib/types";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  ArrowLeft,
  MapPin,
  Phone,
  MessageCircle,
  Facebook,
  Briefcase,
  Clock,
  Building2,
  Home,
  Calendar,
  Mail,
  Share2,
  ExternalLink,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

const jobTypeLabels: Record<string, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  APPRENTICESHIP: "Apprenticeship",
  INTERNSHIP: "Internship",
};

const jobTypeColors: Record<string, string> = {
  FULL_TIME: "bg-green-50 text-green-700",
  PART_TIME: "bg-blue-50 text-blue-700",
  APPRENTICESHIP: "bg-purple-50 text-purple-700",
  INTERNSHIP: "bg-orange-50 text-orange-700",
};

export default function JobDetailPage() {
  const params = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/jobs/${params.id}`);
        setJob(res.data.job);
      } catch {
        // handle error
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.id]);

  if (loading) return <LoadingSpinner />;
  if (!job) return <div className="text-center py-20 text-gray-500">Job not found</div>;

  const employer = job.employer;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/jobs" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Jobs
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${jobTypeColors[job.jobType] || "bg-gray-100 text-gray-700"}`}>
                    {jobTypeLabels[job.jobType] || job.jobType}
                  </span>
                  {job.expiresAt && new Date(job.expiresAt) < new Date() && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600">Expired</span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{job.title}</h1>
              </div>
              <button className="p-2 rounded-lg text-gray-400 hover:bg-gray-50">
                <Share2 className="h-5 w-5" />
              </button>
            </div>

            {employer && (
              <Link href={`/vendors/${employer.id}`} className="flex items-center gap-3 mt-4 group">
                <div className="h-12 w-12 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-lg overflow-hidden">
                  {employer.logo ? (
                    <img src={employer.logo} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Building2 className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">{employer.companyName}</p>
                </div>
              </Link>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-gray-500">
              {(job.state || job.city) && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {[job.city, job.state].filter(Boolean).join(", ")}
                </div>
              )}
              {job.salary !== undefined && job.salary !== null && (
                <div className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  <span className="font-semibold text-primary-600">&#8358;{job.salary?.toLocaleString()}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
              </div>
            </div>

            {job.description && (
              <div className="mt-6">
                <h3 className="text-base font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{job.description}</p>
              </div>
            )}

            {job.experienceRequired && (
              <div className="mt-4">
                <h3 className="text-base font-semibold text-gray-900 mb-1">Experience Required</h3>
                <p className="text-gray-600 text-sm">{job.experienceRequired}</p>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              {job.accommodation && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-600 text-sm rounded-full">
                  <Home className="h-3.5 w-3.5" />
                  Accommodation: {job.accommodation}
                </div>
              )}
              {job.expiresAt && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-full">
                  <Calendar className="h-3.5 w-3.5" />
                  Expires: {format(new Date(job.expiresAt), "MMM d, yyyy")}
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24 space-y-3">
            <h3 className="font-semibold text-gray-900">Contact Employer</h3>
            {job.phone && (
              <a href={`tel:${job.phone}`} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 transition-colors font-medium text-sm">
                <Phone className="h-4 w-4" />
                Call Now
              </a>
            )}
            {job.whatsapp && (
              <a href={`https://wa.me/${job.whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors font-medium text-sm">
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
            )}
            {job.email && (
              <a href={`mailto:${job.email}`} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors font-medium text-sm">
                <Mail className="h-4 w-4" />
                Email
              </a>
            )}
            {job.facebook && (
              <a href={job.facebook.startsWith("http") ? job.facebook : `https://facebook.com/${job.facebook}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors font-medium text-sm">
                <Facebook className="h-4 w-4" />
                Facebook
              </a>
            )}
            {job.contactDetails && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Additional Contact Info:</p>
                <p className="text-sm text-gray-700">{job.contactDetails}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
