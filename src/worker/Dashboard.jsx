import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet, Shield, Bell, CheckCircle, Clock, AlertTriangle,
  CloudRain, Thermometer, Wind, Ban, Smartphone, RefreshCw
} from 'lucide-react';
import {
  PLANS, TRIGGER_CONFIG,
  getCurrentWorker, getClaims, getTriggers,
  addClaim, updateClaim, updateWorker, getWorkers, saveWorkers,
  generateId, formatDate
} from '../store';

function ClaimStatusBadge({ status }) {
  if (status === 'Paid')
    return <span className="flex items-center gap-1 text-green-400 text-xs font-semibold"><CheckCircle size={12} />Paid</span>;
  if (status === 'Processing')
    return <span className="flex items-center gap-1 text-yellow-400 text-xs font-semibold"><Clock size={12} />Processing</span>;
  return <span className="text-text-sub text-xs">{status}</span>;
}

const TRIGGER_ICONS = {
  Rain: CloudRain,
  Heat: Thermometer,
  AQI: Wind,
  Curfew: Ban,
  'Platform Downtime': Smartphone,
};

function TriggerRow({ name, config, data }) {
  const isToggle = !config.threshold;
  const active = data?.active;
  const value = data?.value;
  const Icon = TRIGGER_ICONS[name] || AlertTriangle;

  let statusText = '';
  let statusColor = 'text-text-sub';
  if (isToggle) {
    statusText = active ? 'ACTIVE' : 'Inactive';
    statusColor = active ? 'text-red-400' : 'text-text-muted';
  } else {
    statusText = `${value} ${config.unit}`;
    if (active) statusColor = 'text-red-400';
    else if (value >= config.threshold * 0.8) statusColor = 'text-yellow-400';
    else statusColor = 'text-green-400';
  }

  return (
    <div className={`flex items-center gap-3 py-3 border-b border-border-line last:border-0 ${active ? 'opacity-100' : 'opacity-70'}`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${active ? 'bg-red-500/20' : 'bg-bg-element/50'}`}>
        <Icon size={16} className={active ? 'text-red-400' : 'text-text-sub'} />
      </div>
      <div className="flex-1">
        <p className="text-text-main text-sm font-medium">{name}</p>
        {config.threshold && (
          <p className="text-text-muted text-xs">Threshold: {config.threshold} {config.unit}</p>
        )}
      </div>
      <div className="text-right">
        <p className={`text-sm font-bold ${statusColor}`}>{statusText}</p>
        {active && <p className="text-red-400 text-[10px] font-semibold uppercase tracking-wide animate-pulse">● Triggered</p>}
      </div>
    </div>
  );
}

export default function Dashboard({ worker, onRefresh, claimsOnly }) {
  const navigate = useNavigate();
  const [triggers, setTriggers] = useState(getTriggers());
  const [claims, setClaims] = useState([]);
  const [successBanner, setSuccessBanner] = useState(null);
  const [processing, setProcessing] = useState(false);

  const loadClaims = useCallback(() => {
    if (!worker) return;
    const all = getClaims();
    setClaims(all.filter(c => c.workerId === worker.id));
  }, [worker]);

  useEffect(() => {
    loadClaims();
  }, [loadClaims]);

  // Poll triggers
  useEffect(() => {
    const interval = setInterval(() => {
      setTriggers(getTriggers());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Auto-claim logic
  useEffect(() => {
    if (!worker || !worker.planId || worker.suspicious || processing) return;

    const t = getTriggers();
    const plan = PLANS.find(p => p.id === worker.planId);
    if (!plan) return;

    const activeTriggers = Object.entries(t).filter(([name, data]) => {
      if (!data.active) return false;
      if (!plan.triggers.includes(name)) return false;
      return true;
    });

    if (activeTriggers.length === 0) return;

    // Check if claim already exists today
    const allClaims = getClaims();
    const today = formatDate();
    const todayClaims = allClaims.filter(c => c.workerId === worker.id && c.date === today);
    const pendingTriggers = activeTriggers.filter(([name]) => !todayClaims.some(c => c.event === name));

    if (pendingTriggers.length === 0) return;

    setProcessing(true);
    const [triggerName] = pendingTriggers[0];

    const claimId = generateId('c');
    const newClaim = {
      id: claimId,
      workerId: worker.id,
      date: today,
      event: triggerName,
      payout: plan.coverage,
      status: 'Processing',
      zone: worker.zone,
    };
    addClaim(newClaim);
    loadClaims();

    setTimeout(() => {
      updateClaim(claimId, { status: 'Paid' });

      // Credit wallet
      const workers = getWorkers();
      const idx = workers.findIndex(w => w.id === worker.id);
      if (idx !== -1) {
        workers[idx].walletBalance = (workers[idx].walletBalance || 0) + plan.coverage;
        saveWorkers(workers);
      }

      onRefresh && onRefresh();
      loadClaims();
      setSuccessBanner({ event: triggerName, amount: plan.coverage });
      setProcessing(false);

      setTimeout(() => setSuccessBanner(null), 6000);
    }, 3000);
  }, [triggers, worker]);

  if (!worker) {
    navigate('/');
    return null;
  }

  const plan = PLANS.find(p => p.id === worker.planId);
  const activeTriggersList = Object.entries(triggers).filter(([, d]) => d.active);
  const nextRenewal = new Date();
  nextRenewal.setDate(nextRenewal.getDate() + 7);

  if (claimsOnly) {
    return (
      <div className="min-h-screen bg-bg-base pb-8">
        <div className="px-6 pt-12 pb-6">
          <p className="text-indigo-400 text-xs font-semibold uppercase tracking-widest mb-1">History</p>
          <h1 className="text-2xl font-black text-text-main">Claim History</h1>
        </div>
        <div className="px-6">
          {claims.length === 0 ? (
            <div className="glass rounded-2xl p-8 text-center">
              <Shield size={40} className="text-gray-600 mx-auto mb-3" />
              <p className="text-text-sub">No claims yet. Claims are processed automatically when triggers activate.</p>
            </div>
          ) : (
            <div className="glass rounded-2xl overflow-hidden">
              {claims.map((claim, i) => (
                <div key={claim.id} className={`flex items-center gap-3 px-4 py-3.5 ${i < claims.length - 1 ? 'border-b border-border-line' : ''}`}>
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-sm">
                    {claim.event === 'Rain' ? '🌧️' : claim.event === 'Heat' ? '🌡️' : claim.event === 'AQI' ? '💨' : claim.event === 'Curfew' ? '🚫' : '📵'}
                  </div>
                  <div className="flex-1">
                    <p className="text-text-main text-sm font-medium">{claim.event}</p>
                    <p className="text-text-muted text-xs">{claim.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-400 font-bold text-sm">₹{claim.payout}</p>
                    <ClaimStatusBadge status={claim.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-base pb-8">
      {/* Success Banner */}
      {successBanner && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm animate-slide-in-up">
          <div className="bg-green-600 text-text-main rounded-2xl px-5 py-4 shadow-2xl flex items-center gap-3">
            <CheckCircle size={24} />
            <div>
              <p className="font-bold">{successBanner.event} trigger activated</p>
              <p className="text-green-200 text-sm">₹{successBanner.amount} credited to your wallet</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="px-6 pt-12 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-text-sub text-sm">Welcome back,</p>
            <h1 className="text-xl font-black text-text-main">{worker.name} 👋</h1>
          </div>
          <div className="text-right">
            <p className="text-text-muted text-xs">Zone</p>
            <p className="text-indigo-400 font-semibold text-sm">{worker.zone}</p>
          </div>
        </div>
      </div>

      {/* Alert Banner */}
      {activeTriggersList.length > 0 && (
        <div className="mx-6 mb-4 bg-red-500/10 border border-red-500/30 rounded-2xl px-4 py-3 flex items-center gap-3 animate-pulse-glow">
          <AlertTriangle size={20} className="text-red-400 flex-shrink-0" />
          <div>
            <p className="text-red-400 font-bold text-sm">Disruption Alert Active!</p>
            <p className="text-red-300/70 text-xs">
              {activeTriggersList.map(([name]) => name).join(', ')} — Claim being processed
            </p>
          </div>
        </div>
      )}

      {/* Wallet + Plan Cards */}
      <div className="px-6 grid grid-cols-2 gap-3 mb-4">
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Wallet size={16} className="text-indigo-400" />
            <span className="text-text-sub text-xs">Wallet Balance</span>
          </div>
          <p className="text-text-main text-2xl font-black">₹{(worker.walletBalance || 0).toLocaleString()}</p>
        </div>
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield size={16} className="text-purple-400" />
            <span className="text-text-sub text-xs">Active Plan</span>
          </div>
          {plan ? (
            <>
              <p className="text-text-main text-xl font-black">{plan.name}</p>
              <p className="text-text-sub text-xs">₹{plan.coverage} coverage</p>
            </>
          ) : (
            <button onClick={() => navigate('/plans')} className="text-indigo-400 text-sm font-semibold">
              Choose Plan →
            </button>
          )}
        </div>
      </div>

      {/* Coverage & Renewal */}
      {plan && (
        <div className="mx-6 mb-4 glass rounded-2xl px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-text-muted text-xs">Max Coverage</p>
            <p className="text-text-main font-bold">₹{plan.coverage}</p>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div>
            <p className="text-text-muted text-xs">Plan Type</p>
            <p className="text-text-main font-bold">{plan.name}</p>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div>
            <p className="text-text-muted text-xs">Next Renewal</p>
            <p className="text-text-main font-bold">{formatDate(nextRenewal)}</p>
          </div>
        </div>
      )}

      {/* Live Trigger Status */}
      <div className="mx-6 mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-text-main font-bold text-sm">Live Trigger Status</h2>
          <RefreshCw size={14} className="text-text-muted" />
        </div>
        <div className="glass rounded-2xl px-4 py-1">
          {Object.entries(TRIGGER_CONFIG).map(([name, config]) => (
            <TriggerRow key={name} name={name} config={config} data={triggers[name]} />
          ))}
        </div>
      </div>

      {/* Recent Claims */}
      <div className="mx-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-text-main font-bold text-sm">Recent Claims</h2>
          <button onClick={() => navigate('/claims')} className="text-indigo-400 text-xs font-medium">View all</button>
        </div>
        {claims.length === 0 ? (
          <div className="glass rounded-2xl p-6 text-center">
            <p className="text-text-muted text-sm">No claims yet — they're processed automatically!</p>
          </div>
        ) : (
          <div className="glass rounded-2xl overflow-hidden">
            {claims.slice(0, 3).map((claim, i) => (
              <div key={claim.id} className={`flex items-center gap-3 px-4 py-3.5 ${i < Math.min(claims.length, 3) - 1 ? 'border-b border-border-line' : ''}`}>
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-sm">
                  {claim.event === 'Rain' ? '🌧️' : claim.event === 'Heat' ? '🌡️' : claim.event === 'AQI' ? '💨' : claim.event === 'Curfew' ? '🚫' : '📵'}
                </div>
                <div className="flex-1">
                  <p className="text-text-main text-sm font-medium">{claim.event}</p>
                  <p className="text-text-muted text-xs">{claim.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-bold text-sm">₹{claim.payout}</p>
                  <ClaimStatusBadge status={claim.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
