import React, { useState, useEffect, useCallback } from 'react';
import {
  CloudRain, Thermometer, Wind, Ban, Smartphone,
  ToggleLeft, ToggleRight, RefreshCw, AlertTriangle,
  MapPin, Loader2, Wifi, WifiOff
} from 'lucide-react';
import {
  getTriggers, saveTriggers, TRIGGER_CONFIG,
  getClaims, getWorkers, addClaim, updateClaim,
  PLANS, generateId, formatDate, saveWorkers
} from '../store';
import { fetchAllZonesWeather, getAQILabel, CITY_COORDS } from '../services/weatherService';

const TRIGGER_ICONS = {
  Rain: CloudRain,
  Heat: Thermometer,
  AQI: Wind,
  Curfew: Ban,
  'Platform Downtime': Smartphone,
};

const ZONE_COLORS = {
  Chennai: 'from-orange-500 to-yellow-600',
  Mumbai: 'from-blue-600 to-cyan-600',
  Delhi: 'from-red-600 to-orange-600',
  Bengaluru: 'from-green-600 to-emerald-600',
  Coimbatore: 'from-purple-600 to-indigo-600',
};

function ZoneWeatherCard({ zone, data, loading }) {
  const w = data?.weather;
  const a = data?.aqi;
  const aqiInfo = a ? getAQILabel(a.aqi) : null;

  return (
    <div className="glass rounded-2xl p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${ZONE_COLORS[zone] || 'bg-gray-500'}`} />
          <MapPin size={14} className="text-text-sub" />
          <span className="text-text-main font-bold text-sm">{zone}</span>
        </div>
        {loading ? (
          <Loader2 size={14} className="text-indigo-400 animate-spin" />
        ) : (w || a) ? (
          <Wifi size={14} className="text-green-400" />
        ) : (
          <WifiOff size={14} className="text-red-400" />
        )}
      </div>

      {loading ? (
        <div className="space-y-1.5">
          <div className="h-4 rounded shimmer" />
          <div className="h-4 rounded shimmer w-3/4" />
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {/* Rain */}
          <div className={`rounded-xl p-2 text-center ${w?.rain >= TRIGGER_CONFIG.Rain.threshold ? 'bg-blue-500/20 ring-1 ring-blue-500/40' : 'bg-bg-elevated/60'}`}>
            <p className="text-[10px] text-text-muted mb-0.5">☔ Rain</p>
            <p className={`font-black text-sm ${w?.rain >= TRIGGER_CONFIG.Rain.threshold ? 'text-blue-400' : 'text-text-main'}`}>
              {w ? `${w.rain}` : '—'}
            </p>
            <p className="text-[9px] text-gray-600">mm/day</p>
          </div>

          {/* Temp */}
          <div className={`rounded-xl p-2 text-center ${w?.temp >= TRIGGER_CONFIG.Heat.threshold ? 'bg-red-500/20 ring-1 ring-red-500/40' : 'bg-bg-elevated/60'}`}>
            <p className="text-[10px] text-text-muted mb-0.5">🌡️ Temp</p>
            <p className={`font-black text-sm ${w?.temp >= TRIGGER_CONFIG.Heat.threshold ? 'text-red-400' : 'text-text-main'}`}>
              {w ? `${w.temp}°` : '—'}
            </p>
            <p className="text-[9px] text-gray-600">Celsius</p>
          </div>

          {/* AQI */}
          <div className={`rounded-xl p-2 text-center ${a?.aqi >= TRIGGER_CONFIG.AQI.threshold ? 'bg-purple-500/20 ring-1 ring-purple-500/40' : 'bg-bg-elevated/60'}`}>
            <p className="text-[10px] text-text-muted mb-0.5">💨 AQI</p>
            <p className={`font-black text-sm ${aqiInfo?.color || 'text-text-main'}`}>
              {a ? `${a.aqi}` : '—'}
            </p>
            <p className="text-[9px] text-gray-600">{aqiInfo?.label || '—'}</p>
          </div>
        </div>
      )}

      {w && !loading && (
        <p className="text-[10px] text-gray-600 capitalize truncate">
          {w.description} · Humid {w.humidity}% · Feels {w.feelsLike}°C
        </p>
      )}
      {a && !loading && (
        <p className="text-[10px] text-gray-600">
          AQI via {a.source}{a.dominantPollutant ? ` · ${a.dominantPollutant.toUpperCase()}` : ''}
        </p>
      )}
    </div>
  );
}

function TriggerCard({ name, config, data, realValues, onToggle, isProcessing }) {
  const Icon = TRIGGER_ICONS[name] || AlertTriangle;
  const isToggle = !config.threshold;
  const isActive = data?.active;

  // Build value display from real data
  let displayValue = data?.value ?? 0;
  let apiSource = null;

  if (!isToggle && realValues) {
    if (name === 'Rain') {
      const vals = Object.values(realValues)
        .map(z => z?.weather?.rain)
        .filter(v => v != null);
      if (vals.length) {
        displayValue = Math.max(...vals);
        apiSource = `Max across zones · OpenWeatherMap`;
      }
    } else if (name === 'Heat') {
      const vals = Object.values(realValues)
        .map(z => z?.weather?.temp)
        .filter(v => v != null);
      if (vals.length) {
        displayValue = Math.max(...vals);
        apiSource = `Max across zones · OpenWeatherMap`;
      }
    } else if (name === 'AQI') {
      const vals = Object.values(realValues)
        .map(z => z?.aqi?.aqi)
        .filter(v => v != null);
      if (vals.length) {
        displayValue = Math.max(...vals);
        apiSource = `Max across zones · WAQI`;
      }
    }
  }

  const isBreaching = !isToggle && config.threshold && displayValue >= config.threshold;
  const barPercent = !isToggle && config.threshold
    ? Math.min(100, Math.round((displayValue / config.threshold) * 100))
    : 0;

  const barColor = isBreaching || isActive
    ? 'bg-red-500'
    : barPercent >= 80
    ? 'bg-yellow-500'
    : 'bg-green-500';

  return (
    <div className={`glass rounded-2xl overflow-hidden transition-all ${
      isActive ? 'ring-1 ring-red-500/50 shadow-lg shadow-red-500/10' : ''
    }`}>
      <div className={`px-5 py-4 ${isActive ? 'bg-red-500/10' : ''}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isActive ? 'bg-red-500/20' : 'bg-bg-element/50'}`}>
              <Icon size={20} className={isActive ? 'text-red-400' : 'text-text-sub'} />
            </div>
            <div>
              <h3 className="text-text-main font-bold">{name}</h3>
              {config.threshold && (
                <p className="text-text-muted text-xs">Threshold: {config.threshold} {config.unit}</p>
              )}
            </div>
          </div>
          <button
            onClick={() => onToggle(name)}
            className={`transition-all ${isActive ? 'text-red-400 hover:text-red-300' : 'text-text-muted hover:text-indigo-400'}`}
          >
            {isActive
              ? <ToggleRight size={36} strokeWidth={1.5} />
              : <ToggleLeft size={36} strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      <div className="px-5 pb-5">
        {isToggle ? (
          <div className={`rounded-xl p-3 text-center ${isActive ? 'bg-red-500/10' : 'bg-bg-elevated/50'}`}>
            <p className={`text-2xl font-black ${isActive ? 'text-red-400' : 'text-text-muted'}`}>
              {isActive ? 'ACTIVE' : 'Inactive'}
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-end justify-between mb-2">
              <div>
                <p className={`text-3xl font-black ${isBreaching || isActive ? 'text-red-400' : 'text-text-main'}`}>
                  {displayValue}
                </p>
                {apiSource && (
                  <p className="text-gray-600 text-[10px] mt-0.5">🌐 {apiSource}</p>
                )}
              </div>
              <p className="text-text-muted text-sm">{config.unit}</p>
            </div>
            <div className="w-full h-2.5 bg-bg-elevated rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                style={{ width: `${barPercent}%` }}
              />
            </div>
            <p className="text-gray-600 text-xs mt-1">{barPercent}% of threshold</p>
          </div>
        )}

        <div className="mt-3 flex items-center justify-between">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
            isActive ? 'bg-red-500/20 text-red-400' : 'bg-bg-element/50 text-text-sub'
          }`}>
            {isActive ? '● TRIGGERED' : '○ Inactive'}
          </span>
          <div className="flex items-center gap-2">
            {isBreaching && !isActive && (
              <span className="text-yellow-400 text-xs flex items-center gap-1">
                <AlertTriangle size={12} />Threshold exceeded
              </span>
            )}
            {isProcessing && (
              <span className="text-yellow-400 text-xs flex items-center gap-1.5">
                <Loader2 size={12} className="animate-spin" />Processing claims...
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TriggerPanel() {
  const [triggers, setTriggers] = useState(getTriggers());
  const [zoneWeather, setZoneWeather] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [processing, setProcessing] = useState({});
  const [apiStatus, setApiStatus] = useState({ owm: null, waqi: null });

  const loadRealWeather = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await fetchAllZonesWeather();
      setZoneWeather(data);
      setLastUpdated(new Date());

      // Detect API availability
      const firstZone = Object.values(data)[0];
      setApiStatus({
        owm: !!firstZone?.weather,
        waqi: !!firstZone?.aqi && firstZone?.aqi?.source === 'WAQI',
      });

      // Auto-update trigger values from real data (no override)
      const current = getTriggers();
      const updated = { ...current };
      let changed = false;

      // Compute max values across zones
      const rainVals = Object.values(data).map(z => z?.weather?.rain).filter(v => v != null);
      const tempVals = Object.values(data).map(z => z?.weather?.temp).filter(v => v != null);
      const aqiVals  = Object.values(data).map(z => z?.aqi?.aqi).filter(v => v != null);

      if (rainVals.length && !current.Rain.override) {
        const maxRain = Math.max(...rainVals);
        updated.Rain = { ...updated.Rain, value: maxRain, active: maxRain >= TRIGGER_CONFIG.Rain.threshold };
        changed = true;
      }
      if (tempVals.length && !current.Heat.override) {
        const maxTemp = Math.max(...tempVals);
        updated.Heat = { ...updated.Heat, value: maxTemp, active: maxTemp >= TRIGGER_CONFIG.Heat.threshold };
        changed = true;
      }
      if (aqiVals.length && !current.AQI.override) {
        const maxAQI = Math.max(...aqiVals);
        updated.AQI = { ...updated.AQI, value: maxAQI, active: maxAQI >= TRIGGER_CONFIG.AQI.threshold };
        changed = true;
      }

      if (changed) {
        saveTriggers(updated);
        setTriggers(updated);
      }
    } catch (e) {
      console.warn('[TriggerPanel] Weather fetch failed:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadRealWeather();
    // Refresh every 10 minutes
    const interval = setInterval(() => loadRealWeather(), 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadRealWeather]);

  const handleToggle = (name) => {
    const current = getTriggers();
    const newActive = !current[name].active;
    const updated = {
      ...current,
      [name]: { ...current[name], active: newActive, override: true },
    };
    saveTriggers(updated);
    setTriggers(updated);
    if (newActive) processClaims(name);
  };

  const processClaims = (triggerName) => {
    setProcessing(p => ({ ...p, [triggerName]: true }));
    const workers = getWorkers();
    const newClaimIds = [];

    workers.forEach(worker => {
      if (!worker.planId || worker.suspicious || worker.status !== 'Active') return;
      const plan = PLANS.find(p => p.id === worker.planId);
      if (!plan || !plan.triggers.includes(triggerName)) return;

      const today = formatDate();
      const existingClaims = getClaims();
      const alreadyClaimed = existingClaims.some(
        c => c.workerId === worker.id && c.date === today && c.event === triggerName
      );
      if (alreadyClaimed) return;

      const claimId = generateId('c');
      addClaim({ id: claimId, workerId: worker.id, date: today, event: triggerName, payout: plan.coverage, status: 'Processing', zone: worker.zone });
      newClaimIds.push({ claimId, workerId: worker.id, payout: plan.coverage });
    });

    setTimeout(() => {
      const allWorkers = getWorkers();
      newClaimIds.forEach(({ claimId, workerId, payout }) => {
        updateClaim(claimId, { status: 'Paid' });
        const idx = allWorkers.findIndex(w => w.id === workerId);
        if (idx !== -1) allWorkers[idx].walletBalance = (allWorkers[idx].walletBalance || 0) + payout;
      });
      saveWorkers(allWorkers);
      setProcessing(p => ({ ...p, [triggerName]: false }));
    }, 3000);
  };

  const hasRealData = Object.values(zoneWeather).some(d => d?.weather || d?.aqi);
  const noApiKeys = !hasRealData && !loading;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <p className="text-indigo-400 text-xs font-semibold uppercase tracking-widest mb-1">Live Data</p>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-black text-text-main">Trigger Control Panel</h1>
            <p className="text-text-sub mt-1 text-sm">
              {hasRealData
                ? `🌐 Live weather data · Updated ${lastUpdated?.toLocaleTimeString()}`
                : loading
                ? 'Fetching real-time weather data...'
                : '⚠️ Add API keys in .env to enable live data'}
            </p>
          </div>
          <button
            onClick={() => loadRealWeather(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 glass rounded-xl text-gray-300 hover:text-text-main hover:bg-white/10 transition text-sm"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* API Status */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
          apiStatus.owm ? 'bg-green-500/10 text-green-400 border border-green-500/20'
            : 'bg-bg-element/50 text-text-muted'
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${apiStatus.owm ? 'bg-green-400 animate-pulse' : 'bg-bg-element-hover'}`} />
          OpenWeatherMap {apiStatus.owm ? '● Live' : '○ No key'}
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
          apiStatus.waqi ? 'bg-green-500/10 text-green-400 border border-green-500/20'
            : 'bg-bg-element/50 text-text-muted'
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${apiStatus.waqi ? 'bg-green-400 animate-pulse' : 'bg-bg-element-hover'}`} />
          WAQI AQI {apiStatus.waqi ? '● Live' : '○ Demo/offline'}
        </div>
        {noApiKeys && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
            <AlertTriangle size={12} />
            Set VITE_OPENWEATHER_API_KEY in .env for live data
          </div>
        )}
      </div>

      {/* Zone Weather Grid */}
      <div className="mb-6">
        <h2 className="text-text-main font-bold text-sm mb-3 flex items-center gap-2">
          <MapPin size={14} className="text-indigo-400" />
          Live Conditions by Zone
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {Object.keys(CITY_COORDS).map(zone => (
            <ZoneWeatherCard
              key={zone}
              zone={zone}
              data={zoneWeather[zone]}
              loading={loading}
            />
          ))}
        </div>
      </div>

      {/* Trigger Cards */}
      <div className="mb-4">
        <h2 className="text-text-main font-bold text-sm mb-3">Global Trigger Controls</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Object.entries(TRIGGER_CONFIG).map(([name, config]) => (
            <TriggerCard
              key={name}
              name={name}
              config={config}
              data={triggers[name]}
              realValues={zoneWeather}
              onToggle={handleToggle}
              isProcessing={processing[name]}
            />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="glass rounded-2xl p-4 flex flex-wrap gap-4 text-sm text-text-sub">
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded-full" /><span>Below threshold</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-yellow-500 rounded-full" /><span>Approaching threshold</span></div>
        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-full" /><span>Breached / Triggered</span></div>
        <div className="ml-auto text-xs text-gray-600">Rain shows max 24h estimate · AQI refreshes every 10 min</div>
      </div>
    </div>
  );
}
