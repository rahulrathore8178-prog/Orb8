import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const apiUrl = import.meta.env.VITE_API_URL || '';

  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (otp.length !== 6) {
      setError('Enter the 6-digit OTP sent to your email.');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${apiUrl}/api/otp/verify`, { email, otp, newPassword });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#0f1419] font-sans px-4 sm:px-6 py-8 sm:py-10 flex items-center justify-center">
      <div className="w-full max-w-md bg-[#1a2332] border border-[#2a3a4a] rounded-2xl shadow-lg p-5 sm:p-7">
        <button
          onClick={() => navigate('/login')}
          className="text-cyan-300 hover:text-white text-sm font-bold mb-5 inline-flex items-center gap-1 transition"
        >
          ← Back to Login
        </button>

        {!done ? (
          <>
            <h1 className="text-2xl md:text-3xl font-extrabold text-center mb-2 bg-clip-text text-transparent bg-linear-to-r from-emerald-400 via-cyan-400 to-violet-400">
              Reset Password
            </h1>
            <p className="text-center text-sm text-gray-400 mb-6">
              Enter the OTP sent to your email and choose a new password
            </p>

            {error && (
              <div className="mb-4 text-center text-sm font-bold text-red-300 bg-red-900/30 border border-red-800/40 py-2 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                className="w-full bg-[#141b24] border border-[#1f2a38] text-white text-base p-3.5 rounded-lg font-semibold placeholder-gray-500 outline-none focus:border-cyan-500 transition"
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                className="w-full bg-[#141b24] border border-[#1f2a38] text-white text-center text-2xl tracking-[0.5em] font-mono p-3.5 rounded-lg placeholder-gray-600 outline-none focus:border-cyan-500 transition"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="------"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
              />
              <input
                className="w-full bg-[#141b24] border border-[#1f2a38] text-white text-base p-3.5 rounded-lg font-semibold placeholder-gray-500 outline-none focus:border-cyan-500 transition"
                type="password"
                placeholder="New password (min 6 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
              <input
                className="w-full bg-[#141b24] border border-[#1f2a38] text-white text-base p-3.5 rounded-lg font-semibold placeholder-gray-500 outline-none focus:border-cyan-500 transition"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-red-400 font-semibold px-1">Passwords do not match.</p>
              )}
              <button
                className="mt-1 w-full py-3 rounded-lg text-base font-extrabold bg-linear-to-r from-cyan-400 via-emerald-400 to-cyan-500 text-gray-950 hover:opacity-90 transition disabled:opacity-60"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center space-y-4">
            <div className="text-emerald-400 text-5xl mb-2">✅</div>
            <h2 className="text-xl font-extrabold text-white">Password Reset!</h2>
            <p className="text-sm text-gray-400">Your password has been changed successfully.</p>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-3 rounded-lg text-base font-extrabold bg-linear-to-r from-cyan-400 via-emerald-400 to-cyan-500 text-gray-950 hover:opacity-90 transition"
            >
              Log In Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
