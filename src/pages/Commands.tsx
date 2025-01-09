import React, { useState, useEffect } from 'react';
import { DatabaseUser, CustomCommand } from '../lib/auth';
import { Plus, Trash2, ToggleLeft, ToggleRight, Tag, Edit2, Save, Undo, ChevronUp, ChevronDown, Info } from 'lucide-react';
import { cn } from '../lib/utils';

interface CommandsProps {
  user: DatabaseUser | null;
  setUser: (user: DatabaseUser | null) => void;
}

const COMMAND_TYPES = ['General', 'Mod', 'Editor', 'Developer'] as const;

export default function Commands({ user, setUser }: CommandsProps) {
  const [customCommands, setCustomCommands] = useState<CustomCommand[]>([]);
  const [originalCommands, setOriginalCommands] = useState<CustomCommand[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCommand, setEditingCommand] = useState<CustomCommand | null>(null);
  const [showGlobalCommands, setShowGlobalCommands] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [newCommand, setNewCommand] = useState<CustomCommand>({
    name: '',
    aliases: [],
    description: '',
    enabled: true,
    args: {},
    customVariables: {},
    response: '',
    type: 'General'
  });
  const [globalCommands, setGlobalCommands] = useState(user?.botSettings?.globalCommands || {});
  const [originalGlobalCommands, setOriginalGlobalCommands] = useState(user?.botSettings?.globalCommands || {});
  const [hasGlobalChanges, setHasGlobalChanges] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Initialize commands from user's bot settings
  useEffect(() => {
    if (user?.botSettings?.customCommands) {
      setCustomCommands(user.botSettings.customCommands);
      setOriginalCommands(user.botSettings.customCommands);
    }
  }, [user]);

  // Update useEffect to track changes
  useEffect(() => {
    setHasChanges(JSON.stringify(customCommands) !== JSON.stringify(originalCommands));
  }, [customCommands, originalCommands]);

  // Update useEffect to track global command changes
  useEffect(() => {
    setHasGlobalChanges(JSON.stringify(globalCommands) !== JSON.stringify(originalGlobalCommands));
  }, [globalCommands, originalGlobalCommands]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setIsLoading(true);
      const updatedCommands = [...customCommands, newCommand];
      
      const response = await fetch(`http://localhost:8080/botSettings/${user.id}/commands`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCommands),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setCustomCommands(updatedUser.botSettings.customCommands);
        setOriginalCommands(updatedUser.botSettings.customCommands);
        setIsAdding(false);
        setNewCommand({
          name: '',
          aliases: [],
          description: '',
          enabled: true,
          args: {},
          customVariables: {},
          response: '',
          type: 'General'
        });
      }
    } catch (error) {
      console.error('Failed to save command:', error);
      setError('Failed to save command. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !editingCommand) return;

    try {
      setIsLoading(true);
      const updatedCommands = customCommands.map(cmd =>
        cmd.name === editingCommand.name ? editingCommand : cmd
      );

      const response = await fetch(`http://localhost:8080/botSettings/${user.id}/commands`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCommands),
      });

      if (response.ok) {
        setCustomCommands(updatedCommands);
        setOriginalCommands(updatedCommands);
        
        if (user.botSettings) {
          const updatedUser = {
            ...user,
            botSettings: {
              ...user.botSettings,
              customCommands: updatedCommands
            }
          };
          setUser(updatedUser);
        }
        
        setIsEditing(false);
        setEditingCommand(null);
      }
    } catch (error) {
      console.error('Failed to update command:', error);
      setError('Failed to update command. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCommand = (command: CustomCommand) => {
    const updatedCommands = customCommands.map(cmd =>
      cmd.name === command.name ? { ...cmd, enabled: !cmd.enabled } : cmd
    );
    setCustomCommands(updatedCommands);
    setHasChanges(true);
  };

  const toggleGlobalCommand = (commandName: string) => {
    if (!user?.botSettings?.globalCommands) return;

    if (['ChangeGame', 'changeTitle', 'followage'].includes(commandName) && !user.channelMod) {
      setNotification('You need to mod the bot in your channel to enable this command.');
      return;
    }

    const updatedGlobalCommands = {
      ...globalCommands,
      [commandName]: !globalCommands[commandName]
    };

    setGlobalCommands(updatedGlobalCommands);
    setHasGlobalChanges(true);
  };

  // Add a function to save global command changes
  const saveGlobalChanges = async () => {
    if (!user) return;

    try {
      const response = await fetch(`http://localhost:8080/botSettings/${user.id}/globalCommands`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...user.botSettings, globalCommands }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setOriginalGlobalCommands(globalCommands);
        setHasGlobalChanges(false);
      }
    } catch (error) {
      console.error('Failed to save global command changes:', error);
    }
  };

  // Add a function to discard global command changes
  const discardGlobalChanges = () => {
    setGlobalCommands(originalGlobalCommands);
    setHasGlobalChanges(false);
  };

  const deleteCommand = (commandName: string) => {
    const updatedCommands = customCommands.filter(cmd => cmd.name !== commandName);
    setCustomCommands(updatedCommands);
    setHasChanges(true);
  };

  // Add a function to save changes
  const saveChanges = async () => {
    if (!user) return;

    try {
      const response = await fetch(`http://localhost:8080/botSettings/${user.id}/commands`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customCommands),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setOriginalCommands(customCommands);
        setHasChanges(false);
      }
    } catch (error) {
      console.error('Failed to save changes:', error);
    }
  };

  // Add a function to discard changes
  const discardChanges = () => {
    setCustomCommands(originalCommands);
    setHasChanges(false);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold dark:text-white">Custom Commands</h2>
          <button
            onClick={() => setIsAdding(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Command
          </button>
        </div>

        {(isAdding || isEditing) && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <form onSubmit={isEditing ? handleEdit : handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium dark:text-white mb-1">Command Name</label>
                  <input
                    type="text"
                    value={isEditing ? editingCommand?.name : newCommand.name}
                    onChange={(e) => isEditing ? setEditingCommand({ ...editingCommand!, name: e.target.value }) : setNewCommand({ ...newCommand, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium dark:text-white mb-1">Type</label>
                  <select
                    value={isEditing ? editingCommand?.type : newCommand.type}
                    onChange={(e) => isEditing ? setEditingCommand({ ...editingCommand!, type: e.target.value as typeof COMMAND_TYPES[number] }) : setNewCommand({ ...newCommand, type: e.target.value as typeof COMMAND_TYPES[number] })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    {COMMAND_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium dark:text-white mb-1">Aliases (comma separated)</label>
                <input
                  type="text"
                  value={isEditing ? editingCommand?.aliases.join(', ') : newCommand.aliases.join(', ')}
                  onChange={(e) => isEditing ? setEditingCommand({ ...editingCommand!, aliases: e.target.value.split(',').map(alias => alias.trim()) }) : setNewCommand({ ...newCommand, aliases: e.target.value.split(',').map(alias => alias.trim()) })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium dark:text-white mb-1">Description</label>
                <textarea
                  value={isEditing ? editingCommand?.description : newCommand.description}
                  onChange={(e) => isEditing ? setEditingCommand({ ...editingCommand!, description: e.target.value }) : setNewCommand({ ...newCommand, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  rows={2}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium dark:text-white mb-1">
                  Response
                  <span title='Use $var_name to include custom variables'>
                    <Info className="inline-block ml-2 w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </span>
                </label>
                <textarea
                  value={isEditing ? editingCommand?.response : newCommand.response}
                  onChange={(e) => isEditing ? setEditingCommand({ ...editingCommand!, response: e.target.value }) : setNewCommand({ ...newCommand, response: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  rows={2}
                  required
                />
              </div>

              {/* Advanced Section */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-sm font-medium text-gray-600 hover:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-lg transition-colors"
                >
                  {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
                </button>
                {showAdvanced && (
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium dark:text-white mb-1">
                        Arguments (JSON format)
                        <span title='Example: {"arg1": true, "arg2": false}'>
                          <Info className="inline-block ml-2 w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </span>
                      </label>
                      <textarea
                        value={isEditing ? JSON.stringify(editingCommand?.args, null, 2) : JSON.stringify(newCommand.args, null, 2)}
                        onChange={(e) => isEditing ? setEditingCommand({ ...editingCommand!, args: JSON.parse(e.target.value) }) : setNewCommand({ ...newCommand, args: JSON.parse(e.target.value) })}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium dark:text-white mb-1">
                        Custom Variables (JSON format)
                        <span title='Example: {"var1": "value1", "var2": 123}'>
                          <Info className="inline-block ml-2 w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </span>
                      </label>
                      <textarea
                        value={isEditing ? JSON.stringify(editingCommand?.customVariables, null, 2) : JSON.stringify(newCommand.customVariables, null, 2)}
                        onChange={(e) => isEditing ? setEditingCommand({ ...editingCommand!, customVariables: JSON.parse(e.target.value) }) : setNewCommand({ ...newCommand, customVariables: JSON.parse(e.target.value) })}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        rows={2}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (isEditing) {
                      setIsEditing(false);
                      setEditingCommand(null);
                    } else {
                      setIsAdding(false);
                    }
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-y-auto max-h-[400px] custom-scrollbar">
          {customCommands.map((command) => (
            <div key={command.name} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <div className="flex flex-col h-full">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-medium dark:text-white truncate">{command.name}</h3>
                  <span className={cn(
                    'px-2 py-0.5 text-xs rounded-full',
                    command.type === 'Mod' 
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' 
                      : command.type === 'Editor' 
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' 
                      : command.type === 'Developer' 
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' 
                      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                  )}>
                    {command.type}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 flex-grow">{command.description}</p>
                {command.aliases.length > 0 && (
                  <div className="flex items-center gap-1 mb-2 flex-wrap">
                    <Tag className="w-3 h-3 text-gray-400" />
                    {command.aliases.map(alias => (
                      <span key={alias} className="text-xs text-gray-500 dark:text-gray-400">
                        {alias}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-end gap-1 mt-auto">
                  <button
                    onClick={() => toggleCommand(command)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      command.enabled
                        ? 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900'
                        : 'text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {command.enabled ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => {
                      setEditingCommand(command);
                      setIsEditing(true);
                    }}
                    className="p-1.5 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => deleteCommand(command.name)}
                    className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Global Commands Section */}
      {user?.botSettings?.globalCommands && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold dark:text-white">Global Commands</h2>
            <button
              onClick={() => setShowGlobalCommands(!showGlobalCommands)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {showGlobalCommands ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
            </button>
          </div>

          {showGlobalCommands && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {Object.entries(globalCommands).map(([commandName, enabled]) => (
                <div key={commandName} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                  <div className="flex flex-col h-full">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-medium dark:text-white truncate">{commandName}</h3>
                      <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                        Global
                      </span>
                    </div>
                    <div className="flex items-center justify-end mt-auto">
                      <button
                        onClick={() => toggleGlobalCommand(commandName)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          enabled
                            ? 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900'
                            : 'text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {enabled ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Notification Toast with Save and Discard Buttons */}
      {(hasChanges || hasGlobalChanges) && (
        <div className="fixed bottom-20 right-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-blue-600 dark:text-blue-400 flex gap-2">
          {hasChanges && (
            <>
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
            </>
          )}
          {hasGlobalChanges && (
            <>
              <button
                onClick={discardGlobalChanges}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <Undo className="w-5 h-5" />
                Discard Changes
              </button>
              <button
                onClick={saveGlobalChanges}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                Save Changes
              </button>
            </>
          )}
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-20 right-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-600 dark:text-red-400">
          <p>{error}</p>
          <button 
            onClick={() => setError(null)}
            className="mt-2 text-sm underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
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
    </div>
  );
}