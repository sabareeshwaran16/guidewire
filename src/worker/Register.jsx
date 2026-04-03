import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ChevronRight, Bike } from 'lucide-react';
import {
  ZONES,
  ZONE_RISK,
  addWorker,
  setCurrentWorker,
  generateId,
  getWorkers,
  getUsers,
  saveUsers,
  login,
} from '../store';
import ThemeToggle from '../ThemeToggle';

export default function Register({ onComplete }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    zone: '',
    platform: '',
    avgHours: '',
    whatsapp: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Check if already registered
  const existingWorker = (() => {
    try {
      const id = localStorage.getItem('sp_current_worker');
      if (id) {
        const workers = getWorkers();
        return workers.find(w => w.id === id);
      }
    } catch { }
    return null;
  })();

  if (existingWorker) {
    navigate('/dashboard');
    return null;
  }

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!/^\d{10}$/.test(form.phone)) e.phone = 'Enter valid 10-digit phone';
    if (!form.zone) e.zone = 'Select your city';
    if (!form.platform) e.platform = 'Select delivery platform';
    if (!form.avgHours || isNaN(form.avgHours) || +form.avgHours < 1 || +form.avgHours > 16)
      e.avgHours = 'Enter hours between 1-16';
    if (!/^\d{10}$/.test(form.whatsapp)) e.whatsapp = 'Enter valid WhatsApp number';
    if (!form.email || !form.email.endsWith('@worker.org')) e.email = 'Must be @worker.org domain';
    if (!form.password || form.password.length < 8 || !/[A-Z]/.test(form.password) || !/[0-9]/.test(form.password)) {
      e.password = 'Min 8 chars, 1 uppercase, 1 number';
    }
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    
    // Check if user exists
    const users = getUsers();
    if (users.some(u => u.email === form.email)) {
      e.email = 'Email already registered';
    }
    
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setLoading(true);

    setTimeout(() => {
      const risk = ZONE_RISK[form.zone];
      const workerId = generateId('w');
      
      const worker = {
        id: workerId,
        name: form.name.trim(),
        phone: form.phone,
        whatsapp: form.whatsapp,
        zone: form.zone,
        platform: form.platform,
        avgHours: +form.avgHours,
        riskScore: risk.level,
        planId: null,
        walletBalance: 0,
        status: 'Pending',
        suspicious: false,
        joinedAt: new Date().toISOString().split('T')[0],
      };
      
      const newUser = {
        email: form.email,
        password: form.password,
        name: form.name.trim(),
        role: 'worker',
        workerId: workerId,
      };

      // Save worker and user
      addWorker(worker);
      const allUsers = getUsers();
      allUsers.push(newUser);
      saveUsers(allUsers);
      
      // Auto-login
      login(form.email, form.password);
      
      localStorage.setItem('sp_pending_worker', JSON.stringify(worker));
      onComplete && onComplete();
      navigate('/onboarding');
    }, 800);
  };

  const set = (field) => (e) => {
    let val = e.target.value;
    
    // Live validation for email domain
    if (field === 'email') {
      val = val.trim();
      const domainError = val && !val.endsWith('@worker.org') && val.includes('@') ? 'Invalid domain. Use @worker.org' : undefined;
      setErrors(err => ({ ...err, email: domainError }));
    } else {
      setErrors(err => ({ ...err, [field]: undefined }));
    }
    
    setForm(f => ({ ...f, [field]: val }));
  };

  return (
    <div className="min-h-screen bg-bg-base flex flex-col items-center relative">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md flex flex-col pb-12">
        {/* Header */}
        <div className="pt-12 pb-8 px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center">
            <Shield size={20} className="text-bg-base" />
          </div>
          <span className="text-2xl font-black text-text-main">StillPaid</span>
        </div>
        <p className="text-text-sub text-sm">Insurance that pays you automatically</p>
      </div>

      {/* Hero banner */}
      <div className="mx-6 mb-8 rounded-2xl bg-indigo-600 p-5">
        <div className="flex items-center gap-3 mb-3">
          <Bike size={28} className="text-bg-base" />
          <div>
            <p className="text-bg-base font-bold text-lg leading-tight">Zero-Hassle Claims</p>
            <p className="text-bg-base/80 text-sm">Rain, heat or curfew — we pay you first</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {['Rain 🌧️', 'Heat 🌡️', 'AQI 💨', 'Curfew 🚫'].map(t => (
            <span key={t} className="bg-white/20 text-text-main text-xs px-3 py-1 rounded-full font-medium">{t}</span>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 px-6 pb-12">
        <h2 className="text-lg font-bold text-text-main mb-5">Create Your Account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-text-sub mb-1.5 uppercase tracking-wide">Full Name</label>
            <input
              value={form.name}
              onChange={set('name')}
              placeholder="e.g. Ravi Kumar"
              className={`w-full bg-bg-elevated border ${errors.name ? 'border-red-500' : 'border-border-focus'} rounded-xl px-4 py-3 text-text-main placeholder-text-muted focus:outline-none focus:border-indigo-500 transition`}
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-semibold text-text-sub mb-1.5 uppercase tracking-wide">Phone Number</label>
            <input
              value={form.phone}
              onChange={set('phone')}
              placeholder="10-digit mobile number"
              maxLength={10}
              className={`w-full bg-bg-elevated border ${errors.phone ? 'border-red-500' : 'border-border-focus'} rounded-xl px-4 py-3 text-text-main placeholder-text-muted focus:outline-none focus:border-indigo-500 transition`}
            />
            {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
          </div>

          {/* City */}
          <div>
            <label className="block text-xs font-semibold text-text-sub mb-1.5 uppercase tracking-wide">City / Zone</label>
            <select
              value={form.zone}
              onChange={set('zone')}
              className={`w-full bg-bg-elevated border ${errors.zone ? 'border-red-500' : 'border-border-focus'} rounded-xl px-4 py-3 text-text-main focus:outline-none focus:border-indigo-500 transition`}
            >
              <option value="">Select your city</option>
              {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
            </select>
            {errors.zone && <p className="text-red-400 text-xs mt-1">{errors.zone}</p>}
          </div>

          {/* Platform */}
          <div>
            <label className="block text-xs font-semibold text-text-sub mb-1.5 uppercase tracking-wide">Delivery Platform</label>
            <div className="grid grid-cols-3 gap-2">
              {['Swiggy', 'Zomato', 'Both'].map(p => (
                <button
                  type="button"
                  key={p}
                  onClick={() => { setForm(f => ({ ...f, platform: p })); setErrors(e => ({ ...e, platform: undefined })); }}
                  className={`py-3 rounded-xl text-sm font-semibold border transition ${
                    form.platform === p
                      ? 'bg-indigo-600 border-indigo-500 text-text-main'
                      : 'bg-bg-elevated border-border-focus text-gray-300 hover:border-gray-500'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            {errors.platform && <p className="text-red-400 text-xs mt-1">{errors.platform}</p>}
          </div>

          {/* Avg Hours */}
          <div>
            <label className="block text-xs font-semibold text-text-sub mb-1.5 uppercase tracking-wide">Avg Working Hours / Day</label>
            <input
              type="number"
              value={form.avgHours}
              onChange={set('avgHours')}
              placeholder="e.g. 8"
              min={1}
              max={16}
              className={`w-full bg-bg-elevated border ${errors.avgHours ? 'border-red-500' : 'border-border-focus'} rounded-xl px-4 py-3 text-text-main placeholder-text-muted focus:outline-none focus:border-indigo-500 transition`}
            />
            {errors.avgHours && <p className="text-red-400 text-xs mt-1">{errors.avgHours}</p>}
          </div>

          {/* WhatsApp */}
          <div>
            <label className="block text-xs font-semibold text-text-sub mb-1.5 uppercase tracking-wide">WhatsApp Number</label>
            <input
              value={form.whatsapp}
              onChange={set('whatsapp')}
              placeholder="10-digit WhatsApp number"
              maxLength={10}
              className={`w-full bg-bg-elevated border ${errors.whatsapp ? 'border-red-500' : 'border-border-focus'} rounded-xl px-4 py-3 text-text-main placeholder-text-muted focus:outline-none focus:border-indigo-500 transition`}
            />
            {errors.whatsapp && <p className="text-red-400 text-xs mt-1">{errors.whatsapp}</p>}
          </div>

          {/* Account Details */}
          <div className="pt-4 border-t border-border-line">
            <h3 className="text-text-main font-bold text-sm mb-4">Account Login Details</h3>
            <div className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-text-sub mb-1.5 uppercase tracking-wide">Worker Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  placeholder="name@worker.org"
                  className={`w-full bg-bg-elevated border ${errors.email ? 'border-red-500' : 'border-border-focus'} rounded-xl px-4 py-3 text-text-main placeholder-text-muted focus:outline-none focus:border-indigo-500 transition`}
                />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                {!errors.email && <p className="text-text-muted text-[10px] mt-1">Must use @worker.org domain.</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-text-sub mb-1.5 uppercase tracking-wide">Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={set('password')}
                  placeholder="Min 8 chars, 1 uppercase, 1 number"
                  className={`w-full bg-bg-elevated border ${errors.password ? 'border-red-500' : 'border-border-focus'} rounded-xl px-4 py-3 text-text-main placeholder-text-muted focus:outline-none focus:border-indigo-500 transition`}
                />
                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-text-sub mb-1.5 uppercase tracking-wide">Confirm Password</label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={set('confirmPassword')}
                  placeholder="Confirm password"
                  className={`w-full bg-bg-elevated border ${errors.confirmPassword ? 'border-red-500' : 'border-border-focus'} rounded-xl px-4 py-3 text-text-main placeholder-text-muted focus:outline-none focus:border-indigo-500 transition`}
                />
                {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-bg-base font-bold rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-60 mt-4"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>Register Now <ChevronRight size={18} /></>
            )}
          </button>
        </form>

        <p className="text-center text-text-muted text-xs mt-6">
          By registering, you agree to StillPaid's Terms & Privacy Policy
        </p>
      </div>
    </div>
  </div>
  );
}
