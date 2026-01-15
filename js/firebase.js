// Firebase core
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

// Firebase services you will use
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAa25GuV8tcc1SAXgee5zcL_7hCCrkJTSA",
  authDomain: "my-project-65a0a.firebaseapp.com",
  projectId: "my-project-65a0a",
  storageBucket: "my-project-65a0a.firebasestorage.app",
  messagingSenderId: "797156294935",
  appId: "1:797156294935:web:b55ea50069a1b583beb752"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Export services so other files can use them
export const auth = getAuth(app);
export const storage = getStorage(app);
