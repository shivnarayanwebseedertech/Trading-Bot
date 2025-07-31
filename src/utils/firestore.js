import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { auth } from "./firebase";

const db = getFirestore();

export async function saveUserData(data) {
  if (!auth.currentUser) return; // No user logged in, do nothing or throw if you prefer

  // Optional: Add user ID or metadata to data here if needed
  // const userData = { ...data, updatedAt: new Date().toISOString() };

  return setDoc(doc(db, "users", auth.currentUser.uid), data, { merge: true });
}

export async function loadUserData() {
  if (!auth.currentUser) return null;

  const snap = await getDoc(doc(db, "users", auth.currentUser.uid));
  if (snap.exists()) {
    return snap.data();
  } else {
    return null;
  }
}
