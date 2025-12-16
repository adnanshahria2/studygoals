import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBWvyaFWIL0PV4VD33BJNQl3qP2k1IbQus",
    authDomain: "rutine-f2ac1.firebaseapp.com",
    projectId: "rutine-f2ac1",
    storageBucket: "rutine-f2ac1.firebasestorage.app",
    messagingSenderId: "161382347749",
    appId: "1:161382347749:web:a07ebafa5bdd35d480350c",
    measurementId: "G-BNC489N193"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
    console.warn('Offline persistence failed:', err.code);
});

// Sanitize email for use as document ID (replace invalid characters)
export const sanitizeEmail = (email: string): string => {
    return email.toLowerCase().replace(/[.#$[\]]/g, '_');
};
