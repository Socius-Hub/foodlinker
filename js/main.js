import { auth, db } from './firebase-config.js';
import { collection, getDocs, query, where, orderBy, addDoc, serverTimestamp, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

console.log("main.js foi carregado com sucesso.");

const sweetsContainer = document.getElementById('sweets-container');
const searchName = document.getElementById('search-by-name');
const searchCategory = document.getElementById('search-by-category');
const sortByPrice = document.getElementById('sort-by-price');

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

    if (isNaN(quantity) || quantity <= 0) {
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

function renderStars(rating) {
    const totalStars = 5;
    let starsHtml = `<div class="star-rating display-only" data-rating="${Math.round(rating)}">`;
    for (let i = 1; i <= totalStars; i++) {
        const isFilled = i <= Math.round(rating);
        starsHtml += `<span class="star ${isFilled ? 'filled' : ''}">&#9733;</span>`;
    }
    starsHtml += '</div>';
    return starsHtml;
}

async function fetchReviewsForSweet(sweetId) {
    const reviewsContainer = document.getElementById(`reviews-${sweetId}`);
    if (!reviewsContainer) return;

    const q = query(collection(db, "reviews"), where("sweetId", "==", sweetId));

    try {
        const querySnapshot = await getDocs(q);
        
        let totalRating = 0;
        let reviewCount = querySnapshot.size;
        
        querySnapshot.forEach(doc => {
            totalRating += doc.data().rating;
        });
        
        const averageRating = reviewCount > 0 ? totalRating / reviewCount : 0;

        let reviewsHtml = `<h4>Avaliações (${reviewCount})</h4>`;
        reviewsHtml += renderStars(averageRating);

        if (reviewCount === 0) {
            reviewsHtml += "<p style='font-size: 0.9rem; margin-top: 4px;'>Nenhuma avaliação ainda.</p>";
        }
        
        reviewsContainer.innerHTML = reviewsHtml;

    } catch (error) {
        console.error("Erro ao buscar avaliações: ", error);
        reviewsContainer.innerHTML = "<p>Erro ao carregar avaliações.</p>";
    }
}

async function renderSweets(sweets) {
    sweetsContainer.innerHTML = '';
    if (sweets.length === 0) {
        sweetsContainer.innerHTML = '<p>Nenhum doce encontrado com estes critérios.</p>';
        return;
    }

    for (const sweet of sweets) {
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
            <div class="reviews-section" id="reviews-${sweet.id}">
                <p>Carregando avaliações...</p>
            </div>
        `;
        sweetsContainer.appendChild(sweetElement);
        fetchReviewsForSweet(sweet.id);
    }
    
    addEventListenersToButtons();
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

async function fetchSweets() {
    try {
        const sweetsCollection = collection(db, 'sweets');
        const sweetsSnapshot = await getDocs(sweetsCollection);
        allSweets = sweetsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        await renderSweets(allSweets);
        populateCategories();
    } catch (error) {
        console.error("Erro ao buscar os doces:", error);
        sweetsContainer.innerHTML = '<p>Ocorreu um erro ao carregar os produtos. Verifique o console para mais detalhes.</p>';
    }
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
    const sortOption = sortByPrice.value;

    let filteredSweets = allSweets.filter(sweet => {
        const nameMatch = sweet.name.toLowerCase().includes(nameFilter);
        const categoryMatch = categoryFilter ? sweet.category === categoryFilter : true;
        return nameMatch && categoryMatch;
    });

    if (sortOption === 'price-asc') {
        filteredSweets.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price-desc') {
        filteredSweets.sort((a, b) => b.price - a.price);
    }

    renderSweets(filteredSweets);
}

searchName.addEventListener('input', applyFilters);
searchCategory.addEventListener('change', applyFilters);
sortByPrice.addEventListener('change', applyFilters);

fetchSweets();