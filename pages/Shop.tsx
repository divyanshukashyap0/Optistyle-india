import React, { useState, useMemo, useEffect } from 'react';
import { PRODUCTS } from '../constants';
import { Link, useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal } from 'lucide-react';
import { PageTransition, staggerContainer, staggerItem } from '../components/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';

export const Shop: React.FC = () => {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam || 'all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 3000]); // Updated max to realistic INR
  const [selectedShape, setSelectedShape] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Simulate data fetching
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [selectedCategory, selectedShape]);

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter(p => {
      const catMatch = selectedCategory === 'all' || p.category === selectedCategory || (selectedCategory === 'sunglasses' && p.type === 'sunglasses');
      const priceMatch = p.price >= priceRange[0] && p.price <= priceRange[1];
      const shapeMatch = selectedShape === 'all' || p.shape === selectedShape;
      return catMatch && priceMatch && shapeMatch;
    });
  }, [selectedCategory, priceRange, selectedShape]);

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
        </motion.div>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <p className="text-slate-500 text-sm font-medium">
              {loading ? (
                <span className="h-4 w-24 bg-slate-200 animate-pulse rounded inline-block"></span>
              ) : (
                `${filteredProducts.length} styles found`
              )}
            </p>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-slate-500" />
              <select className="bg-transparent text-sm border-none focus:ring-0 text-slate-700 font-medium cursor-pointer">
                <option>Sort by: Featured</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
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
                    <div className="aspect-square bg-slate-200 animate-pulse" />
                    <div className="p-4 space-y-3">
                      <div className="h-6 bg-slate-200 animate-pulse rounded w-3/4" />
                      <div className="h-4 bg-slate-200 animate-pulse rounded w-1/2" />
                      <div className="h-5 bg-slate-200 animate-pulse rounded w-1/4" />
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
              <p className="text-slate-500">No products match your filters.</p>
              <button 
                onClick={() => { setSelectedCategory('all'); setSelectedShape('all'); }}
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