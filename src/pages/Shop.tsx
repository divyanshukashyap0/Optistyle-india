
import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';
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
  const [compareIds, setCompareIds] = useState<string[]>([]);

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

  const compareProducts = useMemo(
    () => products.filter(p => compareIds.includes(p.id)),
    [products, compareIds]
  );

  const toggleCompare = (id: string) => {
    setCompareIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(pid => pid !== id);
      }
      const updated = [id, ...prev];
      return updated.slice(0, 4);
    });
  };

  return (
    <PageTransition className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row gap-12">

        {/* Product Grid */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6 gap-3">
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
                          <button
                            type="button"
                            onClick={e => {
                              e.preventDefault();
                              toggleCompare(product.id);
                            }}
                            className="mt-2 text-[11px] font-medium text-slate-500 hover:text-brand-600 self-start"
                          >
                            {compareIds.includes(product.id) ? 'Remove from compare' : 'Add to compare'}
                          </button>
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
            </motion.div>
          )}

          {compareProducts.length >= 2 && (
            <div className="mt-12 border-t border-slate-200 pt-8">
              <h2 className="text-lg font-bold text-slate-900 mb-4">
                Compare selected frames
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-slate-700">
                  <thead>
                    <tr>
                      <th className="p-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">
                        Feature
                      </th>
                      {compareProducts.map(p => (
                        <th
                          key={p.id}
                          className="p-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide"
                        >
                          {p.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-slate-100">
                      <td className="p-3 text-xs font-semibold text-slate-500">
                        Price
                      </td>
                      {compareProducts.map(p => (
                        <td key={p.id} className="p-3">
                          ₹{p.price}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-t border-slate-100">
                      <td className="p-3 text-xs font-semibold text-slate-500">
                        Frame shape
                      </td>
                      {compareProducts.map(p => (
                        <td key={p.id} className="p-3 capitalize">
                          {p.shape}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-t border-slate-100">
                      <td className="p-3 text-xs font-semibold text-slate-500">
                        Type
                      </td>
                      {compareProducts.map(p => (
                        <td key={p.id} className="p-3 capitalize">
                          {p.type}
                        </td>
                      ))}
                    </tr>
                    <tr className="border-t border-slate-100">
                      <td className="p-3 text-xs font-semibold text-slate-500">
                        Rating
                      </td>
                      {compareProducts.map(p => (
                        <td key={p.id} className="p-3">
                          {p.rating.toFixed(1)} ★
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};
