// js/firebase-config.js

// 1. Importe as funções APENAS das URLs completas do SDK do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";

// 2. Sua configuração do app da Web do Firebase (está correta)
const firebaseConfig = {
  apiKey: "AIzaSyBv2Axmm1dzuXGEBolndkZCgwgmxAPrhgw", // Nota: É normal esta chave ser pública. A segurança é feita nas Regras do Firestore.
  authDomain: "foodlinker-936f6.firebaseapp.com",
  projectId: "foodlinker-936f6",
  storageBucket: "foodlinker-936f6.firebasestorage.app", // Corrigido para o domínio correto do Storage
  messagingSenderId: "38873662883",
  appId: "1:38873662883:web:f98aa206763be190444616",
  measurementId: "G-QLY0431DJM"
};

// 3. Inicialize os serviços do Firebase
const app = initializeApp(firebaseConfig);

// 4. Exporte os serviços para que outros arquivos possam usá-los
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);