import React from "react";

const LoadingScreen = ({ currentStage, loadingTip, backgroundImage }: any) => {
  return (
    <div className="relative h-screen w-screen bg-black overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          opacity: 0.3,
        }}
      />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-between p-8">
        {/* Top section */}
        <div className="text-white text-4xl font-bold">Loading...</div>

        {/* Middle section */}
        <div className="flex items-center justify-center"></div>

        {/* Bottom section */}
        <div className="space-y-4">
          <div className="bg-white bg-opacity-20 h-1 w-full">
            <div
              className="bg-white h-full transition-all duration-300 ease-linear"
              style={{ width: `${(currentStage % 6) * 20}%` }}
            />
          </div>
          <div className="text-white text-xl font-medium">{loadingTip}</div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
