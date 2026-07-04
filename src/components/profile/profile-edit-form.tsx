'use client';

import { useState, useRef } from 'react';
import Modal from '@/components/ui/modal';
import Input from '@/components/ui/input';
import Textarea from '@/components/ui/textarea';
import Select from '@/components/ui/select';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import Avatar from '@/components/ui/avatar';
import { UserProfile } from '@/types';

interface ProfileEditFormProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => Promise<void>;
}

export default function ProfileEditForm({ user, isOpen, onClose, onSave }: ProfileEditFormProps) {
  const [form, setForm] = useState({
    firstName: user.first_name,
    lastName: user.last_name,
    headline: user.headline,
    bio: user.bio,
    location: user.location,
    phone: user.phone,
    website: user.website,
    youtubeUrl: user.youtube_url,
    soundcloudUrl: user.soundcloud_url,
    spotifyUrl: user.spotify_url,
    instagramUrl: user.instagram_url,
    availability: user.availability,
  });
  const [skills, setSkills] = useState<string[]>(user.skills.map(s => s.name));
  const [genres, setGenres] = useState<string[]>(user.genres.map(g => g.name));
  const [skillInput, setSkillInput] = useState('');
  const [genreInput, setGenreInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string>(user.profile_photo || '');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      alert('Please select a JPEG, PNG, WebP, or GIF image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be under 5MB.');
      return;
    }

    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const addSkill = () => {
    const val = skillInput.trim();
    if (val && !skills.includes(val)) {
      setSkills(prev => [...prev, val]);
      setSkillInput('');
    }
  };

  const addGenre = () => {
    const val = genreInput.trim();
    if (val && !genres.includes(val)) {
      setGenres(prev => [...prev, val]);
      setGenreInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let profilePhoto: string | undefined;

      if (photoFile) {
        setUploadingPhoto(true);
        const formData = new FormData();
        formData.append('file', photoFile);
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
        const uploadData = await uploadRes.json();
        setUploadingPhoto(false);

        if (!uploadRes.ok) {
          alert(uploadData.error || 'Photo upload failed');
          setLoading(false);
          return;
        }
        profilePhoto = uploadData.url;
      }

      await onSave({ ...form, skills, genres, profilePhoto });
      onClose();
    } finally {
      setLoading(false);
      setUploadingPhoto(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Profile Photo */}
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative group"
          >
            <Avatar
              src={photoPreview}
              firstName={user.first_name}
              lastName={user.last_name}
              size="xl"
            />
            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            {uploadingPhoto && (
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handlePhotoSelect}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">Click to change photo</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input label="First Name" name="firstName" value={form.firstName} onChange={handleChange} />
          <Input label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} />
        </div>
        <Input label="Headline" name="headline" placeholder="e.g. Jazz Guitarist | Session Musician" value={form.headline} onChange={handleChange} />
        <Textarea label="Bio" name="bio" rows={3} value={form.bio} onChange={handleChange} />
        <Input label="Location" name="location" placeholder="e.g. Nashville, TN" value={form.location} onChange={handleChange} />
        <Select label="Availability" name="availability" value={form.availability} onChange={handleChange}
          options={[
            { value: 'available', label: 'Available for Gigs' },
            { value: 'busy', label: 'Currently Busy' },
            { value: 'not_looking', label: 'Not Looking' },
          ]}
        />

        {/* Skills */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Skills</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {skills.map(s => (
              <Badge key={s} variant="primary" removable onRemove={() => setSkills(prev => prev.filter(x => x !== s))}>
                {s}
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input placeholder="Add skill..." value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
            />
            <Button type="button" variant="ghost" onClick={addSkill}>Add</Button>
          </div>
        </div>

        {/* Genres */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Genres</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {genres.map(g => (
              <Badge key={g} variant="accent" removable onRemove={() => setGenres(prev => prev.filter(x => x !== g))}>
                {g}
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input placeholder="Add genre..." value={genreInput} onChange={(e) => setGenreInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addGenre(); } }}
            />
            <Button type="button" variant="ghost" onClick={addGenre}>Add</Button>
          </div>
        </div>

        <Input label="Website" name="website" type="url" value={form.website} onChange={handleChange} />
        <Input label="YouTube" name="youtubeUrl" type="url" value={form.youtubeUrl} onChange={handleChange} />
        <Input label="SoundCloud" name="soundcloudUrl" type="url" value={form.soundcloudUrl} onChange={handleChange} />
        <Input label="Spotify" name="spotifyUrl" type="url" value={form.spotifyUrl} onChange={handleChange} />
        <Input label="Instagram" name="instagramUrl" type="url" value={form.instagramUrl} onChange={handleChange} />
        <Input label="Phone" name="phone" value={form.phone} onChange={handleChange} />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>Save Changes</Button>
        </div>
      </form>
    </Modal>
  );
}
