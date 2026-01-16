
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Truck, ShieldCheck, Zap, User, RefreshCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { PageTransition, staggerContainer, staggerItem } from '../components/PageTransition';
import { Skeleton } from '../components/Skeleton';
import { Product } from '../types';
import { api, endpoints } from '../services/api';

export const Home: React.FC = () => {
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [refreshingTrending, setRefreshingTrending] = useState(false);

  useEffect(() => {
    const fetchTrending = async (silent: boolean) => {
      if (silent) {
        setRefreshingTrending(true);
      } else {
        setLoadingTrending(true);
      }

      try {
        const response = await api.get(endpoints.products);
        const products = (response.data as Product[]) || [];
        setTrendingProducts(products.slice(0, 3));
      } catch (error) {
        setTrendingProducts([]);
      } finally {
        setLoadingTrending(false);
        setRefreshingTrending(false);
      }
    };

    fetchTrending(false);
  }, []);

  const handleRefreshTrending = () => {
    setRefreshingTrending(true);
    api
      .get(endpoints.products)
      .then(response => {
        const products = (response.data as Product[]) || [];
        setTrendingProducts(products.slice(0, 3));
      })
      .catch(() => {
        setTrendingProducts([]);
      })
      .finally(() => {
        setRefreshingTrending(false);
      });
  };

  return (
    <PageTransition className="w-full">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center bg-slate-50 overflow-hidden">
        {/* Abstract Shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ duration: 2 }}
              className="absolute -top-[20%] -right-[10%] w-[800px] h-[800px] bg-blue-100/50 rounded-full blur-3xl"
            ></motion.div>
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-white to-transparent"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col-reverse md:flex-row items-center gap-12">
          
          {/* Text Content */}
          <div className="w-full md:w-1/2 z-10 pt-10 md:pt-0">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full shadow-sm border border-slate-200 mb-8"
            >
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
                <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">Premium Eyewear</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-6 leading-[1.1] font-heading"
            >
              Vision,<br />
              <span className="text-brand-600">Refined.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-lg text-slate-600 mb-10 leading-relaxed max-w-lg font-light"
            >
              Experience the perfect blend of style and clarity. Precision-crafted lenses, premium Italian acetate frames, and honest Indian prices.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link to="/shop">
                <Button size="lg" className="shadow-brand-500/25 w-full sm:w-auto">
                  Explore Collection
                </Button>
              </Link>
              <Link to="/eye-test">
                <Button variant="outline" size="lg" className="w-full sm:w-auto bg-white hover:bg-slate-50">
                  Take Vision Test
                </Button>
              </Link>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-12 flex items-center gap-4 text-sm text-slate-500 font-medium"
            >
                <div className="flex -space-x-3">
                    {[1,2,3].map(i => (
                        <div key={i} className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center overflow-hidden shadow-sm">
                           <User className="w-5 h-5 text-slate-400" />
                        </div>
                    ))}
                </div>
                <div className="flex flex-col">
                   <div className="flex gap-0.5 text-yellow-500 mb-0.5">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <Star className="w-3.5 h-3.5 fill-current" />
                   </div>
                   <p className="text-xs">Trusted by 50,000+ Customers</p>
                </div>
            </motion.div>
          </div>

          {/* Hero Image */}
          <div className="w-full md:w-1/2 relative h-[50vh] md:h-[700px] flex justify-center items-center">
             <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
                className="relative z-10 w-full max-w-md aspect-[3/4] bg-slate-200 rounded-[2rem] overflow-hidden shadow-2xl shadow-slate-200"
             >
                 <img 
                    src="https://images.unsplash.com/photo-1548142813-c348350df52b?q=80&w=989&auto=format&fit=crop"
                    alt="Man wearing stylish glasses"
                    className="w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-[1.5s]"
                 />
                 {/* Glass Badge */}
                 <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1, duration: 0.5 }}
                    className="absolute bottom-8 left-8 right-8 bg-white/10 backdrop-blur-xl border border-white/20 p-5 rounded-2xl shadow-xl"
                 >
                    <p className="text-sm font-medium text-white/90">"The quality is comparable to luxury brands that cost 5x more. OptiStyle is a game changer."</p>
                    <div className="mt-3 flex items-center gap-2">
                       <div className="w-6 h-6 rounded-full bg-white/20"></div>
                       <p className="text-xs font-bold text-white uppercase tracking-wide">Verified Buyer</p>
                    </div>
                 </motion.div>
             </motion.div>
          </div>
        </div>
      </section>

      {/* Value Props - Minimalist */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12"
          >
            {[
              { icon: ShieldCheck, title: "1 Year Warranty", desc: "Comprehensive coverage on frames and lens coating quality." },
              { icon: Zap, title: "Express Delivery", desc: "Priority shipping partners ensure your glasses arrive in 3-5 days." },
              { icon: Truck, title: "14-Day Returns", desc: "No questions asked. If it doesn't fit perfectly, send it back." }
            ].map((feature, i) => (
              <motion.div variants={staggerItem} key={i} className="flex flex-col items-start p-6 rounded-2xl hover:bg-slate-50 transition-colors">
                <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-slate-900/20">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 font-heading">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2 font-heading">Trending Now</h2>
              <p className="text-slate-500">Curated selections for the modern individual.</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleRefreshTrending}
                className="hidden sm:inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600"
              >
                <RefreshCcw
                  className={`w-3 h-3 ${refreshingTrending ? 'animate-spin' : ''}`}
                />
                <span>{refreshingTrending ? 'Refreshing' : 'Refresh'}</span>
              </button>
              <Link
                to="/shop"
                className="text-brand-600 font-bold text-sm hover:text-brand-800 flex items-center group transition-colors"
              >
                View All Collection
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {loadingTrending ? (
              [...Array(3)].map((_, index) => (
                <motion.div variants={staggerItem} key={index} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 h-full flex flex-col">
                  <Skeleton className="aspect-[5/4] w-full" variant="rectangular" />
                  <div className="p-6 space-y-4">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </motion.div>
              ))
            ) : trendingProducts.length === 0 ? (
              <motion.div
                variants={staggerItem}
                className="col-span-1 md:col-span-2 lg:col-span-3 bg-white rounded-2xl border border-dashed border-slate-300 p-8 flex items-center justify-center text-center"
              >
                <p className="text-slate-500 text-sm">
                  No products available yet. Please check back soon.
                </p>
              </motion.div>
            ) : (
              trendingProducts.map((product) => (
                <motion.div variants={staggerItem} key={product.id}>
                  <Link to={`/product/${product.id}`} className="group block h-full">
                    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-200 h-full flex flex-col group-hover:-translate-y-1">
                      <div className="aspect-[5/4] bg-slate-100 relative overflow-hidden">
                        <img 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        {product.price < 1300 && (
                            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-slate-900 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                                Best Seller
                            </div>
                        )}
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-bold text-slate-900 font-heading group-hover:text-brand-600 transition-colors">{product.name}</h3>
                            <span className="text-lg font-bold text-slate-900">₹{product.price}</span>
                        </div>
                        <p className="text-slate-400 text-xs mb-6 uppercase tracking-wider">{product.shape} · {product.category}</p>
                        
                        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-sm font-medium text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                          <span>View Details</span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
          </motion.div>
        </div>
      </section>
    </PageTransition>
  );
};
