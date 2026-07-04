'use client';

import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import Avatar from '@/components/ui/avatar';
import Button from '@/components/ui/button';
import Card from '@/components/ui/card';

interface CreatePostProps {
  onPostCreated: () => void;
}

export default function CreatePost({ onPostCreated }: CreatePostProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setLoading(true);
    try {
      await fetch('/api/feed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      setContent('');
      setExpanded(false);
      onPostCreated();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <div className="flex items-start gap-3">
        <Avatar src={user?.profile_photo} firstName={user?.first_name} lastName={user?.last_name} size="md" />
        <div className="flex-1">
          {!expanded ? (
            <button
              onClick={() => setExpanded(true)}
              className="w-full text-left px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
            >
              Share what&apos;s on your mind...
            </button>
          ) : (
            <div>
              <textarea
                autoFocus
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share an update, announce a gig, or connect with fellow musicians..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary resize-none text-sm"
              />
              <div className="flex justify-end gap-2 mt-2">
                <Button variant="ghost" size="sm" onClick={() => { setExpanded(false); setContent(''); }}>
                  Cancel
                </Button>
                <Button size="sm" loading={loading} onClick={handleSubmit} disabled={!content.trim()}>
                  Post
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
