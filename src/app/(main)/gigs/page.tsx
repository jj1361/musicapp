'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import GigCard from '@/components/gigs/gig-card';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import Card from '@/components/ui/card';
import EmptyState from '@/components/ui/empty-state';
import { GigSkeleton } from '@/components/ui/skeleton';

export default function GigsPage() {
  return <Suspense fallback={<div className="space-y-4"><GigSkeleton /><GigSkeleton /></div>}><GigsContent /></Suspense>;
}

function GigsContent() {
  const searchParams = useSearchParams();
  const [gigs, setGigs] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    q: searchParams.get('q') || '',
    genre: searchParams.get('genre') || '',
    location: searchParams.get('location') || '',
    skill: searchParams.get('skill') || '',
  });

  const fetchGigs = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.q) params.set('q', filters.q);
    if (filters.genre) params.set('genre', filters.genre);
    if (filters.location) params.set('location', filters.location);
    if (filters.skill) params.set('skill', filters.skill);
    params.set('status', 'open');

    const res = await fetch(`/api/gigs?${params}`);
    const data = await res.json();
    setGigs(data.gigs || []);
    setLoading(false);
  };

  useEffect(() => { fetchGigs(); }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchGigs();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Find Gigs</h1>
        <Link href="/gigs/new">
          <Button>Post a Gig</Button>
        </Link>
      </div>

      <Card>
        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Input placeholder="Search gigs..." value={filters.q} onChange={e => setFilters(prev => ({ ...prev, q: e.target.value }))} />
          <Input placeholder="Genre..." value={filters.genre} onChange={e => setFilters(prev => ({ ...prev, genre: e.target.value }))} />
          <Input placeholder="Location..." value={filters.location} onChange={e => setFilters(prev => ({ ...prev, location: e.target.value }))} />
          <Button type="submit" className="w-full">Search</Button>
        </form>
      </Card>

      {loading ? (
        <div className="space-y-4">
          <GigSkeleton /><GigSkeleton /><GigSkeleton />
        </div>
      ) : gigs.length === 0 ? (
        <EmptyState
          title="No gigs found"
          description="Try adjusting your search filters or check back later."
          icon={
            <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          }
        />
      ) : (
        <div className="space-y-3">
          {gigs.map(gig => <GigCard key={gig.id as number} gig={gig} />)}
        </div>
      )}
    </div>
  );
}
