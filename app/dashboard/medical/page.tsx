"use client";

import { useState, useEffect } from "react";
import { Search, Plus, SlidersHorizontal, Activity, Users, Stethoscope, Droplet, ChevronRight, Eye, Trash2, User, Pill, FileText, Heart, X, Check, AlertTriangle } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, addDoc, updateDoc, deleteDoc, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { useRef } from "react";

export default function MedicalPage() {
  const [patients, setPatients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [filterGender, setFilterGender] = useState("All");
  const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);
  const [showAddPatientSuccess, setShowAddPatientSuccess] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<any | null>(null);
  const [viewPatientModalOpen, setViewPatientModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  
  const [isEditingMedications, setIsEditingMedications] = useState(false);

  const [isMakeAppointmentModalOpen, setIsMakeAppointmentModalOpen] = useState(false);
  const [showAppointmentSuccess, setShowAppointmentSuccess] = useState(false);

  const [isAddDoctorModalOpen, setIsAddDoctorModalOpen] = useState(false);
  const [showAddDoctorSuccess, setShowAddDoctorSuccess] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; type: "Doctor Profile" | "Patient Record" | "Appointment" | null; id: string | null; collection: string }>({ isOpen: false, type: null, id: null, collection: "" });
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);
  
  const [isEditAvailabilityOpen, setIsEditAvailabilityOpen] = useState(false);
  const [showEditAvailabilitySuccess, setShowEditAvailabilitySuccess] = useState(false);
  
  const [isEditAppointmentModalOpen, setIsEditAppointmentModalOpen] = useState(false);
  const [showEditAppointmentSuccess, setShowEditAppointmentSuccess] = useState(false);

  const [isEditSpecialtyOpen, setIsEditSpecialtyOpen] = useState(false);
  const [showEditSpecialtySuccess, setShowEditSpecialtySuccess] = useState(false);

  const [validationModal, setValidationModal] = useState({ isOpen: false, message: "" });
  const [isSeeAllAppointmentsOpen, setIsSeeAllAppointmentsOpen] = useState(false);
  const [tempAvailabilities, setTempAvailabilities] = useState<any[]>([]);
  const [tempSpecialties, setTempSpecialties] = useState<string[]>([]);
  const [newAvail, setNewAvail] = useState({ day: "", startTime: "", endTime: "" });
  const [newSpecialty, setNewSpecialty] = useState("");

  const handleAddTempAvailability = () => {
    if (newAvail.day && newAvail.startTime && newAvail.endTime) {
      setTempAvailabilities([{ id: Date.now(), ...newAvail }, ...tempAvailabilities]);
      setNewAvail({ day: "", startTime: "", endTime: "" });
    }
  };

  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isEditingLabs, setIsEditingLabs] = useState(false);

  const [addPatientForm, setAddPatientForm] = useState({
    residentId: "RC-0000",
    firstName: "",
    lastName: "",
    middleName: "",
    contact: "",
    religion: "",
    email: "",
    birthMonth: "January",
    birthDay: "01",
    birthYear: "2000",
    age: "",
    emergencyContact: "",
    gender: "Male",
    civilStatus: "Single",
    address: "",
    city: "",
    province: "",
    bloodPressure: "",
    pulse: "",
    weight: "",
    height: "",
    notes: "",
    medications: "",
    photoURL: ""
  });

  const handleResidentIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAddPatientForm(prev => ({ ...prev, residentId: val }));
    
    // Auto-fill if resident is found
    const found = patients.find(p => p.residentId === val);
    if (found) {
      setAddPatientForm(prev => ({
        ...prev,
        firstName: found.firstName || "",
        lastName: found.lastName || "",
        middleName: found.middleName || "",
        contact: found.contact || "",
        religion: found.religion || "",
        email: found.email || "",
        birthMonth: found.birthMonth || "January",
        birthDay: found.birthDay || "01",
        birthYear: found.birthYear || "2000",
        age: found.age ? String(found.age) : "",
        gender: found.gender || "Male",
        civilStatus: found.civilStatus || "Single",
        address: found.address || "",
        city: found.city || "",
        province: found.province || "",
        photoURL: found.profilePicUrl || (found.firstName ? `https://randomuser.me/api/portraits/${found.gender === 'Female' ? 'women' : 'men'}/${(found.firstName.length * 7) % 99 || 1}.jpg` : "")
      }));
    }
  };
  
  const [doctors, setDoctors] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [addDoctorForm, setAddDoctorForm] = useState({
    firstName: "", lastName: "", middleName: "", contact: "", email: "", gender: "Male",
    language: "", hospital: "", experience: ""
  });
  const [addDoctorSpecialties, setAddDoctorSpecialties] = useState<string[]>([""]);
  const [addDoctorAvailabilities, setAddDoctorAvailabilities] = useState([{ day: "", startTime: "", endTime: "" }]);
  const [doctorPicPreview, setDoctorPicPreview] = useState<string | null>(null);
  const doctorPicRef = useRef<HTMLInputElement>(null);

  const handleDoctorPicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
           const canvas = document.createElement("canvas");
           const MAX_SIZE = 250;
           let width = img.width;
           let height = img.height;
           if (width > height) {
              if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
           } else {
              if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
           }
           canvas.width = width;
           canvas.height = height;
           const ctx = canvas.getContext("2d");
           ctx?.drawImage(img, 0, 0, width, height);
           setDoctorPicPreview(canvas.toDataURL("image/jpeg", 0.6));
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const [makeAppointmentForm, setMakeAppointmentForm] = useState({
    date: "", time: "", purpose: ""
  });

  useEffect(() => {
    const unsubResidents = onSnapshot(query(collection(db, "residents"), orderBy("firstName")), (snap) => {
      setPatients(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    
    const unsubDoctors = onSnapshot(query(collection(db, "doctors")), (snap) => {
      setDoctors(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubAppointments = onSnapshot(query(collection(db, "appointments")), (snap) => {
      setAppointments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubResidents();
      unsubDoctors();
      unsubAppointments();
    };
  }, []);

  const handleAddDoctor = () => {
    if (!addDoctorForm.firstName || !addDoctorForm.lastName || !addDoctorForm.contact || !addDoctorForm.email || !addDoctorForm.hospital || !addDoctorForm.experience) {
      setValidationModal({ isOpen: true, message: "Please fill out all required doctor information fields." });
      return;
    }
    const hasValidAvailability = addDoctorAvailabilities.some(a => a.day && a.startTime && a.endTime);
    if (!hasValidAvailability) {
      setValidationModal({ isOpen: true, message: "Please provide at least one complete availability slot." });
      return;
    }
    if (!addDoctorSpecialties.filter(Boolean).length) {
      setValidationModal({ isOpen: true, message: "Please provide at least one specialty." });
      return;
    }
    setIsAddDoctorModalOpen(false);
    setShowAddDoctorSuccess(true);
  };

  const confirmAddDoctor = async () => {
    try {
      setShowAddDoctorSuccess(false);
      const name = `Dr. ${addDoctorForm.firstName} ${addDoctorForm.lastName}`;
      const specialty = addDoctorSpecialties.filter(Boolean).join(", ");
      await addDoc(collection(db, "doctors"), {
        ...addDoctorForm,
        name,
        specialty,
        availabilities: addDoctorAvailabilities.filter(a => a.day),
        image: doctorPicPreview || "men/32.jpg", // fallback
        createdAt: serverTimestamp()
      });
      setAddDoctorForm({ firstName: "", lastName: "", middleName: "", contact: "", email: "", gender: "Male", language: "", hospital: "", experience: "" });
      setAddDoctorSpecialties([""]);
      setAddDoctorAvailabilities([{ day: "", startTime: "", endTime: "" }]);
      setDoctorPicPreview(null);
    } catch(err) { console.error(err) }
  };

  const handleMakeAppointment = async () => {
    try {
      if (!selectedDoctor) return;
      await addDoc(collection(db, "appointments"), {
        ...makeAppointmentForm,
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        doctorImage: selectedDoctor.image,
        createdAt: serverTimestamp()
      });
      setIsMakeAppointmentModalOpen(false);
      setShowAppointmentSuccess(true);
      setMakeAppointmentForm({ date: "", time: "", purpose: "" });
    } catch(err) { console.error(err) }
  };
  
  const handleSavePatient = async () => {
    try {
      if (!addPatientForm.residentId || !addPatientForm.bloodPressure || !addPatientForm.pulse || !addPatientForm.weight || !addPatientForm.height) {
        setValidationModal({ isOpen: true, message: "Please fill out all required patient vitals and information." });
        return;
      }
      const found = patients.find(p => p.residentId === addPatientForm.residentId);
      if (found) {
        await updateDoc(doc(db, "residents", found.id), {
          bloodPressure: addPatientForm.bloodPressure,
          pulse: addPatientForm.pulse,
          weight: addPatientForm.weight,
          height: addPatientForm.height,
          notesList: addPatientForm.notes ? [{ date: new Date().toLocaleDateString('en-US', {month:'2-digit', day:'2-digit', year:'numeric'}), text: addPatientForm.notes }] : [],
          medicationsList: addPatientForm.medications ? [addPatientForm.medications] : [],
          labsList: [],
          emergencyContact: addPatientForm.emergencyContact,
          hasMedicalRecord: true,
          updatedAt: serverTimestamp()
        });
      }
      setIsAddPatientModalOpen(false);
      setShowAddPatientSuccess(true);
      setAddPatientForm({
        residentId: "00-0000", firstName: "", lastName: "", middleName: "", contact: "", religion: "", email: "",
        birthMonth: "January", birthDay: "01", birthYear: "2000", age: "", emergencyContact: "", gender: "Male",
        civilStatus: "Single", address: "", city: "", province: "", bloodPressure: "", pulse: "", weight: "", height: "",
        notes: "", medications: "", photoURL: ""
      });
    } catch(err) { console.error(err) }
  };

  const medicalPatients = patients.filter(p => p.hasMedicalRecord || p.bloodPressure || p.height || p.weight || p.medications || p.notes || p.notesList?.length || p.medicationsList?.length || p.labsList?.length);

  const filteredPatients = medicalPatients.filter(p => {
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
               <p className="text-3xl font-black text-slate-800 dark:text-[#F9FAFB]">{medicalPatients.length}</p>
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
                     <img src={doc.image?.includes('data:image') || doc.image?.includes('http') ? doc.image : `https://randomuser.me/api/portraits/${doc.image}`} alt={doc.name} className="w-full h-full object-cover rounded-full" />
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
             <div onClick={() => setIsAddDoctorModalOpen(true)} className="bg-white dark:bg-[#1F2937] rounded-[20px] border-2 border-dashed border-slate-300 dark:border-[#374151] min-w-[220px] w-[220px] p-5 flex flex-col items-center justify-center shrink-0 cursor-pointer hover:bg-slate-50 dark:hover:bg-[#111827] hover:border-[#38bdf8] group transition-all">
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
                        <button 
                          onClick={() => { setSelectedPatient(patient); setViewPatientModalOpen(true); setIsEditingMedications(false); }}
                          className="px-4 py-1.5 bg-[#e2e8f0] hover:bg-[#cbd5e1] dark:bg-[#374151] dark:hover:bg-[#4B5563] text-slate-700 dark:text-[#F9FAFB] rounded-lg text-xs font-bold transition-colors"
                        >
                          View
                        </button>
                        <button 
                          onClick={() => setDeleteModal({ isOpen: true, type: "Patient Record", id: patient.id, collection: "residents" })}
                          className="px-4 py-1.5 bg-[#fee2e2] hover:bg-[#fca5a5] text-[#ef4444] dark:bg-[#7f1d1d]/30 dark:hover:bg-[#7f1d1d]/50 rounded-lg text-xs font-bold transition-colors"
                        >
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
      <div className="w-full xl:w-[320px] flex flex-col space-y-6 shrink-0 mt-[46px]">
         
         {/* Recent Appointments */}
         <div className="bg-white dark:bg-[#1F2937] rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-[#374151] flex flex-col">
            <h3 className="text-sm font-black text-slate-800 dark:text-[#F9FAFB] mb-5">Recent Appointments</h3>
            <div className="flex flex-col space-y-4 mb-6">
               {appointments.slice(0, 5).map(app => (
                 <div key={app.id} className="flex items-center space-x-3">
                    <img 
                      src={app.doctorImage?.includes('data:image') || app.doctorImage?.includes('http') ? app.doctorImage : (app.doctorImage ? `https://randomuser.me/api/portraits/${app.doctorImage}` : `https://randomuser.me/api/portraits/${app.image || 'men/32.jpg'}`)} 
                      className="w-10 h-10 rounded-full border-2 border-slate-100 dark:border-slate-700 object-cover" 
                      alt={app.doctorName || app.doctor} 
                    />
                    <div className="flex flex-col">
                       <span className="text-[11px] font-bold text-slate-800 dark:text-[#F9FAFB]">{app.doctorName || app.doctor}</span>
                       <span className="text-[10px] font-semibold text-slate-500 dark:text-[#9CA3AF] mt-0.5">{app.date} {app.time && `- ${app.time}`}</span>
                    </div>
                 </div>
               ))}
               {appointments.length === 0 && (
                 <span className="text-sm font-semibold text-slate-400 text-center py-4">No recent appointments</span>
               )}
            </div>
            <button onClick={() => setIsSeeAllAppointmentsOpen(true)} className="w-full bg-[#f1f5f9] dark:bg-[#374151] hover:bg-[#e2e8f0] dark:hover:bg-[#4B5563] text-slate-700 dark:text-[#F9FAFB] py-3 rounded-2xl text-sm font-bold flex items-center justify-center transition-colors mt-auto">
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
          <div className="bg-slate-50 dark:bg-[#111827] w-full max-w-[800px] rounded-[24px] shadow-2xl border border-slate-200 dark:border-[#374151] overflow-hidden flex flex-col scale-in-95 duration-200 max-h-[90vh]">
            <form className="flex flex-col flex-1 overflow-hidden">
              <div className="p-8 sm:p-10 flex-1 overflow-y-auto min-h-0">
                 <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-black text-slate-800 dark:text-[#F9FAFB] tracking-tight">Patient Profile</h2>
                    <button type="button" onClick={() => setIsAddPatientModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-[#F9FAFB] transition-colors">
                      <X size={24} strokeWidth={2.5} />
                    </button>
                 </div>
                 
                 <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3 mb-6 mt-4">
                      <label className="text-sm font-semibold text-slate-700 dark:text-[#F9FAFB]">Resident ID:</label>
                      <input type="text" value={addPatientForm.residentId} onChange={handleResidentIdChange} className="w-32 bg-white dark:bg-[#1F2937] border border-slate-300 dark:border-[#374151] rounded-lg px-3 py-1.5 text-sm font-bold text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6]" />
                    </div>
                    <div className="w-[110px] h-[110px] bg-white dark:bg-[#1F2937] border-2 border-slate-200 dark:border-[#374151] flex items-center justify-center overflow-hidden shrink-0 mt-[-20px] shadow-sm ml-4 cursor-pointer relative group rounded-xl">
                      {addPatientForm.photoURL ? (
                         <img src={addPatientForm.photoURL} alt="Resident" className="w-full h-full object-cover" />
                      ) : (
                         <User size={55} className="text-slate-300 dark:text-slate-600" strokeWidth={1} />
                      )}
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white text-[11px] font-bold text-center leading-tight">Upload<br/>Photo</span>
                      </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                   <div>
                     <label className="block text-xs font-semibold text-slate-500 dark:text-[#9CA3AF] mb-1.5 ml-1">Last Name:</label>
                     <input type="text" value={addPatientForm.lastName} onChange={(e)=>setAddPatientForm({...addPatientForm, lastName:e.target.value})} className="w-full bg-white dark:bg-[#1F2937] border border-slate-300 dark:border-[#374151] rounded-lg px-4 py-2.5 text-sm text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all" />
                   </div>
                   <div>
                     <label className="block text-xs font-semibold text-slate-500 dark:text-[#9CA3AF] mb-1.5 ml-1">First Name:</label>
                     <input type="text" value={addPatientForm.firstName} onChange={(e)=>setAddPatientForm({...addPatientForm, firstName:e.target.value})} className="w-full bg-white dark:bg-[#1F2937] border border-slate-300 dark:border-[#374151] rounded-lg px-4 py-2.5 text-sm text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all" />
                   </div>
                   <div>
                     <label className="block text-xs font-semibold text-slate-500 dark:text-[#9CA3AF] mb-1.5 ml-1">Middle Name:</label>
                     <input type="text" value={addPatientForm.middleName} onChange={(e)=>setAddPatientForm({...addPatientForm, middleName:e.target.value})} className="w-full bg-white dark:bg-[#1F2937] border border-slate-300 dark:border-[#374151] rounded-lg px-4 py-2.5 text-sm text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all" />
                   </div>
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                   <div>
                     <label className="block text-xs font-semibold text-slate-500 dark:text-[#9CA3AF] mb-1.5 ml-1">Mobile #:</label>
                     <input type="text" value={addPatientForm.contact} onChange={(e)=>setAddPatientForm({...addPatientForm, contact:e.target.value})} className="w-full bg-white dark:bg-[#1F2937] border border-slate-300 dark:border-[#374151] rounded-lg px-4 py-2.5 text-sm text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all" />
                   </div>
                   <div>
                     <label className="block text-xs font-semibold text-slate-500 dark:text-[#9CA3AF] mb-1.5 ml-1">Religion:</label>
                     <input type="text" value={addPatientForm.religion} onChange={(e)=>setAddPatientForm({...addPatientForm, religion:e.target.value})} className="w-full bg-white dark:bg-[#1F2937] border border-slate-300 dark:border-[#374151] rounded-lg px-4 py-2.5 text-sm text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all" />
                   </div>
                   <div>
                     <label className="block text-xs font-semibold text-slate-500 dark:text-[#9CA3AF] mb-1.5 ml-1">Email:</label>
                     <input type="email" value={addPatientForm.email} onChange={(e)=>setAddPatientForm({...addPatientForm, email:e.target.value})} className="w-full bg-white dark:bg-[#1F2937] border border-slate-300 dark:border-[#374151] rounded-lg px-4 py-2.5 text-sm text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all" />
                   </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                   <div>
                     <label className="block text-xs font-semibold text-slate-500 dark:text-[#9CA3AF] mb-1.5 ml-1">Birth Date</label>
                     <div className="flex space-x-2">
                       <select value={addPatientForm.birthMonth} onChange={(e)=>setAddPatientForm({...addPatientForm, birthMonth:e.target.value})} className="flex-1 bg-white dark:bg-[#1F2937] border border-slate-300 dark:border-[#374151] rounded-lg px-2 py-2.5 text-sm font-medium text-slate-700 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6]">
                         {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map(m=><option key={m}>{m}</option>)}
                       </select>
                       <select value={addPatientForm.birthDay} onChange={(e)=>setAddPatientForm({...addPatientForm, birthDay:e.target.value})} className="w-20 bg-white dark:bg-[#1F2937] border border-slate-300 dark:border-[#374151] rounded-lg px-2 py-2.5 text-sm font-medium text-slate-700 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6]">
                         {Array.from({length:31}, (_, i) => String(i+1).padStart(2,'0')).map(d=><option key={d}>{d}</option>)}
                       </select>
                       <select value={addPatientForm.birthYear} onChange={(e)=>setAddPatientForm({...addPatientForm, birthYear:e.target.value})} className="w-24 bg-white dark:bg-[#1F2937] border border-slate-300 dark:border-[#374151] rounded-lg px-2 py-2.5 text-sm font-medium text-slate-700 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6]">
                         {Array.from({length:100}, (_, i) => String(new Date().getFullYear()-i)).map(y=><option key={y}>{y}</option>)}
                       </select>
                     </div>
                   </div>
                   <div className="flex space-x-4">
                     <div className="w-20">
                       <label className="block text-xs font-semibold text-slate-500 dark:text-[#9CA3AF] mb-1.5 ml-1">Age:</label>
                       <input type="text" value={addPatientForm.age} onChange={(e)=>setAddPatientForm({...addPatientForm, age:e.target.value})} className="w-full bg-white dark:bg-[#1F2937] border border-slate-300 dark:border-[#374151] rounded-lg px-3 py-2.5 text-sm text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all" />
                     </div>
                     <div className="flex-1">
                       <label className="block text-xs font-semibold text-slate-500 dark:text-[#9CA3AF] mb-1.5 ml-1">Emergency Contact:</label>
                       <input type="text" value={addPatientForm.emergencyContact} onChange={(e)=>setAddPatientForm({...addPatientForm, emergencyContact:e.target.value})} className="w-full bg-white dark:bg-[#1F2937] border border-slate-300 dark:border-[#374151] rounded-lg px-3 py-2.5 text-sm text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all" />
                     </div>
                   </div>
                 </div>

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                    <div className="flex items-center space-x-3">
                       <label className="text-sm font-semibold text-slate-700 dark:text-[#F9FAFB]">Gender:</label>
                       <select value={addPatientForm.gender} onChange={(e)=>setAddPatientForm({...addPatientForm, gender:e.target.value})} className="flex-1 bg-[#E2E6EA] dark:bg-[#374151] border-none rounded-lg px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 cursor-pointer appearance-none">
                         <option>Male</option>
                         <option>Female</option>
                       </select>
                    </div>
                    <div className="flex items-center space-x-3">
                       <label className="text-sm font-semibold text-slate-700 dark:text-[#F9FAFB]">Civil Status:</label>
                       <select value={addPatientForm.civilStatus} onChange={(e)=>setAddPatientForm({...addPatientForm, civilStatus:e.target.value})} className="flex-1 bg-[#E2E6EA] dark:bg-[#374151] border-none rounded-lg px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 cursor-pointer appearance-none">
                         <option>Single</option>
                         <option>Married</option>
                       </select>
                    </div>
                 </div>

                 <div className="space-y-4 mb-6">
                   <div>
                     <label className="block text-xs font-semibold text-slate-500 dark:text-[#9CA3AF] mb-1.5 ml-1">Full Address:</label>
                     <input type="text" value={addPatientForm.address} onChange={(e)=>setAddPatientForm({...addPatientForm, address:e.target.value})} className="w-full bg-white dark:bg-[#1F2937] border border-slate-300 dark:border-[#374151] rounded-lg px-4 py-2.5 text-sm text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all" />
                   </div>
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div>
                       <label className="block text-xs font-semibold text-slate-500 dark:text-[#9CA3AF] mb-1.5 ml-1">City:</label>
                       <input type="text" value={addPatientForm.city} onChange={(e)=>setAddPatientForm({...addPatientForm, city:e.target.value})} className="w-full bg-white dark:bg-[#1F2937] border border-slate-300 dark:border-[#374151] rounded-lg px-4 py-2.5 text-sm text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all" />
                     </div>
                     <div>
                       <label className="block text-xs font-semibold text-slate-500 dark:text-[#9CA3AF] mb-1.5 ml-1">State/Province:</label>
                       <input type="text" value={addPatientForm.province} onChange={(e)=>setAddPatientForm({...addPatientForm, province:e.target.value})} className="w-full bg-white dark:bg-[#1F2937] border border-slate-300 dark:border-[#374151] rounded-lg px-4 py-2.5 text-sm text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all" />
                     </div>
                   </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                   <div>
                     <label className="block text-sm font-semibold text-slate-700 dark:text-[#F9FAFB] mb-2 ml-1">Vitals</label>
                     <div className="flex space-x-3">
                       <input type="text" value={addPatientForm.bloodPressure} onChange={(e)=>setAddPatientForm({...addPatientForm, bloodPressure:e.target.value})} placeholder="Blood Pressure:" className="w-full bg-white dark:bg-[#1F2937] border border-slate-300 dark:border-[#374151] rounded-lg px-3 py-2.5 text-sm text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all" />
                       <input type="text" value={addPatientForm.pulse} onChange={(e)=>setAddPatientForm({...addPatientForm, pulse:e.target.value})} placeholder="Pulse:" className="w-full bg-white dark:bg-[#1F2937] border border-slate-300 dark:border-[#374151] rounded-lg px-3 py-2.5 text-sm text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all" />
                     </div>
                   </div>
                   <div>
                     <label className="block text-sm font-semibold text-slate-700 dark:text-[#F9FAFB] mb-2 ml-1">BMI</label>
                     <div className="flex space-x-3">
                       <input type="text" value={addPatientForm.weight} onChange={(e)=>setAddPatientForm({...addPatientForm, weight:e.target.value})} placeholder="Weight:" className="w-full bg-white dark:bg-[#1F2937] border border-slate-300 dark:border-[#374151] rounded-lg px-3 py-2.5 text-sm text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all" />
                       <input type="text" value={addPatientForm.height} onChange={(e)=>setAddPatientForm({...addPatientForm, height:e.target.value})} placeholder="Height:" className="w-full bg-white dark:bg-[#1F2937] border border-slate-300 dark:border-[#374151] rounded-lg px-3 py-2.5 text-sm text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all" />
                     </div>
                   </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                     <label className="block text-sm font-semibold text-slate-700 dark:text-[#F9FAFB] mb-2 ml-1">Notes:</label>
                     <textarea value={addPatientForm.notes} onChange={(e)=>setAddPatientForm({...addPatientForm, notes:e.target.value})} placeholder="Notes:" className="w-full bg-white dark:bg-[#1F2937] border border-slate-300 dark:border-[#374151] rounded-lg px-3 py-3 text-sm text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all h-20 resize-none"></textarea>
                   </div>
                   <div>
                     <label className="block text-sm font-semibold text-slate-700 dark:text-[#F9FAFB] mb-2 ml-1">Current Medications:</label>
                     <textarea value={addPatientForm.medications} onChange={(e)=>setAddPatientForm({...addPatientForm, medications:e.target.value})} placeholder="Medications:" className="w-full bg-white dark:bg-[#1F2937] border border-slate-300 dark:border-[#374151] rounded-lg px-3 py-3 text-sm text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6] focus:ring-1 focus:ring-[#3B82F6] transition-all h-20 resize-none"></textarea>
                   </div>
                 </div>

              </div>

              <div className="px-8 sm:px-10 pb-8 pt-4 flex items-center space-x-4 border-t border-slate-200 dark:border-[#374151] shrink-0">
                <button type="button" onClick={handleSavePatient} className="bg-[#10B981] hover:bg-[#059669] text-white px-6 py-3 rounded-xl text-sm font-bold shadow-md shadow-[#10B981]/20 transition-colors flex items-center w-auto">
                  Save Patient
                </button>
                <button 
                  type="button"
                  onClick={() => setIsAddPatientModalOpen(false)}
                  className="bg-[#E2E6EA] hover:bg-[#d1d5db] dark:bg-[#374151] dark:hover:bg-[#4B5563] text-slate-700 dark:text-[#F9FAFB] px-6 py-3 rounded-xl text-sm font-bold transition-colors w-auto"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Patient Modal */}
      {viewPatientModalOpen && selectedPatient && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-100 dark:bg-[#111827] w-full max-w-5xl rounded-[24px] shadow-2xl border border-slate-200 dark:border-[#374151] overflow-hidden flex flex-col scale-in-95 duration-200 max-h-[95vh]">
            
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-200 dark:border-[#374151] flex justify-between items-center bg-white dark:bg-[#1F2937]">
              <h2 className="text-2xl font-normal text-slate-800 dark:text-[#F9FAFB] tracking-tight">Patient Overview</h2>
              <div className="flex items-center space-x-4">
                <div className="bg-white dark:bg-[#1F2937] border border-slate-300 dark:border-[#374151] rounded-lg px-4 py-2 text-sm flex items-center">
                  <span className="text-slate-500 mr-2">Resident Code:</span>
                  <span className="font-bold text-slate-800 dark:text-[#F9FAFB]">{selectedPatient.residentId || "00-0000"}</span>
                </div>
                <button onClick={() => setViewPatientModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-[#F9FAFB] transition-colors">
                  <X size={24} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            <div className="p-8 overflow-y-auto flex-1 bg-slate-100 dark:bg-[#111827] flex flex-col lg:flex-row gap-6">
               
               {/* Left Column */}
               <div className="flex flex-col space-y-6 lg:w-[45%] shrink-0">
                  {/* Profile Card */}
                  <div className="bg-white dark:bg-[#1F2937] rounded-[20px] shadow-sm border border-slate-200 dark:border-[#374151] p-6 flex flex-col">
                     <div className="flex flex-col sm:flex-row gap-6 mb-6 items-center sm:items-start">
                        <div className="w-32 h-32 rounded-full border-4 border-slate-50 dark:border-[#374151] overflow-hidden shrink-0 shadow-sm">
                           {selectedPatient.profilePicUrl ? (
                             <img src={selectedPatient.profilePicUrl} alt="Profile" className="w-full h-full object-cover" />
                           ) : (
                             <img src={`https://randomuser.me/api/portraits/${selectedPatient.gender === 'Female' ? 'women' : 'men'}/${(selectedPatient.firstName?.length * 7) % 99 || 1}.jpg`} alt="Profile" className="w-full h-full object-cover" />
                           )}
                        </div>
                        <div className="flex flex-col flex-1 text-center sm:text-left w-full space-y-4 pt-1">
                           <h3 className="text-xl font-bold text-slate-800 dark:text-[#F9FAFB]">{selectedPatient.firstName} {selectedPatient.lastName}</h3>
                           
                           <div className="grid grid-cols-1 gap-y-3">
                              <div>
                                 <p className="text-[11px] font-bold text-[#64748B] dark:text-[#9CA3AF] mb-0.5">Home Address</p>
                                 <p className="text-sm font-semibold text-slate-700 dark:text-[#F9FAFB]">{selectedPatient.address || "N/A"}{selectedPatient.city ? `, ${selectedPatient.city}` : ""}</p>
                              </div>
                              <div>
                                 <p className="text-[11px] font-bold text-[#64748B] dark:text-[#9CA3AF] mb-0.5">Mobile Phone #</p>
                                 <p className="text-sm font-semibold text-slate-700 dark:text-[#F9FAFB]">{selectedPatient.contact || "N/A"}</p>
                              </div>
                              <div className="flex justify-between items-start gap-4 pr-4">
                                <div>
                                   <p className="text-[11px] font-bold text-[#64748B] dark:text-[#9CA3AF] mb-0.5">Contact #</p>
                                   <p className="text-sm font-semibold text-slate-700 dark:text-[#F9FAFB]">{selectedPatient.emergencyContact || "N/A"}</p>
                                </div>
                                <div>
                                   <p className="text-[11px] font-bold text-[#64748B] dark:text-[#9CA3AF] mb-0.5">Email</p>
                                   <p className="text-sm font-semibold text-slate-700 dark:text-[#F9FAFB]">{selectedPatient.email || "N/A"}</p>
                                </div>
                              </div>
                           </div>
                        </div>
                     </div>
                     
                     <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-[#374151]">
                        <div>
                          <p className="text-[11px] font-bold text-[#64748B] dark:text-[#9CA3AF] mb-0.5">Date of Birth</p>
                          <p className="text-base font-bold text-slate-800 dark:text-[#F9FAFB]">{selectedPatient.birthMonth ? `${selectedPatient.birthMonth.substring(0, 3)} ${selectedPatient.birthDay}, ${selectedPatient.birthYear}` : "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-[#64748B] dark:text-[#9CA3AF] mb-0.5">Age</p>
                          <p className="text-base font-bold text-slate-800 dark:text-[#F9FAFB]">{selectedPatient.age || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-[#64748B] dark:text-[#9CA3AF] mb-0.5">Weight</p>
                          <p className="text-base font-bold text-slate-800 dark:text-[#F9FAFB]">{selectedPatient.weight || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-[#64748B] dark:text-[#9CA3AF] mb-0.5">Height</p>
                          <p className="text-base font-bold text-slate-800 dark:text-[#F9FAFB]">{selectedPatient.height || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-[#64748B] dark:text-[#9CA3AF] mb-0.5">Gender</p>
                          <p className="text-base font-bold text-slate-800 dark:text-[#F9FAFB]">{selectedPatient.gender || "N/A"}</p>
                        </div>
                     </div>
                  </div>
                  
                  {/* Notes */}
                  <div className="bg-white dark:bg-[#1F2937] rounded-[20px] shadow-sm border border-slate-200 dark:border-[#374151] p-0 flex flex-col flex-1 min-h-[180px]">
                     <div className="px-5 py-4 border-b border-slate-100 dark:border-[#374151] flex justify-between items-center">
                        <div className="flex items-center">
                           <h4 className="text-sm font-medium text-slate-700 dark:text-[#F9FAFB]">Notes</h4>
                           {isEditingNotes && <span className="ml-3 text-sm text-slate-400">Editing...</span>}
                        </div>
                        <button onClick={() => setIsEditingNotes(!isEditingNotes)} className="text-[#06b6d4] hover:text-[#0891b2] transition-colors">
                           <Plus size={20} className="border border-[#06b6d4] rounded-full p-0.5" />
                        </button>
                     </div>
                     <div className="p-3 flex-1 flex flex-col space-y-1 overflow-y-auto">
                        {(selectedPatient.notesList || []).map((note: any, idx: number) => (
                           <div key={idx} className="flex justify-between items-start px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-[#374151] rounded-lg group transition-colors">
                             <div className="flex flex-col flex-1 pr-4">
                               <p className="text-[11px] text-slate-500 mb-1">{note.date}</p>
                               <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{note.text}</p>
                             </div>
                             {isEditingNotes && (
                               <button 
                                 onClick={async () => {
                                    const updated = (selectedPatient.notesList || []).filter((_: any, i: number) => i !== idx);
                                    await updateDoc(doc(db, "residents", selectedPatient.id), { notesList: updated });
                                    setSelectedPatient({ ...selectedPatient, notesList: updated });
                                 }}
                                 className="bg-[#D9534F] hover:bg-[#C9302C] text-white px-3 py-1 rounded-md text-xs transition-colors shrink-0 mt-1"
                               >
                                 Delete
                               </button>
                             )}
                           </div>
                        ))}
                        {isEditingNotes && (
                           <div className="px-3 py-2.5 mt-1">
                              <button 
                                onClick={async () => {
                                  const newNote = prompt("Enter new note:");
                                  if (newNote) {
                                    const noteObj = { date: new Date().toLocaleDateString('en-US', {month:'2-digit', day:'2-digit', year:'numeric'}), text: newNote };
                                    const updated = [noteObj, ...(selectedPatient.notesList || [])];
                                    await updateDoc(doc(db, "residents", selectedPatient.id), { notesList: updated, hasMedicalRecord: true });
                                    setSelectedPatient({ ...selectedPatient, notesList: updated, hasMedicalRecord: true });
                                  }
                                }}
                                className="flex items-center w-max bg-slate-100 dark:bg-[#374151] text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-[#4B5563] px-3 py-1.5 rounded-lg text-sm hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                              >
                                 <Plus size={16} className="text-[#06b6d4] mr-2" strokeWidth={3} />
                                 [Add Note]
                              </button>
                           </div>
                        )}
                     </div>
                  </div>
               </div>

               {/* Right Column */}
               <div className="flex flex-col space-y-6 flex-1">
                  
                  {/* Current Medications */}
                  <div className="bg-white dark:bg-[#1F2937] rounded-[20px] shadow-sm border border-slate-200 dark:border-[#374151] p-0 flex flex-col">
                     <div className="px-5 py-4 border-b border-slate-100 dark:border-[#374151] flex justify-between items-center">
                        <div className="flex items-center">
                           <h4 className="text-sm font-normal text-slate-800 dark:text-[#F9FAFB]">Current Medications</h4>
                           {isEditingMedications && <span className="ml-3 text-sm text-slate-400">Editing...</span>}
                        </div>
                        <button onClick={() => setIsEditingMedications(!isEditingMedications)} className="text-[#06b6d4] hover:text-[#0891b2] transition-colors">
                           <Plus size={20} className="border border-[#06b6d4] rounded-full p-0.5" />
                        </button>
                     </div>
                     <div className="p-3 flex flex-col space-y-1">
                        {(selectedPatient.medicationsList || []).map((med: string, idx: number) => (
                          <div key={idx} className="flex justify-between items-center px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-[#374151] rounded-lg group transition-colors">
                            <div className="flex items-center text-sm font-normal text-slate-700 dark:text-slate-300">
                               <Pill size={18} className="text-[#06b6d4] mr-3" strokeWidth={2} />
                               {med}
                            </div>
                            {isEditingMedications && (
                               <button 
                                 onClick={async () => {
                                    const updated = (selectedPatient.medicationsList || []).filter((_: any, i: number) => i !== idx);
                                    await updateDoc(doc(db, "residents", selectedPatient.id), { medicationsList: updated });
                                    setSelectedPatient({ ...selectedPatient, medicationsList: updated });
                                 }}
                                 className="bg-[#D9534F] hover:bg-[#C9302C] text-white px-3 py-1 rounded-md text-xs transition-colors"
                               >
                                 Delete
                               </button>
                            )}
                          </div>
                        ))}
                        {isEditingMedications && (
                           <div className="px-3 py-2.5 mt-1">
                              <button 
                                onClick={async () => {
                                  const newMed = prompt("Enter medication name:");
                                  if (newMed) {
                                    const updated = [...(selectedPatient.medicationsList || []), newMed];
                                    await updateDoc(doc(db, "residents", selectedPatient.id), { medicationsList: updated, hasMedicalRecord: true });
                                    setSelectedPatient({ ...selectedPatient, medicationsList: updated, hasMedicalRecord: true });
                                  }
                                }}
                                className="flex items-center w-max bg-slate-100 dark:bg-[#374151] text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-[#4B5563] px-3 py-1.5 rounded-lg text-sm hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                              >
                                 <Pill size={18} className="text-[#06b6d4] mr-3" strokeWidth={2} />
                                 [Add Medications]
                              </button>
                           </div>
                        )}
                     </div>
                  </div>

                  {/* Vitals */}
                  <div className="bg-white dark:bg-[#1F2937] rounded-[20px] shadow-sm border border-slate-200 dark:border-[#374151] p-0 flex flex-col">
                     <div className="px-5 py-4 border-b border-slate-100 dark:border-[#374151]">
                        <h4 className="text-sm font-medium text-slate-700 dark:text-[#F9FAFB]">Vitals</h4>
                     </div>
                     <div className="p-6 flex flex-col">
                        <div className="flex justify-center mb-6">
                           <Heart size={40} className="text-[#06b6d4]" strokeWidth={1.5} />
                        </div>
                        <div className="flex justify-around items-center">
                           <div className="text-center">
                              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Blood Pressure</p>
                              <p className="text-3xl font-normal text-slate-800 dark:text-[#F9FAFB]">{selectedPatient.bloodPressure || "—"}</p>
                           </div>
                           <div className="text-center">
                              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Pulse</p>
                              <p className="text-3xl font-normal text-slate-800 dark:text-[#F9FAFB]">{selectedPatient.pulse || "—"} <span className="text-sm text-slate-500 font-bold uppercase tracking-wider">bpm</span></p>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Lab Results */}
                  <div className="bg-white dark:bg-[#1F2937] rounded-[20px] shadow-sm border border-slate-200 dark:border-[#374151] p-0 flex flex-col flex-1">
                     <div className="px-5 py-4 border-b border-slate-100 dark:border-[#374151] flex justify-between items-center">
                        <div className="flex items-center">
                           <h4 className="text-sm font-medium text-slate-700 dark:text-[#F9FAFB]">Lab results</h4>
                           {isEditingLabs && <span className="ml-3 text-sm text-slate-400">Editing...</span>}
                        </div>
                        <button onClick={() => setIsEditingLabs(!isEditingLabs)} className="text-[#06b6d4] hover:text-[#0891b2] transition-colors">
                           <Plus size={20} className="border border-[#06b6d4] rounded-full p-0.5" />
                        </button>
                     </div>
                     <div className="p-3 flex flex-col space-y-1 overflow-y-auto max-h-[160px]">
                        {(selectedPatient.labsList || []).map((lab: any, idx: number) => (
                           <div key={idx} className="flex justify-between items-center px-4 py-3 hover:bg-slate-50 dark:hover:bg-[#374151] rounded-lg transition-colors cursor-pointer group">
                              <div className="flex items-center text-xs font-medium text-slate-600 dark:text-slate-300">
                                 <FileText size={16} className="text-[#10b981] mr-4" strokeWidth={2} />
                                 {lab.name}
                              </div>
                              <div className="flex items-center space-x-4">
                                <span className="text-xs text-slate-400 dark:text-slate-500">{lab.date}</span>
                                {isEditingLabs && (
                                   <button 
                                     onClick={async (e) => { 
                                       e.stopPropagation(); 
                                       const updated = (selectedPatient.labsList || []).filter((_: any, i: number) => i !== idx);
                                       await updateDoc(doc(db, "residents", selectedPatient.id), { labsList: updated });
                                       setSelectedPatient({ ...selectedPatient, labsList: updated });
                                     }}
                                     className="bg-[#D9534F] hover:bg-[#C9302C] text-white px-3 py-1 rounded-md text-xs transition-colors"
                                   >
                                     Delete
                                   </button>
                                )}
                              </div>
                           </div>
                        ))}
                        {isEditingLabs && (
                           <div className="px-4 py-2 mt-1">
                              <button 
                                onClick={async () => {
                                  const newLab = prompt("Enter lab result name:");
                                  if (newLab) {
                                    const labObj = { name: newLab, date: new Date().toLocaleDateString('en-US', {month:'2-digit', day:'2-digit', year:'numeric'}) };
                                    const updated = [labObj, ...(selectedPatient.labsList || [])];
                                    await updateDoc(doc(db, "residents", selectedPatient.id), { labsList: updated, hasMedicalRecord: true });
                                    setSelectedPatient({ ...selectedPatient, labsList: updated, hasMedicalRecord: true });
                                  }
                                }}
                                className="flex items-center w-max bg-slate-100 dark:bg-[#374151] text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-[#4B5563] px-3 py-1.5 rounded-lg text-sm hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                              >
                                 <Plus size={16} className="text-[#10b981] mr-2" strokeWidth={3} />
                                 [Add Lab Result]
                              </button>
                           </div>
                        )}
                     </div>
                  </div>

               </div>
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
                       <img src={selectedDoctor.image?.includes('data:image') || selectedDoctor.image?.includes('http') ? selectedDoctor.image : `https://randomuser.me/api/portraits/${selectedDoctor.image}`} alt={selectedDoctor.name} className="w-full h-full object-cover rounded-full" />
                    </div>
                    <h3 className="font-black text-lg text-slate-800 dark:text-[#F9FAFB] text-center leading-tight">{selectedDoctor.name}</h3>
                  </div>

                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-2 content-start pt-2">
                     <div>
                       <span className="text-[11px] font-bold text-[#3B82F6] dark:text-[#60A5FA] uppercase tracking-wider mb-1 flex items-center justify-between">
                         Specialty
                         <button onClick={() => {
                           setTempSpecialties(selectedDoctor.specialty ? selectedDoctor.specialty.split(",").map((s: string) => s.trim()) : []);
                           setIsEditSpecialtyOpen(true);
                         }} className="text-[#0ea5e9] hover:text-[#0284c7]"><Plus size={14} /></button>
                       </span>
                       <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{selectedDoctor.specialty || "N/A"}</span>
                     </div>
                     <div>
                       <span className="text-[11px] font-bold text-[#3B82F6] dark:text-[#60A5FA] uppercase tracking-wider block mb-1">Hospital</span>
                       <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{selectedDoctor.hospital || "SmartBarangay Medical Center"}</span>
                     </div>
                     <div>
                       <span className="text-[11px] font-bold text-[#3B82F6] dark:text-[#60A5FA] uppercase tracking-wider block mb-1">Experience</span>
                       <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{selectedDoctor.experience || "7 Years"}</span>
                     </div>
                     <div>
                       <span className="text-[11px] font-bold text-[#3B82F6] dark:text-[#60A5FA] uppercase tracking-wider block mb-1">Languages</span>
                       <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{selectedDoctor.language || "English"}</span>
                     </div>
                     <div>
                       <span className="text-[11px] font-bold text-[#3B82F6] dark:text-[#60A5FA] uppercase tracking-wider block mb-1">Contact #</span>
                       <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{selectedDoctor.contact || "N/A"}</span>
                     </div>
                     <div>
                       <span className="text-[11px] font-bold text-[#3B82F6] dark:text-[#60A5FA] uppercase tracking-wider block mb-1">Gender</span>
                       <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{selectedDoctor.gender || "Male"}</span>
                     </div>
                     <div>
                       <span className="text-[11px] font-bold text-[#3B82F6] dark:text-[#60A5FA] uppercase tracking-wider block mb-1">Email</span>
                       <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate w-32 md:w-full inline-block">{selectedDoctor.email || "N/A"}</span>
                     </div>
                  </div>
               </div>

               {/* Stats & Appointments Table */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 
                 <div className="border border-slate-200 dark:border-[#374151] rounded-2xl p-4 flex flex-col bg-white dark:bg-[#111827]">
                    <h4 className="text-xs font-black text-slate-800 dark:text-[#F9FAFB] uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-[#374151] pb-2">Specialty</h4>
                    <div className="flex flex-col space-y-3 mt-1 pl-2">
                       {selectedDoctor.specialty?.split(', ').filter(Boolean).map((spec: string, idx: number) => (
                         <div key={idx} className="flex items-center space-x-3 text-sm font-bold text-slate-700 dark:text-slate-300">
                           <div className="w-2.5 h-2.5 rounded-full bg-[#38bdf8] shadow-[0_0_0_2px_rgba(56,189,248,0.2)]"></div>
                           <span>{spec}</span>
                         </div>
                       ))}
                       {(!selectedDoctor.specialty || selectedDoctor.specialty.trim() === "") && (
                         <span className="text-sm font-bold text-slate-400">No specialties listed.</span>
                       )}
                    </div>
                    <button onClick={() => setIsEditSpecialtyOpen(true)} className="mt-5 bg-[#38bdf8]/20 text-[#0284c7] dark:text-[#38bdf8] hover:bg-[#38bdf8]/30 py-1.5 px-4 rounded-lg text-xs font-black transition-colors w-max mx-auto">Edit</button>
                 </div>

                 <div className="border border-slate-200 dark:border-[#374151] rounded-2xl p-4 flex flex-col bg-white dark:bg-[#111827]">
                    <h4 className="text-xs font-black text-slate-800 dark:text-[#F9FAFB] uppercase tracking-wider mb-3 border-b border-slate-100 dark:border-[#374151] pb-2">Appointments</h4>
                    <div className="flex flex-col space-y-3 mt-1 flex-1 overflow-y-auto max-h-32 pr-1">
                      {appointments.filter(app => app.doctorId === selectedDoctor.id || app.doctorName === selectedDoctor.name || app.doctor === selectedDoctor.name).map(app => (
                        <div key={app.id} className="flex justify-between items-center text-sm">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-700 dark:text-[#F9FAFB] text-[11px] flex items-center"><ChevronRight size={12} className="mr-1 text-[#38bdf8]" /> {app.date}</span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-4 font-semibold">{app.time}</span>
                          </div>
                          <button onClick={() => { setSelectedAppointment(app); setIsEditAppointmentModalOpen(true); }} className="bg-[#10B981]/20 text-[#059669] hover:bg-[#10B981]/30 py-1 px-3 rounded-lg text-[10px] font-black transition-colors">Edit</button>
                        </div>
                      ))}
                      {appointments.filter(app => app.doctorId === selectedDoctor.id || app.doctorName === selectedDoctor.name || app.doctor === selectedDoctor.name).length === 0 && (
                        <span className="text-xs font-bold text-slate-400 mt-2">No appointments scheduled.</span>
                      )}
                    </div>
                 </div>

                 <div className="border border-slate-200 dark:border-[#374151] rounded-2xl p-4 flex flex-col bg-white dark:bg-[#111827]">
                    <h4 className="text-xs font-black text-slate-800 dark:text-[#F9FAFB] uppercase tracking-wider mb-3 border-b border-slate-100 dark:border-[#374151] pb-2">Availability</h4>
                    <div className="flex flex-col space-y-2 mt-1 flex-1">
                      {(selectedDoctor.availabilities || []).map((avail: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-[11px] font-bold">
                           <span className="text-slate-600 dark:text-[#9CA3AF]">{avail.day}</span>
                           <span className="text-slate-800 dark:text-[#F9FAFB]">{avail.startTime} - {avail.endTime}</span>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => {
                      setTempAvailabilities(selectedDoctor.availabilities || []);
                      setIsEditAvailabilityOpen(true);
                    }} className="mt-3 bg-[#38bdf8]/20 text-[#0284c7] dark:text-[#38bdf8] hover:bg-[#38bdf8]/30 py-1.5 px-4 rounded-lg text-xs font-black transition-colors w-max mx-auto">Edit</button>
                 </div>

               </div>

            </div>

            <div className="px-8 py-5 border-t border-slate-200 dark:border-[#374151] flex justify-between items-center bg-slate-50 dark:bg-[#111827]">
              <button 
                onClick={() => setIsMakeAppointmentModalOpen(true)}
                className="bg-[#10B981] hover:bg-[#059669] text-white px-10 py-3 rounded-2xl text-sm font-bold shadow-md shadow-[#10B981]/20 transition-all transform hover:-translate-y-0.5 min-w-[140px]"
              >
                Make an Appointment
              </button>
              <button onClick={() => setDeleteModal({ isOpen: true, type: "Doctor Profile", id: selectedDoctor.id, collection: "doctors" })} className="bg-[#EF4444] hover:bg-[#DC2626] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-[#EF4444]/20 transition-colors flex items-center">
                <Trash2 size={16} className="mr-2" strokeWidth={2.5} /> Delete Profile
              </button>
            </div>

          </div>
        </div>
      )}
      
      {/* Make Appointment Modal */}
      {isMakeAppointmentModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#111827] w-full max-w-[650px] rounded-[24px] shadow-2xl overflow-hidden flex flex-col scale-in-95 duration-200 border border-slate-200 dark:border-[#374151]">
            <div className="px-6 py-4 flex justify-between items-center border-b border-slate-200 dark:border-[#374151]">
              <h2 className="text-[15px] font-bold text-slate-700 dark:text-[#F9FAFB]">Make an Appointment</h2>
              <button onClick={() => setIsMakeAppointmentModalOpen(false)} className="text-slate-600 dark:text-[#F9FAFB] hover:text-slate-800 font-semibold text-[13px] flex items-center transition-colors">
                 Back <ChevronRight size={16} className="ml-1" />
              </button>
            </div>
            
            <div className="p-8 bg-slate-50 dark:bg-[#1F2937] flex flex-col gap-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Availability */}
                <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#374151] rounded-xl shadow-sm">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-[#374151]">
                     <h3 className="text-[13px] font-semibold text-slate-700 dark:text-[#F9FAFB]">Availability</h3>
                  </div>
                  <div className="p-4 flex flex-col space-y-3">
                     <div className="flex justify-between text-[11px] font-semibold">
                        <span className="text-slate-600 dark:text-[#9CA3AF]">Monday</span>
                        <span className="text-slate-700 dark:text-slate-300">9:00 am - 1:00 pm</span>
                     </div>
                     <div className="flex justify-between text-[11px] font-semibold">
                        <span className="text-slate-600 dark:text-[#9CA3AF]">Tuesday</span>
                        <span className="text-slate-700 dark:text-slate-300">9:00 am - 11:00 am</span>
                     </div>
                     <div className="flex justify-between text-[11px] font-semibold">
                        <span className="text-slate-600 dark:text-[#9CA3AF]">Thursday</span>
                        <span className="text-slate-700 dark:text-slate-300">10:00 am - 1:00 pm</span>
                     </div>
                  </div>
                </div>
                
                {/* Appointed */}
                <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#374151] rounded-xl shadow-sm">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-[#374151]">
                     <h3 className="text-[13px] font-semibold text-slate-700 dark:text-[#F9FAFB]">Appointed</h3>
                  </div>
                  <div className="p-4 flex flex-col space-y-3">
                     <div className="flex justify-between text-[11px] font-semibold">
                        <span className="text-slate-600 dark:text-[#9CA3AF]">April 20, 2026</span>
                        <span className="text-slate-700 dark:text-slate-300">9:30 am - 10:30 am</span>
                     </div>
                     <div className="flex justify-between text-[11px] font-semibold">
                        <span className="text-slate-600 dark:text-[#9CA3AF]">April 30, 2026</span>
                        <span className="text-slate-700 dark:text-slate-300">11:00 am - 12:00 pm</span>
                     </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#EBEBEB] dark:bg-[#374151] rounded-lg p-3">
                  <label className="block text-[13px] font-semibold text-[#00C4CC] dark:text-[#38bdf8] mb-1">Date</label>
                  <input type="text" placeholder="Apr 20, 2026" value={makeAppointmentForm.date} onChange={e => setMakeAppointmentForm({...makeAppointmentForm, date: e.target.value})} className="w-full bg-transparent border-none text-[15px] font-semibold text-slate-800 dark:text-[#F9FAFB] focus:outline-none" />
                </div>
                <div className="bg-[#EBEBEB] dark:bg-[#374151] rounded-lg p-3 border-b-2 border-[#00C4CC] dark:border-[#38bdf8]">
                  <label className="block text-[13px] font-semibold text-[#00C4CC] dark:text-[#38bdf8] mb-1">Time</label>
                  <input type="text" placeholder="9:30 am - 10:30 am" value={makeAppointmentForm.time} onChange={e => setMakeAppointmentForm({...makeAppointmentForm, time: e.target.value})} className="w-full bg-transparent border-none text-[15px] font-semibold text-slate-800 dark:text-[#F9FAFB] focus:outline-none" />
                </div>
              </div>
              
              <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#374151] rounded-xl shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-[#374151]">
                   <h3 className="text-[13px] font-semibold text-slate-700 dark:text-[#F9FAFB]">Purpose of Appointment</h3>
                </div>
                <textarea 
                  value={makeAppointmentForm.purpose} onChange={e => setMakeAppointmentForm({...makeAppointmentForm, purpose: e.target.value})}
                  placeholder="[Type here]" 
                  className="w-full h-32 p-4 text-[13px] text-slate-600 dark:text-slate-300 bg-transparent border-none focus:outline-none resize-none"
                ></textarea>
              </div>

            </div>
            
            <div className="py-6 flex justify-center space-x-6 bg-slate-50 dark:bg-[#1F2937]">
              <button 
                onClick={handleMakeAppointment}
                className="bg-[#5FB59C] hover:bg-[#4ea088] text-white px-10 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-[#5FB59C]/20 transition-colors w-36"
              >
                Confirm
              </button>
              <button 
                onClick={() => setIsMakeAppointmentModalOpen(false)}
                className="bg-[#858585] hover:bg-[#737373] text-white px-10 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-[#858585]/20 transition-colors w-36"
              >
                Cancel
              </button>
            </div>
            
          </div>
        </div>
      )}
      
      {/* Appointment Success Notification */}
      {showAppointmentSuccess && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#F8F9FA] dark:bg-[#111827] w-full max-w-[400px] rounded-[24px] shadow-2xl border-2 border-slate-300 dark:border-slate-600 overflow-hidden flex flex-col items-center p-10 text-center scale-in-95 duration-200">
            <div className="w-[100px] h-[100px] bg-[#5FB59C] rounded-full flex items-center justify-center mb-6">
              <Check size={50} className="text-[#1E293B]" strokeWidth={4} />
            </div>
            <h2 className="text-[22px] font-black text-slate-800 dark:text-[#F9FAFB] mb-2 tracking-tight">Appointment Approved</h2>
            <p className="text-slate-600 dark:text-[#9CA3AF] text-[13px] mb-8 font-medium px-4 leading-relaxed">
              Appointment has been<br/>approved
            </p>
            <button 
              onClick={() => setShowAppointmentSuccess(false)}
              className="bg-[#5FB59C] hover:bg-[#4ea088] text-white px-12 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Add Doctor Modal */}
      {isAddDoctorModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#111827] w-full max-w-[700px] rounded-[24px] shadow-2xl overflow-hidden flex flex-col scale-in-95 duration-200 border border-slate-200 dark:border-[#374151] max-h-[90vh]">
            <div className="px-6 py-4 flex justify-between items-center border-b border-slate-200 dark:border-[#374151] sticky top-0 bg-white dark:bg-[#111827] z-10">
              <h2 className="text-[17px] font-bold text-slate-800 dark:text-[#F9FAFB]">Add Doctor Profile</h2>
              <button onClick={() => setIsAddDoctorModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto bg-slate-50 dark:bg-[#1F2937] flex-1">
              <div className="flex flex-col md:flex-row gap-6 mb-6">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 content-start">
                   <div>
                     <label className="block text-xs font-semibold text-slate-500 dark:text-[#9CA3AF] mb-1.5 ml-1">Last Name:</label>
                     <input type="text" value={addDoctorForm.lastName} onChange={e => setAddDoctorForm({...addDoctorForm, lastName: e.target.value})} className="w-full bg-white dark:bg-[#111827] border border-slate-300 dark:border-[#374151] rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6]" />
                   </div>
                   <div>
                     <label className="block text-xs font-semibold text-slate-500 dark:text-[#9CA3AF] mb-1.5 ml-1">First Name:</label>
                     <input type="text" value={addDoctorForm.firstName} onChange={e => setAddDoctorForm({...addDoctorForm, firstName: e.target.value})} className="w-full bg-white dark:bg-[#111827] border border-slate-300 dark:border-[#374151] rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6]" />
                   </div>
                   <div>
                     <label className="block text-xs font-semibold text-slate-500 dark:text-[#9CA3AF] mb-1.5 ml-1">Middle Name:</label>
                     <input type="text" value={addDoctorForm.middleName} onChange={e => setAddDoctorForm({...addDoctorForm, middleName: e.target.value})} className="w-full bg-white dark:bg-[#111827] border border-slate-300 dark:border-[#374151] rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6]" />
                   </div>
                   <div className="sm:col-span-1">
                     <label className="block text-xs font-semibold text-slate-500 dark:text-[#9CA3AF] mb-1.5 ml-1">Contact #:</label>
                     <input type="text" value={addDoctorForm.contact} onChange={e => setAddDoctorForm({...addDoctorForm, contact: e.target.value})} className="w-full bg-white dark:bg-[#111827] border border-slate-300 dark:border-[#374151] rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6]" />
                   </div>
                   <div className="sm:col-span-2">
                     <label className="block text-xs font-semibold text-slate-500 dark:text-[#9CA3AF] mb-1.5 ml-1">Email:</label>
                     <input type="email" value={addDoctorForm.email} onChange={e => setAddDoctorForm({...addDoctorForm, email: e.target.value})} className="w-full bg-white dark:bg-[#111827] border border-slate-300 dark:border-[#374151] rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6]" />
                   </div>
                </div>
                
                <input type="file" ref={doctorPicRef} onChange={handleDoctorPicChange} accept="image/*" className="hidden" />
                <div onClick={() => doctorPicRef.current?.click()} className="w-[120px] h-[120px] bg-white dark:bg-[#111827] border-2 border-slate-200 dark:border-[#374151] rounded-xl flex items-center justify-center shrink-0 shadow-sm relative group cursor-pointer ml-auto overflow-hidden">
                   {doctorPicPreview ? (
                     <img src={doctorPicPreview} alt="Preview" className="w-full h-full object-cover" />
                   ) : (
                     <User size={50} className="text-slate-300 dark:text-slate-600" strokeWidth={1.5} />
                   )}
                   <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center rounded-xl backdrop-blur-[1px]">
                     <span className="text-white text-[10px] font-bold">Upload</span>
                   </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 mb-6">
                 <label className="text-sm font-semibold text-slate-700 dark:text-[#F9FAFB]">Gender:</label>
                 <select value={addDoctorForm.gender} onChange={e => setAddDoctorForm({...addDoctorForm, gender: e.target.value})} className="bg-white dark:bg-[#111827] border border-slate-300 dark:border-[#374151] rounded-lg px-3 py-1.5 text-sm font-bold text-slate-700 dark:text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 w-32">
                   <option>Male</option>
                   <option>Female</option>
                 </select>
              </div>

              <div className="mb-6">
                 <label className="block text-sm font-semibold text-slate-700 dark:text-[#F9FAFB] mb-2 ml-1">Specialties</label>
                 <div className="flex flex-col space-y-3">
                    {addDoctorSpecialties.map((spec, index) => (
                      <div key={index} className="flex space-x-3 items-center">
                        <input 
                          type="text" 
                          placeholder={`Specialty ${index + 1}`} 
                          value={spec} 
                          onChange={e => {
                            const newSpecs = [...addDoctorSpecialties];
                            newSpecs[index] = e.target.value;
                            setAddDoctorSpecialties(newSpecs);
                          }} 
                          className="w-48 bg-white dark:bg-[#111827] border border-slate-300 dark:border-[#374151] rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6]" 
                        />
                        {index === addDoctorSpecialties.length - 1 ? (
                          <button onClick={() => setAddDoctorSpecialties([...addDoctorSpecialties, ""])} className="text-[#06b6d4] hover:text-[#0891b2] transition-colors">
                            <Plus size={24} strokeWidth={2} className="border-2 border-[#06b6d4] rounded-full p-0.5" />
                          </button>
                        ) : (
                          <button onClick={() => {
                            const newSpecs = [...addDoctorSpecialties];
                            newSpecs.splice(index, 1);
                            setAddDoctorSpecialties(newSpecs);
                          }} className="text-[#EF4444] hover:text-[#DC2626] transition-colors">
                            <X size={24} strokeWidth={2} className="border-2 border-[#EF4444] rounded-full p-0.5" />
                          </button>
                        )}
                      </div>
                    ))}
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                 <div>
                   <label className="block text-sm font-semibold text-slate-700 dark:text-[#F9FAFB] mb-2 ml-1">Languages</label>
                   <input type="text" placeholder="Languages" value={addDoctorForm.language} onChange={e => setAddDoctorForm({...addDoctorForm, language: e.target.value})} className="w-full bg-white dark:bg-[#111827] border border-slate-300 dark:border-[#374151] rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6]" />
                 </div>
                 <div>
                   <label className="block text-sm font-semibold text-slate-700 dark:text-[#F9FAFB] mb-2 ml-1">Experience</label>
                   <input type="text" placeholder="7 Years" value={addDoctorForm.experience} onChange={e => setAddDoctorForm({...addDoctorForm, experience: e.target.value})} className="w-full bg-white dark:bg-[#111827] border border-slate-300 dark:border-[#374151] rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6]" />
                 </div>
                 <div>
                   <label className="block text-sm font-semibold text-slate-700 dark:text-[#F9FAFB] mb-2 ml-1">Hospital</label>
                   <input type="text" placeholder="SmartBarangay Medical Center" value={addDoctorForm.hospital} onChange={e => setAddDoctorForm({...addDoctorForm, hospital: e.target.value})} className="w-full bg-white dark:bg-[#111827] border border-slate-300 dark:border-[#374151] rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6]" />
                 </div>
              </div>

              <div className="mb-2">
                 <label className="block text-sm font-semibold text-slate-700 dark:text-[#F9FAFB] mb-2 ml-1">Availability</label>
                 <div className="flex flex-col space-y-3">
                    {addDoctorAvailabilities.map((avail, index) => (
                      <div key={index} className="flex space-x-3 items-center">
                        <input type="text" placeholder="Day" value={avail.day} onChange={e => { const newAvails = [...addDoctorAvailabilities]; newAvails[index].day = e.target.value; setAddDoctorAvailabilities(newAvails); }} className="w-24 bg-white dark:bg-[#111827] border border-slate-300 dark:border-[#374151] rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6]" />
                        <input type="text" placeholder="Start" value={avail.startTime} onChange={e => { const newAvails = [...addDoctorAvailabilities]; newAvails[index].startTime = e.target.value; setAddDoctorAvailabilities(newAvails); }} className="w-24 bg-white dark:bg-[#111827] border border-slate-300 dark:border-[#374151] rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6]" />
                        <span className="text-xs font-bold text-slate-500">To</span>
                        <input type="text" placeholder="End" value={avail.endTime} onChange={e => { const newAvails = [...addDoctorAvailabilities]; newAvails[index].endTime = e.target.value; setAddDoctorAvailabilities(newAvails); }} className="w-24 bg-white dark:bg-[#111827] border border-slate-300 dark:border-[#374151] rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6]" />
                        {index === addDoctorAvailabilities.length - 1 ? (
                          <button onClick={() => setAddDoctorAvailabilities([...addDoctorAvailabilities, { day: "", startTime: "", endTime: "" }])} className="text-[#06b6d4] hover:text-[#0891b2] transition-colors ml-2">
                            <Plus size={24} strokeWidth={2} className="border-2 border-[#06b6d4] rounded-full p-0.5" />
                          </button>
                        ) : (
                          <button onClick={() => {
                            const newAvails = [...addDoctorAvailabilities];
                            newAvails.splice(index, 1);
                            setAddDoctorAvailabilities(newAvails);
                          }} className="text-[#EF4444] hover:text-[#DC2626] transition-colors ml-2">
                            <X size={24} strokeWidth={2} className="border-2 border-[#EF4444] rounded-full p-0.5" />
                          </button>
                        )}
                      </div>
                    ))}
                 </div>
              </div>

            </div>
            
            <div className="py-5 flex justify-center space-x-6 bg-white dark:bg-[#111827] border-t border-slate-200 dark:border-[#374151]">
              <button 
                onClick={handleAddDoctor}
                className="bg-[#5FB59C] hover:bg-[#4ea088] text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-[#5FB59C]/20 transition-colors min-w-[140px]"
              >
                Add Doctor
              </button>
              <button 
                onClick={() => setIsAddDoctorModalOpen(false)}
                className="bg-[#EBEBEB] dark:bg-[#374151] hover:bg-[#D4D4D4] dark:hover:bg-[#4B5563] text-slate-700 dark:text-[#F9FAFB] px-8 py-2.5 rounded-xl text-sm font-bold transition-colors min-w-[140px]"
              >
                Cancel
              </button>
            </div>
            
          </div>
        </div>
      )}

      {/* Add Doctor Success Notification */}
      {showAddDoctorSuccess && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#F8F9FA] dark:bg-[#111827] w-full max-w-[400px] rounded-[24px] shadow-2xl border-2 border-slate-300 dark:border-slate-600 overflow-hidden flex flex-col items-center p-10 text-center scale-in-95 duration-200">
            <div className="w-[100px] h-[100px] bg-[#5FB59C] rounded-full flex items-center justify-center mb-6">
              <Check size={50} className="text-[#1E293B]" strokeWidth={4} />
            </div>
            <h2 className="text-[22px] font-black text-slate-800 dark:text-[#F9FAFB] mb-2 tracking-tight">Doctor Added!</h2>
            <p className="text-slate-600 dark:text-[#9CA3AF] text-[13px] mb-8 font-medium px-4 leading-relaxed">
              New doctor profile has been successfully created.
            </p>
            <button 
              onClick={confirmAddDoctor}
              className="bg-[#5FB59C] hover:bg-[#4ea088] text-white px-12 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Universal Delete Warning Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#F8F9FA] dark:bg-[#111827] w-full max-w-[400px] rounded-[24px] shadow-2xl border-2 border-slate-300 dark:border-slate-600 overflow-hidden flex flex-col items-center p-10 text-center scale-in-95 duration-200">
            <div className="w-[100px] h-[100px] flex items-center justify-center mb-4">
              <AlertTriangle size={80} strokeWidth={2.5} className="text-[#A50000]" />
            </div>
            <h2 className="text-[20px] font-black text-slate-800 dark:text-[#F9FAFB] mb-4 tracking-tight">Delete {deleteModal.type}?</h2>
            <p className="text-slate-700 dark:text-[#D1D5DB] text-[14px] mb-8 font-medium px-2 leading-relaxed">
              You are going to delete this {deleteModal.type?.toLowerCase()}.<br/>Are you sure?
            </p>
            <div className="flex space-x-4">
              <button 
                onClick={async () => {
                  if (deleteModal.id && deleteModal.collection) {
                    try {
                      const docRef = doc(db, deleteModal.collection, deleteModal.id);
                      if (deleteModal.type === "Patient Record") {
                        await updateDoc(docRef, {
                          bloodPressure: null,
                          pulse: null,
                          weight: null,
                          height: null,
                          notesList: [],
                          medicationsList: [],
                          labsList: [],
                          notes: null,
                          medications: null,
                          hasMedicalRecord: false,
                          updatedAt: serverTimestamp()
                        });
                        setViewPatientModalOpen(false);
                      } else {
                        const snap = await getDoc(docRef);
                        if (snap.exists()) {
                          await addDoc(collection(db, "recycle_bin"), {
                            ...snap.data(),
                            originalCollection: deleteModal.collection,
                            deletedAt: serverTimestamp()
                          });
                        }
                        await deleteDoc(docRef);
                        if (deleteModal.type === "Doctor Profile") setSelectedDoctor(null);
                        if (deleteModal.type === "Appointment") setIsEditAppointmentModalOpen(false);
                      }
                    } catch (err) { console.error(err); }
                  }
                  setDeleteModal({ isOpen: false, type: null, id: null, collection: "" });
                }}
                className="bg-[#A50000] hover:bg-[#800000] text-white px-10 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm min-w-[120px]"
              >
                Yes
              </button>
              <button 
                onClick={() => setDeleteModal({ isOpen: false, type: null, id: null, collection: "" })}
                className="bg-[#EBEBEB] dark:bg-[#374151] hover:bg-[#D4D4D4] dark:hover:bg-[#4B5563] text-slate-700 dark:text-[#F9FAFB] px-6 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Availability Modal */}
      {isEditAvailabilityOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#111827] w-full max-w-[450px] rounded-[24px] shadow-2xl border border-slate-200 dark:border-[#374151] overflow-hidden flex flex-col scale-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-[#374151] flex items-center space-x-2 bg-white dark:bg-[#111827]">
              <h2 className="text-[15px] font-bold text-slate-800 dark:text-[#F9FAFB]">Availability</h2>
              <span className="text-[13px] font-semibold text-slate-400">Editing...</span>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-[#1F2937] flex flex-col space-y-4">
              
              {/* Existing Items */}
              <div className="flex flex-col space-y-3 max-h-[200px] overflow-y-auto">
                {tempAvailabilities.map((avail, idx) => (
                  <div key={avail.id || idx} className="flex items-center space-x-2">
                    <input type="text" value={avail.day} onChange={e => { const updated = [...tempAvailabilities]; updated[idx].day = e.target.value; setTempAvailabilities(updated); }} className="w-[100px] bg-white dark:bg-[#111827] border border-slate-300 dark:border-[#374151] rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6]" />
                    <input type="text" value={avail.startTime} onChange={e => { const updated = [...tempAvailabilities]; updated[idx].startTime = e.target.value; setTempAvailabilities(updated); }} className="w-[85px] bg-white dark:bg-[#111827] border border-slate-300 dark:border-[#374151] rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6]" />
                    <span className="text-xs font-bold text-slate-400 px-1">to</span>
                    <input type="text" value={avail.endTime} onChange={e => { const updated = [...tempAvailabilities]; updated[idx].endTime = e.target.value; setTempAvailabilities(updated); }} className="w-[85px] bg-white dark:bg-[#111827] border border-slate-300 dark:border-[#374151] rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6]" />
                    <button onClick={() => setTempAvailabilities(tempAvailabilities.filter((_, i) => i !== idx))} className="ml-1 text-[#EF4444] hover:text-[#DC2626] transition-colors">
                      <X size={20} strokeWidth={2.5} className="border border-[#EF4444] rounded-full p-0.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add separator */}
              <div className="flex items-center space-x-3 py-2">
                <div className="flex-1 h-px bg-slate-200 dark:bg-[#374151]"></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Add</span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-[#374151]"></div>
              </div>

              {/* Add New Row */}
              <div className="flex items-center space-x-2">
                <input type="text" placeholder="Day" value={newAvail.day} onChange={(e) => setNewAvail({...newAvail, day: e.target.value})} className="w-[100px] bg-white dark:bg-[#111827] border border-slate-300 dark:border-[#374151] rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6]" />
                <input type="text" placeholder="Time" value={newAvail.startTime} onChange={(e) => setNewAvail({...newAvail, startTime: e.target.value})} className="w-[85px] bg-white dark:bg-[#111827] border border-slate-300 dark:border-[#374151] rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6]" />
                <span className="text-xs font-bold text-slate-400 px-1">to</span>
                <input type="text" placeholder="Time" value={newAvail.endTime} onChange={(e) => setNewAvail({...newAvail, endTime: e.target.value})} className="w-[85px] bg-white dark:bg-[#111827] border border-slate-300 dark:border-[#374151] rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6]" />
                <button onClick={handleAddTempAvailability} className="ml-1 text-[#06b6d4] hover:text-[#0891b2] transition-colors">
                  <Plus size={20} strokeWidth={2.5} className="border border-[#06b6d4] rounded-full p-0.5" />
                </button>
              </div>

            </div>

            <div className="py-5 flex justify-center space-x-6 bg-white dark:bg-[#111827] border-t border-slate-200 dark:border-[#374151]">
              <button 
                onClick={async () => { 
                  try {
                    await updateDoc(doc(db, "doctors", selectedDoctor.id), { availabilities: tempAvailabilities });
                    setSelectedDoctor({ ...selectedDoctor, availabilities: tempAvailabilities });
                    setIsEditAvailabilityOpen(false); 
                    setShowEditAvailabilitySuccess(true); 
                  } catch(e) { console.error(e) }
                }}
                className="bg-[#5FB59C] hover:bg-[#4ea088] text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-[#5FB59C]/20 transition-colors w-32"
              >
                Save
              </button>
              <button 
                onClick={() => setIsEditAvailabilityOpen(false)}
                className="bg-[#EBEBEB] dark:bg-[#374151] hover:bg-[#D4D4D4] dark:hover:bg-[#4B5563] text-slate-700 dark:text-[#F9FAFB] px-8 py-2.5 rounded-xl text-sm font-bold transition-colors w-32"
              >
                Cancel
              </button>
            </div>
            
          </div>
        </div>
      )}

      {/* Edit Availability Success */}
      {showEditAvailabilitySuccess && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#F8F9FA] dark:bg-[#111827] w-full max-w-[400px] rounded-[24px] shadow-2xl border-2 border-slate-300 dark:border-slate-600 overflow-hidden flex flex-col items-center p-10 text-center scale-in-95 duration-200">
            <div className="w-[100px] h-[100px] bg-[#5FB59C] rounded-full flex items-center justify-center mb-6">
              <Check size={50} className="text-[#1E293B]" strokeWidth={4} />
            </div>
            <h2 className="text-[20px] font-black text-slate-800 dark:text-[#F9FAFB] mb-2 tracking-tight">Changes has been Saved</h2>
            <p className="text-slate-600 dark:text-[#9CA3AF] text-[13px] mb-8 font-medium px-4 leading-relaxed">
              Availability has been<br/>successfully changed
            </p>
            <button 
              onClick={() => setShowEditAvailabilitySuccess(false)}
              className="bg-[#5FB59C] hover:bg-[#4ea088] text-white px-12 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm"
            >
              OK
            </button>
          </div>
        </div>
      )}

    {/* Edit Appointment Modal */}
      {isEditAppointmentModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#111827] w-full max-w-[650px] rounded-[24px] shadow-2xl overflow-hidden flex flex-col scale-in-95 duration-200 border border-slate-200 dark:border-[#374151]">
            <div className="px-6 py-4 flex justify-between items-center border-b border-slate-200 dark:border-[#374151] sticky top-0 bg-white dark:bg-[#111827] z-10">
              <h2 className="text-[15px] font-bold text-slate-800 dark:text-[#F9FAFB]">Edit Appointment</h2>
              <button onClick={() => setIsEditAppointmentModalOpen(false)} className="text-slate-600 dark:text-[#F9FAFB] hover:text-slate-800 font-semibold text-[13px] flex items-center transition-colors">
                Back <ChevronRight size={14} className="ml-1" />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto bg-slate-50 dark:bg-[#1F2937] flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Availability Col */}
                <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#374151] rounded-xl p-5 shadow-sm">
                   <h3 className="text-xs font-black text-slate-700 dark:text-[#F9FAFB] uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-[#374151] pb-2">Availability</h3>
                   <div className="space-y-3">
                     <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                       <span>Monday</span><span>9:00 am - 1:00 pm</span>
                     </div>
                     <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                       <span>Tuesday</span><span>9:00 am - 11:00 am</span>
                     </div>
                     <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                       <span>Thursday</span><span>10:00 am - 1:00 pm</span>
                     </div>
                   </div>
                </div>

                {/* Appointed Col */}
                <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#374151] rounded-xl p-5 shadow-sm">
                   <h3 className="text-xs font-black text-slate-700 dark:text-[#F9FAFB] uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-[#374151] pb-2">Appointed</h3>
                   <div className="space-y-3">
                     <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                       <span>April 20, 2026</span><span>9:30 am - 10:30 am</span>
                     </div>
                     <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                       <span>April 30, 2026</span><span>11:00 am - 12:00 pm</span>
                     </div>
                   </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-xs font-black text-[#38bdf8] mb-1.5 ml-1">Date</label>
                  <input type="text" defaultValue="Apr 20, 2026" className="w-full bg-white dark:bg-[#111827] border border-slate-300 dark:border-[#374151] rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6]" />
                </div>
                <div>
                  <label className="block text-xs font-black text-[#38bdf8] mb-1.5 ml-1">Time</label>
                  <input type="text" defaultValue="9:30 am - 10:30 am" className="w-full bg-slate-100 dark:bg-[#374151] border border-slate-200 dark:border-[#4B5563] rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-[#F9FAFB] focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-[#F9FAFB] mb-2 ml-1">Purpose of Appointment</label>
                <textarea rows={4} placeholder="[Type here]" className="w-full bg-white dark:bg-[#111827] border border-slate-300 dark:border-[#374151] rounded-xl px-4 py-3 text-sm font-medium text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6] resize-none"></textarea>
              </div>
            </div>
            
            <div className="py-5 px-6 flex justify-end bg-white dark:bg-[#111827] border-t border-slate-200 dark:border-[#374151]">
              <div className="flex space-x-4">
                 <button 
                   onClick={() => { setIsEditAppointmentModalOpen(false); setShowEditAppointmentSuccess(true); }}
                   className="bg-[#5FB59C] hover:bg-[#4ea088] text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-[#5FB59C]/20 transition-colors"
                 >
                   Confirm
                 </button>
                 <button 
                   onClick={() => {
                     if (selectedAppointment) {
                       setDeleteModal({ isOpen: true, type: "Appointment", id: selectedAppointment.id, collection: "appointments" });
                     }
                   }}
                   className="bg-[#EF4444] hover:bg-[#DC2626] text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-[#EF4444]/20 transition-colors"
                 >
                   Delete
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Appointment Success */}
      {showEditAppointmentSuccess && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#F8F9FA] dark:bg-[#111827] w-full max-w-[400px] rounded-[24px] shadow-2xl border-2 border-slate-300 dark:border-slate-600 overflow-hidden flex flex-col items-center p-10 text-center scale-in-95 duration-200">
            <div className="w-[100px] h-[100px] bg-[#5FB59C] rounded-full flex items-center justify-center mb-6">
              <Check size={50} className="text-[#1E293B]" strokeWidth={4} />
            </div>
            <h2 className="text-[20px] font-black text-slate-800 dark:text-[#F9FAFB] mb-2 tracking-tight">Appointment Edited</h2>
            <p className="text-slate-600 dark:text-[#9CA3AF] text-[13px] mb-8 font-medium px-4 leading-relaxed">
              Appointment has been<br/>Saved
            </p>
            <button 
              onClick={() => setShowEditAppointmentSuccess(false)}
              className="bg-[#5FB59C] hover:bg-[#4ea088] text-white px-12 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Edit Specialty Modal */}
      {isEditSpecialtyOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#111827] w-full max-w-[400px] rounded-[24px] shadow-2xl border border-slate-200 dark:border-[#374151] overflow-hidden flex flex-col scale-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-[#374151] flex items-center justify-between bg-white dark:bg-[#111827]">
              <h2 className="text-[15px] font-bold text-slate-800 dark:text-[#F9FAFB]">Edit Specialty</h2>
              <button onClick={() => setIsEditSpecialtyOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={18} /></button>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-[#1F2937] flex flex-col space-y-4">
              {tempSpecialties.map((spec, idx) => (
                <div key={idx} className="flex items-center space-x-2">
                  <input type="text" value={spec} onChange={e => { const updated = [...tempSpecialties]; updated[idx] = e.target.value; setTempSpecialties(updated); }} className="flex-1 bg-white dark:bg-[#111827] border border-slate-300 dark:border-[#374151] rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6]" />
                  <button onClick={() => setTempSpecialties(tempSpecialties.filter((_, i) => i !== idx))} className="text-[#EF4444] hover:text-[#DC2626]"><X size={20} strokeWidth={2.5} className="border border-[#EF4444] rounded-full p-0.5" /></button>
                </div>
              ))}
              
              <div className="flex items-center space-x-3 py-2">
                <div className="flex-1 h-px bg-slate-200 dark:bg-[#374151]"></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Add New</span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-[#374151]"></div>
              </div>
              <div className="flex items-center space-x-2">
                <input type="text" placeholder="Specialty Name" value={newSpecialty} onChange={e => setNewSpecialty(e.target.value)} className="flex-1 bg-white dark:bg-[#111827] border border-slate-300 dark:border-[#374151] rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6]" />
                <button onClick={() => { if(newSpecialty) { setTempSpecialties([...tempSpecialties, newSpecialty]); setNewSpecialty(""); } }} className="text-[#06b6d4] hover:text-[#0891b2]"><Plus size={20} strokeWidth={2.5} className="border border-[#06b6d4] rounded-full p-0.5" /></button>
              </div>
            </div>
            <div className="py-5 flex justify-center space-x-4 bg-white dark:bg-[#111827] border-t border-slate-200 dark:border-[#374151]">
              <button onClick={async () => {
                try {
                  const updatedSpecialty = tempSpecialties.filter(Boolean).join(", ");
                  await updateDoc(doc(db, "doctors", selectedDoctor.id), { specialty: updatedSpecialty });
                  setSelectedDoctor({ ...selectedDoctor, specialty: updatedSpecialty });
                  setIsEditSpecialtyOpen(false); 
                  setShowEditSpecialtySuccess(true);
                } catch(e) { console.error(e); }
              }} className="bg-[#5FB59C] hover:bg-[#4ea088] text-white px-8 py-2.5 rounded-xl text-sm font-bold w-28">Save</button>
              <button onClick={() => setIsEditSpecialtyOpen(false)} className="bg-[#EBEBEB] dark:bg-[#374151] hover:bg-[#D4D4D4] dark:hover:bg-[#4B5563] text-slate-700 dark:text-[#F9FAFB] px-8 py-2.5 rounded-xl text-sm font-bold w-28">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Validation Modal */}
      {validationModal.isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#F8F9FA] dark:bg-[#111827] w-full max-w-[400px] rounded-[24px] shadow-2xl border-2 border-slate-300 dark:border-slate-600 overflow-hidden flex flex-col items-center p-10 text-center scale-in-95 duration-200">
            <div className="w-[100px] h-[100px] flex items-center justify-center mb-4">
              <AlertTriangle size={80} strokeWidth={2.5} className="text-[#A50000]" />
            </div>
            <h2 className="text-[20px] font-black text-slate-800 dark:text-[#F9FAFB] mb-4 tracking-tight">Missing Information</h2>
            <p className="text-slate-700 dark:text-[#D1D5DB] text-[14px] mb-8 font-medium px-2 leading-relaxed">
              {validationModal.message}
            </p>
            <button 
              onClick={() => setValidationModal({ isOpen: false, message: "" })}
              className="bg-[#A50000] hover:bg-[#800000] text-white px-10 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm min-w-[120px]"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* See All Appointments Modal */}
      {isSeeAllAppointmentsOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#111827] w-full max-w-[500px] max-h-[80vh] rounded-[24px] shadow-2xl overflow-hidden flex flex-col scale-in-95 duration-200 border border-slate-200 dark:border-[#374151]">
            <div className="px-6 py-4 flex justify-between items-center border-b border-slate-200 dark:border-[#374151] sticky top-0 bg-white dark:bg-[#111827] z-10">
              <h2 className="text-[15px] font-bold text-slate-800 dark:text-[#F9FAFB]">All Appointments</h2>
              <button onClick={() => setIsSeeAllAppointmentsOpen(false)} className="text-slate-600 dark:text-[#F9FAFB] hover:text-slate-800 font-semibold text-[13px] flex items-center transition-colors">
                Close <X size={14} className="ml-1" />
              </button>
            </div>
            
            <div className="p-6 bg-slate-50 dark:bg-[#1F2937] flex-1 overflow-y-auto">
               <div className="flex flex-col space-y-4">
                  {appointments.map(app => (
                    <div key={app.id} className="flex items-center justify-between p-4 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#374151] rounded-xl shadow-sm">
                       <div className="flex items-center space-x-3">
                          <img 
                            src={app.doctorImage?.includes('data:image') || app.doctorImage?.includes('http') ? app.doctorImage : (app.doctorImage ? `https://randomuser.me/api/portraits/${app.doctorImage}` : `https://randomuser.me/api/portraits/${app.image || 'men/32.jpg'}`)} 
                            className="w-10 h-10 rounded-full border-2 border-slate-100 dark:border-slate-700 object-cover" 
                            alt={app.doctorName || app.doctor} 
                          />
                          <div className="flex flex-col">
                             <span className="text-xs font-bold text-slate-800 dark:text-[#F9FAFB]">{app.doctorName || app.doctor}</span>
                             <span className="text-[10px] font-semibold text-slate-500 dark:text-[#9CA3AF] mt-0.5">{app.date} {app.time && `- ${app.time}`}</span>
                          </div>
                       </div>
                       <button onClick={() => { setSelectedAppointment(app); setIsSeeAllAppointmentsOpen(false); setIsEditAppointmentModalOpen(true); }} className="bg-[#10B981]/10 text-[#059669] hover:bg-[#10B981]/20 py-1.5 px-4 rounded-lg text-xs font-black transition-colors">
                         Edit
                       </button>
                    </div>
                  ))}
                  {appointments.length === 0 && (
                    <div className="text-center py-8 text-slate-500 font-medium">No appointments scheduled</div>
                  )}
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Specialty Success */}
      {showEditSpecialtySuccess && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#F8F9FA] dark:bg-[#111827] w-full max-w-[400px] rounded-[24px] shadow-2xl border-2 border-slate-300 dark:border-slate-600 overflow-hidden flex flex-col items-center p-10 text-center scale-in-95 duration-200">
            <div className="w-[100px] h-[100px] bg-[#5FB59C] rounded-full flex items-center justify-center mb-6">
              <Check size={50} className="text-[#1E293B]" strokeWidth={4} />
            </div>
            <h2 className="text-[20px] font-black text-slate-800 dark:text-[#F9FAFB] mb-2 tracking-tight">Specialty Updated</h2>
            <p className="text-slate-600 dark:text-[#9CA3AF] text-[13px] mb-8 font-medium px-4 leading-relaxed">
              Specialties have been<br/>successfully saved
            </p>
            <button onClick={() => setShowEditSpecialtySuccess(false)} className="bg-[#5FB59C] hover:bg-[#4ea088] text-white px-12 py-2.5 rounded-xl text-sm font-bold">OK</button>
          </div>
        </div>
      )}


      {/* Add Patient Success Modal */}
      {showAddPatientSuccess && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#F8F9FA] dark:bg-[#111827] w-full max-w-[400px] rounded-[24px] shadow-2xl border-2 border-slate-300 dark:border-slate-600 overflow-hidden flex flex-col items-center p-10 text-center scale-in-95 duration-200">
            <div className="w-[100px] h-[100px] bg-[#5FB59C] rounded-full flex items-center justify-center mb-6">
              <Check size={50} className="text-[#1E293B]" strokeWidth={4} />
            </div>
            <h2 className="text-[22px] font-black text-slate-800 dark:text-[#F9FAFB] mb-2 tracking-tight">Patient Saved</h2>
            <p className="text-slate-600 dark:text-[#9CA3AF] text-[13px] mb-8 font-medium px-4 leading-relaxed">
              Patient has been<br/>successfully saved
            </p>
            <button 
              onClick={() => setShowAddPatientSuccess(false)}
              className="bg-[#5FB59C] hover:bg-[#4ea088] text-white px-12 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm"
            >
              OK
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
