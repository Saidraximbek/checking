import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Firebase configuration is loaded from Vite environment variables.
const firebaseConfig = {
  apiKey: "AIzaSyBM-qMlPigm07uixkYan5AnJZwmzmqdsBU",
  authDomain: "tester-8181c.firebaseapp.com",
  projectId: "tester-8181c",
  storageBucket: "tester-8181c.firebasestorage.app",
  messagingSenderId: "204698992928",
  appId: "1:204698992928:web:a661a6379c38cc09699745",
  measurementId: "G-XTDYGZGJFE"
};

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

export default app
