'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Avatar from '@/components/ui/avatar';
import Badge from '@/components/ui/badge';
import Card from '@/components/ui/card';
import GigCard from '@/components/gigs/gig-card';
import EmptyState from '@/components/ui/empty-state';

type Tab = 'all' | 'people' | 'gigs';

export default function SearchPage() {
  return <Suspense fallback={<Card><p className="text-center text-gray-400 py-8">Loading...</p></Card>}><SearchContent /></Suspense>;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [tab, setTab] = useState<Tab>('all');
  const [users, setUsers] = useState<Record<string, unknown>[]>([]);
  const [gigs, setGigs] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) return;
    setLoading(true);

    Promise.all([
      fetch(`/api/users?q=${encodeURIComponent(query)}`).then(r => r.json()),
      fetch(`/api/gigs?q=${encodeURIComponent(query)}`).then(r => r.json()),
    ]).then(([usersData, gigsData]) => {
      setUsers(usersData.users || []);
      setGigs(gigsData.gigs || []);
      setLoading(false);
    });
  }, [query]);

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: users.length + gigs.length },
    { key: 'people', label: 'People', count: users.length },
    { key: 'gigs', label: 'Gigs', count: gigs.length },
  ];

  const showUsers = tab === 'all' || tab === 'people';
  const showGigs = tab === 'all' || tab === 'gigs';

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        {query ? `Results for "${query}"` : 'Search'}
      </h1>

      {query && (
        <div className="flex gap-1 bg-white dark:bg-card-dark rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-1">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                tab === t.key ? 'bg-primary text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {t.label} ({t.count})
            </button>
          ))}
        </div>
      )}

      {loading && <Card><p className="text-center text-gray-400 py-8">Searching...</p></Card>}

      {!loading && query && users.length === 0 && gigs.length === 0 && (
        <EmptyState title="No results found" description="Try different keywords or adjust your search." />
      )}

      {!loading && showUsers && users.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">People</h2>
          <div className="space-y-2">
            {users.map(u => (
              <Card key={u.id as number}>
                <Link href={`/profile/${u.id}`} className="flex items-center gap-3">
                  <Avatar src={u.profile_photo as string} firstName={u.first_name as string} lastName={u.last_name as string} size="lg" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white hover:underline">
                      {u.first_name as string} {u.last_name as string}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{u.headline as string}</p>
                    {u.location ? <p className="text-xs text-gray-400">{u.location as string}</p> : null}
                  </div>
                  <Badge variant={u.availability === 'available' ? 'secondary' : 'default'}>
                    {u.availability as string}
                  </Badge>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      )}

      {!loading && showGigs && gigs.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Gigs</h2>
          <div className="space-y-2">
            {gigs.map(g => <GigCard key={g.id as number} gig={g} />)}
          </div>
        </div>
      )}

      {!query && (
        <EmptyState
          title="Search GigBoard"
          description="Find musicians, entertainers, and gigs using the search bar above."
          icon={
            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
        />
      )}
    </div>
  );
}
