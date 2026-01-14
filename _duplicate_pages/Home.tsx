import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Truck, ShieldCheck, Zap, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { PRODUCTS } from '../constants';
import { PageTransition, staggerContainer, staggerItem } from '../components/PageTransition';

export const Home: React.FC = () => {
  return (
    <PageTransition className="w-full">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center bg-brand-50 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.5 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute -top-20 -right-20 w-96 h-96 bg-brand-200 rounded-full blur-3xl"
            ></motion.div>
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-white to-transparent"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col-reverse md:flex-row items-center">
          
          {/* Text Content */}
          <div className="w-full md:w-1/2 z-10 pt-10 md:pt-0">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100 mb-6"
            >
                <span className="w-2 h-2 rounded-full bg-accent-teal animate-pulse"></span>
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Made for India</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-tight font-heading"
            >
              Premium Eyewear.<br />
              <span className="text-brand-600">Honest Indian Prices.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-lg text-slate-600 mb-8 leading-relaxed max-w-lg"
            >
              Get high-quality prescription glasses and sunglasses delivered to your home. Prices start at just ₹999.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link to="/shop">
                <Button size="lg" className="bg-brand-600 text-white hover:bg-brand-700 shadow-lg w-full sm:w-auto font-bold rounded-full hover:scale-105 transition-transform">
                  Shop Now
                </Button>
              </Link>
              <Link to="/eye-test">
                <Button variant="outline" className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50 w-full sm:w-auto font-medium rounded-full hover:scale-105 transition-transform" size="lg">
                  Free Vision Check
                </Button>
              </Link>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-8 flex items-center gap-4 text-sm text-slate-500 font-medium"
            >
                <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center overflow-hidden">
                           <User className="w-5 h-5 text-slate-400" />
                        </div>
                    ))}
                </div>
                <p>Trusted by 50,000+ Indians</p>
            </motion.div>
          </div>

          {/* Hero Image */}
          <div className="w-full md:w-1/2 relative h-[50vh] md:h-auto flex justify-center">
             <motion.div 
                initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ delay: 0.4, duration: 0.8, type: "spring" }}
                className="relative z-10 w-full max-w-md aspect-[4/5] md:aspect-square bg-slate-200 rounded-3xl overflow-hidden shadow-2xl"
             >
                 <img 
                    src="https://images.unsplash.com/photo-1548142813-c348350df52b?q=80&w=989&auto=format&fit=crop"
                    alt="Indian woman wearing glasses"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                 />
                 {/* Floating Badge */}
                 <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1, duration: 0.5 }}
                    className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-lg max-w-[200px]"
                 >
                    <div className="flex items-center gap-1 text-yellow-500 mb-1">
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                    </div>
                    <p className="text-xs font-bold text-slate-900">"Got my specs in just 3 days. Superb quality!"</p>
                    <p className="text-[10px] text-slate-500 mt-1">- Anjali P., Mumbai</p>
                 </motion.div>
             </motion.div>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              { icon: ShieldCheck, title: "1 Year Warranty", desc: "Full warranty on coating and frame quality.", color: "text-brand-600", bg: "bg-brand-50" },
              { icon: Zap, title: "Fast Delivery", desc: "Delivery within 3-5 days across India.", color: "text-accent-teal", bg: "bg-teal-50" },
              { icon: Truck, title: "Easy Returns", desc: "Don't like it? Return it easily within 14 days.", color: "text-accent-coral", bg: "bg-orange-50" }
            ].map((feature, i) => (
              <motion.div variants={staggerItem} key={i} className="flex flex-col items-center text-center p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-14 h-14 ${feature.bg} ${feature.color} rounded-full flex items-center justify-center mb-4`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">{feature.title}</h3>
                <p className="text-slate-500 text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Products Preview */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">Trending Frames</h2>
              <p className="text-slate-500 text-sm">Most loved styles this month.</p>
            </div>
            <Link to="/shop" className="text-brand-600 font-bold text-sm hover:underline flex items-center group">
              View All <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {PRODUCTS.slice(0, 3).map((product) => (
              <motion.div variants={staggerItem} key={product.id}>
                <Link to={`/product/${product.id}`} className="group block h-full">
                  <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 h-full flex flex-col">
                    <div className="aspect-[5/4] bg-slate-100 relative overflow-hidden">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {product.price < 1300 && (
                          <div className="absolute top-3 left-3 bg-green-600 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide shadow-sm">
                              Best Seller
                          </div>
                      )}
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-1">
                          <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors">{product.name}</h3>
                          <span className="text-base font-bold text-brand-600">₹{product.price}</span>
                      </div>
                      <p className="text-slate-400 text-xs mb-4 capitalize">{product.shape} · {product.category}</p>
                      
                      <button className="mt-auto w-full py-2 rounded-lg bg-brand-50 text-brand-700 font-semibold text-sm group-hover:bg-brand-600 group-hover:text-white transition-all">
                        View Details
                      </button>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      
      {/* Testimonials */}
      <section className="py-20 bg-brand-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
             <div className="absolute -top-40 -left-40 w-96 h-96 bg-white rounded-full blur-3xl"></div>
             <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          </div>
          <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
              <h2 className="text-2xl font-bold mb-8">Happy Customers Across India</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                  {[
                    { text: "Better than my local optical shop. The price is unbeatable.", name: "Rohan D.", city: "Delhi" },
                    { text: "I was worried about buying online, but the fit is perfect.", name: "Priya S.", city: "Bangalore" },
                    { text: "Customer support on WhatsApp was very helpful with my prescription.", name: "Amit K.", city: "Pune" }
                  ].map((t, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white/10 p-5 rounded-xl backdrop-blur-sm hover:bg-white/20 transition-colors"
                    >
                        <div className="flex gap-1 text-yellow-400 mb-2">★★★★★</div>
                        <p className="text-brand-100 text-sm mb-3">"{t.text}"</p>
                        <p className="font-bold text-xs">– {t.name}, {t.city}</p>
                    </motion.div>
                  ))}
              </div>
          </div>
      </section>
    </PageTransition>
  );
};