import { addProductToDB } from '../backend/services/db.ts';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const seed = async () => {
    try {
        console.log("Seeding product...");
        await addProductToDB({
            id: 'test-item-1',
            name: 'Test Eyeglasses',
            price: 500,
            category: 'Eyeglasses',
            image: 'https://via.placeholder.com/150',
            description: 'A test product',
            stock: 100
        });
        console.log("✅ Product seeded: test-item-1");
    } catch (e) {
        console.error("❌ Error seeding:", e);
    }
};

seed();
