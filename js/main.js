import { auth, db } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { collection, getDocs, getDoc, doc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const sweetsContainer = document.getElementById('sweets-container');
const searchName = document.getElementById('search-by-name');
const searchCategory = document.getElementById('search-by-category');
const searchPrice = document.getElementById('search-by-price');
const priceValue = document.getElementById('price-value');

let allSweets = [];

function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function addToCart(sweetId) {
    const quantityInput = document.getElementById(`quantity-${sweetId}`);
    const quantity = parseInt(quantityInput.value, 10);

    if (quantity <= 0) {
        alert("Por favor, insira uma quantidade válida.");
        return;
    }

    const sweet = allSweets.find(s => s.id === sweetId);
    if (!sweet) return;

    const cart = getCart();
    const existingItem = cart.find(item => item.id === sweetId);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: sweet.id,
            name: sweet.name,
            price: sweet.price,
            quantity: quantity
        });
    }
    saveCart(cart);
    alert(`${quantity}x ${sweet.name} foi adicionado ao carrinho!`);
    quantityInput.value = 1;
}

function addEventListenersToButtons() {
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', () => {
            const sweetId = button.dataset.id;
            addToCart(sweetId);
        });
    });
}

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
            <div class="card-footer">
                <div class="quantity-selector">
                    <label for="quantity-${sweet.id}">Qtd:</label>
                    <input type="number" id="quantity-${sweet.id}" value="1" min="1">
                </div>
                <button class="add-to-cart-btn" data-id="${sweet.id}">Adicionar</button>
            </div>
        `;
        sweetsContainer.appendChild(sweetElement);
    });

    addEventListenersToButtons();
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
    searchCategory.innerHTML = '<option value="">Todas as Categorias</option>';
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
        window.location.reload();
    }).catch((error) => {
        console.error("Erro ao sair:", error);
    });
});

fetchSweets();