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
  apiKey: "AIzaSyC1WYcawmippctXm9s8Wd9xiV7NNYDxtwk",
  authDomain: "machikart.firebaseapp.com",
  projectId: "machikart",
  storageBucket: "machikart.firebasestorage.app",
  messagingSenderId: "36905574962",
  appId: "1:36905574962:web:938c658b139fb3b43e522b",
  measurementId: "G-WW58WJSTRM"
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
