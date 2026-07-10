import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const skipAuthRedirect = (url: string = '') =>
  ['/auth/login/', '/auth/register/', '/auth/firebase/', '/auth/token/refresh/', '/auth/logout/']
    .some((path) => url.includes(path));

api.interceptors.response.use(
  (response) => {
    if (response.data && typeof response.data === 'object' && 'results' in response.data && Array.isArray(response.data.results)) {
      return { ...response, data: response.data.results };
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry && !skipAuthRedirect(originalRequest.url)) {
      originalRequest._retry = true;
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        try {
          const res = await axios.post(`${API_BASE}/auth/token/refresh/`, { refresh });
          localStorage.setItem('access_token', res.data.access);
          originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
          return api(originalRequest);
        } catch {
          localStorage.clear();
          window.location.href = '/login';
        }
      } else {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

export const authAPI = {
  register: (data: any) => api.post('/auth/register/', data),
  login: (data: any) => api.post('/auth/login/', data),
  firebaseAuth: (idToken: string) => api.post('/auth/firebase/', { id_token: idToken }),
  googleLogin: (accessToken: string, clientId?: string) => api.post('/auth/google-login/', { id_token: accessToken, client_id: clientId }),
  logout: (refresh?: string) => api.post('/auth/logout/', { refresh }),
  getMe: () => api.get('/auth/me/'),
  updateMe: (data: any) => api.patch('/auth/me/', data),
  changePassword: (data: any) => api.post('/auth/change-password/', data),
  policeList: () => api.get('/auth/police/'),
  updateOnlineStatus: (data: any) => api.post('/auth/online-status/', data),
  forgotPassword: (email: string) => api.post('/auth/forgot-password/', { email }),
  resetPassword: (userId: string, token: string, password: string) =>
    api.post(`/auth/reset-password/${userId}/${token}/`, { password }),
};

export const touristAPI = {
  getProfile: () => api.get('/tourists/profile/'),
  updateProfile: (data: any) => api.patch('/tourists/profile/update/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getDigitalID: () => api.get('/tourists/digital-id/'),
  generateQR: () => api.get('/tourists/generate-qr/', { responseType: 'blob' }),
  verifyQR: (uniqueId: string) => api.post('/tourists/verify-qr/', { unique_id: uniqueId }),
  getEmergencyContacts: () => api.get('/tourists/emergency-contacts/'),
  createEmergencyContact: (data: any) => api.post('/tourists/emergency-contacts/', data),
  updateEmergencyContact: (id: number, data: any) => api.patch(`/tourists/emergency-contacts/${id}/`, data),
  deleteEmergencyContact: (id: number) => api.delete(`/tourists/emergency-contacts/${id}/`),
  getTripHistory: () => api.get('/tourists/trip-history/'),
  createTripHistory: (data: any) => api.post('/tourists/trip-history/', data),
  sendLiveLocation: (data: any) => api.post('/tourists/live-location/', data),
  getAllTourists: () => api.get('/tourists/all/'),
  getTouristDetail: (id: number) => api.get(`/tourists/${id}/`),
  getNearbyTourists: (params: any) => api.get('/tourists/nearby/', { params }),
};

export const incidentAPI = {
  getCategories: () => api.get('/incidents/categories/'),
  getIncidents: () => api.get('/incidents/'),
  createIncident: (data: any) => api.post('/incidents/', data),
  getIncident: (id: number) => api.get(`/incidents/${id}/`),
  updateIncident: (id: number, data: any) => api.patch(`/incidents/${id}/`, data),
  updateStatus: (id: number, data: any) => api.patch(`/incidents/${id}/update-status/`, data),
  getNearbyIncidents: (params: any) => api.get('/incidents/nearby/', { params }),
  createSOS: (data: any) => api.post('/incidents/sos/', data),
  getSOSList: () => api.get('/incidents/sos/list/'),
  respondSOS: (id: number) => api.patch(`/incidents/sos/${id}/respond/`, {}),
};

export const geofencingAPI = {
  getZones: (params?: any) => api.get('/geofencing/zones/', { params }),
  createZone: (data: any) => api.post('/geofencing/zones/', data),
  updateZone: (id: number, data: any) => api.patch(`/geofencing/zones/${id}/`, data),
  deleteZone: (id: number) => api.delete(`/geofencing/zones/${id}/`),
  checkZone: (lat: number, lng: number) => api.post('/geofencing/check/', { latitude: lat, longitude: lng }),
  getAlerts: () => api.get('/geofencing/alerts/'),
  markAlertRead: (id: number) => api.patch(`/geofencing/alerts/${id}/read/`, {}),
};

export const dashboardAPI = {
  getAdmin: () => api.get('/dashboard/admin/'),
  getPolice: () => api.get('/dashboard/police/'),
  getTourism: () => api.get('/dashboard/tourism/'),
  getTourist: () => api.get('/dashboard/tourist/'),
};

export const aiAPI = {
  analyzeRisk: (data: any) => api.post('/ai/risk-analysis/', data),
  getSafetyTips: () => api.get('/ai/safety-tips/'),
  askChatbot: (question: string) => api.post('/ai/chatbot/', { question }),
  getIncidentSummary: (incidentId: number) => api.post('/ai/incident-summary/', { incident_id: incidentId }),
};

export const mapAPI = {
  getMapData: () => api.get('/maps/data/'),
  getNearbyPlaces: (params: any) => api.get('/maps/nearby/', { params }),
  search: (q: string) => api.get('/maps/search/', { params: { q } }),
};

export const notificationAPI = {
  getNotifications: () => api.get('/notifications/'),
  markRead: (id: number) => api.patch(`/notifications/${id}/read/`, {}),
  markAllRead: () => api.post('/notifications/mark-all-read/', {}),
};

export const reportAPI = {
  getIncidentReport: (format?: string) => api.get('/reports/incidents/', { params: { format } }),
  getTouristReport: (format?: string) => api.get('/reports/tourists/', { params: { format } }),
  getMonthlyAnalytics: () => api.get('/reports/monthly/'),
  getSafetyReport: () => api.get('/reports/safety/'),
};
