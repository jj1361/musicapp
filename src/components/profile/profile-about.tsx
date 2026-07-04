import Card from '@/components/ui/card';

interface ProfileAboutProps {
  bio: string;
  website?: string;
  youtubeUrl?: string;
  soundcloudUrl?: string;
  spotifyUrl?: string;
  instagramUrl?: string;
}

export default function ProfileAbout({ bio, website, youtubeUrl, soundcloudUrl, spotifyUrl, instagramUrl }: ProfileAboutProps) {
  const hasLinks = website || youtubeUrl || soundcloudUrl || spotifyUrl || instagramUrl;

  if (!bio && !hasLinks) return null;

  return (
    <Card>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">About</h2>
      {bio && <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">{bio}</p>}
      {hasLinks && (
        <div className="mt-3 flex flex-wrap gap-3">
          {website && (
            <a href={website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.172 13.828a4 4 0 015.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101" /></svg>
              Website
            </a>
          )}
          {youtubeUrl && (
            <a href={youtubeUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-red-600 hover:underline">YouTube</a>
          )}
          {soundcloudUrl && (
            <a href={soundcloudUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-orange-500 hover:underline">SoundCloud</a>
          )}
          {spotifyUrl && (
            <a href={spotifyUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-green-500 hover:underline">Spotify</a>
          )}
          {instagramUrl && (
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-pink-500 hover:underline">Instagram</a>
          )}
        </div>
      )}
    </Card>
  );
}
