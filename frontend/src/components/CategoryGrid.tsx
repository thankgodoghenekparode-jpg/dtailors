import Link from "next/link";
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
  { label: "Ankara", icon: Shirt, href: "/vendors?category=ankara", color: "from-orange-400 to-red-400" },
  { label: "Lace", icon: Gem, href: "/vendors?category=lace", color: "from-purple-400 to-pink-400" },
  { label: "Kente", icon: Layers, href: "/vendors?category=kente", color: "from-green-400 to-emerald-400" },
  { label: "Aso Oke", icon: Star, href: "/vendors?category=aso-oke", color: "from-amber-400 to-yellow-400" },
  { label: "Chiffon", icon: Sparkles, href: "/vendors?category=chiffon", color: "from-blue-400 to-cyan-400" },
  { label: "Silk", icon: Hexagon, href: "/vendors?category=silk", color: "from-pink-400 to-rose-400" },
];

const accessoryCategories = [
  { label: "Needles & Pins", icon: Ruler, href: "/vendors?category=needles", color: "from-gray-400 to-slate-500" },
  { label: "Threads", icon: Circle, href: "/vendors?category=threads", color: "from-red-400 to-orange-400" },
  { label: "Buttons", icon: Square, href: "/vendors?category=buttons", color: "from-indigo-400 to-purple-400" },
  { label: "Zippers", icon: Triangle, href: "/vendors?category=zippers", color: "from-teal-400 to-cyan-400" },
  { label: "Ribbons", icon: Palette, href: "/vendors?category=ribbons", color: "from-pink-400 to-fuchsia-400" },
  { label: "Lining", icon: Layers, href: "/vendors?category=lining", color: "from-amber-400 to-orange-400" },
];

const serviceCategories = [
  { label: "Embroidery", icon: Sparkles, href: "/tailors?spec=embroidery", color: "from-violet-400 to-purple-500" },
  { label: "Beading", icon: Gem, href: "/tailors?spec=beading", color: "from-pink-400 to-rose-500" },
  { label: "Alterations", icon: Scissors, href: "/tailors?spec=alterations", color: "from-blue-400 to-indigo-500" },
  { label: "Pattern Making", icon: Ruler, href: "/tailors?spec=pattern-making", color: "from-green-400 to-emerald-500" },
  { label: "Custom Design", icon: Palette, href: "/tailors?spec=design", color: "from-orange-400 to-amber-500" },
  { label: "Wedding Wear", icon: Shirt, href: "/tailors?spec=wedding", color: "from-red-400 to-pink-500" },
];

function CategoryItem({
  label,
  icon: Icon,
  href,
  color,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
}) {
  return (
    <Link href={href} className="group">
      <div className="flex flex-col items-center gap-3 p-4 rounded-2xl hover:bg-white hover:shadow-md transition-all">
        <div
          className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}
        >
          <Icon className="w-7 h-7 text-white" />
        </div>
        <span className="text-sm font-medium text-gray-700 text-center group-hover:text-orange-600 transition-colors">
          {label}
        </span>
      </div>
    </Link>
  );
}

export default function CategoryGrid() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Fabrics */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Fabric Categories</h2>
          <p className="text-gray-500 mb-8">Discover premium African fabrics for every occasion</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-4">
            {fabricCategories.map((cat) => (
              <CategoryItem key={cat.label} {...cat} />
            ))}
          </div>
        </div>

        {/* Accessories */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Accessories</h2>
          <p className="text-gray-500 mb-8">Everything you need for your sewing projects</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-4">
            {accessoryCategories.map((cat) => (
              <CategoryItem key={cat.label} {...cat} />
            ))}
          </div>
        </div>

        {/* Services */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Tailoring Services</h2>
          <p className="text-gray-500 mb-8">Professional services from skilled tailors</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-4">
            {serviceCategories.map((cat) => (
              <CategoryItem key={cat.label} {...cat} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
