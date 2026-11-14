import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  FolderKanban,
  Paperclip,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';

const AdminRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [statusInput, setStatusInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/requests');
      setRequests(data.requests || []);
    } catch (_err) {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const startReview = (req) => {
    setEditingId(req._id);
    setStatusInput(req.status === 'pending' ? 'under_review' : req.status);
    setNotesInput(req.adminNotes || '');
  };

  const handleSaveReview = async (id) => {
    setFeedback({ type: '', message: '' });
    try {
      const { data } = await api.patch(`/requests/${id}/status`, {
        status: statusInput,
        adminNotes: notesInput,
      });
      setFeedback({
        type: 'success',
        message: data.message || 'Service request status updated.',
      });
      setEditingId(null);
      await fetchRequests();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Could not update request.',
      });
    }
  };

  const filtered = requests.filter((r) => {
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !q ||
      r.projectTitle?.toLowerCase().includes(q) ||
      r.customer?.name?.toLowerCase().includes(q) ||
      r.customer?.email?.toLowerCase().includes(q) ||
      r.service?.title?.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  return (
    <DashboardLayout
      title="Service Request Management"
      subtitle="Review customer project requirements, update review statuses, and generate custom quotations"
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

      {/* Search & Filter Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-sm">
        <div className="flex flex-wrap gap-1.5">
          {[
            'all',
            'pending',
            'under_review',
            'quoted',
            'accepted',
            'project_created',
            'rejected',
          ].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-brand-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {st === 'all' ? 'All' : st.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search client or project title..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-white rounded-2xl border border-slate-200 p-6 h-40 animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No matching service requests"
          description="Try clearing your search or status filter to view all customer requests."
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((req) => (
            <div
              key={req._id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-md bg-brand-50 text-brand-700 text-xs font-semibold">
                      {req.service?.title || 'Digital Service'}
                    </span>
                    <span className="text-xs text-slate-500">
                      Customer: <strong className="text-slate-800">{req.customer?.name}</strong> (
                      {req.customer?.email})
                    </span>
                    <span className="text-xs text-slate-400">
                      • Submitted {formatDate(req.createdAt)}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{req.projectTitle}</h3>
                </div>
                <StatusBadge status={req.status} />
              </div>

              <p className="text-sm text-slate-700 leading-relaxed">{req.description}</p>

              {req.requirements && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                  <strong className="text-slate-900 block mb-0.5">Customer Requirements:</strong>
                  {req.requirements}
                </div>
              )}

              {req.attachments && req.attachments.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                    <Paperclip className="w-3.5 h-3.5" />
                    Attachments:
                  </span>
                  {req.attachments.map((att, idx) => (
                    <a
                      key={idx}
                      href={att.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-700"
                    >
                      <span>{att.originalName}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ))}
                </div>
              )}

              {req.adminNotes && editingId !== req._id && (
                <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs text-indigo-900">
                  <strong>Internal Admin Note:</strong> {req.adminNotes}
                </div>
              )}

              {/* Inline Review Editor */}
              {editingId === req._id && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Request Status
                      </label>
                      <select
                        value={statusInput}
                        onChange={(e) => setStatusInput(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                      >
                        <option value="pending">Pending</option>
                        <option value="under_review">Under Review</option>
                        <option value="quoted">Quoted</option>
                        <option value="accepted">Accepted</option>
                        <option value="project_created">Project Created</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Internal / Review Notes
                      </label>
                      <input
                        type="text"
                        value={notesInput}
                        onChange={(e) => setNotesInput(e.target.value)}
                        placeholder="Add review notes for this request..."
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSaveReview(req._id)}
                      className="px-4 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-semibold"
                    >
                      Save Review Update
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Bottom Bar */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex flex-wrap items-center gap-4 text-slate-600">
                  <span>
                    Client Budget:{' '}
                    <strong className="text-slate-900">{formatCurrency(req.budget)}</strong>
                  </span>
                  <span>
                    Preferred Deadline:{' '}
                    <strong className="text-slate-900">
                      {formatDate(req.preferredDeadline)}
                    </strong>
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => startReview(req)}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 font-semibold text-slate-700"
                  >
                    Review / Update Status
                  </button>

                  {req.status !== 'project_created' && (
                    <Link
                      to={`/admin/quotations?requestId=${req._id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold shadow-sm"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>Create Quotation</span>
                    </Link>
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

export default AdminRequestsPage;
