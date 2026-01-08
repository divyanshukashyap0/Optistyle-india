
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Link } from 'react-router-dom';
import { AlertCircle, CheckCircle, ArrowLeft, Mail } from 'lucide-react';
import { PageTransition } from '../components/PageTransition';

export const ForgotPassword: React.FC = () => {
  const { resetPassword, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!email) {
      setLocalError("Email is required.");
      return;
    }

    try {
      await resetPassword(email);
      // Always show success to prevent email enumeration attacks
      setIsSuccess(true);
    } catch (err: any) {
      setLocalError(err.message || "Failed to send reset link.");
    }
  };

  return (
    <PageTransition className="min-h-[80vh] flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
        
        {isSuccess ? (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">Check your email</h2>
              <p className="text-slate-600 leading-relaxed">
                If an account exists for <strong>{email}</strong>, we have sent a password reset link to it.
              </p>
            </div>
            <div className="pt-2">
              <Link to="/login">
                <Button variant="outline" className="w-full">Back to Sign In</Button>
              </Link>
            </div>
            <p className="text-xs text-slate-400">
              Didn't receive it? Check your spam folder or try again in a few minutes.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-8 text-center">
              <div className="inline-flex items-center justify-center p-3 bg-brand-50 rounded-full text-brand-600 mb-4">
                <Mail className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">Forgot Password?</h2>
              <p className="text-slate-500 text-sm">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </div>

            {localError && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2 text-sm animate-pulse">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {localError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  required
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              
              <Button type="submit" className="w-full shadow-lg" size="lg" loading={isLoading}>
                Send Reset Link
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link to="/login" className="text-sm font-medium text-slate-500 hover:text-slate-800 flex items-center justify-center gap-2 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Sign In
              </Link>
            </div>
          </>
        )}
      </div>
    </PageTransition>
  );
};
