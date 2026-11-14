import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban,
  FileSpreadsheet,
  Briefcase,
  CheckCircle2,
  FilePlus2,
  CreditCard,
  MessageSquare,
  ArrowRight,
  User,
  Clock,
  RefreshCw,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import ProgressBar from '../../components/common/ProgressBar';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters';

const CustomerDashboard = () => {
  const { user, updateProfile } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    company: user?.company || '',
  });
  const [profileMsg, setProfileMsg] = useState('');

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/dashboard/customer');
      setDashboard(data);
    } catch (_err) {
      // handled gracefully
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(profileForm);
      setProfileMsg('Profile updated successfully.');
      setEditingProfile(false);
      setTimeout(() => setProfileMsg(''), 3000);
    } catch (_err) {
      setProfileMsg('Could not update profile.');
    }
  };

  const stats = dashboard?.stats || {
    totalRequests: 0,
    pendingQuotations: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalProjectValue: 0,
    totalPaid: 0,
    remainingBalance: 0,
    unreadMessages: 0,
  };

  return (
    <DashboardLayout
      title="Customer Dashboard"
      subtitle="Track your service requests, custom quotations, active projects, and payment balances"
      actions={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchDashboard}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <Link
            to="/customer/requests/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm"
          >
            <FilePlus2 className="w-4 h-4" />
            <span>New Request</span>
          </Link>
        </div>
      }
    >
      {/* Welcome & Customer Profile Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 mb-8 border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/20 text-brand-300 border border-brand-400/30 mb-3">
              <User className="w-3.5 h-3.5" />
              <span>Welcome back, {user?.name}</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Your Digital Agency Workspace
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Review custom quotations from Dynamic IT, monitor real-time project progress, and
              communicate directly with your project team.
            </p>
          </div>

          <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-4 min-w-[260px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Customer Profile
              </span>
              <button
                type="button"
                onClick={() => {
                  setProfileForm({
                    name: user?.name || '',
                    phone: user?.phone || '',
                    company: user?.company || '',
                  });
                  setEditingProfile(!editingProfile);
                }}
                className="text-xs font-semibold text-brand-400 hover:text-brand-300"
              >
                {editingProfile ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
            <p className="text-sm font-bold text-white">{user?.name}</p>
            <p className="text-xs text-slate-300">{user?.email}</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {user?.phone} {user?.company ? `• ${user.company}` : ''}
            </p>
            {profileMsg && (
              <p className="text-xs text-emerald-400 mt-2 font-medium">{profileMsg}</p>
            )}
          </div>
        </div>

        {editingProfile && (
          <form
            onSubmit={handleProfileSave}
            className="mt-6 pt-5 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-3"
          >
            <input
              type="text"
              required
              value={profileForm.name}
              onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Full Name"
              className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white"
            />
            <input
              type="text"
              required
              value={profileForm.phone}
              onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
              placeholder="Phone Number"
              className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white"
            />
            <input
              type="text"
              value={profileForm.company}
              onChange={(e) => setProfileForm((p) => ({ ...p, company: e.target.value }))}
              placeholder="Company Name"
              className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm text-white"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold"
            >
              Save Changes
            </button>
          </form>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <Link
          to="/customer/requests"
          className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-brand-300 transition-all shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Requests
            </span>
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <FolderKanban className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{stats.totalRequests}</p>
          <p className="text-xs text-slate-500 mt-1">Submitted service requests</p>
        </Link>

        <Link
          to="/customer/quotations"
          className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-brand-300 transition-all shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Pending Quotations
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{stats.pendingQuotations}</p>
          <p className="text-xs text-amber-600 font-medium mt-1">Awaiting your review & approval</p>
        </Link>

        <Link
          to="/customer/projects"
          className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-brand-300 transition-all shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Projects
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{stats.activeProjects}</p>
          <p className="text-xs text-slate-500 mt-1">Currently in development</p>
        </Link>

        <Link
          to="/customer/projects"
          className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-brand-300 transition-all shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Completed Projects
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{stats.completedProjects}</p>
          <p className="text-xs text-emerald-600 font-medium mt-1">Delivered & signed off</p>
        </Link>
      </div>

      {/* Financial Summary + Unread Messages Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4" />
              <span>Payment Information Summary</span>
            </span>
            <h3 className="text-lg font-bold text-slate-900">
              Project Cost & Balance Overview
            </h3>
            <p className="text-xs text-slate-500">
              Updated automatically when the administrator records a payment installment.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 sm:gap-6 border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-100">
            <div>
              <span className="text-[11px] uppercase font-semibold text-slate-400 block">
                Total Value
              </span>
              <span className="text-base sm:text-lg font-extrabold text-slate-900">
                {formatCurrency(stats.totalProjectValue)}
              </span>
            </div>
            <div>
              <span className="text-[11px] uppercase font-semibold text-slate-400 block">
                Amount Paid
              </span>
              <span className="text-base sm:text-lg font-extrabold text-emerald-600">
                {formatCurrency(stats.totalPaid)}
              </span>
            </div>
            <div>
              <span className="text-[11px] uppercase font-semibold text-slate-400 block">
                Remaining
              </span>
              <span className="text-base sm:text-lg font-extrabold text-amber-600">
                {formatCurrency(stats.remainingBalance)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Project Messages
              </span>
              <MessageSquare className="w-5 h-5 text-brand-600" />
            </div>
            <p className="text-sm text-slate-600">
              Have questions about a quotation or active milestone? Message your project manager.
            </p>
          </div>
          <Link
            to="/customer/messages"
            className="mt-4 inline-flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
          >
            <span>Open Project Messages</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Active Projects & Quotations Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Active Projects & Quotations */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Projects */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">My Projects & Live Progress</h3>
              <Link
                to="/customer/projects"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                View All Projects →
              </Link>
            </div>

            {!dashboard?.recentProjects?.length ? (
              <p className="text-sm text-slate-500 py-4">
                No active projects yet. Once you accept a quotation, your project will appear here.
              </p>
            ) : (
              <div className="space-y-4">
                {dashboard.recentProjects.map((project) => (
                  <div
                    key={project._id}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">
                          {project.projectTitle}
                        </h4>
                        <p className="text-xs text-slate-500">
                          Expected Delivery: {formatDate(project.expectedDeliveryDate)} • Total:{' '}
                          {formatCurrency(project.totalAmount)}
                        </p>
                      </div>
                      <StatusBadge status={project.status} />
                    </div>
                    <ProgressBar progress={project.progress} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Quotations */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">Recent Quotations</h3>
              <Link
                to="/customer/quotations"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                Manage Quotations →
              </Link>
            </div>

            {!dashboard?.recentQuotations?.length ? (
              <p className="text-sm text-slate-500 py-4">
                No quotations received yet. Submit a service request to get a custom quote.
              </p>
            ) : (
              <div className="divide-y divide-slate-200">
                {dashboard.recentQuotations.map((q) => (
                  <div
                    key={q._id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {q.request?.projectTitle || 'Custom Service Quotation'}
                      </p>
                      <p className="text-xs text-slate-500">
                        Proposed: <strong className="text-slate-800">{formatCurrency(q.amount)}</strong> •
                        Delivery: {q.estimatedDays} days
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={q.status} />
                      {q.status === 'pending' && (
                        <Link
                          to="/customer/quotations"
                          className="px-3 py-1 rounded-lg bg-brand-600 text-white text-xs font-semibold"
                        >
                          Respond
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Recent Activities Feed */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-600" />
                <span>Recent Activities</span>
              </h3>
            </div>

            {!dashboard?.recentActivities?.length ? (
              <p className="text-sm text-slate-500 py-6 text-center">
                Your recent requests, quotations, and project milestones will appear here.
              </p>
            ) : (
              <div className="space-y-4">
                {dashboard.recentActivities.map((act) => (
                  <div
                    key={act.id}
                    className="flex items-start gap-3 pb-3.5 border-b border-slate-100 last:border-b-0 last:pb-0"
                  >
                    <div className="w-2 h-2 rounded-full bg-brand-600 mt-2 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900">{act.title}</p>
                      <p className="text-xs text-slate-600 mt-0.5">{act.subtitle}</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {formatDateTime(act.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CustomerDashboard;
