import Link from "next/link";
import { Scissors, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-500">
                <Scissors className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">D Tailors</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Connecting tailors, fabric vendors, and employers across Africa. Find the best talent and materials for your fashion needs.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/tailors" className="hover:text-primary-400 transition-colors">Find Tailors</Link></li>
              <li><Link href="/vendors" className="hover:text-primary-400 transition-colors">Shop Fabrics</Link></li>
              <li><Link href="/jobs" className="hover:text-primary-400 transition-colors">Browse Jobs</Link></li>
              <li><Link href="/auth/register" className="hover:text-primary-400 transition-colors">Join as Vendor</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">For Professionals</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/auth/register" className="hover:text-primary-400 transition-colors">Register as Tailor</Link></li>
              <li><Link href="/auth/register" className="hover:text-primary-400 transition-colors">Register as Vendor</Link></li>
              <li><Link href="/auth/register" className="hover:text-primary-400 transition-colors">Post a Job</Link></li>
              <li><Link href="/dashboard" className="hover:text-primary-400 transition-colors">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary-400" />
                <span>info@dtailors.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary-400" />
                <span>+234 800 000 0000</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary-400" />
                <span>Lagos, Nigeria</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} D Tailors Marketplace. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-gray-500">
            <Link href="#" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-gray-300 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
