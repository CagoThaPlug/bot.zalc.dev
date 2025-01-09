import { useState, useEffect, useRef } from 'react';
import { DatabaseUser } from '../lib/auth';
import { Music, ToggleLeft, ToggleRight, Plus, Trash2, Copy, Undo, Save } from 'lucide-react';

interface SpotifyProps {
  user: DatabaseUser | null;
  setUser: (user: DatabaseUser | null) => void;
}

interface SpotifySettings {
  userId: string;
  connected: boolean;
  overlayUrl: string;
  accessToken?: string;
  refreshToken?: string;
  songRequestsEnabled: boolean;
  subscriberOnly: boolean;
  moderatorOnly: boolean;
  maxRequestsPerUser: number;
  blacklistedSongs: string[];
  blacklistedArtists: string[];
}

export default function Spotify({ user }: SpotifyProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<SpotifySettings>({
    userId: user?.id || '',
    connected: false,
    overlayUrl: '',
    songRequestsEnabled: false,
    subscriberOnly: false,
    moderatorOnly: false,
    maxRequestsPerUser: 5,
    blacklistedSongs: [],
    blacklistedArtists: []
  });
  const [newBlacklistedItem, setNewBlacklistedItem] = useState('');
  const [blacklistType, setBlacklistType] = useState<'song' | 'artist'>('song');
  const [pendingChanges, setPendingChanges] = useState<{ added: string[], deleted: string[] }>({ added: [], deleted: [] });
  const [showToaster, setShowToaster] = useState(false);

  const overlayUrlRef = useRef<HTMLInputElement>(null);

  const handleCopy = () => {
    if (overlayUrlRef.current) {
      overlayUrlRef.current.select();
      document.execCommand('copy');
    }
  };

  useEffect(() => {
    const fetchSpotifySettings = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://zalc.dev/spotify/settings?userId=${user?.twitchUser.id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setSettings(data);
      } catch (error) {
        console.error('Failed to fetch Spotify settings:', error);
        setError('Failed to load Spotify settings. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchSpotifySettings();
    }
  }, [user]);

  const connectSpotify = async () => {
    try {
      const response = await fetch(`http://zalc.dev/spotify/connect?userId=${user?.twitchUser.id}`, {
        method: 'POST'
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const authUrl = await response.text();
      window.open(authUrl, 'SpotifyAuth', 'width=500,height=600');

      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return; // Ensure the origin is correct
        const { code } = event.data;
        if (code) {
          fetchSpotifyToken(code);
          window.removeEventListener('message', handleMessage);
        }
      };

      window.addEventListener('message', handleMessage);
    } catch (error) {
      console.error('Failed to initiate Spotify connection:', error);
      setError('Failed to connect to Spotify. Please try again later.');
    }
  };

  const disconnectSpotify = async () => {
    try {
      const response = await fetch(`http://zalc.dev/spotify/disconnect?userId=${user?.twitchUser.id}`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setSettings(prev => ({ 
        ...prev, 
        connected: false,
        accessToken: '',
        refreshToken: ''
      }));
    } catch (error) {
      console.error('Failed to disconnect Spotify:', error);
      setError('Failed to disconnect from Spotify. Please try again later.');
    }
  };

  const updateSetting = async <K extends keyof SpotifySettings>(key: K, value: SpotifySettings[K]) => {
    try {
      const updatedSettings: SpotifySettings = {
        ...settings,
        [key]: value
      };
  
      const response = await fetch(`http://zalc.dev/spotify/settings/update?userId=${user?.twitchUser.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSettings),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const updatedSettingsResponse = await response.json();
      setSettings(updatedSettingsResponse);
    } catch (error) {
      console.error('Failed to update setting:', error);
      setError(`Failed to update ${key}. Please try again later.`);
    }
  };

  const addToPendingChanges = (item: string, action: 'add' | 'delete') => {
    setPendingChanges(prev => ({
      added: action === 'add' ? [...prev.added, item] : prev.added,
      deleted: action === 'delete' ? [...prev.deleted, item] : prev.deleted
    }));
    setShowToaster(true);
  };

  const saveChanges = async () => {
    const key = blacklistType === 'song' ? 'blacklistedSongs' : 'blacklistedArtists';
    const updatedList = [
      ...settings[key].filter(item => !pendingChanges.deleted.includes(item)),
      ...pendingChanges.added
    ];
    await updateSetting(key, updatedList);
    setPendingChanges({ added: [], deleted: [] });
    setShowToaster(false);
  };

  const discardChanges = () => {
    setPendingChanges({ added: [], deleted: [] });
    setShowToaster(false);
  };

  const fetchSpotifyToken = async (code: string) => {
    try {
      const userString = localStorage.getItem('user');
      const user: DatabaseUser | null = userString ? JSON.parse(userString) : null;
      const response = await fetch(`http://zalc.dev/spotify/token?code=${code}&userId=${user?.twitchUser?.id}`, {
        method: 'POST',
      });

      if (response.ok) {
        setSettings(prev => ({ ...prev, connected: true }));
      } else {
        throw new Error('Failed to post Spotify token');
      }
    } catch (error) {
      console.error('Error during Spotify authentication:', error);
      setError('Failed to authenticate with Spotify. Please try again later.');
    }
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [error]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold dark:text-white">Spotify Integration</h2>
        </div>
        {settings.connected ? (
          <button
            onClick={disconnectSpotify}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
          >
            <Music className="w-5 h-5" />
            Disconnect Spotify
          </button>
        ) : (
          <button
            onClick={connectSpotify}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Music className="w-5 h-5" />
            Connect Spotify
          </button>
        )}
      </div>

      {settings.connected && (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 space-y-6">
            <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex-1">
                <h3 className="font-medium dark:text-white mb-1">Overlay URL</h3>
                <input
                  type="text"
                  value={settings.overlayUrl}
                  readOnly
                  ref={overlayUrlRef}
                  className="w-full text-sm text-gray-600 dark:text-gray-300 bg-transparent border-none"
                />
              </div>
              <button 
                onClick={handleCopy}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 border-b dark:border-gray-700 pb-2">
                <h3 className="text-lg font-bold dark:text-white">Request Settings</h3>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium dark:text-white">Enable Song Requests</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Allow viewers to request songs</p>
                </div>
                <button
                  onClick={() => updateSetting('songRequestsEnabled', !settings.songRequestsEnabled)}
                  className={`p-2 rounded-lg transition-colors ${
                    settings.songRequestsEnabled
                      ? 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900'
                      : 'text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {settings.songRequestsEnabled ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                </button>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium dark:text-white">Subscribers Only</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Limit to subscribers</p>
                </div>
                <button
                  onClick={() => updateSetting('subscriberOnly', !settings.subscriberOnly)}
                  className={`p-2 rounded-lg transition-colors ${
                    settings.subscriberOnly
                      ? 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900'
                      : 'text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {settings.subscriberOnly ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                </button>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium dark:text-white">Moderators Only</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Limit to moderators</p>
                </div>
                <button
                  onClick={() => updateSetting('moderatorOnly', !settings.moderatorOnly)}
                  className={`p-2 rounded-lg transition-colors ${
                    settings.moderatorOnly
                      ? 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900'
                      : 'text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {settings.moderatorOnly ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                </button>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium dark:text-white">Max Requests Per User</p>
                  <input
                    type="number"
                    value={settings.maxRequestsPerUser}
                    onChange={(e) => updateSetting('maxRequestsPerUser', parseInt(e.target.value))}
                    className="mt-1 w-20 px-3 py-1 border rounded-lg dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                    min="1"
                    max="10"
                  />
                </div>
              </div>
            </div>

            <div className="border-t dark:border-gray-700 pt-6">
              <h3 className="text-lg font-bold mb-4 dark:text-white">Blacklist</h3>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <select
                    value={blacklistType}
                    onChange={(e) => setBlacklistType(e.target.value as 'song' | 'artist')}
                    className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <option value="song">Song</option>
                    <option value="artist">Artist</option>
                  </select>
                  <input
                    value={newBlacklistedItem}
                    onChange={(e) => setNewBlacklistedItem(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder={`Enter ${blacklistType} name...`}
                  />
                  <button
                    onClick={() => addToPendingChanges(newBlacklistedItem, 'add')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium dark:text-white mb-2">Blacklisted Songs</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                      {[...settings.blacklistedSongs, ...pendingChanges.added.filter(() => blacklistType === 'song')].map(song => (
                        <div key={song} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
                          <span className="dark:text-white truncate pr-2">{song}</span>
                          <button
                            onClick={() => addToPendingChanges(song, 'delete')}
                            className="text-red-600 hover:bg-red-100 dark:hover:bg-red-900 p-1 rounded flex-shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium dark:text-white mb-2">Blacklisted Artists</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                      {[...settings.blacklistedArtists, ...pendingChanges.added.filter(() => blacklistType === 'artist')].map(artist => (
                        <div key={artist} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
                          <span className="dark:text-white truncate pr-2">{artist}</span>
                          <button
                            onClick={() => addToPendingChanges(artist, 'delete')}
                            className="text-red-600 hover:bg-red-100 dark:hover:bg-red-900 p-1 rounded flex-shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {showToaster && (
        <div className="fixed bottom-20 right-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-blue-600 dark:text-blue-400 flex gap-2">
          <button 
            onClick={discardChanges}
            className="bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <Undo className="w-5 h-5" />
            Discard Changes
          </button>
          <button 
            onClick={saveChanges}
            className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            Save Changes
          </button>
        </div>
      )}

      {error && (
        <div className="fixed bottom-20 right-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-600 dark:text-red-400 fade-out">
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}