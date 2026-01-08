
import type { Request, Response } from 'express';
import axios from 'axios';
import { ENV } from '../config/env.ts';

// Mock data for fallback to ensure system works without API key
const MOCK_ADDRESSES = [
  { description: "Hitech City, Hyderabad, Telangana", place_id: "1", structured_formatting: { main_text: "Hitech City", secondary_text: "Hyderabad, Telangana" } },
  { description: "Indiranagar, Bangalore, Karnataka", place_id: "2", structured_formatting: { main_text: "Indiranagar", secondary_text: "Bangalore, Karnataka" } },
  { description: "Connaught Place, New Delhi, Delhi", place_id: "3", structured_formatting: { main_text: "Connaught Place", secondary_text: "New Delhi, Delhi" } },
  { description: "Marine Drive, Mumbai, Maharashtra", place_id: "4", structured_formatting: { main_text: "Marine Drive", secondary_text: "Mumbai, Maharashtra" } },
  { description: "Salt Lake, Kolkata, West Bengal", place_id: "5", structured_formatting: { main_text: "Salt Lake", secondary_text: "Kolkata, West Bengal" } },
];

/**
 * 1. ADDRESS AUTOCOMPLETE PROXY
 * Uses Google Places API if key exists, otherwise uses OpenStreetMap (Nominatim) or Mock.
 */
export const autocompleteAddress = async (req: Request, res: Response) => {
  const { input } = req.query;

  if (!input || typeof input !== 'string') {
    return res.status(400).json({ suggestions: [] });
  }

  try {
    // Strategy A: Google Places (Best Experience)
    if (ENV.GOOGLE_MAPS_KEY) {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&components=country:in&key=${ENV.GOOGLE_MAPS_KEY}`
      );
      if (response.data.status === 'OK') {
        return res.json({ suggestions: response.data.predictions });
      }
    }

    // Strategy B: OpenStreetMap Nominatim (Free, no key)
    if (input.length > 3) {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(input)}&countrycodes=in&format=json&addressdetails=1&limit=5`,
        { headers: { 'User-Agent': 'OptiStyle-App' } }
      );
      
      const suggestions = response.data.map((item: any) => ({
        description: item.display_name,
        place_id: item.place_id,
        structured_formatting: {
          main_text: item.address.suburb || item.address.city || item.address.town || item.address.village,
          secondary_text: `${item.address.state || ''}, ${item.address.postcode || ''}`
        },
        terms: [
             { value: item.address.road || '' },
             { value: item.address.city || item.address.town || '' },
             { value: item.address.state || '' },
             { value: item.address.postcode || '' }
        ]
      }));
      
      return res.json({ suggestions });
    }

    // Strategy C: Mock Fallback
    const filteredMock = MOCK_ADDRESSES.filter(a => 
        a.description.toLowerCase().includes(input.toLowerCase())
    );
    return res.json({ suggestions: filteredMock });

  } catch (error) {
    console.error("Address Autocomplete Error:", error);
    return res.json({ suggestions: [] });
  }
};

export const checkDeliveryAvailability = async (req: Request, res: Response) => {
  const { pincode } = req.body;

  if (!pincode || pincode.length !== 6) {
    return res.status(400).json({ available: false, message: "Invalid PIN Code" });
  }

  const pinStart = parseInt(pincode.substring(0, 3));
  const lastDigit = parseInt(pincode.substring(5));

  const metros = [110, 400, 500, 560, 600, 700];
  
  if (lastDigit === 9 && !metros.includes(pinStart)) {
      return res.json({
          available: false,
          message: "Sorry, delivery not available to this location yet."
      });
  }

  if (metros.includes(pinStart)) {
      return res.json({
          available: true,
          type: 'EXPRESS',
          days: '1-2 Days',
          cod: true,
          message: "⚡ Express Delivery Available"
      });
  }

  return res.json({
      available: true,
      type: 'STANDARD',
      days: '3-5 Days',
      cod: true,
      message: "Standard Delivery Available"
  });
};
