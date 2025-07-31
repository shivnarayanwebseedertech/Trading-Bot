import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { auth } from "./firebase";
const db = getFirestore();

export async function saveUserData(data) {
  if (!auth.currentUser) return;
  return setDoc(doc(db, "users", auth.currentUser.uid), data, { merge: true });
}

export async function loadUserData() {
  if (!auth.currentUser) return null;
  const snap = await getDoc(doc(db, "users", auth.currentUser.uid));
  return snap.exists() ? snap.data() : null;
}
