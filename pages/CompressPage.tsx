import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import Spinner from '../components/Spinner';
import FileUploader from '../components/FileUploader';
import { CompressIcon, DocumentTextIcon, CheckCircleIcon } from '../components/icons/IconComponents';
import CommentSection from '../components/CommentSection';
import useDocumentTitle from '../hooks/useDocumentTitle';
import JsonLd from '../components/JsonLd';
import FaqItem from '../components/FaqItem';

// Set up pdf.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs`;

const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

type CompressionLevel = 'strong' | 'extreme' | 'basic';

const compressionOptions: {
    level: CompressionLevel,
    label: string,
    description: string
}[] = [
    {
        level: 'strong',
        label: 'Strong Compression (Recommended)',
        description: 'Greatly reduces file size while maintaining good quality. Text may become unselectable.'
    },
    {
        level: 'extreme',
        label: 'Extreme Compression',
        description: 'Highest compression for the smallest file size. Visual quality will be reduced.'
    },
    {
        level: 'basic',
        label: 'Basic Compression',
        description: 'Performs lossless optimization. Does not change image quality. Modest file size reduction.'
    },
];


const CompressPage: React.FC = () => {
  useDocumentTitle("Compress PDF | Reduce PDF File Size Online Free | Pdfadore.com");
  
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [result, setResult] = useState<{ originalSize: number, newSize: number } | null>(null);
  const [compressionLevel, setCompressionLevel] = useState<CompressionLevel>('strong');

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setError('');
    setResult(null);
  };

  const handleCompress = async () => {
    if (!file) return;

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const originalSize = file.size;
      const arrayBuffer = await file.arrayBuffer();
      let pdfBytes: Uint8Array;

      if (compressionLevel === 'basic') {
          const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
          pdfBytes = await pdfDoc.save();
      } else {
          // Advanced compression using canvas rendering
          const scale = compressionLevel === 'strong' ? 1.5 : 1.0;
          const quality = compressionLevel === 'strong' ? 0.7 : 0.5;

          const newPdfDoc = await PDFDocument.create();
          const pdfJsDoc = await pdfjsLib.getDocument({ data: arrayBuffer.slice(0) }).promise;

          for (let i = 1; i <= pdfJsDoc.numPages; i++) {
              const page = await pdfJsDoc.getPage(i);
              const viewport = page.getViewport({ scale });
              
              const canvas = document.createElement('canvas');
              const context = canvas.getContext('2d');
              canvas.width = viewport.width;
              canvas.height = viewport.height;

              if (!context) throw new Error("Could not get canvas context");
              
              await page.render({ canvas, canvasContext: context, viewport }).promise;
              
              const jpegDataUrl = canvas.toDataURL('image/jpeg', quality);
              const jpegBytes = await fetch(jpegDataUrl).then(res => res.arrayBuffer());
              
              const jpegImage = await newPdfDoc.embedJpg(jpegBytes);
              
              const newPage = newPdfDoc.addPage([viewport.width, viewport.height]);
              newPage.drawImage(jpegImage, {
                  x: 0,
                  y: 0,
                  width: viewport.width,
                  height: viewport.height,
              });
          }
          pdfBytes = await newPdfDoc.save();
      }
      
      const newSize = pdfBytes.length;

      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${file.name.replace(/\.pdf$/i, '')}_compressed.pdf`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
a.remove();
      
      setResult({ originalSize, newSize });
    } catch (err) {
      console.error(err);
      setError('Could not compress the PDF. The file might be corrupted or in an unsupported format.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setError('');
    setResult(null);
    setCompressionLevel('strong');
  };

  const reductionPercentage = result ? Math.round(((result.originalSize - result.newSize) / result.originalSize) * 100) : 0;

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Compress a PDF",
    "description": "Reduce the file size of your PDF documents online for free.",
    "step": [
      { "@type": "HowToStep", "name": "Select PDF", "text": "Upload the PDF file you want to make smaller." },
      { "@type": "HowToStep", "name": "Choose Compression Level", "text": "Select 'Strong', 'Extreme', or 'Basic' compression. 'Strong' is recommended for a good balance of size and quality." },
      { "@type": "HowToStep", "name": "Compress PDF", "text": "Click the 'Compress PDF' button to start the optimization process." },
      { "@type": "HowToStep", "name": "Download", "text": "Your new, smaller PDF will be downloaded to your device automatically." }
    ]
  };

  const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
          {
              "@type": "Question",
              "name": "What is the difference between the compression levels?",
              "acceptedAnswer": { "@type": "Answer", "text": "'Basic' compression performs lossless optimizations and offers a small size reduction. 'Strong' compression provides a great balance of file size and visual quality. 'Extreme' compression makes the file as small as possible but will reduce image quality and make text unselectable." }
          },
          {
              "@type": "Question",
              "name": "Will compressing a PDF make my text unsearchable?",
              "acceptedAnswer": { "@type": "Answer", "text": "Using 'Strong' or 'Extreme' compression will convert your PDF pages into images, which makes the text non-selectable and unsearchable. If you need to preserve selectable text, please use the 'Basic' compression level." }
          },
           {
              "@type": "Question",
              "name": "Is it safe to compress my PDF files here?",
              "acceptedAnswer": { "@type": "Answer", "text": "Yes. Your files are processed entirely within your browser. They are never uploaded to any server, ensuring that your information remains secure and private." }
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
            <CompressIcon className="w-10 h-10 text-primary-700 dark:text-primary-400"/>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-display text-slate-900 dark:text-white">Compress PDF</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 mt-2">Reduce the file size of your PDF while keeping the best quality.</p>
        </div>

        {!file && !result && (
          <FileUploader onFileSelect={handleFileSelect} processing={isLoading} />
        )}

        {(file && !result) && (
          <div className="bg-white/50 dark:bg-slate-800/20 p-6 border border-slate-300 dark:border-slate-700 w-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3 overflow-hidden">
                <DocumentTextIcon className="w-6 h-6 text-primary-700 flex-shrink-0" />
                <span className="font-medium text-slate-700 dark:text-slate-200 truncate">{file.name} ({formatBytes(file.size)})</span>
              </div>
              <button
                  onClick={handleReset}
                  className="text-sm text-slate-500 hover:text-primary-700 dark:hover:text-primary-400"
                >
                  Choose another file
              </button>
            </div>
            
            <div className="my-6 border-t border-b border-slate-200 dark:border-slate-700 py-6">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 font-display">Compression Level</h3>
              <fieldset className="space-y-4">
                <legend className="sr-only">Compression level</legend>
                {compressionOptions.map(option => (
                    <div key={option.level} className="relative flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id={option.level}
                          name="compression-level"
                          type="radio"
                          checked={compressionLevel === option.level}
                          onChange={() => setCompressionLevel(option.level)}
                          className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-slate-300 dark:bg-slate-700 dark:border-slate-600"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor={option.level} className="font-medium text-slate-800 dark:text-slate-200">
                          {option.label}
                        </label>
                        <p className="text-slate-500 dark:text-slate-400">{option.description}</p>
                      </div>
                    </div>
                ))}
              </fieldset>
            </div>
            
            <button
              onClick={handleCompress}
              disabled={isLoading}
              className="w-full bg-primary-700 text-white font-bold py-3 px-4 rounded-sm hover:bg-primary-800 transition-colors flex items-center justify-center disabled:bg-primary-400"
            >
              {isLoading ? <Spinner /> : 'Compress PDF'}
            </button>
          </div>
        )}

        {error && (
          <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {result && (
          <div className="mt-6 text-center">
              <div className="bg-green-100 dark:bg-green-900/50 border border-green-400 dark:border-green-600 text-green-800 dark:text-green-200 px-6 py-4 rounded-lg relative flex flex-col items-center" role="alert">
                  <CheckCircleIcon className="w-12 h-12 mb-2 text-green-500"/>
                  <h2 className="text-xl font-bold font-display">Compression Complete!</h2>
                  {reductionPercentage > 0 ? (
                      <p>Your file is now {reductionPercentage}% smaller.</p>
                  ) : (
                      <p>File size was not significantly reduced, but a fresh copy has been saved.</p>
                  )}
                  <div className="flex justify-center gap-8 mt-4 text-sm">
                      <p>Original Size: <strong>{formatBytes(result.originalSize)}</strong></p>
                      <p>New Size: <strong>{formatBytes(result.newSize)}</strong></p>
                  </div>
              </div>
              <button onClick={handleReset} className="mt-6 bg-primary-700 text-white font-bold py-2 px-6 rounded-sm hover:bg-primary-800 transition-colors">
                  Compress Another File
              </button>
          </div>
        )}

        <div className="mt-12 pt-8 border-t border-slate-300 dark:border-slate-700">
            <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-4">How to Compress a PDF File</h2>
            <ol className="list-decimal list-inside space-y-4 text-slate-700 dark:text-slate-300">
                <li><strong>Upload PDF:</strong> Select the PDF file you want to reduce in size.</li>
                <li><strong>Choose Quality:</strong> Select your desired compression level. We recommend "Strong Compression" for the best balance between file size and quality.</li>
                <li><strong>Compress:</strong> Click the "Compress PDF" button and our tool will start optimizing your file.</li>
                <li><strong>Download:</strong> Your new, smaller PDF will be ready for download in just a few moments.</li>
            </ol>
        </div>

        <div className="mt-12">
            <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-4">Frequently Asked Questions</h2>
            <FaqItem question="What is the difference between the compression levels?">
              'Basic' compression performs lossless optimizations and offers a small size reduction. 'Strong' compression provides a great balance of file size and visual quality. 'Extreme' compression makes the file as small as possible but will reduce image quality and make text unselectable.
            </FaqItem>
            <FaqItem question="Will compressing a PDF make my text unsearchable?">
              Using 'Strong' or 'Extreme' compression will convert your PDF pages into images, which makes the text non-selectable and unsearchable. If you need to preserve selectable text, please use the 'Basic' compression level.
            </FaqItem>
            <FaqItem question="Is it safe to compress my PDF files here?">
              Yes. Your files are processed entirely within your browser. They are never uploaded to any server, ensuring that your information remains secure and private.
            </FaqItem>
        </div>

        <CommentSection />
      </div>
    </>
  );
};

export default CompressPage;