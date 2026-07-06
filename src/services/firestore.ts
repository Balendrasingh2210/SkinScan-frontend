import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  arrayUnion,
  collection,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { SkinReport } from "../types/skin";

export interface UserDoc {
  name: string;
  email: string;
  reports: string[];
}

export interface ReportDoc {
  timestamp: Timestamp;
  report: SkinReport;
}

// Creates user doc on first login; skips if already exists
export async function createUserIfNotExists(
  userId: string,
  name: string,
  email: string
): Promise<void> {
  try {
    const ref = doc(db, "users", userId);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, { name, email, reports: [] });
    }
  } catch (e) { console.log("Error while creating user.", e) };
}

// Saves a report doc and appends its id to the user's reports array
export async function saveReport(
  userId: string,
  report: SkinReport
): Promise<string> {
  try {
    const reportRef = await addDoc(collection(db, "reports"), {
      timestamp: Timestamp.now(),
      report,
    });

    await updateDoc(doc(db, "users", userId), {
      reports: arrayUnion(reportRef.id),
    });

    return reportRef.id;
  }
  catch (e) {
    console.log("Error while saving report.", e);
    return "";
  }
}

export async function getUser(userId: string): Promise<UserDoc | null> {
  const snap = await getDoc(doc(db, "users", userId));
  return snap.exists() ? (snap.data() as UserDoc) : null;
}

export async function getReport(reportId: string): Promise<ReportDoc | null> {
  const snap = await getDoc(doc(db, "reports", reportId));
  return snap.exists() ? (snap.data() as ReportDoc) : null;
}
