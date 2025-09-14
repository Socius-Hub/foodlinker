import { auth, db, storage } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { doc, getDoc, addDoc, collection } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";

const adminPanel = document.getElementById('admin-panel');
const loadingMessage = document.getElementById('loading-message');

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists() && userDoc.data().role === 'admin') {
            loadingMessage.style.display = 'none';
            adminPanel.style.display = 'block';
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
addSweetForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('sweet-name').value;
    const description = document.getElementById('sweet-description').value;
    const price = parseFloat(document.getElementById('sweet-price').value);
    const category = document.getElementById('sweet-category').value;
    const imageFile = document.getElementById('sweet-image').files[0];

    if (!imageFile) {
        alert("Por favor, selecione uma imagem.");
        return;
    }

    try {
        const storageRef = ref(storage, `sweets/${imageFile.name}`);
        const snapshot = await uploadBytes(storageRef, imageFile);
        const imageUrl = await getDownloadURL(snapshot.ref);

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