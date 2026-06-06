"use client";

import Link from "next/link";

import {
  ArrowRight,
  Wallet,
  TrendingUp,
  Shield,
  BarChart3,
  Users,
  Sparkles,
} from "lucide-react";

import { Card } from "@/components/ui/card";

const carouselItems = [
  "Track Expenses",
  "Export Reports",
  "Multi User Access",
  "Quick Transfers",
  "Smart Analytics",
  "Budget Planning",
  "Charts & Graphs",
  "PDF Export",
  "Financial Education",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f8f8f5] overflow-hidden">
      {/* NAV */}

      <nav className="flex items-center justify-between px-8 py-6">
        <h1 className="font-black text-2xl">CTRL Fund</h1>

        <Link href="/login">
          <button className="button-gradient px-6 py-3">Get Started</button>
        </Link>
      </nav>

      {/* HERO */}

      <section className="px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="uppercase font-black tracking-[0.3em] text-xs text-black/40">
              Smart Finance Platform
            </p>

            <h1 className="text-6xl font-black mt-5 leading-none">
              Track. Save. Grow.
            </h1>

            <p className="mt-6 text-black/60 font-semibold max-w-xl">
              A modern expense tracker designed for analytics, budgeting,
              transfers, reporting and smarter financial decisions.
            </p>

            <div className="flex gap-4 mt-8">
              <Link href="/login">
                <button className="button-gradient px-7 py-4">
                  Start Tracking
                </button>
              </Link>

              <button className="border border-black/10 rounded-xl px-7">
                Learn More
              </button>
            </div>
          </div>

          {/* FLOATING CARD */}

          <div className="relative">
            <div className="absolute inset-0 bg-[#ccff00]/10 blur-[100px]" />

            <Card className="relative rounded-[32px] p-8 bg-black text-white border-none">
              <div className="flex justify-between">
                <span className="font-black">CTRL Fund</span>

                <Sparkles className="text-[#ccff00]" />
              </div>

              <div className="mt-16">
                <p className="text-white/40">Available Balance</p>

                <h2 className="text-5xl font-black">Rs. 2,45,000</h2>
              </div>

              <div className="mt-10 flex gap-3">
                <div className="bg-[#ccff00] text-black px-4 py-2 rounded-xl font-bold">
                  +24%
                </div>

                <div className="bg-white/10 px-4 py-2 rounded-xl">
                  Analytics
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* INFINITE CAROUSEL */}

      <div className="overflow-hidden border-y border-black/5 py-6">
        <div className="animate-marquee flex gap-10 whitespace-nowrap">
          {[...carouselItems, ...carouselItems].map((item, i) => (
            <div key={i} className="font-black text-xl opacity-70">
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* HOW IT WORKS */}

      <section className="px-8 py-20">
        <h2 className="text-4xl font-black mb-12">How It Works</h2>

        <div className="grid md:grid-cols-3 gap-8">
          {["Add Transactions", "Analyze Spending", "Improve Savings"].map(
            (step, index) => (
              <Card key={step} className="card-gradient border-none p-8">
                <div className="text-6xl font-black opacity-20">
                  0{index + 1}
                </div>

                <h3 className="font-black text-xl mt-5">{step}</h3>
              </Card>
            ),
          )}
        </div>
      </section>

      {/* FEATURES */}

      <section className="px-8 pb-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            [Wallet, "Expense Tracking"],
            [TrendingUp, "Analytics"],
            [Shield, "Secure Reports"],
            [Users, "Multi User Access"],
          ].map(([Icon, title], i) => {
            const C: any = Icon;
            const t = title as string;

            return (
              <Card key={i} className="card-gradient border-none p-6">
                <C className="w-8 h-8" />

                <h3 className="font-black mt-5">{t}</h3>
              </Card>
            );
          })}
        </div>
      </section>

      <footer className="border-t border-black/5 p-10 text-center">
        <p className="font-bold text-black/40">Built for smarter finance.</p>
      </footer>
    </div>
  );
}
