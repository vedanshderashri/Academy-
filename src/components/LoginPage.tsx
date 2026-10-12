import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { isSupabaseConfigured } from '../db/SupabaseClient';
import {
  Activity,
  ShieldCheck,
  LogIn,
  UserPlus,
  Lock,
  Mail,
  User as UserIcon,
  Sparkles,
  Database,
  ArrowRight,
  UserCheck,
} from 'lucide-react';

interface LoginPageProps {
  onSuccessLogin?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccessLogin }) => {
  const { login, signup, loginAsGuest } = useAuth();
  const [tab, setTab] = useState<'login' | 'signup'>('login');

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [username, setUsername] = useState<string>('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const cloudActive = isSupabaseConfigured();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      if (tab === 'login') {
        const res = await login(email, password);
        if (res.success) {
          if (onSuccessLogin) onSuccessLogin();
        } else {
          setErrorMsg(res.error || 'Invalid email or password.');
        }
      } else {
        if (!username || !email || !password) {
          setErrorMsg('Please fill in all fields.');
          setIsSubmitting(false);
          return;
        }
        const res = await signup(username, email, password);
        if (res.success) {
          if (onSuccessLogin) onSuccessLogin();
        } else {
          if (res.error?.toLowerCase().includes('already registered')) {
            setErrorMsg('User already exists in Supabase. Please click the "Log In" tab above to sign in.');
          } else {
            setErrorMsg(res.error || 'Failed to create account.');
          }
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'An error occurred during authentication.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuestLogin = async () => {
    await loginAsGuest();
    if (onSuccessLogin) onSuccessLogin();
  };

  return (
    <div className="min-h-full w-full bg-slate-50 flex items-center justify-center p-6 select-none font-sans">
      <div className="bg-[#fefefe] border border-slate-200 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl space-y-6">
        {/* Top Hero Banner */}
        <div className="bg-gradient-to-r from-cyan-900 via-slate-900 to-indigo-950 text-white p-8 text-center space-y-3 relative overflow-hidden">
          <div className="bg-cyan-500/20 text-cyan-300 w-12 h-12 rounded-2xl mx-auto flex items-center justify-center border border-cyan-400/40 shadow-inner">
            <Activity className="w-7 h-7 text-cyan-400 animate-pulse" />
          </div>

          <div>
            <h1 className="text-xl font-black tracking-wider text-white">NETWORK TYCOON</h1>
            <p className="text-xs text-slate-300 font-medium">Computer Networks Student Portal</p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-mono border border-white/10">
            <Database className="w-3 h-3 text-emerald-400" />
            <span>{cloudActive ? 'Supabase Cloud Database Active' : 'Local IndexedDB Active'}</span>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="px-6">
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                tab === 'login' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LogIn className="w-4 h-4" /> Log In
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('signup');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                tab === 'signup' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-4 h-4" /> Create Account
            </button>
          </div>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="px-6 space-y-4">
          {tab === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name / Username</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. Alex Mercer"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-cyan-600"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-cyan-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-cyan-600"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium rounded-xl">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold text-xs shadow-md shadow-cyan-600/20 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {isSubmitting ? 'Authenticating...' : tab === 'login' ? 'Sign In & Unlock Dashboard' : 'Create Account & Start Course'}
          </button>
        </form>

        {/* Guest Option Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-2 text-center">
          <p className="text-xs text-slate-500 font-medium">Want to explore before creating an account?</p>
          <button
            type="button"
            onClick={handleGuestLogin}
            className="w-full py-2.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition shadow-xs"
          >
            <UserCheck className="w-4 h-4 text-cyan-600" /> Continue as Demo Guest Engineer <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
