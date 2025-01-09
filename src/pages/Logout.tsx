import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DatabaseUser } from '../lib/auth';

interface LogoutProps {
  setUser: React.Dispatch<React.SetStateAction<DatabaseUser | null>>;
}

export function Logout({ setUser }: LogoutProps) {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem('user');
    localStorage.setItem('logoutSuccess', 'Successfully logged out.');
    document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    setUser(null);  // Clear the user state
    navigate('/login');
  }, [navigate, setUser]);

  return (
    <div className="flex justify-center items-center h-screen">
      <p className="text-gray-900 dark:text-white">Logging out...</p>
    </div>
  );
}
