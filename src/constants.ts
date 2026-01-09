import { Product, LensOption } from '../types.ts';

// --- HELPER DATA FOR GENERATION ---
const ADJECTIVES = [
  'Urban', 'Classic', 'Retro', 'Modern', 'Elite', 'Prime', 'Neo', 'Tech', 
  'Bold', 'Sleek', 'Air', 'Pro', 'Vista', 'Swift', 'Grand', 'Luxe', 
  'Smart', 'Cool', 'Vintage', 'Metro', 'Fusion', 'Nova', 'Zen', 'Hyper'
];

const NOUNS = [
  'Horizon', 'Pilot', 'Wayfarer', 'Scholar', 'Vision', 'Sight', 'Spectra', 
  'Frame', 'Lens', 'View', 'Focus', 'Ranger', 'Scout', 'Master', 'Ace', 
  'Drifter', 'Voyager', 'Nomad', 'Maverick', 'Legend', 'Icon', 'Glide'
];

const SHAPES: ('round' | 'square' | 'aviator' | 'cat-eye' | 'rectangle')[] = 
  ['round', 'square', 'aviator', 'cat-eye', 'rectangle'];

const CATEGORIES: ('men' | 'women' | 'unisex' | 'kids')[] = 
  ['men', 'women', 'unisex', 'men', 'women', 'unisex', 'kids']; // Weighted mix

const COLORS = ['Black', 'Gold', 'Silver', 'Tortoise', 'Gunmetal', 'Blue', 'Transparent', 'Rose Gold'];

// --- GENERATOR FUNCTION ---
const generateProducts = (count: number): Product[] => {
  const products: Product[] = [];
  
  // Add specific featured items first (High Quality manually defined)
  products.push(
    {
      id: 'featured_1',
      name: 'OptiStyle Horizon Pro',
      price: 1499,
      category: 'men',
      type: 'eyeglasses',
      shape: 'rectangle',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&q=80&w=800',
      description: 'Our signature lightweight titanium frames. Perfect for office wear.',
      colors: ['Black', 'Gunmetal']
    },
    {
      id: 'featured_2',
      name: 'Bella Vista Luxe',
      price: 1999,
      category: 'women',
      type: 'sunglasses',
      shape: 'cat-eye',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&q=80&w=800',
      description: 'Oversized statement sunglasses with polarized protection.',
      colors: ['Tortoise', 'Black']
    },
    {
        id: 'featured_3',
        name: 'Scholar Round Classic',
        price: 999,
        category: 'unisex',
        type: 'eyeglasses',
        shape: 'round',
        rating: 4.7,
        image: 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&q=80&w=800',
        description: 'The intellectual look. Harry Potter style frames for the modern genius.',
        colors: ['Gold', 'Black']
    }
  );

  // Generate remaining
  for (let i = 0; i < count; i++) {
    const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    const type = Math.random() > 0.7 ? 'sunglasses' : 'eyeglasses'; // 30% sunglasses
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const price = Math.floor(Math.random() * (35 - 5) + 5) * 100 + 99; // 599 to 3599 roughly
    
    // Deterministic random image based on shape/type
    let image = '';
    if (type === 'sunglasses') {
        image = `https://source.unsplash.com/random/800x600/?sunglasses,${shape},fashion&sig=${i}`;
        // Fallback to picsum if unsplash source is flaky or strict
        if (i % 2 === 0) image = 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=800';
        else image = 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?auto=format&fit=crop&q=80&w=800';
    } else {
        if (category === 'men') image = 'https://images.unsplash.com/photo-1563907572-c28383a1529c?auto=format&fit=crop&q=80&w=800';
        else if (category === 'women') image = 'https://images.unsplash.com/photo-1614713568917-41a9705a6875?auto=format&fit=crop&q=80&w=800';
        else image = 'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?auto=format&fit=crop&q=80&w=800';
    }

    products.push({
      id: `gen_${i}`,
      name: `${adj} ${noun} ${shape.charAt(0).toUpperCase() + shape.slice(1)}`,
      price: price,
      category: category,
      type: type,
      shape: shape,
      rating: parseFloat((4 + Math.random()).toFixed(1)),
      image: `${image}&random=${i}`, // Cache buster
      description: `Premium ${type} designed for ${category}. Features durable hinges and ${Math.random() > 0.5 ? 'matte' : 'glossy'} finish.`,
      colors: COLORS.slice(Math.floor(Math.random() * 3), Math.floor(Math.random() * 3) + 3)
    });
  }

  return products;
};

export const PRODUCTS: Product[] = generateProducts(100);

export const LENS_OPTIONS: LensOption[] = [
  { id: 'frame_only', name: 'Frame Only', price: 0, description: 'No power. Just style.' },
  { id: 'single_vision', name: 'Single Vision (Power)', price: 500, description: 'For distance or reading. Standard Index 1.56.' },
  { id: 'blue_light', name: 'Blue Light Cut', price: 800, description: 'Protects eyes from digital screens. Anti-glare.' },
  { id: 'photochromic', name: 'Photochromic (Anti-Glare)', price: 1200, description: 'Darkens in sunlight. Turns clear indoors.' },
  { id: 'progressive', name: 'Progressive (Bifocal)', price: 2000, description: 'Seamless far & near vision. No visible line.' },
];

export const MOCK_USER = {
  id: 'u123',
  name: 'Rahul Sharma',
  email: 'rahul@example.com',
  role: 'user'
};
