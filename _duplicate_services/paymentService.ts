import axios from 'axios';
import { api } from './api';

const RAZORPAY_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js';

// Define Window interface to include Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentDetails {
  total: number;
  items: any[];
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string; // Required for GST
    zip: string;
  };
  method: 'ONLINE' | 'COD'; // Added method selection
}

/**
 * Loads the Razorpay SDK script dynamically
 */
const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

/**
 * Orchestrates the full payment flow (Online or COD)
 */
export const startPayment = async (details: PaymentDetails): Promise<{ success: boolean; orderId?: string; error?: string }> => {
  try {
    // 1. Create Order on Backend (Common for both)
    const { data } = await api.post('/payment/create-order', {
      total: details.total,
      items: details.items,
      paymentMethod: details.method,
      user: {
        name: `${details.user.firstName} ${details.user.lastName}`,
        email: details.user.email,
        phone: details.user.phone,
        address: details.user.address,
        city: details.user.city,
        state: details.user.state,
        zip: details.user.zip
      }
    });

    if (!data.success) throw new Error(data.message || "Order creation failed");

    // 2a. Handle COD (Immediate Success)
    if (details.method === 'COD') {
      return { success: true, orderId: data.internal_order_id };
    }

    // 2b. Handle Online (Razorpay)
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) throw new Error("Could not load payment gateway.");

    const { order_id, amount, currency, key_id } = data;

    return new Promise((resolve) => {
      const options = {
        key: key_id,
        amount: amount,
        currency: currency,
        name: "OptiStyle India",
        description: "Eyewear Purchase",
        order_id: order_id, 
        prefill: {
          name: `${details.user.firstName} ${details.user.lastName}`,
          email: details.user.email,
          contact: details.user.phone
        },
        theme: {
          color: "#2563EB"
        },
        handler: async function (response: any) {
          try {
            const verifyRes = await api.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            if (verifyRes.data.success) {
              resolve({ success: true, orderId: verifyRes.data.orderId });
            } else {
              resolve({ success: false, error: "Payment verification failed" });
            }
          } catch (err) {
            resolve({ success: false, error: "Verification server error" });
          }
        },
        modal: {
          ondismiss: function() {
            resolve({ success: false, error: "Payment cancelled by user" });
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
         resolve({ success: false, error: response.error.description });
      });
      rzp.open();
    });

  } catch (err: any) {
    console.error("Payment Start Error:", err);
    return { success: false, error: err.message || "Something went wrong" };
  }
};
