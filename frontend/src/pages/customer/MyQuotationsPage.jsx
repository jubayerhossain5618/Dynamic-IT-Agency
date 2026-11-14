import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  AlertCircle,
  Briefcase,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';

const MyQuotationsPage = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const fetchQuotations = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/quotations/my');
      setQuotations(data.quotations || []);
    } catch (_err) {
      setQuotations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const handleRespond = async (quotationId, decision) => {
    setFeedback({ type: '', message: '' });
    try {
      setProcessingId(quotationId);
      const { data } = await api.patch(`/quotations/${quotationId}/respond`, {
        status: decision,
      });
      setFeedback({
        type: 'success',
        message: data.message || `Quotation ${decision} successfully.`,
      });
      await fetchQuotations();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Could not process quotation response.',
      });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <DashboardLayout
      title="My Quotations"
      subtitle="Review custom project proposals, delivery timelines, and terms sent by Dynamic IT"
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

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div
              key={n}
              className="bg-white rounded-2xl border border-slate-200 p-6 h-48 animate-pulse"
            />
          ))}
        </div>
      ) : quotations.length === 0 ? (
        <EmptyState
          icon={FileSpreadsheet}
          title="No quotations received yet"
          description="Once an administrator reviews your service request and prepares a quotation, you can review and accept it here."
          action={
            <Link
              to="/customer/requests/new"
              className="px-4 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-semibold"
            >
              Submit a Service Request
            </Link>
          }
        />
      ) : (
        <div className="space-y-6">
          {quotations.map((q) => (
            <div
              key={q._id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm"
            >
              {/* Header Bar */}
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
                    Quotation #{q._id.slice(-6).toUpperCase()} •{' '}
                    {q.request?.service?.title || 'Digital Service'}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">
                    {q.request?.projectTitle || 'Custom Project Proposal'}
                  </h3>
                </div>
                <StatusBadge status={q.status} />
              </div>

              {/* Body */}
              <div className="p-6 space-y-5">
                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-brand-50/60 border border-brand-100">
                    <span className="text-xs font-semibold text-slate-500 block">
                      Proposed Quotation Amount
                    </span>
                    <span className="text-2xl font-extrabold text-brand-700 mt-0.5 block">
                      {formatCurrency(q.amount, q.currency)}
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-brand-600" />
                      Estimated Delivery Time
                    </span>
                    <span className="text-xl font-bold text-slate-900 mt-0.5 block">
                      {q.estimatedDays} Days
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-brand-600" />
                      Valid Until
                    </span>
                    <span className="text-base font-bold text-slate-900 mt-1 block">
                      {formatDate(q.validUntil)}
                    </span>
                  </div>
                </div>

                {/* Scope & Terms */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Project Scope & Deliverables
                    </h4>
                    <p className="text-sm text-slate-800 whitespace-pre-line leading-relaxed">
                      {q.scope}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                      Terms & Conditions
                    </h4>
                    <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                      {q.terms}
                    </p>
                  </div>
                </div>

                {/* Action Footer */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="text-xs text-slate-500">
                    Issued on {formatDate(q.createdAt)}
                    {q.respondedAt && ` • Responded on ${formatDate(q.respondedAt)}`}
                  </div>

                  {q.status === 'pending' && (
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        disabled={processingId === q._id}
                        onClick={() => handleRespond(q._id, 'rejected')}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject Quotation</span>
                      </button>

                      <button
                        type="button"
                        disabled={processingId === q._id}
                        onClick={() => handleRespond(q._id, 'accepted')}
                        className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>
                          {processingId === q._id ? 'Processing...' : 'Accept Quotation'}
                        </span>
                      </button>
                    </div>
                  )}

                  {q.status === 'accepted' && (
                    <div className="flex items-center gap-3">
                      {q.project ? (
                        <Link
                          to="/customer/projects"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold"
                        >
                          <Briefcase className="w-4 h-4" />
                          <span>Track Active Project ({q.project.progress}%)</span>
                        </Link>
                      ) : (
                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                          Accepted — Waiting for Admin to initialize project workspace
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default MyQuotationsPage;
