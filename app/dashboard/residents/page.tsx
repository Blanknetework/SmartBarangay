"use client";

import { useState, useEffect, FormEvent } from "react";
import { Search, SlidersHorizontal, Plus, Check, AlertTriangle, User } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, addDoc, serverTimestamp, query, orderBy, deleteDoc, doc } from "firebase/firestore";

interface Resident {
  id: string;
  residentId: string;
  firstName: string;
  lastName: string;
  age: number;
  address: string;
  city: string;
  province: string;
}

const PHILIPPINE_CITIES = [
  "Manila", "Quezon City", "Makati", "Taguig", "Pasig", "Cebu City", "Davao City", 
  "Antipolo", "Caloocan", "Zamboanga City", "Iloilo City", "Bacolod", "Angeles"
];
const PHILIPPINE_PROVINCES = [
  "Metro Manila", "Cebu", "Davao del Sur", "Pampanga", "Bulacan", "Cavite", 
  "Laguna", "Rizal", "Batangas", "Iloilo", "Negros Occidental"
];

const MONTHS = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

export default function ResidentsPage() {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [residentToDelete, setResidentToDelete] = useState<string | null>(null);

  const [firstNamePreview, setFirstNamePreview] = useState("");
  const [genderPreview, setGenderPreview] = useState("Male");

  // Fetch residents from Firestore in real-time
  useEffect(() => {
    const q = query(collection(db, "residents"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedResidents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Resident[];
      setResidents(fetchedResidents);
    }, (error) => {
      console.error("Firestore Error:", error);
    });

    return () => unsubscribe();
  }, []);

  const handleAddResident = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      residentId: formData.get("residentId"),
      firstName: formData.get("firstName"),
      middleName: formData.get("middleName"),
      lastName: formData.get("lastName"),
      age: Number(formData.get("age")),
      gender: formData.get("gender"),
      civilStatus: formData.get("civilStatus"),
      birthMonth: formData.get("birthMonth"),
      birthDay: formData.get("birthDay"),
      birthYear: formData.get("birthYear"),
      address: formData.get("address"),
      city: formData.get("city"),
      province: formData.get("province"),
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, "residents"), data);
      setIsSubmitting(false);
      setIsModalOpen(false); // Close modal on success
      setShowSuccessDialog(true);
      setFirstNamePreview("");
      setGenderPreview("Male");
    } catch (error) {
      console.error("Error adding resident:", error);
      alert("Failed to add resident. Please ensure your Firestore Database Rules are set to true.");
      setIsSubmitting(false); // Ensure button unlocks even if it fails
    }
  };

  const handleDelete = (id: string) => {
    setResidentToDelete(id);
  };

  const confirmDelete = async () => {
    if (!residentToDelete) return;
    try {
      await deleteDoc(doc(db, "residents", residentToDelete));
      setResidentToDelete(null);
    } catch (error) {
      alert("Failed to delete. Check database rules.");
    }
  };

  return (
    <div className="flex flex-col space-y-6 lg:space-y-8 animate-in fade-in duration-500">
      <datalist id="cities">
        {PHILIPPINE_CITIES.map(city => <option key={city} value={city} />)}
      </datalist>
      <datalist id="provinces">
        {PHILIPPINE_PROVINCES.map(prov => <option key={prov} value={prov} />)}
      </datalist>

      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-[#F9FAFB] tracking-tight">Residents Record</h1>
      </div>

      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4 w-full sm:w-auto">
          {/* Search Box */}
          <div className="flex bg-white dark:bg-[#1F2937] border border-slate-200 dark:border-[#374151] rounded-lg items-center px-4 py-2.5 w-full sm:w-[350px] lg:w-[450px] shadow-sm dark:shadow-none transition-colors">
            <Search size={18} className="text-slate-400 dark:text-[#9CA3AF] mr-3 shrink-0" />
            <input
              type="text"
              placeholder="Search Resident.."
              className="bg-transparent border-none focus:outline-none text-sm w-full font-medium text-slate-700 dark:text-[#F9FAFB] placeholder:text-slate-400 dark:placeholder:text-[#9CA3AF]"
            />
            <div className="border-l border-slate-200 dark:border-[#374151] pl-3 ml-2">
               <SlidersHorizontal size={18} className="text-slate-600 dark:text-[#9CA3AF] hover:text-[#2369C4] transition-colors cursor-pointer" />
            </div>
          </div>

          {/* Add Button */}
          <button 
            onClick={() => { setIsModalOpen(true); setIsSubmitting(false); }}
            className="flex items-center bg-[#3B82F6] hover:bg-[#2563EB] text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow-md shadow-[#3B82F6]/20 dark:shadow-none transition-colors shrink-0"
          >
            <Plus size={18} className="mr-2" strokeWidth={3} /> Add Resident
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="w-full bg-white dark:bg-[#1F2937] rounded-xl border border-slate-200 dark:border-[#374151] shadow-sm dark:shadow-none overflow-hidden transition-colors">
        <div className="overflow-x-auto w-full">
          <table className="w-full whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-[#111827]/50 border-b border-slate-200 dark:border-[#374151]">
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-[#9CA3AF] border-r border-slate-200 dark:border-[#374151] w-20">ID</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-[#9CA3AF] border-r border-slate-200 dark:border-[#374151]">Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-[#9CA3AF] border-r border-slate-200 dark:border-[#374151] w-24">Age</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-[#9CA3AF] border-r border-slate-200 dark:border-[#374151]">Address</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-[#9CA3AF] w-64">Status</th>
              </tr>
            </thead>
            
            <tbody>
              {residents.map((resident, idx) => (
                <tr 
                  key={resident.id} 
                  className={`group ${idx !== residents.length - 1 ? "border-b border-slate-100 dark:border-[#374151]" : ""} hover:bg-slate-50 dark:hover:bg-[#374151]/30 transition-colors duration-150`}
                >
                  <td className="px-6 py-5 text-sm font-bold text-slate-800 dark:text-[#F9FAFB] border-r border-slate-200 dark:border-[#374151]">
                    {resident.residentId || resident.id.substring(0,6)}
                  </td>
                  <td className="px-6 py-5 text-sm font-bold text-slate-800 dark:text-[#F9FAFB] border-r border-slate-200 dark:border-[#374151]">
                    {resident.firstName} {resident.lastName}
                  </td>
                  <td className="px-6 py-5 text-sm font-semibold text-slate-600 dark:text-[#9CA3AF] border-r border-slate-200 dark:border-[#374151]">
                    {resident.age}
                  </td>
                  <td className="px-6 py-5 text-sm font-semibold text-slate-600 dark:text-[#9CA3AF] border-r border-slate-200 dark:border-[#374151] truncate max-w-xs">
                    {resident.address}, {resident.city}
                  </td>
                  
                  <td className="px-6 py-5 text-right space-x-2">
                    <button className="px-4 py-1.5 bg-[#e5e7eb] dark:bg-[#374151] hover:bg-[#d1d5db] dark:hover:bg-[#4B5563] text-slate-700 dark:text-[#F9FAFB] rounded-md text-sm font-bold transition-colors">
                      View
                    </button>
                    <button className="px-4 py-1.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-md text-sm font-bold transition-colors">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(resident.id)} className="px-4 py-1.5 bg-[#ef4444] hover:bg-[#dc2626] text-white rounded-md text-sm font-bold transition-colors">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {residents.length === 0 && (
            <div className="p-8 text-center text-slate-500 dark:text-[#9CA3AF] text-sm font-medium">
              No residents found. Add a resident to see them here.
            </div>
          )}
        </div>
      </div>

      {/* Residents Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-50 dark:bg-[#111827] w-full max-w-[700px] rounded-[24px] shadow-2xl border border-slate-200 dark:border-[#374151] overflow-hidden flex flex-col scale-in-95 duration-200 max-h-[90vh]">
            
            <form onSubmit={handleAddResident} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-8 sm:p-10 flex-1 overflow-y-auto min-h-0">
                <h2 className="text-lg font-black text-slate-800 dark:text-[#F9FAFB] mb-6 tracking-tight">Residents Registration Form</h2>
                
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3 mb-6 mt-4">
                    <label className="text-sm font-semibold text-slate-700 dark:text-[#F9FAFB]">Resident ID:</label>
                    <input 
                      name="residentId"
                      type="text" 
                      defaultValue={`RC-${Math.floor(1000 + Math.random() * 9000)}`} 
                      required
                      className="w-32 bg-white dark:bg-[#1F2937] border border-slate-300 dark:border-[#374151] rounded-lg px-3 py-1.5 text-sm font-bold text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6]"
                    />
                  </div>
                  
                  {/* Dynamic Profile Picture */}
                  <div className="w-[110px] h-[110px] bg-white dark:bg-[#1F2937] border-2 border-slate-200 dark:border-[#374151] flex items-center justify-center overflow-hidden shrink-0 mt-[-20px] shadow-sm ml-4">
                     {firstNamePreview.length > 2 ? (
                       <img 
                         src={`https://randomuser.me/api/portraits/${genderPreview === 'Female' ? 'women' : 'men'}/${(firstNamePreview.length * 7) % 99 || 1}.jpg`} 
                         alt="Profile Preview" 
                         className="w-[90%] h-[90%] object-cover"
                       />
                     ) : (
                       <User size={55} className="text-slate-300 dark:text-slate-600" strokeWidth={1} />
                     )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-[#9CA3AF] mb-1.5 ml-1">First Name:</label>
                    <input name="firstName" value={firstNamePreview} onChange={(e) => setFirstNamePreview(e.target.value)} required type="text" className="w-full bg-white dark:bg-[#1F2937] border border-slate-300 dark:border-[#374151] rounded-lg px-4 py-2.5 text-sm text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-[#9CA3AF] mb-1.5 ml-1">Middle Name:</label>
                    <input name="middleName" type="text" className="w-full bg-white dark:bg-[#1F2937] border border-slate-300 dark:border-[#374151] rounded-lg px-4 py-2.5 text-sm text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-[#9CA3AF] mb-1.5 ml-1">Last Name:</label>
                    <input name="lastName" required type="text" className="w-full bg-white dark:bg-[#1F2937] border border-slate-300 dark:border-[#374151] rounded-lg px-4 py-2.5 text-sm text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-[#9CA3AF] mb-1.5 ml-1">Age:</label>
                    <input name="age" required type="number" min="0" max="150" className="w-full bg-white dark:bg-[#1F2937] border border-slate-300 dark:border-[#374151] rounded-lg px-4 py-2.5 text-sm text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all" />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-[#F9FAFB] mb-2 ml-1">Birth Date</label>
                  <div className="grid grid-cols-3 gap-3">
                    <select name="birthMonth" required className="bg-white dark:bg-[#1F2937] border border-slate-300 dark:border-[#374151] rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6] cursor-pointer appearance-none">
                      <option value="">Month</option>
                      {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <input name="birthDay" required type="number" placeholder="Day (e.g. 15)" min="1" max="31" className="bg-white dark:bg-[#1F2937] border border-slate-300 dark:border-[#374151] rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6]" />
                    <input name="birthYear" required type="number" placeholder="Year (e.g. 1990)" min="1900" max={new Date().getFullYear()} className="bg-white dark:bg-[#1F2937] border border-slate-300 dark:border-[#374151] rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6]" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 mt-2">
                   <div className="flex items-center space-x-3">
                      <label className="text-sm font-semibold text-slate-700 dark:text-[#F9FAFB]">Gender:</label>
                      <select name="gender" value={genderPreview} onChange={(e) => setGenderPreview(e.target.value)} className="flex-1 bg-[#E2E6EA] dark:bg-[#374151] border-none rounded-lg px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 cursor-pointer appearance-none">
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                   </div>
                   <div className="flex items-center space-x-3">
                      <label className="text-sm font-semibold text-slate-700 dark:text-[#F9FAFB]">Civil Status:</label>
                      <select name="civilStatus" className="flex-1 bg-[#E2E6EA] dark:bg-[#374151] border-none rounded-lg px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 cursor-pointer appearance-none">
                        <option>Single</option>
                        <option>Married</option>
                        <option>Widowed</option>
                        <option>Separated</option>
                      </select>
                   </div>
                </div>

                <div className="space-y-4 mb-4">
                  <div>
                     <label className="block text-xs font-medium text-slate-500 dark:text-[#9CA3AF] mb-1.5 ml-1">Address (House No. / Street):</label>
                     <input name="address" required type="text" className="w-full bg-white dark:bg-[#1F2937] border border-slate-300 dark:border-[#374151] rounded-lg px-4 py-2.5 text-sm text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 dark:text-[#9CA3AF] mb-1.5 ml-1">City/Municipality:</label>
                      <input name="city" list="cities" required type="text" placeholder="e.g. Quezon City" className="w-full bg-white dark:bg-[#1F2937] border border-slate-300 dark:border-[#374151] rounded-lg px-4 py-2.5 text-sm text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6] transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 dark:text-[#9CA3AF] mb-1.5 ml-1">State/Province:</label>
                      <input name="province" list="provinces" required type="text" placeholder="e.g. Metro Manila" className="w-full bg-white dark:bg-[#1F2937] border border-slate-300 dark:border-[#374151] rounded-lg px-4 py-2.5 text-sm text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6] transition-all" />
                    </div>
                  </div>
                </div>

              </div>

              {/* Modal Actions */}
              <div className="px-8 sm:px-10 pb-8 pt-4 flex items-center space-x-4 border-t border-slate-200 dark:border-[#374151] shrink-0">
                <button type="submit" disabled={isSubmitting} className="bg-[#10B981] hover:bg-[#059669] text-white px-6 py-3 rounded-xl text-sm font-bold shadow-md shadow-[#10B981]/20 transition-colors disabled:opacity-50 flex items-center">
                  {isSubmitting ? "Saving..." : "Save Resident"}
                </button>
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-[#E2E6EA] hover:bg-[#d1d5db] dark:bg-[#374151] dark:hover:bg-[#4B5563] text-slate-700 dark:text-[#F9FAFB] px-6 py-3 rounded-xl text-sm font-bold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Notification Modal */}
      {showSuccessDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#111827] w-full max-w-sm rounded-[24px] shadow-2xl border border-slate-200 dark:border-[#374151] overflow-hidden flex flex-col items-center p-8 text-center scale-in-95 duration-200">
            <div className="w-24 h-24 bg-[#10B981] rounded-full flex items-center justify-center mb-6 shadow-lg shadow-[#10B981]/20 dark:shadow-none">
              <Check size={48} className="text-white" strokeWidth={4} />
            </div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-[#F9FAFB] mb-2 tracking-tight">Resident Added</h2>
            <p className="text-slate-500 dark:text-[#9CA3AF] text-sm mb-8 font-medium px-4 leading-relaxed">
              The Resident has been successfully added to the system.
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

      {/* Delete Confirmation Modal */}
      {residentToDelete && (
        <div 
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setResidentToDelete(null)}
        >
          <div 
            className="bg-[#fcfdff] dark:bg-[#111827] w-full max-w-[400px] rounded-[16px] shadow-2xl border-2 border-[#1e90ff] overflow-hidden flex flex-col items-center p-8 text-center scale-in-95 duration-200 relative pt-12 pb-10"
            onClick={(e) => e.stopPropagation()}
          >
            
            <div className="text-[#980e0e] flex justify-center mb-4">
              <AlertTriangle size={110} strokeWidth={2.5} />
            </div>
            
            <h2 className="text-[22px] font-black text-slate-800 dark:text-[#F9FAFB] mb-2 tracking-tight">Are you sure?</h2>
            <p className="text-slate-800 dark:text-[#9CA3AF] text-[15px] mb-1 font-medium px-4 leading-relaxed">
              The Resident information
            </p>
            <p className="text-slate-800 dark:text-[#9CA3AF] text-[15px] mb-1 font-medium px-4 leading-relaxed">
              will be Erased.
            </p>
            <p className="text-slate-800 dark:text-[#9CA3AF] text-[15px] mb-6 font-medium px-4 leading-relaxed">
              Click Ok to continue
            </p>
            
            <div className="flex space-x-4 mt-2">
              <button 
                onClick={() => setResidentToDelete(null)}
                className="w-[130px] bg-white dark:bg-[#1F2937] hover:bg-slate-50 dark:hover:bg-[#374151] border border-slate-300 dark:border-[#374151] text-slate-700 dark:text-[#F9FAFB] px-6 py-2.5 rounded-[8px] text-[15px] font-bold transition-colors tracking-wide"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="w-[130px] bg-[#980e0e] hover:bg-[#7a0a0a] text-white px-6 py-2.5 rounded-[8px] text-[15px] font-bold shadow-md shadow-[#980e0e]/30 transition-colors tracking-wide"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
