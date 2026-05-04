"use client";

import { useState, useEffect } from "react";
import { Search, Eye, Filter, X, Plus, Pencil, Trash2, CheckCircle2, Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { addAuditLog } from "@/lib/audit-log";

interface Official {
  id: string;
  name: string;
  role: string;
  status: string;
  age: number;
  gender: string;
  civilStatus: string;
  birthDate: string;
  contact: string;
  address?: string;
  position?: string;
}

const ROLE_COLORS: Record<string, string> = {
  "Captain": "bg-[#f5c6cb]",
  "Kagawad": "bg-[#d0cbf0]",
  "SK Chairman": "bg-[#faeea2]",
  "Secretary": "bg-[#c3e6cb]",
  "Treasurer": "bg-[#b8daff]",
};

const ROLES = ["Captain", "Kagawad", "SK Chairman", "Secretary", "Treasurer"];

const emptyForm: Omit<Official, "id"> = {
  name: "", role: "Kagawad", status: "Active", age: 0,
  gender: "Male", civilStatus: "Single", birthDate: "", contact: "", address: "", position: "",
};

export default function OfficialsPage() {
  const { role } = useAuth();
  const [officials, setOfficials] = useState<Official[]>([]);
  const [selectedOfficial, setSelectedOfficial] = useState<Official | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [filterRole, setFilterRole] = useState("All");

  // Add/Edit modal
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingOfficial, setEditingOfficial] = useState<Official | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<Official | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "officials"), (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Official));
      setOfficials(data);
    });
    return () => unsub();
  }, []);

  const filteredOfficials = officials.filter((off) => {
    const matchesSearch = off.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterRole === "All" || off.role === filterRole;
    return matchesSearch && matchesFilter;
  });

  const openAddModal = () => {
    setEditingOfficial(null);
    setForm(emptyForm);
    setShowFormModal(true);
  };

  const openEditModal = (off: Official) => {
    setEditingOfficial(off);
    setForm({ name: off.name, role: off.role, status: off.status, age: off.age, gender: off.gender, civilStatus: off.civilStatus, birthDate: off.birthDate, contact: off.contact, address: off.address || "", position: off.position || "" });
    setShowFormModal(true);
    setSelectedOfficial(null);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.birthDate.trim()) return;
    setSaving(true);
    try {
      const payload = { ...form, age: Number(form.age) };
      if (editingOfficial) {
        await updateDoc(doc(db, "officials", editingOfficial.id), payload);
        await addAuditLog("UPDATE_OFFICIAL", role || "unknown", `Updated official: ${form.name}`);
        showToast("Official updated successfully!");
      } else {
        await addDoc(collection(db, "officials"), { ...payload, createdAt: serverTimestamp() });
        await addAuditLog("ADD_OFFICIAL", role || "unknown", `Added new official: ${form.name}`);
        showToast("Official added successfully!");
      }
      setShowFormModal(false);
    } catch (err) {
      console.error(err);
      showToast("Error saving official.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteDoc(doc(db, "officials", deleteTarget.id));
      await addAuditLog("DELETE_OFFICIAL", role || "unknown", `Deleted official: ${deleteTarget.name}`);
      showToast("Official deleted.");
      setDeleteTarget(null);
      setSelectedOfficial(null);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const inputCls = "w-full bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#374151] rounded-lg px-3 py-2.5 text-sm text-slate-800 dark:text-[#F9FAFB] outline-none focus:ring-2 focus:ring-[#3B82F6]/40 transition-all placeholder:text-slate-400";
  const labelCls = "text-xs font-bold text-slate-500 dark:text-[#9CA3AF] uppercase tracking-wider mb-1.5 block";

  return (
    <div className="flex flex-col space-y-6 lg:space-y-8 animate-in fade-in duration-500 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-[#F9FAFB] tracking-tight">List of Barangay Official</h1>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="flex bg-white dark:bg-[#1F2937] items-center px-4 py-2.5 rounded-lg shadow-sm border border-slate-200 dark:border-[#374151] max-w-[320px] w-full transition-colors">
            <Search size={16} className="text-gray-400 dark:text-[#9CA3AF] mr-2 shrink-0" />
            <input type="text" placeholder="Search Official.." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="bg-transparent border-none outline-none w-full text-[13px] font-medium text-gray-700 dark:text-[#F9FAFB] placeholder:text-gray-400 dark:placeholder:text-[#9CA3AF] flex-1" />
            <div className="relative shrink-0 ml-2 border-l border-slate-200 dark:border-[#374151] pl-3">
              <button onClick={() => setShowFilterMenu(!showFilterMenu)} className={`text-gray-600 dark:text-[#9CA3AF] hover:text-[#2369C4] transition-colors ${showFilterMenu || filterRole !== 'All' ? 'text-blue-600' : ''}`}>
                <Filter size={16} />
              </button>
              {showFilterMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-10 overflow-hidden py-1">
                  <div className="px-3 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700 mb-1">Filter by Role</div>
                  {["All", ...ROLES].map(r => (
                    <button key={r} onClick={() => { setFilterRole(r); setShowFilterMenu(false); }} className={`w-full text-left px-4 py-2 text-sm font-semibold transition-colors ${filterRole === r ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>{r}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
          {role === 'admin' && (
            <button onClick={openAddModal} className="flex items-center justify-center bg-[#3B82F6] hover:bg-[#2563EB] text-white px-4 py-2.5 rounded-lg text-sm font-bold shadow-md shadow-[#3B82F6]/20 transition-colors shrink-0 whitespace-nowrap w-full sm:w-auto">
              <Plus size={16} className="mr-2" strokeWidth={3} /> Add Official
            </button>
          )}
        </div>
      </div>

      {/* Grid by Role */}
      <div className="flex flex-col space-y-10">
        {ROLES.map(roleGroup => {
          const officialsInGroup = filteredOfficials.filter(o => o.role === roleGroup);
          if (officialsInGroup.length === 0) return null;
          return (
            <div key={roleGroup} className="flex flex-col space-y-4">
              <h2 className="text-xl font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">{roleGroup}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {officialsInGroup.map((official) => (
                  <div key={official.id} className="bg-white dark:bg-[#1F2937] rounded-xl shadow-sm dark:shadow-none border border-slate-200 dark:border-[#374151] flex flex-col pt-0 pb-0 w-full max-w-[260px] mx-auto overflow-hidden transition-colors">
                    <div className={`w-full ${ROLE_COLORS[official.role] || "bg-slate-200"} py-5 pb-16 flex flex-col items-center text-center`}>
                      <h3 className="font-medium text-gray-900 text-sm whitespace-nowrap tracking-wide">{official.name}</h3>
                      <p className="font-bold text-gray-900 text-[15px]">{official.role}</p>
                    </div>
                    <div className="-mt-14 flex justify-center z-10 w-full mb-3">
                      <div className="w-[110px] h-[110px] bg-white dark:bg-[#1F2937] rounded-full border border-gray-400 dark:border-[#374151] flex items-center justify-center overflow-hidden shrink-0 transition-colors">
                        <img src={`https://randomuser.me/api/portraits/${official.gender === 'Male' ? 'men' : 'women'}/${Math.abs(official.name.charCodeAt(0) % 70)}.jpg`} alt={official.name} className="w-[85%] h-[85%] object-cover rounded-full" />
                      </div>
                    </div>
                    <div className="flex justify-between items-center px-8 pb-5">
                      <div className="flex flex-col items-center space-y-1.5">
                        <span className="text-[13px] font-bold text-gray-900 dark:text-[#F9FAFB]">Status</span>
                        <div className={`w-[22px] h-[22px] rounded-full ${official.status === 'Active' ? 'bg-[#5ea595]' : 'bg-[#9f1515]'}`}></div>
                      </div>
                      <div className="flex flex-col items-center space-y-1.5">
                        <span className="text-[13px] font-bold text-gray-900 dark:text-[#F9FAFB]">View</span>
                        <button onClick={() => setSelectedOfficial(official)} className="text-[#0c80c0] dark:text-[#3B82F6] hover:text-[#0b6a9c] dark:hover:text-[#60A5FA] transition-colors bg-transparent border-0 outline-none cursor-pointer p-0">
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

      {/* View Modal */}
      {selectedOfficial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#111827] rounded-[10px] w-full max-w-[300px] shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 border-[1.5px] border-slate-200 dark:border-[#374151]">
            <div className="flex justify-between items-center px-4 py-3 border-b font-bold text-[15px] text-gray-900 dark:text-[#F9FAFB] border-slate-200 dark:border-[#374151]">
              {selectedOfficial.role}
              <button onClick={() => setSelectedOfficial(null)} className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"><X size={18} /></button>
            </div>
            <div className="flex flex-col items-center px-5 py-5 bg-[#f4f7f9] dark:bg-[#111827] rounded-b-[10px]">
              <div className="w-[100px] h-[100px] bg-white dark:bg-[#1F2937] rounded-full border-[1.5px] border-slate-300 dark:border-[#374151] flex items-center justify-center overflow-hidden mb-3 shrink-0">
                <img src={`https://randomuser.me/api/portraits/${selectedOfficial.gender === 'Male' ? 'men' : 'women'}/${Math.abs(selectedOfficial.name.charCodeAt(0) % 70)}.jpg`} alt={selectedOfficial.name} className="w-[85%] h-[85%] object-cover rounded-full" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-[#F9FAFB] mb-4 text-sm">{selectedOfficial.name}</h3>

              <div className="w-full space-y-[14px]">
                {[
                  ["Age", selectedOfficial.age],
                  ["Gender", selectedOfficial.gender],
                  ["Civil Status", selectedOfficial.civilStatus],
                  ["Birth Date", selectedOfficial.birthDate],
                  ["Contact #", selectedOfficial.contact],
                ].map(([label, val]) => (
                  <div key={String(label)} className="flex justify-between border-b-[1.5px] border-slate-200 dark:border-[#374151] pb-1.5">
                    <span className="text-gray-700 dark:text-gray-300 text-[13px]">{label}</span>
                    <span className="text-gray-900 dark:text-[#F9FAFB] text-[13px] font-medium">{val}</span>
                  </div>
                ))}
                <div className="flex justify-between pt-1 pb-2 items-center">
                  <span className="text-gray-700 dark:text-gray-300 text-[13px]">Status</span>
                  <div className="flex items-center space-x-2">
                    <div className={`w-[18px] h-[18px] rounded-full ${selectedOfficial.status === 'Active' ? 'bg-[#5ea595]' : 'bg-[#9f1515]'}`}></div>
                    <span className="text-gray-900 dark:text-[#F9FAFB] text-[13px] font-medium">{selectedOfficial.status}</span>
                  </div>
                </div>
              </div>

              {/* Edit/Delete buttons for admin */}
              {role === 'admin' && (
                <div className="flex gap-2 w-full mt-4 pt-3 border-t border-slate-200 dark:border-[#374151]">
                  <button onClick={() => openEditModal(selectedOfficial)} className="flex-1 flex items-center justify-center gap-1.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-lg py-2 text-xs font-bold transition-colors">
                    <Pencil size={13} /> Edit
                  </button>
                  <button onClick={() => { setDeleteTarget(selectedOfficial); }} className="flex-1 flex items-center justify-center gap-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg py-2 text-xs font-bold transition-colors">
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#111827] rounded-2xl w-full max-w-[480px] shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-[#374151] mx-4">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-[#374151]">
              <h2 className="text-lg font-bold text-slate-800 dark:text-[#F9FAFB]">{editingOfficial ? "Edit Official" : "Add New Official"}</h2>
              <button onClick={() => setShowFormModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X size={20} /></button>
            </div>
            <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className={labelCls}>Full Name (Last, First)</label>
                  <input className={inputCls} placeholder="e.g. Dela Cruz, Juan" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>Role / Position</label>
                  <select className={inputCls} value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Status</label>
                  <select className={inputCls} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Gender</label>
                  <select className={inputCls} value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Age</label>
                  <input type="number" className={inputCls} value={form.age || ""} onChange={e => setForm({ ...form, age: Number(e.target.value) })} />
                </div>
                <div>
                  <label className={labelCls}>Civil Status</label>
                  <select className={inputCls} value={form.civilStatus} onChange={e => setForm({ ...form, civilStatus: e.target.value })}>
                    {["Single", "Married", "Widowed", "Separated"].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Birth Date</label>
                  <input type="date" className={inputCls} value={form.birthDate} onChange={e => setForm({ ...form, birthDate: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>Contact #</label>
                  <input className={inputCls} placeholder="09XXXXXXXXX" value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} />
                </div>
                <div>
                  <label className={labelCls}>Address</label>
                  <input className={inputCls} placeholder="Optional" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-[#374151] bg-slate-50 dark:bg-[#0F172A]">
              <button onClick={() => setShowFormModal(false)} className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-[#1F2937] border border-slate-200 dark:border-[#374151] rounded-lg hover:bg-slate-50 dark:hover:bg-[#374151] transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.name.trim()} className="px-5 py-2 text-sm font-bold text-white bg-[#3B82F6] hover:bg-[#2563EB] rounded-lg shadow-md shadow-[#3B82F6]/20 transition-colors disabled:opacity-50 flex items-center gap-2">
                {saving && <Loader2 size={14} className="animate-spin" />}
                {editingOfficial ? "Update" : "Add Official"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#111827] rounded-2xl w-full max-w-[380px] shadow-xl border border-slate-200 dark:border-[#374151] p-6 mx-4 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-slate-800 dark:text-[#F9FAFB] mb-2">Delete Official</h3>
            <p className="text-sm text-slate-500 dark:text-[#9CA3AF] mb-6">Are you sure you want to delete <strong className="text-slate-700 dark:text-slate-200">{deleteTarget.name}</strong>? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-[#1F2937] border border-slate-200 dark:border-[#374151] rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="px-5 py-2 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
                {deleting && <Loader2 size={14} className="animate-spin" />} Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 bg-white dark:bg-[#1E293B] shadow-xl rounded-xl flex items-center p-4 border border-green-100 dark:border-green-900/30 animate-in slide-in-from-top-4 fade-in duration-300 z-[70]">
          <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-2 mr-3 shrink-0"><CheckCircle2 className="text-green-600 dark:text-green-400" size={20} /></div>
          <p className="text-sm font-bold text-slate-800 dark:text-[#F9FAFB]">{toast}</p>
        </div>
      )}
    </div>
  );
}
