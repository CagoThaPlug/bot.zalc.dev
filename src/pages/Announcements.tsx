import React, { useState, useEffect } from 'react';
import { DatabaseUser, chatReminder } from '../lib/auth';
import { Plus, Trash2, Clock, MessageSquare, ToggleLeft, ToggleRight, Save, Undo, Edit2 } from 'lucide-react';

interface AnnouncementProps {
  user: DatabaseUser | null;
  setUser: (user: DatabaseUser | null) => void;
}

export default function Announcements({ user, setUser }: AnnouncementProps) {
  const [announcements, setAnnouncements] = useState<chatReminder[]>([]);
  const [originalAnnouncements, setOriginalAnnouncements] = useState<chatReminder[]>([]);
  const [newAnnouncement, setNewAnnouncement] = useState<chatReminder>({
    reminder: '',
    interval: 30,
    intervalType: 'time',
    enabled: true
  });
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (user?.botSettings?.chatReminders) {
      setAnnouncements(user.botSettings.chatReminders);
      setOriginalAnnouncements(user.botSettings.chatReminders);
    }
  }, [user]);

  useEffect(() => {
    setHasChanges(JSON.stringify(announcements) !== JSON.stringify(originalAnnouncements));
  }, [announcements, originalAnnouncements]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const updatedAnnouncements = [...announcements, newAnnouncement];

    try {
      const response = await fetch(`http://localhost:8080/botSettings/${user.id}/chatReminders`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedAnnouncements),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setAnnouncements(updatedUser.botSettings.chatReminders);
        setOriginalAnnouncements(updatedUser.botSettings.chatReminders);
        setIsAdding(false);
        setNewAnnouncement({
          reminder: '',
          interval: 30,
          intervalType: 'time',
          enabled: true
        });
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 5000);
      }
    } catch (error) {
      console.error('Failed to save announcement:', error);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent, index: number) => {
    e.preventDefault();
    if (!user) return;

    const updatedAnnouncements = announcements.map((a, i) =>
      i === index ? newAnnouncement : a
    );

    try {
      const response = await fetch(`http://localhost:8080/botSettings/${user.id}/chatReminders`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedAnnouncements),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setAnnouncements(updatedUser.botSettings.chatReminders);
        setOriginalAnnouncements(updatedUser.botSettings.chatReminders);
        setIsEditing(null);
        setNewAnnouncement({
          reminder: '',
          interval: 30,
          intervalType: 'time',
          enabled: true
        });
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 5000);
      }
    } catch (error) {
      console.error('Failed to edit announcement:', error);
    }
  };

  const toggleAnnouncement = (index: number) => {
    const updatedAnnouncements = announcements.map((a, i) =>
      i === index ? { ...a, enabled: !a.enabled } : a
    );
    setAnnouncements(updatedAnnouncements);
  };

  const deleteAnnouncement = (index: number) => {
    const updatedAnnouncements = announcements.filter((_, i) => i !== index);
    setAnnouncements(updatedAnnouncements);
    setHasChanges(true);
  };

  const saveChanges = async () => {
    if (!user) return;

    try {
      const response = await fetch(`http://localhost:8080/botSettings/${user.id}/chatReminders`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(announcements),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        setAnnouncements(updatedUser.botSettings.chatReminders);
        setOriginalAnnouncements(updatedUser.botSettings.chatReminders);
        setHasChanges(false);
      }
    } catch (error) {
      console.error('Failed to save changes:', error);
    }
  };

  const discardChanges = () => {
    setAnnouncements(originalAnnouncements);
    setHasChanges(false);
  };

  return (
    <div className="space-y-6">
      {showNotification && (
        <div className="fixed top-0 left-0 right-0 bg-blue-500 text-white text-center py-2">
          Changes will update within the server cycle, max 25 minutes.
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold dark:text-white">Chat Announcements</h2>
        <button
          onClick={() => {
            setIsAdding(true);
            setNewAnnouncement({
              reminder: '',
              interval: 30,
              intervalType: 'time',
              enabled: true
            });
          }}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Announcement
        </button>
      </div>

      {isAdding && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 max-w-sm mx-auto">
          <form onSubmit={handleSubmit} className="space-y-2">
            <div>
              <label className="block text-sm font-medium dark:text-white mb-1">Message</label>
              <textarea
                value={newAnnouncement.reminder}
                onChange={(e) => setNewAnnouncement({ ...newAnnouncement, reminder: e.target.value })}
                className="w-full px-2 py-1 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                rows={3}
                placeholder="Enter your announcement message..."
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium dark:text-white mb-1">Interval</label>
                <input
                  type="number"
                  value={newAnnouncement.interval}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, interval: parseInt(e.target.value) })}
                  className="w-full px-2 py-1 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  min="5"
                  max="240"
                  step="5"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium dark:text-white mb-1">Interval Type</label>
                <select
                  value={newAnnouncement.intervalType}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, intervalType: e.target.value as 'time' | 'messages' })}
                  className="w-full px-2 py-1 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="time">Minutes</option>
                  <option value="messages">Messages</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-2 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-purple-600 text-white px-2 py-1 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto max-h-[700px] custom-scrollbar">
        {announcements.length === 0 ? (
          <p style={{ color: 'lightgray', opacity: '0.4' }}>No chat Announcements have been created.</p>
        ) : (
          announcements.map((announcement, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 max-w-sm mx-auto">
              {isEditing === index ? (
                <form onSubmit={(e) => handleEditSubmit(e, index)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium dark:text-white mb-1">Message</label>
                    <textarea
                      value={newAnnouncement.reminder}
                      onChange={(e) => setNewAnnouncement({ ...newAnnouncement, reminder: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      rows={3}
                      placeholder="Enter your announcement message..."
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium dark:text-white mb-1">Interval</label>
                      <input
                        type="number"
                        value={newAnnouncement.interval}
                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, interval: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        min="5"
                        max="240"
                        step="5"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium dark:text-white mb-1">Interval Type</label>
                      <select
                        value={newAnnouncement.intervalType}
                        onChange={(e) => setNewAnnouncement({ ...newAnnouncement, intervalType: e.target.value as 'time' | 'messages' })}
                        className="w-full px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value="time">Minutes</option>
                        <option value="messages">Messages</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(null)}
                      className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-gray-900 dark:text-white mb-2">{announcement.reminder}</p>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      {announcement.intervalType === 'time' ? (
                        <Clock className="w-4 h-4 mr-1" />
                      ) : (
                        <MessageSquare className="w-4 h-4 mr-1" />
                      )}
                      Every {announcement.interval} {announcement.intervalType === 'time' ? 'minutes' : 'messages'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleAnnouncement(index)}
                      className={`p-2 rounded-lg transition-colors ${
                        announcement.enabled
                          ? 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900'
                          : 'text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {announcement.enabled ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(index);
                        setNewAnnouncement(announcement);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => deleteAnnouncement(index)}
                      className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Notification Toast with Save and Discard Buttons */}
      {hasChanges && (
        <div className="fixed bottom-16 right-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-blue-600 dark:text-blue-400 flex gap-2">
          <button
            onClick={discardChanges}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <Undo className="w-5 h-5" />
            Discard Changes
          </button>
          <button
            onClick={saveChanges}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Save className="w-5 h-5" />
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
}