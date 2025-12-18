// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB8Fg_2EKkAecY4na7jPEQzwZbVsBLyvmA",
  authDomain: "small-hands.firebaseapp.com",
  projectId: "small-hands",
  storageBucket: "small-hands.firebasestorage.app",
  messagingSenderId: "654078592638",
  appId: "1:654078592638:web:04e28a9d90cc6f5a33fa2f",
  measurementId: "G-WQ3LL79YVS",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

const analytics = getAnalytics(app);
