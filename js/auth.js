// js/auth.js
import { auth, db } from './firebase-config.js';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const registerButton = document.getElementById('register-button');
const loginButton = document.getElementById('login-button');
const googleLoginButton = document.getElementById('google-login-button');

registerButton.addEventListener('click', async () => {
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
            email: user.email,
            role: "user" 
        });

        alert("Usuário cadastrado com sucesso!");
        window.location.href = "index.html"; 

    } catch (error) {
        console.error("Erro no cadastro: ", error);
        alert(error.message);
    }
});


loginButton.addEventListener('click', async () => {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        alert("Login bem-sucedido!");
        window.location.href = "index.html";
    } catch (error) {
        console.error("Erro no login: ", error);
        alert(error.message);
    }
});


googleLoginButton.addEventListener('click', async () => {
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;


        await setDoc(doc(db, "users", user.uid), {
            email: user.email,
            displayName: user.displayName,
            role: "user"
        }, { merge: true }); 

        alert("Login com Google bem-sucedido!");
        window.location.href = "index.html";
    } catch (error) {
        console.error("Erro no login com Google: ", error);
        alert(error.message);
    }
});