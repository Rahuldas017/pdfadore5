
import React, { useState, useCallback } from 'react';
import FileUploader from '../components/FileUploader';
import Spinner from '../components/Spinner';
import { extractTextFromPDF } from '../services/pdfParser';
import { extractTablesFromText } from '../services/geminiService';
import { exportToCsv } from '../services/csvHelper';
import { ExcelIcon, DocumentTextIcon } from '../components/icons/IconComponents';
import CommentSection from '../components/CommentSection';
import useDocumentTitle from '../hooks/useDocumentTitle';
import JsonLd from '../components/JsonLd';
import FaqItem from '../components/FaqItem';

interface ExtractedTable {
    tableName: string;
    data: string[][];
}

const PdfToExcelPage: React.FC = () => {
    useDocumentTitle("PDF to Excel Converter | Extract Tables from PDF | Pdfadore.com");
    
    const [file, setFile] = useState<File | null>(null);
    const [tables, setTables] = useState<ExtractedTable[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleFileSelect = (selectedFile: File) => {
        setFile(selectedFile);
        setTables([]);
        setError('');
    };

    const handleExtract = useCallback(async () => {
        if (!file) return;

        setIsLoading(true);
        setError('');
        try {
            const text = await extractTextFromPDF(file);
            if (!text.trim()) {
                setError('Could not extract text from the PDF. It might be an image-only file with no text layer.');
                setIsLoading(false);
                return;
            }
            const result = await extractTablesFromText(text);
            if (result.tables && result.tables.length > 0) {
                setTables(result.tables);
            } else {
                setError('No tables were found in the document.');
            }
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [file]);

    const handleDownload = (table: ExtractedTable) => {
        const safeTableName = table.tableName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        exportToCsv(`${safeTableName}.csv`, table.data);
    };

    const handleReset = () => {
        setFile(null);
        setTables([]);
        setError('');
    };
    
    const howToSchema = {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": "How to Convert PDF to Excel",
      "description": "Extract tables from a PDF document and download them as CSV files for Excel.",
      "step": [
        { "@type": "HowToStep", "name": "Upload PDF", "text": "Select the PDF file containing the tables you want to extract." },
        { "@type": "HowToStep", "name": "Extract Tables", "text": "Click the 'Extract Tables' button. Our AI will analyze the document and identify any tables." },
        { "@type": "HowToStep", "name": "Preview and Download", "text": "Preview the extracted tables. Click the 'Download CSV' button for each table you want to save." },
        { "@type": "HowToStep", "name": "Open in Excel", "text": "Open the downloaded CSV file in Microsoft Excel, Google Sheets, or any other spreadsheet software." }
      ]
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "Can this tool handle complex tables?",
                "acceptedAnswer": { "@type": "Answer", "text": "Our AI does its best to accurately parse most tables. However, very complex tables with merged cells or unusual layouts might not be extracted perfectly." }
            },
            {
                "@type": "Question",
                "name": "What is a CSV file?",
                "acceptedAnswer": { "@type": "Answer", "text": "CSV (Comma-Separated Values) is a plain text file format that stores tabular data. It is a universal format that can be easily opened by Microsoft Excel, Google Sheets, Apple Numbers, and other spreadsheet programs." }
            },
            {
                "@type": "Question",
                "name": "Does this work on scanned PDFs (OCR)?",
                "acceptedAnswer": { "@type": "Answer", "text": "No, this tool requires a text-based PDF. It cannot read tables from scanned documents or images of tables, as it does not perform Optical Character Recognition (OCR)." }
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
                        <ExcelIcon className="w-10 h-10 text-primary-700 dark:text-primary-400"/>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold font-display text-slate-900 dark:text-white">PDF to Excel</h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 mt-2">Extract tables from your PDF and download them as CSV files.</p>
                </div>

                {!file && <FileUploader onFileSelect={handleFileSelect} processing={isLoading} />}

                {file && tables.length === 0 && !error && (
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
                        <button onClick={handleExtract} disabled={isLoading} className="w-full bg-primary-700 text-white font-bold py-3 px-4 rounded-sm hover:bg-primary-800 transition-colors flex items-center justify-center disabled:bg-primary-400 uppercase tracking-wider">
                            {isLoading ? <Spinner /> : 'Extract Tables'}
                        </button>
                    </div>
                )}

                {error && <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert"><strong className="font-bold">Error: </strong><span className="block sm:inline">{error}</span><button onClick={handleReset} className="ml-4 font-bold underline">Try again</button></div>}

                {tables.length > 0 && (
                    <div className="mt-8">
                        <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white mb-4">Extracted Tables</h2>
                        <div className="space-y-6">
                            {tables.map((table, index) => (
                                <div key={index} className="bg-white/50 dark:bg-slate-800/20 border border-slate-300 dark:border-slate-700 p-4 rounded-sm">
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="text-lg font-bold font-display text-slate-800 dark:text-white">{table.tableName}</h3>
                                        <button onClick={() => handleDownload(table)} className="bg-primary-700 text-white px-3 py-1 rounded-sm text-sm font-semibold hover:bg-primary-800 uppercase tracking-wider">Download CSV</button>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                                            <thead className="bg-slate-50 dark:bg-slate-700">
                                                <tr>{table.data[0]?.map((header, hIndex) => <th key={hIndex} className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">{header}</th>)}</tr>
                                            </thead>
                                            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                                                {table.data.slice(1).map((row, rIndex) => (
                                                    <tr key={rIndex}>{row.map((cell, cIndex) => <td key={cIndex} className="px-4 py-2 whitespace-nowrap text-sm text-slate-700 dark:text-slate-300">{cell}</td>)}</tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="text-center mt-6">
                            <button onClick={handleReset} className="bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold py-2 px-6 rounded-sm hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors uppercase tracking-wider text-sm">
                                Start Over
                            </button>
                        </div>
                    </div>
                )}

                <div className="mt-12 pt-8 border-t border-slate-300 dark:border-slate-700">
                    <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-4">How to Convert PDF to Excel</h2>
                    <ol className="list-decimal list-inside space-y-4 text-slate-700 dark:text-slate-300">
                        <li><strong>Upload your PDF:</strong> Select a PDF document that contains one or more tables.</li>
                        <li><strong>Extract Data:</strong> Click the "Extract Tables" button. Our AI tool will scan the document for tabular data.</li>
                        <li><strong>Download your CSV:</strong> The tool will display all the tables it found. Click "Download CSV" next to each table you want to save.</li>
                        <li><strong>Open in Excel:</strong> Open the downloaded CSV files with Microsoft Excel, Google Sheets, or another spreadsheet program to work with your data.</li>
                    </ol>
                </div>

                <div className="mt-12">
                    <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-4">Frequently Asked Questions</h2>
                    <FaqItem question="Can this tool handle complex tables?">
                      Our AI does its best to accurately parse most tables. However, very complex tables with merged cells or unusual layouts might not be extracted perfectly.
                    </FaqItem>
                    <FaqItem question="What is a CSV file?">
                      CSV (Comma-Separated Values) is a plain text file format that stores tabular data. It is a universal format that can be easily opened by Microsoft Excel, Google Sheets, Apple Numbers, and other spreadsheet programs.
                    </FaqItem>
                    <FaqItem question="Does this work on scanned PDFs (OCR)?">
                      No, this tool requires a text-based PDF. It cannot read tables from scanned documents or images of tables, as it does not perform Optical Character Recognition (OCR).
                    </FaqItem>
                </div>

                <CommentSection />
            </div>
        </>
    );
};

export default PdfToExcelPage;
