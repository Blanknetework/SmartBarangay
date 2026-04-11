"use client";

import { useState, FormEvent } from "react";
import { Search, Plus, Check, FileText, CheckCircle2, Clock, CheckSquare, Settings2, SlidersHorizontal } from "lucide-react";

// Dummy Document Requests
const dummyRequests = [
  { id: "001", name: "Carlo Reyes", age: 90, address: "Zone 1", type: "Barangay clearance", purpose: "Employment", status: "Approved", fee: "P50.00", date: "June 15, 2026" },
  { id: "002", name: "Kevin Mendoza", age: 52, address: "Zone 2", type: "Certificate of Indigency", purpose: "Medical assistance", status: "Pending", fee: "Free", date: "June 10, 2026" },
];

export default function DocumentRequestPage() {
  const [requests] = useState(dummyRequests);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("All");

  const handleProcessAndPrint = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate network delay
    setTimeout(() => {
      setIsSubmitting(false);
      setIsModalOpen(false);
      setShowSuccessDialog(true);
    }, 800);
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 animate-in fade-in duration-500 w-full">
      {/* Main Left Content */}
      <div className="flex-1 flex flex-col space-y-6 min-w-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-[#F9FAFB] tracking-tight">Document Request</h1>
        </div>

        {/* Stats Row Container */}
        <div className="bg-white dark:bg-[#1F2937] border border-slate-200 dark:border-[#374151] rounded-2xl p-5 shadow-sm dark:shadow-none">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-5">
            {/* Stat Cards closely mapping the design */}
            <div className="bg-[#FEF9C3] dark:bg-[#ca8a04]/20 border border-[#FDE047] dark:border-[#ca8a04]/30 rounded-xl p-3 flex items-center shadow-sm">
              <div className="bg-[#FDE047] dark:bg-[#ca8a04]/40 p-2 rounded-full mr-3">
                 <Clock size={20} className="text-[#854D0E] dark:text-[#fef08a]" />
              </div>
              <div>
                 <p className="text-xl font-black text-[#854D0E] dark:text-[#fef08a] leading-none">300</p>
                 <p className="text-xs font-bold text-[#A16207] dark:text-[#fde047]/80">Pending</p>
              </div>
            </div>

            <div className="bg-[#DBEAFE] dark:bg-[#2563eb]/20 border border-[#BFDBFE] dark:border-[#2563eb]/30 rounded-xl p-3 flex items-center shadow-sm">
              <div className="bg-[#BFDBFE] dark:bg-[#2563eb]/40 p-2 rounded-full mr-3">
                 <CheckCircle2 size={20} className="text-[#1E40AF] dark:text-[#bfdbfe]" />
              </div>
              <div>
                 <p className="text-xl font-black text-[#1E40AF] dark:text-[#bfdbfe] leading-none">500</p>
                 <p className="text-xs font-bold text-[#1D4ED8] dark:text-[#93c5fd]/80">Approved</p>
              </div>
            </div>

            <div className="bg-[#D1FAE5] dark:bg-[#059669]/20 border border-[#A7F3D0] dark:border-[#059669]/30 rounded-xl p-3 flex items-center shadow-sm">
              <div className="bg-[#A7F3D0] dark:bg-[#059669]/40 p-2 rounded-full mr-3">
                 <FileText size={20} className="text-[#065F46] dark:text-[#a7f3d0]" />
              </div>
              <div>
                 <p className="text-xl font-black text-[#065F46] dark:text-[#a7f3d0] leading-none">100</p>
                 <p className="text-xs font-bold text-[#047857] dark:text-[#6ee7b7]/80">Released</p>
              </div>
            </div>

            <div className="bg-[#FFEDD5] dark:bg-[#ea580c]/20 border border-[#FED7AA] dark:border-[#ea580c]/30 rounded-xl p-3 flex items-center shadow-sm">
              <div className="bg-[#FED7AA] dark:bg-[#ea580c]/40 p-2 rounded-full mr-3">
                 <CheckSquare size={20} className="text-[#9A3412] dark:text-[#fed7aa]" />
              </div>
              <div>
                 <p className="text-xl font-black text-[#9A3412] dark:text-[#fed7aa] leading-none">570</p>
                 <p className="text-xs font-bold text-[#C2410C] dark:text-[#fdba74]/80">Total request</p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 flex items-center shadow-sm">
              <div className="bg-slate-200 dark:bg-slate-700 p-2 rounded-full mr-3">
                 <Search size={20} className="text-slate-700 dark:text-slate-300" />
              </div>
              <div>
                 <p className="text-xl font-black text-slate-700 dark:text-slate-300 leading-none">200</p>
                 <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Today Summary</p>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center bg-[#3B82F6] hover:bg-[#2563EB] text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md shadow-[#3B82F6]/20 dark:shadow-none transition-colors"
          >
            <Plus size={18} className="mr-2" strokeWidth={3} /> New Request
          </button>
        </div>

        {/* Table Area */}
        <div className="w-full bg-white dark:bg-[#1F2937] rounded-xl border border-slate-200 dark:border-[#374151] shadow-sm dark:shadow-none overflow-hidden transition-colors flex flex-col">
          
          <div className="flex flex-col sm:flex-row justify-between items-center p-2 border-b border-slate-200 dark:border-[#374151]">
            <div className="flex space-x-1 sm:space-x-4 px-4 overflow-x-auto w-full sm:w-auto">
              {["All", "Pending", "Approved", "Released"].map(tab => (
                <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab)}
                  className={`text-sm font-bold py-3 px-2 border-b-2 transition-colors ${activeTab === tab ? "border-[#3B82F6] text-[#3B82F6]" : "border-transparent text-slate-500 dark:text-[#9CA3AF] hover:text-slate-700 dark:hover:text-[#F9FAFB]"}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="p-2 w-full sm:w-auto flex items-center">
               <div className="flex bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#374151] rounded-lg items-center px-4 py-2 w-full sm:w-72">
                 <Search size={16} className="text-slate-400 mr-2 shrink-0" />
                 <input
                   type="text"
                   placeholder="Search Resident.."
                   className="bg-transparent border-none focus:outline-none text-sm w-full font-medium text-slate-700 dark:text-[#F9FAFB] placeholder:text-slate-400"
                 />
                 <SlidersHorizontal size={16} className="text-slate-400 ml-2 cursor-pointer" />
               </div>
            </div>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-200 dark:border-[#374151]">
                  <th className="px-5 py-4 text-left text-xs font-bold text-slate-500 dark:text-[#9CA3AF] w-16">ID</th>
                  <th className="px-5 py-4 text-left text-xs font-bold text-slate-500 dark:text-[#9CA3AF]">Name</th>
                  <th className="px-5 py-4 text-left text-xs font-bold text-slate-500 dark:text-[#9CA3AF] w-16">Age</th>
                  <th className="px-5 py-4 text-left text-xs font-bold text-slate-500 dark:text-[#9CA3AF]">Address</th>
                  <th className="px-5 py-4 text-left text-xs font-bold text-slate-500 dark:text-[#9CA3AF]">Document type</th>
                  <th className="px-5 py-4 text-left text-xs font-bold text-slate-500 dark:text-[#9CA3AF]">Purpose</th>
                  <th className="px-5 py-4 text-center text-xs font-bold text-slate-500 dark:text-[#9CA3AF]">Status</th>
                  <th className="px-5 py-4 text-center text-xs font-bold text-slate-500 dark:text-[#9CA3AF]">Fee</th>
                  <th className="px-5 py-4 text-left text-xs font-bold text-slate-500 dark:text-[#9CA3AF]">Date</th>
                  <th className="px-5 py-4 text-right text-xs font-bold text-slate-500 dark:text-[#9CA3AF] w-24">Actions</th>
                </tr>
              </thead>
              
              <tbody>
                {requests.map((req, idx) => (
                  <tr 
                    key={req.id} 
                    className={`group ${idx !== requests.length - 1 ? "border-b border-slate-100 dark:border-[#374151]" : ""} hover:bg-slate-50 dark:hover:bg-[#374151]/30 transition-colors`}
                  >
                    <td className="px-5 py-4 text-sm font-bold text-slate-800 dark:text-[#F9FAFB]">{req.id}</td>
                    <td className="px-5 py-4 text-sm font-bold text-slate-800 dark:text-[#F9FAFB]">{req.name}</td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-600 dark:text-[#9CA3AF]">{req.age}</td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-600 dark:text-[#9CA3AF]">{req.address}</td>
                    <td className="px-5 py-4 text-sm font-bold text-slate-700 dark:text-[#E5E7EB]">{req.type}</td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-600 dark:text-[#9CA3AF] max-w-[150px] truncate">{req.purpose}</td>
                    <td className="px-5 py-4 text-center">
                       {req.status === "Approved" ? (
                         <span className="bg-[#DBEAFE] dark:bg-[#1E40AF]/30 text-[#1D4ED8] dark:text-[#93C5FD] px-3 py-1 rounded-full text-xs font-bold">Approved</span>
                       ) : (
                         <span className="bg-[#FEF9C3] dark:bg-[#854D0E]/30 text-[#A16207] dark:text-[#FDE047] px-3 py-1 rounded-full text-xs font-bold">Pending</span>
                       )}
                    </td>
                    <td className="px-5 py-4 text-center">
                       <span className={`px-3 py-1 rounded-full text-xs font-bold ${req.fee === 'Free' ? 'bg-[#FFEDD5] text-[#C2410C] dark:bg-[#9A3412]/30 dark:text-[#FDBA74]' : 'bg-[#D1FAE5] text-[#047857] dark:bg-[#065F46]/30 dark:text-[#6EE7B7]'}`}>
                         {req.fee}
                       </span>
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-500 dark:text-[#9CA3AF]">{req.date}</td>
                    <td className="px-5 py-4 text-right space-y-2">
                      <div className="flex flex-col items-end space-y-1">
                        <button className="text-slate-600 dark:text-[#9CA3AF] hover:text-[#3B82F6] text-xs font-bold tracking-wide">EDIT</button>
                        {req.status === "Approved" ? (
                           <>
                           <button className="bg-[#FCA5A5] hover:bg-[#F87171] text-[#7F1D1D] px-3 py-0.5 rounded text-xs font-bold w-[70px]">Print</button>
                           <button className="bg-[#22C55E] hover:bg-[#16A34A] text-white px-3 py-0.5 rounded text-xs font-bold w-[70px]">Release</button>
                           </>
                        ) : (
                           <button className="bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 text-slate-800 dark:text-white px-3 py-0.5 rounded text-xs font-bold w-[70px]">Process</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right Sidebar Widgets */}
      <div className="w-full xl:w-[300px] flex flex-col space-y-6 shrink-0">
         {/* Fee Summary */}
         <div className="bg-white dark:bg-[#1F2937] border border-slate-200 dark:border-[#374151] rounded-2xl p-6 shadow-sm dark:shadow-none">
            <h3 className="text-sm font-bold text-slate-800 dark:text-[#F9FAFB] mb-4">Fee summary</h3>
            <div className="space-y-3">
               <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-[#9CA3AF]">
                 <span>Barangay clearance</span>
                 <span className="text-slate-800 dark:text-[#F9FAFB]">P50.00</span>
               </div>
               <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-[#9CA3AF]">
                 <span>Certificate of indigency</span>
                 <span className="text-slate-800 dark:text-[#F9FAFB]">Free</span>
               </div>
               <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-[#9CA3AF]">
                 <span>Business permit</span>
                 <span className="text-slate-800 dark:text-[#F9FAFB]">P20.00</span>
               </div>
            </div>
         </div>

         {/* Notifications */}
         <div className="bg-white dark:bg-[#1F2937] border border-slate-200 dark:border-[#374151] rounded-2xl p-6 shadow-sm dark:shadow-none">
            <h3 className="text-sm font-bold text-slate-800 dark:text-[#F9FAFB] mb-4">Notifications</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                 <div className="w-1.5 h-1.5 rounded-full bg-[#EAB308] mt-1.5 mr-2 shrink-0"></div>
                 <p className="text-xs font-semibold text-slate-600 dark:text-[#9CA3AF]">3 documents pending approval</p>
              </li>
              <li className="flex items-start">
                 <div className="w-1.5 h-1.5 rounded-full bg-[#EF4444] mt-1.5 mr-2 shrink-0"></div>
                 <p className="text-xs font-semibold text-slate-600 dark:text-[#9CA3AF]">2 released</p>
              </li>
            </ul>
         </div>

         {/* Service Status Overview */}
         <div className="bg-white dark:bg-[#1F2937] border border-slate-200 dark:border-[#374151] rounded-2xl p-6 shadow-sm dark:shadow-none">
            <h3 className="text-sm font-bold text-slate-800 dark:text-[#F9FAFB] mb-5">Service status overview</h3>
            
            <div className="space-y-4 mb-6">
               <div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                    <span>Barangay Clearance request</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 h-1 rounded-full overflow-hidden flex">
                    <div className="bg-[#22C55E] h-full" style={{ width: '80%' }}></div>
                    <div className="bg-[#EAB308] h-full" style={{ width: '15%' }}></div>
                    <div className="bg-[#EF4444] h-full" style={{ width: '5%' }}></div>
                  </div>
               </div>
               <div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                    <span>Certificate of indigency</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 h-1 rounded-full overflow-hidden flex">
                    <div className="bg-[#22C55E] h-full" style={{ width: '70%' }}></div>
                    <div className="bg-[#EAB308] h-full" style={{ width: '20%' }}></div>
                    <div className="bg-[#EF4444] h-full" style={{ width: '10%' }}></div>
                  </div>
               </div>
               <div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                    <span>Business permit</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 h-1 rounded-full overflow-hidden flex">
                    <div className="bg-[#22C55E] h-full" style={{ width: '60%' }}></div>
                    <div className="bg-[#EAB308] h-full" style={{ width: '30%' }}></div>
                    <div className="bg-[#EF4444] h-full" style={{ width: '10%' }}></div>
                  </div>
               </div>
            </div>

            <div className="flex items-center space-x-4 pt-4 border-t border-slate-100 dark:border-slate-700">
               <div className="flex items-center"><div className="w-1.5 h-1.5 rounded-full bg-[#22C55E] mr-1"></div><span className="text-[10px] font-bold text-slate-500">Released</span></div>
               <div className="flex items-center"><div className="w-1.5 h-1.5 rounded-full bg-[#EAB308] mr-1"></div><span className="text-[10px] font-bold text-slate-500">Approved</span></div>
               <div className="flex items-center"><div className="w-1.5 h-1.5 rounded-full bg-[#EF4444] mr-1"></div><span className="text-[10px] font-bold text-slate-500">Pending</span></div>
            </div>
         </div>
      </div>

      {/* New Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#111827] w-full max-w-[700px] rounded-[32px] shadow-2xl border border-slate-200 dark:border-[#374151] overflow-hidden flex flex-col scale-in-95 duration-200">
            
            <form onSubmit={handleProcessAndPrint} className="flex flex-col h-full p-8 md:p-10">
              <div className="flex justify-between items-start mb-8">
                 <h2 className="text-xl font-bold text-slate-800 dark:text-[#F9FAFB] tracking-tight mt-2">New Request form</h2>
                 {/* Internal Search */}
                 <div className="flex bg-slate-50 dark:bg-[#1F2937] border border-slate-200 dark:border-[#374151] rounded-xl items-center px-4 py-2.5 w-64">
                   <Search size={16} className="text-slate-400 mr-2 shrink-0" />
                   <input
                     type="text"
                     placeholder="Search Resident.."
                     className="bg-transparent border-none focus:outline-none text-xs w-full font-bold text-slate-700 dark:text-[#F9FAFB] placeholder:text-slate-400"
                   />
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-[#F9FAFB] mb-2 ml-1">Full name:</label>
                  <input required type="text" className="w-full bg-white dark:bg-[#1F2937] border-2 border-slate-200 dark:border-[#374151] rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6]" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-[#F9FAFB] mb-2 ml-1">Age:</label>
                  <input required type="number" className="w-full bg-white dark:bg-[#1F2937] border-2 border-slate-200 dark:border-[#374151] rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6]" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#3B82F6] dark:text-[#60A5FA] underline mb-2 ml-1">Address:</label>
                  <input required type="text" className="w-full bg-white dark:bg-[#1F2937] border-2 border-[#3B82F6]/30 dark:border-[#374151] rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6]" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-[#F9FAFB] mb-2 ml-1">Civil Status:</label>
                  <input required type="text" className="w-full bg-white dark:bg-[#1F2937] border-2 border-slate-200 dark:border-[#374151] rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6]" />
                </div>

                <div>
                  <label className="block text-base font-bold text-slate-800 dark:text-[#F9FAFB] mb-2 ml-1 mt-2">Document type</label>
                  <select required className="w-4/5 bg-slate-200 dark:bg-[#374151] border-none rounded-xl px-4 py-3.5 text-sm font-bold text-slate-700 dark:text-[#F9FAFB] focus:outline-none cursor-pointer appearance-none">
                    <option value="" disabled selected></option>
                    <option value="clearance">Barangay Clearance</option>
                    <option value="indigency">Certificate of Indigency</option>
                    <option value="permit">Business Permit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-base font-bold text-slate-800 dark:text-[#F9FAFB] mb-2 ml-1 mt-2">Purpose</label>
                  <input required type="text" className="w-full bg-white dark:bg-[#1F2937] border-2 border-slate-200 dark:border-[#374151] rounded-xl px-4 py-3.5 text-sm text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6]" />
                </div>
              </div>

              <div className="space-y-4 mb-10 ml-2 mt-4">
                 <div className="flex text-sm"><span className="w-32 font-bold text-slate-800 dark:text-[#F9FAFB]">Payment Fee:</span> <span className="font-bold text-slate-600 dark:text-[#9CA3AF]"></span></div>
                 <div className="flex text-sm"><span className="w-32 font-bold text-slate-800 dark:text-[#F9FAFB]">Date:</span> <span className="font-bold text-slate-600 dark:text-[#9CA3AF]"></span></div>
                 <div className="flex text-sm"><span className="w-32 font-bold text-slate-800 dark:text-[#F9FAFB]">Staff Name:</span> <span className="font-bold text-slate-600 dark:text-[#9CA3AF]"></span></div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center space-x-4">
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="bg-[#45B09E] hover:bg-[#3d9d8d] dark:bg-[#10B981] dark:hover:bg-[#059669] text-white px-8 py-3.5 rounded-xl text-sm font-bold shadow-md shadow-[#45B09E]/20 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Processing..." : "Process & Print"}
                </button>
                <button 
                  type="button"
                  className="bg-[#FCFDEB] hover:bg-[#F2F4C3] dark:bg-[#FEF9C3] dark:hover:bg-[#FDE047] text-[#4D5B21] dark:text-[#854D0E] px-8 py-3.5 rounded-xl text-sm font-bold transition-colors shadow-sm"
                >
                  Save Request
                </button>
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-[#e5e7eb] hover:bg-[#d1d5db] dark:bg-[#374151] dark:hover:bg-[#4B5563] text-slate-700 dark:text-[#F9FAFB] px-8 py-3.5 rounded-xl text-sm font-bold transition-colors shadow-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Notification Modal (Identical to Residents page) */}
      {showSuccessDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#111827] w-full max-w-sm rounded-[24px] shadow-2xl border border-slate-200 dark:border-[#374151] overflow-hidden flex flex-col items-center p-8 text-center scale-in-95 duration-200">
            <div className="w-24 h-24 bg-[#10B981] rounded-full flex items-center justify-center mb-6 shadow-lg shadow-[#10B981]/20 dark:shadow-none">
              <Check size={48} className="text-white" strokeWidth={4} />
            </div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-[#F9FAFB] mb-2 tracking-tight">Request Processed</h2>
            <p className="text-slate-500 dark:text-[#9CA3AF] text-sm mb-8 font-medium px-4 leading-relaxed">
              The document request has been successfully processed and queued for printing.
            </p>
            <button 
              onClick={() => setShowSuccessDialog(false)}
              className="w-full bg-[#10B981] hover:bg-[#059669] text-white px-6 py-3 rounded-xl text-sm font-bold shadow-md shadow-[#10B981]/20 dark:shadow-none transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
