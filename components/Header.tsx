
import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { PdfadoreIcon } from './icons/IconComponents';

const Header: React.FC = () => {
    const navLinkClass = ({ isActive }: { isActive: boolean }) =>
        `text-slate-600 dark:text-slate-300 hover:text-primary-700 dark:hover:text-primary-400 transition-colors ${isActive ? 'text-primary-800 dark:text-primary-500 font-bold' : ''}`;

  return (
    <header className="bg-paper/80 dark:bg-slate-900/80 sticky top-0 z-50 border-b-2 border-slate-300 dark:border-slate-700">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          <Link to="/" className="flex items-center space-x-2 text-2xl font-bold font-display text-slate-800 dark:text-white">
            <PdfadoreIcon className="h-8 w-8" />
            <span className="hidden sm:inline">Pdfadore</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8 text-base">
            <NavLink to="/" className={navLinkClass}>Home</NavLink>
            <NavLink to="/merge" className={navLinkClass}>Merge</NavLink>
            <NavLink to="/split" className={navLinkClass}>Split</NavLink>
            <NavLink to="/compress" className={navLinkClass}>Compress</NavLink>
            <NavLink to="/pdf-to-word" className={navLinkClass}>Convert</NavLink>
            <NavLink to="/about" className={navLinkClass}>About</NavLink>
            <NavLink to="/contact" className={navLinkClass}>Contact</NavLink>
          </nav>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <button className="text-slate-700 dark:text-slate-300 hover:text-primary-700 dark:hover:text-primary-400 font-semibold text-sm transition-colors">
              Log in
            </button>
            <button className="bg-slate-800 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-sm font-semibold hover:bg-slate-900 transition-all duration-300 text-sm uppercase tracking-wider">
              Sign up
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
