import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, MapPin, AlertTriangle, MessageSquare,
  Bell, User, Shield, FileText, Users, Activity,
  Menu, X, LogOut, ShieldAlert, ChevronLeft, ChevronRight,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/:role-dashboard', roles: ['tourist', 'police', 'tourism_dept', 'admin'] },
  { label: 'Map View', icon: MapPin, path: '/map', roles: ['tourist', 'police', 'tourism_dept', 'admin'] },
  { label: 'AI Assistant', icon: MessageSquare, path: '/ai-assistant', roles: ['tourist', 'police', 'tourism_dept', 'admin'] },
  { label: 'Notifications', icon: Bell, path: '/notifications', roles: ['tourist', 'police', 'tourism_dept', 'admin'] },
  { label: 'Profile', icon: User, path: '/tourist/profile', roles: ['tourist'] },
  { label: 'Digital ID', icon: Shield, path: '/tourist/digital-id', roles: ['tourist'] },
  { label: 'Report Incident', icon: AlertTriangle, path: '/tourist/incident-report', roles: ['tourist'] },
  { label: 'SOS', icon: ShieldAlert, path: '/tourist/sos', roles: ['tourist'] },
  { label: 'Trip History', icon: FileText, path: '/tourist/trip-history', roles: ['tourist'] },
  { label: 'Incidents', icon: AlertTriangle, path: '/incidents', roles: ['police', 'tourism_dept', 'admin'] },
  { label: 'Users', icon: Users, path: '/users', roles: ['admin'] },
  { label: 'Analytics', icon: Activity, path: '/analytics', roles: ['admin', 'tourism_dept'] },
];

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const role = user?.role || 'tourist';
  const filtered = navItems.filter((item) => item.roles.includes(role));

  const resolvedPath = (path: string) => path.replace('/:role-dashboard', `/${role}-dashboard`);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
      isActive
        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-600/20'
        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
    }`;

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className={`p-4 border-b border-gray-100 dark:border-white/5 ${collapsed ? 'text-center' : ''}`}>
        <div className="flex items-center gap-3">
          <div className={`flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md ${collapsed ? 'mx-auto' : ''}`}>
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">SafeVoyage</h1>
              <p className="text-[10px] font-medium text-blue-600 dark:text-blue-400 uppercase tracking-widest">AI Platform</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {filtered.map((item) => (
          <NavLink key={item.path} to={resolvedPath(item.path)} className={linkClass} onClick={() => setMobileOpen(false)} title={collapsed ? item.label : undefined}>
            <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-gray-100 dark:border-white/5 space-y-1">
        {!collapsed && user && (
          <div className="px-3 py-2 mb-1">
            <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{user.first_name || user.username}</p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 capitalize truncate">{user.role.replace('_', ' ')}</p>
          </div>
        )}
        <button onClick={logout} className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all duration-150">
          <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button onClick={() => setMobileOpen(true)} className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
        <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 bg-white dark:bg-gray-900 shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}

      <aside className={`hidden lg:flex flex-col bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-white/5 transition-all duration-300 ${collapsed ? 'w-[68px]' : 'w-64'}`}>
        <button onClick={() => setCollapsed(!collapsed)} className="flex items-center justify-center h-10 border-b border-gray-100 dark:border-white/5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;
