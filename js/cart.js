import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const cartItemsContainer = document.getElementById('cart-items');
const cartTotalSpan = document.getElementById('cart-total');
const checkoutButton = document.getElementById('checkout-button');

const orderHistoryList = document.getElementById('order-history-list');
const orderHistoryContainer = document.getElementById('order-history-container');


let currentUser;

async function fetchUserOrders(userId) {
    if (!userId) {
        orderHistoryContainer.style.display = 'none';
        return;
    }

    orderHistoryContainer.style.display = 'block';
    const ordersRef = collection(db, "orders");
    const q = query(ordersRef, where("userId", "==", userId), orderBy("createdAt", "desc"));

    try {
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            orderHistoryList.innerHTML = '<p>Você ainda não fez nenhum pedido.</p>';
            return;
        }

        orderHistoryList.innerHTML = ''; 
        querySnapshot.forEach(doc => {
            const order = doc.data();
            const orderElement = document.createElement('div');
            orderElement.classList.add('order-item'); 

            const itemsHtml = order.items.map(item => `<li>${item.quantity}x ${item.name}</li>`).join('');
            const orderDate = new Date(order.createdAt.seconds * 1000).toLocaleDateString('pt-BR');

            orderElement.innerHTML = `
                <h4>Pedido de ${orderDate}</h4>
                <p><strong>Status:</strong> ${order.status}</p>
                <p><strong>Total:</strong> R$ ${order.totalPrice.toFixed(2)}</p>
                <p><strong>Itens:</strong></p>
                <ul>${itemsHtml}</ul>
            `;
            orderHistoryList.appendChild(orderElement);
        });
    } catch (error) {
        console.error("Erro ao buscar histórico de pedidos: ", error);
        orderHistoryList.innerHTML = '<p>Ocorreu um erro ao carregar seu histórico.</p>';
    }
}


onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if (user) {
        fetchUserOrders(user.uid);
    } else {
        orderHistoryContainer.style.display = 'none';
    }
});

function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCart();
}

function updateQuantity(sweetId, newQuantity) {
    const cart = getCart();
    const item = cart.find(i => i.id === sweetId);
    if (item) {
        if (newQuantity > 0) {
            item.quantity = newQuantity;
        } else {
            const itemIndex = cart.findIndex(i => i.id === sweetId);
            cart.splice(itemIndex, 1);
        }
    }
    saveCart(cart);
}

window.updateQuantity = updateQuantity;

function renderCart() {
    const cart = getCart();
    cartItemsContainer.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Seu carrinho está vazio.</p>';
        checkoutButton.disabled = true;
    } else {
        checkoutButton.disabled = false;
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            const itemElement = document.createElement('div');
            itemElement.classList.add('cart-item');
            itemElement.innerHTML = `
                <h4>${item.name}</h4>
                <p>Preço: R$ ${item.price.toFixed(2)}</p>
                <div class="quantity-controls">
                    <label for="qty-${item.id}">Qtd:</label>
                    <input type="number" id="qty-${item.id}" value="${item.quantity}" min="0" onchange="updateQuantity('${item.id}', this.valueAsNumber)">
                </div>
                <p>Subtotal: R$ ${itemTotal.toFixed(2)}</p>
            `;
            cartItemsContainer.appendChild(itemElement);
        });
    }
    cartTotalSpan.textContent = `R$ ${total.toFixed(2)}`;
}

checkoutButton.addEventListener('click', async () => {
    if (!currentUser) {
        alert("Você precisa estar logado para finalizar o pedido.");
        window.location.href = "login.html";
        return;
    }

    const cart = getCart();
    if (cart.length === 0) {
        alert("Seu carrinho está vazio.");
        return;
    }

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const orderItems = cart.map(item => ({
        sweetId: item.id,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.price
    }));

    try {
        await addDoc(collection(db, "orders"), {
            userId: currentUser.uid,
            userEmail: currentUser.email,
            items: orderItems,
            totalPrice: total,
            status: "Pendente",
            createdAt: serverTimestamp()
        });
        alert("Pedido realizado com sucesso!");
        localStorage.removeItem('cart');
        window.location.href = "index.html"; 
    } catch (error) {
        console.error("Erro ao finalizar pedido: ", error);
        alert("Falha ao registrar o pedido.");
    }
});

renderCart();