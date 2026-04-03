import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { initStore, getCurrentAuth } from './store';
import { XCircle, CheckCircle } from 'lucide-react';

// Pages
import WorkerApp from './worker/WorkerApp';
import AdminApp from './admin/AdminApp';
import Login from './auth/Login';
import Register from './worker/Register';

// ─── CUSTOM TOAST SYSTEM ─────────────────────────────────────────────────────

function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleToast = (e) => {
      const id = Date.now();
      setToasts(prev => [...prev, { id, ...e.detail }]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 3000);
    };
    window.addEventListener('sp-toast', handleToast);
    return () => window.removeEventListener('sp-toast', handleToast);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className="animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="bg-bg-surface border border-border-line shadow-2xl rounded-xl px-4 py-3 flex items-center gap-3">
            {t.type === 'error' ? (
              <XCircle size={18} className="text-red-500" />
            ) : (
              <CheckCircle size={18} className="text-green-500" />
            )}
            <span className="text-text-main text-sm font-semibold">{t.message}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

window.toast = {
  error: (msg) => window.dispatchEvent(new CustomEvent('sp-toast', { detail: { message: msg, type: 'error' } })),
  success: (msg) => window.dispatchEvent(new CustomEvent('sp-toast', { detail: { message: msg, type: 'success' } }))
};

// ─── ROUTE PROTECTORS ────────────────────────────────────────────────────────

function ProtectedAdmin({ children }) {
  const auth = getCurrentAuth();
  if (!auth) return <Navigate to="/login" replace />;
  if (auth.role !== 'admin') {
    // Need to trigger toast after render
    setTimeout(() => window.toast.error('Access denied. Admin account required.'), 50);
    return <Navigate to="/" replace />;
  }
  return children;
}

function ProtectedWorker({ children }) {
  const auth = getCurrentAuth();
  if (!auth) return <Navigate to="/login" replace />;
  if (auth.role !== 'worker') {
    return <Navigate to="/admin" replace />;
  }
  return children;
}

function PublicOnly({ children }) {
  const auth = getCurrentAuth();
  if (auth) {
    return <Navigate to={auth.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }
  return children;
}

// ─── APP SHELL ───────────────────────────────────────────────────────────────

export default function App() {
  useEffect(() => {
    initStore();
  }, []);

  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
        <Route path="/register" element={<PublicOnly><Register /></PublicOnly>} />

        {/* Admin Dashboard */}
        <Route
          path="/admin/*"
          element={
            <ProtectedAdmin>
              <AdminApp />
            </ProtectedAdmin>
          }
        />

        {/* Worker Portal */}
        <Route
          path="/*"
          element={
            <ProtectedWorker>
              <WorkerApp />
            </ProtectedWorker>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
