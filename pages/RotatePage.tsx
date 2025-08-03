import React, { useState } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import Spinner from '../components/Spinner';
import FileUploader from '../components/FileUploader';
import { RotateIcon, DocumentTextIcon } from '../components/icons/IconComponents';
import CommentSection from '../components/CommentSection';
import useDocumentTitle from '../hooks/useDocumentTitle';
import JsonLd from '../components/JsonLd';
import FaqItem from '../components/FaqItem';

const RotatePage: React.FC = () => {
    useDocumentTitle("Rotate PDF | Rotate PDF Pages Online for Free | Pdfadore.com");

    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [pageThumbnails, setPageThumbnails] = useState<string[]>([]);
    const [rotations, setRotations] = useState<number[]>([]);

    const handleFileSelect = async (selectedFile: File) => {
        setIsProcessing(true);
        setFile(selectedFile);
        setError('');
        setPageThumbnails([]);
        
        try {
            const arrayBuffer = await selectedFile.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            setRotations(new Array(pdf.numPages).fill(0));
            const thumbnails: string[] = [];
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 0.5 });
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
        setRotations([]);
    };

    const handleRotate = (index: number) => {
        const newRotations = [...rotations];
        newRotations[index] = (newRotations[index] + 90) % 360;
        setRotations(newRotations);
    };

    const handleApplyRotations = async () => {
        if (!file) return;
        setIsLoading(true);
        setError('');

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
            
            rotations.forEach((angle, index) => {
                if (angle !== 0) {
                    const page = pdfDoc.getPage(index);
                    const currentRotation = page.getRotation().angle;
                    page.setRotation(degrees(currentRotation + angle));
                }
            });

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${file.name.replace(/\.pdf$/i, '')}_rotated.pdf`;
            a.click();
            URL.revokeObjectURL(url);
            
            handleReset();

        } catch (err) {
            console.error(err);
            setError("Failed to rotate PDF. The file might be corrupted.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const howToSchema = {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": "How to Rotate a PDF",
      "description": "Rotate individual pages of a PDF document to the correct orientation.",
      "step": [
        { "@type": "HowToStep", "name": "Upload PDF", "text": "Select the PDF file containing pages you need to rotate." },
        { "@type": "HowToStep", "name": "Rotate Pages", "text": "Hover over the thumbnail of a page and click the rotate icon. Click multiple times to rotate by 90, 180, or 270 degrees." },
        { "@type": "HowToStep", "name": "Apply Changes", "text": "Once you have rotated all the necessary pages, click the 'Apply Changes & Download' button." },
        { "@type": "HowToStep", "name": "Download PDF", "text": "Your new PDF with the corrected page rotations will be downloaded." }
      ]
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "Can I rotate all pages in the document at once?",
                "acceptedAnswer": { "@type": "Answer", "text": "This tool is designed for precise, page-by-page rotation. If you need to rotate an entire document, you can often do so in your PDF viewer's print settings before printing to a new PDF." }
            },
            {
                "@type": "Question",
                "name": "Will rotating a page reduce its quality?",
                "acceptedAnswer": { "@type": "Answer", "text": "No, rotating a PDF page is a lossless operation. It simply changes the metadata for how the page should be displayed, so the quality of your text and images will remain exactly the same." }
            },
            {
                "@type": "Question",
                "name": "Is it safe to use this tool with sensitive documents?",
                "acceptedAnswer": { "@type": "Answer", "text": "Yes, it is completely secure. All file processing, including rotation, happens directly within your browser. Your files are never uploaded to our servers." }
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
                        <RotateIcon className="w-10 h-10 text-primary-700 dark:text-primary-400"/>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold font-display text-slate-900 dark:text-white">Rotate PDF</h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 mt-2">Rotate your PDF pages just the way you need them.</p>
                </div>

                {!file ? (
                    <FileUploader onFileSelect={handleFileSelect} processing={isProcessing || isLoading} />
                ) : (
                    <div>
                        <div className="bg-white/50 dark:bg-slate-800/20 p-6 border border-slate-300 dark:border-slate-700 w-full mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3 overflow-hidden">
                                    <DocumentTextIcon className="w-6 h-6 text-primary-700 flex-shrink-0" />
                                    <span className="font-medium text-slate-700 dark:text-slate-200 truncate">{file.name}</span>
                                </div>
                                <button onClick={handleReset} className="text-sm text-slate-500 hover:text-primary-700 dark:hover:text-primary-400">Choose another file</button>
                            </div>
                            <button onClick={handleApplyRotations} disabled={isLoading || isProcessing} className="w-full bg-primary-700 text-white font-bold py-3 px-4 rounded-sm hover:bg-primary-800 transition-colors flex items-center justify-center disabled:bg-primary-400 uppercase tracking-wider">
                                {isLoading ? <Spinner /> : 'Apply Changes & Download'}
                            </button>
                        </div>

                        {isProcessing ? (
                            <div className="flex justify-center items-center h-full"><Spinner /></div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                {pageThumbnails.map((src, index) => (
                                    <div key={index} className="relative group p-1 border rounded-lg bg-white dark:bg-slate-800/20 border-slate-300 dark:border-slate-700 overflow-hidden">
                                        <img src={src} alt={`Page ${index + 1}`} className="w-full rounded-md shadow-sm transition-transform duration-300 group-hover:scale-105" style={{ transform: `rotate(${rotations[index]}deg)` }} />
                                        <div className="absolute top-1 right-1 bg-black/60 text-white text-xs font-bold px-1.5 py-0.5 rounded-full z-10">{index + 1}</div>
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button onClick={() => handleRotate(index)} className="p-2 bg-white/80 rounded-full text-primary-600 hover:bg-white" title={`Rotate 90°`}>
                                                <RotateIcon className="w-6 h-6"/>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                {error && <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert"><strong className="font-bold">Error: </strong>{error}</div>}
                
                <div className="mt-12 pt-8 border-t border-slate-300 dark:border-slate-700">
                    <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-4">How to Rotate PDF Pages</h2>
                    <ol className="list-decimal list-inside space-y-4 text-slate-700 dark:text-slate-300">
                        <li><strong>Select your PDF:</strong> Upload the document with pages that need rotating.</li>
                        <li><strong>Rotate Individual Pages:</strong> Previews of all pages will be shown. Hover your mouse over any page and click the rotate icon to turn it 90 degrees clockwise. Click again as needed for 180 or 270-degree rotation.</li>
                        <li><strong>Apply and Save:</strong> After setting the correct orientation for all pages, click "Apply Changes & Download".</li>
                        <li><strong>Download Your File:</strong> Your new PDF with the corrected rotations will be downloaded to your device.</li>
                    </ol>
                </div>

                <div className="mt-12">
                    <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-4">Frequently Asked Questions</h2>
                    <FaqItem question="Can I rotate all pages in the document at once?">
                      This tool is designed for precise, page-by-page rotation. If you need to rotate an entire document, you can often do so in your PDF viewer's print settings before printing to a new PDF.
                    </FaqItem>
                    <FaqItem question="Will rotating a page reduce its quality?">
                      No, rotating a PDF page is a lossless operation. It simply changes the metadata for how the page should be displayed, so the quality of your text and images will remain exactly the same.
                    </FaqItem>
                    <FaqItem question="Is it safe to use this tool with sensitive documents?">
                      Yes, it is completely secure. All file processing, including rotation, happens directly within your browser. Your files are never uploaded to our servers.
                    </FaqItem>
                </div>

                <CommentSection />
            </div>
        </>
    );
};

export default RotatePage;