
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  Settings, 
  Package, 
  LogOut, 
  Menu,
  X,
  Bell,
  Undo2,
  ShieldAlert,
  Activity
} from 'lucide-react';
import { AdminOverview } from '../components/admin/AdminOverview';
import { AdminProducts } from '../components/admin/AdminProducts';
import { AdminOrders } from '../components/admin/AdminOrders';
import { AdminUsers } from '../components/admin/AdminUsers';
import { AdminSystem } from '../components/admin/AdminSystem'; 
import { AdminRefunds } from '../components/admin/AdminRefunds';
import { AdminLogs } from '../components/admin/AdminLogs';
import { AdminApprovals } from '../components/admin/AdminApprovals';
import { Logo } from '../components/Logo';

type View = 'overview' | 'products' | 'orders' | 'refunds' | 'users' | 'system' | 'logs' | 'approvals';

export const AdminDashboard: React.FC = () => {
  const { logout, user } = useAuth();
  const [currentView, setCurrentView] = useState<View>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // --- NAVIGATION CONFIG ---
  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: ShoppingBag },
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'refunds', label: 'Refund Requests', icon: Undo2 },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'approvals', label: 'Approvals', icon: ShieldAlert },
    { id: 'system', label: 'System Control', icon: Settings },
    { id: 'logs', label: 'Audit Logs', icon: Activity },
  ] as const;

  const renderView = () => {
    switch (currentView) {
      case 'overview': return <AdminOverview onViewChange={setCurrentView} />;
      case 'products': return <AdminProducts />;
      case 'orders': return <AdminOrders />;
      case 'refunds': return <AdminRefunds />;
      case 'users': return <AdminUsers />;
      case 'system': return <AdminSystem />;
      case 'logs': return <AdminLogs />;
      case 'approvals': return <AdminApprovals />;
      default: return <AdminOverview onViewChange={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans text-slate-900">
      
      {/* SIDEBAR */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:relative lg:translate-x-0 flex flex-col shadow-2xl`}
      >
        {/* Brand */}
        <div className="h-20 flex items-center px-6 bg-slate-950 border-b border-slate-800">
          <Logo variant="full" color="light" size="md" />
          <button className="lg:hidden ml-auto" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setCurrentView(item.id); if(window.innerWidth < 1024) setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/50 translate-x-1' 
                    : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3 mb-4">
             <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold text-lg shadow-inner">
                {user?.name.charAt(0)}
             </div>
             <div className="overflow-hidden">
                <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                <p className="text-xs text-brand-400 truncate flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Super Admin
                </p>
             </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-slate-800 hover:bg-red-900/30 hover:text-red-400 text-xs font-bold transition-all border border-slate-700"
          >
            <LogOut className="w-4 h-4" /> Secure Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 shadow-sm z-10">
          <div className="flex items-center gap-4">
             <button className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-md" onClick={() => setIsSidebarOpen(true)}>
                <Menu className="w-6 h-6" />
             </button>
             <div>
                <h2 className="text-xl font-bold text-slate-800 capitalize tracking-tight">{currentView.replace('-', ' ')}</h2>
                <p className="text-xs text-slate-500">System Overview</p>
             </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="px-3 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-full border border-red-100 hidden sm:block">
                Authorized Access
             </div>
             <button className="p-2 text-slate-400 hover:text-brand-600 relative transition-colors">
                <Bell className="w-6 h-6" />
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
             </button>
          </div>
        </header>

        {/* Scrollable View Area */}
        <main className="flex-1 overflow-y-auto bg-slate-100 p-4 sm:p-8">
           {renderView()}
        </main>

      </div>
    </div>
  );
};
