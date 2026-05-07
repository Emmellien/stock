import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Printer, TrendingDown, DollarSign, Package } from 'lucide-react';

const Report = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/reports/summary');
        setData(res.data);
      } catch (err) {
        console.error("Error fetching report", err);
      }
    };
    fetchReport();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (!data) return <div className="p-8 text-center text-gray-500">Loading Report...</div>;

  return (
    <div className="space-y-8 print:p-0">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Inventory Report</h2>
          <p className="text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
        </div>
        <button 
          onClick={handlePrint}
          className="bg-slate-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-700 print:hidden"
        >
          <Printer size={20} /> Print Report
        </button>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-l-4 border-l-blue-500">
          <div className="flex items-center gap-3 text-blue-600 mb-2">
            <DollarSign size={24} /> <span className="font-bold uppercase text-xs">Total Assets Value</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">${data.summary.total_value?.toLocaleString()}</h3>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-l-4 border-l-green-500">
          <div className="flex items-center gap-3 text-green-600 mb-2">
            <Package size={24} /> <span className="font-bold uppercase text-xs">Total Stock Volume</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{data.summary.total_quantity} Units</h3>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-l-4 border-l-red-500">
          <div className="flex items-center gap-3 text-red-600 mb-2">
            <TrendingDown size={24} /> <span className="font-bold uppercase text-xs">Low Stock Items</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800">{data.lowStock.length} Products</h3>
        </div>
      </div>

      {/* Low Stock Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-4 bg-gray-50 border-b">
          <h3 className="font-bold text-red-700 flex items-center gap-2">
            <FileText size={18} /> Critical Low Stock List
          </h3>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-400 text-xs uppercase border-b">
              <th className="p-4">Product Name</th>
              <th className="p-4 text-center">Remaining Quantity</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.lowStock.map((item, idx) => (
              <tr key={idx}>
                <td className="p-4 font-medium">{item.product_name}</td>
                <td className="p-4 text-center font-mono">{item.quantity}</td>
                <td className="p-4">
                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">
                    Reorder Immediately
                  </span>
                </td>
              </tr>
            ))}
            {data.lowStock.length === 0 && (
              <tr>
                <td colSpan="3" className="p-8 text-center text-gray-400 italic">No low stock items detected. Inventory levels are healthy.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Movement Summary Card */}
      <div className="bg-slate-50 p-6 rounded-xl border border-dashed border-slate-300">
        <h4 className="font-bold text-slate-700 mb-4 uppercase text-sm tracking-widest">Movement Analytics</h4>
        <div className="flex justify-around text-center">
          <div>
            <p className="text-gray-500 text-xs mb-1">Total Stock Inbound</p>
            <p className="text-xl font-bold text-green-600">+{data.movements.total_in || 0}</p>
          </div>
          <div className="w-px h-10 bg-slate-200"></div>
          <div>
            <p className="text-gray-500 text-xs mb-1">Total Stock Outbound</p>
            <p className="text-xl font-bold text-red-600">-{data.movements.total_out || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report;