import React, { useState } from 'react';
import { Search, Flag, Eye, X, CheckCircle, AlertTriangle } from 'lucide-react';
import { getWorkers, saveWorkers, getClaims, PLANS } from '../store';

function WorkerModal({ worker, claims, onClose, onFlag }) {
  const plan = PLANS.find(p => p.id === worker.planId);
  const workerClaims = claims.filter(c => c.workerId === worker.id);

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-bg-surface rounded-3xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-border-line flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-text-main font-black">
              {worker.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-text-main font-bold text-lg">{worker.name}</h3>
              <p className="text-text-sub text-sm">{worker.phone} · {worker.zone}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-text-sub hover:text-text-main">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Details */}
          <div className="grid grid-cols-2 gap-3">
            {[
              ['Platform', worker.platform],
              ['Risk Score', worker.riskScore],
              ['Plan', plan?.name || 'No Plan'],
              ['Wallet', `₹${(worker.walletBalance || 0).toLocaleString()}`],
              ['Status', worker.status],
              ['Joined', worker.joinedAt],
            ].map(([label, val]) => (
              <div key={label} className="bg-bg-elevated/50 rounded-xl p-3">
                <p className="text-text-muted text-xs">{label}</p>
                <p className="text-text-main font-semibold text-sm">{val}</p>
              </div>
            ))}
          </div>

          {/* Flag button */}
          <button
            onClick={() => onFlag(worker)}
            className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition ${
              worker.suspicious
                ? 'bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20'
                : 'bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20'
            }`}
          >
            {worker.suspicious ? <><CheckCircle size={16} /> Remove Suspicious Flag</> : <><Flag size={16} /> Flag as Suspicious</>}
          </button>

          {/* Claims history */}
          <div>
            <h4 className="text-text-main font-bold mb-3">Claim History ({workerClaims.length})</h4>
            {workerClaims.length === 0 ? (
              <p className="text-text-muted text-sm">No claims yet</p>
            ) : (
              <div className="space-y-2">
                {workerClaims.map(claim => (
                  <div key={claim.id} className="flex items-center justify-between bg-bg-elevated/50 rounded-xl px-4 py-3">
                    <div>
                      <p className="text-text-main text-sm font-medium">{claim.event}</p>
                      <p className="text-text-muted text-xs">{claim.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-bold text-sm">₹{claim.payout}</p>
                      <p className={`text-xs ${claim.status === 'Paid' ? 'text-green-400' : 'text-yellow-400'}`}>{claim.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function WorkerManagement() {
  const [workers, setWorkers] = useState(getWorkers());
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const claims = getClaims();

  const reload = () => setWorkers(getWorkers());

  const filtered = workers.filter(w =>
    w.name.toLowerCase().includes(search.toLowerCase()) ||
    w.zone.toLowerCase().includes(search.toLowerCase()) ||
    w.platform.toLowerCase().includes(search.toLowerCase())
  );

  const handleFlag = (worker) => {
    const all = getWorkers();
    const idx = all.findIndex(w => w.id === worker.id);
    if (idx !== -1) {
      all[idx].suspicious = !all[idx].suspicious;
      saveWorkers(all);
      reload();
      setSelected(all[idx]);
    }
  };

  const riskColors = {
    Low: 'text-green-400 bg-green-400/10',
    Medium: 'text-yellow-400 bg-yellow-400/10',
    High: 'text-red-400 bg-red-400/10',
  };

  return (
    <div>
      {selected && (
        <WorkerModal
          worker={selected}
          claims={claims}
          onClose={() => setSelected(null)}
          onFlag={handleFlag}
        />
      )}

      <div className="mb-8">
        <p className="text-indigo-400 text-xs font-semibold uppercase tracking-widest mb-1">Management</p>
        <h1 className="text-3xl font-black text-text-main">Workers</h1>
        <p className="text-text-sub mt-1">{workers.length} registered partners</p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, zone, or platform..."
          className="w-full bg-bg-elevated border border-border-focus rounded-xl pl-11 pr-4 py-3 text-text-main placeholder-text-muted focus:outline-none focus:border-indigo-500 transition"
        />
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-line">
                {['Name', 'Zone', 'Platform', 'Plan', 'Risk', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-6 py-3 text-text-muted text-xs font-semibold uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((worker) => {
                const plan = PLANS.find(p => p.id === worker.planId);
                return (
                  <tr key={worker.id} className="border-b border-border-line hover:bg-white/2 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs font-bold">
                          {worker.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-text-main text-sm font-medium">{worker.name}</p>
                          {worker.suspicious && (
                            <span className="text-red-400 text-[10px] font-semibold flex items-center gap-0.5">
                              <AlertTriangle size={10} />Suspicious
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300 text-sm">{worker.zone}</td>
                    <td className="px-6 py-4 text-gray-300 text-sm">{worker.platform}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${plan ? 'bg-indigo-500/10 text-indigo-400' : 'bg-bg-element text-text-sub'}`}>
                        {plan?.name || 'No Plan'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${riskColors[worker.riskScore] || 'text-text-sub'}`}>
                        {worker.riskScore}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        worker.status === 'Active' ? 'bg-green-500/10 text-green-400' : 'bg-bg-element text-text-sub'
                      }`}>
                        {worker.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelected(worker)}
                        className="p-2 text-text-sub hover:text-text-main hover:bg-black/5 rounded-lg transition"
                      >
                        <Eye size={16} />
                      </button>
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
