import React, { useEffect, useState } from 'react';
import { touristAPI } from '../../services/api';
import { TouristProfile as TouristProfileType } from '../../types';
import { User, Phone, MapPin, Calendar, Shield, Globe, FileText, Plane, Heart, Check, X } from 'lucide-react';

const TouristProfile: React.FC = () => {
  const [profile, setProfile] = useState<TouristProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await touristAPI.getProfile();
        setProfile(res.data);
        setForm(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await touristAPI.updateProfile(form);
      setProfile(res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-500 border-t-transparent" />
    </div>
  );

  const fields = [
    { key: 'nationality', label: 'Nationality', icon: Globe },
    { key: 'date_of_birth', label: 'Date of Birth', icon: Calendar, type: 'date' },
    { key: 'passport_number', label: 'Passport Number', icon: FileText },
    { key: 'aadhaar_number', label: 'Aadhaar Number', icon: FileText },
    { key: 'destination', label: 'Destination', icon: MapPin },
  ];

  const emergencyFields = [
    { key: 'emergency_contact_name', label: 'Contact Name', icon: User },
    { key: 'emergency_contact_phone', label: 'Contact Phone', icon: Phone, type: 'tel' },
    { key: 'emergency_contact_relation', label: 'Relation', icon: Heart },
  ];

  const tripFields = [
    { key: 'trip_start_date', label: 'Start Date', icon: Calendar, type: 'date' },
    { key: 'trip_end_date', label: 'End Date', icon: Calendar, type: 'date' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tourist Profile</h1>

      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold ring-4 ring-white/30">
            {profile?.user?.first_name?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-semibold">{profile?.user?.first_name} {profile?.user?.last_name}</h2>
            <p className="text-blue-100 text-sm">{profile?.user?.email}</p>
            <div className="flex gap-2 mt-2">
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs">
                Safety Score: {profile?.safety_score ?? '-'}
              </span>
              {profile?.is_on_trip && (
                <span className="px-2.5 py-0.5 rounded-full bg-green-400/30 text-xs flex items-center gap-1">
                  <Check className="w-3 h-3" /> On Trip
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" /> Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map((f) => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <f.icon className="w-3.5 h-3.5 text-gray-400" /> {f.label}
                </label>
                <input type={f.type || 'text'} className="input-field" value={form[f.key] || ''}
                  onChange={(e) => setForm({...form, [f.key]: e.target.value})} />
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-500" /> Emergency Contact
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {emergencyFields.map((f) => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <f.icon className="w-3.5 h-3.5 text-gray-400" /> {f.label}
                </label>
                <input type={f.type || 'text'} className="input-field" value={form[f.key] || ''}
                  onChange={(e) => setForm({...form, [f.key]: e.target.value})} />
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Plane className="w-4 h-4 text-indigo-600" /> Trip Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tripFields.map((f) => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <f.icon className="w-3.5 h-3.5 text-gray-400" /> {f.label}
                </label>
                <input type={f.type || 'text'} className="input-field" value={form[f.key] || ''}
                  onChange={(e) => setForm({...form, [f.key]: e.target.value})} />
              </div>
            ))}
          </div>
          <div className="flex items-center gap-6 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/50">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_on_trip || false} onChange={(e) => setForm({...form, is_on_trip: e.target.checked})}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Currently on trip</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.share_live_location || false} onChange={(e) => setForm({...form, share_live_location: e.target.checked})}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Share live location</span>
            </label>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
          {saved && (
            <span className="text-sm text-green-600 flex items-center gap-1">
              <Check className="w-4 h-4" /> Profile saved successfully
            </span>
          )}
        </div>
      </form>
    </div>
  );
};

export default TouristProfile;
