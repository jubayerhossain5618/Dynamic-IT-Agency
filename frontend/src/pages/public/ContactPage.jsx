import React, { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import TypewriterText from '../../components/common/TypewriterText';
import api from '../../services/api';

const quickSubjects = [
  'Website Development',
  'Meta Ads & Digital Marketing',
  'Landing Page Design',
  'Technical SEO & Cloud',
];

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      setSubmitting(true);
      const { data } = await api.post('/contact', formData);
      setSuccessMsg(
        data.message || 'Your message has been saved and sent to the Dynamic IT team!'
      );
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || 'Unable to submit message. Please verify your inputs.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const coordinateItems = [
    {
      label: 'OFFICE LOCATION',
      value: 'Level 7, Dynamic Tower, Banani C/A, Dhaka-1213, Bangladesh',
      icon: MapPin,
      mono: false,
    },
    {
      label: 'DIRECT LINE & WHATSAPP',
      value: '+880 1711-000111',
      icon: Phone,
      mono: true,
    },
    {
      label: 'ELECTRONIC MAIL',
      value: 'support@dynamicit.com',
      icon: Mail,
      mono: true,
    },
    {
      label: 'OPERATING HOURS',
      value: 'Sunday – Thursday: 9:30 AM – 6:30 PM (BST)',
      icon: Clock,
      mono: false,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#0B1120]">
      <Navbar />

      {/* Architectural Studio Header — Deep Midnight Consultation Dispatch & Live Typing Brief */}
      <section className="bg-[#0B1120] bg-architectural-grid-dark text-white border-b border-slate-800 py-16 sm:py-20 relative overflow-hidden">
        {/* Ambient radial glows */}
        <div className="pointer-events-none absolute -top-24 left-1/4 w-[520px] h-[240px] bg-[#2563EB]/20 blur-[120px] rounded-full" />
        <div className="pointer-events-none absolute -bottom-24 right-1/4 w-[460px] h-[220px] bg-[#60A5FA]/10 blur-[120px] rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 animate-reveal-up">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#131C31] border border-blue-500/30 mb-4">
                <span className="w-2 h-2 rounded-full bg-[#60A5FA] animate-pulse" />
                <span className="font-mono text-xs font-semibold uppercase tracking-widest text-[#60A5FA]">
                  // DIRECT STUDIO DISPATCH
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold font-display text-white tracking-tight leading-[1.12]">
                Initiate a{' '}
                <span className="bg-gradient-to-r from-[#60A5FA] via-blue-300 to-white bg-clip-text text-transparent">
                  Technical Consultation
                </span>
              </h1>
            </div>
            <div className="lg:col-span-5">
              <TypewriterText
                label="DISPATCH // TECHNICAL DESK"
                text="Have a question about our capabilities, pricing, or project workflow? Send us a dispatch below and our engineering leads will respond promptly."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Coordinates & Inquiry Console Section — Deep Midnight Canvas */}
      <section className="py-16 sm:py-20 bg-[#0B1120] bg-architectural-grid-dark text-white flex-1 w-full relative overflow-hidden">
        {/* Subtle ambient radial lights */}
        <div className="pointer-events-none absolute top-1/3 -left-24 w-[420px] h-[320px] bg-[#2563EB]/15 blur-[130px] rounded-full" />
        <div className="pointer-events-none absolute bottom-10 right-10 w-[460px] h-[280px] bg-[#3B82F6]/10 blur-[130px] rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Left: Studio Coordinates Card */}
            <div className="lg:col-span-5">
              <div className="bg-[#101828]/95 text-white rounded-2xl border border-slate-800 hover:border-blue-500/40 p-7 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden transition-all duration-300">
                {/* Animated top gradient beam */}
                <div className="absolute top-0 inset-x-0 h-1 bg-[#162033] overflow-hidden">
                  <div className="h-full w-full bg-gradient-to-r from-[#2563EB] via-[#60A5FA] to-[#2563EB]" />
                  <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-pulse-flow" />
                </div>

                <div className="pb-5 border-b border-slate-800/90">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#60A5FA]">
                      01 // STUDIO COORDINATES
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/25 font-mono text-[10px] font-semibold text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      DESK ONLINE
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
                    Dhaka Engineering Headquarters
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Reach out directly or visit our Banani office for an in-person consultation.
                  </p>
                </div>

                <div className="space-y-3.5">
                  {coordinateItems.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <div
                        key={item.label}
                        className="group p-3.5 rounded-xl bg-[#131D33]/85 hover:bg-[#172440] border border-slate-800/90 hover:border-[#3B82F6]/60 flex items-start gap-3.5 transition-all duration-300 hover:-translate-y-0.5 shadow-md"
                      >
                        <div className="w-10 h-10 rounded-xl bg-[#1A2742] group-hover:bg-[#2563EB] border border-blue-500/25 group-hover:border-blue-400 text-[#60A5FA] group-hover:text-white flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-blue-600/30">
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-slate-400 group-hover:text-[#60A5FA] transition-colors">
                            {item.label}
                          </p>
                          <p
                            className={`text-sm mt-0.5 ${
                              item.mono
                                ? 'font-mono font-semibold text-white'
                                : 'font-medium text-slate-200'
                            }`}
                          >
                            {item.value}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Response SLA Badge */}
                <div className="pt-4 border-t border-slate-800/90 flex items-center justify-between text-xs text-slate-400">
                  <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[#60A5FA]">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Direct MongoDB Dispatch</span>
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">SLA: &lt; 24 Hours</span>
                </div>
              </div>
            </div>

            {/* Right: Deep Midnight Inquiry Dispatch Console */}
            <div className="lg:col-span-7">
              <div className="bg-[#101828]/95 rounded-2xl border border-slate-800 hover:border-blue-500/40 p-7 sm:p-9 shadow-2xl relative overflow-hidden transition-all duration-300">
                {/* Top gradient accent bar */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#2563EB] via-[#60A5FA] to-transparent" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 mb-6 border-b border-slate-800/90">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 rounded-full bg-[#60A5FA] animate-pulse" />
                      <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#60A5FA]">
                        02 // INQUIRY CONSOLE
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold font-display text-white">
                      Send a Project Inquiry
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1">
                      All inquiries are logged directly in our agency database for immediate review.
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141F36] border border-blue-500/30 font-mono text-[11px] font-semibold text-[#60A5FA] self-start sm:self-auto">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>LIVE DISPATCH</span>
                  </div>
                </div>

                {successMsg && (
                  <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-start gap-2.5 animate-scale-in">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{successMsg}</span>
                  </div>
                )}

                {errorMsg && (
                  <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-2.5 animate-scale-in">
                    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Quick Topic Selector Pills */}
                <div className="mb-5">
                  <span className="block font-mono text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">
                    QUICK-SELECT INQUIRY TOPIC
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {quickSubjects.map((topic) => {
                      const isSelected = formData.subject === topic;
                      return (
                        <button
                          key={topic}
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, subject: topic }))}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 ${
                            isSelected
                              ? 'bg-[#2563EB] text-white border-blue-400 shadow-md shadow-blue-600/30 -translate-y-0.5'
                              : 'bg-[#141E33] text-slate-300 border-slate-800 hover:bg-[#192642] hover:text-white hover:border-blue-500/40'
                          }`}
                        >
                          {topic}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Full Name <span className="text-[#60A5FA]">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g., Tanvir Rahim"
                        className="w-full px-4 py-2.5 text-sm bg-[#0B1120] border border-slate-700/80 text-white placeholder:text-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-[#60A5FA] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Email Address <span className="text-[#60A5FA]">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="you@company.com"
                        className="w-full px-4 py-2.5 text-sm bg-[#0B1120] border border-slate-700/80 text-white placeholder:text-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-[#60A5FA] transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+880 17XX-XXXXXX"
                        className="w-full px-4 py-2.5 text-sm bg-[#0B1120] border border-slate-700/80 text-white placeholder:text-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-[#60A5FA] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Subject <span className="text-[#60A5FA]">*</span>
                      </label>
                      <input
                        type="text"
                        name="subject"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="Website Development / Meta Ads Inquiry"
                        className="w-full px-4 py-2.5 text-sm bg-[#0B1120] border border-slate-700/80 text-white placeholder:text-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-[#60A5FA] transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Project Brief or Message <span className="text-[#60A5FA]">*</span>
                    </label>
                    <textarea
                      name="message"
                      rows={5}
                      required
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us about your business goals, timeline, and any technical questions..."
                      className="w-full px-4 py-3 text-sm bg-[#0B1120] border border-slate-700/80 text-white placeholder:text-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-[#60A5FA] transition-all"
                    />
                  </div>

                  <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="group inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-blue-500 hover:to-[#2563EB] disabled:opacity-60 text-white font-semibold text-xs font-mono uppercase tracking-wider transition-all duration-300 shadow-lg shadow-blue-600/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 border border-blue-400/30"
                    >
                      <Send className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      <span>{submitting ? 'Dispatching...' : 'Send Inquiry'}</span>
                    </button>

                    <span className="font-mono text-[11px] text-slate-400">
                      Instant Email & Portal Notification Enabled
                    </span>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContactPage;
