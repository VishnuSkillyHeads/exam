import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCbRQ7qiRLsGj5d_mhMC0QUPypnKqxkJGQ",
  authDomain: "siri-8cf4e.firebaseapp.com",
  projectId: "siri-8cf4e",
  storageBucket: "siri-8cf4e.firebasestorage.app",
  messagingSenderId: "910923725758",
  appId: "1:910923725758:web:409f8125cb3eb8c6d6d7ef",
  measurementId: "G-46YYCKFTL6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
