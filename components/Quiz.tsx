import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";

interface QuizProps {
  onGoHome: () => void;
  onProfileGenerated: (data: { profile: any, answers: Record<string, string> }) => void;
}

interface Question {
    question: string;
    key: string;
    type: 'text' | 'number' | 'choice' | 'textarea';
    placeholder?: string;
    options?: string[];
    next: string | ((answers: Record<string, any>) => string);
}

const allQuestions: Record<string, Question> = {
    'name': { question: "First, what should we call you?", key: 'name', type: 'text', placeholder: 'Enter your full name', next: 'age' },
    'age': { question: "What is your Age?", key: 'age', type: 'number', placeholder: 'Enter your age', next: 'status' },
    'status': {
        question: "Are you in School, College, or Graduated?", key: 'status', type: 'choice', options: ['School', 'College', 'Graduated'],
        next: (answers) => {
            switch (answers.status) {
                case 'School': return 'class_level';
                case 'College': return 'degree';
                case 'Graduated': return 'grad_college';
                default: return 'preferences';
            }
        },
    },
    'class_level': { question: "Which class are you in?", key: 'class_level', type: 'number', placeholder: 'e.g., 10, 11, 12', next: (answers) => (parseInt(answers.class_level, 10) > 10 ? 'stream' : 'preferences') },
    'stream': { question: "Which stream are you in?", key: 'stream', type: 'choice', options: ['Science', 'Commerce', 'Arts'], next: (answers) => (answers.stream === 'Science' ? 'science_type' : 'preferences') },
    'science_type': { question: "Are you PCM or PCB?", key: 'science_type', type: 'choice', options: ['PCM (Physics, Chemistry, Maths)', 'PCB (Physics, Chemistry, Biology)'], next: 'preferences' },
    'degree': { question: "Which degree are you pursuing?", key: 'degree', type: 'text', placeholder: 'e.g., B.Tech, B.A., B.Sc.', next: 'specialization' },
    'specialization': { question: "Which branch or specialization are you pursuing?", key: 'specialization', type: 'text', placeholder: 'e.g., Computer Science, Economics', next: 'college_name' },
    'college_name': { question: "Which college are you studying in?", key: 'college_name', type: 'text', placeholder: 'Enter your college name', next: 'preferences' },
    'grad_college': { question: "Which college did you pass out from?", key: 'grad_college', type: 'text', placeholder: 'Enter your college name', next: 'grad_cgpa' },
    'grad_cgpa': { question: "What was your CGPA or Grade?", key: 'grad_cgpa', type: 'text', placeholder: 'e.g., 8.5 CGPA or 85%', next: 'preferences' },
    'preferences': {
        question: "Anything else? Mention any specific preferences, passions, or things we should keep in mind.",
        key: 'preferences',
        type: 'textarea',
        placeholder: 'e.g., "I love creative writing", "Interested in remote work", or "I want a career with high social impact"...',
        next: 'submit'
    },
};

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const profileResponseSchema = {
    type: Type.OBJECT,
    properties: {
        suggestedCareers: {
            type: Type.ARRAY,
            description: "A list of 3-4 career suggestions.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "The title of the career path." },
                    reasoning: { type: Type.STRING, description: "A detailed paragraph explaining why this career is a good fit for the user." },
                    skillsToDevelop: { type: Type.ARRAY, description: "A list of key skills to develop for this career.", items: { type: Type.STRING }}
                },
                required: ["title", "reasoning", "skillsToDevelop"],
            }
        },
        personalityAnalysis: { type: Type.STRING, description: "A brief analysis of the user's potential strengths based on their profile." },
        actionableNextSteps: { type: Type.ARRAY, description: "A list of 3 concrete, actionable next steps the user can take.", items: { type: Type.STRING }}
    },
    required: ["suggestedCareers", "personalityAnalysis", "actionableNextSteps"],
};

const LoadingSpinner: React.FC<{message: string}> = ({ message }) => (
    <div className="flex flex-col items-center justify-center text-center animate-fade-in">
        <div className="relative w-24 h-24 mb-6">
            <div className="absolute inset-0 border-4 border-sky-500/30 rounded-full"></div>
            <div className="absolute inset-0 border-t-4 border-sky-500 rounded-full animate-spin"></div>
        </div>
        <h2 className="text-3xl font-bold mb-2 gradient-text">{message}</h2>
        <p className="text-gray-400">Our AI is analyzing your answers. This may take a moment.</p>
    </div>
);

const Quiz: React.FC<QuizProps> = ({ onGoHome, onProfileGenerated }) => {
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [history, setHistory] = useState<string[]>(['name']);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const currentQuestionKey = history[history.length - 1];
    const currentQuestion = allQuestions[currentQuestionKey];

    // Auto-focus the input field when a new question appears
    useEffect(() => {
        const input = document.querySelector('input[autofocus], textarea');
        if (input instanceof HTMLElement) {
            input.focus();
        }
    }, [currentQuestionKey]);
    
    const handleNext = () => {
        if (!formData[currentQuestion.key]) return;

        let nextKey: string;
        if (typeof currentQuestion.next === 'function') {
            nextKey = currentQuestion.next(formData);
        } else {
            nextKey = currentQuestion.next;
        }

        if (nextKey === 'submit' || !allQuestions[nextKey]) {
            handleSubmit();
        } else {
            setHistory([...history, nextKey]);
        }
    };

    const handleBack = () => {
        setHistory(history.slice(0, -1));
    };
    
    const handleSubmit = async (finalAnswers = formData) => {
        setIsLoading(true);
        setError(null);
        try {
            const prompt = `Here is a student's profile: ${JSON.stringify(finalAnswers, null, 2)}. Please provide career guidance.`;
            
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                  systemInstruction: "You are PrismI, an expert AI career advisor for Indian students. Your goal is to provide personalized, insightful, and actionable career guidance. Based on the user's profile, generate a concise and encouraging analysis in JSON format. Avoid generic advice. Tailor your recommendations to the Indian job market context where possible.",
                  responseMimeType: "application/json",
                  responseSchema: profileResponseSchema,
                },
            });
            const parsedResults = JSON.parse(response.text);
            onProfileGenerated({ profile: parsedResults, answers: finalAnswers });
        } catch (e) {
            console.error(e);
            setError("Sorry, we couldn't generate your profile right now. Please try again later.");
            setIsLoading(false);
        }
    };

    const handleChange = (key: string, value: string) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' && formData[currentQuestion.key]) {
            event.preventDefault();
            handleNext();
        }
    };

    const handleChoiceSelection = (option: string) => {
        handleChange(currentQuestion.key, option);
        setTimeout(() => {
            const updatedAnswers = { ...formData, [currentQuestion.key]: option };
            
            let nextKey: string;
            if (typeof currentQuestion.next === 'function') {
                nextKey = currentQuestion.next(updatedAnswers);
            } else {
                nextKey = currentQuestion.next;
            }
    
            if (nextKey === 'submit' || !allQuestions[nextKey]) {
                handleSubmit(updatedAnswers);
            } else {
                setHistory(prev => [...prev, nextKey]);
            }
        }, 300);
    };
    
    const renderContent = () => {
        if (isLoading) {
            return <LoadingSpinner message="Building Your Profile..." />;
        }

        if (error) {
            return (
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-400 mb-4">An Error Occurred</h2>
                    <p className="text-gray-400 mb-6">{error}</p>
                    <button onClick={() => { setError(null); setIsLoading(false); }} className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-6 rounded-full transition-all duration-300">
                        Try Again
                    </button>
                </div>
            );
        }

        return (
            <div>
                <div className="mb-8">
                    <div className="w-full bg-gray-700/50 rounded-full h-2">
                        <div className="bg-gradient-to-r from-sky-500 to-purple-500 h-2 rounded-full transition-all duration-500" style={{ width: `${(history.length / 7) * 100}%` }}></div>
                    </div>
                </div>
                <h2 className="text-3xl font-bold text-center mb-8">{currentQuestion.question}</h2>
                <div className="space-y-4">
                    {(currentQuestion.type === 'text' || currentQuestion.type === 'number') && (
                        <input 
                            type={currentQuestion.type} 
                            placeholder={currentQuestion.placeholder} 
                            value={formData[currentQuestion.key] || ''} 
                            onChange={(e) => handleChange(currentQuestion.key, e.target.value)} 
                            onKeyDown={handleKeyDown}
                            autoFocus
                            className="w-full bg-gray-900/50 border-2 border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all" />
                    )}
                    {currentQuestion.type === 'textarea' && (
                        <textarea
                            placeholder={currentQuestion.placeholder}
                            value={formData[currentQuestion.key] || ''}
                            onChange={(e) => handleChange(currentQuestion.key, e.target.value)}
                            rows={4}
                            autoFocus
                            className="w-full bg-gray-900/50 border-2 border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all resize-none"
                        />
                    )}
                    {currentQuestion.type === 'choice' && currentQuestion.options?.map(option => (
                        <button key={option} onClick={() => handleChoiceSelection(option)} className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${formData[currentQuestion.key] === option ? 'bg-sky-500/20 border-sky-500' : 'bg-gray-900/50 border-gray-700 hover:border-sky-500/50'}`}>{option}</button>
                    ))}
                </div>
                <div className="flex justify-between mt-12">
                    <button onClick={handleBack} disabled={history.length <= 1} className="bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600 text-white font-bold py-2 px-6 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">Back</button>
                    {currentQuestion.type !== 'choice' && (
                        <button onClick={handleNext} disabled={!formData[currentQuestion.key]} className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-6 rounded-full transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
                            { (typeof currentQuestion.next !== 'function' && currentQuestion.next === 'submit') || (typeof currentQuestion.next === 'function' && allQuestions[currentQuestion.next(formData)] === undefined) ? 'Generate Profile' : 'Next'}
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <section className="min-h-screen flex items-center justify-center pt-24 pb-12">
            <div className="container mx-auto px-6">
                <div className="max-w-3xl mx-auto bg-[#0d1120] border border-gray-800 rounded-2xl shadow-2xl shadow-black/20 p-8 transition-all duration-500">
                    {renderContent()}
                </div>
            </div>
        </section>
    );
};

export default Quiz;