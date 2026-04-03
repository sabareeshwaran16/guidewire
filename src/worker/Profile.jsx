import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, LogOut, Phone, MapPin, Clock, Star } from 'lucide-react';
import { PLANS, ZONE_RISK, logout } from '../store';

import ThemeToggle from '../ThemeToggle';

export default function Profile({ worker, onRefresh }) {
  const navigate = useNavigate();

  if (!worker) { navigate('/'); return null; }

  const plan = PLANS.find(p => p.id === worker.planId);
  const risk = ZONE_RISK[worker.zone];

  const handleLogout = () => {
    logout();
    onRefresh && onRefresh();
    navigate('/login');
  };

  const riskColors = {
    Low: 'text-green-400 bg-green-500/10 border-green-500/30',
    Medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
    High: 'text-red-400 bg-red-500/10 border-red-500/30',
  };

  return (
    <div className="min-h-screen bg-bg-base pb-8">
      {/* Header */}
      <div className="px-6 pt-12 pb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-text-main">Profile</h1>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-text-sub hover:text-red-400 transition text-sm"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center text-white text-3xl font-black mb-3">
            {worker.name.charAt(0)}
          </div>
          <h2 className="text-text-main text-xl font-bold">{worker.name}</h2>
          <p className="text-text-sub text-sm">{worker.platform} Partner</p>
          <div className={`mt-2 px-3 py-1 rounded-full border text-xs font-semibold ${riskColors[worker.riskScore] || 'text-text-sub'}`}>
            Risk: {worker.riskScore}
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="px-6 space-y-3">
        <div className="glass rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Phone size={16} className="text-indigo-400" />
            <div>
              <p className="text-text-muted text-xs">Phone</p>
              <p className="text-text-main font-medium">+91 {worker.phone}</p>
            </div>
          </div>
          <div className="border-t border-border-line" />
          <div className="flex items-center gap-3">
            <MapPin size={16} className="text-indigo-400" />
            <div>
              <p className="text-text-muted text-xs">Zone</p>
              <p className="text-text-main font-medium">{worker.zone}</p>
            </div>
          </div>
          <div className="border-t border-border-line" />
          <div className="flex items-center gap-3">
            <Clock size={16} className="text-indigo-400" />
            <div>
              <p className="text-text-muted text-xs">Working Hours</p>
              <p className="text-text-main font-medium">{worker.avgHours} hours/day</p>
            </div>
          </div>
          <div className="border-t border-border-line" />
          <div className="flex items-center gap-3">
            <Star size={16} className="text-indigo-400" />
            <div>
              <p className="text-text-muted text-xs">Member Since</p>
              <p className="text-text-main font-medium">{worker.joinedAt}</p>
            </div>
          </div>
        </div>

        {/* Active Plan */}
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={16} className="text-purple-400" />
            <span className="text-text-main font-semibold">Active Plan</span>
          </div>
          {plan ? (
            <div className="rounded-xl bg-bg-elevated p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-text-main font-black text-lg">{plan.name}</p>
                  <p className="text-text-sub text-xs">Coverage: ₹{plan.coverage}</p>
                </div>
                <div className="text-right">
                  <p className="text-text-main font-bold">₹{plan.weeklyPremium}/wk</p>
                  <p className="text-text-muted text-xs">Active</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-text-sub text-sm">No plan active. <button className="text-indigo-400 underline" onClick={() => navigate('/plans')}>Choose a plan</button></p>
          )}
        </div>

        {/* Wallet */}
        <div className="glass rounded-2xl p-4">
          <p className="text-text-sub text-sm mb-1">Wallet Balance</p>
          <p className="text-text-main text-3xl font-black">₹{(worker.walletBalance || 0).toLocaleString()}</p>
          <p className="text-text-muted text-xs mt-1">Credits added automatically when triggers activate</p>
        </div>

        {worker.suspicious && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center gap-3">
            <div className="text-red-400 text-2xl">⚠️</div>
            <div>
              <p className="text-red-400 font-bold text-sm">Account Flagged</p>
              <p className="text-red-300/70 text-xs">Your account has been flagged for review. Auto-payouts are paused.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
