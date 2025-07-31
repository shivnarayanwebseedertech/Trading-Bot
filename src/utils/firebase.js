import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "YOUR_REAL_API_KEY", // Replace this with your actual API key
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-app-id",
  // ...other config properties like storageBucket, messagingSenderId, appId, measurementId if applicable
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
