import React, { useEffect } from 'react';
import { DollarSign, CreditCard, Bitcoin, Terminal, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

interface DonationMethod {
  name: string;
  icon: React.ElementType;
  link: string;
  description: string;
}

const donationMethods: DonationMethod[] = [
  {
    name: 'Venmo',
    icon: DollarSign,
    link: 'https://venmo.com/ogacblack',
    description: 'Quick and easy mobile payments',
  },
  {
    name: 'CashApp',
    icon: CreditCard,
    link: 'https://cash.app/$jtgoodier',
    description: 'Instant transfers with zero fees',
  },
  {
    name: 'CoinBase',
    icon: Bitcoin,
    link: 'https://www.coinbase.com/zalcan',
    description: 'Support us with cryptocurrency',
  },
];

export function Donate() {
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Terminal className="w-8 h-8 text-purple-500" />
          <div>
            <h1 className="text-3xl font-bold">Support</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Help keep ZalcBot running
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/')}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Home className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Description Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">Support ZalcBot's Growth</h2>
        <p className="text-gray-600 dark:text-gray-300">
        Your contributions are vital to maintaining and enhancing ZalcBot, ensuring it remains a valuable tool for streamers worldwide. The funds support server costs for 24/7 reliability, new features and improvements based on user feedback, and the latest Twitch integrations. Additionally, donations aid in bug fixes, security updates, and performance optimization, ensuring ZalcBot is a seamless tool for streamers to engage with their audiences. Thank you for contributing to ZalcBot's growth!
        </p>
      </div>

      {/* Donation Methods Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {donationMethods.map((method) => {
            const Icon = method.icon;
            return (
              <a
                key={method.name}
                href={method.link}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6",
                  "hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
                  "flex flex-col items-center text-center"
                )}
              >
                <Icon className="w-12 h-12 text-purple-600 dark:text-purple-400 mb-4" />
                <span className="font-medium text-lg mb-2">{method.name}</span>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {method.description}
                </p>
                <span className="mt-4 text-purple-600 dark:text-purple-400 text-sm">
                  Click to donate →
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Donate;