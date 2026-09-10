"use client";

import React from "react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
}

export default function Logo({ className = "", size = "md", showText = true }: LogoProps) {
  const sizeMap = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  const textMap = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
  };

  return (
    <div className={`flex items-center gap-2.5 group cursor-pointer ${className}`}>
      {/* Icon Squircle Box */}
      <div className={`relative flex ${sizeMap[size]} items-center justify-center rounded-xl bg-gradient-to-tr from-primary-600 via-primary-500 to-accent-500 shadow-md shadow-primary-500/25 group-hover:scale-105 group-hover:shadow-primary-500/40 transition-all duration-300 overflow-hidden`}>
        {/* Vector SVG Icon */}
        <svg
          viewBox="0 0 512 512"
          className="w-3/4 h-3/4 text-white drop-shadow-md transition-transform duration-300 group-hover:rotate-6"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="scissorsGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="#fef08a" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>

          {/* Stylized Thread Arc */}
          <path
            d="M 190 120 C 330 120 380 185 380 256 C 380 327 330 392 190 392"
            stroke="#fef3c7"
            strokeWidth="24"
            strokeLinecap="round"
            strokeDasharray="20 12"
            opacity="0.9"
          />

          {/* Tailor Scissors */}
          <g transform="translate(0, 0)">
            <path d="M 175 140 L 320 340 A 32 32 0 1 1 270 375 L 175 245 Z" fill="url(#scissorsGold)" />
            <path d="M 337 140 L 192 340 A 32 32 0 1 0 242 375 L 337 245 Z" fill="url(#scissorsGold)" />

            <circle cx="180" cy="355" r="18" fill="#ea580c" />
            <circle cx="332" cy="355" r="18" fill="#ea580c" />

            <circle cx="256" cy="256" r="14" fill="#ffffff" stroke="#d97706" strokeWidth="4" />
            <circle cx="256" cy="256" r="5" fill="#7c2d12" />
          </g>
        </svg>
      </div>

      {/* Brand Name */}
      {showText && (
        <span className={`${textMap[size]} font-extrabold tracking-tight bg-gradient-to-r from-stone-950 via-stone-800 to-primary-900 bg-clip-text text-transparent`}>
          D Tailors
        </span>
      )}
    </div>
  );
}
