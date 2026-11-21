import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { LogIn, AlertCircle, Shield, User, CheckCircle2, KeyRound, X } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Forgot / Reset Password Modal State
  const [searchParams] = useSearchParams();
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetStep, setResetStep] = useState('request'); // 'request' | 'confirm'
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetFeedback, setResetFeedback] = useState({ type: '', text: '' });

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const verifyTok = searchParams.get('verifyToken');
    const resetTok = searchParams.get('resetToken');

    if (verifyTok) {
      api
        .post('/auth/verify-email', { token: verifyTok })
        .then(({ data }) => {
          setInfoMsg(data.message || 'Your email address has been verified.');
        })
        .catch((err) => {
          setError(err.response?.data?.message || 'Email verification link expired or invalid.');
        });
    }

    if (resetTok) {
      setResetToken(resetTok);
      setResetStep('confirm');
      setShowResetModal(true);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMsg('');

    try {
      setSubmitting(true);
      const data = await login(email, password);
      const fromPath = location.state?.from?.pathname;
      if (fromPath) {
        navigate(fromPath, { replace: true });
      } else if (data.user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/customer/dashboard', { replace: true });
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Login failed. Please verify your email and password.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setResetFeedback({ type: '', text: '' });
    try {
      const { data } = await api.post('/auth/forgot-password', { email: resetEmail });
      setResetFeedback({
        type: 'success',
        text: data.message || 'Password reset instructions sent.',
      });
      setResetStep('confirm');
    } catch (err) {
      setResetFeedback({
        type: 'error',
        text: err.response?.data?.message || 'Could not process reset request.',
      });
    }
  };

  const handleConfirmReset = async (e) => {
    e.preventDefault();
    setResetFeedback({ type: '', text: '' });
    try {
      const { data } = await api.post('/auth/reset-password', {
        token: resetToken,
        newPassword,
      });
      setInfoMsg(data.message || 'Password reset successfully. Please sign in.');
      setShowResetModal(false);
    } catch (err) {
      setResetFeedback({
        type: 'error',
        text: err.response?.data?.message || 'Invalid or expired reset token.',
      });
    }
  };

  const fillDemoAccount = (role) => {
    setError('');
    if (role === 'admin') {
      setEmail('admin@dynamicit.com');
      setPassword('Password123');
    } else {
      setEmail('rahim@technova.bd');
      setPassword('Password123');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F4]">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-5xl w-full bg-white rounded-2xl border border-slate-200/90 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 animate-reveal-up">
          {/* Left Agency Panel */}
          <div className="hidden lg:flex lg:col-span-5 bg-[#101828] bg-architectural-grid-dark text-white p-10 flex-col justify-between border-r border-slate-800">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#60A5FA] block mb-3">
                Client & Admin Portal
              </span>
              <h2 className="text-2xl font-extrabold font-display leading-snug">
                Real-Time Project & Quotation Command Center.
              </h2>
              <p className="text-sm text-slate-400 mt-3 leading-relaxed">
                Sign in to inspect custom quotations, track milestone completion percentages,
                pay installments via bKash or Nagad, and chat live with your project team.
              </p>
            </div>

            <div className="space-y-3 pt-8 border-t border-slate-800 text-xs text-slate-300">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>One-Click Quotation Approval & Scope Review</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Live 0% → 100% Milestone Progress & Audit Trail</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Server-Verified bKash & Nagad Payment Ledger</span>
              </div>
            </div>
          </div>

          {/* Right Authentication Console */}
          <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
            <div className="mb-7">
              <img
                src="/logo.png"
                alt="Dynamic IT Logo"
                className="h-12 w-auto object-contain mb-4"
              />
              <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-[#101828]">
                Sign In to Your Workspace
              </h1>
              <p className="text-sm text-[#667085] mt-1">
                Enter your registered credentials to access the Dynamic IT portal.
              </p>
            </div>

            {infoMsg && (
              <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{infoMsg}</span>
              </div>
            )}

            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setResetStep('request');
                      setResetFeedback({ type: '', text: '' });
                      setShowResetModal(true);
                    }}
                    className="text-xs font-semibold text-[#2563EB] hover:text-blue-700"
                  >
                    Forgot Password?
                  </button>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 disabled:opacity-60 text-white font-semibold text-sm transition-all shadow-sm"
              >
                <LogIn className="w-4 h-4" />
                <span>{submitting ? 'Signing In...' : 'Sign In to Portal'}</span>
              </button>
            </form>

            {import.meta.env.VITE_DEMO_MODE === 'true' && (
              <div className="mt-6 pt-5 border-t border-slate-200">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center mb-3">
                  Quick Demo Credentials (Viva Presentation)
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => fillDemoAccount('customer')}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>Demo Customer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemoAccount('admin')}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
                  >
                    <Shield className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>Demo Admin</span>
                  </button>
                </div>
              </div>
            )}

            <p className="text-xs text-[#667085] mt-6">
              New to Dynamic IT?{' '}
              <Link to="/register" className="font-semibold text-[#2563EB] hover:text-blue-700">
                Create a Customer Account →
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Password Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#2563EB]" />
                <h3 className="text-base font-bold text-[#101828]">Reset Account Password</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {resetFeedback.text && (
              <div
                className={`p-3 rounded-xl text-xs font-medium border ${
                  resetFeedback.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {resetFeedback.text}
              </div>
            )}

            {resetStep === 'request' ? (
              <form onSubmit={handleRequestReset} className="space-y-4">
                <p className="text-xs text-[#667085]">
                  Enter your registered email address to receive a one-time password reset token.
                </p>
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl"
                />
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setResetStep('confirm')}
                    className="text-xs font-semibold text-[#2563EB]"
                  >
                    Already have a reset token?
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#2563EB] text-white text-xs font-semibold"
                  >
                    Send Reset Token
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleConfirmReset} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Reset Token
                  </label>
                  <input
                    type="text"
                    required
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    placeholder="Paste your reset token"
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    New Password (min 6 chars)
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setResetStep('request')}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#2563EB] text-white text-xs font-semibold"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default LoginPage;
