'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import ProfileHeader from '@/components/profile/profile-header';
import ProfileAbout from '@/components/profile/profile-about';
import ProfileSkills from '@/components/profile/profile-skills';
import ProfileExperience from '@/components/profile/profile-experience';
import ProfileEditForm from '@/components/profile/profile-edit-form';
import { PostSkeleton } from '@/components/ui/skeleton';
import { UserProfile } from '@/types';

export default function MyProfilePage() {
  const { user: authUser, mutate: mutateAuth } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const fetchProfile = async () => {
    if (!authUser) return;
    try {
      const res = await fetch(`/api/users/${authUser.id}`);
      const data = await res.json();
      setProfile(data.user);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authUser) fetchProfile();
  }, [authUser]);

  const handleSave = async (data: Record<string, unknown>) => {
    if (!authUser) return;
    await fetch(`/api/users/${authUser.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    await fetchProfile();
    mutateAuth();
  };

  if (loading) {
    return <div className="space-y-4"><PostSkeleton /><PostSkeleton /></div>;
  }

  if (!profile) return null;

  return (
    <div className="space-y-4">
      <ProfileHeader user={profile} isOwner onEdit={() => setEditing(true)} />
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

      {editing && (
        <ProfileEditForm
          user={profile}
          isOpen={editing}
          onClose={() => setEditing(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
