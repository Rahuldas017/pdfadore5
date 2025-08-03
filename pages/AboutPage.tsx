
import React from 'react';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { PdfadoreIcon } from '../components/icons/IconComponents';

const AboutPage: React.FC = () => {
    useDocumentTitle("About Us | Pdfadore.com");

    return (
        <div className="max-w-4xl mx-auto prose dark:prose-invert prose-lg">
            <h1>About Pdfadore</h1>
            <p>
                Welcome to Pdfadore, your new favorite destination for all things PDF. Our mission is simple: to provide a comprehensive suite of powerful, free, and easy-to-use PDF tools that respect your privacy.
            </p>

            <h2>Our Philosophy: Privacy First</h2>
            <p>
                In an age where data privacy is more important than ever, we've built Pdfadore on a foundational principle: <strong>your files are your files.</strong> Unlike many other online services, we perform all file processing—merging, splitting, compressing, and more—directly in your web browser. This means your documents are never uploaded to our servers. They never leave your computer. You get the convenience of a web-based tool with the security of desktop software.
            </p>
            
            <h2>Our Vision</h2>
            <p>
                Founded by Rahul Kumar Das, a passionate developer dedicated to creating accessible technology, Pdfadore was born from the idea that powerful document management shouldn't be complicated or expensive. We believe that everyone, from students and educators to small business owners and corporate professionals, should have access to high-quality tools that make their work easier without compromising their security.
            </p>
            <p>
                We are constantly working to improve our existing tools and develop new ones to meet the evolving needs of our users. Our goal is to be the only PDF toolkit you'll ever need—one that you'll truly adore.
            </p>

            <h2>Meet the Founder</h2>
            <div className="flex items-center not-prose bg-slate-100 dark:bg-slate-800 p-6 rounded-lg">
                 <div className="flex-shrink-0">
                  <div className="h-16 w-16 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                    <svg className="h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-4">
                    <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white mt-0">Rahul Kumar Das</h3>
                    <p className="text-slate-600 dark:text-slate-400 m-0">Founder and Lead Developer</p>
                </div>
            </div>

            <p>
                Thank you for choosing Pdfadore. We're excited to be a part of your productivity journey.
            </p>
        </div>
    );
};

export default AboutPage;
