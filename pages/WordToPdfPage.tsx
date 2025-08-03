
import React, { useState } from 'react';
import { WordIcon } from '../components/icons/IconComponents';
import CommentSection from '../components/CommentSection';
import useDocumentTitle from '../hooks/useDocumentTitle';
import JsonLd from '../components/JsonLd';
import FaqItem from '../components/FaqItem';

const defaultText = `<!-- Paste your content from Word here -->
<h1>My Document Title</h1>
<p>This is a paragraph from my document. <strong>Bold text</strong> and <em>italic text</em> should be preserved if you paste rich text, but it depends on your browser.</p>
<ul>
    <li>List item 1</li>
    <li>List item 2</li>
</ul>
<p>Pasting directly from Word might carry over some styling. For best results, paste as plain text and use the HTML editor to format.</p>
`;

const WordToPdfPage: React.FC = () => {
    useDocumentTitle("Word to PDF Converter | Free Online Tool | Pdfadore.com");
    const [htmlContent, setHtmlContent] = useState<string>(defaultText);

    const handleConvertToPdf = () => {
        const iframe = document.createElement('iframe');
        iframe.style.visibility = 'hidden';
        iframe.style.position = 'absolute';
        document.body.appendChild(iframe);
        const contentDoc = iframe.contentDocument;
        if (contentDoc) {
            contentDoc.open();
            contentDoc.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Print Document</title>
                    <style>
                        @media print {
                            @page { margin: 1in; }
                        }
                        body { font-family: sans-serif; }
                    </style>
                </head>
                <body>${htmlContent}</body>
                </html>
            `);
            contentDoc.close();
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
        }
        // Use a timeout to ensure the print dialog has time to open before removing the iframe
        setTimeout(() => {
            document.body.removeChild(iframe);
        }, 100);
    };

    const howToSchema = {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": "How to Convert Word Content to PDF",
      "description": "Convert content from a Word document to a PDF by pasting it into our editor.",
      "step": [
        { "@type": "HowToStep", "name": "Copy Content", "text": "Open your document in Microsoft Word or another word processor and copy the content you want to convert." },
        { "@type": "HowToStep", "name": "Paste Content", "text": "Paste the content into the text editor on our page." },
        { "@type": "HowToStep", "name": "Convert to PDF", "text": "Click the 'Convert to PDF' button, which will open your browser's print dialog." },
        { "@type": "HowToStep", "name": "Save as PDF", "text": "Choose 'Save as PDF' as the destination in the print dialog and click 'Save'." }
      ]
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "Why do I have to copy and paste? Why can't I upload a .DOCX file?",
                "acceptedAnswer": { "@type": "Answer", "text": "Processing .DOCX files directly in the browser is technically complex. To ensure maximum security and privacy (by not uploading your file), our tool currently works by converting the rich text content you paste. We are exploring ways to support direct file uploads in the future." }
            },
            {
                "@type": "Question",
                "name": "Will my formatting be preserved?",
                "acceptedAnswer": { "@type": "Answer", "text": "Basic formatting like bold, italics, and lists are usually preserved when you paste. However, complex layouts, fonts, and colors might not carry over perfectly. The result can vary depending on your browser." }
            },
            {
                "@type": "Question",
                "name": "Is this tool free to use?",
                "acceptedAnswer": { "@type": "Answer", "text": "Yes, this tool is completely free and works entirely within your browser for your privacy." }
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
                        <WordIcon className="w-10 h-10 text-primary-700 dark:text-primary-400"/>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold font-display text-slate-900 dark:text-white">Word to PDF</h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 mt-2">Paste content from your Word document to convert it to a PDF.</p>
                </div>

                <div className="bg-white/50 dark:bg-slate-800/20 p-6 border border-slate-300 dark:border-slate-700">
                    <h2 className="text-lg font-semibold mb-2 font-display">Document Content</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Copy the content from your Word file and paste it into the box below. Basic formatting like bold and italics should be preserved.</p>
                    <div
                        contentEditable="true"
                        onInput={(e) => setHtmlContent(e.currentTarget.innerHTML)}
                        className="w-full h-96 p-4 border rounded-sm shadow-inner bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none overflow-y-auto"
                        dangerouslySetInnerHTML={{ __html: htmlContent }}
                        aria-label="Document Content Editor"
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
                    <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-4">How to Convert Word Content to PDF</h2>
                    <ol className="list-decimal list-inside space-y-4 text-slate-700 dark:text-slate-300">
                        <li><strong>Copy From Word:</strong> Open your .doc or .docx file in Microsoft Word (or another editor) and select and copy all the text you want to convert.</li>
                        <li><strong>Paste Into Editor:</strong> Paste the copied content into the editor box on this page.</li>
                        <li><strong>Convert:</strong> Click the "Convert to PDF" button. This will open your browser's print options.</li>
                        <li><strong>Save as PDF:</strong> In the print dialog, make sure the destination is set to "Save as PDF" and click the Save button to download your new PDF.</li>
                    </ol>
                </div>

                <div className="mt-12">
                    <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-4">Frequently Asked Questions</h2>
                    <FaqItem question="Why do I have to copy and paste? Why can't I upload a .DOCX file?">
                      Processing .DOCX files directly in the browser is technically complex. To ensure maximum security and privacy (by not uploading your file), our tool currently works by converting the rich text content you paste. We are exploring ways to support direct file uploads in the future.
                    </FaqItem>
                    <FaqItem question="Will my formatting be preserved?">
                      Basic formatting like bold, italics, and lists are usually preserved when you paste. However, complex layouts, fonts, and colors might not carry over perfectly. The result can vary depending on your browser.
                    </FaqItem>
                    <FaqItem question="Is this tool free to use?">
                      Yes, this tool is completely free and works entirely within your browser for your privacy.
                    </FaqItem>
                </div>

                <CommentSection />
            </div>
        </>
    );
};

export default WordToPdfPage;
