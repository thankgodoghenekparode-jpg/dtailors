import Link from "next/link";
import { Star } from "lucide-react";
import { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link
      href={`/vendors/${product.vendorId}/products/${product.id}`}
      className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
    >
      <div className="aspect-square bg-gray-100 relative overflow-hidden">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-gray-400">
            <span className="text-4xl">📦</span>
          </div>
        )}
        {product.discount && product.discount > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            -{Math.round(((product.price - product.discount) / product.price) * 100)}%
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-1">
          {product.name}
        </h3>
        <p className="text-xs text-gray-500 mt-1 capitalize">{product.category}</p>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-lg font-bold text-primary-600">
            &#8358;{(product.discount && product.discount > 0 ? product.discount : product.price).toLocaleString()}
          </span>
          {product.discount && product.discount > 0 && (
            <span className="text-sm text-gray-400 line-through">
              &#8358;{product.price.toLocaleString()}
            </span>
          )}
        </div>
        <div className="mt-2 flex items-center gap-1">
          <Star className="h-3.5 w-3.5 fill-accent-400 text-accent-400" />
          <span className="text-xs text-gray-600">
            {product.rating?.toFixed(1) || "0.0"} ({product.reviewCount || 0})
          </span>
        </div>
      </div>
    </Link>
  );
}
