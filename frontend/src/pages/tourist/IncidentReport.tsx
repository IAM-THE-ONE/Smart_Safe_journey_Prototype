import React, { useEffect, useState } from 'react';
import { incidentAPI } from '../../services/api';
import { IncidentCategory } from '../../types';
import { AlertTriangle, Send, MapPin, CheckCircle } from 'lucide-react';

const IncidentReport: React.FC = () => {
  const [categories, setCategories] = useState<IncidentCategory[]>([]);
  const [form, setForm] = useState({
    category: '', title: '', description: '', latitude: 0, longitude: 0, severity: 'moderate',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    incidentAPI.getCategories().then((res) => setCategories(res.data)).catch(() => {});
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setForm((f) => ({ ...f, latitude: pos.coords.latitude, longitude: pos.coords.longitude }));
      });
    }
  }, []);

  const severityColors: Record<string, string> = {
    low: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600',
    moderate: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    high: 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800',
    critical: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const res = await incidentAPI.createIncident(form);
      setSuccess(`Incident reported! Ticket ID: ${res.data.ticket_id}`);
      setForm({ category: '', title: '', description: '', latitude: form.latitude, longitude: form.longitude, severity: 'moderate' });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to report incident');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Report Incident</h1>
        <p className="text-sm text-gray-500 mt-0.5">Submit a safety incident report to authorities</p>
      </div>

      {success && (
        <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 p-4 rounded-xl">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-medium">{success}</p>
            <p className="text-sm opacity-80">Authorities will review your report.</p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 p-3.5 rounded-xl text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Incident Type</label>
            <select className="input-field" value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} required>
              <option value="">Select type</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Severity</label>
            <select className="input-field" value={form.severity} onChange={(e) => setForm({...form, severity: e.target.value})}>
              {['low', 'moderate', 'high', 'critical'].map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Title</label>
          <input type="text" className="input-field" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} placeholder="Brief title of the incident" required />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
          <textarea className="input-field" rows={4} value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} placeholder="Describe what happened in detail..." required />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-gray-400" />
            Location
          </label>
          <div className="grid grid-cols-2 gap-3">
            <input type="number" step="any" className="input-field" placeholder="Latitude" value={form.latitude} onChange={(e) => setForm({...form, latitude: parseFloat(e.target.value) || 0})} />
            <input type="number" step="any" className="input-field" placeholder="Longitude" value={form.longitude} onChange={(e) => setForm({...form, longitude: parseFloat(e.target.value) || 0})} />
          </div>
        </div>

        <button type="submit" disabled={submitting} className="btn-primary w-full py-3">
          {submitting ? (
            <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> Submitting...</>
          ) : (
            <><Send className="w-4 h-4" /> Submit Incident Report</>
          )}
        </button>
      </form>
    </div>
  );
};

export default IncidentReport;
