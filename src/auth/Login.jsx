import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Eye, EyeOff, Lock, AlertTriangle } from 'lucide-react';
import { login } from '../store';
import ThemeToggle from '../ThemeToggle';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Derive domain from email
  const domain = email.includes('@') ? email.split('@')[1].toLowerCase() : '';
  const isAdmin = domain === 'admin.org';
  const isWorker = domain === 'worker.org';
  const isInvalidDomain = domain && !isAdmin && !isWorker;

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    if (!isAdmin && !isWorker) {
      setError('Invalid email domain. Use @admin.org or @worker.org');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const session = login(email, password);
      
      if (session) {
        if (session.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        setError('Invalid email or password');
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center p-6 pb-20 relative">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-indigo-600 mb-4 shadow-lg shadow-indigo-500/20">
            <Shield size={28} className="text-bg-base" />
          </div>
          <h1 className="text-3xl font-black text-text-main">StillPaid</h1>
          <p className="text-text-sub mt-1">Sign in to your account</p>
        </div>

        <div className="glass rounded-3xl p-8 border border-border-line">
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-text-sub mb-2 uppercase tracking-wide">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="name@worker.org or name@admin.org"
                className={`w-full bg-bg-elevated/50 border ${isInvalidDomain ? 'border-red-500/50' : 'border-border-focus'} rounded-xl px-4 py-3 text-text-main placeholder-text-muted focus:outline-none focus:border-indigo-500 transition`}
              />
            </div>

            {/* Live Domain Badge & Validation */}
            <div className="h-6 flex items-center justify-center">
              {isAdmin && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full animate-in fade-in zoom-in duration-200">
                  <Shield size={12} className="text-orange-400" />
                  <span className="text-orange-400 text-xs font-bold">Admin Account</span>
                </div>
              )}
              {isWorker && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full animate-in fade-in zoom-in duration-200">
                  <Shield size={12} className="text-indigo-400" />
                  <span className="text-indigo-400 text-xs font-bold">Worker Account</span>
                </div>
              )}
              {isInvalidDomain && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full animate-in fade-in zoom-in duration-200">
                  <AlertTriangle size={12} className="text-red-400" />
                  <span className="text-red-400 text-xs font-bold">Invalid domain</span>
                </div>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-semibold text-text-sub mb-2 uppercase tracking-wide">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className="w-full bg-bg-elevated/50 border border-border-focus rounded-xl px-4 py-3 text-text-main placeholder-text-muted focus:outline-none focus:border-indigo-500 transition pr-12"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-sub hover:text-text-main transition p-1"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 animate-in fade-in slide-in-from-top-2">
                <p className="text-red-400 text-xs font-medium text-center">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || (!isAdmin && !isWorker) || !email || !password}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-bg-base font-bold rounded-xl transition-all disabled:opacity-50 disabled:grayscale mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Lock size={16} />
                  Secure Login
                </>
              )}
            </button>
          </form>

          {/* Registration Link */}
          <div className="mt-8 pt-6 border-t border-border-line text-center">
            <p className="text-text-sub text-sm">
              New gig worker?{' '}
              <Link to="/register" className="text-indigo-400 font-semibold hover:text-indigo-300 transition hover:underline">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
