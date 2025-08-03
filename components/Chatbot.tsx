import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SparklesIcon, PaperAirplaneIcon, XMarkIcon } from './icons/IconComponents';
import { getToolRecommendation } from '../services/geminiService';
import { TOOLS } from '../constants';
import Spinner from './Spinner';

interface ChatMessage {
    sender: 'user' | 'ai';
    text: string;
    recommendation?: {
        toolId: string;
        tool: (typeof TOOLS)[0];
    };
}

const Chatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([
                { sender: 'ai', text: "Hello! How can I help you with your PDF today? Tell me what you need to do." }
            ]);
        }
    }, [isOpen]);
    
    useEffect(() => {
        chatContainerRef.current?.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading) return;

        const newUserMessage: ChatMessage = { sender: 'user', text: userInput };
        setMessages(prev => [...prev, newUserMessage]);
        const currentInput = userInput;
        setUserInput('');
        setIsLoading(true);

        try {
            const result = await getToolRecommendation(currentInput);
            const recommendedTool = TOOLS.find(t => t.id === result.toolId);

            const aiResponse: ChatMessage = { sender: 'ai', text: result.recommendation };
            if (recommendedTool) {
                aiResponse.recommendation = {
                    toolId: result.toolId,
                    tool: recommendedTool
                };
            }
            setMessages(prev => [...prev, aiResponse]);

        } catch (error) {
            const errorResponse: ChatMessage = { sender: 'ai', text: "I'm sorry, I had trouble connecting. Please try again in a moment." };
            setMessages(prev => [...prev, errorResponse]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className={`fixed bottom-5 right-5 z-50 transition-transform duration-300 ${isOpen ? 'scale-0' : 'scale-100'}`}>
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-primary-700 text-white w-16 h-16 rounded-full shadow-lg hover:bg-primary-800 flex items-center justify-center"
                    aria-label="Open AI assistant"
                >
                    <SparklesIcon className="w-8 h-8" />
                </button>
            </div>

            <div className={`fixed bottom-5 right-5 z-[60] w-[calc(100%-2.5rem)] max-w-sm h-[70vh] max-h-[600px] bg-paper dark:bg-slate-900 rounded-lg shadow-2xl border-2 border-slate-300 dark:border-slate-700 flex flex-col transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}>
                <header className="flex items-center justify-between p-4 border-b border-slate-300 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                        <SparklesIcon className="w-6 h-6 text-primary-600" />
                        <h2 className="text-lg font-bold font-display text-slate-800 dark:text-white">AI Assistant</h2>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-slate-800 dark:hover:text-white">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </header>
                
                <div ref={chatContainerRef} className="flex-grow p-4 space-y-4 overflow-y-auto">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.sender === 'ai' && <div className="w-8 h-8 rounded-full bg-primary-100/50 dark:bg-primary-900/50 border border-slate-300 dark:border-slate-600 flex items-center justify-center flex-shrink-0"><SparklesIcon className="w-5 h-5 text-primary-700 dark:text-primary-400" /></div>}
                            <div className={`max-w-xs md:max-w-sm px-4 py-2 rounded-lg ${msg.sender === 'user' ? 'bg-primary-700 text-white' : 'bg-white/80 dark:bg-slate-800 text-slate-800 dark:text-slate-200'}`}>
                                <p className="text-sm">{msg.text}</p>
                                {msg.recommendation && (
                                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-600">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-shrink-0">{React.cloneElement(msg.recommendation.tool.icon, {className: "w-8 h-8 text-primary-700 dark:text-primary-400"})}</div>
                                            <div>
                                                <p className="font-bold text-slate-800 dark:text-white">{msg.recommendation.tool.title}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{msg.recommendation.tool.description}</p>
                                            </div>
                                        </div>
                                        <Link to={msg.recommendation.tool.path} onClick={() => setIsOpen(false)} className="block w-full text-center mt-3 bg-primary-600 text-white px-3 py-1.5 rounded-md text-sm font-semibold hover:bg-primary-700">Go to Tool</Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                     {isLoading && (
                        <div className="flex items-end gap-2 justify-start">
                            <div className="w-8 h-8 rounded-full bg-primary-100/50 dark:bg-primary-900/50 border border-slate-300 dark:border-slate-600 flex items-center justify-center flex-shrink-0"><SparklesIcon className="w-5 h-5 text-primary-700 dark:text-primary-400" /></div>
                            <div className="max-w-xs px-4 py-2 rounded-lg bg-white/80 dark:bg-slate-800">
                                <Spinner/>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-paper/80 dark:bg-slate-900/80 border-t border-slate-300 dark:border-slate-700">
                    <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder="e.g., I need to combine files"
                            className="flex-grow px-4 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-400 dark:border-slate-600 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-600 text-sm"
                            disabled={isLoading}
                        />
                        <button type="submit" className="p-3 bg-primary-700 text-white rounded-full hover:bg-primary-800 disabled:bg-primary-400" disabled={!userInput.trim() || isLoading}>
                            <PaperAirplaneIcon className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default Chatbot;
