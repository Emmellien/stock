import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowDownCircle, Plus, Calendar, Package, User } from 'lucide-react';

const StockIn = () => {
  const [products, setProducts] = useState([]);
  const [stockInHistory, setStockInHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    product_id: '',
    quantity_in: '',
    date_in: new Date().toISOString().split('T')[0], // Defaults to today's date
  });

  // 1. Fetch both products (for dropdown) and history (for table)
  const fetchData = async () => {
    try {
      const [prodRes, historyRes] = await Promise.all([
        axios.get('http://localhost:5000/api/product'),
        axios.get('http://localhost:5000/api/stock-in')
      ]);
      setProducts(prodRes.data);
      setStockInHistory(historyRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      user_id: localStorage.getItem('user_id') // Automatically get current logged-in user
    };

    try {
      const response = await axios.post('http://localhost:5000/api/stock-in/add', payload);
      alert(response.data.message);
      
      // Reset form and refresh lists
      setFormData({ 
        product_id: '', 
        quantity_in: '', 
        date_in: new Date().toISOString().split('T')[0] 
      });
      fetchData(); 
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update stock");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-green-100 text-green-600 rounded-xl">
          <ArrowDownCircle size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Stock Inbound</h2>
          <p className="text-gray-500 text-sm">Add newly received materials to your inventory</p>
        </div>
      </div>

      {/* Entry Form Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Select Product</label>
            <select
              required
              className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
              value={formData.product_id}
              onChange={(e) => setFormData({...formData, product_id: e.target.value})}
            >
              <option value="">Choose a product...</option>
              {products.map(p => (
                <option key={p.product_id} value={p.product_id}>
                  {p.product_name} (Current: {p.quantity})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Quantity In</label>
            <input
              type="number"
              required
              min="1"
              placeholder="e.g. 50"
              className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
              value={formData.quantity_in}
              onChange={(e) => setFormData({...formData, quantity_in: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Date Received</label>
            <input
              type="date"
              required
              className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
              value={formData.date_in}
              onChange={(e) => setFormData({...formData, date_in: e.target.value})}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white font-bold p-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-900/20 disabled:opacity-50"
          >
            {loading ? 'Processing...' : <><Plus size={20}/> Record Entry</>}
          </button>
        </form>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-50 bg-gray-50/50">
          <h3 className="font-bold text-gray-700">Recent Inbound History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-400 text-xs uppercase tracking-widest border-b">
                <th className="p-5 font-semibold">Date</th>
                <th className="p-5 font-semibold">Product</th>
                <th className="p-5 font-semibold text-center">Amount Added</th>
                <th className="p-5 font-semibold">Processed By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stockInHistory.map((row) => (
                <tr key={row.stockin_id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="p-5 text-gray-600 flex items-center gap-2">
                    <Calendar size={14} className="text-gray-400" />
                    {new Date(row.date_in).toLocaleDateString()}
                  </td>
                  <td className="p-5 font-bold text-gray-700">
                    <div className="flex items-center gap-2">
                      <Package size={14} className="text-blue-500" />
                      {row.product_name}
                    </div>
                  </td>
                  <td className="p-5 text-center">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-black">
                      +{row.quantity_in}
                    </span>
                  </td>
                  <td className="p-5 text-gray-500 text-sm italic flex items-center gap-2">
                    <User size={14} /> {row.username}
                  </td>
                </tr>
              ))}
              {stockInHistory.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-10 text-center text-gray-400">No records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StockIn;