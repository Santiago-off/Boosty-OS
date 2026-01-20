// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDObeU5b4_JpF4kCVC_gh8Nrv-nnyVhRjg",
  authDomain: "boosty-os-4b54d.firebaseapp.com",
  projectId: "boosty-os-4b54d",
  storageBucket: "boosty-os-4b54d.firebasestorage.app",
  messagingSenderId: "877073195920",
  appId: "1:877073195920:web:234a56b3dfed233d844915"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };
