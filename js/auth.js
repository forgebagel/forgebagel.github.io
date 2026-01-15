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
}const passwordInput = document.getElementById("password");
const bar = document.getElementById("strength-bar");

if (passwordInput) {
  passwordInput.addEventListener("input", () => {
    const val = passwordInput.value;
    let strength = 0;

    if (val.length >= 6) strength += 30;
    if (/[A-Z]/.test(val)) strength += 20;
    if (/[0-9]/.test(val)) strength += 20;
    if (/[^A-Za-z0-9]/.test(val)) strength += 30;

    bar.style.width = strength + "%";

    bar.style.background =
      strength < 40 ? "red" :
      strength < 70 ? "orange" :
      "#4fc3ff";
  });
}
import { sendPasswordResetEmail } from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const resetBtn = document.getElementById("resetPassword");

if (resetBtn) {
  resetBtn.addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    if (!email) {
      alert("Enter your email first");
      return;
    }
    await sendPasswordResetEmail(auth, email);
    alert("Password reset email sent");
  });
}


