import React, { useState } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import Spinner from '../components/Spinner';
import FileUploader from '../components/FileUploader';
import { PageNumberIcon, DocumentTextIcon } from '../components/icons/IconComponents';
import CommentSection from '../components/CommentSection';
import useDocumentTitle from '../hooks/useDocumentTitle';
import JsonLd from '../components/JsonLd';
import FaqItem from '../components/FaqItem';

type Position = 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';

const PageNumbersPage: React.FC = () => {
    useDocumentTitle("Add Page Numbers to PDF | Free Online Tool | Pdfadore.com");

    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [pageThumbnails, setPageThumbnails] = useState<string[]>([]);
    
    const [position, setPosition] = useState<Position>('bottom-center');
    const [startFrom, setStartFrom] = useState(1);
    const [format, setFormat] = useState<'n' | 'n of N'>('n');
    const [fontSize, setFontSize] = useState(12);

    const handleFileSelect = async (selectedFile: File) => {
        setIsProcessing(true);
        setFile(selectedFile);
        setError('');
        setPageThumbnails([]);
        
        try {
            const arrayBuffer = await selectedFile.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const thumbnails: string[] = [];
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 0.3 });
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                if (context) {
                    await page.render({ canvas, canvasContext: context, viewport: viewport }).promise;
                    thumbnails.push(canvas.toDataURL());
                }
            }
            setPageThumbnails(thumbnails);
        } catch (err) {
            setError('Failed to preview PDF.');
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleReset = () => {
        setFile(null);
        setError('');
        setPageThumbnails([]);
    };
    
    const handleAddPageNumbers = async () => {
        if (!file) return;
        setIsLoading(true);
        setError('');

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
            const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const pages = pdfDoc.getPages();
            const totalPages = pages.length;

            for (let i = 0; i < totalPages; i++) {
                const page = pages[i];
                const { width, height } = page.getSize();
                const pageNum = i + startFrom;
                
                let text = format === 'n' ? `${pageNum}` : `${pageNum} of ${totalPages - 1 + startFrom}`;
                const textWidth = helveticaFont.widthOfTextAtSize(text, fontSize);
                
                let x = 0, y = 0;
                const margin = 30;

                switch(position) {
                    case 'top-left': x = margin; y = height - margin; break;
                    case 'top-center': x = width / 2 - textWidth / 2; y = height - margin; break;
                    case 'top-right': x = width - textWidth - margin; y = height - margin; break;
                    case 'bottom-left': x = margin; y = margin; break;
                    case 'bottom-center': x = width / 2 - textWidth / 2; y = margin; break;
                    case 'bottom-right': x = width - textWidth - margin; y = margin; break;
                }
                
                page.drawText(text, { x, y, size: fontSize, font: helveticaFont, color: rgb(0, 0, 0) });
            }

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${file.name.replace(/\.pdf$/i, '')}_numbered.pdf`;
            a.click();
            URL.revokeObjectURL(url);
            
            handleReset();

        } catch (err) {
            console.error(err);
            setError("Failed to add page numbers. The file might be corrupted.");
        } finally {
            setIsLoading(false);
        }
    };

    const howToSchema = {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": "How to Add Page Numbers to a PDF",
      "description": "Easily insert page numbers into your PDF documents with custom positioning and formatting.",
      "step": [
        { "@type": "HowToStep", "name": "Upload PDF", "text": "Select the PDF file you want to add page numbers to." },
        { "@type": "HowToStep", "name": "Customize Settings", "text": "Choose the position, format (e.g., '1' or '1 of 10'), starting number, and font size for your page numbers." },
        { "@type": "HowToStep", "name": "Add Numbers", "text": "Click the 'Add Page Numbers' button to apply your settings." },
        { "@type": "HowToStep", "name": "Download", "text": "Your newly numbered PDF will be downloaded automatically." }
      ]
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "Can I choose where the page numbers appear?",
                "acceptedAnswer": { "@type": "Answer", "text": "Yes, you can choose from six different positions: top-left, top-center, top-right, bottom-left, bottom-center, and bottom-right." }
            },
            {
                "@type": "Question",
                "name": "Can I start numbering from a specific page?",
                "acceptedAnswer": { "@type": "Answer", "text": "Currently, the numbering applies to all pages starting from the first page. The 'Start from' option lets you define the initial number (e.g., you can start counting from 5 instead of 1)." }
            },
            {
                "@type": "Question",
                "name": "Is this process secure?",
                "acceptedAnswer": { "@type": "Answer", "text": "Absolutely. Your PDF is processed locally in your browser and is never uploaded to our servers, ensuring your document's confidentiality." }
            }
        ]
    };

    return (
        <>
            <JsonLd data={howToSchema} />
            <JsonLd data={faqSchema} />
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-10">
                    <div className="flex justify-center items-center mx-auto w-16 h-16 bg-primary-100/50 dark:bg-primary-900/50 border border-slate-300 dark:border-slate-700 rounded-sm mb-4">
                        <PageNumberIcon className="w-10 h-10 text-primary-700 dark:text-primary-400"/>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold font-display text-slate-900 dark:text-white">Add Page Numbers to PDF</h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 mt-2">Insert page numbers into your PDF files with ease.</p>
                </div>

                {!file ? (
                    <FileUploader onFileSelect={handleFileSelect} processing={isProcessing || isLoading} />
                ) : (
                    <div className="flex flex-col lg:flex-row gap-8">
                        <aside className="lg:w-1/3 xl:w-1/4 bg-white/50 dark:bg-slate-800/20 border border-slate-300 dark:border-slate-700 p-6 self-start sticky top-28">
                            <div className="flex items-center space-x-3 mb-4 overflow-hidden">
                            <DocumentTextIcon className="w-6 h-6 text-primary-700 flex-shrink-0" />
                            <span className="font-medium text-slate-700 dark:text-slate-200 truncate" title={file?.name}>{file?.name}</span>
                            </div>
                            <button onClick={handleReset} className="w-full text-sm text-center text-slate-500 hover:text-primary-700 dark:hover:text-primary-400 mb-4">Choose another file</button>
                            
                            <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-4">
                                <div>
                                    <label className="font-semibold block mb-2">Position</label>
                                    <select value={position} onChange={(e) => setPosition(e.target.value as Position)} className="w-full p-2 border rounded-sm dark:bg-slate-700 dark:border-slate-600 focus:ring-primary-500 focus:border-primary-500">
                                        <option value="top-left">Top Left</option>
                                        <option value="top-center">Top Center</option>
                                        <option value="top-right">Top Right</option>
                                        <option value="bottom-left">Bottom Left</option>
                                        <option value="bottom-center">Bottom Center</option>
                                        <option value="bottom-right">Bottom Right</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="font-semibold block mb-2">Format</label>
                                    <select value={format} onChange={(e) => setFormat(e.target.value as 'n' | 'n of N')} className="w-full p-2 border rounded-sm dark:bg-slate-700 dark:border-slate-600 focus:ring-primary-500 focus:border-primary-500">
                                        <option value="n">1, 2, 3...</option>
                                        <option value="n of N">1 of 10, 2 of 10...</option>
                                    </select>
                                </div>
                                <div className="flex gap-4">
                                    <div>
                                        <label htmlFor="startFrom" className="font-semibold block mb-2">Start from</label>
                                        <input id="startFrom" type="number" value={startFrom} onChange={(e) => setStartFrom(Number(e.target.value))} className="w-full p-2 border rounded-sm dark:bg-slate-700 dark:border-slate-600 min-1 focus:ring-primary-500 focus:border-primary-500" />
                                    </div>
                                    <div>
                                        <label htmlFor="fontSize" className="font-semibold block mb-2">Font size</label>
                                        <input id="fontSize" type="number" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full p-2 border rounded-sm dark:bg-slate-700 dark:border-slate-600 min-6 focus:ring-primary-500 focus:border-primary-500" />
                                    </div>
                                </div>
                            </div>

                            {error && <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg text-sm"><strong className="font-bold">Error: </strong>{error}</div>}

                            <div className="mt-6">
                                <button onClick={handleAddPageNumbers} disabled={isLoading || isProcessing} className="w-full bg-primary-700 text-white font-bold py-3 px-4 rounded-sm hover:bg-primary-800 flex items-center justify-center text-lg disabled:bg-primary-400 uppercase tracking-wider">
                                    {isLoading ? <Spinner /> : 'Add Page Numbers'}
                                </button>
                            </div>
                        </aside>
                        <main className="flex-1 min-h-[60vh]">
                            {isProcessing ? (
                                <div className="flex justify-center items-center h-full"><Spinner /></div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {pageThumbnails.map((src, index) => (
                                        <div key={index} className="relative p-1 border rounded-lg bg-white/50 dark:bg-slate-800/20 border-slate-300 dark:border-slate-700">
                                            <img src={src} alt={`Page ${index + 1}`} className="w-full rounded-md shadow-sm" />
                                            <div className="absolute top-1 right-1 bg-black/60 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{index + 1}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </main>
                    </div>
                )}

                 <div className="mt-12 pt-8 border-t border-slate-300 dark:border-slate-700">
                    <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-4">How to Add Page Numbers to a PDF</h2>
                    <ol className="list-decimal list-inside space-y-4 text-slate-700 dark:text-slate-300">
                        <li><strong>Upload Your PDF:</strong> Start by selecting the document you want to add page numbers to.</li>
                        <li><strong>Customize Your Numbers:</strong> Use the options panel to choose the position (e.g., bottom-center), format ('1' or '1 of 10'), starting number, and font size.</li>
                        <li><strong>Apply and Download:</strong> Click the 'Add Page Numbers' button. The tool will process your file and the newly numbered PDF will download automatically.</li>
                    </ol>
                </div>

                <div className="mt-12">
                    <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-4">Frequently Asked Questions</h2>
                    <FaqItem question="Can I choose where the page numbers appear?">
                        Yes, you can choose from six different positions: top-left, top-center, top-right, bottom-left, bottom-center, and bottom-right.
                    </FaqItem>
                    <FaqItem question="Can I start numbering from a specific page?">
                        Currently, the numbering applies to all pages starting from the first page. The 'Start from' option lets you define the initial number (e.g., you can start counting from 5 instead of 1).
                    </FaqItem>
                    <FaqItem question="Is this process secure?">
                        Absolutely. Your PDF is processed locally in your browser and is never uploaded to our servers, ensuring your document's confidentiality.
                    </FaqItem>
                </div>

                <CommentSection />
            </div>
        </>
    );
};

export default PageNumbersPage;