import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Info, ArrowRight, Sparkles } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatters';

const packages = [
  {
    name: 'Starter Presence Package',
    badge: 'Ideal for New Businesses',
    price: 6500,
    billingNote: 'Sample Starting Package',
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
    name: 'Business Growth Package',
    badge: 'Most Popular',
    price: 15000,
    billingNote: 'Sample Demonstration Rate',
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
    name: 'Full-Scale Digital Accelerator',
    badge: 'Enterprise & E-Commerce',
    price: 28000,
    billingNote: 'Sample Demonstration Rate',
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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* Header */}
      <section className="bg-slate-900 text-white py-16 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
            Transparent Service Packages
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold mt-2 tracking-tight">
            Flexible Pricing for Every Stage of Growth
          </h1>
          <p className="text-slate-300 mt-3 max-w-2xl mx-auto text-base sm:text-lg">
            Choose a curated package below or submit a custom service request to receive an exact
            quotation tailored to your project specifications.
          </p>
        </div>
      </section>

      {/* Sample Rate Notice */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 w-full">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-amber-900 text-xs sm:text-sm">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p>
            <strong>Note on Demonstration Pricing:</strong> All package and service prices shown
            below are <strong>sample demonstration prices</strong> in Bangladeshi Taka (৳) for
            project evaluation until final agency commercial rates are supplied. Every customer
            project receives an individualized quotation from the administrator.
          </p>
        </div>
      </div>

      {/* Curated Packages */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {packages.map((pkg) => (
            <div
              key={pkg.name}
              className={`rounded-2xl p-8 flex flex-col justify-between border transition-all ${
                pkg.featured
                  ? 'bg-slate-900 text-white border-brand-500 shadow-xl ring-2 ring-brand-500/40'
                  : 'bg-white text-slate-900 border-slate-200 shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      pkg.featured
                        ? 'bg-brand-600 text-white'
                        : 'bg-brand-50 text-brand-700 border border-brand-200'
                    }`}
                  >
                    {pkg.badge}
                  </span>
                  {pkg.featured && <Sparkles className="w-5 h-5 text-brand-400" />}
                </div>

                <h2 className="text-xl font-bold mb-2">{pkg.name}</h2>
                <p
                  className={`text-sm leading-relaxed mb-6 ${
                    pkg.featured ? 'text-slate-300' : 'text-slate-600'
                  }`}
                >
                  {pkg.description}
                </p>

                <div className="pb-6 mb-6 border-b border-slate-200/20">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl sm:text-4xl font-extrabold">
                      {formatCurrency(pkg.price)}
                    </span>
                    <span
                      className={`text-xs ${
                        pkg.featured ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      / project base
                    </span>
                  </div>
                  <span
                    className={`text-[11px] block mt-1 ${
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
                className={`w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-sm transition-colors ${
                  pkg.featured
                    ? 'bg-brand-600 hover:bg-brand-500 text-white'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                <span>Request Custom Quotation</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Live Service Starting Rates Table from MongoDB */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Individual Service Starting Rates (Live Database Catalogue)
              </h3>
              <p className="text-xs text-slate-500">
                Retrieved dynamically from MongoDB — Managed by Dynamic IT Administrator
              </p>
            </div>
            <Link
              to="/services"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              View Full Service Specifications →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
                  <th className="py-3.5 px-6">Service Name</th>
                  <th className="py-3.5 px-6">Category</th>
                  <th className="py-3.5 px-6">Typical Timeline</th>
                  <th className="py-3.5 px-6">Sample Starting Rate</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {services.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50">
                    <td className="py-4 px-6 font-semibold text-slate-900">{s.title}</td>
                    <td className="py-4 px-6 text-slate-600">{s.category}</td>
                    <td className="py-4 px-6 text-slate-600">
                      {s.estimatedTimeline || '7 - 15 Days'}
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-900">
                      {formatCurrency(s.startingPrice)}
                      {s.pricingType === 'monthly' && (
                        <span className="text-xs font-normal text-slate-500"> /mo</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        to={`/services/${s.slug}`}
                        className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                      >
                        Request Quote →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PricingPage;
