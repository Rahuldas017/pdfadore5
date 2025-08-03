import React, { useState, useRef, useEffect } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import Spinner from '../components/Spinner';
import FileUploader from '../components/FileUploader';
import { EditIcon, DocumentTextIcon } from '../components/icons/IconComponents';
import CommentSection from '../components/CommentSection';
import useDocumentTitle from '../hooks/useDocumentTitle';
import JsonLd from '../components/JsonLd';
import FaqItem from '../components/FaqItem';

type EditObjectType = 'text' | 'image' | 'whiteout';
interface EditObject {
    id: number;
    type: EditObjectType;
    pageIndex: number;
    x: number; // position as a percentage of page width
    y: number; // position as a percentage of page height
    width: number; // width in pixels for rendering
    height: number; // height in pixels for rendering
    content: string; // text content or image data URL
    fontSize: number; // for text
}

let objectIdCounter = 0;

const EditPdfPage: React.FC = () => {
    useDocumentTitle("Edit PDF | Add Text, Images, and Shapes Free | Pdfadore.com");

    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [pageViews, setPageViews] = useState<{ url: string; width: number; height: number; }[]>([]);
    
    const [activeTool, setActiveTool] = useState<EditObjectType | 'select'>('select');
    const [edits, setEdits] = useState<EditObject[]>([]);
    const [selectedObject, setSelectedObject] = useState<number | null>(null);
    
    const [textToAdd, setTextToAdd] = useState('Your Text');
    const [fontSize, setFontSize] = useState(16);

    const imageInputRef = useRef<HTMLInputElement>(null);
    const pageContainerRef = useRef<HTMLDivElement>(null);
    
    const handleFileSelect = async (selectedFile: File) => {
        setIsProcessing(true);
        setFile(selectedFile);
        setError('');
        setPageViews([]);
        setEdits([]);
        
        try {
            const arrayBuffer = await selectedFile.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const views: { url: string; width: number; height: number; }[] = [];
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 2.0 }); // Render at high scale for quality
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                if (context) {
                    await page.render({ canvas, canvasContext: context, viewport: viewport }).promise;
                    views.push({ url: canvas.toDataURL(), width: page.view[2], height: page.view[3] });
                }
            }
            setPageViews(views);
        } catch (err) {
            console.error(err);
            setError('Failed to process PDF. It might be corrupted or protected.');
            setFile(null);
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleReset = () => {
        setFile(null);
        setError('');
        setPageViews([]);
        setEdits([]);
    };

    const handlePageClick = (e: React.MouseEvent<HTMLDivElement>, pageIndex: number) => {
        if (activeTool === 'select' || activeTool === 'image') return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const newEdit: EditObject = {
            id: objectIdCounter++,
            type: activeTool,
            pageIndex,
            x: (x / rect.width) * 100,
            y: (y / rect.height) * 100,
            width: activeTool === 'text' ? 150 : 100,
            height: activeTool === 'text' ? 25 : 100,
            content: activeTool === 'text' ? textToAdd : '',
            fontSize: activeTool === 'text' ? fontSize : 0,
        };
        
        setEdits(prev => [...prev, newEdit]);
        setActiveTool('select');
    };
    
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setTextToAdd(event.target.result as string);
                    setActiveTool('image');
                    alert('Image loaded. Click on the page to place it.');
                }
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    }
    
    const handlePlaceImage = (e: React.MouseEvent<HTMLDivElement>, pageIndex: number) => {
        if (activeTool !== 'image') return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const newEdit: EditObject = {
            id: objectIdCounter++,
            type: 'image', pageIndex,
            x: (x / rect.width) * 100, y: (y / rect.height) * 100,
            width: 150, height: 100,
            content: textToAdd, fontSize: 0,
        };
        setEdits(prev => [...prev, newEdit]);
        setActiveTool('select');
    };
    
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: number) => {
        e.dataTransfer.setData("application/json", JSON.stringify({id, offsetX: e.nativeEvent.offsetX, offsetY: e.nativeEvent.offsetY}));
    };
    
    const handleDrop = (e: React.DragEvent<HTMLDivElement>, pageIndex: number) => {
        e.preventDefault();
        const data = JSON.parse(e.dataTransfer.getData("application/json"));
        const rect = e.currentTarget.getBoundingClientRect();
        const newX = (e.clientX - rect.left - data.offsetX) / rect.width * 100;
        const newY = (e.clientY - rect.top - data.offsetY) / rect.height * 100;

        setEdits(edits.map(edit => edit.id === data.id ? {...edit, x: newX, y: newY, pageIndex } : edit));
    };

    const handleSaveChanges = async () => {
        if (!file) return;
        setIsLoading(true);
        setError('');

        try {
            const pdfDoc = await PDFDocument.load(await file.arrayBuffer(), { ignoreEncryption: true });
            const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

            for(const edit of edits) {
                const page = pdfDoc.getPage(edit.pageIndex);
                const { width: pageWidth, height: pageHeight } = page.getSize();
                
                const pdfX = (edit.x / 100) * pageWidth;
                // pdf-lib y-origin is bottom-left, screen is top-left, so we invert
                const pdfY = pageHeight - ((edit.y / 100) * pageHeight);
                const renderHeight = (edit.height / pageViews[edit.pageIndex].url.length) * pageHeight;

                switch(edit.type) {
                    case 'text':
                        page.drawText(edit.content, {
                            x: pdfX,
                            y: pdfY,
                            font: helveticaFont,
                            size: edit.fontSize,
                            color: rgb(0, 0, 0)
                        });
                        break;
                    case 'image':
                        const pngImageBytes = await fetch(edit.content).then(res => res.arrayBuffer());
                        const pngImage = await pdfDoc.embedPng(pngImageBytes);
                        page.drawImage(pngImage, {
                            x: pdfX,
                            y: pdfY - edit.height, // Adjust for image height
                            width: edit.width,
                            height: edit.height,
                        });
                        break;
                    case 'whiteout':
                        page.drawRectangle({
                            x: pdfX,
                            y: pdfY - edit.height, // Adjust for rect height
                            width: edit.width,
                            height: edit.height,
                            color: rgb(1, 1, 1),
                            borderColor: rgb(1,1,1) // no border
                        });
                        break;
                }
            }
            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${file.name.replace(/\.pdf$/i, '')}_edited.pdf`;
            a.click();
            URL.revokeObjectURL(url);
            handleReset();

        } catch (err) {
            console.error(err);
            setError("Failed to save changes to the PDF.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const howToSchema = {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": "How to Edit a PDF",
      "description": "Add text, images, and shapes to a PDF document for free.",
      "step": [
        { "@type": "HowToStep", "name": "Upload PDF", "text": "Select the PDF file you wish to edit." },
        { "@type": "HowToStep", "name": "Select a Tool", "text": "Choose 'Add Text', 'Add Image', or 'Whiteout' from the sidebar." },
        { "@type": "HowToStep", "name": "Add to Page", "text": "Click on the page where you want to add your text, image, or shape." },
        { "@type": "HowToStep", "name": "Position and Edit", "text": "Drag your added elements to position them. Double-click text to edit it." },
        { "@type": "HowToStep", "name": "Save and Download", "text": "Click 'Save Changes & Download' to get your edited PDF." }
      ]
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "Can I edit the existing text in the PDF?",
                "acceptedAnswer": { "@type": "Answer", "text": "This tool allows you to add new text on top of the PDF and cover up existing text with the 'Whiteout' tool. It does not support reflowing or directly editing the original text block in the PDF, as this is a very complex operation." }
            },
            {
                "@type": "Question",
                "name": "What is the 'Whiteout' tool for?",
                "acceptedAnswer": { "@type": "Answer", "text": "The 'Whiteout' tool lets you draw an opaque white rectangle over any part of the PDF. This is useful for covering up information you want to remove or replace before adding new text on top." }
            },
            {
                "@type": "Question",
                "name": "Is my edited PDF secure?",
                "acceptedAnswer": { "@type": "Answer", "text": "Yes, absolutely. The entire editing process happens in your browser. Your document is never uploaded to our servers, ensuring your data remains private." }
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
                        <EditIcon className="w-10 h-10 text-primary-700 dark:text-primary-400"/>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold font-display text-slate-900 dark:text-white">Edit PDF</h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 mt-2">Add text, images, and shapes to your PDF document.</p>
                </div>

                {!file ? (<FileUploader onFileSelect={handleFileSelect} processing={isProcessing || isLoading} />) : 
                (
                    <div className="flex flex-col lg:flex-row gap-8">
                        <aside className="lg:w-1/3 xl:w-1/4 bg-white/50 dark:bg-slate-800/20 p-6 border border-slate-300 dark:border-slate-700 self-start sticky top-28">
                            <h3 className="font-bold text-lg mb-3">Tools</h3>
                            <div className="space-y-2">
                                <button onClick={() => setActiveTool('text')} className={`w-full text-left p-2 rounded-md ${activeTool === 'text' ? 'bg-primary-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}>Add Text</button>
                                <button onClick={() => imageInputRef.current?.click()} className={`w-full text-left p-2 rounded-md ${activeTool === 'image' ? 'bg-primary-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}>Add Image</button>
                                <input type="file" ref={imageInputRef} onChange={handleImageUpload} accept="image/*" className="hidden"/>
                                <button onClick={() => setActiveTool('whiteout')} className={`w-full text-left p-2 rounded-md ${activeTool === 'whiteout' ? 'bg-primary-600 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}>Whiteout</button>
                            </div>
                            
                             <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                <label htmlFor="font-size" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Font Size (for new text)</label>
                                <input type="number" id="font-size" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} className="mt-1 block w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600" />
                            </div>

                            <hr className="my-6 dark:border-slate-700"/>
                            <button onClick={handleSaveChanges} disabled={isLoading || edits.length === 0} className="w-full bg-primary-700 text-white font-bold py-3 px-4 rounded-md hover:bg-primary-800 flex items-center justify-center text-lg disabled:bg-primary-400 uppercase tracking-wider">
                                {isLoading ? <Spinner /> : 'Save Changes'}
                            </button>
                            {error && <div className="mt-4 text-red-500 text-sm">{error}</div>}
                        </aside>
                        <main ref={pageContainerRef} className="flex-1 min-h-[80vh]">
                            {isProcessing ? <div className="flex justify-center items-center h-full"><Spinner /></div> : 
                            (
                                <div className="space-y-4">
                                    {pageViews.map((page, index) => (
                                        <div 
                                            key={index}
                                            className="relative border rounded-lg shadow-sm overflow-hidden border-slate-400 dark:border-slate-600"
                                            onClick={(e) => handlePageClick(e, index)}
                                            onDrop={(e) => handleDrop(e, index)}
                                            onDragOver={(e) => e.preventDefault()}
                                            style={{ cursor: activeTool !== 'select' ? 'crosshair' : 'default' }}
                                        >
                                            <img src={page.url} alt={`Page ${index + 1}`} className="w-full" />
                                            {edits.filter(edit => edit.pageIndex === index).map(edit => (
                                                <div
                                                    key={edit.id}
                                                    draggable
                                                    onDragStart={(e) => handleDragStart(e, edit.id)}
                                                    onDoubleClick={() => setSelectedObject(edit.id)}
                                                    className="absolute cursor-move border border-dashed border-primary-500"
                                                    style={{ left: `${edit.x}%`, top: `${edit.y}%`, width: edit.width, height: edit.height }}
                                                >
                                                    {edit.type === 'text' && (
                                                        <input 
                                                            type="text"
                                                            defaultValue={edit.content}
                                                            onBlur={(e) => setEdits(edits.map(ed => ed.id === edit.id ? {...ed, content: e.target.value} : ed))}
                                                            style={{fontSize: edit.fontSize, width: '100%', height: '100%', border: 'none', background: 'transparent'}}
                                                            className="text-black p-0"
                                                        />
                                                    )}
                                                     {edit.type === 'image' && <img src={edit.content} alt="user content" className="w-full h-full object-cover" />}
                                                     {edit.type === 'whiteout' && <div className="w-full h-full bg-white"></div>}
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </main>
                    </div>
                )}
                
                <div className="mt-12 pt-8 border-t border-slate-300 dark:border-slate-700">
                    <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-4">How to Edit a PDF</h2>
                    <ol className="list-decimal list-inside space-y-4 text-slate-700 dark:text-slate-300">
                        <li><strong>Upload Your PDF:</strong> Select the document you wish to make changes to.</li>
                        <li><strong>Choose Your Tool:</strong> From the sidebar, select a tool. "Add Text" to create a new text box, "Add Image" to upload an image, or "Whiteout" to cover existing content.</li>
                        <li><strong>Place on Page:</strong> Click anywhere on the PDF preview to place your selected element.</li>
                        <li><strong>Adjust and Edit:</strong> Drag and drop any element to move it. You can edit text directly in its box.</li>
                        <li><strong>Save Your Work:</strong> Once you're finished, click "Save Changes" to apply all your edits and download the new PDF.</li>
                    </ol>
                </div>

                <div className="mt-12">
                    <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-4">Frequently Asked Questions</h2>
                    <FaqItem question="Can I edit the existing text in the PDF?">
                        This tool allows you to add new text on top of the PDF and cover up existing text with the 'Whiteout' tool. It does not support reflowing or directly editing the original text block in the PDF, as this is a very complex operation.
                    </FaqItem>
                    <FaqItem question="What is the 'Whiteout' tool for?">
                        The 'Whiteout' tool lets you draw an opaque white rectangle over any part of the PDF. This is useful for covering up information you want to remove or replace before adding new text on top.
                    </FaqItem>
                    <FaqItem question="Is my edited PDF secure?">
                        Yes, absolutely. The entire editing process happens in your browser. Your document is never uploaded to our servers, ensuring your data remains private.
                    </FaqItem>
                </div>

                <CommentSection />
            </div>
        </>
    );
};

export default EditPdfPage;