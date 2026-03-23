import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { Toaster } from 'sonner';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MoodTracker from './pages/MoodTracker';
import Journal from './pages/Journal';
import Chat from './pages/Chat';
import Community from './pages/Community';
import Games from './pages/Games';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { PageTransition } from './components/layout/PageTransition';
import { CommandPalette } from './components/ui/CommandPalette';
import { useAuthSessionBootstrap } from './hooks/useAuth';

export default function App() {
  const location = useLocation();

  useAuthSessionBootstrap();

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'font-sans text-sm',
          duration: 4000,
        }}
        richColors
      />
      <CommandPalette />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/register"
            element={
              <PageTransition>
                <Register />
              </PageTransition>
            }
          />
          <Route
            path="/login"
            element={
              <PageTransition>
                <Login />
              </PageTransition>
            }
          />

          {/* Protected routes — require authentication */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <PageTransition>
                  <Dashboard />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/mood"
            element={
              <ProtectedRoute>
                <PageTransition>
                  <MoodTracker />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/journal"
            element={
              <ProtectedRoute>
                <PageTransition>
                  <Journal />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <PageTransition>
                  <Chat />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/community"
            element={
              <ProtectedRoute>
                <PageTransition>
                  <Community />
                </PageTransition>
              </ProtectedRoute>
            }
          />
          <Route
            path="/games"
            element={
              <ProtectedRoute>
                <PageTransition>
                  <Games />
                </PageTransition>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AnimatePresence>
    </>
  );
}
