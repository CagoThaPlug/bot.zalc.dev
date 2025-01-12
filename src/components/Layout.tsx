import { Outlet, Link, useLocation } from 'react-router-dom';
import { Bot, Settings, MessageSquare, Clock, Music, LogOutIcon, Sun, Moon, Menu, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { useState, useEffect } from 'react';

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
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
    { to: '/commands', icon: MessageSquare, label: 'Commands', disabled: !userInfo.botSettings?.zalcBotEnabled },
    { to: '/announcements', icon: Clock, label: 'Chat Announcements', disabled: !userInfo.botSettings?.chatAlertsEnabled || !userInfo.botSettings?.zalcBotEnabled },
    { to: '/spotify', icon: Music, label: 'Spotify' },
    { to: '/logout', icon: LogOutIcon, label: 'Logout'}
  ];

  return (
    <div className={cn(
      "fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 dark:bg-gray-950 text-white transform transition-transform duration-300 ease-in-out",
      "lg:translate-x-0",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="p-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <img src="https://zalc.dev/images/icon.png" alt="ZalcBot" className="w-8 h-8" />
            ZalcBot
          </h1>
          <div className="flex gap-2">
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-lg hover:bg-gray-800"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <nav className="space-y-2">
          {links.map(({ to, icon: Icon, label, disabled }) => (
            <Link
              key={to}
              to={disabled ? '#' : to}
              onClick={(e) => {
                if (disabled) {
                  e.preventDefault();
                } else {
                  onClose();
                }
              }}
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="lg:hidden bg-gray-900 dark:bg-gray-950 p-4">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="text-white p-2 hover:bg-gray-800 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>
        
        <main className="flex-1 p-4 lg:p-8 lg:ml-64">
          <Outlet />
        </main>
        
        <footer className="bg-gray-800 text-white opacity-50 text-center p-4 mt-auto lg:ml-64">
          <p>&copy; {new Date().getFullYear()} Zalc.Dev. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}