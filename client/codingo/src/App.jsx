import './App.css'
import axios from 'axios';
import { BrowserRouter, Routes, Route, useParams, useNavigate, Navigate, useLocation } from "react-router-dom";
import LoginPage from './pages/LoginPage.jsx'
import RegisterationPage from './pages/RegisterationPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import SignupNextPage from './pages/SignupNextPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import LevelsPage from './pages/LevelsPage';
import LanguagePage from './pages/LanguagePage.jsx';
import LearnPage from './pages/LearnPage.jsx';
import { LeaderboardPage } from './pages/LeaderboardPage.jsx';
import ChallengePage from './pages/ChallengePage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import CommunityPage from './pages/CommunityPage.jsx';
import ProgressPage from './pages/ProgressPage.jsx';
import { FriendsPage } from './pages/FriendsPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';
import OAuthCallbackPage from './pages/OAuthCallbackPage.jsx';
import { useEffect, useState } from 'react';
import LandingPage from './pages/LandingPage.jsx';
import LandingHeader from './components/LandingPage/LandingHeader.jsx';
import AppSidebar from './components/Layout/AppSidebar.jsx';
import LevelPage from './pages/LevelPage.jsx';
import Messages from './pages/messages.jsx';
import Comments from './pages/CommentsModal.jsx';
import SocialProfileSection from './pages/SocialProfilePage.jsx';
import GlassFeed from './pages/LandinPageExperimental.jsx';
import DiscoverPage from './pages/discoverPage.jsx';
import AskIgris from './pages/askIgris.jsx';
import RememberIgris from './pages/rememberIgris.jsx';
import { onMessage } from './firebase';
import { registerPushNotifications } from './notifications/registerPushNotifications';

function ProtectedRoute({ children }) {
  const [isChecking, setIsChecking] = useState(true);
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function checkAuth() {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const token = localStorage.getItem('token');

        const response = await axios.get(`${apiUrl}/api/auth/user/me`, {
          withCredentials: true,
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        if (!isActive) return;
        if (response.data?.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
          setIsAllowed(true);
        } else {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          setIsAllowed(false);
        }
      } catch {
        if (!isActive) return;
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setIsAllowed(false);
      } finally {
        if (isActive) setIsChecking(false);
      }
    }

    checkAuth();
    return () => {
      isActive = false;
    };
  }, []);
  const fullScreen = true;
  const label = "ORBIT";
  const subtext = "Loading your feed...";
  const wrapperClass = fullScreen
    ? "fixed inset-0 z-50 bg-black"
    : "w-full";

  if (isChecking) {
    return (
      <div className={`${wrapperClass} flex flex-col items-center justify-center gap-6`}>
        <div className="relative mx-auto w-full max-w-xs aspect-square">
          <svg viewBox="0 0 400 400" className="w-full h-full">
            {/* static background rings — orbital paths */}
            <circle cx="200" cy="200" r="165" fill="none" stroke="rgba(148,163,184,0.12)" />
            <circle cx="200" cy="200" r="130" fill="none" stroke="rgba(148,163,184,0.14)" />
            <circle cx="200" cy="200" r="90" fill="none" stroke="rgba(148,163,184,0.16)" />

            {/* orbiting dots — each <g> rotates around the shared center (200,200) */}
            <g className="orbit orbit-3">
              <circle cx="200" cy="35" r="9" fill="#c084fc" />
            </g>
            <g className="orbit orbit-2">
              <circle cx="200" cy="70" r="9" fill="#2dd4bf" />
            </g>
            <g className="orbit orbit-1">
              <circle cx="200" cy="110" r="9" fill="#fb923c" />
            </g>
          </svg>

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="core-pulse w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 via-teal-400 to-violet-400 flex items-center justify-center font-semibold text-slate-950 text-sm tracking-tight">
              {label}
            </div>
          </div>
        </div>

        <p className="text-slate-400 text-sm">{subtext}</p>

        <style>{`
        .orbit {
          transform-origin: 200px 200px;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          animation-name: orbit-spin;
        }
        /* smaller ring = faster orbit, bigger ring = slower — same
           relationship real orbits have (inner planets move faster) */
        .orbit-1 { animation-duration: 6s; }
        .orbit-2 { animation-duration: 8.5s; }
        .orbit-3 { animation-duration: 11s; }
 
        @keyframes orbit-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
 
        .core-pulse {
          animation: core-pulse 2.2s ease-in-out infinite;
        }
        @keyframes core-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.08); opacity: 0.85; }
        }
 
        @media (prefers-reduced-motion: reduce) {
          .orbit, .core-pulse { animation: none; }
        }
      `}</style>
      </div>
    );
  }

  return isAllowed ? children : <Navigate to="/login" replace />;
}

function App() {

  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}

function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();

  // Runs synchronously during render — must happen here, not in a
  // useEffect, because ProtectedRoute (a descendant) fires its own
  // auth-check effect before any effect declared in this component
  // would (React fires passive effects bottom-up on mount).
  const urlToken = new URLSearchParams(window.location.search).get('token');
  if (urlToken) {
    localStorage.setItem('token', urlToken);
  }

  // Cosmetic: strip ?token= from the address bar once mounted, via
  // React Router's own navigate so its internal location state stays
  // in sync (a raw window.history.replaceState call would desync it).
  useEffect(() => {
    if (urlToken) {
      navigate(location.pathname, { replace: true });
    }
  }, []);

  const sidebarHiddenRoutes = ['/', '/login', '/Login', '/signup', '/next-step', '/forgot-password', '/reset-password', '/oauth/callback'];
  const showSidebar = !sidebarHiddenRoutes.includes(location.pathname);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !('Notification' in window) || Notification.permission !== 'granted') return;

    registerPushNotifications().catch((error) => {
      console.error('Failed to register push notifications:', error);
    });
  }, []);

  useEffect(() => {
    if (!('Notification' in window)) return undefined;

    return onMessage((payload) => {
      const title = payload.notification?.title || 'Orbit';
      const body = payload.notification?.body || '';
      new Notification(title, { body });
    });
  }, []);

  return (
    <>
      {/* <LandingHeader /> */}
      <div className="flex max-h-screen">
        {showSidebar ? <AppSidebar /> : null}
        <div className={`flex-1 min-w-0 max-h-screen ${showSidebar ? 'pl-10 lg:pl-0' : ''}`}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/language/:langId" element={<LanguagePageWrapper />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterationPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
            <Route path="/next-step" element={<ProtectedRoute><SignupNextPage /></ProtectedRoute>} />
            <Route
              path="/dashboard"
              element={(
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/Dashboard"
              element={(
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/levels"
              element={(
                <ProtectedRoute>
                  <LevelsPage />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/levels"
              element={(
                <ProtectedRoute>
                  <LevelsPage />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/experimental"
              element={(
                <ProtectedRoute>
                  <GlassFeed />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/Learn"
              element={(
                <ProtectedRoute>
                  <LearnPage />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/leaderboard"
              element={(
                <ProtectedRoute>
                  <LeaderboardPage />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/challenges"
              element={(
                <ProtectedRoute>
                  <ChallengePage />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/comments"
              element={(
                <ProtectedRoute>
                  <Comments />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/messages"
              element={(
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/socialprofile/:userId?"
              element={(
                <ProtectedRoute>
                  <SocialProfileSection />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/profile"
              element={(
                <ProtectedRoute>
                  <SocialProfileSection />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/discover"
              element={(
                <ProtectedRoute>
                  <DiscoverPage />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/askIgris"
              element={(
                <ProtectedRoute>
                  <AskIgris />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/rememberIgris"
              element={(
                <ProtectedRoute>
                  <RememberIgris />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/profile/:userId"
              element={(
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/progress"
              element={(
                <ProtectedRoute>
                  <ProgressPage />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/friends"
              element={(
                <ProtectedRoute>
                  <FriendsPage />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/community"
              element={(
                <ProtectedRoute>
                  <CommunityPage />
                </ProtectedRoute>
              )}
            />
            <Route path="/level/:courseId/:levelNo" element={<LevelPage />} />
            <Route path="/levels/:courseId" element={<LevelsPageWrapper />} />
            <Route path="/languagepage" element={<LanguagePage />} />
          </Routes>
        </div>
      </div>
    </>
  )
}

function LanguagePageWrapper() {
  const { langId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [langId]);

  return (
    <LanguagePage
      langId={langId}
      onBack={() => navigate("/")}
    />
  );
}

function LevelsPageWrapper() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const hasSession = Boolean(localStorage.getItem('user') || localStorage.getItem('token'));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [courseId]);

  if (!hasSession) {
    return <Navigate to="/login" replace />;
  }

  return <LevelsPage courseId={courseId} onBack={() => navigate("/dashboard")} />;
}

export default App  