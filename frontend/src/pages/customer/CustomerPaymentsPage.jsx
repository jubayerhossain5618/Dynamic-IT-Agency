import React, { useEffect, useState } from 'react';
import { CreditCard, CheckCircle2, Clock, Wallet } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';

const CustomerPaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({
    totalProjectValue: 0,
    totalPaid: 0,
    totalRemaining: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/payments/my');
        setPayments(data.payments || []);
        if (data.summary) {
          setSummary(data.summary);
        }
      } catch (_err) {
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  return (
    <DashboardLayout
      title="Payments & Balance History"
      subtitle="View your total project costs, recorded payment installments, and remaining balances"
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Project Cost
            </span>
            <Wallet className="w-5 h-5 text-brand-600" />
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
          <p className="text-xs text-slate-500 mt-1">Verified installments recorded by Admin</p>
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

      {/* Payment History Table */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 h-64 animate-pulse" />
      ) : payments.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No payment records yet"
          description="When the administrator records an advance or milestone payment for your project, the transaction details and remaining balance will appear here."
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
                  <th className="py-3.5 px-6">Method & Ref</th>
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
                      <span className="font-medium text-slate-800 block">{pay.paymentMethod}</span>
                      {pay.transactionReference && (
                        <span className="text-xs text-slate-400">
                          Ref: {pay.transactionReference}
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
    </DashboardLayout>
  );
};

export default CustomerPaymentsPage;
