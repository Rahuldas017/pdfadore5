import matter from 'gray-matter';
import { Post, PostMeta } from '../../../types';
import { postData } from '../content/blogData';

let allPosts: Post[] = [];

// This function now processes pre-loaded blog content, making it faster and more reliable.
export const getAllPosts = (): Promise<Post[]> => {
    // Return cached posts if available
    if (allPosts.length > 0) {
        return Promise.resolve(allPosts);
    }

    try {
        const posts: Post[] = postData.map(postFile => {
            const { filename, content: rawContent } = postFile;
            
            const { data, content } = matter(rawContent);
            const slug = filename.replace('.md', '').replace(/^\d{4}-\d{2}-\d{2}-/, '');
            const dateMatch = filename.match(/^(\d{4}-\d{2}-\d{2})/);
            const rawDate = dateMatch ? dateMatch[1] : '1970-01-01';

            const meta: PostMeta = {
                title: data.title || 'Untitled Post',
                description: data.description || '',
                coverImage: data.coverImage || '/images/posts/default-cover.jpg',
                author: data.author || 'Pdfadore Team',
                tags: data.tags || [],
                date: new Date(rawDate).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    timeZone: 'UTC'
                }),
                slug,
            };

            return { meta, content };
        }).filter((p): p is Post => p !== null);

        const sortedPosts = posts.sort((a, b) => new Date(b.meta.date).getTime() - new Date(a.meta.date).getTime());
        
        allPosts = sortedPosts;
        return Promise.resolve(allPosts);
    } catch (error) {
        console.error("Error processing bundled blog posts:", error);
        return Promise.resolve([]); // Return empty array on error
    }
};

export const getPostBySlug = async (slug: string): Promise<Post | undefined> => {
    const posts = await getAllPosts();
    return posts.find(post => post.meta.slug === slug);
};
