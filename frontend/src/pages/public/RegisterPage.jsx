import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { useAuth } from '../../context/AuthContext';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    password: '',
    confirmPassword: '',
    smsConsent: false,
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setSubmitting(true);
      await register(formData);
      navigate('/customer/dashboard', { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || 'Registration failed. Please verify your details.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-5xl w-full bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 animate-reveal-up">
          {/* Left Architectural Studio Onboarding Panel */}
          <div className="hidden lg:flex lg:col-span-5 bg-[#090D16] bg-architectural-grid-dark text-white p-10 flex-col justify-between border-r border-white/10">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-widest text-brand-400 block mb-3">
                // CLIENT ONBOARDING
              </span>
              <h2 className="text-2xl font-extrabold font-display leading-snug">
                Launch Your Dedicated Client Workspace.
              </h2>
              <p className="text-sm text-slate-400 mt-3 leading-relaxed">
                Registering a client account gives you direct access to submit service briefs,
                receive custom engineering quotations, and track your project milestones live.
              </p>
            </div>

            <div className="space-y-3 pt-8 border-t border-white/10 text-xs text-slate-300">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Submit Requirements & Reference Attachments</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Receive Itemized Quotations Within 24 Hours</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Direct Project Messaging with Studio Leads</span>
              </div>
            </div>
          </div>

          {/* Right Registration Form */}
          <div className="lg:col-span-7 p-8 sm:p-12">
            <div className="mb-6">
              <img
                src="/logo.png"
                alt="Dynamic IT Logo"
                className="h-12 w-auto object-contain mb-3"
              />
              <span className="font-mono text-[11px] uppercase tracking-widest text-brand-600 block">
                // NEW CLIENT ACCOUNT
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-950 mt-1">
                Create Your Client Account
              </h1>
            </div>

            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Arafat Hossain"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+880 17XX-XXXXXX"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@company.com"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Company / Organization (Optional)
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="Your Business Ltd."
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="At least 6 characters"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={formData.smsConsent}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, smsConsent: e.target.checked }))
                  }
                  className="mt-0.5 rounded border-slate-300 text-[#2563EB]"
                />
                <span>
                  I consent to receive SMS notifications regarding my service quotations, project
                  milestones, and payment confirmations.
                </span>
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#090D16] hover:bg-brand-600 disabled:opacity-60 text-white font-semibold text-xs font-mono uppercase tracking-wider transition-all shadow-sm"
              >
                <UserPlus className="w-4 h-4" />
                <span>{submitting ? 'Creating Workspace...' : 'Initialize Client Account'}</span>
              </button>
            </form>

            <p className="text-xs text-slate-600 mt-6">
              Already have a workspace?{' '}
              <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
                Sign In →
              </Link>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default RegisterPage;
