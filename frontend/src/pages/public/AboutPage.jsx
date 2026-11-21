import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Target,
  Rocket,
  ShieldCheck,
  Zap,
  Users,
  CheckCircle2,
  ArrowRight,
  ArrowUpRight,
  Code2,
  FileSearch,
  FileSpreadsheet,
  Activity,
  Award,
} from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import TypewriterText from '../../components/common/TypewriterText';

const coreValues = [
  {
    code: '01',
    icon: ShieldCheck,
    title: 'Radical Transparency',
    description:
      'Every quotation, project milestone, percentage update, and payment installment is visible in real time inside our client portal.',
  },
  {
    code: '02',
    icon: Code2,
    title: 'Engineering Excellence',
    description:
      'We build maintainable, responsive, and secure digital solutions using modern industry-standard architectures.',
  },
  {
    code: '03',
    icon: Zap,
    title: 'Measurable Business Impact',
    description:
      'Whether launching a website or scaling a Meta Ads campaign, we focus on conversion metrics and tangible business growth.',
  },
  {
    code: '04',
    icon: Users,
    title: 'Long-Term Client Partnership',
    description:
      'We support our clients from initial domain & hosting setup through long-term SEO and digital marketing scale.',
  },
];

const workingProcess = [
  {
    step: '01',
    phase: 'Phase 1',
    title: 'Requirement Discovery & Analysis',
    detail:
      'Customers submit structured service requests with project goals, budget expectations, deadlines, and reference documents.',
    icon: FileSearch,
    deliverable: 'Structured Brief & Scope',
  },
  {
    step: '02',
    phase: 'Phase 2',
    title: 'Custom Technical Quotation',
    detail:
      'Our leads evaluate the technical scope, prepare an itemized quotation with delivery days and terms, and send it to the client dashboard.',
    icon: FileSpreadsheet,
    deliverable: 'Itemized Proposal & SLA',
  },
  {
    step: '03',
    phase: 'Phase 3',
    title: 'Agile Execution & Milestone Tracking',
    detail:
      'Once accepted, the project is initialized with clear milestones. Clients track progress from 0% to 100% and exchange messages directly.',
    icon: Activity,
    deliverable: 'Live 0%–100% Milestone Tracker',
  },
  {
    step: '04',
    phase: 'Phase 4',
    title: 'Quality Assurance & Handover',
    detail:
      'After rigorous testing and final approval, the project is marked completed with complete payment and delivery records.',
    icon: Award,
    deliverable: 'Verified Sign-Off & Support',
  },
];

const AboutPage = () => {
  const [activePhase, setActivePhase] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return undefined;
    const timer = setInterval(() => {
      setActivePhase((prev) => (prev + 1) % workingProcess.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [isPaused]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      {/* Editorial Studio Header — Deep Midnight Manifesto & Live Typing Brief */}
      <section className="bg-[#0B1120] bg-architectural-grid-dark text-white border-b border-slate-800 py-20 relative overflow-hidden">
        {/* Ambient radial glows */}
        <div className="pointer-events-none absolute -top-24 left-1/4 w-[540px] h-[250px] bg-[#2563EB]/20 blur-[120px] rounded-full" />
        <div className="pointer-events-none absolute -bottom-24 right-1/4 w-[480px] h-[220px] bg-[#60A5FA]/10 blur-[120px] rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 animate-reveal-up">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#131C31] border border-blue-500/30 mb-4">
                <span className="w-2 h-2 rounded-full bg-[#60A5FA] animate-pulse" />
                <span className="font-mono text-xs font-semibold uppercase tracking-widest text-[#60A5FA]">
                  // STUDIO MANIFESTO & ARCHITECTURE
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold font-display text-white tracking-tight leading-[1.12]">
                Bridging Creative Digital Services with{' '}
                <span className="bg-gradient-to-r from-[#60A5FA] via-blue-300 to-white bg-clip-text text-transparent">
                  Structured Software Engineering.
                </span>
              </h1>
            </div>
            <div className="lg:col-span-5">
              <TypewriterText
                label="MANIFESTO // STUDIO BRIEF"
                text="Dynamic IT is a full-service digital engineering studio and project tracking platform dedicated to helping businesses launch websites, run high-ROI campaigns, and scale with complete accountability."
              />
            </div>
          </div>

          {/* Architectural Studio Metrics Strip */}
          <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="group relative p-5 rounded-2xl bg-[#101828]/90 hover:bg-[#152036] border border-slate-800 hover:border-[#3B82F6]/60 transition-all duration-300 hover:-translate-y-1 shadow-xl overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-[#2563EB] to-[#60A5FA] opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#60A5FA]">
                01 // PRACTICE AREAS
              </span>
              <p className="text-2xl font-extrabold font-display text-white mt-1.5">
                6 Disciplines
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Engineering, Cloud, SEO & Growth</p>
            </div>
            <div className="group relative p-5 rounded-2xl bg-[#101828]/90 hover:bg-[#152036] border border-slate-800 hover:border-[#3B82F6]/60 transition-all duration-300 hover:-translate-y-1 shadow-xl overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-[#2563EB] to-[#60A5FA] opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#60A5FA]">
                02 // WORKFLOW
              </span>
              <p className="text-2xl font-extrabold font-display text-white mt-1.5">
                100% Portal-Driven
              </p>
              <p className="text-xs text-slate-400 mt-0.5">Zero scattered email spreadsheets</p>
            </div>
            <div className="group relative p-5 rounded-2xl bg-[#101828]/90 hover:bg-[#152036] border border-slate-800 hover:border-[#3B82F6]/60 transition-all duration-300 hover:-translate-y-1 shadow-xl overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-[#2563EB] to-[#60A5FA] opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#60A5FA]">
                03 // ARCHITECTURE
              </span>
              <p className="text-2xl font-extrabold font-display text-white mt-1.5">
                Full-Stack MERN
              </p>
              <p className="text-xs text-slate-400 mt-0.5">React, Node.js, Express & MongoDB</p>
            </div>
            <div className="group relative p-5 rounded-2xl bg-gradient-to-br from-[#162444] to-[#101828] border border-[#3B82F6]/50 hover:border-[#60A5FA] transition-all duration-300 hover:-translate-y-1 shadow-xl shadow-blue-600/15 overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-[#2563EB] to-[#60A5FA]" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#60A5FA]">
                04 // HEADQUARTERS
              </span>
              <p className="text-2xl font-extrabold font-display text-white mt-1.5">Dhaka, BD</p>
              <p className="text-xs text-slate-300 mt-0.5">Serving local & global clients</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision — High-Contrast Architectural Pair */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="studio-card bg-white rounded-2xl border border-slate-200/90 p-8 sm:p-10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-xl bg-slate-950 text-white flex items-center justify-center">
                  <Target className="w-6 h-6" />
                </div>
                <span className="font-mono text-xs font-semibold text-brand-600 uppercase tracking-widest">
                  01 // OUR MISSION
                </span>
              </div>
              <h2 className="text-2xl font-extrabold font-display text-slate-950 mb-3">
                Accessible Engineering & Transparent Delivery
              </h2>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                To empower startups, SMEs, and enterprises with high-performing web engineering and
                digital marketing services—while eliminating agency communication gaps through a
                transparent, database-driven service and project tracking portal.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-slate-100 font-mono text-[11px] text-slate-400">
              MANDATE // CLIENT ACCOUNTABILITY FIRST
            </div>
          </div>

          <div className="studio-card bg-[#090D16] text-white rounded-2xl border border-slate-800 p-8 sm:p-10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-xl bg-brand-600 text-white flex items-center justify-center">
                  <Rocket className="w-6 h-6" />
                </div>
                <span className="font-mono text-xs font-semibold text-brand-400 uppercase tracking-widest">
                  02 // OUR VISION
                </span>
              </div>
              <h2 className="text-2xl font-extrabold font-display text-white mb-3">
                The Benchmark Digital Agency Platform
              </h2>
              <p className="text-slate-300 leading-relaxed text-sm sm:text-base">
                To become the benchmark digital agency platform where every client interaction—from
                initial service discovery and custom quotation acceptance to milestone tracking and
                payment verification—is seamless, accountable, and measurable.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-white/10 font-mono text-[11px] text-brand-400">
              HORIZON // UNIFIED SERVICE & PROJECT ECOSYSTEM
            </div>
          </div>
        </div>
      </section>

      {/* Working Process — Deep Midnight Interactive Timeline */}
      <section className="py-24 bg-[#0B1120] bg-architectural-grid-dark text-white border-y border-slate-800 relative overflow-hidden">
        {/* Subtle deep ambient glow */}
        <div className="pointer-events-none absolute -top-28 left-1/3 w-[560px] h-[260px] bg-[#2563EB]/20 blur-[120px] rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-6">
            <div className="max-w-2xl">
              <span className="font-mono text-xs font-semibold uppercase tracking-widest text-[#60A5FA] block mb-2">
                03 // HOW WE OPERATE
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-white tracking-tight">
                Our End-to-End Working Process
              </h2>
              <p className="text-slate-400 mt-2 text-sm sm:text-base">
                Every engagement follows a structured 4-stage lifecycle managed directly through the
                Dynamic IT platform.
              </p>
            </div>

            <div className="flex items-center gap-2.5 font-mono text-xs font-semibold text-slate-300 bg-[#131C31] border border-blue-500/30 px-4 py-2.5 rounded-xl self-start lg:self-auto shadow-inner">
              <span className="w-2 h-2 rounded-full bg-[#60A5FA] animate-pulse" />
              <span>
                ACTIVE STAGE:{' '}
                <strong className="text-white">{workingProcess[activePhase].phase}</strong>
              </span>
            </div>
          </div>

          {/* Animated Desktop Progress Bar */}
          <div className="hidden lg:block mb-10">
            <div className="h-1.5 w-full bg-[#162033] rounded-full overflow-hidden relative border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-[#2563EB] to-[#60A5FA] transition-all duration-700 ease-out rounded-full"
                style={{ width: `${((activePhase + 1) / workingProcess.length) * 100}%` }}
              />
              <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse-flow" />
            </div>
          </div>

          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {workingProcess.map((item, idx) => {
              const PhaseIcon = item.icon;
              const isActive = activePhase === idx;
              const isPassed = idx <= activePhase;

              return (
                <div
                  key={item.phase}
                  onMouseEnter={() => setActivePhase(idx)}
                  onClick={() => setActivePhase(idx)}
                  className={`group cursor-pointer relative rounded-2xl p-6 flex flex-col justify-between transition-all duration-500 border overflow-hidden ${
                    isActive
                      ? 'bg-[#152036] border-[#3B82F6] -translate-y-2 shadow-2xl shadow-blue-600/20 ring-1 ring-[#60A5FA]/30'
                      : 'bg-[#101828]/90 border-slate-800 hover:bg-[#131D31] hover:border-slate-700 hover:-translate-y-1'
                  }`}
                >
                  {/* Top Active Accent Bar */}
                  <div
                    className={`absolute top-0 inset-x-0 h-1 transition-all duration-500 ${
                      isActive
                        ? 'bg-gradient-to-r from-[#2563EB] to-[#60A5FA] opacity-100'
                        : 'bg-transparent opacity-0'
                    }`}
                  />

                  {/* Deep Watermark Step Number */}
                  <span
                    className={`pointer-events-none select-none absolute -top-2 right-4 text-5xl font-mono font-extrabold tracking-tighter transition-colors duration-500 ${
                      isActive ? 'text-[#2563EB]/25' : 'text-slate-800/80 group-hover:text-slate-700'
                    }`}
                  >
                    {item.step}
                  </span>

                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="relative">
                        {isActive && (
                          <span className="absolute -inset-1.5 rounded-xl bg-[#2563EB]/30 animate-ping opacity-75" />
                        )}
                        <div
                          className={`relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 ${
                            isActive
                              ? 'bg-[#2563EB] text-white shadow-lg shadow-blue-600/40'
                              : isPassed
                              ? 'bg-[#1E293B] text-[#60A5FA] border border-blue-500/30'
                              : 'bg-[#1A2436] text-slate-400 border border-slate-700/80 group-hover:text-white'
                          }`}
                        >
                          <PhaseIcon className="w-5 h-5" />
                        </div>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-md font-mono text-[11px] font-bold border transition-colors ${
                          isActive
                            ? 'bg-[#2563EB] text-white border-[#3B82F6]'
                            : 'bg-[#1A2436] text-slate-300 border-slate-700'
                        }`}
                      >
                        {item.phase}
                      </span>
                    </div>

                    <h3
                      className={`text-base font-bold font-display mb-2 transition-colors ${
                        isActive ? 'text-white' : 'text-slate-100 group-hover:text-white'
                      }`}
                    >
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed mb-6">{item.detail}</p>
                  </div>

                  <div className="relative z-10 space-y-3 pt-4 border-t border-slate-800/90">
                    <div
                      className={`inline-flex items-center px-2.5 py-1 rounded-md font-mono text-[11px] font-semibold border ${
                        isActive
                          ? 'bg-[#1E2D4A] text-[#60A5FA] border-blue-500/30'
                          : 'bg-[#172133] text-slate-300 border-slate-800'
                      }`}
                    >
                      {item.deliverable}
                    </div>

                    <div className="flex items-center justify-between text-xs font-semibold text-emerald-400">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>Tracked in Client Portal</span>
                      </span>
                      <ArrowRight
                        className={`w-3.5 h-3.5 transition-transform duration-300 ${
                          isActive ? 'translate-x-1 text-[#60A5FA]' : 'text-slate-500'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Core Principles Matrix */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="mb-12">
          <span className="font-mono text-xs font-semibold uppercase tracking-widest text-brand-600 block mb-2">
            04 // OPERATING PRINCIPLES
          </span>
          <h2 className="text-3xl font-extrabold font-display text-slate-950">
            Standards That Govern Every Project
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {coreValues.map((val) => {
            const Icon = val.icon;
            return (
              <div
                key={val.title}
                className="studio-card bg-white rounded-2xl border border-slate-200/90 p-7 flex items-start gap-5"
              >
                <div className="w-11 h-11 rounded-xl bg-[#090D16] text-white flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-lg font-bold font-display text-slate-950">{val.title}</h3>
                    <span className="font-mono text-xs text-slate-400">PRINCIPLE // {val.code}</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{val.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-14 bg-[#090D16] bg-architectural-grid-dark text-white rounded-2xl p-8 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 border border-slate-800">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-widest text-brand-400 block mb-1">
              // SERVICE CATALOGUE
            </span>
            <h3 className="text-2xl font-extrabold font-display">
              Inspect Our Six Core Digital Capabilities
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              Review deliverables, timelines, and request a tailored quotation.
            </p>
          </div>
          <Link
            to="/services"
            className="group inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shrink-0 transition-all"
          >
            <span>Explore Capabilities</span>
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;
