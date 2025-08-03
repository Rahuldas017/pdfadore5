
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Chat } from '@google/genai';
import FileUploader from '../components/FileUploader';
import Spinner from '../components/Spinner';
import { extractTextFromPDF } from '../services/pdfParser';
import { createQAChatSession } from '../services/geminiService';
import { ChatMessage } from '../types';
import { SparklesIcon, DocumentTextIcon, PaperAirplaneIcon } from '../components/icons/IconComponents';
import CommentSection from '../components/CommentSection';
import useDocumentTitle from '../hooks/useDocumentTitle';
import JsonLd from '../components/JsonLd';
import FaqItem from '../components/FaqItem';

const QAPage: React.FC = () => {
  useDocumentTitle("Chat with PDF | Free AI Q&A for Documents | Pdfadore.com");
  
  const [file, setFile] = useState<File | null>(null);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isProcessingFile, setIsProcessingFile] = useState<boolean>(false);
  const [isAiResponding, setIsAiResponding] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  const handleFileSelect = useCallback(async (selectedFile: File) => {
    setFile(selectedFile);
    setMessages([]);
    setError('');
    setIsProcessingFile(true);
    try {
      const text = await extractTextFromPDF(selectedFile);
       if (!text.trim()) {
        setError('Could not extract text from the PDF. It might be an image-only file.');
        setFile(null);
        return;
      }
      const session = createQAChatSession(text);
      setChatSession(session);
      setMessages([{ sender: 'ai', text: `I've finished reading "${selectedFile.name}". What would you like to know?` }]);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to process PDF.');
      setFile(null);
    } finally {
      setIsProcessingFile(false);
    }
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || !chatSession || isAiResponding) return;

    const newUserMessage: ChatMessage = { sender: 'user', text: userInput };
    setMessages(prev => [...prev, newUserMessage, { sender: 'ai', text: '' }]);
    const currentInput = userInput;
    setUserInput('');
    setIsAiResponding(true);

    try {
      const responseStream = await chatSession.sendMessageStream({ message: currentInput });
      
      for await (const chunk of responseStream) {
        const chunkText = chunk.text;
        setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1].text += chunkText;
            return newMessages;
        });
      }

    } catch (err) {
      console.error("Error streaming response from Gemini:", err);
       setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage && lastMessage.sender === 'ai') {
                lastMessage.text = 'Sorry, I encountered an error. Please check the console for details and try again.';
            }
            return newMessages;
        });
    } finally {
      setIsAiResponding(false);
    }
  };
  
  const handleReset = () => {
    setFile(null);
    setChatSession(null);
    setMessages([]);
    setError('');
  }
  
  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Chat with a PDF Document",
    "description": "Ask questions and get instant answers from your PDF file using AI.",
    "step": [
      { "@type": "HowToStep", "name": "Upload PDF", "text": "Select the PDF you want to ask questions about." },
      { "@type": "HowToStep", "name": "AI Analysis", "text": "Wait a few moments for our AI to read and understand your document's content." },
      { "@type": "HowToStep", "name": "Ask Questions", "text": "Type your question into the chat box and press enter." },
      { "@type": "HowToStep", "name": "Get Answers", "text": "Receive an instant answer from the AI, based entirely on the information within your PDF." }
    ]
  };

  const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
          {
              "@type": "Question",
              "name": "Can I ask about anything?",
              "acceptedAnswer": { "@type": "Answer", "text": "The AI assistant is specifically designed to answer questions based only on the content of the PDF you upload. It does not use external knowledge." }
          },
          {
              "@type": "Question",
              "name": "How does this protect my privacy?",
              "acceptedAnswer": { "@type": "Answer", "text": "Your privacy is paramount. Both the file processing and the chat session happen entirely within your browser. Your document and your questions are never sent to our servers." }
          },
          {
              "@type": "Question",
              "name": "Does this work on large PDF files?",
              "acceptedAnswer": { "@type": "Answer", "text": "Yes, it works on documents of all sizes. Please note that the initial analysis may take longer for very large or text-heavy PDFs." }
          }
      ]
  };

  if (!file && !isProcessingFile) {
    return (
      <>
        <JsonLd data={howToSchema} />
        <JsonLd data={faqSchema} />
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <div className="flex justify-center items-center mx-auto w-16 h-16 bg-primary-100/50 dark:bg-primary-900/50 border border-slate-300 dark:border-slate-700 rounded-sm mb-4">
                <SparklesIcon className="w-10 h-10 text-primary-700 dark:text-primary-400"/>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold font-display text-slate-900 dark:text-white">Q&A with PDF</h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 mt-2">Chat directly with your document to find the information you need.</p>
          </div>
          <FileUploader onFileSelect={handleFileSelect} processing={isProcessingFile} />
          {error && (
              <div className="mt-6 border border-red-400 text-red-700 px-4 py-3 rounded-sm" role="alert">
                  <strong className="font-bold font-display">Error: </strong>
                  <span className="block sm:inline">{error}</span>
              </div>
          )}

          <div className="mt-12 pt-8 border-t border-slate-300 dark:border-slate-700">
            <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-4">How to Chat With Your PDF</h2>
            <ol className="list-decimal list-inside space-y-4 text-slate-700 dark:text-slate-300">
                <li><strong>Upload Your File:</strong> Select the PDF document you want to query.</li>
                <li><strong>Let the AI Read:</strong> Our tool will quickly analyze the text of your document. This all happens locally on your computer.</li>
                <li><strong>Ask Your Question:</strong> Once the analysis is complete, a chat window will appear. Type any question about the document's content.</li>
                <li><strong>Receive an Instant Answer:</strong> The AI will provide a direct answer based on the information it found in the file.</li>
            </ol>
          </div>

          <div className="mt-12">
            <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-4">Frequently Asked Questions</h2>
            <FaqItem question="Can I ask about anything?">
              The AI assistant is specifically designed to answer questions based only on the content of the PDF you upload. It does not use external knowledge.
            </FaqItem>
            <FaqItem question="How does this protect my privacy?">
              Your privacy is paramount. Both the file processing and the chat session happen entirely within your browser. Your document and your questions are never sent to our servers.
            </FaqItem>
            <FaqItem question="Does this work on large PDF files?">
              Yes, it works on documents of all sizes. Please note that the initial analysis may take longer for very large or text-heavy PDFs.
            </FaqItem>
          </div>
          
          <CommentSection />
        </div>
      </>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="h-[75vh] flex flex-col">
        <div className="flex items-center justify-between mb-4 p-3 bg-white/50 dark:bg-slate-800/20 border border-slate-300 dark:border-slate-700 rounded-sm">
              <div className="flex items-center space-x-3 overflow-hidden">
                <DocumentTextIcon className="w-6 h-6 text-primary-700" />
                <span className="font-semibold text-slate-700 dark:text-slate-200 truncate">{file?.name}</span>
              </div>
              <button
                  onClick={handleReset}
                  className="text-sm font-semibold text-slate-600 hover:text-primary-700 dark:hover:text-primary-400"
                >
                  Choose another file
              </button>
          </div>
        
        {isProcessingFile && (
            <div className="flex flex-col items-center justify-center flex-grow">
                <Spinner/>
                <p className="mt-4 text-slate-600 dark:text-slate-300">Analyzing your document...</p>
            </div>
        )}

        {!isProcessingFile && chatSession && (
          <div className="flex-grow flex flex-col bg-white/50 dark:bg-slate-800/20 border border-slate-300 dark:border-slate-700 overflow-hidden rounded-sm">
            <div ref={chatContainerRef} className="flex-grow p-6 space-y-4 overflow-y-auto">
              {messages.map((msg, index) => (
                <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.sender === 'ai' && <div className="w-8 h-8 rounded-full bg-primary-100/30 dark:bg-primary-500/20 border border-slate-300 dark:border-slate-600 flex items-center justify-center flex-shrink-0"><SparklesIcon className="w-5 h-5 text-primary-700 dark:text-primary-400" /></div>}
                  <div className={`max-w-lg px-4 py-2 rounded-md ${msg.sender === 'user' ? 'bg-primary-700 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'}`}>
                    <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">{msg.text}{isAiResponding && msg.text === '' && index === messages.length - 1 ? '...' : ''}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-slate-100 dark:bg-slate-900/50 border-t border-slate-300 dark:border-slate-700">
              <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Ask a question about the document..."
                  className="flex-grow px-4 py-2 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-400 dark:border-slate-600 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-600"
                  disabled={isAiResponding}
                />
                <button
                  type="submit"
                  className="p-3 bg-primary-700 text-white rounded-full hover:bg-primary-800 disabled:bg-primary-400 disabled:cursor-not-allowed transition-colors"
                  disabled={!userInput.trim() || isAiResponding}
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
      <div className={file ? 'mt-8' : ''}>
         <CommentSection />
      </div>
    </div>
  );
};

export default QAPage;
