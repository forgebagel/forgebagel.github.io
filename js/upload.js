import { storage } from "./firebase.js";
import {
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

export async function uploadFile(file, path = "uploads/") {
  const fileRef = ref(storage, path + file.name);
  await uploadBytes(fileRef, file);
  return await getDownloadURL(fileRef);
}
