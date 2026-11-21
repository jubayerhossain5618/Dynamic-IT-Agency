import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  LayoutDashboard,
  LogOut,
  ArrowUpRight,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Services', path: '/services' },
  { name: 'Pricing', path: '/pricing' },
  { name: 'Portfolio', path: '/portfolio' },
  { name: 'Contact', path: '/contact' },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setMobileOpen(false);
    navigate('/');
  };

  const dashboardPath = isAdmin ? '/admin/dashboard' : '/customer/dashboard';

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Identity */}
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src="/logo.png"
            alt="Dynamic IT Logo"
            className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
          />
          <div className="flex flex-col">
            <span className="text-lg font-extrabold font-display tracking-tight text-[#101828] leading-none">
              Dynamic <span className="text-[#2563EB]">IT</span>
            </span>
            <span className="text-[11px] font-medium text-[#667085] mt-0.5">
              Digital Agency & Client Portal
            </span>
          </div>
        </Link>

        {/* Desktop Navigation — Boxed Architectural Dock with Animated Selection */}
        <nav
          className="hidden md:flex items-center gap-1 p-1.5 rounded-xl bg-[#F4F6FA] border border-slate-200/90 shadow-inner"
          aria-label="Main Navigation"
        >
          {navLinks.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `group relative px-3.5 py-1.5 rounded-lg text-sm transition-all duration-300 flex items-center gap-1.5 overflow-hidden ${
                  isActive
                    ? 'bg-[#2563EB] text-white font-semibold shadow-md shadow-blue-600/25 border border-blue-500 -translate-y-[1px]'
                    : 'text-[#20242C] font-medium border border-transparent hover:bg-white hover:text-[#2563EB] hover:border-blue-200 hover:shadow-xs hover:-translate-y-[1px]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active pulsing dot indicator */}
                  <span
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      isActive
                        ? 'bg-white scale-100 opacity-100 animate-pulse'
                        : 'bg-[#2563EB] scale-0 opacity-0 w-0 group-hover:w-1.5 group-hover:scale-100 group-hover:opacity-70'
                    }`}
                  />
                  <span className="relative z-10">{item.name}</span>

                  {/* Bottom animated accent beam */}
                  <span
                    className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] rounded-full transition-all duration-300 ${
                      isActive
                        ? 'w-3/4 bg-gradient-to-r from-white/70 via-white to-white/70 opacity-100'
                        : 'w-0 bg-[#2563EB] opacity-0 group-hover:w-1/2 group-hover:opacity-100'
                    }`}
                  />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Auth & Portal Controls */}
        <div className="hidden md:flex items-center gap-2.5">
          {isAuthenticated ? (
            <>
              <Link
                to={dashboardPath}
                className="group inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-[#101828] text-white hover:bg-[#2563EB] transition-colors duration-200 shadow-sm"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>{isAdmin ? 'Admin Dashboard' : 'Customer Portal'}</span>
                <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                title="Sign out"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#667085] hover:text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-3.5 py-2 rounded-lg text-sm font-semibold text-[#20242C] hover:text-[#2563EB] hover:bg-slate-100 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="group inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-semibold bg-[#2563EB] text-white hover:bg-blue-700 transition-all duration-200 shadow-sm"
              >
                <span>Start a Project</span>
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-lg text-[#20242C] hover:bg-slate-100"
          aria-label="Toggle Menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-1.5 animate-scale-in">
          {navLinks.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-semibold ${
                  isActive
                    ? 'bg-blue-50 text-[#2563EB]'
                    : 'text-[#20242C] hover:bg-slate-100'
                }`
              }
            >
              <span>{item.name}</span>
              <ArrowUpRight className="w-4 h-4 opacity-50" />
            </NavLink>
          ))}

          <div className="pt-4 mt-3 border-t border-slate-200 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <div className="px-3 py-1.5 text-xs text-[#667085] flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>
                    Signed in as <strong className="text-[#101828]">{user?.name}</strong> ({user?.role})
                  </span>
                </div>
                <Link
                  to={dashboardPath}
                  onClick={() => setMobileOpen(false)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-[#101828] text-white"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  {isAdmin ? 'Open Admin Dashboard' : 'Open Customer Portal'}
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold text-rose-600 bg-rose-50"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-center px-4 py-2.5 rounded-lg text-xs font-semibold border border-slate-300 text-[#20242C]"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-center px-4 py-2.5 rounded-lg text-xs font-semibold bg-[#2563EB] text-white"
                >
                  Start a Project
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
