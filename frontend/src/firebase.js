import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore";

//import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAtWtoBjtEHaEAF5a2LCdstZzLRMMWNTpY",
  authDomain: "lfe-dashboard-9d578.firebaseapp.com",
  projectId: "lfe-dashboard-9d578",
  storageBucket: "lfe-dashboard-9d578.appspot.com",
  messagingSenderId: "297168043881",
  appId: "1:297168043881:web:fa48308fee573c4a1247f8",
  measurementId: "G-5L3V70F9X3"
};

// Initialize Firebase

export const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const db = getFirestore(app)
// const analytics = getAnalytics(app);