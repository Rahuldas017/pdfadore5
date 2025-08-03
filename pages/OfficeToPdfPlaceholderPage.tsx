
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { WordIcon, PowerPointIcon, ExcelIcon } from '../components/icons/IconComponents';
import CommentSection from '../components/CommentSection';

const OfficeToPdfPlaceholderPage: React.FC = () => {
    const location = useLocation();
    const path = location.pathname;

    const getToolDetails = () => {
        if (path.includes('word')) {
            return {
                name: 'Word to PDF',
                icon: <WordIcon className="w-16 h-16 text-primary-500" />,
                description: 'Converting Microsoft Word (DOC, DOCX) files to PDF directly in the browser is a complex process that we are actively working on.'
            };
        }
        if (path.includes('powerpoint')) {
            return {
                name: 'PowerPoint to PDF',
                icon: <PowerPointIcon className="w-16 h-16 text-primary-500" />,
                description: 'Converting Microsoft PowerPoint (PPT, PPTX) files to PDF directly in the browser is a complex process that we are actively working on.'
            };
        }
        if (path.includes('excel')) {
            return {
                name: 'Excel to PDF',
                icon: <ExcelIcon className="w-16 h-16 text-primary-500" />,
                description: 'Converting Microsoft Excel (XLS, XLSX) files to PDF directly in the browser is a complex process that we are actively working on.'
            };
        }
        return {
            name: 'Feature Coming Soon',
            icon: null,
            description: 'This feature is under development.'
        };
    };

    const tool = getToolDetails();

    return (
        <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white dark:bg-slate-800 p-8 md:p-12 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700">
                <div className="flex justify-center items-center mx-auto w-24 h-24 bg-primary-100 dark:bg-primary-900/50 rounded-full mb-6">
                    {tool.icon}
                </div>
                <h1 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-4">{tool.name} is Coming Soon!</h1>
                <p className="text-md text-slate-600 dark:text-slate-400 mt-2 max-w-2xl mx-auto">
                    {tool.description}
                </p>
                <p className="text-md text-slate-600 dark:text-slate-400 mt-4 max-w-2xl mx-auto">
                    We are committed to providing a secure, client-side solution. Thank you for your patience!
                </p>
                <div className="mt-8">
                    <Link to="/" className="bg-primary-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-primary-700 transition-colors text-lg">
                        Back to Homepage
                    </Link>
                </div>
            </div>
            <CommentSection />
        </div>
    );
};

export default OfficeToPdfPlaceholderPage;
