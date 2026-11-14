import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, Mail, Phone, MapPin, ShieldCheck, ArrowUpRight } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1: Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-brand-600 text-white flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <span className="text-lg font-extrabold text-white tracking-tight">
                Dynamic <span className="text-brand-400">IT</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              From website development to digital marketing, Dynamic IT helps businesses build,
              manage, and scale their online presence with transparent project tracking.
            </p>
            <div className="inline-flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1.5 rounded-full">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Agency Workflow & Client Portal</span>
            </div>
          </div>

          {/* Column 2: Core Services */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Core Services
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  to="/services/website-development"
                  className="hover:text-white transition-colors"
                >
                  Website Development
                </Link>
              </li>
              <li>
                <Link
                  to="/services/meta-ads-and-digital-marketing"
                  className="hover:text-white transition-colors"
                >
                  Meta Ads & Digital Marketing
                </Link>
              </li>
              <li>
                <Link
                  to="/services/landing-page-design"
                  className="hover:text-white transition-colors"
                >
                  Landing Page Design
                </Link>
              </li>
              <li>
                <Link
                  to="/services/domain-and-hosting-assistance"
                  className="hover:text-white transition-colors"
                >
                  Domain & Hosting Assistance
                </Link>
              </li>
              <li>
                <Link
                  to="/services/graphic-design-and-branding"
                  className="hover:text-white transition-colors"
                >
                  Graphic Design & Branding
                </Link>
              </li>
              <li>
                <Link to="/services/seo-services" className="hover:text-white transition-colors">
                  SEO Services
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Platform & Company
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About Dynamic IT
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-white transition-colors">
                  Service Packages & Pricing
                </Link>
              </li>
              <li>
                <Link to="/portfolio" className="hover:text-white transition-colors">
                  Featured Portfolio
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact & Consultation
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1 text-brand-400 hover:text-brand-300 font-medium"
                >
                  <span>Client & Admin Login</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Agency Headquarters
            </h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-400 shrink-0 mt-1" />
                <span>Level 7, Dynamic Tower, Banani C/A, Dhaka-1213, Bangladesh</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-400 shrink-0" />
                <span>+880 1711-000111</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                <span>support@dynamicit.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Dynamic IT. All rights reserved.</p>
          <p>Full-Stack Digital Agency Service Management & Project Tracking Platform</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
