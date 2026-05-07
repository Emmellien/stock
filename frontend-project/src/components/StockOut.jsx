import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowUpCircle, Calendar, Package, AlertCircle } from 'lucide-react';

const StockOut = () => {
  const [products, setProducts] = useState([]);
  const [stockHistory, setStockHistory] = useState([]);
  const [formData, setFormData] = useState({
    product_id: '',
    quantity_out: '',
    date_out: new Date().toISOString().split('T')[0],
  });

  const fetchData = async () => {
    try {
      const [prodRes, historyRes] = await Promise.all([
        axios.get('http://localhost:5000/api/product'),
        axios.get('http://localhost:5000/api/stock-out')
      ]);
      setProducts(prodRes.data);
      setStockHistory(historyRes.data);
    } catch (err) {
      console.error("Error loading data", err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const selectedProduct = products.find(p => p.product_id === parseInt(formData.product_id));
    
    if (formData.quantity_out > selectedProduct.quantity) {
      alert("Cannot remove more than available stock!");
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/stock-out/add', {
        ...formData,
        user_id: localStorage.getItem('user_id')
      });
      setFormData({ ...formData, product_id: '', quantity_out: '' });
      fetchData();
      alert("Stock removed successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to process stock out");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
        <ArrowUpCircle className="text-red-600" /> Stock Out (Sales/Withdrawal)
      </h2>

      {/* Input Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
            <select 
              required className="w-full border p-2 rounded-lg bg-gray-50"
              value={formData.product_id}
              onChange={(e) => setFormData({...formData, product_id: e.target.value})}
            >
              <option value="">Choose product...</option>
              {products.map(p => (
                <option key={p.product_id} value={p.product_id} disabled={p.quantity <= 0}>
                  {p.product_name} ({p.quantity} available)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity Out</label>
            <input 
              type="number" required min="1"
              className="w-full border p-2 rounded-lg bg-gray-50"
              value={formData.quantity_out}
              onChange={(e) => setFormData({...formData, quantity_out: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input 
              type="date" required className="w-full border p-2 rounded-lg bg-gray-50"
              value={formData.date_out}
              onChange={(e) => setFormData({...formData, date_out: e.target.value})}
            />
          </div>

          <button type="submit" className="bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition">
            Record Withdrawal
          </button>
        </form>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-gray-700">Stock Out History</h3>
          <span className="text-xs text-gray-400 font-mono tracking-tighter uppercase italic">Inventory Outbound Logs</span>
        </div>
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
            <tr>
              <th className="p-4">Date</th>
              <th className="p-4">Product</th>
              <th className="p-4 text-center">Qty Removed</th>
              <th className="p-4">User</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {stockHistory.map((row) => (
              <tr key={row.stockout_id} className="hover:bg-gray-50">
                <td className="p-4 text-gray-600">{new Date(row.date_out).toLocaleDateString()}</td>
                <td className="p-4 font-medium text-gray-800">{row.product_name}</td>
                <td className="p-4 text-center">
                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">
                    -{row.quantity_out}
                  </span>
                </td>
                <td className="p-4 text-gray-500 text-sm">{row.username}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockOut;