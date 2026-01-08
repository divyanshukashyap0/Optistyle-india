import express from 'express';
import { autocompleteAddress, checkDeliveryAvailability } from '../controllers/address.controller.ts';

const router = express.Router();

// Address Autocomplete (Proxy)
router.get('/autocomplete', autocompleteAddress);

// Delivery Availability
router.post('/check-delivery', checkDeliveryAvailability);

export default router;
