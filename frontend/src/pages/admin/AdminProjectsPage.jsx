import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  CheckCircle2,
  Plus,
  CreditCard,
  MessageSquare,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import ProgressBar from '../../components/common/ProgressBar';
import EmptyState from '../../components/common/EmptyState';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';

const QUICK_PROGRESS_STEPS = [25, 40, 65, 85, 100];

const AdminProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [acceptedQuotations, setAcceptedQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [milestoneInputs, setMilestoneInputs] = useState({});
  const [customProgress, setCustomProgress] = useState({});

  const loadProjects = async () => {
    try {
      setLoading(true);
      const [projRes, quoRes] = await Promise.all([
        api.get('/projects'),
        api.get('/quotations?status=accepted'),
      ]);
      const projList = projRes.data.projects || [];
      setProjects(projList);

      const uncreatedQuotations = (quoRes.data.quotations || []).filter((q) => !q.project);
      setAcceptedQuotations(uncreatedQuotations);

      const progMap = {};
      projList.forEach((p) => {
        progMap[p._id] = p.progress;
      });
      setCustomProgress(progMap);
    } catch (_err) {
      // handled gracefully
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreateFromQuotation = async (q) => {
    setFeedback({ type: '', message: '' });
    try {
      const { data } = await api.post('/projects', {
        quotationId: q._id,
        projectTitle: q.request?.projectTitle || 'Client Project',
        description: q.scope,
      });
      setFeedback({ type: 'success', message: data.message });
      await loadProjects();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to create project.',
      });
    }
  };

  const handleUpdateProgress = async (projectId, progressValue) => {
    setFeedback({ type: '', message: '' });
    try {
      const { data } = await api.patch(`/projects/${projectId}/progress`, {
        progress: Number(progressValue),
      });
      setFeedback({ type: 'success', message: data.message });
      await loadProjects();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Could not update project progress.',
      });
    }
  };

  const handleUpdateStatus = async (projectId, nextStatus) => {
    setFeedback({ type: '', message: '' });
    try {
      const { data } = await api.patch(`/projects/${projectId}/status`, {
        status: nextStatus,
      });
      setFeedback({ type: 'success', message: data.message });
      await loadProjects();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Could not update project status.',
      });
    }
  };

  const handleToggleMilestone = async (projectId, milestone) => {
    const nextStatus =
      milestone.status === 'completed'
        ? 'pending'
        : milestone.status === 'in_progress'
        ? 'completed'
        : 'in_progress';

    try {
      await api.patch(`/projects/${projectId}/milestones/${milestone._id}`, {
        status: nextStatus,
      });
      await loadProjects();
    } catch (_err) {
      // handled gracefully
    }
  };

  const handleAddMilestone = async (projectId) => {
    const title = milestoneInputs[projectId];
    if (!title || !title.trim()) return;

    try {
      await api.post(`/projects/${projectId}/milestones`, {
        title: title.trim(),
        status: 'pending',
      });
      setMilestoneInputs((prev) => ({ ...prev, [projectId]: '' }));
      await loadProjects();
    } catch (_err) {
      // handled gracefully
    }
  };

  return (
    <DashboardLayout
      title="Project & Progress Management"
      subtitle="Create projects from accepted quotations, update progress percentages (40% → 65% → 100%), and manage milestones"
    >
      {feedback.message && (
        <div
          className={`mb-6 p-4 rounded-xl border text-sm flex items-center gap-2.5 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Accepted Quotations Ready for Project Initialization */}
      {acceptedQuotations.length > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 mb-8">
          <h3 className="text-sm font-bold text-emerald-950 mb-2">
            Accepted Quotations Ready for Project Initialization ({acceptedQuotations.length})
          </h3>
          <div className="space-y-2.5">
            {acceptedQuotations.map((q) => (
              <div
                key={q._id}
                className="bg-white rounded-xl p-4 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {q.request?.projectTitle || 'Accepted Quotation'}
                  </p>
                  <p className="text-xs text-slate-600">
                    Client: {q.customer?.name} • Agreed Budget: {formatCurrency(q.amount)} •{' '}
                    {q.estimatedDays} Days
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCreateFromQuotation(q)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Project Workspace</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects List */}
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
          title="No projects initialized yet"
          description="Once a customer accepts a quotation, click 'Create Project' to launch the project workspace."
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
                {/* Header */}
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
                      Client: {project.customer?.name} ({project.customer?.email})
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
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                    <div className="lg:col-span-5 space-y-2">
                      <ProgressBar progress={project.progress} size="lg" />
                      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                        <span className="inline-flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-brand-600" />
                          Expected: {formatDate(project.expectedDeliveryDate)}
                        </span>
                        <span>
                          Paid: <strong className="text-emerald-600">{formatCurrency(pay.paidAmount)}</strong> /{' '}
                          {formatCurrency(project.totalAmount)}
                        </span>
                      </div>
                    </div>

                    {/* Progress & Status Controls */}
                    <div className="lg:col-span-7 bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                          Quick Progress Update:
                        </span>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {QUICK_PROGRESS_STEPS.map((pct) => (
                            <button
                              key={pct}
                              type="button"
                              onClick={() => handleUpdateProgress(project._id, pct)}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                                project.progress === pct
                                  ? 'bg-brand-600 text-white'
                                  : 'bg-white border border-slate-300 text-slate-700 hover:bg-brand-50 hover:border-brand-300'
                              }`}
                            >
                              {pct}%
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/80">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={customProgress[project._id] ?? project.progress}
                            onChange={(e) =>
                              setCustomProgress((p) => ({
                                ...p,
                                [project._id]: e.target.value,
                              }))
                            }
                            className="w-20 px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateProgress(
                                project._id,
                                customProgress[project._id] ?? project.progress
                              )
                            }
                            className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold"
                          >
                            Set Custom %
                          </button>
                        </div>

                        <div className="flex items-center gap-2 justify-end">
                          <label className="text-xs font-semibold text-slate-600">Status:</label>
                          <select
                            value={project.status}
                            onChange={(e) => handleUpdateStatus(project._id, e.target.value)}
                            className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white font-semibold"
                          >
                            <option value="not_started">Not Started</option>
                            <option value="in_progress">In Progress</option>
                            <option value="on_hold">On Hold</option>
                            <option value="completed">Completed (100%)</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Milestones Manager */}
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Project Milestones (Click any milestone to cycle status)
                      </h4>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={milestoneInputs[project._id] || ''}
                          onChange={(e) =>
                            setMilestoneInputs((p) => ({
                              ...p,
                              [project._id]: e.target.value,
                            }))
                          }
                          placeholder="Add new milestone..."
                          className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddMilestone(project._id)}
                          className="px-3 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-semibold"
                        >
                          + Add
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {(project.milestones || []).map((ms) => (
                        <button
                          key={ms._id}
                          type="button"
                          onClick={() => handleToggleMilestone(project._id, ms)}
                          className={`text-left p-3.5 rounded-xl border transition-all ${
                            ms.status === 'completed'
                              ? 'bg-emerald-50/60 border-emerald-200'
                              : ms.status === 'in_progress'
                              ? 'bg-brand-50/60 border-brand-200'
                              : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="text-xs font-bold text-slate-900">{ms.title}</span>
                            <StatusBadge status={ms.status} />
                          </div>
                          {ms.description && (
                            <p className="text-xs text-slate-600 line-clamp-2">{ms.description}</p>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Bar */}
                  <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs text-slate-500">
                      Remaining Client Balance:{' '}
                      <strong className="text-amber-600">
                        {formatCurrency(pay.remainingAmount)}
                      </strong>
                    </span>

                    <div className="flex flex-wrap items-center gap-2.5">
                      <Link
                        to={`/admin/payments?projectId=${project._id}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Record Payment</span>
                      </Link>
                      <Link
                        to={`/admin/messages?projectId=${project._id}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Message Client</span>
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

export default AdminProjectsPage;
