import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Logout } from './pages/Logout';
import { Dashboard } from './pages/Dashboard';
import { AuthCallback } from './pages/AuthCallback';
import { API_BASE_URL } from './config';
import { useState, useEffect } from 'react';
import { DatabaseUser } from './lib/auth';
import Settings from './pages/Settings';
import Announcements from './pages/Announcements';
import Commands from './pages/Commands';
import Spotify from './pages/Spotify';
import SmokerHighscores from './pages/HiscoresDashboard';
import GlobalCommands from './pages/GlobalCommands';
import Donate from './pages/Donate';
import SpotifyAuthCallback from './pages/SpotifyAuthCallback.tsx';

// Add this to make the API URL available globally
window.API_BASE_URL = API_BASE_URL;

function App() {
  const [user, setUser] = useState<DatabaseUser | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const isAuthenticated = !!user;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/smoke" element={<SmokerHighscores />} />
        <Route path="/globalcommands" element={<GlobalCommands />} />
        <Route path="/donate" element={<Donate />} />
        <Route path="/spotify/callback" element={<SpotifyAuthCallback />} />

        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
        />
        <Route path="/auth/callback" element={<AuthCallback />} />
        
        {/* Protected Routes */}
        <Route
          element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings user={user} setUser={setUser} />} />
          <Route path="/commands" element={<Commands user={user} setUser={setUser} />} />
          <Route path="/announcements" element={<Announcements user={user} setUser={setUser} />} />
          <Route path="/spotify" element={<Spotify user={user} setUser={setUser} />} />
          <Route path="/admin" element={<div>Admin Portal</div>} />
          <Route path="/logout" element={<Logout setUser={setUser} />} />
        </Route>

        {/* Redirect root to dashboard or login */}
        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
