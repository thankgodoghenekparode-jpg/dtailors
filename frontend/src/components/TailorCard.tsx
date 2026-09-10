"use client";

import Link from "next/link";
import { MapPin, Star, Award, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { TailorProfile } from "@/lib/types";

interface TailorCardProps {
  tailor: TailorProfile;
  index?: number;
}

export default function TailorCard({ tailor, index = 0 }: TailorCardProps) {
  const loc = tailor.location as Record<string, string> | undefined;
  const locationStr = [loc?.city, loc?.state].filter(Boolean).join(", ");
  const isAvailable = tailor.availability?.toLowerCase().includes("available") ?? true;

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
      className="group bg-white rounded-2xl border border-stone-200/80 p-5 shadow-sm hover:shadow-xl hover:shadow-primary-500/10 hover:border-primary-300 relative flex flex-col justify-between transition-all duration-300 overflow-hidden"
    >
      {/* Top Ambient Highlight */}
      <div className="absolute -top-12 -right-12 w-28 h-28 bg-gradient-to-br from-primary-500/10 to-accent-500/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />

      <div>
        <div className="flex items-start gap-3.5">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary-100 to-accent-100 border border-primary-200/60 flex items-center justify-center text-primary-700 font-extrabold text-xl shrink-0 overflow-hidden shadow-inner relative group-hover:ring-2 group-hover:ring-primary-500/40 transition-all duration-300">
            {tailor.photo ? (
              <img
                src={tailor.photo}
                alt={tailor.user?.name || "Tailor"}
                className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
              />
            ) : (
              tailor.user?.name?.charAt(0)?.toUpperCase()
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-extrabold text-stone-900 group-hover:text-primary-600 transition-colors truncate text-base tracking-tight">
              {tailor.user?.name || "Master Tailor"}
            </h3>
            {locationStr && (
              <div className="flex items-center gap-1 text-xs text-stone-500 mt-1">
                <MapPin className="h-3.5 w-3.5 text-primary-500 shrink-0" />
                <span className="truncate font-medium">{locationStr}</span>
              </div>
            )}
            <div className="mt-1.5 flex items-center gap-1.5">
              <span className={`inline-block h-2 w-2 rounded-full ${isAvailable ? "bg-emerald-500 shadow-sm shadow-emerald-500/60 animate-pulse" : "bg-amber-400"}`} />
              <span className="text-[11px] font-bold text-stone-500 capitalize">{tailor.availability || "Available"}</span>
            </div>
          </div>
        </div>

        {tailor.bio && (
          <p className="mt-3.5 text-xs text-stone-600 line-clamp-2 leading-relaxed font-normal">
            {tailor.bio}
          </p>
        )}

        {tailor.specializations.length > 0 && (
          <div className="mt-3.5 flex flex-wrap gap-1.5">
            {tailor.specializations.slice(0, 3).map((spec) => (
              <span
                key={spec}
                className="px-2.5 py-0.5 bg-primary-50 text-primary-700 border border-primary-100 text-[11px] font-bold rounded-full shadow-xs"
              >
                {spec}
              </span>
            ))}
            {tailor.specializations.length > 3 && (
              <span className="px-2 py-0.5 bg-stone-100 text-stone-500 text-[11px] font-bold rounded-full">
                +{tailor.specializations.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3.5 border-t border-stone-100 flex items-center justify-between">
        <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60">
          <Award className="h-3.5 w-3.5 text-amber-600" />
          <span className="text-xs font-extrabold text-amber-900">
            {tailor.yearsOfExperience || 0} yrs exp
          </span>
        </div>

        <Link
          href={`/tailors/${tailor.id}`}
          className="text-xs font-extrabold text-primary-600 group-hover:text-primary-700 flex items-center gap-1 transition-all"
        >
          View Profile
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
}
