import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardAPI, aiAPI } from '../../services/api';
import { DashboardStats, RiskAnalysis } from '../../types';
import StatCard from '../../components/StatCard';
import {
  MapPin, AlertTriangle, Bell, Shield, ShieldAlert, Navigation,
  ArrowRight, ChevronRight, Radio, BrainCircuit, AlertCircle
} from 'lucide-react';

const TouristDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({});
  const [risk, setRisk] = useState<RiskAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    dashboardAPI.getTourist()
      .then((res) => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          const res = await aiAPI.analyzeRisk({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
          setRisk(res.data);
        } catch {}
      });
    }
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-500 border-t-transparent" />
    </div>
  );

  const actions = [
    { label: 'SOS Emergency', icon: ShieldAlert, color: 'red', path: '/tourist/sos', bg: 'from-red-500 to-rose-600', desc: 'Send emergency alert' },
    { label: 'Report Incident', icon: AlertTriangle, color: 'amber', path: '/tourist/incident-report', bg: 'from-amber-500 to-orange-600', desc: 'File a safety report' },
    { label: 'View Map', icon: MapPin, color: 'blue', path: '/map', bg: 'from-blue-500 to-indigo-600', desc: 'Check safe zones' },
    { label: 'AI Assistant', icon: BrainCircuit, color: 'purple', path: '/ai-assistant', bg: 'from-purple-500 to-violet-600', desc: 'Ask safety questions' },
  ];

  const getRiskBadge = (level: string) => {
    const map: Record<string, string> = {
      safe: 'badge-green', moderate: 'badge-yellow', danger: 'badge-red', critical: 'bg-red-200 dark:bg-red-900/40 text-red-800 dark:text-red-300',
    };
    return map[level] || 'badge-gray';
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600 dark:text-green-400';
    if (score >= 40) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back</h1>
          <p className="text-sm text-gray-500 mt-0.5">Stay safe on your journey with real-time protection</p>
        </div>
        <button onClick={() => navigate('/tourist/sos')} className="btn-danger flex items-center gap-2 animate-pulse-ring shadow-lg shadow-red-600/20">
          <ShieldAlert className="w-4 h-4" /> SOS
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Safety Score" value={stats.safety_score ?? '--'} icon={<Shield className="w-5 h-5" />} color={stats.safety_score && stats.safety_score >= 70 ? 'green' : stats.safety_score && stats.safety_score >= 40 ? 'yellow' : 'red'} subtitle="Current location" />
        <StatCard title="Trip Status" value={stats.on_trip ? 'Active' : 'Inactive'} icon={<Navigation className="w-5 h-5" />} color={stats.on_trip ? 'green' : 'blue'} subtitle={stats.on_trip ? 'Trip in progress' : 'No active trip'} />
        <StatCard title="Open Incidents" value={stats.open_incidents ?? 0} icon={<AlertCircle className="w-5 h-5" />} color={(stats.open_incidents ?? 0) > 0 ? 'red' : 'green'} subtitle={stats.open_incidents ? 'Needs attention' : 'All clear'} />
        <StatCard title="Unread Alerts" value={stats.unread_alerts ?? 0} icon={<Bell className="w-5 h-5" />} color={(stats.unread_alerts ?? 0) > 0 ? 'yellow' : 'blue'} subtitle={stats.unread_alerts ? 'Check alerts' : 'No alerts'} />
      </div>

      {risk && (
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">
              <Radio className="w-4 h-4 text-blue-500" />
              Live Risk Assessment
            </h2>
            <span className={`badge ${getRiskBadge(risk.risk_level)}`}>{risk.risk_level.toUpperCase()}</span>
          </div>
          <div className="flex items-center gap-6 mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold ring-4 ${
                  risk.safety_score >= 70 ? 'ring-green-500/30 text-green-600 dark:text-green-400' :
                  risk.safety_score >= 40 ? 'ring-amber-500/30 text-amber-600 dark:text-amber-400' :
                  'ring-red-500/30 text-red-600 dark:text-red-400'
                } bg-gray-50 dark:bg-gray-800`}>
                  {risk.safety_score}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Safety Score</p>
                <p className={`text-lg font-bold ${getScoreColor(risk.safety_score)}`}>/100</p>
              </div>
            </div>
            <div className="h-12 w-px bg-gray-200 dark:bg-gray-700" />
            <div className="flex-1">
              <p className="text-sm text-gray-600 dark:text-gray-300">{risk.recommendation}</p>
            </div>
          </div>
          {risk.risk_factors.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Risk Factors</p>
              {risk.risk_factors.slice(0, 3).map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-white/5 rounded-lg px-3 py-1.5">
                  <AlertTriangle className="w-3 h-3 text-amber-500 flex-shrink-0" />
                  {f}
                </div>
              ))}
            </div>
          )}
          {risk.ai_explanation && !risk.ai_explanation.startsWith('AI analysis unavailable') && (
            <p className="mt-3 text-xs text-gray-400 italic border-t border-gray-100 dark:border-gray-700 pt-3">AI: {risk.ai_explanation}</p>
          )}
        </div>
      )}

      {stats.current_trip && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">
              <Navigation className="w-4 h-4 text-green-500" />
              Current Trip
            </h2>
            <span className="badge-green flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              Active
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Destination', value: stats.current_trip.destination, icon: MapPin },
              { label: 'Start Date', value: stats.current_trip.start_date, icon: CalendarIcon },
              { label: 'End Date', value: stats.current_trip.end_date, icon: CalendarIcon },
              { label: 'Duration', value: stats.current_trip.start_date && stats.current_trip.end_date
                ? `${Math.ceil((new Date(stats.current_trip.end_date).getTime() - new Date(stats.current_trip.start_date).getTime()) / (1000*60*60*24))} days`
                : '--', icon: Navigation },
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 dark:bg-white/5 rounded-xl p-3.5">
                <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                  <item.icon className="w-3 h-3" />
                  {item.label}
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.value || '--'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="section-title mb-4">
            <Shield className="w-4 h-4 text-blue-500" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {actions.map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className="group relative overflow-hidden p-4 rounded-xl border border-gray-100 dark:border-gray-700/50 hover:shadow-lg transition-all duration-200 active:scale-[0.98]"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${action.bg} opacity-0 group-hover:opacity-5 transition-opacity`} />
                <div className={`w-10 h-10 rounded-xl bg-${action.color}-100 dark:bg-${action.color}-900/30 flex items-center justify-center mb-2.5`}>
                  <action.icon className={`w-5 h-5 text-${action.color}-600 dark:text-${action.color}-400`} />
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{action.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{action.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Recent Incidents
            </h2>
            {stats.recent_incidents && stats.recent_incidents.length > 0 && (
              <button className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                View all <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
          {stats.recent_incidents && stats.recent_incidents.length > 0 ? (
            <div className="space-y-2">
              {stats.recent_incidents.map((inc: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-xl hover:bg-gray-100/50 dark:hover:bg-white/[0.07] transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{inc.title}</p>
                    <p className="text-xs text-gray-400 font-mono">{inc.ticket_id}</p>
                  </div>
                  <span className={`badge text-xs flex-shrink-0 ${
                    inc.severity === 'critical' ? 'badge-red' :
                    inc.severity === 'high' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' :
                    'badge-yellow'
                  }`}>{inc.severity}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <Shield className="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
              <p className="text-sm text-gray-400">No incidents reported</p>
              <button onClick={() => navigate('/tourist/incident-report')} className="btn-outline text-xs mt-3">
                Report an incident
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
);

export default TouristDashboard;
