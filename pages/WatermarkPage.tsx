
import React, { useState } from 'react';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import Spinner from '../components/Spinner';
import FileUploader from '../components/FileUploader';
import { WatermarkIcon, DocumentTextIcon } from '../components/icons/IconComponents';
import CommentSection from '../components/CommentSection';
import useDocumentTitle from '../hooks/useDocumentTitle';
import JsonLd from '../components/JsonLd';
import FaqItem from '../components/FaqItem';

const WatermarkPage: React.FC = () => {
    useDocumentTitle("Add Watermark to PDF | Free Text & Image Watermarking | Pdfadore.com");

    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    
    const [mode, setMode] = useState<'text' | 'image'>('text');
    const [text, setText] = useState('CONFIDENTIAL');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    
    const [opacity, setOpacity] = useState(0.5);
    const [rotation, setRotation] = useState(-45);
    const [fontSize, setFontSize] = useState(100);

    const handleFileSelect = (selectedFile: File) => {
        setFile(selectedFile);
        setError('');
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const imgFile = e.target.files[0];
            setImageFile(imgFile);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(imgFile);
        }
    };
    
    const handleReset = () => {
        setFile(null);
        setError('');
        // Also reset options if needed
    };

    const handleAddWatermark = async () => {
        if (!file) return;
        if (mode === 'image' && !imageFile) {
            setError('Please select an image file for the watermark.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const pdfDoc = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
            
            let watermarkImage;
            if (mode === 'image' && imageFile && imagePreview) {
                // Sanitize the watermark image by drawing to canvas and getting PNG bytes
                const getSanitizedImage = (): Promise<string> => {
                    return new Promise((resolve, reject) => {
                        const img = new Image();
                        img.onload = () => {
                            const canvas = document.createElement('canvas');
                            canvas.width = img.width;
                            canvas.height = img.height;
                            const ctx = canvas.getContext('2d');
                            if (!ctx) return reject(new Error("Could not get canvas context"));
                            ctx.drawImage(img, 0, 0);
                            resolve(canvas.toDataURL('image/png'));
                        };
                        img.onerror = () => reject(new Error("Failed to load watermark image. It might be corrupted."));
                        img.src = imagePreview; // imagePreview is the data URL
                    });
                };
                
                const sanitizedPngDataUrl = await getSanitizedImage();
                const pngBytes = await fetch(sanitizedPngDataUrl).then(res => res.arrayBuffer());
                watermarkImage = await pdfDoc.embedPng(pngBytes);
            }
            const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

            const pages = pdfDoc.getPages();
            for (const page of pages) {
                const { width, height } = page.getSize();
                if (mode === 'text') {
                    page.drawText(text, {
                        x: width / 2 - (helveticaBold.widthOfTextAtSize(text, fontSize) / 2),
                        y: height / 2 - (fontSize/2),
                        font: helveticaBold,
                        size: fontSize,
                        color: rgb(0, 0, 0),
                        opacity: opacity,
                        rotate: degrees(rotation),
                    });
                } else if (watermarkImage) {
                    const scaled = watermarkImage.scaleToFit(width * 0.5, height * 0.5);
                    page.drawImage(watermarkImage, {
                        x: width / 2 - scaled.width / 2,
                        y: height / 2 - scaled.height / 2,
                        width: scaled.width,
                        height: scaled.height,
                        opacity: opacity,
                        rotate: degrees(rotation),
                    });
                }
            }

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${file.name.replace(/\.pdf$/i, '')}_watermarked.pdf`;
            a.click();
            URL.revokeObjectURL(url);
            
            handleReset();

        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : "Failed to add watermark.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const howToSchema = {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": "How to Add a Watermark to a PDF",
      "description": "Easily stamp a text or image watermark onto your PDF document.",
      "step": [
        { "@type": "HowToStep", "name": "Upload PDF", "text": "Select the PDF file you want to watermark." },
        { "@type": "HowToStep", "name": "Choose Watermark Type", "text": "Select 'Add Text' to type a text watermark, or 'Add Image' to upload a logo or image." },
        { "@type": "HowToStep", "name": "Customize Watermark", "text": "Enter your text or upload your image, then adjust the font size (for text), rotation, and opacity to your liking." },
        { "@type": "HowToStep", "name": "Apply and Download", "text": "Click the 'Add Watermark & Download' button to process the file and download your watermarked PDF." }
      ]
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "Can I place the watermark in different positions?",
                "acceptedAnswer": { "@type": "Answer", "text": "This tool automatically centers the watermark on each page. For more advanced positioning, you might need a more comprehensive PDF editor." }
            },
            {
                "@type": "Question",
                "name": "What image formats can I use for an image watermark?",
                "acceptedAnswer": { "@type": "Answer", "text": "You can upload standard image formats like PNG, JPG/JPEG, and GIF. For best results with transparency, we recommend using a PNG file." }
            },
            {
                "@type": "Question",
                "name": "Is my document secure?",
                "acceptedAnswer": { "@type": "Answer", "text": "Yes, your security is guaranteed. The watermarking process is done entirely in your browser, and your files are never uploaded to our servers." }
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
                        <WatermarkIcon className="w-10 h-10 text-primary-700 dark:text-primary-400"/>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold font-display text-slate-900 dark:text-white">Add Watermark to PDF</h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 mt-2">Stamp an image or text over your PDF in seconds.</p>
                </div>

                {!file ? ( <FileUploader onFileSelect={handleFileSelect} processing={isLoading} /> ) : 
                (
                    <div className="bg-white/50 dark:bg-slate-800/20 p-6 border border-slate-300 dark:border-slate-700 w-full">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3 overflow-hidden"><DocumentTextIcon className="w-6 h-6 text-primary-700 flex-shrink-0" /><span className="font-medium truncate">{file.name}</span></div>
                            <button onClick={handleReset} className="text-sm text-slate-500 hover:text-primary-700 dark:hover:text-primary-400">Choose another file</button>
                        </div>

                        <div className="border-t dark:border-slate-700 my-6 pt-6">
                            <h3 className="font-bold text-lg mb-3">Watermark Options</h3>
                            <div className="flex rounded-md shadow-sm mb-4">
                                <button onClick={() => setMode('text')} className={`px-4 py-2 text-sm font-medium rounded-l-md w-1/2 ${mode === 'text' ? 'bg-primary-700 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>Add Text</button>
                                <button onClick={() => setMode('image')} className={`px-4 py-2 text-sm font-medium rounded-r-md w-1/2 ${mode === 'image' ? 'bg-primary-700 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>Add Image</button>
                            </div>

                            {mode === 'text' && <input type="text" value={text} onChange={e => setText(e.target.value)} className="w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 focus:ring-primary-500 focus:border-primary-500" placeholder="Watermark text"/>}
                            {mode === 'image' && 
                                <div>
                                    <input type="file" accept="image/*" onChange={handleImageChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"/>
                                    {imagePreview && <img src={imagePreview} alt="preview" className="mt-4 max-h-24 rounded"/>}
                                </div>
                            }
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                <div>
                                    <label className="block text-sm font-medium">Font Size (for text)</label>
                                    <input type="number" value={fontSize} onChange={e => setFontSize(Number(e.target.value))} className="w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 focus:ring-primary-500 focus:border-primary-500" disabled={mode !== 'text'}/>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Rotation (degrees)</label>
                                    <input type="number" value={rotation} onChange={e => setRotation(Number(e.target.value))} className="w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 focus:ring-primary-500 focus:border-primary-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium">Opacity ({Math.round(opacity * 100)}%)</label>
                                    <input type="range" min="0" max="1" step="0.05" value={opacity} onChange={e => setOpacity(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-primary-600" />
                                </div>
                            </div>

                        </div>
                        
                        {error && <div className="my-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg text-sm"><strong className="font-bold">Error: </strong>{error}</div>}
                        
                        <button onClick={handleAddWatermark} disabled={isLoading} className="w-full bg-primary-700 text-white font-bold py-3 px-4 rounded-sm hover:bg-primary-800 flex items-center justify-center disabled:bg-primary-400 uppercase tracking-wider">
                            {isLoading ? <Spinner /> : 'Add Watermark & Download'}
                        </button>
                    </div>
                )}
                <div className="mt-12 pt-8 border-t border-slate-300 dark:border-slate-700">
                    <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-4">How to Add a Watermark to a PDF</h2>
                    <ol className="list-decimal list-inside space-y-4 text-slate-700 dark:text-slate-300">
                        <li><strong>Select Your PDF:</strong> Upload the document you want to watermark.</li>
                        <li><strong>Choose Watermark Type:</strong> Decide if you want a text watermark (e.g., "CONFIDENTIAL") or an image watermark (e.g., your company logo).</li>
                        <li><strong>Customize It:</strong> Enter your text or upload your image. Then, use the sliders and input fields to adjust the font size, rotation, and transparency to get the perfect look.</li>
                        <li><strong>Apply Your Watermark:</strong> Click the "Add Watermark" button. The tool will apply your watermark to every page of the PDF and start the download.</li>
                    </ol>
                </div>
                <div className="mt-12">
                    <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-4">Frequently Asked Questions</h2>
                    <FaqItem question="Can I place the watermark in different positions?">
                        This tool automatically centers the watermark on each page. For more advanced positioning, you might need a more comprehensive PDF editor.
                    </FaqItem>
                    <FaqItem question="What image formats can I use for an image watermark?">
                        You can upload standard image formats like PNG, JPG/JPEG, and GIF. For best results with transparency, we recommend using a PNG file.
                    </FaqItem>
                    <FaqItem question="Is my document secure?">
                        Yes, your security is guaranteed. The watermarking process is done entirely in your browser, and your files are never uploaded to our servers.
                    </FaqItem>
                </div>
                <CommentSection />
            </div>
        </>
    );
};

export default WatermarkPage;
