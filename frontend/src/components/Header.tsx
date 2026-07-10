import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Bell, Moon, Sun, Search, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mapAPI } from '../services/api';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<any[]>([]);
  const [showSearch, setShowSearch] = React.useState(false);

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (q.length < 2) { setSearchResults([]); return; }
    try {
      const res = await mapAPI.search(q);
      const results = [...(res.data.tourists || []), ...(res.data.incidents || []), ...(res.data.zones || [])];
      setSearchResults(results);
    } catch { setSearchResults([]); }
  };

  const initials = (user?.first_name?.charAt(0) || user?.username?.charAt(0) || 'U').toUpperCase();

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-100 dark:border-white/5 px-6 py-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tourists, incidents, zones..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => setShowSearch(true)}
              onBlur={() => setTimeout(() => setShowSearch(false), 200)}
              className="input-field pl-10 py-2 text-sm"
            />
            {showSearch && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl z-50 max-h-72 overflow-y-auto">
                {searchResults.slice(0, 8).map((r: any, i: number) => (
                  <div key={i} className="px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer border-b border-gray-50 dark:border-gray-700/30 last:border-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{r.name || r.title || r.ticket_id}</p>
                    <p className="text-xs text-gray-400 capitalize">{r.role || r.status || r.zone_type}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button onClick={toggle} className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all" title="Toggle theme">
            {dark ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
          </button>
          <button onClick={() => navigate('/notifications')} className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all relative" title="Notifications">
            <Bell className="w-[18px] h-[18px]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-900" />
          </button>
          <div className="flex items-center gap-2.5 pl-3 ml-1 border-l border-gray-100 dark:border-white/5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {initials}
            </div>
            <div className="hidden sm:block min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[120px]">{user?.first_name} {user?.last_name}</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 capitalize truncate">{user?.role?.replace('_', ' ')}</p>
            </div>
            <button onClick={logout} className="hidden md:flex p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 text-gray-400 hover:text-red-500 transition-all" title="Logout">
              <LogOut className="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
