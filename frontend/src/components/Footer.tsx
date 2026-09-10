import Link from "next/link";
import { Mail, Phone, MapPin, Sparkles } from "lucide-react";
import Logo from "@/components/Logo";

export default function Footer() {
  return (
    <footer className="bg-stone-950 text-stone-300 border-t border-stone-800/60 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute -top-24 left-1/4 w-96 h-96 bg-primary-500 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-500 rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="mb-5">
              <Link href="/">
                <Logo size="md" />
              </Link>
            </div>
            <p className="text-xs text-stone-400 leading-relaxed max-w-xs">
              Africa&apos;s premier fashion ecosystem. Empowering tailors, fabric vendors, and employers with a seamlessly connected digital marketplace.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-900 border border-stone-800 text-[11px] font-semibold text-primary-400">
                <Sparkles className="h-3 w-3" /> Africa Fashion Network
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-white font-bold text-sm tracking-wide mb-4 uppercase text-stone-200">Marketplace</h3>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/market" className="hover:text-primary-400 transition-colors">Marketplace Items</Link></li>
              <li><Link href="/tailors" className="hover:text-primary-400 transition-colors">Find Tailors</Link></li>
              <li><Link href="/vendors" className="hover:text-primary-400 transition-colors">Shop Fabrics</Link></li>
              <li><Link href="/jobs" className="hover:text-primary-400 transition-colors">Browse Job Postings</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold text-sm tracking-wide mb-4 uppercase text-stone-200">For Professionals</h3>
            <ul className="space-y-2.5 text-xs">
              <li><Link href="/auth/register" className="hover:text-primary-400 transition-colors">Register as Tailor</Link></li>
              <li><Link href="/auth/register" className="hover:text-primary-400 transition-colors">Register as Vendor</Link></li>
              <li><Link href="/auth/register" className="hover:text-primary-400 transition-colors">Post a Job</Link></li>
              <li><Link href="/dashboard" className="hover:text-primary-400 transition-colors">User Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold text-sm tracking-wide mb-4 uppercase text-stone-200">Contact Us</h3>
            <ul className="space-y-3 text-xs text-stone-400">
              <li className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-stone-900 border border-stone-800 flex items-center justify-center text-primary-400">
                  <Mail className="h-3.5 w-3.5" />
                </div>
                <span>contact@dtailors.com</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-stone-900 border border-stone-800 flex items-center justify-center text-primary-400">
                  <Phone className="h-3.5 w-3.5" />
                </div>
                <span>+234 800 000 0000</span>
              </li>
              <li className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded-lg bg-stone-900 border border-stone-800 flex items-center justify-center text-primary-400">
                  <MapPin className="h-3.5 w-3.5" />
                </div>
                <span>Lagos, Nigeria</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-stone-900 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-stone-500">
          <p>
            &copy; {new Date().getFullYear()} D Tailors Marketplace. All rights reserved.
          </p>
          <div className="flex gap-6 text-stone-400 font-medium">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-white transition-colors">Help Center</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

