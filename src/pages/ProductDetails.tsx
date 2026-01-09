
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { PRODUCTS, LENS_OPTIONS } from '../constants';
import { useCart } from '../context/CartContext';
import { Button } from '../components/Button';
import { Star, Check, UploadCloud } from 'lucide-react';
import { LensOption } from '../../types';
import { PageTransition } from '../components/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '../components/Skeleton';

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState(PRODUCTS.find(p => p.id === id));
  const { addToCart } = useCart();
  
  const [selectedLens, setSelectedLens] = useState<LensOption>(LENS_OPTIONS[0]);
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  // Simulate API fetch delay
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setProduct(PRODUCTS.find(p => p.id === id));
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [id]);

  if (!loading && !product) return <div>Product not found</div>;

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
                <div className="aspect-[4/3] bg-slate-100 rounded-2xl overflow-hidden shadow-sm relative">
                  <motion.img 
                    key={activeImage}
                    src={activeImage === 0 ? product!.image : `https://picsum.photos/800/600?random=${activeImage + 10}`}
                    alt={product!.name} 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  {[0, 1, 2].map((i) => (
                    <motion.div 
                      key={i} 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setActiveImage(i)}
                      className={`aspect-square bg-slate-50 rounded-lg overflow-hidden cursor-pointer border-2 transition-colors ${activeImage === i ? 'border-brand-600' : 'border-transparent'}`}
                    >
                      <img 
                        src={i === 0 ? product!.image : `https://picsum.photos/400/400?random=${i + 10}`} 
                        alt="Detail" 
                        className="w-full h-full object-cover" 
                      />
                    </motion.div>
                  ))}
                </div>
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
              <p className="text-xl text-slate-500 mb-4">₹{product!.price}</p>
              <p className="text-slate-600 leading-relaxed">{product!.description}</p>
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

          <div className="flex items-center justify-between border-t border-slate-200 pt-6 mt-6">
             {loading ? (
               <>
                 <div>
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-10 w-32" />
                 </div>
                 <Skeleton className="h-14 w-40 rounded-xl" />
               </>
             ) : (
               <>
                 <div>
                    <p className="text-sm text-slate-500">Total Price</p>
                    <motion.p 
                      key={product!.price + selectedLens.price}
                      initial={{ scale: 1.2, color: '#2563EB' }}
                      animate={{ scale: 1, color: '#0F172A' }}
                      className="text-3xl font-bold text-brand-900"
                    >
                       ₹{product!.price + selectedLens.price}
                    </motion.p>
                 </div>
                 <Button size="lg" className="px-12" onClick={handleAddToCart}>
                   Add to Bag
                 </Button>
               </>
             )}
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
};
