// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD0r1Ge-UWOX1n7adkS7Z41iQNcaNB_QPY",
  authDomain: "fir-api-d454c.firebaseapp.com",
  projectId: "fir-api-d454c",
  storageBucket: "fir-api-d454c.firebasestorage.app",
  messagingSenderId: "71432857969",
  appId: "1:71432857969:web:01273b25e3c25517beaed0",
  measurementId: "G-354DYXFLQY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// ✅ Khởi tạo Storage
export const storage = getStorage(app);