import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';

// Public Pages
import HomePage from './pages/public/HomePage';
import AboutPage from './pages/public/AboutPage';
import ServicesPage from './pages/public/ServicesPage';
import ServiceDetailsPage from './pages/public/ServiceDetailsPage';
import PricingPage from './pages/public/PricingPage';
import PortfolioPage from './pages/public/PortfolioPage';
import ContactPage from './pages/public/ContactPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';

// Customer Portal Pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import NewRequestPage from './pages/customer/NewRequestPage';
import MyRequestsPage from './pages/customer/MyRequestsPage';
import MyQuotationsPage from './pages/customer/MyQuotationsPage';
import MyProjectsPage from './pages/customer/MyProjectsPage';
import CustomerPaymentsPage from './pages/customer/CustomerPaymentsPage';
import CustomerMessagesPage from './pages/customer/CustomerMessagesPage';

// Admin Control Center Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminRequestsPage from './pages/admin/AdminRequestsPage';
import AdminQuotationsPage from './pages/admin/AdminQuotationsPage';
import AdminProjectsPage from './pages/admin/AdminProjectsPage';
import AdminPaymentsPage from './pages/admin/AdminPaymentsPage';
import AdminMessagesPage from './pages/admin/AdminMessagesPage';
import AdminServicesPage from './pages/admin/AdminServicesPage';
import AdminCustomersPage from './pages/admin/AdminCustomersPage';

const App = () => {
  return (
    <AuthProvider>
      <Router>
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
      </Router>
    </AuthProvider>
  );
};

export default App;
