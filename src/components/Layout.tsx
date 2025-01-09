import { Outlet, Link, useLocation } from 'react-router-dom';
import { Bot, Settings, MessageSquare, Clock, Music, LogOutIcon, Sun, Moon } from 'lucide-react';
import { cn } from '../lib/utils';
import { useState, useEffect } from 'react';

const Sidebar = () => {
  const location = useLocation();
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' 
      : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const isActive = (path: string) => location.pathname === path;
  const userInfo = JSON.parse(localStorage.getItem('user') || '{}');

  const links = [
    { to: '/dashboard', icon: Bot, label: 'Overview' },
    { to: '/settings', icon: Settings, label: 'Settings' },
    { to: '/commands', icon: MessageSquare, label: 'Commands', disabled: !userInfo.botSettings.zalcBotEnabled },
    { to: '/announcements', icon: Clock, label: 'Chat Announcements', disabled: !userInfo.botSettings.chatAlertsEnabled || !userInfo.botSettings.zalcBotEnabled },
    { to: '/spotify', icon: Music, label: 'Spotify' }, // Add disabled property
    { to: '/logout', icon: LogOutIcon, label: 'Logout'}
  ];

  return (
    <div className="w-64 bg-gray-900 dark:bg-gray-950 text-white h-screen fixed left-0 top-0 z-10">
      <div className="p-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <img src="/icon.png" alt="ZalcBot" className="w-8 h-8" />
            ZalcBot
          </h1>
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-lg hover:bg-gray-800"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
        <nav className="space-y-2">
          {links.map(({ to, icon: Icon, label, disabled }) => (
            <Link
              key={to}
              to={disabled ? '#' : to}
              onClick={disabled ? (e) => e.preventDefault() : undefined}
              className={cn(
                'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors',
                isActive(to)
                  ? 'bg-purple-600 text-white'
                  : 'hover:bg-gray-800 text-gray-300',
                disabled && 'cursor-not-allowed opacity-50'
              )}
              aria-disabled={disabled}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export function Layout() {
  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 flex-col">
      <Sidebar />
      <main className="ml-64 flex-1 p-8">
        <Outlet />
      </main>
      <footer className="bg-gray-800 text-white opacity-50 text-center p-4 mt-auto">
        <p>&copy; {new Date().getFullYear()} Zalc.Dev. All rights reserved.</p>
      </footer>
    </div>
  );
}