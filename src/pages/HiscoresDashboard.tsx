import React, { useState, useEffect } from 'react';
import { Trophy, RefreshCw, ArrowUp, Users, Clock, Star, Activity, Home } from 'lucide-react';
import { cn } from '../lib/utils';

interface Channel {
  [key: string]: {
    total: number;
  };
}

interface RecentActivity {
  user: string;
  channel: string;
  timeTaken: string; // ISO string from Instant
}

type TimeFilter = 'total' | 'day' | 'week' | 'month';

interface Stat {
  label: string;
  value: number;
  icon: React.ComponentType<any>;
  color: string;
}

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
};

const HiscoresDashboard = () => {
  useEffect(() => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }, []);

  const [channels, setChannels] = useState<Channel>({});
  const [currentFilter, setCurrentFilter] = useState<TimeFilter>('total');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<Stat[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

  const fetchData = async (filter: TimeFilter) => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://zalc.dev/dabData?filter=${encodeURIComponent(filter)}`);
      const data = await response.json();
      setChannels(data.channels);
      
      const sortedData = Object.entries(data.channels)
        .sort(([, a], [, b]) => (b as any).total - (a as any).total);
      
      setStats([
        { 
          label: 'Total Entries', 
          value: Object.keys(data.channels).length,
          icon: Users,
          color: 'bg-blue-500'
        },
        { 
          label: 'Top Score', 
          value: sortedData[0] ? (sortedData[0][1] as any).total : 0,
          icon: Star,
          color: 'bg-yellow-500'
        },
        { 
          label: 'Recent Updates', 
          value: 24,
          icon: Clock,
          color: 'bg-green-500'
        },
        { 
          label: 'Growth Rate', 
          value: 12,
          icon: ArrowUp,
          color: 'bg-purple-500'
        },
      ]);

      // Fetch recent activity data
      const activityResponse = await fetch('http://zalc.dev/dabs/recentactivity');
      const activityData = await activityResponse.json();
      
      // Convert array of activities to our expected format
      const formattedActivity = activityData.map((activity: RecentActivity) => ({
        user: activity.user,
        channel: activity.channel,
        timeTaken: activity.timeTaken // Already in ISO format from Instant
      }));
      setRecentActivity(formattedActivity);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentFilter);
  }, [currentFilter]);

  const filterData = (channelsData: Channel) => {
    const filteredData: { [key: string]: number } = {};
    Object.keys(channelsData).forEach(channel => {
      const channelData = channelsData[channel];
      filteredData[channel] = channelData['total'] || 0;
    });
    return filteredData;
  };

  const openDabCounter = (channelName: string) => {
    const url = `https://zalc.dev/dabs/counter?channelName=${encodeURIComponent(channelName)}&timeframe=${encodeURIComponent(currentFilter)}`;
    window.open(url, '_blank');
  };

  const sortedChannels = Object.entries(filterData(channels))
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10); // Only show top 10

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-500" />
          <div>
            <h1 className="text-3xl font-bold">Dab Highscores</h1>
            <p className="text-gray-600 dark:text-gray-400">Leaderboard Rankings</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchData(currentFilter)}
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={cn('p-3 rounded-lg', color)}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">{value}</span>
            </div>
            <h3 className="text-gray-600 dark:text-gray-300">{label}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Highscores Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Top 10 Highscores</h2>
            <div className="flex items-center gap-2">
              {(['total', 'day', 'week', 'month'] as TimeFilter[]).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setCurrentFilter(filter)}
                  className={cn(
                    'px-3 py-1 text-sm rounded-lg transition-colors',
                    currentFilter === filter
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  )}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {sortedChannels.map(([channel, count], index) => (
              <div
                key={channel}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-400 w-6">
                    #{index + 1}
                  </span>
                  <button
                    onClick={() => openDabCounter(channel)}
                    className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors font-medium"
                  >
                    {channel}
                  </button>
                </div>
                <span className="text-sm font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="w-6 h-6 text-purple-500" />
            <h2 className="text-xl font-bold">Recent Activity</h2>
          </div>

          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50"
              >
                <div className="flex flex-col">
                  <span className="font-medium text-purple-600 dark:text-purple-400">
                    {activity.user}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    in {activity.channel}
                  </span>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {formatTimestamp(activity.timeTaken)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HiscoresDashboard;