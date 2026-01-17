// web/src/firebase/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import {
  getDataConnect,
  connectDataConnectEmulator
} from "firebase/data-connect";
import { connectorConfig } from "../generated";

/* =========================
   FIREBASE CONFIG
========================= */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

/* =========================
   INITIALIZE FIREBASE
========================= */
const app = initializeApp(firebaseConfig);

/* =========================
   AUTH (EMAIL + GOOGLE)
========================= */
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

/* =========================
   DATA CONNECT
========================= */
export const dataConnect = getDataConnect(app, connectorConfig);

/* =========================
   DATA CONNECT EMULATOR
========================= */
if (import.meta.env.DEV) {
  connectDataConnectEmulator(dataConnect, "127.0.0.1", 9399);
  console.log("🔥 Data Connect Emulator Connected");
}
