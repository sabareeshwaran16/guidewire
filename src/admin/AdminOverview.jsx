import React from 'react';
import { getWorkers, getClaims, getTriggers, PLANS } from '../store';
import { Users, FileCheck, Wallet, Zap, TrendingUp } from 'lucide-react';

export default function AdminOverview() {
  const workers = getWorkers();
  const claims = getClaims();
  const triggers = getTriggers();

  const totalPayout = claims.filter(c => c.status === 'Paid').reduce((sum, c) => sum + c.payout, 0);
  const activeTriggers = Object.values(triggers).filter(t => t.active).length;
  const paidClaims = claims.filter(c => c.status === 'Paid').length;

  const stats = [
    { label: 'Registered Workers', value: workers.length, icon: Users, iconColor: 'text-indigo-400', sub: `${workers.filter(w => w.status === 'Active').length} active` },
    { label: 'Claims Processed', value: paidClaims, icon: FileCheck, iconColor: 'text-green-400', sub: `${claims.filter(c => c.status === 'Processing').length} processing` },
    { label: 'Total Payouts', value: `₹${totalPayout.toLocaleString()}`, icon: Wallet, iconColor: 'text-purple-400', sub: 'All time' },
    { label: 'Active Triggers', value: activeTriggers, icon: Zap, iconColor: 'text-red-400', sub: `of 5 triggers` },
  ];

  const recentClaims = claims.slice(0, 8);

  return (
    <div>
      <div className="mb-8">
        <p className="text-indigo-400 text-xs font-semibold uppercase tracking-widest mb-1">Dashboard</p>
        <h1 className="text-3xl font-black text-text-main">Overview</h1>
        <p className="text-text-sub mt-1">Real-time insurance operations</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, iconColor, sub }) => (
          <div key={label} className="bg-bg-elevated rounded-2xl p-5 border border-border-line">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 bg-bg-element rounded-xl flex items-center justify-center">
                <Icon size={20} className={iconColor} />
              </div>
              <TrendingUp size={16} className="text-text-muted" />
            </div>
            <p className="text-text-main text-3xl font-black">{value}</p>
            <p className="text-text-sub text-sm font-medium mt-1">{label}</p>
            <p className="text-text-muted text-xs mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Recent Claims */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border-line">
          <h2 className="text-text-main font-bold text-lg">Recent Claims</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-line">
                <th className="text-left px-6 py-3 text-text-muted text-xs font-semibold uppercase tracking-wide">Worker</th>
                <th className="text-left px-6 py-3 text-text-muted text-xs font-semibold uppercase tracking-wide">Date</th>
                <th className="text-left px-6 py-3 text-text-muted text-xs font-semibold uppercase tracking-wide">Event</th>
                <th className="text-left px-6 py-3 text-text-muted text-xs font-semibold uppercase tracking-wide">Zone</th>
                <th className="text-left px-6 py-3 text-text-muted text-xs font-semibold uppercase tracking-wide">Payout</th>
                <th className="text-left px-6 py-3 text-text-muted text-xs font-semibold uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentClaims.map((claim) => {
                const worker = getWorkers().find(w => w.id === claim.workerId);
                return (
                  <tr key={claim.id} className="border-b border-border-line hover:bg-white/2 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-bold">
                          {worker?.name.charAt(0) || '?'}
                        </div>
                        <span className="text-text-main text-sm font-medium">{worker?.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-sub text-sm">{claim.date}</td>
                    <td className="px-6 py-4">
                      <span className="text-sm">
                        {claim.event === 'Rain' ? '🌧️ ' : claim.event === 'Heat' ? '🌡️ ' : claim.event === 'AQI' ? '💨 ' : claim.event === 'Curfew' ? '🚫 ' : '📵 '}
                        {claim.event}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-text-sub text-sm">{claim.zone}</td>
                    <td className="px-6 py-4 text-green-400 font-bold text-sm">₹{claim.payout}</td>
                    <td className="px-6 py-4">
                      {claim.status === 'Paid' ? (
                        <span className="px-2.5 py-1 bg-green-500/10 text-green-400 text-xs font-semibold rounded-full">Paid</span>
                      ) : (
                        <span className="px-2.5 py-1 bg-yellow-500/10 text-yellow-400 text-xs font-semibold rounded-full">Processing</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
