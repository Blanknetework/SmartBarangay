import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

/**
 * Audit Log Utility — SmartBarangay Information Assurance
 * 
 * Records sensitive actions to the `audit_logs` Firestore collection.
 * 
 * Each log entry captures:
 *  - action:       What was done (e.g. "DELETE_PATIENT", "LOGIN", "RECORD_PAYMENT")
 *  - performedBy:  Username or Firebase UID of the person who did it
 *  - details:      Human-readable description of the action
 *  - timestamp:    Server-side Firestore timestamp (cannot be faked by client)
 *  - userEmail:    Firebase Auth email if available
 */
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
