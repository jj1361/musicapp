'use client';

import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import Avatar from '@/components/ui/avatar';
import Card from '@/components/ui/card';

export default function SidebarLeft() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <Card className="sticky top-[72px]" padding={false}>
      <div className="h-16 bg-gradient-to-r from-primary to-primary-dark rounded-t-lg" />
      <div className="flex flex-col items-center -mt-8 pb-4 px-4">
        <Avatar
          src={user.profile_photo}
          firstName={user.first_name}
          lastName={user.last_name}
          size="lg"
          className="border-2 border-white dark:border-card-dark"
        />
        <Link href="/profile" className="mt-2 text-center hover:underline">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {user.first_name} {user.last_name}
          </h3>
        </Link>
        {user.headline && (
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-0.5">{user.headline}</p>
        )}
        {user.location && (
          <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 mt-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {user.location}
          </p>
        )}
      </div>
      <div className="border-t dark:border-gray-700 py-2">
        <Link href="/profile" className="block px-4 py-1.5 text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary">
          Edit profile
        </Link>
        <Link href="/gigs/new" className="block px-4 py-1.5 text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-primary">
          Post a gig
        </Link>
      </div>
    </Card>
  );
}
