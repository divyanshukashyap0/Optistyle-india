import { getOrderById } from '../backend/services/db.ts';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const checkOrder = async (orderId: string) => {
    try {
        console.log(`Checking order: ${orderId}`);
        const order = await getOrderById(orderId);
        if (order) {
            console.log('✅ Order Found:');
            console.log(`   ID: ${order.id}`);
            console.log(`   Status: ${order.status}`);
            console.log(`   Payment Method: ${order.paymentMethod}`);
            console.log(`   Payment ID: ${order.paymentId}`);
            console.log(`   Razorpay Order ID: ${order.razorpayOrderId}`);
        } else {
            console.error('❌ Order not found');
        }
    } catch (e) {
        console.error("Error checking order:", e);
    }
};

// Get ID from args
const id = process.argv[2];
if (!id) {
    console.error("Please provide order ID");
    process.exit(1);
}

checkOrder(id);
