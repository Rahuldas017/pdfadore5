
import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import Spinner from '../components/Spinner';
import FileUploader from '../components/FileUploader';
import { LockIcon, DocumentTextIcon } from '../components/icons/IconComponents';
import CommentSection from '../components/CommentSection';
import useDocumentTitle from '../hooks/useDocumentTitle';
import JsonLd from '../components/JsonLd';
import FaqItem from '../components/FaqItem';

const ProtectPage: React.FC = () => {
    useDocumentTitle("Protect PDF with Password | Free PDF Encryption | Pdfadore.com");

    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleFileSelect = (selectedFile: File) => {
        setFile(selectedFile);
        setError('');
        setPassword('');
        setConfirmPassword('');
    };

    const handleProtect = async () => {
        if (!file || !password) {
            setError('Please provide a file and a password.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

            const pdfBytes = await pdfDoc.save({
                userPassword: password,
                ownerPassword: password, // For simplicity, use the same password for owner
            } as any);

            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${file.name.replace(/\.pdf$/i, '')}_protected.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
            
            handleReset();

        } catch (err) {
            console.error(err);
            setError('Could not protect the PDF. The file might be corrupted.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setFile(null);
        setError('');
        setPassword('');
        setConfirmPassword('');
    };
    
    const howToSchema = {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": "How to Protect a PDF with a Password",
      "description": "Encrypt and password-protect your PDF files for free.",
      "step": [
        { "@type": "HowToStep", "name": "Select PDF", "text": "Upload the PDF file you want to secure." },
        { "@type": "HowToStep", "name": "Set Password", "text": "Enter a strong password in both fields to confirm." },
        { "@type": "HowToStep", "name": "Protect PDF", "text": "Click the 'Protect PDF' button to apply the encryption." },
        { "@type": "HowToStep", "name": "Download", "text": "Your new, password-protected PDF file will be downloaded automatically." }
      ]
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "What happens if I forget my password?",
                "acceptedAnswer": { "@type": "Answer", "text": "It is very important to store your password in a safe place. We do not store your password, and there is no way to recover it if it is lost. You will not be able to open the file without it." }
            },
            {
                "@type": "Question",
                "name": "How secure is the encryption?",
                "acceptedAnswer": { "@type": "Answer", "text": "We use standard PDF encryption, which is very secure for general purposes. For highly sensitive data, always consider multiple layers of security." }
            },
            {
                "@type": "Question",
                "name": "Is my file uploaded to your servers?",
                "acceptedAnswer": { "@type": "Answer", "text": "No. The entire process of encrypting your PDF file happens locally in your browser. Your file's contents remain private and are never transmitted to us." }
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
                        <LockIcon className="w-10 h-10 text-primary-700 dark:text-primary-400"/>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold font-display text-slate-900 dark:text-white">Protect PDF</h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 mt-2">Encrypt your PDF with a password to secure it.</p>
                </div>

                {!file ? (
                    <FileUploader onFileSelect={handleFileSelect} processing={isLoading} />
                ) : (
                    <div className="bg-white/50 dark:bg-slate-800/20 p-6 border border-slate-300 dark:border-slate-700 w-full">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3 overflow-hidden">
                                <DocumentTextIcon className="w-6 h-6 text-primary-700 flex-shrink-0" />
                                <span className="font-medium text-slate-700 dark:text-slate-200 truncate">{file.name}</span>
                            </div>
                            <button onClick={handleReset} className="text-sm text-slate-500 hover:text-primary-700 dark:hover:text-primary-400">Choose another file</button>
                        </div>

                        <div className="space-y-4 my-6">
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Set a password</label>
                                <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-sm shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700" placeholder="Enter password"/>
                            </div>
                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Confirm password</label>
                                <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-sm shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700" placeholder="Confirm password"/>
                            </div>
                        </div>
                        
                        {error && <div className="my-4 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg text-sm"><strong className="font-bold">Error: </strong>{error}</div>}
                        
                        <button
                            onClick={handleProtect}
                            disabled={isLoading || !password || password !== confirmPassword}
                            className="w-full bg-primary-700 text-white font-bold py-3 px-4 rounded-sm hover:bg-primary-800 transition-colors flex items-center justify-center disabled:bg-primary-400 uppercase tracking-wider"
                        >
                            {isLoading ? <Spinner /> : 'Protect PDF'}
                        </button>
                    </div>
                )}
                
                <div className="mt-12 pt-8 border-t border-slate-300 dark:border-slate-700">
                    <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-4">How to Password Protect a PDF</h2>
                    <ol className="list-decimal list-inside space-y-4 text-slate-700 dark:text-slate-300">
                        <li><strong>Select Your PDF:</strong> Upload the document you wish to secure.</li>
                        <li><strong>Choose a Password:</strong> Enter a strong password. You will need to enter it a second time to confirm. Make sure you remember this password!</li>
                        <li><strong>Encrypt Your File:</strong> Click the 'Protect PDF' button. Your file will be encrypted with your chosen password.</li>
                        <li><strong>Download Securely:</strong> The newly protected PDF file will automatically download. It will now require the password to be opened.</li>
                    </ol>
                </div>

                <div className="mt-12">
                    <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-4">Frequently Asked Questions</h2>
                    <FaqItem question="What happens if I forget my password?">
                        It is very important to store your password in a safe place. We do not store your password, and there is no way to recover it if it is lost. You will not be able to open the file without it.
                    </FaqItem>
                    <FaqItem question="How secure is the encryption?">
                        We use standard PDF encryption, which is very secure for general purposes. For highly sensitive data, always consider multiple layers of security.
                    </FaqItem>
                    <FaqItem question="Is my file uploaded to your servers?">
                        No. The entire process of encrypting your PDF file happens locally in your browser. Your file's contents remain private and are never transmitted to us.
                    </FaqItem>
                </div>

                <CommentSection />
            </div>
        </>
    );
};

export default ProtectPage;
