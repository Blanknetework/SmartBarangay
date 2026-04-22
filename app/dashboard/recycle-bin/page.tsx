"use client";

import { useEffect, useMemo, useState } from "react";
import { db } from "@/lib/firebase";
import { addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, orderBy, query, serverTimestamp, where } from "firebase/firestore";
import { RotateCcw, Trash2 } from "lucide-react";

type BinItem = {
  id: string;
  sourceCollection: string;
  sourceId: string;
  itemType: string;
  title: string;
  data: any;
  deletedAt?: any;
  deleteAfterDays?: number;
};

export default function RecycleBinPage() {
  const [items, setItems] = useState<BinItem[]>([]);
  const [workingId, setWorkingId] = useState<string>("");

  useEffect(() => {
    const runCleanup = async () => {
      const now = new Date();
      const threshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const oldItemsQuery = query(collection(db, "recycle_bin"), where("deletedAt", "<", threshold));
      const oldItems = await getDocs(oldItemsQuery);
      await Promise.all(oldItems.docs.map((d) => deleteDoc(doc(db, "recycle_bin", d.id))));
    };

    runCleanup().catch(console.error);

    const unsub = onSnapshot(query(collection(db, "recycle_bin"), orderBy("deletedAt", "desc")), (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() } as BinItem)));
    });
    return () => unsub();
  }, []);

  const restoreItem = async (item: BinItem) => {
    setWorkingId(item.id);
    try {
      const payload = { ...(item.data || {}), restoredAt: serverTimestamp() };
      await addDoc(collection(db, item.sourceCollection), payload);
      await deleteDoc(doc(db, "recycle_bin", item.id));
    } catch (error) {
      console.error("Restore failed:", error);
      alert("Failed to restore item.");
    } finally {
      setWorkingId("");
    }
  };

  const deleteForever = async (item: BinItem) => {
    setWorkingId(item.id);
    try {
      await deleteDoc(doc(db, "recycle_bin", item.id));
    } catch (error) {
      console.error("Permanent delete failed:", error);
      alert("Failed to delete permanently.");
    } finally {
      setWorkingId("");
    }
  };

  const rows = useMemo(() => items, [items]);
  const getDaysLeft = (item: BinItem) => {
    if (!item.deletedAt?.toDate) return "—";
    const deletedDate = item.deletedAt.toDate() as Date;
    const maxDays = item.deleteAfterDays || 30;
    const expiry = new Date(deletedDate.getTime() + maxDays * 24 * 60 * 60 * 1000);
    const diffMs = expiry.getTime() - Date.now();
    const days = Math.ceil(diffMs / (24 * 60 * 60 * 1000));
    return days <= 0 ? "Expires today" : `${days} day(s) left`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-[#F9FAFB] tracking-tight">Recycle Bin</h1>
        <p className="text-sm font-medium text-slate-500 dark:text-[#9CA3AF] mt-1">
          Deleted records stay here for 30 days, then are removed automatically.
        </p>
      </div>

      <div className="bg-white dark:bg-[#1F2937] rounded-2xl border border-slate-200 dark:border-[#374151] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-200 dark:border-[#374151]">
                <th className="px-5 py-4 text-left text-xs font-bold text-slate-500 dark:text-[#9CA3AF]">Type</th>
                <th className="px-5 py-4 text-left text-xs font-bold text-slate-500 dark:text-[#9CA3AF]">Title</th>
                <th className="px-5 py-4 text-left text-xs font-bold text-slate-500 dark:text-[#9CA3AF]">Source</th>
                <th className="px-5 py-4 text-left text-xs font-bold text-slate-500 dark:text-[#9CA3AF]">Deleted At</th>
                <th className="px-5 py-4 text-left text-xs font-bold text-slate-500 dark:text-[#9CA3AF]">Auto Delete</th>
                <th className="px-5 py-4 text-right text-xs font-bold text-slate-500 dark:text-[#9CA3AF]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((item) => (
                <tr key={item.id} className="border-b border-slate-100 dark:border-[#374151]/50 last:border-0">
                  <td className="px-5 py-4 text-sm font-semibold text-slate-700 dark:text-[#E5E7EB]">{item.itemType || "Record"}</td>
                  <td className="px-5 py-4 text-sm font-bold text-slate-800 dark:text-[#F9FAFB]">{item.title || "Untitled"}</td>
                  <td className="px-5 py-4 text-sm font-semibold text-slate-500 dark:text-[#9CA3AF]">{item.sourceCollection}</td>
                  <td className="px-5 py-4 text-sm font-semibold text-slate-500 dark:text-[#9CA3AF]">
                    {item.deletedAt?.toDate ? item.deletedAt.toDate().toLocaleString() : "—"}
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-slate-500 dark:text-[#9CA3AF]">{getDaysLeft(item)}</td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        disabled={workingId === item.id}
                        onClick={() => restoreItem(item)}
                        className="bg-[#DBEAFE] hover:bg-[#BFDBFE] text-[#1D4ED8] px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 inline-flex items-center gap-1"
                      >
                        <RotateCcw size={14} /> Restore
                      </button>
                      <button
                        disabled={workingId === item.id}
                        onClick={() => deleteForever(item)}
                        className="bg-[#FEE2E2] hover:bg-[#FECACA] text-[#DC2626] px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 inline-flex items-center gap-1"
                      >
                        <Trash2 size={14} /> Delete Forever
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm font-semibold text-slate-500 dark:text-[#9CA3AF]">
                    Recycle bin is empty.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
