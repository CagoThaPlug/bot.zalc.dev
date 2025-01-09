import React, { useState, useEffect } from 'react';
import { Search, Terminal, User, Home, RefreshCw } from 'lucide-react';
import { cn } from '../lib/utils';

interface CommandDTO {
  name: string;
  response: string;
  type: string;
}

export default function GlobalCommands() {
  useEffect(() => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }, []);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commands, setCommands] = useState<CommandDTO[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<'command' | 'user'>('command');

  const fetchCommands = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let endpoint = '';
      if (searchType === 'command') {
        endpoint = searchTerm 
          ? `http://localhost:8080/commands/global?search=${encodeURIComponent(searchTerm)}`
          : 'http://localhost:8080/commands/global';
      } else {
        if (!searchTerm) return; // Don't fetch if no username provided
        endpoint = `http://localhost:8080/commands/user/${encodeURIComponent(searchTerm)}`;
      }
      
      const response = await fetch(endpoint);
      if (response.status === 404) {
        setError('User not found');
        setCommands([]);
        setIsLoading(false);
        return;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setCommands(data);
    } catch (error) {
      console.error('Failed to fetch commands:', error);
      setError('Failed to load commands. Please try again later.');
      setCommands([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (searchType === 'command' || (searchType === 'user' && searchTerm)) {
      const debounceTimer = setTimeout(() => {
        fetchCommands();
      }, 300); // Add debounce to prevent too many requests

      return () => clearTimeout(debounceTimer);
    }
  }, [searchTerm, searchType]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCommands();
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Terminal className="w-8 h-8 text-purple-500" />
          <div>
            <h1 className="text-3xl font-bold">Commands</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {searchType === 'command' ? 'Global Command List' : 'User Command Search'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchCommands}
            className={cn(
              'p-2 rounded-lg hover:bg-gray-800 transition-colors',
              isLoading ? 'animate-spin' : ''
            )}
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          <button
            onClick={() => window.location.href = '/login'}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Home className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSearchType('command');
                setSearchTerm('');
              }}
              className={cn(
                'px-4 py-2 rounded-lg transition-colors flex items-center gap-2',
                searchType === 'command'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              )}
            >
              <Terminal className="w-4 h-4" />
              <span>Commands</span>
            </button>
            <button
              onClick={() => {
                setSearchType('user');
                setSearchTerm('');
                setCommands([]); // Clear commands when switching to user mode
              }}
              className={cn(
                'px-4 py-2 rounded-lg transition-colors flex items-center gap-2',
                searchType === 'user'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              )}
            >
              <User className="w-4 h-4" />
              <span>Users</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSearch} className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchType === 'command' ? "Search commands..." : "Enter username..."}
              className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </form>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-600 dark:text-red-400 mb-6">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 text-sm underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Commands Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : commands.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {commands.map((command) => (
              <div 
                key={command.name} 
                className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex flex-col gap-2">
                  <span className="font-mono text-purple-600 dark:text-purple-400 font-medium">
                    {command.name}
                  </span>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                    {command.response}
                  </p>
                  <span className={cn(
                    'px-2 py-0.5 text-xs font-medium rounded-full self-start',
                    command.type === 'Mod' 
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' 
                      : command.type === 'Editor' 
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' 
                      : command.type === 'Developer' 
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' 
                      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                  )}>
                    {command.type || 'General'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : !error && !isLoading && searchType === 'user' && (
          <div className="flex justify-center items-center min-h-[200px] text-gray-500 dark:text-gray-400">
            Enter a username to search for their commands
          </div>
        )}
      </div>
    </div>
  );
}