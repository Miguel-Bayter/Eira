import { Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

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
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/mood" element={<PlaceholderPage name="Mood Tracker" />} />
      <Route path="/journal" element={<PlaceholderPage name="Diario" />} />
      <Route path="/chat" element={<PlaceholderPage name="Chat IA" />} />
      <Route path="/community" element={<PlaceholderPage name="Comunidad" />} />
      <Route path="/games" element={<PlaceholderPage name="Juegos" />} />
    </Routes>
  );
}
