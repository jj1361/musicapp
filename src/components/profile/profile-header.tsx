'use client';

import Avatar from '@/components/ui/avatar';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import { UserProfile } from '@/types';

interface ProfileHeaderProps {
  user: UserProfile;
  isOwner: boolean;
  onEdit?: () => void;
  onConnect?: () => void;
  onMessage?: () => void;
}

export default function ProfileHeader({ user, isOwner, onEdit, onConnect, onMessage }: ProfileHeaderProps) {
  return (
    <div className="bg-white dark:bg-card-dark rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="h-32 bg-gradient-to-r from-primary via-primary-dark to-secondary" />
      <div className="px-6 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
          <Avatar
            src={user.profile_photo}
            firstName={user.first_name}
            lastName={user.last_name}
            size="xl"
            className="border-4 border-white dark:border-card-dark"
          />
          <div className="flex-1 sm:mb-2">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {user.first_name} {user.last_name}
            </h1>
            {user.headline && (
              <p className="text-gray-600 dark:text-gray-400">{user.headline}</p>
            )}
            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400">
              {user.location && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {user.location}
                </span>
              )}
              <span>{user.connection_count || 0} connections</span>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <Badge variant={user.availability === 'available' ? 'secondary' : 'default'}>
                {user.availability === 'available' ? 'Available' : user.availability === 'busy' ? 'Busy' : 'Not Looking'}
              </Badge>
              <Badge variant="primary">{user.account_type}</Badge>
            </div>
          </div>
          <div className="flex gap-2 sm:mb-2">
            {isOwner ? (
              <Button variant="outline" onClick={onEdit}>Edit Profile</Button>
            ) : (
              <>
                {user.connection_status === 'none' && (
                  <Button onClick={onConnect}>Connect</Button>
                )}
                {user.connection_status === 'sent' && (
                  <Button variant="outline" disabled>Pending</Button>
                )}
                {user.connection_status === 'accepted' && (
                  <Button variant="secondary" onClick={onMessage}>Message</Button>
                )}
                {user.connection_status === 'pending' && (
                  <Button variant="secondary" onClick={onConnect}>Accept</Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
