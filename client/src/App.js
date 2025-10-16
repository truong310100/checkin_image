import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MsalProvider } from '@azure/msal-react';
import { PublicClientApplication } from '@azure/msal-browser';
import { msalConfig } from './utils/azure';

// User Components
import UserCheckin from './components/user/UserCheckin';

// Admin Components
import AdminLogin from './components/admin/AdminLogin';
import AdminLayout from './components/admin/AdminLayout';
import ProtectedRoute from './components/admin/ProtectedRoute';
import Register from './components/Register';
import History from './components/History';
import UserHistory from './components/UserHistory';

import './App.css';

const msalInstance = new PublicClientApplication(msalConfig);

function App() {
  return (
    <MsalProvider instance={msalInstance}>
      <Router>
        <div className="App">
          <Routes>
            {/* User Routes - Public */}
            <Route path="/" element={<UserCheckin />} />
            
            {/* Admin Routes - Protected */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLogin />} />
            
            <Route path="/admin/register" element={
              <ProtectedRoute>
                <AdminLayout>
                  <Register />
                </AdminLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/history" element={
              <ProtectedRoute>
                <AdminLayout>
                  <History />
                </AdminLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/admin/user-history/:userId" element={
              <ProtectedRoute>
                <AdminLayout>
                  <UserHistory />
                </AdminLayout>
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </MsalProvider>
  );
}

export default App;
