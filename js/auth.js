import { auth } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const email = document.getElementById("email");
const password = document.getElementById("password");
const signupBtn = document.getElementById("signupBtn");
const loginBtn = document.getElementById("loginBtn");
const resetBtn = document.getElementById("resetPassword");

/* SIGN UP */
if (signupBtn) {
  signupBtn.onclick = async () => {
    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        email.value,
        password.value
      );

      await sendEmailVerification(cred.user);

      alert("Verification email sent. Please verify before login.");
      await signOut(auth); // ✅ CORRECT

    } catch (err) {
      alert(err.message);
    }
  };
}

/* LOGIN */
if (loginBtn) {
  loginBtn.onclick = async () => {
    try {
      const cred = await signInWithEmailAndPassword(
        auth,
        email.value,
        password.value
      );

      if (!cred.user.emailVerified) {
        alert("Please verify your email first.");
        await signOut(auth);
        return;
      }

      window.location.href = "dashboard.html";

    } catch (err) {
      alert(err.message);
    }
  };
}

/* RESET PASSWORD */
if (resetBtn) {
  resetBtn.onclick = async () => {
    if (!email.value) {
      alert("Enter your email first");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email.value);
      alert("Password reset email sent");
    } catch (err) {
      alert(err.message);
    }
  };
}
