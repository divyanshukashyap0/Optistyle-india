import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, Image as ImageIcon } from 'lucide-react';
import { Product } from '../../types';
import { getAdminProducts, addProduct, updateProduct, deleteProduct } from '../../services/adminService';
import { Button } from '../Button';

export const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
     name: '', price: 0, category: 'unisex', type: 'eyeglasses', shape: 'rectangle', description: '', image: ''
  });

  const fetchProducts = async () => {
    setLoading(true);
    const data = await getAdminProducts();
    setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData(product);
    } else {
      setEditingProduct(null);
      setFormData({ name: '', price: 999, category: 'unisex', type: 'eyeglasses', shape: 'rectangle', description: '', image: 'https://picsum.photos/800/600' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
       await updateProduct(editingProduct.id, formData);
    } else {
       // @ts-ignore
       await addProduct({ ...formData, rating: 5, colors: ['Black'] });
    }
    setIsModalOpen(false);
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      await deleteProduct(id);
      fetchProducts();
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-sm"
            placeholder="Search products..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
           <Plus className="w-4 h-4" /> Add Product
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
           <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
              <tr>
                 <th className="p-4">Product</th>
                 <th className="p-4">Category</th>
                 <th className="p-4">Price</th>
                 <th className="p-4">Shape</th>
                 <th className="p-4 text-right">Actions</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-slate-100">
              {loading ? (
                 <tr><td colSpan={5} className="p-8 text-center text-slate-400">Loading inventory...</td></tr>
              ) : filteredProducts.length === 0 ? (
                 <tr><td colSpan={5} className="p-8 text-center text-slate-400">No products found.</td></tr>
              ) : (
                 filteredProducts.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50 group">
                       <td className="p-4 flex items-center gap-3">
                          <img src={p.image} className="w-10 h-10 rounded-md object-cover bg-slate-100" alt="" />
                          <span className="font-bold text-slate-900">{p.name}</span>
                       </td>
                       <td className="p-4 capitalize text-slate-600">{p.category}</td>
                       <td className="p-4 font-medium text-slate-900">₹{p.price}</td>
                       <td className="p-4 capitalize text-slate-600">{p.shape}</td>
                       <td className="p-4 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={() => handleOpenModal(p)} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Edit2 className="w-4 h-4" /></button>
                             <button onClick={() => handleDelete(p.id)} className="p-1 text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                          </div>
                       </td>
                    </tr>
                 ))
              )}
           </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                 <h3 className="font-bold text-lg">{editingProduct ? 'Edit Product' : 'New Product'}</h3>
                 <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Product Name</label>
                    <input required className="w-full p-2 border rounded-md" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Price (₹)</label>
                        <input type="number" required className="w-full p-2 border rounded-md" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Shape</label>
                        <select className="w-full p-2 border rounded-md" value={formData.shape} onChange={e => setFormData({...formData, shape: e.target.value as any})}>
                            <option value="rectangle">Rectangle</option>
                            <option value="round">Round</option>
                            <option value="square">Square</option>
                            <option value="cat-eye">Cat Eye</option>
                            <option value="aviator">Aviator</option>
                        </select>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category</label>
                        <select className="w-full p-2 border rounded-md" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as any})}>
                            <option value="men">Men</option>
                            <option value="women">Women</option>
                            <option value="unisex">Unisex</option>
                            <option value="kids">Kids</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Type</label>
                        <select className="w-full p-2 border rounded-md" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})}>
                            <option value="eyeglasses">Eyeglasses</option>
                            <option value="sunglasses">Sunglasses</option>
                        </select>
                    </div>
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Image URL</label>
                    <div className="flex gap-2">
                        <input required className="w-full p-2 border rounded-md" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} />
                        <div className="w-10 h-10 bg-slate-100 rounded border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                           {formData.image ? <img src={formData.image} className="w-full h-full object-cover" /> : <ImageIcon className="w-5 h-5 text-slate-400" />}
                        </div>
                    </div>
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
                    <textarea required className="w-full p-2 border rounded-md h-24 text-sm" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                 </div>
                 
                 <div className="pt-4">
                    <Button type="submit" className="w-full justify-center">Save Product</Button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};
