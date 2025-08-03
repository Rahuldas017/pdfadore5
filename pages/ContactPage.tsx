
import React, { useState } from 'react';
import useDocumentTitle from '../hooks/useDocumentTitle';

const ContactPage: React.FC = () => {
    useDocumentTitle("Contact Us | Pdfadore.com");
    const [formState, setFormState] = useState({ name: '', email: '', message: '' });
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // This is a simulation. In a real app, you would send this data to a server.
        console.log('Form submitted:', formState);
        setIsSubmitted(true);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState(prevState => ({ ...prevState, [name]: value }));
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
                <h1 className="text-4xl md:text-5xl font-bold font-display text-slate-900 dark:text-white">Contact Us</h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 mt-2">We'd love to hear from you. Get in touch with us for support or inquiries.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
                <div className="prose dark:prose-invert">
                    <h3>Contact Information</h3>
                    <p>
                        <strong>Founder:</strong> Rahul Kumar Das <br />
                        <strong>Mobile:</strong> <a href="tel:+917481012746">+91 7481012746</a> <br />
                        <strong>Email:</strong> <a href="mailto:rahulkumardas017@gmail.com">rahulkumardas017@gmail.com</a>
                    </p>
                    <h3>Address</h3>
                    <p>
                        B-431 Nehru Vihar <br />
                        East Delhi, Delhi <br />
                        India - 110055
                    </p>
                </div>
                
                <div className="bg-white/50 dark:bg-slate-800/20 p-6 border border-slate-300 dark:border-slate-700">
                    {isSubmitted ? (
                        <div className="text-center p-8">
                            <h3 className="text-2xl font-semibold font-display text-slate-800 dark:text-white mb-3">Thank You!</h3>
                            <p className="text-slate-600 dark:text-slate-400">Your message has been received. We'll get back to you shortly.</p>
                        </div>
                    ) : (
                         <form onSubmit={handleSubmit}>
                            <h3 className="text-2xl font-semibold font-display text-slate-800 dark:text-white mb-3">Send a Message</h3>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Name</label>
                                    <input type="text" name="name" id="name" required value={formState.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-sm shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700"/>
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                                    <input type="email" name="email" id="email" required value={formState.email} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-sm shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700"/>
                                </div>
                                <div>
                                    <label htmlFor="message" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Message</label>
                                    <textarea name="message" id="message" rows={4} required value={formState.message} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-sm shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-700"></textarea>
                                </div>
                                <button type="submit" className="w-full bg-primary-700 text-white font-bold py-3 px-4 rounded-sm hover:bg-primary-800 transition-colors uppercase tracking-wider">
                                    Send Message
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
