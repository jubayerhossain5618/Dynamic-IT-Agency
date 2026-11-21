import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CreditCard, Plus, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';

const AdminPaymentsPage = () => {
  const [searchParams] = useSearchParams();
  const preselectedProjectId = searchParams.get('projectId') || '';

  const [payments, setPayments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [totalCollected, setTotalCollected] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(Boolean(preselectedProjectId));
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    projectId: preselectedProjectId,
    paidAmount: '',
    paymentMethod: 'bKash',
    paymentDate: todayStr,
    transactionReference: '',
    notes: '',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [payRes, projRes] = await Promise.all([
        api.get('/payments'),
        api.get('/projects'),
      ]);
      setPayments(payRes.data.payments || []);
      setTotalCollected(payRes.data.totalCollected || 0);
      const projList = projRes.data.projects || [];
      setProjects(projList);

      if (preselectedProjectId) {
        setShowForm(true);
        setFormData((prev) => ({ ...prev, projectId: preselectedProjectId }));
      } else if (!formData.projectId && projList.length > 0) {
        setFormData((prev) => ({ ...prev, projectId: projList[0]._id }));
      }
    } catch (_err) {
      // handled gracefully
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [preselectedProjectId]);

  const selectedProject = projects.find((p) => p._id === formData.projectId);
  const currentRemaining = selectedProject
    ? selectedProject.paymentSummary?.remainingAmount ?? selectedProject.totalAmount
    : 0;

  const fillPartialPaymentDemo = () => {
    const target = selectedProject || projects[0];
    if (!target) return;
    const halfAmount = Math.round(Number(target.totalAmount || 15000) / 2);
    setFormData({
      projectId: target._id,
      paidAmount: String(halfAmount),
      paymentMethod: 'bKash',
      paymentDate: todayStr,
      transactionReference: `TRX-BKASH-${Math.floor(100000 + Math.random() * 900000)}`,
      notes: '50% partial advance installment received.',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });

    try {
      setSubmitting(true);
      const { data } = await api.post('/payments', formData);
      setFeedback({
        type: 'success',
        message: data.message || 'Payment recorded successfully.',
      });
      setShowForm(false);
      await loadData();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to record payment.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      title="Payment Ledger & Manual Recording"
      subtitle="Record client installments, track remaining project balances, and manage payment statuses"
      actions={
        <div className="flex items-center gap-2">
          {import.meta.env.VITE_DEMO_MODE === 'true' && (
            <button
              type="button"
              onClick={fillPartialPaymentDemo}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 text-xs font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Demo 50% Partial Payment</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{showForm ? 'Close Form' : 'Record Payment'}</span>
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

      {/* Record Payment Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-4">
            Record Manual Client Payment
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Select Project *
              </label>
              <select
                required
                value={formData.projectId}
                onChange={(e) => setFormData((p) => ({ ...p, projectId: e.target.value }))}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl bg-white"
              >
                <option value="" disabled>
                  -- Choose a Project --
                </option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.projectTitle} — {p.customer?.name} (Total: {formatCurrency(p.totalAmount)} •
                    Remaining: {formatCurrency(p.paymentSummary?.remainingAmount ?? p.totalAmount)})
                  </option>
                ))}
              </select>
            </div>

            {selectedProject && (
              <div className="grid grid-cols-3 gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 block">Total Project Cost</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {formatCurrency(selectedProject.totalAmount)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Already Paid</span>
                  <span className="font-bold text-emerald-600 text-sm">
                    {formatCurrency(selectedProject.paymentSummary?.paidAmount || 0)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Current Balance Due</span>
                  <span className="font-bold text-amber-600 text-sm">
                    {formatCurrency(currentRemaining)}
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Amount Paid (BDT ৳) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.paidAmount}
                  onChange={(e) => setFormData((p) => ({ ...p, paidAmount: e.target.value }))}
                  placeholder="7500"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Payment Method *
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData((p) => ({ ...p, paymentMethod: e.target.value }))}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl bg-white"
                >
                  <option value="bKash">bKash</option>
                  <option value="Nagad">Nagad</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="Card / Other">Card / Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Payment Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.paymentDate}
                  onChange={(e) => setFormData((p) => ({ ...p, paymentDate: e.target.value }))}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Transaction Reference / Receipt ID
                </label>
                <input
                  type="text"
                  value={formData.transactionReference}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, transactionReference: e.target.value }))
                  }
                  placeholder="e.g., TRX-BKASH-750012"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Payment Notes
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
                  placeholder="e.g., 50% advance payment upon quotation acceptance"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm"
              >
                {submitting ? 'Saving Payment...' : 'Save Payment Record'}
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

      {/* Total Collected Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-400">
            Total Recorded Agency Revenue
          </span>
          <h3 className="text-2xl sm:text-3xl font-extrabold mt-0.5">
            {formatCurrency(totalCollected)}
          </h3>
        </div>
        <span className="text-xs text-slate-300">
          {payments.length} Total Payment Installment Records
        </span>
      </div>

      {/* Payments Table */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 h-64 animate-pulse" />
      ) : payments.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No payments recorded yet"
          description="Click 'Record Payment' above to log an advance or milestone payment for any active project."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
                  <th className="py-3.5 px-6">Project & Client</th>
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6">Method & Ref</th>
                  <th className="py-3.5 px-6">Total Cost</th>
                  <th className="py-3.5 px-6">Paid Amount</th>
                  <th className="py-3.5 px-6">Remaining</th>
                  <th className="py-3.5 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {payments.map((pay) => (
                  <tr key={pay._id} className="hover:bg-slate-50">
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-900">
                        {pay.project?.projectTitle || 'Digital Project'}
                      </p>
                      <p className="text-xs text-slate-500">{pay.customer?.name}</p>
                      {pay.notes && <p className="text-xs text-slate-400 mt-0.5">{pay.notes}</p>}
                    </td>
                    <td className="py-4 px-6 text-slate-600">{formatDate(pay.paymentDate)}</td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-slate-800 block">
                        {pay.paymentMethod}
                      </span>
                      {pay.transactionReference && (
                        <span className="text-xs text-slate-400">{pay.transactionReference}</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-slate-700">
                      {formatCurrency(pay.totalAmount)}
                    </td>
                    <td className="py-4 px-6 font-bold text-emerald-600">
                      {formatCurrency(pay.paidAmount)}
                    </td>
                    <td className="py-4 px-6 font-bold text-amber-600">
                      {formatCurrency(pay.remainingAmount)}
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={pay.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminPaymentsPage;
