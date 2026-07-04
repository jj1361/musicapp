import Card from '@/components/ui/card';
import { Experience } from '@/types';

interface ProfileExperienceProps {
  experiences: Experience[];
}

export default function ProfileExperience({ experiences }: ProfileExperienceProps) {
  if (!experiences.length) return null;

  return (
    <Card>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Experience</h2>
      <div className="space-y-4">
        {experiences.map((exp, i) => (
          <div key={exp.id} className={`${i > 0 ? 'border-t dark:border-gray-700 pt-4' : ''}`}>
            <h3 className="font-medium text-gray-900 dark:text-white">{exp.title}</h3>
            {exp.organization && (
              <p className="text-sm text-gray-600 dark:text-gray-400">{exp.organization}</p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {new Date(exp.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              {' - '}
              {exp.end_date ? new Date(exp.end_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present'}
              {exp.location && ` | ${exp.location}`}
            </p>
            {exp.description && (
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{exp.description}</p>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
