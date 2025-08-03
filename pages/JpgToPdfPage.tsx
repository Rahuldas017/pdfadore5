import React, { useState } from 'react';
import { PDFDocument, rgb, PageSizes } from 'pdf-lib';
import Spinner from '../components/Spinner';
import { JpgIcon, DocumentTextIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon, PlusIcon } from '../components/icons/IconComponents';
import CommentSection from '../components/CommentSection';
import useDocumentTitle from '../hooks/useDocumentTitle';
import JsonLd from '../components/JsonLd';
import FaqItem from '../components/FaqItem';

const JpgToPdfPage: React.FC = () => {
    useDocumentTitle("Image to PDF Converter | Convert JPG to PDF Free | Pdfadore.com");
    
    const [files, setFiles] = useState<File[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [previews, setPreviews] = useState<string[]>([]);
    const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
    const [pageSize, setPageSize] = useState<string>('A4');

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const newFiles = Array.from(event.target.files).filter(file => file.type.startsWith('image/'));
            setFiles(prev => [...prev, ...newFiles]);
            newFiles.forEach(file => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviews(prev => [...prev, reader.result as string]);
                };
                reader.readAsDataURL(file);
            });
            setError('');
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const moveFile = (index: number, direction: 'up' | 'down') => {
        if ((direction === 'up' && index === 0) || (direction === 'down' && index === files.length - 1)) return;
        
        const newFiles = [...files];
        const newPreviews = [...previews];
        
        const item = newFiles[index];
        const previewItem = newPreviews[index];

        newFiles.splice(index, 1);
        newPreviews.splice(index, 1);

        const newIndex = direction === 'up' ? index - 1 : index + 1;
        
        newFiles.splice(newIndex, 0, item);
        newPreviews.splice(newIndex, 0, previewItem);
        
        setFiles(newFiles);
        setPreviews(newPreviews);
    };

    const handleConvert = async () => {
        if (files.length === 0) {
            setError("Please select at least one image file.");
            return;
        }
        setIsLoading(true);
        setError('');

        try {
            const pdfDoc = await PDFDocument.create();
            
            for (const previewDataUrl of previews) {
                // This function will load any browser-supported image, draw it to a canvas,
                // and return it as a PNG data URL, which is a robust format.
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
                            resolve(canvas.toDataURL('image/png')); // Always convert to PNG for reliability
                        };
                        img.onerror = () => reject(new Error("Failed to load image. It might be corrupted or in an unsupported format."));
                        img.src = previewDataUrl;
                    });
                };
                
                const sanitizedPngDataUrl = await getSanitizedImage();
                const pngBytes = await fetch(sanitizedPngDataUrl).then(res => res.arrayBuffer());
                const image = await pdfDoc.embedPng(pngBytes);
                
                let page = pdfDoc.addPage(PageSizes[pageSize as keyof typeof PageSizes]);
                
                if (orientation === 'landscape') {
                    const { width: w, height: h } = page.getSize();
                    page.setSize(h, w);
                }

                const { width, height } = page.getSize();
                const scaled = image.scaleToFit(width, height);

                page.drawImage(image, {
                    x: (width - scaled.width) / 2,
                    y: (height - scaled.height) / 2,
                    width: scaled.width,
                    height: scaled.height,
                });
            }

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'converted_images.pdf';
            document.body.appendChild(a);
            a.click();
            URL.revokeObjectURL(url);
a.remove();
            
            setFiles([]);
            setPreviews([]);
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : "Failed to convert images to PDF. Please ensure they are valid image files.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const howToSchema = {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": "How to Convert Images to PDF",
      "description": "Combine multiple JPG, PNG, or other image formats into a single PDF document.",
      "step": [
        { "@type": "HowToStep", "name": "Select Images", "text": "Click 'Select Images' to upload your JPG, PNG, or other image files." },
        { "@type": "HowToStep", "name": "Order and Configure", "text": "Drag and drop the image thumbnails to arrange them in the desired order. Choose your page size and orientation." },
        { "@type": "HowToStep", "name": "Convert to PDF", "text": "Click the 'Convert to PDF' button to begin the conversion." },
        { "@type": "HowToStep", "name": "Download", "text": "Your new PDF file will be downloaded automatically." }
      ]
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "What image formats are supported?",
                "acceptedAnswer": { "@type": "Answer", "text": "Our tool supports all standard web image formats, including JPG/JPEG, PNG, GIF, BMP, and WEBP. For best results, we recommend using JPG or PNG." }
            },
            {
                "@type": "Question",
                "name": "Can I change the order of my images?",
                "acceptedAnswer": { "@type": "Answer", "text": "Yes. After uploading your images, you can simply drag and drop the thumbnails into the order you want them to appear in the final PDF." }
            },
            {
                "@type": "Question",
                "name": "How is my privacy protected?",
                "acceptedAnswer": { "@type": "Answer", "text": "The entire conversion process happens locally in your browser. Your images are never uploaded to our servers, ensuring your files remain private and secure." }
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
                        <JpgIcon className="w-10 h-10 text-primary-700 dark:text-primary-400"/>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold font-display text-slate-900 dark:text-white">Image to PDF</h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 mt-2">Convert JPG, PNG, and other images to PDF. Adjust orientation and margins.</p>
                </div>

                <div className="bg-white/50 dark:bg-slate-800/20 p-6 border border-slate-300 dark:border-slate-700 w-full">
                    {files.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg">
                        <h2 className="text-xl font-semibold font-display text-slate-700 dark:text-slate-200">Select Image files to convert</h2>
                        <label htmlFor="file-upload" className="relative cursor-pointer mt-4 inline-block">
                            <span className="px-6 py-3 bg-primary-700 text-white rounded-sm font-semibold hover:bg-primary-800 uppercase tracking-wider text-sm">Select Images</span>
                            <input id="file-upload" type="file" className="sr-only" accept="image/*" multiple onChange={handleFileChange} />
                        </label>
                    </div>
                    ) : (
                    <div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
                            {previews.map((preview, index) => (
                                <div key={index} className="relative group bg-slate-100 dark:bg-slate-700/50 rounded-md p-1 border border-slate-200 dark:border-slate-600 hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                                    <img src={preview} alt={`preview ${index}`} className="w-full h-32 object-contain rounded-md"/>
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                        <button onClick={() => moveFile(index, 'up')} disabled={index === 0} className="p-2 bg-white/80 rounded-full text-slate-800 hover:bg-white disabled:opacity-30"><ArrowUpIcon className="w-4 h-4"/></button>
                                        <button onClick={() => moveFile(index, 'down')} disabled={index === files.length - 1} className="p-2 bg-white/80 rounded-full text-slate-800 hover:bg-white disabled:opacity-30"><ArrowDownIcon className="w-4 h-4"/></button>
                                        <button onClick={() => removeFile(index)} className="p-2 bg-white/80 rounded-full text-red-500 hover:bg-white"><TrashIcon className="w-4 h-4"/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-center border-t border-slate-200 dark:border-slate-700 pt-4">
                            <label htmlFor="add-more-files" className="relative cursor-pointer">
                                <span className="px-4 py-2 bg-slate-200 text-slate-700 dark:bg-slate-600 dark:text-slate-200 rounded-sm font-semibold hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors flex items-center"><PlusIcon className="w-5 h-5 mr-2"/> Add more files</span>
                                <input id="add-more-files" type="file" className="sr-only" accept="image/*" multiple onChange={handleFileChange} />
                            </label>
                        </div>
                    </div>
                    )}
                </div>

                {error && <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert"><strong className="font-bold">Error: </strong><span className="block sm:inline">{error}</span></div>}
                
                {files.length > 0 && (
                    <div className="mt-8">
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mb-6 bg-white/50 dark:bg-slate-800/20 border border-slate-300 dark:border-slate-700 p-4 rounded-sm">
                            <div>
                                <label htmlFor="page-size" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Page size</label>
                                <select id="page-size" value={pageSize} onChange={e => setPageSize(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-sm dark:bg-slate-700 dark:border-slate-600">
                                    {Object.keys(PageSizes).map(size => <option key={size} value={size}>{size}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Page orientation</label>
                                <div className="flex items-center gap-4 mt-1">
                                    <label className="flex items-center"><input type="radio" name="orientation" value="portrait" checked={orientation === 'portrait'} onChange={() => setOrientation('portrait')} className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-slate-300"/> <span className="ml-2">Portrait</span></label>
                                    <label className="flex items-center"><input type="radio" name="orientation" value="landscape" checked={orientation === 'landscape'} onChange={() => setOrientation('landscape')} className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-slate-300"/> <span className="ml-2">Landscape</span></label>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleConvert}
                            disabled={isLoading}
                            className="w-full bg-primary-700 text-white font-bold py-4 px-4 rounded-sm hover:bg-primary-800 transition-colors flex items-center justify-center text-lg disabled:bg-primary-300 uppercase tracking-wider"
                        >
                            {isLoading ? <Spinner /> : `Convert to PDF`}
                        </button>
                    </div>
                )}
                
                <div className="mt-12 pt-8 border-t border-slate-300 dark:border-slate-700">
                    <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-4">How to Convert Images to PDF</h2>
                    <ol className="list-decimal list-inside space-y-4 text-slate-700 dark:text-slate-300">
                        <li><strong>Upload Your Images:</strong> Click the "Select Images" button and choose any JPG, PNG, or other image files you want to include in your PDF.</li>
                        <li><strong>Organize Your File:</strong> Drag and drop the image previews to arrange them in the perfect order.</li>
                        <li><strong>Set Your Options:</strong> Choose the page size (e.g., A4, Letter) and orientation (Portrait or Landscape) for your final PDF document.</li>
                        <li><strong>Create Your PDF:</strong> Click "Convert to PDF" and our tool will combine your images into a single, high-quality PDF file for you to download.</li>
                    </ol>
                </div>

                <div className="mt-12">
                    <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-4">Frequently Asked Questions</h2>
                    <FaqItem question="What image formats are supported?">
                      Our tool supports all standard web image formats, including JPG/JPEG, PNG, GIF, BMP, and WEBP. For best results, we recommend using JPG or PNG.
                    </FaqItem>
                    <FaqItem question="Can I change the order of my images?">
                      Yes. After uploading your images, you can simply drag and drop the thumbnails into the order you want them to appear in the final PDF.
                    </FaqItem>
                    <FaqItem question="How is my privacy protected?">
                      The entire conversion process happens locally in your browser. Your images are never uploaded to our servers, ensuring your files remain private and secure.
                    </FaqItem>
                </div>

                <CommentSection />
            </div>
        </>
    );
};

export default JpgToPdfPage;
