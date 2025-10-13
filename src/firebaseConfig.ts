// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAxoHJ38gQ5zPbcMrsVram3Nx2At5h5mvk",
  authDomain: "demoapi-71b9e.firebaseapp.com",
  projectId: "demoapi-71b9e",
  storageBucket: "demoapi-71b9e.firebasestorage.app",
  messagingSenderId: "707015404075",
  appId: "1:707015404075:web:fb6d81d53b421898b4186e",
  measurementId: "G-96HNG30HC0"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
// ✅ Khởi tạo Storage
export const storage = getStorage(app);