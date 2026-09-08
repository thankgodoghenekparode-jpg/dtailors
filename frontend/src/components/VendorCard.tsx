import Link from "next/link";
import { MapPin, Star, CheckCircle, Package } from "lucide-react";
import { VendorProfile } from "@/lib/types";

interface VendorCardProps {
  vendor: VendorProfile;
}

export default function VendorCard({ vendor }: VendorCardProps) {
  const loc = vendor.location as Record<string, string> | undefined;
  const locationStr = [loc?.city, loc?.state].filter(Boolean).join(", ");
  const productCount = vendor._count?.products ?? vendor.products?.length ?? 0;

  return (
    <Link
      href={`/vendors/${vendor.id}`}
      className="group bg-white rounded-2xl border border-stone-200/70 p-5 hover-lift relative flex flex-col justify-between transition-all duration-200 hover:border-accent-300"
    >
      <div>
        <div className="flex items-start gap-3.5">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-accent-100 to-amber-100 border border-accent-200/50 flex items-center justify-center text-accent-700 font-bold text-xl shrink-0 overflow-hidden shadow-inner">
            {vendor.logo ? (
              <img
                src={vendor.logo}
                alt={vendor.businessName}
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              vendor.businessName?.charAt(0)?.toUpperCase()
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-stone-900 group-hover:text-accent-600 transition-colors truncate text-base">
                {vendor.businessName}
              </h3>
              {vendor.verified && (
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 fill-emerald-100" />
              )}
            </div>
            {locationStr && (
              <div className="flex items-center gap-1 text-xs text-stone-500 mt-1">
                <MapPin className="h-3 w-3 text-accent-500 shrink-0" />
                <span className="truncate">{locationStr}</span>
              </div>
            )}
          </div>
        </div>

        {vendor.about && (
          <p className="mt-3.5 text-xs text-stone-600 line-clamp-2 leading-relaxed">{vendor.about}</p>
        )}

        {vendor.categories.length > 0 && (
          <div className="mt-3.5 flex flex-wrap gap-1.5">
            {vendor.categories.slice(0, 3).map((cat) => (
              <span
                key={cat}
                className="px-2.5 py-0.5 bg-accent-50/80 text-accent-700 border border-accent-100 text-[11px] font-semibold rounded-full"
              >
                {cat}
              </span>
            ))}
            {vendor.categories.length > 3 && (
              <span className="px-2 py-0.5 bg-stone-100 text-stone-500 text-[11px] font-semibold rounded-full">
                +{vendor.categories.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
        <div className="flex items-center gap-1 bg-amber-50/80 px-2 py-1 rounded-lg border border-amber-200/50">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
          <span className="text-xs font-bold text-amber-900">
            {vendor.rating?.toFixed(1) || "4.8"}
          </span>
          <span className="text-[10px] text-amber-700 font-medium">({vendor.reviewCount || 12})</span>
        </div>
        <div className="flex items-center gap-1 text-xs font-medium text-stone-500">
          <Package className="h-3.5 w-3.5 text-stone-400" />
          <span>{productCount} items</span>
        </div>
      </div>
    </Link>
  );
}

