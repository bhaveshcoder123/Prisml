import React from 'react';

interface CTAProps {
  onGetStartedClick: () => void;
}

const CTA: React.FC<CTAProps> = ({ onGetStartedClick }) => {
  return (
    <section className="py-20 sm:py-32">
      <div className="container mx-auto px-6">
        <div className="relative rounded-2xl overflow-hidden p-12 text-center bg-gradient-to-r from-sky-500 via-purple-500 to-pink-500 animated-gradient-bg">
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              Ready to Unlock Your Potential?
            </h2>
            <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto">
              Your personalized career roadmap is just a few clicks away. Start for free and take the first confident step towards a successful future.
            </p>
            <button onClick={onGetStartedClick} className="mt-8 bg-white hover:bg-gray-200 text-gray-900 font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-2xl">
              Get Started for Free
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;