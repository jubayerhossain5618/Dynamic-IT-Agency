import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, CheckCircle2, Layers, X } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import TypewriterText from '../../components/common/TypewriterText';

const portfolioProjects = [
  {
    id: 1,
    tag: 'Sample Project',
    name: 'TechNova Corporate Website & Client Portal',
    category: 'Website Development',
    description:
      'A five-page responsive corporate platform with interactive service catalogs, client inquiry automation, and high-speed performance optimization.',
    details:
      'Designed as a demonstration of our full-stack web engineering service. Includes responsive Home, About, Services, Portfolio, and Contact pages backed by a Node.js/Express REST API and MongoDB database.',
    deliverables: [
      'Responsive 5-Page React Frontend',
      'Express & MongoDB Inquiry Backend',
      'Admin Content & Request Management Panel',
      'Technical SEO & Metadata Configuration',
    ],
    image:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80',
    technologies: ['React.js', 'Node.js', 'Express', 'MongoDB', 'Tailwind CSS'],
  },
  {
    id: 2,
    tag: 'Sample Project',
    name: 'GreenLeaf Organics Meta Ads Campaign Setup',
    category: 'Meta Ads and Digital Marketing',
    description:
      'Full-funnel Facebook & Instagram acquisition campaign with Server-Side Conversions API, audience segmentation, and ad creative testing.',
    details:
      'Demonstrates our structured digital marketing workflow, including Meta Pixel installation, custom audience retargeting funnels, and weekly conversion reporting.',
    deliverables: [
      'Meta Pixel & Conversions API Setup',
      'Custom & Lookalike Audience Architecture',
      'Ad Creative Variations & Copy Sets',
      'Weekly Conversion Performance Report',
    ],
    image:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80',
    technologies: ['Meta Ads Manager', 'Conversions API', 'Pixel Tracking', 'A/B Creative Testing'],
  },
  {
    id: 3,
    tag: 'Sample Project',
    name: 'FinEdge SaaS Product Launch Landing Page',
    category: 'Landing Page Design',
    description:
      'Fast promotional landing page built for a B2B software launch, featuring clear value proposition sections and lead capture forms.',
    details:
      'Built to showcase conversion-focused single-page design with clear call-to-action hierarchy, mobile-first layout, and fast load performance.',
    deliverables: [
      'Responsive Promotional Landing Page',
      'Lead Capture Form with Database Storage',
      'Mobile Performance & Core Web Vitals Tuning',
    ],
    image:
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1000&q=80',
    technologies: ['React', 'Vite', 'Tailwind CSS', 'Conversion Copy'],
  },
  {
    id: 4,
    tag: 'Sample Project',
    name: 'MedCare Cloud Hosting & SSL Deployment',
    category: 'Domain and Hosting Assistance',
    description:
      'Managed cloud VPS configuration with SSL certificate installation, DNS management, automated backups, and business email setup.',
    details:
      'Illustrates our infrastructure assistance service for businesses migrating websites to reliable cloud hosting with HTTPS security.',
    deliverables: [
      'Domain DNS & Cloud Hosting Configuration',
      'HTTPS / Let’s Encrypt SSL Certificate Setup',
      'Custom Business Email Provisioning',
    ],
    image:
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1000&q=80',
    technologies: ['Cloud Hosting', 'Nginx', 'SSL Certificate', 'DNS Configuration'],
  },
  {
    id: 5,
    tag: 'Sample Project',
    name: 'Aura Lifestyle Brand Identity System',
    category: 'Graphic Design and Branding',
    description:
      'Cohesive brand identity package including primary vector logo suite, color palette guidelines, stationery, and social media templates.',
    details:
      'Showcases our visual branding deliverables for new businesses establishing a consistent look across print and social media channels.',
    deliverables: [
      'Vector Logo Suite (AI, SVG, PDF, PNG)',
      'Typography & Color Palette Style Guide',
      'Social Media Post & Banner Templates',
    ],
    image:
      'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=1000&q=80',
    technologies: ['Brand Identity', 'Vector Design', 'Style Guidelines', 'Social Media Kit'],
  },
  {
    id: 6,
    tag: 'Sample Project',
    name: 'Property Hub Technical & On-Page SEO',
    category: 'SEO Services',
    description:
      'Technical SEO audit, structured schema markup, keyword mapping, and on-page optimization for organic search visibility.',
    details:
      'Demonstrates our search optimization process covering technical site health, page speed, metadata optimization, and Google Search Console setup.',
    deliverables: [
      'Technical SEO & Site Health Audit',
      'Target Keyword Research & Mapping',
      'On-Page Meta Tags & Schema Markup',
    ],
    image:
      'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=1000&q=80',
    technologies: ['Technical SEO', 'Schema.org', 'Search Console', 'Keyword Strategy'],
  },
];

const PortfolioPage = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedProject, setSelectedProject] = useState(null);

  const categories = ['All', ...new Set(portfolioProjects.map((p) => p.category))];

  const filtered =
    activeCategory === 'All'
      ? portfolioProjects
      : portfolioProjects.filter((p) => p.category === activeCategory);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F4]">
      <Navbar />

      {/* Header — Deep Midnight Portfolio Archive & Live Typing Brief */}
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
                  // AGENCY PORTFOLIO (SAMPLE PROJECTS)
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold font-display text-white tracking-tight leading-[1.12]">
                Representative Digital{' '}
                <span className="bg-gradient-to-r from-[#60A5FA] via-blue-300 to-white bg-clip-text text-transparent">
                  Projects & Deliverables
                </span>
              </h1>
            </div>
            <div className="lg:col-span-5">
              <TypewriterText
                label="PORTFOLIO // DELIVERABLE ARCHIVE"
                text="Explore sample project configurations across our six service categories to see the deliverables and technologies included in our work."
              />
            </div>
          </div>

          {/* Category Filter — Deep Slate Bar */}
          <div className="mt-10 bg-[#101828]/95 rounded-2xl border border-slate-800 p-2.5 flex flex-wrap gap-2 shadow-2xl">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  activeCategory === cat
                    ? 'bg-[#2563EB] text-white shadow-md shadow-blue-600/30 border border-blue-400/30'
                    : 'bg-[#141E33] border border-slate-800 text-slate-300 hover:text-white hover:bg-[#192640] hover:border-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((project) => (
            <div
              key={project.id}
              className="studio-card bg-white rounded-xl border border-slate-200/90 overflow-hidden flex flex-col justify-between group"
            >
              <div>
                <div className="h-52 overflow-hidden bg-slate-900 relative">
                  <img
                    src={project.image}
                    alt={project.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#101828]/85 text-white">
                    {project.tag}
                  </span>
                </div>

                <div className="p-6">
                  <span className="text-xs font-semibold text-[#2563EB]">{project.category}</span>
                  <h2 className="text-lg font-bold font-display text-[#101828] mt-1 mb-2">
                    {project.name}
                  </h2>
                  <p className="text-sm text-[#667085] leading-relaxed mb-4">
                    {project.description}
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6 pt-4 border-t border-slate-100 space-y-4">
                <div className="flex flex-wrap gap-1.5">
                  {project.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-[#20242C]"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedProject(project)}
                  className="group/btn w-full inline-flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#F8F7F4] hover:bg-[#101828] border border-slate-200/90 hover:border-[#101828] text-xs font-semibold text-[#101828] hover:text-white transition-all duration-200"
                >
                  <span className="inline-flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-[#2563EB] group-hover/btn:text-[#60A5FA] transition-colors" />
                    <span>View Project Details</span>
                  </span>
                  <span className="w-6 h-6 rounded-lg bg-white group-hover/btn:bg-white/10 border border-slate-200/80 group-hover/btn:border-white/15 flex items-center justify-center transition-all">
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#101828] group-hover/btn:text-white group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Project Details Modal */}
      {selectedProject && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedProject(null)}
        >
          <div
            className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-56 w-full overflow-hidden bg-slate-900 relative">
              <img
                src={selectedProject.image}
                alt={selectedProject.name}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="absolute top-4 right-4 p-2 rounded-lg bg-[#101828]/80 text-white hover:bg-[#101828]"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
              <span className="absolute bottom-4 left-4 px-3 py-1 rounded-md text-xs font-semibold bg-[#101828]/90 text-white">
                {selectedProject.tag} • {selectedProject.category}
              </span>
            </div>

            <div className="p-6 sm:p-8 space-y-5">
              <div>
                <h3 className="text-2xl font-bold font-display text-[#101828]">
                  {selectedProject.name}
                </h3>
                <p className="text-sm text-[#667085] mt-2 leading-relaxed">
                  {selectedProject.details}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#667085] mb-2.5">
                  Included Deliverables
                </h4>
                <ul className="space-y-2">
                  {selectedProject.deliverables.map((d) => (
                    <li key={d} className="flex items-center gap-2 text-sm text-[#20242C]">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <Link
                  to="/customer/requests/new"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-semibold"
                >
                  <span>Request a Similar Project</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => setSelectedProject(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-[#20242C]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default PortfolioPage;
