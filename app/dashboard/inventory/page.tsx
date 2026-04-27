"use client";

import { useState, useEffect } from "react";
import { 
  Package, AlertTriangle, XOctagon, Search, Plus, 
  SlidersHorizontal, Eye, Trash2, ChevronDown, User, Check, ArrowLeft
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, addDoc, serverTimestamp, deleteDoc, doc, orderBy, limit, updateDoc } from "firebase/firestore";

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeView, setActiveView] = useState("inventory");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    qty: "",
    location: "",
    category: "Equipment"
  });
  const [borrowResidentId, setBorrowResidentId] = useState("");
  const [borrowResidentInfo, setBorrowResidentInfo] = useState<any>(null);
  const [residents, setResidents] = useState<any[]>([]);
  const [successDialogMessage, setSuccessDialogMessage] = useState("");
  const [validationModal, setValidationModal] = useState({ isOpen: false, message: "" });
  const [activities, setActivities] = useState<any[]>([]);
  
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [filterCategory, setFilterCategory] = useState("All");

  const [borrowRecords, setBorrowRecords] = useState<any[]>([]);
  const [returnItemModal, setReturnItemModal] = useState<any>(null);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [itemToView, setItemToView] = useState<any>(null);

  // Real-time listener for residents and inventory and activities
  useEffect(() => {
    const unsubR = onSnapshot(query(collection(db, "residents")), (snap) => {
      setResidents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubI = onSnapshot(query(collection(db, "inventory")), (snap) => {
      setItems(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubA = onSnapshot(query(collection(db, "activities"), orderBy("createdAt", "desc"), limit(4)), (snap) => {
      setActivities(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubB = onSnapshot(query(collection(db, "borrow_records"), orderBy("createdAt", "desc")), (snap) => {
      setBorrowRecords(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => { unsubR(); unsubI(); unsubA(); unsubB(); };
  }, []);

  const handleResidentIdSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setBorrowResidentId(val);
    const found = residents.find(r => r.residentId === val || r.id === val);
    setBorrowResidentInfo(found || null);
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.qty) {
      setValidationModal({ isOpen: true, message: "Please enter both item name and quantity." });
      return;
    }

    const parsedQty = parseInt(newItem.qty) || 0;
    const itemToAdd = {
      name: newItem.name,
      category: newItem.category,
      qty: parsedQty,
      inStock: parsedQty,
      status: parsedQty > 5 ? "Available" : "Low Stock",
      lastUpdated: new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }).toLowerCase(),
      location: newItem.location || "N/A"
    };

    try {
       await addDoc(collection(db, "inventory"), itemToAdd);
       await addDoc(collection(db, "activities"), {
          title: "New Inventory Added",
          description: `Added ${parsedQty} units of ${newItem.name}`,
          type: "inventory",
          createdAt: serverTimestamp()
       });
       setIsAddModalOpen(false);
       setNewItem({ name: "", qty: "", location: "", category: "Equipment" });
       setSuccessDialogMessage("The inventory item has been successfully added to the system.");
    } catch (err) {
       console.error(err);
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await addDoc(collection(db, "recycle_bin"), {
        sourceCollection: "inventory",
        sourceId: itemToDelete.id,
        itemType: "Inventory Item",
        title: itemToDelete.name || "Inventory Item",
        data: itemToDelete,
        deletedAt: serverTimestamp(),
        deleteAfterDays: 30
      });
      await deleteDoc(doc(db, "inventory", itemToDelete.id));
      await addDoc(collection(db, "activities"), {
         title: "Inventory Deleted",
         description: `Deleted ${itemToDelete.name} from inventory`,
         type: "inventory",
         createdAt: serverTimestamp()
      });
      setItemToDelete(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBorrowItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const itemData = formData.get("item") as string;
    const qtyStr = formData.get("qty") as string;
    const borrowDate = formData.get("borrowDate") as string;
    const returnDate = formData.get("returnDate") as string;

    if (!borrowResidentId || !itemData || !qtyStr || !borrowDate || !returnDate) {
      setValidationModal({ isOpen: true, message: "Please fill out all required fields to borrow an item." });
      return;
    }

    const [itemId, itemName] = itemData.split("|");
    const qty = Number(qtyStr);
    const selectedInvItem = items.find(i => i.id === itemId);

    if (!selectedInvItem || Number(selectedInvItem.inStock) < qty) {
      setValidationModal({ isOpen: true, message: `Not enough stock for ${itemName}. Available: ${selectedInvItem?.inStock || 0}` });
      return;
    }

    try {
      await addDoc(collection(db, "borrow_records"), {
          residentId: borrowResidentId,
          residentName: borrowResidentInfo ? `${borrowResidentInfo.firstName} ${borrowResidentInfo.lastName}` : "Unknown",
          itemId: itemId,
          item: itemName,
          qty: qty,
          borrowDate: borrowDate,
          returnDate: returnDate,
          status: "Pending",
          createdAt: serverTimestamp()
      });
      
      const newInStock = Number(selectedInvItem.inStock) - qty;
      await updateDoc(doc(db, "inventory", itemId), {
          inStock: newInStock,
          status: newInStock > 5 ? "Available" : newInStock > 0 ? "Low Stock" : "Out of Stock",
          lastUpdated: new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }).toLowerCase()
      });
      await addDoc(collection(db, "activities"), {
          title: "Item Borrowed",
          description: `A resident just borrowed ${qty}x ${itemName} from the inventory.`,
          type: "inventory",
          createdAt: serverTimestamp()
      });
      setIsBorrowModalOpen(false);
      setBorrowResidentId("");
      setBorrowResidentInfo(null);
      setSuccessDialogMessage("The item has been successfully dispensed. Transaction recorded.");
    } catch (err) { console.error(err); }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.id.includes(searchTerm);
    const matchesFilter = filterCategory === "All" || item.category === filterCategory;
    return matchesSearch && matchesFilter;
  });

  return (
    <>
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
            <p className="text-2xl font-black text-slate-800 dark:text-white">{items.length}</p>
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
            <p className="text-2xl font-black text-slate-800 dark:text-white">{items.filter(i => i.status === 'Low Stock').length}</p>
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
            <p className="text-[11px] font-bold text-slate-500 dark:text-[#9CA3AF] mb-1">Total Items Out of Stock</p>
            <p className="text-2xl font-black text-slate-800 dark:text-white">{items.filter(i => i.status === 'Out of Stock' || parseInt(i.inStock) === 0).length}</p>
          </div>
        </div>

        {/* Inventory Overview Table */}
        {activeView === "inventory" && (
        <div className="w-full bg-white dark:bg-[#1F2937] rounded-3xl border border-slate-200 dark:border-[#374151] shadow-sm dark:shadow-none overflow-hidden flex flex-col flex-1 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
              </div>
              <div className="relative shrink-0">
                <button 
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  className={`p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors flex items-center justify-center ${showFilterMenu || filterCategory !== 'All' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 border-blue-200' : 'bg-slate-50 dark:bg-[#111827] text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                  <SlidersHorizontal size={16} />
                </button>
                {showFilterMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-10 overflow-hidden py-1">
                    <div className="px-3 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700 mb-1">
                       Filter Category
                    </div>
                    {["All", "Equipment", "Supplies", "Furniture", "Vehicles"].map(cat => (
                      <button 
                        key={cat}
                        onClick={() => { setFilterCategory(cat); setShowFilterMenu(false); }}
                        className={`w-full text-left px-4 py-2 text-sm font-semibold transition-colors ${filterCategory === cat ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex space-x-2 shrink-0">
                <button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-[#2563EB]/20 dark:shadow-none transition-colors"
                >
                  <Plus size={16} className="mr-1" strokeWidth={3} /> Add Item
                </button>
                <button 
                  onClick={() => setIsBorrowModalOpen(true)}
                  className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-md shadow-[#2563EB]/20 dark:shadow-none"
                >
                  Borrow Item
                </button>
                <button onClick={() => setActiveView(activeView === "inventory" ? "returning" : "inventory")} className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-md shadow-[#2563EB]/20 dark:shadow-none">
                  {activeView === "inventory" ? "Returning Items" : "Inventory"}
                </button>
              </div>
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
                         <button onClick={() => setItemToView(item)} className="bg-[#E5E7EB] dark:bg-[#4B5563] hover:bg-[#D1D5DB] dark:hover:bg-[#6B7280] text-slate-700 dark:text-[#F9FAFB] px-5 py-2 rounded-xl text-xs font-black transition-colors shadow-sm">
                           View
                         </button>
                         <button onClick={() => setItemToDelete(item)} className="bg-[#EF4444] hover:bg-[#DC2626] text-white px-5 py-2 rounded-xl text-xs font-black transition-colors shadow-sm shadow-[#EF4444]/20 border border-[#DC2626]">
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
        )}

        {/* Returning Views */}
        {activeView === "returning" && (
           <div className="w-full bg-white dark:bg-[#1F2937] rounded-3xl border border-slate-200 dark:border-[#374151] shadow-sm dark:shadow-none overflow-hidden flex flex-col flex-1 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-[#374151]">
                <div className="flex items-center space-x-3">
                  <button onClick={() => setActiveView("inventory")} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer p-1">
                     <ArrowLeft size={24} />
                  </button>
                  <h2 className="text-xl font-bold text-slate-800 dark:text-[#F9FAFB] tracking-tight">Returning Items</h2>
                </div>
             </div>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
                
                {(() => {
                  const groupedBorrows = borrowRecords.filter(r => r.status === 'Pending').reduce((acc: any, record) => {
                    if (!acc[record.residentId]) {
                      acc[record.residentId] = {
                         residentName: record.residentName,
                         residentId: record.residentId,
                         items: []
                      };
                    }
                    acc[record.residentId].items.push(record);
                    return acc;
                  }, {});
                  
                  const groups = Object.values(groupedBorrows);
                  if (groups.length === 0) {
                    return (
                      <div className="col-span-full flex flex-col items-center justify-center p-12 text-slate-500">
                        <Package size={48} className="mb-4 opacity-50" />
                        <p className="font-bold">No items pending to be returned.</p>
                      </div>
                    );
                  }
                  
                  return groups.map((group: any) => (
                    <div key={group.residentId} className="border border-slate-200 dark:border-[#374151] rounded-2xl p-6 flex flex-col items-center bg-slate-50 dark:bg-[#111827] shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-20 h-20 rounded-full border border-slate-200 dark:border-[#374151] overflow-hidden mb-4 bg-white dark:bg-[#1F2937] flex items-center justify-center">
                         <User size={30} className="text-slate-400" />
                      </div>
                      <h3 className="text-sm font-extrabold text-slate-800 dark:text-[#F9FAFB] mb-1 text-center">{group.residentName}</h3>
                      <span className="text-[11px] font-bold text-[#EAB308] bg-[#FEF9C3] dark:bg-[#EAB308]/20 px-3 py-1 rounded-full mb-3">{group.items.length} Items Pending</span>
                      <button onClick={() => setReturnItemModal(group)} className="flex items-center text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] bg-white dark:bg-[#1F2937] border border-slate-200 dark:border-[#374151] px-4 py-2 rounded-xl mt-auto w-full justify-center transition-colors">
                         View <Eye size={14} className="ml-2" />
                      </button>
                    </div>
                  ));
                })()}

             </div>
           </div>
        )}

      </div>

      {/* Right Sidebar Widget */}
      <div className="w-full xl:w-[280px] flex flex-col space-y-6 shrink-0 mt-2 xl:mt-[60px]">
        {/* Right Sidebar Widgets */}
        <div className="bg-transparent rounded-[32px] flex flex-col space-y-5 h-full min-h-[400px]">
          
          <div className="bg-white dark:bg-[#1F2937] border border-slate-200 dark:border-[#374151] rounded-2xl p-6 shadow-sm dark:shadow-none">
            <div className="mb-6">
               <h4 className="text-[13px] font-black text-slate-800 dark:text-[#F9FAFB] mb-1">Borrowed Items:</h4>
               <p className="text-4xl font-normal text-slate-800 dark:text-[#F9FAFB] leading-none tracking-tight">{String(borrowRecords.filter(r => r.status === 'Pending').length).padStart(3, '0')}</p>
            </div>
            <div>
               <h4 className="text-[13px] font-black text-slate-800 dark:text-[#F9FAFB] mb-1">Returned Items:</h4>
               <p className="text-2xl font-normal text-slate-800 dark:text-[#F9FAFB] leading-none tracking-tight">{String(borrowRecords.filter(r => r.status === 'Returned').length).padStart(3, '0')}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1F2937] border border-slate-200 dark:border-[#374151] rounded-2xl p-6 shadow-sm dark:shadow-none flex-1">
             <h4 className="text-sm font-black text-slate-800 dark:text-[#F9FAFB] mb-6">Notifications</h4>
             <ul className="space-y-4">
                {activities.length === 0 ? (
                  <li className="text-xs font-bold text-slate-500 text-center py-4">No new notifications</li>
                ) : activities.map(act => (
                  <li key={act.id} className="flex items-start">
                     <div className={`w-1.5 h-1.5 rounded-full mt-[6px] mr-3 shrink-0 ${act.type === 'inventory' ? 'bg-[#EAB308]' : 'bg-[#EF4444]'}`}></div>
                     <div>
                        <p className="text-[12px] font-bold text-slate-700 dark:text-[#F9FAFB] leading-tight">{act.title}</p>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-[#9CA3AF] mt-0.5">{act.createdAt ? new Date(act.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}</p>
                     </div>
                  </li>
                ))}
             </ul>
          </div>
          
          <div className="bg-white dark:bg-[#1F2937] border border-slate-200 dark:border-[#374151] rounded-2xl p-6 shadow-sm dark:shadow-none">
             <h4 className="text-sm font-black text-slate-800 dark:text-[#F9FAFB] mb-4">Most Borrowed Items</h4>
             <ul className="space-y-4">
                {(() => {
                  const itemCounts: Record<string, number> = {};
                  borrowRecords.forEach(r => {
                    if (r.item) {
                      itemCounts[r.item] = (itemCounts[r.item] || 0) + (r.qty || 1);
                    }
                  });
                  const sorted = Object.entries(itemCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
                  if (sorted.length === 0) {
                    return <li className="text-xs font-bold text-slate-500 text-center py-4">No borrowed items yet</li>;
                  }
                  return sorted.map(([name, count]) => (
                    <li key={name} className="flex justify-between items-center text-xs font-bold text-slate-600 dark:text-[#9CA3AF]">
                      <span>{name}</span>
                      <span className="text-[#2563EB] bg-[#EFF6FF] dark:bg-[#1E3A8A]/30 px-2 py-1 rounded-md">{count}x</span>
                    </li>
                  ));
                })()}
             </ul>
          </div>

        </div>
      </div>

    </div>

      {/* Add Item Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-white dark:bg-[#1E293B] w-full max-w-[420px] rounded-[32px] shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden border border-slate-200 dark:border-[#334155]">
            <div className="px-8 pt-8 pb-6">
              <h2 className="text-[22px] font-black text-slate-800 dark:text-[#F9FAFB]">Add Inventory Item</h2>
            </div>
            
            <form onSubmit={handleAddItem} className="px-8 pb-8 space-y-5">
              <div>
                <label className="block text-[13px] font-bold text-slate-700 dark:text-[#CBD5E1] mb-1.5">Item name:</label>
                <input 
                  type="text" 
                  value={newItem.name}
                  onChange={e => setNewItem({...newItem, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200/80 dark:border-[#334155] bg-slate-50 dark:bg-[#0F172A] text-sm font-semibold text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#50A89A]/50 focus:border-[#50A89A] transition-all placeholder:text-slate-400 placeholder:font-medium"
                  placeholder="Enter item name"
                  required
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-slate-700 dark:text-[#CBD5E1] mb-1.5">Quantity:</label>
                <input 
                  type="number" 
                  value={newItem.qty}
                  onChange={e => setNewItem({...newItem, qty: e.target.value})}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200/80 dark:border-[#334155] bg-slate-50 dark:bg-[#0F172A] text-sm font-semibold text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#50A89A]/50 focus:border-[#50A89A] transition-all placeholder:text-slate-400 placeholder:font-medium"
                  placeholder="0"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-slate-700 dark:text-[#CBD5E1] mb-1.5">Location:</label>
                <input 
                  type="text" 
                  value={newItem.location}
                  onChange={e => setNewItem({...newItem, location: e.target.value})}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200/80 dark:border-[#334155] bg-slate-50 dark:bg-[#0F172A] text-sm font-semibold text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#50A89A]/50 focus:border-[#50A89A] transition-all placeholder:text-slate-400 placeholder:font-medium"
                  placeholder="Enter storage location"
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-slate-700 dark:text-[#CBD5E1] mb-1.5">Category:</label>
                <div className="relative">
                  <select 
                    value={newItem.category}
                    onChange={e => setNewItem({...newItem, category: e.target.value})}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200/80 dark:border-[#334155] bg-slate-50 dark:bg-[#0F172A] text-sm font-semibold text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#50A89A]/50 focus:border-[#50A89A] transition-all appearance-none cursor-pointer"
                  >
                    <option value="Equipment">Equipment</option>
                    <option value="Supplies">Supplies</option>
                    <option value="Vehicles">Vehicles</option>
                    <option value="Others">Others</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-6 mt-4 border-t border-slate-100 dark:border-[#334155]">
                <button 
                  type="submit"
                  className="flex-1 bg-[#5aa697] hover:bg-[#4d9082] text-white px-6 py-3.5 rounded-xl text-sm font-bold transition-all shadow-[0_4px_12px_rgba(90,166,151,0.25)] active:scale-[0.98]"
                >
                  Save Item
                </button>
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 bg-[#E2E8F0] dark:bg-[#334155] hover:bg-[#CBD5E1] dark:hover:bg-[#475569] text-slate-700 dark:text-[#F8FAFC] px-6 py-3.5 rounded-xl text-sm font-bold transition-all active:scale-[0.98]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Borrow Item Modal */}
      {isBorrowModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-white dark:bg-[#1E293B] w-full max-w-[460px] rounded-[32px] shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden border border-slate-200 dark:border-[#334155]">
            <div className="px-8 pt-8 pb-6">
              <h2 className="text-2xl font-black text-slate-800 dark:text-[#F9FAFB] tracking-tight mb-6">Borrow Item</h2>
              
              <form onSubmit={handleBorrowItem}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-[#9CA3AF] mb-1.5 ml-1">Resident ID:</label>
                    <input autoFocus required type="text" value={borrowResidentId} onChange={handleResidentIdSearch} className="w-full bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#374151] rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#2563EB]" placeholder="e.g. RC-6272" />
                  </div>
                  
                  {/* Auto-filled Resident Info */}
                  <div className="bg-slate-50 dark:bg-[#0F172A] rounded-xl p-4 border border-slate-200 dark:border-[#374151] flex flex-col items-center">
                     <h3 className="text-sm font-extrabold text-slate-800 dark:text-[#F9FAFB] mb-3">Resident Info (Auto)</h3>
                     <div className="w-full space-y-2">
                       <div className="flex text-sm text-slate-600 dark:text-[#9CA3AF] font-bold">
                          <span className="w-20 shrink-0">Name:</span> 
                          <span className="text-slate-800 dark:text-white font-normal truncate">
                              {borrowResidentInfo ? `${borrowResidentInfo.firstName} ${borrowResidentInfo.lastName}` : '—'}
                          </span>
                       </div>
                       <div className="flex text-sm text-slate-600 dark:text-[#9CA3AF] font-bold">
                          <span className="w-20 shrink-0">Address:</span> 
                          <span className="text-slate-800 dark:text-white font-normal truncate">
                              {borrowResidentInfo ? `${borrowResidentInfo.address}, ${borrowResidentInfo.city}` : '—'}
                          </span>
                       </div>
                     </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-[#9CA3AF] mb-1.5 ml-1">Item:</label>
                    <div className="relative">
                       <select name="item" className="w-full bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#374151] rounded-xl px-4 py-3 cursor-pointer text-sm font-bold text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#2563EB] appearance-none">
                          {items.filter(i => parseInt(i.inStock) > 0).map(invItem => (
                            <option key={invItem.id} value={`${invItem.id}|${invItem.name}`}>{invItem.name} (In stock: {invItem.inStock})</option>
                          ))}
                          {items.filter(i => parseInt(i.inStock) > 0).length === 0 && (
                            <option value="" disabled>No items available</option>
                          )}
                       </select>
                       <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                          <ChevronDown size={16} className="text-slate-400" />
                       </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-[#9CA3AF] mb-1.5 ml-1">Quantity:</label>
                    <input name="qty" required type="number" min="1" className="w-full bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#374151] rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#2563EB]" defaultValue="1" />
                  </div>
                  
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-[#9CA3AF] mb-1.5 ml-1">Borrow Date:</label>
                    <input name="borrowDate" required type="date" className="w-full bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#374151] rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#2563EB]" />
                  </div>
                  
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 dark:text-[#9CA3AF] mb-1.5 ml-1">Return Date:</label>
                    <input name="returnDate" required type="date" className="w-full bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#374151] rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-[#F9FAFB] focus:outline-none focus:border-[#2563EB]" />
                  </div>
                </div>

                <div className="flex space-x-3 mt-8">
                  <button type="submit" className="flex-1 bg-[#10B981] hover:bg-[#059669] text-white py-3.5 rounded-xl font-bold tracking-wide transition-colors shadow-lg shadow-[#10B981]/20 border border-[#10B981] dark:border-none">
                    Save
                  </button>
                  <button type="button" onClick={() => setIsBorrowModalOpen(false)} className="flex-1 bg-slate-100 dark:bg-[#334155] hover:bg-slate-200 dark:hover:bg-[#475569] text-slate-700 dark:text-[#F8FAFC] py-3.5 rounded-xl font-bold tracking-wide transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification Modal */}
      {successDialogMessage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#111827] w-full max-w-sm rounded-[24px] shadow-2xl border border-slate-200 dark:border-[#374151] overflow-hidden flex flex-col items-center p-8 text-center scale-in-95 duration-200">
            <div className="w-24 h-24 bg-[#10B981] rounded-full flex items-center justify-center mb-6 shadow-lg shadow-[#10B981]/20 dark:shadow-none">
              <Check size={48} className="text-white" strokeWidth={4} />
            </div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-[#F9FAFB] mb-2 tracking-tight">Success</h2>
            <p className="text-slate-500 dark:text-[#9CA3AF] text-sm mb-8 font-medium px-4 leading-relaxed">
              {successDialogMessage}
            </p>
            <button 
              onClick={() => setSuccessDialogMessage("")}
              className="w-full bg-[#10B981] hover:bg-[#059669] text-white px-6 py-3 rounded-xl text-sm font-bold shadow-md shadow-[#10B981]/20 dark:shadow-none transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Item Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#111827] w-full max-w-sm rounded-[24px] shadow-2xl border border-slate-200 dark:border-[#374151] overflow-hidden flex flex-col items-center p-8 text-center scale-in-95 duration-200">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
              <Trash2 size={36} className="text-red-500" strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-[#F9FAFB] mb-2 tracking-tight">Delete Item?</h2>
            <p className="text-slate-500 dark:text-[#9CA3AF] text-sm mb-8 font-medium leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-slate-800 dark:text-slate-200">{itemToDelete.name}</span>? This action cannot be undone.
            </p>
            <div className="flex space-x-3 w-full">
              <button 
                onClick={() => setItemToDelete(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-[#374151] dark:hover:bg-[#4B5563] text-slate-700 dark:text-[#F9FAFB] px-4 py-3 rounded-xl text-sm font-bold transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 bg-[#EF4444] hover:bg-[#DC2626] text-white px-4 py-3 rounded-xl text-sm font-bold shadow-md shadow-[#EF4444]/20 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Item View Modal */}
      {itemToView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setItemToView(null)}>
          <div className="bg-white dark:bg-[#111827] w-full max-w-[400px] rounded-[24px] shadow-2xl border border-slate-200 dark:border-[#374151] overflow-hidden flex flex-col p-8 relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setItemToView(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-[#F9FAFB] transition-colors">
              <XOctagon size={20} />
            </button>
            <div className="flex flex-col items-center mb-6">
              <div className="w-20 h-20 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center mb-4">
                <Package size={36} />
              </div>
              <h2 className="text-xl font-black text-slate-800 dark:text-[#F9FAFB] text-center">{itemToView.name}</h2>
              <p className="text-sm font-bold text-slate-500">{itemToView.id}</p>
            </div>
            
            <div className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                 <div className="bg-slate-50 dark:bg-[#1F2937] p-3 rounded-xl border border-slate-100 dark:border-[#374151]">
                   <p className="text-xs font-bold text-slate-400 dark:text-[#9CA3AF]">Category</p>
                   <p className="text-sm font-bold text-slate-800 dark:text-[#F9FAFB]">{itemToView.category}</p>
                 </div>
                 <div className="bg-slate-50 dark:bg-[#1F2937] p-3 rounded-xl border border-slate-100 dark:border-[#374151]">
                   <p className="text-xs font-bold text-slate-400 dark:text-[#9CA3AF]">Total Qty</p>
                   <p className="text-sm font-bold text-slate-800 dark:text-[#F9FAFB]">{itemToView.qty}</p>
                 </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div className="bg-slate-50 dark:bg-[#1F2937] p-3 rounded-xl border border-slate-100 dark:border-[#374151]">
                   <p className="text-xs font-bold text-slate-400 dark:text-[#9CA3AF]">In Stock</p>
                   <p className="text-sm font-bold text-slate-800 dark:text-[#F9FAFB]">{itemToView.inStock}</p>
                 </div>
                 <div className="bg-slate-50 dark:bg-[#1F2937] p-3 rounded-xl border border-slate-100 dark:border-[#374151]">
                   <p className="text-xs font-bold text-slate-400 dark:text-[#9CA3AF]">Status</p>
                   <p className={`text-sm font-bold ${itemToView.status === 'Available' ? 'text-emerald-500' : itemToView.status === 'Low Stock' ? 'text-orange-500' : 'text-red-500'}`}>{itemToView.status}</p>
                 </div>
               </div>
               <div className="bg-slate-50 dark:bg-[#1F2937] p-3 rounded-xl border border-slate-100 dark:border-[#374151]">
                 <p className="text-xs font-bold text-slate-400 dark:text-[#9CA3AF]">Location</p>
                 <p className="text-sm font-bold text-slate-800 dark:text-[#F9FAFB]">{itemToView.location || "N/A"}</p>
               </div>
               <div className="bg-slate-50 dark:bg-[#1F2937] p-3 rounded-xl border border-slate-100 dark:border-[#374151]">
                 <p className="text-xs font-bold text-slate-400 dark:text-[#9CA3AF]">Last Updated</p>
                 <p className="text-sm font-bold text-slate-800 dark:text-[#F9FAFB]">{itemToView.lastUpdated}</p>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Validation Modal */}
      {validationModal.isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
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

      {/* Return Item Modal */}
      {returnItemModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setReturnItemModal(null)}>
          <div className="bg-white dark:bg-[#111827] w-full max-w-xl rounded-[24px] shadow-2xl border border-slate-200 dark:border-[#374151] overflow-hidden flex flex-col scale-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-200 dark:border-[#374151] flex items-center justify-between">
              <h2 className="text-[15px] font-bold text-slate-800 dark:text-[#F9FAFB]">Returning Items - {returnItemModal.residentName}</h2>
              <button onClick={() => setReturnItemModal(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><XOctagon size={18} /></button>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-[#1F2937] max-h-[60vh] overflow-y-auto">
               <div className="space-y-4">
                  {returnItemModal.items.map((record: any) => (
                    <div key={record.id} className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#374151] p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center shadow-sm gap-4">
                       <div>
                         <h4 className="font-bold text-slate-800 dark:text-[#F9FAFB] text-sm">{record.qty}x {record.item}</h4>
                         <p className="text-xs text-slate-500 mt-1">Borrowed: {record.borrowDate} | Due: {record.returnDate}</p>
                       </div>
                       <button 
                         onClick={async () => {
                            await updateDoc(doc(db, "borrow_records", record.id), { status: "Returned", returnedAt: serverTimestamp() });
                            
                            if (record.itemId) {
                               const invItem = items.find(i => i.id === record.itemId);
                               if (invItem) {
                                  const newInStock = Number(invItem.inStock) + record.qty;
                                  await updateDoc(doc(db, "inventory", record.itemId), {
                                      inStock: newInStock,
                                      status: newInStock > 5 ? "Available" : newInStock > 0 ? "Low Stock" : "Out of Stock"
                                  });
                               }
                            }

                            await addDoc(collection(db, "activities"), {
                                title: "Item Returned",
                                description: `${record.residentName} returned ${record.qty}x ${record.item}.`,
                                type: "inventory",
                                createdAt: serverTimestamp()
                            });
                            setSuccessDialogMessage(`${record.qty}x ${record.item} successfully returned.`);
                            setReturnItemModal((prev: any) => ({ ...prev, items: prev.items.filter((i: any) => i.id !== record.id) }));
                         }}
                         className="bg-[#10B981] hover:bg-[#059669] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap w-full sm:w-auto text-center"
                       >
                         Mark Returned
                       </button>
                    </div>
                  ))}
                  {returnItemModal.items.length === 0 && (
                     <p className="text-sm font-bold text-slate-500 text-center py-4">All items have been returned.</p>
                  )}
               </div>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
