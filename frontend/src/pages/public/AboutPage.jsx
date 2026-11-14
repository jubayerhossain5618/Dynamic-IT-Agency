import React from 'react';
import { Link } from 'react-router-dom';
import {
  Target,
  Eye,
  ShieldCheck,
  Zap,
  Users,
  CheckCircle2,
  ArrowRight,
  Code2,
} from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

const coreValues = [
  {
    icon: ShieldCheck,
    title: 'Radical Transparency',
    description:
      'Every quotation, project milestone, percentage update, and payment installment is visible in real time inside our client portal.',
  },
  {
    icon: Code2,
    title: 'Engineering Excellence',
    description:
      'We build maintainable, responsive, and secure digital solutions using modern industry-standard architectures.',
  },
  {
    icon: Zap,
    title: 'Measurable Business Impact',
    description:
      'Whether launching a website or scaling a Meta Ads campaign, we focus on conversion metrics and tangible business growth.',
  },
  {
    icon: Users,
    title: 'Long-Term Client Partnership',
    description:
      'We support our clients from initial domain & hosting setup through long-term SEO and digital marketing scale.',
  },
];

const workingProcess = [
  {
    phase: 'Phase 1',
    title: 'Requirement Discovery & Analysis',
    detail:
      'Customers submit structured service requests with project goals, budget expectations, deadlines, and reference documents.',
  },
  {
    phase: 'Phase 2',
    title: 'Custom Technical Quotation',
    detail:
      'Our leads evaluate the technical scope, prepare an itemized quotation with delivery days and terms, and send it to the client dashboard.',
  },
  {
    phase: 'Phase 3',
    title: 'Agile Execution & Milestone Tracking',
    detail:
      'Once accepted, the project is initialized with clear milestones. Clients track progress from 0% to 100% and exchange messages directly.',
  },
  {
    phase: 'Phase 4',
    title: 'Quality Assurance & Handover',
    detail:
      'After rigorous testing and final approval, the project is marked completed with complete payment and delivery records.',
  },
];

const AboutPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* Header */}
      <section className="bg-slate-900 text-white py-16 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
            About Dynamic IT
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold mt-2 tracking-tight max-w-3xl">
            Bridging Creative Digital Services with Structured Software Engineering
          </h1>
          <p className="text-slate-300 mt-4 max-w-2xl text-base sm:text-lg leading-relaxed">
            Dynamic IT is a full-service digital agency and project management platform dedicated
            to helping businesses launch websites, run high-ROI marketing campaigns, and scale
            their brand online.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-5">
              <Target className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Our Mission</h2>
            <p className="text-slate-600 leading-relaxed">
              To empower startups, SMEs, and enterprises with accessible, high-performing web
              engineering and digital marketing services—while eliminating agency communication
              gaps through a transparent, database-driven service and project tracking portal.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-5">
              <Eye className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Our Vision</h2>
            <p className="text-slate-600 leading-relaxed">
              To become the benchmark digital agency platform where every client interaction—from
              initial service discovery and custom quotation acceptance to milestone tracking and
              payment verification—is seamless, accountable, and measurable.
            </p>
          </div>
        </div>
      </section>

      {/* Working Process */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
              How We Operate
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
              Our End-to-End Working Process
            </h2>
            <p className="text-slate-600 mt-2">
              Every engagement follows a structured 4-stage lifecycle managed directly through the
              Dynamic IT platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {workingProcess.map((item) => (
              <div
                key={item.phase}
                className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between"
              >
                <div>
                  <span className="inline-block px-2.5 py-1 rounded-md bg-brand-100 text-brand-700 text-xs font-bold mb-3">
                    {item.phase}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.detail}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-200/70 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Tracked in Client Portal</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
            Core Values
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
            Principles That Guide Our Work
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {coreValues.map((val) => {
            const Icon = val.icon;
            return (
              <div
                key={val.title}
                className="bg-white rounded-2xl border border-slate-200 p-6 flex items-start gap-4"
              >
                <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">{val.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{val.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 bg-slate-900 text-white rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold">Explore Our Six Core Digital Services</h3>
            <p className="text-sm text-slate-300 mt-1">
              Discover how Dynamic IT can build and grow your online presence today.
            </p>
          </div>
          <Link
            to="/services"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold shrink-0"
          >
            <span>Browse Services</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;
