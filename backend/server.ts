
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import path from 'path';
import PDFDocument from 'pdfkit';
import { generateAIResponse } from './services/deepseekClient.ts';
import paymentRoutes from './routes/payment.routes.ts';
import adminRoutes from './routes/admin.routes.ts';
import addressRoutes from './routes/address.routes.ts';
import orderRoutes from './routes/order.routes.ts';
import emailRoutes from './routes/email.routes.ts';
import './config/firebase.ts'; 
import { ENV } from './config/env.ts';
import { getAllProducts, getAllOrders, getSystemSettings } from './services/db.ts';

const PORT = parseInt(ENV.PORT) || 5000;
const app = express();

// Enable CORS for all origins (Simplest for production separation)
app.use(cors());
app.use(express.json());

// --- ROUTES ---
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/address', addressRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/email', emailRoutes);

// Public Routes
app.get('/api/products', async (req, res) => {
  try {
    const products = await getAllProducts();
    res.json(products);
  } catch (e) {
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

app.get('/api/products/:id', async (req, res) => {
  const products = await getAllProducts();
  const product = products.find(p => p.id === req.params.id);
  if (product) res.json(product);
  else res.status(404).json({ message: 'Product not found' });
});

app.get('/api/orders', async (req, res) => {
  try {
    const orders = await getAllOrders();
    res.json(orders);
  } catch (e) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

app.get('/api/config', async (req, res) => {
  try {
    const config = await getSystemSettings();
    res.json(config);
  } catch (e) {
    res.json({ maintenanceMode: false });
  }
});

// AI Chat
app.post('/api/chat', async (req, res) => {
  const { message, context } = req.body;
  try {
    const config = await getSystemSettings();
    if (!config.aiEnabled) {
      return res.json({ reply: "AI Assistant is currently offline." });
    }
    const reply = await generateAIResponse(message, context || 'general');
    res.json({ reply: reply || "I'm having trouble connecting right now." });
  } catch (error) {
    res.json({ reply: "System busy. Please try again." });
  }
});

// PDF Cert Gen
app.post('/api/certificate', async (req, res) => {
  const { name, certId } = req.body;
  const doc = new PDFDocument({ size: 'A4', margin: 40 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=OptiStyle_Certificate_${certId}.pdf`);
  doc.pipe(res);
  doc.fontSize(20).text('OptiStyle Vision Certificate', { align: 'center' });
  doc.fontSize(12).text(`Name: ${name}`);
  doc.text(`Ref: ${certId}`);
  doc.end();
});

// Health Check
app.get('/', (req, res) => {
  res.send('OptiStyle API is Running');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend running on port ${PORT}`);
});


