import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-page-dark">
      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
          </div>
          <span className="text-2xl font-bold text-primary">GigBoard</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary">
            Sign In
          </Link>
          <Link href="/signup" className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-full transition-colors">
            Join Now
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 pt-16 pb-24 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
              Where Music Meets
              <span className="text-primary"> Opportunity</span>
            </h1>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
              The professional network for musicians, singers, dancers, and entertainment professionals.
              Find gigs, build your profile, and connect with talent.
            </p>
            <div className="mt-8 flex gap-3">
              <Link href="/signup" className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-full transition-colors text-lg">
                Get Started Free
              </Link>
              <Link href="/login" className="px-6 py-3 border border-primary text-primary hover:bg-primary hover:text-white font-medium rounded-full transition-colors text-lg">
                Sign In
              </Link>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="bg-gradient-to-br from-primary/20 to-secondary/20 dark:from-primary/10 dark:to-secondary/10 rounded-2xl p-8">
              <div className="space-y-4">
                {/* Mock card previews */}
                <div className="bg-white dark:bg-card-dark rounded-lg p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">JD</div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">Jazz Guitarist Needed</p>
                      <p className="text-xs text-gray-500">Nashville, TN - $300/night</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-card-dark rounded-lg p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-white font-bold text-sm">SM</div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">Singer for Wedding Band</p>
                      <p className="text-xs text-gray-500">Austin, TX - $250/event</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-card-dark rounded-lg p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-white font-bold text-sm">DJ</div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">DJ for Corporate Event</p>
                      <p className="text-xs text-gray-500">Miami, FL - $500/night</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 dark:bg-gray-900 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Everything You Need to Build Your Music Career
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Find Gigs</h3>
              <p className="text-gray-600 dark:text-gray-400">Browse and apply to gig postings from venues, event organizers, and bands looking for talent.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Build Your Profile</h3>
              <p className="text-gray-600 dark:text-gray-400">Showcase your skills, experience, and media to attract opportunities and stand out.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Grow Your Network</h3>
              <p className="text-gray-600 dark:text-gray-400">Connect with fellow musicians, share updates, and message collaborators directly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Find Your Next Gig?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Join thousands of musicians and entertainment professionals already on GigBoard.
          </p>
          <Link href="/signup" className="inline-block px-8 py-4 bg-primary hover:bg-primary-dark text-white text-lg font-medium rounded-full transition-colors">
            Create Your Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t dark:border-gray-700 py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">GigBoard</span>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500">Built for the music community</p>
        </div>
      </footer>
    </div>
  );
}
