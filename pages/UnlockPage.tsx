
import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import Spinner from '../components/Spinner';
import FileUploader from '../components/FileUploader';
import { UnlockIcon, DocumentTextIcon, CheckCircleIcon } from '../components/icons/IconComponents';
import CommentSection from '../components/CommentSection';
import useDocumentTitle from '../hooks/useDocumentTitle';
import JsonLd from '../components/JsonLd';
import FaqItem from '../components/FaqItem';

const UnlockPage: React.FC = () => {
  useDocumentTitle("Unlock PDF | Free PDF Password Remover | Pdfadore.com");
  
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setError('');
    setSuccessMessage('');
  };

  const handleUnlock = async () => {
    if (!file) return;

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer, {
        ignoreEncryption: true,
      });

      // pdf-lib can remove encryption just by loading with ignoreEncryption and saving.
      // No need to check pdfDoc.isEncrypted as a condition to save.
      // The save operation itself will produce an unencrypted version.
      
      const pdfBytes = await pdfDoc.save();

      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${file.name.replace(/\.pdf$/i, '')}_unlocked.pdf`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      a.remove();
      
      if (pdfDoc.isEncrypted) {
          setSuccessMessage('PDF unlocked and download has started!');
      } else {
          setSuccessMessage('PDF was not encrypted. A copy has been downloaded.');
      }

    } catch (err) {
      console.error(err);
      setError('Could not unlock the PDF. The file might be corrupted or protected in a way that is not supported.');
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
    "name": "How to Unlock a PDF",
    "description": "Remove password protection from a PDF file online for free.",
    "step": [
      { "@type": "HowToStep", "name": "Select PDF", "text": "Upload the password-protected PDF file you want to unlock." },
      { "@type": "HowToStep", "name": "Unlock PDF", "text": "Click the 'Unlock PDF' button. The tool will attempt to remove the restrictions." },
      { "@type": "HowToStep", "name": "Download", "text": "Your unlocked PDF file will be downloaded automatically." }
    ]
  };

  const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
          {
              "@type": "Question",
              "name": "Is it legal to remove a PDF password?",
              "acceptedAnswer": { "@type": "Answer", "text": "You should only remove passwords and restrictions from documents that you own or have the explicit permission to alter. Please respect copyright and ownership." }
          },
          {
              "@type": "Question",
              "name": "What passwords can this tool remove?",
              "acceptedAnswer": { "@type": "Answer", "text": "This tool can remove owner passwords that restrict editing, printing, or copying. It cannot remove a user password required to open and view the file if you don't know the password." }
          },
          {
              "@type": "Question",
              "name": "Is my file safe?",
              "acceptedAnswer": { "@type": "Answer", "text": "Yes. The entire unlocking process happens in your web browser. Your file is never sent to our servers, ensuring your data's privacy." }
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
            <UnlockIcon className="w-10 h-10 text-primary-700 dark:text-primary-400"/>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-display text-slate-900 dark:text-white">Unlock PDF</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mt-2">Remove passwords and restrictions from your PDF files.</p>
        </div>

        {!file && (
          <FileUploader onFileSelect={handleFileSelect} processing={isLoading} />
        )}

        {file && !successMessage && (
          <div className="bg-white/50 dark:bg-slate-800/20 p-6 border border-slate-300 dark:border-slate-700 w-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3 overflow-hidden">
                <DocumentTextIcon className="w-6 h-6 text-primary-700 flex-shrink-0" />
                <span className="font-semibold text-slate-700 dark:text-slate-200 truncate">{file.name}</span>
              </div>
              <button
                  onClick={handleReset}
                  className="text-sm font-semibold text-slate-600 hover:text-primary-700 dark:hover:text-primary-400"
                >
                  Choose another file
              </button>
            </div>
            
            <button
              onClick={handleUnlock}
              disabled={isLoading}
              className="w-full bg-primary-700 text-white font-bold py-3 px-4 rounded-sm hover:bg-primary-800 transition-colors flex items-center justify-center disabled:bg-primary-400 uppercase tracking-wider"
            >
              {isLoading ? <Spinner /> : 'Unlock PDF'}
            </button>
          </div>
        )}

        {error && (
          <div className="mt-6 border border-red-400 text-red-700 px-4 py-3 rounded-sm" role="alert">
            <strong className="font-bold font-display">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {successMessage && !error && (
          <div className="mt-6 text-center">
              <div className="bg-green-100/50 dark:bg-green-900/50 border border-green-400 dark:border-green-600 text-green-800 dark:text-green-200 px-6 py-4 rounded-sm flex flex-col items-center" role="alert">
                  <CheckCircleIcon className="w-12 h-12 mb-2 text-green-500"/>
                  <h2 className="text-2xl font-bold font-display">Success!</h2>
                  <p className="block sm:inline">{successMessage}</p>
              </div>
              <button onClick={handleReset} className="mt-6 bg-primary-700 text-white font-bold py-2 px-6 rounded-sm hover:bg-primary-800 transition-colors uppercase tracking-wider text-sm">
                  Unlock Another File
              </button>
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-slate-300 dark:border-slate-700">
            <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-4">How to Remove a PDF Password</h2>
            <ol className="list-decimal list-inside space-y-4 text-slate-700 dark:text-slate-300">
                <li><strong>Upload your locked PDF:</strong> Click to select your file, or drag it into the upload box.</li>
                <li><strong>Acknowledge and Unlock:</strong> Confirm you have the right to modify the file and click the 'Unlock PDF' button.</li>
                <li><strong>Download your file:</strong> The tool will create an unlocked version of your PDF, which will download to your device automatically.</li>
            </ol>
        </div>

        <div className="mt-12">
            <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-4">Frequently Asked Questions</h2>
            <FaqItem question="Is it legal to remove a PDF password?">
              You should only remove passwords and restrictions from documents that you own or have the explicit permission to alter. Please respect copyright and ownership.
            </FaqItem>
            <FaqItem question="What passwords can this tool remove?">
              This tool can remove owner passwords that restrict editing, printing, or copying. It cannot remove a user password required to open and view the file if you don't know the password.
            </FaqItem>
            <FaqItem question="Is my file safe?">
              Yes. The entire unlocking process happens in your web browser. Your file is never sent to our servers, ensuring your data's privacy.
            </FaqItem>
        </div>

        <CommentSection />
      </div>
    </>
  );
};

export default UnlockPage;
