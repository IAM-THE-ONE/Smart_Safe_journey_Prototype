import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { mapAPI } from '../services/api';
import { MapData } from '../types';
import { MapPin, Shield, ShieldAlert, Users, Navigation, Crosshair, Layers } from 'lucide-react';
import L from 'leaflet';

const customIcon = (color: string) => new L.DivIcon({
  className: 'custom-marker',
  html: `<div style="background:${color};width:24px;height:24px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const MapUpdater: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => { map.setView(center, map.getZoom()); }, [center, map]);
  return null;
};

const MapView: React.FC = () => {
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [center, setCenter] = useState<[number, number]>([20.5937, 78.9629]);
  const [activeLayer, setActiveLayer] = useState<string>('all');
  const [nearby, setNearby] = useState<any>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await mapAPI.getMapData();
        setMapData(res.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetch();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setCenter([pos.coords.latitude, pos.coords.longitude]);
      });
    }
  }, []);

  const handleFindNearby = async () => {
    try {
      const res = await mapAPI.getNearbyPlaces({ latitude: center[0], longitude: center[1], radius: 10 });
      setNearby(res.data);
    } catch (err) { console.error(err); }
  };

  const layers = [
    { id: 'all', label: 'All', icon: Layers },
    { id: 'tourists', label: 'Tourists', icon: Users },
    { id: 'police', label: 'Police', icon: Shield },
    { id: 'incidents', label: 'Incidents', icon: MapPin },
    { id: 'zones', label: 'Zones', icon: ShieldAlert },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-500 border-t-transparent" />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Interactive Map</h1>
          <p className="text-sm text-gray-500 mt-0.5">Real-time locations, zones, and incidents</p>
        </div>
        <button onClick={handleFindNearby} className="btn-primary text-sm">
          <Crosshair className="w-4 h-4" /> Find Nearby
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {layers.map((l) => (
          <button key={l.id} onClick={() => setActiveLayer(l.id)}
            className={`px-3.5 py-2 rounded-xl text-sm font-medium flex items-center gap-1.5 transition-all ${
              activeLayer === l.id
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
            }`}>
            <l.icon className="w-4 h-4" /> {l.label}
          </button>
        ))}
      </div>

      <div className="h-[550px] rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700/50 shadow-sm">
        <MapContainer center={center} zoom={12} className="h-full w-full">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
          <MapUpdater center={center} />

          {(activeLayer === 'all' || activeLayer === 'tourists') && mapData?.tourists.map((t) => (
            <Marker key={`t-${t.id}`} position={[t.latitude, t.longitude]} icon={customIcon('#3b82f6')}>
              <Popup>
                <div className="text-sm min-w-[150px]">
                  <p className="font-semibold text-gray-900">{t.name}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{t.destination}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`badge text-[10px] ${t.safety_score >= 70 ? 'badge-green' : t.safety_score >= 40 ? 'badge-yellow' : 'badge-red'}`}>
                      Score: {t.safety_score}
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {(activeLayer === 'all' || activeLayer === 'police') && mapData?.police.map((p) => (
            <Marker key={`p-${p.id}`} position={[p.latitude, p.longitude]} icon={customIcon('#10b981')}>
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold text-gray-900">{p.name}</p>
                  <p className="text-xs text-gray-500">Police Officer</p>
                  {p.phone && <p className="text-xs text-gray-400 mt-1">{p.phone}</p>}
                </div>
              </Popup>
            </Marker>
          ))}

          {(activeLayer === 'all' || activeLayer === 'incidents') && mapData?.incidents.map((inc) => (
            <Marker key={`i-${inc.id}`} position={[inc.latitude, inc.longitude]}
              icon={customIcon(inc.severity === 'critical' ? '#ef4444' : inc.severity === 'high' ? '#f59e0b' : '#6b7280')}>
              <Popup>
                <div className="text-sm min-w-[160px]">
                  <p className="font-semibold text-gray-900">{inc.title}</p>
                  <p className="text-xs text-gray-400 font-mono">{inc.ticket_id}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`badge text-[10px] ${
                      inc.severity === 'critical' ? 'badge-red' :
                      inc.severity === 'high' ? 'badge-yellow' : 'badge-gray'
                    }`}>{inc.severity}</span>
                    <span className="text-xs text-gray-400 capitalize">{inc.status.replace('_', ' ')}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {(activeLayer === 'all' || activeLayer === 'zones') && mapData?.zones.map((z) => (
            <React.Fragment key={`z-${z.id}`}>
              <Circle center={[z.latitude, z.longitude]} radius={z.radius}
                pathOptions={{ color: z.zone_type === 'safe' ? '#10b981' : z.zone_type === 'restricted' ? '#f59e0b' : '#ef4444', fillOpacity: 0.1, weight: 2 }} />
              <Marker position={[z.latitude, z.longitude]}
                icon={customIcon(z.zone_type === 'safe' ? '#10b981' : z.zone_type === 'restricted' ? '#f59e0b' : '#ef4444')}>
                <Popup>
                  <div className="text-sm">
                    <p className="font-semibold text-gray-900">{z.name}</p>
                    <span className={`badge text-[10px] mt-1 ${
                      z.zone_type === 'safe' ? 'badge-green' :
                      z.zone_type === 'restricted' ? 'badge-yellow' : 'badge-red'
                    }`}>{z.zone_type.replace('_', ' ')} Zone</span>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          ))}
        </MapContainer>
      </div>

      {nearby && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {nearby.police_stations?.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-600" />
                Nearby Police
                <span className="badge text-[10px] badge-green ml-auto">{nearby.police_stations.length}</span>
              </h3>
              <div className="space-y-2">
                {nearby.police_stations.map((p: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-sm px-3 py-2 bg-gray-50 dark:bg-white/5 rounded-lg">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{p.name}</span>
                    <span className="text-gray-400 font-mono text-xs">{p.distance_km} km</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {nearby.hospitals?.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-red-500" />
                Nearby Hospitals
                <span className="badge text-[10px] badge-red ml-auto">{nearby.hospitals.length}</span>
              </h3>
              <div className="space-y-2">
                {nearby.hospitals.map((h: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-sm px-3 py-2 bg-gray-50 dark:bg-white/5 rounded-lg">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{h.name}</span>
                    <span className="text-gray-400 font-mono text-xs">{h.distance_km} km</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MapView;
