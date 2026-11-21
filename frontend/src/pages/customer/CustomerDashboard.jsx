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
  ArrowUpRight,
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
    emailAlerts: user?.notificationPreferences?.email !== false,
    smsAlerts: Boolean(user?.notificationPreferences?.sms),
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
      await updateProfile({
        name: profileForm.name,
        phone: profileForm.phone,
        company: profileForm.company,
        notificationPreferences: {
          email: profileForm.emailAlerts,
          sms: profileForm.smsAlerts,
        },
      });
      setProfileMsg('Profile and notification preferences updated.');
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
      title="Client Workspace"
      subtitle="Live overview of your service requests, custom quotations, project milestones, and payment ledger"
      actions={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchDashboard}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-mono text-xs font-semibold text-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
          <Link
            to="/customer/requests/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#090D16] hover:bg-brand-600 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <FilePlus2 className="w-4 h-4" />
            <span>New Request</span>
          </Link>
        </div>
      }
    >
      {/* Architectural Welcome & Client Identity Banner */}
      <div className="bg-[#090D16] bg-architectural-grid-dark text-white rounded-2xl p-6 sm:p-8 mb-8 border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <span className="font-mono text-[11px] uppercase tracking-widest text-brand-400 block mb-2">
              // CLIENT WORKSPACE • {user?.company || 'VERIFIED ACCOUNT'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight">
              Welcome back, {user?.name}
            </h2>
            <p className="text-sm text-slate-400 mt-1.5 max-w-2xl">
              Review custom quotations from Dynamic IT, monitor real-time project progress, and
              communicate directly with your engineering team.
            </p>
          </div>

          <div className="bg-white/[0.04] border border-white/10 rounded-xl p-4 min-w-[270px]">
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">
                ACCOUNT RECORD
              </span>
              <button
                type="button"
                onClick={() => {
                  setProfileForm({
                    name: user?.name || '',
                    phone: user?.phone || '',
                    company: user?.company || '',
                    emailAlerts: user?.notificationPreferences?.email !== false,
                    smsAlerts: Boolean(user?.notificationPreferences?.sms),
                  });
                  setEditingProfile(!editingProfile);
                }}
                className="font-mono text-[11px] font-semibold text-brand-400 hover:text-brand-300"
              >
                {editingProfile ? 'CANCEL' : 'EDIT & ALERTS'}
              </button>
            </div>
            <p className="text-sm font-bold text-white">{user?.name}</p>
            <p className="font-mono text-xs text-slate-300 mt-0.5">{user?.email}</p>
            <p className="font-mono text-xs text-slate-400 mt-0.5">
              {user?.phone} {user?.company ? `• ${user.company}` : ''}
            </p>
            <div className="mt-2 pt-2 border-t border-white/10 flex items-center gap-3 text-[11px] text-slate-300">
              <span>
                Email Alerts:{' '}
                <strong className="text-emerald-400">
                  {user?.notificationPreferences?.email !== false ? 'On' : 'Off'}
                </strong>
              </span>
              <span>•</span>
              <span>
                SMS Consent:{' '}
                <strong
                  className={
                    user?.notificationPreferences?.sms ? 'text-emerald-400' : 'text-slate-400'
                  }
                >
                  {user?.notificationPreferences?.sms ? 'Opted In' : 'Off'}
                </strong>
              </span>
            </div>
            {profileMsg && (
              <p className="text-xs text-emerald-400 mt-2 font-medium">{profileMsg}</p>
            )}
          </div>
        </div>

        {editingProfile && (
          <form
            onSubmit={handleProfileSave}
            className="mt-6 pt-5 border-t border-white/10 space-y-4"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                required
                value={profileForm.name}
                onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Full Name"
                className="px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-sm text-white"
              />
              <input
                type="text"
                required
                value={profileForm.phone}
                onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                placeholder="Phone Number"
                className="px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-sm text-white"
              />
              <input
                type="text"
                value={profileForm.company}
                onChange={(e) => setProfileForm((p) => ({ ...p, company: e.target.value }))}
                placeholder="Company Name"
                className="px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-sm text-white"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
              <div className="flex flex-wrap items-center gap-5 text-xs text-slate-200">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profileForm.emailAlerts}
                    onChange={(e) =>
                      setProfileForm((p) => ({ ...p, emailAlerts: e.target.checked }))
                    }
                    className="rounded border-slate-600 text-brand-600"
                  />
                  <span>Receive Automated Email Notifications</span>
                </label>

                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profileForm.smsAlerts}
                    onChange={(e) =>
                      setProfileForm((p) => ({ ...p, smsAlerts: e.target.checked }))
                    }
                    className="rounded border-slate-600 text-brand-600"
                  />
                  <span>
                    I consent to receive SMS notifications for quotation, project & payment updates
                  </span>
                </label>
              </div>

              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold"
              >
                Save Profile & Preferences
              </button>
            </div>
          </form>
        )}
      </div>

      {/* KPI Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <Link
          to="/customer/requests"
          className="studio-card bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">
              01 // REQUESTS
            </span>
            <div className="w-9 h-9 rounded-xl bg-slate-950 text-white flex items-center justify-center">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold font-mono text-slate-950">{stats.totalRequests}</p>
          <p className="text-xs text-slate-500 mt-1">Submitted service briefs</p>
        </Link>

        <Link
          to="/customer/quotations"
          className="studio-card bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">
              02 // QUOTATIONS
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold font-mono text-slate-950">
            {stats.pendingQuotations}
          </p>
          <p className="text-xs text-amber-600 font-medium mt-1">Awaiting your approval</p>
        </Link>

        <Link
          to="/customer/projects"
          className="studio-card bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">
              03 // ACTIVE BUILDS
            </span>
            <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold font-mono text-slate-950">{stats.activeProjects}</p>
          <p className="text-xs text-slate-500 mt-1">In active execution</p>
        </Link>

        <Link
          to="/customer/projects"
          className="studio-card bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">
              04 // DELIVERED
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold font-mono text-slate-950">
            {stats.completedProjects}
          </p>
          <p className="text-xs text-emerald-600 font-medium mt-1">Completed & handed over</p>
        </Link>
      </div>

      {/* Financial Summary + Project Messages */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-brand-600 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" />
              <span>FINANCIAL LEDGER</span>
            </span>
            <h3 className="text-lg font-bold font-display text-slate-950">
              Project Cost & Balance Overview
            </h3>
            <p className="text-xs text-slate-500">
              Synchronized automatically when payment installments are recorded.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 sm:gap-6 border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-100 font-mono">
            <div>
              <span className="text-[10px] uppercase text-slate-400 block">CONTRACTED</span>
              <span className="text-base sm:text-lg font-extrabold text-slate-950">
                {formatCurrency(stats.totalProjectValue)}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-slate-400 block">PAID</span>
              <span className="text-base sm:text-lg font-extrabold text-emerald-600">
                {formatCurrency(stats.totalPaid)}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-slate-400 block">REMAINING</span>
              <span className="text-base sm:text-lg font-extrabold text-amber-600">
                {formatCurrency(stats.remainingBalance)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-400">
                DIRECT CHANNEL
              </span>
              <MessageSquare className="w-4 h-4 text-brand-600" />
            </div>
            <p className="text-sm text-slate-600">
              Have questions about a quotation or active milestone? Message your project lead.
            </p>
          </div>
          <Link
            to="/customer/messages"
            className="group mt-4 inline-flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#090D16] hover:bg-brand-600 text-white text-xs font-semibold transition-colors"
          >
            <span>Open Project Messages</span>
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>

      {/* Active Projects & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold font-display text-slate-950">
                Active Projects & Live Telemetry
              </h3>
              <Link
                to="/customer/projects"
                className="font-mono text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                All Projects →
              </Link>
            </div>

            {!dashboard?.recentProjects?.length ? (
              <p className="text-sm text-slate-500 py-4">
                No active projects yet. Once you accept a quotation, your project workspace will
                appear here.
              </p>
            ) : (
              <div className="space-y-4">
                {dashboard.recentProjects.map((project) => (
                  <div
                    key={project._id}
                    className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-200/90 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold font-display text-slate-950">
                          {project.projectTitle}
                        </h4>
                        <p className="font-mono text-[11px] text-slate-500">
                          EST. DELIVERY: {formatDate(project.expectedDeliveryDate)} • VALUE:{' '}
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

          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold font-display text-slate-950">Recent Quotations</h3>
              <Link
                to="/customer/quotations"
                className="font-mono text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                Manage Quotations →
              </Link>
            </div>

            {!dashboard?.recentQuotations?.length ? (
              <p className="text-sm text-slate-500 py-4">
                No quotations received yet. Submit a service request to receive a custom proposal.
              </p>
            ) : (
              <div className="divide-y divide-slate-200">
                {dashboard.recentQuotations.map((q) => (
                  <div
                    key={q._id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <p className="text-sm font-bold font-display text-slate-950">
                        {q.request?.projectTitle || 'Custom Service Quotation'}
                      </p>
                      <p className="font-mono text-xs text-slate-500">
                        PROPOSED: <strong className="text-slate-900">{formatCurrency(q.amount)}</strong>{' '}
                        • {q.estimatedDays} DAYS
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={q.status} />
                      {q.status === 'pending' && (
                        <Link
                          to="/customer/quotations"
                          className="px-3 py-1 rounded-lg bg-[#090D16] text-white text-xs font-semibold"
                        >
                          Review
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
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold font-display text-slate-950 flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-600" />
                <span>Event Log</span>
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
                    <div className="w-2 h-2 rounded-full bg-brand-600 mt-1.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-950">{act.title}</p>
                      <p className="text-xs text-slate-600 mt-0.5">{act.subtitle}</p>
                      <p className="font-mono text-[10px] text-slate-400 mt-1">
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
