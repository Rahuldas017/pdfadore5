import React, { useState, useCallback, useRef, useEffect } from 'react';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import { Chart as ChartJS, registerables } from 'chart.js';
import { Chat } from '@google/genai';
import FileUploader from '../components/FileUploader';
import Spinner from '../components/Spinner';
import { AiEditIcon, PaperAirplaneIcon, SparklesIcon, UploadCloudIcon } from '../components/icons/IconComponents';
import useDocumentTitle from '../hooks/useDocumentTitle';
import CommentSection from '../components/CommentSection';
import { createAiEditChatSession, extractTablesFromText, summarizeText } from '../services/geminiService';
import { extractTextFromPDF } from '../services/pdfParser';
import { exportToCsv } from '../services/csvHelper';

ChartJS.register(...registerables);
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs`;

interface AiChatMessage {
    sender: 'user' | 'ai';
    text: string;
    isLoading?: boolean;
    download?: { url: string; filename: string; label: string };
    data?: any; 
}

interface PdfFile {
    name: string;
    bytes: Uint8Array;
}

type UserActionRequest = {
    type: 'request_files' | 'request_input';
    reason: string;
    inputType?: 'password' | 'text';
} | null;

const extractJsonFromAiResponse = (text: string): any | null => {
    let cleanText = text.trim();
    
    // Find content within markdown fences ```json ... ``` or ``` ... ```
    const markdownMatch = cleanText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (markdownMatch && markdownMatch[1]) {
        cleanText = markdownMatch[1];
    }

    // Find the first opening bracket '{' or '['
    const firstBracketIndex = cleanText.search(/[{[]/);
    if (firstBracketIndex === -1) {
        console.error("AI response did not contain a JSON object or array.", text);
        return null;
    }

    // Trim the string to start from the first bracket
    const jsonString = cleanText.substring(firstBracketIndex);

    try {
        return JSON.parse(jsonString);
    } catch (e) {
        // The JSON might be incomplete. Try to find the last valid bracket.
        let openBrackets = 0;
        const openChar = jsonString[0];
        const closeChar = openChar === '{' ? '}' : ']';

        for (let i = 0; i < jsonString.length; i++) {
            if (jsonString[i] === openChar) {
                openBrackets++;
            } else if (jsonString[i] === closeChar) {
                openBrackets--;
            }
            if (openBrackets === 0) {
                // Found a potentially complete block, try parsing just this part
                const potentialJson = jsonString.substring(0, i + 1);
                try {
                    const result = JSON.parse(potentialJson);
                    // Successfully parsed a complete block
                    return result;
                } catch (finalError) {
                    // This block was not valid json, but there might be more text, so we continue
                }
            }
        }
        
        console.error("Failed to parse JSON from AI response even after attempting to fix.", { originalText: text, attemptedParse: jsonString, error: e });
        return null;
    }
};


const AiEditPdfPage: React.FC = () => {
    useDocumentTitle("AI Edit PDF | Premium Editing Tool | Pdfadore.com");

    const [pdfFiles, setPdfFiles] = useState<PdfFile[]>([]);
    const [pageViews, setPageViews] = useState<string[]>([]);
    const [chatSession, setChatSession] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<AiChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isProcessingFile, setIsProcessingFile] = useState<boolean>(false);
    const [isAiResponding, setIsAiResponding] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [userActionRequest, setUserActionRequest] = useState<UserActionRequest>(null);

    const chatContainerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        chatContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, [messages]);

    const updatePdfPreview = useCallback(async (bytes: Uint8Array) => {
        try {
            const pdf = await pdfjsLib.getDocument({ data: bytes.slice(0) }).promise;
            const views: string[] = [];
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 1.5 });
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                if (context) {
                    await page.render({ canvas, canvasContext: context, viewport: viewport }).promise;
                    views.push(canvas.toDataURL());
                }
            }
            setPageViews(views);
        } catch (err) {
            console.error("Failed to update PDF preview:", err);
            setError("Could not render the updated PDF preview.");
        }
    }, []);

    const addWatermark = async (bytes: Uint8Array): Promise<Uint8Array> => {
        const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
        const helveticaFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const pages = pdfDoc.getPages();
        for (const page of pages) {
            const { width, height } = page.getSize();
            page.drawText('Pdfadore', {
                x: width / 2 - 150, y: height / 2, font: helveticaFont,
                size: 80, color: rgb(0, 0, 0), opacity: 0.1, rotate: degrees(-45),
            });
        }
        return await pdfDoc.save();
    };

    const handleFileSelect = useCallback(async (selectedFile: File) => {
        setIsProcessingFile(true);
        setError('');
        setMessages([]);
        setPageViews([]);
        try {
            const initialBytes = new Uint8Array(await selectedFile.arrayBuffer());
            const watermarkedBytes = await addWatermark(initialBytes);
            setPdfFiles([{ name: selectedFile.name, bytes: watermarkedBytes }]);
            await updatePdfPreview(watermarkedBytes);
            const session = createAiEditChatSession();
            setChatSession(session);
            setMessages([{ sender: 'ai', text: `Your document "${selectedFile.name}" is ready. I can merge, split, compress, edit, and much more. What would you like to do?` }]);
        } catch (err) {
            setError('Failed to process PDF.');
        } finally {
            setIsProcessingFile(false);
        }
    }, [updatePdfPreview]);

    const getPosition = (position: string, objectWidth: number, objectHeight: number, page: any) => {
        const { width, height } = page.getSize();
        const margin = 50;
        switch (position) {
            case 'top-left': return { x: margin, y: height - margin - objectHeight };
            case 'top-center': return { x: (width / 2) - (objectWidth / 2), y: height - margin - objectHeight };
            case 'top-right': return { x: width - margin - objectWidth, y: height - margin - objectHeight };
            case 'middle-left': return { x: margin, y: (height / 2) - (objectHeight / 2) };
            case 'center': return { x: (width / 2) - (objectWidth / 2), y: (height / 2) - (objectHeight / 2) };
            case 'middle-right': return { x: width - margin - objectWidth, y: (height / 2) - (objectHeight / 2) };
            case 'bottom-left': return { x: margin, y: margin };
            case 'bottom-center': return { x: (width / 2) - (objectWidth / 2), y: margin };
            case 'bottom-right': return { x: width - margin - objectWidth, y: margin };
            default: return { x: (width / 2) - (objectWidth / 2), y: (height / 2) - (objectHeight / 2) };
        }
    }

    const executeAiTasks = async (tasks: any[], responseMessage: string) => {
        setMessages(prev => [...prev, { sender: 'ai', text: responseMessage }]);
        
        let currentPdfBytes = pdfFiles[0].bytes;

        for (const task of tasks) {
            const { action, parameters } = task;
            setMessages(prev => [...prev, { sender: 'ai', text: `Starting: ${action}...`, isLoading: true }]);
            
            try {
                switch (action) {
                    case 'request_files':
                        setUserActionRequest({ type: 'request_files', reason: parameters.reason });
                        return;
                    case 'request_input':
                        setUserActionRequest({ type: 'request_input', reason: parameters.reason, inputType: parameters.type });
                        return;
                    case 'merge':
                        const mergedDoc = await PDFDocument.create();
                        for (const file of pdfFiles) {
                            const doc = await PDFDocument.load(file.bytes, { ignoreEncryption: true });
                            const copiedPages = await mergedDoc.copyPages(doc, doc.getPageIndices());
                            copiedPages.forEach(page => mergedDoc.addPage(page));
                        }
                        currentPdfBytes = await mergedDoc.save();
                        setPdfFiles([{ name: 'merged.pdf', bytes: currentPdfBytes }]);
                        break;
                    case 'split': {
                        const pdfDoc = await PDFDocument.load(currentPdfBytes, { ignoreEncryption: true });
                        const zip = new JSZip();
                        for (let i = 0; i < pdfDoc.getPageCount(); i++) {
                            const newDoc = await PDFDocument.create();
                            const [copiedPage] = await newDoc.copyPages(pdfDoc, [i]);
                            newDoc.addPage(copiedPage);
                            const pageBytes = await newDoc.save();
                            zip.file(`${pdfFiles[0].name}_page_${i + 1}.pdf`, pageBytes);
                        }
                        const zipBlob = await zip.generateAsync({ type: 'blob' });
                        const url = URL.createObjectURL(zipBlob);
                        setMessages(prev => [...prev.filter(m => !m.isLoading), { sender: 'ai', text: `Splitting complete. Your file is ready.`, download: { url, filename: 'split_pages.zip', label: 'Download Split PDFs' } }]);
                        continue;
                    }
                    case 'compress':
                        const pdfJsDoc = await pdfjsLib.getDocument({ data: currentPdfBytes.slice(0) }).promise;
                        const newPdfDoc = await PDFDocument.create();
                        for (let i = 1; i <= pdfJsDoc.numPages; i++) {
                            const page = await pdfJsDoc.getPage(i);
                            const viewport = page.getViewport({ scale: 1.5 });
                            const canvas = document.createElement('canvas');
                            canvas.width = viewport.width; canvas.height = viewport.height;
                            const context = canvas.getContext('2d');
                            if(!context) continue;
                            await page.render({ canvas, canvasContext: context, viewport }).promise;
                            const jpegBytes = await fetch(canvas.toDataURL('image/jpeg', 0.7)).then(res => res.arrayBuffer());
                            const jpegImage = await newPdfDoc.embedJpg(jpegBytes);
                            const newPage = newPdfDoc.addPage([viewport.width, viewport.height]);
                            newPage.drawImage(jpegImage, { x: 0, y: 0, width: viewport.width, height: viewport.height });
                        }
                        currentPdfBytes = await newPdfDoc.save();
                        break;
                    case 'rotate': {
                        const { angle } = parameters;
                        const pdfDoc = await PDFDocument.load(currentPdfBytes, { ignoreEncryption: true });
                        const pages = pdfDoc.getPages();
                        pages.forEach(page => {
                            const currentRotation = page.getRotation().angle;
                            page.setRotation(degrees(currentRotation + angle));
                        });
                        currentPdfBytes = await pdfDoc.save();
                        break;
                    }
                    case 'add_page_numbers': {
                        const pdfDoc = await PDFDocument.load(currentPdfBytes, { ignoreEncryption: true });
                        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
                        const pages = pdfDoc.getPages();
                        for (let i = 0; i < pages.length; i++) {
                            const page = pages[i];
                            const pageNumText = parameters.format === 'n_of_N' ? `${i + 1} of ${pages.length}` : `${i + 1}`;
                            const textWidth = font.widthOfTextAtSize(pageNumText, 12);
                            const coords = getPosition(parameters.position || 'bottom-center', textWidth, 12, page);
                            page.drawText(pageNumText, { ...coords, font, size: 12, color: rgb(0, 0, 0) });
                        }
                        currentPdfBytes = await pdfDoc.save();
                        break;
                    }
                    case 'watermark': {
                        const { text, font_size = 50, opacity = 0.3, rotation = -45 } = parameters;
                        const pdfDoc = await PDFDocument.load(currentPdfBytes, { ignoreEncryption: true });
                        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
                        const pages = pdfDoc.getPages();
                        for (const page of pages) {
                            const { width, height } = page.getSize();
                            const textWidth = font.widthOfTextAtSize(text, font_size);
                            page.drawText(text, {
                                x: width / 2 - textWidth / 2, y: height / 2,
                                font, size: font_size, color: rgb(0, 0, 0), opacity, rotate: degrees(rotation)
                            });
                        }
                        currentPdfBytes = await pdfDoc.save();
                        break;
                    }
                    case 'protect': {
                        const { password } = parameters;
                        if (!password) throw new Error("Password not provided for protection.");
                        const pdfDoc = await PDFDocument.load(currentPdfBytes);
                        currentPdfBytes = await pdfDoc.save({ userPassword: password, ownerPassword: password } as any);
                        break;
                    }
                    case 'unlock': {
                        const { password } = parameters;
                        if (!password) throw new Error("Password not provided for unlocking.");
                        const pdfDoc = await PDFDocument.load(currentPdfBytes, { password } as any);
                        currentPdfBytes = await pdfDoc.save();
                        break;
                    }
                    case 'add_text': {
                        const { text, page: pageNum, font_size = 12, position = 'center' } = parameters;
                        const pdfDoc = await PDFDocument.load(currentPdfBytes, { ignoreEncryption: true });
                        const page = pdfDoc.getPage(pageNum - 1);
                        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
                        const textWidth = font.widthOfTextAtSize(text, font_size);
                        const textHeight = font.heightAtSize(font_size);
                        const coords = getPosition(position, textWidth, textHeight, page);
                        page.drawText(text, { ...coords, font, size: font_size, color: rgb(0, 0, 0) });
                        currentPdfBytes = await pdfDoc.save();
                        break;
                    }
                    case 'whiteout': {
                        const { page: pageNum, position = 'center', width: boxWidth, height: boxHeight } = parameters;
                        const pdfDoc = await PDFDocument.load(currentPdfBytes, { ignoreEncryption: true });
                        const page = pdfDoc.getPage(pageNum - 1);
                        const coords = getPosition(position, boxWidth, boxHeight, page);
                        // Y coordinate for rectangles is the bottom-left corner, so no need to adjust for height
                        page.drawRectangle({
                            x: coords.x, y: coords.y,
                            width: boxWidth, height: boxHeight,
                            color: rgb(1, 1, 1),
                            borderColor: rgb(1, 1, 1),
                        });
                        currentPdfBytes = await pdfDoc.save();
                        break;
                    }
                    case 'summarize': {
                        const text = await extractTextFromPDF(new File([currentPdfBytes], pdfFiles[0].name));
                        const summary = await summarizeText(text);
                        setMessages(prev => [...prev.filter(m => !m.isLoading), { sender: 'ai', text: `Here is the summary:\n\n${summary}` }]);
                        continue;
                    }
                    case 'extract_tables': {
                        const text = await extractTextFromPDF(new File([currentPdfBytes], pdfFiles[0].name));
                        const result = await extractTablesFromText(text);
                        if (result.tables && result.tables.length > 0) {
                             setMessages(prev => [...prev.filter(m => !m.isLoading), { sender: 'ai', text: `I found ${result.tables.length} table(s). You can download them as CSV files.`, data: { tables: result.tables } }]);
                        } else {
                            setMessages(prev => [...prev.filter(m => !m.isLoading), { sender: 'ai', text: `I couldn't find any tables in the document.` }]);
                        }
                        continue;
                    }
                     case 'extract_text': {
                        const text = await extractTextFromPDF(new File([currentPdfBytes], pdfFiles[0].name));
                        setMessages(prev => [...prev.filter(m => !m.isLoading), { sender: 'ai', text: `Here is the full text:\n\n${text}` }]);
                        continue;
                    }
                    case 'extract_images': {
                        const zip = new JSZip();
                        const pdf = await pdfjsLib.getDocument({ data: currentPdfBytes.slice(0) }).promise;
                        for (let i = 1; i <= pdf.numPages; i++) {
                            const page = await pdf.getPage(i);
                            const viewport = page.getViewport({ scale: 2.0 });
                            const canvas = document.createElement('canvas');
                            canvas.height = viewport.height; canvas.width = viewport.width;
                            const context = canvas.getContext('2d');
                            if (context) {
                                await page.render({ canvas, canvasContext: context, viewport: viewport }).promise;
                                const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
                                zip.file(`${pdfFiles[0].name}_page_${i}.jpg`, dataUrl.split(',')[1], { base64: true });
                            }
                        }
                        const zipBlob = await zip.generateAsync({ type: 'blob' });
                        const url = URL.createObjectURL(zipBlob);
                        setMessages(prev => [...prev.filter(m => !m.isLoading), { sender: 'ai', text: `Conversion complete. Your images are ready.`, download: { url, filename: 'images.zip', label: 'Download JPGs as ZIP' } }]);
                        continue;
                    }
                    case 'unsupported':
                        setMessages(prev => [...prev.filter(m => !m.isLoading), { sender: 'ai', text: parameters.reason }]);
                        continue;
                }

                setPdfFiles(prev => [{ ...prev[0], bytes: currentPdfBytes }])
                await updatePdfPreview(currentPdfBytes);
                setMessages(prev => [...prev.filter(m => !m.isLoading), { sender: 'ai', text: `Finished: ${action}.` }]);

            } catch(e) {
                 setMessages(prev => [...prev.filter(m => !m.isLoading), { sender: 'ai', text: `An error occurred during task '${action}': ${e instanceof Error ? e.message : 'Unknown error'}` }]);
                 break;
            }
        }
        setMessages(prev => [...prev, { sender: 'ai', text: "All tasks complete! What's next?" }]);
    };
    
    const handleSendMessage = async (e: React.FormEvent, providedInput?: string) => {
        e.preventDefault();
        const currentInput = providedInput || userInput;
        if (!currentInput.trim() || !chatSession || isAiResponding) return;

        setUserActionRequest(null);
        setMessages(prev => [...prev, { sender: 'user', text: currentInput }]);
        setUserInput('');
        setIsAiResponding(true);
        setMessages(prev => [...prev, { sender: 'ai', text: 'Thinking...', isLoading: true }]);

        try {
            const response = await chatSession.sendMessage({ message: currentInput });
            const result = extractJsonFromAiResponse(response.text);
            
            setMessages(prev => prev.filter(m => !m.isLoading));

            if (result && result.tasks && typeof result.response_message === 'string') {
                await executeAiTasks(result.tasks, result.response_message);
            } else {
                setMessages(prev => [...prev, { sender: 'ai', text: "Sorry, I had trouble understanding that. Please try rephrasing your request." }]);
            }

        } catch (err) {
            console.error("AI response error:", err);
            setMessages(prev => prev.filter(m => !m.isLoading));
            setMessages(prev => [...prev, { sender: 'ai', text: `Sorry, I had trouble connecting. Please try again in a moment.` }]);
        } finally {
            setIsAiResponding(false);
        }
    };

    const handleAdditionalFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);
            const newPdfFiles: PdfFile[] = await Promise.all(
                newFiles.map(async file => ({
                    name: file.name,
                    bytes: new Uint8Array(await file.arrayBuffer())
                }))
            );
            setPdfFiles(prev => [...prev, ...newPdfFiles]);
            const fileNames = newFiles.map(f => f.name).join(', ');
            setUserActionRequest(null);
            setMessages(prev => [...prev, { sender: 'user', text: `(Uploaded ${fileNames})` }, { sender: 'ai', text: "Great, I have the new files. I'll proceed with the merge."}]);
            
            // Re-trigger the AI with context
            setIsAiResponding(true);
            try {
                const response = await chatSession!.sendMessage({ message: "Okay, I have uploaded the additional files. Now please proceed with the merge and any other tasks I asked for." });
                const result = extractJsonFromAiResponse(response.text);
                if (result && result.tasks && result.tasks.length > 0) {
                    await executeAiTasks(result.tasks, result.response_message);
                }
            } catch (err) {
                setMessages(prev => [...prev, { sender: 'ai', text: "Something went wrong after the upload. Please repeat your last instruction." }]);
            } finally {
                setIsAiResponding(false);
            }
        }
    };
    
    const handleDownload = () => {
        if (pdfFiles.length === 0) return;
        const mainFile = pdfFiles[0];
        const blob = new Blob([mainFile.bytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${mainFile.name.replace(/\.pdf$/i, '')}_ai-edited.pdf`;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        a.remove();
    };

    const handleReset = () => { setPdfFiles([]); setPageViews([]); setError(''); setUserInput(''); setMessages([]); };

    if (pdfFiles.length === 0) {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <div className="flex justify-center items-center mx-auto w-16 h-16 bg-primary-100/50 dark:bg-primary-900/50 border border-slate-300 dark:border-slate-700 rounded-sm mb-4">
                        <AiEditIcon className="w-10 h-10 text-primary-700 dark:text-primary-400"/>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold font-display text-slate-900 dark:text-white">AI Edit PDF</h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 mt-2">The all-in-one tool. Describe your edits in plain English and let AI modify your document.</p>
                </div>
                <FileUploader onFileSelect={handleFileSelect} processing={isProcessingFile} />
                <div className="mt-12"><CommentSection /></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
             <div className="flex flex-col lg:flex-row gap-8">
                <aside className="lg:w-1/3 xl:w-1/4 bg-white/50 dark:bg-slate-800/20 border border-slate-300 dark:border-slate-700 self-start sticky top-28 flex flex-col h-[80vh]">
                    <div className="p-4 border-b border-slate-300 dark:border-slate-700">
                        <h3 className="font-bold text-lg font-display">AI Multi-Tool Chat</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate" title={pdfFiles[0].name}>Editing: {pdfFiles[0].name} {pdfFiles.length > 1 ? `(+${pdfFiles.length - 1} more)` : ''}</p>
                    </div>

                    <div ref={chatContainerRef} className="flex-grow p-4 space-y-4 overflow-y-auto">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex items-start gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {msg.sender === 'ai' && <div className="w-8 h-8 rounded-full bg-primary-100/30 dark:bg-primary-500/20 border border-slate-300 dark:border-slate-600 flex items-center justify-center flex-shrink-0"><SparklesIcon className="w-5 h-5 text-primary-700 dark:text-primary-400" /></div>}
                                <div className={`max-w-xs px-3 py-2 rounded-lg text-sm ${msg.sender === 'user' ? 'bg-primary-700 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>
                                    {msg.isLoading ? <div className="flex items-center gap-2"><Spinner/><span>{msg.text}</span></div> : <p className="whitespace-pre-wrap">{msg.text}</p>}
                                    {msg.download && <a href={msg.download.url} download={msg.download.filename} className="block mt-2 text-center bg-green-600 text-white font-semibold py-1 px-3 rounded-md hover:bg-green-700">{msg.download.label}</a>}
                                    {msg.data?.tables && msg.data.tables.map((table: any, tIndex: number) => (
                                        <button key={tIndex} onClick={() => exportToCsv(`${table.tableName}.csv`, table.data)} className="block w-full mt-2 text-left bg-blue-600 text-white font-semibold py-1 px-3 rounded-md hover:bg-blue-700">Download "{table.tableName}.csv"</button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="p-4 border-t border-slate-300 dark:border-slate-700">
                         {userActionRequest?.type === 'request_files' && (
                            <div className="mb-2 p-2 bg-primary-100 dark:bg-primary-900/50 rounded-md">
                                <p className="text-sm font-semibold text-primary-800 dark:text-primary-200">{userActionRequest.reason}</p>
                                <button onClick={() => fileInputRef.current?.click()} className="mt-2 w-full flex items-center justify-center gap-2 bg-white dark:bg-slate-600 px-3 py-1.5 rounded-md text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-500">
                                    <UploadCloudIcon className="w-4 h-4" /> Upload Files
                                </button>
                                <input type="file" ref={fileInputRef} onChange={handleAdditionalFileChange} multiple accept="application/pdf" className="hidden" />
                            </div>
                        )}
                        {userActionRequest?.type === 'request_input' && (
                             <form onSubmit={(e) => handleSendMessage(e, userInput)} className="mb-2 p-2 bg-primary-100 dark:bg-primary-900/50 rounded-md">
                                <label className="text-sm font-semibold text-primary-800 dark:text-primary-200">{userActionRequest.reason}</label>
                                <input type={userActionRequest.inputType || 'text'} value={userInput} onChange={e => setUserInput(e.target.value)} autoFocus className="mt-1 w-full p-1.5 rounded-md border-slate-300" />
                                <button type="submit" className="mt-2 w-full bg-primary-600 text-white px-3 py-1.5 rounded-md text-sm font-semibold hover:bg-primary-700">Submit</button>
                            </form>
                        )}
                        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                             <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder="e.g., merge, compress, and add numbers" className="flex-grow px-4 py-2 bg-white dark:bg-slate-800 border border-slate-400 dark:border-slate-600 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-600 text-sm" disabled={isAiResponding || !!userActionRequest}/>
                            <button type="submit" className="p-3 bg-primary-700 text-white rounded-full hover:bg-primary-800 disabled:bg-primary-400" disabled={!userInput.trim() || isAiResponding || !!userActionRequest}>
                                <PaperAirplaneIcon className="w-5 h-5" />
                            </button>
                        </form>
                    </div>

                    <div className="p-4 border-t border-slate-300 dark:border-slate-700 space-y-2">
                        <button onClick={handleDownload} className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-sm hover:bg-green-700 uppercase tracking-wider text-sm">Download PDF</button>
                        <button onClick={handleReset} className="w-full text-sm text-center text-slate-500 hover:text-primary-700 dark:hover:text-primary-400">Start Over</button>
                    </div>
                </aside>

                <main className="flex-1 min-h-[80vh]">
                    <h2 className="font-bold text-xl mb-2 font-display">PDF Preview</h2>
                    {isProcessingFile ? <div className="flex justify-center items-center h-full"><Spinner /></div> : 
                    (<div className="space-y-4">
                        {pageViews.map((src, index) => (
                            <div key={index} className="relative border rounded-lg bg-white shadow-sm overflow-hidden border-slate-400 dark:border-slate-600">
                                <img src={src} alt={`Page ${index + 1}`} className="w-full" />
                            </div>
                        ))}
                    </div>)}
                </main>
            </div>
        </div>
    );
};

export default AiEditPdfPage;