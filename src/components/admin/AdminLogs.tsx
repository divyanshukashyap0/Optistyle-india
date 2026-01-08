
import React, { useEffect, useState } from 'react';
import { getAuditLogs } from '../../services/api';
import { Shield, Clock, User, Filter, Activity } from 'lucide-react';

export const AdminLogs: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAuditLogs().then(data => {
        setLogs(data);
        setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex justify-between items-center">
         <div>
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-slate-500" /> System Audit Logs
            </h3>
            <p className="text-sm text-slate-500 mt-1">Immutable record of all administrative actions.</p>
         </div>
         <div className="flex gap-2 text-xs font-bold text-slate-500 bg-slate-100 px-3 py-2 rounded-lg">
             <Activity className="w-4 h-4" /> Real-time
         </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
         {loading ? (
             <div className="p-8 text-center text-slate-400">Loading logs...</div>
         ) : (
             <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm">
                     <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-medium">
                         <tr>
                             <th className="p-4">Timestamp</th>
                             <th className="p-4">Admin ID</th>
                             <th className="p-4">Action</th>
                             <th className="p-4">Details</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                         {logs.map((log) => (
                             <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                 <td className="p-4 text-slate-500 whitespace-nowrap">
                                     <div className="flex items-center gap-2">
                                         <Clock className="w-3 h-3" />
                                         {new Date(log.timestamp).toLocaleString()}
                                     </div>
                                 </td>
                                 <td className="p-4">
                                     <span className="flex items-center gap-1 text-slate-600 text-xs bg-slate-100 px-2 py-1 rounded w-fit font-mono">
                                         <User className="w-3 h-3" /> {log.adminId.substring(0, 8)}...
                                     </span>
                                 </td>
                                 <td className="p-4">
                                     <span className="font-bold text-slate-800 block">{log.action}</span>
                                 </td>
                                 <td className="p-4">
                                     <p className="text-slate-600 font-mono text-xs bg-slate-50 p-1.5 rounded border border-slate-100 max-w-md truncate">
                                         {log.details}
                                     </p>
                                 </td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
             </div>
         )}
      </div>
    </div>
  );
};
