import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Home, FileText, Shield, User } from 'lucide-react';
import { getCurrentWorker } from '../store';

import Register from './Register';
import WhatsappOnboarding from './WhatsappOnboarding';
import Plans from './Plans';
import Dashboard from './Dashboard';
import Profile from './Profile';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Home', icon: Home },
  { path: '/plans', label: 'Plans', icon: Shield },
  { path: '/claims', label: 'Claims', icon: FileText },
  { path: '/profile', label: 'Profile', icon: User },
];

export default function WorkerApp() {
  const [worker, setWorker] = useState(getCurrentWorker());
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const w = getCurrentWorker();
    setWorker(w);
  }, [location.pathname]);

  const refreshWorker = () => {
    setWorker(getCurrentWorker());
  };

  const isOnboarding =
    location.pathname === '/' ||
    location.pathname === '/register' ||
    location.pathname === '/onboarding';

  return (
    <div className="min-h-screen bg-bg-base flex flex-col max-w-md mx-auto relative">
      {/* Routes */}
      <div className={`flex-1 ${!isOnboarding ? 'pb-20' : ''}`}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/onboarding" element={<WhatsappOnboarding onComplete={refreshWorker} />} />
          <Route path="/dashboard" element={<Dashboard worker={worker} onRefresh={refreshWorker} />} />
          <Route path="/plans" element={<Plans worker={worker} onRefresh={refreshWorker} />} />
          <Route path="/claims" element={<Dashboard worker={worker} onRefresh={refreshWorker} claimsOnly />} />
          <Route path="/profile" element={<Profile worker={worker} onRefresh={refreshWorker} />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>

      {/* Bottom Navigation */}
      {!isOnboarding && worker && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50">
          <div className="glass-dark border-t border-border-line px-2 py-2">
            <div className="flex justify-around">
              {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
                const active = location.pathname === path || (path === '/claims' && location.pathname === '/claims');
                return (
                  <button
                    key={path}
                    onClick={() => navigate(path)}
                    className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${
                      active
                        ? 'text-indigo-400 bg-indigo-500/10'
                        : 'text-text-muted hover:text-gray-300'
                    }`}
                  >
                    <Icon size={20} strokeWidth={active ? 2.5 : 1.5} />
                    <span className="text-[11px] font-medium">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
