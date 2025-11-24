// File: frontend/src/App.jsx

import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashBoard';
import FinancialDashboard from './pages/FinancialDashboard';
import RentPaymentTracking from './pages/RentPaymentTracking';
import Navbar from './components/Navbar'; // 1. Import our new Navbar
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute'; // 1. Import our bouncer
import BuildingDetailsPage from './pages/admin/BuildingDetailsPage'; // 1. Import
import HistoryPage from './pages/HistoryPage'; // 1. Import
import PublicRoute from './components/PublicRoute'; // 1. Import PublicRoute

function App() {
  return (
    <>
      {/* 2. Add the Navbar here, *outside* the Routes */}
      <Navbar />

      <main style={{ padding: '0' }}> {/* Removed padding for full-width pages */}
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              // 2. Wrap the page in our bouncer
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/financials"
            element={
              <ProtectedRoute>
                <FinancialDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/building/:id"
            element={
              <ProtectedRoute>
                <BuildingDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payments"
            element={
              <ProtectedRoute>
                <RentPaymentTracking />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <HistoryPage />
              </ProtectedRoute>
            }
          />

          {/* We still need to create these! */}
          {/* <Route path="/" element={<HomePage />} /> */}
        </Routes>
      </main>
    </>
  );
}

export default App;