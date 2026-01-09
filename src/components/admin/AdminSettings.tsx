import React, { useState } from 'react';
import { Button } from '../Button';
import { Save, Bot, Store, Globe, ToggleLeft, ToggleRight } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState({
      storeName: 'OptiStyle India',
      supportEmail: 'optistyle.india@gmail.com',
      aiEnabled: true,
      maintenanceMode: false
  });

  const toggle = (key: keyof typeof settings) => {
      setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="max-w-2xl space-y-8">
      
      {/* General Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
         <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
            <Store className="w-4 h-4 text-slate-500" />
            <h3 className="font-bold text-slate-800">General Settings</h3>
         </div>
         <div className="p-6 space-y-4">
            <div>
               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Store Name</label>
               <input className="w-full p-2 border border-slate-300 rounded-md" value={settings.storeName} onChange={e => setSettings({...settings, storeName: e.target.value})} />
            </div>
            <div>
               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Support Email</label>
               <input className="w-full p-2 border border-slate-300 rounded-md" value={settings.supportEmail} onChange={e => setSettings({...settings, supportEmail: e.target.value})} />
            </div>
         </div>
      </div>

      {/* AI Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
         <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
            <Bot className="w-4 h-4 text-slate-500" />
            <h3 className="font-bold text-slate-800">AI Stylist Configuration</h3>
         </div>
         <div className="p-6 space-y-6">
             <div className="flex items-center justify-between">
                <div>
                   <p className="font-bold text-slate-900">Enable AI Chatbot</p>
                   <p className="text-sm text-slate-500">Allow customers to use the virtual assistant.</p>
                </div>
                <button onClick={() => toggle('aiEnabled')} className={`transition-colors ${settings.aiEnabled ? 'text-green-600' : 'text-slate-300'}`}>
                   {settings.aiEnabled ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                </button>
             </div>
             
             <div>
               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">System Prompt Override</label>
               <textarea className="w-full p-2 border border-slate-300 rounded-md h-24 text-sm font-mono" placeholder="You are OptiStyle Assistant..." />
               <p className="text-xs text-slate-400 mt-1">Leave empty to use default codebase prompt.</p>
            </div>
         </div>
      </div>

      <div className="flex justify-end gap-4">
         <Button variant="outline">Discard Changes</Button>
         <Button className="flex items-center gap-2"><Save className="w-4 h-4" /> Save Configuration</Button>
      </div>
    </div>
  );
};
