import React from 'react';
import { Link } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { CheckCircleIcon, OcrIcon, BatchIcon, AdFreeIcon, SupportIcon, StarIcon, AiEditIcon } from '../components/icons/IconComponents';
import FaqItem from '../components/FaqItem';

const PremiumPage: React.FC = () => {
    useDocumentTitle("Pdfadore Premium | Unlock Advanced PDF Tools");

    const features = [
        {
            icon: <BatchIcon className="w-10 h-10 text-primary-700 dark:text-primary-400" />,
            title: 'Batch File Processing',
            description: 'Process multiple files at once in any tool, saving you valuable time on large projects.',
        },
        {
            icon: <OcrIcon className="w-10 h-10 text-primary-700 dark:text-primary-400" />,
            title: 'Convert Scanned PDFs with OCR',
            description: 'Turn scanned documents into searchable, selectable text with powerful Optical Character Recognition.',
        },
        {
            icon: <AdFreeIcon className="w-10 h-10 text-primary-700 dark:text-primary-400" />,
            title: 'Ad-Free Experience',
            description: 'Enjoy a cleaner, faster, and distraction-free workflow across the entire Pdfadore website.',
        },
        {
            icon: <SupportIcon className="w-10 h-10 text-primary-700 dark:text-primary-400" />,
            title: 'Priority Customer Support',
            description: 'Get faster responses from our dedicated support team to help you with any issues.',
        },
    ];

    return (
        <div className="w-full">
            {/* Hero Section */}
            <section className="text-center pt-16 pb-12 md:pt-24 md:pb-20 bg-slate-50 dark:bg-slate-900/50 -mx-4 px-4">
                <StarIcon className="w-16 h-16 mx-auto text-amber-500 mb-4" />
                <h1 className="text-5xl md:text-7xl font-bold font-display text-slate-900 dark:text-white mb-4 tracking-normal">
                    Unlock Premium Power
                </h1>
                <p className="text-lg text-slate-700 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
                    Elevate your productivity with batch processing, advanced OCR, an ad-free experience, and priority support. Go beyond the basics with Pdfadore Premium.
                </p>
                <div className="mt-10">
                    <a href="#pricing" className="bg-amber-500 text-slate-900 font-bold py-4 px-10 rounded-sm hover:bg-amber-600 transition-colors text-lg uppercase tracking-wider shadow-lg">
                        Choose Your Plan
                    </a>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 md:py-24">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold font-display text-slate-900 dark:text-white">Everything You Need for Serious Work</h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400 mt-2 max-w-2xl mx-auto">Premium is packed with features designed for professionals and power users.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {features.map((feature, index) => (
                        <div key={index} className="flex items-start space-x-4">
                            <div className="flex-shrink-0 mt-1 bg-primary-100/50 dark:bg-primary-900/50 p-3 border border-slate-300 dark:border-slate-700 rounded-sm">
                                {feature.icon}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white mb-1">{feature.title}</h3>
                                <p className="text-slate-600 dark:text-slate-400">{feature.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Featured Tool Section */}
            <section className="py-16 md:py-24 text-center">
                 <div className="border border-slate-300 dark:border-slate-700 p-8 md:p-12">
                     <div className="flex justify-center items-center mx-auto w-20 h-20 bg-primary-100/50 dark:bg-primary-900/50 border-2 border-primary-200 dark:border-primary-700 rounded-full mb-6">
                        <AiEditIcon className="w-12 h-12 text-primary-700 dark:text-primary-400"/>
                    </div>
                    <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-4">New! Edit PDF with AI</h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400 mt-2 max-w-2xl mx-auto mb-8">
                        Our first premium tool is here. Simply describe the changes you want to make in plain English, and let our AI do the heavy lifting. Redact information, correct typos, or update dates across your entire document with a single command.
                    </p>
                    <Link to="/ai-edit-pdf" className="bg-primary-700 text-white font-bold py-3 px-8 rounded-sm hover:bg-primary-800 transition-colors text-base uppercase tracking-wider">
                      Try the AI Editor
                  </Link>
                 </div>
            </section>
            
            {/* Pricing Section */}
            <section id="pricing" className="py-16 md:py-24 bg-slate-50 dark:bg-slate-900/50 -mx-4 px-4">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold font-display text-slate-900 dark:text-white">Simple, Transparent Pricing</h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400 mt-2">Choose the plan that's right for you. Cancel anytime.</p>
                </div>
                <div className="flex flex-col md:flex-row justify-center items-center gap-8">
                    <div className="border border-slate-300 dark:border-slate-700 bg-paper dark:bg-slate-900 p-8 w-full max-w-sm text-center">
                        <h3 className="text-2xl font-bold font-display text-slate-900 dark:text-white">Monthly</h3>
                        <p className="text-4xl font-bold font-display my-4 text-primary-700 dark:text-primary-400">$9.99 <span className="text-base font-sans text-slate-500">/ month</span></p>
                        <ul className="space-y-3 text-slate-700 dark:text-slate-300 text-left mb-6">
                            <li className="flex items-center"><CheckCircleIcon className="w-5 h-5 text-green-500 mr-2"/> Full access to all tools</li>
                            <li className="flex items-center"><CheckCircleIcon className="w-5 h-5 text-green-500 mr-2"/> Unlimited batch processing</li>
                             <li className="flex items-center"><CheckCircleIcon className="w-5 h-5 text-green-500 mr-2"/> Advanced OCR for scanned files</li>
                            <li className="flex items-center"><CheckCircleIcon className="w-5 h-5 text-green-500 mr-2"/> No Ads</li>
                            <li className="flex items-center"><CheckCircleIcon className="w-5 h-5 text-green-500 mr-2"/> Priority support</li>
                        </ul>
                        <button className="w-full bg-slate-800 text-white font-bold py-3 px-8 rounded-sm hover:bg-slate-900 transition-colors uppercase tracking-wider">Get Started</button>
                    </div>
                    <div className="relative border-2 border-amber-500 bg-paper dark:bg-slate-900 p-8 w-full max-w-sm text-center shadow-2xl">
                        <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-900 font-bold text-sm px-4 py-1 rounded-full uppercase">Most Popular</div>
                        <h3 className="text-2xl font-bold font-display text-slate-900 dark:text-white">Annual</h3>
                        <p className="text-4xl font-bold font-display my-4 text-primary-700 dark:text-primary-400">$99 <span className="text-base font-sans text-slate-500">/ year</span></p>
                        <p className="font-semibold text-green-600 mb-6">Save 17%</p>
                         <ul className="space-y-3 text-slate-700 dark:text-slate-300 text-left mb-6">
                            <li className="flex items-center"><CheckCircleIcon className="w-5 h-5 text-green-500 mr-2"/> Full access to all tools</li>
                            <li className="flex items-center"><CheckCircleIcon className="w-5 h-5 text-green-500 mr-2"/> Unlimited batch processing</li>
                             <li className="flex items-center"><CheckCircleIcon className="w-5 h-5 text-green-500 mr-2"/> Advanced OCR for scanned files</li>
                            <li className="flex items-center"><CheckCircleIcon className="w-5 h-5 text-green-500 mr-2"/> No Ads</li>
                            <li className="flex items-center"><CheckCircleIcon className="w-5 h-5 text-green-500 mr-2"/> Priority support</li>
                        </ul>
                        <button className="w-full bg-amber-500 text-slate-900 font-bold py-3 px-8 rounded-sm hover:bg-amber-600 transition-colors uppercase tracking-wider">Go Annual</button>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-16 md:py-24 max-w-4xl mx-auto">
                 <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold font-display text-slate-900 dark:text-white">Frequently Asked Questions</h2>
                </div>
                <FaqItem question="Can I cancel my subscription at any time?">
                    Yes, absolutely. You can manage and cancel your subscription from your account settings. Your premium access will continue until the end of your current billing period.
                </FaqItem>
                <FaqItem question="What payment methods do you accept?">
                    We accept all major credit cards, including Visa, Mastercard, and American Express, processed securely through Stripe.
                </FaqItem>
                <FaqItem question="What is OCR and why is it a premium feature?">
                    Optical Character Recognition (OCR) is an advanced technology that recognizes and extracts text from images and scanned documents. This process is computationally intensive and uses advanced AI models, which is why it's included in our Premium plan.
                </FaqItem>
                 <FaqItem question="Is there a free trial for Premium?">
                    We do not currently offer a free trial. However, all our basic tools are completely free to use, so you can experience the quality and security of Pdfadore before deciding to upgrade for advanced features.
                </FaqItem>
            </section>
        </div>
    );
};

export default PremiumPage;