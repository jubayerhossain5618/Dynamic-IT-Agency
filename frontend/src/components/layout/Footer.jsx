import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ArrowUpRight, ShieldCheck } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#101828] text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main 4-Column Agency Grid */}
        <div className="py-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Column 1: Agency Identity */}
          <div className="lg:col-span-4 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white p-1 flex items-center justify-center">
                <img
                  src="/logo.png"
                  alt="Dynamic IT Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="text-lg font-extrabold font-display text-white tracking-tight block leading-none">
                  Dynamic <span className="text-[#60A5FA]">IT</span>
                </span>
                <span className="text-xs text-slate-400">
                  Digital Agency & Project Platform
                </span>
              </div>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              We design and build custom web applications, landing pages, brand identities, and
              digital marketing campaigns—managed end-to-end through our client portal.
            </p>
            <div className="inline-flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/50 border border-emerald-800/50 px-3 py-1.5 rounded-lg">
              <ShieldCheck className="w-4 h-4" />
              <span>Transparent Quotations & Milestone Tracking</span>
            </div>
          </div>

          {/* Column 2: Digital Services */}
          <div className="lg:col-span-3">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Digital Services
            </h3>
            <ul className="space-y-2.5 text-sm text-slate-400">
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

          {/* Column 3: Company & Portal */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Company
            </h3>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-white transition-colors">
                  Pricing & Packages
                </Link>
              </li>
              <li>
                <Link to="/portfolio" className="hover:text-white transition-colors">
                  Sample Portfolio
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1 text-[#60A5FA] hover:text-blue-300 font-medium"
                >
                  <span>Client Portal</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Office & Contact */}
          <div className="lg:col-span-3">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Dhaka Office
            </h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#60A5FA] shrink-0 mt-1" />
                <span>Level 7, Dynamic Tower, Banani C/A, Dhaka-1213, Bangladesh</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#60A5FA] shrink-0" />
                <span>+880 1711-000111</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#60A5FA] shrink-0" />
                <span>support@dynamicit.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="py-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Dynamic IT. All rights reserved.</p>
          <p>Digital Agency Service Management & Project Tracking Platform</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
