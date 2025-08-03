
import React, { useState, useCallback } from 'react';
import FileUploader from '../components/FileUploader';
import Spinner from '../components/Spinner';
import { extractTextFromPDF } from '../services/pdfParser';
import { WordIcon, DocumentTextIcon } from '../components/icons/IconComponents';
import CommentSection from '../components/CommentSection';
import useDocumentTitle from '../hooks/useDocumentTitle';
import JsonLd from '../components/JsonLd';
import FaqItem from '../components/FaqItem';

const PdfToWordPage: React.FC = () => {
    useDocumentTitle("PDF to Word Converter | Extract Text from PDF | Pdfadore.com");

    const [file, setFile] = useState<File | null>(null);
    const [extractedText, setExtractedText] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleFileSelect = (selectedFile: File) => {
        setFile(selectedFile);
        setExtractedText('');
        setError('');
    };

    const handleExtract = useCallback(async () => {
        if (!file) return;

        setIsLoading(true);
        setError('');
        try {
            const text = await extractTextFromPDF(file);
            if (!text.trim()) {
                setError('Could not extract text from the PDF. It might be an image-only file.');
                setExtractedText('');
            } else {
                setExtractedText(text);
            }
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [file]);

    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(extractedText);
        alert('Text copied to clipboard!');
    };

    const handleReset = () => {
        setFile(null);
        setExtractedText('');
        setError('');
    };

    const howToSchema = {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": "How to Convert PDF to Word (Text Extraction)",
      "description": "Extract all text from a PDF file to easily edit it in Microsoft Word or another text editor.",
      "step": [
        { "@type": "HowToStep", "name": "Upload PDF", "text": "Select the PDF document from which you want to extract text." },
        { "@type": "HowToStep", "name": "Extract Text", "text": "Click the 'Extract Text' button to process the file." },
        { "@type": "HowToStep", "name": "Copy Text", "text": "The extracted text will appear in a text box. Click 'Copy to Clipboard'." },
        { "@type": "HowToStep", "name": "Paste in Word", "text": "Open Microsoft Word or any other text editor and paste the copied text." }
      ]
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "Does this tool preserve formatting like tables and images?",
                "acceptedAnswer": { "@type": "Answer", "text": "No, this tool is designed for pure text extraction. It does not preserve complex formatting such as tables, columns, fonts, or images. It's ideal for making the text content of a PDF easily editable." }
            },
            {
                "@type": "Question",
                "name": "Can it read text from scanned documents (OCR)?",
                "acceptedAnswer": { "@type": "Answer", "text": "This converter does not perform Optical Character Recognition (OCR). It can only extract text if it is already present in the PDF file as a text layer. It will not work for scanned, image-only documents." }
            },
            {
                "@type": "Question",
                "name": "Why does this tool exist if I can just copy and paste from my PDF reader?",
                "acceptedAnswer": { "@type": "Answer", "text": "Copying directly from a PDF viewer can often result in messy text with unwanted line breaks and spacing issues. Our tool is designed to provide a cleaner, more contiguous block of text, which is easier to format in Word." }
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
                    <h1 className="text-4xl md:text-5xl font-bold font-display text-slate-900 dark:text-white">PDF to Word (Text Extraction)</h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 mt-2">Extract all text from your PDF to easily copy into a Word document.</p>
                </div>

                {!file && <FileUploader onFileSelect={handleFileSelect} processing={isLoading} />}

                {file && !extractedText && (
                    <div className="bg-white/50 dark:bg-slate-800/20 p-6 border border-slate-300 dark:border-slate-700 w-full">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3 overflow-hidden">
                                <DocumentTextIcon className="w-6 h-6 text-primary-700 flex-shrink-0" />
                                <span className="font-medium text-slate-700 dark:text-slate-200 truncate">{file.name}</span>
                            </div>
                            <button onClick={handleReset} className="text-sm text-slate-500 hover:text-primary-700 dark:hover:text-primary-400">
                                Choose another file
                            </button>
                        </div>
                        <button onClick={handleExtract} disabled={isLoading} className="w-full bg-primary-700 text-white font-bold py-3 px-4 rounded-sm hover:bg-primary-800 transition-colors flex items-center justify-center disabled:bg-primary-400 uppercase tracking-wider">
                            {isLoading ? <Spinner /> : 'Extract Text'}
                        </button>
                    </div>
                )}

                {error && <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert"><strong className="font-bold">Error: </strong><span className="block sm:inline">{error}</span></div>}

                {extractedText && (
                    <div className="mt-8">
                        <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white mb-4">Extracted Text</h2>
                        <div className="bg-white/50 dark:bg-slate-800/20 p-4 border border-slate-300 dark:border-slate-700">
                            <textarea
                                readOnly
                                value={extractedText}
                                className="w-full h-96 p-2 border rounded-sm bg-white dark:bg-slate-900 border-slate-400 dark:border-slate-600 text-sm focus:ring-primary-500 focus:border-primary-500"
                                aria-label="Extracted Text"
                            />
                            <div className="mt-4 flex flex-col sm:flex-row gap-4">
                                <button onClick={handleCopyToClipboard} className="w-full bg-primary-700 text-white font-bold py-3 px-4 rounded-sm hover:bg-primary-800 transition-colors uppercase tracking-wider">
                                    Copy to Clipboard
                                </button>
                                <button onClick={handleReset} className="w-full bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold py-3 px-4 rounded-sm hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors uppercase tracking-wider">
                                    Start Over
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-12 pt-8 border-t border-slate-300 dark:border-slate-700">
                    <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-4">How to Convert PDF to Word Text</h2>
                    <ol className="list-decimal list-inside space-y-4 text-slate-700 dark:text-slate-300">
                        <li><strong>Upload your PDF file:</strong> Select the document you wish to convert.</li>
                        <li><strong>Extract the Text:</strong> Click the "Extract Text" button. Our tool will process the file and pull out all the text content.</li>
                        <li><strong>Copy and Paste:</strong> The extracted text will be displayed in a text box. Simply click "Copy to Clipboard", then open Microsoft Word or any other word processor and paste the content to begin editing.</li>
                    </ol>
                </div>

                <div className="mt-12">
                    <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-4">Frequently Asked Questions</h2>
                    <FaqItem question="Does this tool preserve formatting like tables and images?">
                        No, this tool is designed for pure text extraction. It does not preserve complex formatting such as tables, columns, fonts, or images. It's ideal for making the text content of a PDF easily editable.
                    </FaqItem>
                    <FaqItem question="Can it read text from scanned documents (OCR)?">
                        This converter does not perform Optical Character Recognition (OCR). It can only extract text if it is already present in the PDF file as a text layer. It will not work for scanned, image-only documents.
                    </FaqItem>
                    <FaqItem question="Why does this tool exist if I can just copy and paste from my PDF reader?">
                        Copying directly from a PDF viewer can often result in messy text with unwanted line breaks and spacing issues. Our tool is designed to provide a cleaner, more contiguous block of text, which is easier to format in Word.
                    </FaqItem>
                </div>

                <CommentSection />
            </div>
        </>
    );
};

export default PdfToWordPage;
