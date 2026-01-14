
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { PageTransition } from '../components/PageTransition';

export const Login: React.FC = () => {
  const { login, loginWithGoogle, isLoading, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [mode] = useState<'email'>('email');
  
  // Get redirect path or default to profile
  const from = (location.state as any)?.from?.pathname || '/profile';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(formData.email, formData.password);
      navigate(from, { replace: true });
    } catch (e) {
      // Error is handled in context and exposed via hook, but catch here prevents unhandled promise rejection
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      navigate(from, { replace: true });
    } catch (e) {
    }
  };

  // Phone OTP login removed

  return (
    <PageTransition className="min-h-[80vh] flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
        <h2 className="text-3xl font-serif font-bold text-center mb-2">Welcome Back</h2>
        <p className="text-center text-slate-500 mb-8">Sign in to access your prescriptions and orders.</p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2 text-sm animate-pulse">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <div className="mb-4">
          <p className="text-sm text-slate-600 text-center">Sign in with Email</p>
        </div>

        {mode === 'email' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input 
                type="email" 
                required
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <Link to="/forgot-password" className="text-xs font-medium text-brand-600 hover:text-brand-800 hover:underline transition-colors">
                  Forgot Password?
                </Link>
              </div>
              <input 
                type="password" 
                required
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="••••••••"
              />
            </div>
            <Button type="submit" className="w-full" size="lg" loading={isLoading}>Sign In</Button>
          </form>
        )}

        {/* Phone OTP login removed due to reCAPTCHA billing requirements */}

        <div className="mt-4 flex items-center gap-2">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs text-slate-400 uppercase tracking-wide">Or</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full mt-4"
          size="md"
          loading={isLoading}
          onClick={handleGoogleLogin}
        >
          Continue with Google
        </Button>
        <p className="mt-6 text-center text-slate-600">
          New to OptiStyle? <Link to="/register" className="text-brand-600 font-medium hover:underline">Create Account</Link>
        </p>
      </div>
    </PageTransition>
  );
};
