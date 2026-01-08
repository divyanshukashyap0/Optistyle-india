
import React, { useEffect, useState } from 'react';
import { getPendingApprovals, decideApproval } from '../../services/api';
import { CheckCircle, XCircle, Clock, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Button } from '../Button';
import { useAuth } from '../../context/AuthContext';

export const AdminApprovals: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
        const data = await getPendingApprovals();
        setRequests(data);
    } catch (e) {
        console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleDecision = async (id: string, decision: 'APPROVED' | 'REJECTED') => {
      const confirmMsg = decision === 'APPROVED' 
        ? "Are you sure you want to APPROVE this request? This action will take effect immediately." 
        : "Reject this request?";
        
      if(!window.confirm(confirmMsg)) return;
      
      try {
        await decideApproval(id, decision);
        fetchRequests(); // Refresh list
      } catch (err: any) {
        alert(err.response?.data?.message || "Action failed");
      }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
       <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row items-center gap-4">
         <div className="p-3 bg-purple-100 rounded-full text-purple-600">
            <ShieldCheck className="w-6 h-6" />
         </div>
         <div className="flex-1">
            <h3 className="font-bold text-slate-900">Governance Queue</h3>
            <p className="text-sm text-slate-500">Sensitive actions require peer approval. You cannot approve your own requests.</p>
         </div>
         <Button variant="outline" size="sm" onClick={fetchRequests}>
            Refresh
         </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wide">
            Pending Actions ({requests.length})
        </div>
        
        {loading ? (
             <div className="p-12 text-center text-slate-400">Loading requests...</div>
        ) : requests.length === 0 ? (
             <div className="p-12 text-center flex flex-col items-center gap-2">
                 <CheckCircle className="w-8 h-8 text-green-500 opacity-50" />
                 <p className="text-slate-500 font-medium">All clear. No pending approvals.</p>
             </div>
        ) : (
           <div className="divide-y divide-slate-100">
               {requests.map(req => {
                   const isOwnRequest = req.requesterId === user?.id;
                   
                   return (
                    <div key={req.id} className="p-6 hover:bg-slate-50 flex flex-col md:flex-row gap-4 justify-between group">
                       <div className="flex gap-4">
                           <div className={`mt-1 p-2 rounded-lg h-fit ${
                               req.type === 'MAINTENANCE_TOGGLE' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                           }`}>
                               <AlertTriangle className="w-5 h-5" />
                           </div>
                           <div>
                               <div className="flex items-center gap-2 mb-1">
                                   <span className="font-bold text-slate-800">{req.type.replace('_', ' ')}</span>
                                   <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full border border-slate-200">
                                      {req.id.substring(0, 8)}
                                   </span>
                               </div>
                               <p className="text-sm text-slate-600 mb-2">
                                   Requested by <span className="font-semibold text-slate-900">{req.requesterName}</span>
                               </p>
                               <div className="text-xs font-mono bg-slate-100 p-2 rounded border border-slate-200 text-slate-600 w-fit">
                                   {JSON.stringify(req.data).substring(0, 60)}...
                               </div>
                               <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
                                   <Clock className="w-3 h-3" /> {new Date(req.createdAt).toLocaleString()}
                               </div>
                           </div>
                       </div>

                       <div className="flex items-center gap-2 self-start md:self-center">
                           {isOwnRequest ? (
                               <span className="px-3 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-lg border border-slate-200 cursor-not-allowed">
                                   Awaiting Peer Review
                               </span>
                           ) : (
                               <>
                                <Button size="sm" onClick={() => handleDecision(req.id, 'APPROVED')} className="bg-green-600 hover:bg-green-700">
                                    Approve
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handleDecision(req.id, 'REJECTED')} className="text-red-600 border-red-200 hover:bg-red-50">
                                    Reject
                                </Button>
                               </>
                           )}
                       </div>
                    </div>
                   );
               })}
           </div>
        )}
      </div>
    </div>
  );
};
