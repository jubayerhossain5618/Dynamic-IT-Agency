import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FilePlus2, FolderKanban, Paperclip, Calendar, ExternalLink } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';

const MyRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchMyRequests = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/requests/my');
        setRequests(data.requests || []);
      } catch (_err) {
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMyRequests();
  }, []);

  const filtered =
    statusFilter === 'all'
      ? requests
      : requests.filter((r) => r.status === statusFilter);

  return (
    <DashboardLayout
      title="My Service Requests"
      subtitle="Track the status of your submitted project requirements"
      actions={
        <Link
          to="/customer/requests/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm"
        >
          <FilePlus2 className="w-4 h-4" />
          <span>Submit New Request</span>
        </Link>
      }
    >
      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['all', 'pending', 'under_review', 'quoted', 'accepted', 'project_created', 'rejected'].map(
          (st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-brand-600 text-white'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {st === 'all' ? 'All Requests' : st.replace('_', ' ')}
            </button>
          )
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-white rounded-2xl border border-slate-200 p-6 h-36 animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No service requests found"
          description="Submit your project requirements to receive a tailored quotation from Dynamic IT."
          action={
            <Link
              to="/customer/requests/new"
              className="px-4 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-semibold"
            >
              Submit Service Request
            </Link>
          }
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
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-brand-50 text-brand-700">
                      {req.service?.title || 'Digital Service'}
                    </span>
                    <span className="text-xs text-slate-400">
                      Submitted on {formatDate(req.createdAt)}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{req.projectTitle}</h3>
                </div>
                <StatusBadge status={req.status} />
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">{req.description}</p>

              {req.requirements && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700">
                  <strong className="text-slate-900 block mb-1">Specific Requirements:</strong>
                  {req.requirements}
                </div>
              )}

              {req.adminNotes && (
                <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200 text-xs text-indigo-950">
                  <strong className="text-indigo-900 block mb-0.5">
                    Agency Review Note from Dynamic IT:
                  </strong>
                  {req.adminNotes}
                </div>
              )}

              {req.attachments && req.attachments.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
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

              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600">
                <div className="flex flex-wrap items-center gap-4">
                  <span>
                    Estimated Budget:{' '}
                    <strong className="text-slate-900">{formatCurrency(req.budget)}</strong>
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-brand-600" />
                    Preferred Deadline:{' '}
                    <strong className="text-slate-900">{formatDate(req.preferredDeadline)}</strong>
                  </span>
                </div>

                {['quoted', 'accepted', 'project_created'].includes(req.status) && (
                  <Link
                    to="/customer/quotations"
                    className="font-semibold text-brand-600 hover:text-brand-700"
                  >
                    View Associated Quotation →
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

export default MyRequestsPage;
