import React, { useState, useRef } from 'react';
import { PDFDocument, rgb, StandardFonts, PDFFont } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import SignatureCanvas from 'react-signature-canvas';
import Spinner from '../components/Spinner';
import FileUploader from '../components/FileUploader';
import { SignIcon, DocumentTextIcon, TrashIcon } from '../components/icons/IconComponents';
import CommentSection from '../components/CommentSection';
import useDocumentTitle from '../hooks/useDocumentTitle';
import JsonLd from '../components/JsonLd';
import FaqItem from '../components/FaqItem';

type Signature = {
    img: string; // base64
    x: number;
    y: number;
    width: number;
    height: number;
    page: number;
};

const SignPage: React.FC = () => {
    useDocumentTitle("Sign PDF | Free Online PDF Signature Tool | Pdfadore.com");

    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [pageThumbnails, setPageThumbnails] = useState<string[]>([]);
    
    const [sigType, setSigType] = useState<'draw' | 'type'>('draw');
    const [typedText, setTypedText] = useState('Your Name');
    const [typedFont, setTypedFont] = useState('Caveat');
    const sigCanvasRef = useRef<SignatureCanvas>(null);

    const [signatures, setSignatures] = useState<Signature[]>([]);
    const [activeSignature, setActiveSignature] = useState<string | null>(null);
    const [activeSignatureDims, setActiveSignatureDims] = useState({ width: 150, height: 75 });
    
    const handleFileSelect = async (selectedFile: File) => {
        setIsProcessing(true);
        setFile(selectedFile);
        setError('');
        setPageThumbnails([]);
        setSignatures([]);
        
        try {
            const arrayBuffer = await selectedFile.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const thumbnails: string[] = [];
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 1 });
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
        } catch (err) { setError('Failed to preview PDF.'); } 
        finally { setIsProcessing(false); }
    };
    
    const clearSignature = () => sigCanvasRef.current?.clear();
    
    const addSignatureToPanel = () => {
        let sigData: string | null = null;
        if(sigType === 'draw' && sigCanvasRef.current && !sigCanvasRef.current.isEmpty()){
            sigData = sigCanvasRef.current.getTrimmedCanvas().toDataURL('image/png');
        } else if (sigType === 'type' && typedText) {
             const canvas = document.createElement('canvas');
             const ctx = canvas.getContext('2d');
             canvas.width = 400;
             canvas.height = 100;
             if(ctx) {
                ctx.font = `60px ${typedFont}`;
                ctx.fillText(typedText, 10, 70);
                sigData = canvas.toDataURL('image/png');
             }
        }
        if(sigData) setActiveSignature(sigData);
    };

    const handlePageDrop = (e: React.DragEvent<HTMLDivElement>, pageIndex: number) => {
        e.preventDefault();
        if(!activeSignature) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setSignatures(prev => [...prev, { 
            img: activeSignature, 
            x: x - (activeSignatureDims.width / 2), // center the drop
            y: rect.height - y - (activeSignatureDims.height / 2), // pdf-lib y is from bottom
            width: activeSignatureDims.width,
            height: activeSignatureDims.height,
            page: pageIndex
        }]);
        setActiveSignature(null); // Clear active signature after placing
    };

    const handleApplySignatures = async () => {
         if (!file || signatures.length === 0) return;
        setIsLoading(true);
        setError('');

        try {
            const pdfDoc = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
            
            for (const sig of signatures) {
                const pngImage = await pdfDoc.embedPng(sig.img);
                const page = pdfDoc.getPage(sig.page);
                page.drawImage(pngImage, {
                    x: sig.x,
                    y: sig.y,
                    width: sig.width,
                    height: sig.height,
                });
            }

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${file.name.replace(/\.pdf$/i, '')}_signed.pdf`;
            a.click();
            URL.revokeObjectURL(url);
            
            setFile(null); setPageThumbnails([]); setSignatures([]);

        } catch (err) {
            console.error(err);
            setError("Failed to apply signatures.");
        } finally {
            setIsLoading(false);
        }
    };

    const howToSchema = {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": "How to Sign a PDF Document",
      "description": "Add your signature to a PDF for free by drawing, typing, or uploading an image.",
      "step": [
        { "@type": "HowToStep", "name": "Upload PDF", "text": "Select the PDF document you need to sign." },
        { "@type": "HowToStep", "name": "Create Your Signature", "text": "In the side panel, choose to either draw your signature with your mouse or trackpad, or type it out and select a font." },
        { "@type": "HowToStep", "name": "Place Your Signature", "text": "Click 'Add Signature', then drag your newly created signature from the panel and drop it onto the desired location on the PDF page." },
        { "@type": "HowToStep", "name": "Apply and Download", "text": "Click 'Apply & Download' to permanently embed the signature into the document and download the signed PDF." }
      ]
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "Are the signatures legally binding?",
                "acceptedAnswer": { "@type": "Answer", "text": "While electronic signatures are widely accepted, the legal validity can depend on your jurisdiction and the specific requirements of the document. For highly sensitive legal or financial documents, consult with a legal professional. This tool provides a simple electronic signature." }
            },
            {
                "@type": "Question",
                "name": "Can I sign with an image of my signature?",
                "acceptedAnswer": { "@type": "Answer", "text": "Currently, our tool supports drawing or typing a signature directly. We are working on adding the ability to upload an existing signature image." }
            },
            {
                "@type": "Question",
                "name": "Is my signed document secure?",
                "acceptedAnswer": { "@type": "Answer", "text": "Yes, the entire signing process happens in your browser. Your document and your signature are never uploaded to our servers, ensuring your information remains completely private." }
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
                        <SignIcon className="w-10 h-10 text-primary-700 dark:text-primary-400"/>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold font-display text-slate-900 dark:text-white">Sign PDF</h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 mt-2">Sign your documents by drawing or typing your signature.</p>
                </div>

                {!file ? (<FileUploader onFileSelect={handleFileSelect} processing={isProcessing || isLoading} />) : 
                (
                    <div className="flex flex-col lg:flex-row gap-8">
                        <aside className="lg:w-1/3 xl:w-1/4 bg-white/50 dark:bg-slate-800/20 p-6 border border-slate-300 dark:border-slate-700 self-start sticky top-28">
                            <h3 className="font-bold text-lg mb-3">Create Signature</h3>
                            <div className="flex rounded-md shadow-sm mb-4">
                                <button onClick={() => setSigType('draw')} className={`px-4 py-2 text-sm font-medium rounded-l-md w-1/2 ${sigType === 'draw' ? 'bg-primary-700 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>Draw</button>
                                <button onClick={() => setSigType('type')} className={`px-4 py-2 text-sm font-medium rounded-r-md w-1/2 ${sigType === 'type' ? 'bg-primary-700 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>Type</button>
                            </div>
                            {sigType === 'draw' ? (
                                <div>
                                    <SignatureCanvas ref={sigCanvasRef} canvasProps={{ className: 'w-full h-32 bg-slate-100 dark:bg-slate-700 rounded-md border' }} />
                                    <button onClick={clearSignature} className="text-sm text-slate-500 hover:underline mt-1">Clear</button>
                                </div>
                            ) : (
                                <div>
                                    <input type="text" value={typedText} onChange={e => setTypedText(e.target.value)} className="w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 mb-2 focus:ring-primary-500" style={{fontFamily: typedFont, fontSize: '24px'}} />
                                    <select value={typedFont} onChange={e => setTypedFont(e.target.value)} className="w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 focus:ring-primary-500">
                                        <option value="Caveat">Caveat</option>
                                        <option value="Dancing Script">Dancing Script</option>
                                        <option value="Times New Roman">Times New Roman</option>
                                    </select>
                                </div>
                            )}
                            <button onClick={addSignatureToPanel} className="w-full bg-slate-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-slate-700 mt-4">Create Signature</button>
                            
                            {activeSignature && 
                                <div className="mt-4 p-2 border-2 border-dashed border-primary-500 rounded-md text-center">
                                    <p className="text-sm mb-2 font-semibold">Drag this to a page:</p>
                                    <img src={activeSignature} alt="Your Signature" className="bg-white p-1 mx-auto cursor-move" style={{width: activeSignatureDims.width, height: activeSignatureDims.height}} draggable="true" />
                                </div>
                            }
                            <hr className="my-6 dark:border-slate-700"/>
                            <button onClick={handleApplySignatures} disabled={isLoading || signatures.length === 0} className="w-full bg-primary-700 text-white font-bold py-3 px-4 rounded-md hover:bg-primary-800 flex items-center justify-center text-lg disabled:bg-primary-400 uppercase tracking-wider">
                                {isLoading ? <Spinner /> : 'Apply & Download'}
                            </button>
                            {error && <div className="mt-4 text-red-500 text-sm">{error}</div>}
                        </aside>
                        <main className="flex-1 min-h-[80vh]">
                            {isProcessing ? <div className="flex justify-center items-center h-full"><Spinner /></div> : 
                            (
                                <div className="space-y-4">
                                    {pageThumbnails.map((src, index) => (
                                        <div key={index} onDrop={(e) => handlePageDrop(e, index)} onDragOver={(e) => e.preventDefault()} className="relative border rounded-lg bg-white shadow-sm overflow-hidden border-slate-300 dark:border-slate-700">
                                            <img src={src} alt={`Page ${index + 1}`} className="w-full" />
                                            {signatures.filter(s => s.page === index).map((sig, sIndex) => (
                                                <img key={sIndex} src={sig.img} alt="signature" className="absolute" style={{left: sig.x, top: `calc(${100}% - ${sig.y}px - ${sig.height}px)`, width: sig.width, height: sig.height}} />
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </main>
                    </div>
                )}
                
                <div className="mt-12 pt-8 border-t border-slate-300 dark:border-slate-700">
                    <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-4">How to Sign a PDF</h2>
                    <ol className="list-decimal list-inside space-y-4 text-slate-700 dark:text-slate-300">
                        <li><strong>Upload Your Document:</strong> Select the PDF file you need to sign.</li>
                        <li><strong>Create Your Signature:</strong> In the panel on the side, choose your preferred method. You can draw your signature using your mouse or trackpad, or simply type your name and choose a cursive font that you like.</li>
                        <li><strong>Place Signature on PDF:</strong> Click "Create Signature". Then, drag your new signature from the panel and drop it exactly where you want it on the document preview.</li>
                        <li><strong>Apply and Download:</strong> Once you've placed all necessary signatures, click "Apply & Download". The signatures will be permanently added, and your signed PDF will be ready for download.</li>
                    </ol>
                </div>

                <div className="mt-12">
                    <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-4">Frequently Asked Questions</h2>
                    <FaqItem question="Are the signatures legally binding?">
                    While electronic signatures are widely accepted, the legal validity can depend on your jurisdiction and the specific requirements of the document. For highly sensitive legal or financial documents, consult with a legal professional. This tool provides a simple electronic signature.
                    </FaqItem>
                    <FaqItem question="Can I sign with an image of my signature?">
                    Currently, our tool supports drawing or typing a signature directly. We are working on adding the ability to upload an existing signature image.
                    </FaqItem>
                    <FaqItem question="Is my signed document secure?">
                    Yes, the entire signing process happens in your browser. Your document and your signature are never uploaded to our servers, ensuring your information remains completely private.
                    </FaqItem>
                </div>

                <CommentSection />
            </div>
        </>
    );
};

export default SignPage;