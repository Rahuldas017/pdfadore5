
import React from 'react';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { Link } from 'react-router-dom';

const PrivacyPolicyPage: React.FC = () => {
    useDocumentTitle("Privacy Policy | Pdfadore.com");

    return (
        <div className="max-w-4xl mx-auto prose dark:prose-invert prose-lg">
            <h1>Privacy Policy</h1>
            <p>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

            <p>
                Pdfadore ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains our philosophy and practices regarding your data when you use our website, https://www.pdfadore.com (the "Site").
            </p>

            <h2>The Core Principle: Your Files are Your Files</h2>
            <p>
                <strong>We do not upload, store, or transmit your files.</strong> Our tools are designed to work entirely within your web browser on your own computer (client-side). When you select a file to process with one of our tools, it is opened and handled by the code running on your local machine. At no point is your document sent to our servers or any third-party servers. This ensures the absolute highest level of privacy and security for your documents.
            </p>

            <h2>Information We Collect</h2>
            <p>
                Because our tools are client-side, we do not collect any personal information contained within the documents you process. The types of information we may collect are limited to:
            </p>
            <ul>
                <li><strong>Contact Information:</strong> If you voluntarily contact us via our <Link to="/contact">Contact Page</Link> or by email, we will collect your name, email address, and any other information you provide in your message in order to respond to your inquiry.</li>
                <li><strong>Usage Data:</strong> We may use web analytics services to collect non-personally identifiable information about your interaction with our Site. This may include your IP address, browser type, operating system, pages visited, and the dates/times of your visits. This data is used in an aggregated form to help us understand how our Site is used and to improve its functionality and user experience.</li>
            </ul>

            <h2>How We Use Your Information</h2>
            <p>
                Any information we collect is used solely for the following purposes:
            </p>
            <ul>
                <li>To operate and maintain our Site.</li>
                <li>To improve our Site and the tools we offer.</li>
                <li>To respond to your comments or inquiries.</li>
            </ul>

            <h2>Data Security</h2>
            <p>
                The security of your data is fundamental to our service. As stated, your files are not transmitted to us. For the limited data we do collect (e.g., contact form submissions), we implement appropriate security measures to protect against unauthorized access or disclosure.
            </p>

            <h2>Third-Party Services</h2>
            <p>
                We may use third-party services, such as Google Gemini for our AI tools or analytics providers. When using AI tools, only the extracted text content is sent for processing, not the file itself. These services have their own privacy policies, and we encourage you to review them.
            </p>
            
            <h2>Changes to This Privacy Policy</h2>
            <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
            </p>

            <h2>Contact Us</h2>
            <p>
                If you have any questions about this Privacy Policy, please <Link to="/contact">contact us</Link>.
            </p>
        </div>
    );
};

export default PrivacyPolicyPage;
