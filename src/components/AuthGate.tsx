import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AuthGateProps {
  onAuthSuccess?: () => void;
}

export const AuthGate: React.FC<AuthGateProps> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    setLoading(true);
    setError(null);
    setNotice(null);

    try {
      if (mode === 'signin') {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        onAuthSuccess?.();
      } else {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
        if (!data.session) {
          setNotice('Account created. Check your email to confirm your address before signing in.');
          setMode('signin');
        } else {
          onAuthSuccess?.();
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-slate-900">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-lg p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
            <ShieldCheck size={20} className="text-blue-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">AssetFlow AI</h1>
            <p className="text-xs text-slate-500">Enterprise Asset & Inventory Control</p>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <h2 className="text-base font-bold text-slate-900">
            {mode === 'signin' ? 'Sign in to your workspace' : 'Create enterprise account'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {mode === 'signin'
              ? 'Access your organization assets, stock thresholds, and maintenance logs.'
              : 'Provision a private workspace secured with row-level data isolation.'}
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {notice && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
            {notice}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Work Email</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@organization.org"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Authenticating...' : mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
            <ArrowRight size={14} />
          </button>
        </form>

        <div className="border-t border-slate-100 pt-4 text-center text-xs text-slate-500">
          {mode === 'signin' ? (
            <>
              Need a workspace account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError(null);
                }}
                className="font-semibold text-blue-600 hover:text-blue-700"
              >
                Create account
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setError(null);
                }}
                className="font-semibold text-blue-600 hover:text-blue-700"
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
