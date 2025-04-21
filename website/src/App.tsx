import { HashRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Overview from './pages/Overview';
import Shifts from './pages/Shifts';
import Schedule from './pages/Schedule';
import Employers from './pages/Employers';
import Me from './pages/Me';
import { useEffect } from 'react';
import CasualPayLogo from './components/CasualPayLogo';
import BottomToolbar from './components/BottomToolbar';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import GoogleLoginButton from './components/GoogleLoginButton';
import { GOOGLE_CLIENT_ID } from './config/auth';
import { initGoogleAuthDiagnostics } from './utils/googleAuthHelper';
import ProtectedRoute from './components/ProtectedRoute';

// AppContent component to use hooks inside Router
function AppContent() {
  // No longer need menuOpen state since we removed the menu
  const { isLoggedIn } = useAuth();
  const location = useLocation();
  
  // Determine if we're on the home page
  const isHomePage = location.pathname === '/';
  
  // Only show toolbar for logged-in users or on non-home pages
  const showToolbar = isLoggedIn || !isHomePage;
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple header with just the logo */}
      <header className="bg-blue-800 shadow-sm">
        <div className="container mx-auto max-w-screen-md px-4 py-3 flex justify-between items-center text-white">
          <div className="flex items-center">
            <a href="#/" className="cursor-pointer hover:opacity-80 transition-opacity">
              <CasualPayLogo size="medium" variant="default" />
            </a>
          </div>
          
          {/* Only show login button if not logged in and not on home page */}
          <div className="flex items-center gap-4">
            {!isLoggedIn && !isHomePage && (
              <GoogleLoginButton />
            )}
            {/* Show BottomToolbar in header on desktop only */}
            <div className="hidden md:block bg-blue-800 text-white rounded-md">
              {showToolbar && <BottomToolbar />}
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className={`py-4 ${showToolbar ? 'pb-20' : 'pb-4'}`}>  {/* Conditional padding based on toolbar visibility */}
        <Routes>
          {/* Public route */}
          <Route path="/" element={<Home />} />
          
          {/* Protected routes - require authentication */}
          <Route path="/overview" element={
            <ProtectedRoute>
              <Overview />
            </ProtectedRoute>
          } />

          <Route path="/shifts" element={
            <ProtectedRoute>
              <Shifts />
            </ProtectedRoute>
          } />
          
          <Route path="/schedule" element={
            <ProtectedRoute>
              <Schedule />
            </ProtectedRoute>
          } />
          <Route path="/employers" element={
            <ProtectedRoute>
              <Employers />
            </ProtectedRoute>
          } />
          <Route path="/calendar" element={
            <ProtectedRoute>
              <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold">Calendar</h1>
                <p className="mt-4">This page is under construction.</p>
              </div>
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Me />
            </ProtectedRoute>
          } />
          
          {/* Catch all route - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      
      {/* Bottom Toolbar - only shown for logged-in users or on non-home pages, mobile only */}
      <div className="md:hidden bg-blue-800 text-white rounded-md">
        {showToolbar && <BottomToolbar />}
      </div>
    </div>
  );
}

function App() {
  useEffect(() => {
    // Initialize Google authentication diagnostics
    initGoogleAuthDiagnostics();
  }, []);

  return (
    <Router>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </GoogleOAuthProvider>
    </Router>
  );
}

export default App;
