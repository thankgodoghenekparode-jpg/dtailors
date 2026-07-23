"use client";

import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  count?: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
}

export default function StarRating({ rating, count, size = "sm", showCount = true }: StarRatingProps) {
  const sizeMap = { sm: "h-3.5 w-3.5", md: "h-4 w-4", lg: "h-5 w-5" };
  const textMap = { sm: "text-xs", md: "text-sm", lg: "text-base" };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeMap[size]} ${
            star <= Math.round(rating)
              ? "fill-accent-400 text-accent-400"
              : "fill-gray-200 text-gray-200"
          }`}
        />
      ))}
      {showCount && count !== undefined && (
        <span className={`${textMap[size]} text-gray-500 ml-1`}>({count})</span>
      )}
    </div>
  );
}
