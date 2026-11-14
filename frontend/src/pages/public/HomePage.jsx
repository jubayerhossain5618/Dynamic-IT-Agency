import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Clock,
  BarChart3,
  Sparkles,
  FileText,
  Layers,
  Award,
  MessageSquare,
} from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import ServiceIcon from '../../components/common/ServiceIcon';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatters';

const workflowSteps = [
  {
    step: '01',
    title: 'Explore & Submit Request',
    description:
      'Browse our digital agency services and submit your project requirements, budget, and preferred deadline.',
  },
  {
    step: '02',
    title: 'Receive Custom Quotation',
    description:
      'Our engineering & marketing leads review your scope and send a transparent quotation directly to your dashboard.',
  },
  {
    step: '03',
    title: 'Accept & Launch Project',
    description:
      'Approve the quotation with one click. Your dedicated project workspace and milestone roadmap are initialized immediately.',
  },
  {
    step: '04',
    title: 'Track Real-Time Progress',
    description:
      'Monitor completion percentages, milestone deliverables, payment balances, and project messages in real time.',
  },
];

const featuredPortfolio = [
  {
    title: 'TechNova Corporate & Client Portal',
    category: 'Website Development',
    description:
      'A full-stack corporate web portal with automated quotation workflows and responsive UI architecture.',
    tech: ['React.js', 'Node.js', 'MongoDB', 'Tailwind CSS'],
    image:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'GreenLeaf Organics Growth Funnel',
    category: 'Meta Ads & Digital Marketing',
    description:
      'Omnichannel Meta Ads & Conversions API funnel generating a 4.2x return on ad spend within 45 days.',
    tech: ['Meta Pixel', 'Conversions API', 'Retargeting', 'A/B Testing'],
    image:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Apex FinTech Product Launch Page',
    category: 'Landing Page Design',
    description:
      'High-converting product launch landing page achieving a 98/100 Lighthouse performance score.',
    tech: ['Vite', 'Tailwind CSS', 'Conversion Copy', 'SEO Schema'],
    image:
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=900&q=80',
  },
];

const testimonials = [
  {
    quote:
      'Dynamic IT transformed how we manage our digital presence. Being able to accept quotations and watch our website progress from 40% to 100% live in the client portal gave us complete peace of mind.',
    author: 'Tanvir Rahim',
    role: 'Managing Director, TechNova Solutions Ltd.',
  },
  {
    quote:
      'Their Meta Ads and SEO team delivered measurable lead growth from the very first month, and every milestone and payment record was transparently documented in our dashboard.',
    author: 'Nusrat Jahan',
    role: 'Founder, GreenLeaf Organics BD',
  },
  {
    quote:
      'Clean engineering, fast communication, and on-time delivery. Dynamic IT feels like an in-house technical partner rather than an external vendor.',
    author: 'Farhan Ahmed',
    role: 'Head of Operations, Apex Retail Group',
  },
];

const HomePage = () => {
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const { data } = await api.get('/services');
        setServices(data.services || []);
      } catch (_err) {
        setServices([]);
      } finally {
        setLoadingServices(false);
      }
    };
    loadServices();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-slate-900 text-white overflow-hidden border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/15 border border-brand-400/30 text-brand-300 text-xs font-semibold tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Full-Service Digital Agency & Client Portal</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
                Grow Your Business with{' '}
                <span className="text-brand-400">Smart Digital Solutions.</span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-300 max-w-2xl leading-relaxed">
                From website development to digital marketing, Dynamic IT helps businesses build
                and grow their online presence. Submit requirements, receive custom quotations,
                and track every project milestone in one unified platform.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-lg shadow-brand-600/25 transition-all"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/services"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 font-semibold text-sm transition-all"
                >
                  <span>Explore Services</span>
                </Link>
              </div>

              <div className="pt-6 grid grid-cols-3 gap-6 border-t border-slate-800/80 max-w-lg">
                <div>
                  <p className="text-2xl font-extrabold text-white">6+</p>
                  <p className="text-xs text-slate-400">Specialized Digital Services</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-white">100%</p>
                  <p className="text-xs text-slate-400">Live Milestone Tracking</p>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-white">24/7</p>
                  <p className="text-xs text-slate-400">Client Portal Access</p>
                </div>
              </div>
            </div>

            {/* Interactive Workflow Preview Card */}
            <div className="lg:col-span-5">
              <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-5">
                <div className="flex items-center justify-between border-b border-slate-700 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Live Project Tracker</p>
                      <p className="text-xs text-slate-400">Client Portal Real-Time View</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    In Progress • 65%
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-700/80">
                    <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
                      <span>Project Scope</span>
                      <span className="text-brand-300 font-semibold">৳15,000 Budget</span>
                    </div>
                    <p className="text-sm font-semibold text-white">
                      Five-Page Responsive Business Website
                    </p>
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-slate-300 mb-1">
                        <span>Overall Completion</span>
                        <span className="font-bold text-brand-400">65%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-2 bg-brand-500 rounded-full w-[65%]" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-700/60">
                      <p className="text-xs text-slate-400">Quotation Status</p>
                      <p className="text-sm font-bold text-emerald-400 mt-0.5 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        Accepted
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-700/60">
                      <p className="text-xs text-slate-400">Est. Delivery</p>
                      <p className="text-sm font-bold text-white mt-0.5 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-brand-400" />
                        15 Days
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
                  <span>End-to-End Database Driven Workflow</span>
                  <Link
                    to="/login"
                    className="text-brand-400 hover:text-brand-300 font-semibold inline-flex items-center gap-1"
                  >
                    <span>Open Portal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
              Our Service Catalogue
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
              Comprehensive Digital Agency Services
            </h2>
            <p className="text-slate-600 mt-2 max-w-2xl">
              Every service is backed by transparent custom quotations, dedicated milestone
              tracking, and direct communication with our engineering and marketing specialists.
            </p>
          </div>
          <Link
            to="/services"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            <span>View All {services.length || 6} Services</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loadingServices ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="bg-white rounded-2xl border border-slate-200 p-6 h-64 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.slice(0, 6).map((service) => (
              <div
                key={service._id}
                className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:border-brand-300 hover:shadow-md transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition-colors">
                      <ServiceIcon name={service.iconName} className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                      {service.category}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-brand-600 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4 line-clamp-3">
                    {service.shortDescription}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 block">
                      Starting from
                    </span>
                    <span className="text-base font-extrabold text-slate-900">
                      {formatCurrency(service.startingPrice)}
                    </span>
                  </div>

                  <Link
                    to={`/services/${service.slug}`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Why Choose Dynamic IT */}
      <section className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
              Why Choose Dynamic IT
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
              Built for Transparency, Speed, and Measurable Results
            </h2>
            <p className="text-slate-600 mt-2">
              Unlike traditional agencies that leave clients guessing in email threads, Dynamic IT
              gives you a dedicated real-time client dashboard from day one.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center mb-4">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                Structured Custom Quotations
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Receive clear scope definitions, delivery timelines, and itemized pricing before
                making any commitment.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center mb-4">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                Live Milestone & Progress Tracking
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Follow your project from 0% to 100% completion with clear milestone checklists and
                expected delivery dates.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                Transparent Payment Ledger
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                View total project cost, recorded installments, and remaining balance at any time
                from your dashboard.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center mb-4">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                Direct Project Messaging
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Communicate directly with project managers inside your project workspace with zero
                lost context.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
            How It Works
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
            From Service Request to Project Delivery in 4 Simple Steps
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {workflowSteps.map((item) => (
            <div
              key={item.step}
              className="bg-white rounded-2xl border border-slate-200 p-6 relative flex flex-col justify-between"
            >
              <div>
                <span className="text-3xl font-black text-brand-100 block mb-3">{item.step}</span>
                <h3 className="text-base font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Portfolio Projects */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
                Featured Work
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
                Recent Client Transformations
              </h2>
            </div>
            <Link
              to="/portfolio"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              <span>Explore Full Portfolio</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredPortfolio.map((item) => (
              <div
                key={item.title}
                className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden flex flex-col"
              >
                <div className="h-48 overflow-hidden bg-slate-200">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-semibold text-brand-600 uppercase tracking-wider">
                      {item.category}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-1 mb-2">{item.title}</h3>
                    <p className="text-sm text-slate-600 mb-4">{item.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-200/80">
                    {item.tech.map((t) => (
                      <span
                        key={t}
                        className="px-2.5 py-0.5 text-xs font-medium bg-white border border-slate-200 rounded-md text-slate-700"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
            Client Feedback
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
            Trusted by Ambitious Businesses
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.author}
              className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm"
            >
              <div>
                <Award className="w-6 h-6 text-brand-600 mb-4" />
                <p className="text-sm text-slate-700 leading-relaxed italic mb-6">"{t.quote}"</p>
              </div>
              <div className="border-t border-slate-100 pt-4">
                <p className="text-sm font-bold text-slate-900">{t.author}</p>
                <p className="text-xs text-slate-500">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="bg-brand-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-extrabold tracking-tight">
              Ready to Launch Your Next Digital Project?
            </h2>
            <p className="text-brand-100 mt-2 text-base">
              Create your free customer account in under a minute, submit your project
              requirements, and receive a customized quotation from our team.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 shrink-0">
            <Link
              to="/register"
              className="px-6 py-3.5 rounded-xl bg-white text-brand-700 font-bold text-sm hover:bg-brand-50 transition-colors shadow-sm"
            >
              Create Customer Account
            </Link>
            <Link
              to="/contact"
              className="px-6 py-3.5 rounded-xl bg-brand-700 text-white border border-brand-500 font-semibold text-sm hover:bg-brand-800 transition-colors"
            >
              Contact Our Team
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
