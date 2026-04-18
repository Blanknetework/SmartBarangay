"use client";

import { useState } from "react";
import { Plus, Search, SlidersHorizontal, TrendingUp, Wallet, ArrowRightLeft, DollarSign, X } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { PIIMask } from "@/components/pii-mask";

const data = [
  { name: 'Jan', current: 4000, previous: 2400 },
  { name: 'Feb', current: 3000, previous: 1398 },
  { name: 'Mar', current: 2000, previous: 3800 },
  { name: 'Apr', current: 2780, previous: 3908 },
  { name: 'May', current: 1890, previous: 4800 },
  { name: 'Jun', current: 2390, previous: 3800 },
  { name: 'Jul', current: 3490, previous: 4300 },
];

const latestPayments = [
  { id: "001", name: "Carlo Reyes", address: "Zone 1", method: "Cash", amount: "₱50", date: "03/14/2025", type: "Clearance Fee", status: "Renewed" },
  { id: "002", name: "Kevin Mendoza", address: "Zone 2", method: "Cash", amount: "₱150", date: "05/20/2025", type: "Business Permit", status: "Paid" },
  { id: "003", name: "Maria Santos", address: "Zone 3", method: "GCash", amount: "₱250", date: "06/01/2025", type: "Building Permit", status: "Paid" },
];

export default function FinancialPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="w-full space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-white">Financial Management</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Track barangay revenue, payments, and financial analytics.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-500/20 relative overflow-hidden">
          <div className="relative z-10">
            <p className="font-medium text-emerald-50 mb-1">Today's Revenue</p>
            <h3 className="text-4xl font-bold">₱1,250.00</h3>
          </div>
          <Wallet className="absolute right-4 bottom-4 w-20 h-20 text-emerald-300/30" />
        </div>
        
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden">
          <div className="relative z-10">
            <p className="font-medium text-blue-100 mb-1">Monthly Revenue</p>
            <h3 className="text-4xl font-bold">₱45,800.00</h3>
          </div>
          <TrendingUp className="absolute right-4 bottom-4 w-20 h-20 text-blue-300/30" />
        </div>

        <div className="bg-gradient-to-br from-rose-400 to-red-500 rounded-2xl p-6 text-white shadow-lg shadow-red-500/20 relative overflow-hidden">
          <div className="relative z-10">
            <p className="font-medium text-rose-100 mb-1">Total Transactions</p>
            <h3 className="text-4xl font-bold">142</h3>
          </div>
          <ArrowRightLeft className="absolute right-4 bottom-4 w-20 h-20 text-rose-300/30" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Chart Area */}
        <div className="lg:col-span-3 bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">Revenue Overview</h3>
            <div className="flex gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-blue-600"><div className="w-2 h-2 rounded-full bg-blue-600" /> Current Month</span>
              <span className="flex items-center gap-1.5 text-slate-400"><div className="w-2 h-2 rounded-full bg-slate-300" /> Previous Month</span>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="previous" stroke="#CBD5E1" strokeDasharray="5 5" fill="none" strokeWidth={2} />
                <Area type="monotone" dataKey="current" stroke="#3B82F6" fillOpacity={1} fill="url(#colorCurrent)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Side Panel Overview */}
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col gap-6">
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-4">Payment Breakdown</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500">Clearance Fees</span>
                  <span className="font-semibold">65%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500">Business Permits</span>
                  <span className="font-semibold">25%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500">Other Fees</span>
                  <span className="font-semibold">10%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-amber-400 h-2 rounded-full" style={{ width: '10%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 mt-4">
             <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-3">Status Legend</h3>
             <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
               <li className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded bg-emerald-500"></div> Paid in Full</li>
               <li className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded bg-amber-400"></div> Renewed</li>
               <li className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded bg-rose-500"></div> Overdue Balance</li>
             </ul>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 border-b border-slate-100 dark:border-slate-800 gap-4">
          <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">Latest Payments</h3>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search records..." 
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <button className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800">
              <SlidersHorizontal className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> Record Payment
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 dark:bg-slate-800/40 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider font-semibold">
                <th className="p-4 pl-6">ID</th>
                <th className="p-4">Name</th>
                <th className="p-4">Address</th>
                <th className="p-4">Payment Method</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Date</th>
                <th className="p-4">Regulatory Fees</th>
                <th className="p-4 pr-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {latestPayments.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="p-4 pl-6 font-medium text-slate-700 dark:text-slate-300">{row.id}</td>
                  <td className="p-4 font-medium text-slate-800 dark:text-slate-200">
                    <PIIMask value={row.name} type="name" />
                  </td>
                  <td className="p-4 text-slate-500 dark:text-slate-400">{row.address}</td>
                  <td className="p-4 text-slate-500 dark:text-slate-400">{row.method}</td>
                  <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">{row.amount}</td>
                  <td className="p-4 text-slate-500 dark:text-slate-400">{row.date}</td>
                  <td className="p-4 text-slate-500 dark:text-slate-400">{row.type}</td>
                  <td className="p-4 pr-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      row.status === 'Renewed' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' : 
                      row.status === 'Paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1E293B] w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800 relative">
            
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                Record Payment
              </h3>
            </div>
            
            <div className="px-6 py-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Resident Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Juan Dela Cruz" 
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Address</label>
                <input 
                  type="text" 
                  placeholder="e.g. Zone 1, Block 4" 
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Payment Category</label>
                <select defaultValue="" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none text-slate-800 dark:text-slate-200">
                  <option value="" disabled className="text-slate-400">Select category...</option>
                  <option value="clearance" className="bg-white dark:bg-[#1E293B]">Barangay Clearance</option>
                  <option value="business" className="bg-white dark:bg-[#1E293B]">Business Permit</option>
                  <option value="id" className="bg-white dark:bg-[#1E293B]">Barangay ID</option>
                  <option value="certificate" className="bg-white dark:bg-[#1E293B]">Residency Certificate</option>
                </select>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Amount (₱)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-semibold text-slate-500">₱</span>
                  <input 
                    type="number" 
                    placeholder="0.00" 
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-lg font-semibold tracking-wide"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Payment Method</label>
                <select defaultValue="" className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0F172A] focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none text-slate-800 dark:text-slate-200">
                  <option value="" disabled className="text-slate-400">Select method...</option>
                  <option value="cash" className="bg-white dark:bg-[#1E293B]">Cash</option>
                  <option value="gcash" className="bg-white dark:bg-[#1E293B]">GCash</option>
                  <option value="paymaya" className="bg-white dark:bg-[#1E293B]">Maya</option>
                  <option value="bank" className="bg-white dark:bg-[#1E293B]">Bank Transfer</option>
                </select>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 rounded-b-2xl">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 text-sm font-semibold rounded-xl text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button 
                className="px-6 py-2.5 text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-md shadow-blue-500/20 transition-all"
              >
                Record Payment
              </button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}
