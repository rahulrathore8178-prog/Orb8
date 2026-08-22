import './App.css'
import axios from 'axios';
import { BrowserRouter, Routes, Route, useParams, useNavigate, Navigate, useLocation } from "react-router-dom";
import LoginPage from './pages/LoginPage.jsx'
import RegisterationPage from './pages/RegisterationPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import SignupNextPage from './pages/SignupNextPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import WelcomePage from './pages/WelcomePage.jsx';
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

  if (isChecking) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-50">
        <div className="flex flex-col items-center">
          {/* Spinner */}
          <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>

          {/* Loading text */}
          <p className="mt-4 text-white text-lg font-semibold animate-pulse">
            Loading data...
          </p>
        </div>
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
  const sidebarHiddenRoutes = ['/', '/login', '/Login', '/signup', '/next-step', '/forgot-password', '/reset-password', '/oauth/callback'];
  const showSidebar = !sidebarHiddenRoutes.includes(location.pathname);

  return (
    <>
      {/* <LandingHeader /> */}
      <div className="flex min-h-screen">
        {showSidebar ? <AppSidebar /> : null}
        <div className={`flex-1 min-w-0 min-h-screen ${showSidebar ? 'pl-10 lg:pl-0' : ''}`}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/language/:langId" element={<LanguagePageWrapper />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/Login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterationPage />} />
            <Route path="/Register" element={<RegisterationPage />} />
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
            <Route path="/welcome" element={<ProtectedRoute><WelcomePage /></ProtectedRoute>} />
            <Route path="/Welcome" element={<ProtectedRoute><WelcomePage /></ProtectedRoute>} />
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
                  <ProfilePage />
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