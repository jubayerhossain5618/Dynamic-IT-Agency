import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './routes/ProtectedRoute';

// Public Pages (Code-Split via React.lazy)
const HomePage = lazy(() => import('./pages/public/HomePage'));
const AboutPage = lazy(() => import('./pages/public/AboutPage'));
const ServicesPage = lazy(() => import('./pages/public/ServicesPage'));
const ServiceDetailsPage = lazy(() => import('./pages/public/ServiceDetailsPage'));
const PricingPage = lazy(() => import('./pages/public/PricingPage'));
const PortfolioPage = lazy(() => import('./pages/public/PortfolioPage'));
const ContactPage = lazy(() => import('./pages/public/ContactPage'));
const LoginPage = lazy(() => import('./pages/public/LoginPage'));
const RegisterPage = lazy(() => import('./pages/public/RegisterPage'));

// Customer Portal Pages
const CustomerDashboard = lazy(() => import('./pages/customer/CustomerDashboard'));
const NewRequestPage = lazy(() => import('./pages/customer/NewRequestPage'));
const MyRequestsPage = lazy(() => import('./pages/customer/MyRequestsPage'));
const MyQuotationsPage = lazy(() => import('./pages/customer/MyQuotationsPage'));
const MyProjectsPage = lazy(() => import('./pages/customer/MyProjectsPage'));
const CustomerPaymentsPage = lazy(() => import('./pages/customer/CustomerPaymentsPage'));
const CustomerMessagesPage = lazy(() => import('./pages/customer/CustomerMessagesPage'));

// Admin Control Center Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminRequestsPage = lazy(() => import('./pages/admin/AdminRequestsPage'));
const AdminQuotationsPage = lazy(() => import('./pages/admin/AdminQuotationsPage'));
const AdminProjectsPage = lazy(() => import('./pages/admin/AdminProjectsPage'));
const AdminPaymentsPage = lazy(() => import('./pages/admin/AdminPaymentsPage'));
const AdminMessagesPage = lazy(() => import('./pages/admin/AdminMessagesPage'));
const AdminServicesPage = lazy(() => import('./pages/admin/AdminServicesPage'));
const AdminCustomersPage = lazy(() => import('./pages/admin/AdminCustomersPage'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
        Loading Dynamic IT...
      </p>
    </div>
  </div>
);

const App = () => {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Agency Website Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/services/:slug" element={<ServiceDetailsPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Customer Portal Routes */}
            <Route
              path="/customer/dashboard"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <CustomerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/requests/new"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <NewRequestPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/requests"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <MyRequestsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/quotations"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <MyQuotationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/projects"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <MyProjectsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/payments"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <CustomerPaymentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/customer/messages"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <CustomerMessagesPage />
                </ProtectedRoute>
              }
            />

            {/* Protected Admin Control Center Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/requests"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminRequestsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/quotations"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminQuotationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/projects"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminProjectsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/payments"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminPaymentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/messages"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminMessagesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/services"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminServicesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/customers"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminCustomersPage />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>
      </SocketProvider>
    </AuthProvider>
  );
};

export default App;
