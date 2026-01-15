alert("upload.js loaded");
import { auth, storage } from "./firebase.js";
import {
  console.log("upload.js loaded");

  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  ref,
  uploadBytesResumable,
  listAll,
  getDownloadURL,
  deleteObject
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const status = document.getElementById("status");
const emailText = document.getElementById("userEmail");
const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("uploadBtn");
const logoutBtn = document.getElementById("logoutBtn");
const fileList = document.getElementById("fileList");

let currentUser;

/* AUTH */
onAuthStateChanged(auth, user => {
  if (!user || !user.emailVerified) {
    window.location.href = "login.html";
    return;
  }

  currentUser = user;
  status.textContent = "Welcome to your dashboard";
  emailText.textContent = user.email;

  loadFiles();
});

/* LOAD FILES */
async function loadFiles() {
  fileList.innerHTML = "";
  const folderRef = ref(storage, `uploads/${currentUser.uid}`);
  const res = await listAll(folderRef);

  res.items.forEach(async item => {
    const url = await getDownloadURL(item);

    const div = document.createElement("div");
    div.className = "file-card";

    div.innerHTML = `
      <span>${item.name}</span>
      <div class="file-actions">
        <button class="btn-outline">Download</button>
        <button class="btn-outline">Delete</button>
      </div>
    `;

    const [downloadBtn, deleteBtn] = div.querySelectorAll("button");

    downloadBtn.onclick = () => window.open(url);
    deleteBtn.onclick = async () => {
      await deleteObject(item);
      loadFiles();
    };

    fileList.appendChild(div);
  });
}

/* UPLOAD */
const uploadBar = document.getElementById("uploadBar");

task.on("state_changed",
  snap => {
    const percent = (snap.bytesTransferred / snap.totalBytes) * 100;
    uploadBar.style.width = percent + "%";
    uploadBar.style.background = "#4fc3ff";
  },
  err => alert(err),
  () => {
    uploadBar.style.width = "0%";
    loadFiles();
  }
);


/* LOGOUT */
logoutBtn.onclick = () => {
  alert("Logout button clicked");
};

