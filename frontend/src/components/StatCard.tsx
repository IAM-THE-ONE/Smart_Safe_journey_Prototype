import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
  change?: string;
  subtitle?: string;
}

const colorMap: Record<string, { bg: string; icon: string; ring: string }> = {
  blue: { bg: 'from-blue-50 to-blue-100/50 dark:from-blue-900/10 dark:to-blue-800/5', icon: 'text-blue-600 dark:text-blue-400', ring: 'ring-blue-500/20' },
  red: { bg: 'from-red-50 to-red-100/50 dark:from-red-900/10 dark:to-red-800/5', icon: 'text-red-600 dark:text-red-400', ring: 'ring-red-500/20' },
  green: { bg: 'from-green-50 to-green-100/50 dark:from-green-900/10 dark:to-green-800/5', icon: 'text-green-600 dark:text-green-400', ring: 'ring-green-500/20' },
  yellow: { bg: 'from-amber-50 to-amber-100/50 dark:from-amber-900/10 dark:to-amber-800/5', icon: 'text-amber-600 dark:text-amber-400', ring: 'ring-amber-500/20' },
  purple: { bg: 'from-purple-50 to-purple-100/50 dark:from-purple-900/10 dark:to-purple-800/5', icon: 'text-purple-600 dark:text-purple-400', ring: 'ring-purple-500/20' },
};

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color = 'blue', change, subtitle }) => {
  const c = colorMap[color] || colorMap.blue;

  return (
    <div className="card-hover group relative overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${c.bg} opacity-50`} />
      <div className="relative flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white tabular-nums">{value}</p>
          {change && <p className="text-xs font-medium text-green-600 dark:text-green-400 flex items-center gap-1">↑ {change}</p>}
          {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
        </div>
        <div className={`p-3.5 rounded-2xl bg-white/80 dark:bg-gray-800/60 ring-1 ${c.ring} shadow-sm ${c.icon}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
