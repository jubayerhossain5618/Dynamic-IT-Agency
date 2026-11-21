import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  MessageSquare,
  CreditCard,
  RefreshCw,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import ProgressBar from '../../components/common/ProgressBar';
import EmptyState from '../../components/common/EmptyState';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';

const MyProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/projects/my');
      setProjects(data.projects || []);
    } catch (_err) {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <DashboardLayout
      title="My Projects & Progress Tracking"
      subtitle="Monitor live completion percentages, milestones, expected delivery dates, and payment status"
      actions={
        <button
          type="button"
          onClick={fetchProjects}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Progress</span>
        </button>
      }
    >
      {loading ? (
        <div className="space-y-6">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="bg-white rounded-2xl border border-slate-200 p-6 h-64 animate-pulse"
            />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No active or completed projects yet"
          description="Once you accept a quotation and the administrator initializes your project, you can track its real-time progress and milestones here."
          action={
            <Link
              to="/customer/quotations"
              className="px-4 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-semibold"
            >
              Check My Quotations
            </Link>
          }
        />
      ) : (
        <div className="space-y-6">
          {projects.map((project) => {
            const pay = project.paymentSummary || {
              totalAmount: project.totalAmount,
              paidAmount: 0,
              remainingAmount: project.totalAmount,
              paymentStatus: 'unpaid',
            };

            return (
              <div
                key={project._id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm"
              >
                {/* Top Header */}
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
                      {project.request?.service?.title || 'Digital Agency Project'}
                    </span>
                    <h3 className="text-xl font-bold text-slate-900">{project.projectTitle}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusBadge status={project.status} />
                    <StatusBadge status={pay.paymentStatus} />
                  </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                  <p className="text-sm text-slate-600 leading-relaxed">{project.description}</p>

                  {/* Progress Bar */}
                  <div className="p-5 rounded-2xl bg-slate-900 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-brand-300">
                        Live Project Completion
                      </span>
                      <span className="text-2xl font-extrabold text-white">
                        {project.progress}%
                      </span>
                    </div>
                    <ProgressBar progress={project.progress} showLabel={false} size="lg" />
                  </div>

                  {/* Metadata & Payment Summary Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                      <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-brand-600" />
                        Start Date
                      </span>
                      <span className="text-sm font-bold text-slate-900 mt-1 block">
                        {formatDate(project.startDate)}
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                      <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-brand-600" />
                        Expected Delivery
                      </span>
                      <span className="text-sm font-bold text-slate-900 mt-1 block">
                        {formatDate(project.expectedDeliveryDate)}
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80">
                      <span className="text-xs font-semibold text-emerald-700 block">
                        Amount Paid / Total
                      </span>
                      <span className="text-sm font-extrabold text-emerald-800 mt-1 block">
                        {formatCurrency(pay.paidAmount)} / {formatCurrency(pay.totalAmount)}
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/80">
                      <span className="text-xs font-semibold text-amber-800 block">
                        Remaining Balance
                      </span>
                      <span className="text-sm font-extrabold text-amber-900 mt-1 block">
                        {formatCurrency(pay.remainingAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Milestones Checklist */}
                  {project.milestones && project.milestones.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                        Project Milestones & Deliverables
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {project.milestones.map((ms, idx) => (
                          <div
                            key={ms._id || idx}
                            className={`p-4 rounded-xl border ${
                              ms.status === 'completed'
                                ? 'bg-emerald-50/40 border-emerald-200'
                                : ms.status === 'in_progress'
                                ? 'bg-brand-50/40 border-brand-200'
                                : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                              <div className="flex items-center gap-1.5">
                                {ms.status === 'completed' ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                ) : ms.status === 'in_progress' ? (
                                  <Clock className="w-4 h-4 text-brand-600 shrink-0" />
                                ) : (
                                  <Circle className="w-4 h-4 text-slate-400 shrink-0" />
                                )}
                                <span className="text-xs font-bold text-slate-900">
                                  {ms.title}
                                </span>
                              </div>
                            </div>
                            {ms.description && (
                              <p className="text-xs text-slate-600 leading-relaxed mb-2">
                                {ms.description}
                              </p>
                            )}
                            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200/60">
                              <span className="capitalize font-medium">
                                {ms.status.replace('_', ' ')}
                              </span>
                              {ms.dueDate && <span>Due: {formatDate(ms.dueDate)}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Project Audit History */}
                  {project.history && project.history.length > 0 && (
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                        Project Activity & Audit History
                      </h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {project.history
                          .slice()
                          .reverse()
                          .map((entry, idx) => (
                            <div
                              key={idx}
                              className="flex flex-wrap items-center justify-between gap-2 text-xs py-1.5 border-b border-slate-200/60 last:border-b-0"
                            >
                              <div>
                                <span className="font-semibold text-slate-900">
                                  {entry.action}:
                                </span>{' '}
                                <span className="text-slate-600">{entry.note}</span>
                              </div>
                              <span className="text-[11px] text-slate-400">
                                {formatDate(entry.timestamp)}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Footer Actions */}
                  <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs text-slate-400">
                      Last updated: {formatDate(project.updatedAt)}
                    </span>

                    <div className="flex flex-wrap items-center gap-2.5">
                      <Link
                        to="/customer/payments"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700"
                      >
                        <CreditCard className="w-3.5 h-3.5 text-brand-600" />
                        <span>Payment Ledger</span>
                      </Link>
                      <Link
                        to={`/customer/messages?projectId=${project._id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Project Messages</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default MyProjectsPage;
