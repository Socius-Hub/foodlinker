import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getDoc, doc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const loginLink = document.getElementById('login-link');
const logoutLink = document.getElementById('logout-link');
const adminLink = document.getElementById('admin-link');
const ordersLink = document.getElementById('orders-link');

function updateCartCounter() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const badgeElements = document.querySelectorAll('.cart-badge');
    
    badgeElements.forEach(badge => {
        if (totalItems > 0) {
            badge.textContent = totalItems;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    });
}

onAuthStateChanged(auth, async (user) => {
    if (user) {
        if(loginLink) loginLink.style.display = 'none';
        if(logoutLink) logoutLink.style.display = 'block';
        if(ordersLink) ordersLink.style.display = 'block';
        
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
        if(ordersLink) ordersLink.style.display = 'none';
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

document.addEventListener('DOMContentLoaded', updateCartCounter);
window.addEventListener('cartUpdated', updateCartCounter);