
// src/firebase.ts
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  onSnapshot,
  writeBatch,
  setDoc
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC1WYcawmippctXm9s8Wd9xiV7NNYDxtwk",
  authDomain: "machikart.firebaseapp.com",
  projectId: "machikart",
  storageBucket: "machikart.firebasestorage.app",
  messagingSenderId: "36905574962",
  appId: "1:36905574962:web:3690227c00da337e3e522b",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export {
  db,
  storage,
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  onSnapshot,
  writeBatch,
  ref,
  uploadBytes,
  getDownloadURL,
  setDoc
};
