
import axios from 'axios';

interface PincodeData {
  city: string;
  state: string;
}

// In-memory cache to avoid repeated API calls during the session
const pincodeCache = new Map<string, PincodeData>();

export const fetchLocationByPincode = async (pincode: string): Promise<PincodeData | null> => {
  // Basic validation
  if (!pincode || pincode.length !== 6 || !/^\d+$/.test(pincode)) {
    return null;
  }

  // Return cached result if available
  if (pincodeCache.has(pincode)) {
    return pincodeCache.get(pincode) || null;
  }

  try {
    // Using the standard open API for Indian Postal Codes
    const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`);
    const data = response.data?.[0];

    if (data && data.Status === 'Success' && data.PostOffice && data.PostOffice.length > 0) {
      // We take the first Post Office entry to get the District (City) and State
      const office = data.PostOffice[0];
      
      const result: PincodeData = {
        city: office.District,
        state: office.State
      };

      pincodeCache.set(pincode, result);
      return result;
    }
    
    return null;
  } catch (error) {
    console.error("PIN Code Lookup Failed:", error);
    // Fail gracefully so the user can enter details manually
    return null;
  }
};
