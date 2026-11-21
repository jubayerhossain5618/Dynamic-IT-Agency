import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  ShieldCheck,
  FilePlus2,
  Layers,
} from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import ServiceIcon from '../../components/common/ServiceIcon';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatters';

const ServiceDetailsPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/services/${slug}`);
        setService(data.service);
      } catch (err) {
        setError(err.response?.data?.message || 'Service could not be found.');
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [slug]);

  const handleRequestQuote = () => {
    if (!service) return;
    if (!isAuthenticated) {
      navigate('/login', {
        state: { from: { pathname: `/customer/requests/new?serviceId=${service._id}` } },
      });
      return;
    }
    if (isAdmin) {
      navigate('/admin/services');
      return;
    }
    navigate(`/customer/requests/new?serviceId=${service._id}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full animate-reveal-up">
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/services"
            className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-slate-600 hover:text-slate-950"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Capabilities Directory</span>
          </Link>
          {service && (
            <span className="font-mono text-xs text-slate-400">
              CAPABILITY // {service.slug?.toUpperCase()}
            </span>
          )}
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 h-96 animate-pulse" />
        ) : error || !service ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <h2 className="text-xl font-bold font-display text-slate-900 mb-2">
              Service Not Found
            </h2>
            <p className="text-sm text-slate-600 mb-6">{error}</p>
            <Link
              to="/services"
              className="px-5 py-2.5 rounded-xl bg-[#090D16] text-white text-xs font-semibold"
            >
              Browse All Services
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Main Specification Column */}
            <div className="lg:col-span-8 space-y-8">
              <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-sm">
                {service.image && (
                  <div className="h-64 sm:h-80 w-full overflow-hidden bg-slate-900 relative">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-4 left-4 flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 rounded-md font-mono text-xs font-semibold bg-[#090D16]/90 text-white backdrop-blur-sm">
                        {service.category}
                      </span>
                      <span className="px-3 py-1 rounded-md font-mono text-xs font-semibold bg-white/95 text-slate-900 inline-flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-brand-600" />
                        {service.estimatedTimeline || '7 - 15 Days'}
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-6 sm:p-8">
                  <div className="flex items-center gap-3.5 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-[#090D16] text-white flex items-center justify-center shrink-0">
                      <ServiceIcon name={service.iconName} className="w-6 h-6" />
                    </div>
                    <h1 className="text-2xl sm:text-4xl font-extrabold font-display text-slate-950">
                      {service.title}
                    </h1>
                  </div>

                  <p className="text-base text-slate-600 leading-relaxed whitespace-pre-line">
                    {service.description}
                  </p>
                </div>
              </div>

              {/* Technical Features & Deliverables Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-slate-200/90 p-7 shadow-sm">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-brand-600 block mb-1">
                    01 // TECHNICAL SCOPE
                  </span>
                  <h2 className="text-lg font-bold font-display text-slate-950 mb-5 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-brand-600" />
                    <span>Included Capabilities</span>
                  </h2>
                  <ul className="space-y-3">
                    {(service.features || []).map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-sm text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/90 p-7 shadow-sm">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-brand-600 block mb-1">
                    02 // CLIENT HANDOVER
                  </span>
                  <h2 className="text-lg font-bold font-display text-slate-950 mb-5 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-brand-600" />
                    <span>Verified Deliverables</span>
                  </h2>
                  <ul className="space-y-3">
                    {(service.deliverables && service.deliverables.length > 0
                      ? service.deliverables
                      : [
                          'Custom Project Scope & Technical Blueprint',
                          'Dedicated Milestone Progress Tracking',
                          'Quality Assurance Verification & Handover',
                          'Post-Delivery Support & Documentation',
                        ]
                    ).map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Sticky Obsidian Quote Blueprint Console */}
            <div className="lg:col-span-4">
              <div className="bg-[#090D16] text-white rounded-2xl border border-slate-800 p-7 shadow-xl sticky top-24 space-y-6">
                <div className="pb-5 border-b border-white/10">
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-brand-400">
                    // BASE INVESTMENT RATE
                  </span>
                  <div className="flex items-baseline gap-2 mt-1.5">
                    <span className="font-mono text-3xl font-extrabold text-white">
                      {formatCurrency(service.startingPrice)}
                    </span>
                    <span className="font-mono text-xs text-slate-400">
                      {service.pricingType === 'monthly' ? '/ MONTH' : 'STARTING'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                    Every project receives a tailored quotation based on your exact requirements and
                    target timeline.
                  </p>
                </div>

                <div className="space-y-3 font-mono text-xs text-slate-300">
                  <div className="flex items-center justify-between py-2 border-b border-white/10">
                    <span className="text-slate-400">EST. TIMELINE</span>
                    <span className="font-semibold text-white">
                      {service.estimatedTimeline || '7 - 15 Days'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-white/10">
                    <span className="text-slate-400">QUOTE SLA</span>
                    <span className="font-semibold text-white">&lt; 24 Hours</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-slate-400">TRACKING</span>
                    <span className="font-semibold text-emerald-400">● LIVE PORTAL</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRequestQuote}
                  className="group w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-lg shadow-brand-600/25 transition-all"
                >
                  <FilePlus2 className="w-4 h-4" />
                  <span>Request a Custom Quote</span>
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>

                <Link
                  to="/contact"
                  className="block w-full text-center px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold transition-colors"
                >
                  Schedule Technical Consultation
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ServiceDetailsPage;
