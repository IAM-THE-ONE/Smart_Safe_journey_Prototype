import React, { useEffect, useState } from 'react';
import { dashboardAPI, incidentAPI } from '../../services/api';
import { DashboardStats } from '../../types';
import StatCard from '../../components/StatCard';
import { Shield, AlertTriangle, CheckCircle, MapPin, Clock, Phone, User as UserIcon, X } from 'lucide-react';

const PoliceDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({});
  const [sosAlerts, setSosAlerts] = useState<any[]>([]);
  const [respondedSos, setRespondedSos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmSos, setConfirmSos] = useState<any>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [statsRes, sosRes] = await Promise.all([
          dashboardAPI.getPolice(),
          incidentAPI.getSOSList(),
        ]);
        setStats(statsRes.data);
        setSosAlerts(sosRes.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleRespondSOS = async (id: number) => {
    try {
      const sos = sosAlerts.find((s) => s.id === id);
      await incidentAPI.respondSOS(id);
      setSosAlerts((prev) => prev.filter((s) => s.id !== id));
      if (sos) setRespondedSos((prev) => [{ ...sos, responded: true }, ...prev]);
      setConfirmSos(null);
    } catch (err) { console.error(err); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-500 border-t-transparent" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Police Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Monitor and respond to incidents in real-time</p>
        </div>
        <span className="badge-green flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          Online
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Assigned Cases" value={stats.assigned_incidents ?? 0} icon={<Shield className="w-5 h-5" />} color="blue" subtitle="Total active cases" />
        <StatCard title="Resolved" value={stats.resolved_incidents ?? 0} icon={<CheckCircle className="w-5 h-5" />} color="green" subtitle="Closed cases" />
        <StatCard title="Pending" value={stats.pending_incidents ?? 0} icon={<Clock className="w-5 h-5" />} color="yellow" subtitle="Needs attention" />
        <StatCard title="Active SOS" value={sosAlerts.length} icon={<AlertTriangle className="w-5 h-5" />} color="red" subtitle="Emergency alerts" />
      </div>

      {sosAlerts.length > 0 && (
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Active SOS Alerts
              <span className="badge-red text-xs ml-1">{sosAlerts.length}</span>
            </h2>
          </div>
          <div className="space-y-3">
            {sosAlerts.map((sos: any) => (
              <div key={sos.id} className="group relative overflow-hidden rounded-xl border border-red-200 dark:border-red-800/50 bg-gradient-to-r from-red-50 to-red-50/50 dark:from-red-950/30 dark:to-red-900/10">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-red-500 to-red-600" />
                <div className="p-4 pl-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <UserIcon className="w-4 h-4 text-red-600 flex-shrink-0" />
                        <p className="font-semibold text-gray-900 dark:text-white truncate">
                          {sos.tourist_details?.first_name} {sos.tourist_details?.last_name}
                        </p>
                        <span className="badge-red text-[10px]">SOS</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {sos.latitude.toFixed(4)}, {sos.longitude.toFixed(4)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(sos.created_at).toLocaleString()}
                        </span>
                      </div>
                      {sos.message && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic bg-white/50 dark:bg-gray-800/30 rounded-lg px-3 py-1.5">
                          "{sos.message}"
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setConfirmSos(sos)}
                      className="flex-shrink-0 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-all hover:shadow-lg hover:shadow-red-600/20 active:scale-95"
                    >
                      Respond
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {respondedSos.length > 0 && (
        <div className="card">
          <h3 className="section-title mb-3">
            <CheckCircle className="w-4 h-4 text-green-500" />
            Responded SOS
            <span className="text-xs font-normal text-gray-400 ml-1">({respondedSos.length})</span>
          </h3>
          <div className="space-y-2">
            {respondedSos.slice(0, 5).map((sos: any, i: number) => (
              <div key={i} className="flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-white/5 rounded-xl">
                <div className="flex items-center gap-3 min-w-0">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                      {sos.tourist_details?.first_name} {sos.tourist_details?.last_name}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{sos.latitude.toFixed(4)}, {sos.longitude.toFixed(4)}</p>
                  </div>
                </div>
                <span className="badge-green text-xs flex-shrink-0">Responded</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">
            <Shield className="w-4 h-4 text-blue-500" />
            My Cases
          </h2>
        </div>
        {stats.my_cases && stats.my_cases.length > 0 ? (
          <div className="space-y-2">
            {stats.my_cases.map((inc: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3.5 bg-gray-50 dark:bg-white/5 rounded-xl hover:bg-gray-100/50 dark:hover:bg-white/[0.07] transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{inc.title}</p>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">{inc.ticket_id}</p>
                </div>
                <span className={`badge flex-shrink-0 text-xs ${
                  inc.status === 'resolved' ? 'badge-green' :
                  inc.status === 'in_progress' ? 'badge-blue' :
                  'badge-yellow'
                }`}>{inc.status.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <Shield className="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No cases assigned yet</p>
          </div>
        )}
      </div>

      {confirmSos && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmSos(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-lg font-semibold">Confirm Response</h3>
              </div>
              <button onClick={() => setConfirmSos(null)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Mark this SOS from <strong>{confirmSos.tourist_details?.first_name} {confirmSos.tourist_details?.last_name}</strong> as responded?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmSos(null)} className="btn-outline flex-1">Cancel</button>
              <button onClick={() => handleRespondSOS(confirmSos.id)} className="btn-danger flex-1">
                <CheckCircle className="w-4 h-4" /> Confirm Respond
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PoliceDashboard;
