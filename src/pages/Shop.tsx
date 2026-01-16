
import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal } from 'lucide-react';
import { PageTransition, staggerContainer, staggerItem } from '../components/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '../components/Skeleton';
import { Product } from '../types';
import { api, endpoints } from '../services/api';

export const Shop: React.FC = () => {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam || 'all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, Infinity]);
  const [selectedShape, setSelectedShape] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [sortOption, setSortOption] = useState<'featured' | 'priceAsc' | 'priceDesc'>('featured');

  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      if (isMounted) {
        setLoading(true);
      }

      try {
        const response = await api.get(endpoints.products);
        if (!isMounted) return;
        const data = (response.data as Product[]) || [];
        setProducts(data);
      } catch (error) {
        if (!isMounted) return;
        setProducts([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    const base = products.filter(p => {
      const catMatch = selectedCategory === 'all' || p.category === selectedCategory || (selectedCategory === 'sunglasses' && p.type === 'sunglasses');
      const priceMatch = p.price >= priceRange[0] && p.price <= priceRange[1];
      const shapeMatch = selectedShape === 'all' || p.shape === selectedShape;
      return catMatch && priceMatch && shapeMatch;
    });

    if (sortOption === 'priceAsc') {
      return [...base].sort((a, b) => a.price - b.price);
    }
    if (sortOption === 'priceDesc') {
      return [...base].sort((a, b) => b.price - a.price);
    }
    return base;
  }, [products, selectedCategory, priceRange, selectedShape, sortOption]);

  return (
    <PageTransition className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row gap-12">
        
        {/* Sidebar Filters */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full md:w-64 space-y-8 sticky top-24 h-fit"
        >
          <div className="flex items-center gap-2 text-lg font-bold font-serif mb-6">
            <Filter className="w-5 h-5" /> Filters
          </div>

          <div>
            <h3 className="font-semibold mb-3">Category</h3>
            <div className="space-y-2">
              {['all', 'men', 'women', 'unisex', 'sunglasses'].map(cat => (
                <label key={cat} className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input 
                      type="radio" 
                      name="category" 
                      checked={selectedCategory === cat}
                      onChange={() => setSelectedCategory(cat)}
                      className="peer h-4 w-4 border-gray-300 text-brand-600 focus:ring-brand-500"
                    />
                  </div>
                  <span className={`capitalize transition-colors ${selectedCategory === cat ? 'text-brand-600 font-medium' : 'text-slate-600 group-hover:text-slate-900'}`}>{cat}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Frame Shape</h3>
            <div className="flex flex-wrap gap-2">
              {['all', 'round', 'square', 'aviator', 'cat-eye', 'rectangle'].map(shape => (
                <motion.button
                  key={shape}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedShape(shape)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    selectedShape === shape 
                      ? 'bg-brand-600 text-white border-brand-600 shadow-sm' 
                      : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300 hover:text-brand-600'
                  }`}
                >
                  {shape.replace('-', ' ')}
                </motion.button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Price Range</h3>
            <div className="space-y-2 text-sm">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="price"
                  checked={priceRange[0] === 0 && priceRange[1] === Infinity}
                  onChange={() => setPriceRange([0, Infinity])}
                  className="h-4 w-4 border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                <span className={priceRange[0] === 0 && priceRange[1] === Infinity ? 'text-brand-600 font-medium' : 'text-slate-600 group-hover:text-slate-900'}>
                  All prices
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="price"
                  checked={priceRange[0] === 0 && priceRange[1] === 999}
                  onChange={() => setPriceRange([0, 999])}
                  className="h-4 w-4 border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                <span className={priceRange[0] === 0 && priceRange[1] === 999 ? 'text-brand-600 font-medium' : 'text-slate-600 group-hover:text-slate-900'}>
                  Under ₹1000
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="price"
                  checked={priceRange[0] === 1000 && priceRange[1] === 1999}
                  onChange={() => setPriceRange([1000, 1999])}
                  className="h-4 w-4 border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                <span className={priceRange[0] === 1000 && priceRange[1] === 1999 ? 'text-brand-600 font-medium' : 'text-slate-600 group-hover:text-slate-900'}>
                  ₹1000 – ₹1999
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="price"
                  checked={priceRange[0] === 2000 && priceRange[1] === 2999}
                  onChange={() => setPriceRange([2000, 2999])}
                  className="h-4 w-4 border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                <span className={priceRange[0] === 2000 && priceRange[1] === 2999 ? 'text-brand-600 font-medium' : 'text-slate-600 group-hover:text-slate-900'}>
                  ₹2000 – ₹2999
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="price"
                  checked={priceRange[0] === 3000 && priceRange[1] === Infinity}
                  onChange={() => setPriceRange([3000, Infinity])}
                  className="h-4 w-4 border-gray-300 text-brand-600 focus:ring-brand-500"
                />
                <span className={priceRange[0] === 3000 && priceRange[1] === Infinity ? 'text-brand-600 font-medium' : 'text-slate-600 group-hover:text-slate-900'}>
                  ₹3000 and above
                </span>
              </label>
            </div>
          </div>
        </motion.div>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <div className="text-slate-500 text-sm font-medium">
              {loading ? (
                <Skeleton className="h-4 w-24" />
              ) : (
                <p>{`${filteredProducts.length} styles found`}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-slate-500" />
              <select
                className="bg-transparent text-sm border-none focus:ring-0 text-slate-700 font-medium cursor-pointer"
                value={sortOption}
                onChange={e => {
                  const value = e.target.value as 'featured' | 'priceAsc' | 'priceDesc';
                  setSortOption(value);
                }}
              >
                <option value="featured">Sort by: Featured</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
              </select>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loader"
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                exit="hidden"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {[...Array(6)].map((_, i) => (
                  <motion.div variants={staggerItem} key={i} className="bg-white rounded-xl overflow-hidden border border-slate-100 p-0">
                    <Skeleton className="aspect-square w-full rounded-none" />
                    <div className="p-4 space-y-3">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <div className="flex items-center gap-2 mt-4">
                         <Skeleton className="h-5 w-16" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                key="grid"
                variants={staggerContainer}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {filteredProducts.map((product) => (
                  <motion.div variants={staggerItem} key={product.id}>
                    <Link to={`/product/${product.id}`} className="group block h-full">
                      <div className="bg-white rounded-xl overflow-hidden border border-slate-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full flex flex-col">
                        <div className="aspect-square bg-slate-50 relative overflow-hidden">
                          <img 
                            src={product.image} 
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                          <h3 className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors">{product.name}</h3>
                          <p className="text-sm text-slate-500 mb-2 capitalize">{product.shape} · {product.category}</p>
                          <div className="flex items-center gap-2 mt-auto">
                             <span className="text-brand-900 font-semibold">₹{product.price}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {!loading && filteredProducts.length === 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 bg-slate-50 rounded-xl"
            >
              <p className="text-slate-500">
                {products.length === 0 ? 'No products available yet. Please check back soon.' : 'No products match your filters.'}
              </p>
              <button 
                onClick={() => { setSelectedCategory('all'); setSelectedShape('all'); setPriceRange([0, Infinity]); }}
                className="text-brand-600 font-medium mt-2 hover:underline"
              >
                Clear Filters
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};
