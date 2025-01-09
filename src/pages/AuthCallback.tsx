import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot } from 'lucide-react';

export function AuthCallback() {
  const navigate = useNavigate();
  const isVerifying = useRef(false);
  const retryCount = useRef(0);
  const MAX_RETRIES = 3;

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code');
    
    if (code) {
      const verifyTwitch = async () => {
        if (isVerifying.current) return;
        isVerifying.current = true;

        try {
          const response = await fetch('http://localhost:8080/twitch/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }),
          });

          if (response.ok) {
            const user = await response.json();
            localStorage.setItem('user', JSON.stringify(user));
            setTimeout(() => navigate('/dashboard'), 500); // Add a delay before navigation
          } else if (response.status === 409 && retryCount.current < MAX_RETRIES) {
            retryCount.current++;
            isVerifying.current = false;
            setTimeout(verifyTwitch, 1000); // Retry after 1s
          } else {
            throw new Error(response.statusText);
          }
        } catch (error) {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            navigate('/dashboard');
          } else {
            localStorage.setItem('loginError', 'Authentication failed. Please try again.');
            navigate('/login');
          }
        }
      };

      verifyTwitch();
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center text-white">
        <Bot className="w-16 h-16 mx-auto mb-4 animate-bounce" />
        <h1 className="text-2xl font-bold">Authenticating...</h1>
      </div>
    </div>
  );
}