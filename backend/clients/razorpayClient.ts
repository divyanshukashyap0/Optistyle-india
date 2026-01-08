
import Razorpay from 'razorpay';
import { ENV } from '../config/env.ts';

let razorpayInstance: Razorpay | null = null;

if (!ENV.RAZORPAY.KEY_ID || !ENV.RAZORPAY.KEY_SECRET) {
  console.warn("⚠️ [Razorpay] Missing API Keys in .env. Payment features will fail.");
} else {
  try {
    razorpayInstance = new Razorpay({
      key_id: ENV.RAZORPAY.KEY_ID,
      key_secret: ENV.RAZORPAY.KEY_SECRET,
    });
    console.log("✅ Razorpay Client Initialized");
  } catch (error) {
    console.error("❌ Razorpay Client Init Failed:", error);
  }
}

export const getRazorpayClient = (): Razorpay => {
  if (!razorpayInstance) {
    throw new Error("Razorpay client is not initialized. Missing API Keys.");
  }
  return razorpayInstance;
};

export const RAZORPAY_CONFIG = {
  key_id: ENV.RAZORPAY.KEY_ID,
  key_secret: ENV.RAZORPAY.KEY_SECRET
};
