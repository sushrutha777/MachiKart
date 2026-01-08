// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  orderBy,
  Timestamp
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDo8pQUeC766W4VUlw0qwLfn-hEMAyJC_4",
  authDomain: "macchikart-45247.firebaseapp.com",
  projectId: "macchikart-45247",
  storageBucket: "macchikart-45247.firebasestorage.app",
  messagingSenderId: "1012498957988",
  appId: "1:1012498957988:web:b54fb39818b39d5fb50831",
  measurementId: "G-K8QTQ379E2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const storage = getStorage(app);

export {
  app,
  analytics,
  db,
  storage,
  // Firestore exports
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  orderBy,
  Timestamp,
  // Storage exports
  ref,
  uploadBytes,
  getDownloadURL
};
