'use client';

import { ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';
import { SWRConfig } from 'swr';
import { AuthProvider } from '@/context/auth-context';

const swrFetcher = (url: string) =>
  fetch(url).then(res => {
    if (!res.ok) throw new Error('Fetch error');
    return res.json();
  });

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SWRConfig value={{ fetcher: swrFetcher }}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthProvider>{children}</AuthProvider>
      </ThemeProvider>
    </SWRConfig>
  );
}
