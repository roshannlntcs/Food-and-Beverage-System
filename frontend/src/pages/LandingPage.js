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

      {/* Fixed CBA Logo at Top-Right */}
      <img
        src="/cbalogo.png"
        alt="CBA Logo"
        className="absolute top-6 right-6 h-16 w-auto z-50"
      />

      {/* Content Section */}
      <div className="relative z-10 flex flex-col justify-center items-center flex-grow px-6 md:px-28 py-20 text-center">
      <div className="max-w-[700px] ml-12">
          <h1 className="text-3xl md:text-6xl font-extrabold leading-tight mb-10">
            Streamline Your <br /> Sales & Inventory <br /> With Ease
          </h1>

          <p className="text-gray-700 text-base md:text-lg mb-8">
            Powerful POS and Inventory, Built for Speed.
          </p>

          <div className="flex justify-center">
            <button
              onClick={handleGetStarted}
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 px-6 rounded-full shadow transition-all transform hover:scale-105"
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
