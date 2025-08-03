import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllPosts } from '../../services/blogService';
import useDocumentTitle from '../../../hooks/useDocumentTitle';
import JsonLd from '../../../components/JsonLd';
import { Post } from '../../../types';
import Spinner from '../../../components/Spinner';

const BlogIndexPage: React.FC = () => {
    useDocumentTitle("Blog | News, Tips, and Updates | Pdfadore.com");
    const [posts, setPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            setIsLoading(true);
            try {
                const fetchedPosts = await getAllPosts();
                setPosts(fetchedPosts);
            } catch (error) {
                console.error("Failed to load posts for index page:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPosts();
    }, []);

    const blogJsonLd = {
        "@context": "https://schema.org",
        "@type": "Blog",
        "name": "Pdfadore Blog",
        "description": "The latest news, tips, and updates from the Pdfadore team.",
        "url": "https://www.pdfadore.com/blog",
    };

    return (
        <>
            <JsonLd data={blogJsonLd} />
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-5xl md:text-6xl font-bold font-display text-slate-900 dark:text-white">The Pdfadore Blog</h1>
                    <p className="text-xl text-slate-600 dark:text-slate-400 mt-4 max-w-3xl mx-auto">
                        Stay updated with the latest news, product features, and helpful guides on all things PDF.
                    </p>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Spinner />
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                        <h2 className="text-2xl font-semibold font-display">No Posts Yet</h2>
                        <p>Check back soon for news and updates!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {posts.map(post => (
                            <Link to={`/blog/${post.meta.slug}`} key={post.meta.slug} className="group block bg-white/50 dark:bg-slate-800/20 border border-slate-300 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 hover:border-primary-500/50 dark:hover:border-primary-500/30 transition-all duration-300">
                                <div className="p-8">
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">{post.meta.date}</p>
                                    <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-3 group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors">
                                        {post.meta.title}
                                    </h2>
                                    <p className="text-slate-600 dark:text-slate-300 mb-4 text-base leading-relaxed">{post.meta.description}</p>
                                    <span className="font-semibold text-primary-700 dark:text-primary-400 text-base">
                                        Read more &rarr;
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
};

export default BlogIndexPage;
