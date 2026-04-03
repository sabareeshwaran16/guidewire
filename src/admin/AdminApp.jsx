import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import {
  Shield, LayoutDashboard, Users, Zap, BarChart3, AlertTriangle, LogOut, Menu, X
} from 'lucide-react';

import TriggerPanel from './TriggerPanel';
import WorkerManagement from './WorkerManagement';
import Analytics from './Analytics';
import FraudMonitor from './FraudMonitor';
import AdminOverview from './AdminOverview';
import { logout } from '../store';
import ThemeToggle from '../ThemeToggle';

const NAV_ITEMS = [
  { path: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { path: '/admin/triggers', label: 'Trigger Control', icon: Zap },
  { path: '/admin/workers', label: 'Workers', icon: Users },
  { path: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/admin/fraud', label: 'Risk & Fraud', icon: AlertTriangle },
];

export default function AdminApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path, exact) =>
    exact ? location.pathname === path : location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-bg-base flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-bg-surface border-r border-border-line z-50 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:relative lg:flex lg:z-auto`}
      >
        {/* Logo */}
        <div className="px-6 py-6 border-b border-border-line">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
              <Shield size={18} className="text-text-main" />
            </div>
            <div>
              <p className="text-text-main font-black text-lg leading-none">StillPaid</p>
              <p className="text-text-muted text-xs">Admin Dashboard</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map(({ path, label, icon: Icon, exact }) => (
            <button
              key={path}
              onClick={() => { navigate(path); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                isActive(path, exact)
                  ? 'bg-indigo-600 text-text-main shadow-lg shadow-indigo-500/20'
                  : 'text-text-sub hover:text-text-main hover:bg-black/5'
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="px-3 pb-6 border-t border-border-line pt-4">
          <div className="flex items-center justify-between px-4 py-2">
            <span className="text-xs text-text-muted font-semibold">Theme</span>
            <ThemeToggle />
          </div>
          <a
            href="/"
            target="_blank"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-text-sub hover:text-text-main hover:bg-black/5 transition"
          >
            <Shield size={18} />
            Worker Portal ↗
          </a>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-text-sub hover:text-red-400 hover:bg-red-500/5 transition"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile) */}
        <div className="lg:hidden flex items-center justify-between px-4 py-4 border-b border-border-line bg-bg-surface">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="text-text-sub hover:text-text-main">
              <Menu size={22} />
            </button>
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-indigo-400" />
              <span className="text-text-main font-bold">StillPaid Admin</span>
            </div>
          </div>
          <ThemeToggle />
        </div>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          <Routes>
            <Route path="/" element={<AdminOverview />} />
            <Route path="/triggers" element={<TriggerPanel />} />
            <Route path="/workers" element={<WorkerManagement />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/fraud" element={<FraudMonitor />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
