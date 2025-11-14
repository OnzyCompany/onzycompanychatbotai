// Use modular 'firebase/app' import for Firebase v9+ SDK.
import { initializeApp } from 'firebase/app';
// Use modular 'firebase/firestore' import for Firebase v9+ SDK.
import { getFirestore } from 'firebase/firestore';

// Configuração do Firebase fornecida pelo usuário.
const firebaseConfig = {
  apiKey: "AIzaSyBvYQ9RUJHuNo7wwqZq190VD_LzxQN3NHM",
  authDomain: "onzy-chatbot.firebaseapp.com",
  projectId: "onzy-chatbot",
  storageBucket: "onzy-chatbot.firebasestorage.app",
  messagingSenderId: "251829048306",
  appId: "1:251829048306:web:5622322a3f29ac0641116b"
};

// Inicializa o Firebase com a API modular v9
const app = initializeApp(firebaseConfig);

// Inicializa o Firestore imediatamente e o exporta como uma constante.
// Isso garante que o serviço esteja disponível antes de ser usado.
export const db = getFirestore(app);
