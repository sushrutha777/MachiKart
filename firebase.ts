
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
} from "firebase/firestore";

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

export {
  db,
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
};
