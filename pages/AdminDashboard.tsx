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
  Undo2
} from 'lucide-react';
import { AdminOverview } from '../components/admin/AdminOverview';
import { AdminProducts } from '../components/admin/AdminProducts';
import { AdminOrders } from '../components/admin/AdminOrders';
import { AdminUsers } from '../components/admin/AdminUsers';
import { AdminSettings } from '../components/admin/AdminSettings';
import { AdminRefunds } from '../components/admin/AdminRefunds';

type View = 'overview' | 'products' | 'orders' | 'refunds' | 'users' | 'settings';

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
    { id: 'users', label: 'Customers', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  const renderView = () => {
    switch (currentView) {
      case 'overview': return <AdminOverview onViewChange={setCurrentView} />;
      case 'products': return <AdminProducts />;
      case 'orders': return <AdminOrders />;
      case 'refunds': return <AdminRefunds />;
      case 'users': return <AdminUsers />;
      case 'settings': return <AdminSettings />;
      default: return <AdminOverview onViewChange={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans text-slate-900">
      
      {/* SIDEBAR */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:relative lg:translate-x-0 flex flex-col`}
      >
        {/* Brand */}
        <div className="h-16 flex items-center px-6 bg-slate-950 border-b border-slate-800">
          <div className="font-bold text-xl text-white tracking-tight">OptiStyle<span className="text-brand-500">Admin</span></div>
          <button className="lg:hidden ml-auto" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-6 space-y-1">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setCurrentView(item.id); if(window.innerWidth < 1024) setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/50' 
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
             <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold">
                {user?.name.charAt(0)}
             </div>
             <div className="overflow-hidden">
                <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate">System Admin</p>
             </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-md bg-slate-800 hover:bg-red-900/30 hover:text-red-400 text-xs font-bold transition-all"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-4">
             <button className="lg:hidden p-2 text-slate-600" onClick={() => setIsSidebarOpen(true)}>
                <Menu className="w-6 h-6" />
             </button>
             <h2 className="text-xl font-bold text-slate-800 capitalize">{currentView}</h2>
          </div>
          
          <div className="flex items-center gap-4">
             <button className="p-2 text-slate-400 hover:text-brand-600 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
             </button>
          </div>
        </header>

        {/* Scrollable View Area */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-8">
           {renderView()}
        </main>

      </div>
    </div>
  );
};
