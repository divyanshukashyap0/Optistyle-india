import axios from 'axios';
import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const API_URL = 'http://localhost:5000/api/payment';
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

console.log('Checking Environment...');
if (!KEY_SECRET) {
  console.error('❌ RAZORPAY_KEY_SECRET not found in .env');
  process.exit(1);
}
console.log('✅ RAZORPAY_KEY_SECRET found');

const testOrder = async () => {
  try {
    console.log('\n1. Creating Order...');
    const orderData = {
      items: [
        {
          id: 'test-item-1',
          name: 'Test Eyeglasses',
          price: 500,
          quantity: 1,
          image: 'https://via.placeholder.com/150'
        }
      ],
      total: 500,
      user: {
        name: 'Test User',
        email: 'test@example.com',
        phone: '9999999999',
        address: '123 Test St',
        city: 'Test City',
        state: 'Telangana',
        zip: '500000'
      },
      paymentMethod: 'ONLINE'
    };

    const createRes = await axios.post(`${API_URL}/create-order`, orderData);
    
    if (!createRes.data.success) {
      throw new Error(`Order creation failed: ${createRes.data.message}`);
    }

    const { order_id, amount, currency } = createRes.data;
    console.log(`✅ Order Created: ${order_id}`);
    console.log(`   Amount: ${amount/100} ${currency}`);

    // Simulate Razorpay Payment
    const payment_id = `pay_test_${Date.now()}`;
    console.log(`\n2. Simulating Payment: ${payment_id}`);

    // Generate Signature
    const signature = crypto
      .createHmac('sha256', KEY_SECRET)
      .update(order_id + '|' + payment_id)
      .digest('hex');

    console.log(`\n3. Verifying Payment...`);
    
    const verifyRes = await axios.post(`${API_URL}/verify`, {
      razorpay_order_id: order_id,
      razorpay_payment_id: payment_id,
      razorpay_signature: signature
    });

    if (verifyRes.data.success) {
      console.log('✅ Payment Verified Successfully!');
      console.log('   Internal Order ID:', verifyRes.data.orderId);
    } else {
      console.error('❌ Payment Verification Failed:', verifyRes.data.message);
    }

  } catch (error: any) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
};

testOrder();
