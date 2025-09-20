import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { PrismIcon, SendIcon } from './Icons';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const chatResponseSchema = {
    type: Type.OBJECT,
    properties: {
        response: {
            type: Type.STRING,
            description: "A conversational response to the user's message."
        },
        updatedCareers: {
            type: Type.ARRAY,
            description: "An optional list of 3-4 updated career suggestions if the user requested changes. If no changes are needed, this field must be omitted or be an empty array.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "The title of the career path." },
                    reasoning: { type: Type.STRING, description: "A detailed paragraph explaining why this career is a good fit for the user." },
                    skillsToDevelop: { type: Type.ARRAY, description: "A list of key skills to develop for this career.", items: { type: Type.STRING }}
                },
                required: ["title", "reasoning", "skillsToDevelop"],
            }
        }
    },
    required: ["response"],
};

interface ChatbotProps {
    formData: Record<string, string>;
    currentProfileData: any;
    onProfileUpdate: (updatedCareers: any[]) => void;
    chatHistory: { role: 'model' | 'user'; text: string }[];
    setChatHistory: React.Dispatch<React.SetStateAction<{ role: 'model' | 'user'; text: string }[]>>;
    isChatLoading: boolean;
    setIsChatLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const Chatbot: React.FC<ChatbotProps> = ({
    formData,
    currentProfileData,
    onProfileUpdate,
    chatHistory,
    setChatHistory,
    isChatLoading,
    setIsChatLoading
}) => {
    const [userMessage, setUserMessage] = useState('');
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory, isChatLoading]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'; // Reset height
            const scrollHeight = textareaRef.current.scrollHeight;
            textareaRef.current.style.height = `${scrollHeight}px`;
        }
    }, [userMessage]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userMessage.trim() || isChatLoading) return;

        const newUserMessage = { role: 'user' as const, text: userMessage.trim() };
        setChatHistory(prev => [...prev, newUserMessage]);
        setUserMessage('');
        setIsChatLoading(true);

        try {
            const conversationForPrompt = [...chatHistory, newUserMessage].map(m => `${m.role}: ${m.text}`).join('\n');
            const chatPrompt = `The user's original profile is: ${JSON.stringify(formData)}. The current AI analysis and career suggestions are: ${JSON.stringify(currentProfileData)}. The ongoing conversation is:\n${conversationForPrompt}\n\nBased on this entire context, please perform the following tasks:\n1. Provide a direct, conversational response to the user's last message.\n2. If the user explicitly requests different career suggestions (e.g., "give me something more creative," "I don't like these options"), generate a new list of 3 career suggestions that aligns with their new request and place it in the 'updatedCareers' field.\n3. If the user is just asking a question or for clarification, do NOT generate new careers. The 'updatedCareers' field should be omitted in this case.\nYour entire output must be a single JSON object.`;

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: chatPrompt,
                config: {
                  systemInstruction: "You are PrismI, a friendly and supportive AI career counselor for Indian students. Your persona is encouraging, empathetic, and modern. Use emojis (like ✨, 🚀, 💪, 😊) to make the conversation more engaging and fun. Talk like a real human—be encouraging, concise, and natural. Avoid long paragraphs or overly robotic answers. Your goal is to have a helpful, human-like conversation. Your entire output must be a single JSON object that strictly adheres to the provided schema.",
                  responseMimeType: "application/json",
                  responseSchema: chatResponseSchema,
                },
            });

            const parsedResponse = JSON.parse(response.text);
            setChatHistory(prev => [...prev, { role: 'model', text: parsedResponse.response }]);
            if (parsedResponse.updatedCareers && parsedResponse.updatedCareers.length > 0) {
                onProfileUpdate(parsedResponse.updatedCareers);
            }
        } catch (err) {
            console.error(err);
            const errorMessage = "I'm sorry, I encountered an error. Please try asking again. 😔";
            setChatHistory(prev => [...prev, { role: 'model', text: errorMessage }]);
        } finally {
            setIsChatLoading(false);
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSendMessage(event as any);
        }
    };

    return (
        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
            <div ref={chatContainerRef} className="space-y-4 mb-4 h-64 overflow-y-auto pr-2 custom-scrollbar">
                {chatHistory.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'model' && <PrismIcon className="w-7 h-7 text-sky-400 flex-shrink-0 mt-1" />}
                        <div className={`max-w-md rounded-2xl px-4 py-2 ${msg.role === 'user' ? 'bg-sky-600 text-white rounded-br-none' : 'bg-gray-800 rounded-bl-none'}`}>
                            <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                        </div>
                    </div>
                ))}
                {isChatLoading && (
                    <div className="flex items-start gap-3 justify-start">
                        <PrismIcon className="w-7 h-7 text-sky-400 flex-shrink-0 mt-1" />
                        <div className="max-w-md rounded-2xl px-4 py-2 bg-gray-800 rounded-bl-none">
                            <div className="flex items-center gap-1.5 py-2">
                                <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                                <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                                <span className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <form onSubmit={handleSendMessage} className="flex items-start gap-2 border-t border-gray-700 pt-4">
                <textarea
                    ref={textareaRef}
                    value={userMessage}
                    onChange={(e) => setUserMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask for changes or more details..."
                    className="flex-grow bg-gray-800 border-2 border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all resize-none text-sm max-h-32 overflow-y-auto"
                    rows={1}
                    disabled={isChatLoading}
                />
                <button type="submit" disabled={!userMessage.trim() || isChatLoading} className="bg-sky-500 hover:bg-sky-600 text-white p-3 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0">
                    <SendIcon className="w-5 h-5" />
                </button>
            </form>
        </div>
    );
};

export default Chatbot;
