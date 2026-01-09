import React from 'react';
import { FileText, AlertTriangle, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TermsConditions: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-brand-100 rounded-full text-brand-600 mb-4">
            <FileText className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-4">Terms & Conditions</h1>
          <p className="text-lg text-slate-600">
            Please read these rules carefully before using our website.
          </p>
          <p className="text-sm text-slate-400 mt-2">Last Updated: March 15, 2025</p>
        </div>

        {/* Content Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12 space-y-10">

          {/* 1. Introduction */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">1. Introduction & Agreement</h2>
            <p className="text-slate-600 leading-relaxed">
              Welcome to <strong>OptiStyle India</strong> ("We", "Us", "Our"). By accessing our website, using our AI eye test, or buying our products, you agree to follow these Terms and Conditions. If you do not agree with any part of these terms, please do not use our website.
            </p>
            <p className="text-slate-600 mt-2">
              We want to be transparent and fair. These terms are here to protect both you (the customer) and us (the service provider).
            </p>
          </section>

          {/* 2. Services Provided */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">2. Services We Provide</h2>
            <p className="text-slate-600 mb-2">OptiStyle offers the following services:</p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li><strong>E-commerce:</strong> Selling optical frames, sunglasses, and lenses.</li>
              <li><strong>Vision Screening:</strong> An online tool to estimate your visual acuity.</li>
              <li><strong>Information:</strong> Blogs and content regarding eye health and fashion.</li>
            </ul>
          </section>

          {/* 3. CRITICAL DISCLAIMER */}
          <section className="bg-amber-50 p-6 rounded-xl border border-amber-200">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
              <h2 className="text-xl font-bold text-amber-900">3. Eye Test Medical Disclaimer</h2>
            </div>
            <p className="text-amber-900 font-medium leading-relaxed">
              This is the most important part of our terms. Please read carefully:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-amber-800 mt-3">
                <li>The "Free Eye Test" provided on OptiStyle is a <strong>screening tool only</strong>.</li>
                <li>It is <strong>NOT</strong> a replacement for a comprehensive eye exam by a qualified doctor or optometrist.</li>
                <li>The results are estimates based on your inputs and screen calibration. They may not be 100% accurate.</li>
                <li><strong>We do not provide medical diagnoses.</strong> If you feel eye pain, redness, or sudden vision loss, visit a hospital immediately.</li>
                <li>By using the test, you agree that OptiStyle is not liable for any health issues arising from the use or misuse of this tool.</li>
            </ul>
          </section>

          {/* 4. Orders & Payments */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">4. Orders, Pricing & Payments</h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li><strong>Pricing:</strong> All prices listed are in Indian Rupees (₹) and are inclusive of GST unless stated otherwise.</li>
              <li><strong>Availability:</strong> We try to keep stock updated, but sometimes hot-selling frames might go out of stock after you order. In such cases, we will refund you immediately.</li>
              <li><strong>Payments:</strong> We accept UPI, Credit/Debit Cards, and Netbanking via secure gateways. Cash on Delivery (COD) may be available for specific pincodes.</li>
              <li><strong>Cancellation:</strong> You can cancel your order before it is shipped. Once shipped, it cannot be cancelled, only returned.</li>
            </ul>
          </section>

          {/* 5. Shipping Policy */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">5. Shipping & Delivery</h2>
            <p className="text-slate-600 leading-relaxed">
              We ship to almost every pincode in India. 
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 mt-2">
                <li><strong>Standard Delivery:</strong> Usually takes 3-7 business days depending on your location.</li>
                <li><strong>Delays:</strong> Sometimes, weather or strikes can cause delays. We are not responsible for delays caused by the courier company, but we will help you track your package.</li>
                <li><strong>Damage:</strong> If you receive a damaged box, please do not accept it. Contact us immediately.</li>
            </ul>
          </section>

          {/* 6. Returns & Refunds */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">6. Returns & Refunds Policy</h2>
            <p className="text-slate-600 leading-relaxed">
              We want you to love your glasses. If you don't, we offer a <strong>14-Day Return Policy</strong>.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 mt-2">
                <li>Frames must be unused and in original packaging.</li>
                <li>Customized prescription lenses cannot be fully refunded as they are made specifically for your eyes, but we may offer a partial refund or store credit.</li>
                <li>Refunds are processed to your original payment method within 5-7 days after we receive the return.</li>
            </ul>
          </section>

          {/* 7. User Responsibilities */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">7. User Responsibilities</h2>
            <p className="text-slate-600">When using OptiStyle, you agree to:</p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 mt-2">
                <li>Provide accurate name, address, and phone number.</li>
                <li>Not use the website for any illegal activity or fraud.</li>
                <li>Not attempt to hack, disrupt, or copy our website code or design.</li>
                <li>Ensure your screen is calibrated correctly if taking the eye test.</li>
            </ul>
          </section>

          {/* 8. Intellectual Property */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">8. Intellectual Property</h2>
            <p className="text-slate-600 leading-relaxed">
              All content on this website, including the OptiStyle logo, text, images, the AI code, and design, belongs to OptiStyle India Pvt Ltd. You cannot copy or use our content for your own business without our written permission.
            </p>
          </section>

          {/* 9. Governing Law */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">9. Governing Law</h2>
            <p className="text-slate-600 leading-relaxed">
              These terms are governed by the laws of India. Any disputes arising out of the use of this website will be subject to the exclusive jurisdiction of the courts in <strong>Hyderabad, Telangana</strong>.
            </p>
          </section>

          {/* 10. Contact Information */}
          <section className="border-t border-slate-100 pt-8 mt-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Questions about Terms?</h2>
            <p className="text-slate-600 mb-6">
                If you are confused about any rule, please ask us before buying.
            </p>
            <Link to="/contact">
                <button className="bg-brand-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-brand-700 transition-colors flex items-center gap-2">
                    <HelpCircle className="w-5 h-5" /> Contact Support
                    
                </button>
            </Link>
          </section>

        </div>
      </div>
    </div>
  );
};