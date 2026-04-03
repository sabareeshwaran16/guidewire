import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle, Zap, TrendingUp, TrendingDown } from 'lucide-react';
import { PLANS, ZONE_RISK, getCurrentWorker, updateWorker, getWorkers, saveWorkers } from '../store';

const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY || '';

async function fetchAdjustedPremium(zone, riskLevel, basePremium) {
  const prompt = `A gig delivery worker is in ${zone} with a ${riskLevel} risk score. The base weekly premium for their plan is ₹${basePremium}. Adjust the premium by -₹2 to +₹10 based on the zone's historical disruption risk (low waterlogging, AQI, heat history = discount; high = surcharge). Return ONLY a JSON object: { adjustedPremium: number, reason: string }`;

  if (!ANTHROPIC_API_KEY) {
    // Fallback mock data when no API key
    const adjustments = {
      Coimbatore: { delta: -4, reason: 'Your zone has low waterlogging history — ₹4 discount applied' },
      Chennai: { delta: 2, reason: 'Your zone has moderate flood risk — ₹2 surcharge applied' },
      Bengaluru: { delta: 0, reason: 'Your zone has average disruption history — no adjustment' },
      Mumbai: { delta: 8, reason: 'Mumbai has high waterlogging and AQI risk — ₹8 surcharge applied' },
      Delhi: { delta: 10, reason: 'Delhi has severe AQI & heat history — ₹10 surcharge applied' },
    };
    const adj = adjustments[zone] || { delta: 0, reason: 'Standard premium for your zone' };
    return {
      adjustedPremium: basePremium + adj.delta,
      reason: adj.reason,
    };
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 256,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) throw new Error('API error');
  const data = await response.json();
  const text = data.content[0].text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Invalid response');
  return JSON.parse(jsonMatch[0]);
}

function PlanCard({ plan, worker, onActivate, isActive }) {
  const [adjusted, setAdjusted] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!worker) return;
    setLoading(true);
    fetchAdjustedPremium(worker.zone, worker.riskScore, plan.weeklyPremium)
      .then(setAdjusted)
      .catch(() => setError('Could not load adjusted price'))
      .finally(() => setLoading(false));
  }, [worker, plan.weeklyPremium]);

  const delta = adjusted ? adjusted.adjustedPremium - plan.weeklyPremium : 0;

  return (
    <div
      className={`relative rounded-2xl overflow-hidden transition-all card-hover ${
        plan.highlight
          ? 'ring-2 ring-indigo-500 shadow-lg shadow-indigo-500/20'
          : 'ring-1 ring-white/10'
      }`}
    >
      {plan.highlight && (
        <div className="absolute top-0 left-0 right-0 py-1 bg-indigo-600 text-text-main text-xs font-bold text-center tracking-widest uppercase">
          Most Popular
        </div>
      )}
      <div className={`bg-bg-elevated p-5 ${plan.highlight ? 'pt-8' : ''}`}>
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-text-main font-bold text-xl">{plan.name}</h3>
            <p className="text-text-sub text-sm">Coverage up to ₹{plan.coverage.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-text-muted text-xs">Base</p>
            <p className="text-text-main font-bold text-lg">₹{plan.weeklyPremium}<span className="text-sm font-normal">/wk</span></p>
          </div>
        </div>

        {/* AI Adjusted Premium */}
        <div className="bg-black/20 rounded-xl p-3 mb-4">
          {loading ? (
            <div className="flex items-center gap-2 text-text-sub">
              <Loader2 size={14} className="animate-spin" />
              <span className="text-xs">AI calculating your premium...</span>
            </div>
          ) : error ? (
            <p className="text-text-muted text-xs">{error}</p>
          ) : adjusted ? (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Zap size={14} className="text-yellow-400" />
                  <span className="text-text-sub text-xs font-medium">AI-Adjusted Premium</span>
                </div>
                <div className="flex items-center gap-1">
                  {delta > 0 ? (
                    <TrendingUp size={12} className="text-red-400" />
                  ) : delta < 0 ? (
                    <TrendingDown size={12} className="text-green-400" />
                  ) : null}
                  <span className={`font-bold text-lg ${delta > 0 ? 'text-red-300' : delta < 0 ? 'text-green-300' : 'text-text-main'}`}>
                    ₹{adjusted.adjustedPremium}/wk
                  </span>
                </div>
              </div>
              <p className="text-text-muted text-[11px] leading-relaxed">{adjusted.reason}</p>
            </div>
          ) : null}
        </div>

        {/* Triggers */}
        <div className="mb-4">
          <p className="text-text-muted text-xs mb-2 font-medium">COVERED EVENTS</p>
          <div className="flex flex-wrap gap-1.5">
            {plan.triggers.map(t => (
              <span key={t} className="bg-bg-element text-text-main text-xs px-2.5 py-1 rounded-full">{t}</span>
            ))}
          </div>
        </div>

        {/* CTA */}
        {isActive ? (
          <div className="w-full py-3 rounded-xl bg-bg-element border border-border-focus text-text-main font-semibold text-sm text-center flex items-center justify-center gap-2">
            <CheckCircle size={16} />
            Active Plan
          </div>
        ) : (
          <button
            onClick={() => onActivate(plan)}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-bg-base font-semibold text-sm transition-all"
          >
            Activate Plan
          </button>
        )}
      </div>
    </div>
  );
}

export default function Plans({ worker, onRefresh }) {
  const navigate = useNavigate();

  if (!worker) {
    navigate('/');
    return null;
  }

  const handleActivate = (plan) => {
    const workers = getWorkers();
    const idx = workers.findIndex(w => w.id === worker.id);
    if (idx !== -1) {
      workers[idx].planId = plan.id;
      saveWorkers(workers);
      onRefresh && onRefresh();
    }
  };

  return (
    <div className="min-h-screen bg-bg-base pb-8">
      {/* Header */}
      <div className="px-6 pt-12 pb-6">
        <p className="text-indigo-400 text-xs font-semibold uppercase tracking-widest mb-1">Choose Plan</p>
        <h1 className="text-2xl font-black text-text-main">Your Insurance Plans</h1>
        <p className="text-text-sub text-sm mt-1">Premiums adjusted by AI for your zone: <span className="text-indigo-400 font-semibold">{worker.zone}</span></p>
      </div>

      {/* Risk badge */}
      <div className="mx-6 mb-6 flex items-center gap-2 glass rounded-xl px-4 py-3">
        <div className={`w-2.5 h-2.5 rounded-full ${worker.riskScore === 'High' ? 'bg-red-500' : worker.riskScore === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'}`} />
        <span className="text-gray-300 text-sm">Risk Score: <span className={`font-bold ${worker.riskScore === 'High' ? 'text-red-400' : worker.riskScore === 'Medium' ? 'text-yellow-400' : 'text-green-400'}`}>{worker.riskScore}</span></span>
        <span className="ml-auto text-text-muted text-xs">{worker.zone}</span>
      </div>

      {/* Plan Cards */}
      <div className="px-6 space-y-4">
        {PLANS.map(plan => (
          <PlanCard
            key={plan.id}
            plan={plan}
            worker={worker}
            onActivate={handleActivate}
            isActive={worker.planId === plan.id}
          />
        ))}
      </div>

      {worker.planId && (
        <div className="px-6 mt-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-4 bg-green-600 text-text-main font-bold rounded-xl"
          >
            Go to Dashboard →
          </button>
        </div>
      )}
    </div>
  );
}
