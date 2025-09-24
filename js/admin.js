import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { doc, getDoc, addDoc, collection, getDocs, query, orderBy, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const adminPanel = document.getElementById('admin-panel');
const loadingMessage = document.getElementById('loading-message');
const usersListAdmin = document.getElementById('users-list-admin');
const ordersListAdmin = document.getElementById('orders-list-admin');
const contactsListAdmin = document.getElementById('contacts-list-admin');
const addSweetForm = document.getElementById('add-sweet-form');
const tabs = document.querySelectorAll('.admin-tabs .tab-button');
const tabContents = document.querySelectorAll('.tab-content');

const sweetsListAdmin = document.getElementById('sweets-list-admin');
const editSweetModal = document.getElementById('edit-sweet-modal');
const editSweetForm = document.getElementById('edit-sweet-form');
const cancelEditBtn = document.getElementById('cancel-edit');

let allOrders = []; 

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

function renderOrders(statusFilter = 'Todos') {
    ordersListAdmin.innerHTML = '';

    const ordersToRender = statusFilter === 'Todos'
        ? allOrders
        : allOrders.filter(order => order.status === statusFilter);

    if (ordersToRender.length === 0) {
        ordersListAdmin.innerHTML = '<p>Nenhum pedido encontrado com este status.</p>';
        return;
    }

    ordersToRender.forEach(orderData => {
        const order = orderData;
        const orderId = order.id;
        const orderElement = document.createElement('div');
        orderElement.classList.add('order-item');
        let itemsHtml = order.items.map(item => `<li>${item.quantity}x ${item.name}</li>`).join('');
        
        const statusOptions = ['Pendente', 'Em produção', 'Concluído']
            .map(status => `<option value="${status}" ${order.status === status ? 'selected' : ''}>${status}</option>`)
            .join('');

        orderElement.innerHTML = `
            <h4>Pedido de: ${order.userEmail}</h4>
            <p><strong>Nome:</strong> ${order.userName || 'Não informado'}</p>
            <p><strong>Telefone:</strong> ${order.userPhone || 'Não informado'}</p>
            <p><strong>Data:</strong> ${new Date(order.createdAt.seconds * 1000).toLocaleString()}</p>
            <p><strong>Total:</strong> R$ ${order.totalPrice.toFixed(2)}</p>
            <div class="status-updater">
                <label for="status-${orderId}"><strong>Status:</strong></label>
                <select id="status-${orderId}" onchange="updateOrderStatus('${orderId}', this.value)">
                    ${statusOptions}
                </select>
            </div>
            <ul>${itemsHtml}</ul>
        `;
        ordersListAdmin.appendChild(orderElement);
    });
}

async function fetchOrders() {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const ordersSnapshot = await getDocs(q);
    allOrders = ordersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderOrders(); 
}

function setupOrderFilters() {
    const filterButtons = document.querySelectorAll('#order-status-filters .filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const status = button.dataset.status;
            renderOrders(status);
        });
    });
}

async function fetchAndRenderSweets() {
    const sweetsCollection = collection(db, 'sweets');
    const sweetsSnapshot = await getDocs(sweetsCollection);
    sweetsListAdmin.innerHTML = ''; 

    sweetsSnapshot.forEach(doc => {
        const sweet = { id: doc.id, ...doc.data() };
        const sweetElement = document.createElement('div');
        sweetElement.classList.add('sweet-item-admin');
        sweetElement.innerHTML = `
            <p><strong>${sweet.name}</strong> - R$ ${sweet.price.toFixed(2)}</p>
            <div>
                <button class="edit-btn">Editar</button>
                <button class="delete-btn">Excluir</button>
            </div>
        `;

        sweetElement.querySelector('.delete-btn').addEventListener('click', async () => {
            if (confirm(`Tem certeza que deseja excluir o doce "${sweet.name}"?`)) {
                try {
                    await deleteDoc(doc(db, "sweets", sweet.id));
                    alert("Doce excluído com sucesso!");
                    fetchAndRenderSweets();
                } catch (error) {
                    console.error("Erro ao excluir doce: ", error);
                    alert("Falha ao excluir o doce.");
                }
            }
        });

        sweetElement.querySelector('.edit-btn').addEventListener('click', () => {
            document.getElementById('edit-sweet-id').value = sweet.id;
            document.getElementById('edit-sweet-name').value = sweet.name;
            document.getElementById('edit-sweet-description').value = sweet.description;
            document.getElementById('edit-sweet-price').value = sweet.price;
            document.getElementById('edit-sweet-category').value = sweet.category;
            document.getElementById('edit-sweet-image-url').value = sweet.imageUrl;
            editSweetModal.style.display = 'block';
        });

        sweetsListAdmin.appendChild(sweetElement);
    });
}

editSweetForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const sweetId = document.getElementById('edit-sweet-id').value;
    const updatedData = {
        name: document.getElementById('edit-sweet-name').value,
        description: document.getElementById('edit-sweet-description').value,
        price: parseFloat(document.getElementById('edit-sweet-price').value),
        category: document.getElementById('edit-sweet-category').value,
        imageUrl: document.getElementById('edit-sweet-image-url').value
    };

    const sweetRef = doc(db, "sweets", sweetId);
    try {
        await updateDoc(sweetRef, updatedData);
        alert("Doce atualizado com sucesso!");
        editSweetModal.style.display = 'none';
        fetchAndRenderSweets(); 
    } catch (error) {
        console.error("Erro ao atualizar doce: ", error);
        alert("Falha ao atualizar o doce.");
    }
});

cancelEditBtn.addEventListener('click', () => {
    editSweetModal.style.display = 'none';
});

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

async function updateOrderStatus(orderId, newStatus) {
    const orderRef = doc(db, "orders", orderId);
    try {
        await updateDoc(orderRef, { status: newStatus });
        alert(`Status do pedido ${orderId} atualizado para ${newStatus}`);
        const orderToUpdate = allOrders.find(order => order.id === orderId);
        if (orderToUpdate) {
            orderToUpdate.status = newStatus;
        }
        const currentFilter = document.querySelector('#order-status-filters .filter-btn.active').dataset.status;
        renderOrders(currentFilter);
    } catch (error) {
        console.error("Erro ao atualizar status do pedido: ", error);
        alert("Falha ao atualizar o status.");
    }
}
window.updateOrderStatus = updateOrderStatus;

async function fetchContacts() {
    const q = query(collection(db, "contacts"), orderBy("createdAt", "desc"));
    const contactsSnapshot = await getDocs(q);
    contactsListAdmin.innerHTML = '';
    contactsSnapshot.forEach(doc => {
        const contact = doc.data();
        const contactElement = document.createElement('div');
        contactElement.classList.add('user-item');
        contactElement.innerHTML = `
            <p><strong>De:</strong> ${contact.firstName} ${contact.lastName} (${contact.email})</p>
            <p><strong>Data:</strong> ${new Date(contact.createdAt.seconds * 1000).toLocaleString()}</p>
            <p><strong>Mensagem:</strong> ${contact.message}</p>
        `;
        contactsListAdmin.appendChild(contactElement);
    });
}

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists() && userDoc.data().role === 'admin') {
            loadingMessage.style.display = 'none';
            adminPanel.style.display = 'block';
            setupTabs();
            setupOrderFilters();
            fetchUsers();
            fetchOrders();
            fetchContacts();
            fetchAndRenderSweets(); 
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
        const imageUrl = document.getElementById('sweet-image-url').value; 

        if (!imageUrl) {
            alert("Por favor, insira uma URL para a imagem.");
            return;
        }

        try {
            await addDoc(collection(db, "sweets"), {
                name, description, price, category, imageUrl
            });
            alert("Doce adicionado com sucesso!");
            addSweetForm.reset();
            fetchAndRenderSweets(); 
        } catch (error) {
            console.error("Erro ao adicionar doce: ", error);
            alert("Falha ao adicionar o doce.");
        }
    });
}