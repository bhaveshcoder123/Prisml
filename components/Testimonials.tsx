
import React from 'react';

const testimonials = [
  {
    quote: "PrismI was a game-changer. I was confused between engineering and design, and the AI report gave me a clear direction that felt genuinely me. The roadmap is now my daily guide.",
    name: "Aarav Sharma",
    title: "Class 12 Student, Delhi",
    image: "https://picsum.photos/id/1005/100/100"
  },
  {
    quote: "The career exploration hub is amazing. I found out about roles like 'Green Energy Engineer' which I didn't even know existed. The market data for India is super helpful.",
    name: "Priya Singh",
    title: "B.Tech 2nd Year, Mumbai",
    image: "https://picsum.photos/id/1011/100/100"
  },
  {
    quote: "I finally have an actionable plan. Instead of just watching random tutorials, I'm building projects suggested by PrismI that are relevant to my goal of becoming a data analyst.",
    name: "Rohan Kumar",
    title: "B.Com Graduate, Bengaluru",
    image: "https://picsum.photos/id/1025/100/100"
  }
];

const TestimonialCard: React.FC<typeof testimonials[0]> = ({ quote, name, title, image }) => (
  <div className="bg-gray-900/50 p-8 rounded-2xl border border-gray-800 h-full flex flex-col">
    <p className="text-gray-300 flex-grow">"{quote}"</p>
    <div className="flex items-center mt-6">
      <img src={image} alt={name} className="w-12 h-12 rounded-full mr-4 border-2 border-sky-500" />
      <div>
        <p className="font-bold text-white">{name}</p>
        <p className="text-sm text-gray-400">{title}</p>
      </div>
    </div>
  </div>
);

const Testimonials: React.FC = () => {
  return (
    <section id="testimonials" className="py-20 sm:py-32">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Trusted by Students Across India
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            Hear what your peers are saying about their journey with PrismI.
          </p>
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} {...testimonial} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
