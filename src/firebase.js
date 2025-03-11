import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyAppzj12orwu6oYvTJKBwxXTYxyr0IXfyA",
    authDomain: "blog-project-4bf95.firebaseapp.com",
    projectId: "blog-project-4bf95",
    storageBucket: "blog-project-4bf95.firebasestorage.app",
    messagingSenderId: "1032592755207",
    appId: "1:1032592755207:web:22d7480d3f7e40cc73f8a2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;