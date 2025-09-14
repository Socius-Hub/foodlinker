import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { doc, getDoc, addDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";


const availableImages = [
    "Mochi.png",
    "Taiyaki.png"
];

const adminPanel = document.getElementById('admin-panel');
const loadingMessage = document.getElementById('loading-message');
const imageSelect = document.getElementById('sweet-image-select');
const usersListAdmin = document.getElementById('users-list-admin');
const ordersListAdmin = document.getElementById('orders-list-admin');

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
    const ordersCollection = collection(db, 'orders');
    const ordersSnapshot = await getDocs(ordersCollection);
    ordersListAdmin.innerHTML = '';
    ordersSnapshot.forEach(doc => {
        const order = doc.data();
        const orderElement = document.createElement('div');
        orderElement.classList.add('order-item');

        let itemsHtml = order.items.map(item => `<li>${item.quantity}x ${item.name}</li>`).join('');

        orderElement.innerHTML = `
            <h4>Pedido de: ${order.userEmail}</h4>
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

const addSweetForm = document.getElementById('add-sweet-form');

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
            const imageUrl = `/img/sweets/${selectedImage}`;

            await addDoc(collection(db, "sweets"), {
                name: name,
                description: description,
                price: price,
                category: category,
                imageUrl: imageUrl
            });

            alert("Doce adicionado com sucesso!");
            addSweetForm.reset();

        } catch (error) {
            console.error("Erro ao adicionar doce: ", error);
            alert("Falha ao adicionar o doce.");
        }
    });
}