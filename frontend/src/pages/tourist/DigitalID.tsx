import React, { useEffect, useState } from 'react';
import { touristAPI } from '../../services/api';
import { DigitalTouristID as DigitalIDType } from '../../types';
import { Shield, Download, QrCode, CheckCircle, XCircle, Clock } from 'lucide-react';

const DigitalID: React.FC = () => {
  const [digitalId, setDigitalId] = useState<DigitalIDType | null>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [idRes, qrBlob] = await Promise.all([
          touristAPI.getDigitalID(),
          touristAPI.generateQR(),
        ]);
        setDigitalId(idRes.data);
        setQrUrl(URL.createObjectURL(qrBlob));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
    return () => { if (qrUrl) URL.revokeObjectURL(qrUrl); };
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-500 border-t-transparent" />
    </div>
  );

  const statusConfig: Record<string, { icon: React.ReactNode; class: string; label: string }> = {
    active: { icon: <CheckCircle className="w-4 h-4" />, class: 'badge-green', label: 'Active' },
    pending: { icon: <Clock className="w-4 h-4" />, class: 'badge-yellow', label: 'Pending' },
    suspended: { icon: <XCircle className="w-4 h-4" />, class: 'badge-red', label: 'Suspended' },
    expired: { icon: <XCircle className="w-4 h-4" />, class: 'badge-gray', label: 'Expired' },
  };

  const status = statusConfig[digitalId?.status || 'pending'] || statusConfig.pending;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Digital Tourist ID</h1>
        <p className="text-sm text-gray-500 mt-0.5">Your official digital identification card</p>
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-md">
              {digitalId?.tourist_name?.charAt(0) || 'U'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{digitalId?.tourist_name}</h2>
              <p className="text-sm text-gray-500">{digitalId?.nationality || 'Nationality not set'}</p>
            </div>
          </div>
          <span className={`badge flex items-center gap-1 ${status.class}`}>
            {status.icon} {status.label}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">Unique ID</p>
            <p className="font-mono font-semibold text-gray-900 dark:text-white mt-0.5">{digitalId?.unique_id}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">Destination</p>
            <p className="font-medium text-gray-900 dark:text-white mt-0.5">{digitalId?.destination || 'Not set'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">Emergency Contact</p>
            <p className="font-medium text-gray-900 dark:text-white mt-0.5">{digitalId?.emergency_contact || 'Not set'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">Issued</p>
            <p className="font-medium text-gray-900 dark:text-white mt-0.5">
              {digitalId?.issued_at ? new Date(digitalId.issued_at).toLocaleDateString() : '--'}
            </p>
          </div>
        </div>

        {qrUrl && (
          <div className="flex flex-col items-center p-6 bg-gray-50 dark:bg-white/5 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <QrCode className="w-4 h-4" /> Verification QR Code
            </p>
            <img src={qrUrl} alt="QR Code" className="w-48 h-48 rounded-xl shadow-sm" />
            <p className="text-xs text-gray-400 mt-3">Show this to authorities for identity verification</p>
          </div>
        )}

        <div className="mt-4">
          <button onClick={() => touristAPI.generateQR().then((res) => {
            const url = URL.createObjectURL(res.data);
            const a = document.createElement('a');
            a.href = url;
            a.download = `safevoyage_id_${digitalId?.unique_id}.png`;
            a.click();
          })} className="btn-outline w-full flex items-center justify-center gap-2">
            <Download className="w-4 h-4" /> Download QR Code
          </button>
        </div>
      </div>

      <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-100 dark:border-blue-900/30">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900 dark:text-blue-300">Authorized Verification</p>
            <p className="text-xs text-blue-700/70 dark:text-blue-400/70 mt-0.5">
              This Digital Tourist ID can be verified by police and tourism department officials using the QR code scanner.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DigitalID;
