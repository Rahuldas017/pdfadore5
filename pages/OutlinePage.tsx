
import React, { useState, useCallback } from 'react';
import FileUploader from '../components/FileUploader';
import Spinner from '../components/Spinner';
import { extractTextFromPDF } from '../services/pdfParser';
import { getPresentationOutline } from '../services/geminiService';
import { PresentationOutline } from '../types';
import { DocumentTextIcon, ListBulletIcon } from '../components/icons/IconComponents';
import CommentSection from '../components/CommentSection';
import useDocumentTitle from '../hooks/useDocumentTitle';
import JsonLd from '../components/JsonLd';
import FaqItem from '../components/FaqItem';

const OutlinePage: React.FC = () => {
  useDocumentTitle("Create Presentation from PDF | Free Outline Generator | Pdfadore.com");

  const [file, setFile] = useState<File | null>(null);
  const [outline, setOutline] = useState<PresentationOutline | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setOutline(null);
    setError('');
  };

  const handleGenerateOutline = useCallback(async () => {
    if (!file) return;

    setIsLoading(true);
    setError('');
    try {
      const text = await extractTextFromPDF(file);
      if (!text.trim()) {
        setError('Could not extract text from the PDF. It might be an image-only file.');
        setIsLoading(false);
        return;
      }
      const result = await getPresentationOutline(text);
      setOutline(result);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [file]);

  const handleReset = () => {
    setFile(null);
    setOutline(null);
    setError('');
  }

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Create a Presentation Outline from a PDF",
    "description": "Automatically generate a structured presentation outline from any PDF document.",
    "step": [
      { "@type": "HowToStep", "name": "Upload PDF", "text": "Select the PDF file you want to turn into a presentation." },
      { "@type": "HowToStep", "name": "Generate Outline", "text": "Click the 'Generate Outline' button to let our AI analyze the document." },
      { "@type": "HowToStep", "name": "Review and Use", "text": "Review the generated slides and bullet points. You can easily copy and paste them into your presentation software." }
    ]
  };

  const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
          {
              "@type": "Question",
              "name": "What format is the outline in?",
              "acceptedAnswer": { "@type": "Answer", "text": "The outline is presented as a series of slides, each with a title and several bullet points. This format is designed to be easily copied into presentation software like PowerPoint, Google Slides, or Keynote." }
          },
          {
              "@type": "Question",
              "name": "Is the process automatic?",
              "acceptedAnswer": { "@type": "Answer", "text": "Yes, our AI analyzes the document's structure, headings, and key content to automatically generate a logical presentation outline, saving you hours of manual work." }
          },
          {
              "@type": "Question",
              "name": "Is this service free and private?",
              "acceptedAnswer": { "@type": "Answer", "text": "Yes, this tool is completely free to use. All processing happens in your browser, so your documents are never uploaded to a server, ensuring your data remains private." }
          }
      ]
  };

  return (
    <>
      <JsonLd data={howToSchema} />
      <JsonLd data={faqSchema} />
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="flex justify-center items-center mx-auto w-16 h-16 bg-primary-100/50 dark:bg-primary-900/50 border border-slate-300 dark:border-slate-700 rounded-sm mb-4">
              <ListBulletIcon className="w-10 h-10 text-primary-700 dark:text-primary-400"/>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-display text-slate-900 dark:text-white">Presentation Outline Generator</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mt-2">Turn any PDF into a structured presentation outline instantly.</p>
        </div>

        {!file && <FileUploader onFileSelect={handleFileSelect} processing={isLoading} />}

        {file && !outline && (
          <div className="bg-white/50 dark:bg-slate-800/20 p-6 border border-slate-300 dark:border-slate-700 w-full">
              <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3 overflow-hidden">
                  <DocumentTextIcon className="w-6 h-6 text-primary-700 flex-shrink-0" />
                  <span className="font-semibold text-slate-700 dark:text-slate-200 truncate">{file.name}</span>
                  </div>
                  <button
                      onClick={handleReset}
                      className="text-sm font-semibold text-slate-600 hover:text-primary-700 dark:hover:text-primary-400"
                  >
                      Choose another file
                  </button>
              </div>
              
              <button
                  onClick={handleGenerateOutline}
                  disabled={isLoading}
                  className="w-full bg-primary-700 text-white font-bold py-3 px-4 rounded-sm hover:bg-primary-800 transition-colors flex items-center justify-center disabled:bg-primary-400 uppercase tracking-wider"
              >
                  {isLoading ? <Spinner /> : 'Generate Outline'}
              </button>
          </div>
        )}

        {error && (
          <div className="mt-6 border border-red-400 text-red-700 px-4 py-3 rounded-sm" role="alert">
            <strong className="font-bold font-display">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {outline && (
          <div className="mt-8 border border-slate-300 dark:border-slate-700 p-6">
            <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-6">Generated Outline</h2>
            <div className="space-y-6">
              {outline.slides.map((slide, index) => (
                <div key={index} className="border-l-4 border-primary-700 pl-4 py-2">
                  <h3 className="text-xl font-bold font-display text-primary-800 dark:text-primary-400">Slide {index + 1}: {slide.title}</h3>
                  <ul className="mt-2 list-disc list-inside text-slate-700 dark:text-slate-300 space-y-1">
                    {slide.points.map((point, pIndex) => (
                      <li key={pIndex}>{point}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <button onClick={handleReset} className="bg-primary-700 text-white font-bold py-2 px-6 rounded-sm hover:bg-primary-800 transition-colors uppercase tracking-wider text-sm">
                  Create Another Outline
              </button>
            </div>
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-slate-300 dark:border-slate-700">
            <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-4">How to Create a Presentation from a PDF</h2>
            <ol className="list-decimal list-inside space-y-4 text-slate-700 dark:text-slate-300">
                <li><strong>Select a PDF:</strong> Upload the document (like a report, article, or thesis) you want to convert into a presentation.</li>
                <li><strong>Generate the Outline:</strong> Click the "Generate Outline" button. Our AI will analyze the structure and content to create a slide-based summary.</li>
                <li><strong>Copy to Your Slides:</strong> Review the generated outline, which includes slide titles and key bullet points. Copy this content into your preferred presentation software to kickstart your design process.</li>
            </ol>
        </div>

        <div className="mt-12">
            <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-4">Frequently Asked Questions</h2>
            <FaqItem question="What format is the outline in?">
             The outline is presented as a series of slides, each with a title and several bullet points. This format is designed to be easily copied into presentation software like PowerPoint, Google Slides, or Keynote.
            </FaqItem>
            <FaqItem question="Is the process automatic?">
              Yes, our AI analyzes the document's structure, headings, and key content to automatically generate a logical presentation outline, saving you hours of manual work.
            </FaqItem>
            <FaqItem question="Is this service free and private?">
              Yes, this tool is completely free to use. All processing happens in your browser, so your documents are never uploaded to a server, ensuring your data remains private.
            </FaqItem>
        </div>

        <CommentSection />
      </div>
    </>
  );
};

export default OutlinePage;
