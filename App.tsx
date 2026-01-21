
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { User, Role } from './types';
import Login from './components/Login';
import Register from './components/Register';
import StudentDashboard from './components/StudentDashboard';
import ProctorDashboard from './components/ProctorDashboard';
import Navbar from './components/Navbar';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
  currentUser: User | null;
  onLogout: () => void;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles, currentUser, onLogout }) => {
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    return <Navigate to={currentUser.role === 'STUDENT' ? '/student' : '/proctor'} replace />;
  }

  // Safety check for BOTH Students and Proctors
  if (!currentUser.isApproved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full text-center space-y-4 p-8 bg-white shadow-xl rounded-2xl border border-yellow-100">
          <div className="mx-auto w-16 h-16 bg-yellow-100 flex items-center justify-center rounded-full">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Access Pending Verification</h2>
          <p className="text-gray-600">
            Welcome, <span className="font-semibold">{currentUser.name}</span>. Your account (<span className="text-indigo-600 font-bold">{currentUser.role}</span>) is currently awaiting manual verification by a senior administrator.
          </p>
          <button 
            onClick={onLogout}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-all"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }
    } catch (err) {
      console.error("Hydration Error:", err);
      localStorage.removeItem('currentUser'); // Clean up corrupted state
    }
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } catch (err) {
      console.error("Failed to save login session:", err);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col bg-slate-50">
        {currentUser && <Navbar user={currentUser} onLogout={handleLogout} />}
        <main className="flex-grow">
          <Routes>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/student" 
              element={
                <ProtectedRoute allowedRoles={['STUDENT']} currentUser={currentUser} onLogout={handleLogout}>
                  <StudentDashboard user={currentUser!} />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/proctor" 
              element={
                <ProtectedRoute allowedRoles={['PROCTOR']} currentUser={currentUser} onLogout={handleLogout}>
                  <ProctorDashboard user={currentUser!} />
                </ProtectedRoute>
              } 
            />
            <Route path="/" element={<Navigate to={currentUser ? (currentUser.role === 'STUDENT' ? '/student' : '/proctor') : '/login'} replace />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
