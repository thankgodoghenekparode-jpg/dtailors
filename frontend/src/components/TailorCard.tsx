import Link from "next/link";
import { MapPin, Star, Clock, Award } from "lucide-react";
import { TailorProfile } from "@/lib/types";

interface TailorCardProps {
  tailor: TailorProfile;
}

export default function TailorCard({ tailor }: TailorCardProps) {
  const loc = tailor.location as Record<string, string> | undefined;
  const locationStr = [loc?.city, loc?.state].filter(Boolean).join(", ");
  const isAvailable = tailor.availability?.toLowerCase().includes("available") ?? true;

  return (
    <Link
      href={`/tailors/${tailor.id}`}
      className="group bg-white rounded-2xl border border-stone-200/70 p-5 hover-lift relative flex flex-col justify-between transition-all duration-200 hover:border-primary-300"
    >
      <div>
        <div className="flex items-start gap-3.5">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary-100 to-accent-100 border border-primary-200/50 flex items-center justify-center text-primary-700 font-bold text-xl shrink-0 overflow-hidden shadow-inner">
            {tailor.photo ? (
              <img
                src={tailor.photo}
                alt={tailor.user?.name || "Tailor"}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              tailor.user?.name?.charAt(0)?.toUpperCase()
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <h3 className="font-bold text-stone-900 group-hover:text-primary-600 transition-colors truncate text-base">
                {tailor.user?.name || "Master Tailor"}
              </h3>
            </div>
            {locationStr && (
              <div className="flex items-center gap-1 text-xs text-stone-500 mt-1">
                <MapPin className="h-3 w-3 text-primary-500 shrink-0" />
                <span className="truncate">{locationStr}</span>
              </div>
            )}
            <div className="mt-1 flex items-center gap-1.5">
              <span className={`inline-block h-2 w-2 rounded-full ${isAvailable ? "bg-emerald-500 shadow-sm shadow-emerald-500/50" : "bg-amber-400"}`} />
              <span className="text-[11px] font-semibold text-stone-500 capitalize">{tailor.availability || "Available"}</span>
            </div>
          </div>
        </div>

        {tailor.bio && (
          <p className="mt-3.5 text-xs text-stone-600 line-clamp-2 leading-relaxed">{tailor.bio}</p>
        )}

        {tailor.specializations.length > 0 && (
          <div className="mt-3.5 flex flex-wrap gap-1.5">
            {tailor.specializations.slice(0, 3).map((spec) => (
              <span
                key={spec}
                className="px-2.5 py-0.5 bg-primary-50/80 text-primary-700 border border-primary-100 text-[11px] font-semibold rounded-full"
              >
                {spec}
              </span>
            ))}
            {tailor.specializations.length > 3 && (
              <span className="px-2 py-0.5 bg-stone-100 text-stone-500 text-[11px] font-semibold rounded-full">
                +{tailor.specializations.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
        <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200/50">
          <Award className="h-3.5 w-3.5 text-amber-600" />
          <span className="text-xs font-bold text-amber-800">
            {tailor.yearsOfExperience || 0} yrs exp
          </span>
        </div>
        <span className="text-xs font-bold text-primary-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
          View Profile &rarr;
        </span>
      </div>
    </Link>
  );
}

