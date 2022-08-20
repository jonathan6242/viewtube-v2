// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBZKnVkrQsnZpw2vKmAn4OZqNz7JKCleYA",
  authDomain: "clone-7102d.firebaseapp.com",
  projectId: "clone-7102d",
  storageBucket: "clone-7102d.appspot.com",
  messagingSenderId: "297208296652",
  appId: "1:297208296652:web:983065a85d0d4518417e69"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const provider = new GoogleAuthProvider();
const db = getFirestore();
const storage = getStorage();

export { auth, provider, db, storage } 