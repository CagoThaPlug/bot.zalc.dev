import { Droplet, List, User, MessageCircle } from 'lucide-react';
import { Discord } from '../components/icons/Discord';
import { initiateLogin } from '../lib/auth';
import { useState, useEffect } from 'react';

export function Login() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [logoutSuccess, setLogoutSuccess] = useState<string | null>(null);
  const [userExists, setUserExists] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contactReason, setContactReason] = useState('');
  const [description, setDescription] = useState('');
  const [discordContact, setDiscordContact] = useState('');

  useEffect(() => {
    const error = localStorage.getItem('loginError');
    const logoutSuccess = localStorage.getItem('logoutSuccess');
    const userExists = localStorage.getItem('user');

    if (userExists) {
      setUserExists(true);
    }

    if (logoutSuccess) {
      setLogoutSuccess(logoutSuccess);
      localStorage.removeItem('logoutSuccess');
    }

    if (error) {
      setLoginError(error);
      localStorage.removeItem('loginError');
    }
  }, []);
  

  const handleContactSubmit = async () => {
    const response = await fetch('https://zalc.dev/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ contactReason, description, discordContact }),
    });

    if (response.ok) {
      alert('Contact form submitted successfully!');
    } else {
      alert('Failed to submit contact form. Please try again later.');
    }

    // Clear the form fields and close the modal
    setDiscordContact('');
    setContactReason('');
    setDescription('');
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 relative">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-lg shadow-xl">
          <div className="text-center mb-8">
            <img src="/icon.png" alt="ZalcBot" className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">Welcome to ZalcBot</h1>
            <p className="text-gray-600 mt-2">Your favorite streamer's favorite Twitch bot</p>
          </div>

          {loginError && (
            <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
              {loginError}
            </div>
          )}

          {logoutSuccess && (
            <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
              {logoutSuccess}
            </div>
          )}

          {userExists && (
            <div className="bg-blue-100 text-blue-700 p-3 rounded mb-4 flex items-center justify-between">
              <div className="flex items-center">
                <p className="text-center text-lg">There is currently a bug when logging in, please try logging in again or refreshing this page to access the dashboard. My apologies for the inconvenience.</p>
              </div>
            </div>
          )}

          <button
            onClick={initiateLogin}
            className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
            </svg>
            Login with Twitch
          </button>

          <div className="text-center mt-4">
            <a href="/donate" className="text-purple-600 hover:underline">Support ZalcBot Here</a>
          </div>
        </div>

        <div
          className={`mt-2 bg-gray-100 rounded-lg shadow-lg p-4 transition-all duration-300 ${isCollapsed ? 'h-16 overflow-hidden' : 'h-auto'}`}
        >
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full bg-gray-300 text-gray-800 py-1 px-4 rounded-lg hover:bg-gray-400 mb-2 text-sm"
          >
            {isCollapsed ? 'Show Options' : 'Hide Options'}
          </button>

          {!isCollapsed && (
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => window.location.href = '/smoke'}
                className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 flex items-center gap-2"
              >
                <Droplet className="w-5 h-5" />
                Dab Highscores
              </button>

              <button
                onClick={() => window.location.href = '/globalcommands'}
                className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 flex items-center gap-2"
              >
                <List className="w-5 h-5" />
                Commands
              </button>

              <button
                onClick={() => window.open('https://totalhomegrown.com/', '_blank')}
                className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 text-white py-2 px-4 rounded-lg hover:opacity-90 flex items-center gap-2"
              >
                <User className="w-5 h-5" />
                THG Family
              </button>

              {/* Updated Discord Button */}
              <button
                onClick={() => window.open('https://discord.gg/j4rKuabWdA', '_blank')}
                className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                aria-label="Join our Discord"
              >
                <Discord className="w-5 h-5" />
                Discord
              </button>

              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 flex items-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Contact
              </button>
            </div>
          )}
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-lg font-bold mb-4">Contact Us</h2>
              <input
                type="text"
                placeholder="Discord Username"
                value={discordContact}
                onChange={(e) => setDiscordContact(e.target.value)}
                className="border p-2 mb-4 w-full"
              />
              <input
                type="text"
                placeholder="Reason"
                value={contactReason}
                onChange={(e) => setContactReason(e.target.value)}
                className="border p-2 mb-4 w-full"
              />
              <textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="border p-2 mb-4 w-full"
              />
              <button onClick={handleContactSubmit} className="bg-blue-500 text-white py-2 px-4 rounded-lg">
                Submit
              </button>
              <button onClick={() => setIsModalOpen(false)} className="bg-red-500 text-white py-2 px-4 rounded-lg ml-2">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
