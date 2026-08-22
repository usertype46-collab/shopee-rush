import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBsa52NHndX2bL4LzrXgBam4Kf5_sTmhMQ",
  authDomain: "shopee-rush.firebaseapp.com",
  databaseURL: "https://shopee-rush-default-rtdb.firebaseio.com",
  projectId: "shopee-rush",
  storageBucket: "shopee-rush.firebasestorage.app",
  messagingSenderId: "728584846999",
  appId: "1:728584846999:web:e5d0e8696f1cc6719733d2",
  measurementId: "G-83T3PBXX8Q"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getDatabase(app);

export { app, db };
