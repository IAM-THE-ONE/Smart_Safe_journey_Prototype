import React, { useEffect, useState } from 'react';
import { dashboardAPI } from '../../services/api';
import { DashboardStats } from '../../types';
import StatCard from '../../components/StatCard';
import { Users, MapPin, AlertTriangle, Shield, Activity, Bell, TrendingUp, Clock } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler } from 'chart.js';
import { Pie, Line } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Filler);

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.getAdmin().then((res) => setStats(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-500 border-t-transparent" />
    </div>
  );

  const pieData = {
    labels: stats.incident_by_type?.map((i: any) => i.category__name || 'Unknown') || [],
    datasets: [{
      data: stats.incident_by_type?.map((i: any) => i.count) || [],
      backgroundColor: ['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899'],
      borderWidth: 0,
    }],
  };

  const lineData = {
    labels: stats.monthly_reports?.map((m: any) => {
      const d = new Date(m.date);
      return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
    }) || [],
    datasets: [{
      label: 'Incidents',
      data: stats.monthly_reports?.map((m: any) => m.count) || [],
      borderColor: '#3b82f6',
      backgroundColor: (ctx: any) => {
        const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 300);
        g.addColorStop(0, 'rgba(59,130,246,0.25)');
        g.addColorStop(1, 'rgba(59,130,246,0)');
        return g;
      },
      fill: true,
      tension: 0.4,
      pointRadius: 3,
      pointHoverRadius: 6,
      pointBackgroundColor: '#3b82f6',
      borderWidth: 2,
    }],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10 } } },
      y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { size: 10 }, stepSize: 1 } },
    },
  };

  const statCards = [
    { title: 'Registered Tourists', value: stats.registered_tourists ?? 0, icon: <Users className="w-5 h-5" />, color: 'blue' as const, subtitle: 'Total users' },
    { title: 'Active Trips', value: stats.active_trips ?? 0, icon: <MapPin className="w-5 h-5" />, color: 'green' as const, subtitle: 'Currently traveling' },
    { title: 'Incidents Today', value: stats.incidents_today ?? 0, icon: <AlertTriangle className="w-5 h-5" />, color: 'red' as const, subtitle: 'Last 24 hours' },
    { title: 'Pending Cases', value: stats.pending_cases ?? 0, icon: <Clock className="w-5 h-5" />, color: 'yellow' as const, subtitle: 'Needs action' },
    { title: 'High Risk Alerts', value: stats.high_risk_alerts ?? 0, icon: <Bell className="w-5 h-5" />, color: 'red' as const, subtitle: 'Requires attention' },
    { title: 'Police Online', value: stats.police_online ?? 0, icon: <Activity className="w-5 h-5" />, color: 'purple' as const, subtitle: 'Active officers' },
    { title: 'Active SOS', value: stats.active_sos ?? 0, icon: <AlertTriangle className="w-5 h-5" />, color: 'red' as const, subtitle: 'Emergency alerts' },
    { title: 'Total Zones', value: stats.total_zones ?? 0, icon: <Shield className="w-5 h-5" />, color: 'blue' as const, subtitle: 'Safety zones' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Full system overview and analytics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <StatCard key={i} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Incidents by Type
            </h2>
            <span className="text-xs text-gray-400">Distribution</span>
          </div>
          <div className="max-h-64 flex items-center justify-center">
            {pieData.labels.length > 0 ? (
              <Pie data={pieData} options={{ ...chartOptions, plugins: { legend: { position: 'bottom', labels: { font: { size: 10 }, boxWidth: 12, padding: 12 } } } }} />
            ) : (
              <p className="text-sm text-gray-400">No data available</p>
            )}
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              Monthly Trend
            </h2>
            <span className="text-xs text-gray-400">30 days</span>
          </div>
          {lineData.labels.length > 0 ? (
            <Line data={lineData} options={chartOptions} />
          ) : (
            <div className="flex items-center justify-center h-48">
              <p className="text-sm text-gray-400">No data available</p>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">
            <Activity className="w-4 h-4 text-blue-500" />
            Recent Incidents
          </h2>
          <span className="text-xs text-gray-400">{stats.recent_incidents?.length || 0} entries</span>
        </div>
        <div className="overflow-x-auto -mx-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/5">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Ticket</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Title</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Severity</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent_incidents?.map((inc: any, i: number) => (
                <tr key={i} className="border-b border-gray-50 dark:border-white/5 hover:bg-gray-50/50 dark:hover:bg-white/[0.02]">
                  <td className="px-6 py-3 font-mono text-xs text-gray-400">{inc.ticket_id}</td>
                  <td className="px-6 py-3 font-medium text-gray-900 dark:text-white">{inc.title}</td>
                  <td className="px-6 py-3">
                    <span className={`badge text-[10px] ${
                      inc.severity === 'critical' ? 'badge-red' :
                      inc.severity === 'high' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' :
                      'badge-yellow'
                    }`}>{inc.severity}</span>
                  </td>
                  <td className="px-6 py-3 capitalize text-gray-600 dark:text-gray-400">{inc.status.replace('_', ' ')}</td>
                  <td className="px-6 py-3 text-gray-400">{new Date(inc.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {(!stats.recent_incidents || stats.recent_incidents.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-400">No incidents recorded</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
