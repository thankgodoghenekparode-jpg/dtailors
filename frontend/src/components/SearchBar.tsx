"use client";

import { useState } from "react";
import { Search, MapPin, Filter } from "lucide-react";

type SearchType = "tailor" | "vendor" | "job";

interface SearchBarProps {
  type?: SearchType;
  onSearch?: (filters: { query: string; location: string; category: string }) => void;
  compact?: boolean;
}

const categoriesByType: Record<SearchType, string[]> = {
  tailor: ["All", "Ankara", "Lace", "Wedding", "Corporate", "Embroidery", "Beading", "Alterations"],
  vendor: ["All", "Fabrics", "Accessories", "Threads", "Buttons", "Zippers", "Lining"],
  job: ["All", "Full-time", "Part-time", "Contract", "Freelance"],
};

export default function SearchBar({ type = "tailor", onSearch, compact = false }: SearchBarProps) {
  const [searchType, setSearchType] = useState<SearchType>(type);
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("All");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.({ query, location, category });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {!compact && (
        <div className="flex gap-2 mb-3">
          {(["tailor", "vendor", "job"] as SearchType[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setSearchType(t);
                setCategory("All");
              }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                searchType === t
                  ? "bg-orange-500 text-white"
                  : "bg-white/80 text-gray-700 hover:bg-white"
              }`}
            >
              {t === "tailor" ? "Tailors" : t === "vendor" ? "Vendors" : "Jobs"}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2 bg-white/90 backdrop-blur-sm rounded-2xl p-2 shadow-lg">
        <div className="flex-1 flex items-center gap-2 px-3">
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder={
              searchType === "tailor"
                ? "Search tailors by name or specialization..."
                : searchType === "vendor"
                ? "Search vendors or fabrics..."
                : "Search jobs by title or company..."
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent"
          />
        </div>

        <div className="hidden sm:flex items-center w-px bg-gray-200" />

        <div className="flex items-center gap-2 px-3">
          <MapPin className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full sm:w-36 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent"
          />
        </div>

        <div className="hidden sm:flex items-center w-px bg-gray-200" />

        <div className="flex items-center gap-2 px-3">
          <Filter className="w-5 h-5 text-gray-400 shrink-0" />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="py-2.5 text-sm text-gray-900 focus:outline-none bg-transparent cursor-pointer"
          >
            {categoriesByType[searchType].map((cat) => (
              <option key={cat} value={cat}>
                {cat === "All" ? `All ${searchType === "job" ? "Types" : "Categories"}` : cat}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-medium rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all shadow-sm shrink-0"
        >
          Search
        </button>
      </div>
    </form>
  );
}
