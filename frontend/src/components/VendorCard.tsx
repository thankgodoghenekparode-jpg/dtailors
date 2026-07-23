import Link from "next/link";
import { MapPin, Star, CheckCircle } from "lucide-react";
import { VendorProfile } from "@/lib/types";

interface VendorCardProps {
  vendor: VendorProfile;
}

export default function VendorCard({ vendor }: VendorCardProps) {
  const loc = vendor.location as Record<string, string> | undefined;
  const locationStr = [loc?.city, loc?.state, loc?.country].filter(Boolean).join(", ");
  const productCount = vendor._count?.products ?? vendor.products?.length ?? 0;

  return (
    <Link
      href={`/vendors/${vendor.id}`}
      className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
    >
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-xl shrink-0 overflow-hidden">
            {vendor.logo ? (
              <img
                src={vendor.logo}
                alt={vendor.businessName}
                className="h-full w-full object-cover"
              />
            ) : (
              vendor.businessName?.charAt(0)?.toUpperCase()
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors truncate">
                {vendor.businessName}
              </h3>
              {vendor.verified && (
                <CheckCircle className="h-4 w-4 text-primary-500 shrink-0" />
              )}
            </div>
            {locationStr && (
              <div className="flex items-center gap-1 text-sm text-gray-500 mt-0.5">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{locationStr}</span>
              </div>
            )}
          </div>
        </div>

        {vendor.about && (
          <p className="mt-3 text-sm text-gray-600 line-clamp-2">{vendor.about}</p>
        )}

        {vendor.categories.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {vendor.categories.slice(0, 3).map((cat) => (
              <span
                key={cat}
                className="px-2 py-0.5 bg-accent-50 text-accent-600 text-xs font-medium rounded-full"
              >
                {cat}
              </span>
            ))}
            {vendor.categories.length > 3 && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
                +{vendor.categories.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-accent-400 text-accent-400" />
            <span className="text-sm font-medium text-gray-700">
              {vendor.rating?.toFixed(1) || "0.0"}
            </span>
            <span className="text-xs text-gray-500">({vendor.reviewCount || 0})</span>
          </div>
          <span className="text-sm text-gray-500">{productCount} products</span>
        </div>
      </div>
    </Link>
  );
}
