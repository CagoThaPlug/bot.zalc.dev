import { useEffect } from 'react';

export function SpotifyAuthCallback() {
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('code');
    if (code) {
      window.opener.postMessage({ code }, window.location.origin);
      window.close();
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center text-white">
        <h1 className="text-2xl font-bold">Authenticating with Spotify...</h1>
      </div>
    </div>
  );
}

export default SpotifyAuthCallback;