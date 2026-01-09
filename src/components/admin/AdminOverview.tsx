import React, { useEffect, useState } from 'react';
import { DollarSign, ShoppingBag, Users, AlertTriangle, TrendingUp, Clock, CreditCard, Banknote } from 'lucide-react';
import { getDashboardStats, getAdminOrders } from '../../services/adminService';
import { Order } from '../../../types';

export const AdminOverview: React.FC<{ onViewChange: (view: any) => void }> = ({ onViewChange }) => {
  const [stats, setStats] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  useEffect(() => {
    getDashboardStats().then(setStats);
    getAdminOrders().then(orders => setRecentOrders(orders.slice(-5).reverse())); // Show newest first
  }, []);

  if (!stats) return <div className="p-8 text-center animate-pulse">Loading Analytics...</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={`₹${stats.totalRevenue.toLocaleString()}`} 
          icon={DollarSign} 
          trend="Gross Volume"
          color="bg-emerald-600"
        />
        <StatCard 
          title="Pending COD" 
          value={`₹${stats.pendingCODRevenue.toLocaleString()}`} 
          icon={Banknote} 
          trend="To be collected"
          color="bg-amber-500"
        />
        <StatCard 
          title="Total Orders" 
          value={stats.totalOrders} 
          icon={ShoppingBag} 
          trend={`${stats.paymentSplit.online} Online / ${stats.paymentSplit.cod} COD`}
          color="bg-blue-600"
        />
        <StatCard 
          title="Total Customers" 
          value={stats.totalUsers} 
          icon={Users} 
          trend="Active Accounts"
          color="bg-indigo-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800">Recent Transactions</h3>
            <button onClick={() => onViewChange('orders')} className="text-sm text-brand-600 font-medium hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Mode</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="p-3 font-medium text-slate-900">{order.id}</td>
                    <td className="p-3">
                        <span className={`flex items-center gap-1.5 font-medium ${order.paymentMethod === 'COD' ? 'text-amber-700' : 'text-blue-700'}`}>
                            {order.paymentMethod === 'COD' ? <Banknote className="w-3 h-3" /> : <CreditCard className="w-3 h-3" />}
                            {order.paymentMethod}
                        </span>
                    </td>
                    <td className="p-3 font-bold text-slate-900">₹{order.total}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                        order.status === 'cod_pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Analytics */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
           <h3 className="font-bold text-slate-800 mb-6">Payment Analytics</h3>
           
           <div className="space-y-6">
              {/* COD vs Online Bar */}
              <div>
                  <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                      <span>Online ({stats.paymentSplit.online})</span>
                      <span>COD ({stats.paymentSplit.cod})</span>
                  </div>
                  <div className="h-4 bg-slate-100 rounded-full overflow-hidden flex">
                      <div 
                        className="bg-blue-500 h-full" 
                        style={{ width: `${(stats.paymentSplit.online / (stats.totalOrders || 1)) * 100}%` }}
                      ></div>
                      <div 
                        className="bg-amber-500 h-full" 
                        style={{ width: `${(stats.paymentSplit.cod / (stats.totalOrders || 1)) * 100}%` }}
                      ></div>
                  </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 text-blue-800 rounded-lg text-sm border border-blue-100">
                    <TrendingUp className="w-5 h-5 shrink-0" />
                    <div>
                        <p className="font-bold">Conversion Rate</p>
                        <p>3.2% (Industry Avg: 2.5%)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-red-50 text-red-800 rounded-lg text-sm border border-red-100">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <div>
                        <p className="font-bold">Failed Payments</p>
                        <p>2 transactions failed today.</p>
                    </div>
                  </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string, value: string | number, icon: any, trend: string, color: string }> = ({ title, value, icon: Icon, trend, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-start justify-between transition-transform hover:-translate-y-1">
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
      <p className="text-xs text-slate-400 mt-2 font-medium">{trend}</p>
    </div>
    <div className={`p-3 rounded-lg ${color} text-white shadow-md`}>
      <Icon className="w-5 h-5" />
    </div>
  </div>
);
