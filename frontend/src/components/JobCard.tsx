import Link from "next/link";
import { MapPin, Clock, Building2, Briefcase } from "lucide-react";
import { Job } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";

interface JobCardProps {
  job: Job;
}

const jobTypeColors: Record<string, string> = {
  FULL_TIME: "bg-green-50 text-green-700",
  PART_TIME: "bg-blue-50 text-blue-700",
  APPRENTICESHIP: "bg-purple-50 text-purple-700",
  INTERNSHIP: "bg-orange-50 text-orange-700",
};

const jobTypeLabels: Record<string, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  APPRENTICESHIP: "Apprenticeship",
  INTERNSHIP: "Internship",
};

export default function JobCard({ job }: JobCardProps) {
  return (
    <Link
      href={`/jobs/${job.id}`}
      className="group bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
            {job.title}
          </h3>
          {job.employer && (
            <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
              <Building2 className="h-3.5 w-3.5" />
              <span className="truncate">{job.employer.companyName}</span>
            </div>
          )}
        </div>
        <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${jobTypeColors[job.jobType] || "bg-gray-100 text-gray-700"}`}>
          {jobTypeLabels[job.jobType] || job.jobType}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-500">
        {(job.state || job.city) && (
          <div className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            <span>{[job.city, job.state].filter(Boolean).join(", ")}</span>
          </div>
        )}
        {job.salary !== undefined && job.salary !== null && (
          <div className="flex items-center gap-1">
            <Briefcase className="h-3.5 w-3.5" />
            <span>&#8358;{job.salary?.toLocaleString()}</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          <span>{formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</span>
        </div>
      </div>

      {job.description && (
        <p className="mt-3 text-sm text-gray-600 line-clamp-2">{job.description}</p>
      )}

      {job.accommodation && (
        <div className="mt-3">
          <span className="px-2 py-0.5 bg-primary-50 text-primary-600 text-xs font-medium rounded-full">
            Accommodation: {job.accommodation}
          </span>
        </div>
      )}
    </Link>
  );
}
