import React, { useState } from 'react';
import { ArrowDownIcon, ArrowUpIcon } from './icons/IconComponents';

interface FaqItemProps {
  question: string;
  children: React.ReactNode;
}

const FaqItem: React.FC<FaqItemProps> = ({ question, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-slate-300 dark:border-slate-700 py-4">
      <h3>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex justify-between items-center text-left text-lg font-semibold font-display text-slate-800 dark:text-slate-100"
          aria-expanded={isOpen}
        >
          <span>{question}</span>
          {isOpen ? (
            <ArrowUpIcon className="w-5 h-5 flex-shrink-0" />
          ) : (
            <ArrowDownIcon className="w-5 h-5 flex-shrink-0" />
          )}
        </button>
      </h3>
      {isOpen && (
        <div className="mt-4 prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
          {children}
        </div>
      )}
    </div>
  );
};

export default FaqItem;
