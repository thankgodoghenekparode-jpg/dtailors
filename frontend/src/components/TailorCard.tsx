import Link from "next/link";
import { MapPin, Star, Clock } from "lucide-react";
import { TailorProfile } from "@/lib/types";

interface TailorCardProps {
  tailor: TailorProfile;
}

export default function TailorCard({ tailor }: TailorCardProps) {
  const loc = tailor.location as Record<string, string> | undefined;
  const locationStr = [loc?.city, loc?.state, loc?.country].filter(Boolean).join(", ");

  return (
    <Link
      href={`/tailors/${tailor.id}`}
      className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-xl shrink-0 overflow-hidden">
            {tailor.photo ? (
              <img
                src={tailor.photo}
                alt={tailor.user?.name || "Tailor"}
                className="h-full w-full object-cover"
              />
            ) : (
              tailor.user?.name?.charAt(0)?.toUpperCase()
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors truncate">
              {tailor.user?.name || "Tailor"}
            </h3>
            {locationStr && (
              <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{locationStr}</span>
              </div>
            )}
          </div>
        </div>

        {tailor.bio && (
          <p className="mt-3 text-sm text-gray-600 line-clamp-2">{tailor.bio}</p>
        )}

        {tailor.specializations.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tailor.specializations.slice(0, 3).map((spec) => (
              <span
                key={spec}
                className="px-2 py-0.5 bg-primary-50 text-primary-600 text-xs font-medium rounded-full"
              >
                {spec}
              </span>
            ))}
            {tailor.specializations.length > 3 && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
                +{tailor.specializations.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-accent-400 text-accent-400" />
            <span className="text-sm font-medium text-gray-700">
              {tailor.yearsOfExperience || 0} yrs exp
            </span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Clock className="h-3.5 w-3.5" />
            <span>{tailor.availability || "Available"}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
