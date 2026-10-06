import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, User, Globe, CheckCircle2, ArrowRight, UserPlus, LogIn } from 'lucide-react';
import { loginUser, registerUser } from '../services/api';

export default function LoginPage({ onLoginSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState('m.kovac@enterprise.autoguide.com');
  const [loginPassword, setLoginPassword] = useState('password123');

  // Register fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('Lead Tech');
  const [regRegion, setRegRegion] = useState('US-EAST');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await loginUser(loginEmail, loginPassword);
      onLoginSuccess(res.user, res.token);
    } catch (err) {
      setErrorMsg(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await registerUser(regName, regEmail, regPassword, regRole, regRegion);
      setSuccessMsg('Account created successfully! Logging you in...');
      setTimeout(() => {
        onLoginSuccess(res.user, res.token);
      }, 1000);
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col md:flex-row font-sans">
      {/* Left Navy Hero Panel */}
      <div className="md:w-1/2 bg-slate-950 text-white p-12 flex flex-col justify-between relative overflow-hidden border-r border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-900/30 via-slate-950 to-slate-950 pointer-events-none"></div>
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-sky-600/10 rounded-full blur-3xl"></div>

        {/* Brand Header */}
        <div className="relative z-10 flex items-center space-x-3">
          <div className="w-10 h-10 bg-sky-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg text-xl">
            AG
          </div>
          <div>
            <span className="font-extrabold text-2xl tracking-tight text-white block">AutoGuide</span>
            <span className="text-[10px] uppercase tracking-widest text-sky-400 font-bold block">
              ENTERPRISE SaaS
            </span>
          </div>
        </div>

        {/* Hero Title & Features */}
        <div className="relative z-10 my-12 space-y-8 max-w-lg">
          <h1 className="text-3xl lg:text-4xl font-black tracking-tight leading-tight text-slate-100">
            The verified single source of truth for automotive diagnostics.
          </h1>

          <div className="space-y-4 text-sm text-slate-300">
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
              <span>Version-Controlled Service Bulletins (TSB)</span>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
              <span>Region-specific emission specs and standards</span>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
              <span>99.8% accuracy VIN-matched diagnostics mapping</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-slate-500 flex items-center justify-between border-t border-slate-800/80 pt-6">
          <span>Enterprise Database NA_EAST_v2024.12.1</span>
          <span>© 2026 AutoGuide Inc.</span>
        </div>
      </div>

      {/* Right Form Panel with Login & Sign Up Tabs */}
      <div className="md:w-1/2 bg-white p-8 md:p-16 flex items-center justify-center">
        <div className="w-full max-w-md space-y-6">
          {/* Mode Switcher Tabs */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 pb-3 text-sm font-extrabold transition cursor-pointer flex items-center justify-center space-x-2 border-b-2 ${
                mode === 'login' ? 'border-sky-600 text-sky-600' : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>

            <button
              onClick={() => { setMode('register'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 pb-3 text-sm font-extrabold transition cursor-pointer flex items-center justify-center space-x-2 border-b-2 ${
                mode === 'register' ? 'border-sky-600 text-sky-600' : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Sign Up</span>
            </button>
          </div>

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-semibold">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-semibold">
              {successMsg}
            </div>
          )}

          {/* SIGN IN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  Sign in to Enterprise
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Enter your OEM credentials to access diagnostics.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Technician Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@enterprise.autoguide.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Database Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center space-x-2 text-slate-600 font-medium cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded text-sky-600 focus:ring-sky-500" />
                  <span>Remember this machine</span>
                </label>
                <a href="#reset" onClick={(e) => { e.preventDefault(); alert("Password reset link sent to registered email."); }} className="text-sky-600 hover:text-sky-700 font-semibold">
                  Reset Password
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-lg shadow-sm transition duration-150 flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>{loading ? 'Authenticating Session...' : 'Sign In to AutoGuide'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setLoginEmail('m.kovac@enterprise.autoguide.com');
                  setLoginPassword('password123');
                }}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition text-center cursor-pointer"
              >
                Fill Default Demo Technician
              </button>
            </form>
          )}

          {/* SIGN UP FORM */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  Create Technician Account
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Register new service center technician credentials.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Marcus Kovac"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Technician Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="tech@servicecenter.com"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Set password (min 6 chars)"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Role
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="Lead Tech">Lead Tech</option>
                    <option value="Senior Diagnostics Specialist">Senior Diagnostics Specialist</option>
                    <option value="Service Manager">Service Manager</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Primary Region
                  </label>
                  <select
                    value={regRegion}
                    onChange={(e) => setRegRegion(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="US-EAST">US-EAST</option>
                    <option value="EU-WEST">EU-WEST</option>
                    <option value="ASIA-PAC">ASIA-PAC</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-lg shadow-sm transition flex items-center justify-center space-x-2 cursor-pointer mt-2"
              >
                <span>{loading ? 'Creating Account...' : 'Register & Initialize Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          <p className="text-[11px] text-slate-400 text-center leading-relaxed">
            By signing in or registering, you agree to comply with dealer database terms and active non-disclosure repair policies.
          </p>
        </div>
      </div>
    </div>
  );
}
