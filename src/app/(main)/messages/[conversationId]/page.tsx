'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import Avatar from '@/components/ui/avatar';
import Button from '@/components/ui/button';
import Card from '@/components/ui/card';

export default function ConversationPage({ params }: { params: { conversationId: string } }) {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const recipientUserId = searchParams.get('userId');
  const [messages, setMessages] = useState<Record<string, unknown>[]>([]);
  const [otherUser, setOtherUser] = useState<Record<string, unknown> | null>(null);
  const [realConvId, setRealConvId] = useState<number | null>(
    params.conversationId === 'new' ? null : parseInt(params.conversationId)
  );
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    const url = params.conversationId === 'new' && recipientUserId
      ? `/api/messages/new?userId=${recipientUserId}`
      : `/api/messages/${params.conversationId}`;

    const res = await fetch(url);
    const data = await res.json();
    setMessages(data.messages || []);
    setOtherUser(data.otherUser);
    if (data.conversationId) setRealConvId(data.conversationId);
  };

  useEffect(() => { fetchMessages(); }, [params.conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Poll for new messages
  useEffect(() => {
    if (!realConvId) return;
    const interval = setInterval(async () => {
      const res = await fetch(`/api/messages/${realConvId}`);
      const data = await res.json();
      setMessages(data.messages || []);
    }, 5000);
    return () => clearInterval(interval);
  }, [realConvId]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    setSending(true);

    const convIdStr = realConvId ? String(realConvId) : 'new';
    const res = await fetch(`/api/messages/${convIdStr}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: newMessage,
        recipientId: recipientUserId ? parseInt(recipientUserId) : undefined,
      }),
    });

    const data = await res.json();
    setMessages(data.messages || []);
    if (data.conversationId) setRealConvId(data.conversationId);
    setNewMessage('');
    setSending(false);
  };

  return (
    <Card padding={false} className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      {otherUser && (
        <div className="flex items-center gap-3 p-4 border-b dark:border-gray-700">
          <Link href={`/profile/${otherUser.id}`}>
            <Avatar
              src={otherUser.profile_photo as string}
              firstName={otherUser.first_name as string}
              lastName={otherUser.last_name as string}
              size="md"
            />
          </Link>
          <div>
            <Link href={`/profile/${otherUser.id}`} className="font-semibold text-gray-900 dark:text-white hover:underline">
              {otherUser.first_name as string} {otherUser.last_name as string}
            </Link>
            <p className="text-xs text-gray-500 dark:text-gray-400">{otherUser.headline as string}</p>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 dark:text-gray-500 text-sm py-8">
            No messages yet. Say hello!
          </p>
        )}
        {messages.map(msg => {
          const isMine = (msg.sender_id as number) === user?.id;
          return (
            <div key={msg.id as number} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${
                isMine
                  ? 'bg-primary text-white rounded-br-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md'
              }`}>
                <p>{msg.content as string}</p>
                <p className={`text-[10px] mt-1 ${isMine ? 'text-white/70' : 'text-gray-400 dark:text-gray-500'}`}>
                  {new Date((msg.created_at as string) + 'Z').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t dark:border-gray-700 p-4 flex items-center gap-2">
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <Button onClick={handleSend} loading={sending} disabled={!newMessage.trim()}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </Button>
      </div>
    </Card>
  );
}
