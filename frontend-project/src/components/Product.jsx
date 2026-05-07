import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, PackageSearch } from 'lucide-react';

const Product = () => {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ product_name: '', price: '', quantity: '' });

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/product');
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to fetch products");
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/product/add', formData);
      setFormData({ product_name: '', price: '', quantity: '' });
      setShowForm(false);
      fetchProducts(); // Refresh list
    } catch (err) {
      alert("Error adding product");
    }
  };

  const deleteProduct = async (id) => {
    if (window.confirm("Delete this product?")) {
      await axios.delete(`http://localhost:5000/api/product/${id}`);
      fetchProducts();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Product List</h2>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700"
        >
          <Plus size={20} /> <span>{showForm ? 'Close' : 'Add Product'}</span>
        </button>
      </div>

      {/* Add Product Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border grid grid-cols-3 gap-4 animate-in fade-in duration-300">
          <input 
            type="text" placeholder="Product Name" required
            className="border p-2 rounded"
            onChange={(e) => setFormData({...formData, product_name: e.target.value})}
          />
          <input 
            type="number" placeholder="Unit Price" required
            className="border p-2 rounded"
            onChange={(e) => setFormData({...formData, unit_price: e.target.value})}
          />
          <input 
            type="number" placeholder="Initial Quantity" required
            className="border p-2 rounded"
            onChange={(e) => setFormData({...formData, quantity: e.target.value})}
          />
          <button type="submit" className="bg-green-600 text-white rounded p-2 hover:bg-green-700 col-span-3">
            Save Product
          </button>
        </form>
      )}

      {/* Product Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4 font-semibold text-gray-600">ID</th>
              <th className="p-4 font-semibold text-gray-600">Name</th>
              <th className="p-4 font-semibold text-gray-600">Price</th>
              <th className="p-4 font-semibold text-gray-600">Stock</th>
              <th className="p-4 font-semibold text-gray-600 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.product_id} className="border-b hover:bg-gray-50 transition-colors">
                <td className="p-4 text-gray-500">#{p.product_id}</td>
                <td className="p-4 font-medium text-gray-800">{p.product_name}</td>
                <td className="p-4">${p.unit_price}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${p.quantity < 5 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                    {p.quantity} in stock
                  </span>
                </td>
                <td className="p-4 text-center">
                  <button onClick={() => deleteProduct(p.product_id)} className="text-red-500 hover:text-red-700">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <div className="p-10 text-center text-gray-400">
            <PackageSearch size={48} className="mx-auto mb-2 opacity-20" />
            <p>No products found. Start by adding one!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Product;