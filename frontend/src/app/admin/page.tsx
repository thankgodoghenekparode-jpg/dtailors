"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import useAuthStore from "@/store/authStore";
import LoadingSpinner from "@/components/LoadingSpinner";
import toast from "react-hot-toast";
import {
  Users,
  Scissors,
  Store,
  Briefcase,
  Package,
  Star,
  FileText,
  Shield,
  CheckCircle,
  Trash2,
  Eye,
  BarChart3,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

interface AdminStats {
  totalUsers: number;
  totalTailors: number;
  totalVendors: number;
  totalEmployers: number;
  totalProducts: number;
  totalJobs: number;
  totalReviews: number;
}

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface JobRecord {
  id: string;
  title: string;
  jobType: string;
  state?: string;
  createdAt: string;
}

interface ProductRecord {
  id: string;
  name: string;
  price: number;
  category: string;
  createdAt: string;
}

export default function AdminPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<UserRecord[]>([]);
  const [recentProducts, setRecentProducts] = useState<ProductRecord[]>([]);
  const [recentJobs, setRecentJobs] = useState<JobRecord[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "users">("overview");

  useEffect(() => {
    if (user && user.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [user, router]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("/admin/dashboard");
        setStats(res.data.stats);
        setRecentUsers(res.data.recentUsers || []);
        setRecentProducts(res.data.recentProducts || []);
        setRecentJobs(res.data.recentJobs || []);
      } catch {
        toast.error("Failed to load admin dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const fetchAllUsers = async () => {
    try {
      const res = await api.get("/admin/users?limit=100");
      setAllUsers(res.data.data || []);
    } catch {
      toast.error("Failed to load users");
    }
  };

  const handleVerify = async (userId: string) => {
    try {
      await api.put(`/admin/users/${userId}/verify`);
      toast.success("User verified");
      setAllUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, verified: true } : u))
      );
    } catch {
      toast.error("Failed to verify user");
    }
  };

  const handleDelete = async (resource: string, id: string) => {
    if (!confirm("Are you sure? This action cannot be undone.")) return;
    try {
      await api.delete(`/admin/${resource}/${id}`);
      toast.success("Deleted successfully");
      if (resource === "users") setAllUsers((prev) => prev.filter((u) => u.id !== id));
    } catch {
      toast.error("Failed to delete");
    }
  };

  if (!user || user.role !== "ADMIN") return null;
  if (loading) return <LoadingSpinner />;

  const statCards = stats
    ? [
        { label: "Total Users", value: stats.totalUsers, icon: Users, color: "bg-blue-50 text-blue-600" },
        { label: "Tailors", value: stats.totalTailors, icon: Scissors, color: "bg-primary-50 text-primary-600" },
        { label: "Vendors", value: stats.totalVendors, icon: Store, color: "bg-accent-50 text-accent-600" },
        { label: "Employers", value: stats.totalEmployers, icon: Briefcase, color: "bg-green-50 text-green-600" },
        { label: "Products", value: stats.totalProducts, icon: Package, color: "bg-purple-50 text-purple-600" },
        { label: "Jobs", value: stats.totalJobs, icon: FileText, color: "bg-pink-50 text-pink-600" },
        { label: "Reviews", value: stats.totalReviews, icon: Star, color: "bg-red-50 text-red-600" },
      ]
    : [];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary-500" />
            Admin Dashboard
          </h1>
          <p className="text-gray-500 text-sm mt-1">Platform overview and management</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setTab("overview"); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === "overview" ? "bg-primary-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            <BarChart3 className="h-4 w-4 inline mr-1" />
            Overview
          </button>
          <button
            onClick={() => { setTab("users"); fetchAllUsers(); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${tab === "users" ? "bg-primary-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            <Users className="h-4 w-4 inline mr-1" />
            Users
          </button>
        </div>
      </div>

      {tab === "overview" && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className={`h-10 w-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Recent Users</h2>
              <div className="space-y-3">
                {recentUsers.length === 0 ? (
                  <p className="text-gray-500 text-sm">No users yet</p>
                ) : (
                  recentUsers.map((u) => (
                    <div key={u.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-500">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{u.name}</p>
                          <p className="text-xs text-gray-500">{u.email}</p>
                        </div>
                      </div>
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full capitalize">{u.role.toLowerCase()}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Recent Jobs</h2>
              <div className="space-y-3">
                {recentJobs.length === 0 ? (
                  <p className="text-gray-500 text-sm">No jobs yet</p>
                ) : (
                  recentJobs.map((j) => (
                    <div key={j.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{j.title}</p>
                        <p className="text-xs text-gray-500">{j.state || "N/A"} &middot; {j.jobType}</p>
                      </div>
                      <span className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(j.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {tab === "users" && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {allUsers.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500">Click &quot;Users&quot; to load user list</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-4 py-3 font-medium text-gray-500">User</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Role</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Joined</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map((u) => (
                    <tr key={u.id} className="border-b border-gray-50 last:border-0">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-500">
                            {u.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{u.name}</p>
                            <p className="text-xs text-gray-500">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs capitalize">{u.role.toLowerCase()}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {formatDistanceToNow(new Date(u.createdAt), { addSuffix: true })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleVerify(u.id)} className="p-1.5 text-gray-400 hover:text-green-500 rounded-lg hover:bg-green-50" title="Verify">
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleDelete("users", u.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50" title="Delete">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
