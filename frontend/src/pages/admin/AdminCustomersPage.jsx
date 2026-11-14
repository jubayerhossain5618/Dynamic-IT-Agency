import React, { useEffect, useState } from 'react';
import { Users, Search, Eye, Power, X } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';

const AdminCustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDetails, setSelectedDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/customers');
      setCustomers(data.customers || []);
    } catch (_err) {
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleInspectCustomer = async (customerId) => {
    try {
      setLoadingDetails(true);
      const { data } = await api.get(`/customers/${customerId}`);
      setSelectedDetails(data);
    } catch (_err) {
      // handled gracefully
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleToggleStatus = async (customer) => {
    try {
      await api.patch(`/customers/${customer._id}/status`, {
        isActive: !customer.isActive,
      });
      await loadCustomers();
      if (selectedDetails?.customer?._id === customer._id) {
        await handleInspectCustomer(customer._id);
      }
    } catch (_err) {
      // handled gracefully
    }
  };

  const filtered = customers.filter((c) => {
    const q = searchTerm.toLowerCase();
    return (
      !q ||
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q) ||
      c.company?.toLowerCase().includes(q)
    );
  });

  return (
    <DashboardLayout
      title="Customer Management"
      subtitle="Search registered customers, inspect their requests and projects, and manage account status"
    >
      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, phone, or company..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <span className="text-xs font-semibold text-slate-500">
          Showing {filtered.length} of {customers.length} Customer Accounts
        </span>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 h-64 animate-pulse" />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No customers matched your search"
          description="Try clearing the search bar to see all registered client accounts."
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
                  <th className="py-3.5 px-6">Customer</th>
                  <th className="py-3.5 px-6">Contact</th>
                  <th className="py-3.5 px-6">Requests</th>
                  <th className="py-3.5 px-6">Projects</th>
                  <th className="py-3.5 px-6">Total Paid</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {filtered.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50">
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-900">{c.name}</p>
                      <p className="text-xs text-slate-500">
                        {c.company || 'Individual Client'} • Joined {formatDate(c.createdAt)}
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-slate-800 text-xs font-medium">{c.email}</p>
                      <p className="text-slate-500 text-xs">{c.phone}</p>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-800">
                      {c.stats?.requestCount || 0}
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-800">
                      {c.stats?.projectCount || 0}
                    </td>
                    <td className="py-4 px-6 font-bold text-emerald-600">
                      {formatCurrency(c.stats?.totalPaid || 0)}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          c.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {c.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleInspectCustomer(c._id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-semibold"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Profile</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(c)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700"
                        >
                          <Power className="w-3.5 h-3.5" />
                          <span>{c.isActive ? 'Disable' : 'Enable'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Customer Details Modal */}
      {(selectedDetails || loadingDetails) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-3xl w-full max-h-[85vh] overflow-y-auto p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {selectedDetails?.customer?.name || 'Loading Customer Profile...'}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedDetails?.customer?.email} • {selectedDetails?.customer?.phone}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDetails(null)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingDetails ? (
              <div className="h-40 animate-pulse bg-slate-100 rounded-xl" />
            ) : (
              <>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Submitted Service Requests ({selectedDetails.requests?.length || 0})
                  </h4>
                  {selectedDetails.requests?.length === 0 ? (
                    <p className="text-xs text-slate-400">No requests submitted.</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedDetails.requests.map((r) => (
                        <div
                          key={r._id}
                          className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                        >
                          <div>
                            <p className="font-bold text-slate-900">{r.projectTitle}</p>
                            <p className="text-slate-500">
                              {r.service?.title} • Budget: {formatCurrency(r.budget)}
                            </p>
                          </div>
                          <StatusBadge status={r.status} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Customer Projects ({selectedDetails.projects?.length || 0})
                  </h4>
                  {selectedDetails.projects?.length === 0 ? (
                    <p className="text-xs text-slate-400">No projects created yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedDetails.projects.map((p) => (
                        <div
                          key={p._id}
                          className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                        >
                          <div>
                            <p className="font-bold text-slate-900">{p.projectTitle}</p>
                            <p className="text-slate-500">
                              Progress: {p.progress}% • Value: {formatCurrency(p.totalAmount)}
                            </p>
                          </div>
                          <StatusBadge status={p.status} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminCustomersPage;
