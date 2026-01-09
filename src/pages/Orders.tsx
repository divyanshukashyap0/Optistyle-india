import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Package, Clock, Download, Undo2, AlertTriangle, CheckCircle } from 'lucide-react';
import { api, requestOrderRefund } from '../services/api';
import { generateInvoice } from '../services/pdfService';
import { Order } from '../../types';
import { Button } from '../components/Button';

export const Orders: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In production, this would use a real endpoint filtered by user ID
    api.get('/orders').then(res => {
        setOrders(res.data); // Mock API returns all, assume filtering happens
        setLoading(false);
    });
  }, []);

  const handleRefund = async (orderId: string) => {
    const reason = prompt("Please enter a reason for the refund:");
    if (!reason) return;

    try {
        await requestOrderRefund(orderId, reason);
        alert("Refund request submitted for approval.");
        window.location.reload();
    } catch (e) {
        alert("Failed to request refund.");
    }
  };

  if (!user) return <Navigate to="/login" />;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-serif font-bold mb-8">Order History</h1>
      <div className="space-y-4">
        {loading ? (
             <div className="p-8 text-center text-slate-500">Loading orders...</div>
        ) : orders.length === 0 ? (
             <div className="p-8 text-center bg-slate-50 rounded-xl">No orders found.</div>
        ) : (
            orders.map((order) => (
            <div key={order.id} className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-100 rounded-lg">
                    <Package className="w-6 h-6 text-slate-600" />
                </div>
                <div>
                    <p className="font-bold text-slate-900">Order #{order.id}</p>
                    <p className="text-sm text-slate-500">Placed on {new Date(order.date).toLocaleDateString()}</p>
                    {order.invoiceNumber && <p className="text-xs text-brand-600 font-medium mt-1">Inv: {order.invoiceNumber}</p>}
                </div>
                </div>
                
                <div className="flex flex-col md:flex-row items-end md:items-center gap-4 w-full md:w-auto">
                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                        {order.refundStatus === 'REFUNDED' ? (
                            <span className="flex items-center gap-1 text-slate-500 bg-slate-100 px-3 py-1 rounded-full text-sm font-bold">
                                <Undo2 className="w-4 h-4" /> Refunded
                            </span>
                        ) : order.refundStatus === 'REQUESTED' ? (
                             <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-sm font-bold border border-amber-200">
                                <Clock className="w-4 h-4" /> Refund Pending
                            </span>
                        ) : (
                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold ${
                                order.status === 'delivered' ? 'text-green-600 bg-green-50' : 'text-blue-600 bg-blue-50'
                            }`}>
                                <CheckCircle className="w-4 h-4" /> {order.status.replace('_', ' ')}
                            </div>
                        )}
                    </div>
                    
                    <span className="font-bold text-lg">₹{order.total}</span>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => generateInvoice(
                            order.id, 
                            {
                                name: order.user.name,
                                email: order.user.email,
                                address: order.user.address || 'N/A',
                                city: order.user.city || 'N/A',
                                zip: order.user.zip || 'N/A'
                            },
                            order.items,
                            order.total
                        )} className="flex items-center gap-2">
                            <Download className="w-4 h-4" /> Invoice
                        </Button>
                        
                        {(order.status === 'delivered' || order.status === 'processing') && order.refundStatus === 'NONE' && (
                            <Button variant="ghost" size="sm" onClick={() => handleRefund(order.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                Request Refund
                            </Button>
                        )}
                    </div>
                </div>
            </div>
            ))
        )}
      </div>
    </div>
  );
};
