
import React, { useEffect, useState } from 'react';
import { getSystemSettings, updateSystemSettings, createApprovalRequest } from '../../services/api';
import { Save, Power, Bot, ShoppingCart, AlertTriangle, FileText, Loader, Lock, CheckCircle } from 'lucide-react';
import { Button } from '../Button';

export const AdminSystem: React.FC = () => {
  const [settings, setSettings] = useState({
      maintenanceMode: false,
      allowCheckout: true,
      aiEnabled: true,
      gstEnabled: true,
      bannerMessage: ''
  });
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
      fetchSettings();
  }, []);

  const fetchSettings = async () => {
      try {
          const data = await getSystemSettings();
          setSettings(data);
      } catch (e) {
          console.error(e);
      }
      setLoading(false);
  };

  const handleSave = async () => {
      // General settings don't need approval
      await updateSystemSettings(settings);
      alert("Settings updated.");
  };

  const requestMaintenanceToggle = async () => {
      const newVal = !settings.maintenanceMode;
      const action = newVal ? "ENABLE" : "DISABLE";
      
      if(!window.confirm(`Request to ${action} Maintenance Mode? This requires peer approval.`)) return;

      setRequesting(true);
      try {
          // Submit approval request instead of direct update
          await createApprovalRequest('MAINTENANCE_TOGGLE', { maintenanceMode: newVal });
          alert("Request submitted. Another admin must approve this action.");
      } catch (e) {
          alert("Failed to submit request.");
      }
      setRequesting(false);
  };

  const toggle = (key: keyof typeof settings) => {
      if (key === 'maintenanceMode') {
          requestMaintenanceToggle();
      } else {
          setSettings(prev => ({ ...prev, [key]: !prev[key] }));
      }
  };

  if(loading) return <div className="p-12 flex justify-center"><Loader className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in">
      
      <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl flex items-center gap-4">
          <Lock className="w-8 h-8 text-slate-400" />
          <div>
              <h3 className="font-bold text-slate-900 text-lg">System Governance</h3>
              <p className="text-slate-600 text-sm">Critical actions (like Maintenance Mode) are protected by Multi-Admin Approval.</p>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* CRITICAL SWITCHES */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4">
                  <Power className="w-5 h-5 text-slate-500" /> Critical Operations
              </h3>
              
              <div className="flex items-center justify-between">
                  <div>
                      <p className="font-bold text-slate-800">Maintenance Mode</p>
                      <p className="text-xs text-slate-500">Take site offline. Requires Approval.</p>
                  </div>
                  <button 
                    onClick={() => toggle('maintenanceMode')} 
                    disabled={requesting}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${settings.maintenanceMode ? 'bg-red-600' : 'bg-slate-300'}`}
                  >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.maintenanceMode ? 'left-7' : 'left-1'}`}></div>
                  </button>
              </div>

              <div className="flex items-center justify-between">
                  <div>
                      <p className="font-bold text-slate-800">Checkout System</p>
                      <p className="text-xs text-slate-500">Allow new orders to be placed.</p>
                  </div>
                  <button onClick={() => toggle('allowCheckout')} className={`w-12 h-6 rounded-full transition-colors relative ${settings.allowCheckout ? 'bg-green-600' : 'bg-slate-300'}`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.allowCheckout ? 'left-7' : 'left-1'}`}></div>
                  </button>
              </div>
          </div>

          {/* FEATURE TOGGLES */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4">
                  <Bot className="w-5 h-5 text-slate-500" /> Feature Management
              </h3>
              
              <div className="flex items-center justify-between">
                  <div>
                      <p className="font-bold text-slate-800">AI Stylist & Eye Test</p>
                      <p className="text-xs text-slate-500">Enable backend AI processing costs.</p>
                  </div>
                  <button onClick={() => toggle('aiEnabled')} className={`w-12 h-6 rounded-full transition-colors relative ${settings.aiEnabled ? 'bg-blue-600' : 'bg-slate-300'}`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.aiEnabled ? 'left-7' : 'left-1'}`}></div>
                  </button>
              </div>

              <div className="flex items-center justify-between">
                  <div>
                      <p className="font-bold text-slate-800">GST Compliance</p>
                      <p className="text-xs text-slate-500">Show taxes on invoices and checkout.</p>
                  </div>
                  <button onClick={() => toggle('gstEnabled')} className={`w-12 h-6 rounded-full transition-colors relative ${settings.gstEnabled ? 'bg-blue-600' : 'bg-slate-300'}`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.gstEnabled ? 'left-7' : 'left-1'}`}></div>
                  </button>
              </div>
          </div>
      </div>

      {/* CONTENT */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-slate-500" /> Site Content
          </h3>
          
          <div className="space-y-4">
              <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Global Banner Message</label>
                  <input 
                    className="w-full p-3 border border-slate-300 rounded-lg" 
                    placeholder="e.g. Sale 50% Off - Use Code SAVE50" 
                    value={settings.bannerMessage}
                    onChange={(e) => setSettings({...settings, bannerMessage: e.target.value})}
                  />
                  <p className="text-xs text-slate-400 mt-1">Leave empty to hide banner.</p>
              </div>
          </div>
      </div>

      <div className="flex justify-end pt-4">
         <Button onClick={handleSave} size="lg" className="w-48 shadow-xl">
             <Save className="w-5 h-5 mr-2" /> Save Non-Critical
         </Button>
      </div>
    </div>
  );
};
