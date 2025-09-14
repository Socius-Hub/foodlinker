// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBv2Axmm1dzuXGEBolndkZCgwgmxAPrhgw",
  authDomain: "foodlinker-936f6.firebaseapp.com",
  projectId: "foodlinker-936f6",
  storageBucket: "foodlinker-936f6.firebasestorage.app",
  messagingSenderId: "38873662883",
  appId: "1:38873662883:web:f98aa206763be190444616",
  measurementId: "G-QLY0431DJM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);