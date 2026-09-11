// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBvgghXpjzHJAVmZ1SlsivNQVN5_fe3n8k",
  authDomain: "orbit-661b7.firebaseapp.com",
  projectId: "orbit-661b7",
  storageBucket: "orbit-661b7.firebasestorage.app",
  messagingSenderId: "591248543459",
  appId: "1:591248543459:web:af20e16794dc34947b3fd6",
  measurementId: "G-RJ54PMZSN6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);