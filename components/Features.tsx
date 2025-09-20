
import React from 'react';
import { ProfileIcon, DashboardIcon, RoadmapIcon, MarketIcon } from './Icons';

const features = [
  {
    icon: <ProfileIcon className="w-10 h-10 text-sky-400" />,
    title: 'Dynamic Profile Creation',
    description: 'Our multi-faceted quiz goes beyond grades, analyzing your aptitude, interests, and personality to create a holistic profile.',
  },
  {
    icon: <DashboardIcon className="w-10 h-10 text-purple-400" />,
    title: 'Personalized Dashboard',
    description: 'Visualize your unique skill fingerprint and explore top career clusters matched specifically to you by our advanced AI.',
  },
  {
    icon: <RoadmapIcon className="w-10 h-10 text-pink-400" />,
    title: 'AI-Generated Roadmaps',
    description: 'Receive step-by-step learning pathways with actionable resources, project ideas, and skill-gap analysis for your chosen career.',
  },
    {
    icon: <MarketIcon className="w-10 h-10 text-green-400" />,
    title: 'Real-Time Market Insights',
    description: 'Get up-to-date information on job trends, salary expectations, and future growth potential in the Indian market.',
  },
];

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string; }> = ({ icon, title, description }) => (
    <div className="bg-gray-900/50 p-6 rounded-2xl border border-gray-800 hover:border-sky-500/50 hover:-translate-y-2 transition-all duration-300 shadow-lg">
      <div className="mb-4 inline-block p-3 bg-gray-800 rounded-full">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
);


const Features: React.FC = () => {
  return (
    <section id="features" className="py-20 sm:py-32">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            A Smarter Way to Plan Your Career
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            PrismI is built on a foundation of data-driven insights and powerful AI to give you an unparalleled advantage.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
