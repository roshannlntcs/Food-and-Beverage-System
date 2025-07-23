import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/roles');
  };

  return (
    <div className="relative min-h-screen bg-[#F6F3EA] text-gray-900 flex flex-col font-sans overflow-hidden">
      {/* Full Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/landing_bg.png"
          alt="Background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Fixed Logos at Top-Right */}
      <div className="absolute top-6 right-12 flex items-center space-x-4 z-50">
        <img
          src="/poslogo.png"
          alt="Splice Logo"
          className="h-14 w-auto"
        />
        <img
          src="/cbalogo.png"
          alt="CBA Logo"
          className="h-16 w-auto"
        />
      </div>

      {/* Content Section */}
      <div className="relative z-10 flex flex-col justify-center items-center flex-grow px-6 md:px-28 py-12 text-center">
      <div className="max-w-[700px] ml-12 -mt-8"> 
          <h1 className="text-3xl md:text-6xl font-extrabold leading-tight mb-10">
            Streamline Your <br /> Sales & Inventory <br /> With Ease
          </h1>

          <p className="text-gray-700 text-base md:text-lg mb-8">
            Powerful POS and Inventory, Built for Speed.
          </p>

          <div className="flex justify-center">
            <button
              onClick={handleGetStarted}
              className="bg-[#F6EBCE] text-black font-semibold py-3 px-8 rounded-full border border-[#e4e4e7] shadow-[inset_0_1px_3px_rgba(255,255,255,0.6),0_6px_12px_rgba(0,0,0,0.08),0_2px_0px_#FFC72C] hover:shadow-[inset_0_1px_3px_rgba(255,255,255,0.7),0_10px_20px_rgba(0,0,0,0.12),0_3px_0px_#FFC72C] hover:scale-105 hover:-translate-y-1 transition-all duration-300 ease-in-out"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;