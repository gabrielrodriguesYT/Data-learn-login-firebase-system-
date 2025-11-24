import { initializeApp} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB3E1aRGO50sbiTDDHwiIZO1WAYbTxzTbQ",
  authDomain: "data-learn-d3337.firebaseapp.com",
  projectId: "data-learn-d3337",
  storageBucket: "data-learn-d3337.firebasestorage.app",
  messagingSenderId: "939016697092",
  appId: "1:939016697092:web:2359db57522a09aa170c51"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const phoneInput = document.getElementById('phone');
const authButton = document.getElementById('authButton');

async function handleAuth() {
  const email = emailInput.value;
  const password = passwordInput.value;
  const phone = phoneInput.value;

  if (!email ||!password ||!phone) {
    alert('❌ Preencha todos os campos!');
    return;
}

  if (password.length < 6) {
    alert('❌ A senha deve ter pelo menos 6 caracteres!');
    return;
}

  authButton.disabled = true;
  authButton.textContent = 'Processando...';

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await saveUserData(user.uid, email, phone);
    alert('✅ Login realizado com sucesso!');
    clearForm();
} catch (error) {
    console.log('Erro no login:', error.code);
    if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await saveUserData(user.uid, email, phone);
        alert('✅ Conta criada e login realizado com sucesso!');
        clearForm();
} catch (createError) {
        handleAuthError(createError);
}
} else {
      handleAuthError(error);
}
} finally {
    authButton.disabled = false;
    authButton.textContent = 'Entrar / Criar Conta';
}
}

async function saveUserData(uid, email, phone) {
  try {
    await setDoc(doc(db, 'contato', uid), {
      email: email,
      telefone: phone,
      ultimoAcesso: serverTimestamp()
}, { merge: true});
    console.log('Dados salvos com sucesso para:', email);
} catch (error) {
    console.error('Erro ao salvar dados:', error);
    alert('❌ Erro ao salvar dados no banco de dados.');
    throw error;
}
}

function handleAuthError(error) {
  console.error('Erro de autenticação:', error.code, error.message);
  switch (error.code) {
    case 'auth/wrong-password':
      alert('❌ Senha incorreta!');
      break;
    case 'auth/invalid-email':
      alert('❌ E-mail inválido!');
      break;
    case 'auth/email-already-in-use':
      alert('❌ Este e-mail já está em uso!');
      break;
    case 'auth/weak-password':
      alert('❌ Senha muito fraca! Use pelo menos 6 caracteres.');
      break;
    case 'auth/network-request-failed':
      alert('❌ Erro de conexão. Verifique sua internet.');
      break;
    case 'auth/invalid-credential':
      alert('❌ Credenciais inválidas. Verifique se o Authentication está ativado no Firebase Console.');
      break;
    default:
      alert('❌ Erro: ' + error.message);
}
}

function clearForm() {
  emailInput.value = '';
  passwordInput.value = '';
  phoneInput.value = '';
}

authButton.addEventListener('click', handleAuth);

[emailInput, passwordInput, phoneInput].forEach(input => {
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleAuth();
}
});
});

console.log('Firebase inicializado:', app.name);
console.log('Auth:', auth);
console.log('Firestore:', db);