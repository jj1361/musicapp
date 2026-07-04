'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProfileHeader from '@/components/profile/profile-header';
import ProfileAbout from '@/components/profile/profile-about';
import ProfileSkills from '@/components/profile/profile-skills';
import ProfileExperience from '@/components/profile/profile-experience';
import { PostSkeleton } from '@/components/ui/skeleton';
import { UserProfile } from '@/types';
import { useAuth } from '@/context/auth-context';

export default function UserProfilePage({ params }: { params: { id: string } }) {
  const { user: authUser } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect to own profile page if viewing own profile
    if (authUser && authUser.id === parseInt(params.id)) {
      router.replace('/profile');
      return;
    }

    fetch(`/api/users/${params.id}`)
      .then(r => r.json())
      .then(d => setProfile(d.user))
      .finally(() => setLoading(false));
  }, [params.id, authUser]);

  const handleConnect = async () => {
    if (!profile) return;
    await fetch('/api/connections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipientId: profile.id }),
    });
    const res = await fetch(`/api/users/${params.id}`);
    const data = await res.json();
    setProfile(data.user);
  };

  const handleMessage = () => {
    router.push(`/messages/new?userId=${params.id}`);
  };

  if (loading) {
    return <div className="space-y-4"><PostSkeleton /><PostSkeleton /></div>;
  }

  if (!profile) {
    return <p className="text-center py-8 text-gray-500">User not found</p>;
  }

  return (
    <div className="space-y-4">
      <ProfileHeader user={profile} isOwner={false} onConnect={handleConnect} onMessage={handleMessage} />
      <ProfileAbout
        bio={profile.bio}
        website={profile.website}
        youtubeUrl={profile.youtube_url}
        soundcloudUrl={profile.soundcloud_url}
        spotifyUrl={profile.spotify_url}
        instagramUrl={profile.instagram_url}
      />
      <ProfileSkills skills={profile.skills} genres={profile.genres} />
      <ProfileExperience experiences={profile.experiences} />
    </div>
  );
}
