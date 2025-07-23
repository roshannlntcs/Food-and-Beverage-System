import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/roles');
  };

  return (
    <div className="relative min-h-screen bg-[#F6F3EA] text-gray-900 flex flex-col font-sans">
      {/* Fixed CBA Logo at Top-Right */}
      <img
        src="/cbalogo.png"
        alt="CBA Logo"
        className="absolute top-6 right-6 h-16 w-auto z-50"
      />

      {/* Hero Section */}
      <div className="flex flex-col md:flex-row h-full flex-grow">
        {/* Left Half with Red Image */}
        <div className="relative w-full md:w-[42.3%] h-80 md:h-auto overflow-hidden flex items-center justify-center">
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
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-10 md:px-28 py-20">
          {/* Wrapper for text block */}
          <div className="text-left w-full max-w-[600px]">
            {/* Heading */}
            <h1 className="text-3xl md:text-xl font-extrabold leading-tight mb-10">
              Streamline Your <br /> Sales & Inventory <br /> With Ease
            </h1>

            {/* Paragraph */}
            <p className="text-gray-600 text-base md:text-lg mb-8">
              Powerful POS and Inventory, Built for Speed.
            </p>

            {/* Button */}
            <div className="flex justify-end w-full">
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
    </div>
  );
};

export default LandingPage;
