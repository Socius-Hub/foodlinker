import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const sweetsContainer = document.getElementById('sweets-container');
const searchName = document.getElementById('search-by-name');
const searchCategory = document.getElementById('search-by-category');
const searchPrice = document.getElementById('search-by-price');
const priceValue = document.getElementById('price-value');

let allSweets = []; 

function renderSweets(sweets) {
    sweetsContainer.innerHTML = '';
    if (sweets.length === 0) {
        sweetsContainer.innerHTML = '<p>Nenhum doce encontrado com estes critérios.</p>';
        return;
    }
    sweets.forEach(sweet => {
        const sweetElement = document.createElement('div');
        sweetElement.classList.add('sweet-card');
        sweetElement.innerHTML = `
            <img src="${sweet.imageUrl}" alt="${sweet.name}">
            <h3>${sweet.name}</h3>
            <p>${sweet.description}</p>
            <p class="price">R$ ${sweet.price.toFixed(2)}</p>
        `;
        sweetsContainer.appendChild(sweetElement);
    });
}

async function fetchSweets() {
    const sweetsCollection = collection(db, 'sweets');
    const sweetsSnapshot = await getDocs(sweetsCollection);
    allSweets = sweetsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderSweets(allSweets);
    populateCategories();
}

function populateCategories() {
    const categories = [...new Set(allSweets.map(sweet => sweet.category))];
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        searchCategory.appendChild(option);
    });
}

function applyFilters() {
    const nameFilter = searchName.value.toLowerCase();
    const categoryFilter = searchCategory.value;
    const priceFilter = parseFloat(searchPrice.value);

    const filteredSweets = allSweets.filter(sweet => {
        const nameMatch = sweet.name.toLowerCase().includes(nameFilter);
        const categoryMatch = categoryFilter ? sweet.category === categoryFilter : true;
        const priceMatch = sweet.price <= priceFilter;
        return nameMatch && categoryMatch && priceMatch;
    });

    renderSweets(filteredSweets);
}

searchName.addEventListener('input', applyFilters);
searchCategory.addEventListener('change', applyFilters);
searchPrice.addEventListener('input', () => {
    priceValue.textContent = searchPrice.value;
    applyFilters();
});

const loginLink = document.getElementById('login-link');
const logoutLink = document.getElementById('logout-link');
const adminLink = document.getElementById('admin-link');

onAuthStateChanged(auth, async (user) => {
    if (user) {
        loginLink.style.display = 'none';
        logoutLink.style.display = 'block';

        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().role === 'admin') {
            adminLink.style.display = 'block';
        }
    } else {
        loginLink.style.display = 'block';
        logoutLink.style.display = 'none';
        adminLink.style.display = 'none';
    }
});

logoutLink.addEventListener('click', (e) => {
    e.preventDefault();
    signOut(auth).then(() => {
        alert("Você foi desconectado.");
    }).catch((error) => {
        console.error("Erro ao sair:", error);
    });
});

fetchSweets();

const contactForm = document.getElementById('contact-form');
if(contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = document.getElementById('contact-message').value;
        const user = auth.currentUser;

        if (!user) {
            alert("Você precisa estar logado para enviar uma mensagem.");
            return;
        }

        try {
            await addDoc(collection(db, "contactForms"), {
                userId: user.uid,
                userEmail: user.email,
                message: message,
                timestamp: new Date()
            });
            alert("Mensagem enviada com sucesso!");
            contactForm.reset();
        } catch (error) {
            console.error("Erro ao enviar mensagem: ", error);
        }
    });
}