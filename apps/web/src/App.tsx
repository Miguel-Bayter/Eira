import { Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MoodTracker from './pages/MoodTracker';
import Journal from './pages/Journal';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

function PlaceholderPage({ name }: { name: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-eira-50">
      <div className="rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-eira-700">🌿 Eira</h1>
        <p className="mt-2 text-slate-500">Página: {name}</p>
        <p className="mt-1 text-xs text-slate-400">En desarrollo...</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      {/* Rutas protegidas — requieren autenticación */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/mood" element={<ProtectedRoute><MoodTracker /></ProtectedRoute>} />
      <Route path="/journal" element={<ProtectedRoute><Journal /></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute><PlaceholderPage name="Chat IA" /></ProtectedRoute>} />
      <Route path="/community" element={<ProtectedRoute><PlaceholderPage name="Comunidad" /></ProtectedRoute>} />
      <Route path="/games" element={<ProtectedRoute><PlaceholderPage name="Juegos" /></ProtectedRoute>} />
    </Routes>
  );
}
