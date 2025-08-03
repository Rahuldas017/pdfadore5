
import React from 'react';

export interface Tool {
  id: string;
  title: string;
  description: string;
  path: string;
  icon: React.ReactElement<React.SVGProps<SVGSVGElement>>;
  isPlaceholder?: boolean;
}

export interface PostMeta {
  title: string;
  description: string;
  date: string;
  coverImage: string;
  author?: string;
  tags?: string[];
  slug: string;
}

export interface Post {
  meta: PostMeta;
  content: string;
}

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

export interface PresentationOutline {
  slides: {
    title: string;
    points: string[];
  }[];
}
