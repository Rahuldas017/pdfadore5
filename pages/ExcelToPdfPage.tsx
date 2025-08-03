import React, { useState } from 'react';
import { ExcelIcon } from '../components/icons/IconComponents';
import CommentSection from '../components/CommentSection';
import Spinner from '../components/Spinner';
import useDocumentTitle from '../hooks/useDocumentTitle';
import JsonLd from '../components/JsonLd';
import FaqItem from '../components/FaqItem';

const ExcelToPdfPage: React.FC = () => {
    useDocumentTitle("Excel to PDF Converter | Convert CSV to PDF Free | Pdfadore.com");
    const [csvText, setCsvText] = useState<string>('');
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFile = e.target.files[0];
            if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
                setError('Please upload a valid .csv file.');
                setFile(null);
                setCsvText('');
                return;
            }
            setFile(selectedFile);
            setError('');
            setIsLoading(true);
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setCsvText(event.target.result as string);
                }
                setIsLoading(false);
            };
            reader.onerror = () => {
                setError('Failed to read the file.');
                setIsLoading(false);
            };
            reader.readAsText(selectedFile);
        }
    };

    const handleConvertToPdf = () => {
        if (!csvText) {
            setError('No CSV data to convert.');
            return;
        }

        const rows = csvText.trim().split('\n').map(row => {
            // Basic CSV parsing, doesn't handle quotes perfectly but good enough for many cases
            return row.split(',');
        });
        
        if (rows.length === 0) {
             setError('CSV file is empty.');
             return;
        }
        
        let tableHtml = '<table border="1" style="border-collapse: collapse; width: 100%; font-size: 10px;">';
        tableHtml += '<thead><tr style="background-color: #f2f2f2;">';
        rows[0].forEach(header => {
            tableHtml += `<th style="padding: 5px; text-align: left;">${header}</th>`;
        });
        tableHtml += '</tr></thead>';
        tableHtml += '<tbody>';
        rows.slice(1).forEach(row => {
            if (row.length === 1 && row[0] === '') return; // skip empty lines
            tableHtml += '<tr>';
            row.forEach(cell => {
                tableHtml += `<td style="padding: 5px; border-top: 1px solid #ddd;">${cell}</td>`;
            });
            tableHtml += '</tr>';
        });
        tableHtml += '</tbody></table>';

        const htmlToPrint = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Printable Table</title>
                <style>
                    @media print {
                        @page { size: A4 landscape; margin: 0.5in; }
                        body { -webkit-print-color-adjust: exact; }
                    }
                    body { font-family: sans-serif; }
                </style>
            </head>
            <body>${tableHtml}</body>
            </html>
        `;

        const iframe = document.createElement('iframe');
        iframe.style.visibility = 'hidden';
        iframe.style.position = 'absolute';
        document.body.appendChild(iframe);
        iframe.srcdoc = htmlToPrint;

        iframe.onload = () => {
            if (iframe.contentWindow) {
                iframe.contentWindow.focus();
                iframe.contentWindow.print();
            }
             setTimeout(() => {
                document.body.removeChild(iframe);
            }, 100);
        };
    };

    const howToSchema = {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": "How to Convert Excel (CSV) to PDF",
      "description": "Convert CSV data from an Excel file into a printable PDF document.",
      "step": [
        { "@type": "HowToStep", "name": "Upload CSV", "text": "Save your Excel sheet as a CSV file. Then, upload the .csv file using the selector." },
        { "@type": "HowToStep", "name": "Preview Data", "text": "The raw CSV data will be shown in the text area for you to review." },
        { "@type": "HowToStep", "name": "Convert to PDF", "text": "Click the 'Convert to PDF' button, which will generate a table and open your browser's print dialog." },
        { "@type": "HowToStep", "name": "Save as PDF", "text": "In the print dialog, choose 'Save as PDF' (and 'Landscape' layout for best results) and click 'Save'." }
      ]
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "Why do I have to use a CSV file instead of an XLSX file?",
                "acceptedAnswer": { "@type": "Answer", "text": "For security and privacy, this tool operates entirely within your browser without uploading files. Reading plain text CSV files is simple and secure. Processing complex XLSX files in the browser is much more difficult. You can easily save your Excel sheet as a CSV file from within Excel (File > Save As > CSV)." }
            },
            {
                "@type": "Question",
                "name": "Does this tool support multiple sheets?",
                "acceptedAnswer": { "@type": "Answer", "text": "No. The CSV format only contains the data from a single sheet. If your Excel file has multiple sheets, you will need to save each one as a separate CSV file and convert them individually." }
            },
            {
                "@type": "Question",
                "name": "Will my charts and formulas be converted?",
                "acceptedAnswer": { "@type": "Answer", "text": "No. The CSV format only stores the raw data values from your cells. It does not include charts, formulas, or formatting like colors and fonts." }
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
                    <h1 className="text-4xl md:text-5xl font-bold font-display text-slate-900 dark:text-white">Excel to PDF</h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 mt-2">Convert your spreadsheet data into a clean PDF table.</p>
                </div>

                <div className="bg-white/50 dark:bg-slate-800/20 p-6 border border-slate-300 dark:border-slate-700">
                    <h2 className="text-lg font-semibold mb-2 font-display">CSV File Content</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">First, save your Excel file as a CSV (Comma Separated Values). Then upload it here or paste the content.</p>
                    
                    {!file && !csvText ? (
                        <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg">
                            <label htmlFor="file-upload" className="relative cursor-pointer mt-4 inline-block">
                                <span className="px-6 py-3 bg-primary-700 text-white rounded-sm font-semibold hover:bg-primary-800 uppercase tracking-wider text-sm">Upload CSV File</span>
                                <input id="file-upload" type="file" className="sr-only" accept=".csv,text/csv" onChange={handleFileChange} />
                            </label>
                            <span className="my-2 text-slate-500">or</span>
                            <textarea
                                value={csvText}
                                onChange={(e) => setCsvText(e.target.value)}
                                className="w-full h-48 p-2 border rounded-sm bg-white dark:bg-slate-900 border-slate-400 dark:border-slate-700 font-mono text-sm"
                                placeholder="Paste CSV data here..."
                            />
                        </div>
                    ) : (
                        <div>
                           {file && <p className="mb-2 font-semibold">File: {file.name}</p>}
                           <textarea
                                value={csvText}
                                onChange={(e) => {
                                    setCsvText(e.target.value);
                                    if(file) setFile(null); // If user edits, disconnect from file
                                }}
                                className="w-full h-64 p-2 border rounded-sm bg-white dark:bg-slate-900 border-slate-400 dark:border-slate-700 font-mono text-sm"
                           />
                        </div>
                    )}
                    
                </div>
                
                {error && <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg text-sm">{error}</div>}
                
                <div className="mt-8 text-center">
                    <button
                        onClick={handleConvertToPdf}
                        disabled={isLoading || !csvText}
                        className="w-full max-w-md bg-primary-700 text-white font-bold py-4 px-4 rounded-sm hover:bg-primary-800 transition-colors flex items-center justify-center text-lg disabled:bg-primary-400 mx-auto"
                    >
                        {isLoading ? <Spinner /> : 'Convert to PDF'}
                    </button>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">This tool uses your browser's print to PDF functionality.</p>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-300 dark:border-slate-700">
                    <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-4">How to Convert Excel to PDF</h2>
                    <ol className="list-decimal list-inside space-y-4 text-slate-700 dark:text-slate-300">
                        <li><strong>Save as CSV:</strong> In Excel, go to "File" &gt; "Save As" and choose "CSV (Comma delimited) (*.csv)" as the file type.</li>
                        <li><strong>Upload or Paste:</strong> Upload the CSV file you just saved, or copy the content from the CSV file and paste it into the text box.</li>
                        <li><strong>Convert to PDF:</strong> Click the "Convert to PDF" button. This will format your data into a table and open your browser's print dialog.</li>
                        <li><strong>Save PDF:</strong> In the print dialog, select "Save as PDF" as the destination. We recommend choosing a "Landscape" layout for wider tables. Click "Save" to download.</li>
                    </ol>
                </div>

                <div className="mt-12">
                    <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-4">Frequently Asked Questions</h2>
                    <FaqItem question="Why do I have to use a CSV file instead of an XLSX file?">
                      For security and privacy, this tool operates entirely within your browser without uploading files. Reading plain text CSV files is simple and secure. Processing complex XLSX files in the browser is much more difficult. You can easily save your Excel sheet as a CSV file from within Excel (File &gt; Save As &gt; CSV).
                    </FaqItem>
                    <FaqItem question="Does this tool support multiple sheets?">
                      No. The CSV format only contains the data from a single sheet. If your Excel file has multiple sheets, you will need to save each one as a separate CSV file and convert them individually.
                    </FaqItem>
                    <FaqItem question="Will my charts and formulas be converted?">
                      No. The CSV format only stores the raw data values from your cells. It does not include charts, formulas, or formatting like colors and fonts.
                    </FaqItem>
                </div>

                <CommentSection />
            </div>
        </>
    );
};

export default ExcelToPdfPage;
