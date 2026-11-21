import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowUpRight, Clock, Sparkles } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import ServiceIcon from '../../components/common/ServiceIcon';
import TypewriterText from '../../components/common/TypewriterText';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatters';

const packages = [
  {
    code: 'TIER // 01',
    name: 'Starter Presence Package',
    badge: 'Ideal for New Ventures',
    price: 6500,
    billingNote: 'One-Time Project Base Rate',
    description:
      'Launch your brand online with a fast, responsive landing page or starter web presence and essential setup.',
    features: [
      'Responsive Single-Page / Landing Page Website',
      'Mobile-First UI & Contact Lead Form',
      'Domain & SSL Configuration Assistance',
      'Basic On-Page SEO Meta Tags',
      '7 Days Delivery & Portal Tracking',
    ],
    featured: false,
  },
  {
    code: 'TIER // 02',
    name: 'Business Growth Package',
    badge: 'Recommended Flagship',
    price: 15000,
    billingNote: 'Complete Business Package',
    description:
      'Complete five-page responsive business website engineered for growing companies and service brands.',
    features: [
      'Five-Page Responsive Business Website',
      'Custom UI/UX & Brand Color Integration',
      'Dynamic Service & Inquiry Management',
      'Speed Optimization & Technical SEO Setup',
      '15 Days Estimated Delivery with Milestone Tracking',
      '30 Days Post-Launch Technical Support',
    ],
    featured: true,
  },
  {
    code: 'TIER // 03',
    name: 'Full-Scale Digital Accelerator',
    badge: 'Enterprise & E-Commerce',
    price: 28000,
    billingNote: 'Full-Stack & Marketing Suite',
    description:
      'Custom full-stack web application combined with Meta Ads funnel setup and technical SEO growth strategy.',
    features: [
      'Full-Stack Custom Web Application (React + Node.js)',
      'Role-Based Admin & Customer Dashboard',
      'Meta Pixel, Conversions API & Retargeting Setup',
      'Comprehensive Technical & Local SEO Audit',
      'Dedicated Project Manager & Priority Support',
    ],
    featured: false,
  },
];

const PricingPage = () => {
  const [services, setServices] = useState([]);
  const [activeRow, setActiveRow] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data } = await api.get('/services');
        setServices(data.services || []);
      } catch (_err) {
        setServices([]);
      }
    };
    fetchServices();
  }, []);

  useEffect(() => {
    if (isPaused || services.length === 0) return undefined;
    const timer = setInterval(() => {
      setActiveRow((prev) => (prev + 1) % services.length);
    }, 3200);
    return () => clearInterval(timer);
  }, [isPaused, services.length]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      {/* Architectural Studio Header — Deep Midnight Rate Architecture & Live Typing Brief */}
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
                  // TRANSPARENT RATE CARD & PACKAGES
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold font-display text-white tracking-tight leading-[1.12]">
                Predictable Investment for{' '}
                <span className="bg-gradient-to-r from-[#60A5FA] via-blue-300 to-white bg-clip-text text-transparent">
                  Every Stage of Scale
                </span>
              </h1>
            </div>
            <div className="lg:col-span-5">
              <TypewriterText
                label="COMMERCIAL // RATE ARCHITECTURE"
                text="Select a structured package below or submit a custom service request to receive an itemized quotation tailored to your technical scope."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Curated Packages Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {packages.map((pkg) => (
            <div
              key={pkg.name}
              className={`studio-card rounded-2xl p-8 flex flex-col justify-between border relative overflow-hidden ${
                pkg.featured
                  ? 'bg-[#090D16] text-white border-brand-500 shadow-2xl'
                  : 'bg-white text-slate-950 border-slate-200/90 shadow-sm'
              }`}
            >
              {pkg.featured && (
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-500 via-sky-400 to-brand-500" />
              )}

              <div>
                <div className="flex items-center justify-between gap-2 mb-5">
                  <span
                    className={`px-3 py-1 rounded-md font-mono text-[11px] font-bold uppercase ${
                      pkg.featured
                        ? 'bg-brand-600 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {pkg.badge}
                  </span>
                  <span
                    className={`font-mono text-xs font-semibold ${
                      pkg.featured ? 'text-brand-400' : 'text-slate-400'
                    }`}
                  >
                    {pkg.code}
                  </span>
                </div>

                <h2 className="text-xl font-bold font-display mb-2">{pkg.name}</h2>
                <p
                  className={`text-sm leading-relaxed mb-6 ${
                    pkg.featured ? 'text-slate-300' : 'text-slate-600'
                  }`}
                >
                  {pkg.description}
                </p>

                <div
                  className={`pb-6 mb-6 border-b ${
                    pkg.featured ? 'border-white/10' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-mono text-3xl sm:text-4xl font-extrabold">
                      {formatCurrency(pkg.price)}
                    </span>
                    <span
                      className={`font-mono text-xs ${
                        pkg.featured ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      / BASE
                    </span>
                  </div>
                  <span
                    className={`font-mono text-[11px] block mt-1 ${
                      pkg.featured ? 'text-brand-300' : 'text-slate-400'
                    }`}
                  >
                    {pkg.billingNote}
                  </span>
                </div>

                <ul className="space-y-3 mb-8">
                  {pkg.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <CheckCircle2
                        className={`w-4 h-4 shrink-0 mt-0.5 ${
                          pkg.featured ? 'text-brand-400' : 'text-emerald-600'
                        }`}
                      />
                      <span className={pkg.featured ? 'text-slate-200' : 'text-slate-700'}>
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                to="/customer/requests/new"
                className={`group w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-xs uppercase tracking-wider font-mono transition-all ${
                  pkg.featured
                    ? 'bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-600/25'
                    : 'bg-[#090D16] hover:bg-brand-600 text-white'
                }`}
              >
                <span>Request Custom Quotation</span>
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Live Service Starting Rates Table — Deep Midnight Interactive Ledger */}
      <section className="py-20 bg-[#0B1120] bg-architectural-grid-dark text-white border-t border-slate-800 relative overflow-hidden">
        {/* Ambient radial glows */}
        <div className="pointer-events-none absolute -top-24 left-1/4 w-[520px] h-[240px] bg-[#2563EB]/20 blur-[120px] rounded-full" />
        <div className="pointer-events-none absolute -bottom-24 right-1/4 w-[460px] h-[220px] bg-[#3B82F6]/10 blur-[120px] rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          <div className="bg-[#101828]/95 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl relative">
            {/* Top animated gradient beam */}
            <div className="h-1 w-full bg-[#162033] relative overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#2563EB] via-[#60A5FA] to-[#2563EB] transition-all duration-700 ease-out"
                style={{
                  width:
                    services.length > 0
                      ? `${((activeRow + 1) / services.length) * 100}%`
                      : '100%',
                }}
              />
              <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse-flow" />
            </div>

            {/* Ledger Header */}
            <div className="p-6 sm:p-8 border-b border-slate-800/90 bg-[#0E1627] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="w-2 h-2 rounded-full bg-[#60A5FA] animate-pulse" />
                  <span className="font-mono text-xs font-semibold uppercase tracking-widest text-[#60A5FA]">
                    // LIVE MONGODB RATE LEDGER
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight">
                  Individual Capability Starting Rates
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Hover or select any capability below to inspect base pricing, delivery windows, and
                  direct quotation links.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto">
                {services[activeRow] && (
                  <div className="hidden sm:inline-flex items-center gap-2 font-mono text-xs font-semibold text-slate-300 bg-[#152036] border border-blue-500/30 px-3.5 py-2 rounded-xl">
                    <Sparkles className="w-3.5 h-3.5 text-[#60A5FA]" />
                    <span>
                      SPOTLIGHT:{' '}
                      <strong className="text-white">{services[activeRow].title}</strong>
                    </span>
                  </div>
                )}

                <Link
                  to="/services"
                  className="group font-mono text-xs font-semibold text-white bg-[#2563EB] hover:bg-blue-500 px-4 py-2.5 rounded-xl inline-flex items-center gap-1.5 transition-all shadow-lg shadow-blue-600/25"
                >
                  <span>Inspect Full Specifications</span>
                  <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </div>
            </div>

            {/* Interactive Deep Capability Table */}
            <div
              className="overflow-x-auto"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#0B1120]/90 border-b border-slate-800 font-mono text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-4 px-6">Capability</th>
                    <th className="py-4 px-6">Discipline</th>
                    <th className="py-4 px-6">Delivery Window</th>
                    <th className="py-4 px-6">Starting Rate</th>
                    <th className="py-4 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-sm">
                  {services.map((s, idx) => {
                    const isActive = activeRow === idx;
                    return (
                      <tr
                        key={s._id}
                        onMouseEnter={() => setActiveRow(idx)}
                        onClick={() => setActiveRow(idx)}
                        className={`group cursor-pointer transition-all duration-300 ${
                          isActive
                            ? 'bg-[#162238] shadow-inner'
                            : 'bg-[#101828]/80 hover:bg-[#141F34]'
                        }`}
                      >
                        <td className="py-4.5 px-6 relative">
                          {/* Left active electric-blue bar */}
                          <span
                            className={`absolute left-0 inset-y-0 w-1 transition-all duration-300 ${
                              isActive
                                ? 'bg-gradient-to-b from-[#2563EB] to-[#60A5FA] opacity-100'
                                : 'bg-transparent opacity-0 group-hover:bg-[#2563EB]/60 group-hover:opacity-100'
                            }`}
                          />
                          <div className="flex items-center gap-3.5">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                                isActive
                                  ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-600/35 scale-105'
                                  : 'bg-[#1A263D] text-[#60A5FA] border border-slate-700/80 group-hover:border-blue-500/40'
                              }`}
                            >
                              <ServiceIcon category={s.category} className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[10px] font-bold text-slate-500">
                                  0{idx + 1}
                                </span>
                                <span
                                  className={`font-bold font-display transition-colors ${
                                    isActive ? 'text-white' : 'text-slate-200 group-hover:text-white'
                                  }`}
                                >
                                  {s.title}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-4.5 px-6">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-md font-mono text-xs font-medium border transition-colors ${
                              isActive
                                ? 'bg-[#1E2E4D] text-[#60A5FA] border-blue-500/40'
                                : 'bg-[#141E30] text-slate-300 border-slate-800'
                            }`}
                          >
                            {s.category}
                          </span>
                        </td>

                        <td className="py-4.5 px-6 font-mono text-xs text-slate-300">
                          <span className="inline-flex items-center gap-1.5">
                            <Clock
                              className={`w-3.5 h-3.5 ${
                                isActive ? 'text-[#60A5FA]' : 'text-slate-500'
                              }`}
                            />
                            <span>{s.estimatedTimeline || '7 - 15 Days'}</span>
                          </span>
                        </td>

                        <td className="py-4.5 px-6 font-mono">
                          <div className="flex items-baseline gap-1.5">
                            <span
                              className={`text-base font-extrabold transition-colors ${
                                isActive ? 'text-[#60A5FA]' : 'text-white'
                              }`}
                            >
                              {formatCurrency(s.startingPrice)}
                            </span>
                            {s.pricingType === 'monthly' ? (
                              <span className="text-[11px] font-semibold text-amber-400/90 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">
                                /mo
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-500">/base</span>
                            )}
                          </div>
                        </td>

                        <td className="py-4.5 px-6 text-right">
                          <Link
                            to={`/services/${s.slug}`}
                            onClick={(e) => e.stopPropagation()}
                            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-mono text-xs font-semibold border transition-all duration-300 ${
                              isActive
                                ? 'bg-[#2563EB] text-white border-[#3B82F6] shadow-md shadow-blue-600/30'
                                : 'bg-[#152036] text-[#60A5FA] border-blue-500/25 hover:bg-[#2563EB] hover:text-white hover:border-[#3B82F6]'
                            }`}
                          >
                            <span>Quote</span>
                            <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PricingPage;
