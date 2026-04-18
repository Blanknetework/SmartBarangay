"use client";

import { useState, useEffect, FormEvent, useRef } from "react";
import { Search, Plus, Check, FileText, CheckCircle2, Clock, CheckSquare, Settings2, SlidersHorizontal, HandCoins, Printer, User } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, serverTimestamp, query, orderBy, doc, limit } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface Resident {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  address: string;
  city: string;
  civilStatus?: string;
  gender?: string;
  profilePicUrl?: string;
}

interface DocRequest {
  id: string;
  name: string;
  age: number;
  address: string;  
  city?: string;
  civilStatus: string;
  type: string;
  purpose: string;
  status: "Pending" | "Processing" | "Approved" | "Released";
  isPaid: boolean;
  fee: string;
  createdAt: any;
  dateStr: string;
  pdfUrl?: string;
  htmlContent?: string;
}

const TYPE_TO_FEE: Record<string, string> = {
  "Barangay Clearance": "P50.00",
  "Certificate of Indigency": "Free",
  "Business Permit": "P20.00"
};

export default function DocumentRequestPage() {
  const [requests, setRequests] = useState<DocRequest[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [searchResTerm, setSearchResTerm] = useState("");
  const [filteredResidents, setFilteredResidents] = useState<Resident[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processStatus, setProcessStatus] = useState("Generate Request");
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("All");

  const searchBoxRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
     name: "", age: "", address: "", city: "", civilStatus: "Single", type: "", purpose: ""
  });
  const [selectedResidentUser, setSelectedResidentUser] = useState<Resident | null>(null);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    const unsubRes = onSnapshot(query(collection(db, "residents")), snap => {
       const res = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Resident[];
       setResidents(res);
    });
    const unsubDoc = onSnapshot(query(collection(db, "documents"), orderBy("createdAt", "desc")), snap => {
       const docs = snap.docs.map(d => ({ id: d.id, ...d.data() })) as DocRequest[];
       setRequests(docs);
    });
    const unsubAct = onSnapshot(query(collection(db, "activities"), orderBy("createdAt", "desc"), limit(4)), snap => {
       setActivities(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => { unsubRes(); unsubDoc(); unsubAct(); }
  }, []);

  useEffect(() => {
     if (!searchResTerm) {
       setFilteredResidents([]);
       return;
     }
     const lower = searchResTerm.toLowerCase();
     setFilteredResidents(residents.filter(r => (r.firstName + " " + r.lastName).toLowerCase().includes(lower)));
  }, [searchResTerm, residents]);


  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target as Node)) {
        setSearchResTerm("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProcessAndPrint = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setProcessStatus("1/4: Requesting AI formatting...");
    
    try {
      // 1. Send data to Gemini API for formatting
      const res = await fetch("/api/generate-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateType: formData.type,
          data: {
             firstName: formData.name.split(" ")[0] || "",
             lastName: formData.name.split(" ").slice(1).join(" "),
             age: formData.age,
             civilStatus: formData.civilStatus,
             address: formData.address,
             city: formData.city,
             purpose: formData.purpose
          }
        })
      });

      const dataResult = await res.json();
      if (dataResult.error) {
         console.error("AI Error:", dataResult.error);
         alert("Failed to generate document via AI: " + dataResult.error);
         setIsSubmitting(false);
         setProcessStatus("Generate Request");
         return;
      }

      setProcessStatus("2/4: Compiling PDF layout...");
      const renderDiv = document.createElement("div");
      renderDiv.innerHTML = dataResult.html;
      renderDiv.style.position = "absolute";
      renderDiv.style.top = "-9999px";
      renderDiv.style.left = "-9999px";
      renderDiv.style.width = "800px";
      renderDiv.style.backgroundColor = "white"; 
      renderDiv.style.zIndex = "-9999";
      renderDiv.style.opacity = "0"; 
      document.body.appendChild(renderDiv);
      
 
      await new Promise(resolve => setTimeout(resolve, 100));

      // 3. Convert to PDF
      const canvas = await html2canvas(renderDiv, { scale: 2, useCORS: true, logging: false });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      const pdfBlob = pdf.output("blob");

      document.body.removeChild(renderDiv);

      setProcessStatus("3/4: Rendering Local File...");
      const safeName = formData.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const fileName = `documents_${Date.now()}_${safeName}_${formData.type.replace(/\s+/g, '')}.pdf`;
      
      const objectUrl = URL.createObjectURL(pdfBlob);
      const downloadLink = document.createElement("a");
      downloadLink.href = objectUrl;
      downloadLink.download = fileName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      setProcessStatus("4/4: Finalizing record...");
      const isFree = TYPE_TO_FEE[formData.type] === "Free";
      await addDoc(collection(db, "documents"), {
        ...formData,
        status: "Pending",
        isPaid: isFree,
        fee: TYPE_TO_FEE[formData.type] || "",
        dateStr: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        createdAt: serverTimestamp(),
        pdfUrl: "", // Completely removed cloud storage
        htmlContent: dataResult.html
      });

      setIsSubmitting(false);
      setProcessStatus("Generate Request");
      setIsModalOpen(false);
      setShowSuccessDialog(true);
      setFormData({ name: "", age: "", address: "", city: "", civilStatus: "Single", type: "", purpose: "" });
      setSelectedResidentUser(null);
    } catch (error) {
       console.error(error);
       alert("Failed to process Request & PDF.");
       setIsSubmitting(false);
       setProcessStatus("Generate Request");
    }
  };

  const handleAction = async (req: DocRequest, action: string) => {
    const reqRef = doc(db, "documents", req.id);
    try {
      if (action === "Process") {
         await updateDoc(reqRef, { status: "Processing" });
      } else if (action === "Approve") {
         await updateDoc(reqRef, { status: "Approved" });
      } else if (action === "Pay") {
         const feeAmount = parseFloat(req.fee.replace("P", ""));
         await addDoc(collection(db, "revenue"), {
            amount: isNaN(feeAmount) ? 0 : feeAmount,
            source: "Document Request",
            details: `${req.type} for ${req.name}`,
            date: new Date().toLocaleDateString(),
            createdAt: serverTimestamp()
         });
         await updateDoc(reqRef, { isPaid: true });
         alert(`Payment of ${req.fee} recorded into the Barangay Revenue System!`);
      } else if (action === "Release") {
         await updateDoc(reqRef, { status: "Released" });
      } else if (action === "Print") {
         if (req.pdfUrl) {
           window.open(req.pdfUrl, "_blank");
         } else if (req.htmlContent) {
           const renderDiv = document.createElement("div");
           renderDiv.innerHTML = req.htmlContent;
           renderDiv.style.position = "fixed";
           renderDiv.style.top = "0px";
           renderDiv.style.left = "0px";
           renderDiv.style.width = "800px";
           renderDiv.style.backgroundColor = "white"; 
           renderDiv.style.zIndex = "-9999";
           renderDiv.style.pointerEvents = "none";
           document.body.appendChild(renderDiv);
           
           await new Promise(resolve => setTimeout(resolve, 100)); // wait for layout
           const canvas = await html2canvas(renderDiv, { scale: 2, useCORS: true, logging: false });
           const imgData = canvas.toDataURL("image/png");
           const pdf = new jsPDF("p", "mm", "a4");
           const pdfWidth = pdf.internal.pageSize.getWidth();
           const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
           pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
           
           const pdfBlob = pdf.output("blob");
           const objectUrl = URL.createObjectURL(pdfBlob);
           window.open(objectUrl, "_blank");
           document.body.removeChild(renderDiv);
         } else {
           alert("PDF wasn't saved in the cloud and no local template was found. Please check your local computer's Downloads folder from when it was generated.");
         }
      } else if (action === "Delete") {
         if (confirm("Are you sure you want to delete this document request?")) {
           await deleteDoc(reqRef);
         }
      }
    } catch (error) {
      console.error(error);
      alert("Failed action, check database constraints.");
    }
  };

  const pendingCount = requests.filter(r => r.status === "Pending" || r.status === "Processing").length;
  const approvedCount = requests.filter(r => r.status === "Approved").length;
  const releasedCount = requests.filter(r => r.status === "Released").length;

  const filteredRequests = requests.filter(r => {
    if (activeTab === "All") return true;
    return r.status === activeTab;
  });

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
            <div className="bg-[#FEF9C3] dark:bg-[#ca8a04]/20 border border-[#FDE047] dark:border-[#ca8a04]/30 rounded-xl p-3 flex items-center shadow-sm">
              <div className="bg-[#FDE047] dark:bg-[#ca8a04]/40 p-2 rounded-full mr-3">
                 <Clock size={20} className="text-[#854D0E] dark:text-[#fef08a]" />
              </div>
              <div>
                 <p className="text-xl font-black text-[#854D0E] dark:text-[#fef08a] leading-none">{pendingCount}</p>
                 <p className="text-xs font-bold text-[#A16207] dark:text-[#fde047]/80">Pending/Proc</p>
              </div>
            </div>

            <div className="bg-[#DBEAFE] dark:bg-[#2563eb]/20 border border-[#BFDBFE] dark:border-[#2563eb]/30 rounded-xl p-3 flex items-center shadow-sm">
              <div className="bg-[#BFDBFE] dark:bg-[#2563eb]/40 p-2 rounded-full mr-3">
                 <CheckCircle2 size={20} className="text-[#1E40AF] dark:text-[#bfdbfe]" />
              </div>
              <div>
                 <p className="text-xl font-black text-[#1E40AF] dark:text-[#bfdbfe] leading-none">{approvedCount}</p>
                 <p className="text-xs font-bold text-[#1D4ED8] dark:text-[#93c5fd]/80">Approved</p>
              </div>
            </div>

            <div className="bg-[#D1FAE5] dark:bg-[#059669]/20 border border-[#A7F3D0] dark:border-[#059669]/30 rounded-xl p-3 flex items-center shadow-sm">
              <div className="bg-[#A7F3D0] dark:bg-[#059669]/40 p-2 rounded-full mr-3">
                 <FileText size={20} className="text-[#065F46] dark:text-[#a7f3d0]" />
              </div>
              <div>
                 <p className="text-xl font-black text-[#065F46] dark:text-[#a7f3d0] leading-none">{releasedCount}</p>
                 <p className="text-xs font-bold text-[#047857] dark:text-[#6ee7b7]/80">Released</p>
              </div>
            </div>

            <div className="bg-[#FFEDD5] dark:bg-[#ea580c]/20 border border-[#FED7AA] dark:border-[#ea580c]/30 rounded-xl p-3 flex items-center shadow-sm">
              <div className="bg-[#FED7AA] dark:bg-[#ea580c]/40 p-2 rounded-full mr-3">
                 <CheckSquare size={20} className="text-[#9A3412] dark:text-[#fed7aa]" />
              </div>
              <div>
                 <p className="text-xl font-black text-[#9A3412] dark:text-[#fed7aa] leading-none">{requests.length}</p>
                 <p className="text-xs font-bold text-[#C2410C] dark:text-[#fdba74]/80">Total request</p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 flex items-center shadow-sm">
              <div className="bg-slate-200 dark:bg-slate-700 p-2 rounded-full mr-3">
                 <Search size={20} className="text-slate-700 dark:text-slate-300" />
              </div>
              <div>
                 <p className="text-xl font-black text-slate-700 dark:text-slate-300 leading-none">{requests.length}</p>
                 <p className="text-xs font-bold text-slate-500 dark:text-slate-400">All Time Summary</p>
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
              {["All", "Pending", "Processing", "Approved", "Released"].map(tab => (
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
                   placeholder="Search Requests.."
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
                  <th className="px-5 py-4 text-left text-xs font-bold text-slate-500 dark:text-[#9CA3AF]">Name</th>
                  <th className="px-5 py-4 text-left text-xs font-bold text-slate-500 dark:text-[#9CA3AF]">Address</th>
                  <th className="px-5 py-4 text-left text-xs font-bold text-slate-500 dark:text-[#9CA3AF]">Document type</th>
                  <th className="px-5 py-4 text-center text-xs font-bold text-slate-500 dark:text-[#9CA3AF]">Status</th>
                  <th className="px-5 py-4 text-center text-xs font-bold text-slate-500 dark:text-[#9CA3AF]">Fee</th>
                  <th className="px-5 py-4 text-left text-xs font-bold text-slate-500 dark:text-[#9CA3AF]">Date</th>
                  <th className="px-5 py-4 text-right text-xs font-bold text-slate-500 dark:text-[#9CA3AF] w-36">Actions</th>
                </tr>
              </thead>
              
              <tbody>
                {filteredRequests.map((req, idx) => {
                  const isFree = req.fee === "Free";
                  const canPrintRelease = req.status === "Approved" && (req.isPaid || isFree);

                  return (
                  <tr 
                    key={req.id} 
                    className={`group ${idx !== filteredRequests.length - 1 ? "border-b border-slate-100 dark:border-[#374151]" : ""} hover:bg-slate-50 dark:hover:bg-[#374151]/30 transition-colors`}
                  >
                    <td className="px-5 py-4 text-sm font-bold text-slate-800 dark:text-[#F9FAFB]">{req.name}</td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-600 dark:text-[#9CA3AF]">{req.address}</td>
                    <td className="px-5 py-4">
                       <span className="text-sm font-bold text-slate-700 dark:text-[#E5E7EB] block leading-tight">{req.type}</span>
                       <span className="text-[10px] font-semibold text-slate-400 dark:text-[#9CA3AF] block max-w-[150px] truncate">{req.purpose}</span>
                    </td>
                    <td className="px-5 py-4 text-center">
                       {req.status === "Approved" ? (
                         <span className="bg-[#DBEAFE] dark:bg-[#1E40AF]/30 text-[#1D4ED8] dark:text-[#93C5FD] px-3 py-1 rounded-full text-[11px] uppercase tracking-wider font-bold">Approved</span>
                       ) : req.status === "Released" ? (
                         <span className="bg-[#D1FAE5] dark:bg-[#065F46]/30 text-[#047857] dark:text-[#6EE7B7] px-3 py-1 rounded-full text-[11px] uppercase tracking-wider font-bold">Released</span>
                       ) : req.status === "Processing" ? (
                         <span className="bg-[#FFEDD5] dark:bg-[#9A3412]/30 text-[#C2410C] dark:text-[#FDBA74] px-3 py-1 rounded-full text-[11px] uppercase tracking-wider font-bold">Processing</span>
                       ) : (
                         <span className="bg-[#FEF9C3] dark:bg-[#854D0E]/30 text-[#A16207] dark:text-[#FDE047] px-3 py-1 rounded-full text-[11px] uppercase tracking-wider font-bold">Pending</span>
                       )}
                    </td>
                    <td className="px-5 py-4 text-center">
                       <span className={`px-3 py-1.5 rounded-full text-[11px] tracking-wider font-bold ${req.fee === 'Free' ? 'bg-[#FFEDD5] text-[#C2410C] dark:bg-[#9A3412]/30 dark:text-[#FDBA74]' : (req.isPaid ? 'bg-[#D1FAE5] text-[#047857] dark:bg-[#065F46]/30 dark:text-[#6EE7B7]' : 'bg-slate-200 text-slate-700 dark:bg-[#374151] dark:text-gray-300')}`}>
                         {req.isPaid ? 'PAID' : req.fee}
                       </span>
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-500 dark:text-[#9CA3AF]">{req.dateStr}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 flex-wrap pb-1">
                        
                        {req.status === "Pending" && (
                           <button onClick={() => handleAction(req, "Process")} className="bg-slate-200 dark:bg-[#374151] hover:bg-slate-300 dark:hover:bg-[#4B5563] text-slate-700 dark:text-white px-3 py-1 rounded text-xs font-bold w-[90px] shadow-sm transition-colors">Start Process</button>
                        )}
                        {req.status === "Processing" && (
                           <button onClick={() => handleAction(req, "Approve")} className="bg-[#3B82F6] hover:bg-[#2563EB] text-white px-3 py-1 rounded text-xs font-bold w-[90px] shadow-sm transition-colors">Approve</button>
                        )}
                        {req.status === "Approved" && !req.isPaid && !isFree && (
                           <button onClick={() => handleAction(req, "Pay")} className="bg-[#EAB308] flex items-center justify-center space-x-1 hover:bg-[#CA8A04] text-white px-3 py-1 rounded text-xs font-bold w-[120px] shadow-sm transition-colors"><HandCoins size={14}/><span>Record Pay</span></button>
                        )}
                        {canPrintRelease && (
                           <div className="flex items-center gap-2">
                             <button onClick={() => handleAction(req, "Print")} className="bg-slate-100 dark:bg-[#374151] hover:bg-slate-200 dark:hover:bg-[#4B5563] border border-slate-300 dark:border-gray-600 text-slate-700 dark:text-[#F9FAFB] flex items-center space-x-1 px-3 py-1 rounded text-xs font-bold shadow-sm transition-colors"><Printer size={14} fill="currentColor"/> <span>Print</span></button>
                             <button onClick={() => handleAction(req, "Release")} className="bg-[#22C55E] hover:bg-[#16A34A] text-white px-3 py-1 rounded text-xs font-bold shadow-sm transition-colors">Release Doc</button>
                           </div>
                        )}
                        {req.status === "Released" && (
                           <span className="text-slate-400 dark:text-slate-500 text-xs font-bold italic mr-1">Completed</span>
                        )}
                        <button onClick={() => handleAction(req, "Delete")} className="text-[#EF4444] hover:text-[#DC2626] bg-[#FEE2E2] hover:bg-[#FECACA] dark:bg-[#7F1D1D]/30 dark:hover:bg-[#7F1D1D]/50 px-2 py-1 rounded transition-colors text-xs font-bold">Delete</button>
                      </div>
                    </td>
                  </tr>
                )})}
                
                {filteredRequests.length === 0 && (
                   <tr>
                     <td colSpan={7} className="text-center p-8 text-slate-500 font-medium">No document requests found.</td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right Sidebar Widgets */}
      <div className="w-full xl:w-[300px] flex flex-col space-y-6 shrink-0">
         {/* Fee Summary */}
         <div className="bg-white dark:bg-[#1F2937] border border-slate-200 dark:border-[#374151] rounded-xl p-6 shadow-sm dark:shadow-none">
            <h3 className="text-sm font-bold text-slate-800 dark:text-[#F9FAFB] mb-4">Fee summary</h3>
            <div className="space-y-3">
               <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-[#9CA3AF]">
                 <span>Barangay Clearance</span>
                 <span className="text-slate-800 dark:text-[#F9FAFB] font-black">{TYPE_TO_FEE["Barangay Clearance"]}</span>
               </div>
               <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-[#9CA3AF]">
                 <span>Certificate of Indigency</span>
                 <span className="text-[#3B82F6] font-black">{TYPE_TO_FEE["Certificate of Indigency"]}</span>
               </div>
               <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-[#9CA3AF]">
                 <span>Business Permit</span>
                 <span className="text-slate-800 dark:text-[#F9FAFB] font-black">{TYPE_TO_FEE["Business Permit"]}</span>
               </div>
            </div>
         </div>

         {/* Notifications */}
         <div className="bg-white dark:bg-[#1F2937] border border-slate-200 dark:border-[#374151] rounded-xl p-6 shadow-sm dark:shadow-none">
            <h3 className="text-sm font-bold text-slate-800 dark:text-[#F9FAFB] mb-4">Notifications</h3>
            <ul className="space-y-4">
              {activities.length === 0 ? (
                 <li className="text-xs font-semibold text-slate-500 text-center py-2">No active events</li>
              ) : activities.map(act => (
                <li key={act.id} className="flex items-start">
                   <div className={`w-1.5 h-1.5 rounded-full mt-1.5 mr-2 shrink-0 ${act.type === 'document' ? 'bg-[#3B82F6]' : 'bg-[#EAB308]'}`}></div>
                   <div>
                       <p className="text-xs font-semibold text-slate-800 dark:text-[#F9FAFB] leading-tight">{act.title}</p>
                       <p className="text-[10px] text-slate-500 dark:text-[#9CA3AF] mt-0.5">{act.createdAt ? new Date(act.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}</p>
                   </div>
                </li>
              ))}
            </ul>
         </div>
      </div>

      {/* New Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-50 dark:bg-[#111827] w-full max-w-[700px] rounded-[24px] shadow-2xl border border-slate-200 dark:border-[#374151] overflow-hidden flex flex-col scale-in-95 duration-200 max-h-[90vh]">
            
            <form onSubmit={handleProcessAndPrint} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-8 md:p-10 flex-1 overflow-y-auto min-h-0">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b border-slate-200 dark:border-[#1F2937] pb-4">
                   <h2 className="text-xl font-bold text-slate-800 dark:text-[#F9FAFB] tracking-tight">New Request form</h2>
                   
                   {/* Search Auto-Filler */}
                   <div className="relative flex bg-white dark:bg-[#1F2937] border border-slate-300 dark:border-[#374151] rounded-lg items-center px-4 py-2 w-full sm:w-64" ref={searchBoxRef}>
                     <Search size={16} className="text-slate-400 mr-2 shrink-0" />
                     <input
                       type="text"
                       placeholder="Autofill Resident.."
                       value={searchResTerm}
                       onChange={e => setSearchResTerm(e.target.value)}
                       className="bg-transparent border-none focus:outline-none text-xs w-full font-bold text-slate-700 dark:text-[#F9FAFB] placeholder:text-slate-400"
                     />
                     
                     {filteredResidents.length > 0 && searchResTerm && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#1F2937] border border-slate-200 dark:border-[#374151] rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto w-[280px] right-0 sm:right-auto">
                          {filteredResidents.map(r => (
                             <div 
                               key={r.id} 
                               onClick={() => {
                                setFormData({
                                   ...formData, 
                                   name: `${r.firstName} ${r.lastName}`,
                                   age: r.age?.toString() || "",
                                   address: r.address || "",
 city: r.city || "",
                                   civilStatus: r.civilStatus || "Single"
                                });
                                setSelectedResidentUser(r);
                                setSearchResTerm("");
                               }} 
                               className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-[#374151] border-b border-slate-100 dark:border-[#1F2937] cursor-pointer flex justify-between items-center"
                             >
                                <div>
                                   <p className="text-sm font-bold text-slate-700 dark:text-[#F9FAFB] leading-tight">{r.firstName} {r.lastName}</p>
                                   <p className="text-[10px] text-slate-400 dark:text-[#9CA3AF] truncate max-w-[150px]">{r.address}, {r.city}</p>
                                </div>
                                <div className="text-[10px] font-bold text-[#3B82F6]">AUTOFILL</div>
                             </div>
                          ))}
                        </div>
                     )}
                   </div>
                </div>

                <div className="flex items-start justify-between mb-4">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                     <div>
                       <label className="block text-xs font-bold text-slate-500 dark:text-[#9CA3AF] mb-1.5 ml-1">Full Name:</label>
                       <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} type="text" className="w-full bg-white dark:bg-[#1F2937] border border-slate-300 dark:border-[#374151] rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6]" />
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-slate-500 dark:text-[#9CA3AF] mb-1.5 ml-1">Age:</label>
                       <input required value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} type="number" min="0" className="w-full bg-white dark:bg-[#1F2937] border border-slate-300 dark:border-[#374151] rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6]" />
                     </div>
                     <div>
                       <label className="block text-xs font-bold text-slate-500 dark:text-[#9CA3AF] mb-1.5 ml-1">Address:</label>
                       <input required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} type="text" className="w-full bg-white dark:bg-[#1F2937] border border-slate-300 dark:border-[#374151] rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6]" placeholder="House No. / Street" />
                     </div>
                     <div className="grid grid-cols-2 gap-2">
                       <div>
                         <label className="block text-xs font-bold text-slate-500 dark:text-[#9CA3AF] mb-1.5 ml-1">City/Muni:</label>
                         <input required value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} type="text" className="w-full bg-white dark:bg-[#1F2937] border border-slate-300 dark:border-[#374151] rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6]" placeholder="City" />
                       </div>
                       <div>
                         <label className="block text-xs font-bold text-slate-500 dark:text-[#9CA3AF] mb-1.5 ml-1">Civil Status:</label>
                         <select required value={formData.civilStatus} onChange={e => setFormData({...formData, civilStatus: e.target.value})} className="w-full bg-slate-200 dark:bg-[#374151] border-none rounded-xl px-4 py-3.5 text-sm font-bold text-slate-700 dark:text-[#F9FAFB] focus:outline-none cursor-pointer appearance-none">
                           <option>Single</option>
                           <option>Married</option>
                           <option>Widowed</option>
                           <option>Separated</option>
                         </select>
                       </div>
                     </div>
                   </div>
                   
                   {/* Profile Picture Placeholder */}
                   <div className="w-[110px] h-[110px] bg-white dark:bg-[#1F2937] border-2 border-slate-200 dark:border-[#374151] flex items-center justify-center overflow-hidden shrink-0 shadow-sm ml-4 mt-6">
                      {selectedResidentUser?.profilePicUrl ? (
                         <img 
                           src={selectedResidentUser.profilePicUrl}
                           alt="Profile" 
                           className="w-full h-full object-cover"
                         />
                      ) : selectedResidentUser?.firstName && selectedResidentUser.firstName.length > 2 ? (
                         <img 
                           src={`https://randomuser.me/api/portraits/${selectedResidentUser.gender === 'Female' ? 'women' : 'men'}/${(selectedResidentUser.firstName.length * 7) % 99 || 1}.jpg`} 
                           alt="Profile Preview" 
                           className="w-[90%] h-[90%] object-cover"
                         />
                      ) : (
                         <User size={55} className="text-slate-300 dark:text-slate-600" strokeWidth={1} />
                      )}
                   </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-[#1F2937] mt-4 mb-8">
                  <div>
                    <label className="block text-[13px] font-black tracking-wide uppercase text-slate-800 dark:text-[#F9FAFB] mb-2 ml-1">Document type <span className="text-red-500">*</span></label>
                    <select required value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-slate-200 dark:bg-[#374151] border-none rounded-xl px-4 py-3.5 text-sm font-bold text-slate-700 dark:text-[#F9FAFB] focus:outline-none cursor-pointer appearance-none">
                      <option value="" disabled>Select Document</option>
                      <option value="Barangay Clearance">Barangay Clearance</option>
                      <option value="Certificate of Indigency">Certificate of Indigency</option>
                      <option value="Business Permit">Business Permit</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[13px] font-black tracking-wide uppercase text-slate-800 dark:text-[#F9FAFB] mb-2 ml-1">Purpose <span className="text-red-500">*</span></label>
                    <input required minLength={5} value={formData.purpose} onChange={e => setFormData({...formData, purpose: e.target.value})} type="text" className="w-full bg-white dark:bg-[#1F2937] border-2 border-slate-300 dark:border-[#374151] rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#3B82F6]" placeholder="e.g. Employment" />
                  </div>
                </div>

                <div className="bg-[#DBEAFE]/50 dark:bg-[#1E40AF]/10 rounded-xl p-5 mb-4 border border-[#BFDBFE] dark:border-[#1E40AF]/30">
                   <div className="flex text-sm mb-2 justify-between">
                     <span className="font-bold text-slate-700 dark:text-slate-300">Total Document Fee:</span> 
                     <span className="font-black text-slate-900 dark:text-white text-lg">{formData.type ? (TYPE_TO_FEE[formData.type] || "—") : "—"}</span>
                   </div>
                   <div className="flex text-sm"><span className="w-32 font-bold text-slate-600 dark:text-slate-400">Date:</span> <span className="font-semibold text-slate-700 dark:text-slate-300">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'})}</span></div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="px-8 sm:px-10 pb-8 pt-4 flex items-center justify-end space-x-3 border-t border-slate-200 dark:border-[#374151] bg-slate-50 dark:bg-[#111827] shrink-0">
                <button 
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedResidentUser(null);
                  }}
                  className="bg-white hover:bg-slate-50 dark:bg-[#1F2937] dark:hover:bg-[#374151] border border-slate-200 dark:border-[#374151] text-slate-700 dark:text-[#F9FAFB] px-6 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="bg-[#3B82F6] hover:bg-[#2563EB] text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-[#3B82F6]/20 transition-colors disabled:opacity-50 min-w-[180px]"
                >
                  {isSubmitting ? (<div className="flex items-center justify-center"><svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> {processStatus === "Generate Request" ? "Generating..." : processStatus}</div>) : "Generate Request"}
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
            <h2 className="text-2xl font-black text-slate-800 dark:text-[#F9FAFB] mb-2 tracking-tight">Request Logged</h2>
            <p className="text-slate-500 dark:text-[#9CA3AF] text-sm mb-8 font-medium px-4 leading-relaxed">
              The document request is now pending review.
            </p>
            <button 
              onClick={() => setShowSuccessDialog(false)}
              className="w-full bg-[#10B981] hover:bg-[#059669] text-white px-6 py-3 rounded-xl text-sm font-bold shadow-md shadow-[#10B981]/20 transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
