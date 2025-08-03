import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import Spinner from '../components/Spinner';
import FileUploader from '../components/FileUploader';
import { JpgIcon, DocumentTextIcon, ZipIcon } from '../components/icons/IconComponents';
import CommentSection from '../components/CommentSection';
import useDocumentTitle from '../hooks/useDocumentTitle';
import JsonLd from '../components/JsonLd';
import FaqItem from '../components/FaqItem';

const PdfToJpgPage: React.FC = () => {
    useDocumentTitle("PDF to JPG Converter | Convert PDF to Images Free | Pdfadore.com");

    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [pageThumbnails, setPageThumbnails] = useState<string[]>([]);
    
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
                const viewport = page.getViewport({ scale: 0.5 });
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                if (context) {
                    await page.render({ canvas, canvasContext: context, viewport: viewport }).promise;
                    thumbnails.push(canvas.toDataURL('image/jpeg'));
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
    
    const handleConvert = async () => {
        if (!file) return;
        setIsLoading(true);
        setError('');

        try {
            const zip = new JSZip();
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better quality
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                
                if (context) {
                    await page.render({ canvas, canvasContext: context, viewport: viewport }).promise;
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.9); // 90% quality
                    const base64Data = dataUrl.split(',')[1];
                    zip.file(`${file.name.replace(/\.pdf$/i, '')}_page_${i}.jpg`, base64Data, { base64: true });
                }
            }
            
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(zipBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${file.name.replace(/\.pdf$/i, '')}_images.zip`;
            a.click();
            URL.revokeObjectURL(url);

            handleReset();

        } catch (err) {
            console.error(err);
            setError("Failed to convert pages to JPG. The file might be corrupted.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const howToSchema = {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": "How to Convert PDF to JPG",
      "description": "Convert each page of a PDF document into a high-quality JPG image.",
      "step": [
        { "@type": "HowToStep", "name": "Upload PDF", "text": "Select the PDF file you want to convert to images." },
        { "@type": "HowToStep", "name": "Preview Pages", "text": "A preview of each page in your document will be displayed." },
        { "@type": "HowToStep", "name": "Convert to JPG", "text": "Click the 'Convert to JPG & Download ZIP' button." },
        { "@type": "HowToStep", "name": "Download ZIP", "text": "A ZIP file containing all the converted JPG images will be downloaded to your computer." }
      ]
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "What quality will the JPG images be?",
                "acceptedAnswer": { "@type": "Answer", "text": "We convert the pages to high-quality JPG images (90% quality setting) to ensure a good balance between image clarity and file size." }
            },
            {
                "@type": "Question",
                "name": "Can I extract the original images from the PDF?",
                "acceptedAnswer": { "@type": "Answer", "text": "This tool converts each full page into a JPG image. It does not extract the original, individual images embedded within the PDF. For that, specific PDF image extraction tools would be needed." }
            },
            {
                "@type": "Question",
                "name": "Why are the images downloaded in a ZIP file?",
                "acceptedAnswer": { "@type": "Answer", "text": "To make downloading convenient, we package all the converted JPG images from your PDF into a single ZIP archive. This allows you to download all the files at once." }
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
                        <JpgIcon className="w-10 h-10 text-primary-700 dark:text-primary-400"/>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold font-display text-slate-900 dark:text-white">PDF to JPG</h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 mt-2">Convert every page of your PDF into a high-quality JPG image.</p>
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
                            <button onClick={handleConvert} disabled={isLoading || isProcessing} className="w-full bg-primary-700 text-white font-bold py-3 px-4 rounded-sm hover:bg-primary-800 transition-colors flex items-center justify-center disabled:bg-primary-400 uppercase tracking-wider">
                                {isLoading ? <Spinner /> : (<><ZipIcon className="w-5 h-5 mr-2"/> Convert to JPG & Download ZIP</>)}
                            </button>
                        </div>

                        {isProcessing ? (
                            <div className="flex justify-center items-center h-full"><Spinner /></div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                {pageThumbnails.map((src, index) => (
                                    <div key={index} className="relative p-1 border rounded-lg bg-white/50 dark:bg-slate-800/20 border-slate-300 dark:border-slate-700">
                                        <img src={src} alt={`Page ${index + 1}`} className="w-full rounded-md shadow-sm" />
                                        <div className="absolute top-1 right-1 bg-black/60 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{index + 1}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                {error && <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert"><strong className="font-bold">Error: </strong>{error}</div>}
                
                <div className="mt-12 pt-8 border-t border-slate-300 dark:border-slate-700">
                    <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-4">How to Convert a PDF to JPG Images</h2>
                    <ol className="list-decimal list-inside space-y-4 text-slate-700 dark:text-slate-300">
                        <li><strong>Upload Your PDF:</strong> Select the PDF document you wish to convert.</li>
                        <li><strong>Preview Your Pages:</strong> The tool will quickly generate and display a thumbnail for every page in your document.</li>
                        <li><strong>Convert and Download:</strong> Click the "Convert to JPG & Download ZIP" button. The tool will convert each page to a high-quality JPG image and package them in a single ZIP file for easy downloading.</li>
                    </ol>
                </div>

                <div className="mt-12">
                    <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-4">Frequently Asked Questions</h2>
                    <FaqItem question="What quality will the JPG images be?">
                        We convert the pages to high-quality JPG images (90% quality setting) to ensure a good balance between image clarity and file size.
                    </FaqItem>
                    <FaqItem question="Can I extract the original images from the PDF?">
                        This tool converts each full page into a JPG image. It does not extract the original, individual images embedded within the PDF. For that, specific PDF image extraction tools would be needed.
                    </FaqItem>
                    <FaqItem question="Why are the images downloaded in a ZIP file?">
                        To make downloading convenient, we package all the converted JPG images from your PDF into a single ZIP archive. This allows you to download all the files at once.
                    </FaqItem>
                </div>

                <CommentSection />
            </div>
        </>
    );
};

export default PdfToJpgPage;