"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";
import {
  LayoutDashboard,
  User,
  Package,
  Briefcase,
  Star,
  Users,
  BarChart3,
  Shield,
  Settings,
  ChevronLeft,
} from "lucide-react";

const tailorLinks = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/profile", label: "Edit Profile", icon: User },
  { href: "/dashboard/reviews", label: "Reviews", icon: Star },
];

const vendorLinks = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/profile", label: "Edit Profile", icon: User },
  { href: "/dashboard/products", label: "Products", icon: Package },
  { href: "/dashboard/reviews", label: "Reviews", icon: Star },
];

const employerLinks = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/profile", label: "Edit Profile", icon: User },
  { href: "/dashboard/jobs", label: "Jobs", icon: Briefcase },
  { href: "/dashboard/reviews", label: "Reviews", icon: Star },
];

const adminLinks = [
  { href: "/admin", label: "Admin Dashboard", icon: Shield },
  { href: "/dashboard", label: "My Profile", icon: User },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, loadUser } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-primary-500" />
      </div>
    );
  }

  if (!user) return null;

  const getLinks = () => {
    if (user.role === "ADMIN") return adminLinks;
    if (user.role === "VENDOR") return vendorLinks;
    if (user.role === "EMPLOYER") return employerLinks;
    return tailorLinks;
  };

  const links = getLinks();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-2 mb-6">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
          <ChevronLeft className="h-4 w-4 inline" />
          Home
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-medium text-gray-900">Dashboard</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 sticky top-24">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
              <div className="h-10 w-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-sm">
                {user.avatar ? (
                  <img src={user.avatar} alt="" className="h-full w-full rounded-xl object-cover" />
                ) : (
                  user.name?.charAt(0)?.toUpperCase()
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role?.toLowerCase()}</p>
              </div>
            </div>
            <nav className="space-y-1">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary-50 text-primary-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        <div className="lg:col-span-3">{children}</div>
      </div>
    </div>
  );
}
