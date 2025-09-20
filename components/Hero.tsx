import React from 'react';

interface HeroProps {
  onDiscoverPathClick: () => void;
  hasSavedData: boolean;
  onContinue: () => void;
  onStartNew: () => void;
}

const Hero: React.FC<HeroProps> = ({ onDiscoverPathClick, hasSavedData, onContinue, onStartNew }) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <div className="container mx-auto px-6 z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            {hasSavedData ? (
              <>
                <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
                  Welcome Back to <span className="gradient-text">PrismI</span>!
                </h1>
                <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto lg:mx-0 mb-8">
                  Your personalized career dashboard is waiting for you. Continue where you left off or explore a new path.
                </p>
                <div className="flex justify-center lg:justify-start gap-4">
                  <button onClick={onContinue} className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg shadow-sky-500/20">
                    Continue Your Path
                  </button>
                  <button onClick={onStartNew} className="bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105">
                    Explore Anew
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="inline-block bg-gray-800/50 border border-gray-700 rounded-full px-4 py-1 text-sm text-sky-300 mb-4">
                  Powered by Gemini AI
                </div>
                <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
                  Navigate Your Future with <span className="gradient-text">AI-Powered Career Guidance</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto lg:mx-0 mb-8">
                  PrismI provides hyper-personalized career roadmaps for Indian students. Move beyond generic advice and discover a path that truly fits your unique skills, interests, and personality.
                </p>
                <div className="flex justify-center lg:justify-start gap-4">
                  <button onClick={onDiscoverPathClick} className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg shadow-sky-500/20">
                    Discover Your Path
                  </button>
                  <button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth'})} className="bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105">
                    Learn More
                  </button>
                </div>
              </>
            )}
          </div>
          {/* Updated image section for better visuals and layout stability */}
          <div className="hidden lg:flex items-center justify-center p-4">
            <img 
              src="https://images.unsplash.com/photo-1677756119517-756a188d2d94?q=80&w=1200&auto=format&fit=crop" 
              alt="Abstract AI visualization representing career paths" 
              className="rounded-3xl shadow-2xl shadow-sky-500/20 object-cover w-full max-w-md aspect-square"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
