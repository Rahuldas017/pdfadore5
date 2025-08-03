import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getPostBySlug } from '../../services/blogService';
import { Post } from '../../../types';
import { marked } from 'marked';
import JsonLd from '../../../components/JsonLd';
import CommentSection from '../../../components/CommentSection';
import { ArrowLeftIcon } from '../../../components/icons/IconComponents';
import Spinner from '../../../components/Spinner';

const BlogPostPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const [post, setPost] = useState<Post | null>(null);
    const [htmlContent, setHtmlContent] = useState('');
    const contentRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        if (!slug) return;
        
        const fetchPost = async () => {
            const foundPost = await getPostBySlug(slug);
            if (foundPost) {
                setPost(foundPost);
                
                // Set document title
                document.title = `${foundPost.meta.title} | Pdfadore Blog`;
                
                // Set meta description
                let metaDescription = document.querySelector('meta[name="description"]');
                if (!metaDescription) {
                    metaDescription = document.createElement('meta');
                    metaDescription.setAttribute('name', 'description');
                    document.head.appendChild(metaDescription);
                }
                metaDescription.setAttribute('content', foundPost.meta.description);

                // Set Open Graph tags
                const setOgTag = (property: string, content: string) => {
                    let tag = document.querySelector(`meta[property="${property}"]`);
                    if (!tag) {
                        tag = document.createElement('meta');
                        tag.setAttribute('property', property);
                        document.head.appendChild(tag);
                    }
                    tag.setAttribute('content', content);
                };

                const fullImageUrl = `${window.location.origin}${foundPost.meta.coverImage}`;
                // Use the hash-based URL for canonical link for HashRouter compatibility
                const canonicalUrl = `${window.location.origin}/#/blog/${slug}`;

                setOgTag('og:title', foundPost.meta.title);
                setOgTag('og:description', foundPost.meta.description);
                setOgTag('og:type', 'article');
                setOgTag('og:url', canonicalUrl);
                setOgTag('og:image', fullImageUrl);
                
                // Set canonical URL
                let canonicalLink = document.querySelector('link[rel="canonical"]');
                if (!canonicalLink) {
                    canonicalLink = document.createElement('link');
                    canonicalLink.setAttribute('rel', 'canonical');
                    document.head.appendChild(canonicalLink);
                }
                canonicalLink.setAttribute('href', canonicalUrl);

                // Convert markdown to HTML
                const parsedHtml = await marked.parse(foundPost.content);
                setHtmlContent(parsedHtml);

            } else {
                // Handle post not found, maybe redirect to a 404 page or the blog index
                navigate('/blog');
            }
        }
        
        fetchPost();

    }, [slug, navigate]);

    if (!post) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spinner />
            </div>
        );
    }

    const blogPostingJsonLd = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.meta.title,
        "description": post.meta.description,
        "image": `${window.location.origin}${post.meta.coverImage}`,
        "datePublished": new Date(post.meta.date).toISOString(),
        "author": {
            "@type": "Person",
            "name": post.meta.author || "Pdfadore Team"
        },
        "publisher": {
            "@type": "Organization",
            "name": "Pdfadore",
            "logo": {
                "@type": "ImageObject",
                "url": "https://www.pdfadore.com/social-preview.png"
            }
        }
    };

    return (
        <>
            <JsonLd data={blogPostingJsonLd} />
            <style>{`
                .prose-styles { font-family: 'Lora', serif; }
                .prose-styles h1, .prose-styles h2, .prose-styles h3 { font-family: 'Playfair Display', serif; color: #1e293b; margin-bottom: 0.5em; margin-top: 1.5em; }
                .dark .prose-styles h1, .dark .prose-styles h2, .dark .prose-styles h3 { color: #f1f5f9; }
                .prose-styles h1 { font-size: 2.5em; }
                .prose-styles h2 { font-size: 2em; }
                .prose-styles h3 { font-size: 1.5em; }
                .prose-styles p { margin-bottom: 1.25em; line-height: 1.8; font-size: 1.125rem; }
                .prose-styles a { color: #0047e0; font-weight: 600; text-decoration: none; border-bottom: 2px solid #badcff; }
                .prose-styles a:hover { background-color: #eef6ff; }
                .dark .prose-styles a { color: #8cc2ff; border-bottom-color: #003ab7; }
                .dark .prose-styles a:hover { background-color: #001c56; }
                .prose-styles ul, .prose-styles ol { margin-left: 1.5em; margin-bottom: 1.25em; font-size: 1.125rem; }
                .prose-styles li { margin-bottom: 0.5em; line-height: 1.8; }
                .prose-styles blockquote { border-left: 4px solid #d8eaff; padding-left: 1em; margin-left: 0; font-style: italic; color: #475569; }
                .dark .prose-styles blockquote { border-left-color: #003194; color: #94a3b8; }
                .prose-styles code { background-color: #eef6ff; padding: 0.2em 0.4em; border-radius: 4px; font-family: monospace; font-size: 0.9em; }
                .dark .prose-styles code { background-color: #003194; color: #d8eaff; }
                .prose-styles pre { background-color: #1e293b; color: #e2e8f0; padding: 1em; border-radius: 8px; overflow-x: auto; }
                .dark .prose-styles pre { background-color: #0f172a; }
            `}</style>
            <div className="max-w-4xl mx-auto">
                <article>
                    <header className="mb-12 text-center">
                        <Link to="/blog" className="text-primary-700 dark:text-primary-400 hover:underline inline-flex items-center mb-6 text-base">
                           <ArrowLeftIcon className="w-4 h-4 mr-2" /> Back to Blog
                        </Link>
                        <h1 className="text-4xl md:text-6xl font-bold font-display text-slate-900 dark:text-white mb-4">{post.meta.title}</h1>
                        <div className="text-slate-600 dark:text-slate-400 text-base">
                            <span>By {post.meta.author}</span> &bull; <span>{post.meta.date}</span>
                        </div>
                    </header>
                    <div
                        ref={contentRef}
                        className="prose-styles text-slate-800 dark:text-slate-200"
                        dangerouslySetInnerHTML={{ __html: htmlContent }}
                    />
                </article>
                <CommentSection />
            </div>
        </>
    );
};

export default BlogPostPage;