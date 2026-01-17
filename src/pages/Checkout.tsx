
import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { useNavigate } from 'react-router-dom';
import { saveUserAddress } from '../services/addressService';
import { api, downloadOrderInvoice } from '../services/api';
import { 
  CheckCircle, AlertTriangle, ShieldCheck, CreditCard, Banknote, 
  ChevronDown, ChevronUp, Truck, Download, MessageCircle, Save, Loader
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { startPayment } from '../services/paymentService';
import { AddressAutocomplete } from '../components/AddressAutocomplete';
import { SavedAddressList } from '../components/SavedAddressList';
import { Address, CartItem } from '../types';

// Define strict form shape
interface CheckoutForm {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  email: string;
  phone: string;
}

export const Checkout: React.FC = () => {
  const { state, dispatch } = useCart();
  const { user, uid } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [orderId, setOrderId] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showMobileSummary, setShowMobileSummary] = useState(false);
  
  const [paymentMethod, setPaymentMethod] = useState<'ONLINE' | 'COD'>('ONLINE');
  const [selectedSavedAddressId, setSelectedSavedAddressId] = useState<string | null>(null);
  const [saveNewAddress, setSaveNewAddress] = useState(true);

  const [deliveryInfo, setDeliveryInfo] = useState<{available: boolean, message: string, type?: string, cod?: boolean} | null>(null);
  const [checkingDelivery, setCheckingDelivery] = useState(false);

  const [orderItems, setOrderItems] = useState<CartItem[]>(state.items);
  const [orderTotal, setOrderTotal] = useState(state.total);

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CheckoutForm>({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    address: '',
    city: '',
    state: '',
    zip: '',
    email: user?.email || '',
    phone: ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutForm, string>>>({});

  const cartTotal = state.total;
  const discount = appliedCoupon ? appliedCoupon.discount : 0;
  const payableTotal = Math.max(0, cartTotal - discount);

  useEffect(() => {
    if (state.items.length === 0 && paymentStatus !== 'success') {
      navigate('/shop');
    }
  }, [state.items, paymentStatus, navigate]);

  // Debounced Delivery Check
  useEffect(() => {
    const checkPin = async () => {
      if (formData.zip.length === 6) {
        setCheckingDelivery(true);
        try {
          const { data } = await api.post('/address/check-delivery', { pincode: formData.zip });
          setDeliveryInfo(data);
          // If COD not available but selected, switch to ONLINE
          if (data.available && !data.cod && paymentMethod === 'COD') {
             setPaymentMethod('ONLINE');
          }
        } catch (e) {
           console.error("Delivery check failed", e);
           setDeliveryInfo(null);
        } finally {
          setCheckingDelivery(false);
        }
      } else {
        setDeliveryInfo(null);
      }
    };
    const timer = setTimeout(checkPin, 600);
    return () => clearTimeout(timer);
  }, [formData.zip, paymentMethod]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name as keyof CheckoutForm]) {
      setErrors(prev => { 
        const n = {...prev}; 
        delete n[name as keyof CheckoutForm]; 
        return n; 
      });
    }
    
    // If user types manually, deselect saved address
    if (selectedSavedAddressId) setSelectedSavedAddressId(null);
  };

  const handleAddressSelect = (suggestion: any) => {
      setFormData(prev => ({
          ...prev,
          address: suggestion.main_text || suggestion.description.split(',')[0],
          city: suggestion.city || prev.city,
          state: suggestion.state || prev.state,
          zip: suggestion.zip || prev.zip
      }));
  };

  const handleSavedAddressSelect = (addr: Address) => {
      setSelectedSavedAddressId(addr.id);
      setFormData({
          firstName: addr.name.split(' ')[0] || '',
          lastName: addr.name.split(' ')[1] || '',
          phone: addr.phone,
          address: addr.street,
          city: addr.city,
          state: addr.state,
          zip: addr.zip,
          email: formData.email // Keep email from auth or current input
      });
  };

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      setCouponError('Please enter a coupon code');
      setAppliedCoupon(null);
      return;
    }
    if (code === 'WELCOME10') {
      const discountValue = Math.round(cartTotal * 0.1);
      if (discountValue <= 0) {
        setCouponError('Cart value too low for this coupon');
        setAppliedCoupon(null);
        return;
      }
      setAppliedCoupon({ code, discount: discountValue });
      setCouponError(null);
    } else {
      setCouponError('Invalid coupon code');
      setAppliedCoupon(null);
    }
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof CheckoutForm, string>> = {};
    if (!formData.firstName) newErrors.firstName = "First name is required";
    if (!formData.lastName) newErrors.lastName = "Last name is required";
    if (!formData.phone || formData.phone.length < 10) newErrors.phone = "Valid phone required";
    if (!formData.address) newErrors.address = "Address is required";
    if (!formData.zip || formData.zip.length !== 6) newErrors.zip = "6-digit Pincode required";
    if (!formData.city) newErrors.city = "City is required";
    if (!formData.state) newErrors.state = "State is required";
    
    // Logical Validation
    if (deliveryInfo && !deliveryInfo.available) {
        newErrors.zip = "Delivery not available to this PIN";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
    }

    setLoading(true);
    setErrorMsg(null);

    // Save address if new and requested
    if (uid && saveNewAddress && !selectedSavedAddressId) {
        try {
            await saveUserAddress(uid, {
                name: `${formData.firstName} ${formData.lastName}`,
                phone: formData.phone,
                street: formData.address,
                city: formData.city,
                state: formData.state,
                zip: formData.zip,
                isDefault: false
            });
        } catch (e) {
            console.error("Failed to save address", e);
            // Non-blocking error
        }
    }

    const result = await startPayment({
      total: payableTotal,
      items: state.items,
      user: formData,
      method: paymentMethod
    });

    setLoading(false);

    if (result.success && result.orderId) {
      setOrderItems(state.items);
      setOrderTotal(payableTotal);
      dispatch({ type: 'CLEAR_CART' });
      setOrderId(result.orderId);
      setPaymentStatus('success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setPaymentStatus('failed');
      setErrorMsg(result.error || "Payment failed. Please try again.");
    }
  };
  
  const retryPayment = async () => {
    setLoading(true);
    setErrorMsg(null);
    const result = await startPayment({
      total: payableTotal,
      items: state.items,
      user: formData,
      method: paymentMethod
    });
    setLoading(false);
    if (result.success && result.orderId) {
      setOrderItems(state.items);
      setOrderTotal(payableTotal);
      dispatch({ type: 'CLEAR_CART' });
      setOrderId(result.orderId);
      setPaymentStatus('success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setPaymentStatus('failed');
      setErrorMsg(result.error || "Payment failed. Please try again.");
    }
  };

  const payWithCOD = async () => {
    setPaymentMethod('COD');
    await retryPayment();
  };

  const handleWhatsAppConfirm = () => {
      const message = `Hi OptiStyle, I confirm my order #${orderId}. Delivery to: ${formData.firstName}, ${formData.address}, ${formData.city} - ${formData.zip}. Contact: ${formData.phone}`;
      const url = `https://wa.me/918005343226?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
  };

  const handleDownloadInvoice = () => {
      if (!orderId) return;
      downloadOrderInvoice(orderId);
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
                    Thank you, {formData.firstName}.<br/> Your order <span className="font-mono font-bold text-slate-900">#{orderId}</span> has been placed, check your mail for order details , if not received check spam folder.
                </p>
                
                <div className="space-y-3">
                    <Button onClick={handleWhatsAppConfirm} className="w-full bg-[#25D366] hover:bg-[#128C7E] flex items-center justify-center gap-2">
                        <MessageCircle className="w-5 h-5" /> Confirm via WhatsApp
                    </Button>
                    
                    <Button onClick={handleDownloadInvoice} variant="outline" className="w-full flex items-center justify-center gap-2">
                        <Download className="w-4 h-4" /> Download Invoice
                    </Button>
                    <Button onClick={handleFinish} variant="ghost" className="w-full">
                        Continue Shopping
                    </Button>
                </div>
            </motion.div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-12">
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
          
          <div className="flex-1 space-y-6">
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
                        <div className="mt-3 flex flex-wrap gap-2">
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={retryPayment}
                              loading={loading}
                            >
                              Retry Payment
                            </Button>
                            <Button 
                              type="button" 
                              onClick={payWithCOD}
                              loading={loading}
                            >
                              Switch to COD
                            </Button>
                        </div>
                    </div>
                </motion.div>
                )}
            </AnimatePresence>

            <form id="checkout-form" onSubmit={handleCheckout} className="space-y-8">
                <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs">1</div>
                        Delivery Details
                    </h2>
                    
                    {uid && (
                        <SavedAddressList 
                            userId={uid} 
                            selectedId={selectedSavedAddressId || undefined}
                            onSelect={handleSavedAddressSelect}
                            onAddNew={() => setSelectedSavedAddressId(null)}
                        />
                    )}
                    
                    <div className={`grid grid-cols-1 md:grid-cols-2 gap-5 ${selectedSavedAddressId ? 'opacity-50 pointer-events-none grayscale-[0.5]' : ''}`}>
                        <InputGroup label="First Name" name="firstName" value={formData.firstName} onChange={handleInputChange} error={errors.firstName} />
                        <InputGroup label="Last Name" name="lastName" value={formData.lastName} onChange={handleInputChange} error={errors.lastName} />
                        
                        <div className="md:col-span-2">
                            <InputGroup 
                                label="Phone Number" 
                                name="phone" 
                                type="tel" 
                                value={formData.phone} 
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                    setFormData(prev => ({...prev, phone: val}));
                                }} 
                                prefix="+91"
                                error={errors.phone}
                                inputMode="numeric"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <AddressAutocomplete 
                                name="address"
                                value={formData.address}
                                onChange={(val) => setFormData(prev => ({...prev, address: val}))}
                                onSelect={handleAddressSelect}
                                placeholder="Start typing address..."
                                error={errors.address}
                            />
                        </div>

                        <div>
                            <InputGroup 
                                label="Pincode" 
                                name="zip" 
                                value={formData.zip} 
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                                    setFormData(prev => ({...prev, zip: val}));
                                }} 
                                error={errors.zip}
                                inputMode="numeric"
                                isLoading={checkingDelivery}
                            />
                            {deliveryInfo && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className={`mt-2 text-xs font-bold flex items-center gap-1.5 ${deliveryInfo.available ? 'text-green-600' : 'text-red-600'}`}
                                >
                                    {deliveryInfo.available ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                                    {deliveryInfo.message}
                                </motion.div>
                            )}
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <InputGroup label="City" name="city" value={formData.city} onChange={handleInputChange} error={errors.city} />
                            <InputGroup label="State" name="state" value={formData.state} onChange={handleInputChange} error={errors.state} />
                        </div>

                        <div className="md:col-span-2">
                            <InputGroup label="Email Address" name="email" type="email" value={formData.email} onChange={handleInputChange} />
                        </div>

                        {uid && !selectedSavedAddressId && (
                            <div className="md:col-span-2">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${saveNewAddress ? 'bg-brand-600 border-brand-600 text-white' : 'border-slate-300'}`}>
                                        {saveNewAddress && <Save className="w-3 h-3" />}
                                    </div>
                                    <input type="checkbox" className="hidden" checked={saveNewAddress} onChange={() => setSaveNewAddress(!saveNewAddress)} />
                                    <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900">Save this address for next time</span>
                                </label>
                            </div>
                        )}
                    </div>
                </section>

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
                            description={deliveryInfo && !deliveryInfo.cod ? "Not available for this pincode" : "Pay with cash or UPI upon delivery"}
                            icon={Banknote}
                            selected={paymentMethod === 'COD'}
                            onSelect={() => setPaymentMethod('COD')}
                            disabled={deliveryInfo && !deliveryInfo.available ? false : (deliveryInfo && !deliveryInfo.cod)}
                        />
                    </div>
                </section>
            </form>
          </div>

          <div className="lg:w-96 shrink-0">
            <div className="lg:hidden bg-white rounded-xl shadow-sm border border-slate-200 mb-6 overflow-hidden">
                <button 
                    onClick={() => setShowMobileSummary(!showMobileSummary)}
                    className="w-full flex items-center justify-between p-4 bg-slate-50"
                >
                    <span className="font-bold text-slate-700 flex items-center gap-2">
                        <Truck className="w-4 h-4" /> Order Summary
                    </span>
                    <span className="flex items-center gap-2 text-brand-600 font-bold">
                        ₹{payableTotal}
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
                            <CouponBox
                                couponCode={couponCode}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                  setCouponCode(e.target.value);
                                  if (couponError) setCouponError(null);
                                }}
                                onApply={handleApplyCoupon}
                                error={couponError}
                                appliedCoupon={appliedCoupon}
                            />
                            <SummaryContent
                                items={state.items}
                                subtotal={cartTotal}
                                total={payableTotal}
                                discount={discount}
                                couponCode={appliedCoupon?.code}
                                deliveryInfo={deliveryInfo}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
             </div>

             <div className="hidden lg:block sticky top-24">
                 <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50">
                        <h3 className="font-bold text-slate-800">Order Summary</h3>
                    </div>
                    <CouponBox
                      couponCode={couponCode}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setCouponCode(e.target.value);
                        if (couponError) setCouponError(null);
                      }}
                      onApply={handleApplyCoupon}
                      error={couponError}
                      appliedCoupon={appliedCoupon}
                    />
                    <SummaryContent
                      items={state.items}
                      subtotal={cartTotal}
                      total={payableTotal}
                      discount={discount}
                      couponCode={appliedCoupon?.code}
                      deliveryInfo={deliveryInfo}
                    />
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

         <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:hidden z-40">
         <div className="flex gap-4 items-center">
             <div className="flex-1">
                 <p className="text-xs text-slate-500 uppercase font-bold">Total Payable</p>
                <p className="text-xl font-bold text-slate-900">₹{payableTotal}</p>
             </div>
             <Button 
                onClick={() => {
                    const form = document.getElementById('checkout-form') as HTMLFormElement;
                    if(form) form.requestSubmit();
                }}
                className="flex-1 py-3 text-base shadow-lg shadow-brand-200"
                loading={loading}
             >
                {loading ? 'Processing' : `Pay ₹${payableTotal}`}
             </Button>
         </div>
      </div>

      <div className="hidden md:block fixed bottom-0 left-0 right-0 lg:static">
             <div className="max-w-7xl mx-auto px-4 relative">
             <div className="absolute bottom-10 right-[420px] w-64 hidden lg:block">
                 <Button 
                    form="checkout-form"
                    type="submit" 
                    className="w-full py-4 text-lg shadow-xl shadow-brand-200 transform transition-transform hover:-translate-y-1"
                    loading={loading}
                 >
                    {loading ? 'Processing Order...' : `Pay ₹${payableTotal}`}
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

const CouponBox: React.FC<any> = ({ couponCode, onChange, onApply, error, appliedCoupon }) => (
    <div className="p-4 border-b border-slate-100 bg-slate-50 space-y-3">
        <div className="flex gap-2">
            <input
                value={couponCode}
                onChange={onChange}
                placeholder="Enter coupon code"
                className="flex-1 text-sm border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 uppercase"
            />
            <Button type="button" onClick={onApply} className="px-4">
                Apply
            </Button>
        </div>
        {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
        {!error && appliedCoupon && (
            <p className="text-xs text-green-600 font-medium">
                Coupon {appliedCoupon.code} applied – you saved ₹{appliedCoupon.discount}
            </p>
        )}
    </div>
);

const PaymentOption: React.FC<any> = ({ title, description, icon: Icon, selected, onSelect, badge, disabled }) => (
    <div 
        onClick={!disabled ? onSelect : undefined}
        className={`relative p-4 rounded-xl border-2 transition-all flex items-center gap-4 group
            ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-200' : 'cursor-pointer'}
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

        {badge && !disabled && (
            <span className="absolute top-3 right-3 text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase tracking-wide">
                {badge}
            </span>
        )}
    </div>
);

const SummaryContent: React.FC<any> = ({ items, subtotal, total, discount, couponCode, deliveryInfo }) => (
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
                <span>₹{subtotal}</span>
            </div>
            {discount > 0 && (
                <div className="flex justify-between text-green-600">
                    <span className="text-sm">
                        Coupon{couponCode ? ` (${couponCode})` : ''}
                    </span>
                    <span className="text-sm font-medium">-₹{discount}</span>
                </div>
            )}
            <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                {deliveryInfo?.type === 'EXPRESS' ? (
                    <span className="text-brand-600 font-bold flex items-center gap-1">
                        <Loader className="w-3 h-3 animate-spin" /> Calc...
                    </span>
                ) : (
                    <span className="text-green-600 font-medium">Free</span>
                )}
            </div>
            <div className="flex justify-between text-slate-900 font-bold text-lg pt-2 border-t border-slate-100 mt-2">
                <span>Total</span>
                <span>₹{total}</span>
            </div>
        </div>
    </div>
);
