"use client";

import { useState, useEffect } from "react";
import { Search, Plus, SlidersHorizontal, Activity, Users, Stethoscope, Droplet, ChevronRight, Eye, Trash2, User } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

export default function MedicalPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [filterGender, setFilterGender] = useState("All");
  const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<any | null>(null);
  
  // Dummy data for Doctors
  const doctors = [
    { id: 1, name: "Dr. Senku Ishigami", specialty: "Doctor Stone, Dental", hospital: "Japan General Hospital", image: "men/32.jpg" },
    { id: 2, name: "Dr. Tsunade Senju", specialty: "Head Surgeon", hospital: "Konoha Medical Center", image: "women/44.jpg" },
  ];

  const appointments = [
    { id: 1, doctor: "Dr. Senku Ishigami", date: "04-19-2026", image: "men/32.jpg" },
    { id: 2, doctor: "Dr. Tsunade Senju", date: "04-20-2026", image: "women/44.jpg" },
  ];

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, "residents"), orderBy("firstName")), (snap) => {
      setPatients(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const filteredPatients = patients.filter(p => {
    const matchesSearch = (p.firstName + " " + p.lastName).toLowerCase().includes(searchTerm.toLowerCase()) || p.residentId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGender = filterGender === "All" || p.gender === filterGender;
    return matchesSearch && matchesGender;
  });

  return (
    <div className="flex flex-col xl:flex-row gap-6 animate-in fade-in duration-500 font-sans">
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col space-y-8">
        
        {/* Header Title */}
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-[#F9FAFB] tracking-tight">Medical</h1>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-[#1F2937] p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-[#374151] flex items-center space-x-6 hover:shadow-md transition-shadow cursor-pointer">
             <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
               <Users size={32} className="text-blue-500" />
             </div>
             <div>
               <h3 className="text-sm font-bold text-slate-500 dark:text-[#9CA3AF] uppercase tracking-wider mb-1">Total Patients</h3>
               <p className="text-3xl font-black text-slate-800 dark:text-[#F9FAFB]">{patients.length}</p>
             </div>
          </div>
          <div className="bg-white dark:bg-[#1F2937] p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-[#374151] flex items-center space-x-6 hover:shadow-md transition-shadow cursor-pointer">
             <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center shrink-0">
               <Stethoscope size={32} className="text-red-500" />
             </div>
             <div>
               <h3 className="text-sm font-bold text-slate-500 dark:text-[#9CA3AF] uppercase tracking-wider mb-1">Doctors</h3>
               <p className="text-3xl font-black text-slate-800 dark:text-[#F9FAFB]">{doctors.length}</p>
             </div>
          </div>
        </div>

        {/* Doctors Section */}
        <div className="flex flex-col space-y-4">
          <h2 className="text-xl font-bold text-slate-800 dark:text-[#F9FAFB]">Doctors</h2>
          <div className="flex space-x-6 overflow-x-auto pb-4 pt-2 px-1">
             {doctors.map(doc => (
               <div key={doc.id} className="bg-white dark:bg-[#1F2937] rounded-[20px] shadow-sm border border-slate-200 dark:border-[#374151] min-w-[220px] w-[220px] p-5 flex flex-col items-center shrink-0 hover:-translate-y-1 hover:shadow-md transition-all">
                  <div className="w-[85px] h-[85px] rounded-full p-1 border-2 border-slate-100 dark:border-slate-700 mb-3 shadow-sm">
                     <img src={`https://randomuser.me/api/portraits/${doc.image}`} alt={doc.name} className="w-full h-full object-cover rounded-full" />
                  </div>
                  <h3 className="font-bold text-sm text-slate-800 dark:text-[#F9FAFB] text-center">{doc.name}</h3>
                  <div className="flex flex-col items-center mt-2 mb-4 space-y-1">
                     <p className="text-[10px] font-bold text-slate-400 dark:text-[#9CA3AF] uppercase tracking-wider">{doc.specialty}</p>
                     <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 text-center">{doc.hospital}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedDoctor(doc)}
                    className="w-full mt-auto bg-[#38bdf8] hover:bg-[#0ea5e9] text-white py-2 rounded-xl text-sm font-black transition-colors shadow-md shadow-[#38bdf8]/30"
                  >
                    View
                  </button>
               </div>
             ))}
             
             {/* Add Doctor Card */}
             <div className="bg-white dark:bg-[#1F2937] rounded-[20px] border-2 border-dashed border-slate-300 dark:border-[#374151] min-w-[220px] w-[220px] p-5 flex flex-col items-center justify-center shrink-0 cursor-pointer hover:bg-slate-50 dark:hover:bg-[#111827] hover:border-[#38bdf8] group transition-all">
                <div className="w-16 h-16 rounded-full border-4 border-[#38bdf8] text-[#38bdf8] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                   <Plus size={32} strokeWidth={3} />
                </div>
                <p className="font-bold text-[#38bdf8]">Add Doctor</p>
             </div>
          </div>
        </div>

        {/* Residents Overview Table */}
        <div className="flex flex-col space-y-4 flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
             <h2 className="text-xl font-bold text-slate-800 dark:text-[#F9FAFB]">Residents Overview</h2>
             
             <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="flex bg-white dark:bg-[#1F2937] items-center px-4 py-2.5 rounded-xl shadow-sm border border-slate-200 dark:border-[#374151] w-full sm:w-[320px] transition-colors">
                  <Search size={16} className="text-slate-400 mr-2 shrink-0" />
                  <input
                     type="text"
                     placeholder="Search Patient.."
                     value={searchTerm}
                     onChange={e => setSearchTerm(e.target.value)}
                     className="bg-transparent border-none outline-none w-full text-sm font-medium text-slate-700 dark:text-[#F9FAFB] placeholder:text-slate-400"
                  />
                  <div className="relative shrink-0 ml-2 border-l border-slate-200 dark:border-[#374151] pl-3">
                    <button onClick={() => setShowFilterMenu(!showFilterMenu)} className={`transition-colors ${showFilterMenu || filterGender !== 'All' ? 'text-blue-500' : 'text-slate-500 hover:text-[#3B82F6]'}`}>
                       <SlidersHorizontal size={16} />
                    </button>
                    {showFilterMenu && (
                       <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-10 overflow-hidden py-1">
                          <div className="px-3 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700 mb-1">
                             Filter by Gender
                          </div>
                          {["All", "Male", "Female"].map(cat => (
                             <button 
                               key={cat}
                               onClick={() => { setFilterGender(cat); setShowFilterMenu(false); }}
                               className={`w-full text-left px-4 py-2 text-sm font-semibold transition-colors ${filterGender === cat ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                             >
                               {cat}
                             </button>
                          ))}
                       </div>
                    )}
                  </div>
                </div>
                
                <button 
                  onClick={() => setIsAddPatientModalOpen(true)}
                  className="flex items-center justify-center bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-[#2563EB]/20 transition-colors shrink-0"
                >
                  <Plus size={16} className="mr-2" strokeWidth={3} /> Add Patient
                </button>
             </div>
          </div>

          <div className="bg-white dark:bg-[#1F2937] rounded-2xl shadow-sm border border-slate-200 dark:border-[#374151] overflow-hidden flex-1">
            <div className="overflow-x-auto w-full">
              <table className="w-full whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-[#111827]/50 border-b border-slate-200 dark:border-[#374151]">
                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-[#9CA3AF]">Resident ID</th>
                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-[#9CA3AF]">Name</th>
                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-[#9CA3AF]">Gender</th>
                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-[#9CA3AF]">Age</th>
                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-[#9CA3AF]">Contact</th>
                    <th className="px-6 py-4 text-left text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-[#9CA3AF]">Last Updated</th>
                    <th className="px-6 py-4 text-right text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-[#9CA3AF]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((patient, idx, arr) => (
                    <tr key={patient.id} className={`group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${idx !== arr.length - 1 ? 'border-b border-slate-100 dark:border-[#374151]' : ''}`}>
                      <td className="px-6 py-4 text-sm font-bold text-slate-800 dark:text-[#F9FAFB]">{patient.residentId || patient.id.substring(0,7)}</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-800 dark:text-[#F9FAFB]">{patient.firstName} {patient.lastName}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-[#9CA3AF]">{patient.gender || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-[#9CA3AF]">{patient.age || '—'}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-600 dark:text-[#9CA3AF]">{patient.contact || '—'}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-500 dark:text-[#9CA3AF]">{patient.lastUpdated || 'Today'}</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button className="px-4 py-1.5 bg-[#e2e8f0] hover:bg-[#cbd5e1] dark:bg-[#374151] dark:hover:bg-[#4B5563] text-slate-700 dark:text-[#F9FAFB] rounded-lg text-xs font-bold transition-colors">
                          View
                        </button>
                        <button className="px-4 py-1.5 bg-[#fee2e2] hover:bg-[#fca5a5] text-[#ef4444] dark:bg-[#7f1d1d]/30 dark:hover:bg-[#7f1d1d]/50 rounded-lg text-xs font-bold transition-colors">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredPatients.length === 0 && (
                    <tr><td colSpan={7} className="p-8 text-center text-slate-500 font-medium">No patients found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-full xl:w-[320px] flex flex-col space-y-6 shrink-0 pt-1">
         
         {/* Recent Appointments */}
         <div className="bg-white dark:bg-[#1F2937] rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-[#374151] flex flex-col">
            <h3 className="text-sm font-black text-slate-800 dark:text-[#F9FAFB] mb-5">Recent Appointments</h3>
            <div className="flex flex-col space-y-4 mb-6">
               {appointments.map(app => (
                 <div key={app.id} className="flex items-center space-x-3">
                    <img src={`https://randomuser.me/api/portraits/${app.image}`} className="w-10 h-10 rounded-full border-2 border-slate-100 dark:border-slate-700" alt={app.doctor} />
                    <div className="flex flex-col">
                       <span className="text-[11px] font-bold text-slate-800 dark:text-[#F9FAFB]">{app.doctor}</span>
                       <span className="text-[10px] font-semibold text-slate-500 dark:text-[#9CA3AF] mt-0.5">{app.date}</span>
                    </div>
                 </div>
               ))}
            </div>
            <button className="w-full bg-[#f1f5f9] dark:bg-[#374151] hover:bg-[#e2e8f0] dark:hover:bg-[#4B5563] text-slate-700 dark:text-[#F9FAFB] py-3 rounded-2xl text-sm font-bold flex items-center justify-center transition-colors mt-auto">
               See All <ChevronRight size={16} className="ml-1" strokeWidth={3} />
            </button>
         </div>

         {/* Health Tip */}
         <div className="bg-[#f1f5f9] dark:bg-[#1E293B] rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-[#374151] flex items-start space-x-4">
            <div className="bg-[#38bdf8]/20 p-3 rounded-xl shrink-0 mt-1">
               <Droplet size={28} className="text-[#0ea5e9]" fill="currentColor" />
            </div>
            <div className="flex flex-col">
               <h3 className="text-sm font-black text-[#0284c7] dark:text-[#38bdf8] mb-2 leading-tight">Stay Hydrated!</h3>
               <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 leading-relaxed">
                  Drink at least 8 glasses of water a day to stay healthy and hydrated
               </p>
            </div>
         </div>

      </div>



      {/* Add Patient Modal */}
      {isAddPatientModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#111827] w-full max-w-4xl rounded-[24px] shadow-2xl border border-slate-200 dark:border-[#374151] overflow-hidden flex flex-col scale-in-95 duration-200 max-h-[90vh]">
            
            <div className="px-8 py-5 border-b border-slate-200 dark:border-[#374151] flex justify-between items-center bg-slate-50 dark:bg-[#1F2937]">
              <h2 className="text-xl font-black text-slate-800 dark:text-[#F9FAFB] tracking-tight">Patient Profile</h2>
              <button onClick={() => setIsAddPatientModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-[#F9FAFB] transition-colors">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <div className="p-8 overflow-y-auto flex-1 flex flex-col lg:flex-row gap-8">
               
               <div className="flex-1 space-y-6">
                 {/* Basic Info */}
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div>
                     <label className="block text-xs font-bold text-slate-500 dark:text-[#9CA3AF] mb-1">Last Name:</label>
                     <input type="text" className="w-full bg-slate-50 dark:bg-[#1F2937] border border-slate-200 dark:border-[#374151] rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6]" />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-500 dark:text-[#9CA3AF] mb-1">First Name:</label>
                     <input type="text" className="w-full bg-slate-50 dark:bg-[#1F2937] border border-slate-200 dark:border-[#374151] rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6]" />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-500 dark:text-[#9CA3AF] mb-1">Middle Name:</label>
                     <input type="text" className="w-full bg-slate-50 dark:bg-[#1F2937] border border-slate-200 dark:border-[#374151] rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6]" />
                   </div>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div>
                     <label className="block text-xs font-bold text-slate-500 dark:text-[#9CA3AF] mb-1">Mobile #:</label>
                     <input type="text" className="w-full bg-slate-50 dark:bg-[#1F2937] border border-slate-200 dark:border-[#374151] rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6]" />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-500 dark:text-[#9CA3AF] mb-1">Religion:</label>
                     <input type="text" className="w-full bg-slate-50 dark:bg-[#1F2937] border border-slate-200 dark:border-[#374151] rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6]" />
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-500 dark:text-[#9CA3AF] mb-1">Email:</label>
                     <input type="email" className="w-full bg-slate-50 dark:bg-[#1F2937] border border-slate-200 dark:border-[#374151] rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6]" />
                   </div>
                 </div>

                 {/* Birth Date & Emergency */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                     <label className="block text-xs font-bold text-slate-500 dark:text-[#9CA3AF] mb-2">Birth Date</label>
                     <div className="flex space-x-2">
                       <select className="flex-1 bg-slate-50 dark:bg-[#1F2937] border border-slate-200 dark:border-[#374151] rounded-lg px-2 py-2.5 text-sm font-semibold text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6]">
                         <option>January</option>
                       </select>
                       <select className="w-20 bg-slate-50 dark:bg-[#1F2937] border border-slate-200 dark:border-[#374151] rounded-lg px-2 py-2.5 text-sm font-semibold text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6]">
                         <option>01</option>
                       </select>
                       <select className="w-24 bg-slate-50 dark:bg-[#1F2937] border border-slate-200 dark:border-[#374151] rounded-lg px-2 py-2.5 text-sm font-semibold text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6]">
                         <option>2000</option>
                       </select>
                     </div>
                   </div>
                   <div className="flex space-x-4">
                     <div className="w-20">
                       <label className="block text-xs font-bold text-slate-500 dark:text-[#9CA3AF] mb-1">&nbsp;</label>
                       <input type="text" placeholder="Age" className="w-full bg-slate-50 dark:bg-[#1F2937] border border-slate-200 dark:border-[#374151] rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6]" />
                     </div>
                     <div className="flex-1">
                       <label className="block text-xs font-bold text-slate-500 dark:text-[#9CA3AF] mb-1">Emergency Contact</label>
                       <input type="text" placeholder="Contact:" className="w-full bg-slate-50 dark:bg-[#1F2937] border border-slate-200 dark:border-[#374151] rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6]" />
                     </div>
                   </div>
                 </div>

                 {/* Gender & Civil Status */}
                 <div className="flex space-x-6">
                   <div className="flex items-center space-x-2">
                     <label className="text-xs font-bold text-slate-500 dark:text-[#9CA3AF]">Gender:</label>
                     <select className="bg-slate-50 dark:bg-[#1F2937] border border-slate-200 dark:border-[#374151] rounded-lg px-3 py-2 text-sm font-semibold text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6]">
                       <option>Male</option>
                       <option>Female</option>
                     </select>
                   </div>
                   <div className="flex items-center space-x-2">
                     <label className="text-xs font-bold text-slate-500 dark:text-[#9CA3AF]">Civil Status</label>
                     <select className="bg-slate-50 dark:bg-[#1F2937] border border-slate-200 dark:border-[#374151] rounded-lg px-3 py-2 text-sm font-semibold text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6]">
                       <option>Single</option>
                       <option>Married</option>
                     </select>
                   </div>
                 </div>

                 {/* Address */}
                 <div>
                   <label className="block text-xs font-bold text-slate-500 dark:text-[#9CA3AF] mb-2">Address</label>
                   <input type="text" placeholder="Full Address:" className="w-full bg-slate-50 dark:bg-[#1F2937] border border-slate-200 dark:border-[#374151] rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6] mb-3" />
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <input type="text" placeholder="City:" className="w-full bg-slate-50 dark:bg-[#1F2937] border border-slate-200 dark:border-[#374151] rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6]" />
                     <input type="text" placeholder="State/Province:" className="w-full bg-slate-50 dark:bg-[#1F2937] border border-slate-200 dark:border-[#374151] rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6]" />
                   </div>
                 </div>

                 {/* Vitals & BMI */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                     <label className="block text-xs font-bold text-slate-500 dark:text-[#9CA3AF] mb-2">Vitals</label>
                     <div className="flex space-x-3">
                       <input type="text" placeholder="Blood Pressure:" className="w-full bg-slate-50 dark:bg-[#1F2937] border border-slate-200 dark:border-[#374151] rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6]" />
                       <input type="text" placeholder="Pulse:" className="w-full bg-slate-50 dark:bg-[#1F2937] border border-slate-200 dark:border-[#374151] rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6]" />
                     </div>
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-500 dark:text-[#9CA3AF] mb-2">BMI:</label>
                     <div className="flex space-x-3">
                       <input type="text" placeholder="Weight:" className="w-full bg-slate-50 dark:bg-[#1F2937] border border-slate-200 dark:border-[#374151] rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6]" />
                       <input type="text" placeholder="Height:" className="w-full bg-slate-50 dark:bg-[#1F2937] border border-slate-200 dark:border-[#374151] rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6]" />
                     </div>
                   </div>
                 </div>

                 {/* Notes & Medications */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                     <label className="block text-xs font-bold text-slate-500 dark:text-[#9CA3AF] mb-1">Notes:</label>
                     <textarea placeholder="Notes:" className="w-full bg-slate-50 dark:bg-[#1F2937] border border-slate-200 dark:border-[#374151] rounded-lg px-3 py-3 text-sm font-semibold text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6] h-20 resize-none"></textarea>
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-slate-500 dark:text-[#9CA3AF] mb-1">Current Medications:</label>
                     <textarea placeholder="Medications:" className="w-full bg-slate-50 dark:bg-[#1F2937] border border-slate-200 dark:border-[#374151] rounded-lg px-3 py-3 text-sm font-semibold text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6] h-20 resize-none"></textarea>
                   </div>
                 </div>

               </div>

               {/* Right Side: Photo & ID */}
               <div className="flex flex-col items-center shrink-0 lg:w-48">
                 <div className="w-40 h-40 bg-white dark:bg-[#1F2937] rounded-2xl border-2 border-slate-200 dark:border-[#374151] flex items-center justify-center shadow-sm mb-4">
                   <User size={80} className="text-slate-300 dark:text-slate-600" strokeWidth={1} />
                 </div>
                 <div className="flex items-center space-x-2 bg-slate-100 dark:bg-[#374151] px-4 py-2 rounded-lg border border-slate-200 dark:border-[#4B5563]">
                   <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Resident ID:</span>
                   <span className="text-sm font-black text-slate-800 dark:text-[#F9FAFB] bg-white dark:bg-[#111827] px-2 py-0.5 rounded border border-slate-200 dark:border-[#4B5563]">00-0000</span>
                 </div>
               </div>

            </div>

            <div className="px-8 py-5 border-t border-slate-200 dark:border-[#374151] flex justify-center space-x-4 bg-slate-50 dark:bg-[#111827]">
              <button 
                className="bg-[#10B981] hover:bg-[#059669] text-white px-8 py-3 rounded-xl text-sm font-bold shadow-md shadow-[#10B981]/20 transition-colors w-40"
              >
                Save Patient
              </button>
              <button 
                onClick={() => setIsAddPatientModalOpen(false)}
                className="bg-slate-200 dark:bg-[#374151] hover:bg-slate-300 dark:hover:bg-[#4B5563] text-slate-700 dark:text-[#F9FAFB] px-8 py-3 rounded-xl text-sm font-bold transition-colors w-40"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Doctor Overview Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#111827] w-full max-w-2xl rounded-[24px] shadow-2xl border border-slate-200 dark:border-[#374151] overflow-hidden flex flex-col scale-in-95 duration-200">
            
            {/* Header */}
            <div className="px-8 py-5 border-b border-slate-200 dark:border-[#374151] flex justify-between items-center bg-slate-50 dark:bg-[#1F2937]">
              <h2 className="text-2xl font-black text-slate-800 dark:text-[#F9FAFB] tracking-tight">Doctor Overview</h2>
              <button onClick={() => setSelectedDoctor(null)} className="text-[#3B82F6] hover:text-[#2563EB] font-bold text-sm flex items-center transition-colors">
                 Back <ChevronRight size={16} className="ml-1" strokeWidth={3} />
              </button>
            </div>

            <div className="p-8 flex flex-col space-y-6">
               
               {/* Doctor Identity */}
               <div className="flex flex-col md:flex-row gap-6">
                  <div className="bg-slate-50 dark:bg-[#1F2937] border border-slate-200 dark:border-[#374151] rounded-2xl p-4 flex flex-col items-center justify-center shrink-0 w-full md:w-56 h-56">
                    <div className="w-32 h-32 rounded-full p-1 border-2 border-slate-200 dark:border-slate-700 mb-4 shadow-sm bg-white dark:bg-[#111827]">
                       <img src={`https://randomuser.me/api/portraits/${selectedDoctor.image}`} alt={selectedDoctor.name} className="w-full h-full object-cover rounded-full" />
                    </div>
                    <h3 className="font-black text-lg text-slate-800 dark:text-[#F9FAFB] text-center leading-tight">{selectedDoctor.name}</h3>
                  </div>

                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-2 content-start pt-2">
                     <div>
                       <span className="text-[11px] font-bold text-[#3B82F6] dark:text-[#60A5FA] uppercase tracking-wider block mb-1">Specialty</span>
                       <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{selectedDoctor.specialty}</span>
                     </div>
                     <div>
                       <span className="text-[11px] font-bold text-[#3B82F6] dark:text-[#60A5FA] uppercase tracking-wider block mb-1">Hospital</span>
                       <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{selectedDoctor.hospital}</span>
                     </div>
                     <div>
                       <span className="text-[11px] font-bold text-[#3B82F6] dark:text-[#60A5FA] uppercase tracking-wider block mb-1">Experience</span>
                       <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">7 Years</span>
                     </div>
                     <div>
                       <span className="text-[11px] font-bold text-[#3B82F6] dark:text-[#60A5FA] uppercase tracking-wider block mb-1">Languages</span>
                       <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">English, Japanese</span>
                     </div>
                     <div>
                       <span className="text-[11px] font-bold text-[#3B82F6] dark:text-[#60A5FA] uppercase tracking-wider block mb-1">Contact #</span>
                       <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">212 (123)-1234</span>
                     </div>
                     <div>
                       <span className="text-[11px] font-bold text-[#3B82F6] dark:text-[#60A5FA] uppercase tracking-wider block mb-1">Gender</span>
                       <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Male</span>
                     </div>
                  </div>
               </div>

               {/* Stats & Appointments Table */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 
                 <div className="border border-slate-200 dark:border-[#374151] rounded-2xl p-4 flex flex-col bg-white dark:bg-[#111827]">
                    <h4 className="text-xs font-black text-slate-800 dark:text-[#F9FAFB] uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-[#374151] pb-2">Specialty</h4>
                    <div className="flex flex-col space-y-3 mt-1">
                      <label className="flex items-center space-x-3 text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input type="radio" name="specialty" className="w-4 h-4 text-[#38bdf8] focus:ring-[#38bdf8] bg-slate-100 dark:bg-[#1F2937] border-slate-300 dark:border-[#4B5563]" defaultChecked />
                        <span>Cardiology</span>
                      </label>
                      <label className="flex items-center space-x-3 text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input type="radio" name="specialty" className="w-4 h-4 text-[#38bdf8] focus:ring-[#38bdf8] bg-slate-100 dark:bg-[#1F2937] border-slate-300 dark:border-[#4B5563]" />
                        <span>Orthodontist</span>
                      </label>
                      <label className="flex items-center space-x-3 text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input type="radio" name="specialty" className="w-4 h-4 text-[#38bdf8] focus:ring-[#38bdf8] bg-slate-100 dark:bg-[#1F2937] border-slate-300 dark:border-[#4B5563]" />
                        <span>Dermatology</span>
                      </label>
                    </div>
                    <button className="mt-5 bg-[#38bdf8]/20 text-[#0284c7] dark:text-[#38bdf8] hover:bg-[#38bdf8]/30 py-1.5 px-4 rounded-lg text-xs font-black transition-colors w-max mx-auto">Edit</button>
                 </div>

                 <div className="border border-slate-200 dark:border-[#374151] rounded-2xl p-4 flex flex-col bg-white dark:bg-[#111827]">
                    <h4 className="text-xs font-black text-slate-800 dark:text-[#F9FAFB] uppercase tracking-wider mb-3 border-b border-slate-100 dark:border-[#374151] pb-2">Appointments</h4>
                    <div className="flex flex-col space-y-3 mt-1 flex-1 overflow-y-auto max-h-32 pr-1">
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-700 dark:text-[#F9FAFB] text-[11px] flex items-center"><ChevronRight size={12} className="mr-1 text-[#38bdf8]" /> April 20, 2026</span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-4 font-semibold">9:30 am - 10:30 am</span>
                        </div>
                        <button className="bg-[#10B981]/20 text-[#059669] hover:bg-[#10B981]/30 py-1 px-3 rounded-lg text-[10px] font-black transition-colors">Edit</button>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-700 dark:text-[#F9FAFB] text-[11px] flex items-center"><ChevronRight size={12} className="mr-1 text-[#38bdf8]" /> April 30, 2026</span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-4 font-semibold">11:00 am - 12:00 pm</span>
                        </div>
                        <button className="bg-[#10B981]/20 text-[#059669] hover:bg-[#10B981]/30 py-1 px-3 rounded-lg text-[10px] font-black transition-colors">Edit</button>
                      </div>
                    </div>
                 </div>

                 <div className="border border-slate-200 dark:border-[#374151] rounded-2xl p-4 flex flex-col bg-white dark:bg-[#111827]">
                    <h4 className="text-xs font-black text-slate-800 dark:text-[#F9FAFB] uppercase tracking-wider mb-3 border-b border-slate-100 dark:border-[#374151] pb-2">Availability</h4>
                    <div className="flex flex-col space-y-2 mt-1 flex-1">
                      <div className="flex justify-between text-[11px] font-bold">
                         <span className="text-slate-600 dark:text-[#9CA3AF]">Monday</span>
                         <span className="text-slate-800 dark:text-[#F9FAFB]">9:00 am - 1:00 pm</span>
                      </div>
                      <div className="flex justify-between text-[11px] font-bold">
                         <span className="text-slate-600 dark:text-[#9CA3AF]">Tuesday</span>
                         <span className="text-slate-800 dark:text-[#F9FAFB]">9:00 am - 11:00 am</span>
                      </div>
                      <div className="flex justify-between text-[11px] font-bold">
                         <span className="text-slate-600 dark:text-[#9CA3AF]">Thursday</span>
                         <span className="text-slate-800 dark:text-[#F9FAFB]">10:00 am - 1:00 pm</span>
                      </div>
                    </div>
                    <button className="mt-3 bg-[#38bdf8]/20 text-[#0284c7] dark:text-[#38bdf8] hover:bg-[#38bdf8]/30 py-1.5 px-4 rounded-lg text-xs font-black transition-colors w-max mx-auto">Edit</button>
                 </div>

               </div>

            </div>

            <div className="px-8 py-5 border-t border-slate-200 dark:border-[#374151] flex justify-between items-center bg-slate-50 dark:bg-[#111827]">
              <button className="bg-[#10B981] hover:bg-[#059669] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-[#10B981]/20 transition-colors">
                Make an Appointment
              </button>
              <button className="bg-[#EF4444] hover:bg-[#DC2626] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-[#EF4444]/20 transition-colors flex items-center">
                <Trash2 size={16} className="mr-2" strokeWidth={2.5} /> Delete Profile
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
