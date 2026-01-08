
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Facebook, 
  Instagram, 
  Twitter,
  ShieldCheck,
  MessageCircle
} from 'lucide-react';
import { Logo } from './Logo';

interface FooterProps {
  isAdmin?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ isAdmin = false }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white text-slate-800 border-t border-slate-100 font-sans pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* 1. Brand & Trust - SINGLE LOGO SOURCE */}
          <div className="space-y-6">
            <Logo variant="full" size="lg" />
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
              India's favorite online optical store. We provide high-quality eyewear at honest prices, delivered directly to your doorstep.
            </p>
            <div className="flex gap-4">
               <SocialIcon icon={Instagram} />
               <SocialIcon icon={Facebook} />
               <SocialIcon icon={Twitter} />
            </div>
          </div>

          {/* 2. Quick Links */}
          <div>
            <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-wider text-xs">Shop</h4>
            <ul className="space-y-4 text-sm">
              <li><FooterLink to="/shop">All Eyeglasses</FooterLink></li>
              <li><FooterLink to="/shop?category=sunglasses">Sunglasses</FooterLink></li>
              <li><FooterLink to="/shop?category=men">Men's Collection</FooterLink></li>
              <li><FooterLink to="/shop?category=women">Women's Collection</FooterLink></li>
              <li><Link to="/eye-test" className="text-brand-600 font-bold hover:underline">Free Eye Test</Link></li>
            </ul>
          </div>

          {/* 3. Customer Service */}
          <div>
            <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-wider text-xs">Support</h4>
            <ul className="space-y-4 text-sm">
              <li><FooterLink to="/orders">Track Order</FooterLink></li>
              <li><FooterLink to="/contact">Contact & Feedback</FooterLink></li>
              <li><FooterLink to="/privacy-policy">Privacy Policy</FooterLink></li>
              <li><FooterLink to="/terms-conditions">Terms & Conditions</FooterLink></li>
              {isAdmin && <li><Link to="/admin" className="text-amber-600 font-bold text-xs bg-amber-50 px-2 py-1 rounded">Admin Panel</Link></li>}
            </ul>
          </div>

          {/* 4. Contact Us */}
          <div className="space-y-6">
            <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-wider text-xs">Contact</h4>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand-600 mt-0.5 shrink-0" />
                <p className="text-sm text-slate-500">
                  Eye Care Optical, Near Gahoi Vatika, Peetambra Road,<br/>
                  Gahoi Colony, Datia-475661, Madhya Pradesh
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-brand-600 shrink-0" />
                <p className="text-sm font-bold text-slate-800">+91 80053 43226</p>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-brand-600 shrink-0" />
                <p className="text-sm text-slate-600">support@optistyle.in</p>
              </div>
            </div>
            
            <Link 
              to="/contact"
              className="inline-flex items-center gap-2 bg-slate-50 text-slate-700 px-5 py-2.5 rounded-full border border-slate-200 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 transition-all text-xs font-bold"
            >
              <MessageCircle className="w-4 h-4" /> Live Chat
            </Link>
          </div>

        </div>

        {/* Footer Bottom */}
        <div className="mt-16 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-slate-400">
            © {currentYear} OptiStyle India Pvt Ltd. All rights reserved.
          </p>
          
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full">
                <ShieldCheck className="w-3 h-3 text-green-600" />
                <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wide">100% Secure Payments</span>
             </div>
             <img src="https://cdn-icons-png.flaticon.com/512/196/196566.png" alt="UPI" className="h-5 opacity-60 grayscale hover:grayscale-0 transition-all" />
             <img src="https://cdn-icons-png.flaticon.com/512/196/196578.png" alt="Visa" className="h-5 opacity-60 grayscale hover:grayscale-0 transition-all" />
          </div>
        </div>
      </div>
    </footer>
  );
};

const SocialIcon: React.FC<{ icon: any }> = ({ icon: Icon }) => (
  <a href="#" className="p-2.5 bg-slate-50 rounded-full hover:bg-brand-600 hover:text-white transition-all text-slate-400 group">
    <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
  </a>
);

const FooterLink: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => (
  <Link to={to} className="text-slate-500 hover:text-brand-600 hover:translate-x-1 transition-all inline-block">
    {children}
  </Link>
);
