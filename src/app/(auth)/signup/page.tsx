'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import Card from '@/components/ui/card';
import Input from '@/components/ui/input';
import Select from '@/components/ui/select';
import Button from '@/components/ui/button';

export default function SignupPage() {
  const router = useRouter();
  const { mutate } = useAuth();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    accountType: 'musician',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Signup failed');
        return;
      }

      mutate();
      router.push('/feed');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">Join GigBoard</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Create your professional music profile</p>

      {error && (
        <div className="mb-4 p-3 bg-danger/10 border border-danger/20 rounded-lg text-sm text-danger">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input label="First Name" name="firstName" placeholder="John" value={form.firstName} onChange={handleChange} required />
          <Input label="Last Name" name="lastName" placeholder="Doe" value={form.lastName} onChange={handleChange} required />
        </div>
        <Input label="Email" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
        <Input label="Password" name="password" type="password" placeholder="Min 6 characters" value={form.password} onChange={handleChange} required />
        <Input label="Confirm Password" name="confirmPassword" type="password" placeholder="Confirm your password" value={form.confirmPassword} onChange={handleChange} required />
        <Select
          label="I am a..."
          name="accountType"
          value={form.accountType}
          onChange={handleChange}
          options={[
            { value: 'musician', label: 'Musician / Performer' },
            { value: 'band', label: 'Band' },
            { value: 'venue', label: 'Venue Owner' },
            { value: 'organizer', label: 'Event Organizer' },
          ]}
        />
        <Button type="submit" loading={loading} className="w-full">
          Create Account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Already on GigBoard?{' '}
        <Link href="/login" className="text-primary hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </Card>
  );
}
