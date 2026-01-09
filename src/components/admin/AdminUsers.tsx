import React, { useEffect, useState } from 'react';
import { getAdminUsers } from '../../services/adminService';
import { User } from '../../../types';
import { Search, Mail, Shield, ShieldOff, MoreHorizontal } from 'lucide-react';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  
  useEffect(() => {
    getAdminUsers().then(setUsers);
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center gap-4">
         <div className="p-3 bg-blue-100 rounded-full text-blue-600">
            <Shield className="w-6 h-6" />
         </div>
         <div>
            <h3 className="font-bold text-slate-900">User Management</h3>
            <p className="text-sm text-slate-500">Manage customer access and admin roles.</p>
         </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
           <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
              <tr>
                 <th className="p-4">Name</th>
                 <th className="p-4">Email</th>
                 <th className="p-4">Role</th>
                 <th className="p-4">Status</th>
                 <th className="p-4 text-right">Actions</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-slate-100">
              {users.map(user => (
                 <tr key={user.id} className="hover:bg-slate-50">
                    <td className="p-4 font-bold text-slate-900">{user.name}</td>
                    <td className="p-4 text-slate-600 flex items-center gap-2">
                       <Mail className="w-3 h-3" /> {user.email}
                    </td>
                    <td className="p-4">
                       <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                       }`}>
                          {user.role}
                       </span>
                    </td>
                    <td className="p-4"><span className="text-green-600 font-medium text-xs">Active</span></td>
                    <td className="p-4 text-right">
                       <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal className="w-5 h-5" /></button>
                    </td>
                 </tr>
              ))}
           </tbody>
        </table>
      </div>
    </div>
  );
};
