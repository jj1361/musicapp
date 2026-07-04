'use client';

import { useState, useEffect } from 'react';
import CreatePost from '@/components/feed/create-post';
import FeedPost from '@/components/feed/feed-post';
import EmptyState from '@/components/ui/empty-state';
import { PostSkeleton } from '@/components/ui/skeleton';

export default function FeedPage() {
  const [posts, setPosts] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    const res = await fetch('/api/feed');
    const data = await res.json();
    setPosts(data.posts || []);
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  return (
    <div className="space-y-4">
      <CreatePost onPostCreated={fetchPosts} />

      {loading ? (
        <div className="space-y-4">
          <PostSkeleton /><PostSkeleton /><PostSkeleton />
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          title="Your feed is empty"
          description="Connect with other musicians and start posting to see updates here."
          icon={
            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          }
        />
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <FeedPost key={post.id as number} post={post} onUpdate={fetchPosts} />
          ))}
        </div>
      )}
    </div>
  );
}
