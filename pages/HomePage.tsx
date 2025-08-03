import React from 'react';
import { TOOLS } from '../constants';
import ToolCard from '../components/ToolCard';
import { Link } from 'react-router-dom';
import { CheckCircleIcon } from '../components/icons/IconComponents';

const HomePage: React.FC = () => {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="text-center pt-16 pb-12 md:pt-24 md:pb-20">
        <h1 className="text-5xl md:text-7xl font-bold font-display text-slate-900 dark:text-white mb-4 tracking-normal">
          The PDF Toolkit You'll Adore
        </h1>
        <p className="text-lg text-slate-700 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
          Merge, split, compress, convert, and edit your PDFs with ease. Our suite of tools is powerful, secure, and 100% free. Get started without an account.
        </p>
         <div className="mt-8 flex justify-center gap-4">
            <Link to="/merge" className="bg-primary-700 text-white font-bold py-3 px-8 rounded-sm hover:bg-primary-800 transition-colors text-base uppercase tracking-wider">
              Explore Tools
            </Link>
          </div>
      </section>

      {/* Tools Grid Section */}
      <section className="pb-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {TOOLS.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-16 border-t border-b border-slate-300 dark:border-slate-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold font-display text-slate-800 dark:text-white mb-2">Trusted by Leading Companies</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">Our tools have earned the trust of millions of users from the world's leading companies.</p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6 text-slate-500 dark:text-slate-400">
            <span className="text-2xl font-semibold opacity-70 font-display">GlobalTech</span>
            <span className="text-2xl font-semibold opacity-70 font-display">Innovate Inc.</span>
            <span className="text-2xl font-semibold opacity-70 font-display">Quantum Corp</span>
            <span className="text-2xl font-semibold opacity-70 font-display">MegaSolutions</span>
            <span className="text-2xl font-semibold opacity-70 font-display">Pioneer Ltd.</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;