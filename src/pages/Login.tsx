import React from 'react';

export function Login() {
  // Special thanks list with Twitch usernames and display names
  const specialThanks = [
    { name: "Tyyyer32", url: "https://twitch.tv/Tyyyer32" },
    { name: "SauceeNinja", url: "https://twitch.tv/SauceeNinja" },
    { name: "Squanchooo", url: "https://twitch.tv/Squanchooo" },
    { name: "ek1lla", url: "https://twitch.tv/Ek1lla" },
    { name: "painy_wainy", url: "https://twitch.tv/painy_wainy" },
    { name: "TomatoPencil", url: "https://twitch.tv/TomatoPencil" },
    { name: "Zumms", url: "https://twitch.tv/Zumms" },
    { name: "TotalHomeGrown", url: "https://twitch.tv/TotalHomeGrown" },
    { name: "NinjaHomeGrown", url: "https://twitch.tv/NinjaHomeGrown" }
  ];

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center py-8">
      <div className="w-full max-w-2xl px-4">
        <div className="bg-white p-8 rounded-lg shadow-xl">
          <div className="text-center mb-6">
            <img src="https://i.imgur.com/iCoE9TK.png" alt="ZalcBot" className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">ZalcBot</h1>
          </div>

          {/* Heartfelt Message */}
          <div className="prose text-gray-700 max-w-none">
            <p className="text-lg mb-4">Hey everyone,</p>
            <p className="mb-3">This isn't an easy post to write, but after a lot of thought, I've decided to <strong>suspend development on ZalcBot until further notice</strong>.</p>
            <p className="mb-3">Over the past year, building and refining ZalcBot has been an incredible journey. Seeing the community grow, watching people use the bot in ways I never imagined, and getting to work on something I'm truly passionate about has been an amazing experience. But somewhere along the way, I lost balance.</p>
            <p className="mb-3">Lately, I've been feeling the effects of being <em>too online</em>—constantly plugged in, always working on something, and rarely giving myself the space to just <em>live</em>. It's taken a toll on me, and I need to step back to focus on my life outside the screen.</p>
            <p className="mb-3">This isn't goodbye forever, but right now, I need to prioritize my well-being. Thank you to <strong>everyone</strong> who has supported ZalcBot—whether you've used it, given feedback, or just been part of the journey. I appreciate you all more than you know.</p>
            <p className="mb-3">For now, ZalcBot will remain offline, but I can work with any of you for a new course of action.</p>
            
            {/* Special Thanks Section */}
            <div className="my-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-3">Special Thanks</h3>
              <p className="mb-3">I want to express my deepest gratitude to these amazing people who have been instrumental in ZalcBot's journey:</p>
              <div className="flex flex-wrap gap-2">
                {specialThanks.map((streamer, index) => (
                  <a 
                    key={index}
                    href={streamer.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full hover:bg-purple-200 transition-colors"
                  >
                    {streamer.name}
                  </a>
                ))}
              </div>
            </div>
            
            <p className="mb-3">Take care, and don't forget to touch grass. 🌱</p>
            <p className="mb-3 text-right font-medium">- Zalc</p>
          </div>
        </div>
      </div>
    </div>
  );
}