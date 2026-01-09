
import React, { useState, useEffect, useMemo } from 'react';
import { useCart } from '../context/CartContext';
import { Button } from '../components/Button';
import { useNavigate } from 'react-router-dom';
import { generateInvoice } from '../services/pdfService';
import { fetchLocationByPincode } from '../services/pincodeService';
import { 
  CheckCircle, AlertTriangle, ShieldCheck, CreditCard, Banknote, 
  MapPin, ChevronDown, ChevronUp, Loader, Truck, Download, Search 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { startPayment } from '../services/paymentService';

export const Checkout: React.FC = () => {
  const { state, dispatch } = useCart();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [orderId, setOrderId] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showMobileSummary, setShowMobileSummary] = useState(false);
  
  // Pincode Lookup State
  const [fetchingPincode, setFetchingPincode] = useState(false);
  const [pincodeError, setPincodeError] = useState(false);
  
  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<'ONLINE' | 'COD'>('ONLINE');

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    email: '',
    phone: ''
  });

  // Validation State
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-fill City/State based on Pincode
  useEffect(() => {
    const lookupPincode = async () => {
      if (formData.zip.length === 6) {
        setFetchingPincode(true);
        setPincodeError(false);
        
        const location = await fetchLocationByPincode(formData.zip);
        
        setFetchingPincode(false);
        
        if (location) {
          setFormData(prev => ({ 
            ...prev, 
            city: location.city, 
            state: location.state 
          }));
          // Clear any existing errors for these fields
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.city;
            delete newErrors.state;
            delete newErrors.zip;
            return newErrors;
          });
        } else {
          setPincodeError(true); // Hint to user to enter manually
        }
      }
    };

    // Debounce slightly to avoid rapid calls if typing fast (though service handles redundant calls)
    const timeoutId = setTimeout(lookupPincode, 300);
    return () => clearTimeout(timeoutId);
  }, [formData.zip]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error on type
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName) newErrors.firstName = "First name is required";
    if (!formData.lastName) newErrors.lastName = "Last name is required";
    if (!formData.phone || formData.phone.length < 10) newErrors.phone = "Valid phone required";
    if (!formData.address) newErrors.address = "Address is required";
    if (!formData.zip || formData.zip.length !== 6) newErrors.zip = "6-digit Pincode required";
    if (!formData.city) newErrors.city = "City is required";
    if (!formData.state) newErrors.state = "State is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
        // Scroll to top error
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }

    setLoading(true);
    setErrorMsg(null);

    const result = await startPayment({
      total: state.total,
      items: state.items,
      user: formData,
      method: paymentMethod
    });

    setLoading(false);

    if (result.success && result.orderId) {
      setOrderId(result.orderId);
      setPaymentStatus('success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setPaymentStatus('failed');
      setErrorMsg(result.error || "Payment failed. Please try again.");
    }
  };

  const handleDownloadInvoice = () => {
      generateInvoice(
          orderId,
          {
              name: `${formData.firstName} ${formData.lastName}`,
              email: formData.email,
              address: formData.address,
              city: formData.city,
              zip: formData.zip
          },
          state.items,
          state.total
      );
  };

  const handleFinish = () => {
      dispatch({ type: 'CLEAR_CART' });
      navigate('/');
  };

  // --- SUCCESS VIEW ---
  if (paymentStatus === 'success') {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="bg-white max-w-md w-full rounded-2xl shadow-xl p-8 text-center"
            >
                <motion.div 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }} 
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-6"
                >
                    <CheckCircle className="w-10 h-10" />
                </motion.div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Order Confirmed!</h1>
                <p className="text-slate-500 mb-6">
                    Thank you, {formData.firstName}.<br/> Your order <span className="font-mono font-bold text-slate-900">#{orderId}</span> has been placed.
                </p>
                
                {paymentMethod === 'COD' && (
                    <div className="bg-amber-50 text-amber-800 p-4 rounded-xl text-sm mb-6 border border-amber-200 text-left flex gap-3">
                        <Banknote className="w-5 h-5 shrink-0" />
                        <span>Please keep <strong>₹{state.total}</strong> cash ready at delivery.</span>
                    </div>
                )}
                
                <div className="space-y-3">
                    <Button onClick={handleDownloadInvoice} variant="outline" className="w-full flex items-center justify-center gap-2">
                        <Download className="w-4 h-4" /> Download Invoice
                    </Button>
                    <Button onClick={handleFinish} className="w-full">
                        Continue Shopping
                    </Button>
                </div>
            </motion.div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
              <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-green-600" /> Secure Checkout
              </h1>
              <span className="text-sm text-slate-500 hidden sm:block">Step 2 of 2</span>
          </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
        <div className="flex flex-col-reverse lg:flex-row gap-8 lg:gap-12">
          
          {/* LEFT COLUMN: FORM */}
          <div className="flex-1 space-y-6">
            
            {/* Error Banner */}
            <AnimatePresence>
                {paymentStatus === 'failed' && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl flex items-start gap-3"
                >
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" /> 
                    <div>
                        <p className="font-bold text-sm">Transaction Failed</p>
                        <p className="text-sm">{errorMsg}</p>
                    </div>
                </motion.div>
                )}
            </AnimatePresence>

            <form id="checkout-form" onSubmit={handleCheckout} className="space-y-8">
                
                {/* Section 1: Delivery */}
                <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs">1</div>
                        Delivery Details
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <InputGroup label="First Name" name="firstName" value={formData.firstName} onChange={handleInputChange} error={errors.firstName} />
                        <InputGroup label="Last Name" name="lastName" value={formData.lastName} onChange={handleInputChange} error={errors.lastName} />
                        
                        <div className="md:col-span-2">
                            <InputGroup 
                                label="Phone Number" 
                                name="phone" 
                                type="tel" 
                                value={formData.phone} 
                                onChange={(e) => {
                                    // Only allow numbers
                                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                    setFormData({...formData, phone: val});
                                }} 
                                prefix="+91"
                                error={errors.phone}
                                inputMode="numeric"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <InputGroup label="Flat, House no., Building, Company" name="address" value={formData.address} onChange={handleInputChange} error={errors.address} />
                        </div>

                        <div>
                            <InputGroup 
                                label="Pincode" 
                                name="zip" 
                                value={formData.zip} 
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                                    setFormData({...formData, zip: val});
                                }} 
                                error={errors.zip}
                                inputMode="numeric"
                                hint={pincodeError ? "Could not find details. Please enter manually." : "Auto-fills City & State"}
                                isLoading={fetchingPincode}
                            />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <InputGroup 
                                label="City" 
                                name="city" 
                                value={formData.city} 
                                onChange={handleInputChange} 
                                error={errors.city} 
                                // Keep editable but maybe apply visual style if auto-filled
                            />
                            <InputGroup 
                                label="State" 
                                name="state" 
                                value={formData.state} 
                                onChange={handleInputChange}
                                error={errors.state}
                            />
                        </div>

                        <div className="md:col-span-2">
                            <InputGroup label="Email Address" name="email" type="email" value={formData.email} onChange={handleInputChange} />
                        </div>
                    </div>
                </section>

                {/* Section 2: Payment */}
                <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs">2</div>
                        Payment Method
                    </h2>

                    <div className="space-y-4">
                        <PaymentOption 
                            id="ONLINE"
                            title="Pay Online"
                            description="UPI, Cards, NetBanking, Wallet"
                            icon={CreditCard}
                            selected={paymentMethod === 'ONLINE'}
                            onSelect={() => setPaymentMethod('ONLINE')}
                            badge="Fastest"
                        />
                        <PaymentOption 
                            id="COD"
                            title="Cash on Delivery"
                            description="Pay with cash or UPI upon delivery"
                            icon={Banknote}
                            selected={paymentMethod === 'COD'}
                            onSelect={() => setPaymentMethod('COD')}
                        />
                    </div>
                </section>
            </form>
          </div>

          {/* RIGHT COLUMN: ORDER SUMMARY */}
          <div className="lg:w-96 shrink-0">
             {/* Mobile Summary Toggle */}
             <div className="lg:hidden bg-white rounded-xl shadow-sm border border-slate-200 mb-6 overflow-hidden">
                <button 
                    onClick={() => setShowMobileSummary(!showMobileSummary)}
                    className="w-full flex items-center justify-between p-4 bg-slate-50"
                >
                    <span className="font-bold text-slate-700 flex items-center gap-2">
                        <Truck className="w-4 h-4" /> Order Summary
                    </span>
                    <span className="flex items-center gap-2 text-brand-600 font-bold">
                        ₹{state.total}
                        {showMobileSummary ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                </button>
                <AnimatePresence>
                    {showMobileSummary && (
                        <motion.div 
                            initial={{ height: 0 }} 
                            animate={{ height: 'auto' }} 
                            exit={{ height: 0 }}
                            className="overflow-hidden border-t border-slate-200"
                        >
                            <SummaryContent items={state.items} total=₹{state.total} />
                        </motion.div>
                    )}
                </AnimatePresence>
             </div>

             {/* Desktop Summary Sticky */}
             <div className="hidden lg:block sticky top-24">
                 <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50">
                        <h3 className="font-bold text-slate-800">Order Summary</h3>
                    </div>
                    <SummaryContent items={state.items} total={state.total} />
                 </div>
                 
                 <div className="mt-6 space-y-3">
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                        <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" />
                        <p>Payments are 100% encrypted and secured by Razorpay.</p>
                    </div>
                 </div>
             </div>
          </div>

        </div>
      </div>

      {/* MOBILE STICKY BOTTOM BAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:hidden z-40">
         <div className="flex gap-4 items-center">
             <div className="flex-1">
                 <p className="text-xs text-slate-500 uppercase font-bold">Total Payable</p>
                 <p className="text-xl font-bold text-slate-900">₹{state.total}</p>
             </div>
             <Button 
                onClick={(e) => {
                    // Trigger form submit from outside
                    const form = document.getElementById('checkout-form') as HTMLFormElement;
                    if(form) form.requestSubmit();
                }}
                className="flex-1 py-3 text-base shadow-lg shadow-brand-200"
                loading={loading}
             >
                {loading ? 'Processing' : `Pay ₹${state.total}`}
             </Button>
         </div>
      </div>

      {/* DESKTOP SUBMIT BUTTON (Hidden on Mobile due to sticky bar) */}
      <div className="hidden md:block fixed bottom-0 left-0 right-0 lg:static">
          {/* This logic is handled by the form submit inside the layout on desktop, 
              but we need to ensure the button exists inside the form for accessibility/enter key */}
          <div className="max-w-7xl mx-auto px-4 relative">
             <div className="absolute bottom-10 right-[420px] w-64 hidden lg:block">
                 <Button 
                    form="checkout-form"
                    type="submit" 
                    className="w-full py-4 text-lg shadow-xl shadow-brand-200 transform transition-transform hover:-translate-y-1"
                    loading={loading}
                 >
                    {loading ? 'Processing Order...' : `Pay ₹${state.total}`}
                 </Button>
             </div>
          </div>
      </div>

    </div>
  );
};

// --- SUB COMPONENTS ---

const InputGroup: React.FC<any> = ({ label, error, prefix, hint, isLoading, className, ...props }) => (
    <div className={`space-y-1.5 ${className}`}>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</label>
        <div className="relative">
            {prefix && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium text-sm border-r border-slate-300 pr-2">
                    {prefix}
                </div>
            )}
            <input 
                {...props}
                className={`w-full p-3 bg-slate-50 border rounded-lg outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400
                    ${prefix ? 'pl-14' : ''}
                    ${error ? 'border-red-300 focus:ring-2 focus:ring-red-100' : 'border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-50'}
                    ${props.disabled ? 'opacity-60 cursor-not-allowed' : ''}
                `}
            />
            {isLoading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader className="w-4 h-4 text-brand-600 animate-spin" />
              </div>
            )}
        </div>
        {error && <p className="text-xs text-red-500 font-medium flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {error}</p>}
        {hint && !error && <p className={`text-[10px] ${hint.includes('manual') ? 'text-amber-600' : 'text-slate-400'}`}>{hint}</p>}
    </div>
);

const PaymentOption: React.FC<any> = ({ title, description, icon: Icon, selected, onSelect, badge }) => (
    <div 
        onClick={onSelect}
        className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 group
            ${selected 
                ? 'border-brand-600 bg-brand-50 shadow-sm' 
                : 'border-slate-200 hover:border-brand-200 bg-white'
            }
        `}
    >
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0
            ${selected ? 'border-brand-600' : 'border-slate-300'}
        `}>
            {selected && <div className="w-2.5 h-2.5 rounded-full bg-brand-600" />}
        </div>
        
        <div className={`p-2 rounded-lg ${selected ? 'bg-white text-brand-600' : 'bg-slate-100 text-slate-500'}`}>
            <Icon className="w-6 h-6" />
        </div>

        <div className="flex-1">
            <h3 className={`font-bold text-sm ${selected ? 'text-brand-900' : 'text-slate-700'}`}>{title}</h3>
            <p className="text-xs text-slate-500">{description}</p>
        </div>

        {badge && (
            <span className="absolute top-3 right-3 text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase tracking-wide">
                {badge}
            </span>
        )}
    </div>
);

const SummaryContent: React.FC<any> = ({ items, total }) => (
    <div className="p-4 bg-white">
        <div className="space-y-4 mb-6">
            {items.map((item: any) => (
                <div key={`${item.id}-${item.selectedLens?.id}`} className="flex gap-3">
                    <div className="w-16 h-16 bg-slate-100 rounded-md overflow-hidden shrink-0 border border-slate-200">
                        <img src={item.image} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{item.name}</p>
                        <p className="text-xs text-slate-500 mb-1">{item.selectedLens?.name}</p>
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-medium text-slate-500">Qty: {item.quantity}</span>
                            <span className="text-sm font-bold text-slate-900">₹{(item.price + (item.selectedLens?.price || 0)) * item.quantity}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
        
        <div className="space-y-2 border-t border-slate-100 pt-4 text-sm">
            <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>₹{total}</span>
            </div>
            <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span className="text-green-600 font-medium">Free</span>
            </div>
            <div className="flex justify-between text-slate-900 font-bold text-lg pt-2 border-t border-slate-100 mt-2">
                <span>Total</span>
                <span>₹{total}</span>
            </div>
        </div>
    </div>
);
