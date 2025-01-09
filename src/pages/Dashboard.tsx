import {
  Bot,
  Users,
  MessageSquare,
  Bell,
  LucideIcon,
  Droplet,
  List,
  User,
  Twitch,
  Crown,
  Heart,
  Power,
  Eye,
  Clock,
} from "lucide-react";
import { Discord } from "../components/icons/Discord";
import { cn } from "../lib/utils";
import { useEffect, useState } from "react";
import { DatabaseUser } from "../lib/auth";

interface Stat {
  label: string;
  value: string;
  icon: LucideIcon;
  color: string;
  description: string;
}

const words = [
  "Tiny dab, just a lil' guy",
  "You can handle this, right?",
  "A dab that barely gets you going",
  "Getting into it, but not yet there",
  "Now we're talking, it's working",
  "Definitely noticing the effects",
  "You might start to cough",
  "Here comes the big one",
  "Serious dab incoming",
  "A ride for the lungs and soul",
  "You've crossed into full dab territory",
  "You're in the high-speed lane now",
  "It's a whole new level of experience",
  "This is the one that sends you flying",
  "Prepare for liftoff, this is beyond",
  "Fully dabbed out, space-time bending",
  "You're in a different galaxy now",
  "The biggest dab ever, you're basically a legend"
];


function DabRoulette() {
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const spinWheel = () => {
    setIsSpinning(true);
    setSelectedWord(null);
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * words.length);
      setSelectedWord(words[randomIndex]);
      setIsSpinning(false);
    }, 3000);
  };

  return (
    <div className="bg-gradient-to-r from-green-600 to-yellow-500 dark:bg-gray-800 rounded-lg shadow-md p-4 h-29 text-left flex flex-col justify-between">
      <div className="flex items-start justify-between mb-2">
        <div className="p-2 rounded-full bg-white shadow-lg">
          <Droplet className="w-6 h-6 text-green-600" />
        </div>
        <span className="text-xl font-bold text-black">{isSpinning ? "" : selectedWord || "Spin the Dab Wheel!"}</span>
      </div>
      <h3 className="text-sm text-gray-300 mb-4">Dab Roulette</h3>
      <button
        onClick={spinWheel}
        className="w-1/2 bg-gray-500 text-white py-1 px-2 rounded-lg hover:bg-gray-700 focus:ring-4 focus:ring-gray-500 transition-all duration-300 mt-0"
        disabled={isSpinning}
      >
        {isSpinning ? "Spinning..." : "Spin & Dab!"}
      </button>
    </div>
  );
}

export function Dashboard() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [updates, setUpdates] = useState<
    { title: string; description: string; date: string }[]
  >([]);
  const [user, setUser] = useState<DatabaseUser | null>(null);
  const [featuredStreamer, setFeaturedStreamer] = useState<string | null>(null);
  const [isStatsLoaded, setIsStatsLoaded] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      const response = await fetch(
        `http://localhost:8080/stats?channelID=${user.twitchUser.id}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }

      const data = await response.json();
      setStats([
        {
          label: "Bot Status",
          value: data.botStatus ? "Online" : "Offline",
          icon: Bot,
          color: "bg-green-500",
          description: "Shows whether the bot is currently online or offline.",
        },
        {
          label: "Channel Mod",
          value: data.channelMod ? "Enabled" : "Disabled",
          icon: Users,
          color: "bg-blue-500",
          description: "Indicates if ZalcBot is a moderator in your channel.",
        },
        {
          label: "Commands Used",
          value: data.commandsUsed.toString(),
          icon: MessageSquare,
          color: "bg-purple-500",
          description: "Total number of commands used by ZalcBot in your channel.",
        },
        {
          label: "Chats Sent",
          value: data.chatsSent.toString(),
          icon: Bell,
          color: "bg-yellow-500",
          description: "Total number of chat messages sent by ZalcBot in your channel.",
        },
        {
          label: "Live Status",
          value: data.online ? "Online" : "Offline",
          icon: Power,
          color: data.online ? "bg-green-500" : "bg-red-500",
          description: "Shows whether the stream is currently live.",
        },
        {
          label: "Active Viewers",
          value: data.activeViewers.toString(),
          icon: Eye,
          color: "bg-teal-500",
          description:
            "Current number of viewers actively participating in the chat.",
        },
        {
          label: "Uptime",
          value: data.uptime !== "00:00:00" ? data.uptime : "N/A",
          icon: Clock,
          color: "bg-blue-500",
          description: "How long ZalcBot has been online.",
        },        
        {
          label: "Unique Chatters",
          value: data.uniqueChatters.toString(),
          icon: Users,
          color: "bg-purple-500",
          description:
            "Total number of unique users who have sent messages in the chat during the stream.",
        },
      ]);
      setIsStatsLoaded(true);
    };

    const fetchUpdates = async () => {
      const response = await fetch(`http://localhost:8080/updates`);
      const data = await response.json();
      setUpdates(data);
    };

    fetchStats();
    fetchUpdates();
  }, [user]);

  useEffect(() => {
    const fetchFeaturedStreamer = async () => {
      const response = await fetch(`http://localhost:8080/featuredStreamer`);
      if (response.ok) {
        const streamerName = await response.text();
        setFeaturedStreamer(streamerName);
      }
    };

    fetchFeaturedStreamer();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (stats.length > 0) {
      const uptimeStat = stats.find(stat => stat.label === "Uptime");
      if (uptimeStat && uptimeStat.value !== "N/A") {
        const [hours, minutes, seconds] = uptimeStat.value.split(":").map(Number);
        let totalSeconds = hours * 3600 + minutes * 60 + seconds;

        interval = setInterval(() => {
          totalSeconds += 1;
          const newHours = Math.floor(totalSeconds / 3600);
          const newMinutes = Math.floor((totalSeconds % 3600) / 60);
          const newSeconds = totalSeconds % 60;
          const newUptime = `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}:${newSeconds.toString().padStart(2, '0')}`;

          setStats(prevStats => prevStats.map(stat =>
            stat.label === "Uptime" ? { ...stat, value: newUptime } : stat
          ));
        }, 1000);
      }
    }

    return () => clearInterval(interval);
  }, [stats]);

  return (
    <div className="text-gray-900 dark:text-white">
      <div className="flex items-center gap-4 mb-8">
        <img
          src={
            user?.twitchUser?.profile_image_url || "/path/to/fallback-image.jpg"
          }
          alt={user?.twitchUser?.display_name}
          className="w-16 h-16 rounded-full border-4 border-purple-600"
        />
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            @{user?.twitchUser?.login}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-2">
          {stats.map(({ label, value, icon: Icon, color, description }) => (
            label !== "Unique Chatters" && (
              <div
                key={label}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 h-[calc(100%)] transform transition-transform duration-200 hover:scale-105 hover:shadow-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={cn("p-2 rounded-lg", color)}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold dark:text-white">
                    {value}
                  </span>
                </div>
                <h3 className="text-gray-600 dark:text-gray-300 text-sm">
                  {label}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  {description}
                </p>
              </div>
            )
          ))}
          {isStatsLoaded && <DabRoulette />}
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 dark:text-white">
              Quick Links
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => (window.location.href = "/smoke")}
                className="bg-green-600 text-white py-1 px-3 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 text-sm w-10%"
              >
                <Droplet className="w-4 h-4" />
                Dab Highscores
              </button>
              <button
                onClick={() => (window.location.href = "/globalcommands")}
                className="bg-gray-600 text-white py-1 px-3 rounded-lg hover:bg-gray-700 flex items-center justify-center gap-2 text-sm w-10%"
              >
                <List className="w-4 h-4" />
                Commands
              </button>
              <button
                onClick={() => window.open("https://thgfamily.com", "_blank")}
                className="bg-gradient-to-r from-red-600 via-yellow-600 to-green-600 text-white py-1 px-3 rounded-lg hover:opacity-90 flex items-center justify-center gap-2 text-sm w-10%"
              >
                <User className="w-4 h-4" />
                THG Family
              </button>
              <button
                onClick={() =>
                  window.open("https://discord.gg/j4rKuabWdA", "_blank")
                }
                className="bg-blue-700 text-white py-1 px-3 rounded-lg hover:bg-blue-800 flex items-center justify-center gap-2 text-sm w-10%"
                aria-label="Join our Discord"
              >
                <Discord className="w-4 h-4" />
                Discord
              </button>
              <button
                onClick={() =>
                  window.open(
                    `https://www.twitch.tv/${user?.twitchUser.login}`,
                    "_blank"
                  )
                }
                className="bg-[#772ce8] text-white py-1 px-3 rounded-lg hover:bg-[#5e21b5] flex items-center justify-center gap-2 text-sm w-10%"
              >
                <Twitch className="w-4 h-4" />
                Twitch Page
              </button>
              <button
                onClick={() =>
                  window.open(
                    `https://www.twitch.tv/popout/${user?.twitchUser.login}/chat?popout=`,
                    "_blank"
                  )
                }
                className="bg-[#772ce8] text-white py-1 px-3 rounded-lg hover:bg-[#5e21b5] flex items-center justify-center gap-2 text-sm w-10%"
              >
                <Twitch className="w-4 h-4" />
                Pop-out Chat
              </button>
              <button
                onClick={() =>
                  window.open(
                    `https://www.twitch.tv/${featuredStreamer}`,
                    "_blank"
                  )
                }
                className="bg-yellow-600 text-white py-1 px-3 rounded-lg hover:bg-yellow-700 flex items-center justify-center gap-2 text-sm w-5%"
              >
                <Crown className="w-4 h-4" />
                Featured Streamer
              </button>
              <button
                onClick={() => (window.location.href = "/donate")}
                className="bg-green-600 text-white py-1 px-3 rounded-lg flex items-center justify-center gap-2 text-sm w-10%"
              >
                <Heart className="w-4 h-4" />
                Support ZalcBot
              </button>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 dark:text-white">
              Dev Announcements
            </h2>
            <div className="space-y-4">
              {updates.map((update, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-yellow-500" />
                    <span className="font-medium dark:text-white">
                      {update.title}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {update.date}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
