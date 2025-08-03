import React, { useState, useCallback, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import Spinner from '../components/Spinner';
import { SplitIcon, DocumentTextIcon, PlusIcon, TrashIcon, ZipIcon, CheckCircleIcon } from '../components/icons/IconComponents';
import CommentSection from '../components/CommentSection';
import useDocumentTitle from '../hooks/useDocumentTitle';
import JsonLd from '../components/JsonLd';
import FaqItem from '../components/FaqItem';

const SplitPage: React.FC = () => {
    useDocumentTitle("Split PDF | Extract Pages from PDF for Free | Pdfadore.com");

    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [pageThumbnails, setPageThumbnails] = useState<string[]>([]);
    const [numPages, setNumPages] = useState(0);
    
    const [mode, setMode] = useState<'range' | 'extract'>('range');
    
    // Range mode state
    const [ranges, setRanges] = useState<{from: string, to: string}[]>([{ from: '', to: '' }]);
    const [mergeRanges, setMergeRanges] = useState(false);

    // Extract mode state
    const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (selectedFile: File) => {
        setIsProcessing(true);
        setError('');
        setFile(selectedFile);
        setPageThumbnails([]);
        setSelectedPages(new Set());
        setRanges([{ from: '', to: '' }]);

        try {
            const arrayBuffer = await selectedFile.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            setNumPages(pdf.numPages);

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
            console.error(err);
            setError('Failed to process PDF. It might be corrupted or protected.');
            setFile(null);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    };
    
    const handleReset = () => {
        setFile(null);
        setPageThumbnails([]);
        setError('');
        setIsLoading(false);
        setIsProcessing(false);
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // Range mode handlers
    const handleRangeChange = (index: number, field: 'from' | 'to', value: string) => {
        const newRanges = [...ranges];
        newRanges[index][field] = value;
        setRanges(newRanges);
    };

    const addRange = () => {
        setRanges([...ranges, { from: '', to: '' }]);
    };

    const removeRange = (index: number) => {
        setRanges(ranges.filter((_, i) => i !== index));
    };

    // Extract mode handler
    const togglePageSelection = (pageNumber: number) => {
        const newSelection = new Set(selectedPages);
        if (newSelection.has(pageNumber)) {
            newSelection.delete(pageNumber);
        } else {
            newSelection.add(pageNumber);
        }
        setSelectedPages(newSelection);
    };
    
    const downloadBlob = (blob: Blob, filename: string) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        URL.revokeObjectURL(url);
        a.remove();
    };

    const handleSplit = async () => {
        if (!file) return;
        setIsLoading(true);
        setError('');

        try {
            const originalPdfBytes = await file.arrayBuffer();
            
            if (mode === 'range') {
                await handleSplitByRange(originalPdfBytes);
            } else { // extract mode
                await handleExtractPages(originalPdfBytes);
            }
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred during splitting.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSplitByRange = async (originalPdfBytes: ArrayBuffer) => {
        const parsedRanges: number[][] = [];
        for (const range of ranges) {
            const from = parseInt(range.from, 10);
            const to = parseInt(range.to, 10);
            if (isNaN(from) || isNaN(to) || from < 1 || to > numPages || from > to) {
                throw new Error(`Invalid range specified: ${range.from}-${range.to}. Please use numbers between 1 and ${numPages}.`);
            }
            const pageIndices = [];
            for (let i = from; i <= to; i++) {
                pageIndices.push(i - 1);
            }
            parsedRanges.push(pageIndices);
        }

        if (parsedRanges.length === 0) throw new Error('No valid ranges to split.');

        const originalPdf = await PDFDocument.load(originalPdfBytes, { ignoreEncryption: true });
        
        if (mergeRanges) {
            const newPdf = await PDFDocument.create();
            const allPagesToCopy = parsedRanges.flat();
            const uniquePages = [...new Set(allPagesToCopy)];
            
            const copiedPages = await newPdf.copyPages(originalPdf, uniquePages);
            copiedPages.forEach(page => newPdf.addPage(page));
            
            const pdfBytes = await newPdf.save();
            downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), `${file?.name.replace('.pdf', '')}_merged_range.pdf`);

        } else {
            const zip = new JSZip();
            for (let i = 0; i < parsedRanges.length; i++) {
                const newPdf = await PDFDocument.create();
                const copiedPages = await newPdf.copyPages(originalPdf, parsedRanges[i]);
                copiedPages.forEach(page => newPdf.addPage(page));
                const pdfBytes = await newPdf.save();
                const from = ranges[i].from;
                const to = ranges[i].to;
                zip.file(`${file?.name.replace('.pdf', '')}_range_${from}-${to}.pdf`, pdfBytes);
            }
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            downloadBlob(zipBlob, `${file?.name.replace('.pdf', '')}_split_ranges.zip`);
        }
    };
    
    const handleExtractPages = async (originalPdfBytes: ArrayBuffer) => {
        if (selectedPages.size === 0) throw new Error('No pages selected to extract.');

        const sortedPages = Array.from(selectedPages).sort((a, b) => a - b);
        const originalPdf = await PDFDocument.load(originalPdfBytes, { ignoreEncryption: true });

        if (sortedPages.length === 1) {
             const newPdf = await PDFDocument.create();
             const [copiedPage] = await newPdf.copyPages(originalPdf, [sortedPages[0] - 1]);
             newPdf.addPage(copiedPage);
             const pdfBytes = await newPdf.save();
             downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), `${file?.name.replace('.pdf', '')}_page_${sortedPages[0]}.pdf`);
        } else {
            const zip = new JSZip();
            for (const pageNum of sortedPages) {
                const newPdf = await PDFDocument.create();
                const [copiedPage] = await newPdf.copyPages(originalPdf, [pageNum - 1]);
                newPdf.addPage(copiedPage);
                const pdfBytes = await newPdf.save();
                zip.file(`${file?.name.replace('.pdf', '')}_page_${pageNum}.pdf`, pdfBytes);
            }
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            downloadBlob(zipBlob, `${file?.name.replace('.pdf', '')}_extracted_pages.zip`);
        }
    };
    
      const howToSchema = {
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": "How to Split a PDF File",
        "description": "Extract specific pages or separate a PDF into multiple documents.",
        "step": [
          { "@type": "HowToStep", "name": "Upload PDF", "text": "Select the PDF file you wish to split." },
          { "@type": "HowToStep", "name": "Choose Mode", "text": "Select 'Split by range' to define page ranges (e.g., 1-5, 8-10) or 'Extract pages' to pick individual pages." },
          { "@type": "HowToStep", "name": "Select Pages", "text": "Enter your page ranges or click on the page thumbnails to select them." },
          { "@type": "HowToStep", "name": "Split and Download", "text": "Click the 'Split PDF' button. Your new file(s) will be downloaded, either as individual PDFs in a ZIP archive or as a single merged file." }
        ]
      };

      const faqSchema = {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "mainEntity": [
              {
                  "@type": "Question",
                  "name": "Can I combine the pages I select into a single new PDF?",
                  "acceptedAnswer": { "@type": "Answer", "text": "Yes. When using the 'Split by range' mode, you can select the 'Merge all ranges into one PDF' checkbox. This will take all the pages from your specified ranges and combine them into one new document." }
              },
              {
                  "@type": "Question",
                  "name": "How are the new files downloaded?",
                  "acceptedAnswer": { "@type": "Answer", "text": "If your split operation results in a single new PDF, it will download directly. If it results in multiple PDFs (e.g., multiple ranges or extracted pages), they will be conveniently packaged and downloaded as a single ZIP file." }
              },
              {
                  "@type": "Question",
                  "name": "Is there a limit on file size or number of pages?",
                  "acceptedAnswer": { "@type": "Answer", "text": "Our tool is designed to work entirely in your browser, so there are no hard limits from our side. However, performance with very large files may depend on your computer's memory and browser." }
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
                        <SplitIcon className="w-10 h-10 text-primary-700 dark:text-primary-400"/>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold font-display text-slate-900 dark:text-white">Split PDF</h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 mt-2">Separate one page or a whole set for easy conversion.</p>
                </div>
                
                {!file && !isProcessing && (
                    <div className="flex flex-col items-center justify-center py-10 px-6 bg-white/50 dark:bg-slate-800/20 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-sm">
                        <h2 className="text-xl font-semibold font-display text-slate-700 dark:text-slate-200">Select a PDF file to get started</h2>
                        <label htmlFor="file-upload" className="relative cursor-pointer mt-4 inline-block">
                            <span className="px-6 py-3 bg-primary-700 text-white rounded-sm font-semibold hover:bg-primary-800 uppercase tracking-wider text-sm">Select PDF file</span>
                            <input id="file-upload" type="file" className="sr-only" accept="application/pdf" onChange={handleFileChange} ref={fileInputRef} />
                        </label>
                    </div>
                )}
                
                {(isProcessing || file) && (
                    <div className="flex flex-col lg:flex-row gap-8">
                        <aside className="lg:w-1/3 xl:w-1/4 bg-white/50 dark:bg-slate-800/20 p-6 border border-slate-300 dark:border-slate-700 self-start sticky top-28">
                            <div className="flex items-center space-x-3 mb-4 overflow-hidden">
                            <DocumentTextIcon className="w-6 h-6 text-primary-700 flex-shrink-0" />
                            <span className="font-medium text-slate-700 dark:text-slate-200 truncate" title={file?.name}>{file?.name}</span>
                            </div>
                            <button onClick={handleReset} className="w-full text-sm text-center text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 mb-4">Choose another file</button>
                            
                            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                                <h3 className="font-bold text-lg mb-3">Select splitting mode</h3>
                                <div className="flex rounded-sm shadow-sm">
                                    <button onClick={() => setMode('range')} className={`px-4 py-2 text-sm font-medium rounded-l-sm w-1/2 ${mode === 'range' ? 'bg-primary-700 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600'}`}>Split by range</button>
                                    <button onClick={() => setMode('extract')} className={`px-4 py-2 text-sm font-medium rounded-r-sm w-1/2 ${mode === 'extract' ? 'bg-primary-700 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600'}`}>Extract pages</button>
                                </div>
                            </div>
                            
                            {mode === 'range' && (
                                <div className="mt-6">
                                    <h4 className="font-semibold mb-2">Define ranges to split</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">e.g., From 1 To 5. Add multiple ranges.</p>
                                    <div className="space-y-2">
                                        {ranges.map((range, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <input type="number" placeholder="From" value={range.from} onChange={(e) => handleRangeChange(index, 'from', e.target.value)} min="1" max={numPages} className="w-full p-2 border rounded-sm dark:bg-slate-700 dark:border-slate-600 focus:ring-primary-500" />
                                                <input type="number" placeholder="To" value={range.to} onChange={(e) => handleRangeChange(index, 'to', e.target.value)} min="1" max={numPages} className="w-full p-2 border rounded-sm dark:bg-slate-700 dark:border-slate-600 focus:ring-primary-500" />
                                                <button onClick={() => removeRange(index)} className="p-1 text-slate-500 hover:text-red-500"><TrashIcon className="w-5 h-5"/></button>
                                            </div>
                                        ))}
                                    </div>
                                    <button onClick={addRange} className="mt-2 flex items-center text-sm text-primary-600 dark:text-primary-400 hover:underline"><PlusIcon className="w-4 h-4 mr-1"/>Add range</button>
                                    <div className="mt-4 border-t pt-4">
                                        <label className="flex items-center">
                                            <input type="checkbox" checked={mergeRanges} onChange={(e) => setMergeRanges(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                                            <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">Merge all ranges into one PDF</span>
                                        </label>
                                    </div>
                                </div>
                            )}

                            {mode === 'extract' && (
                                <div className="mt-6">
                                    <h4 className="font-semibold mb-2">Select pages to extract</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Click on pages to select them. Selected: {selectedPages.size}</p>
                                </div>
                            )}

                            {error && <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-sm"><strong className="font-bold">Error: </strong>{error}</div>}

                            <div className="mt-6">
                                <button onClick={handleSplit} disabled={isLoading || isProcessing} className="w-full bg-primary-700 text-white font-bold py-3 px-4 rounded-sm hover:bg-primary-800 flex items-center justify-center text-lg disabled:bg-primary-400 uppercase tracking-wider">
                                    {isLoading ? <Spinner /> : 
                                    (<>
                                        <SplitIcon className="w-6 h-6 mr-2"/> Split PDF
                                    </>)}
                                </button>
                            </div>

                        </aside>
                        <main className="flex-1 min-h-[60vh]">
                            {isProcessing ? (
                                <div className="flex justify-center items-center h-full"><Spinner /></div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {pageThumbnails.map((src, index) => {
                                        const pageNum = index + 1;
                                        const isSelected = selectedPages.has(pageNum);
                                        return (
                                            <div 
                                                key={index} 
                                                onClick={() => mode === 'extract' && togglePageSelection(pageNum)} 
                                                className={`group relative p-1 border-2 rounded-lg transition-all duration-300 overflow-hidden ${mode === 'extract' ? 'cursor-pointer' : 'cursor-default'} ${isSelected ? 'border-primary-500' : 'border-transparent hover:border-primary-400 dark:hover:border-primary-500'}`}
                                            >
                                                <img src={src} alt={`Page ${pageNum}`} className="w-full rounded-md shadow-sm transition-transform duration-300 group-hover:scale-105" />
                                                <div className="absolute top-1 right-1 bg-black/60 text-white text-xs font-bold px-1.5 py-0.5 rounded-full z-10">{pageNum}</div>
                                                
                                                {/* Overlay for selection state */}
                                                {isSelected && (
                                                    <div className="absolute inset-0 bg-primary-500/40 rounded-md flex items-center justify-center">
                                                        <CheckCircleIcon className="w-10 h-10 text-white/90"/>
                                                    </div>
                                                )}
                                                
                                                {/* Hover effect for extract mode when not selected */}
                                                {mode === 'extract' && !isSelected && (
                                                    <div className="absolute inset-0 bg-black/60 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                                        <PlusIcon className="w-10 h-10 text-white" />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </main>
                    </div>
                )}

                <div className="mt-12 pt-8 border-t border-slate-300 dark:border-slate-700">
                    <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-4">How to Split a PDF File</h2>
                    <ol className="list-decimal list-inside space-y-4 text-slate-700 dark:text-slate-300">
                        <li><strong>Upload Your PDF:</strong> Start by selecting the PDF document you need to split.</li>
                        <li><strong>Choose Your Mode:</strong> Select "Split by range" if you need to extract continuous sections like pages 1-3, 5-7. Choose "Extract pages" if you want to hand-pick specific, non-continuous pages.</li>
                        <li><strong>Make Your Selection:</strong> In range mode, type in the page numbers. In extract mode, simply click on the thumbnail of each page you want. Selected pages will be highlighted.</li>
                        <li><strong>Process and Download:</strong> Click the "Split PDF" button. Your newly created PDF files will be available for download instantly.</li>
                    </ol>
                </div>

                <div className="mt-12">
                    <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-4">Frequently Asked Questions</h2>
                    <FaqItem question="Can I combine the pages I select into a single new PDF?">
                    Yes. When using the 'Split by range' mode, you can select the 'Merge all ranges into one PDF' checkbox. This will take all the pages from your specified ranges and combine them into one new document.
                    </FaqItem>
                    <FaqItem question="How are the new files downloaded?">
                    If your split operation results in a single new PDF, it will download directly. If it results in multiple PDFs (e.g., multiple ranges or extracted pages), they will be conveniently packaged and downloaded as a single ZIP file.
                    </FaqItem>
                    <FaqItem question="Is there a limit on file size or number of pages?">
                    Our tool is designed to work entirely in your browser, so there are no hard limits from our side. However, performance with very large files may depend on your computer's memory and browser.
                    </FaqItem>
                </div>
                
                <CommentSection />
            </div>
        </>
    );
};

export default SplitPage;