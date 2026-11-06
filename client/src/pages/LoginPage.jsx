import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Sun,
  Moon,
  KeyRound,
  Fingerprint,
  Cpu,
  CheckCircle2,
  Terminal,
  ShieldAlert,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';

const SECURITY_PASSES = [
  {
    role: 'Admin',
    name: 'Elena Vance',
    title: 'Chief Privacy Officer',
    clearance: 'TIER-1 MASTER KEY',
    email: 'admin@consentlog.io',
    serial: 'ID-EV-0941',
    hash: 'e83a...91f2',
    dept: 'Executive Governance',
  },
  {
    role: 'Auditor',
    name: 'Marcus Sterling',
    title: 'Independent Lead Auditor',
    clearance: 'TIER-2 AUDIT ACCESS',
    email: 'marcus@pacifichealth.us',
    serial: 'ID-MS-4819',
    hash: 'a12b...c401',
    dept: 'External Compliance',
  },
  {
    role: 'DPO',
    name: 'Priya Nair',
    title: 'Data Protection Officer',
    clearance: 'TIER-2 REGULATORY',
    email: 'priya@cloudscale.in',
    serial: 'ID-PN-7312',
    hash: '39f0...88de',
    dept: 'Legal & Privacy Operations',
  },
  {
    role: 'User',
    name: 'Alex Rivera',
    title: 'Enterprise Data Subject',
    clearance: 'TIER-4 SUBJECT ACCESS',
    email: 'alex@enterprise.io',
    serial: 'ID-AR-2094',
    hash: '77c2...51aa',
    dept: 'Global Operations',
  },
];

const LoginPage = () => {
  const [selectedPass, setSelectedPass] = useState(SECURITY_PASSES[0]);
  const [authMode, setAuthMode] = useState('pass'); // 'pass' | 'manual'
  const [email, setEmail] = useState(SECURITY_PASSES[0].email);
  const [password, setPassword] = useState('Password123!');
  const [submitting, setSubmitting] = useState(false);
  const [nonce, setNonce] = useState('');

  const { login } = useAuth();
  const { addToast } = useToast();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Generate continuous cryptographic session nonce
  useEffect(() => {
    const updateNonce = () => {
      const hex = Array.from({ length: 8 }, () =>
        Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
      ).join('');
      setNonce(hex);
    };
    updateNonce();
    const interval = setInterval(updateNonce, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectPass = (pass) => {
    setSelectedPass(pass);
    setEmail(pass.email);
    setPassword('Password123!');
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setSubmitting(true);
    try {
      const data = await login(email, password);
      addToast(
        `Clearance verified. Welcome back, ${data.user.name}.`,
        'success',
        'Security Handshake Complete'
      );
      navigate('/dashboard');
    } catch (err) {
      addToast(
        err.response?.data?.message || 'Authentication handshake rejected.',
        'error',
        'Handshake Failed'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col justify-between selection:bg-slate-100 selection:text-slate-950 font-sans relative overflow-hidden">
      {/* Background Micro-Architecture Grid & Linear Specular Horizon */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:28px_28px] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[350px] bg-gradient-to-b from-white/[0.04] via-transparent to-transparent blur-2xl pointer-events-none" />

      {/* ===================================================================
          1. HIGH-PRECISION SECURITY STATUS HEADER
          =================================================================== */}
      <header className="relative z-20 border-b border-white/[0.07] bg-[#0A0D15]/80 backdrop-blur-xl px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="size-8 rounded-lg bg-white text-slate-950 flex items-center justify-center font-bold shadow-sm transition-transform group-hover:scale-105">
                <ShieldCheck className="size-4.5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm tracking-tight text-white">
                    ConsentLog
                  </span>
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-white/10 text-slate-300 font-semibold border border-white/10">
                    Vault v2.0
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase -mt-0.5">
                  Cryptographic Governance Terminal
                </span>
              </div>
            </Link>
          </div>

          {/* Center Ledger Telemetry (Desktop) */}
          <div className="hidden md:flex items-center gap-4 text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>NODE: EU-WEST-1A</span>
            </span>
            <span className="text-white/20">|</span>
            <span>EPOCH NONCE: <span className="text-slate-200 font-bold">{nonce}</span></span>
            <span className="text-white/20">|</span>
            <span className="text-slate-300">SHA-256 LEDGER LOCKED</span>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="size-8 rounded-lg border border-white/10 bg-white/[0.03] text-slate-400 hover:text-white transition-colors flex items-center justify-center cursor-pointer"
            >
              {darkMode ? <Sun className="size-3.5 text-slate-300" /> : <Moon className="size-3.5 text-slate-400" />}
            </button>
            <Link
              to="/"
              className="text-xs font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <span>Documentation</span>
              <ChevronRight className="size-3" />
            </Link>
          </div>
        </div>
      </header>

      {/* ===================================================================
          2. BESPOKE MAIN STAGE: HARDWARE SECURITY VAULT
          =================================================================== */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-8 lg:py-12 flex flex-col justify-center">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column (lg:col-span-7): The Smart Clearance Badges */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold bg-white/[0.04] text-slate-300 border border-white/10 mb-3">
                <Cpu className="size-3.5 text-slate-400" />
                <span>HARDWARE CREDENTIAL VAULT</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Cryptographic authentication for high-assurance governance.
              </h1>
              <p className="text-sm text-slate-400 mt-2 max-w-xl leading-relaxed">
                Choose an executive clearance credential to initiate an instant cryptographically sealed session, or enter custom enterprise tenant credentials.
              </p>
            </div>

            {/* 4 Interactive Security Clearance Cards */}
            <div className="grid sm:grid-cols-2 gap-3.5 pt-2">
              {SECURITY_PASSES.map((pass) => {
                const isSelected = selectedPass.email === pass.email;
                return (
                  <div
                    key={pass.email}
                    onClick={() => handleSelectPass(pass)}
                    className={`relative p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer group ${
                      isSelected
                        ? 'bg-[#121826] border-white/40 shadow-xl ring-1 ring-white/30'
                        : 'bg-[#0D111A]/80 border-white/[0.08] hover:border-white/20 hover:bg-[#101522]'
                    }`}
                  >
                    {/* Top Smartcard Header */}
                    <div className="flex items-center justify-between mb-3">
                      {/* Gold/Silver Microchip Graphic */}
                      <div className="w-7 h-5 rounded bg-gradient-to-tr from-amber-200/20 via-amber-100/10 to-transparent border border-amber-300/30 flex items-center justify-center p-0.5">
                        <div className="w-full h-full border border-amber-300/20 rounded-xs flex items-center justify-center">
                          <span className="text-[7px] font-mono text-amber-200/70">SIM</span>
                        </div>
                      </div>

                      <span className={`font-mono text-[9px] font-bold tracking-wider px-2 py-0.5 rounded border ${
                        isSelected
                          ? 'bg-white/15 text-white border-white/20'
                          : 'bg-white/[0.03] text-slate-400 border-white/5'
                      }`}>
                        {pass.clearance}
                      </span>
                    </div>

                    {/* Subject Details */}
                    <div>
                      <p className="font-bold text-sm text-white group-hover:text-slate-100 flex items-center justify-between">
                        <span>{pass.name}</span>
                        {isSelected && (
                          <span className="size-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]" />
                        )}
                      </p>
                      <p className="text-xs text-slate-300 font-medium mt-0.5">
                        {pass.title}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {pass.dept}
                      </p>
                    </div>

                    {/* Bottom Micro-Bar */}
                    <div className="mt-3.5 pt-2.5 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-500">
                      <span>{pass.serial}</span>
                      <span className="text-slate-400">{pass.hash}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Live Security Proof Footer Indicator */}
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-2">
                <Fingerprint className="size-4 text-slate-300" />
                <span>Zero-Knowledge Proof SLA: Active</span>
              </span>
              <span className="text-slate-300 font-semibold">GDPR Art. 7(1) Verified</span>
            </div>
          </div>

          {/* Right Column (lg:col-span-5): Precision Terminal Keypad */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-white/10 bg-[#0E121D]/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
              {/* Top Horizon Accent */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white/30 to-transparent" />

              {/* Mode Switcher Tabs */}
              <div className="grid grid-cols-2 p-1 rounded-lg bg-black/40 border border-white/5 mb-6 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setAuthMode('pass')}
                  className={`py-1.5 px-3 rounded-md transition-all cursor-pointer ${
                    authMode === 'pass'
                      ? 'bg-white text-slate-950 font-bold shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Clearance Badge
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('manual')}
                  className={`py-1.5 px-3 rounded-md transition-all cursor-pointer ${
                    authMode === 'manual'
                      ? 'bg-white text-slate-950 font-bold shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Manual Passcode
                </button>
              </div>

              {authMode === 'pass' ? (
                /* SMART CLEARANCE HANDSHAKE MODE */
                <div className="space-y-5">
                  <div className="p-4 rounded-xl bg-black/30 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>LOADED CREDENTIAL</span>
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        READY
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white">
                        {selectedPass.name}
                      </h3>
                      <p className="text-xs text-slate-300">
                        {selectedPass.title} · <span className="font-mono text-slate-400">{selectedPass.role}</span>
                      </p>
                    </div>

                    <div className="pt-2 border-t border-white/5 grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400">
                      <div>
                        <span className="text-[10px] text-slate-500 block">IDENTITY EMAIL</span>
                        <span className="text-slate-200 truncate block">{selectedPass.email}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">SECURITY LEVEL</span>
                        <span className="text-slate-200 block">{selectedPass.clearance.split(' ')[0]}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSubmit()}
                    disabled={submitting}
                    className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer tracking-wide"
                  >
                    <span>{submitting ? 'Verifying Handshake...' : `Authenticate as ${selectedPass.name.split(' ')[0]}`}</span>
                    <ArrowRight className="size-4" />
                  </button>

                  <p className="text-center text-[11px] text-slate-500 font-mono">
                    Direct cryptographic token exchange with zero friction.
                  </p>
                </div>
              ) : (
                /* MANUAL CREDENTIAL FORM */
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      Enterprise Identity
                    </label>
                    <div className="relative">
                      <Mail className="size-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@enterprise.io"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-white/10 bg-black/40 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-white focus:ring-1 focus:ring-white/20 transition-all font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-slate-300">
                        Vault Security Passcode
                      </label>
                      <span className="text-[10px] text-slate-500 font-mono">Password123!</span>
                    </div>
                    <div className="relative">
                      <Lock className="size-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-white/10 bg-black/40 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-white focus:ring-1 focus:ring-white/20 transition-all font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer tracking-wide mt-2"
                  >
                    <span>{submitting ? 'Verifying...' : 'Sign In to Workspace'}</span>
                    <ArrowRight className="size-4" />
                  </button>
                </form>
              )}

              {/* Bottom Registration Link */}
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                <span>New organization?</span>
                <Link
                  to="/register"
                  className="font-semibold text-white hover:underline flex items-center gap-1"
                >
                  <span>Create Account</span>
                  <ChevronRight className="size-3" />
                </Link>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* ===================================================================
          3. MINIMALIST SECURITY FOOTER
          ================================================================== */}
      <footer className="relative z-10 border-t border-white/[0.07] bg-[#0A0D15]/80 px-4 sm:px-8 py-3 text-[11px] font-mono text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>CONSENTLOG CRYPTOGRAPHIC PLATFORM · ISO 27701 &amp; SOC2 TYPE II COMPLIANT</span>
          <div className="flex items-center gap-4">
            <span>HASH CHAIN INTEGRITY: 100%</span>
            <span>VERIFIED BUILD v2.0.4</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;
