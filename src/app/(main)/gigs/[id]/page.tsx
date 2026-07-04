'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import Card from '@/components/ui/card';
import Badge from '@/components/ui/badge';
import Avatar from '@/components/ui/avatar';
import Button from '@/components/ui/button';
import Modal from '@/components/ui/modal';
import Textarea from '@/components/ui/textarea';
import { PostSkeleton } from '@/components/ui/skeleton';

export default function GigDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const [gig, setGig] = useState<Record<string, unknown> | null>(null);
  const [applications, setApplications] = useState<Record<string, unknown>[]>([]);
  const [userApplication, setUserApplication] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApply, setShowApply] = useState(false);
  const [applyMessage, setApplyMessage] = useState('');
  const [applying, setApplying] = useState(false);

  const fetchGig = async () => {
    const res = await fetch(`/api/gigs/${params.id}`);
    const data = await res.json();
    setGig(data.gig);
    setApplications(data.applications || []);
    setUserApplication(data.userApplication);
    setLoading(false);
  };

  useEffect(() => { fetchGig(); }, [params.id]);

  const handleApply = async () => {
    setApplying(true);
    await fetch(`/api/gigs/${params.id}/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: applyMessage }),
    });
    setShowApply(false);
    setApplyMessage('');
    setApplying(false);
    fetchGig();
  };

  if (loading) return <PostSkeleton />;
  if (!gig) return <p className="text-center py-8 text-gray-500">Gig not found</p>;

  const isOwner = user?.id === gig.poster_id;
  const skills = ((gig.skills_needed as string) || '').split(',').filter(Boolean).map(s => s.trim());

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{gig.title as string}</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {gig.venue ? `${gig.venue} · ` : ''}{gig.location as string}
            </p>
          </div>
          <Badge variant={gig.status === 'open' ? 'secondary' : 'default'} className="text-sm">
            {(gig.status as string).toUpperCase()}
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Date</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {new Date(gig.gig_date as string).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Time</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{(gig.gig_time as string) || 'TBD'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Pay</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {(gig.pay_type as string) === 'unpaid' ? 'Volunteer' :
               (gig.pay_type as string) === 'negotiable' ? 'Negotiable' :
               `$${gig.pay_min}${(gig.pay_max as number) > (gig.pay_min as number) ? ` - $${gig.pay_max}` : ''}${(gig.pay_type as string) === 'hourly' ? '/hr' : ''}`}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Applications</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{gig.applications as number}</p>
          </div>
        </div>

        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {skills.map(s => <Badge key={s} variant="primary">{s}</Badge>)}
            {gig.genre ? <Badge variant="accent">{gig.genre as string}</Badge> : null}
          </div>
        )}

        <div className="prose dark:prose-invert max-w-none text-sm">
          <p className="whitespace-pre-line text-gray-700 dark:text-gray-300">{gig.description as string}</p>
        </div>

        <div className="mt-6 pt-4 border-t dark:border-gray-700 flex items-center justify-between">
          <Link href={`/profile/${gig.poster_user_id || gig.poster_id}`} className="flex items-center gap-2 hover:underline">
            <Avatar firstName={gig.first_name as string} lastName={gig.last_name as string} src={gig.profile_photo as string} size="md" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{gig.first_name as string} {gig.last_name as string}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{gig.poster_headline as string}</p>
            </div>
          </Link>

          {!isOwner && gig.status === 'open' && (
            userApplication ? (
              <Badge variant="primary">Applied - {userApplication.status as string}</Badge>
            ) : (
              <Button onClick={() => setShowApply(true)}>Apply Now</Button>
            )
          )}
        </div>
      </Card>

      {/* Applications list for gig owner */}
      {isOwner && applications.length > 0 && (
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Applications ({applications.length})</h2>
          <div className="space-y-3">
            {applications.map(app => (
              <div key={app.id as number} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Avatar firstName={app.first_name as string} lastName={app.last_name as string} src={app.profile_photo as string} size="md" />
                <div className="flex-1">
                  <Link href={`/profile/${app.user_id}`} className="font-medium text-gray-900 dark:text-white hover:underline">
                    {app.first_name as string} {app.last_name as string}
                  </Link>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{app.headline as string}</p>
                  {app.message ? <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{app.message as string}</p> : null}
                </div>
                <Badge variant={app.status === 'pending' ? 'accent' : app.status === 'accepted' ? 'secondary' : 'default'}>
                  {app.status as string}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Apply modal */}
      <Modal isOpen={showApply} onClose={() => setShowApply(false)} title="Apply to this Gig">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Send a message to the gig poster explaining why you are a good fit.
          </p>
          <Textarea
            placeholder="Tell them about your experience and why you'd be great for this gig..."
            rows={4}
            value={applyMessage}
            onChange={(e) => setApplyMessage(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowApply(false)}>Cancel</Button>
            <Button onClick={handleApply} loading={applying}>Submit Application</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
