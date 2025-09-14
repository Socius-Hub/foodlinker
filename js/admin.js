import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { doc, getDoc, addDoc, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const availableImages = ["Mochi.png", "Taiyaki.png"];

const adminPanel = document.getElementById('admin-panel');
const loadingMessage = document.getElementById('loading-message');
const imageSelect = document.getElementById('sweet-image-select');
const usersListAdmin = document.getElementById('users-list-admin');
const ordersListAdmin = document.getElementById('orders-list-admin');
const addSweetForm = document.getElementById('add-sweet-form');
const tabs = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

function setupTabs() {
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(item => item.classList.remove('active'));
            tab.classList.add('active');

            const targetId = tab.dataset.tab;
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === targetId) {
                    content.classList.add('active');
                }
            });
        });
    });
}

function populateImageSelector() {
    if (!imageSelect) return;
    availableImages.forEach(imageName => {
        const option = document.createElement('option');
        option.value = imageName;
        option.textContent = imageName;
        imageSelect.appendChild(option);
    });
}

async function fetchUsers() {
    const usersCollection = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCollection);
    usersListAdmin.innerHTML = '';
    usersSnapshot.forEach(doc => {
        const user = doc.data();
        const userElement = document.createElement('div');
        userElement.classList.add('user-item');
        userElement.innerHTML = `
            <p><strong>Nome:</strong> ${user.fullName || 'Não informado'}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Telefone:</strong> ${user.phone || 'Não informado'}</p>
        `;
        usersListAdmin.appendChild(userElement);
    });
}

async function fetchOrders() {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const ordersSnapshot = await getDocs(q);
    ordersListAdmin.innerHTML = '';
    ordersSnapshot.forEach(doc => {
        const order = doc.data();
        const orderElement = document.createElement('div');
        orderElement.classList.add('order-item');
        let itemsHtml = order.items.map(item => `<li>${item.quantity}x ${item.name}</li>`).join('');
        orderElement.innerHTML = `
            <h4>Pedido de: ${order.userEmail}</h4>
            <p><strong>Data:</strong> ${new Date(order.createdAt.seconds * 1000).toLocaleString()}</p>
            <p><strong>Total:</strong> R$ ${order.totalPrice.toFixed(2)}</p>
            <p><strong>Status:</strong> ${order.status}</p>
            <ul>${itemsHtml}</ul>
        `;
        ordersListAdmin.appendChild(orderElement);
    });
}

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists() && userDoc.data().role === 'admin') {
            loadingMessage.style.display = 'none';
            adminPanel.style.display = 'block';
            populateImageSelector();
            setupTabs();
            fetchUsers();
            fetchOrders();
        } else {
            alert("Acesso negado. Você não é um administrador.");
            window.location.href = "index.html";
        }
    } else {
        alert("Você precisa estar logado para acessar esta página.");
        window.location.href = "login.html";
    }
});

if (addSweetForm) {
    addSweetForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('sweet-name').value;
        const description = document.getElementById('sweet-description').value;
        const price = parseFloat(document.getElementById('sweet-price').value);
        const category = document.getElementById('sweet-category').value;
        const selectedImage = imageSelect.value;

        if (!selectedImage) {
            alert("Por favor, selecione uma imagem da lista.");
            return;
        }

        try {
            await addDoc(collection(db, "sweets"), {
                name, description, price, category,
                imageUrl: `/img/sweets/${selectedImage}`
            });
            alert("Doce adicionado com sucesso!");
            addSweetForm.reset();
        } catch (error) {
            console.error("Erro ao adicionar doce: ", error);
            alert("Falha ao adicionar o doce.");
        }
    });
}