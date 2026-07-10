import React, { useEffect, useState } from 'react';
import { dashboardAPI } from '../../services/api';
import StatCard from '../../components/StatCard';
import { Users, MapPin, Shield, AlertTriangle, TrendingUp, Clock } from 'lucide-react';

const TourismDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.getTourism().then((res) => setStats(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-500 border-t-transparent" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tourism Department</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage tourists, registrations, and safety zones</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Tourists" value={stats.total_tourists ?? 0} icon={<Users className="w-5 h-5" />} color="blue" subtitle="Registered users" />
        <StatCard title="Active Trips" value={stats.active_trips ?? 0} icon={<MapPin className="w-5 h-5" />} color="green" subtitle="Currently traveling" />
        <StatCard title="Pending Verifications" value={stats.pending_verifications ?? 0} icon={<Shield className="w-5 h-5" />} color="yellow" subtitle="Awaiting approval" />
        <StatCard title="Total Incidents" value={stats.total_incidents ?? 0} icon={<AlertTriangle className="w-5 h-5" />} color="red" subtitle="All time" />
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">
            <Users className="w-4 h-4 text-blue-500" />
            Recent Registrations
          </h2>
          <span className="text-xs text-gray-400">{stats.recent_tourists?.length || 0} entries</span>
        </div>
        {stats.recent_tourists && stats.recent_tourists.length > 0 ? (
          <div className="overflow-x-auto -mx-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/5">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Username</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">Joined</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_tourists.map((t: any, i: number) => (
                  <tr key={i} className="border-b border-gray-50 dark:border-white/5 hover:bg-gray-50/50 dark:hover:bg-white/[0.02]">
                    <td className="px-6 py-3 font-medium text-gray-900 dark:text-white">{t.first_name} {t.last_name}</td>
                    <td className="px-6 py-3 text-gray-500">{t.username}</td>
                    <td className="px-6 py-3 text-gray-400">{new Date(t.date_joined).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10">
            <Users className="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No registrations yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TourismDashboard;
