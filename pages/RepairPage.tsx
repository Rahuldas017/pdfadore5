
import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import Spinner from '../components/Spinner';
import FileUploader from '../components/FileUploader';
import { RepairIcon, DocumentTextIcon, CheckCircleIcon } from '../components/icons/IconComponents';
import CommentSection from '../components/CommentSection';
import useDocumentTitle from '../hooks/useDocumentTitle';
import JsonLd from '../components/JsonLd';
import FaqItem from '../components/FaqItem';

const RepairPage: React.FC = () => {
  useDocumentTitle("Repair PDF | Fix Corrupted PDF Files Free | Pdfadore.com");

  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setError('');
    setSuccessMessage('');
  };

  const handleRepair = async () => {
    if (!file) return;

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const arrayBuffer = await file.arrayBuffer();
      // Loading with pdf-lib and re-saving can fix some structural issues.
      const pdfDoc = await PDFDocument.load(arrayBuffer, { 
          ignoreEncryption: true,
          // More lenient parsing options could be added here if available in the library
      });
      
      const pdfBytes = await pdfDoc.save();

      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${file.name.replace(/\.pdf$/i, '')}_repaired.pdf`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      a.remove();
      
      setSuccessMessage('Repair process complete. A new version of the PDF has been downloaded.');
    } catch (err) {
      console.error(err);
      setError('Could not process the PDF. The file might be severely corrupted or in an unsupported format.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setError('');
    setSuccessMessage('');
  };
  
  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Repair a PDF",
    "description": "Attempt to fix and recover data from a damaged or corrupted PDF file.",
    "step": [
      { "@type": "HowToStep", "name": "Upload PDF", "text": "Select the damaged PDF file you want to try and repair." },
      { "@type": "HowToStep", "name": "Repair PDF", "text": "Click the 'Repair PDF' button. Our tool will analyze the file and attempt to rebuild its structure." },
      { "@type": "HowToStep", "name": "Download Repaired File", "text": "If the repair is successful, a new, repaired version of your PDF will be downloaded automatically." }
    ]
  };

  const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
          {
              "@type": "Question",
              "name": "What kind of damage can this tool fix?",
              "acceptedAnswer": { "@type": "Answer", "text": "This tool can often fix issues related to corrupted PDF structures, invalid cross-reference tables, or minor data inconsistencies. It works by attempting to rebuild the PDF from the content it can recover." }
          },
          {
              "@type": "Question",
              "name": "Is a successful repair guaranteed?",
              "acceptedAnswer": { "@type": "Answer", "text": "No, a successful repair is not guaranteed. The success rate depends heavily on the extent and type of damage to the file. This tool provides a best-effort attempt to recover the document." }
          },
          {
              "@type": "Question",
              "name": "Is the repair process secure?",
              "acceptedAnswer": { "@type": "Answer", "text": "Yes. Just like our other tools, the PDF repair process is performed entirely in your browser. Your file is never uploaded to our servers, ensuring your data remains private." }
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
            <RepairIcon className="w-10 h-10 text-primary-700 dark:text-primary-400"/>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-display text-slate-900 dark:text-white">Repair PDF</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mt-2">Attempt to fix corrupted PDF files and recover their content.</p>
        </div>

        {!file && !successMessage && (
          <FileUploader onFileSelect={handleFileSelect} processing={isLoading} />
        )}

        {(file && !successMessage) && (
          <div className="bg-white/50 dark:bg-slate-800/20 p-6 border border-slate-300 dark:border-slate-700 w-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3 overflow-hidden">
                <DocumentTextIcon className="w-6 h-6 text-primary-700 flex-shrink-0" />
                <span className="font-medium text-slate-700 dark:text-slate-200 truncate">{file.name}</span>
              </div>
              <button onClick={handleReset} className="text-sm text-slate-500 hover:text-primary-700 dark:hover:text-primary-400">
                  Choose another file
              </button>
            </div>
            
            <button onClick={handleRepair} disabled={isLoading} className="w-full bg-primary-700 text-white font-bold py-3 px-4 rounded-sm hover:bg-primary-800 transition-colors flex items-center justify-center disabled:bg-primary-400 uppercase tracking-wider">
              {isLoading ? <Spinner /> : 'Repair PDF'}
            </button>
          </div>
        )}

        {error && (
          <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {successMessage && !error && (
          <div className="mt-6 text-center">
              <div className="bg-green-100 dark:bg-green-900/50 border border-green-400 dark:border-green-600 text-green-800 dark:text-green-200 px-6 py-4 rounded-lg relative flex flex-col items-center" role="alert">
                  <CheckCircleIcon className="w-12 h-12 mb-2 text-green-500"/>
                  <h2 className="text-xl font-bold font-display">Repair Attempted</h2>
                  <p>{successMessage}</p>
              </div>
              <button onClick={handleReset} className="mt-6 bg-primary-700 text-white font-bold py-2 px-6 rounded-sm hover:bg-primary-800 transition-colors uppercase tracking-wider text-sm">
                  Repair Another File
              </button>
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-slate-300 dark:border-slate-700">
            <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-4">How to Repair a PDF File</h2>
            <ol className="list-decimal list-inside space-y-4 text-slate-700 dark:text-slate-300">
                <li><strong>Upload Your Damaged PDF:</strong> Select the corrupted or unreadable PDF file you want to fix.</li>
                <li><strong>Start the Repair Process:</strong> Click the "Repair PDF" button. Our tool will analyze the file's structure and attempt to recover its contents and fix any errors.</li>
                <li><strong>Download the Result:</strong> If the repair is successful, a new, repaired version of your document will begin to download automatically.</li>
            </ol>
        </div>

        <div className="mt-12">
            <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-4">Frequently Asked Questions</h2>
            <FaqItem question="What kind of damage can this tool fix?">
              This tool can often fix issues related to corrupted PDF structures, invalid cross-reference tables, or minor data inconsistencies. It works by attempting to rebuild the PDF from the content it can recover.
            </FaqItem>
            <FaqItem question="Is a successful repair guaranteed?">
              No, a successful repair is not guaranteed. The success rate depends heavily on the extent and type of damage to the file. This tool provides a best-effort attempt to recover the document.
            </FaqItem>
            <FaqItem question="Is the repair process secure?">
              Yes. Just like our other tools, the PDF repair process is performed entirely in your browser. Your file is never uploaded to our servers, ensuring your data remains private.
            </FaqItem>
        </div>

        <CommentSection />
      </div>
    </>
  );
};

export default RepairPage;
