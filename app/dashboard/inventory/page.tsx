"use client";

import { useState } from "react";
import { 
  Package, AlertTriangle, XOctagon, Search, Plus, 
  SlidersHorizontal, Eye, Trash2
} from "lucide-react";

export default function InventoryPage() {
  const [items, setItems] = useState([
    { id: "001", name: "Printer", category: "Equipment", qty: 3, inStock: 2, status: "Available", lastUpdated: "03/14/2025, 9:30 am", location: "Office" },
    { id: "002", name: "Bond Paper (A4)", category: "Supplies", qty: 50, inStock: 10, status: "Low Stock", lastUpdated: "03/20/2025, 1:15 pm", location: "Storage A" },
    { id: "003", name: "Monobloc Chairs", category: "Equipment", qty: 100, inStock: 95, status: "Available", lastUpdated: "03/25/2025, 10:00 am", location: "Multi-Purpose Hall" },
  ]);

  const [searchTerm, setSearchTerm] = useState("");

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.id.includes(searchTerm)
  );

  return (
    <div className="flex flex-col xl:flex-row gap-6 w-full animate-in fade-in duration-500">
      
      {/* Main Left Content */}
      <div className="flex-1 flex flex-col space-y-6 min-w-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-[#F9FAFB] tracking-tight">Inventory Management</h1>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-[#1F2937] border border-slate-200 dark:border-[#374151] rounded-3xl p-6 shadow-sm dark:shadow-none flex flex-col transition-all">
            <div className="flex items-center space-x-4 mb-4">
               <div className="bg-[#D1FAE5] dark:bg-[#065F46]/30 p-4 rounded-2xl border border-[#A7F3D0] dark:border-[#065F46]/50">
                  <Package size={28} className="text-[#047857] dark:text-[#6EE7B7]" strokeWidth={1.5} />
               </div>
               <div>
                 <h3 className="text-[15px] font-black text-slate-800 dark:text-[#F9FAFB]">Total Items</h3>
               </div>
            </div>
            <p className="text-[11px] font-bold text-slate-500 dark:text-[#9CA3AF] mb-1">Total Items In Stock</p>
            <p className="text-2xl font-black text-slate-800 dark:text-white">1</p>
          </div>

          <div className="bg-white dark:bg-[#1F2937] border border-slate-200 dark:border-[#374151] rounded-3xl p-6 shadow-sm dark:shadow-none flex flex-col transition-all">
            <div className="flex items-center space-x-4 mb-4">
               <div className="bg-[#FFEDD5] dark:bg-[#9A3412]/30 p-4 rounded-2xl border border-[#FED7AA] dark:border-[#9A3412]/50">
                  <AlertTriangle size={28} className="text-[#C2410C] dark:text-[#FDBA74]" strokeWidth={1.5}/>
               </div>
               <div>
                 <h3 className="text-[15px] font-black text-slate-800 dark:text-[#F9FAFB]">Low Stock Items</h3>
               </div>
            </div>
            <p className="text-[11px] font-bold text-slate-500 dark:text-[#9CA3AF] mb-1">Number of items that are running low</p>
            <p className="text-2xl font-black text-slate-800 dark:text-white">0</p>
          </div>

          <div className="bg-white dark:bg-[#1F2937] border border-slate-200 dark:border-[#374151] rounded-3xl p-6 shadow-sm dark:shadow-none flex flex-col transition-all">
            <div className="flex items-center space-x-4 mb-4">
               <div className="bg-[#FEE2E2] dark:bg-[#7F1D1D]/30 p-4 rounded-2xl border border-[#FECACA] dark:border-[#7F1D1D]/50">
                  <XOctagon size={28} className="text-[#DC2626] dark:text-[#FCA5A5]" strokeWidth={1.5} />
               </div>
               <div>
                 <h3 className="text-[15px] font-black text-slate-800 dark:text-[#F9FAFB] leading-tight">Out of<br/>Stock Items</h3>
               </div>
            </div>
            <p className="text-[11px] font-bold text-slate-500 dark:text-[#9CA3AF] mb-1">Total Items In Stock</p>
            <p className="text-2xl font-black text-slate-800 dark:text-white">0</p>
          </div>
        </div>

        {/* Inventory Overview Table */}
        <div className="w-full bg-white dark:bg-[#1F2937] rounded-3xl border border-slate-200 dark:border-[#374151] shadow-sm dark:shadow-none overflow-hidden flex flex-col flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-center p-6 border-b border-slate-200 dark:border-[#374151] gap-4">
            <h2 className="text-xl font-bold text-slate-800 dark:text-[#F9FAFB] tracking-tight">Inventory Overview</h2>
            
            <div className="flex items-center w-full sm:w-auto space-x-3">
              <div className="flex bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#374151] rounded-xl items-center px-4 py-2 w-full sm:w-64 focus-within:border-[#3B82F6] transition-colors">
                <Search size={16} className="text-slate-400 mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="Search Item.."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent border-none focus:outline-none text-sm w-full font-bold text-slate-700 dark:text-[#F9FAFB] placeholder:text-slate-400 placeholder:font-medium"
                />
                <SlidersHorizontal size={16} className="text-slate-700 dark:text-slate-300 ml-2 cursor-pointer shrink-0" />
              </div>
              <button className="flex items-center bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-[#2563EB]/20 dark:shadow-none transition-colors shrink-0">
                <Plus size={16} className="mr-1" strokeWidth={3} /> Add Item
              </button>
            </div>
          </div>

          <div className="overflow-x-auto w-full pb-4">
            <table className="w-full whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-200 dark:border-[#374151]">
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-[#9CA3AF]">ID</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-[#9CA3AF]">Item Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-[#9CA3AF]">Category</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 dark:text-[#9CA3AF]">Qty</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 dark:text-[#9CA3AF]">In Stock</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 dark:text-[#9CA3AF]">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-[#9CA3AF]">Last Updated</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-[#9CA3AF]">Location</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-[#9CA3AF] w-40">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item, idx) => (
                  <tr 
                    key={item.id} 
                    className="group hover:bg-slate-50 dark:hover:bg-[#374151]/30 transition-colors border-b border-slate-100 dark:border-[#374151]/50 last:border-0"
                  >
                    <td className="px-6 py-5 text-sm font-black text-slate-700 dark:text-[#D1D5DB]">{item.id}</td>
                    <td className="px-6 py-5 text-sm font-bold text-slate-800 dark:text-[#F9FAFB]">{item.name}</td>
                    <td className="px-6 py-5 text-sm font-bold text-slate-600 dark:text-[#9CA3AF]">{item.category}</td>
                    <td className="px-6 py-5 text-sm font-black text-center text-slate-800 dark:text-[#D1D5DB]">{item.qty}</td>
                    <td className="px-6 py-5 text-sm font-black text-center text-slate-800 dark:text-[#D1D5DB]">{item.inStock}</td>
                    <td className="px-6 py-5 text-center">
                      <span className={`px-4 py-1.5 rounded-xl text-[11px] font-black ${
                        item.status === 'Available' ? 'bg-[#D1FAE5] text-[#047857] dark:bg-[#065F46]/30 dark:text-[#6EE7B7]' :
                        item.status === 'Low Stock' ? 'bg-[#FFEDD5] text-[#C2410C] dark:bg-[#9A3412]/30 dark:text-[#FDBA74]' :
                        'bg-[#FEE2E2] text-[#DC2626] dark:bg-[#7F1D1D]/30 dark:text-[#FCA5A5]'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm font-bold text-slate-600 dark:text-[#9CA3AF]">{item.lastUpdated}</td>
                    <td className="px-6 py-5 text-sm font-bold text-slate-600 dark:text-[#9CA3AF]">{item.location}</td>
                    <td className="px-6 py-5 text-right w-40">
                       <div className="flex items-center justify-end space-x-3">
                         <button className="bg-[#E5E7EB] dark:bg-[#4B5563] hover:bg-[#D1D5DB] dark:hover:bg-[#6B7280] text-slate-700 dark:text-[#F9FAFB] px-5 py-2 rounded-xl text-xs font-black transition-colors shadow-sm">
                           View
                         </button>
                         <button className="bg-[#EF4444] hover:bg-[#DC2626] text-white px-5 py-2 rounded-xl text-xs font-black transition-colors shadow-sm shadow-[#EF4444]/20 border border-[#DC2626]">
                           Delete
                         </button>
                       </div>
                    </td>
                  </tr>
                ))}
                
                {filteredItems.length === 0 && (
                   <tr>
                     <td colSpan={9} className="text-center p-8 text-slate-500 font-bold">No inventory items found.</td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right Sidebar Widget */}
      <div className="w-full xl:w-[280px] flex flex-col space-y-6 shrink-0 mt-2 xl:mt-[60px]">
        {/* Gray background container based on the reference */}
        <div className="bg-[#94a3b8] dark:bg-[#1E293B] rounded-[32px] p-5 flex flex-col space-y-5 h-full min-h-[400px]">
          
          <div className="bg-white dark:bg-[#0F172A] rounded-2xl p-6 shadow-sm">
            <div className="mb-6">
               <h4 className="text-[13px] font-black text-slate-800 dark:text-[#F9FAFB] mb-1">Borrowed Items:</h4>
               <p className="text-4xl font-normal text-slate-800 dark:text-[#F9FAFB] leading-none tracking-tight">001</p>
            </div>
            <div>
               <h4 className="text-[13px] font-black text-slate-800 dark:text-[#F9FAFB] mb-1">Returned Items:</h4>
               <p className="text-2xl font-normal text-slate-800 dark:text-[#F9FAFB] leading-none tracking-tight">000</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0F172A] rounded-2xl p-6 shadow-sm flex-1">
             <h4 className="text-sm font-black text-slate-800 dark:text-[#F9FAFB] mb-6">Notifications</h4>
             <ul className="space-y-4">
                <li className="flex items-start">
                   <div className="w-1.5 h-1.5 rounded-full bg-[#EAB308] mt-[6px] mr-3 shrink-0"></div>
                   <div className="h-1 bg-slate-100 dark:bg-slate-700 rounded w-full mt-2"></div>
                </li>
                <li className="flex items-start">
                   <div className="w-1.5 h-1.5 rounded-full bg-[#EF4444] mt-[6px] mr-3 shrink-0"></div>
                   <div className="h-1 bg-slate-100 dark:bg-slate-700 rounded w-full mt-2"></div>
                </li>
             </ul>
          </div>
          
          <div className="flex justify-center mt-2 px-2 pb-4">
            <button className="bg-[#0284c7] hover:bg-[#0369a1] text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md transition-colors w-full">
               Returning Items
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
