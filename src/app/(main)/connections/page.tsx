'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Avatar from '@/components/ui/avatar';
import Button from '@/components/ui/button';
import Card from '@/components/ui/card';
import EmptyState from '@/components/ui/empty-state';

type Tab = 'accepted' | 'pending' | 'sent';

export default function ConnectionsPage() {
  const [tab, setTab] = useState<Tab>('accepted');
  const [connections, setConnections] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConnections = async () => {
    setLoading(true);
    const res = await fetch(`/api/connections?status=${tab}`);
    const data = await res.json();
    setConnections(data.connections || []);
    setLoading(false);
  };

  useEffect(() => { fetchConnections(); }, [tab]);

  const handleAccept = async (id: number) => {
    await fetch(`/api/connections/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'accepted' }),
    });
    fetchConnections();
  };

  const handleReject = async (id: number) => {
    await fetch(`/api/connections/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'rejected' }),
    });
    fetchConnections();
  };

  const handleRemove = async (id: number) => {
    await fetch(`/api/connections/${id}`, { method: 'DELETE' });
    fetchConnections();
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'accepted', label: 'My Connections' },
    { key: 'pending', label: 'Requests' },
    { key: 'sent', label: 'Sent' },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Network</h1>

      <div className="flex gap-1 bg-white dark:bg-card-dark rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-1">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              tab === t.key
                ? 'bg-primary text-white'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Card><p className="text-center text-gray-400 py-4">Loading...</p></Card>
      ) : connections.length === 0 ? (
        <EmptyState
          title={tab === 'accepted' ? 'No connections yet' : tab === 'pending' ? 'No pending requests' : 'No sent requests'}
          description={tab === 'accepted' ? 'Start connecting with other musicians!' : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {connections.map(conn => (
            <Card key={conn.id as number}>
              <div className="flex items-start gap-3">
                <Link href={`/profile/${conn.user_id}`} className="shrink-0">
                  <Avatar src={conn.profile_photo as string} firstName={conn.first_name as string} lastName={conn.last_name as string} size="lg" />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link href={`/profile/${conn.user_id}`} className="font-semibold text-gray-900 dark:text-white hover:underline truncate block">
                    {conn.first_name as string} {conn.last_name as string}
                  </Link>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{conn.headline as string}</p>
                  {conn.location ? <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{conn.location as string}</p> : null}
                  <div className="flex gap-2 mt-2">
                    {tab === 'pending' && (
                      <>
                        <Button size="sm" onClick={() => handleAccept(conn.id as number)}>Accept</Button>
                        <Button size="sm" variant="ghost" onClick={() => handleReject(conn.id as number)}>Ignore</Button>
                      </>
                    )}
                    {tab === 'accepted' && (
                      <>
                        <Link href={`/messages/new?userId=${conn.user_id}`}>
                          <Button size="sm" variant="outline">Message</Button>
                        </Link>
                        <Button size="sm" variant="ghost" onClick={() => handleRemove(conn.id as number)}>Remove</Button>
                      </>
                    )}
                    {tab === 'sent' && (
                      <Button size="sm" variant="ghost" onClick={() => handleRemove(conn.id as number)}>Cancel</Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
