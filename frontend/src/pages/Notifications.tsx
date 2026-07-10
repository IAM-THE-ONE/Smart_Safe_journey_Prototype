import React, { useEffect, useState } from 'react';
import { notificationAPI } from '../services/api';
import { Notification } from '../types';
import { Bell, CheckCheck, AlertTriangle, MapPin, Shield, MessageSquare, Info } from 'lucide-react';

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await notificationAPI.getNotifications();
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unread_count);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleToggleRead = async (id: number, isRead: boolean) => {
    if (isRead) return;
    try {
      await notificationAPI.markRead(id);
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) { console.error(err); }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) { console.error(err); }
  };

  const getIcon = (type: string) => {
    const icons: Record<string, { icon: React.ReactNode; bg: string }> = {
      trip_alert: { icon: <MapPin className="w-4 h-4" />, bg: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' },
      geo_alert: { icon: <MapPin className="w-4 h-4" />, bg: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' },
      weather_alert: { icon: <AlertTriangle className="w-4 h-4" />, bg: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' },
      sos_alert: { icon: <AlertTriangle className="w-4 h-4" />, bg: 'bg-red-100 dark:bg-red-900/30 text-red-600' },
      incident_update: { icon: <Shield className="w-4 h-4" />, bg: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' },
      admin_announcement: { icon: <Bell className="w-4 h-4" />, bg: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600' },
      safety_tip: { icon: <MessageSquare className="w-4 h-4" />, bg: 'bg-green-100 dark:bg-green-900/30 text-green-600' },
    };
    return icons[type] || { icon: <Info className="w-4 h-4" />, bg: 'bg-gray-100 dark:bg-gray-700 text-gray-600' };
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {unreadCount > 0
              ? <><span className="font-semibold text-blue-600">{unreadCount}</span> unread notifications</>
              : 'No unread notifications'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead} className="btn-outline text-sm">
            <CheckCheck className="w-4 h-4" /> Mark All Read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="card text-center py-16">
          <Bell className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">No notifications yet</p>
          <p className="text-xs text-gray-400 mt-1">Notifications from alerts and updates will appear here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const { icon, bg } = getIcon(n.notification_type);
            return (
              <div key={n.id} className="group relative">
                <div
                  onClick={() => handleToggleRead(n.id, n.is_read)}
                  className={`relative flex gap-3.5 p-4 rounded-xl border transition-all duration-150 cursor-pointer ${
                    n.is_read
                      ? 'bg-white dark:bg-gray-800/50 border-gray-100 dark:border-gray-700/30 opacity-70 hover:opacity-100'
                      : 'bg-gradient-to-r from-blue-50/80 to-white dark:from-blue-950/20 dark:to-gray-800/80 border-blue-100 dark:border-blue-900/40 shadow-sm'
                  }`}
                >
                  {!n.is_read && (
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-500 rounded-full" />
                  )}
                  <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${bg}`}>
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className={`text-sm ${n.is_read ? 'font-normal' : 'font-semibold'} text-gray-900 dark:text-white`}>
                        {n.title}
                      </h3>
                      <span className="flex-shrink-0 text-[11px] text-gray-400 whitespace-nowrap">
                        {new Date(n.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className={`text-sm mt-0.5 ${n.is_read ? 'text-gray-400' : 'text-gray-600 dark:text-gray-400'}`}>
                      {n.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                        {n.notification_type.replace(/_/g, ' ')}
                      </span>
                      {!n.is_read && (
                        <span className="text-[10px] text-blue-600 font-medium">Tap to mark read</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
