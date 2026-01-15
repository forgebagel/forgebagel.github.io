import { auth, storage } from "./firebase.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  ref,
  uploadBytes
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const status = document.getElementById("status");
const emailText = document.getElementById("userEmail");
const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("uploadBtn");
const logoutBtn = document.getElementById("logoutBtn");

/* AUTH CHECK */
onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  status.textContent = "Welcome to your dashboard";
  emailText.textContent = "Signed in as: " + user.email;
});

/* UPLOAD */
uploadBtn.onclick = async () => {
  const file = fileInput.files[0];
  if (!file) return alert("Select a file");

  const fileRef = ref(storage, `uploads/${auth.currentUser.uid}/${file.name}`);
  await uploadBytes(fileRef, file);

  alert("File uploaded successfully");
};

/* LOGOUT */
logoutBtn.onclick = async () => {
  await signOut(auth);
  window.location.href = "login.html";
};
