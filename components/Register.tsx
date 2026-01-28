
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { User, Role } from '../types';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('STUDENT');
  const [proctorCode, setProctorCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (role === 'PROCTOR') {
      // Logic: Master code works for first setup
      const isMasterCode = proctorCode === 'ADMIN2025';

      if (!isMasterCode) {
        // For now, only Master Code is supported in this Supabase migration
        setError('Invalid Proctor Invite Code.');
        return;
      }
    }

    try {
      // 1. Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Insert user profile into 'users' table
        const newUser: User = {
          id: authData.user.id,
          name,
          email,
          role: role,
          isApproved: role === 'PROCTOR' && proctorCode === 'ADMIN2025', // Auto-approve if they have the master code
          registrationDate: new Date().toISOString()
        };

        const { error: dbError } = await supabase
          .from('users')
          .insert([{
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            is_approved: newUser.isApproved,
            registration_date: newUser.registrationDate
          }]);

        if (dbError) {
          console.error('Database Profile Insert Error:', dbError);
          setError(`Account created but profile setup failed: ${dbError.message}`);
          return;
        }

        alert(`Account created successfully! Please sign in.`);
        navigate('/login');
      }
    } catch (err: any) {
      console.error('Registration Catch Error:', err);
      let msg = err.message || 'Failed to register';
      // ... (rest of error handling)
      if (msg.includes('rate limit')) {
        msg = 'Too many attempts. Please wait a while or check Supabase > Auth > Rate Limits.';
      } else if (msg.includes('User already registered')) {
        msg = 'This email is already registered. Please sign in.';
      }
      setError(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign in
            </Link>
          </p>
        </div>

        <div className="flex p-1 bg-gray-100 rounded-xl">
          <button
            type="button"
            onClick={() => setRole('STUDENT')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${role === 'STUDENT' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Student
          </button>
          <button
            type="button"
            onClick={() => setRole('PROCTOR')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${role === 'PROCTOR' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Proctor
          </button>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleRegister}>
          <div className="rounded-md shadow-sm space-y-3">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Full Name</label>
              <input
                type="text"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Email address</label>
              <input
                type="email"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1">Password</label>
              <input
                type="password"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {role === 'PROCTOR' && (
              <div className="animate-fadeIn">
                <label className="block text-xs font-bold text-indigo-600 uppercase mb-1 ml-1">Proctor Invite Code</label>
                <input
                  type="text"
                  required
                  className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-indigo-200 bg-indigo-50 placeholder-indigo-300 text-indigo-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter secret code"
                  value={proctorCode}
                  onChange={(e) => setProctorCode(e.target.value)}
                />
              </div>
            )}
          </div>

          {error && <p className="text-red-500 text-xs text-center font-bold bg-red-50 p-2 rounded-lg">{error}</p>}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-lg shadow-indigo-100"
            >
              Request {role === 'STUDENT' ? 'Student' : 'Proctor'} Access
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
