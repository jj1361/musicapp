'use client';

import { useTheme } from 'next-themes';
import Card from '@/components/ui/card';
import Button from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>

      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Account</h2>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between py-2 border-b dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">Email</span>
            <span className="text-gray-900 dark:text-white">{user?.email}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">Account Type</span>
            <span className="text-gray-900 dark:text-white capitalize">{user?.account_type}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-600 dark:text-gray-400">Member Since</span>
            <span className="text-gray-900 dark:text-white">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : ''}
            </span>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Appearance</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Dark Mode</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Toggle between light and dark themes</p>
          </div>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              theme === 'dark' ? 'bg-primary' : 'bg-gray-300'
            }`}
          >
            <span
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                theme === 'dark' ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Account Actions</h2>
        <Button variant="danger" onClick={logout}>Sign Out</Button>
      </Card>
    </div>
  );
}
