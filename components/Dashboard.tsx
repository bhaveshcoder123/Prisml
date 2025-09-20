import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { CheckIcon, LightbulbIcon } from './Icons';
import Chatbot from './Chatbot';

interface DashboardProps {
    profileData: any;
    formData: Record<string, string>;
    onStartOver: () => void;
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const roadmapResponseSchema = {
    type: Type.OBJECT,
    properties: {
        phases: {
            type: Type.ARRAY,
            description: "A list of learning phases, from fundamentals to advanced.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "Title of the phase, e.g., 'Phase 1: Foundational Skills'." },
                    description: { type: Type.STRING, description: "A brief summary of what this phase covers." },
                    steps: {
                        type: Type.ARRAY,
                        description: "A list of actionable steps within this phase.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING, description: "A clear, concise title for the step." },
                                resource: {
                                    type: Type.OBJECT,
                                    properties: {
                                        name: { type: Type.STRING, description: "Name of the resource. IMPORTANT: Must include a human-readable fallback in parentheses, e.g., 'Striver's SDE Sheet (search on YouTube)'." },
                                        url: { type: Type.STRING, description: "A valid URL to the resource." },
                                        type: { type: Type.STRING, description: "Type of resource, e.g., 'YouTube Video', 'Book', 'Article', 'Coursera Course'." }
                                    },
                                    required: ["name", "url", "type"]
                                }
                            },
                            required: ["title", "resource"]
                        }
                    }
                },
                required: ["title", "description", "steps"]
            }
        }
    },
    required: ["phases"],
};

const LoadingSpinner: React.FC<{message: string}> = ({ message }) => (
    <div className="flex flex-col items-center justify-center text-center animate-fade-in py-16">
        <div className="relative w-24 h-24 mb-6">
            <div className="absolute inset-0 border-4 border-sky-500/30 rounded-full"></div>
            <div className="absolute inset-0 border-t-4 border-sky-500 rounded-full animate-spin"></div>
        </div>
        <h2 className="text-3xl font-bold mb-2 gradient-text">{message}</h2>
        <p className="text-gray-400">Our AI is analyzing your request. This may take a moment.</p>
    </div>
);

const ChevronDownIcon: React.FC<{className?: string}> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
);
  
const AccordionItem: React.FC<{ title: string; description: string, children: React.ReactNode, initiallyOpen?: boolean }> = ({ title, description, children, initiallyOpen = false }) => {
    const [isOpen, setIsOpen] = useState(initiallyOpen);
    return (
        <div className="border-b border-gray-700">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left py-4 px-2">
                <div>
                    <h4 className="font-bold text-lg">{title}</h4>
                    <p className="text-sm text-gray-400">{description}</p>
                </div>
                <ChevronDownIcon className={`w-6 h-6 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && <div className="py-4 px-2 animate-fade-in">{children}</div>}
        </div>
    );
};


const Dashboard: React.FC<DashboardProps> = ({ profileData, formData, onStartOver }) => {
    const [viewMode, setViewMode] = useState<'profile' | 'roadmap' | 'loading'>('profile');
    const [loadingMessage, setLoadingMessage] = useState('');
    const [selectedCareer, setSelectedCareer] = useState<any>(null);
    const [roadmapData, setRoadmapData] = useState<any>(null);
    const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
    const [error, setError] = useState<string | null>(null);

    const [currentProfileData, setCurrentProfileData] = useState(profileData);
    const [chatHistory, setChatHistory] = useState<{ role: 'model' | 'user'; text: string }[]>([]);
    const [isChatLoading, setIsChatLoading] = useState(false);
    
    useEffect(() => {
        if (chatHistory.length > 0) return; // Prevent re-initializing chat

        let initialMessage = `Hello, ${formData.name}! 👋 Based on your profile, I've put together some initial career suggestions for you below. ✨`;

        if (formData.preferences && formData.preferences.trim()) {
            initialMessage = `Hello, ${formData.name}! 👋 I noticed you mentioned an interest in "${formData.preferences}". That's a great starting point, and I've kept that in mind for the suggestions below. 🧠`;
        }

        initialMessage += `\n\nHow do these look to you? We can refine them, or you can ask me for advice on something more specific. Just let me know what you're thinking! 😊`;

        setChatHistory([{ role: 'model', text: initialMessage }]);
    }, [formData]);


    useEffect(() => {
        try {
            const savedRoadmap = localStorage.getItem('prismi_user_roadmap');
            const savedCareer = localStorage.getItem('prismi_selected_career');
            if (savedRoadmap && savedCareer) {
                const parsedRoadmap = JSON.parse(savedRoadmap);
                const parsedCareer = JSON.parse(savedCareer);
                setRoadmapData(parsedRoadmap);
                setSelectedCareer(parsedCareer);
                
                const savedSteps = localStorage.getItem(`prismi_completed_steps_${parsedCareer.title}`);
                 if (savedSteps) {
                    setCompletedSteps(new Set(JSON.parse(savedSteps)));
                }
                setViewMode('roadmap');
            }
        } catch (e) {
            console.error("Failed to load roadmap data from localStorage", e);
        }
    }, []);

    const handleGenerateRoadmap = async (career: any) => {
        setSelectedCareer(career);
        setViewMode('loading');
        setLoadingMessage(`Generating Roadmap for ${career.title}...`);
        setError(null);
        setRoadmapData(null);

        try {
            const roadmapPrompt = `Based on the following user profile: ${JSON.stringify(formData, null, 2)}. The user has chosen the career path: "${career.title}". Generate a detailed, step-by-step learning roadmap to help them become job-ready for this career.

**CRITICAL URL AND RESOURCE REQUIREMENTS:**
1.  **LINK VALIDITY IS THE ABSOLUTE HIGHEST PRIORITY**: Every single URL provided **MUST** be active, publicly accessible, and working at the time of generation. A broken link is a critical failure. Double-check every URL.
2.  **USE ONLY TRUSTED, STABLE SOURCES**: Prioritize resources in this specific order:
    a. Official documentation (e.g., react.dev, python.org).
    b. Major free learning platforms (e.g., freeCodeCamp, The Odin Project, MDN Web Docs).
    c. Top-tier, reputable educational YouTube channels and courses (e.g., channels for freeCodeCamp.org, Traversy Media, Fireship, Programming with Mosh; or courses like Harvard's CS50).
    d. Major MOOCs (Coursera, edX), but prefer freely accessible content.
    e. **AVOID**: Do NOT link to personal blogs, Medium articles (unless by an official source), forum posts, or content behind a hard paywall.
3.  **PROVIDE HUMAN-READABLE FALLBACKS (IMPORTANT!)**: To ensure the roadmap remains useful even if a link breaks, for **every resource**, the resource name must include a fallback search instruction in parentheses. This makes the guidance more resilient.
    *   **Good Example 1:** "Striver's SDE Sheet (search for 'Striver's SDE Sheet' on YouTube)".
    *   **Good Example 2:** "Harvard's CS50 (find on edX or YouTube)".
    *   **Good Example 3:** "React Official Tutorial (on the react.dev website)".
    *   **Bad Example:** "Striver's SDE Sheet".
4.  **DIVERSIFY RESOURCES**: Include a mix of resource types, such as official documentation for reference, video tutorials (from YouTube) for visual learning, and articles for deep dives.
The roadmap should be broken down into logical phases (Foundations, Intermediate, Advanced, etc.). The final output must be in the specified JSON format.`;
            
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: roadmapPrompt,
                config: {
                  systemInstruction: "You are a senior career coach and curriculum designer. Your task is to create a practical, actionable, and resource-rich learning roadmap. Your absolute highest priority is the quality and validity of the resource URLs. Every URL must be active. **Crucially, for every resource, you must also provide a human-readable fallback instruction in the resource name (e.g., 'Resource Name (search on YouTube)') to prevent issues with broken links.** The output must be in JSON format and strictly adhere to the provided schema. Do not include any introductory text or pleasantries outside of the JSON structure.",
                  responseMimeType: "application/json",
                  responseSchema: roadmapResponseSchema,
                },
            });
            const parsedResults = JSON.parse(response.text);
            setRoadmapData(parsedResults);
            localStorage.setItem('prismi_user_roadmap', JSON.stringify(parsedResults));
            localStorage.setItem('prismi_selected_career', JSON.stringify(career));
            
            const newCompletedSteps = new Set<string>();
            setCompletedSteps(newCompletedSteps); // Reset progress for new roadmap
            localStorage.setItem(`prismi_completed_steps_${career.title}`, JSON.stringify([]));

            const motivationalMessage = {
                role: 'model' as const,
                text: `Awesome choice! I've just generated your personalized roadmap to become a ${career.title}. 🚀\n\nThis is your unique path to success. Remember, every expert was once a beginner. Stay curious, be consistent, and celebrate small wins. You've totally got this! 💪✨`
            };
            setChatHistory(prev => [...prev, motivationalMessage]);

            setViewMode('roadmap');
        } catch (e) {
            console.error(e);
            setError("We couldn't generate the roadmap at this moment. Please try again.");
            setViewMode('profile'); // Go back to profile page on error
        }
    };

    const handleToggleStep = (stepTitle: string) => {
        const newSet = new Set(completedSteps);
        if (newSet.has(stepTitle)) {
            newSet.delete(stepTitle);
        } else {
            newSet.add(stepTitle);
        }
        setCompletedSteps(newSet);
        if (selectedCareer) {
            localStorage.setItem(`prismi_completed_steps_${selectedCareer.title}`, JSON.stringify(Array.from(newSet)));
        }
    };

    const renderRoadmapView = () => {
        if (!roadmapData || !selectedCareer) return null;

        const totalSteps = roadmapData.phases.reduce((acc: number, phase: any) => acc + phase.steps.length, 0);
        const progress = totalSteps > 0 ? (completedSteps.size / totalSteps) * 100 : 0;
        
        return (
            <div className="text-left animate-fade-in">
                <button onClick={() => setViewMode('profile')} className="mb-6 text-sm text-sky-400 hover:text-sky-300 transition-colors">
                  &larr; Back to Analysis
                </button>

                <h2 className="text-3xl font-bold mb-2">Your Roadmap to <span className="gradient-text">{selectedCareer.title}</span></h2>
                <p className="text-gray-400 mb-6">Follow these steps to build your skills and achieve your career goals. Check off items as you complete them.</p>

                <div className="mb-6">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-sky-300">Progress</span>
                        <span className="text-sm font-medium text-sky-300">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-700/50 rounded-full h-2.5">
                        <div className="bg-sky-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>

                <div className="space-y-2">
                    {roadmapData.phases.map((phase: any, index: number) => (
                        <AccordionItem key={index} title={phase.title} description={phase.description} initiallyOpen={index === 0}>
                            <ul className="space-y-4">
                                {phase.steps.map((step: any, stepIndex: number) => (
                                    <li key={stepIndex} className="flex items-start gap-4 p-3 rounded-md bg-gray-900/50 hover:bg-gray-800/50 transition-colors">
                                        <div className="mt-1">
                                           <input 
                                                type="checkbox" 
                                                id={`step-${index}-${stepIndex}`} 
                                                className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-sky-500 focus:ring-sky-600 cursor-pointer"
                                                checked={completedSteps.has(step.title)}
                                                onChange={() => handleToggleStep(step.title)}
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor={`step-${index}-${stepIndex}`} className={`font-medium cursor-pointer ${completedSteps.has(step.title) ? 'line-through text-gray-500' : ''}`}>{step.title}</label>
                                            {(() => {
                                                const resourceName = step.resource.name;
                                                const fallbackMatch = resourceName.match(/\(([^)]+)\)$/);
                                                const mainName = fallbackMatch ? resourceName.replace(fallbackMatch[0], '').trim() : resourceName;
                                                const fallbackText = fallbackMatch ? fallbackMatch[1] : null;

                                                return (
                                                    <>
                                                        <a href={step.resource.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-sky-400 hover:underline mt-1">
                                                            {mainName} ({step.resource.type})
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                                                              <path fillRule="evenodd" d="M5.22 14.78a.75.75 0 0 0 1.06 0l7.22-7.22v5.69a.75.75 0 0 0 1.5 0v-7.5a.75.75 0 0 0-.75-.75h-7.5a.75.75 0 0 0 0 1.5h5.69l-7.22 7.22a.75.75 0 0 0 0 1.06Z" clipRule="evenodd" />
                                                            </svg>
                                                        </a>
                                                        {fallbackText && (
                                                            <p className="text-xs text-gray-500 mt-1 italic">
                                                                <span className='font-semibold'>Tip:</span> If the link is broken, {fallbackText}.
                                                            </p>
                                                        )}
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </AccordionItem>
                    ))}
                </div>
                <p className="text-center text-xs text-gray-500 mt-8">
                    *We do our best to provide working links, but they can change over time. We apologize for any broken links you may encounter.
                </p>
            </div>
        );
    };

    const renderProfileView = () => {
         return (
            <div className="text-left animate-fade-in">
                <h2 className="text-3xl font-bold mb-2 text-center">Hello, <span className="gradient-text">{formData.name}</span>!</h2>
                <p className="text-gray-400 text-center mb-8">Here's your personalized AI-powered career analysis.</p>
                
                <div className="space-y-8">
                    <div>
                        <h3 className="text-xl font-bold text-center text-sky-400 mb-2">Your AI Counselor</h3>
                        <p className="text-sm text-gray-500 text-center mb-4">Chat with me to refine your career path or ask any questions!</p>
                        <Chatbot
                            formData={formData}
                            currentProfileData={currentProfileData}
                            onProfileUpdate={(updatedCareers) => {
                                setCurrentProfileData(prev => ({ ...prev, suggestedCareers: updatedCareers }));
                            }}
                            chatHistory={chatHistory}
                            setChatHistory={setChatHistory}
                            isChatLoading={isChatLoading}
                            setIsChatLoading={setIsChatLoading}
                        />
                    </div>

                    <div>
                        <h3 className="text-xl font-bold text-sky-400 mb-3">Top Career Suggestions</h3>
                        <p className="text-sm text-gray-500 mb-3">These cards can change based on your conversation above. Click one to generate a roadmap.</p>
                        <div className="space-y-4">
                            {currentProfileData.suggestedCareers.map((career: any, index: number) => (
                                <button key={index} onClick={() => handleGenerateRoadmap(career)} className="w-full text-left bg-gray-900/50 p-4 rounded-lg border border-gray-700 hover:border-sky-500 hover:bg-gray-800/50 transition-all duration-300 cursor-pointer">
                                    <h4 className="font-bold text-lg flex items-center gap-2"><LightbulbIcon className="w-5 h-5 text-yellow-300" /> {career.title}</h4>
                                    <p className="text-gray-400 mt-2 text-sm">{career.reasoning}</p>
                                    <h5 className="font-semibold mt-3 mb-2 text-sm">Key Skills to Develop:</h5>
                                    <ul className="flex flex-wrap gap-2">
                                        {career.skillsToDevelop.map((skill: string, i: number) => <li key={i} className="bg-gray-800 text-xs text-sky-300 px-2 py-1 rounded-full">{skill}</li>)}
                                    </ul>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                         <h3 className="text-xl font-bold text-sky-400 mb-3">Your Actionable Next Steps</h3>
                         <ul className="space-y-2">
                            {currentProfileData.actionableNextSteps.map((step: string, index: number) => (
                                <li key={index} className="flex items-start gap-3">
                                    <CheckIcon className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                                    <span>{step}</span>
                                </li>
                            ))}
                         </ul>
                    </div>
                </div>

                <div className="text-center mt-10">
                    <button onClick={onStartOver} className="bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600 text-white font-bold py-2 px-8 rounded-full transition-all duration-300">
                        Start Over
                    </button>
                </div>
            </div>
        );
    }

    const renderContent = () => {
        if (error && viewMode !== 'profile') return (
            <div className="text-center">
                <h2 className="text-2xl font-bold text-red-400 mb-4">An Error Occurred</h2>
                <p className="text-gray-400 mb-6">{error}</p>
                <button onClick={() => { setError(null); setViewMode('profile'); }} className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-6 rounded-full transition-all duration-300">
                    Go Back
                </button>
            </div>
        );

        switch (viewMode) {
            case 'loading':
                return <LoadingSpinner message={loadingMessage} />;
            case 'roadmap':
                return renderRoadmapView();
            case 'profile':
            default:
                return renderProfileView();
        }
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

export default Dashboard;
