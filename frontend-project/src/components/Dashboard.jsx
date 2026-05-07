import React, { useState, useEffect } from 'react';
import { 
  Package, 
  TrendingUp, 
  AlertTriangle, 
  Activity, 
  FileText 
} from 'lucide-react';
import axios from 'axios';

// Destructure setActiveTab from props
const Dashboard = ({ setActiveTab }) => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStockIn: 0,
    lowStockCount: 0,
    totalTransactions: 0,
    recentActivity: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/reports/summary');
        
        // Safety check for math operations
        const totalIn = Number(res.data.movements?.total_in || 0);
        const totalOut = Number(res.data.movements?.total_out || 0);

        setStats({
          totalProducts: res.data.summary?.total_items || 0,
          totalStockIn: totalIn,
          lowStockCount: res.data.lowStock?.length || 0,
          totalTransactions: totalIn + totalOut,
          recentActivity: res.data.lowStock || []
        });
      } catch (err) {
        console.error("Error fetching dashboard stats", err);
      }
    };
    fetchDashboardData();
  }, []);

  const cards = [
    { 
      title: 'Total Products', 
      value: stats.totalProducts, 
      icon: <Package className="text-blue-600" />, 
      bg: 'bg-blue-50' 
    },
    { 
      title: 'Total Stock In', 
      value: stats.totalStockIn, 
      icon: <TrendingUp className="text-green-600" />, 
      bg: 'bg-green-50' 
    },
    { 
      title: 'Low Stock Alert', 
      value: stats.lowStockCount, 
      icon: <AlertTriangle className="text-red-600" />, 
      bg: 'bg-red-50' 
    },
    { 
      title: 'Total Movements', 
      value: stats.totalTransactions, 
      icon: <Activity className="text-purple-600" />, 
      bg: 'bg-purple-50' 
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold text-gray-800">Inventory Overview</h2>
        <p className="text-gray-500 font-medium">Welcome back, {localStorage.getItem('username')}!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className={`p-4 rounded-xl ${card.bg}`}>
              {card.icon}
            </div>
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{card.title}</p>
              <h3 className="text-2xl font-black text-gray-800">{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Activity size={20} className="text-blue-600" />
            Critical Stock Status
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 text-xs uppercase tracking-widest border-b">
                  <th className="pb-4 font-semibold">Product Name</th>
                  <th className="pb-4 font-semibold">Current Stock</th>
                  <th className="pb-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {stats.recentActivity.length > 0 ? (
                  stats.recentActivity.map((item, idx) => (
                    <tr key={idx} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="py-4 font-bold text-gray-700">{item.product_name}</td>
                      <td className="py-4 font-mono">{item.quantity}</td>
                      <td className="py-4">
                        <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-[10px] font-black uppercase">
                          Low Stock
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="py-8 text-center text-gray-400 italic">
                      No critical stock issues detected.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Card */}
        <div className="bg-slate-900 rounded-2xl shadow-xl p-8 text-white flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-blue-600 rounded-xl mb-6 flex items-center justify-center">
              <FileText size={24} />
            </div>
            <h3 className="font-bold text-xl mb-3">Inventory Reports</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Generate a comprehensive PDF report of your current stock levels, valuation, and transaction history.
            </p>
          </div>
          <button 
            onClick={() => setActiveTab('reports')} // This triggers the App.jsx state switch
            className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-lg shadow-blue-900/50 active:scale-95"
          >
            View Full Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;