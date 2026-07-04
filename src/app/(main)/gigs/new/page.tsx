'use client';

import { useRouter } from 'next/navigation';
import GigForm from '@/components/gigs/gig-form';

export default function NewGigPage() {
  const router = useRouter();

  const handleSubmit = async (data: Record<string, unknown>) => {
    const res = await fetch('/api/gigs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const { gig } = await res.json();
      router.push(`/gigs/${gig.id}`);
    }
  };

  return <GigForm onSubmit={handleSubmit} />;
}
