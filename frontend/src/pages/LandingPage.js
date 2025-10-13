// src/pages/LandingPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import InfoModal from "../components/modals/InfoModal"; // <- adjust if needed

export default function LandingPage() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(null); // "about" | "how" | "features" | "help" | null

  const handleGetStarted = () => navigate("/user-login");

  return (
    <div className="relative min-h-screen bg-[#F6F3EA] text-gray-900 flex flex-col font-sans overflow-hidden">
      {/* Full Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/newlandinglogin.png"
          alt="Background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Top Navigation Bar */}
      <div className="absolute top-6 left-16 z-50 flex space-x-12">
        <button
          onClick={() => setOpen("about")}
          className="text-white text-base font-medium hover:underline transition"
        >
          About
        </button>
        <button
          onClick={() => setOpen("how")}
          className="text-white text-base font-medium hover:underline transition"
        >
          How it Works
        </button>
        <button
          onClick={() => setOpen("features")}
          className="text-white text-base font-medium hover:underline transition"
        >
          Features
        </button>
        <button
          onClick={() => setOpen("help")}
          className="text-white text-base font-medium hover:underline transition"
        >
          Help
        </button>
      </div>

      {/* Fixed Logos at Top-Right */}
      <div className="absolute top-6 right-12 flex items-center space-x-6 z-50">
        <img src="/poslogo.png" alt="POS Logo" className="h-20 w-auto" />
        <img src="/cbalogo.png" alt="CBA Logo" className="h-24 w-auto" />
      </div>

      {/* Content Section */}
      <div className="relative z-10 flex flex-col justify-center items-end flex-grow px-6 md:px-28 py-12 text-left">
        <div className="max-w-[700px] mr-8 -mt-8 text-left">
          <h1 className="text-3xl md:text-6xl font-extrabold leading-tight mb-10 text-black">
            Food &amp; Beverages <br /> Sales &amp; Inventory
          </h1>

          <p className="text-black text-base md:text-lg mb-8">
            Powerful POS and Inventory, Built for Speed.
          </p>

          <div className="flex justify-center">
            <button
              onClick={handleGetStarted}
              className="bg-[#F6EBCE] hover:bg-[#FFD700] text-black font-semibold py-3 px-8 rounded-full border border-[#e4e4e7] shadow-[inset_0_1px_3px_rgba(255,255,255,0.6),0_6px_12px_rgba(0,0,0,0.08),0_2px_0px_#FFC72C] hover:shadow-[inset_0_1px_3px_rgba(255,255,255,0.7),0_10px_20px_rgba(0,0,0,0.12),0_3px_0px_#FFC72C] hover:scale-105 hover:-translate-y-1 transition-all duration-300 ease-in-out"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>

      {/* Modals (content comes from InfoModal via `variant`) */}
      <InfoModal
        isOpen={open === "about"}
        onClose={() => setOpen(null)}
        variant="about"
        maxWidth="md"
      />
      <InfoModal
        isOpen={open === "how"}
        onClose={() => setOpen(null)}
        variant="how"
        maxWidth="xl"
      />
      <InfoModal
        isOpen={open === "features"}
        onClose={() => setOpen(null)}
        variant="features"
        maxWidth="xl"
      />
      <InfoModal
        isOpen={open === "help"}
        onClose={() => setOpen(null)}
        variant="help"
        maxWidth="md"
      />
    </div>
  );
}
