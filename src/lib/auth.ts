export interface TwitchUser {
  id: string;
  login: string;
  type: string;
  description: string;
  email: string;
  display_name: string;
  broadcaster_type: string;
  profile_image_url: string;
  offline_image_url: string;
  view_count: number;
  created_at: string;
}

export type CommandType = 'General' | 'Mod' | 'Editor' | 'Developer';

export interface CustomCommand {
  name: string;
  aliases: string[];
  description: string;
  enabled: boolean;
  args: { [key: string]: boolean };
  response: string;
  customVariables: { [key: string]: any };
  type: CommandType;
}

export interface chatReminder {
  reminder: string;
  interval: number;
  intervalType: string;
  enabled: boolean;
}

export interface BotSettings {
  zalcBotEnabled: boolean;
  customCommands: CustomCommand[];
  globalCommands: { [key: string]: boolean };
  chatReminders: chatReminder[];
  autoModEnabled: boolean;
  chatAlertsEnabled: boolean;
}

export interface SpotifySettings {
  connected: boolean;
  overlayUrl: string;
  accessToken: string;
  refreshToken: string;
  songRequestsEnabled: boolean;
  subscriberOnly: boolean;
  moderatorOnly: boolean;
  maxRequestsPerUser: number;
  blacklistedSongs: string[];
  blacklistedArtists: string[];
}

export interface DatabaseUser {
  id: string;
  lastLogin: string;
  twitchUser: TwitchUser;
  botSettings: BotSettings;
  spotifySettings: SpotifySettings;
  channelMod: boolean;
  chatAmtSent: number;
  commandsUsed: number;
}

const TWITCH_CLIENT_ID = 'bdrqt55no39xszay8t0b54fp6qnopj';
const REDIRECT_URI = `${window.location.origin}/auth/callback`;

export function initiateLogin() {
  const scope = 'user:read:email';
  const authUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${TWITCH_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${scope}`;
  window.location.href = authUrl;
}