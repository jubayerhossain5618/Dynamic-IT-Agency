import React, { useEffect, useState } from 'react';
import { Wrench, Plus, Edit3, Power, CheckCircle2, AlertCircle } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ServiceIcon from '../../components/common/ServiceIcon';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatters';

const INITIAL_FORM = {
  title: '',
  category: 'Web Engineering',
  shortDescription: '',
  description: '',
  features: '',
  deliverables: '',
  startingPrice: '10000',
  pricingType: 'fixed_starting',
  estimatedTimeline: '7 - 15 Days',
  image: '',
  iconName: 'Code2',
  isFeatured: true,
  isActive: true,
};

const AdminServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const loadServices = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/services?includeInactive=true');
      setServices(data.services || []);
    } catch (_err) {
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const handleOpenCreate = () => {
    setEditingServiceId(null);
    setFormData(INITIAL_FORM);
    setShowForm(true);
  };

  const handleOpenEdit = (service) => {
    setEditingServiceId(service._id);
    setFormData({
      title: service.title,
      category: service.category,
      shortDescription: service.shortDescription,
      description: service.description,
      features: (service.features || []).join('\n'),
      deliverables: (service.deliverables || []).join('\n'),
      startingPrice: String(service.startingPrice),
      pricingType: service.pricingType || 'fixed_starting',
      estimatedTimeline: service.estimatedTimeline || '7 - 15 Days',
      image: service.image || '',
      iconName: service.iconName || 'Globe',
      isFeatured: Boolean(service.isFeatured),
      isActive: Boolean(service.isActive),
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });

    try {
      setSubmitting(true);
      if (editingServiceId) {
        const { data } = await api.put(`/services/${editingServiceId}`, formData);
        setFeedback({ type: 'success', message: data.message });
      } else {
        const { data } = await api.post('/services', formData);
        setFeedback({ type: 'success', message: data.message });
      }
      setShowForm(false);
      await loadServices();
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Could not save service.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (service) => {
    try {
      await api.put(`/services/${service._id}`, {
        isActive: !service.isActive,
      });
      await loadServices();
    } catch (_err) {
      // handled gracefully
    }
  };

  return (
    <DashboardLayout
      title="Service Catalogue Management"
      subtitle="Add, edit, feature, or deactivate digital agency services stored in MongoDB"
      actions={
        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Service</span>
        </button>
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

      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 mb-4">
            {editingServiceId ? 'Edit Service Details' : 'Add New Digital Service'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Service Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g., E-Commerce Platform Development"
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category *
                </label>
                <input
                  type="text"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Starting Price (BDT ৳) *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.startingPrice}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, startingPrice: e.target.value }))
                  }
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Estimated Timeline
                </label>
                <input
                  type="text"
                  value={formData.estimatedTimeline}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, estimatedTimeline: e.target.value }))
                  }
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Icon Style
                </label>
                <select
                  value={formData.iconName}
                  onChange={(e) => setFormData((p) => ({ ...p, iconName: e.target.value }))}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl bg-white"
                >
                  <option value="Code2">Code2 (Web Dev)</option>
                  <option value="Megaphone">Megaphone (Marketing)</option>
                  <option value="Layout">Layout (Landing Page)</option>
                  <option value="Server">Server (Hosting/Domain)</option>
                  <option value="Palette">Palette (Branding)</option>
                  <option value="Search">Search (SEO)</option>
                  <option value="Globe">Globe (General)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Short Summary (Max 300 chars) *
              </label>
              <input
                type="text"
                required
                maxLength={300}
                value={formData.shortDescription}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, shortDescription: e.target.value }))
                }
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Description *
              </label>
              <textarea
                rows={3}
                required
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Features (One per line)
                </label>
                <textarea
                  rows={4}
                  value={formData.features}
                  onChange={(e) => setFormData((p) => ({ ...p, features: e.target.value }))}
                  placeholder="Custom Responsive Design&#10;SEO Ready Architecture"
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Deliverables (One per line)
                </label>
                <textarea
                  rows={4}
                  value={formData.deliverables}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, deliverables: e.target.value }))
                  }
                  placeholder="Full Source Code&#10;Admin Dashboard"
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cover Image URL
              </label>
              <input
                type="text"
                value={formData.image}
                onChange={(e) => setFormData((p) => ({ ...p, image: e.target.value }))}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl"
              />
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-1">
              <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, isFeatured: e.target.checked }))
                  }
                  className="rounded border-slate-300 text-brand-600"
                />
                <span>Featured on Homepage</span>
              </label>

              <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData((p) => ({ ...p, isActive: e.target.checked }))}
                  className="rounded border-slate-300 text-brand-600"
                />
                <span>Active in Public Catalogue</span>
              </label>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold"
              >
                {submitting ? 'Saving...' : editingServiceId ? 'Update Service' : 'Create Service'}
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

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="bg-white rounded-2xl border border-slate-200 p-6 h-48 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service) => (
            <div
              key={service._id}
              className={`bg-white rounded-2xl border p-6 flex flex-col justify-between shadow-sm ${
                service.isActive ? 'border-slate-200' : 'border-slate-200 opacity-65'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                      <ServiceIcon name={service.iconName} className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-brand-600">
                        {service.category}
                      </span>
                      <h3 className="text-base font-bold text-slate-900">{service.title}</h3>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      service.isActive
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-300'
                    }`}
                  >
                    {service.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {service.shortDescription}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] uppercase text-slate-400 block">Starting Rate</span>
                  <span className="text-base font-extrabold text-slate-900">
                    {formatCurrency(service.startingPrice)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(service)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleActive(service)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700"
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{service.isActive ? 'Deactivate' : 'Activate'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminServicesPage;
