import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  ShieldCheck,
  FilePlus2,
  Sparkles,
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
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <Link
          to="/services"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-brand-600 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Services</span>
        </Link>

        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 h-96 animate-pulse" />
        ) : error || !service ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Service Not Found</h2>
            <p className="text-sm text-slate-600 mb-6">{error}</p>
            <Link
              to="/services"
              className="px-5 py-2.5 rounded-lg bg-brand-600 text-white text-sm font-semibold"
            >
              Browse All Services
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Main Details Column */}
            <div className="lg:col-span-8 space-y-8">
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                {service.image && (
                  <div className="h-64 sm:h-80 w-full overflow-hidden bg-slate-100">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="p-6 sm:p-8">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-200">
                      {service.category}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-brand-600" />
                      Typical Timeline: {service.estimatedTimeline || '7 - 15 Days'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                      <ServiceIcon name={service.iconName} className="w-6 h-6" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                      {service.title}
                    </h1>
                  </div>

                  <p className="text-base text-slate-700 leading-relaxed whitespace-pre-line">
                    {service.description}
                  </p>
                </div>
              </div>

              {/* Key Features & Deliverables */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-brand-600" />
                    <span>What’s Included</span>
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

                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-brand-600" />
                    <span>Key Deliverables</span>
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

            {/* Sticky Quote Sidebar */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm sticky top-24 space-y-6">
                <div className="pb-5 border-b border-slate-200">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Estimated Starting Rate
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-3xl font-extrabold text-slate-900">
                      {formatCurrency(service.startingPrice)}
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      {service.pricingType === 'monthly' ? '/ month' : 'starting price'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Final project cost is tailored via a custom quotation based on your exact
                    requirements and timeline.
                  </p>
                </div>

                <div className="space-y-3 text-xs text-slate-600">
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                    <span>Estimated Delivery</span>
                    <span className="font-semibold text-slate-900">
                      {service.estimatedTimeline || '7 - 15 Days'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                    <span>Quotation Turnaround</span>
                    <span className="font-semibold text-slate-900">Within 24 Hours</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <span>Progress Tracking</span>
                    <span className="font-semibold text-emerald-600">Live Client Portal</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRequestQuote}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md shadow-brand-600/20 transition-all"
                >
                  <FilePlus2 className="w-4 h-4" />
                  <span>Request a Quote</span>
                </button>

                <Link
                  to="/contact"
                  className="block w-full text-center px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
                >
                  Have a Question? Contact Us
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
