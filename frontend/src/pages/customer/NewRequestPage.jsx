import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FilePlus2,
  Upload,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  FileText,
  X,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatters';

const NewRequestPage = () => {
  const [searchParams] = useSearchParams();
  const preselectedServiceId = searchParams.get('serviceId') || '';
  const navigate = useNavigate();

  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({
    service: preselectedServiceId,
    projectTitle: '',
    description: '',
    requirements: '',
    budget: '',
    preferredDeadline: '',
  });
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadServices = async () => {
      try {
        const { data } = await api.get('/services');
        const list = data.services || [];
        setServices(list);
        if (!formData.service && preselectedServiceId) {
          setFormData((prev) => ({ ...prev, service: preselectedServiceId }));
        } else if (!formData.service && list.length > 0) {
          const webService = list.find((s) => s.slug === 'website-development') || list[0];
          setFormData((prev) => ({ ...prev, service: webService._id }));
        }
      } catch (_err) {
        setServices([]);
      }
    };
    loadServices();
  }, [preselectedServiceId]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    setFiles(selected.slice(0, 5));
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  const fillDemoRequest = () => {
    const webService =
      services.find((s) => s.slug === 'website-development') || services[0];
    const deadlineDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    setFormData({
      service: webService ? webService._id : '',
      projectTitle: 'Five-Page Responsive Business Website',
      description:
        'We need a complete five-page responsive corporate website including Home, About, Services, Portfolio, and Contact pages with an inquiry management system.',
      requirements:
        'Modern responsive layout for mobile, tablet, and desktop; fast loading speed; SEO meta tags; and contact form storage in MongoDB.',
      budget: '15000',
      preferredDeadline: deadlineDate,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      setSubmitting(true);
      const payload = new FormData();
      payload.append('service', formData.service);
      payload.append('projectTitle', formData.projectTitle);
      payload.append('description', formData.description);
      payload.append('requirements', formData.requirements);
      payload.append('budget', formData.budget);
      payload.append('preferredDeadline', formData.preferredDeadline);

      files.forEach((file) => {
        payload.append('attachments', file);
      });

      await api.post('/requests', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccess('Your service request has been submitted! Redirecting to My Requests...');
      setTimeout(() => {
        navigate('/customer/requests');
      }, 1000);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to submit service request. Please check your inputs.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      title="Submit a Service Request"
      subtitle="Tell Dynamic IT about your project goals, requirements, budget, and preferred timeline"
      actions={
        import.meta.env.VITE_DEMO_MODE === 'true' ? (
          <button
            type="button"
            onClick={fillDemoRequest}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 text-xs font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Auto-Fill Demo Website Request</span>
          </button>
        ) : null
      }
    >
      <div className="max-w-3xl bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select Digital Service *
            </label>
            <select
              name="service"
              required
              value={formData.service}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="" disabled>
                -- Choose a Service --
              </option>
              {services.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.title} ({s.category} — Starting at {formatCurrency(s.startingPrice)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Project Title *
            </label>
            <input
              type="text"
              name="projectTitle"
              required
              value={formData.projectTitle}
              onChange={handleChange}
              placeholder="e.g., Five-Page Responsive Business Website"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Project Description *
            </label>
            <textarea
              name="description"
              rows={4}
              required
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe what your business does and what you want to achieve with this project..."
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Specific Technical / Design Requirements
            </label>
            <textarea
              name="requirements"
              rows={3}
              value={formData.requirements}
              onChange={handleChange}
              placeholder="List pages needed, target audience, features, brand preferences, or reference links..."
              className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Estimated Budget (BDT ৳ — Optional)
              </label>
              <input
                type="number"
                name="budget"
                min="0"
                value={formData.budget}
                onChange={handleChange}
                placeholder="e.g., 15000 (Leave blank for agency estimate)"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Preferred Completion Deadline
              </label>
              <input
                type="date"
                name="preferredDeadline"
                value={formData.preferredDeadline}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Reference File Upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Reference Attachments (Optional — PDF, JPG, PNG, DOCX up to 8MB)
            </label>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-brand-400 rounded-xl p-5 cursor-pointer bg-slate-50/70 transition-colors">
              <Upload className="w-6 h-6 text-brand-600 mb-1.5" />
              <span className="text-xs font-semibold text-slate-700">
                Click to select reference files
              </span>
              <span className="text-[11px] text-slate-400 mt-0.5">
                Supported formats: .pdf, .jpg, .png, .docx (max 5 files)
              </span>
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {files.length > 0 && (
              <div className="mt-3 space-y-2">
                {files.map((file, idx) => (
                  <div
                    key={`${file.name}-${idx}`}
                    className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-100 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-brand-600 shrink-0" />
                      <span className="font-medium text-slate-800 truncate">{file.name}</span>
                      <span className="text-slate-400">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="text-slate-500 hover:text-rose-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold text-sm shadow-sm transition-colors"
            >
              <FilePlus2 className="w-4 h-4" />
              <span>{submitting ? 'Submitting Request...' : 'Submit Service Request'}</span>
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default NewRequestPage;
