import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getDoc, doc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const loginLink = document.getElementById('login-link');
const logoutLink = document.getElementById('logout-link');
const adminLink = document.getElementById('admin-link');

onAuthStateChanged(auth, async (user) => {
    if (user) {
        if(loginLink) loginLink.style.display = 'none';
        if(logoutLink) logoutLink.style.display = 'block';
        
        try {
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists() && userDoc.data().role === 'admin') {
                if(adminLink) adminLink.style.display = 'block';
            }
        } catch (error) {
            console.error("Erro ao verificar permissão de admin:", error);
        }
    } else {
        if(loginLink) loginLink.style.display = 'block';
        if(logoutLink) logoutLink.style.display = 'none';
        if(adminLink) adminLink.style.display = 'none';
    }
});

if (logoutLink) {
    logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        signOut(auth).then(() => {
            alert("Você foi desconectado.");
            window.location.href = '/';
        }).catch((error) => {
            console.error("Erro ao sair:", error);
        });
    });
}