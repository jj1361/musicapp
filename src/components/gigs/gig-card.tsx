'use client';

import Link from 'next/link';
import Badge from '@/components/ui/badge';
import Avatar from '@/components/ui/avatar';

interface GigCardProps {
  gig: Record<string, unknown>;
}

export default function GigCard({ gig }: GigCardProps) {
  const skills = ((gig.skills_needed as string) || '').split(',').filter(Boolean).map(s => s.trim());

  return (
    <Link href={`/gigs/${gig.id}`}>
      <div className="bg-white dark:bg-card-dark rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 dark:text-white">{gig.title as string}</h3>
          <Badge variant={gig.status === 'open' ? 'secondary' : 'default'}>
            {(gig.status as string).toUpperCase()}
          </Badge>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400">
          {gig.venue ? `${gig.venue} · ` : ''}{gig.location as string}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          {new Date(gig.gig_date as string).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          {gig.gig_time ? ` · ${gig.gig_time}` : ''}
        </p>

        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {skills.map(s => (
              <Badge key={s} variant="primary">{s}</Badge>
            ))}
            {gig.genre ? <Badge variant="accent">{gig.genre as string}</Badge> : null}
          </div>
        )}

        <div className="flex items-center justify-between mt-3 pt-3 border-t dark:border-gray-700">
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {(gig.pay_type as string) === 'unpaid' ? (
              'Unpaid / Volunteer'
            ) : (gig.pay_type as string) === 'negotiable' ? (
              'Pay Negotiable'
            ) : (
              <>
                ${gig.pay_min as number}{(gig.pay_max as number) > (gig.pay_min as number) && ` - $${gig.pay_max}`}
                {(gig.pay_type as string) === 'hourly' && '/hr'}
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Avatar
              firstName={gig.first_name as string}
              lastName={gig.last_name as string}
              src={gig.profile_photo as string}
              size="sm"
            />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {gig.first_name as string} {gig.last_name as string}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
