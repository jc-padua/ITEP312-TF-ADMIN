import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "itep312tf.firebaseapp.com",
  projectId: "itep312tf",
  storageBucket: "itep312tf.appspot.com",
  messagingSenderId: "161316532389",
  appId: "1:161316532389:web:e30fd12d100f0a11b65d4c",
  measurementId: "G-ZMCNM2W5C8"
};

initializeApp(firebaseConfig);
export const db = getFirestore();
export const auth = getAuth();
export const storage = getStorage();