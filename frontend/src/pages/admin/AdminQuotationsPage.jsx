import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
  FileSpreadsheet,
  Plus,
  Sparkles,
  Briefcase,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';

const AdminQuotationsPage = () => {
  const [searchParams] = useSearchParams();
  const preselectedRequestId = searchParams.get('requestId') || '';
  const navigate = useNavigate();

  const [quotations, setQuotations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(Boolean(preselectedRequestId));
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const defaultExpiry = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  const [formData, setFormData] = useState({
    requestId: preselectedRequestId,
    amount: '',
    estimatedDays: '15',
    scope: '',
    terms:
      '50% advance payment upon quotation acceptance, remaining 50% upon final project delivery and sign-off.',
    validUntil: defaultExpiry,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [quoRes, reqRes] = await Promise.all([
        api.get('/quotations'),
        api.get('/requests'),
      ]);
      setQuotations(quoRes.data.quotations || []);
      const allReqs = reqRes.data.requests || [];
      setRequests(allReqs);

      if (preselectedRequestId) {
        setShowForm(true);
        const target = allReqs.find((r) => r._id === preselectedRequestId);
        if (target) {
          setFormData((prev) => ({
            ...prev,
            requestId: target._id,
            amount: String(target.budget || 15000),
            scope: `Five-page responsive business website (${target.projectTitle})`,
          }));
        }
      }
    } catch (_err) {
      // handled gracefully
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [preselectedRequestId]);

  const fillLiveDemoQuotation = () => {
    const candidateReq =
      requests.find((r) => r._id === formData.requestId) ||
      requests.find((r) => ['pending', 'under_review'].includes(r.status)) ||
      requests[0];

    setFormData({
      requestId: candidateReq ? candidateReq._id : '',
      amount: '15000',
      estimatedDays: '15',
      scope: 'Five-page responsive business website',
      terms:
        '50% advance payment upon quotation acceptance, remaining 50% upon final project delivery and sign-off.',
      validUntil: defaultExpiry,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });

    try {
      setSubmitting(true);
      const { data } = await api.post('/quotations', formData);
      setFeedback({
        type: 'success',
        message: data.message || 'Quotation created and sent to customer.',
      });
      setShowForm(false);
      await loadData();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to create quotation.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleInitializeProject = async (quotation) => {
    setFeedback({ type: '', message: '' });
    try {
      const { data } = await api.post('/projects', {
        quotationId: quotation._id,
        projectTitle: quotation.request?.projectTitle || 'Client Digital Project',
        description: quotation.scope,
      });
      setFeedback({
        type: 'success',
        message: data.message || 'Project created from accepted quotation!',
      });
      setTimeout(() => {
        navigate('/admin/projects');
      }, 900);
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Could not create project.',
      });
    }
  };

  return (
    <DashboardLayout
      title="Quotation Management"
      subtitle="Create custom quotations for client requests and convert accepted proposals into active projects"
      actions={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fillLiveDemoQuotation}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 text-xs font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Demo ৳15,000 Quote</span>
          </button>
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{showForm ? 'Close Form' : 'New Quotation'}</span>
          </button>
        </div>
      }
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

      {/* Create Quotation Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-4">
            Create & Send Custom Quotation
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Select Customer Service Request *
              </label>
              <select
                required
                value={formData.requestId}
                onChange={(e) => setFormData((p) => ({ ...p, requestId: e.target.value }))}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl bg-white"
              >
                <option value="" disabled>
                  -- Select a Service Request --
                </option>
                {requests
                  .filter((r) => r.status !== 'project_created')
                  .map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.projectTitle} — {r.customer?.name} (Client Budget:{' '}
                      {formatCurrency(r.budget)} • Status: {r.status})
                    </option>
                  ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Proposed Price (BDT ৳) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData((p) => ({ ...p, amount: e.target.value }))}
                  placeholder="15000"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Estimated Delivery (Days) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.estimatedDays}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, estimatedDays: e.target.value }))
                  }
                  placeholder="15"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Quotation Expiry Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.validUntil}
                  onChange={(e) => setFormData((p) => ({ ...p, validUntil: e.target.value }))}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Project Scope & Deliverables *
              </label>
              <textarea
                rows={3}
                required
                value={formData.scope}
                onChange={(e) => setFormData((p) => ({ ...p, scope: e.target.value }))}
                placeholder="e.g., Five-page responsive business website"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Terms & Conditions
              </label>
              <textarea
                rows={2}
                value={formData.terms}
                onChange={(e) => setFormData((p) => ({ ...p, terms: e.target.value }))}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm"
              >
                {submitting ? 'Sending Quotation...' : 'Send Quotation to Customer'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Quotations List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="bg-white rounded-2xl border border-slate-200 p-6 h-40 animate-pulse"
            />
          ))}
        </div>
      ) : quotations.length === 0 ? (
        <EmptyState
          icon={FileSpreadsheet}
          title="No quotations created yet"
          description="Select a customer service request above to create and send a custom quotation."
        />
      ) : (
        <div className="space-y-4">
          {quotations.map((q) => (
            <div
              key={q._id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
                    Quotation #{q._id.slice(-6).toUpperCase()} • Client: {q.customer?.name} (
                    {q.customer?.email})
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">
                    {q.request?.projectTitle || 'Custom Service Quotation'}
                  </h3>
                </div>
                <StatusBadge status={q.status} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                <div>
                  <span className="text-slate-500 block">Proposed Amount</span>
                  <span className="text-base font-extrabold text-brand-700">
                    {formatCurrency(q.amount)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Estimated Delivery</span>
                  <span className="text-sm font-bold text-slate-900">{q.estimatedDays} Days</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Valid Until</span>
                  <span className="text-sm font-bold text-slate-900">
                    {formatDate(q.validUntil)}
                  </span>
                </div>
              </div>

              <div className="text-sm text-slate-700">
                <strong className="text-xs uppercase tracking-wider text-slate-400 block mb-1">
                  Scope:
                </strong>
                {q.scope}
              </div>

              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <span className="text-slate-400">
                  Created {formatDate(q.createdAt)}
                  {q.respondedAt && ` • Client responded ${formatDate(q.respondedAt)}`}
                </span>

                {q.status === 'accepted' && !q.project && (
                  <button
                    type="button"
                    onClick={() => handleInitializeProject(q)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm"
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>Create Project from Accepted Quotation</span>
                  </button>
                )}

                {q.project && (
                  <Link
                    to="/admin/projects"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 font-semibold"
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Project Active ({q.project.progress}%) →</span>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminQuotationsPage;
