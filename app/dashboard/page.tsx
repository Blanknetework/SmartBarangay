"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Users, FileText, CheckCircle, HeartPulse, Package, ArrowUpRight, ArrowDownRight } from "lucide-react";

const revenueData = [
  { name: "Jan", thisMonth: 4000, lastMonth: 2400 },
  { name: "Feb", thisMonth: 3000, lastMonth: 1398 },
  { name: "Mar", thisMonth: 10000, lastMonth: 9800 },
  { name: "Apr", thisMonth: 8000, lastMonth: 3908 },
  { name: "May", thisMonth: 15000, lastMonth: 4800 },
  { name: "Jun", thisMonth: 11000, lastMonth: 3800 },
  { name: "Jul", thisMonth: 12000, lastMonth: 4300 },
];

const serviceData = [
  { name: "Certificate", value: 15000, fill: "#3B82F6" },
  { name: "Clearance", value: 25000, fill: "#8B5CF6" },
  { name: "Permit", value: 18000, fill: "#10B981" },
  { name: "Health", value: 31000, fill: "#EF4444" },
  { name: "Residency", value: 12000, fill: "#F59E0B" },
  { name: "Inventory", value: 22000, fill: "#22C55E" },
];

const distributionData = [
  { name: "Clearances", value: 35.6, color: "#10B981" },
  { name: "Permits", value: 25.5, color: "#3B82F6" },
  { name: "Certifications", value: 30.8, color: "#EC4899" },
  { name: "Others", value: 8.1, color: "#9CA3AF" },
];

export default function DashboardClient() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && theme === "dark";

  return (
    <div className="flex flex-col space-y-6 lg:space-y-8 animate-in fade-in duration-500">
      
      {/* Header Area */}
      <div className="flex justify-between items-center bg-white dark:bg-[#1F2937] p-6 rounded-2xl shadow-sm dark:shadow-none border border-slate-100 dark:border-[#374151] transition-colors">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-[#F9FAFB] tracking-tight">Dashboard Overview</h1>
        </div>
        <div className="flex items-center">
           <button className="px-5 py-2.5 bg-[#3B82F6] text-white rounded-xl text-sm font-bold shadow-md shadow-[#3B82F6]/30 dark:shadow-none hover:bg-[#2563eb] transition-colors">
             Generate Report
           </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {[
          { title: "Total Residents", count: "12,400", change: "+4.1%", isUp: true, icon: Users, color: "text-[#3B82F6]", bg: "bg-blue-50 dark:bg-blue-900/20" },
          { title: "Pending Request", count: "142", change: "-2.5%", isUp: false, icon: FileText, color: "text-[#8B5CF6]", bg: "bg-purple-50 dark:bg-purple-900/20" },
          { title: "Today's Transactions", count: "89", change: "+12%", isUp: true, icon: CheckCircle, color: "text-[#22C55E]", bg: "bg-green-50 dark:bg-green-900/20" },
          { title: "Active Patients", count: "45", change: "-1.2%", isUp: false, icon: HeartPulse, color: "text-[#EF4444]", bg: "bg-red-50 dark:bg-red-900/20" },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-[#1F2937] rounded-2xl border border-slate-100 dark:border-[#374151] p-6 shadow-sm hover:shadow-md dark:shadow-none dark:hover:border-slate-500 transition-all">
            <div className="flex justify-between items-start mb-4">
               <div>
                  <h3 className="text-xs font-bold text-slate-400 dark:text-[#9CA3AF] uppercase tracking-wider mb-2">{stat.title}</h3>
                  <div className="flex items-baseline space-x-2">
                     <h2 className="text-3xl font-black text-slate-800 dark:text-[#F9FAFB] tracking-tight">{stat.count}</h2>
                     <span className={`flex items-center text-xs font-bold ${stat.isUp ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                       {stat.isUp ? <ArrowUpRight size={12} className="mr-0.5" /> : <ArrowDownRight size={12} className="mr-0.5" />}
                       {stat.change}
                     </span>
                  </div>
               </div>
               <div className={`p-3 rounded-xl shadow-sm dark:shadow-none ${stat.bg}`}>
                <stat.icon size={22} className={stat.color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area (Left: 2 columns wide) */}
        <div className="lg:col-span-2 flex flex-col space-y-6">
          
          {/* Revenue Chart Section */}
          <div className="bg-white dark:bg-[#1F2937] rounded-2xl shadow-sm dark:shadow-none border border-slate-100 dark:border-[#374151] p-6 transition-colors">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-slate-800 dark:text-[#F9FAFB]">Monthly Revenue</h3>
              </div>
              <div className="flex items-center space-x-4 text-xs font-bold text-slate-500 dark:text-[#9CA3AF] bg-slate-50 dark:bg-[#111827] px-3 py-1.5 rounded-lg border border-slate-100 dark:border-[#374151]">
                  <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6] mr-2"></span> This month</div>
                  <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-[#CBD5E1] dark:bg-[#374151] mr-2"></span> Last month</div>
              </div>
            </div>
            <div className="h-72 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#374151" : "#f0f0f0"} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: isDark ? '#9CA3AF' : '#a0a0a0', fontSize: 12, fontWeight: 600 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: isDark ? '#9CA3AF' : '#a0a0a0', fontSize: 12, fontWeight: 600 }} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      backgroundColor: isDark ? '#111827' : '#fff',
                      color: isDark ? '#F9FAFB' : '#1e293b',
                      border: isDark ? '1px solid #374151' : '1px solid #f0f0f0', 
                      boxShadow: isDark ? 'none' : '0 4px 6px -1px rgb(0 0 0 / 0.1)', 
                      fontWeight: 600 
                    }}
                    cursor={{ stroke: isDark ? '#374151' : '#f5f5f5', strokeWidth: 2 }} 
                  />
                  <Line type="monotone" dataKey="thisMonth" stroke="#3B82F6" strokeWidth={4} dot={false} activeDot={{ r: 6, strokeWidth: 3, stroke: isDark ? '#1F2937' : '#fff' }} />
                  <Line type="monotone" dataKey="lastMonth" stroke={isDark ? "#4B5563" : "#d0d0d0"} strokeWidth={2} strokeDasharray="5 5" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Most Requested Services */}
            <div className="bg-white dark:bg-[#1F2937] rounded-2xl shadow-sm dark:shadow-none border border-slate-100 dark:border-[#374151] p-6 transition-colors">
              <h3 className="font-bold text-slate-800 dark:text-[#F9FAFB] mb-6">Service Volume</h3>
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={serviceData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: isDark ? '#9CA3AF' : '#a0a0a0', fontSize: 11, fontWeight: 600 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: isDark ? '#9CA3AF' : '#a0a0a0', fontSize: 11, fontWeight: 600 }} tickFormatter={(val) => `${val/1000}k`} />
                    <Tooltip 
                      cursor={{ fill: isDark ? '#374151' : '#f9f9f9' }} 
                      contentStyle={{ 
                        borderRadius: '12px', 
                        backgroundColor: isDark ? '#111827' : '#fff',
                        color: isDark ? '#F9FAFB' : '#1e293b',
                        border: isDark ? '1px solid #374151' : '1px solid #f0f0f0', 
                        fontWeight: 600 
                      }} 
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {serviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Revenue Distribution */}
            <div className="bg-white dark:bg-[#1F2937] rounded-2xl shadow-sm dark:shadow-none border border-slate-100 dark:border-[#374151] p-6 flex flex-col justify-between transition-colors">
              <h3 className="font-bold text-slate-800 dark:text-[#F9FAFB] mb-2">Revenue Distribution</h3>
              <div className="flex-1 flex items-center justify-between">
                <div className="w-1/2 h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={distributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={65}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                        cornerRadius={4}
                      >
                        {distributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ 
                        borderRadius: '12px', 
                        backgroundColor: isDark ? '#111827' : '#fff',
                        color: isDark ? '#F9FAFB' : '#1e293b',
                        border: isDark ? '1px solid #374151' : '1px solid #f0f0f0', 
                        fontWeight: 600 
                      }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-1/2 flex flex-col space-y-3">
                  {distributionData.map((d, i) => (
                    <div key={i} className="flex justify-between items-center text-xs">
                      <div className="flex items-center">
                        <span className="w-3 h-3 rounded-md shadow-sm mr-2.5" style={{ backgroundColor: d.color }}></span>
                        <span className="text-slate-500 dark:text-[#9CA3AF] font-semibold">{d.name}</span>
                      </div>
                      <span className="font-bold text-slate-800 dark:text-[#F9FAFB]">{d.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar Area (Notifications & Activities) */}
        <div className="flex flex-col space-y-6">
           {/* Service Status Overview */}
           <div className="bg-white dark:bg-[#1F2937] rounded-2xl shadow-sm dark:shadow-none border border-slate-100 dark:border-[#374151] p-6 flex flex-col transition-colors">
              <h3 className="font-bold text-slate-800 dark:text-[#F9FAFB] mb-6">Service Health</h3>
              <div className="space-y-5">
                {[
                  { label: "Clearances", val: 80, color: "bg-[#3B82F6]" },
                  { label: "Certificates", val: 65, color: "bg-[#22C55E]" },
                  { label: "Consultations", val: 90, color: "bg-[#F59E0B]" },
                  { label: "Payment", val: 30, color: "bg-[#EF4444]" },
                ].map((s, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-[#9CA3AF] mb-2">
                      <span>{s.label}</span>
                      <span className="text-slate-400 dark:text-[#6B7280]">{s.val}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-[#374151] rounded-full h-2.5 overflow-hidden shadow-inner dark:shadow-none">
                      <div className={`${s.color} h-full rounded-full shadow-sm dark:shadow-none`} style={{ width: `${s.val}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          <div className="bg-white dark:bg-[#1F2937] rounded-2xl shadow-sm dark:shadow-none border border-slate-100 dark:border-[#374151] flex-1 p-6 flex flex-col overflow-hidden transition-colors">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-800 dark:text-[#F9FAFB]">Recent Activity</h3>
              <button className="text-xs font-bold text-[#3B82F6] hover:text-[#2563eb]">View all</button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-6 pr-2">
              <div className="flex items-start">
                <div className="w-9 h-9 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-[#8B5CF6] mr-3 shrink-0 shadow-sm dark:shadow-none">
                  <Package size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-[#F9FAFB]">Inventory modified</h4>
                  <p className="text-xs font-medium text-slate-500 dark:text-[#9CA3AF] mt-0.5">Medical supplies restocked by Dr. Jane</p>
                  <p className="text-[10px] text-slate-400 dark:text-[#6B7280] mt-1 uppercase font-bold">10 min ago</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-900/20 text-[#3B82F6] flex items-center justify-center mr-3 shrink-0 shadow-sm dark:shadow-none">
                  <FileText size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-[#F9FAFB]">Clearance Request</h4>
                  <p className="text-xs font-medium text-slate-500 dark:text-[#9CA3AF] mt-0.5">Juan Dela Cruz submitted a request</p>
                  <p className="text-[10px] text-slate-400 dark:text-[#6B7280] mt-1 uppercase font-bold">1 hour ago</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-9 h-9 rounded-full bg-green-50 dark:bg-green-900/20 text-[#22C55E] flex items-center justify-center mr-3 shrink-0 shadow-sm dark:shadow-none">
                  <span className="text-xs font-black">JD</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-[#F9FAFB]">Resident profile created</h4>
                  <p className="text-xs font-medium text-slate-500 dark:text-[#9CA3AF] mt-0.5">New entry for block 4 lot 12</p>
                  <p className="text-[10px] text-slate-400 dark:text-[#6B7280] mt-1 uppercase font-bold">Yesterday</p>
                </div>
              </div>
              
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
