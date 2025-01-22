import React, { useState, useEffect } from 'react';
import { DatabaseUser } from '../lib/auth';
import { ToggleLeft, ToggleRight, Save, Undo, Eye, EyeOff } from 'lucide-react';

interface SettingsProps {
  user: DatabaseUser | null;
  setUser: (user: DatabaseUser | null) => void;
}

interface SettingOption {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

const Settings: React.FC<SettingsProps> = ({ user, setUser }) => {
  const [settings, setSettings] = useState<SettingOption[]>([
    {
      id: 'zalcBotEnabled',
      label: 'ZalcBot',
      description: 'Enable bot functionality in your chat',
      enabled: user?.botSettings.zalcBotEnabled || false
    },
    {
      id: 'autoMod',
      label: 'Auto Moderation',
      description: 'Automatically moderate common spam and inappropriate content',
      enabled: user?.botSettings.autoModEnabled || false 
    },
    {
      id: 'chatAlerts',
      label: 'Chat Announcements',
      description: 'Show announcements or reminders in chat that you set',
      enabled: user?.botSettings.chatAlertsEnabled || false
    }
  ]);
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [isEmailVisible, setIsEmailVisible] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setSettings(prev => prev.map(setting => 
        setting.id === 'zalcBotEnabled' 
          ? { ...setting, enabled: user.botSettings.zalcBotEnabled }
          : setting
      ));
    }
  }, [user]);

  const handleToggle = async (id: string) => {
    if (id === 'autoMod' && !user?.channelMod) {
      setNotification('You need to mod the bot in your channel to enable Auto Moderation.');
      return;
    }

    const updatedSettings = settings.map(setting =>
      setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
    );

    setSettings(updatedSettings);
    setHasChanges(true);

    if (id === 'zalcBotEnabled' && !updatedSettings.find(s => s.id === 'zalcBotEnabled')?.enabled) {
      try {
        const response = await fetch(`https://zalc.dev/twitch/leaveroom?userName=${user?.twitchUser.display_name}`, {
          method: 'POST',
        });
        if (!response.ok) {
          console.error('Failed to leave chat room');
        }
      } catch (error) {
        console.error('Error leaving chat room:', error);
      }
    }
  };

  const handleSave = async () => {
    if (!user) return;

    const updatedSettings = {
      zalcBotEnabled: settings.find(s => s.id === 'zalcBotEnabled')?.enabled || false,
      autoModEnabled: settings.find(s => s.id === 'autoMod')?.enabled || false,
      chatAlertsEnabled: settings.find(s => s.id === 'chatAlerts')?.enabled || false,
    };

    try {
      const response = await fetch(`https://zalc.dev/botSettings/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...user.botSettings, ...updatedSettings }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setHasChanges(false);
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const handleDiscard = () => {
    if (user) {
      setSettings(prev => prev.map(setting => {
        switch (setting.id) {
          case 'zalcBotEnabled':
            return { ...setting, enabled: user.botSettings.zalcBotEnabled };
          case 'autoMod':
            return { ...setting, enabled: user.botSettings.autoModEnabled };
          case 'chatAlerts':
            return { ...setting, enabled: user.botSettings.chatAlertsEnabled };
          default:
            return setting;
        }
      }));
      setHasChanges(false);
    }
  };

  const renderSettingToggle = (setting: SettingOption) => (
    <div key={setting.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <div className="flex-1">
        <h3 className="font-medium dark:text-white">{setting.label}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">{setting.description}</p>
      </div>
      <button
        onClick={() => handleToggle(setting.id)}
        className={`p-1 rounded-lg transition-colors ${setting.enabled ? 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900' : 'text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
      >
        {setting.enabled ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
      </button>
    </div>
  );

  const renderUserInfo = () => {
    if (!user) return null;

    const { display_name, email, id, description, profile_image_url, broadcaster_type, created_at } = user.twitchUser;
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UserInfoField label="Username" value={display_name} />
        <UserInfoField label="Email" value={isEmailVisible ? email : '***'} onToggleVisibility={() => setIsEmailVisible(!isEmailVisible)} isEmailVisible={isEmailVisible} />
        <UserInfoField label="Id" value={id} />
        <UserInfoField label="Description" value={description} />
        <UserInfoField label="Profile Image" value={<img src={profile_image_url} alt="Profile" className="w-10 h-10 rounded-full" />} />
        <UserInfoField label="Broadcaster Type" value={broadcaster_type} />
        <UserInfoField label="Created At" value={new Date(created_at).toLocaleDateString()} />
        <UserInfoField label="Last Login" value={new Date(user.lastLogin).toLocaleDateString()} />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 dark:text-white">Bot Settings</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {settings.map(renderSettingToggle)}
        </div>
      </div>

      {/* Notification Toast with Save and Discard Buttons */}
      {hasChanges && (
        <div className="fixed bottom-20 right-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-blue-600 dark:text-blue-400 flex gap-2">
          <button 
            onClick={handleDiscard}
            className="bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <Undo className="w-5 h-5" />
            Discard Changes
          </button>
          <button 
            onClick={handleSave}
            className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            Save Changes
          </button>
        </div>
      )}

      {/* Notification Toast for Mod Requirement */}
      {notification && (
        <div className="fixed bottom-20 right-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-600 dark:text-red-400">
          <p>{notification}</p>
          <button 
            onClick={() => setNotification(null)}
            className="mt-2 text-sm underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md mt-6">
        <h2 className="text-2xl font-bold mb-2 dark:text-white">User Information</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">This information is collected from your Twitch account.</p>
        {user && renderUserInfo()}
      </div>
    </div>
  );
};

const UserInfoField = ({ label, value, onToggleVisibility, isEmailVisible }: { label: string; value: any; onToggleVisibility?: () => void; isEmailVisible?: boolean }) => (
  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
    <span className="font-medium dark:text-white">{label}:</span>
    <div className="flex items-center gap-2">
      {typeof value === 'string' ? <span className="text-gray-600 dark:text-gray-300">{value}</span> : value}
      {onToggleVisibility && (
        <button onClick={onToggleVisibility} className="text-gray-400 hover:text-gray-500">
          {isEmailVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      )}
    </div>
  </div>
);

export default Settings;