"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import useAuthStore from "@/store/authStore";
import toast from "react-hot-toast";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Scissors,
  Store,
  Briefcase,
  Save,
  Upload,
} from "lucide-react";

const specializationOptions = [
  "Ankara", "Lace", "Aso Oke", "Beads", "Bridal", "Male wears",
  "Female wears", "Children wears", "Unisex", "Embroidery", "Knitting",
];

const skillOptions = [
  "Cutting", "Stitching", "Pattern Making", "Embroidery", "Beadwork",
  "Draping", "Alterations", "Design", "Fitting", "Finishing",
];

const categoryOptions = [
  "Fabric", "Lace", "Ankara", "Beads", "Aso Oke", "Silk", "Chiffon",
  "Accessories", "Buttons", "Zippers", "Threads", "Tools",
];

export default function ProfileEditPage() {
  const { user, setUser, loadUser } = useAuthStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<any>({});

  useEffect(() => {
    if (user) {
      if (user.role === "TAILOR" && user.tailorProfile) {
        setForm({
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          bio: user.tailorProfile.bio || "",
          gender: user.tailorProfile.gender || "",
          yearsOfExperience: user.tailorProfile.yearsOfExperience || 0,
          specializations: user.tailorProfile.specializations || [],
          skills: user.tailorProfile.skills || [],
          languages: user.tailorProfile.languages || [],
          availability: user.tailorProfile.availability || "available",
          expectedSalary: user.tailorProfile.expectedSalary || 0,
          state: user.tailorProfile.location?.state || "",
          city: user.tailorProfile.location?.city || "",
          country: user.tailorProfile.location?.country || "",
          whatsapp: user.tailorProfile.whatsapp || "",
        });
      } else if (user.role === "VENDOR" && user.vendorProfile) {
        setForm({
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          businessName: user.vendorProfile.businessName || "",
          about: user.vendorProfile.about || "",
          categories: user.vendorProfile.categories || [],
          deliveryOptions: user.vendorProfile.deliveryOptions || [],
          whatsapp: user.vendorProfile.whatsapp || "",
          facebook: user.vendorProfile.facebook || "",
          instagram: user.vendorProfile.instagram || "",
          tiktok: user.vendorProfile.tiktok || "",
          website: user.vendorProfile.website || "",
          state: user.vendorProfile.location?.state || "",
          city: user.vendorProfile.location?.city || "",
          country: user.vendorProfile.location?.country || "",
        });
      } else if (user.role === "EMPLOYER" && user.employerProfile) {
        setForm({
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          companyName: user.employerProfile.companyName || "",
          about: user.employerProfile.about || "",
          industry: user.employerProfile.industry || "",
          whatsapp: user.employerProfile.whatsapp || "",
          facebook: user.employerProfile.facebook || "",
          state: user.employerProfile.location?.state || "",
          city: user.employerProfile.location?.city || "",
          country: user.employerProfile.location?.country || "",
        });
      } else {
        setForm({ name: user.name || "", email: user.email || "", phone: user.phone || "" });
      }
    }
  }, [user]);

  const update = (field: string, value: any) => setForm((prev: any) => ({ ...prev, [field]: value }));

  const toggleArrayItem = (field: string, item: string) => {
    const current = form[field] || [];
    if (current.includes(item)) {
      update(field, current.filter((i: string) => i !== item));
    } else {
      update(field, [...current, item]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put("/auth/profile", {
        name: form.name,
        phone: form.phone,
        email: form.email,
      });

      if (user?.role === "TAILOR") {
        await api.put("/tailors/profile", {
          bio: form.bio,
          gender: form.gender,
          yearsOfExperience: form.yearsOfExperience,
          specializations: form.specializations,
          skills: form.skills,
          languages: form.languages,
          availability: form.availability,
          expectedSalary: form.expectedSalary,
          whatsapp: form.whatsapp,
          location: { state: form.state, city: form.city, country: form.country },
        });
      } else if (user?.role === "VENDOR") {
        await api.put("/vendors/profile", {
          businessName: form.businessName,
          about: form.about,
          categories: form.categories,
          deliveryOptions: form.deliveryOptions,
          whatsapp: form.whatsapp,
          facebook: form.facebook,
          instagram: form.instagram,
          tiktok: form.tiktok,
          website: form.website,
          location: { state: form.state, city: form.city, country: form.country },
        });
      } else if (user?.role === "EMPLOYER") {
        await api.put("/employers/profile", {
          companyName: form.companyName,
          about: form.about,
          industry: form.industry,
          whatsapp: form.whatsapp,
          facebook: form.facebook,
          location: { state: form.state, city: form.city, country: form.country },
        });
      }

      await loadUser();
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const inputClass = "w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent";

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-primary-500" />
            Basic Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input type="text" value={form.name || ""} onChange={(e) => update("name", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input type="email" value={form.email || ""} onChange={(e) => update("email", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
              <input type="tel" value={form.phone || ""} onChange={(e) => update("phone", e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Country</label>
              <input type="text" value={form.country || ""} onChange={(e) => update("country", e.target.value)} placeholder="Nigeria" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">State</label>
              <input type="text" value={form.state || ""} onChange={(e) => update("state", e.target.value)} placeholder="Lagos" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
              <input type="text" value={form.city || ""} onChange={(e) => update("city", e.target.value)} placeholder="Ikeja" className={inputClass} />
            </div>
          </div>
        </div>

        {user.role === "TAILOR" && (
          <>
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Scissors className="h-5 w-5 text-primary-500" />
                Tailor Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Years of Experience</label>
                  <input type="number" value={form.yearsOfExperience || ""} onChange={(e) => update("yearsOfExperience", parseInt(e.target.value) || 0)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Gender</label>
                  <select value={form.gender || ""} onChange={(e) => update("gender", e.target.value)} className={inputClass}>
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Availability</label>
                  <select value={form.availability || ""} onChange={(e) => update("availability", e.target.value)} className={inputClass}>
                    <option value="available">Available</option>
                    <option value="busy">Busy</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Expected Salary (&#8358;)</label>
                  <input type="number" value={form.expectedSalary || ""} onChange={(e) => update("expectedSalary", parseFloat(e.target.value) || 0)} className={inputClass} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
                  <textarea value={form.bio || ""} onChange={(e) => update("bio", e.target.value)} rows={3} className={inputClass} placeholder="Tell us about yourself..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">WhatsApp</label>
                  <input type="text" value={form.whatsapp || ""} onChange={(e) => update("whatsapp", e.target.value)} className={inputClass} placeholder="+234..." />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Specializations</label>
                <div className="flex flex-wrap gap-2">
                  {specializationOptions.map((s) => (
                    <button key={s} type="button" onClick={() => toggleArrayItem("specializations", s)} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${(form.specializations || []).includes(s) ? "bg-primary-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                <div className="flex flex-wrap gap-2">
                  {skillOptions.map((s) => (
                    <button key={s} type="button" onClick={() => toggleArrayItem("skills", s)} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${(form.skills || []).includes(s) ? "bg-accent-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {user.role === "VENDOR" && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Store className="h-5 w-5 text-primary-500" />
              Store Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Business Name</label>
                <input type="text" value={form.businessName || ""} onChange={(e) => update("businessName", e.target.value)} className={inputClass} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">About</label>
                <textarea value={form.about || ""} onChange={(e) => update("about", e.target.value)} rows={3} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">WhatsApp</label>
                <input type="text" value={form.whatsapp || ""} onChange={(e) => update("whatsapp", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Instagram</label>
                <input type="text" value={form.instagram || ""} onChange={(e) => update("instagram", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Facebook</label>
                <input type="text" value={form.facebook || ""} onChange={(e) => update("facebook", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Website</label>
                <input type="text" value={form.website || ""} onChange={(e) => update("website", e.target.value)} className={inputClass} />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Categories</label>
              <div className="flex flex-wrap gap-2">
                {categoryOptions.map((c) => (
                  <button key={c} type="button" onClick={() => toggleArrayItem("categories", c)} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${(form.categories || []).includes(c) ? "bg-accent-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Options</label>
              <div className="flex flex-wrap gap-2">
                {["Pickup", "Delivery", "Nationwide Shipping", "International Shipping"].map((d) => (
                  <button key={d} type="button" onClick={() => toggleArrayItem("deliveryOptions", d)} className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${(form.deliveryOptions || []).includes(d) ? "bg-green-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {user.role === "EMPLOYER" && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary-500" />
              Company Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Name</label>
                <input type="text" value={form.companyName || ""} onChange={(e) => update("companyName", e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Industry</label>
                <input type="text" value={form.industry || ""} onChange={(e) => update("industry", e.target.value)} className={inputClass} placeholder="Fashion, Textiles..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">WhatsApp</label>
                <input type="text" value={form.whatsapp || ""} onChange={(e) => update("whatsapp", e.target.value)} className={inputClass} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">About</label>
                <textarea value={form.about || ""} onChange={(e) => update("about", e.target.value)} rows={3} className={inputClass} />
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
