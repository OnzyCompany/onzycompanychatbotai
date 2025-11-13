// FIX: Changed firebase/app to @firebase/app to resolve module export error.
import { initializeApp } from '@firebase/app';
// FIX: Changed firebase/firestore to @firebase/firestore for consistency with the app import fix.
import { getFirestore } from '@firebase/firestore';

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

// Obtém uma instância do Firestore e a exporta para o resto da aplicação
export const db = getFirestore(app);
