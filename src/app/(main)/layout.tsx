'use client';

import TopNav from '@/components/layout/top-nav';
import SidebarLeft from '@/components/layout/sidebar-left';
import SidebarRight from '@/components/layout/sidebar-right';
import MobileNav from '@/components/layout/mobile-nav';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopNav />
      <div className="pt-14 pb-16 md:pb-0">
        <div className="max-w-6xl mx-auto px-4 py-4 grid grid-cols-1 md:grid-cols-[220px_1fr] lg:grid-cols-[220px_1fr_280px] gap-4">
          <aside className="hidden md:block">
            <SidebarLeft />
          </aside>
          <main className="min-w-0">{children}</main>
          <aside className="hidden lg:block">
            <SidebarRight />
          </aside>
        </div>
      </div>
      <MobileNav />
    </>
  );
}
