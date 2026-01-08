import React, { useState } from 'react';
import { PageTransition } from '../components/PageTransition';
import { Button } from '../components/Button';
import { Mail, MapPin, Phone, MessageSquare, Send, CheckCircle, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Contact: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Using FormSubmit with AJAX to prevent page redirect
      const response = await fetch("https://formsubmit.co/ajax/divyanshu00884466@gmail.com", {
        method: "POST",
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          _subject: `OptiStyle Feedback: ${formData.subject}`,
          _template: 'table' // Makes the email look cleaner
        })
      });

      if (response.ok) {
        setSuccess(true);
        setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Form error:", error);
      alert("Failed to send message.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold text-slate-900 mb-4">Get in Touch</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Have a question about your order, prescription, or just want to give feedback? We'd love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Contact Info Side */}
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Contact Information</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-brand-50 rounded-full flex items-center justify-center text-brand-600 shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Phone Support</p>
                    <p className="text-slate-500 text-sm mb-1">Mon-Sat, 9am - 7pm</p>
                    <p className="font-bold text-brand-600">+91 80053 43226</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-brand-50 rounded-full flex items-center justify-center text-brand-600 shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Email</p>
                    <p className="text-slate-500 text-sm mb-1">For orders & general feedback</p>
                    <p className="font-bold text-brand-600">support@optistyle.in</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-brand-50 rounded-full flex items-center justify-center text-brand-600 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Headquarters</p>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      Eye Care Optical, Near Gahoi Vatika, Peetambra Road,<br/>
                      Madhapur, Hyderabad, Telangana 500081
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Decoration */}
            <div className="bg-brand-600 rounded-2xl p-8 text-white relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="font-serif font-bold text-2xl mb-2">Need a quick answer?</h3>
                    <p className="text-brand-100 mb-6">Try our AI Stylist Assistant for instant help with frame recommendations and basic queries.</p>
                    <div className="flex items-center gap-2 text-sm font-bold bg-white/10 w-fit px-4 py-2 rounded-lg backdrop-blur-sm">
                        <MessageSquare className="w-4 h-4" /> Available 24/7
                    </div>
                </div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
            </div>
          </div>

          {/* Feedback Form Side */}
          <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 relative overflow-hidden">
             <AnimatePresence mode="wait">
                {success ? (
                    <motion.div 
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="min-h-[400px] flex flex-col items-center justify-center text-center"
                    >
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                            <CheckCircle className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">Message Sent!</h3>
                        <p className="text-slate-500 mb-8 max-w-xs">
                            Thank you for your feedback. Our team will get back to you within 24 hours.
                        </p>
                        <Button onClick={() => setSuccess(false)} variant="outline">
                            Send Another Message
                        </Button>
                    </motion.div>
                ) : (
                    <motion.form 
                        key="form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onSubmit={handleSubmit} 
                        className="space-y-6"
                    >
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 mb-1">Send us a Message</h3>
                            <p className="text-slate-500 text-sm">We value your feedback and inquiries.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Your Name</label>
                                <input 
                                    type="text" 
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
                                <input 
                                    type="email" 
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                    placeholder="john@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Subject</label>
                            <select 
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                            >
                                <option>General Inquiry</option>
                                <option>Order Issue</option>
                                <option>Product Feedback</option>
                                <option>Prescription Help</option>
                                <option>Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Message</label>
                            <textarea 
                                name="message"
                                required
                                rows={5}
                                value={formData.message}
                                onChange={handleChange}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-all resize-none"
                                placeholder="How can we help you today?"
                            ></textarea>
                        </div>

                        <Button 
                            type="submit" 
                            size="lg" 
                            className="w-full flex items-center justify-center gap-2 shadow-lg"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader className="w-5 h-5 animate-spin" /> Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="w-5 h-5" /> Send Message
                                </>
                            )}
                        </Button>
                        <p className="text-xs text-center text-slate-400">
                            Your details are secure. We never spam.
                        </p>
                    </motion.form>
                )}
             </AnimatePresence>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};