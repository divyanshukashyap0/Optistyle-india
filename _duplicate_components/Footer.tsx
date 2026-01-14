import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Eye, 
  MapPin, 
  Phone, 
  Mail, 
  Facebook, 
  Instagram, 
  Twitter,
  ShieldCheck,
  MessageCircle
} from 'lucide-react';

interface FooterProps {
  isAdmin?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ isAdmin = false }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-50 text-slate-800 border-t border-slate-200 font-sans pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* 1. Brand & Trust */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="bg-brand-600 text-white p-2 rounded-lg">
                <Eye className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold text-slate-900">OptiStyle</span>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              India's favorite online optical store. We provide high-quality eyewear at honest prices, delivered directly to your doorstep.
            </p>
            <div className="flex gap-4">
               {/* Social Icons - Simple & Clean */}
               <a href="#" className="p-2 bg-white border border-slate-200 rounded-full hover:bg-brand-50 hover:border-brand-200 transition-colors text-slate-500 hover:text-brand-600">
                  <Instagram className="w-5 h-5" />
               </a>
               <a href="#" className="p-2 bg-white border border-slate-200 rounded-full hover:bg-brand-50 hover:border-brand-200 transition-colors text-slate-500 hover:text-brand-600">
                  <Facebook className="w-5 h-5" />
               </a>
               <a href="#" className="p-2 bg-white border border-slate-200 rounded-full hover:bg-brand-50 hover:border-brand-200 transition-colors text-slate-500 hover:text-brand-600">
                  <Twitter className="w-5 h-5" />
               </a>
            </div>
          </div>

          {/* 2. Quick Links */}
          <div>
            <h4 className="font-bold text-slate-900 mb-4 uppercase tracking-wider text-sm">Shop</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/shop" className="text-slate-600 hover:text-brand-600 hover:underline">Eyeglasses</Link></li>
              <li><Link to="/shop?category=sunglasses" className="text-slate-600 hover:text-brand-600 hover:underline">Sunglasses</Link></li>
              <li><Link to="/shop?category=men" className="text-slate-600 hover:text-brand-600 hover:underline">Men's Collection</Link></li>
              <li><Link to="/shop?category=women" className="text-slate-600 hover:text-brand-600 hover:underline">Women's Collection</Link></li>
              <li><Link to="/eye-test" className="text-brand-600 font-bold hover:underline">Free Eye Test</Link></li>
            </ul>
          </div>

          {/* 3. Customer Service */}
          <div>
            <h4 className="font-bold text-slate-900 mb-4 uppercase tracking-wider text-sm">Help & Support</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/orders" className="text-slate-600 hover:text-brand-600">Track Order</Link></li>
              <li><Link to="/contact" className="text-slate-600 hover:text-brand-600">Contact Us / Feedback</Link></li>
              <li><Link to="/privacy-policy" className="text-slate-600 hover:text-brand-600">Privacy Policy</Link></li>
              <li><Link to="/terms-conditions" className="text-slate-600 hover:text-brand-600">Terms & Conditions</Link></li>
              {isAdmin && <li><Link to="/admin" className="text-amber-600 font-bold">Admin Panel</Link></li>}
            </ul>
          </div>

          {/* 4. Contact Us (Local & Trustworthy) */}
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 mb-4 uppercase tracking-wider text-sm">Contact Us</h4>
            
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-brand-600 mt-0.5 shrink-0" />
              <p className="text-sm text-slate-600">
                Eye Care Optical, Near Gahoi Vatika, Peetambra Road,<br/>
                Datia-475661, Madhya Pradesh<br/>
                India
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-brand-600 shrink-0" />
              <p className="text-sm font-bold text-slate-800">+91 80053 43226</p>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-brand-600 shrink-0" />
              <p className="text-sm text-slate-600">optistyle.india@gmail.com
</p>
            </div>
            
            <Link 
              to="/contact"
              className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full border border-green-200 hover:bg-green-100 transition-colors text-sm font-bold"
            >
              <MessageCircle className="w-4 h-4" /> Chat / Feedback
            </Link>
          </div>

        </div>

        {/* Footer Bottom */}
        <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500">
            © {currentYear} OptiStyle India Pvt Ltd. All rights reserved.
          </p>
          
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-full shadow-sm">
                <ShieldCheck className="w-4 h-4 text-green-600" />
                <span className="text-xs font-semibold text-slate-700">100% Secure Payments</span>
             </div>
             <img src="https://cdn-icons-png.flaticon.com/512/196/196566.png" alt="UPI" className="h-6 opacity-70" />
             <img src="https://cdn-icons-png.flaticon.com/512/196/196578.png" alt="Visa" className="h-6 opacity-70" />
          </div>
        </div>
      </div>
    </footer>
  );
};