import React from 'react';

export function Login() {
  // Special thanks list with Twitch usernames and display names
  const specialThanks = [
    { name: "Tyyyer32", url: "https://twitch.tv/Tyyyer32" },
    { name: "SauceeNinja", url: "https://twitch.tv/SauceeNinja" },
    { name: "Squanchooo", url: "https://twitch.tv/Squanchooo" },
    { name: "eki11a", url: "https://twitch.tv/eki11a" },
    { name: "painy_wainy", url: "https://twitch.tv/painy_wainy" },
    { name: "TomatoPencil", url: "https://twitch.tv/TomatoPencil" },
    { name: "Zumms", url: "https://twitch.tv/Zumms" },
    { name: "TotalHomeGrown", url: "https://twitch.tv/TotalHomeGrown" },
    { name: "NinjaHomeGrown", url: "https://twitch.tv/NinjaHomeGrown" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex flex-col items-center justify-center py-8">
      <div className="w-full max-w-2xl px-4">
        <div className="bg-white/95 backdrop-blur-sm p-8 rounded-xl shadow-2xl border border-white/20">
          <div className="text-center mb-8">
            <div className="relative">
              <img src="https://i.imgur.com/iCoE9TK.png" alt="ZalcBot" className="w-20 h-20 mx-auto mb-4 rounded-full shadow-lg" />
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">ZalcBot</h1>
            <div className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium">
              Coming Back Soon
            </div>
          </div>

          {/* Main Message */}
          <div className="prose text-gray-700 max-w-none">
            <p className="text-lg mb-4 text-center font-medium text-gray-800">We're working on something amazing! 🚀</p>
            
            <p className="mb-4">I've been working on ZalcBot 2.0 and its turning out way better than I thought it would. Taking that break was exactly what I needed because it gave me time to think about what this could actually become.</p>
            
            <p className="mb-4">I'm having fun coding again instead of just forcing myself to work on stuff. Got some really cool ideas that I think you guys are gonna love.</p>
            
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border-l-4 border-purple-500 mb-6">
              <h3 className="text-lg font-semibold mb-2 text-purple-800">What I'm working on:</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>Better moderation tools</li>
                <li>Features you guys have been asking for</li>
                <li>File hosting so you can upload overlays and alerts</li>
                <li>Spotify stuff</li>
                <li>A board where you can see what I'm working on and report bugs</li>
              </ul>
            </div>
            
            {/* Special Thanks Section */}
            <div className="my-6 p-6 bg-gray-50 rounded-xl border border-gray-200">
              <h3 className="text-lg font-semibold mb-3 text-center">Continued Thanks To Our Amazing Community</h3>
              <p className="mb-4 text-center text-gray-600">These incredible streamers continue to inspire and support the ZalcBot journey:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {specialThanks.map((streamer, index) => (
                  <a 
                    key={index}
                    href={streamer.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 px-4 py-2 rounded-full hover:from-purple-200 hover:to-blue-200 transition-all duration-200 transform hover:scale-105 shadow-sm"
                  >
                    {streamer.name}
                  </a>
                ))}
              </div>
            </div>
            
            <div className="text-center bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border border-green-200 mb-6">
              <p className="text-lg font-medium text-gray-800 mb-2">Want to stay updated?</p>
              <p className="text-gray-600 mb-4">Join the Discord to chat with everyone and get updates when they happen.</p>
              <a 
                href="https://discord.gg/j4rKuabWdA" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Join Discord
              </a>
            </div>
            
            <p className="text-center text-gray-600 mb-2">Thanks for sticking around and being patient with me.</p>
            <p className="text-center font-medium text-gray-800">- Zalc</p>
          </div>
        </div>
      </div>
      
      {/* Floating particles animation */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-400 rounded-full opacity-20 animate-bounce" style={{animationDelay: '0s'}}></div>
        <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-blue-400 rounded-full opacity-30 animate-bounce" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-purple-300 rounded-full opacity-15 animate-bounce" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-1/3 right-1/3 w-2 h-2 bg-blue-300 rounded-full opacity-25 animate-bounce" style={{animationDelay: '1.5s'}}></div>
      </div>
    </div>
  );
}

export default Login;