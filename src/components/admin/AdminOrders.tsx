import React, { useEffect, useState } from 'react';
import { getAdminOrders, updateOrderStatus } from '../../services/adminService';
import { exportAdminData } from '../../services/api';
import { Order } from '../../types';
import { Search, Eye, Filter, Download, FileSpreadsheet } from 'lucide-react';
import { Button } from '../Button';

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    getAdminOrders().then(setOrders);
  }, []);

  const handleStatusChange = async (id: string, newStatus: Order['status']) => {
    await updateOrderStatus(id, newStatus);
    const updated = await getAdminOrders();
    setOrders(updated);
  };

  const filteredOrders = orders.filter(o => {
     const matchesSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) || o.userId.toLowerCase().includes(searchTerm.toLowerCase());
     const matchesFilter = filterStatus === 'all' || o.status === filterStatus;
     return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
       
       <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          {/* Search & Filter */}
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                placeholder="Search Order ID..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <select 
                className="border border-slate-300 rounded-lg p-2 text-sm outline-none"
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
              >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
              </select>
            </div>
          </div>
          
          {/* Export Buttons */}
          <div className="flex gap-2 w-full lg:w-auto">
             <Button variant="outline" onClick={() => exportAdminData('orders')} className="flex items-center gap-2 text-sm">
                 <FileSpreadsheet className="w-4 h-4" /> Export Sales
             </Button>
             <Button variant="outline" onClick={() => exportAdminData('refunds')} className="flex items-center gap-2 text-sm">
                 <FileSpreadsheet className="w-4 h-4" /> Export Refunds
             </Button>
          </div>
       </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
           <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
              <tr>
                 <th className="p-4">Order ID</th>
                 <th className="p-4">Customer</th>
                 <th className="p-4">Items</th>
                 <th className="p-4">Total</th>
                 <th className="p-4">Date</th>
                 <th className="p-4">Status</th>
                 <th className="p-4 text-right">Actions</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                 <tr><td colSpan={7} className="p-8 text-center text-slate-400">No orders found.</td></tr>
              ) : (
                 filteredOrders.map(order => (
                    <tr key={order.id} className="hover:bg-slate-50">
                       <td className="p-4 font-bold text-slate-900">{order.id}</td>
                       <td className="p-4 text-slate-600">{order.userId}</td>
                       <td className="p-4">{order.items.length} items</td>
                       <td className="p-4 font-medium">₹{order.total}</td>
                       <td className="p-4 text-slate-500">{new Date(order.date).toLocaleDateString()}</td>
                       <td className="p-4">
                          <select 
                            className={`p-1 rounded text-xs font-bold uppercase border-none outline-none cursor-pointer ${
                                order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                order.status === 'shipped' ? 'bg-purple-100 text-purple-700' :
                                'bg-blue-100 text-blue-700'
                            }`}
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value as any)}
                          >
                             <option value="pending">Pending</option>
                             <option value="processing">Processing</option>
                             <option value="shipped">Shipped</option>
                             <option value="delivered">Delivered</option>
                          </select>
                       </td>
                       <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                             <button className="p-1.5 text-slate-500 hover:bg-slate-100 rounded" title="View Details"><Eye className="w-4 h-4" /></button>
                          </div>
                       </td>
                    </tr>
                 ))
              )}
           </tbody>
        </table>
      </div>
    </div>
  );
};
