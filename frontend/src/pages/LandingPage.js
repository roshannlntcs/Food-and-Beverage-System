import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import InfoModal from "../components/modals/InfoModal";

const NAV_LINKS = [
  { id: "about", label: "About" },
  { id: "how", label: "How it Works" },
  { id: "features", label: "Features" },
  { id: "help", label: "Help" },
];

const HERO_STATS = [
  { value: "6", label: "Main Categories" },
  { value: "2000", label: "Available Stocks" },
  { value: "60", label: "Preloaded Items" },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(null);
  const heroImage = useMemo(() => "/landingbg.png", []);

  const handleGetStarted = () => navigate("/user-login");

  return (
    <div className="relative box-border min-h-screen w-full overflow-hidden bg-[#fff9f1] text-gray-900">
      {/* Decorative backdrops */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-[-220px] top-1/3 h-[520px] w-[520px] rounded-[45%] bg-[#FFC72C]/40 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-[#ffc72c]/25" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/40 bg-transparent">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-10 py-8">
          <nav className="flex items-center gap-10 text-sm font-semibold tracking-wide text-[#1f1f1f]">
            {NAV_LINKS.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => setOpen(link.id)}
                className="transition hover:text-[#FFC72C]"
              >
                {link.label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <img
                src="/splice_logo.png"
                alt="SPLICE POS"
                className="h-[72px] w-auto drop-shadow-lg"
              />
              <img
                src="/cbalogo.png"
                alt="College of Business Administration"
                className="h-16 w-auto drop-shadow-lg"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10 mx-auto grid w-full max-w-6xl grid-cols-2 gap-10 px-10 pb-4 pt-6">
        <div className="flex flex-col justify-center">
          <p className="text-sm font-semibold uppercase tracking-[0.4em] text-[#800000]">
            College of Business Administration
          </p>
          <h1 className="mt-4 text-4xl font-black leading-tight text-[#1f1f1f] md:text-[42px]">
            Food &amp; Beverages
            <br />
            POS and Inventory
          </h1>
          <p className="mt-6 text-base text-gray-700">
            Simulate real-world point-of-sale operations with Splice. Manage
            sales, track inventory, and generate reports seamlessly.
          </p>

          <div className="mt-6 flex items-center gap-6">
            <button
              onClick={handleGetStarted}
              className="rounded-full bg-[#F6EBCE] px-10 py-3 text-lg font-semibold text-[#800000] shadow-[0_12px_25px_rgba(0,0,0,0.15)] transition hover:-translate-y-1 hover:bg-[#ffe9a7]"
            >
              Get Started
            </button>
            <div className="text-sm text-gray-500">
              or check out <span className="font-semibold">Help</span> to see how it works.
            </div>
          </div>

          <div className="mt-8 flex gap-6 border-t border-gray-200 pt-4">
            {HERO_STATS.map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-bold text-[#800000]">{stat.value}</p>
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -right-10 top-10 h-16 w-16 rounded-full bg-white/70 blur-sm shadow-lg" />
          <div className="relative rounded-[28px] border border-white/80 bg-white/90 p-3 shadow-2xl backdrop-blur">
            <div className="rounded-[22px] bg-gradient-to-b from-[#ffd8a0] to-[#fff4da] p-3 shadow-inner">
              <img
                src={heroImage}
                alt="POS hero"
                className="max-h-[420px] w-full rounded-[25px] border border-[#f2d9b3] object-contain shadow-lg"
              />
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="rounded-2xl border border-gray-200 bg-white/90 p-4 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:scale-105 hover:shadow-lg">
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Realtime
                </p>
                <p className="text-lg font-semibold text-[#800000]">Stock Monitor</p>
                <p>Triggers low-stock alerts for low stock and out of stock items.</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white/90 p-4 shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:scale-105 hover:shadow-lg">
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Analytics
                </p>
                <p className="text-lg font-semibold text-[#800000]">Sales Reports</p>
                <p>Generates timely sales reports and insights.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      {NAV_LINKS.map((link) => (
        <InfoModal
          key={link.id}
          isOpen={open === link.id}
          onClose={() => setOpen(null)}
          variant={link.id}
          maxWidth={["how", "features"].includes(link.id) ? "xl" : "md"}
        />
      ))}
    </div>
  );
}
