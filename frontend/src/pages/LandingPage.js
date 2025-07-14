import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/roles');
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9] text-gray-900 flex flex-col font-sans">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-10 py-6 bg-white shadow relative">
        {/* Left: Logo */}
        <div className="flex items-center">
          <img src="/logo.png" alt="Logo" className="h-10 w-10 mr-3" />
          <span className="text-xl font-bold">POS System</span>
        </div>

        {/* Right Links Container */}
        <div className="absolute left-[63%]  transform -translate-x-1/2 flex gap-40 text-sm font-medium">
          <a href="#about" className="hover:text-yellow-600 transition">About</a>
          <a href="#contact" className="hover:text-yellow-600 transition">Contact</a>
          <a href="#help" className="hover:text-yellow-600 transition">Help</a>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex flex-col md:flex-row h-full flex-grow">
        {/* Left Half with Red Image */}
        <div className="relative w-full md:w-[37.3%] h-80 md:h-auto overflow-hidden flex items-center justify-center">
          <img
            src="/red.png"
            alt="Red Background"
            className="w-full h-full object-cover"
            style={{
              clipPath: 'ellipse(120% 100% at 0% 50%)',
            }}
          />
        </div>

        {/* Right Half with Content */}
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center text-center md:text-left px-8 md:px-20 py-12">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-snug mb-4">
            Streamline Your <br /> Sales & Inventory
          </h1>
          <p className="text-gray-600 text-base md:text-lg mb-6">
            Manage your business with a fast and easy POS system designed for food businesses.
          </p>
          <button
            onClick={handleGetStarted}
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 px-6 rounded-full shadow transition-all"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
