import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// TODO: Replace with your Firebase project configuration
// You can find this in the Firebase Console -> Project Settings -> General -> Your apps
const firebaseConfig = {
    apiKey: "AIzaSyDa2t1JOxjEqNdk_OWw86zQIjN1-NhtVyg",
    authDomain: "wali-santri-app-ddfd3.firebaseapp.com",
    projectId: "wali-santri-app-ddfd3",
    storageBucket: "wali-santri-app-ddfd3.firebasestorage.app",
    messagingSenderId: "753783583882",
    appId: "1:753783583882:web:4fd39dfb3d5a47b0146973",
    measurementId: "G-QNR8PF7FZG"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
