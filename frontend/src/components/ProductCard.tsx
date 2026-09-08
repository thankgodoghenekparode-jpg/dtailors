import Link from "next/link";
import { Star, ShoppingBag } from "lucide-react";
import { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const effectivePrice = product.discount && product.discount > 0 ? product.discount : product.price;

  return (
    <Link
      href={`/vendors/${product.vendorId}/products/${product.id}`}
      className="group bg-white rounded-2xl border border-stone-200/70 overflow-hidden hover-lift flex flex-col justify-between transition-all duration-200 hover:border-primary-300"
    >
      <div>
        <div className="aspect-square bg-stone-100 relative overflow-hidden">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-stone-300 bg-stone-50">
              <ShoppingBag className="h-10 w-10 text-stone-400 opacity-60" />
            </div>
          )}
          {product.discount && product.discount > 0 && (
            <div className="absolute top-2.5 left-2.5 bg-gradient-to-r from-rose-500 to-amber-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-md shadow-rose-500/20">
              -{Math.round(((product.price - product.discount) / product.price) * 100)}% OFF
            </div>
          )}
        </div>
        <div className="p-4">
          <span className="text-[11px] font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full capitalize">
            {product.category || "Fabric"}
          </span>
          <h3 className="mt-2 font-bold text-stone-900 group-hover:text-primary-600 transition-colors line-clamp-1 text-sm">
            {product.name}
          </h3>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-base font-extrabold text-stone-900">
              &#8358;{effectivePrice.toLocaleString()}
            </span>
            {product.discount && product.discount > 0 && (
              <span className="text-xs text-stone-400 line-through">
                &#8358;{product.price.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="px-4 pb-4 flex items-center justify-between text-xs text-stone-500">
        <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/50">
          <Star className="h-3 w-3 fill-amber-400 text-amber-500" />
          <span className="font-bold text-amber-900 text-[11px]">
            {product.rating?.toFixed(1) || "4.9"}
          </span>
        </div>
        <span className="font-semibold text-primary-600 text-[11px] group-hover:translate-x-0.5 transition-transform">
          View details &rarr;
        </span>
      </div>
    </Link>
  );
}

