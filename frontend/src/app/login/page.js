"use client";
import { useState, useContext } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import api from '../lib/axios';
import { AppContext } from '../context/AppContext';

export default function LoginPage() {
  const { login } = useContext(AppContext);
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await api.post('/auth/login', { email, password });
      const token = response.data.accessToken || response.data.access_token || response.data.token;
      
      if (token) {
        const decoded = jwtDecode(token);
        login(token); 

        const normalizedRole =
          typeof (decoded?.role ?? decoded?.userRole ?? decoded?.user?.role) === 'string'
            ? (decoded?.role ?? decoded?.userRole ?? decoded?.user?.role).trim().toLowerCase()
            : '';

        if (normalizedRole === 'admin') {
          router.push('/admin'); 
        } else {
          router.push('/');      
        }
      } else {
        setError('Logged in, but no token received from backend.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    }
  };

  const inputClass = "block w-full p-4 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all";

  return (
    <div className="flex justify-center items-center min-h-[70vh]">
      <div className="w-full max-w-md bg-white p-10 rounded-2xl border border-gray-200 shadow-lg">
        {/* Changed heading so it applies to both Admins and Customers */}
        <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-2">Welcome Back</h1>
        <p className="text-gray-600 text-center mb-8 font-medium">Sign in to your account.</p>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 text-sm font-bold text-center border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <input
            id="email"
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
            className={inputClass}
          />

          <input
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            className={inputClass}
          />

          <button
            type="submit"
            className="w-full py-4 mt-2 bg-gray-900 hover:bg-black text-white font-bold text-lg rounded-lg transition-colors shadow-md"
          >
            Sign In
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-600 font-medium">
          Don't have an account?{' '}
          <Link href="/register" className="text-emerald-700 font-extrabold hover:underline">
            Sign up here
          </Link>
        </div>
      </div>
    </div>
  );
}
