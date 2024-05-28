import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDocs, query, where, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAXNm8jtmIia6Sn6DrQwWMMUkhEuFuVZ-U",
  authDomain: "injez-todo.firebaseapp.com",
  projectId: "injez-todo",
  storageBucket: "injez-todo.appspot.com",
  messagingSenderId: "547528484902",
  appId: "1:547528484902:web:4945151a3337f1ed7cdee7",
  measurementId: "G-4E1KW0XYZ1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);



export { auth, provider, signInWithPopup, signOut , db,
     collection, doc, setDoc, getDocs, query, where, addDoc, updateDoc, deleteDoc };