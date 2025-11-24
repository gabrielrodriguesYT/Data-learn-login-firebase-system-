import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
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

// Sua configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB3E1aRGO50sbiTDDHwiIZO1WAYbTxzTbQ",
  authDomain: "data-learn-d3337.firebaseapp.com",
  projectId: "data-learn-d3337",
  storageBucket: "data-learn-d3337.appspot.com",
  messagingSenderId: "939016697092",
  appId: "1:939016697092:web:2359db57522a09aa170c51"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Elementos do DOM
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const phoneInput = document.getElementById('phone');
const authButton = document.getElementById('authButton');

// Função única para login/criação de conta
async function handleAuth() {
  const email = emailInput.value;
  const password = passwordInput.value;
  const phone = phoneInput.value;

  // Validação básica
  if (!email || !password || !phone) {
    alert('❌ Preencha todos os campos!');
    return;
  }

  if (password.length < 6) {
    alert('❌ A senha deve ter pelo menos 6 caracteres!');
    return;
  }

  try {
    // Primeiro tenta fazer login
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Atualiza os dados no Firestore se o login for bem-sucedido
    await saveUserData(user.uid, email, phone);
    alert('✅ Login realizado com sucesso!');
    clearForm();

  } catch (error) {
    // Se o usuário não existe, cria uma nova conta
    if (error.code === 'auth/user-not-found') {
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Salva os dados no Firestore
        await saveUserData(user.uid, email, phone);
        alert('✅ Conta criada e login realizado com sucesso!');
        clearForm();

      } catch (createError) {
        handleAuthError(createError);
      }
    } else {
      handleAuthError(error);
    }
  }
}

// Função para salvar/atualizar dados no Firestore
async function saveUserData(uid, email, phone) {
  try {
    await setDoc(doc(db, 'contato', uid), {
      email: email,
      telefone: phone,
      ultimoAcesso: serverTimestamp()
    }, {
      merge: true
    });
  } catch (error) {
    console.error('Erro ao salvar dados:', error);
    alert('❌ Erro ao salvar dados no banco de dados.');
    throw error;
  }
}

// Função para tratar erros de autenticação
function handleAuthError(error) {
  console.error('Erro de autenticação:', error);

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
      alert('❌ Senha muito fraca!');
      break;
    case 'auth/network-request-failed':
      alert('❌ Erro de conexão. Verifique sua internet.');
      break;
    default:
      alert('❌ Erro: ' + error.message);
    }
  }

  // Função para limpar o formulário
  function clearForm() {
    emailInput.value = '';
    passwordInput.value = '';
    phoneInput.value = '';
  }

  // Event Listener para o botão
  authButton.addEventListener('click', handleAuth);

  // Event Listener para Enter nos inputs
  [emailInput, passwordInput, phoneInput].forEach(input => {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleAuth();
      }
    });
  });

  // Verificar se usuário já está logado (opcional)
  auth.onAuthStateChanged((user) => {
    if (user) {
      console.log('Usuário já está logado:', user.email);
    }
  });