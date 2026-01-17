import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { PageTransition } from '../components/PageTransition';
import { api, endpoints } from '../services/api';

export const Register: React.FC = () => {
  const { register, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(form.email, form.password, form.name);
      try {
        await api.post(endpoints.email.welcome, {
          name: form.name,
          email: form.email,
        });
      } catch (err) {
        console.error('Welcome email failed', err);
      }
      navigate('/profile', { state: { fromSignup: true } });
    } catch (e) {
      // Handled by context
    }
  };

  return (
    <PageTransition className="min-h-[80vh] flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
        <h2 className="text-3xl font-serif font-bold text-center mb-2">Join OptiStyle</h2>
        <p className="text-center text-slate-500 mb-8">Create an account to track orders and save prescriptions.</p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2 text-sm animate-pulse">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input 
              required
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
              value={form.name}
              onChange={(e) => setForm({...form, name: e.target.value})}
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input 
              type="email"
              required
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
              value={form.email}
              onChange={(e) => setForm({...form, email: e.target.value})}
              placeholder="john@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input 
              type="password"
              required
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
              value={form.password}
              onChange={(e) => setForm({...form, password: e.target.value})}
              placeholder="Min 6 characters"
            />
          </div>
          <Button type="submit" className="w-full" size="lg" loading={isLoading}>Create Account</Button>
        </form>
        <p className="mt-6 text-center text-slate-600">
          Already have an account? <Link to="/login" className="text-brand-600 font-medium hover:underline">Sign In</Link>
        </p>
      </div>
    </PageTransition>
  );
};
