import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyBv2Axmm1dzuXGEBolndkZCgwgmxAPrhgw", 
  authDomain: "foodlinker-936f6.firebaseapp.com",
  projectId: "foodlinker-936f6",
  storageBucket: "foodlinker-936f6.firebasestorage.app", 
  messagingSenderId: "38873662883",
  appId: "1:38873662883:web:f98aa206763be190444616",
  measurementId: "G-QLY0431DJM"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);