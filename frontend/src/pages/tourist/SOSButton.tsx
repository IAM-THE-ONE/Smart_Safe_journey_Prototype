import React, { useState, useEffect } from 'react';
import { incidentAPI } from '../../services/api';
import { ShieldAlert, MapPin, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const SOSButton: React.FC = () => {
  const [lat, setLat] = useState(0);
  const [lng, setLng] = useState(0);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sosHistory, setSosHistory] = useState<any[]>([]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
      });
    }
    incidentAPI.getSOSList().then((res) => setSosHistory(res.data.filter((s: any) => !s.is_active))).catch(() => {});
  }, []);

  const handleSOS = async () => {
    setSending(true);
    try {
      await incidentAPI.createSOS({ latitude: lat, longitude: lng, message });
      setSent(true);
      setTimeout(() => setSent(false), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Emergency SOS</h1>
        <p className="text-sm text-gray-500 mt-0.5">Press the button to send an immediate alert to authorities</p>
      </div>

      {sent && (
        <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 p-4 rounded-xl">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-medium">SOS Alert Sent Successfully!</p>
            <p className="text-sm opacity-80">Authorities have been notified of your location.</p>
          </div>
        </div>
      )}

      <div className="flex justify-center py-6">
        <button
          onClick={handleSOS}
          disabled={sending}
          className="relative w-56 h-56 rounded-full bg-gradient-to-br from-red-500 to-red-700 text-white flex flex-col items-center justify-center shadow-2xl hover:shadow-red-500/40 hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <div className="absolute inset-0 rounded-full animate-ping bg-red-500 opacity-20" />
          <div className="absolute inset-2 rounded-full border-4 border-red-300/30" />
          <ShieldAlert className="w-14 h-14 mb-2 relative z-10" />
          <span className="text-3xl font-black tracking-wider relative z-10">{sending ? '...' : 'SOS'}</span>
          <span className="text-xs opacity-80 mt-1 relative z-10">Tap to send alert</span>
        </button>
      </div>

      <div className="card space-y-4">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          Current Location
        </h3>
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 dark:bg-white/5 rounded-xl px-4 py-2.5">
          <MapPin className="w-4 h-4 text-red-500" />
          <code className="font-mono">{lat.toFixed(6)}, {lng.toFixed(6)}</code>
        </div>
        <textarea
          placeholder="Additional message (optional) – describe your emergency..."
          className="input-field"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button onClick={handleSOS} disabled={sending} className="btn-danger w-full py-3">
          <ShieldAlert className="w-4 h-4" />
          {sending ? 'Sending SOS...' : 'Send Emergency SOS'}
        </button>
      </div>

      {sosHistory.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-gray-400" />
            Previous SOS Alerts
          </h3>
          <div className="space-y-2">
            {sosHistory.slice(0, 5).map((sos: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      SOS sent on {new Date(sos.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-400">
                      at {sos.latitude.toFixed(4)}, {sos.longitude.toFixed(4)}
                    </p>
                  </div>
                </div>
                <span className="badge-green text-xs">Resolved</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SOSButton;
