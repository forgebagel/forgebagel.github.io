import { auth } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

export function signup(email, password, callback) {
  createUserWithEmailAndPassword(auth, email, password)
    .then(callback)
    .catch(err => alert(err.message));
}

export function login(email, password, callback) {
  signInWithEmailAndPassword(auth, email, password)
    .then(callback)
    .catch(err => alert(err.message));
}

export function protectPage(redirect = "login.html") {
  onAuthStateChanged(auth, user => {
    if (!user) window.location.href = redirect;
  });
}

export function logout() {
  signOut(auth).then(() => {
    window.location.href = "login.html";
  });
}
