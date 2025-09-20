
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import Testimonials from './components/Testimonials';
import CTA from './components/CTA';
import Footer from './components/Footer';
import Quiz from './components/Quiz';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem('prismi_user_profile');
      const savedAnswers = localStorage.getItem('prismi_user_quiz_answers');
      if (savedProfile && savedAnswers) {
        setUserProfile(JSON.parse(savedProfile));
        setQuizAnswers(JSON.parse(savedAnswers));
      }
    } catch (error) {
      console.error("Failed to parse user data from localStorage", error);
      // Clear corrupted data
      localStorage.removeItem('prismi_user_profile');
      localStorage.removeItem('prismi_user_quiz_answers');
    }
  }, []);

  const showQuiz = () => setCurrentPage('quiz');
  const showHome = () => setCurrentPage('home');
  const showDashboard = () => setCurrentPage('dashboard');

  const handleStartNew = () => {
    localStorage.removeItem('prismi_user_profile');
    localStorage.removeItem('prismi_user_quiz_answers');
    localStorage.removeItem('prismi_user_roadmap');
    localStorage.removeItem('prismi_completed_steps');
    setUserProfile(null);
    setQuizAnswers(null);
    showQuiz();
  };

  const handleProfileGenerated = ({ profile, answers }: { profile: any, answers: Record<string, string> }) => {
    try {
      localStorage.setItem('prismi_user_profile', JSON.stringify(profile));
      localStorage.setItem('prismi_user_quiz_answers', JSON.stringify(answers));
      setUserProfile(profile);
      setQuizAnswers(answers);
      showDashboard();
    } catch (error) {
      console.error("Failed to save user data to localStorage", error);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'quiz':
        return <Quiz onGoHome={showHome} onProfileGenerated={handleProfileGenerated} />;
      case 'dashboard':
        if (userProfile && quizAnswers) {
          return <Dashboard profileData={userProfile} formData={quizAnswers} onStartOver={handleStartNew} />;
        }
        // If there's no data, redirect to quiz
        showQuiz();
        return null;
      case 'home':
      default:
        return (
          <>
            <Hero
              hasSavedData={!!userProfile}
              onContinue={showDashboard}
              onStartNew={handleStartNew}
              onDiscoverPathClick={showQuiz}
            />
            <Features />
            <HowItWorks />
            <Testimonials />
            <CTA onGetStartedClick={userProfile ? handleStartNew : showQuiz} />
          </>
        );
    }
  };

  return (
    <div className="bg-[#020410] text-gray-200 min-h-screen overflow-x-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full z-0">
         <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] bg-purple-600/20 rounded-full filter blur-3xl opacity-50 animate-blob"></div>
         <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-sky-500/20 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
         <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] bg-pink-500/20 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
      </div>
      <div className="relative z-10">
        <Header onGetStartedClick={userProfile ? showDashboard : showQuiz} onLogoClick={showHome} />
        <main>
          {renderPage()}
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default App;
