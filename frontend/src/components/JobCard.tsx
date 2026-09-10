"use client";

import Link from "next/link";
import { MapPin, Clock, Building2, Briefcase, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Job } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";

interface JobCardProps {
  job: Job;
  index?: number;
}

const jobTypeColors: Record<string, string> = {
  FULL_TIME: "bg-emerald-50 text-emerald-700 border-emerald-200/80 shadow-xs",
  PART_TIME: "bg-sky-50 text-sky-700 border-sky-200/80 shadow-xs",
  APPRENTICESHIP: "bg-purple-50 text-purple-700 border-purple-200/80 shadow-xs",
  INTERNSHIP: "bg-amber-50 text-amber-700 border-amber-200/80 shadow-xs",
};

const jobTypeLabels: Record<string, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  APPRENTICESHIP: "Apprenticeship",
  INTERNSHIP: "Internship",
};

export default function JobCard({ job, index = 0 }: JobCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.5,
        delay: Math.min(index * 0.08, 0.4),
        type: "spring",
        stiffness: 240,
        damping: 20,
      }}
      whileHover={{ y: -6, scale: 1.015 }}
      className="group bg-white rounded-2xl border border-stone-200/80 p-5 shadow-sm hover:shadow-xl hover:shadow-primary-500/10 hover:border-primary-300 relative flex flex-col justify-between transition-all duration-300 overflow-hidden"
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="font-extrabold text-stone-900 group-hover:text-primary-600 transition-colors text-base line-clamp-1 tracking-tight">
              {job.title}
            </h3>
            {job.employer && (
              <div className="flex items-center gap-1.5 mt-1 text-xs font-semibold text-stone-500">
                <Building2 className="h-3.5 w-3.5 text-stone-400" />
                <span className="truncate">{job.employer.companyName}</span>
              </div>
            )}
          </div>
          <span className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-extrabold border ${jobTypeColors[job.jobType] || "bg-stone-100 text-stone-700 border-stone-200"}`}>
            {jobTypeLabels[job.jobType] || job.jobType}
          </span>
        </div>

        {job.description && (
          <p className="mt-3.5 text-xs text-stone-600 line-clamp-2 leading-relaxed font-normal">
            {job.description}
          </p>
        )}

        {job.accommodation && (
          <div className="mt-3">
            <span className="px-2.5 py-0.5 bg-primary-50 text-primary-700 border border-primary-100 text-[11px] font-extrabold rounded-full inline-block shadow-xs">
              🏠 Accommodation: {job.accommodation}
            </span>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3.5 border-t border-stone-100 flex items-center justify-between text-xs">
        <div className="flex flex-wrap items-center gap-3 text-stone-500">
          {(job.state || job.city) && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-primary-500" />
              <span className="font-medium">{[job.city, job.state].filter(Boolean).join(", ")}</span>
            </div>
          )}
          {job.salary !== undefined && job.salary !== null && (
            <div className="flex items-center gap-1 font-black text-stone-900">
              <Briefcase className="h-3.5 w-3.5 text-stone-400" />
              <span>&#8358;{job.salary?.toLocaleString()}</span>
            </div>
          )}
        </div>

        <Link
          href={`/jobs/${job.id}`}
          className="flex items-center gap-1 text-[11px] font-extrabold text-primary-600 group-hover:text-primary-700 transition-all shrink-0"
        >
          <span>Apply</span>
          <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
}
