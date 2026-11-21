import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MessageSquare, Send, Briefcase, RefreshCw } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import EmptyState from '../../components/common/EmptyState';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { formatDateTime } from '../../utils/formatters';

const CustomerMessagesPage = () => {
  const { user } = useAuth();
  const { socket, connected, onlineUsers } = useSocket();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialProjectId = searchParams.get('projectId') || '';

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(initialProjectId);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/projects/my');
        const list = data.projects || [];
        setProjects(list);
        if (!selectedProjectId && list.length > 0) {
          setSelectedProjectId(list[0]._id);
        }
      } catch (_err) {
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };
    loadProjects();
  }, []);

  const loadThread = async (projectId) => {
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
      loadThread(selectedProjectId);
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

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedProjectId) return;

    const text = newMessage.trim();
    try {
      setSending(true);
      const { data } = await api.post('/messages', {
        projectId: selectedProjectId,
        message: text,
      });
      setNewMessage('');
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

  const activeProject = projects.find((p) => p._id === selectedProjectId);
  const isOtherPartyOnline = onlineUsers.some((uid) => uid !== user?._id);

  return (
    <DashboardLayout
      title="Live Project Chat"
      subtitle="Real-time Socket.IO messaging with the Dynamic IT project management team"
      actions={
        selectedProjectId && (
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
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
              {connected ? 'Live Chat Connected' : 'Offline'}
            </span>
            <button
              type="button"
              onClick={() => loadThread(selectedProjectId)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync</span>
            </button>
          </div>
        )
      }
    >
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 h-96 animate-pulse" />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No active project workspaces yet"
          description="Project messaging becomes available as soon as a quotation is accepted and your project workspace is created."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Project Selector Sidebar */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Select Project Thread
              </h3>
            </div>
            <div className="divide-y divide-slate-100">
              {projects.map((p) => (
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
                    <p className="text-sm font-bold text-slate-900 truncate">{p.projectTitle}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Progress: {p.progress}% • {p.status.replace('_', ' ')}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Window */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 flex flex-col h-[540px] shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {activeProject?.projectTitle || 'Project Conversation'}
                </h3>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isOtherPartyOnline ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  />
                  <span>
                    Dynamic IT Support {isOtherPartyOnline ? '(Online)' : '(Messages Saved)'}
                  </span>
                </p>
              </div>
              <span className="text-xs font-semibold text-[#2563EB]">
                {activeProject?.progress || 0}% Complete
              </span>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
                  <MessageSquare className="w-8 h-8 mb-2 text-slate-300" />
                  <p className="text-sm font-medium text-slate-600">
                    No messages in this project yet
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Send a message below to start the conversation with your project manager.
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.sender?._id === user?._id || msg.sender === user?._id;
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
                          {isMine ? 'You' : `${msg.sender?.name || 'Dynamic IT Admin'} (Admin)`}
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

            {/* Composer */}
            <form
              onSubmit={handleSend}
              className="p-4 bg-white border-t border-slate-200 flex items-center gap-3"
            >
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Write a real-time project update or question..."
                className="flex-1 px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
              <button
                type="submit"
                disabled={sending || !newMessage.trim()}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold shadow-sm"
              >
                <Send className="w-4 h-4" />
                <span>{sending ? 'Sending...' : 'Send'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default CustomerMessagesPage;
