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
import Logo from "@/components/Logo";
import { usePWA } from "@/components/PWAProvider";
import { Download } from "lucide-react";

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
  const { isInstallable, promptInstall } = usePWA();

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
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-white/85 backdrop-blur-xl shadow-sm border-b border-stone-200/50"
          : "bg-white/95 backdrop-blur-md border-b border-stone-100"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo size="md" />
          </Link>

          <nav className="hidden md:flex items-center gap-1.5 bg-stone-50/80 p-1.5 rounded-full border border-stone-200/50">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-white text-primary-600 shadow-sm shadow-stone-200/50 font-bold"
                      : "text-stone-600 hover:text-stone-900 hover:bg-white/60"
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isActive ? "text-primary-600" : "text-stone-400"}`} />
                  {link.label}
                </Link>
              );
            })}

            {isInstallable && (
              <button
                onClick={promptInstall}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-primary-600 text-white text-xs font-bold shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all"
                title="Install D Tailors as an app on your device"
              >
                <Download className="h-3.5 w-3.5" />
                Install App
              </button>
            )}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <Link
                  href="/wishlist"
                  className="p-2 rounded-xl text-stone-600 hover:bg-stone-100/80 transition-colors relative group"
                  title="Wishlist"
                >
                  <Heart className="h-5 w-5 group-hover:text-primary-600 transition-colors" />
                </Link>
                <Link
                  href="/chat"
                  className="p-2 rounded-xl text-stone-600 hover:bg-stone-100/80 transition-colors relative group"
                  title="Chat"
                >
                  <MessageCircle className="h-5 w-5 group-hover:text-primary-600 transition-colors" />
                </Link>
                <Link
                  href="/cart"
                  className="p-2 rounded-xl text-stone-600 hover:bg-stone-100/80 transition-colors relative group"
                  title="Cart"
                >
                  <ShoppingCart className="h-5 w-5 group-hover:text-primary-600 transition-colors" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 text-white text-[10px] flex items-center justify-center font-bold shadow-sm shadow-primary-500/40 animate-pulse">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <div className="h-5 w-px bg-stone-200 mx-1" />
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4 text-primary-500" />
                  Dashboard
                </Link>
                <div className="relative group">
                  <button className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-stone-100/80 hover:bg-stone-200/60 border border-stone-200/60 text-xs font-semibold text-stone-800 transition-all">
                    <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-primary-500 to-accent-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                      {user.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <span className="max-w-[100px] truncate">{user.name?.split(" ")[0]}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-stone-400 group-hover:text-stone-600 transition-transform group-hover:rotate-180" />
                  </button>
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white shadow-xl shadow-stone-900/5 border border-stone-100 py-1.5 hidden group-hover:block transition-all transform origin-top-right">
                    <div className="px-4 py-2.5 border-b border-stone-100 bg-stone-50/50">
                      <p className="text-xs font-bold text-stone-900 truncate">{user.name}</p>
                      <p className="text-[11px] text-stone-500 truncate">{user.email}</p>
                    </div>
                    <div className="p-1 space-y-0.5">
                      <Link
                        href="/seller/products/new"
                        className="block px-3 py-2 rounded-lg text-xs font-bold text-amber-700 bg-amber-50/80 hover:bg-amber-100 transition-colors"
                      >
                        + List Item for Sale
                      </Link>
                      <Link
                        href="/dashboard/profile"
                        className="block px-3 py-2 rounded-lg text-xs font-medium text-stone-700 hover:bg-stone-100/80 transition-colors"
                      >
                        Edit Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white text-xs font-bold hover:shadow-md hover:shadow-primary-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-xl text-stone-600 hover:bg-stone-100"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-stone-100 bg-white/95 backdrop-blur-xl animate-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-4 space-y-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    isActive ? "bg-primary-50 text-primary-600" : "text-stone-700 hover:bg-stone-50"
                  }`}
                >
                  <Icon className="h-4 w-4 text-primary-500" />
                  {link.label}
                </Link>
              );
            })}
            <hr className="my-2 border-stone-100" />
            {user ? (
              <>
                <Link
                  href="/cart"
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-stone-700 hover:bg-stone-50"
                >
                  <span className="flex items-center gap-2.5">
                    <ShoppingCart className="h-4 w-4 text-primary-500" />
                    Cart
                  </span>
                  {cartCount > 0 && (
                    <span className="h-5 min-w-5 px-1.5 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center font-bold">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <Link
                  href="/chat"
                  className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-stone-700 hover:bg-stone-50"
                >
                  <MessageCircle className="h-4 w-4 text-primary-500" />
                  Messages
                </Link>
                <Link
                  href="/wishlist"
                  className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-stone-700 hover:bg-stone-50"
                >
                  <Heart className="h-4 w-4 text-primary-500" />
                  Wishlist
                </Link>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-stone-700 hover:bg-stone-50"
                >
                  <LayoutDashboard className="h-4 w-4 text-primary-500" />
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <div className="pt-2 flex flex-col gap-2">
                <Link
                  href="/auth/login"
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200 text-sm font-semibold text-stone-700 hover:bg-stone-50"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Link>
                <Link
                  href="/auth/register"
                  className="flex items-center justify-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white text-sm font-bold shadow-md shadow-primary-500/20"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
