import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowUpRight, CheckCircle2, Clock } from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import ServiceIcon from '../../components/common/ServiceIcon';
import TypewriterText from '../../components/common/TypewriterText';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatters';

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/services');
        setServices(data.services || []);
      } catch (_err) {
        setServices([]);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const categories = ['all', ...new Set(services.map((s) => s.category))];

  const filteredServices = services.filter((s) => {
    const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
    const matchesSearch =
      !searchTerm ||
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.shortDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      {/* Architectural Studio Header — Deep Midnight Catalogue & Live Typing Brief */}
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
                  // LIVE MONGODB CATALOGUE ({services.length || 6} CAPABILITIES)
                </span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold font-display text-white tracking-tight leading-[1.12]">
                Digital Engineering &{' '}
                <span className="bg-gradient-to-r from-[#60A5FA] via-blue-300 to-white bg-clip-text text-transparent">
                  Growth Capabilities
                </span>
              </h1>
            </div>
            <div className="lg:col-span-5">
              <TypewriterText
                label="CATALOGUE // CAPABILITY MATRIX"
                text="Select any capability below to inspect technical deliverables, typical timelines, and request a customized quotation."
              />
            </div>
          </div>

          {/* Filter & Search Command Bar — Deep Slate Console */}
          <div className="mt-10 bg-[#101828]/95 rounded-2xl border border-slate-800 p-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-2xl">
            <div className="flex flex-wrap items-center gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold capitalize transition-all duration-200 ${
                    selectedCategory === cat
                      ? 'bg-[#2563EB] text-white shadow-md shadow-blue-600/30 border border-blue-400/30'
                      : 'text-slate-300 hover:text-white hover:bg-[#17233B]'
                  }`}
                >
                  {cat === 'all' ? 'All Capabilities' : cat}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-[#60A5FA] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter by keyword or stack..."
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-[#0B1120] border border-slate-700/80 text-white placeholder:text-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] transition-all"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Bento Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 w-full">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="bg-white rounded-2xl border border-slate-200 h-96 animate-pulse p-6"
              />
            ))}
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <p className="text-base font-bold font-display text-slate-900">
              No capabilities matched your filter criteria.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setSearchTerm('');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-[#090D16] text-white text-xs font-semibold"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.map((service, idx) => (
              <div
                key={service._id}
                className="studio-card bg-white rounded-2xl border border-slate-200/90 overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {service.image && (
                    <div className="h-48 overflow-hidden bg-slate-900 relative">
                      <img
                        src={service.image}
                        alt={service.title}
                        className="w-full h-full object-cover opacity-95 group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-x-0 top-0 p-3 flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-md font-mono text-[10px] font-semibold bg-[#090D16]/85 text-white backdrop-blur-sm">
                          {service.category}
                        </span>
                        <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold bg-white/90 text-slate-900">
                          SRV—0{idx + 1}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-[#090D16] text-white flex items-center justify-center shrink-0 group-hover:bg-brand-600 transition-colors">
                        <ServiceIcon name={service.iconName} className="w-5 h-5" />
                      </div>
                      <h2 className="text-xl font-bold font-display text-slate-950 group-hover:text-brand-600 transition-colors">
                        {service.title}
                      </h2>
                    </div>

                    <p className="text-sm text-slate-600 leading-relaxed mb-5">
                      {service.shortDescription}
                    </p>

                    <div className="space-y-2 mb-4 pt-4 border-t border-slate-100">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400 block mb-2">
                        // KEY DELIVERABLES
                      </span>
                      {(service.features || []).slice(0, 4).map((feature) => (
                        <div key={feature} className="flex items-start gap-2 text-xs text-slate-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-[#F8FAFC] border-t border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400 block">
                      STARTING RATE
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="font-mono text-lg font-bold text-slate-950">
                        {formatCurrency(service.startingPrice)}
                      </span>
                      {service.pricingType === 'monthly' && (
                        <span className="font-mono text-xs text-slate-500">/mo</span>
                      )}
                    </div>
                  </div>

                  <Link
                    to={`/services/${service.slug}`}
                    className="group/btn inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#090D16] hover:bg-brand-600 text-white text-xs font-semibold transition-all"
                  >
                    <span>Inspect & Quote</span>
                    <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default ServicesPage;
