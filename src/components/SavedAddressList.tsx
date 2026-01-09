import React, { useEffect, useState } from 'react';
import { Address } from '../../types';
import { getUserAddresses, deleteUserAddress } from '../services/addressService';
import { MapPin, Trash2, Plus, CheckCircle, Loader } from 'lucide-react';
import { Button } from './Button';

interface SavedAddressListProps {
    userId: string;
    onSelect: (address: Address) => void;
    onAddNew: () => void;
    selectedId?: string;
}

export const SavedAddressList: React.FC<SavedAddressListProps> = ({ userId, onSelect, onAddNew, selectedId }) => {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);

    const refresh = async () => {
        setLoading(true);
        const data = await getUserAddresses(userId);
        setAddresses(data);
        
        // Auto-select default if none selected
        if (!selectedId) {
            const def = data.find(a => a.isDefault);
            if (def) onSelect(def);
        }
        setLoading(false);
    };

    useEffect(() => {
        refresh();
    }, [userId]);

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if(window.confirm("Delete this address?")) {
            await deleteUserAddress(userId, id);
            refresh();
        }
    };

    if (loading) return <div className="p-4 text-center text-slate-500"><Loader className="w-5 h-5 animate-spin mx-auto" /> Loading addresses...</div>;

    if (addresses.length === 0) return null;

    return (
        <div className="space-y-3 mb-6 animate-in fade-in slide-in-from-top-2">
            <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide flex items-center justify-between">
                Saved Addresses
                <button onClick={onAddNew} className="text-brand-600 text-xs flex items-center gap-1 hover:underline lowercase font-medium normal-case">
                    <Plus className="w-3 h-3" /> Add new
                </button>
            </h3>
            
            <div className="grid grid-cols-1 gap-3">
                {addresses.map(addr => (
                    <div 
                        key={addr.id}
                        onClick={() => onSelect(addr)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all relative group ${
                            selectedId === addr.id 
                            ? 'border-brand-600 bg-brand-50 shadow-sm' 
                            : 'border-slate-200 hover:border-brand-200 bg-white'
                        }`}
                    >
                        <div className="flex items-start gap-3">
                            <MapPin className={`w-5 h-5 mt-0.5 ${selectedId === addr.id ? 'text-brand-600' : 'text-slate-400'}`} />
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-slate-900">{addr.name}</span>
                                    {addr.isDefault && <span className="bg-brand-100 text-brand-700 text-[10px] px-2 py-0.5 rounded-full font-bold">DEFAULT</span>}
                                </div>
                                <p className="text-sm text-slate-600 leading-snug">{addr.street}</p>
                                <p className="text-sm text-slate-600">{addr.city}, {addr.state} - {addr.zip}</p>
                                <p className="text-xs text-slate-500 mt-1">Phone: {addr.phone}</p>
                            </div>
                            {selectedId === addr.id && <CheckCircle className="w-5 h-5 text-brand-600" />}
                        </div>

                        <button 
                            onClick={(e) => handleDelete(e, addr.id)}
                            className="absolute top-2 right-2 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
            
            <div className="flex items-center gap-2 my-4">
                <div className="h-px bg-slate-200 flex-1"></div>
                <span className="text-xs text-slate-400 font-medium">OR</span>
                <div className="h-px bg-slate-200 flex-1"></div>
            </div>
        </div>
    );
};
