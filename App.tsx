
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
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

  if (!currentUser.isApproved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full text-center space-y-6 p-10 bg-white shadow-2xl rounded-3xl border border-yellow-100 animate-fadeIn">
          <div className="mx-auto w-20 h-20 bg-yellow-50 flex items-center justify-center rounded-full">
            <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">Access Pending</h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            Welcome, <span className="font-bold text-gray-900">{currentUser.name}</span>. Your account is currently in the verification queue. A senior administrator will review your access request shortly.
          </p>
          <div className="pt-4">
            <button onClick={onLogout} className="w-full py-3 px-4 rounded-xl text-indigo-600 bg-indigo-50 font-bold hover:bg-indigo-100 transition-all">
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchUserProfile(session.user.id);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchUserProfile(session.user.id);
      } else {
        setCurrentUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      if (data) {
        // Map Supabase data to our User type (snake_case to camelCase if needed, but our schema uses snake_case column names and we need to map them)
        // Actually, let's fix the schema or type mapping.
        // The schema uses snake_case: is_approved, registration_date
        // The type uses camelCase: isApproved, registrationDate
        // We need to map it.
        const user: User = {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role as Role,
          isApproved: data.is_approved,
          registrationDate: data.registration_date,
        };
        setCurrentUser(user);
      }
    } catch (error) {
      console.error('Unexpected error fetching user:', error);
    }
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
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
