import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ToastContainer } from 'react-toastify'
import ProtectedRoute from './components/common/ProtectedRoute'

// Auth Components
import Login from './components/auth/Login'
import OTPVerification from './components/auth/OTPVerification'

// Admin Components
import AdminDashboard from './components/admin/Dashboard'
import EmployeeManagement from './components/admin/EmployeeManagement'
import AccessRequests from './components/admin/AccessRequests'
import FileAccessLogs from './components/admin/FileAccessLogs'
import SecurityAlerts from './components/admin/SecurityAlerts'
import AdminSettings from './components/admin/Settings'
import FileEncryption from './components/admin/FileEncryption'

// Employee Components
import EmployeeDashboard from './components/employee/Dashboard'
import FileBrowser from './components/employee/FileBrowser'
import RequestRemoteAccess from './components/employee/RequestRemoteAccess'
import EmployeeProfile from './components/employee/Profile'

// Layout
import MainLayout from './components/common/MainLayout'

const App: React.FC = () => {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
        
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/verify-otp" element={<OTPVerification />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <MainLayout>
                <AdminDashboard />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin/employees" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <MainLayout>
                <EmployeeManagement />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin/requests" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <MainLayout>
                <AccessRequests />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin/logs" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <MainLayout>
                <FileAccessLogs />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin/alerts" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <MainLayout>
                <SecurityAlerts />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin/settings" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <MainLayout>
                <AdminSettings />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/admin/encryption" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <MainLayout>
                <FileEncryption />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          {/* Employee Routes */}
          <Route path="/employee" element={
            <ProtectedRoute allowedRoles={['employee']}>
              <MainLayout>
                <EmployeeDashboard />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/employee/files" element={
            <ProtectedRoute allowedRoles={['employee']}>
              <MainLayout>
                <FileBrowser />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/employee/request-access" element={
            <ProtectedRoute allowedRoles={['employee']}>
              <MainLayout>
                <RequestRemoteAccess />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/employee/profile" element={
            <ProtectedRoute allowedRoles={['employee']}>
              <MainLayout>
                <EmployeeProfile />
              </MainLayout>
            </ProtectedRoute>
          } />
          
          {/* Default Route */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* 404 Route */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-800">404</h1>
                <p className="text-xl text-gray-600 mt-4">Page not found</p>
                <a href="/" className="mt-6 inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
                  Go to Login
                </a>
              </div>
            </div>
          } />
        </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  )
}

export default App