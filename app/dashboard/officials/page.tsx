"use client";

import { useState } from "react";
import { Search, Eye, Filter, User, X, Plus } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/components/auth-provider";

const officialsData = [
  {
    id: 1,
    name: "Villanueva, Hazel",
    role: "Captain",
    color: "bg-[#f5c6cb]",
    status: "Active",
    age: 30,
    gender: "Female",
    civilStatus: "Single",
    birthDate: "03/13/2010",
    contact: "0959674",
  },
  {
    id: 2,
    name: "Bautista, Mark",
    role: "Kagawad",
    color: "bg-[#d0cbf0]",
    status: "Inactive",
    age: 45,
    gender: "Male",
    civilStatus: "Married",
    birthDate: "05/20/1979",
    contact: "0987654",
  },
  {
    id: 3,
    name: "Andres, Nicole",
    role: "Kagawad",
    color: "bg-[#faeea2]",
    status: "Active",
    age: 35,
    gender: "Female",
    civilStatus: "Married",
    birthDate: "11/05/1989",
    contact: "0912345",
  },
  {
    id: 4,
    name: "Ramirez, Mike",
    role: "SK Chairman",
    color: "bg-[#f5c6cb]",
    status: "Active",
    age: 22,
    gender: "Male",
    civilStatus: "Single",
    birthDate: "08/15/2002",
    contact: "0945678",
  },
];

export default function OfficialsPage() {
  const [selectedOfficial, setSelectedOfficial] = useState<typeof officialsData[0] | null>(null);
  const { role } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [filterRole, setFilterRole] = useState("All");

  const filteredOfficials = officialsData.filter(off => {
     const matchesSearch = off.name.toLowerCase().includes(searchTerm.toLowerCase());
     const matchesFilter = filterRole === "All" || off.role === filterRole;
     return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex flex-col space-y-6 lg:space-y-8 animate-in fade-in duration-500 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-[#F9FAFB] tracking-tight">List of Barangay Official</h1>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="flex bg-white dark:bg-[#1F2937] items-center px-4 py-2.5 rounded-lg shadow-sm border border-slate-200 dark:border-[#374151] max-w-[320px] w-full transition-colors">
            <Search size={16} className="text-gray-400 dark:text-[#9CA3AF] mr-2 shrink-0" />
            <input
               type="text"
               placeholder="Search Official.."
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
               className="bg-transparent border-none outline-none w-full text-[13px] font-medium text-gray-700 dark:text-[#F9FAFB] placeholder:text-gray-400 dark:placeholder:text-[#9CA3AF] flex-1"
            />
            <div className="relative shrink-0 ml-2 border-l border-slate-200 dark:border-[#374151] pl-3">
              <button onClick={() => setShowFilterMenu(!showFilterMenu)} className={`text-gray-600 dark:text-[#9CA3AF] hover:text-[#2369C4] transition-colors ${showFilterMenu || filterRole !== 'All' ? 'text-blue-600' : ''}`}>
                 <Filter size={16} />
              </button>
              {showFilterMenu && (
                 <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-10 overflow-hidden py-1">
                    <div className="px-3 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700 mb-1">
                       Filter by Role
                    </div>
                    {["All", "Captain", "Kagawad", "SK Chairman"].map(r => (
                       <button 
                         key={r}
                         onClick={() => { setFilterRole(r); setShowFilterMenu(false); }}
                         className={`w-full text-left px-4 py-2 text-sm font-semibold transition-colors ${filterRole === r ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                       >
                         {r}
                       </button>
                    ))}
                 </div>
              )}
            </div>
          </div>
          
          {role === 'admin' && (
            <button className="flex items-center justify-center bg-[#3B82F6] hover:bg-[#2563EB] text-white px-4 py-2.5 rounded-lg text-sm font-bold shadow-md shadow-[#3B82F6]/20 transition-colors shrink-0 whitespace-nowrap w-full sm:w-auto">
              <Plus size={16} className="mr-2" strokeWidth={3} /> Add Official
            </button>
          )}
        </div>
      </div>

      {/* Grid by Role */}
      <div className="flex flex-col space-y-10">
        {["Captain", "Kagawad", "SK Chairman"].map(roleGroup => {
          const officialsInGroup = filteredOfficials.filter(o => o.role === roleGroup);
          if (officialsInGroup.length === 0) return null;
          
          return (
            <div key={roleGroup} className="flex flex-col space-y-4">
              <h2 className="text-xl font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">{roleGroup}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {officialsInGroup.map((official) => (
                  <div key={official.id} className="bg-white dark:bg-[#1F2937] rounded-xl shadow-sm dark:shadow-none border border-slate-200 dark:border-[#374151] flex flex-col pt-0 pb-0 w-full max-w-[260px] mx-auto overflow-hidden transition-colors">
                    {/* Top Color Part */}
                    <div className={`w-full ${official.color} py-5 pb-16 flex flex-col items-center text-center`}>
                      <h3 className="font-medium text-gray-900 text-sm whitespace-nowrap tracking-wide">{official.name}</h3>
                      <p className="font-bold text-gray-900 text-[15px]">{official.role}</p>
                    </div>
                    
                    {/* Avatar overlapping */}
                    <div className="-mt-14 flex justify-center z-10 w-full mb-3">
                      <div className="w-[110px] h-[110px] bg-white dark:bg-[#1F2937] rounded-full border border-gray-400 dark:border-[#374151] flex items-center justify-center overflow-hidden shrink-0 transition-colors">
                         <img src={`https://randomuser.me/api/portraits/${official.gender === 'Male' ? 'men' : 'women'}/${official.id + 20}.jpg`} alt={official.name} className="w-[85%] h-[85%] object-cover rounded-full" />
                      </div>
                    </div>

                    {/* Bottom Info Part */}
                    <div className="flex justify-between items-center px-8 pb-5">
                      <div className="flex flex-col items-center space-y-1.5">
                        <span className="text-[13px] font-bold text-gray-900 dark:text-[#F9FAFB]">Status</span>
                        <div className={`w-[22px] h-[22px] rounded-full ${official.status === 'Active' ? 'bg-[#5ea595]' : 'bg-[#9f1515]'}`}></div>
                      </div>
                      
                      <div className="flex flex-col items-center space-y-1.5">
                        <span className="text-[13px] font-bold text-gray-900 dark:text-[#F9FAFB]">View</span>
                        <button 
                          onClick={() => setSelectedOfficial(official)}
                          className="text-[#0c80c0] dark:text-[#3B82F6] hover:text-[#0b6a9c] dark:hover:text-[#60A5FA] transition-colors bg-transparent border-0 outline-none cursor-pointer p-0"
                        >
                          <Eye size={24} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {filteredOfficials.length === 0 && (
          <div className="text-center py-10 text-slate-500 font-medium">No officials found.</div>
        )}
      </div>

      {/* Modal / Dialog */}
      {selectedOfficial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#111827] rounded-[10px] w-full max-w-[280px] shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 border-[1.5px] border-slate-200 dark:border-[#374151]">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-4 py-3 border-b flex-row w-full font-bold text-[15px] text-gray-900 dark:text-[#F9FAFB] border-slate-200 dark:border-[#374151]">
              {selectedOfficial.role}
              <button onClick={() => setSelectedOfficial(null)} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                <X size={18} />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="flex flex-col items-center px-5 py-5 bg-[#f4f7f9] dark:bg-[#111827] h-full rounded-b-[10px]">
              
              <div className="w-[100px] h-[100px] bg-white dark:bg-[#1F2937] rounded-full border-[1.5px] border-slate-300 dark:border-[#374151] flex items-center justify-center overflow-hidden mb-3 shrink-0 transition-colors">
                 <img src={`https://randomuser.me/api/portraits/${selectedOfficial.gender === 'Male' ? 'men' : 'women'}/${selectedOfficial.id + 20}.jpg`} alt={selectedOfficial.name} className="w-[85%] h-[85%] object-cover rounded-full" />
              </div>

              <h3 className="font-semibold text-gray-900 dark:text-[#F9FAFB] mb-6 text-sm">
                {selectedOfficial.name}
              </h3>

              <div className="w-full space-y-[14px]">
                <div className="flex justify-between border-b-[1.5px] border-slate-200 dark:border-[#374151] pb-1.5">
                  <span className="text-gray-700 dark:text-gray-300 text-[13px]">Age</span>
                  <span className="text-gray-900 dark:text-[#F9FAFB] text-[13px] font-medium">{selectedOfficial.age}</span>
                </div>
                <div className="flex justify-between border-b-[1.5px] border-slate-200 dark:border-[#374151] pb-1.5">
                  <span className="text-gray-700 dark:text-gray-300 text-[13px]">Gender</span>
                  <span className="text-gray-900 dark:text-[#F9FAFB] text-[13px] font-medium">{selectedOfficial.gender}</span>
                </div>
                <div className="flex justify-between border-b-[1.5px] border-slate-200 dark:border-[#374151] pb-1.5">
                  <span className="text-gray-700 dark:text-gray-300 text-[13px]">Civil Status</span>
                  <span className="text-gray-900 dark:text-[#F9FAFB] text-[13px] font-medium">{selectedOfficial.civilStatus}</span>
                </div>
                <div className="flex justify-between border-b-[1.5px] border-slate-200 dark:border-[#374151] pb-1.5">
                  <span className="text-gray-700 dark:text-gray-300 text-[13px]">Birth Date</span>
                  <span className="text-gray-900 dark:text-[#F9FAFB] text-[13px] font-medium">{selectedOfficial.birthDate}</span>
                </div>
                <div className="flex justify-between border-b-[1.5px] border-slate-200 dark:border-[#374151] pb-1.5">
                  <span className="text-gray-700 dark:text-gray-300 text-[13px]">Contact #</span>
                  <span className="text-gray-900 dark:text-[#F9FAFB] text-[13px] font-medium">{selectedOfficial.contact}</span>
                </div>
                <div className="flex justify-between pt-1 pb-2 items-center">
                  <span className="text-gray-700 dark:text-gray-300 text-[13px]">Status</span>
                  <div className="flex items-center space-x-2">
                    <div className={`w-[18px] h-[18px] rounded-full ${selectedOfficial.status === 'Active' ? 'bg-[#5ea595]' : 'bg-[#9f1515]'}`}></div>
                    <span className="text-gray-900 dark:text-[#F9FAFB] text-[13px] font-medium">{selectedOfficial.status}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
