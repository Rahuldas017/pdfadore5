import React, { useState, useCallback } from 'react';
import { PDFDocument } from 'pdf-lib';
import Spinner from '../components/Spinner';
import { MergeIcon, DocumentTextIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon, PlusIcon } from '../components/icons/IconComponents';
import CommentSection from '../components/CommentSection';
import useDocumentTitle from '../hooks/useDocumentTitle';
import JsonLd from '../components/JsonLd';
import FaqItem from '../components/FaqItem';

const MergePage: React.FC = () => {
  useDocumentTitle("Merge PDF | Combine PDF Files Online for Free | Pdfadore.com");

  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setFiles(prevFiles => [...prevFiles, ...newFiles]);
      setError('');
    }
  };
  
  const removeFile = (index: number) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const moveFile = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === files.length - 1) return;

    const newFiles = [...files];
    const item = newFiles[index];
    newFiles.splice(index, 1);
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    newFiles.splice(newIndex, 0, item);
    setFiles(newFiles);
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      setError("Please select at least two PDF files to merge.");
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const mergedPdf = await PDFDocument.create();
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach(page => mergedPdf.addPage(page));
      }
      const mergedPdfBytes = await mergedPdf.save();
      
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'merged.pdf';
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      a.remove();

      setFiles([]); // Reset after successful merge
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred during merging.');
    } finally {
      setIsLoading(false);
    }
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Merge PDF Files",
    "description": "Combine multiple PDF documents into a single file for free online.",
    "step": [
      {
        "@type": "HowToStep",
        "name": "Select Files",
        "text": "Click the 'Select PDF files' button and choose the documents you want to combine.",
        "url": "https://www.pdfadore.com/merge"
      },
      {
        "@type": "HowToStep",
        "name": "Order Files",
        "text": "Drag and drop the file previews to arrange them in your desired order.",
        "url": "https://www.pdfadore.com/merge"
      },
      {
        "@type": "HowToStep",
        "name": "Merge",
        "text": "Click the 'Merge PDFs' button to start the process.",
        "url": "https://www.pdfadore.com/merge"
      },
      {
        "@type": "HowToStep",
        "name": "Download",
        "text": "Your merged PDF will be downloaded automatically.",
        "url": "https://www.pdfadore.com/merge"
      }
    ]
  };

  const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
          {
              "@type": "Question",
              "name": "Is it safe to merge PDF files with this tool?",
              "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, it is completely safe. All file processing happens in your browser, meaning your files are never uploaded to our servers. Your privacy is guaranteed."
              }
          },
          {
              "@type": "Question",
              "name": "Can I reorder the files before merging?",
              "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Absolutely. After uploading your files, you can drag and drop them into the perfect order before you click the merge button."
              }
          },
          {
              "@type": "Question",
              "name": "Is there a limit to how many files I can merge?",
              "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "There is no strict limit on the number of files, but performance may vary depending on your browser and the size of the files. For a large number of files, the process may take longer."
              }
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
            <MergeIcon className="w-10 h-10 text-primary-700 dark:text-primary-400"/>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-display text-slate-900 dark:text-white">Merge PDF files</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mt-2">Combine multiple PDFs into a single, unified document. It's fast, free, and secure.</p>
        </div>
        
        <div className="bg-white/50 dark:bg-slate-800/20 p-6 border border-slate-300 dark:border-slate-700 w-full">
          {files.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-10 border border-dashed border-slate-400 dark:border-slate-600 rounded-sm">
               <h2 className="text-2xl font-semibold font-display text-slate-700 dark:text-slate-200">Start by adding your PDF files</h2>
               <label htmlFor="file-upload" className="relative cursor-pointer mt-4 inline-block">
                  <span className="px-6 py-3 bg-primary-700 text-white rounded-sm font-semibold hover:bg-primary-800 uppercase tracking-wider text-sm">
                    Select PDF files
                  </span>
                  <input 
                    id="file-upload" 
                    name="file-upload" 
                    type="file" 
                    className="sr-only" 
                    accept="application/pdf"
                    multiple
                    onChange={handleFileChange}
                  />
                </label>
             </div>
          ) : (
            <div>
              <ul className="space-y-3 mb-6">
                {files.map((file, index) => (
                  <li key={index} className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <DocumentTextIcon className="w-6 h-6 text-primary-700 flex-shrink-0" />
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate" title={file.name}>{file.name}</span>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <button onClick={() => moveFile(index, 'up')} disabled={index === 0} className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed">
                          <ArrowUpIcon className="w-5 h-5"/>
                      </button>
                      <button onClick={() => moveFile(index, 'down')} disabled={index === files.length - 1} className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed">
                          <ArrowDownIcon className="w-5 h-5"/>
                      </button>
                      <button onClick={() => removeFile(index)} className="p-1 text-slate-500 hover:text-red-500 dark:hover:text-red-400">
                          <TrashIcon className="w-5 h-5"/>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="flex justify-center border-t border-slate-200 dark:border-slate-700 pt-4">
                <label htmlFor="add-more-files" className="relative cursor-pointer">
                  <span className="px-4 py-2 bg-slate-200 text-slate-700 dark:bg-slate-600 dark:text-slate-200 rounded-sm font-semibold hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors flex items-center">
                    <PlusIcon className="w-5 h-5 mr-2" /> Add more files
                  </span>
                  <input id="add-more-files" type="file" className="sr-only" accept="application/pdf" multiple onChange={handleFileChange} />
                </label>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-6 border border-red-400 text-red-700 px-4 py-3 rounded-sm" role="alert">
            <strong className="font-bold font-display">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {files.length > 0 && (
          <div className="mt-8">
              <button
                onClick={handleMerge}
                disabled={isLoading || files.length < 2}
                className="w-full bg-primary-700 text-white font-bold py-4 px-4 rounded-sm hover:bg-primary-800 transition-colors flex items-center justify-center text-lg disabled:bg-primary-400 dark:disabled:bg-primary-800 disabled:cursor-not-allowed uppercase tracking-wider"
              >
                {isLoading ? <Spinner /> : `Merge ${files.length} PDFs`}
              </button>
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-slate-300 dark:border-slate-700">
            <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-4">How to Combine PDF Files</h2>
            <ol className="list-decimal list-inside space-y-4 text-slate-700 dark:text-slate-300">
                <li><strong>Select your PDFs:</strong> Click the "Select PDF files" button to upload two or more PDF files from your computer.</li>
                <li><strong>Arrange your files:</strong> Once uploaded, you'll see a preview of your files. Drag and drop them to set the desired order for the final document.</li>
                <li><strong>Merge and Download:</strong> Click the "Merge PDFs" button. Our tool will instantly combine the files. Once finished, your new, unified PDF will be downloaded automatically.</li>
            </ol>
        </div>

        <div className="mt-12">
            <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-4">Frequently Asked Questions</h2>
            <FaqItem question="Is it safe to merge PDF files with this tool?">
              <p>Yes, it is completely safe. All file processing happens in your browser, meaning your files are never uploaded to our servers. Your privacy is guaranteed.</p>
            </FaqItem>
            <FaqItem question="Can I reorder the files before merging?">
              <p>Absolutely. After uploading your files, you can use the up and down arrows or drag and drop them into the perfect order before you click the merge button.</p>
            </FaqItem>
            <FaqItem question="Is there a limit to how many files I can merge?">
                <p>There is no strict limit on the number of files. However, for a very large number of files or very large file sizes, the performance depends on your computer's and browser's capabilities, so it might take a bit longer.</p>
            </FaqItem>
        </div>

        <CommentSection />
      </div>
    </>
  );
};

export default MergePage;
