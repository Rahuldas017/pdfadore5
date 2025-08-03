
import React, { useState } from 'react';
import { PowerPointIcon } from '../components/icons/IconComponents';
import CommentSection from '../components/CommentSection';
import useDocumentTitle from '../hooks/useDocumentTitle';
import JsonLd from '../components/JsonLd';
import FaqItem from '../components/FaqItem';

const defaultText = `My Presentation Title
- First bullet point
- Second bullet point

---

Second Slide
- This is another point on the second slide.
- And one more.

---

A Slide With Just A Title`;

const PowerpointToPdfPage: React.FC = () => {
    useDocumentTitle("PowerPoint to PDF | Create Simple Presentation PDF | Pdfadore.com");
    const [markdownContent, setMarkdownContent] = useState<string>(defaultText);

    const generateHtmlFromMarkdown = (markdown: string): string => {
        const slides = markdown.split(/\n---\n/);
        const slideHtml = slides.map(slideContent => {
            const lines = slideContent.trim().split('\n');
            const title = lines[0] ? `<h1>${lines[0]}</h1>` : '';
            const points = lines.length > 1 ? `<ul>${lines.slice(1).map(line => `<li>${line.replace(/^- /, '')}</li>`).join('')}</ul>` : '';
            return `<div class="slide">${title}${points}</div>`;
        }).join('');

        const styles = `
            <style>
                @media print {
                    @page {
                        size: A4 landscape;
                        margin: 0;
                    }
                }
                body { 
                    font-family: sans-serif;
                    margin: 0;
                }
                .slide {
                    width: 100vw;
                    height: 100vh;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    text-align: center;
                    padding: 40px;
                    box-sizing: border-box;
                    border-bottom: 1px dashed #ccc;
                    page-break-after: always;
                }
                .slide:last-child {
                    page-break-after: avoid;
                    border-bottom: none;
                }
                h1 { font-size: 3em; margin-bottom: 0.5em; color: #333; }
                ul { list-style: none; padding: 0; font-size: 1.5em; color: #555; }
                li { margin-bottom: 0.5em; }
            </style>
        `;
        return `<!DOCTYPE html><html><head>${styles}</head><body>${slideHtml}</body></html>`;
    };

    const handleConvertToPdf = () => {
        const htmlContent = generateHtmlFromMarkdown(markdownContent);
        const iframe = document.createElement('iframe');
        iframe.style.visibility = 'hidden';
        document.body.appendChild(iframe);
        iframe.srcdoc = htmlContent;
        iframe.onload = () => {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
            document.body.removeChild(iframe);
        };
    };

    const howToSchema = {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": "How to Convert PowerPoint Content to PDF",
      "description": "Create a simple, clean presentation PDF from your text outline.",
      "step": [
        { "@type": "HowToStep", "name": "Write or Paste Content", "text": "Enter your presentation content in the text editor. Use '---' on a new line to separate slides." },
        { "@type": "HowToStep", "name": "Convert to PDF", "text": "Click the 'Convert to PDF' button, which will use your browser's print functionality." },
        { "@type": "HowToStep", "name": "Save as PDF", "text": "In the print dialog, set the destination to 'Save as PDF' and layout to 'Landscape', then save the file." }
      ]
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "Does this support complex PowerPoint features like animations or images?",
                "acceptedAnswer": { "@type": "Answer", "text": "No, this is a simplified tool designed to quickly create a clean, text-based presentation PDF from an outline. It does not support images, animations, or advanced formatting from PowerPoint files." }
            },
            {
                "@type": "Question",
                "name": "How do I format my text?",
                "acceptedAnswer": { "@type": "Answer", "text": "The first line of text before a '---' separator is treated as the slide title. Subsequent lines starting with a hyphen (-) are treated as bullet points. Use '---' on its own line to create a new slide." }
            },
            {
                "@type": "Question",
                "name": "Why can't I just upload my .PPTX file?",
                "acceptedAnswer": { "@type": "Answer", "text": "For security and privacy reasons, this tool processes text content directly in your browser without uploading files. This ensures your data never leaves your computer. We are working on future versions that may support file uploads." }
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
                        <PowerPointIcon className="w-10 h-10 text-primary-700 dark:text-primary-400"/>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold font-display text-slate-900 dark:text-white">PowerPoint to PDF</h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 mt-2">Create a simple presentation PDF from text.</p>
                </div>

                <div className="bg-white/50 dark:bg-slate-800/20 p-6 border border-slate-300 dark:border-slate-700">
                    <h2 className="text-lg font-semibold mb-2 font-display">Presentation Content</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Paste your presentation text below. Use <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded">---</code> on a new line to separate slides.</p>
                    <textarea
                        value={markdownContent}
                        onChange={(e) => setMarkdownContent(e.target.value)}
                        className="w-full h-96 p-4 border rounded-lg shadow-sm bg-white dark:bg-slate-900 border-slate-400 dark:border-slate-700 font-mono text-sm focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Paste your content here..."
                        aria-label="Presentation Content Editor"
                    />
                </div>
                
                <div className="mt-8 text-center">
                    <button
                        onClick={handleConvertToPdf}
                        className="w-full max-w-md bg-primary-700 text-white font-bold py-4 px-4 rounded-sm hover:bg-primary-800 transition-colors flex items-center justify-center text-lg disabled:bg-primary-400 mx-auto"
                    >
                        Convert to PDF
                    </button>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">This tool uses your browser's print to PDF functionality.</p>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-300 dark:border-slate-700">
                    <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-4">How to Create a Presentation PDF</h2>
                    <ol className="list-decimal list-inside space-y-4 text-slate-700 dark:text-slate-300">
                        <li><strong>Structure Your Content:</strong> In the text editor, type your slide content. The first line is the title. Use hyphens for bullet points. To create a new slide, type `---` on a new line by itself.</li>
                        <li><strong>Convert to PDF:</strong> Click the 'Convert to PDF' button. This will generate the slides and open your browser's print menu.</li>
                        <li><strong>Save Your Presentation:</strong> In the print dialog, make sure the destination is 'Save as PDF' and the layout is 'Landscape'. Then click 'Save' to download your presentation.</li>
                    </ol>
                </div>

                <div className="mt-12">
                    <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-4">Frequently Asked Questions</h2>
                    <FaqItem question="Does this support complex PowerPoint features like animations or images?">
                        No, this is a simplified tool designed to quickly create a clean, text-based presentation PDF from an outline. It does not support images, animations, or advanced formatting from PowerPoint files.
                    </FaqItem>
                    <FaqItem question="How do I format my text?">
                        The first line of text before a '---' separator is treated as the slide title. Subsequent lines starting with a hyphen (-) are treated as bullet points. Use '---' on its own line to create a new slide.
                    </FaqItem>
                    <FaqItem question="Why can't I just upload my .PPTX file?">
                        For security and privacy reasons, this tool processes text content directly in your browser without uploading files. This ensures your data never leaves your computer. We are working on future versions that may support file uploads.
                    </FaqItem>
                </div>

                <CommentSection />
            </div>
        </>
    );
};

export default PowerpointToPdfPage;
