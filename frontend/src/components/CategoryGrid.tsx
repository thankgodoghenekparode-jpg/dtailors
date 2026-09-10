"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Shirt,
  Gem,
  Scissors,
  Palette,
  Layers,
  Ruler,
  Star,
  Sparkles,
  Circle,
  Square,
  Hexagon,
  Triangle,
} from "lucide-react";

const fabricCategories = [
  { label: "Ankara", icon: Shirt, href: "/vendors?category=ankara", color: "from-orange-500 to-amber-500" },
  { label: "Lace", icon: Gem, href: "/vendors?category=lace", color: "from-purple-500 to-pink-500" },
  { label: "Kente", icon: Layers, href: "/vendors?category=kente", color: "from-emerald-500 to-teal-500" },
  { label: "Aso Oke", icon: Star, href: "/vendors?category=aso-oke", color: "from-amber-500 to-orange-500" },
  { label: "Chiffon", icon: Sparkles, href: "/vendors?category=chiffon", color: "from-sky-500 to-blue-500" },
  { label: "Silk", icon: Hexagon, href: "/vendors?category=silk", color: "from-pink-500 to-rose-500" },
];

const accessoryCategories = [
  { label: "Needles & Pins", icon: Ruler, href: "/vendors?category=needles", color: "from-stone-500 to-slate-600" },
  { label: "Threads", icon: Circle, href: "/vendors?category=threads", color: "from-red-500 to-orange-500" },
  { label: "Buttons", icon: Square, href: "/vendors?category=buttons", color: "from-indigo-500 to-purple-500" },
  { label: "Zippers", icon: Triangle, href: "/vendors?category=zippers", color: "from-teal-500 to-cyan-500" },
  { label: "Ribbons", icon: Palette, href: "/vendors?category=ribbons", color: "from-pink-500 to-fuchsia-500" },
  { label: "Lining", icon: Layers, href: "/vendors?category=lining", color: "from-amber-500 to-orange-500" },
];

const serviceCategories = [
  { label: "Embroidery", icon: Sparkles, href: "/tailors?spec=embroidery", color: "from-violet-500 to-purple-600" },
  { label: "Beading", icon: Gem, href: "/tailors?spec=beading", color: "from-pink-500 to-rose-600" },
  { label: "Alterations", icon: Scissors, href: "/tailors?spec=alterations", color: "from-blue-500 to-indigo-600" },
  { label: "Pattern Making", icon: Ruler, href: "/tailors?spec=pattern-making", color: "from-emerald-500 to-teal-600" },
  { label: "Custom Design", icon: Palette, href: "/tailors?spec=design", color: "from-orange-500 to-amber-600" },
  { label: "Wedding Wear", icon: Shirt, href: "/tailors?spec=wedding", color: "from-rose-500 to-pink-600" },
];

function CategoryItem({
  label,
  icon: Icon,
  href,
  color,
  index = 0,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{
        duration: 0.4,
        delay: Math.min(index * 0.05, 0.3),
        type: "spring",
        stiffness: 260,
        damping: 20,
      }}
      whileHover={{ y: -4, scale: 1.05 }}
    >
      <Link href={href} className="group flex flex-col items-center gap-2.5 p-3.5 rounded-2xl bg-white border border-stone-200/70 hover:border-primary-300 hover:shadow-lg hover:shadow-primary-500/10 transition-all duration-300">
        <div
          className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md shadow-black/10 group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
        </div>
        <span className="text-xs sm:text-sm font-extrabold text-stone-800 text-center group-hover:text-primary-600 transition-colors truncate w-full">
          {label}
        </span>
      </Link>
    </motion.div>
  );
}

export default function CategoryGrid() {
  return (
    <section className="py-16 bg-stone-100/60 border-y border-stone-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        {/* Fabrics */}
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-black text-stone-900 tracking-tight">Fabric Categories</h2>
            <p className="text-sm text-stone-500 font-medium">Discover premium African fabrics for every fashion occasion</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
            {fabricCategories.map((cat, idx) => (
              <CategoryItem key={cat.label} index={idx} {...cat} />
            ))}
          </div>
        </div>

        {/* Accessories */}
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-black text-stone-900 tracking-tight">Tailoring Materials & Accessories</h2>
            <p className="text-sm text-stone-500 font-medium">Quality materials for sewing and fashion creation</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
            {accessoryCategories.map((cat, idx) => (
              <CategoryItem key={cat.label} index={idx} {...cat} />
            ))}
          </div>
        </div>

        {/* Services */}
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-black text-stone-900 tracking-tight">Tailoring Services</h2>
            <p className="text-sm text-stone-500 font-medium">Specialized craftsmanship from verified master tailors</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
            {serviceCategories.map((cat, idx) => (
              <CategoryItem key={cat.label} index={idx} {...cat} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
