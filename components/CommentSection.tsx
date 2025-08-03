
import React, { useState } from 'react';

interface Comment {
  author: string;
  text: string;
}

const CommentSection: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([
    { author: 'Jane Doe', text: 'This tool is amazing! Saved me so much time.' },
    { author: 'John Smith', text: 'Worked perfectly. Very easy to use.' },
  ]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setComments(prev => [...prev, { author: 'Anonymous', text: newComment }]);
      setNewComment('');
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <div className="mt-12 pt-8 border-t border-slate-300 dark:border-slate-700">
      <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-6">User Comments</h2>
      
      {/* Comments List */}
      <div className="space-y-6 mb-8">
        {comments.map((comment, index) => (
          <div key={index} className="flex items-start space-x-4 pb-4 border-b border-slate-200 dark:border-slate-700 last:border-b-0">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <p className="font-bold text-slate-800 dark:text-white font-display text-lg">{comment.author}</p>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{comment.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="bg-white/50 dark:bg-slate-800/20 p-6 border border-slate-300 dark:border-slate-700">
        <h3 className="text-2xl font-semibold font-display text-slate-800 dark:text-white mb-3">Leave a Comment</h3>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="w-full p-3 border rounded-sm bg-white dark:bg-slate-900 border-slate-400 dark:border-slate-600 focus:ring-2 focus:ring-primary-600 focus:outline-none"
          rows={4}
          placeholder="Share your experience with this tool..."
          required
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-4 px-6 py-2 bg-primary-700 text-white font-semibold rounded-sm hover:bg-primary-800 transition-colors disabled:bg-primary-400 uppercase tracking-wider text-sm"
        >
          {isSubmitting ? 'Submitting...' : 'Post Comment'}
        </button>
      </form>
    </div>
  );
};

export default CommentSection;