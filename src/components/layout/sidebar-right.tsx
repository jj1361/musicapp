'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/card';
import Avatar from '@/components/ui/avatar';
import { User, Gig } from '@/types';

export default function SidebarRight() {
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [upcomingGigs, setUpcomingGigs] = useState<Gig[]>([]);

  useEffect(() => {
    fetch('/api/users?limit=3')
      .then(r => r.json())
      .then(d => setSuggestedUsers(d.users || []))
      .catch(() => {});
    fetch('/api/gigs?limit=3&status=open')
      .then(r => r.json())
      .then(d => setUpcomingGigs(d.gigs || []))
      .catch(() => {});
  }, []);

  return (
    <div className="sticky top-[72px] space-y-4">
      {suggestedUsers.length > 0 && (
        <Card>
          <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-3">People You May Know</h3>
          <div className="space-y-3">
            {suggestedUsers.map(u => (
              <Link key={u.id} href={`/profile/${u.id}`} className="flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 -mx-2 px-2 py-1 rounded">
                <Avatar src={u.profile_photo} firstName={u.first_name} lastName={u.last_name} size="sm" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{u.first_name} {u.last_name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{u.headline || u.account_type}</p>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      )}
      {upcomingGigs.length > 0 && (
        <Card>
          <h3 className="font-semibold text-sm text-gray-900 dark:text-white mb-3">Upcoming Gigs</h3>
          <div className="space-y-3">
            {upcomingGigs.map(g => (
              <Link key={g.id} href={`/gigs/${g.id}`} className="block hover:bg-gray-50 dark:hover:bg-gray-700 -mx-2 px-2 py-1 rounded">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{g.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{g.location} &middot; {new Date(g.gig_date).toLocaleDateString()}</p>
              </Link>
            ))}
          </div>
          <Link href="/gigs" className="block mt-3 text-xs text-primary hover:underline">View all gigs</Link>
        </Card>
      )}
    </div>
  );
}
