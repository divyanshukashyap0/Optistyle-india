import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { User as UserIcon, Package, LogOut } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';

export const Profile: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) return <Navigate to="/login" />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif font-bold">My Account</h1>
        <Button variant="outline" onClick={logout} className="flex gap-2">
          <LogOut className="w-4 h-4" /> Sign Out
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center text-brand-600">
              <UserIcon className="w-8 h-8" />
            </div>
            <div>
              <h2 className="font-bold text-lg">{user.name}</h2>
              <p className="text-slate-500 text-sm">{user.email}</p>
            </div>
          </div>
          <div className="space-y-2">
            <Link to="/orders" className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg text-slate-700">
              <Package className="w-5 h-5" /> My Orders
            </Link>
            {user.role === 'admin' && (
              <Link to="/admin" className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg text-brand-600 font-medium">
                Admin Dashboard
              </Link>
            )}
          </div>
        </div>

        <div className="col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-lg mb-4">Recent Activity</h3>
          <p className="text-slate-500">No recent orders found.</p>
          <div className="mt-6">
            <Link to="/shop">
              <Button>Start Shopping</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
