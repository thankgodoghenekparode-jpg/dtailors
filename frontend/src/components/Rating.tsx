"use client";

import { useState } from "react";
import { Star } from "lucide-react";

interface RatingProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onChange?: (value: number) => void;
}

const sizes = {
  sm: "w-3.5 h-3.5",
  md: "w-5 h-5",
  lg: "w-6 h-6",
};

export default function Rating({
  value,
  max = 5,
  size = "md",
  interactive = false,
  onChange,
}: RatingProps) {
  const [hoverValue, setHoverValue] = useState(0);

  const displayValue = hoverValue || value;

  return (
    <div className="flex items-center gap-0.5">
      {[...Array(max)].map((_, i) => {
        const starIndex = i + 1;
        const isFilled = starIndex <= Math.round(displayValue);

        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(starIndex)}
            onMouseEnter={() => interactive && setHoverValue(starIndex)}
            onMouseLeave={() => interactive && setHoverValue(0)}
            className={`${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"} transition-transform`}
          >
            <Star
              className={`${sizes[size]} ${
                isFilled
                  ? "text-amber-400 fill-amber-400"
                  : "text-gray-200 fill-gray-200"
              } transition-colors`}
            />
          </button>
        );
      })}
    </div>
  );
}
