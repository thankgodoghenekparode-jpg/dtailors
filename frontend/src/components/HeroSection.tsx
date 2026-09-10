"use client";

import Link from "next/link";
import { Scissors, ShoppingBag, Briefcase, Sparkles, ArrowRight } from "lucide-react";
import { motion, Variants } from "framer-motion";
import SearchBar from "./SearchBar";

export default function HeroSection() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.05,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 35, scale: 0.95, filter: "blur(6px)" },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        stiffness: 220,
        damping: 20,
      },
    },
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-stone-950 via-orange-950 to-stone-900 text-white py-20 md:py-28">
      {/* Dynamic Animated Ambient Orbs */}
      <div className="absolute inset-0 opacity-30 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
            x: [0, 30, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-orange-500 via-amber-500 to-rose-600 rounded-full blur-[140px]"
        />
        <motion.div
          animate={{
            scale: [1.1, 0.9, 1.1],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 right-10 w-96 h-96 bg-primary-600/40 rounded-full blur-3xl"
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-3xl mx-auto space-y-6"
        >

          {/* Heading Writeup Assembly */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] text-white"
          >
            Connecting Tailors, Fashion Houses & Customers{" "}
            <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-amber-200 bg-clip-text text-transparent underline decoration-amber-400/40 decoration-wavy decoration-2">
              Everywhere
            </span>
          </motion.h1>

          {/* Subtitle Assembly */}
          <motion.p
            variants={itemVariants}
            className="text-base sm:text-xl text-stone-300 max-w-2xl mx-auto font-normal leading-relaxed"
          >
            Discover master tailors, shop authentic African fabrics, post & find fashion jobs, and grow your tailoring enterprise seamlessly.
          </motion.p>

          {/* Search Bar Assembly */}
          <motion.div variants={itemVariants} className="max-w-2xl mx-auto pt-2">
            <div className="p-2 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
              <SearchBar />
            </div>
          </motion.div>

          {/* Quick Action Buttons Assembly */}
          <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-3.5 pt-4">
            <Link
              href="/tailors"
              className="flex items-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.04] active:scale-[0.97] transition-all duration-200"
            >
              <Scissors className="w-5 h-5" />
              Find a Tailor
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/vendors"
              className="flex items-center gap-2.5 px-6 py-3.5 bg-white/10 backdrop-blur-md text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 hover:scale-[1.03] active:scale-[0.97] transition-all duration-200"
            >
              <ShoppingBag className="w-5 h-5 text-amber-300" />
              Shop Fabrics
            </Link>
            <Link
              href="/jobs"
              className="flex items-center gap-2.5 px-6 py-3.5 bg-white/10 backdrop-blur-md text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 hover:scale-[1.03] active:scale-[0.97] transition-all duration-200"
            >
              <Briefcase className="w-5 h-5 text-emerald-400" />
              Find a Job
            </Link>
          </motion.div>

          {/* Stat Cards Assembly */}
          <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4 max-w-lg mx-auto pt-8">
            <div className="p-3.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-amber-400/50 transition-colors">
              <div className="text-2xl sm:text-3xl font-extrabold text-white">2.5K+</div>
              <div className="text-xs text-stone-400 font-medium mt-0.5">Verified Tailors</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-amber-400/50 transition-colors">
              <div className="text-2xl sm:text-3xl font-extrabold text-white">1.2K+</div>
              <div className="text-xs text-stone-400 font-medium mt-0.5">Fabric Vendors</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-amber-400/50 transition-colors">
              <div className="text-2xl sm:text-3xl font-extrabold text-white">5K+</div>
              <div className="text-xs text-stone-400 font-medium mt-0.5">Jobs & Orders</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
