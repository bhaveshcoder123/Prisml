
import React from 'react';
import { PrismIcon, TwitterIcon, LinkedInIcon } from './Icons';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#020410] border-t border-gray-800">
      <div className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <a href="#" className="flex items-center gap-2 text-2xl font-bold mb-4">
              <PrismIcon className="w-8 h-8 text-sky-400" />
              <span className="gradient-text">PrismI</span>
            </a>
            <p className="text-gray-400">AI-Powered Career Guidance for the next generation of Indian talent.</p>
          </div>
          <div className="grid grid-cols-2 md:col-span-2 gap-8">
            <div>
              <h4 className="font-bold text-white mb-4">Navigation</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-gray-400 hover:text-sky-400">Features</a></li>
                <li><a href="#how-it-works" className="text-gray-400 hover:text-sky-400">How It Works</a></li>
                <li><a href="#testimonials" className="text-gray-400 hover:text-sky-400">Testimonials</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-sky-400">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-sky-400">Terms of Service</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-gray-500">&copy; {currentYear} PrismI. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <a href="#" className="text-gray-500 hover:text-sky-400 transition-colors"><TwitterIcon className="w-6 h-6" /></a>
            <a href="#" className="text-gray-500 hover:text-sky-400 transition-colors"><LinkedInIcon className="w-6 h-6" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
