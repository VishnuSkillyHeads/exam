import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import MainLayout from './components/Layout/MainLayout';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import Dashboard from './components/Dashboard/Dashboard';
import BatchManagement from './components/Batches/BatchManagement';
import ExamCreation from './components/Exams/ExamCreation';
import FullScreenExam from './components/Exams/FullScreenExam';
import Reports from './components/Reports/Reports';
import MyExams from './components/Exams/MyExams';
import ExamSchedule from './components/Exams/ExamSchedule';
import ExamManagement from './components/Exams/ExamManagement';
import PublishResults from './components/Exams/PublishResults';
import StudentProfile from './components/Student/StudentProfile';
import StudentManagement from './components/Student/StudentManagement';
import Analytics from './components/Analytics/Analytics';
import ExamResult from './components/Exams/ExamResult';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { currentUser, userRole } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      {children}
    </ProtectedRoute>
  );
};

// App Routes Component
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      {/* Protected Routes */}
      <Route path="/" element={<Navigate to="/dashboard" />} />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <MainLayout>
            <Dashboard />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/batches" element={
        <AdminRoute>
          <MainLayout>
            <BatchManagement />
          </MainLayout>
        </AdminRoute>
      } />
      
      <Route path="/exams" element={
        <AdminRoute>
          <MainLayout>
            <ExamCreation />
          </MainLayout>
        </AdminRoute>
      } />
      
      <Route path="/exam/:examId" element={
        <ProtectedRoute>
          <FullScreenExam />
        </ProtectedRoute>
      } />
      
      <Route path="/exam-result/:examId" element={
        <ProtectedRoute>
          <MainLayout>
            <ExamResult />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/admin-result/:examId" element={
        <AdminRoute>
          <MainLayout>
            <ExamResult />
          </MainLayout>
        </AdminRoute>
      } />
      
             <Route path="/exam-management/:examId" element={
         <AdminRoute>
           <MainLayout>
             <ExamManagement />
           </MainLayout>
         </AdminRoute>
       } />
       
       <Route path="/publish-results" element={
         <AdminRoute>
           <MainLayout>
             <PublishResults />
           </MainLayout>
         </AdminRoute>
       } />
      
      <Route path="/reports" element={
        <ProtectedRoute>
          <MainLayout>
            <Reports />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/my-exams" element={
        <ProtectedRoute>
          <MainLayout>
            <MyExams />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/profile" element={
        <ProtectedRoute>
          <MainLayout>
            <StudentProfile />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/students" element={
        <AdminRoute>
          <MainLayout>
            <StudentManagement />
          </MainLayout>
        </AdminRoute>
      } />
      
      <Route path="/schedule" element={
        <ProtectedRoute>
          <MainLayout>
            <ExamSchedule />
          </MainLayout>
        </ProtectedRoute>
      } />
      

      
      <Route path="/analytics" element={
        <ProtectedRoute>
          <MainLayout>
            <Analytics />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/settings" element={
        <AdminRoute>
          <MainLayout>
            <div>Settings Page</div>
          </MainLayout>
        </AdminRoute>
      } />
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
};

// Main App Component
const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
};

export default App;
