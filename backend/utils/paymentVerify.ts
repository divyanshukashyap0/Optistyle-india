import crypto from 'crypto';
import { RAZORPAY_CONFIG } from '../clients/razorpayClient.ts';

/**
 * Verifies the Razorpay signature using HMAC SHA256.
 * @param orderId - The order ID created by backend
 * @param paymentId - The payment ID returned by Razorpay
 * @param signature - The signature returned by Razorpay
 * @returns boolean
 */
export const verifyRazorpaySignature = (
  orderId: string,
  paymentId: string,
  signature: string
): boolean => {
  const secret = RAZORPAY_CONFIG.key_secret;

  if (!secret) {
    console.error("Cannot verify signature: Missing Razorpay Secret");
    return false;
  }

  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(orderId + '|' + paymentId)
    .digest('hex');

  return generatedSignature === signature;
};
