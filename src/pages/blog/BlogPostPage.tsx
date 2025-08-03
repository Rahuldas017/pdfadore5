import React from 'react';
import { useParams } from 'react-router-dom';
const BlogPostPage: React.FC = () => {
  const { slug } = useParams();
  return <div>Blog Post: {slug}</div>;
};
export default BlogPostPage;