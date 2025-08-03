
import React from 'react';
import { Link } from 'react-router-dom';
import { TwitterIcon, FacebookIcon, LinkedinIcon, InstagramIcon, PdfadoreIcon } from './icons/IconComponents';

const Footer: React.FC = () => {
  return (
    <footer className="bg-transparent dark:bg-slate-900/50 mt-12 border-t border-slate-300 dark:border-slate-700">
      <div className="container mx-auto px-4 pt-16 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1 mb-6 md:mb-0">
             <div className="flex items-center space-x-2 text-xl font-bold font-display text-slate-800 dark:text-white mb-4">
                <PdfadoreIcon className="h-7 w-7" />
                <span>Pdfadore</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">PDF tools you'll adore.</p>
          </div>
          
          <div className="col-span-1">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4 uppercase text-sm tracking-wider font-display">Product</h3>
            <ul className="space-y-2 text-slate-600 dark:text-slate-400 text-sm">
              <li><a href="#" className="hover:text-primary-700 dark:hover:text-primary-400">Desktop App</a></li>
              <li><a href="#" className="hover:text-primary-700 dark:hover:text-primary-400">Mobile App</a></li>
              <li><Link to="/sitemap" className="hover:text-primary-700 dark:hover:text-primary-400">Tools Sitemap</Link></li>
            </ul>
          </div>

          <div className="col-span-1">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4 uppercase text-sm tracking-wider font-display">Solutions</h3>
            <ul className="space-y-2 text-slate-600 dark:text-slate-400 text-sm">
              <li><a href="#" className="hover:text-primary-700 dark:hover:text-primary-400">Business</a></li>
              <li><a href="#" className="hover:text-primary-700 dark:hover:text-primary-400">Education</a></li>
              <li><a href="#" className="hover:text-primary-700 dark:hover:text-primary-400">Developers</a></li>
            </ul>
          </div>

           <div className="col-span-1">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4 uppercase text-sm tracking-wider font-display">Resources</h3>
            <ul className="space-y-2 text-slate-600 dark:text-slate-400 text-sm">
              <li><Link to="/info/how-to-edit-pdf" className="hover:text-primary-700 dark:hover:text-primary-400">How to Edit a PDF</Link></li>
              <li><Link to="/info/why-use-pdf" className="hover:text-primary-700 dark:hover:text-primary-400">Why Use PDF Format?</Link></li>
            </ul>
          </div>

          <div className="col-span-1">
            <h3 className="font-bold text-slate-800 dark:text-white mb-4 uppercase text-sm tracking-wider font-display">Company</h3>
            <ul className="space-y-2 text-slate-600 dark:text-slate-400 text-sm">
              <li><Link to="/about" className="hover:text-primary-700 dark:hover:text-primary-400">About Us</Link></li>
              <li><Link to="/blog" className="hover:text-primary-700 dark:hover:text-primary-400">Blog</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-primary-700 dark:hover:text-primary-400">Privacy Policy</Link></li>
              <li><Link to="/disclaimer" className="hover:text-primary-700 dark:hover:text-primary-400">Disclaimer</Link></li>
              <li><Link to="/contact" className="hover:text-primary-700 dark:hover:text-primary-400">Contact Us</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-300 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-slate-600 dark:text-slate-400 text-sm">
                &copy; {new Date().getFullYear()} Pdfadore. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 sm:mt-0">
                <a href="#" aria-label="Twitter"><TwitterIcon className="w-6 h-6 text-slate-500 hover:text-primary-700 dark:hover:text-primary-400"/></a>
                <a href="#" aria-label="Facebook"><FacebookIcon className="w-6 h-6 text-slate-500 hover:text-primary-700 dark:hover:text-primary-400"/></a>
                <a href="#" aria-label="LinkedIn"><LinkedinIcon className="w-6 h-6 text-slate-500 hover:text-primary-700 dark:hover:text-primary-400"/></a>
                <a href="#" aria-label="Instagram"><InstagramIcon className="w-6 h-6 text-slate-500 hover:text-primary-700 dark:hover:text-primary-400"/></a>
            </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
