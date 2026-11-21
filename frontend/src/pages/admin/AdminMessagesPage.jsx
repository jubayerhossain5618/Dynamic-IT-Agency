import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MessageSquare, Send, Briefcase, Mail, RefreshCw } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { formatDateTime } from '../../utils/formatters';

const AdminMessagesPage = () => {
  const { user } = useAuth();
  const { socket, connected, onlineUsers } = useSocket();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialProjectId = searchParams.get('projectId') || '';

  const [activeTab, setActiveTab] = useState('project_chat');
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(initialProjectId);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [projRes, contactRes] = await Promise.all([
        api.get('/projects'),
        api.get('/contact'),
      ]);
      const projList = projRes.data.projects || [];
      setProjects(projList);
      setContacts(contactRes.data.contacts || []);

      if (!selectedProjectId && projList.length > 0) {
        setSelectedProjectId(projList[0]._id);
      }
    } catch (_err) {
      // handled gracefully
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadProjectThread = async (projectId) => {
    if (!projectId) return;
    try {
      const { data } = await api.get(`/messages/${projectId}`);
      setMessages(data.messages || []);
    } catch (_err) {
      setMessages([]);
    }
  };

  useEffect(() => {
    if (selectedProjectId) {
      loadProjectThread(selectedProjectId);
      setSearchParams({ projectId: selectedProjectId }, { replace: true });
    }
  }, [selectedProjectId]);

  // Real-time Socket.IO room subscription & message listener
  useEffect(() => {
    if (!socket || !selectedProjectId) return undefined;

    socket.emit('project:join', selectedProjectId);

    const handleIncomingMessage = (incoming) => {
      const incomingProjId = incoming?.project?._id || incoming?.project;
      if (incomingProjId === selectedProjectId) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === incoming._id)) return prev;
          return [...prev, incoming];
        });
      }
    };

    socket.on('chat:new_message', handleIncomingMessage);

    return () => {
      socket.emit('project:leave', selectedProjectId);
      socket.off('chat:new_message', handleIncomingMessage);
    };
  }, [socket, selectedProjectId]);

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedProjectId) return;

    const text = replyText.trim();
    try {
      setSending(true);
      const { data } = await api.post('/messages', {
        projectId: selectedProjectId,
        message: text,
      });
      setReplyText('');
      if (data?.data) {
        setMessages((prev) =>
          prev.some((m) => m._id === data.data._id) ? prev : [...prev, data.data]
        );
      }
    } catch (_err) {
      // handled gracefully
    } finally {
      setSending(false);
    }
  };

  const handleContactStatus = async (id, status) => {
    try {
      await api.patch(`/contact/${id}`, { status });
      const { data } = await api.get('/contact');
      setContacts(data.contacts || []);
    } catch (_err) {
      // handled gracefully
    }
  };

  const activeProject = projects.find((p) => p._id === selectedProjectId);
  const customerId = activeProject?.customer?._id || activeProject?.customer;
  const isCustomerOnline = customerId && onlineUsers.includes(customerId.toString());

  return (
    <DashboardLayout
      title="Live Client Chat & Inquiries"
      subtitle="Real-time Socket.IO customer conversations and public contact submissions"
      actions={
        <div className="flex items-center gap-2">
          <span
            className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border ${
              connected
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                connected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
              }`}
            />
            {connected ? 'Socket Connected' : 'Offline'}
          </span>
          <button
            type="button"
            onClick={() => setActiveTab('project_chat')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold ${
              activeTab === 'project_chat'
                ? 'bg-[#2563EB] text-white'
                : 'bg-white border border-slate-200 text-slate-700'
            }`}
          >
            Live Project Threads ({projects.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('contact_inquiries')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold ${
              activeTab === 'contact_inquiries'
                ? 'bg-[#2563EB] text-white'
                : 'bg-white border border-slate-200 text-slate-700'
            }`}
          >
            Contact Inquiries ({contacts.length})
          </button>
        </div>
      }
    >
      {activeTab === 'project_chat' ? (
        loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 h-96 animate-pulse" />
        ) : projects.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="No active project threads yet"
            description="Initialize a project from an accepted quotation to start live project messaging with the client."
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Project Threads Sidebar */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Client Project Threads
                </h3>
                <button
                  type="button"
                  onClick={() => loadProjectThread(selectedProjectId)}
                  className="text-slate-500 hover:text-[#2563EB]"
                  title="Refresh Messages"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="divide-y divide-slate-100">
                {projects.map((p) => {
                  const cid = p.customer?._id || p.customer;
                  const online = cid && onlineUsers.includes(cid.toString());
                  return (
                    <button
                      key={p._id}
                      type="button"
                      onClick={() => setSelectedProjectId(p._id)}
                      className={`w-full text-left p-4 transition-colors flex items-start gap-3 ${
                        selectedProjectId === p._id
                          ? 'bg-blue-50/80 border-l-4 border-[#2563EB]'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <Briefcase className="w-4 h-4 text-[#2563EB] shrink-0 mt-1" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {p.projectTitle}
                        </p>
                        <p className="text-xs text-slate-600 truncate flex items-center gap-1.5 mt-0.5">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              online ? 'bg-emerald-500' : 'bg-slate-300'
                            }`}
                          />
                          <span>{p.customer?.name}</span>
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Progress: {p.progress}% • {p.status.replace('_', ' ')}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Conversation Panel */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 flex flex-col h-[540px] shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {activeProject?.projectTitle}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isCustomerOnline ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                    />
                    <span>
                      Customer: {activeProject?.customer?.name} ({activeProject?.customer?.email}){' '}
                      {isCustomerOnline ? '• Online' : '• Offline'}
                    </span>
                  </p>
                </div>
                <StatusBadge status={activeProject?.status || 'in_progress'} />
              </div>

              <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
                    <MessageSquare className="w-8 h-8 mb-2 text-slate-300" />
                    <p className="text-sm font-medium text-slate-600">
                      No messages exchanged in this project yet
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Send an update below to notify {activeProject?.customer?.name}.
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMine =
                      msg.sender?._id === user?._id ||
                      msg.sender === user?._id ||
                      msg.sender?.role === 'admin';
                    return (
                      <div
                        key={msg._id}
                        className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-md rounded-2xl px-4 py-3 text-sm ${
                            isMine
                              ? 'bg-[#2563EB] text-white rounded-br-none'
                              : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
                          }`}
                        >
                          <p className="text-[11px] font-bold mb-1 opacity-80">
                            {isMine ? 'Dynamic IT Admin (You)' : msg.sender?.name || 'Customer'}
                          </p>
                          <p className="leading-relaxed whitespace-pre-line">{msg.message}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 px-1">
                          {formatDateTime(msg.createdAt)}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              <form
                onSubmit={handleSendReply}
                className="p-4 bg-white border-t border-slate-200 flex items-center gap-3"
              >
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a real-time reply or milestone update to the customer..."
                  className="flex-1 px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
                <button
                  type="submit"
                  disabled={sending || !replyText.trim()}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  <span>{sending ? 'Sending...' : 'Send Reply'}</span>
                </button>
              </form>
            </div>
          </div>
        )
      ) : (
        <div className="space-y-4">
          {contacts.length === 0 ? (
            <EmptyState
              icon={Mail}
              title="No public contact inquiries yet"
              description="Messages submitted on the public Contact page are stored in MongoDB and listed here."
            />
          ) : (
            contacts.map((c) => (
              <div
                key={c._id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{c.subject}</h3>
                    <p className="text-xs text-slate-500">
                      From: <strong>{c.name}</strong> ({c.email}){' '}
                      {c.phone ? `• Phone: ${c.phone}` : ''} • {formatDateTime(c.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={c.status} />
                    <select
                      value={c.status}
                      onChange={(e) => handleContactStatus(c._id, e.target.value)}
                      className="px-2.5 py-1 text-xs border border-slate-300 rounded-lg bg-white"
                    >
                      <option value="new">New</option>
                      <option value="read">Reviewed</option>
                      <option value="replied">Replied</option>
                    </select>
                  </div>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed">{c.message}</p>
              </div>
            ))
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminMessagesPage;
