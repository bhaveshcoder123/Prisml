import React, { useState, useEffect } from 'react';
import { PrismIcon } from './Icons';

interface HeaderProps {
  onGetStartedClick: () => void;
  onLogoClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onGetStartedClick, onLogoClick }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-[#020410]/80 backdrop-blur-lg border-b border-gray-800' : 'bg-transparent'}`}>
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <button onClick={onLogoClick} className="flex items-center gap-2 text-2xl font-bold">
          <PrismIcon className="w-8 h-8 text-sky-400" />
          <span className="gradient-text">PrismI</span>
        </button>
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#features" onClick={(e) => { e.preventDefault(); onLogoClick(); setTimeout(() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth'}), 0); }} className="hover:text-sky-400 transition-colors">Features</a>
          <a href="#how-it-works" onClick={(e) => { e.preventDefault(); onLogoClick(); setTimeout(() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth'}), 0); }} className="hover:text-sky-400 transition-colors">How It Works</a>
          <a href="#testimonials" onClick={(e) => { e.preventDefault(); onLogoClick(); setTimeout(() => document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth'}), 0); }} className="hover:text-sky-400 transition-colors">Testimonials</a>
        </nav>
        <button onClick={onGetStartedClick} className="hidden md:block bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-5 rounded-full transition-all duration-300 transform hover:scale-105">
          Get Started
        </button>
      </div>
    </header>
  );
};

export default Header;