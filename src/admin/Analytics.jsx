import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { getClaims, getWorkers, getTriggers } from '../store';

const TRIGGER_EMOJIS = {
  Rain: '🌧️',
  Heat: '🌡️',
  AQI: '💨',
  Curfew: '🚫',
  'Platform Downtime': '📵',
};

const BAR_COLORS = {
  Rain: '#6366f1',
  Heat: '#f97316',
  AQI: '#8b5cf6',
  Curfew: '#ef4444',
  'Platform Downtime': '#ec4899',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-bg-elevated border border-border-line rounded-xl px-4 py-3 shadow-xl">
        <p className="text-text-main font-bold text-sm">{TRIGGER_EMOJIS[label]} {label}</p>
        <p className="text-indigo-400 font-black text-lg">₹{payload[0].value.toLocaleString()}</p>
        <p className="text-text-muted text-xs">{payload[0].payload.count} claims</p>
      </div>
    );
  }
  return null;
};

export default function Analytics() {
  const claims = getClaims();
  const workers = getWorkers();
  const triggers = getTriggers();

  const totalPayout = claims.filter(c => c.status === 'Paid').reduce((sum, c) => sum + c.payout, 0);
  const activeTriggers = Object.values(triggers).filter(t => t.active).length;

  // Claims by trigger
  const byTrigger = ['Rain', 'Heat', 'AQI', 'Curfew', 'Platform Downtime'].map(name => {
    const triggerClaims = claims.filter(c => c.event === name);
    return {
      name,
      payout: triggerClaims.filter(c => c.status === 'Paid').reduce((s, c) => s + c.payout, 0),
      count: triggerClaims.length,
    };
  });

  const recentClaims = claims.slice(0, 10);

  return (
    <div>
      <div className="mb-8">
        <p className="text-indigo-400 text-xs font-semibold uppercase tracking-widest mb-1">Analytics</p>
        <h1 className="text-3xl font-black text-text-main">Claims Analytics</h1>
        <p className="text-text-sub mt-1">Platform-wide insurance insights</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Claims', value: claims.filter(c => c.status === 'Paid').length, color: 'text-indigo-400' },
          { label: 'Total Payout', value: `₹${totalPayout.toLocaleString()}`, color: 'text-green-400' },
          { label: 'Active Triggers', value: activeTriggers, color: 'text-red-400' },
          { label: 'Registered Workers', value: workers.length, color: 'text-purple-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass rounded-2xl p-5">
            <p className="text-text-muted text-xs mb-2">{label}</p>
            <p className={`text-2xl font-black ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Bar Chart */}
      <div className="glass rounded-2xl p-6 mb-6">
        <h2 className="text-text-main font-bold text-lg mb-6">Payouts by Trigger Type</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={byTrigger} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
            <XAxis
              dataKey="name"
              tick={{ fill: '#6b7280', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#6b7280', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => `₹${v}`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
            <Bar dataKey="payout" radius={[8, 8, 0, 0]}>
              {byTrigger.map((entry) => (
                <Cell key={entry.name} fill={BAR_COLORS[entry.name] || '#6366f1'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Claim count breakdown */}
      <div className="glass rounded-2xl p-6 mb-6">
        <h2 className="text-text-main font-bold text-lg mb-4">Claims by Event Type</h2>
        <div className="space-y-3">
          {byTrigger.sort((a, b) => b.count - a.count).map(item => {
            const maxCount = Math.max(...byTrigger.map(b => b.count)) || 1;
            return (
              <div key={item.name} className="flex items-center gap-4">
                <span className="text-gray-300 text-sm w-36 flex-shrink-0">
                  {TRIGGER_EMOJIS[item.name]} {item.name}
                </span>
                <div className="flex-1 h-3 bg-bg-elevated rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(item.count / maxCount) * 100}%`,
                      background: BAR_COLORS[item.name],
                    }}
                  />
                </div>
                <span className={`text-sm font-bold w-8 text-right`} style={{ color: BAR_COLORS[item.name] }}>
                  {item.count}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Claims */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border-line">
          <h2 className="text-text-main font-bold text-lg">Recent Claims</h2>
        </div>
        <div className="divide-y divide-white/5">
          {recentClaims.map(claim => {
            const worker = getWorkers().find(w => w.id === claim.workerId);
            return (
              <div key={claim.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-white/2 transition">
                <span className="text-lg">{TRIGGER_EMOJIS[claim.event]}</span>
                <div className="flex-1">
                  <p className="text-text-main text-sm font-medium">{worker?.name || 'Unknown'}</p>
                  <p className="text-text-muted text-xs">{claim.event} · {claim.date} · {claim.zone}</p>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-bold">₹{claim.payout}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    claim.status === 'Paid' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                  }`}>{claim.status}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
