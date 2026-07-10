import React, { useEffect, useState } from 'react';
import { touristAPI } from '../../services/api';
import { FileText, Plus, MapPin, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

const TripHistory: React.FC = () => {
  const [trips, setTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ destination: '', start_date: '', end_date: '', notes: '' });

  useEffect(() => {
    touristAPI.getTripHistory().then((res) => setTrips(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await touristAPI.createTripHistory(form);
      setTrips([res.data, ...trips]);
      setShowForm(false);
      setForm({ destination: '', start_date: '', end_date: '', notes: '' });
    } catch (err) { console.error(err); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-500 border-t-transparent" />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Trip History</h1>
          <p className="text-sm text-gray-500 mt-0.5">Your travel history and safety records</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus className="w-4 h-4" /> {showForm ? 'Cancel' : 'Add Trip'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-4 border-blue-100 dark:border-blue-900/30">
          <h3 className="font-semibold text-gray-900 dark:text-white">Add Trip Record</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Destination</label>
              <input type="text" className="input-field" value={form.destination} onChange={(e) => setForm({...form, destination: e.target.value})} placeholder="e.g. Paris, France" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
              <input type="date" className="input-field" value={form.start_date} onChange={(e) => setForm({...form, start_date: e.target.value})} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
              <input type="date" className="input-field" value={form.end_date} onChange={(e) => setForm({...form, end_date: e.target.value})} required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
            <textarea className="input-field" rows={2} value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} placeholder="Trip notes..." />
          </div>
          <button type="submit" className="btn-primary">Save Trip</button>
        </form>
      )}

      {trips.length === 0 ? (
        <div className="card text-center py-16">
          <FileText className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">No trip history yet</p>
          <p className="text-xs text-gray-400 mt-1">Add your first trip to start tracking</p>
        </div>
      ) : (
        <div className="space-y-3">
          {trips.map((trip: any, i: number) => (
            <div key={i} className="card-hover">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-sm">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">{trip.destination}</h3>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      {trip.start_date} → {trip.end_date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {trip.safety_score != null && (
                    <span className={`badge text-xs ${
                      trip.safety_score >= 70 ? 'badge-green' :
                      trip.safety_score >= 40 ? 'badge-yellow' : 'badge-red'
                    }`}>{trip.safety_score}/100</span>
                  )}
                  {trip.risk_level && (
                    <span className={`badge text-xs ${
                      trip.risk_level === 'safe' ? 'badge-green' :
                      trip.risk_level === 'moderate' ? 'badge-yellow' : 'badge-red'
                    }`}>{trip.risk_level}</span>
                  )}
                </div>
              </div>
              {trip.notes && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/50">{trip.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TripHistory;
