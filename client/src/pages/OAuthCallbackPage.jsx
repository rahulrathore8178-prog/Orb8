import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function OAuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const err = searchParams.get('error');

    if (err) {
      setError('OAuth login failed. Please try again.');
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    if (!token) {
      setError('No token received.');
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    // Store token and fetch user profile
    localStorage.setItem('token', token);

    fetch(`${apiUrl}/api/auth/user/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
          window.dispatchEvent(new Event('auth:user-updated'));
          navigate('/community');
        } else {
          setError('Failed to load profile.');
          setTimeout(() => navigate('/login'), 3000);
        }
      })
      .catch(() => {
        setError('Network error.');
        setTimeout(() => navigate('/login'), 3000);
      });
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f1419]">
      <div className="text-center">
        {error ? (
          <div className="text-red-400 text-lg">{error}</div>
        ) : (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400 mx-auto mb-4"></div>
            <div className="text-gray-300 text-lg">Signing you in...</div>
          </>
        )}
      </div>
    </div>
  );
}
