import React, { useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
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
  ArrowUpRight,
  Shield,
  User,
  Bell,
  CheckCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { formatDateTime } from '../../utils/formatters';

const customerNavItems = [
  { name: 'Workspace Overview', path: '/customer/dashboard', icon: LayoutDashboard, code: '01' },
  { name: 'New Service Request', path: '/customer/requests/new', icon: FilePlus2, code: '02' },
  { name: 'My Requests', path: '/customer/requests', icon: FolderKanban, code: '03' },
  { name: 'Quotations & Proposals', path: '/customer/quotations', icon: FileSpreadsheet, code: '04' },
  { name: 'Active Projects', path: '/customer/projects', icon: Briefcase, code: '05' },
  { name: 'Payment Ledger', path: '/customer/payments', icon: CreditCard, code: '06' },
  { name: 'Project Messages', path: '/customer/messages', icon: MessageSquare, code: '07' },
];

const adminNavItems = [
  { name: 'Command Overview', path: '/admin/dashboard', icon: LayoutDashboard, code: '01' },
  { name: 'Client Requests', path: '/admin/requests', icon: FolderKanban, code: '02' },
  { name: 'Quotation Desk', path: '/admin/quotations', icon: FileSpreadsheet, code: '03' },
  { name: 'Project Operations', path: '/admin/projects', icon: Briefcase, code: '04' },
  { name: 'Payment Ledger', path: '/admin/payments', icon: CreditCard, code: '05' },
  { name: 'Communications', path: '/admin/messages', icon: MessageSquare, code: '06' },
  { name: 'Service Catalogue', path: '/admin/services', icon: Wrench, code: '07' },
  { name: 'Client Directory', path: '/admin/customers', icon: Users, code: '08' },
];

const DashboardLayout = ({ children, title, subtitle, actions }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { user, isAdmin, logout } = useAuth();
  const { connected, notifications, unreadCount, markAsRead, markAllAsRead } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = isAdmin ? adminNavItems : customerNavItems;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleNotificationClick = async (n) => {
    if (!n.isRead) {
      await markAsRead(n._id);
    }
    setNotifOpen(false);
    if (n.link) {
      navigate(n.link);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] flex">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Command Center Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-68 bg-[#101828] text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white p-1 flex items-center justify-center shadow-sm">
              <img
                src="/logo.png"
                alt="Dynamic IT Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="text-base font-extrabold font-display text-white tracking-tight block leading-none">
                Dynamic<span className="text-[#60A5FA]">IT</span>
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mt-0.5 block">
                {isAdmin ? 'ADMIN CONSOLE' : 'CLIENT WORKSPACE'}
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

        {/* Authenticated User Identity Card */}
        <div className="p-4 border-b border-slate-800 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-[#2563EB]/20 border border-blue-500/40 text-blue-300 flex items-center justify-center font-bold text-sm">
                {isAdmin ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>
              <span
                title={connected ? 'Real-Time Socket Connected' : 'Connecting...'}
                className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-[#101828] ${
                  connected ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{user?.name}</p>
              <p className="text-[11px] font-mono text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="px-5 pt-4 pb-1.5">
          <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
            Navigation
          </span>
        </div>
        <nav className="flex-1 px-3 py-1 space-y-1 overflow-y-auto">
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
                  `group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#2563EB] text-white shadow-sm'
                      : 'text-slate-400 hover:bg-white/[0.05] hover:text-white'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </div>
                <span className="font-mono text-[10px] opacity-50">{item.code}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-slate-800 space-y-1">
          <Link
            to="/services"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-slate-400 hover:bg-white/[0.05] hover:text-white transition-colors"
          >
            <span>Public Agency Website</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Command Header */}
        <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline-block font-mono text-[10px] uppercase tracking-widest text-[#2563EB] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                  {location.pathname.split('/').filter(Boolean).join(' / ')}
                </span>
                <h1 className="text-base sm:text-lg font-extrabold font-display text-[#101828] truncate">
                  {title}
                </h1>
              </div>
              {subtitle && (
                <p className="text-xs text-[#667085] hidden md:block truncate mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {actions}

            {/* Real-Time Socket.IO Notification Bell Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifOpen(!notifOpen)}
                aria-label="Notifications"
                className="relative p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white font-mono text-[10px] font-bold flex items-center justify-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden animate-scale-in">
                  <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#101828]">
                        Real-Time Notifications
                      </span>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#2563EB] text-[10px] font-bold">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllAsRead}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2563EB] hover:text-blue-700"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Mark all read</span>
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500">
                        No notifications yet. Live updates will appear here automatically.
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <button
                          key={n._id}
                          type="button"
                          onClick={() => handleNotificationClick(n)}
                          className={`w-full text-left p-3.5 hover:bg-slate-50 transition-colors flex items-start gap-2.5 ${
                            !n.isRead ? 'bg-blue-50/40' : ''
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                              !n.isRead ? 'bg-[#2563EB]' : 'bg-slate-300'
                            }`}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-[#101828] truncate">
                              {n.title}
                            </p>
                            <p className="text-xs text-[#667085] mt-0.5 line-clamp-2">
                              {n.message}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1">
                              {formatDateTime(n.createdAt)}
                            </p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <span className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200 uppercase">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  connected ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
              {user?.role}
            </span>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-reveal-up">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
