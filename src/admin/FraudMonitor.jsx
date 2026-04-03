import React from 'react';
import { AlertTriangle, ShieldAlert, Activity } from 'lucide-react';
import { getClaims, getWorkers, formatDate } from '../store';

function daysBetween(dateStr) {
  // dateStr is DD/MM/YYYY
  const [d, m, y] = dateStr.split('/').map(Number);
  const date = new Date(y, m - 1, d);
  const now = new Date();
  const diff = (now - date) / (1000 * 60 * 60 * 24);
  return diff;
}

export default function FraudMonitor() {
  const claims = getClaims();
  const workers = getWorkers();

  // High risk: 3+ claims in last 7 days
  const highRisk = workers.map(worker => {
    const recent = claims.filter(c => c.workerId === worker.id && daysBetween(c.date) <= 7);
    return { worker, recentCount: recent.length };
  }).filter(x => x.recentCount >= 3);

  // Anomaly log: workers with 4+ claims this week
  const anomalies = highRisk.filter(x => x.recentCount >= 4);

  // Suspicious workers
  const suspicious = workers.filter(w => w.suspicious);

  return (
    <div>
      <div className="mb-8">
        <p className="text-indigo-400 text-xs font-semibold uppercase tracking-widest mb-1">Monitoring</p>
        <h1 className="text-3xl font-black text-text-main">Risk & Fraud Monitor</h1>
        <p className="text-text-sub mt-1">Anomaly detection and fraud prevention</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="glass rounded-2xl p-5">
          <ShieldAlert size={20} className="text-red-400 mb-3" />
          <p className="text-3xl font-black text-text-main">{highRisk.length}</p>
          <p className="text-text-sub text-sm mt-1">High Risk Workers</p>
          <p className="text-gray-600 text-xs">3+ claims in last 7 days</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <AlertTriangle size={20} className="text-orange-400 mb-3" />
          <p className="text-3xl font-black text-text-main">{anomalies.length}</p>
          <p className="text-text-sub text-sm mt-1">Anomalies Detected</p>
          <p className="text-gray-600 text-xs">4+ claims this week</p>
        </div>
        <div className="glass rounded-2xl p-5">
          <Activity size={20} className="text-purple-400 mb-3" />
          <p className="text-3xl font-black text-text-main">{suspicious.length}</p>
          <p className="text-text-sub text-sm mt-1">Flagged Accounts</p>
          <p className="text-gray-600 text-xs">Payouts blocked</p>
        </div>
      </div>

      {/* High Risk Workers */}
      <div className="glass rounded-2xl overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-border-line flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <h2 className="text-text-main font-bold text-lg">High Risk Workers</h2>
        </div>
        {highRisk.length === 0 ? (
          <div className="px-6 py-8 text-center text-text-muted">
            No high risk workers detected
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {highRisk.map(({ worker, recentCount }) => (
              <div key={worker.id} className="flex items-center gap-4 px-6 py-4">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 font-black text-sm">
                  {worker.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-text-main font-medium">{worker.name}</p>
                    {worker.suspicious && (
                      <span className="bg-red-500/20 text-red-400 text-[10px] px-2 py-0.5 rounded-full font-bold">FLAGGED</span>
                    )}
                  </div>
                  <p className="text-text-sub text-xs">{worker.zone} · {worker.platform}</p>
                </div>
                <div className="text-right">
                  <p className="text-red-400 font-black text-xl">{recentCount}</p>
                  <p className="text-text-muted text-xs">claims this week</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Anomaly Log */}
      <div className="glass rounded-2xl overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-border-line">
          <h2 className="text-text-main font-bold text-lg">Anomaly Log</h2>
        </div>
        <div className="p-4 space-y-3">
          {anomalies.length === 0 ? (
            <p className="text-text-muted text-sm px-2">No anomalies detected in the current period.</p>
          ) : (
            anomalies.map(({ worker, recentCount }) => (
              <div key={worker.id} className="flex items-start gap-3 bg-orange-500/5 border border-orange-500/20 rounded-xl px-4 py-3">
                <AlertTriangle size={16} className="text-orange-400 mt-0.5 flex-shrink-0" />
                <p className="text-orange-200 text-sm">
                  <span className="font-bold text-text-main">{worker.name}</span> claimed{' '}
                  <span className="text-orange-400 font-bold">{recentCount} times</span> this week in {worker.zone} —{' '}
                  <span className="text-orange-300">flagged for review</span>
                </p>
              </div>
            ))
          )}
          {/* Additional static anomaly example for demo */}
          {anomalies.length === 0 && claims.length > 0 && (
            <div className="flex items-start gap-3 bg-yellow-500/5 border border-yellow-500/20 rounded-xl px-4 py-3">
              <AlertTriangle size={16} className="text-yellow-400 mt-0.5 flex-shrink-0" />
              <p className="text-yellow-200 text-sm">
                System is monitoring all workers for unusual claim patterns. Anomalies will appear here automatically.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Flagged Accounts */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border-line">
          <h2 className="text-text-main font-bold text-lg">Flagged Accounts</h2>
        </div>
        {suspicious.length === 0 ? (
          <div className="px-6 py-8 text-center text-text-muted">
            No accounts currently flagged as suspicious
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {suspicious.map(worker => {
              const workerClaims = claims.filter(c => c.workerId === worker.id);
              const totalPayout = workerClaims.reduce((s, c) => s + c.payout, 0);
              return (
                <div key={worker.id} className="flex items-center gap-4 px-6 py-4">
                  <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 font-black text-sm">
                    {worker.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-text-main font-medium">{worker.name}</p>
                    <p className="text-text-muted text-xs">{worker.zone} · {workerClaims.length} total claims · ₹{totalPayout} received</p>
                  </div>
                  <div>
                    <span className="bg-red-500/20 text-red-400 text-xs px-3 py-1.5 rounded-full font-bold">
                      Payouts Blocked
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
