import { initializeApp } from 'firebase/app';
import {
    getAuth,
    setPersistence,
    browserLocalPersistence,
    GoogleAuthProvider
} from 'firebase/auth';

// Validate required environment variables
const requiredEnvVars = [
    'REACT_APP_FIREBASE_API_KEY',
    'REACT_APP_FIREBASE_AUTH_DOMAIN',
    'REACT_APP_FIREBASE_PROJECT_ID',
    'REACT_APP_FIREBASE_STORAGE_BUCKET',
    'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
    'REACT_APP_FIREBASE_APP_ID'
];

for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
    }
}

const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase App with error handling
let app;
try {
    app = initializeApp(firebaseConfig);
    console.log("Firebase initialized successfully");
} catch (error) {
    console.error("Firebase initialization error:", error);
    throw error;
}

// Initialize Firebase Auth
const auth = getAuth(app);

// Set persistence to browserLocalPersistence for cross-session login
setPersistence(auth, browserLocalPersistence)
    .then(() => {
        console.log("Persistence set to local storage (cross-session)");
    })
    .catch((error) => {
        console.error("Error setting persistence: ", error);
    });

// Initialize GoogleAuthProvider with COOP-specific settings
const provider = new GoogleAuthProvider();
provider.setCustomParameters({
    prompt: 'select_account',
    // Add these parameters to help with COOP issues
    authDomain: window.location.hostname,
    popupType: 'signInWithRedirect',
    // Additional security settings
    ux_mode: 'popup',
    access_type: 'offline'
});

// Configure auth settings
auth.useDeviceLanguage();
// Set session persistence
auth.settings = {
    appVerificationDisabledForTesting: process.env.NODE_ENV === 'development'
};

export { app, auth, provider };