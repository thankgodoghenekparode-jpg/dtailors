"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  Scissors,
  Store,
  Briefcase,
  ShoppingBag,
  LayoutDashboard,
  LogOut,
  LogIn,
  ChevronDown,
  MessageCircle,
  Heart,
  ShoppingCart,
} from "lucide-react";
import useAuthStore from "@/store/authStore";
import useCartStore from "@/store/cartStore";

const navLinks = [
  { href: "/market", label: "Market", icon: ShoppingBag },
  { href: "/tailors", label: "Tailors", icon: Scissors },
  { href: "/vendors", label: "Vendors", icon: Store },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, loadUser } = useAuthStore();
  const { count: cartCount, loadCart } = useCartStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    if (user) {
      loadCart();
    }
  }, [user, loadCart]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-md"
          : "bg-white"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-500">
              <Scissors className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              D Tailors
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
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

          <div className="hidden md:flex items-center gap-1">
            {user ? (
              <>
                <Link
                  href="/wishlist"
                  className="p-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors relative"
                  title="Wishlist"
                >
                  <Heart className="h-5 w-5" />
                </Link>
                <Link
                  href="/chat"
                  className="p-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors relative"
                  title="Chat"
                >
                  <MessageCircle className="h-5 w-5" />
                </Link>
                <Link
                  href="/cart"
                  className="p-2 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors relative"
                  title="Cart"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-primary-500 text-white text-[10px] flex items-center justify-center font-semibold">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <div className="relative group">
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                    <div className="h-7 w-7 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold text-xs">
                      {user.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                  <div className="absolute right-0 mt-1 w-48 rounded-xl bg-white shadow-lg border border-gray-100 py-1 hidden group-hover:block">
                    <div className="px-3 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <Link
                      href="/dashboard/profile"
                      className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Edit Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-50"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
            <hr className="my-2" />
            {user ? (
              <>
                <Link
                  href="/market"
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Market
                </Link>
                <Link
                  href="/cart"
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Cart
                  {cartCount > 0 && (
                    <span className="ml-auto h-4 min-w-4 px-1 rounded-full bg-primary-500 text-white text-[10px] flex items-center justify-center font-semibold">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <Link
                  href="/chat"
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <MessageCircle className="h-4 w-4" />
                  Messages
                </Link>
                <Link
                  href="/wishlist"
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <Heart className="h-4 w-4" />
                  Wishlist
                </Link>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="flex items-center justify-center px-4 py-2.5 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
