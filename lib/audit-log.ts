import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";


export async function addAuditLog(
  action: string,
  performedBy: string,
  details: string
): Promise<void> {
  try {
    const currentUser = auth.currentUser;
    await addDoc(collection(db, "audit_logs"), {
      action,
      performedBy,
      details,
      userEmail: currentUser?.email ?? performedBy,
      userUid: currentUser?.uid ?? null,
      timestamp: serverTimestamp(),
    });
  } catch (err) {
    console.error("[AuditLog] Failed to write audit log:", err);
  }
}
