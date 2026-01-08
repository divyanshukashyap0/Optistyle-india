import React, { useEffect, useState } from 'react';
import { getAdminRefundRequests, processAdminRefund } from '../../services/api';
import { Order } from '../../types';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '../Button';

export const AdminRefunds: React.FC = () => {
  const [refunds, setRefunds] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRefunds = async () => {
    setLoading(true);
    try {
        const data = await getAdminRefundRequests();
        setRefunds(data);
    } catch (e) {
        console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRefunds();
  }, []);

  const handleDecision = async (id: string, decision: 'APPROVE' | 'REJECT') => {
      if(!window.confirm(`Are you sure you want to ${decision} this refund?`)) return;
      await processAdminRefund(id, decision);
      fetchRefunds(); // Refresh list
  };

  return (
    <div className="space-y-6">
       <div className="bg-amber-50 rounded-xl shadow-sm border border-amber-200 p-6 flex items-center gap-4">
         <div className="p-3 bg-amber-100 rounded-full text-amber-600">
            <AlertTriangle className="w-6 h-6" />
         </div>
         <div>
            <h3 className="font-bold text-amber-900">Refund Requests</h3>
            <p className="text-sm text-amber-700">Approving a refund will instantly trigger the payment reversal.</p>
         </div>
         <Button variant="outline" size="sm" onClick={fetchRefunds} className="ml-auto bg-white border-amber-200 text-amber-800">
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
         </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
           <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
              <tr>
                 <th className="p-4">Order ID</th>
                 <th className="p-4">Amount</th>
                 <th className="p-4">Method</th>
                 <th className="p-4">Status</th>
                 <th className="p-4 text-right">Actions</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-slate-100">
              {loading ? (
                   <tr><td colSpan={5} className="p-8 text-center text-slate-400">Loading...</td></tr>
              ) : refunds.length === 0 ? (
                 <tr><td colSpan={5} className="p-8 text-center text-slate-400">No pending refund requests.</td></tr>
              ) : (
                 refunds.map(order => (
                    <tr key={order.id} className="hover:bg-slate-50">
                       <td className="p-4">
                           <p className="font-bold text-slate-900">{order.id}</p>
                           <p className="text-xs text-slate-500">{new Date(order.date).toLocaleDateString()}</p>
                       </td>
                       <td className="p-4 font-bold text-slate-900">₹{order.total}</td>
                       <td className="p-4">
                           <span className={`text-xs font-bold px-2 py-1 rounded ${order.paymentMethod === 'COD' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                               {order.paymentMethod}
                           </span>
                       </td>
                       <td className="p-4">
                          <span className="bg-red-50 text-red-600 px-2 py-1 rounded text-xs font-bold border border-red-100">
                              REQUESTED
                          </span>
                       </td>
                       <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                             <Button size="sm" onClick={() => handleDecision(order.id, 'APPROVE')} className="bg-green-600 hover:bg-green-700 px-3">
                                 <CheckCircle className="w-4 h-4 mr-1" /> Approve
                             </Button>
                             <Button size="sm" variant="outline" onClick={() => handleDecision(order.id, 'REJECT')} className="text-red-600 border-red-200 hover:bg-red-50 px-3">
                                 <XCircle className="w-4 h-4 mr-1" /> Reject
                             </Button>
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
