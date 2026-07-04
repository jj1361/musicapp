import Card from '@/components/ui/card';
import Badge from '@/components/ui/badge';
import { Skill, Genre } from '@/types';

interface ProfileSkillsProps {
  skills: Skill[];
  genres: Genre[];
}

export default function ProfileSkills({ skills, genres }: ProfileSkillsProps) {
  if (!skills.length && !genres.length) return null;

  return (
    <Card>
      {skills.length > 0 && (
        <>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Skills</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {skills.map(s => (
              <Badge key={s.id} variant="primary">{s.name}</Badge>
            ))}
          </div>
        </>
      )}
      {genres.length > 0 && (
        <>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Genres</h2>
          <div className="flex flex-wrap gap-2">
            {genres.map(g => (
              <Badge key={g.id} variant="accent">{g.name}</Badge>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
