// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCXQfe9x-RoPakCvAXipDZDGPoVIsI9qX8",
  authDomain: "weather-app-data.firebaseapp.com",
  projectId: "weather-app-data",
  storageBucket: "weather-app-data.appspot.com",
  messagingSenderId: "717003224419",
  appId: "1:717003224419:web:220ced7b71aeaa434ccf56",
  measurementId: "G-3P6020FQ4C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
