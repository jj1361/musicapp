'use client';

import { useState } from 'react';
import Input from '@/components/ui/input';
import Textarea from '@/components/ui/textarea';
import Select from '@/components/ui/select';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import Card from '@/components/ui/card';

interface GigFormProps {
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  initial?: Record<string, unknown>;
}

export default function GigForm({ onSubmit, initial }: GigFormProps) {
  const [form, setForm] = useState({
    title: (initial?.title as string) || '',
    description: (initial?.description as string) || '',
    venue: (initial?.venue as string) || '',
    location: (initial?.location as string) || '',
    gigDate: (initial?.gig_date as string) || '',
    gigTime: (initial?.gig_time as string) || '',
    payMin: (initial?.pay_min as number) || 0,
    payMax: (initial?.pay_max as number) || 0,
    payType: (initial?.pay_type as string) || 'fixed',
    genre: (initial?.genre as string) || '',
  });
  const [skills, setSkills] = useState<string[]>(
    ((initial?.skills_needed as string) || '').split(',').filter(Boolean).map(s => s.trim())
  );
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const addSkill = () => {
    const val = skillInput.trim();
    if (val && !skills.includes(val)) {
      setSkills(prev => [...prev, val]);
      setSkillInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.title || !form.description || !form.location || !form.gigDate) {
      setError('Title, description, location, and date are required');
      return;
    }
    setLoading(true);
    try {
      await onSubmit({ ...form, skillsNeeded: skills.join(', ') });
    } catch {
      setError('Failed to save gig');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        {initial ? 'Edit Gig' : 'Post a New Gig'}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-danger/10 border border-danger/20 rounded-lg text-sm text-danger">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Gig Title *" name="title" placeholder="e.g. Wedding Band Guitarist Needed" value={form.title} onChange={handleChange} required />
        <Textarea label="Description *" name="description" rows={4} placeholder="Describe the gig, expectations, and what you're looking for..." value={form.description} onChange={handleChange} required />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input label="Venue" name="venue" placeholder="e.g. The Grand Ballroom" value={form.venue} onChange={handleChange} />
          <Input label="Location *" name="location" placeholder="e.g. Nashville, TN" value={form.location} onChange={handleChange} required />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input label="Date *" name="gigDate" type="date" value={form.gigDate} onChange={handleChange} required />
          <Input label="Time" name="gigTime" placeholder="e.g. 7:00 PM - 11:00 PM" value={form.gigTime} onChange={handleChange} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select label="Pay Type" name="payType" value={form.payType} onChange={handleChange}
            options={[
              { value: 'fixed', label: 'Fixed Rate' },
              { value: 'hourly', label: 'Hourly Rate' },
              { value: 'negotiable', label: 'Negotiable' },
              { value: 'unpaid', label: 'Unpaid / Volunteer' },
            ]}
          />
          <Input label="Min Pay ($)" name="payMin" type="number" value={form.payMin} onChange={handleChange} />
          <Input label="Max Pay ($)" name="payMax" type="number" value={form.payMax} onChange={handleChange} />
        </div>

        <Input label="Genre" name="genre" placeholder="e.g. Jazz, Rock, Pop" value={form.genre} onChange={handleChange} />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Skills Needed</label>
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

        <div className="flex justify-end gap-2 pt-2">
          <Button type="submit" loading={loading}>
            {initial ? 'Save Changes' : 'Post Gig'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
