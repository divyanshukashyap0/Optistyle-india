import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const listProducts = async () => {
  try {
    const res = await axios.get(`${API_URL}/products`);
    console.log('Products:', JSON.stringify(res.data, null, 2));
  } catch (error: any) {
    console.error('Error fetching products:', error.message);
  }
};

listProducts();
