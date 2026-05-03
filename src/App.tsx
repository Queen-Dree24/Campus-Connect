/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Dashboard from './components/Dashboard';
import ClassList from './components/ClassList';
import ClassDetail from './components/ClassDetail';
import AssignmentList from './components/AssignmentList';
import EventList from './components/EventList';
import StudyHub from './components/StudyHub';
import Journal from './components/Journal';
import SchoolInfo from './components/SchoolInfo';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LandingPage from './components/LandingPage';
import NotificationManager from './components/NotificationManager';
import AdminSeeder from './components/AdminSeeder';
import { motion, AnimatePresence } from 'motion/react';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-zinc-50">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900" id="loading-spinner"></div>
    </div>
  );
  
  if (!user) return <Navigate to="/welcome" />;
  
  return <>{children}</>;
}

function AppContent() {
  const { user } = useAuth();

  return (
    <div className="flex h-screen bg-zinc-50 overflow-hidden font-sans text-zinc-900">
      {user && <Sidebar />}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {user && <Navbar />}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/welcome" element={<LandingPage />} />
              <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/classes" element={<PrivateRoute><ClassList /></PrivateRoute>} />
              <Route path="/classes/:classId" element={<PrivateRoute><ClassDetail /></PrivateRoute>} />
              <Route path="/assignments" element={<PrivateRoute><AssignmentList /></PrivateRoute>} />
              <Route path="/events" element={<PrivateRoute><EventList /></PrivateRoute>} />
              <Route path="/study-hub" element={<PrivateRoute><StudyHub /></PrivateRoute>} />
              <Route path="/journal" element={<PrivateRoute><Journal /></PrivateRoute>} />
              <Route path="/school" element={<PrivateRoute><SchoolInfo /></PrivateRoute>} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
      {user && <NotificationManager />}
      <AdminSeeder />
    </div>
  );
}
export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
