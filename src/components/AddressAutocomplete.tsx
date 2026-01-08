import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { MapPin, Loader, X } from 'lucide-react';

interface Props {
  value: string;
  onChange: (val: string) => void;
  onSelect: (data: any) => void;
  placeholder?: string;
  error?: string;
  name?: string;
}

export const AddressAutocomplete: React.FC<Props> = ({ value, onChange, onSelect, placeholder, error, name }) => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  // Debounce API call
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (value.length > 3 && showDropdown) {
        setLoading(true);
        try {
          const { data } = await api.get(`/address/autocomplete?input=${encodeURIComponent(value)}`);
          setSuggestions(data.suggestions || []);
        } catch (e) {
          console.error(e);
          setSuggestions([]);
        } finally {
          setLoading(false);
        }
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [value, showDropdown]);

  const handleSelect = (item: any) => {
    // Parse the suggestion to extract useful bits
    // Note: Mock/OSM data structure varies from Google. We try to normalize in backend, 
    // but here we ensure we pass a clean object.
    
    // Auto-fill logic happens in parent, we just pass the raw item or normalized item
    const normalized = {
        description: item.description,
        main_text: item.structured_formatting?.main_text,
        city: item.terms?.[1]?.value, // Fallback parsing
        state: item.terms?.[2]?.value,
        zip: item.terms?.[3]?.value
    };
    
    onSelect(normalized);
    setShowDropdown(false);
  };

  return (
    <div className="space-y-1.5 relative" ref={wrapperRef}>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Address Line 1</label>
        <div className="relative">
            <input 
                name={name}
                value={value}
                onChange={(e) => { onChange(e.target.value); setShowDropdown(true); }}
                placeholder={placeholder}
                className={`w-full p-3 bg-slate-50 border rounded-lg outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400
                    ${error ? 'border-red-300 focus:ring-2 focus:ring-red-100' : 'border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-50'}
                `}
                autoComplete="off"
            />
            {loading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader className="w-4 h-4 text-brand-600 animate-spin" />
                </div>
            )}
            
            {/* Dropdown */}
            {showDropdown && suggestions.length > 0 && (
                <div className="absolute z-50 left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-100 max-h-60 overflow-y-auto divide-y divide-slate-50">
                    {suggestions.map((item) => (
                        <div 
                            key={item.place_id}
                            onClick={() => handleSelect(item)}
                            className="p-3 hover:bg-slate-50 cursor-pointer flex items-start gap-3 transition-colors"
                        >
                            <div className="mt-1 p-1 bg-slate-100 rounded-full text-slate-400">
                                <MapPin className="w-3 h-3" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-800">{item.structured_formatting?.main_text}</p>
                                <p className="text-xs text-slate-500">{item.structured_formatting?.secondary_text}</p>
                            </div>
                        </div>
                    ))}
                    <div className="p-2 bg-slate-50 text-[10px] text-center text-slate-400">
                        Powered by Google / OpenStreetMap
                    </div>
                </div>
            )}
        </div>
        {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
};
