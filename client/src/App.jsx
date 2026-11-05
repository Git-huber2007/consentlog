import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';

import AppLayout from './components/AppLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserDashboardPage from './pages/UserDashboardPage';
import PreferenceCentrePage from './pages/PreferenceCentrePage';
import ConsentHistoryPage from './pages/ConsentHistoryPage';
import AuditEventDetailsPage from './pages/AuditEventDetailsPage';
import PrivacyNoticeCentrePage from './pages/PrivacyNoticeCentrePage';
import VersionComparisonPage from './pages/VersionComparisonPage';
import ProfileSettingsPage from './pages/ProfileSettingsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import UserManagementPage from './pages/UserManagementPage';
import AuditIntegrityPage from './pages/AuditIntegrityPage';
import PrivacyNoticeAdminPage from './pages/PrivacyNoticeAdminPage';
import BannerSimulatorPage from './pages/BannerSimulatorPage';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] dark:bg-[#09090B] text-zinc-500 text-xs font-mono">
        Initializing session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const App = () => {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Pages */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Authenticated Enterprise Shell */}
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/dashboard" element={<UserDashboardPage />} />
                <Route path="/preferences" element={<PreferenceCentrePage />} />
                <Route path="/audit-history" element={<ConsentHistoryPage />} />
                <Route path="/audit-history/:id" element={<AuditEventDetailsPage />} />
                <Route path="/notices" element={<PrivacyNoticeCentrePage />} />
                <Route path="/notices/compare" element={<VersionComparisonPage />} />
                <Route path="/simulator" element={<BannerSimulatorPage />} />
                <Route path="/profile" element={<ProfileSettingsPage />} />

                {/* Admin-Only Pages */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute adminOnly>
                      <UserManagementPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/integrity"
                  element={
                    <ProtectedRoute adminOnly>
                      <AuditIntegrityPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/notices"
                  element={
                    <ProtectedRoute adminOnly>
                      <PrivacyNoticeAdminPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/simulator"
                  element={
                    <ProtectedRoute adminOnly>
                      <BannerSimulatorPage />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
};

export default App;
