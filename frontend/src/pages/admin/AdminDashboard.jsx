import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  FolderKanban,
  FileSpreadsheet,
  Briefcase,
  CheckCircle2,
  CreditCard,
  Clock,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import ProgressBar from '../../components/common/ProgressBar';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';

const PIE_COLORS = ['#4f46e5', '#10b981', '#64748b', '#f59e0b'];

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/admin');
      setData(res.data);
    } catch (_err) {
      // handled gracefully
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const stats = data?.stats || {
    totalCustomers: 0,
    totalServices: 0,
    totalRequests: 0,
    pendingRequests: 0,
    totalQuotations: 0,
    pendingQuotations: 0,
    acceptedQuotations: 0,
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalRecordedPayments: 0,
    totalContractedValue: 0,
    totalReceivables: 0,
  };

  return (
    <DashboardLayout
      title="Agency Administration Overview"
      subtitle="Real-time metrics across customers, service requests, quotations, active projects, and revenue"
      actions={
        <button
          type="button"
          onClick={fetchAdminStats}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Analytics</span>
        </button>
      }
    >
      {/* Primary KPI Grid (7 Core Metrics from Section 6) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <Link
          to="/admin/customers"
          className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-brand-300 transition-all shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Customers
            </span>
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{stats.totalCustomers}</p>
          <p className="text-xs text-slate-500 mt-1">Registered client accounts</p>
        </Link>

        <Link
          to="/admin/requests"
          className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-brand-300 transition-all shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Service Requests
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FolderKanban className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{stats.totalRequests}</p>
          <p className="text-xs text-amber-600 font-semibold mt-1">
            {stats.pendingRequests} Pending Review
          </p>
        </Link>

        <Link
          to="/admin/quotations"
          className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-brand-300 transition-all shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Pending Quotations
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{stats.pendingQuotations}</p>
          <p className="text-xs text-emerald-600 font-semibold mt-1">
            {stats.acceptedQuotations} Accepted Quotations
          </p>
        </Link>

        <Link
          to="/admin/projects"
          className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-brand-300 transition-all shadow-sm"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active Projects
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">{stats.activeProjects}</p>
          <p className="text-xs text-emerald-600 font-semibold mt-1">
            {stats.completedProjects} Completed Projects
          </p>
        </Link>
      </div>

      {/* Secondary Row: Revenue & Completed Projects Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        <div className="bg-slate-900 text-white rounded-2xl p-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
              Total Recorded Payments
            </span>
            <p className="text-3xl font-extrabold mt-1">
              {formatCurrency(stats.totalRecordedPayments)}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Across {stats.paymentRecordCount || 0} recorded transactions
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-600/30 border border-brand-500/40 flex items-center justify-center text-brand-300">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Contracted Project Volume
            </span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              {formatCurrency(stats.totalContractedValue)}
            </p>
            <p className="text-xs text-amber-600 font-medium mt-1">
              Receivables Due: {formatCurrency(stats.totalReceivables)}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Completed Deliveries
            </span>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">
              {stats.completedProjects} Projects
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {stats.totalServices} Active Catalogue Services
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Recharts Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-1">
            Service Request Demand by Category
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Distribution of client requests across Dynamic IT services
          </p>
          <div className="h-64 w-full">
            {data?.charts?.serviceDemandChart?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.charts.serviceDemandChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="requests" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Submit service requests to populate chart
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-1">Project Status Breakdown</h3>
          <p className="text-xs text-slate-500 mb-4">Current lifecycle distribution of projects</p>
          <div className="h-64 w-full">
            {stats.totalProjects > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.charts?.projectStatusChart || []}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={75}
                    label
                  >
                    {(data?.charts?.projectStatusChart || []).map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No projects initialized yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Requests & Active Projects Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Service Requests */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">Recent Service Requests</h3>
            <Link
              to="/admin/requests"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
            >
              <span>Manage All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-200">
            {(data?.recentRequests || []).map((req) => (
              <div
                key={req._id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <p className="text-sm font-bold text-slate-900">{req.projectTitle}</p>
                  <p className="text-xs text-slate-500">
                    {req.customer?.name} • {req.service?.title} • Budget:{' '}
                    {formatCurrency(req.budget)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={req.status} />
                  {['pending', 'under_review'].includes(req.status) && (
                    <Link
                      to={`/admin/quotations?requestId=${req._id}`}
                      className="px-2.5 py-1 rounded-lg bg-brand-600 text-white text-xs font-semibold"
                    >
                      Quote
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Projects */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900">Recent Projects & Progress</h3>
            <Link
              to="/admin/projects"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
            >
              <span>Manage Projects</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {(data?.recentProjects || []).map((proj) => (
              <div
                key={proj._id}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{proj.projectTitle}</p>
                    <p className="text-xs text-slate-500">
                      Client: {proj.customer?.name} • Delivery:{' '}
                      {formatDate(proj.expectedDeliveryDate)}
                    </p>
                  </div>
                  <StatusBadge status={proj.status} />
                </div>
                <ProgressBar progress={proj.progress} size="sm" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
