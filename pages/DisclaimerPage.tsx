
import React from 'react';
import useDocumentTitle from '../hooks/useDocumentTitle';

const DisclaimerPage: React.FC = () => {
    useDocumentTitle("Disclaimer | Pdfadore.com");

    return (
        <div className="max-w-4xl mx-auto prose dark:prose-invert prose-lg">
            <h1>Disclaimer</h1>
            <p>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

            <p>
                The information and tools provided by Pdfadore ("we," "us," or "our") on https://www.pdfadore.com (the "Site") are for general informational and utility purposes only. All information and tools on the Site are provided in good faith, however, we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information or tool on the Site.
            </p>

            <h2>No Professional Advice</h2>
            <p>
                The information provided on the Site is not intended to be a substitute for professional advice. Any action you take upon the information you find on this website is strictly at your own risk. We will not be liable for any losses and/or damages in connection with the use of our website.
            </p>
            
            <h2>Tools "As Is"</h2>
            <p>
                All tools on the Site are provided on an "as is" and "as available" basis. You agree that your use of the tools is at your sole risk. We do not warrant that the tools will be error-free or that they will produce accurate, reliable, or complete results. You are solely responsible for verifying the output of the tools and for creating backups of your data.
            </p>

            <h2>External Links Disclaimer</h2>
            <p>
                The Site may contain links to other websites or content belonging to or originating from third parties. Such external links are not investigated, monitored, or checked for accuracy, adequacy, validity, reliability, availability, or completeness by us. We do not warrant, endorse, guarantee, or assume responsibility for the accuracy or reliability of any information offered by third-party websites linked through the site.
            </p>
            
            <h2>Contact Us</h2>
            <p>
                Should you have any feedback, comments, requests for technical support or other inquiries, please contact us by email: <strong>rahulkumardas017@gmail.com</strong>.
            </p>
        </div>
    );
};

export default DisclaimerPage;
