import React from 'react';
import { Shield, Lock, Eye, Mail, Phone, MapPin } from 'lucide-react';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-brand-100 rounded-full text-brand-600 mb-4">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-4">Privacy Policy</h1>
          <p className="text-lg text-slate-600">
            Your trust is our priority. Here is how we protect your information.
          </p>
          <p className="text-sm text-slate-400 mt-2">Last Updated: March 15, 2025</p>
        </div>

        {/* Content Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12 space-y-10">

          {/* 1. Introduction */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">1. Who We Are & Why This Matters</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Welcome to <strong>OptiStyle India</strong>. We are an online eyewear store committed to helping you see better and look great. We understand that when you shop online or take an eye test, you are trusting us with your personal details.
            </p>
            <p className="text-slate-600 leading-relaxed">
              This Privacy Policy explains exactly what information we collect, why we need it, and how we keep it safe. We have written this in simple English because we believe you have the right to understand exactly what happens with your data.
            </p>
          </section>

          {/* 2. Information We Collect */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">2. Information We Collect From You</h2>
            <p className="text-slate-600 mb-4">
              To provide you with the best service, we collect the following types of information:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li><strong>Personal Details:</strong> Your name, phone number, and email address. We need your phone number to send order updates via SMS or WhatsApp, which is common in India.</li>
              <li><strong>Delivery Information:</strong> Your complete physical address, landmark, and pincode so our delivery partners can find you easily.</li>
              <li><strong>Eye Test Data:</strong> If you use our AI Vision Screening, we collect data about your visual acuity and color perception. <strong>Note:</strong> This is used only to generate your report and is not a medical record.</li>
              <li><strong>Device Information:</strong> We may look at what device (mobile or laptop) you are using to ensure our website works smoothly for you.</li>
            </ul>
          </section>

          {/* 3. How We Use Your Information */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">3. How We Use Your Information</h2>
            <p className="text-slate-600 mb-4">We do not sell your personal data. We strictly use it for:</p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li><strong>Processing Orders:</strong> To confirm your order, print your invoice, and ship your glasses.</li>
              <li><strong>Customer Support:</strong> If you call us, we pull up your details to help you faster.</li>
              <li><strong>Vision Analysis:</strong> Our AI engine uses your inputs to estimate your eye power and suggest frames.</li>
              <li><strong>Communication:</strong> To send you the Invoice, Eye Test Certificate, and tracking updates.</li>
              <li><strong>Legal Reasons:</strong> To comply with Indian tax laws (GST) and safety regulations.</li>
            </ul>
          </section>

          {/* 4. Eye Test & Health Data */}
          <section className="bg-brand-50 p-6 rounded-xl border border-brand-100">
            <div className="flex items-center gap-3 mb-3">
              <Eye className="w-6 h-6 text-brand-600" />
              <h2 className="text-xl font-bold text-brand-900">4. Important: Your Eye Test Data</h2>
            </div>
            <p className="text-brand-800 leading-relaxed">
              We treat your vision screening data with high sensitivity. Please understand that <strong>OptiStyle is not a hospital</strong>. The data collected during the eye test is for <em>screening purposes only</em>. We store this data securely to allow you to download your certificate later. We do not share your vision results with advertisers.
            </p>
          </section>

          {/* 5. Cookies */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">5. Cookies & Tracking</h2>
            <p className="text-slate-600 leading-relaxed">
              Cookies are small digital files that live on your browser. We use them to "remember" you. For example, if you add glasses to your cart and close the page, cookies help keep them there when you come back. We also use basic analytics to see which frames are popular in India. You can turn off cookies in your browser settings, but some parts of the site might not work perfectly.
            </p>
          </section>

          {/* 6. Data Sharing */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">6. Who Do We Share Data With?</h2>
            <p className="text-slate-600 mb-4">We only share necessary details with trusted partners to fulfill your order:</p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li><strong>Delivery Partners:</strong> We must share your Name, Address, and Phone Number with courier services (like BlueDart, Delhivery, etc.) so they can deliver your package.</li>
              <li><strong>Payment Gateways:</strong> When you pay via UPI, Card, or Netbanking, your transaction is processed by secure providers (like Razorpay). We <strong>never</strong> store your card PINs or passwords.</li>
              <li><strong>Legal Authorities:</strong> If requested by Indian law enforcement agencies, we are legally required to share data to prevent fraud or crime.</li>
            </ul>
          </section>

          {/* 7. Security */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">7. How We Secure Your Data</h2>
            <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-green-600 mt-1 shrink-0" />
                <p className="text-slate-600 leading-relaxed">
                    We use industry-standard <strong>SSL Encryption</strong> (that little lock symbol in your address bar). This means when you enter details on our site, they are scrambled into a code that hackers cannot read. We limit access to your data only to employees who strictly need it to do their jobs.
                </p>
            </div>
          </section>

          {/* 8. Your Rights */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">8. Your Rights</h2>
            <p className="text-slate-600 leading-relaxed">
              You are in control. You have the right to:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 mt-2">
                <li>Ask for a copy of the data we hold about you.</li>
                <li>Request us to correct wrong address or phone details.</li>
                <li>Request us to delete your account (unless we need to keep invoice data for tax laws).</li>
                <li>Unsubscribe from our marketing emails or SMS at any time.</li>
            </ul>
          </section>

          {/* 9. Children's Privacy */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">9. Children's Privacy</h2>
            <p className="text-slate-600 leading-relaxed">
              OptiStyle is intended for use by adults. If you are under 18, you may use our website and eye test only with the involvement of a parent or guardian. We do not knowingly collect personal information from children without parental consent.
            </p>
          </section>

          {/* 10. Contact Us */}
          <section className="border-t border-slate-100 pt-8 mt-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Have Questions? Contact Us</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3 text-slate-600">
                    <Mail className="w-5 h-5 text-brand-600" />
                    <span>optistyle.india@gmail.com
</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                    <Phone className="w-5 h-5 text-brand-600" />
                    <span>+91 80053 43226</span>
                </div>
                <div className="flex items-center gap-3 text-slate-600">
                    <MapPin className="w-5 h-5 text-brand-600" />
                    <span>Datia Madhya-pradesh </span>
                </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};