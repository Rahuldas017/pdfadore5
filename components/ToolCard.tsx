import React from 'react';
import { Link } from 'react-router-dom';
import { Tool } from '../types';

interface ToolCardProps {
  tool: Tool;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
  const cardContent = (
    <div className={`group bg-white/50 dark:bg-slate-800/20 p-4 border border-slate-300 dark:border-slate-700 hover:border-primary-500 dark:hover:border-primary-400 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-in-out h-full flex flex-col items-start text-left ${tool.isPlaceholder ? 'opacity-60 cursor-not-allowed' : ''}`}>
      <div className="mb-3 transition-transform duration-300 group-hover:scale-110">
        {tool.icon}
      </div>
      <h3 className="text-md font-bold font-display text-slate-900 dark:text-white mb-1">{tool.title}</h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 flex-grow">{tool.description}</p>
    </div>
  );

  if (tool.isPlaceholder) {
    return <div className="block h-full">{cardContent}</div>;
  }

  return (
    <Link to={tool.path} className="block h-full no-underline">
      {cardContent}
    </Link>
  );
};

export default ToolCard;
