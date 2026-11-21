import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ShieldCheck,
  Clock,
  BarChart3,
  FileText,
  MessageSquare,
  FilePlus2,
  FileSpreadsheet,
  Rocket,
  Activity,
  ChevronDown,
} from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import ServiceIcon from '../../components/common/ServiceIcon';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatters';

const workflowSteps = [
  {
    step: '01',
    title: 'Submit Your Service Request',
    description:
      'Choose a digital service, describe your project requirements, upload reference documents, and set your preferred timeline.',
    icon: FilePlus2,
    badge: 'Customer Portal',
    highlight: 'Structured Project Brief',
  },
  {
    step: '02',
    title: 'Review Custom Quotation',
    description:
      'Our team evaluates your scope and sends a clear quotation detailing the proposed cost, estimated delivery days, and terms.',
    icon: FileSpreadsheet,
    badge: 'Agency Proposal',
    highlight: 'Transparent Scope & Pricing',
  },
  {
    step: '03',
    title: 'Approve & Initialize Project',
    description:
      'Accept the quotation inside your dashboard. Your dedicated project workspace and milestone checklist are created immediately.',
    icon: Rocket,
    badge: 'One-Click Approval',
    highlight: 'Project Workspace Created',
  },
  {
    step: '04',
    title: 'Track Progress & Delivery',
    description:
      'Monitor completion percentage from 0% to 100%, review milestone updates, check payment balances, and message our team directly.',
    icon: Activity,
    badge: 'Real-Time Tracking',
    highlight: 'Live Milestones & Ledger',
  },
];

const featuredPortfolio = [
  {
    tag: 'Sample Project',
    title: 'Corporate Website & Client Inquiry Portal',
    category: 'Website Development',
    description:
      'A five-page responsive business website built with React, Node.js, and MongoDB featuring service pages and structured inquiry management.',
    tech: ['React.js', 'Node.js', 'MongoDB', 'Tailwind CSS'],
    image:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80',
  },
  {
    tag: 'Sample Campaign',
    title: 'E-Commerce Meta Ads & Conversion Funnel',
    category: 'Meta Ads and Digital Marketing',
    description:
      'Targeted Facebook and Instagram campaign architecture with Meta Pixel event tracking, audience segmentation, and creative testing.',
    tech: ['Meta Pixel', 'Conversions API', 'Audience Targeting', 'A/B Testing'],
    image:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=900&q=80',
  },
  {
    tag: 'Sample Project',
    title: 'SaaS Product Launch Landing Page',
    category: 'Landing Page Design',
    description:
      'Conversion-focused promotional landing page designed for fast mobile loading, clear service comparisons, and direct lead capture.',
    tech: ['React', 'Vite', 'Tailwind CSS', 'Responsive UI'],
    image:
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=900&q=80',
  },
];

const demoTestimonials = [
  {
    quote:
      'Having our quotation, milestone progress bar, and payment balance inside one dashboard made managing our website rebuild straightforward and predictable.',
    author: 'Tanvir Rahim',
    initials: 'TR',
    role: 'Sample Client Profile • TechNova Solutions (Demo)',
    service: 'Website Development',
    highlight: '0% → 100% Live Milestone Bar',
  },
  {
    quote:
      'We could review the exact scope before accepting the quotation and message the project manager directly whenever we had questions about our campaign setup.',
    author: 'Nusrat Jahan',
    initials: 'NJ',
    role: 'Sample Client Profile • GreenLeaf Organics (Demo)',
    service: 'Meta Ads & SEO',
    highlight: 'Itemized Scope & Direct Chat',
  },
  {
    quote:
      'Clear communication, structured milestones, and no hidden costs. Every stage from domain setup to final handover was tracked cleanly.',
    author: 'Farhan Ahmed',
    initials: 'FA',
    role: 'Sample Client Profile • Apex Retail (Demo)',
    service: 'Landing Page & Hosting',
    highlight: 'Transparent Ledger & Handover',
  },
];

const faqItems = [
  {
    question: 'How does the quotation and project approval process work?',
    answer:
      'After you register and submit a service request, our administrator reviews your requirements and prepares a custom quotation with an exact price, delivery timeline, and scope. You can accept or decline the quotation directly from your customer dashboard. No project or billing starts until you accept.',
  },
  {
    question: 'Can I upload reference documents or design briefs with my request?',
    answer:
      'Yes. When submitting a service request, you can attach up to 5 reference files (PDF, JPG, PNG, or DOCX up to 8MB each) so our team can review your wireframes, brand guidelines, or specification documents.',
  },
  {
    question: 'How do I track my project once it begins?',
    answer:
      'Once your accepted quotation is converted into an active project, your Customer Portal displays a real-time completion percentage (0% to 100%), individual project milestones, expected delivery date, and an audit history of status updates.',
  },
  {
    question: 'How are project payments recorded and tracked?',
    answer:
      'Dynamic IT uses a transparent payment ledger. When you make an advance or milestone payment via Bank Transfer, bKash, Nagad, or Cash, the administrator records the installment in the system and your dashboard immediately shows the total project cost, amount paid, and remaining balance.',
  },
];

const HomePage = () => {
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [pausedStep, setPausedStep] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

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

  useEffect(() => {
    if (pausedStep) return undefined;
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % workflowSteps.length);
    }, 3200);
    return () => clearInterval(timer);
  }, [pausedStep]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F4]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-[#101828] bg-architectural-grid-dark text-white overflow-hidden border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Value Proposition */}
            <div className="lg:col-span-7 space-y-6 animate-reveal-up">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white/[0.06] border border-white/10 text-xs font-medium text-[#60A5FA]">
                <span className="w-2 h-2 rounded-full bg-[#60A5FA]" />
                <span>Digital Agency Service Management & Project Tracking</span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-extrabold font-display tracking-tight text-white leading-[1.12]">
                Grow Your Business with{' '}
                <span className="text-[#60A5FA]">Smart Digital Solutions.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                From website development to digital marketing, Dynamic IT helps businesses build
                and grow their online presence—with custom quotations, milestone tracking, and
                transparent payment records in one client portal.
              </p>

              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <Link
                  to="/register"
                  className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-[#2563EB] hover:bg-blue-600 text-white font-semibold text-sm shadow-sm transition-all"
                >
                  <span>Get Started</span>
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
                <Link
                  to="/services"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-slate-100 border border-white/15 font-semibold text-sm transition-all"
                >
                  <span>Explore Services</span>
                  <ArrowRight className="w-4 h-4 text-slate-300" />
                </Link>
              </div>

              {/* Clear Agency Workflow Summary Strip */}
              <div className="pt-8 grid grid-cols-3 gap-6 border-t border-slate-800 max-w-xl">
                <div>
                  <p className="text-xl font-bold font-display text-white">6 Core Services</p>
                  <p className="text-xs text-slate-400 mt-0.5">Web, Marketing, SEO & Hosting</p>
                </div>
                <div className="border-l border-slate-800 pl-6">
                  <p className="text-xl font-bold font-display text-white">Custom Quotes</p>
                  <p className="text-xs text-slate-400 mt-0.5">Clear scope before you commit</p>
                </div>
                <div className="border-l border-slate-800 pl-6">
                  <p className="text-xl font-bold font-display text-white">0% → 100%</p>
                  <p className="text-xs text-slate-400 mt-0.5">Live milestone progress tracking</p>
                </div>
              </div>
            </div>

            {/* Right Interactive Portal Preview */}
            <div className="lg:col-span-5 animate-reveal-up delay-150">
              <div className="rounded-xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden">
                <div className="px-4 py-3 bg-[#0B101B] border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80" />
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    Client Portal — Project Tracker
                  </span>
                  <span className="text-[11px] font-medium text-emerald-400">● Active</span>
                </div>

                <div className="p-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-white p-1 flex items-center justify-center">
                        <img
                          src="/logo.png"
                          alt="Dynamic IT Logo"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Website Development</p>
                        <p className="text-sm font-bold text-white">
                          Five-Page Responsive Business Website
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      In Progress
                    </span>
                  </div>

                  <div className="p-4 rounded-lg bg-[#101828] border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-medium">Completion Progress</span>
                      <span className="text-[#60A5FA] font-bold">65%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-[#2563EB] rounded-full w-[65%]" />
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1 text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>UI Design Approved</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#60A5FA]" />
                        <span>Frontend & API Build</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-lg bg-white/[0.03] border border-slate-800">
                      <span className="text-xs text-slate-400 block">Approved Quotation</span>
                      <p className="text-base font-bold text-white mt-0.5">৳15,000</p>
                      <span className="text-[11px] text-emerald-400">Accepted by Customer</span>
                    </div>
                    <div className="p-3.5 rounded-lg bg-white/[0.03] border border-slate-800">
                      <span className="text-xs text-slate-400 block">Estimated Delivery</span>
                      <p className="text-base font-bold text-white mt-0.5">15 Days</p>
                      <span className="text-[11px] text-slate-400">3 Milestones Tracked</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Real-Time Database Workflow</span>
                    <Link
                      to="/login"
                      className="text-[#60A5FA] hover:text-blue-300 font-semibold inline-flex items-center gap-1"
                    >
                      <span>Sign In to Portal</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-b border-slate-200 pb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB] block mb-1.5">
              Our Services
            </span>
            <h2 className="text-3xl font-extrabold font-display text-[#101828]">
              Digital Services Built for Growing Businesses
            </h2>
          </div>
          <Link
            to="/services"
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-[#2563EB] hover:text-blue-700"
          >
            <span>View All {services.length || 6} Services</span>
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>

        {loadingServices ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="bg-white rounded-xl border border-slate-200 p-6 h-64 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.slice(0, 6).map((service) => (
              <Link
                key={service._id}
                to={`/services/${service.slug}`}
                className="studio-card bg-white rounded-xl border border-slate-200/90 p-6 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-11 h-11 rounded-lg bg-[#101828] text-white flex items-center justify-center group-hover:bg-[#2563EB] transition-colors duration-200">
                      <ServiceIcon name={service.iconName} className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-slate-100 text-[#667085]">
                      {service.category}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold font-display text-[#101828] mb-2 group-hover:text-[#2563EB] transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-sm text-[#667085] leading-relaxed mb-6 line-clamp-3">
                    {service.shortDescription}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-[#667085] block">Starting from</span>
                    <span className="text-base font-bold text-[#101828]">
                      {formatCurrency(service.startingPrice)}
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#2563EB]">
                    <span>Service Details</span>
                    <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Why Choose Dynamic IT — Asymmetric Split */}
      <section className="py-20 bg-white border-y border-slate-200/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB] block">
                Why Choose Dynamic IT
              </span>
              <h2 className="text-3xl font-extrabold font-display text-[#101828] leading-tight">
                A Clearer Way to Commission and Track Digital Work
              </h2>
              <p className="text-sm sm:text-base text-[#667085] leading-relaxed">
                Instead of managing project scope, pricing, and updates across disconnected chat
                threads, Dynamic IT gives every client a dedicated workspace from initial request to
                final handover.
              </p>
              <div className="pt-2">
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#101828] text-white hover:bg-[#2563EB] text-xs font-semibold transition-colors"
                >
                  <span>Learn More About Our Agency</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="studio-card p-6 rounded-xl bg-[#F8F7F4] border border-slate-200/90">
                <div className="w-10 h-10 rounded-lg bg-[#2563EB] text-white flex items-center justify-center mb-4">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold font-display text-[#101828] mb-1.5">
                  Written Custom Quotations
                </h3>
                <p className="text-sm text-[#667085] leading-relaxed">
                  Review proposed costs, estimated delivery timelines, and project scope before
                  approving any work.
                </p>
              </div>

              <div className="studio-card p-6 rounded-xl bg-[#F8F7F4] border border-slate-200/90">
                <div className="w-10 h-10 rounded-lg bg-[#2563EB] text-white flex items-center justify-center mb-4">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold font-display text-[#101828] mb-1.5">
                  Real-Time Progress & Milestones
                </h3>
                <p className="text-sm text-[#667085] leading-relaxed">
                  Track your project completion percentage and milestone deliverables as our team
                  builds and tests your solution.
                </p>
              </div>

              <div className="studio-card p-6 rounded-xl bg-[#F8F7F4] border border-slate-200/90">
                <div className="w-10 h-10 rounded-lg bg-[#2563EB] text-white flex items-center justify-center mb-4">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold font-display text-[#101828] mb-1.5">
                  Transparent Payment Records
                </h3>
                <p className="text-sm text-[#667085] leading-relaxed">
                  Check your total project cost, recorded payment installments, and remaining
                  balance at any time.
                </p>
              </div>

              <div className="studio-card p-6 rounded-xl bg-[#F8F7F4] border border-slate-200/90">
                <div className="w-10 h-10 rounded-lg bg-[#2563EB] text-white flex items-center justify-center mb-4">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold font-display text-[#101828] mb-1.5">
                  Direct Project Communication
                </h3>
                <p className="text-sm text-[#667085] leading-relaxed">
                  Exchange messages directly with the administrator inside your project thread
                  without losing context.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How We Work — Interactive 4-Step Workflow */}
      <section className="py-20 bg-[#101828] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#60A5FA] block mb-1.5">
                How We Work
              </span>
              <h2 className="text-3xl font-extrabold font-display text-white">
                From Service Request to Project Delivery in 4 Steps
              </h2>
            </div>
            <p className="text-slate-400 text-sm max-w-md">
              Click or hover any step below to see how your project moves through the Dynamic IT
              platform.
            </p>
          </div>

          <div className="hidden lg:block relative mb-8">
            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#2563EB] transition-all duration-500 ease-out rounded-full"
                style={{ width: `${((activeStep + 1) / workflowSteps.length) * 100}%` }}
              />
            </div>
          </div>

          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            onMouseEnter={() => setPausedStep(true)}
            onMouseLeave={() => setPausedStep(false)}
          >
            {workflowSteps.map((item, idx) => {
              const StepIcon = item.icon;
              const isActive = activeStep === idx;

              return (
                <div
                  key={item.step}
                  onMouseEnter={() => setActiveStep(idx)}
                  onClick={() => setActiveStep(idx)}
                  className={`cursor-pointer rounded-xl p-6 flex flex-col justify-between transition-all duration-300 border ${
                    isActive
                      ? 'bg-slate-900 border-[#2563EB] -translate-y-1 shadow-lg'
                      : 'bg-white/[0.03] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div
                        className={`w-11 h-11 rounded-lg flex items-center justify-center transition-colors ${
                          isActive
                            ? 'bg-[#2563EB] text-white'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        <StepIcon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-800 text-slate-300">
                        Step {item.step}
                      </span>
                    </div>

                    <h3 className="text-base font-bold font-display text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed mb-5">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-[#60A5FA] font-medium">
                    <span>{item.highlight}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Portfolio Projects (Clearly Labeled Sample Projects) */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB] block mb-1.5">
              Portfolio Showcase
            </span>
            <h2 className="text-3xl font-extrabold font-display text-[#101828]">
              Featured Sample Projects
            </h2>
            <p className="text-sm text-[#667085] mt-1">
              Representative project examples demonstrating the types of web and marketing solutions
              we deliver.
            </p>
          </div>
          <Link
            to="/portfolio"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#2563EB] hover:text-blue-700"
          >
            <span>Explore Full Portfolio</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
          {featuredPortfolio.map((item) => (
            <div
              key={item.title}
              className="studio-card bg-white rounded-xl border border-slate-200/90 overflow-hidden flex flex-col group"
            >
              <div className="h-48 overflow-hidden bg-slate-100 relative">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#101828]/85 text-white">
                  {item.tag}
                </span>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold text-[#2563EB]">{item.category}</span>
                  <h3 className="text-lg font-bold font-display text-[#101828] mt-1 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#667085] leading-relaxed mb-5">{item.description}</p>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-4 border-t border-slate-100">
                  {item.tech.map((t) => (
                    <span
                      key={t}
                      className="px-2.5 py-1 text-xs font-medium bg-slate-100 rounded-md text-[#20242C]"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials — Deep Midnight Client Experience Section (Clearly Identified Demo Content) */}
      <section className="py-24 bg-[#0B1120] bg-architectural-grid-dark text-white border-y border-slate-800 relative overflow-hidden">
        {/* Deep ambient radial glow */}
        <div className="pointer-events-none absolute -top-24 right-1/4 w-[540px] h-[240px] bg-[#2563EB]/20 blur-[120px] rounded-full" />
        <div className="pointer-events-none absolute -bottom-24 left-1/4 w-[460px] h-[220px] bg-[#3B82F6]/10 blur-[120px] rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-6">
            <div className="max-w-2xl">
              <span className="font-mono text-xs font-semibold uppercase tracking-widest text-[#60A5FA] block mb-2">
                04 // CLIENT EXPERIENCE (DEMO PROFILES)
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white tracking-tight">
                What Clients Value About Our Workflow
              </h2>
              <p className="text-slate-400 mt-2 text-sm sm:text-base">
                Representative client feedback highlighting how structured quotations, real-time
                milestone tracking, and unified billing simplify project delivery.
              </p>
            </div>

            <div className="inline-flex items-center gap-2.5 font-mono text-xs font-semibold text-slate-300 bg-[#131C31] border border-blue-500/30 px-4 py-2.5 rounded-xl self-start lg:self-auto shadow-inner">
              <ShieldCheck className="w-4 h-4 text-[#60A5FA]" />
              <span>100% PORTAL-TRACKED WORKFLOW</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {demoTestimonials.map((t, index) => (
              <div
                key={t.author}
                className="group relative bg-[#101828]/95 hover:bg-[#152036] rounded-2xl border border-slate-800 hover:border-[#3B82F6]/70 p-7 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 shadow-xl hover:shadow-2xl hover:shadow-blue-600/15 overflow-hidden"
              >
                {/* Top gradient accent bar */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#2563EB] via-[#60A5FA] to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Subtle decorative quotation watermark */}
                <span
                  aria-hidden="true"
                  className="pointer-events-none select-none absolute top-3 right-5 font-display text-6xl font-extrabold leading-none text-[#2563EB]/15 group-hover:text-[#60A5FA]/25 transition-colors duration-300"
                >
                  &ldquo;
                </span>

                <div className="relative z-10">
                  <div className="flex items-center justify-between gap-2 mb-5">
                    <span className="inline-flex items-center px-3 py-1 rounded-md bg-[#1E2D4A] text-[#60A5FA] border border-blue-500/30 text-xs font-semibold">
                      {t.service}
                    </span>
                    <span className="font-mono text-[11px] font-semibold text-slate-500 group-hover:text-slate-400 transition-colors">
                      0{index + 1} / 03
                    </span>
                  </div>

                  <p className="text-sm sm:text-[15px] text-slate-200 leading-relaxed mb-6">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>

                <div className="relative z-10 space-y-4 pt-5 border-t border-slate-800/90">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#131C31] border border-slate-800 text-emerald-400 font-mono text-[11px] font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>{t.highlight}</span>
                  </div>

                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] text-white font-display font-bold text-xs flex items-center justify-center shrink-0 shadow-md shadow-blue-600/30 border border-blue-400/30">
                      {t.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold font-display text-white truncate">
                        {t.author}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5 truncate">{t.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions (FAQ) Section */}
      <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB] block mb-1.5">
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl font-extrabold font-display text-[#101828]">
            Common Questions About Working With Dynamic IT
          </h2>
        </div>

        <div className="space-y-3">
          {faqItems.map((item, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={item.question}
                className="bg-white rounded-xl border border-slate-200/90 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                  aria-expanded={isOpen}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                >
                  <span className="text-sm sm:text-base font-bold font-display text-[#101828]">
                    {item.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#667085] shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#2563EB]' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-sm text-[#667085] leading-relaxed border-t border-slate-100">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Contact CTA Section */}
      <section className="py-16 bg-[#101828] text-white border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display">
              Ready to Request a Custom Quotation?
            </h2>
            <p className="text-slate-300 mt-2 text-sm sm:text-base">
              Create your customer account to submit your project requirements or send our team a
              direct inquiry.
            </p>
          </div>
          <div className="flex flex-wrap gap-3.5 shrink-0">
            <Link
              to="/register"
              className="px-6 py-3 rounded-lg bg-[#2563EB] hover:bg-blue-600 text-white font-semibold text-sm transition-colors"
            >
              Create Customer Account
            </Link>
            <Link
              to="/contact"
              className="px-6 py-3 rounded-lg bg-white/10 hover:bg-white/15 text-white border border-white/15 font-semibold text-sm transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
