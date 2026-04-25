"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Link from "next/link";
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
import { Users, FileText, CheckCircle, Package, ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
type ServicePerformanceMetric = {
  label: string;
  totalRequests: number;
  approvedRequests: number;
  rate: number;
};

function ServicePerformanceRow({ metric }: { metric: ServicePerformanceMetric }) {
  const { label, totalRequests, approvedRequests, rate } = metric;

  const getColorClass = () => {
    if (totalRequests === 0) return "bg-slate-400";
    if (rate <= 39) return "bg-[#EF4444]";
    if (rate <= 79) return "bg-[#EAB308]";
    return "bg-[#10B981]";
  };

  const statusText =
    totalRequests === 0
      ? "No Data Available"
      : rate === 0
        ? `No Requests Yet (0 / ${totalRequests} requests)`
        : `${rate}% (${approvedRequests} / ${totalRequests} requests)`;

  return (
    <div>
      <div className="flex justify-between text-xs font-bold text-slate-500 dark:text-[#9CA3AF] mb-2">
        <span>{label}</span>
        <span className="text-slate-400 dark:text-[#6B7280]">{statusText}</span>
      </div>
      <div className="w-full bg-slate-100 dark:bg-[#374151] rounded-full h-2.5 overflow-hidden shadow-inner dark:shadow-none">
        <div className={`${getColorClass()} h-full rounded-full shadow-sm dark:shadow-none`} style={{ width: `${Math.max(0, Math.min(100, rate))}%` }}></div>
      </div>
    </div>
  );
}

export default function DashboardClient() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [counts, setCounts] = useState({
    residents: 0,
    documents: 0,
    inventory: 0,
    pendingDocs: 0,
    healthConsultations: 0,
    paymentRecords: 0,
    patients: 0,
  });
  const [activities, setActivities] = useState<any[]>([]);
  const [docs, setDocs] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [revenueRows, setRevenueRows] = useState<any[]>([]);
  const [borrowRecords, setBorrowRecords] = useState<any[]>([]);
  const [todayTick, setTodayTick] = useState(Date.now());

  useEffect(() => {
    setMounted(true);
    
    const usR = onSnapshot(collection(db, "residents"), s => {
      let pCount = 0;
      s.forEach(doc => {
        if (doc.data().hasMedicalRecord) pCount++;
      });
      setCounts(c => ({...c, residents: s.size, patients: pCount}));
    });
    const usD = onSnapshot(collection(db, "documents"), s => {
       let pending = 0;
       const docsArr = s.docs.map(doc => {
          const status = String(doc.data().status || "").trim().toLowerCase();
          const isOpenRequest = status !== "approved" && status !== "released" && status !== "completed";
          if (isOpenRequest) pending++;
          return doc.data();
       });
       setDocs(docsArr);
       setCounts(c => ({...c, documents: s.size, pendingDocs: pending}));
    });
    const usI = onSnapshot(collection(db, "inventory"), s => {
      const inv = s.docs.map((d) => d.data());
      setInventoryItems(inv);
      setCounts(c => ({...c, inventory: s.size}));
    });
    const usC = onSnapshot(collection(db, "consultations"), s => {
      const rows = s.docs.map((d) => d.data());
      setConsultations(rows);
      setCounts(c => ({ ...c, healthConsultations: s.size }));
    });
    const usP = onSnapshot(collection(db, "revenue"), s => {
      const rows = s.docs.map((d) => d.data());
      setRevenueRows(rows);
      setCounts(c => ({ ...c, paymentRecords: s.size }));
    });
    const usB = onSnapshot(collection(db, "borrow_records"), s => {
      setBorrowRecords(s.docs.map((d) => d.data()));
    });
    
    const usA = onSnapshot(query(collection(db, "activities"), orderBy("createdAt", "desc"), limit(10)), s => {
      setActivities(s.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => { usR(); usD(); usI(); usC(); usP(); usB(); usA(); };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTodayTick(Date.now()), 60 * 1000);
    return () => clearInterval(timer);
  }, []);
  const toPercent = (num: number, den: number) => {
    if (!den) return 0;
    const pct = Math.round((num / den) * 100);
    return Math.max(0, Math.min(100, pct));
  };

  const getRowDate = (row: any): Date | null => {
    if (row?.createdAt?.toDate) return row.createdAt.toDate();
    if (row?.createdAt?.seconds) return new Date(row.createdAt.seconds * 1000);
    if (row?.dateStr) {
      const d = new Date(row.dateStr);
      return isNaN(d.getTime()) ? null : d;
    }
    return null;
  };


  const isDark = mounted && theme === "dark";
  const formatPeso = (value: number) =>
    `P${new Intl.NumberFormat("en-PH", { maximumFractionDigits: 0 }).format(value || 0)}`;

  // Derived Dynamic Chart Data
  let totalRev = 0;
  const svcGroups = { Clearance: 0, Permit: 0, Residency: 0, Indigency: 0, Others: 0 };
  const revGroups = { Clearance: 0, Permit: 0, Residency: 0, Indigency: 0, Others: 0 };
  let clearanceTotal=0, clearanceApp=0, permitTotal=0, permitApp=0;
  let residencyTotal=0, residencyApp=0, indigencyTotal=0, indigencyApp=0;
  let paidEligible=0, paidDone=0;

  docs.forEach(d => {
    const f = parseFloat((d.fee || "0").replace(/[^0-9.]/g, "")) || 0;
    totalRev += f;
    const t = d.type || "";
    
    if (t.includes('Clearance') && !t.includes('Residency') && !t.includes('Indigency')) { 
      svcGroups.Clearance++; revGroups.Clearance += f; 
      clearanceTotal++; if(d.status==='Approved' || d.status==='Released') clearanceApp++;
    } else if (t.includes('Permit') || t.includes('Business')) { 
      svcGroups.Permit++; revGroups.Permit += f; 
      permitTotal++; if(d.status==='Approved' || d.status==='Released') permitApp++;
    } else if (t.includes('Residency')) {
      svcGroups.Residency++; revGroups.Residency += f;
      residencyTotal++; if(d.status==='Approved' || d.status==='Released') residencyApp++;
    } else if (t.includes('Indigency')) { 
      svcGroups.Indigency++; revGroups.Indigency += f; 
      indigencyTotal++; if(d.status==='Approved' || d.status==='Released') indigencyApp++;
    } else { 
      svcGroups.Others++; revGroups.Others += f; 
    }
    if (f > 0) {
      paidEligible++;
      if (d.isPaid) paidDone++;
    }
  });

  const dynamicServiceData = [
    { name: "Indigency", value: svcGroups.Indigency, fill: "#93C5FD" },
    { name: "Clearance", value: svcGroups.Clearance, fill: "#C4B5FD" },
    { name: "Permit", value: svcGroups.Permit, fill: "#34D399" },
    { name: "Residency", value: svcGroups.Residency, fill: "#FCA5A5" },
    { name: "Others", value: svcGroups.Others, fill: "#FCD34D" },
  ];

  const dynamicDistributionData = [
    { name: "Clearances", value: totalRev > 0 ? Number(((revGroups.Clearance/totalRev)*100).toFixed(1)) : 0, color: "#8B5CF6" },
    { name: "Permits", value: totalRev > 0 ? Number(((revGroups.Permit/totalRev)*100).toFixed(1)) : 0, color: "#10B981" },
    { name: "Residency", value: totalRev > 0 ? Number(((revGroups.Residency/totalRev)*100).toFixed(1)) : 0, color: "#3B82F6" },
    { name: "Indigency", value: totalRev > 0 ? Number(((revGroups.Indigency/totalRev)*100).toFixed(1)) : 0, color: "#F59E0B" },
    { name: "Others", value: totalRev > 0 ? Number(((revGroups.Others/totalRev)*100).toFixed(1)) : 0, color: "#EC4899" },
  ].filter(d => d.value > 0);

  if (dynamicDistributionData.length === 0) {
      dynamicDistributionData.push({ name: "No Data", value: 100, color: "#4B5563" });
  }

  const countApproved = (rows: any[]) =>
    rows.filter((r) => {
      const status = String(r?.status || "").trim().toLowerCase();
      return status === "approved" || status === "released" || status === "completed" || status === "done" || status === "paid" || status === "renewed";
    }).length;

  const residencyRows = docs.filter((d) => String(d?.type || "").toLowerCase().includes("residency"));
  const indigencyRows = docs.filter((d) => String(d?.type || "").toLowerCase().includes("indigency"));
  const clearanceRows = docs.filter((d) => {
    const t = String(d?.type || "").toLowerCase();
    return t.includes("clearance") && !t.includes("residency") && !t.includes("indigency");
  });
  const permitRows = docs.filter((d) => {
    const t = String(d?.type || "").toLowerCase();
    return t.includes("permit") || t.includes("business");
  });
  const consultationApproved = consultations.filter((c) => {
    const status = String(c?.status || "").trim().toLowerCase();
    return status === "completed" || status === "done" || status === "approved";
  }).length;
  const inventoryRequestApproved = borrowRecords.filter((b) => {
    const status = String(b?.status || "").trim().toLowerCase();
    return status === "approved" || status === "released" || status === "completed" || status === "returned";
  }).length;

  const dynamicServiceHealth: ServicePerformanceMetric[] = [
     {
       label: "Residency",
       totalRequests: residencyRows.length,
       approvedRequests: countApproved(residencyRows),
       rate: toPercent(countApproved(residencyRows), residencyRows.length),
     },
     {
       label: "Indigency",
       totalRequests: indigencyRows.length,
       approvedRequests: countApproved(indigencyRows),
       rate: toPercent(countApproved(indigencyRows), indigencyRows.length),
     },
     {
       label: "Health Consultation",
       totalRequests: consultations.length,
       approvedRequests: consultationApproved,
       rate: toPercent(consultationApproved, consultations.length),
     },
     {
       label: "Payment Processing",
       totalRequests: paidEligible,
       approvedRequests: paidDone,
       rate: toPercent(paidDone, paidEligible),
     },
     {
       label: "Inventory",
       totalRequests: borrowRecords.length,
       approvedRequests: inventoryRequestApproved,
       rate: toPercent(inventoryRequestApproved, borrowRecords.length),
     },
     {
       label: "Clearances",
       totalRequests: clearanceRows.length,
       approvedRequests: countApproved(clearanceRows),
       rate: toPercent(countApproved(clearanceRows), clearanceRows.length),
     },
     {
       label: "Permits",
       totalRequests: permitRows.length,
       approvedRequests: countApproved(permitRows),
       rate: toPercent(countApproved(permitRows), permitRows.length),
     },
  ];

  const todayTransactions = revenueRows.filter((r) => {
    const d = getRowDate(r);
    if (!d) return false;
    const now = new Date(todayTick);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
  }).length;

  const monthTotals = new Map<string, number>();
  docs.forEach((d) => {
    const fee = parseFloat((d.fee || "0").replace(/[^0-9.]/g, "")) || 0;
    let parsedDate: Date | null = null;
    if (d.createdAt?.toDate) {
      parsedDate = d.createdAt.toDate();
    } else if (d.createdAt?.seconds) {
      parsedDate = new Date(d.createdAt.seconds * 1000);
    } else if (d.dateStr) {
      const dateFromString = new Date(d.dateStr);
      if (!isNaN(dateFromString.getTime())) parsedDate = dateFromString;
    }
    if (!parsedDate) return;
    const key = `${parsedDate.getFullYear()}-${parsedDate.getMonth()}`;
    monthTotals.set(key, (monthTotals.get(key) || 0) + fee);
  });

  const dynamicRevenueData = Array.from({ length: 7 }).map((_, idx) => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - (6 - idx));
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const thisMonth = monthTotals.get(key) || 0;
    const prevMonthDate = new Date(date.getFullYear(), date.getMonth() - 1, 1);
    const prevKey = `${prevMonthDate.getFullYear()}-${prevMonthDate.getMonth()}`;
    const lastMonth = monthTotals.get(prevKey) || 0;
    return {
      name: MONTH_NAMES[date.getMonth()],
      thisMonth,
      lastMonth,
    };
  });

  return (
    <div className="flex flex-col space-y-6 lg:space-y-8 animate-in fade-in duration-500">
      
      {/* Header Area */}
      <div className="flex justify-between items-center bg-white dark:bg-[#1F2937] p-6 rounded-2xl shadow-sm dark:shadow-none border border-slate-100 dark:border-[#374151] transition-colors">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-[#F9FAFB] tracking-tight">Dashboard Overview</h1>
        </div>
        <div className="flex items-center">
           <Link href="/dashboard/officials" className="px-5 py-2.5 bg-[#3B82F6] text-white rounded-xl text-sm font-bold shadow-md shadow-[#3B82F6]/30 dark:shadow-none hover:bg-[#2563eb] transition-colors">
             Barangay List
           </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {[
          { title: "Total Residents", count: counts.residents || "0", change: "Live", isUp: true, icon: Users, color: "text-[#3B82F6]", bg: "bg-blue-50 dark:bg-blue-900/20" },
          { title: "Pending Request", count: counts.documents || "0", change: "Live", isUp: true, icon: FileText, color: "text-[#8B5CF6]", bg: "bg-purple-50 dark:bg-purple-900/20" },
          { title: "Today's Transactions", count: todayTransactions || "0", change: "Live", isUp: true, icon: Package, color: "text-[#22C55E]", bg: "bg-green-50 dark:bg-green-900/20" },
          { title: "Patients", count: counts.patients || "0", change: "Live", isUp: true, icon: CheckCircle, color: "text-[#F59E0B]", bg: "bg-yellow-50 dark:bg-yellow-900/20" },
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
                  <LineChart data={dynamicRevenueData} margin={{ top: 8, right: 12, left: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#374151" : "#f1f1f1"} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: isDark ? '#9CA3AF' : '#a0a0a0', fontSize: 12, fontWeight: 600 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} width={48} tickFormatter={(val) => formatPeso(Number(val))} tick={{ fill: isDark ? '#9CA3AF' : '#a0a0a0', fontSize: 12, fontWeight: 600 }} />
                  <Tooltip 
                    formatter={(value: any, name: any) => [formatPeso(Number(value)), name === "thisMonth" ? "This month" : "Last month"]}
                    labelFormatter={(label) => `${label}`}
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
              <h3 className="font-bold text-slate-800 dark:text-[#F9FAFB] mb-6">Most Requested Services</h3>
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height={208}>
                  <BarChart data={dynamicServiceData} margin={{ top: 10, right: 8, left: 8, bottom: 0 }} barGap={12}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#374151" : "#E5E7EB"} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: isDark ? '#9CA3AF' : '#6B7280', fontSize: 11, fontWeight: 600 }} dy={8} />
                    <YAxis axisLine={false} tickLine={false} width={34} tick={{ fill: isDark ? '#9CA3AF' : '#6B7280', fontSize: 11, fontWeight: 600 }} />
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
                    <Bar dataKey="value" radius={[10, 10, 10, 10]} maxBarSize={30}>
                      {dynamicServiceData.map((entry, index) => (
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
                  <ResponsiveContainer width="100%" height={176}>
                    <PieChart>
                      <Pie
                        data={dynamicDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={65}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                        cornerRadius={4}
                      >
                        {dynamicDistributionData.map((entry, index) => (
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
                  {dynamicDistributionData.map((d, i) => (
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
              <h3 className="font-bold text-slate-800 dark:text-[#F9FAFB] mb-1">Service Performance Overview</h3>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-[#9CA3AF] mb-6" title="Represents percentage of completed service requests">
                Represents percentage of completed service requests
              </p>
              <div className="space-y-5">
                {dynamicServiceHealth.map((metric, i) => (
                  <ServicePerformanceRow key={i} metric={metric} />
                ))}
              </div>
            </div>

          <div className="bg-white dark:bg-[#1F2937] rounded-2xl shadow-sm dark:shadow-none border border-slate-100 dark:border-[#374151] flex-1 p-6 flex flex-col overflow-hidden transition-colors">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-800 dark:text-[#F9FAFB]">Recent Activity</h3>
              <button className="text-xs font-bold text-[#3B82F6] hover:text-[#2563eb]">View all</button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-6 pr-2">
              {activities.length === 0 ? (
                 <p className="text-sm font-bold text-slate-400 text-center mt-10">No recent activity</p>
              ) : activities.map((act) => (
                <div key={act.id} className="flex items-start">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center mr-3 shrink-0 shadow-sm dark:shadow-none ${
                     act.type === 'inventory' ? 'bg-purple-50 dark:bg-purple-900/20 text-[#8B5CF6]' : 
                     act.type === 'document' ? 'bg-blue-50 dark:bg-blue-900/20 text-[#3B82F6]' : 
                     'bg-green-50 dark:bg-green-900/20 text-[#22C55E]'
                  }`}>
                    {act.type === 'inventory' ? <Package size={16} /> : act.type === 'document' ? <FileText size={16} /> : <Activity size={16} />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-[#F9FAFB]">{act.title}</h4>
                    <p className="text-xs font-medium text-slate-500 dark:text-[#9CA3AF] mt-0.5">{act.description}</p>
                    <p className="text-[10px] text-slate-400 dark:text-[#6B7280] mt-1 uppercase font-bold">
                       {act.createdAt ? new Date(act.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
