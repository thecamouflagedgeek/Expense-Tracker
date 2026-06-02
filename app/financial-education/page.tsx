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

function InfiniteCarousel({ items }: { items: string[] }) {
  return (
    <div className="relative overflow-hidden carousel-mask">
      <div className="animate-marquee flex w-max gap-5 whitespace-nowrap py-4">
        {[...items, ...items].map((item, index) => (
          <div
            key={index}
            className="group px-6 py-3 rounded-full bg-white border border-black/5 shadow-sm font-black tracking-wide text-black/70 transition-all duration-300 hover:scale-105 hover:border-[#ccff00] hover:shadow-lg"
          >
            <span className="whitespace-nowrap">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const banks = [
  "HDFC",
  "ICICI",
  "SBI",
  "Axis",
  "Kotak",
  "IDFC",
  "Bank of Baroda",
  "Yes Bank",
  "Punjab National Bank",
  "Canara Bank",
];

const schemes = [
  {
    name: "PM Jan Dhan Yojana",
    desc: "Financial inclusion with zero balance accounts",
  },

  {
    name: "PPF",
    desc: "Long-term tax saving investment",
  },

  {
    name: "NPS",
    desc: "Retirement savings scheme",
  },

  {
    name: "Sukanya Samriddhi",
    desc: "Savings scheme for girl child",
  },

  {
    name: "Atal Pension Yojana",
    desc: "Pension scheme for workers",
  },

  {
    name: "SCSS",
    desc: "Senior citizen savings scheme",
  },
];

const resources = [
  {
    name: "RBI",
    url: "https://www.rbi.org.in",
  },

  {
    name: "SEBI",
    url: "https://www.sebi.gov.in",
  },

  {
    name: "MoneyControl",
    url: "https://www.moneycontrol.com",
  },

  {
    name: "Economic Times Markets",
    url: "https://economictimes.indiatimes.com/markets",
  },

  {
    name: "Livemint",
    url: "https://www.livemint.com",
  },

  {
    name: "Investopedia",
    url: "https://www.investopedia.com",
  },
];

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

      <Card className="border-none card-gradient p-8 mb-10 overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs uppercase font-black tracking-[0.2em] text-black/40">
              Financial Ecosystem
            </p>

            <h2 className="font-black text-3xl mt-2">
              Popular Financial Institutions
            </h2>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center">
            <Wallet className="text-[#ccff00]" />
          </div>
        </div>

        <InfiniteCarousel items={banks} />
      </Card>

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

      <div className="mt-14">
        <h2 className="text-3xl font-black mb-8">Government Schemes</h2>

        <div className="grid md:grid-cols-3 gap-5">
          {schemes.map((scheme) => (
            <Card key={scheme.name} className="card-gradient border-none p-6">
              <h3 className="font-black">{scheme.name}</h3>

              <p className="mt-3 text-black/60">{scheme.desc}</p>
            </Card>
          ))}
        </div>
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

      <div className="mt-14">
        <h2 className="text-3xl font-black mb-8">Financial News & Resources</h2>

        <div className="grid md:grid-cols-3 gap-5">
          {resources.map((resource) => (
            <a
              href={resource.url}
              target="_blank"
              key={resource.name}
              className="card-gradient rounded-3xl p-6 block hover:scale-[1.02] transition"
            >
              <h3 className="font-black">{resource.name}</h3>

              <p className="text-black/50 mt-2">Open Resource →</p>
            </a>
          ))}
        </div>
      </div>

      <Card className="mt-14 bg-red-50 border-red-200 p-8">
        <h2 className="font-black text-2xl">Scam Awareness</h2>

        <div className="grid md:grid-cols-2 gap-4 mt-6">
          <div>⚠ Fake Investment Apps</div>

          <div>⚠ UPI Fraud</div>

          <div>⚠ Ponzi Schemes</div>

          <div>⚠ Loan App Scams</div>
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
