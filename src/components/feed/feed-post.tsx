'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import Avatar from '@/components/ui/avatar';
import Button from '@/components/ui/button';
import Card from '@/components/ui/card';

interface FeedPostProps {
  post: Record<string, unknown>;
  onUpdate: () => void;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr + 'Z').getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d`;
  return new Date(dateStr).toLocaleDateString();
}

export default function FeedPost({ post, onUpdate }: FeedPostProps) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(!!post.user_liked);
  const [likesCount, setLikesCount] = useState(post.likes_count as number);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Record<string, unknown>[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);

  const handleLike = async () => {
    const res = await fetch(`/api/feed/${post.id}/like`, { method: 'POST' });
    const data = await res.json();
    setLiked(data.liked);
    setLikesCount(data.likesCount);
  };

  const toggleComments = async () => {
    if (!showComments) {
      setLoadingComments(true);
      const res = await fetch(`/api/feed/${post.id}/comment`);
      const data = await res.json();
      setComments(data.comments || []);
      setLoadingComments(false);
    }
    setShowComments(!showComments);
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    const res = await fetch(`/api/feed/${post.id}/comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: commentText }),
    });
    const data = await res.json();
    setComments(data.comments || []);
    setCommentText('');
    onUpdate();
  };

  const handleDelete = async () => {
    await fetch(`/api/feed/${post.id}`, { method: 'DELETE' });
    onUpdate();
  };

  return (
    <Card padding={false}>
      <div className="p-4">
        <div className="flex items-start justify-between">
          <Link href={`/profile/${post.author_id}`} className="flex items-center gap-2">
            <Avatar src={post.profile_photo as string} firstName={post.first_name as string} lastName={post.last_name as string} size="md" />
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white hover:underline">
                {post.first_name as string} {post.last_name as string}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {post.headline as string} &middot; {timeAgo(post.created_at as string)}
              </p>
            </div>
          </Link>
          {user?.id === post.author_id && (
            <button onClick={handleDelete} className="text-gray-400 hover:text-danger text-xs">
              Delete
            </button>
          )}
        </div>

        <p className="mt-3 text-sm text-gray-800 dark:text-gray-200 whitespace-pre-line">
          {post.content as string}
        </p>
      </div>

      {/* Stats */}
      {(likesCount > 0 || (post.comments_count as number) > 0) && (
        <div className="px-4 py-1.5 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 border-t dark:border-gray-700">
          <span>{likesCount} {likesCount === 1 ? 'like' : 'likes'}</span>
          <button onClick={toggleComments} className="hover:text-primary">
            {post.comments_count as number} {(post.comments_count as number) === 1 ? 'comment' : 'comments'}
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="flex border-t dark:border-gray-700">
        <button
          onClick={handleLike}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${
            liked ? 'text-primary' : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          <svg className="w-5 h-5" fill={liked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={liked ? 0 : 1.5} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
          </svg>
          Like
        </button>
        <button
          onClick={toggleComments}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Comment
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="border-t dark:border-gray-700 p-4 space-y-3">
          {loadingComments ? (
            <p className="text-xs text-gray-400">Loading...</p>
          ) : (
            comments.map(c => (
              <div key={c.id as number} className="flex items-start gap-2">
                <Avatar src={c.profile_photo as string} firstName={c.first_name as string} lastName={c.last_name as string} size="sm" />
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2 flex-1">
                  <p className="text-xs font-semibold text-gray-900 dark:text-white">
                    {c.first_name as string} {c.last_name as string}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{c.content as string}</p>
                </div>
              </div>
            ))
          )}

          <div className="flex items-center gap-2">
            <Avatar src={user?.profile_photo} firstName={user?.first_name} lastName={user?.last_name} size="sm" />
            <input
              type="text"
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleComment(); }}
              className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button size="sm" onClick={handleComment} disabled={!commentText.trim()}>Send</Button>
          </div>
        </div>
      )}
    </Card>
  );
}
