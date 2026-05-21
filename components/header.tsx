"use client";

import { Bell, Search, Settings, User, Moon, Sun, Menu, LogOut, Edit, Trash2, X, Camera, CheckCircle2, Loader2, ShieldCheck, ShieldAlert, FileText } from "lucide-react";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { navItems } from "@/components/sidebar";
import { cn } from "@/lib/utils";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, orderBy, limit, doc, getDoc, setDoc } from "firebase/firestore";
import { auth } from "@/lib/firebase";
import { useAuth } from "./auth-provider";
import { updateProfile } from "firebase/auth";

export function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { role, setRole } = useAuth();

  const handleLogout = () => {
    auth.signOut().then(() => {
      setRole(null);
      router.push("/");
    }).catch((err) => {
      console.error(err);
      setRole(null);
      router.push("/");
    });
  };

  const [isOpen, setIsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Edit Profile state
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    displayName: "",
    email: "",
    phone: "",
    address: "",
    bio: "",
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileToast, setProfileToast] = useState("");

  const [vpnStatus, setVpnStatus] = useState<boolean | null>(null);
  const [vpnIp, setVpnIp] = useState<string>("");

  useEffect(() => {
    setMounted(true);
    const unsub = onSnapshot(query(collection(db, "activities"), orderBy("createdAt", "desc"), limit(5)), (snap) => {
       setNotifications(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Fetch VPN status for demo purposes
    fetch("/api/vpn-status")
      .then(res => res.json())
      .then(data => {
        setVpnStatus(data.isTailscaleVpn);
        setVpnIp(data.ipAddress);
      })
      .catch(() => setVpnStatus(false));

    return () => unsub();
  }, []);

  // Load profile data when edit modal opens
  const openEditProfile = async () => {
    setShowProfileMenu(false);
    const user = auth.currentUser;
    if (user) {
      // Try to load extra profile data from Firestore
      try {
        const profileDoc = await getDoc(doc(db, "profiles", user.uid));
        const data = profileDoc.exists() ? profileDoc.data() : {};
        setProfileForm({
          displayName: user.displayName || data?.displayName || "",
          email: user.email || "",
          phone: data?.phone || "",
          address: data?.address || "",
          bio: data?.bio || "",
        });
      } catch {
        setProfileForm({
          displayName: user.displayName || "",
          email: user.email || "",
          phone: "",
          address: "",
          bio: "",
        });
      }
    } else {
      // Mock user (no Firebase auth user)
      const savedProfile = localStorage.getItem("smartbarangay_profile");
      const data = savedProfile ? JSON.parse(savedProfile) : {};
      setProfileForm({
        displayName: data.displayName || role || "Admin",
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || "",
        bio: data.bio || "",
      });
    }
    setShowEditProfile(true);
  };

  const handleSaveProfile = async () => {
    setProfileSaving(true);
    try {
      const user = auth.currentUser;
      if (user) {
        // Update Firebase Auth display name
        await updateProfile(user, { displayName: profileForm.displayName });
        // Save extra fields to Firestore profiles collection
        await setDoc(doc(db, "profiles", user.uid), {
          displayName: profileForm.displayName,
          phone: profileForm.phone,
          address: profileForm.address,
          bio: profileForm.bio,
          updatedAt: new Date(),
        }, { merge: true });
      } else {
        // Mock user — save to localStorage
        localStorage.setItem("smartbarangay_profile", JSON.stringify(profileForm));
      }
      setProfileToast("Profile updated successfully!");
      setTimeout(() => setProfileToast(""), 3000);
      setShowEditProfile(false);
    } catch (err) {
      console.error("Profile save error:", err);
      setProfileToast("Failed to update profile.");
      setTimeout(() => setProfileToast(""), 3000);
    } finally {
      setProfileSaving(false);
    }
  };

  const inputCls = "w-full bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#374151] rounded-lg px-3 py-2.5 text-sm text-slate-800 dark:text-[#F9FAFB] outline-none focus:ring-2 focus:ring-[#3B82F6]/40 transition-all placeholder:text-slate-400";
  const labelCls = "text-xs font-bold text-slate-500 dark:text-[#9CA3AF] uppercase tracking-wider mb-1.5 block";

  return (
    <>
    <header className="h-20 w-full bg-[#fcfdff] dark:bg-[#0F172A] flex items-center justify-between px-6 sticky top-0 z-50 shadow-sm border-b border-slate-200 dark:border-[#374151] transition-colors">
      {/* Left section: Logo and dark text */}
      <div className="flex items-center space-x-3 w-64 lg:w-[320px]">
        {/* Mobile Menu Trigger */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger className="p-2 -ml-2 mr-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1F2937] text-slate-500 dark:text-[#9CA3AF]">
              <Menu size={24} />
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0 bg-[#fcfdff] dark:bg-[#0F172A] border-r border-slate-200 dark:border-[#374151]">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <SheetDescription className="sr-only">Mobile navigation menu</SheetDescription>
              <div className="flex items-center space-x-3 p-6 border-b border-slate-200 dark:border-[#374151]">
                <Image src="/Barangay1.png" alt="Barangay Logo" width={40} height={40} className="object-contain shrink-0" priority />
                <div className="flex flex-col justify-center">
                  <span className="font-black text-[13px] tracking-tighter text-slate-900 dark:text-[#F9FAFB] leading-none">
                    SMARTBARANGAY
                  </span>
                </div>
              </div>
              <nav className="p-4 space-y-2">
                <div className="px-3 text-[10px] font-bold text-slate-400 dark:text-[#9CA3AF] uppercase tracking-widest mb-4">
                  Main Menu
                </div>
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center space-x-3 rounded-xl px-3 py-3 transition-all font-medium text-sm",
                        isActive
                          ? "bg-[#3B82F6] text-white shadow-md shadow-[#3B82F6]/20 font-semibold"
                          : "bg-transparent text-slate-600 dark:text-[#F9FAFB] hover:bg-slate-100 dark:hover:bg-[#1F2937] hover:text-slate-900 dark:hover:text-white"
                      )}
                    >
                      <Icon size={18} className={cn(isActive ? "text-white" : "text-slate-400 dark:text-[#9CA3AF]", "shrink-0")} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        <Image src="/Barangay1.png" alt="Barangay Logo" width={60} height={60} className="object-contain shrink-0" priority />
        <div className="flex flex-col justify-center hidden sm:flex transition-colors">
          <span className="font-black text-[15px] tracking-tighter text-slate-900 dark:text-[#F9FAFB] leading-none transition-colors">
            SMARTBARANGAY
          </span>
          <span className="text-[7.5px] font-bold text-slate-700 dark:text-[#9CA3AF] mt-[2px] uppercase leading-tight tracking-wider transition-colors">
            Integrated Barangay Management &amp;<br/>Service Information System
          </span>
        </div>
      </div>

      {/* Middle section space filler to push icons to the right */}
      <div className="flex-1"></div>

      {/* Right section: Icons */}
      <div className="flex items-center space-x-2 md:space-x-4 pl-4">
        {mounted && vpnStatus !== null && (
          <div className="hidden md:flex items-center bg-slate-50 dark:bg-[#1F2937] px-3 py-1.5 rounded-full border border-slate-200 dark:border-[#374151]" title={vpnStatus ? `Connected via VPN (${vpnIp})` : `Unsecured Connection (${vpnIp})`}>
            {vpnStatus ? (
              <><ShieldCheck size={16} className="text-emerald-500 mr-2" /><span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">VPN Active</span></>
            ) : (
              <><ShieldAlert size={16} className="text-rose-500 mr-2" /><span className="text-[11px] font-bold text-rose-600 dark:text-rose-400">Unsecured</span></>
            )}
          </div>
        )}

        {mounted && (
          <button 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-[#1F2937] text-slate-500 dark:text-[#9CA3AF] transition-colors ml-2"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        )}

        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)} 
            className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-[#1F2937] text-slate-500 dark:text-[#9CA3AF] transition-colors relative"
          >
            <Bell size={20} />
            {notifications.length > 0 && <span className="absolute top-[8px] right-[8px] w-2.5 h-2.5 bg-[#EF4444] border-[2px] border-[#fcfdff] dark:border-[#0F172A] rounded-full box-content animate-pulse"></span>}
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#1F2937] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#374151] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
               <div className="p-4 border-b border-slate-200 dark:border-[#374151] bg-slate-50 dark:bg-[#111827] flex justify-between items-center">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-[#F9FAFB]">Notifications</h3>
                  <span className="text-[10px] bg-[#3B82F6] text-white px-2 py-0.5 rounded-full font-bold">{notifications.length} New</span>
               </div>
               <div className="max-h-[300px] overflow-y-auto">
                 {notifications.length === 0 ? (
                    <div className="p-6 text-center text-sm font-bold text-slate-500">No new notifications</div>
                 ) : notifications.map(notif => (
                    <div key={notif.id} className="p-4 border-b border-slate-100 dark:border-[#374151]/50 hover:bg-slate-50 dark:hover:bg-[#374151]/30 cursor-pointer transition-colors">
                       <h4 className="text-[13px] font-bold text-slate-800 dark:text-[#F9FAFB]">{notif.title}</h4>
                       <p className="text-xs font-medium text-slate-500 dark:text-[#9CA3AF] mt-1">{notif.description}</p>
                       <p className="text-[9px] text-[#3B82F6] font-bold uppercase mt-2">
                           {notif.createdAt ? new Date(notif.createdAt.toDate()).toLocaleString() : 'Just now'}
                       </p>
                    </div>
                 ))}
               </div>
               <button onClick={() => setShowNotifications(false)} className="w-full p-3 font-bold text-xs text-center text-slate-500 dark:text-[#9CA3AF] hover:text-slate-800 dark:hover:text-white bg-slate-50 dark:bg-[#111827] transition-colors border-t border-slate-200 dark:border-[#374151]">
                  Close Panel
               </button>
            </div>
          )}
        </div>
        <div className="h-6 w-px bg-slate-200 dark:bg-[#374151] mx-2 hidden sm:block"></div>
        <div className="relative">
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="relative w-10 h-10 rounded-full bg-slate-100 dark:bg-[#1F2937] flex items-center justify-center border border-slate-200 dark:border-[#374151] hover:ring-2 hover:ring-slate-200 transition-all overflow-hidden ml-1 shadow-sm dark:shadow-none"
          >
             <Image src="/pfp.png" alt="Profile" width={40} height={40} className="object-cover w-full h-full" />
             <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#22C55E] border-[1.5px] border-[#fcfdff] dark:border-[#0F172A] rounded-full z-10"></span>
          </button>
          
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1F2937] rounded-2xl shadow-xl border border-slate-200 dark:border-[#374151] overflow-hidden z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
               <div className="p-2 space-y-1">
                 <button onClick={openEditProfile} className="w-full text-left px-3 py-2 text-[13px] font-bold text-slate-700 dark:text-[#F9FAFB] hover:bg-slate-100 dark:hover:bg-[#374151] rounded-xl transition-colors flex items-center gap-2">
                   <Edit size={16} className="text-slate-500" />
                   Edit Profile
                 </button>
                 <Link href="/dashboard/recycle-bin" onClick={() => setShowProfileMenu(false)} className="w-full text-left px-3 py-2 text-[13px] font-bold text-slate-700 dark:text-[#F9FAFB] hover:bg-slate-100 dark:hover:bg-[#374151] rounded-xl transition-colors flex items-center gap-2">
                   <Trash2 size={16} className="text-slate-500" />
                   Recycle Bin
                 </Link>
                 {role === "admin" && (
                   <Link href="/dashboard/audit-logs" onClick={() => setShowProfileMenu(false)} className="w-full text-left px-3 py-2 text-[13px] font-bold text-slate-700 dark:text-[#F9FAFB] hover:bg-slate-100 dark:hover:bg-[#374151] rounded-xl transition-colors flex items-center gap-2">
                     <FileText size={16} className="text-slate-500" />
                     Audit Logs
                   </Link>
                 )}
                 <div className="h-px bg-slate-200 dark:bg-[#374151] my-1 mx-2" />
                 <button 
                   onClick={handleLogout}
                   className="w-full text-left px-3 py-2 text-[13px] font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors flex items-center gap-2"
                 >
                   <LogOut size={16} className="text-red-500" />
                   Log Out
                 </button>
               </div>
            </div>
          )}
        </div>
      </div>
    </header>

    {/* Edit Profile Modal */}
    {showEditProfile && (
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/30 backdrop-blur-[2px] animate-in fade-in duration-200">
        <div className="bg-white dark:bg-[#111827] rounded-2xl w-full max-w-[460px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-[#374151] mx-4">
          {/* Modal Header */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-[#374151] bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6]">
            <h2 className="text-lg font-bold text-white">Edit Profile</h2>
            <button onClick={() => setShowEditProfile(false)} className="text-white/70 hover:text-white transition-colors"><X size={20} /></button>
          </div>

          {/* Avatar Section */}
          <div className="flex flex-col items-center pt-6 pb-2">
            <div className="relative">
              <div className="w-[90px] h-[90px] rounded-full border-[3px] border-[#3B82F6] overflow-hidden shadow-lg shadow-[#3B82F6]/20">
                <Image src="/pfp.png" alt="Profile" width={90} height={90} className="object-cover w-full h-full" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#3B82F6] rounded-full flex items-center justify-center border-[2px] border-white dark:border-[#111827] cursor-pointer hover:bg-[#2563EB] transition-colors">
                <Camera size={14} className="text-white" />
              </div>
            </div>
            <p className="text-xs font-bold text-slate-400 dark:text-[#9CA3AF] mt-3 uppercase tracking-wider">
              {role || "User"}
            </p>
          </div>

          {/* Form */}
          <div className="px-6 py-4 space-y-4">
            <div>
              <label className={labelCls}>Display Name</label>
              <input className={inputCls} placeholder="Your Name" value={profileForm.displayName} onChange={e => setProfileForm({ ...profileForm, displayName: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input className={`${inputCls} opacity-60 cursor-not-allowed`} value={profileForm.email} readOnly />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Phone</label>
                <input className={inputCls} placeholder="09XXXXXXXXX" value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>Address</label>
                <input className={inputCls} placeholder="City, Province" value={profileForm.address} onChange={e => setProfileForm({ ...profileForm, address: e.target.value })} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Bio</label>
              <textarea className={`${inputCls} resize-none h-[70px]`} placeholder="Short bio..." value={profileForm.bio} onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })} />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-[#374151] bg-slate-50 dark:bg-[#0F172A]">
            <button onClick={() => setShowEditProfile(false)} className="px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-[#1F2937] border border-slate-200 dark:border-[#374151] rounded-lg hover:bg-slate-50 dark:hover:bg-[#374151] transition-colors">Cancel</button>
            <button onClick={handleSaveProfile} disabled={profileSaving} className="px-5 py-2 text-sm font-bold text-white bg-[#3B82F6] hover:bg-[#2563EB] rounded-lg shadow-md shadow-[#3B82F6]/20 transition-colors disabled:opacity-50 flex items-center gap-2">
              {profileSaving && <Loader2 size={14} className="animate-spin" />}
              Save Changes
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Profile Toast */}
    {profileToast && (
      <div className="fixed top-6 right-6 bg-white dark:bg-[#1E293B] shadow-xl rounded-xl flex items-center p-4 border border-green-100 dark:border-green-900/30 animate-in slide-in-from-top-4 fade-in duration-300 z-[80]">
        <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-2 mr-3 shrink-0"><CheckCircle2 className="text-green-600 dark:text-green-400" size={20} /></div>
        <p className="text-sm font-bold text-slate-800 dark:text-[#F9FAFB]">{profileToast}</p>
      </div>
    )}
    </>
  );
}
