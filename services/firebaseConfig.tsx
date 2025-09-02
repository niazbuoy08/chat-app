// Import the functions you need from Firebase SDK
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBOxHVHaEC4ydnJRkfBkLojEDxz7z7KlMw",
  authDomain: "chat-app-22d67.firebaseapp.com",
  projectId: "chat-app-22d67",
  storageBucket: "chat-app-22d67.appspot.com",
  messagingSenderId: "333627481198",
  appId: "1:333627481198:web:4c9aebaad26acca525da7f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// Initialize Firestore
export const db = getFirestore(app);