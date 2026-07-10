import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import TouristDashboard from './pages/tourist/TouristDashboard';
import PoliceDashboard from './pages/police/PoliceDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import TourismDashboard from './pages/tourism/TourismDashboard';
import TouristProfile from './pages/tourist/TouristProfile';
import IncidentReport from './pages/tourist/IncidentReport';
import DigitalID from './pages/tourist/DigitalID';
import SOSButton from './pages/tourist/SOSButton';
import TripHistory from './pages/tourist/TripHistory';
import MapView from './pages/MapView';
import AIAssistant from './pages/AIAssistant';
import Notifications from './pages/Notifications';

const ProtectedRoute: React.FC<{ children: React.ReactNode; roles?: string[] }> = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to={`/${user.role}-dashboard`} />;
  return <>{children}</>;
};

const DashboardRedirect: React.FC = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>;
  if (!user) return <Navigate to="/login" />;
  return <Navigate to={`/${user.role}-dashboard`} />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ErrorBoundary>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:userId/:token" element={<ResetPassword />} />
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<DashboardRedirect />} />
              <Route path="tourist-dashboard" element={<TouristDashboard />} />
              <Route path="police-dashboard" element={<ProtectedRoute roles={['police', 'admin']}><PoliceDashboard /></ProtectedRoute>} />
              <Route path="admin-dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
              <Route path="tourism-dashboard" element={<ProtectedRoute roles={['tourism_dept', 'admin']}><TourismDashboard /></ProtectedRoute>} />
              <Route path="tourist/profile" element={<TouristProfile />} />
              <Route path="tourist/incident-report" element={<IncidentReport />} />
              <Route path="tourist/digital-id" element={<DigitalID />} />
              <Route path="tourist/sos" element={<SOSButton />} />
              <Route path="tourist/trip-history" element={<TripHistory />} />
              <Route path="map" element={<MapView />} />
              <Route path="ai-assistant" element={<AIAssistant />} />
              <Route path="notifications" element={<Notifications />} />
            </Route>
          </Routes>
        </Router>
        </ErrorBoundary>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
