"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  TrendingUp,
  Sparkles,
  Play,
  Lock,
  Menu,
  X,
  PiggyBank,
  Target,
  Sliders,
  Rocket,
  ArrowUp,
  Moon,
  Sun,
} from "lucide-react";

// Mock client avatars for social proof
const avatars = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80",
];

// Features lists for the interactive demo switcher
type FeatureKey = "transactions" | "receipts" | "notes";

interface DetailFeature {
  id: FeatureKey;
  title: string;
  shortDesc: string;
  longDesc: string;
}

const detailedFeatures: DetailFeature[] = [
  {
    id: "transactions",
    title: "Transactions",
    shortDesc: "Add, filter, and archive daily activity.",
    longDesc: "Log income and expenses with titles, categories, dates, and notes. Use search, category filters, and archive views to keep your ledger tidy.",
  },
  {
    id: "receipts",
    title: "Receipts",
    shortDesc: "Store receipt files and upload to Drive queue.",
    longDesc: "Upload receipt images or PDFs, keep them linked to your workspace, and queue files for Drive upload when needed.",
  },
  {
    id: "notes",
    title: "Notes",
    shortDesc: "Track decisions and updates next to your ledger.",
    longDesc: "Create and edit notes, search quickly, and export everything when you need a paper trail or a shareable summary.",
  },
];

interface TeamMember {
  id: "deon" | "hazel";
  name: string;
  role: string;
  image: string;
  gif: string;
  bio: string;
  tags: string[];
  socials: {
    github: string;
    linkedin: string;
  };
}

const teamMembers: TeamMember[] = [
  {
   id: "deon",
  name: "Deon",
  role: "Frontend Engineering & Product Development",
  image: "/deon1.png",
  gif: "/deon4.gif",
  bio: "Contributed to the application's frontend architecture, user experience, and core product workflows. Built and refined major interface components, transaction management experiences, navigation, routing, exports, and interactive UI elements while collaborating on product and design decisions throughout development.",
  tags: ["Frontend", "Product", "UI/UX", "Routing"],
    socials: {
      github: "https://github.com/deonraj",
      linkedin: "https://www.linkedin.com/in/deon-raj-50b495330/",
    }
  },
  {
  id: "hazel",
  name: "Hazel",
  role: "Platform Engineering & Application Systems",
  image: "/hazel_image.jpeg",
  gif: "/hazel1.gif",
  bio: "Contributed to authentication, Firebase integration, data management, application stability, and user-facing experiences. Worked on platform functionality, routing improvements, educational content features, and design contributions that helped shape the overall application experience.",
  tags: ["Firebase", "Authentication", "Data", "Platform"],
    socials: {
      github: "https://github.com/thecamouflagedgeek",
      linkedin: "https://www.linkedin.com/in/hazel-sequeira-57634634a/",
    }
  }
];

export default function LandingPage() {
  const dayOrder = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
  type DayKey = (typeof dayOrder)[number];

  const dayBars: { day: DayKey; height: string }[] = [
    { day: "Mon", height: "45%" },
    { day: "Tue", height: "75%" },
    { day: "Wed", height: "55%" },
    { day: "Thu", height: "80%" },
    { day: "Fri", height: "40%" },
    { day: "Sat", height: "95%" },
    { day: "Sun", height: "50%" },
  ];
  const [activeFeature, setActiveFeature] = useState<FeatureKey>("transactions");
  const [activeMember, setActiveMember] = useState<"deon" | "hazel">("deon");
  const [activeDay, setActiveDay] = useState<DayKey>(
    () => dayOrder[new Date().getDay()]
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showDemoVideo, setShowDemoVideo] = useState(false);
  const [isThemeReady, setIsThemeReady] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  // Parallax / Scroll progress
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  useEffect(() => {
    setIsThemeReady(true);
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveMember((prev) => (prev === "deon" ? "hazel" : "deon"));
    }, 6000);

    return () => window.clearInterval(intervalId);
  }, []);

  // Scroll to Top helper
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleTheme = () => {
    if (!isThemeReady) return;
    const nextTheme = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  const deonGifSettings = {
    width: "900px",
    height: "100%",
    opacityLight: 0.85,
    opacityDark: 0.65,
    radialLight: "radial-gradient(circle, transparent 45%, #eff1e9 85%)",
    radialDark: "radial-gradient(circle, transparent 75%, #050505 98%)",
  };

  const hazelGifSettings = {
    width: "800px",
    height: "100%",
    opacityLight: 0.85,
    opacityDark: 0.65,
    radialLight: "radial-gradient(circle, transparent 45%, #eff1e9 85%)",
    radialDark: "radial-gradient(circle, transparent 75%, #050505 98%)",
  };

  const activeGifSettings = activeMember === "deon" ? deonGifSettings : hazelGifSettings;

  return (
    <div className="min-h-screen grid-bg-pattern text-[#0c0d0e] dark:text-white selection:bg-[#ccff00] selection:text-black font-sans relative overflow-x-hidden">
      {/* BACKGROUND GLOWS */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#ccff00]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[600px] h-[600px] bg-[#ccff00]/3 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-[#ccff00]/4 rounded-full blur-[140px] pointer-events-none" />

      {/* HEADER / NAVIGATION */}
      <header className="fixed top-[4dvw] left-4 right-4 z-50 rounded-3xl filter backdrop-filter-[url('#liquidFilter')] border border-black/10 dark:border-white/10 shadow-sm px-6 md:px-12 py-5 transition-all duration-300">
        <div className="absolute inset-0 w-full h-full bg-white/25 -z-10 rounded-3xl" />
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full border border-[#ccff00]/30 flex items-center justify-center bg-black/40 group-hover:border-[#ccff00] transition-all duration-300">
              <div className="w-7 h-7 rounded-full border border-dashed border-[#ccff00]/60 flex items-center justify-center">
                <div className="w-3.5 h-3.5 rounded-full bg-[#ccff00] shadow-[0_0_12px_#ccff00]" />
              </div>
            </div>
            <span className="font-black text-xl tracking-tight text-[#0c0d0e] dark:text-white group-hover:text-[#ccff00] transition-colors duration-300">
              CTRL Fund
            </span>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-black/60 dark:text-white/60 hover:text-[#ccff00] font-semibold transition-colors duration-200">
              Features
            </a>
            <a href="#methodology" className="text-sm text-black/60 dark:text-white/60 hover:text-[#ccff00] font-semibold transition-colors duration-200">
              Methodology
            </a>
            <a href="#how-it-works" className="text-sm text-black/60 dark:text-white/60 hover:text-[#ccff00] font-semibold transition-colors duration-200">
              How It Works
            </a>
            <a href="#tools" className="text-sm text-black/60 dark:text-white/60 hover:text-[#ccff00] font-semibold transition-colors duration-200">
              Tools
            </a>
            <a href="#about" className="text-sm text-black/60 dark:text-white/60 hover:text-[#ccff00] font-semibold transition-colors duration-200">
              About us
            </a>
          </nav>

          {/* Right Header Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Link href="/login">
              <span className="text-sm font-semibold text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white transition-colors py-2.5 px-4 cursor-pointer">
                Log in
              </span>
            </Link>
            <button
              type="button"
              onClick={toggleTheme}
              className="w-10 h-10 rounded-full border border-black/10 dark:border-white/10 bg-white/70 dark:bg-black/40 text-black dark:text-white flex items-center justify-center hover:border-[#ccff00]/60 transition-colors"
              aria-label="Toggle theme"
            >
              {resolvedTheme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <Link href="/login" className="md:hidden">
            <span className="text-sm font-semibold text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white transition-colors py-2.5 px-4 cursor-pointer">
              Log in
            </span>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-black/70 dark:text-white/80 hover:text-black dark:hover:text-white focus:outline-none"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* MOBILE NAVIGATION OVERLAY */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-[80px] left-0 right-0 bg-white dark:bg-[#0c0d10] border-b border-black/5 dark:border-white/5 z-40 px-6 py-8 flex flex-col gap-6 md:hidden shadow-2xl"
          >
            <nav className="flex flex-col gap-4">
              <a
                href="#features"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-lg font-bold text-black/70 dark:text-white/70 hover:text-[#ccff00]"
              >
                Features
              </a>
              <a
                href="#methodology"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-lg font-bold text-black/70 dark:text-white/70 hover:text-[#ccff00]"
              >
                Methodology
              </a>
              <a
                href="#how-it-works"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-lg font-bold text-black/70 dark:text-white/70 hover:text-[#ccff00]"
              >
                How It Works
              </a>
              <a
                href="#tools"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-lg font-bold text-black/70 dark:text-white/70 hover:text-[#ccff00]"
              >
                Tools
              </a>
            </nav>
            <div className="h-px bg-black/5 dark:bg-white/5 my-2" />
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={toggleTheme}
                className="w-full text-center border border-black/10 dark:border-white/10 hover:border-[#ccff00]/60 py-3 rounded-full text-sm font-bold text-black dark:text-white"
              >
                {resolvedTheme === "dark" ? "Switch to Light" : "Switch to Dark"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HERO SECTION */}
      <section className="relative max-w-7xl mx-auto px-6 md:px-12 pt-36 md:pt-48 pb-20 md:pb-28">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">

          {/* Left Hero Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 flex flex-col items-start"
          >


            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.05] text-[#0c0d0e] dark:text-white">
              Stop tracking. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-black via-black to-[#ccff00]/90 dark:from-white dark:via-white">
                Start accumulating.
              </span>
            </h1>

            <p className="mt-6 text-base md:text-lg text-black/60 dark:text-white/60 font-medium leading-relaxed max-w-xl">
              Most apps just tell you where your money went. CtrlFund helps you keep it.
              The first expense tracker powered by behavioral psychology and wealth-building algorithms.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link href="/login">
                <button className="bg-[#ccff00] text-black hover:bg-white hover:shadow-[0_0_30px_rgba(204,255,0,0.4)] hover:scale-105 active:scale-95 transition-all duration-300 font-bold text-sm py-4 px-8 rounded-full shadow-[0_4px_25px_rgba(204,255,0,0.25)] flex items-center justify-center gap-2">
                  Start saving free <ArrowRight className="w-4 h-4 stroke-[3]" />
                </button>
              </Link>
            </div>

            {/* Social Trust Proof */}
            <div className="mt-12 flex items-center gap-4">
              <div className="flex -space-x-3.5">
                {avatars.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`User avatar ${i + 1}`}
                    className="w-10 h-10 rounded-full border-2 border-[#050505] object-cover filter grayscale hover:grayscale-0 transition-all duration-300 cursor-pointer"
                  />
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-[#ccff00] font-black text-sm">★★★★★</span>
                  <span className="text-[#0c0d0e] dark:text-white font-bold text-sm">4.9/5</span>
                </div>
                <p className="text-xs text-black/40 dark:text-white/40 font-semibold mt-0.5">
                  Trusted by 1000+ users worldwide
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Hero Mockup Dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 relative w-full flex justify-center"
          >
            {/* Ambient Background Circle Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#ccff00]/10 to-transparent blur-[80px] rounded-[40px] pointer-events-none" />

            {/* Floating Card Container */}
            <div className="relative w-full max-w-[460px] bg-white dark:bg-[#0c0d10] border border-black/5 dark:border-white/10 rounded-[32px] p-6 shadow-[0_30px_70px_rgba(0,0,0,0.15)] dark:shadow-[0_30px_70px_rgba(0,0,0,0.8)] overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#ccff00]/10 rounded-full blur-2xl pointer-events-none" />

              {/* Mockup Card Header */}
              <div className="flex items-center justify-between pb-6 border-b border-black/5 dark:border-white/5">
                <div>
                  <p className="text-[10px] text-black/45 dark:text-white/45 font-bold uppercase tracking-wider">Total Savings</p>
                  <h2 className="text-3xl font-black text-[#0c0d0e] dark:text-white mt-1">Rs. 32,000</h2>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/25 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-[#ccff00]" />
                </div>
              </div>

              {/* Mockup Animated Bar Chart */}
              <div className="pt-8 pb-4">
                <div className="flex justify-between items-end h-[160px] gap-2.5 px-2">
                  {dayBars.map((bar, i) => {
                    const isActive = bar.day === activeDay;

                    return (
                      <button
                        key={bar.day}
                        type="button"
                        onClick={() => setActiveDay(bar.day)}
                        aria-pressed={isActive}
                        className="flex flex-col items-center flex-1 group/bar cursor-pointer bg-transparent p-0 border-0"
                      >
                        <div className="w-full relative bg-black/5 dark:bg-white/5 rounded-t-lg overflow-hidden h-[120px] flex items-end">
                          {/* Animated Fill */}
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: bar.height }}
                            transition={{ delay: 0.3 + i * 0.1, duration: 0.8, ease: "easeOut" }}
                            className={`w-full rounded-t-md transition-all duration-300 ${isActive
                              ? "bg-[#ccff00] shadow-[0_0_15px_rgba(204,255,0,0.6)]"
                              : "bg-white/15 group-hover/bar:bg-white/30"
                              }`}
                          />
                        </div>
                        <span
                          className={`text-[10px] font-bold mt-2.5 transition-colors ${isActive
                            ? "text-[#ccff00]"
                            : "text-black/40 dark:text-white/40 group-hover/bar:text-black/80 dark:group-hover/bar:text-white/80"
                            }`}
                        >
                          {bar.day}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Auto-Save Popover Card */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.6 }}
                className="mt-4 bg-[#f5f5f0] dark:bg-[#14161d] border border-black/5 dark:border-white/5 rounded-2xl p-4 flex items-center justify-between hover:border-[#ccff00]/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#ccff00]/10 flex items-center justify-center relative">
                    <PiggyBank className="w-5.5 h-5.5 text-[#82a400] dark:text-[#ccff00]" />
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#ccff00] animate-ping" />
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#ccff00]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#0c0d0e] dark:text-white">Auto-Save</h4>
                    <p className="text-[10px] text-black/40 dark:text-white/40 font-semibold mt-0.5">Smart Rule Triggered</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black text-[#82a400] dark:text-[#ccff00]">+Rs. 1,400</span>
                </div>
              </motion.div>

            </div>
          </motion.div>
        </div>
      </section>


      {/* CORE FEATURES GRID - "Spend Smarter, Not Less" */}
      <section id="features" className="max-w-7xl mx-auto px-6 md:px-12 py-24 md:py-32 scroll-mt-20">
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
          <p className="text-[11px] uppercase font-bold tracking-[0.3em] text-[#82a400] dark:text-[#ccff00] mb-4">
            Features
          </p>
          <h2 className="text-3xl md:text-5xl font-black text-[#0c0d0e] dark:text-white tracking-tight leading-tight">
            Built to help you spend smarter, not less.
          </h2>
          <p className="mt-6 text-black/60 dark:text-white/60 text-base font-semibold leading-relaxed">
            CtrlFund helps you log expenses, sort by category, and review trends in one place.
            Keep receipts and notes together, then export summaries when you need them.
          </p>
        </div>

        {/* 3 Grid Cards */}
        <div className="grid md:grid-cols-3 gap-8">

          {/* CARD 1: Transaction Tracking */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="bg-white dark:bg-[#0c0d10] border border-black/5 dark:border-white/5 rounded-3xl p-6 flex flex-col justify-between hover:border-black/10 dark:hover:border-white/10 transition-all group"
          >
            <div>
              <div className="w-11 h-11 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center mb-6 group-hover:bg-[#ccff00]/10 transition-colors">
                <Sliders className="w-5 h-5 text-black/70 dark:text-white group-hover:text-[#ccff00] transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-[#0c0d0e] dark:text-white mb-3">Transaction Tracking</h3>
              <p className="text-black/60 dark:text-white/60 text-sm font-semibold leading-relaxed mb-8">
                Add income and expenses, tag categories, and keep active or archived views clean and easy to scan.
              </p>
            </div>

            {/* Category Progress Bars Preview */}
            <div className="bg-[#f5f5f0] dark:bg-[#121318]/60 border border-black/5 dark:border-white/5 rounded-2xl p-4 space-y-3.5">
              <p className="text-[9px] font-bold text-black/40 dark:text-white/40 uppercase tracking-wider mb-1">Top Categories (30 Days)</p>
              {[
                { name: "Dining & Food", amount: "Rs. 2,500", progress: "w-[80%]" },
                { name: "Transport", amount: "Rs. 1,000", progress: "w-[40%]" },
                { name: "Entertainment", amount: "Rs. 1,000", progress: "w-[30%]" },
                { name: "Others", amount: "Rs. 800", progress: "w-[20%]" },
              ].map((cat, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-black/70 dark:text-white/70">{cat.name}</span>
                    <span className="text-[#0c0d0e] dark:text-white">{cat.amount}</span>
                  </div>
                  <div className="w-full h-1.5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: cat.progress.replace("w-[", "").replace("]", "") }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + i * 0.1, duration: 0.8 }}
                      className="h-full bg-[#ccff00] rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* CARD 2: Dashboard Insights (with Circular Ring) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-white dark:bg-[#0c0d10] border border-black/5 dark:border-white/5 rounded-3xl p-6 flex flex-col justify-between hover:border-black/10 dark:hover:border-white/10 transition-all group"
          >
            <div>
              <div className="w-11 h-11 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center mb-6 group-hover:bg-[#ccff00]/10 transition-colors">
                <Target className="w-5 h-5 text-black/70 dark:text-white group-hover:text-[#ccff00] transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-[#0c0d0e] dark:text-white mb-3">Dashboard Insights</h3>
              <p className="text-black/60 dark:text-white/60 text-sm font-semibold leading-relaxed mb-8">
                See monthly trends and category totals based on your logged transactions.
              </p>
            </div>

            {/* Circular Gauge Preview */}
            <div className="bg-[#f5f5f0] dark:bg-[#121318]/60 border border-black/5 dark:border-white/5 rounded-2xl p-4 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-[9px] font-bold text-black/40 dark:text-white/40 uppercase tracking-wider">Monthly Snapshot</p>
                <h4 className="text-base font-extrabold text-[#0c0d0e] dark:text-white">Category Totals</h4>
                <p className="text-[11px] text-black/50 dark:text-white/50 font-semibold mt-0.5">Based on logged activity</p>
              </div>
              <div className="relative w-20 h-20 flex items-center justify-center">
                {/* SVG Circular Ring */}
                <svg className="w-full h-full transform -rotate-90">
                  {/* Track circle */}
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    stroke="rgba(0, 0, 0, 0.06)"
                    strokeWidth="5"
                    fill="transparent"
                  />
                  {/* Glowing progress circle */}
                  <motion.circle
                    cx="40"
                    cy="40"
                    r="32"
                    stroke="#ccff00"
                    strokeWidth="5.5"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 32}
                    initial={{ strokeDashoffset: 2 * Math.PI * 32 }}
                    whileInView={{ strokeDashoffset: 2 * Math.PI * 32 * (1 - 0.75) }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 1.2, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-[11px] font-black text-[#0c0d0e] dark:text-white">Monthly</span>
                  <span className="text-[7px] text-[#ccff00] font-bold uppercase tracking-wider">view</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* CARD 3: Notes & Receipts */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white dark:bg-[#0c0d10] border border-black/5 dark:border-white/5 rounded-3xl p-6 flex flex-col justify-between hover:border-black/10 dark:hover:border-white/10 transition-all group"
          >
            <div>
              <div className="w-11 h-11 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center mb-6 group-hover:bg-[#ccff00]/10 transition-colors">
                <PiggyBank className="w-5 h-5 text-black/70 dark:text-white group-hover:text-[#ccff00] transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-[#0c0d0e] dark:text-white mb-3">Notes & Receipts</h3>
              <p className="text-black/60 dark:text-white/60 text-sm font-semibold leading-relaxed mb-8">
                Keep notes with search and archives, and store receipts as images or PDFs alongside your records.
              </p>
            </div>

            {/* Spline Area Chart Preview */}
            <div className="bg-[#f5f5f0] dark:bg-[#121318]/60 border border-black/5 dark:border-white/5 rounded-2xl p-4 overflow-hidden">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[9px] font-bold text-black/40 dark:text-white/40 uppercase tracking-wider">Activity Curve</span>
                <span className="text-[10px] text-[#ccff00] font-black">PDF-ready exports</span>
              </div>

              {/* Custom SVG Curve */}
              <div className="relative w-full h-[70px]">
                <svg className="w-full h-full" viewBox="0 0 200 80" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="gradient-area" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ccff00" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#ccff00" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Gradient Area under path */}
                  <motion.path
                    d="M0,80 Q25,60 50,65 T100,40 T150,30 T200,10 L200,80 L0,80 Z"
                    fill="url(#gradient-area)"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                  />

                  {/* Glowing Stroke Curve */}
                  <motion.path
                    d="M0,80 Q25,60 50,65 T100,40 T150,30 T200,10"
                    fill="none"
                    stroke="#ccff00"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 1.2, ease: "easeOut" }}
                  />

                  {/* Glowing Pulse Dot at the end of the curve */}
                  <motion.circle
                    cx="200"
                    cy="10"
                    r="4"
                    fill="#ccff00"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1.5 }}
                  />
                </svg>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* METHODOLOGY SECTION */}
      <section id="methodology" className="border-t border-black/5 dark:border-white/5 py-24 md:py-32 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid lg:grid-cols-12 gap-12 items-center">

            {/* Left Graphics panel */}
            <div className="lg:col-span-5 relative w-full flex justify-center order-2 lg:order-1">
              <div className="absolute inset-0 bg-[#ccff00]/5 blur-[100px] rounded-full pointer-events-none" />
              <div className="relative w-full max-w-[380px] bg-white dark:bg-[#0c0d10] border border-black/5 dark:border-white/5 rounded-[32px] p-6 space-y-6">

                {/* Visual indicators */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ccff00]" />
                    <span className="text-xs font-bold text-black/70 dark:text-white/80">Workspace Toolkit</span>
                  </div>
                  <span className="text-[10px] font-bold text-black/35 dark:text-white/35 bg-black/5 dark:bg-white/5 px-2.5 py-1 rounded-full">READY</span>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-2xl flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#ccff00]/10 flex items-center justify-center flex-shrink-0 text-[#ccff00] font-bold text-sm">
                      1
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#0c0d0e] dark:text-white">Transactions + Filters</h4>
                      <p className="text-[10px] text-black/50 dark:text-white/50 font-semibold mt-0.5 leading-relaxed">
                        Log income and expenses, then search, filter, and archive to keep your ledger organized.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-2xl flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#ccff00]/10 flex items-center justify-center flex-shrink-0 text-[#ccff00] font-bold text-sm">
                      2
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#0c0d0e] dark:text-white">Notes + Receipts</h4>
                      <p className="text-[10px] text-black/50 dark:text-white/50 font-semibold mt-0.5 leading-relaxed">
                        Keep reference notes, store receipt files, and queue Drive uploads when needed.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Micro chart */}
                <div className="pt-2 flex justify-between items-center text-xs border-t border-black/5 dark:border-white/5">
                  <span className="text-black/40 dark:text-white/40 font-bold">Export formats</span>
                  <span className="text-[#82a400] dark:text-[#ccff00] font-black">CSV · Excel · PDF</span>
                </div>

              </div>
            </div>

            {/* Right text panel */}
            <div className="lg:col-span-7 space-y-6 order-1 lg:order-2">
              <p className="text-[11px] uppercase font-bold tracking-[0.3em] text-[#82a400] dark:text-[#ccff00]">
                Methodology
              </p>
              <h2 className="text-3xl md:text-5xl font-black text-[#0c0d0e] dark:text-white tracking-tight leading-tight">
                Designed for clear tracking and team visibility.
              </h2>
              <p className="text-black/60 dark:text-white/60 text-base font-semibold leading-relaxed">
                CtrlFund focuses on the essentials: fast transaction entry, receipts, notes, and clear charts.
                Role-based access keeps workspaces clean and organized without extra complexity.
              </p>
              <div className="pt-4 grid grid-cols-2 gap-6">
                <div className="space-y-1 border-l-2 border-[#82a400] dark:border-[#ccff00] pl-4">
                  <h3 className="text-3xl font-black text-[#0c0d0e] dark:text-white">19</h3>
                  <p className="text-[11px] text-black/40 dark:text-white/40 font-bold uppercase tracking-wider">Currencies supported</p>
                </div>
                <div className="space-y-1 border-l-2 border-[#82a400] dark:border-[#ccff00] pl-4">
                  <h3 className="text-3xl font-black text-[#0c0d0e] dark:text-white">3</h3>
                  <p className="text-[11px] text-black/40 dark:text-white/40 font-bold uppercase tracking-wider">Export formats</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* HOW IT WORKS / 3 STEPS SECTION */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-6 md:px-12 py-24 md:py-32 scroll-mt-20">
        <div className="text-center max-w-2xl mx-auto mb-20 md:mb-28">
          <p className="text-[11px] uppercase font-bold tracking-[0.3em] text-[#82a400] dark:text-[#ccff00] mb-4">
            Setup Process
          </p>
          <h2 className="text-3xl md:text-5xl font-black text-[#0c0d0e] dark:text-white tracking-tight leading-tight">
            Financial clarity in 3 steps
          </h2>
          <p className="mt-4 text-black/60 dark:text-white/60 text-sm font-semibold">
            Sign in, record transactions, and review everything from your dashboard.
          </p>
        </div>

        {/* 3 Step Timeline Container */}
        <div className="relative">

          {/* Connector Line (Desktop) */}
          <div className="absolute top-1/4 left-1/6 right-1/6 h-[2px] bg-black/5 dark:bg-white/5 z-0 hidden md:block">
            <div className="w-1/2 h-full bg-gradient-to-r from-[#ccff00] to-white/5 animate-pulse" />
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative z-10">

            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-col items-center text-center group"
            >
              <div className="w-16 h-16 rounded-full bg-white border border-black/10 dark:bg-[#121318] dark:border-white/10 flex items-center justify-center mb-6 relative group-hover:border-[#ccff00] transition-colors duration-300">
                <Lock className="w-6 h-6 text-black/70 dark:text-white group-hover:text-[#ccff00] transition-colors" />
                <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#ccff00] text-black font-black text-xs flex items-center justify-center">
                  1
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#0c0d0e] dark:text-white mb-3">1. Sign In</h3>
              <p className="text-black/60 dark:text-white/60 text-xs font-semibold leading-relaxed max-w-xs">
                Create an account or log in with Google to access your workspace.
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="flex flex-col items-center text-center group"
            >
              <div className="w-16 h-16 rounded-full bg-white border border-black/10 dark:bg-[#121318] dark:border-white/10 flex items-center justify-center mb-6 relative group-hover:border-[#ccff00] transition-colors duration-300">
                <Sliders className="w-6 h-6 text-black/70 dark:text-white group-hover:text-[#ccff00] transition-colors" />
                <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#ccff00] text-black font-black text-xs flex items-center justify-center">
                  2
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#0c0d0e] dark:text-white mb-3">2. Record</h3>
              <p className="text-black/60 dark:text-white/60 text-xs font-semibold leading-relaxed max-w-xs">
                Add transactions with categories, dates, and notes. Upload receipts and keep everything organized.
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col items-center text-center group"
            >
              <div className="w-16 h-16 rounded-full bg-white border border-black/10 dark:bg-[#121318] dark:border-white/10 flex items-center justify-center mb-6 relative group-hover:border-[#ccff00] transition-colors duration-300">
                <Rocket className="w-6 h-6 text-black/70 dark:text-white group-hover:text-[#ccff00] transition-colors" />
                <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#ccff00] text-black font-black text-xs flex items-center justify-center">
                  3
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#0c0d0e] dark:text-white mb-3">3. Review</h3>
              <p className="text-black/60 dark:text-white/60 text-xs font-semibold leading-relaxed max-w-xs">
                Use the dashboard charts, exports, and notes to share summaries or revisit activity anytime.
              </p>
            </motion.div>

          </div>
        </div>
      </section>

      {/* DYNAMIC FEATURE SWITCHER ("Tools built for wealth") */}
      <section id="tools" className="border-t border-black/5 dark:border-white/5 py-24 md:py-32 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12">

          <div className="mb-16">
            <p className="text-[11px] uppercase font-bold tracking-[0.3em] text-[#82a400] dark:text-[#ccff00] mb-4">
              Workspace Tools
            </p>
            <h2 className="text-3xl md:text-5xl font-black text-[#0c0d0e] dark:text-white tracking-tight">
              Tools built for everyday tracking.
            </h2>
          </div>

          <div className="grid lg:grid-cols-12 gap-12 items-center">

            {/* Left Switcher Options */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              {detailedFeatures.map((feat) => {
                const isActive = activeFeature === feat.id;
                return (
                  <button
                    key={feat.id}
                    onClick={() => setActiveFeature(feat.id)}
                    className={`text-left p-6 rounded-2xl border transition-all duration-300 ${isActive
                      ? "bg-white dark:bg-[#0c0d10] border-black/10 dark:border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
                      : "bg-transparent border-transparent opacity-60 hover:opacity-85"
                      }`}
                  >
                    <h3 className={`text-lg font-bold transition-colors ${isActive ? "text-[#82a400] dark:text-[#ccff00]" : "text-black dark:text-white"}`}>
                      {feat.title}
                    </h3>
                    <p className="text-xs text-black/60 dark:text-white/60 font-semibold mt-2 leading-relaxed">
                      {feat.shortDesc}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Right Interactive Preview Panel */}
            <div className="lg:col-span-7 bg-white dark:bg-[#0c0d10] border border-black/5 dark:border-white/5 rounded-[32px] p-8 shadow-2xl min-h-[300px] flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#ccff00]/5 rounded-full blur-3xl pointer-events-none" />

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeature}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  {/* Detailed Description */}
                  <div>
                    <span className="text-[9px] uppercase font-bold tracking-wider text-[#82a400] dark:text-[#ccff00] bg-[#82a400]/10 dark:bg-[#ccff00]/10 px-3 py-1.5 rounded-full">
                      {detailedFeatures.find(f => f.id === activeFeature)?.title} Module
                    </span>
                    <p className="text-black/60 dark:text-white/60 text-sm font-semibold leading-relaxed mt-4">
                      {detailedFeatures.find(f => f.id === activeFeature)?.longDesc}
                    </p>
                  </div>

                  {/* UI Preview Area based on active index */}
                  <div className="border border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01] rounded-2xl p-5">
                    {activeFeature === "transactions" && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-xs font-black text-[#0c0d0e] dark:text-white">Recent Transactions</h4>
                            <p className="text-[10px] text-black/40 dark:text-white/40 font-semibold mt-0.5">Income and expense entries</p>
                          </div>
                          <span className="text-[10px] font-bold text-[#82a400] dark:text-[#ccff00] bg-[#82a400]/10 dark:bg-[#ccff00]/10 px-2 py-0.5 rounded">
                            Active View
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[11px] font-bold">
                            <span className="text-black/50 dark:text-white/50">Groceries</span>
                            <span className="text-[#0c0d0e] dark:text-white">Rs. 2,400</span>
                          </div>
                          <div className="w-full h-2 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full w-[80%] bg-[#ccff00] rounded-full shadow-[0_0_8px_#ccff00]" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-black/5 dark:border-white/5 text-[11px] font-semibold">
                          <div>
                            <span className="text-black/40 dark:text-white/40 block">Category</span>
                            <span className="text-[#0c0d0e] dark:text-white font-extrabold mt-0.5 block">Transport</span>
                          </div>
                          <div>
                            <span className="text-black/40 dark:text-white/40 block">Type</span>
                            <span className="text-[#ccff00] font-black mt-0.5 block">Expense</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeFeature === "receipts" && (
                      <div className="space-y-4 max-w-[340px] mx-auto bg-[#f5f5f0] dark:bg-[#14161f] border border-black/10 dark:border-white/10 rounded-2xl p-4 shadow-xl">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center flex-shrink-0 text-red-500">
                            📎
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-[#0c0d0e] dark:text-white">Receipt Upload</h4>
                            <p className="text-[10px] text-black/50 dark:text-white/50 mt-0.5 leading-relaxed">
                              Save an image or PDF, add a description, and keep it ready for export or Drive upload.
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-2 text-[10px] font-bold">
                          <button className="flex-1 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[#0c0d0e] dark:text-white py-2 rounded-lg transition-colors">
                            Save Receipt
                          </button>
                          <button className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition-colors">
                            Add Description
                          </button>
                        </div>
                      </div>
                    )}

                    {activeFeature === "notes" && (
                      <div className="space-y-3.5">
                        <p className="text-[9px] font-bold text-black/35 dark:text-white/35 uppercase tracking-wider mb-2">Notes Library</p>

                        {/* Note 1 */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] font-bold">
                            <span className="text-black/80 dark:text-white/80">🗒️ Vendor Payment</span>
                            <span className="text-[#ccff00]">Updated today</span>
                          </div>
                          <div className="w-full h-1.5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full w-[85%] bg-[#ccff00] rounded-full" />
                          </div>
                        </div>

                        {/* Note 2 */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] font-bold">
                            <span className="text-black/80 dark:text-white/80">✅ Audit Checklist</span>
                            <span className="text-black/60 dark:text-white/60">Archived</span>
                          </div>
                          <div className="w-full h-1.5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full w-[40%] bg-white/20 rounded-full" />
                          </div>
                        </div>

                        {/* Note 3 */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] font-bold">
                            <span className="text-black/80 dark:text-white/80">📌 Budget Review</span>
                            <span className="text-[#ccff00]">Active</span>
                          </div>
                          <div className="w-full h-1.5 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full w-[95%] bg-[#ccff00] rounded-full" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>

            </div>

          </div>
        </div>
      </section>

      {/* ABOUT US */}
      <section id="about" className="border-t border-black/5 dark:border-white/5 py-24 md:py-32 relative overflow-hidden bg-[#eff1e9] dark:bg-[#050505] transition-colors duration-300">

        {/* Ambient background glows for dark mode to make the sides blend beautifully */}
        {resolvedTheme === "dark" && (
          <>
            <div className="absolute top-1/4 -left-36 w-96 h-96 bg-[#ccff00]/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 -right-36 w-96 h-96 bg-[#ccff00]/5 rounded-full blur-[120px] pointer-events-none" />
          </>
        )}

        {teamMembers.map((member) => (
          activeMember === member.id && (
            <motion.div
              key={`bg-gif-${member.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none z-0"
              style={{
                width: activeGifSettings.width,
                height: activeGifSettings.height,
              }}
            >
              <img
                src={member.gif}
                alt={`${member.name} background GIF`}
                className="w-full h-full object-cover"
                style={{
                  /* LINE FOR CUSTOMIZATION: Set GIF opacity here */
                  opacity: resolvedTheme === "dark" ? activeGifSettings.opacityDark : activeGifSettings.opacityLight,
                  /* Dim GIF brightness in dark mode to soften the white spotlight contrast */
                  filter: resolvedTheme === "dark" ? "brightness(0.85) contrast(1.05)" : "none",
                }}
              />
              {/* Radial gradient mask overlay to fade the edges into background colors */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: resolvedTheme === "dark" ? activeGifSettings.radialDark : activeGifSettings.radialLight,
                }}
              />

            </motion.div>
          )
        ))}

        {/* Giant background outline name text - Infinite Scrolling Marquee */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`outline-name-${activeMember}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 flex items-center pointer-events-none select-none overflow-hidden z-0"
          >
            <div className="flex w-[200%] whitespace-nowrap">
              {/* We run two identical tracks side-by-side to make the scrolling loop seamless */}
              {[1, 2].map((trackIdx) => (
                <motion.div
                  key={`track-${trackIdx}`}
                  animate={{ x: ["-100%", "0%"] }}
                  transition={{
                    ease: "linear",
                    duration: 16,
                    repeat: Infinity,
                  }}
                  className="flex justify-around min-w-full shrink-0"
                >
                  {Array(5)
                    .fill(activeMember)
                    .map((name, i) => (
                      <span
                        key={i}
                        className="font-black tracking-[0.1em] leading-none text-transparent uppercase select-none opacity-25 dark:opacity-30 px-6"
                        style={{
                          fontSize: "clamp(5rem, 12vw, 11rem)",
                          WebkitTextStroke:
                            resolvedTheme === "dark"
                              ? "2px rgba(204, 255, 0, 0.38)"
                              : "2px rgba(0, 0, 0, 0.35)",
                        }}
                      >
                        {name}
                      </span>
                    ))}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 flex flex-col items-center">

          {/* Section Heading */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-[11px] uppercase font-bold tracking-[0.3em] text-[#82a400] dark:text-[#ccff00] mb-4">
              About Us
            </p>
            <h2 className="text-3xl md:text-5xl font-black text-[#0c0d0e] dark:text-white tracking-tight">
              The people behind CtrlFund.
            </h2>
            <p className="mt-6 text-black/60 dark:text-white/60 text-base font-semibold leading-relaxed">
              We built this to keep expense tracking fast, tidy, and export-ready, without adding clutter.
            </p>
          </div>

          {/* Active Member Showcase Foreground Card */}
          <div className="w-full flex justify-center mb-16">
            <AnimatePresence mode="wait">
              {teamMembers.map((member) => (
                activeMember === member.id && (
                  <motion.div
                    key={`card-${member.id}`}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full max-w-[580px] bg-white/20 dark:bg-black/25 border border-white/55 dark:border-white/10 rounded-[32px] overflow-hidden shadow-2xl backdrop-blur-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-8 hover:border-[#82a400]/30 dark:hover:border-[#ccff00]/30 transition-all duration-300 group"
                  >

                    {/* Square Image container with subtle green indicator dot */}
                    <div className="relative w-44 h-44 md:w-48 md:h-48 rounded-2xl overflow-hidden flex-shrink-0 border border-white/60 dark:border-white/15 shadow-md">
                      <img
                        src={member.image}
                        alt={`${member.name} profile image`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className="absolute top-3 right-3 w-3 h-3 rounded-full bg-[#82a400] dark:bg-[#ccff00] animate-pulse shadow-[0_0_8px_#ccff00]" />
                    </div>

                    {/* Member Detailed Info */}
                    <div className="flex flex-col flex-1 text-center md:text-left space-y-4">
                      <div>
                        <div className="flex flex-col md:flex-row md:items-baseline gap-1.5 md:gap-3 justify-center md:justify-start">
                          <h3 className="text-2xl font-black tracking-tight text-[#0c0d0e] dark:text-white leading-none">
                            {member.name}
                          </h3>
                          <span className="text-xs text-[#82a400] dark:text-[#ccff00] font-black uppercase tracking-widest">
                            {member.role}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-black/70 dark:text-white/70 font-semibold leading-relaxed">
                        {member.bio}
                      </p>

                      {/* Tag list pills matching about_us_filled.html style */}
                      <div className="flex flex-wrap justify-center md:justify-start gap-2">
                        {member.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-bold px-3 py-1 bg-black/5 dark:bg-white/10 text-black/60 dark:text-white/80 rounded-full border border-black/5 dark:border-white/5 uppercase"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Social Media Links */}
                      <div className="flex items-center justify-center md:justify-start gap-4 pt-2">
                        <a
                          href={member.socials.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-black/50 dark:text-white/50 hover:text-[#82a400] dark:hover:text-[#ccff00] transition-colors"
                        >
                          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
                          </svg>
                        </a>
                        <a
                          href={member.socials.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-black/50 dark:text-white/50 hover:text-[#82a400] dark:hover:text-[#ccff00] transition-colors"
                        >
                          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                            <path fillRule="evenodd" clipRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                          </svg>
                        </a>
                      </div>

                    </div>

                  </motion.div>
                )
              ))}
            </AnimatePresence>
          </div>

          {/* Circular Avatars connected by Dotted Wave SVG Line */}
          <div className="relative w-full max-w-[320px] h-24 flex items-center justify-between mt-4">

            {/* Elegant Dotted Connector Wave SVG */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-8 pointer-events-none z-0">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 320 32" fill="none">
                <path
                  d="M 40 16 C 100 0, 220 32, 280 16"
                  stroke={resolvedTheme === "dark"
                    ? "rgba(204, 255, 0, 0.45)"
                    : "rgba(130, 164, 0, 0.35)"
                  }
                  strokeWidth="2.5"
                  strokeDasharray="6 6"
                  fill="none"
                  style={{
                    transition: "stroke 1s ease, filter 1s ease",
                    filter: resolvedTheme === "dark"
                      ? "drop-shadow(0 0 10px rgba(204, 255, 0, 0.55))"
                      : "drop-shadow(0 0 8px rgba(130, 164, 0, 0.45))",
                  }}
                />
              </svg>
            </div>

            {/* Circular Avatar 1: Deon */}
            <button
              onClick={() => setActiveMember("deon")}
              className="relative group z-10 flex flex-col items-center focus:outline-none"
            >
              <div
                className={`w-16 h-16 rounded-full overflow-hidden border-2 transition-all duration-300 shadow-md ${activeMember === "deon"
                  ? "border-[#82a400] dark:border-[#ccff00] scale-110 shadow-[0_0_15px_rgba(204,255,0,0.4)]"
                  : "border-black/10 dark:border-white/10 opacity-60 hover:opacity-100 hover:scale-105"
                  }`}
              >
                <img
                  src="/deon1.png"
                  alt="Deon avatar circle icon"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className={`text-[10px] font-black tracking-widest mt-2 uppercase ${activeMember === "deon" ? "text-[#82a400] dark:text-[#ccff00]" : "text-black/40 dark:text-white/40"}`}>
                DEON
              </span>
            </button>

            {/* Circular Avatar 2: Hazel */}
            <button
              onClick={() => setActiveMember("hazel")}
              className="relative group z-10 flex flex-col items-center focus:outline-none"
            >
              <div
                className={`w-16 h-16 rounded-full overflow-hidden border-2 transition-all duration-300 shadow-md ${activeMember === "hazel"
                  ? "border-[#82a400] dark:border-[#ccff00] scale-110 shadow-[0_0_15px_rgba(204,255,0,0.4)]"
                  : "border-black/10 dark:border-white/10 opacity-60 hover:opacity-100 hover:scale-105"
                  }`}
              >
                <img
                  src="/hazel_image.jpeg"
                  alt="Hazel avatar circle icon"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className={`text-[10px] font-black tracking-widest mt-2 uppercase ${activeMember === "hazel" ? "text-[#82a400] dark:text-[#ccff00]" : "text-black/40 dark:text-white/40"}`}>
                HAZEL
              </span>
            </button>

          </div>

        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="relative py-28 md:py-36 overflow-hidden border-t border-black/5 dark:border-white/5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#ccff00]/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8 relative z-10">
          <h2 className="text-4xl md:text-6xl font-black text-[#0c0d0e] dark:text-white tracking-tight leading-none">
            Get started with <br />this today
          </h2>
          <p className="text-black/60 dark:text-white/60 text-base md:text-lg max-w-xl mx-auto font-semibold">
            Take total control of your cash flow. Set up automated limits, watch your savings grow, and align your habits.
          </p>
          <div className="pt-4 flex justify-center">
            <Link href="/login">
              <button className="bg-[#ccff00] text-black hover:bg-white hover:scale-105 hover:shadow-[0_0_35px_rgba(204,255,0,0.5)] active:scale-95 transition-all duration-300 font-black text-sm py-4.5 px-10 rounded-full shadow-[0_5px_30px_rgba(204,255,0,0.25)] flex items-center gap-2">
                Start Saving Now <ArrowRight className="w-4.5 h-4.5 stroke-[3]" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-black/5 dark:border-white/5 py-12 relative">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center bg-white/70 dark:bg-black/40">
              <div className="w-5 h-5 rounded-full border border-dashed border-[#ccff00]/40 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ccff00]" />
              </div>
            </div>
            <span className="font-extrabold text-sm text-[#0c0d0e] dark:text-white tracking-tight">CTRL Fund</span>
          </div>

          <p className="text-xs text-black/35 dark:text-white/35 font-bold order-3 md:order-2">
            &copy; 2026 CtrlFund. Built for smarter finance. All rights reserved.
          </p>

          <div className="flex items-center gap-6 order-2 md:order-3">
            <button
              onClick={scrollToTop}
              className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 flex items-center justify-center text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white transition-all cursor-pointer"
              title="Return to Top"
            >
              <ArrowUp className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </footer>

      {/* DEMO VIDEO MODAL DIALOG */}
      {showDemoVideo && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c0d10] border border-white/10 rounded-[32px] w-full max-w-3xl overflow-hidden shadow-2xl relative">
            <button
              onClick={() => setShowDemoVideo(false)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 hover:bg-black text-white flex items-center justify-center border border-white/5 transition-all z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-6 md:p-8 space-y-4">
              <h3 className="text-lg font-black text-white">How CtrlFund Works</h3>
              <div className="aspect-video bg-black/40 border border-white/5 rounded-2xl flex items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-0 bg-[#ccff00]/5 flex items-center justify-center">
                  <div className="text-center p-6 space-y-3">
                    <div className="w-16 h-16 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/30 flex items-center justify-center mx-auto text-[#ccff00] animate-pulse">
                      <Sparkles className="w-7 h-7" />
                    </div>
                    <p className="text-sm font-bold text-white/90 pt-2">Simulated Interactive Demo Walkthrough</p>
                    <p className="text-xs text-white/40 max-w-md mx-auto">
                      Connecting ledger accounts, setting automated rules, and viewing dynamic weekly accumulation bars.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setShowDemoVideo(false)}
                  className="bg-white/5 hover:bg-white/10 text-white font-bold text-xs py-2.5 px-6 rounded-full border border-white/10 transition-all"
                >
                  Close Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
