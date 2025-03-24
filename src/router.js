import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './services/ProtectedRoute';
import { useAuth } from './services/UserContext';

// Lazy load components for better performance
const Login = React.lazy(() => import('./scenes/Login'));
const Dashboard = React.lazy(() => import('./scenes/Dashboard'));
const Clients = React.lazy(() => import('./scenes/Clients'));
const AddToDatabase = React.lazy(() => import('./scenes/AddToDatabase'));
const GrowthTracker = React.lazy(() => import('./scenes/GrowthTracker'));
const Referrer = React.lazy(() => import('./scenes/Referrer'));
const Reports = React.lazy(() => import('./scenes/GenerateGLT'));
const Unauthorized = React.lazy(() => import('./scenes/Unauthorized')); // For unauthorized users
const Referrals = React.lazy(() => import('./scenes/ReferralCode'));
const GrowthDashboard = React.lazy(() => import('./scenes/GrowthDashboard')); // New GrowthDashboard
const Duplicates = React.lazy(() => import('./scenes/Redownload')); 
const BulkUpdate = React.lazy(() => import('./scenes/BulkUpdate')); // New BulkUpdate

const RouterConfig = () => {
  const { isLoggedIn, userRole } = useAuth();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn} userRole={userRole} allowedRoles={['admin', 'franchise', 'referrer']}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/clients"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn} userRole={userRole} allowedRoles={['admin', 'franchise']}>
              <Clients />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-to-database"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn} userRole={userRole} allowedRoles={['admin']}>
              <AddToDatabase />
            </ProtectedRoute>
          }
        />
        <Route
          path="/growth-tracker"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn} userRole={userRole} allowedRoles={['admin', 'franchise']}>
              <GrowthTracker />
            </ProtectedRoute>
          }
        />
        <Route
          path="/referrals"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn} userRole={userRole} allowedRoles={['admin']}>
              <Referrals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn} userRole={userRole} allowedRoles={['admin']}>
              <Reports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/growth-dashboard"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn} userRole={userRole} allowedRoles={['admin', 'franchise']}>
              <GrowthDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/duplicates"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn} userRole={userRole} allowedRoles={['admin', 'franchise']}>
              <Duplicates />
            </ProtectedRoute>
          }
        />
        <Route
          path="/bulk-update"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn} userRole={userRole} allowedRoles={['admin']}>
              <BulkUpdate />
            </ProtectedRoute>
          }
        />
        
        {/* Unauthorized Route */}
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Catch-All Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default RouterConfig;
