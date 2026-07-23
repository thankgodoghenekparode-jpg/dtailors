"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import useAuthStore from "@/store/authStore";
import {
  Eye,
  Star,
  Package,
  Briefcase,
  Users,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    profileViews: 0,
    totalReviews: 0,
    totalProducts: 0,
    totalJobs: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      try {
        if (user.role === "VENDOR" && user.vendorProfile) {
          const res = await api.get("/vendors/products?limit=1");
          const total = res.data.pagination?.total || 0;
          setStats({ profileViews: 0, totalReviews: user.vendorProfile.reviewCount || 0, totalProducts: total, totalJobs: 0 });
        } else if (user.role === "EMPLOYER" && user.employerProfile) {
          const res = await api.get("/employers/jobs?limit=1");
          const total = res.data.pagination?.total || 0;
          setStats({ profileViews: 0, totalReviews: 0, totalProducts: 0, totalJobs: total });
        }
      } catch {
        // Silently handle
      }
    };
    fetchStats();
  }, [user]);

  if (!user) return null;

  const statCards = [
    { label: "Profile Views", value: stats.profileViews, icon: Eye, color: "bg-blue-50 text-blue-600" },
    { label: "Reviews", value: stats.totalReviews, icon: Star, color: "bg-accent-50 text-accent-600" },
    ...(user.role === "VENDOR"
      ? [{ label: "Products", value: stats.totalProducts, icon: Package, color: "bg-green-50 text-green-600" }]
      : []),
    ...(user.role === "EMPLOYER"
      ? [{ label: "Jobs Posted", value: stats.totalJobs, icon: Briefcase, color: "bg-purple-50 text-purple-600" }]
      : []),
  ];

  const quickActions: { label: string; href: string; icon: any }[] = [];
  if (user.role === "VENDOR") {
    quickActions.push({ label: "Add Product", href: "/dashboard/products/new", icon: Package });
    quickActions.push({ label: "Manage Products", href: "/dashboard/products", icon: Package });
  }
  if (user.role === "EMPLOYER") {
    quickActions.push({ label: "Post Job", href: "/dashboard/jobs/new", icon: Briefcase });
    quickActions.push({ label: "Manage Jobs", href: "/dashboard/jobs", icon: Briefcase });
  }
  quickActions.push({ label: "Edit Profile", href: "/dashboard/profile", icon: Users });
  quickActions.push({ label: "View Reviews", href: "/dashboard/reviews", icon: Star });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user.name}!
        </h1>
        <p className="text-gray-500 mt-1">
          Here&apos;s what&apos;s happening with your account
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between">
                <div className={`h-10 w-10 rounded-xl ${stat.color} flex items-center justify-center`}>
                  <Icon className="h-5 w-5" />
                </div>
                <TrendingUp className="h-4 w-4 text-gray-300" />
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                    {action.label}
                  </span>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-primary-500 transition-colors" />
              </Link>
            );
          })}
        </div>
      </div>

      {user.role === "ADMIN" && (
        <div className="mt-8">
          <Link
            href="/admin"
            className="flex items-center justify-between bg-primary-50 rounded-2xl border border-primary-100 p-5 hover:bg-primary-100 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-primary-500 flex items-center justify-center text-white">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-primary-900 group-hover:text-primary-700">Admin Dashboard</p>
                <p className="text-sm text-primary-600">Manage users, view reports, and more</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-primary-400" />
          </Link>
        </div>
      )}
    </div>
  );
}
