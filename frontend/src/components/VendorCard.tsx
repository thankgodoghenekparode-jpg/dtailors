"use client";

import Link from "next/link";
import { MapPin, Star, CheckCircle, Package, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { VendorProfile } from "@/lib/types";

interface VendorCardProps {
  vendor: VendorProfile;
  index?: number;
}

export default function VendorCard({ vendor, index = 0 }: VendorCardProps) {
  const loc = vendor.location as Record<string, string> | undefined;
  const locationStr = [loc?.city, loc?.state].filter(Boolean).join(", ");
  const productCount = vendor._count?.products ?? vendor.products?.length ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.5,
        delay: Math.min(index * 0.08, 0.4),
        type: "spring",
        stiffness: 240,
        damping: 20,
      }}
      whileHover={{ y: -6, scale: 1.015 }}
      className="group bg-white rounded-2xl border border-stone-200/80 p-5 shadow-sm hover:shadow-xl hover:shadow-accent-500/10 hover:border-accent-300 relative flex flex-col justify-between transition-all duration-300 overflow-hidden"
    >
      {/* Top Ambient Highlight */}
      <div className="absolute -top-12 -right-12 w-28 h-28 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />

      <div>
        <div className="flex items-start gap-3.5">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 border border-amber-200/60 flex items-center justify-center text-amber-800 font-extrabold text-xl shrink-0 overflow-hidden shadow-inner relative group-hover:ring-2 group-hover:ring-amber-500/40 transition-all duration-300">
            {vendor.logo ? (
              <img
                src={vendor.logo}
                alt={vendor.businessName}
                className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
              />
            ) : (
              vendor.businessName?.charAt(0)?.toUpperCase()
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="font-extrabold text-stone-900 group-hover:text-amber-600 transition-colors truncate text-base tracking-tight">
                {vendor.businessName}
              </h3>
              {vendor.verified && (
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 fill-emerald-100" />
              )}
            </div>
            {locationStr && (
              <div className="flex items-center gap-1 text-xs text-stone-500 mt-1">
                <MapPin className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span className="truncate font-medium">{locationStr}</span>
              </div>
            )}
          </div>
        </div>

        {vendor.about && (
          <p className="mt-3.5 text-xs text-stone-600 line-clamp-2 leading-relaxed font-normal">
            {vendor.about}
          </p>
        )}

        {vendor.categories.length > 0 && (
          <div className="mt-3.5 flex flex-wrap gap-1.5">
            {vendor.categories.slice(0, 3).map((cat) => (
              <span
                key={cat}
                className="px-2.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200/70 text-[11px] font-bold rounded-full shadow-xs"
              >
                {cat}
              </span>
            ))}
            {vendor.categories.length > 3 && (
              <span className="px-2 py-0.5 bg-stone-100 text-stone-500 text-[11px] font-bold rounded-full">
                +{vendor.categories.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3.5 border-t border-stone-100 flex items-center justify-between">
        <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
          <span className="text-xs font-extrabold text-amber-900">
            {vendor.rating?.toFixed(1) || "4.8"}
          </span>
          <span className="text-[10px] text-amber-700 font-medium">({vendor.reviewCount || 12})</span>
        </div>

        <Link
          href={`/vendors/${vendor.id}`}
          className="text-xs font-extrabold text-amber-600 group-hover:text-amber-700 flex items-center gap-1 transition-all"
        >
          <span>{productCount} items</span>
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
}
