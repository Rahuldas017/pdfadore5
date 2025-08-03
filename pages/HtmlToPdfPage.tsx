
import React, { useState } from 'react';
import { HtmlIcon } from '../components/icons/IconComponents';
import CommentSection from '../components/CommentSection';
import useDocumentTitle from '../hooks/useDocumentTitle';
import JsonLd from '../components/JsonLd';
import FaqItem from '../components/FaqItem';

const defaultHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Document</title>
    <style>
        body { font-family: sans-serif; line-height: 1.6; padding: 20px; }
        h1 { color: #333; }
        p { color: #555; }
        .highlight { background-color: yellow; }
    </style>
</head>
<body>
    <h1>Hello, World!</h1>
    <p>This is a sample HTML document. You can <span class="highlight">edit this code</span> and see the preview on the right.</p>
    <p>When you're ready, click the "Convert to PDF" button to use your browser's print functionality to save it as a PDF file.</p>
</body>
</html>`;

const HtmlToPdfPage: React.FC = () => {
    useDocumentTitle("HTML to PDF Converter | Free Online Tool | Pdfadore.com");
    const [htmlContent, setHtmlContent] = useState<string>(defaultHtml);

    const handleConvertToPdf = () => {
        const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement;
        if (iframe && iframe.contentWindow) {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
        }
    };
    
    const howToSchema = {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": "How to Convert HTML to PDF",
      "description": "Convert HTML code into a PDF document using our free online tool.",
      "step": [
        { "@type": "HowToStep", "name": "Enter Code", "text": "Write or paste your HTML code into the editor on the left." },
        { "@type": "HowToStep", "name": "Preview", "text": "See a live preview of your HTML document on the right." },
        { "@type": "HowToStep", "name": "Convert to PDF", "text": "Click the 'Convert to PDF' button. This will open your browser's print dialog." },
        { "@type": "HowToStep", "name": "Save PDF", "text": "In the print dialog, choose 'Save as PDF' as the destination and click 'Save'." }
      ]
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "Does this tool support CSS and JavaScript?",
                "acceptedAnswer": { "@type": "Answer", "text": "Yes, you can include <style> tags for CSS and <script> tags for JavaScript within your HTML code. The live preview will render them, and they will be included in the final PDF output via the browser's print engine." }
            },
            {
                "@type": "Question",
                "name": "Why does it use the browser's print function?",
                "acceptedAnswer": { "@type": "Answer", "text": "Using the browser's built-in print-to-PDF engine is the most secure and accurate way to convert HTML. It ensures that what you see in the preview is exactly what you get in the PDF, and it means all conversion happens on your computer, not on our servers." }
            },
            {
                "@type": "Question",
                "name": "Can I convert a live website URL to PDF?",
                "acceptedAnswer": { "@type": "Answer", "text": "This tool is designed for converting HTML code. To convert a live website, you can view the website in your browser, right-click, select 'Print', and then choose 'Save as PDF'." }
            }
        ]
    };

    return (
        <>
            <JsonLd data={howToSchema} />
            <JsonLd data={faqSchema} />
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-10">
                    <div className="flex justify-center items-center mx-auto w-16 h-16 bg-primary-100/50 dark:bg-primary-900/50 border border-slate-300 dark:border-slate-700 rounded-sm mb-4">
                        <HtmlIcon className="w-10 h-10 text-primary-700 dark:text-primary-400"/>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold font-display text-slate-900 dark:text-white">HTML to PDF</h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 mt-2">Convert HTML code to a PDF document right in your browser.</p>
                </div>

                <div className="flex flex-col md:flex-row gap-4 h-[60vh]">
                    <div className="md:w-1/2 flex flex-col">
                        <h2 className="text-lg font-semibold mb-2 font-display">HTML Code</h2>
                        <textarea
                            value={htmlContent}
                            onChange={(e) => setHtmlContent(e.target.value)}
                            className="w-full h-full p-4 border rounded-sm shadow-sm bg-white dark:bg-slate-800/20 border-slate-300 dark:border-slate-700 font-mono text-sm focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Enter your HTML code here..."
                            aria-label="HTML Code Editor"
                        />
                    </div>
                    <div className="md:w-1/2 flex flex-col">
                        <h2 className="text-lg font-semibold mb-2 font-display">Live Preview</h2>
                        <iframe
                            id="preview-iframe"
                            srcDoc={htmlContent}
                            title="HTML Preview"
                            className="w-full h-full bg-white border rounded-sm shadow-sm border-slate-300 dark:border-slate-700"
                            sandbox="allow-scripts"
                        />
                    </div>
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
                    <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-4">How to Convert HTML to PDF</h2>
                    <ol className="list-decimal list-inside space-y-4 text-slate-700 dark:text-slate-300">
                        <li><strong>Write or Paste HTML:</strong> Enter your code directly into the HTML editor on the left.</li>
                        <li><strong>Check the Preview:</strong> A live preview of your document will appear on the right. Any changes you make to the code will update the preview instantly.</li>
                        <li><strong>Initiate Conversion:</strong> Click the "Convert to PDF" button. This will open your browser's standard print dialog.</li>
                        <li><strong>Save Your PDF:</strong> In the print dialog, ensure the destination is set to "Save as PDF", then click "Save" to download your file.</li>
                    </ol>
                </div>

                <div className="mt-12">
                    <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-4">Frequently Asked Questions</h2>
                    <FaqItem question="Does this tool support CSS and JavaScript?">
                      Yes, you can include &lt;style&gt; tags for CSS and &lt;script&gt; tags for JavaScript within your HTML code. The live preview will render them, and they will be included in the final PDF output via the browser's print engine.
                    </FaqItem>
                    <FaqItem question="Why does it use the browser's print function?">
                      Using the browser's built-in print-to-PDF engine is the most secure and accurate way to convert HTML. It ensures that what you see in the preview is exactly what you get in the PDF, and it means all conversion happens on your computer, not on our servers.
                    </FaqItem>
                    <FaqItem question="Can I convert a live website URL to PDF?">
                      This tool is designed for converting HTML code. To convert a live website, you can view the website in your browser, right-click, select 'Print', and then choose 'Save as PDF'.
                    </FaqItem>
                </div>

                <CommentSection />
            </div>
        </>
    );
};

export default HtmlToPdfPage;
