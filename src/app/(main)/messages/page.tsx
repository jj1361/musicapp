'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Avatar from '@/components/ui/avatar';
import Card from '@/components/ui/card';
import EmptyState from '@/components/ui/empty-state';

export default function MessagesPageWrapper() {
  return <Suspense fallback={<Card><p className="text-center text-gray-400 py-8">Loading...</p></Card>}><MessagesPage /></Suspense>;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr + 'Z').getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `${days}d`;
}

function MessagesPage() {
  const searchParams = useSearchParams();
  const newUserId = searchParams.get('userId');
  const [conversations, setConversations] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/messages')
      .then(r => r.json())
      .then(d => setConversations(d.conversations || []))
      .finally(() => setLoading(false));
  }, []);

  // If redirected with userId for new message
  if (newUserId) {
    return (
      <Card>
        <p className="text-center text-gray-500 py-4">
          <Link href={`/messages/new?userId=${newUserId}`} className="text-primary hover:underline">
            Start a new conversation
          </Link>
        </p>
      </Card>
    );
  }

  if (loading) return <Card><p className="text-center text-gray-400 py-8">Loading conversations...</p></Card>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Messages</h1>

      {conversations.length === 0 ? (
        <EmptyState
          title="No messages yet"
          description="Connect with other musicians and start a conversation!"
          icon={
            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          }
        />
      ) : (
        <Card padding={false}>
          <div className="divide-y dark:divide-gray-700">
            {conversations.map(conv => (
              <Link
                key={conv.id as number}
                href={`/messages/${conv.id}`}
                className={`flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  (conv.unread_count as number) > 0 ? 'bg-primary/5' : ''
                }`}
              >
                <Avatar
                  src={conv.profile_photo as string}
                  firstName={conv.first_name as string}
                  lastName={conv.last_name as string}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm truncate ${(conv.unread_count as number) > 0 ? 'font-bold text-gray-900 dark:text-white' : 'font-medium text-gray-700 dark:text-gray-300'}`}>
                      {conv.first_name as string} {conv.last_name as string}
                    </p>
                    <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0 ml-2">
                      {timeAgo(conv.last_message_at as string)}
                    </span>
                  </div>
                  <p className={`text-xs truncate ${(conv.unread_count as number) > 0 ? 'text-gray-900 dark:text-gray-200 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                    {conv.last_message as string}
                  </p>
                </div>
                {(conv.unread_count as number) > 0 && (
                  <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-[10px] text-white font-bold">{conv.unread_count as number}</span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
