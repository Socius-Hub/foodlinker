import { auth, db } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const contactForm = document.getElementById('contact-form');
const userEmailField = document.getElementById('email');

let currentUser = null;

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        userEmailField.value = user.email;
    }
});

contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const firstName = document.getElementById('firstname').value;
    const lastName = document.getElementById('lastname').value;
    const email = userEmailField.value;
    const message = document.getElementById('message').value;

    try {
        await addDoc(collection(db, "contacts"), {
            firstName,
            lastName,
            email,
            message,
            userId: currentUser ? currentUser.uid : null,
            createdAt: serverTimestamp()
        });
        alert("Mensagem enviada com sucesso!");
        contactForm.reset();
        if(currentUser) userEmailField.value = currentUser.email;
    } catch (error) {
        console.error("Erro ao enviar mensagem: ", error);
        alert("Falha ao enviar a mensagem. Tente novamente.");
    }
});