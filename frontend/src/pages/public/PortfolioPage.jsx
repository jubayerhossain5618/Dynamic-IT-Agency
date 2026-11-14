import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Layers } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

const portfolioProjects = [
  {
    id: 1,
    name: 'TechNova Corporate Website & Client Portal',
    category: 'Website Development',
    description:
      'A five-page responsive corporate platform with interactive service catalogs, client inquiry automation, and high-speed performance optimization.',
    image:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80',
    technologies: ['React.js', 'Node.js', 'Express', 'MongoDB', 'Tailwind CSS'],
  },
  {
    id: 2,
    name: 'GreenLeaf Organics Meta Ads Scaling Campaign',
    category: 'Meta Ads and Digital Marketing',
    description:
      'Full-funnel Facebook & Instagram acquisition campaign with Server-Side Conversions API, dynamic catalog retargeting, and 4.2x ROAS.',
    image:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80',
    technologies: ['Meta Ads Manager', 'Conversions API', 'Pixel Tracking', 'A/B Creative Testing'],
  },
  {
    id: 3,
    name: 'FinEdge SaaS Product Launch Landing Page',
    category: 'Landing Page Design',
    description:
      'Ultra-fast promotional landing page built for a B2B software launch, featuring interactive pricing toggles and instant lead capture.',
    image:
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1000&q=80',
    technologies: ['React', 'Vite', 'Tailwind CSS', 'Conversion Optimization'],
  },
  {
    id: 4,
    name: 'MedCare Hospital Cloud Hosting & SSL Migration',
    category: 'Domain and Hosting Assistance',
    description:
      'Zero-downtime migration to NVMe cloud infrastructure with automated daily backups, DNS hardening, and corporate email provisioning.',
    image:
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1000&q=80',
    technologies: ['Cloud VPS', 'Nginx', 'Let’s Encrypt SSL', 'DNS Security'],
  },
  {
    id: 5,
    name: 'Aura Lifestyle Complete Brand Identity System',
    category: 'Graphic Design and Branding',
    description:
      'Modern minimalist brand identity package including primary vector logo suite, typography guidelines, packaging, and 15 social media templates.',
    image:
      'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=1000&q=80',
    technologies: ['Brand Strategy', 'Vector Illustration', 'Style Guide', 'Social Media Kit'],
  },
  {
    id: 6,
    name: 'Dhaka Property Hub Organic SEO Growth',
    category: 'SEO Services',
    description:
      'Technical SEO overhaul, structured schema markup, and local search optimization resulting in a 185% increase in organic search inquiries.',
    image:
      'https://images.unsplash.com/photo-1571721795195-a2ca2d3370a9?auto=format&fit=crop&w=1000&q=80',
    technologies: ['Technical SEO', 'Schema.org', 'Google Search Console', 'Keyword Architecture'],
  },
];

const PortfolioPage = () => {
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', ...new Set(portfolioProjects.map((p) => p.category))];

  const filtered =
    activeCategory === 'All'
      ? portfolioProjects
      : portfolioProjects.filter((p) => p.category === activeCategory);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* Header */}
      <section className="bg-slate-900 text-white py-16 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
            Agency Portfolio
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold mt-2 tracking-tight">
            Selected Projects & Case Studies
          </h1>
          <p className="text-slate-300 mt-3 max-w-2xl text-base sm:text-lg">
            Explore real-world examples of our web engineering, landing page design, branding,
            cloud infrastructure, and digital marketing work.
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 w-full">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                activeCategory === cat
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Portfolio Grid */}
      <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-all group"
            >
              <div>
                <div className="h-52 overflow-hidden bg-slate-100 relative">
                  <img
                    src={project.image}
                    alt={project.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold bg-slate-900/85 text-white">
                    {project.category}
                  </span>
                </div>

                <div className="p-6">
                  <h2 className="text-lg font-bold text-slate-900 mb-2">{project.name}</h2>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">
                    {project.description}
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6 pt-3 border-t border-slate-100">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-brand-600" />
                  <span>Technologies & Services Used</span>
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {project.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 bg-white rounded-2xl border border-slate-200 p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Want Similar Results for Your Business?
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Submit your project requirements and receive a customized quotation from our team.
            </p>
          </div>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold shrink-0"
          >
            <span>Start Your Project</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PortfolioPage;
