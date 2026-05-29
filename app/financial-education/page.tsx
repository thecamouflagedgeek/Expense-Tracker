import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  ShieldCheck,
  PiggyBank,
  TrendingUp,
  Wallet,
  AlertTriangle,
  BadgeIndianRupee,
  BookOpen,
  ArrowUpRight,
} from "lucide-react";

export default function FinancialEducationPage() {
  const sections = [
    {
      icon: PiggyBank,
      title: "Smart Saving",
      items: [
        "Use 50-30-20 budgeting",
        "Create emergency funds",
        "Automate monthly savings",
        "Track recurring expenses",
      ],
    },

    {
      icon: TrendingUp,
      title: "Invest Better",
      items: [
        "Diversify investments",
        "Avoid emotional investing",
        "Understand risk profiles",
        "Invest consistently",
      ],
    },

    {
      icon: BadgeIndianRupee,
      title: "Tax & Documentation",
      items: [
        "Maintain transaction records",
        "Understand taxable income",
        "Track deductions",
        "Keep digital backups",
      ],
    },

    {
      icon: ShieldCheck,
      title: "Fraud Prevention",
      items: [
        "Verify schemes before investing",
        "Never share OTPs",
        "Avoid unauthorized lenders",
        "Use secure payment methods",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8f8f5] px-6 py-10 md:px-10">
      {/* HERO */}

      <div className="relative overflow-hidden rounded-[32px] bg-black p-10 mb-10">
        <div className="absolute right-[-50px] top-[-50px] h-48 w-48 rounded-full bg-[#ccff00]/10 blur-[90px]" />

        <div className="relative z-10">
          <p className="text-[#ccff00] font-black uppercase tracking-[0.3em] text-xs">
            Financial Education Hub
          </p>

          <h1 className="text-4xl md:text-6xl font-black text-white mt-4 max-w-3xl">
            Save Smarter. Build Wealth. Stay Protected.
          </h1>

          <p className="text-white/60 mt-6 max-w-2xl font-semibold">
            Financial literacy helps create stability, better decisions, and
            long-term growth.
          </p>
        </div>
      </div>

      {/* QUICK STATS */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Card className="card-gradient border-none p-5">
          <p className="text-[10px] uppercase font-black text-black/40">
            Emergency Fund
          </p>

          <h2 className="text-3xl font-black mt-3">3–6 Months</h2>
        </Card>

        <Card className="card-gradient border-none p-5">
          <p className="text-[10px] uppercase font-black text-black/40">
            Recommended Savings
          </p>

          <h2 className="text-3xl font-black mt-3">20%</h2>
        </Card>

        <Card className="card-gradient border-none p-5">
          <p className="text-[10px] uppercase font-black text-black/40">
            Golden Rule
          </p>

          <h2 className="text-3xl font-black mt-3">50 / 30 / 20</h2>
        </Card>
      </div>

      {/* MAIN GRID */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
        {sections.map((section) => {
          const Icon = section.icon;

          return (
            <Card
              key={section.title}
              className="card-gradient border-none p-6 group hover:scale-[1.01] transition-all duration-300"
            >
              <CardHeader className="p-0 mb-5 flex flex-row items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-black flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[#ccff00]" />
                </div>

                <CardTitle className="font-black text-lg">
                  {section.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="p-0">
                <div className="flex flex-col gap-4">
                  {section.items.map((item) => (
                    <div
                      key={item}
                      className="flex items-center justify-between border-b border-black/5 pb-3"
                    >
                      <span className="font-semibold text-black/70">
                        {item}
                      </span>

                      <ArrowUpRight className="w-4 h-4 opacity-30" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* WARNING SECTION */}

      <Card className="mt-10 bg-black border-none p-8 rounded-[28px]">
        <div className="flex gap-5 items-start">
          <div className="w-14 h-14 rounded-2xl bg-[#ccff00] flex items-center justify-center shrink-0">
            <AlertTriangle className="text-black" />
          </div>

          <div>
            <h2 className="text-white text-2xl font-black">
              Financial Red Flags
            </h2>

            <p className="text-white/60 mt-3 font-medium">
              If someone promises guaranteed returns, asks for urgent money
              transfers, or pressures quick investment decisions — pause and
              verify.
            </p>
          </div>
        </div>
      </Card>

      {/* FOOTER */}

      <div className="mt-12 flex items-center justify-center gap-3 text-black/40 font-bold">
        <BookOpen className="w-4 h-4" />

        <span>Knowledge compounds like investments.</span>
      </div>
    </div>
  );
}
