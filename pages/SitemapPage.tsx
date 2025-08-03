
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TOOLS, INFO_PAGES } from '../constants';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { getAllPosts } from '../src/services/blogService';
import { Post } from '../types';

const SitemapPage: React.FC = () => {
    useDocumentTitle("Sitemap | Pdfadore.com");
    const [blogPosts, setBlogPosts] = useState<Post[]>([]);

    useEffect(() => {
        const fetchPosts = async () => {
            const posts = await getAllPosts();
            setBlogPosts(posts);
        };
        fetchPosts();
    }, []);
    
    const toolCategories: { [key: string]: typeof TOOLS } = {
        'Organize PDF': TOOLS.filter(t => ['merge', 'split', 'page-numbers', 'rotate'].includes(t.id)),
        'Optimize PDF': TOOLS.filter(t => ['compress', 'repair'].includes(t.id)),
        'Convert to PDF': TOOLS.filter(t => t.path.includes('-to-pdf')),
        'Convert from PDF': TOOLS.filter(t => ['pdf-to-word', 'pdf-to-excel', 'pdf-to-jpg'].includes(t.id)),
        'Edit & Sign PDF': TOOLS.filter(t => ['edit-pdf', 'sign', 'watermark'].includes(t.id)),
        'Security': TOOLS.filter(t => ['unlock', 'protect'].includes(t.id)),
    };

    const companyPages = INFO_PAGES.filter(p => ['/about', '/contact', '/privacy-policy', '/disclaimer'].includes(p.path));
    const resourcePages = INFO_PAGES.filter(p => ['/info/how-to-edit-pdf', '/info/why-use-pdf'].includes(p.path));

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
                <h1 className="text-4xl md:text-5xl font-bold font-display text-slate-900 dark:text-white">Sitemap</h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 mt-2">A complete list of all tools and resources available on Pdfadore.</p>
            </div>

            <div className="space-y-8">
                {Object.entries(toolCategories).map(([category, tools]) => (
                    tools.length > 0 && (
                        <section key={category}>
                            <h2 className="text-2xl font-bold font-display text-slate-800 dark:text-white pb-2 mb-4 border-b border-slate-300 dark:border-slate-700">{category}</h2>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
                                {tools.map(tool => (
                                    <li key={tool.id}>
                                        <Link to={tool.path} className="text-slate-700 dark:text-slate-300 hover:text-primary-700 dark:hover:text-primary-400 text-lg transition-colors">
                                            {tool.title}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )
                ))}

                 <section>
                    <h2 className="text-2xl font-bold font-display text-slate-800 dark:text-white pb-2 mb-4 border-b border-slate-300 dark:border-slate-700">Company & Legal</h2>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
                        {companyPages.map(page => (
                            <li key={page.path}>
                                <Link to={page.path} className="text-slate-700 dark:text-slate-300 hover:text-primary-700 dark:hover:text-primary-400 text-lg transition-colors">
                                    {page.title}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>

                 <section>
                    <h2 className="text-2xl font-bold font-display text-slate-800 dark:text-white pb-2 mb-4 border-b border-slate-300 dark:border-slate-700">Guides & Blog</h2>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
                        {resourcePages.map(page => (
                             <li key={page.path}>
                                <Link to={page.path} className="text-slate-700 dark:text-slate-300 hover:text-primary-700 dark:hover:text-primary-400 text-lg transition-colors">
                                    {page.title}
                                </Link>
                            </li>
                        ))}
                         <li key="/blog">
                            <Link to="/blog" className="text-slate-700 dark:text-slate-300 hover:text-primary-700 dark:hover:text-primary-400 text-lg transition-colors">
                                Blog Home
                            </Link>
                        </li>
                         {blogPosts.map(post => (
                            <li key={post.meta.slug}>
                                <Link to={`/blog/${post.meta.slug}`} className="text-slate-700 dark:text-slate-300 hover:text-primary-700 dark:hover:text-primary-400 text-lg transition-colors">
                                    {post.meta.title}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
        </div>
    );
};

export default SitemapPage;
