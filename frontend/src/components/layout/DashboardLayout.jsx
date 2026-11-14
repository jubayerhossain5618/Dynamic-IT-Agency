import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Layers,
  LayoutDashboard,
  FilePlus2,
  FolderKanban,
  FileSpreadsheet,
  Briefcase,
  CreditCard,
  MessageSquare,
  Users,
  Wrench,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Shield,
  User,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const customerNavItems = [
  { name: 'Dashboard Overview', path: '/customer/dashboard', icon: LayoutDashboard },
  { name: 'Submit Request', path: '/customer/requests/new', icon: FilePlus2 },
  { name: 'My Service Requests', path: '/customer/requests', icon: FolderKanban },
  { name: 'My Quotations', path: '/customer/quotations', icon: FileSpreadsheet },
  { name: 'My Projects', path: '/customer/projects', icon: Briefcase },
  { name: 'Payments & Invoices', path: '/customer/payments', icon: CreditCard },
  { name: 'Project Messages', path: '/customer/messages', icon: MessageSquare },
];

const adminNavItems = [
  { name: 'Admin Overview', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Service Requests', path: '/admin/requests', icon: FolderKanban },
  { name: 'Quotations', path: '/admin/quotations', icon: FileSpreadsheet },
  { name: 'Projects & Progress', path: '/admin/projects', icon: Briefcase },
  { name: 'Payments & Ledger', path: '/admin/payments', icon: CreditCard },
  { name: 'Messages & Inquiries', path: '/admin/messages', icon: MessageSquare },
  { name: 'Manage Services', path: '/admin/services', icon: Wrench },
  { name: 'Manage Customers', path: '/admin/customers', icon: Users },
];

const DashboardLayout = ({ children, title, subtitle, actions }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const navItems = isAdmin ? adminNavItems : customerNavItems;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-200 flex flex-col transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <span className="text-base font-extrabold text-white tracking-tight block leading-none">
                Dynamic <span className="text-brand-400">IT</span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {isAdmin ? 'Admin Control Center' : 'Client Portal'}
              </span>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Badge */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-brand-600/20 border border-brand-500/40 text-brand-300 flex items-center justify-center font-bold text-sm">
              {isAdmin ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={
                  item.path === '/customer/requests' ||
                  item.path === '/customer/dashboard' ||
                  item.path === '/admin/dashboard'
                }
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-slate-800 space-y-1">
          <Link
            to="/services"
            className="flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <span>Public Agency Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-950/50 hover:text-rose-300 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs text-slate-500 hidden sm:block">{subtitle}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {actions}
            <span className="hidden md:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 capitalize">
              {user?.role} Account
            </span>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
