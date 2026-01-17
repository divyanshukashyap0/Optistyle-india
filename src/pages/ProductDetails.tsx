
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { LENS_OPTIONS } from '../constants';
import { useCart } from '../context/CartContext';
import { Button } from '../components/Button';
import { Star, Check, UploadCloud } from 'lucide-react';
import { LensOption, Product } from '../types';
import { PageTransition } from '../components/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '../components/Skeleton';
import { api, endpoints } from '../services/api';

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const { addToCart } = useCart();
  
  const [selectedLens, setSelectedLens] = useState<LensOption>(LENS_OPTIONS[0]);
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const fetchProduct = async () => {
      if (!id) {
        if (isMounted) {
          setProduct(null);
          setLoading(false);
        }
        return;
      }

      if (isMounted) {
        setLoading(true);
      }

      try {
        const response = await api.get(endpoints.product(id));
        if (!isMounted) return;
        const data = response.data as Product | null;
        setProduct(data);
      } catch (error) {
        if (!isMounted) return;
        setProduct(null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (!product) return;
    try {
      const key = 'optistyle_recent_products';
      const saved = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
      const existing = saved ? (JSON.parse(saved) as string[]) : [];
      const filtered = existing.filter(pid => pid !== product.id);
      const updated = [product.id, ...filtered].slice(0, 6);
      localStorage.setItem(key, JSON.stringify(updated));
    } catch {
    }
  }, [product]);

  if (!loading && !product) return <div>Product not found</div>;

  const reviews: { id: string; name: string; rating: number; comment: string; tag?: string }[] = product
    ? [
        {
          id: 'r1',
          name: 'Verified Customer',
          rating: Math.round(product.rating),
          comment: 'Lightweight frame and very comfortable for all-day wear.',
          tag: 'Comfort & Fit',
        },
        {
          id: 'r2',
          name: 'Office User',
          rating: Math.max(4, Math.round(product.rating - 0.2)),
          comment: 'Looks premium in person and the lenses are crystal clear.',
          tag: 'Build Quality',
        },
        {
          id: 'r3',
          name: 'Online Shopper',
          rating: Math.max(4, Math.round(product.rating - 0.4)),
          comment: 'Perfect size for my face, same as shown in the photos.',
          tag: 'Style & Size',
        },
      ]
    : [];

  const handleAddToCart = () => {
    if (product) addToCart(product, selectedLens);
  };

  return (
    <PageTransition className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24">
        {/* Gallery */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="aspect-square w-full rounded-lg" />
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                {product && (
                  <>
                    <div className="aspect-[4/3] bg-slate-100 rounded-2xl overflow-hidden shadow-sm relative">
                      <motion.img 
                        key={activeImage}
                        src={
                          (product.images && product.images.length > 0
                            ? product.images
                            : [product.image])[activeImage]
                        }
                        alt={product.name} 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {product.images && product.images.length > 1 && (
                      <div className="grid grid-cols-3 gap-4 mt-4">
                        {product.images.map((img, index) => (
                          <motion.div 
                            key={img}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setActiveImage(index)}
                            className={`aspect-square bg-slate-50 rounded-lg overflow-hidden cursor-pointer border-2 transition-colors ${
                              activeImage === index ? 'border-brand-600' : 'border-transparent'
                            }`}
                          >
                            <img 
                              src={img} 
                              alt={product.name} 
                              className="w-full h-full object-cover" 
                            />
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Info */}
        <motion.div
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ duration: 0.5, delay: 0.2 }}
        >
          {loading ? (
            <div className="space-y-6 mb-8">
               <div className="flex gap-2">
                 <Skeleton className="h-6 w-6 rounded-full" />
                 <Skeleton className="h-6 w-20" />
               </div>
               <Skeleton className="h-12 w-3/4" />
               <Skeleton className="h-8 w-1/4" />
               <div className="space-y-2 pt-2">
                 <Skeleton className="h-4 w-full" />
                 <Skeleton className="h-4 w-full" />
                 <Skeleton className="h-4 w-2/3" />
               </div>
            </div>
          ) : (
            <div className="mb-8">
              <div className="flex items-center gap-2 text-yellow-500 mb-2">
                <Star className="w-4 h-4 fill-current" />
                <span className="text-slate-900 font-bold">{product!.rating}</span>
                <span className="text-slate-400 text-sm">(120 reviews)</span>
              </div>
              <h1 className="text-4xl font-serif font-bold text-slate-900 mb-2">{product!.name}</h1>
              <div className="flex items-center justify-between mt-3">
                <p className="text-xl font-bold text-slate-900">
                  ₹{product!.price + selectedLens.price}
                </p>
                <Button size="md" className="px-8" onClick={handleAddToCart}>
                  Add to Bag
                </Button>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Includes frame and selected lenses.
              </p>
              <p className="text-slate-600 leading-relaxed mt-4">{product!.description}</p>
            </div>
          )}

          {!loading && product && (
            <div className="mb-10">
              <div className="bg-slate-50 rounded-xl p-4 border border-dashed border-slate-200">
                <h3 className="font-bold text-slate-900 mb-2 text-sm">
                  Frame size guide
                </h3>
                <p className="text-xs text-slate-500 mb-3">
                  Most faces fit a medium size. Use these numbers on your existing frame as a reference.
                </p>
                <div className="grid grid-cols-3 gap-3 text-center text-[11px] text-slate-600">
                  <div>
                    <p className="font-semibold text-slate-900">Lens width</p>
                    <p className="mt-1">48–52 mm</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Bridge</p>
                    <p className="mt-1">16–20 mm</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Temple</p>
                    <p className="mt-1">135–145 mm</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-slate-200 py-6 space-y-6">
            <h3 className="font-bold text-slate-900">Select Lenses</h3>
            <div className="space-y-3">
              {loading ? (
                [1, 2, 3, 4].map(i => (
                  <div key={i} className="p-4 rounded-xl border border-slate-200">
                    <div className="flex justify-between items-center mb-2">
                      <Skeleton className="h-5 w-1/3" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))
              ) : (
                LENS_OPTIONS.map(option => (
                  <motion.div 
                    key={option.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setSelectedLens(option)}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                      selectedLens.id === option.id 
                        ? 'border-brand-600 bg-brand-50' 
                        : 'border-slate-200 hover:border-brand-200'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-slate-900">{option.name}</span>
                      <span className="text-slate-600">
                        {option.price === 0 ? 'Free' : `+₹${option.price}`}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">{option.description}</p>
                  </motion.div>
                ))
              )}
            </div>

            <AnimatePresence>
              {!loading && selectedLens.id !== 'frame_only' && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-300">
                    <label className="flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors rounded-lg p-2">
                      <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                      <span className="text-sm font-medium text-slate-700">Upload Prescription</span>
                      <span className="text-xs text-slate-500 mt-1">.jpg, .png, or .pdf</span>
                      <input type="file" className="hidden" onChange={(e) => setPrescriptionFile(e.target.files?.[0] || null)} />
                    </label>
                    {prescriptionFile && (
                      <div className="mt-3 flex items-center gap-2 text-sm text-green-600 justify-center font-medium bg-green-50 p-2 rounded-lg">
                        <Check className="w-4 h-4" /> {prescriptionFile.name}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="border-t border-slate-200 pt-6 mt-6">
             {loading ? (
               <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-10 w-40" />
               </div>
             ) : (
               <div>
                  <p className="text-sm text-slate-500 mb-1">Total with selected lenses</p>
                  <motion.p 
                    key={product!.price + selectedLens.price}
                    initial={{ scale: 1.05, color: '#2563EB' }}
                    animate={{ scale: 1, color: '#0F172A' }}
                    className="text-2xl font-bold text-brand-900"
                  >
                     ₹{product!.price + selectedLens.price}
                  </motion.p>
               </div>
             )}
          </div>
        </motion.div>
      </div>

      {!loading && product && reviews.length > 0 && (
        <section className="mt-16 border-t border-slate-200 pt-10">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span>Customer reviews</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map(review => (
              <div
                key={review.id}
                className="bg-slate-50 rounded-xl p-4 border border-slate-100"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-slate-900">
                    {review.name}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <span>{review.rating.toFixed(1)}</span>
                  </div>
                </div>
                <p className="text-sm text-slate-600">{review.comment}</p>
                {review.tag && (
                  <p className="mt-2 inline-flex px-2 py-0.5 rounded-full bg-brand-50 text-[11px] font-medium text-brand-700">
                    {review.tag}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </PageTransition>
  );
};
