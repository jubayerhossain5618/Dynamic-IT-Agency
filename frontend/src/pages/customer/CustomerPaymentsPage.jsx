import React, { useEffect, useState } from 'react';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  Wallet,
  ShieldCheck,
  AlertCircle,
  X,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';

const CustomerPaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [summary, setSummary] = useState({
    totalProjectValue: 0,
    totalPaid: 0,
    totalRemaining: 0,
  });
  const [loading, setLoading] = useState(true);

  // bKash & Nagad Gateway Checkout State
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedGateway, setSelectedGateway] = useState('bkash');
  const [payAmount, setPayAmount] = useState('');
  const [initiating, setInitiating] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [activeGatewaySession, setActiveGatewaySession] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const fetchPaymentData = async () => {
    try {
      setLoading(true);
      const [payRes, projRes] = await Promise.all([
        api.get('/payments/my'),
        api.get('/projects/my'),
      ]);
      setPayments(payRes.data.payments || []);
      if (payRes.data.summary) {
        setSummary(payRes.data.summary);
      }
      const projList = projRes.data.projects || [];
      setProjects(projList);

      const payableProj =
        projList.find((p) => (p.paymentSummary?.remainingAmount ?? p.totalAmount) > 0) ||
        projList[0];
      if (payableProj && !selectedProjectId) {
        setSelectedProjectId(payableProj._id);
        setPayAmount(
          String(payableProj.paymentSummary?.remainingAmount ?? payableProj.totalAmount ?? '')
        );
      }
    } catch (_err) {
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentData();
  }, []);

  const handleProjectSelect = (projectId) => {
    setSelectedProjectId(projectId);
    const proj = projects.find((p) => p._id === projectId);
    if (proj) {
      const rem = proj.paymentSummary?.remainingAmount ?? proj.totalAmount ?? 0;
      setPayAmount(rem > 0 ? String(rem) : '');
    }
  };

  const handleInitiateGateway = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });

    try {
      setInitiating(true);
      const { data } = await api.post('/payments/gateway/initiate', {
        projectId: selectedProjectId,
        gateway: selectedGateway,
        amount: Number(payAmount),
      });
      setActiveGatewaySession(data);
    } catch (err) {
      setFeedback({
        type: 'error',
        message:
          err.response?.data?.message || 'Could not initiate payment gateway session.',
      });
    } finally {
      setInitiating(false);
    }
  };

  const handleVerifyGateway = async (outcome = 'success') => {
    if (!activeGatewaySession) return;
    setFeedback({ type: '', message: '' });

    try {
      setVerifying(true);
      const { data } = await api.post('/payments/gateway/verify', {
        paymentRecordId: activeGatewaySession.paymentRecordId,
        gatewayPaymentId: activeGatewaySession.gatewayPaymentId,
        verificationToken: activeGatewaySession.verificationToken,
        outcome,
      });

      setFeedback({
        type: 'success',
        message:
          data.message ||
          `${activeGatewaySession.gateway.toUpperCase()} payment verified on server!`,
      });
      setActiveGatewaySession(null);
      await fetchPaymentData();
    } catch (err) {
      setFeedback({
        type: 'error',
        message:
          err.response?.data?.message || 'Payment verification failed or was cancelled.',
      });
      setActiveGatewaySession(null);
      await fetchPaymentData();
    } finally {
      setVerifying(false);
    }
  };

  const payableProjects = projects.filter(
    (p) => (p.paymentSummary?.remainingAmount ?? p.totalAmount) > 0
  );

  return (
    <DashboardLayout
      title="Payments & bKash / Nagad Checkout"
      subtitle="View your project costs, pay installments via bKash or Nagad, and inspect verified transactions"
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Project Cost
            </span>
            <Wallet className="w-5 h-5 text-[#2563EB]" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">
            {formatCurrency(summary.totalProjectValue)}
          </p>
          <p className="text-xs text-slate-500 mt-1">Across all active & completed projects</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Amount Paid
            </span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-600">
            {formatCurrency(summary.totalPaid)}
          </p>
          <p className="text-xs text-slate-500 mt-1">Server-verified payments & installments</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Remaining Balance
            </span>
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-amber-600">
            {formatCurrency(summary.totalRemaining)}
          </p>
          <p className="text-xs text-slate-500 mt-1">Balance due upon milestone completion</p>
        </div>
      </div>

      {/* bKash & Nagad Digital Payment Checkout Section */}
      {payableProjects.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-5 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Server-Verified Mobile Financial Checkout</span>
              </span>
              <h3 className="text-lg font-bold font-display text-[#101828] mt-0.5">
                Pay Project Installment via bKash or Nagad
              </h3>
            </div>
            <span className="text-xs text-slate-500">
              Backend-Initiated & Cryptographically Verified
            </span>
          </div>

          <form
            onSubmit={handleInitiateGateway}
            className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
          >
            <div className="md:col-span-5">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Select Project
              </label>
              <select
                required
                value={selectedProjectId}
                onChange={(e) => handleProjectSelect(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl bg-white"
              >
                {payableProjects.map((p) => {
                  const rem = p.paymentSummary?.remainingAmount ?? p.totalAmount;
                  return (
                    <option key={p._id} value={p._id}>
                      {p.projectTitle} (Balance Due: {formatCurrency(rem)})
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Choose Payment Gateway
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedGateway('bkash')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                    selectedGateway === 'bkash'
                      ? 'bg-[#E2136E] text-white border-[#E2136E] shadow-sm'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  bKash
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedGateway('nagad')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                    selectedGateway === 'nagad'
                      ? 'bg-[#F7941D] text-white border-[#F7941D] shadow-sm'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  Nagad
                </button>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Amount (BDT ৳)
              </label>
              <input
                type="number"
                min="1"
                required
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl"
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={initiating || !payAmount}
                className="w-full py-2.5 px-4 rounded-xl bg-[#101828] hover:bg-[#2563EB] disabled:opacity-50 text-white text-xs font-semibold transition-colors shadow-sm"
              >
                {initiating ? 'Initiating...' : `Pay with ${selectedGateway === 'bkash' ? 'bKash' : 'Nagad'}`}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Payment History Table */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 h-64 animate-pulse" />
      ) : payments.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No payment records yet"
          description="Pay an installment via bKash or Nagad above or wait for the administrator to record a manual payment."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Recorded Payment Transactions</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
                  <th className="py-3.5 px-6">Project</th>
                  <th className="py-3.5 px-6">Payment Date</th>
                  <th className="py-3.5 px-6">Gateway & TrxID</th>
                  <th className="py-3.5 px-6">Total Cost</th>
                  <th className="py-3.5 px-6">Paid Amount</th>
                  <th className="py-3.5 px-6">Remaining Balance</th>
                  <th className="py-3.5 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {payments.map((pay) => (
                  <tr key={pay._id} className="hover:bg-slate-50">
                    <td className="py-4 px-6">
                      <p className="font-semibold text-slate-900">
                        {pay.project?.projectTitle || 'Digital Project'}
                      </p>
                      {pay.notes && <p className="text-xs text-slate-500 mt-0.5">{pay.notes}</p>}
                    </td>
                    <td className="py-4 px-6 text-slate-600">{formatDate(pay.paymentDate)}</td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-slate-800 block">
                        {pay.paymentMethod}{' '}
                        {pay.gateway && pay.gateway !== 'manual' && (
                          <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                            {pay.gateway}
                          </span>
                        )}
                      </span>
                      {pay.transactionReference && (
                        <span className="text-xs font-mono text-slate-500">
                          TrxID: {pay.transactionReference}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-slate-700 font-medium">
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

      {/* bKash / Nagad Checkout Verification Modal */}
      {activeGatewaySession && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full overflow-hidden shadow-2xl animate-scale-in">
            <div
              className={`px-6 py-4 text-white flex items-center justify-between ${
                activeGatewaySession.gateway === 'bkash' ? 'bg-[#E2136E]' : 'bg-[#F7941D]'
              }`}
            >
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest opacity-90 block">
                  {activeGatewaySession.mode === 'live_merchant'
                    ? 'LIVE MERCHANT CHECKOUT'
                    : 'SANDBOX GATEWAY VERIFICATION'}
                </span>
                <h3 className="text-lg font-bold">
                  {activeGatewaySession.gateway === 'bkash'
                    ? 'bKash Tokenized Checkout'
                    : 'Nagad Payment Gateway'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => handleVerifyGateway('cancelled')}
                className="p-1 rounded-lg bg-black/20 hover:bg-black/30 text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Merchant</span>
                  <span className="font-bold text-slate-900">Dynamic IT Digital Agency</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Gateway Session ID</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {activeGatewaySession.gatewayPaymentId}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 text-sm">
                  <span className="font-semibold text-slate-700">Payable Amount</span>
                  <span className="font-extrabold text-slate-900">
                    {formatCurrency(activeGatewaySession.amount)}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Clicking <strong>Authorize & Verify Payment</strong> executes server-side payment
                verification on the backend before updating your balance.
              </p>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  disabled={verifying}
                  onClick={() => handleVerifyGateway('success')}
                  className={`w-full py-3 px-4 rounded-xl text-white font-semibold text-xs transition-opacity ${
                    activeGatewaySession.gateway === 'bkash' ? 'bg-[#E2136E]' : 'bg-[#F7941D]'
                  }`}
                >
                  {verifying ? 'Verifying with Server...' : 'Authorize & Verify Payment'}
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={verifying}
                    onClick={() => handleVerifyGateway('failed')}
                    className="py-2 px-3 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs font-semibold"
                  >
                    Simulate Decline
                  </button>
                  <button
                    type="button"
                    disabled={verifying}
                    onClick={() => handleVerifyGateway('cancelled')}
                    className="py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-xs font-semibold"
                  >
                    Cancel Checkout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default CustomerPaymentsPage;
