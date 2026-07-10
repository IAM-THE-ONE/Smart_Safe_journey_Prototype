export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: 'tourist' | 'police' | 'tourism_dept' | 'admin';
  photo: string | null;
  is_online: boolean;
  last_latitude: number | null;
  last_longitude: number | null;
  email_verified: boolean;
  date_joined: string;
}

export interface TouristProfile {
  id: number;
  user: User;
  nationality: string;
  date_of_birth: string | null;
  passport_number: string;
  aadhaar_number: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relation: string;
  emergency_contact_email: string;
  destination: string;
  trip_start_date: string | null;
  trip_end_date: string | null;
  is_on_trip: boolean;
  share_live_location: boolean;
  emergency_contacts: EmergencyContact[];
  safety_score?: number;
}

export interface DigitalTouristID {
  id: number;
  tourist: number;
  tourist_name: string;
  nationality: string;
  unique_id: string;
  qr_code: string | null;
  is_verified: boolean;
  status: string;
  issued_at: string;
  expires_at: string;
  photo: string | null;
  emergency_contact: string;
  destination: string;
}

export interface EmergencyContact {
  id: number;
  tourist: number;
  name: string;
  phone: string;
  relation: string;
  email: string;
  is_primary: boolean;
}

export interface Incident {
  id: number;
  ticket_id: string;
  reporter: number;
  reporter_details: User;
  category: number | null;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  status: 'reported' | 'acknowledged' | 'in_progress' | 'resolved' | 'closed';
  assigned_to: number | null;
  photo: string | null;
  video: string | null;
  resolved_at: string | null;
  resolution_notes: string;
  created_at: string;
  updated_at: string;
}

export interface IncidentCategory {
  id: number;
  name: string;
  icon: string;
  is_active: boolean;
}

export interface SOSAlert {
  id: number;
  tourist: number;
  tourist_details: User;
  latitude: number;
  longitude: number;
  message: string;
  is_active: boolean;
  responded_by: number | null;
  responded_at: string | null;
  created_at: string;
}

export interface Zone {
  id: number;
  name: string;
  zone_type: 'safe' | 'restricted' | 'high_risk';
  latitude: number;
  longitude: number;
  radius: number;
  description: string;
  is_active: boolean;
  created_at: string;
}

export interface ZoneAlert {
  id: number;
  tourist: number;
  zone: number;
  zone_name: string;
  zone_type: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface Notification {
  id: number;
  recipient: number;
  notification_type: string;
  title: string;
  message: string;
  data: any;
  is_read: boolean;
  created_at: string;
}

export interface RiskAnalysis {
  safety_score: number;
  risk_level: 'safe' | 'moderate' | 'danger' | 'critical';
  risk_factors: string[];
  recommendation: string;
  ai_explanation: string;
}

export interface DashboardStats {
  registered_tourists?: number;
  active_trips?: number;
  incidents_today?: number;
  pending_cases?: number;
  high_risk_alerts?: number;
  police_online?: number;
  active_sos?: number;
  total_zones?: number;
  recent_incidents?: any[];
  incident_by_type?: any[];
  monthly_reports?: any[];
  total_incidents?: number;
  open_incidents?: number;
  total_sos?: number;
  unread_alerts?: number;
  safety_score?: number;
  on_trip?: boolean;
  current_trip?: any;
  total_tourists?: number;
  pending_verifications?: number;
  assigned_incidents?: number;
  resolved_incidents?: number;
  pending_incidents?: number;
  nearby_sos?: number;
  my_cases?: any[];
}

export interface MapData {
  tourists: MapTourist[];
  police: MapPolice[];
  incidents: MapIncident[];
  zones: MapZone[];
}

export interface MapTourist {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  photo: string | null;
  destination: string;
  safety_score: number;
}

export interface MapPolice {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  phone: string;
}

export interface MapIncident {
  id: number;
  ticket_id: string;
  title: string;
  latitude: number;
  longitude: number;
  severity: string;
  status: string;
}

export interface MapZone {
  id: number;
  name: string;
  zone_type: string;
  latitude: number;
  longitude: number;
  radius: number;
}
