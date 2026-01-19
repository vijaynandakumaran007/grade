
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Role, InviteToken } from '../types';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('STUDENT');
  const [proctorCode, setProctorCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    const invites: InviteToken[] = JSON.parse(localStorage.getItem('proctor_invites') || '[]');
    
    if (users.some(u => u.email === email)) {
      setError('Email already registered');
      return;
    }

    if (role === 'PROCTOR') {
      // Logic: Master code works for first setup, otherwise must use a valid invite token
      const isMasterCode = proctorCode === 'ADMIN2025';
      const inviteIndex = invites.findIndex(inv => inv.code === proctorCode && !inv.isUsed);

      if (!isMasterCode && inviteIndex === -1) {
        setError('Invalid or already used Proctor Invite Code.');
        return;
      }

      // Mark token as used if it was a dynamic token
      if (inviteIndex !== -1) {
        invites[inviteIndex].isUsed = true;
        invites[inviteIndex].usedBy = email;
        localStorage.setItem('proctor_invites', JSON.stringify(invites));
      }
    }

    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      role: role,
      isApproved: false, // ALL new users start as unapproved for security
      registrationDate: new Date().toISOString()
    };

    localStorage.setItem('users', JSON.stringify([...users, newUser]));
    
    alert(`Account created! Please wait for a senior Proctor to approve your ${role.toLowerCase()} access.`);
    navigate('/login');
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
