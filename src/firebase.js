import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyCARh3sjrCxGSgSP6WRgrk_CcRDJsMG7V0",
    authDomain: "faculty-review-e8f08.firebaseapp.com",
    projectId: "faculty-review-e8f08",
    storageBucket: "faculty-review-e8f08.firebasestorage.app",
    messagingSenderId: "1005965941856",
    appId: "1:1005965941856:web:efa1dd457bbbd06732f705",
    measurementId: "G-HBGGY7ZCWV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
