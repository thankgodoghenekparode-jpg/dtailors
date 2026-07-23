"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Briefcase, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    salary: "",
    experienceRequired: "",
    jobType: "FULL_TIME",
    accommodation: "",
    state: "",
    city: "",
    contactDetails: "",
    whatsapp: "",
    phone: "",
    email: "",
    facebook: "",
    expiresAt: "",
  });

  const update = (field: string, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.jobType) {
      toast.error("Title and job type are required");
      return;
    }
    setLoading(true);
    try {
      await api.post("/employers/jobs", {
        title: form.title,
        description: form.description,
        salary: form.salary ? parseFloat(form.salary) : undefined,
        experienceRequired: form.experienceRequired,
        jobType: form.jobType,
        accommodation: form.accommodation,
        state: form.state,
        city: form.city,
        contactDetails: form.contactDetails,
        whatsapp: form.whatsapp,
        phone: form.phone,
        email: form.email,
        facebook: form.facebook,
        expiresAt: form.expiresAt || undefined,
      });
      toast.success("Job posted!");
      router.push("/dashboard/jobs");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to post job");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent";

  return (
    <div>
      <Link href="/dashboard/jobs" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="h-4 w-4" />
        Back to Jobs
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Post New Job</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary-500" />
            Job Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Job Title *</label>
              <input type="text" value={form.title} onChange={(e) => update("title", e.target.value)} className={inputClass} placeholder="e.g., Senior Tailor Needed" required />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={4} className={inputClass} placeholder="Describe the job..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Job Type *</label>
              <select value={form.jobType} onChange={(e) => update("jobType", e.target.value)} className={inputClass}>
                <option value="FULL_TIME">Full-time</option>
                <option value="PART_TIME">Part-time</option>
                <option value="APPRENTICESHIP">Apprenticeship</option>
                <option value="INTERNSHIP">Internship</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Salary (&#8358;/month)</label>
              <input type="number" value={form.salary} onChange={(e) => update("salary", e.target.value)} className={inputClass} placeholder="Optional" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Experience Required</label>
              <input type="text" value={form.experienceRequired} onChange={(e) => update("experienceRequired", e.target.value)} className={inputClass} placeholder="e.g., 2+ years" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Accommodation</label>
              <select value={form.accommodation} onChange={(e) => update("accommodation", e.target.value)} className={inputClass}>
                <option value="">None</option>
                <option value="Live-in">Live-in</option>
                <option value="Live-out">Live-out</option>
                <option value="Provided">Provided</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Expiry Date</label>
              <input type="date" value={form.expiresAt} onChange={(e) => update("expiresAt", e.target.value)} className={inputClass} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Location</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
              <input type="text" value={form.state} onChange={(e) => update("state", e.target.value)} className={inputClass} placeholder="Lagos" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
              <input type="text" value={form.city} onChange={(e) => update("city", e.target.value)} className={inputClass} placeholder="Ikeja" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Contact Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
              <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">WhatsApp</label>
              <input type="text" value={form.whatsapp} onChange={(e) => update("whatsapp", e.target.value)} className={inputClass} placeholder="+234..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Facebook</label>
              <input type="text" value={form.facebook} onChange={(e) => update("facebook", e.target.value)} className={inputClass} placeholder="Profile URL or username" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Additional Contact Info</label>
              <textarea value={form.contactDetails} onChange={(e) => update("contactDetails", e.target.value)} rows={2} className={inputClass} placeholder="Any other way to reach you..." />
            </div>
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full sm:w-auto px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors disabled:opacity-50">
          {loading ? "Posting..." : "Post Job"}
        </button>
      </form>
    </div>
  );
}
