import React from 'react';
import { Truck, MapPin, Clock, ShieldCheck } from 'lucide-react';

export const ShippingPolicy: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-brand-100 rounded-full text-brand-600 mb-4">
            <Truck className="w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-4">
            Shipping Policy
          </h1>
          <p className="text-lg text-slate-600">
            How we pack, ship, and deliver your OptiStyle order across India.
          </p>
          <p className="text-sm text-slate-400 mt-2">Last Updated: March 15, 2025</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12 space-y-10">
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">1. Serviceable Locations</h2>
            <p className="text-slate-600 leading-relaxed">
              We currently ship to most pincodes across India through trusted courier partners.
            </p>
            <p className="text-slate-600 leading-relaxed mt-2">
              At checkout, delivery availability is checked for your pincode. If your area is not
              serviceable yet, you will see a clear message before payment.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">2. Order Processing Time</h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li>Orders are usually processed and packed within 24–48 working hours.</li>
              <li>Custom prescription lenses may need additional processing time.</li>
              <li>Orders placed on Sundays or public holidays are processed on the next working day.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">3. Estimated Delivery Time</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-brand-600 mt-1" />
                <div>
                  <p className="font-semibold text-slate-900">Metro Cities</p>
                  <p className="text-slate-600 text-sm">
                    Estimated 2–4 working days after dispatch.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-brand-600 mt-1" />
                <div>
                  <p className="font-semibold text-slate-900">Non-Metro / Remote Locations</p>
                  <p className="text-slate-600 text-sm">
                    Estimated 4–8 working days after dispatch, depending on courier coverage.
                  </p>
                </div>
              </div>
            </div>
            <p className="text-slate-600 text-sm mt-4">
              These timelines are estimates and may vary due to courier constraints, weather,
              strikes, or other situations outside our control.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">4. Shipping Charges</h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-600">
              <li>Shipping charges, if any, are shown clearly on the checkout page before payment.</li>
              <li>From time to time, we may offer free shipping promotions on eligible orders.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">5. Order Tracking</h2>
            <p className="text-slate-600 leading-relaxed">
              Once your order is dispatched, you will receive tracking details on your registered
              email or phone number. You can also view order status from the “My Orders” section in
              your OptiStyle account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">6. Delivery Attempts</h2>
            <p className="text-slate-600 leading-relaxed">
              Our courier partners usually make multiple delivery attempts. If you are unreachable or
              the address is incorrect, the shipment may be returned to us. In such cases, we will
              contact you to help with reshipment or resolution.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">7. Damaged or Tampered Packages</h2>
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 mt-1" />
              <div>
                <p className="text-slate-600 leading-relaxed">
                  If you notice that the outer package is damaged, tampered, or opened, please do
                  not accept the delivery or record a clear video while opening the package.
                </p>
                <p className="text-slate-600 leading-relaxed mt-2">
                  Reach out to us immediately with your order ID and supporting photos or videos so
                  we can assist you with a replacement or investigation.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">8. Address Accuracy</h2>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-brand-600 mt-1" />
              <p className="text-slate-600 leading-relaxed">
                Customers are responsible for providing a complete and accurate shipping address,
                including house number, street, locality, landmark, city, state, and pincode. Orders
                returned due to incomplete or incorrect addresses may attract additional shipping
                charges for reshipment.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">9. Contact For Shipping Queries</h2>
            <p className="text-slate-600 leading-relaxed">
              For any questions related to shipping, delivery delays, or courier issues, please
              contact our support team at{' '}
              <span className="font-semibold text-brand-700">optistyle.india@gmail.com</span> or call{' '}
              <span className="font-semibold text-brand-700">+91 80053 43226</span>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

